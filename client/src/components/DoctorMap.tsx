import { useState, useCallback, useEffect } from "react";
import { GoogleMap, MarkerF } from "@react-google-maps/api";
import { type Doctor } from "@shared/schema";
import { useGoogleMaps } from "@/lib/GoogleMapsProvider";
import { Loader2 } from "lucide-react";
import { useQuery } from "@tanstack/react-query";
import { SpecialtyFilter } from "./SpecialtyFilter";

const containerStyle = {
  width: '100%',
  height: '400px'
};

const defaultCenter = {
  lat: 40.7128,
  lng: -74.0060
};

interface DoctorMapProps {
  onDoctorSelect?: (doctor: Doctor & { distance?: string }) => void;
}

export default function DoctorMap({ onDoctorSelect }: DoctorMapProps) {
  const { isLoaded } = useGoogleMaps();
  const [map, setMap] = useState<google.maps.Map | null>(null);
  const [userLocation, setUserLocation] = useState<google.maps.LatLngLiteral | null>(null);
  const [specialty, setSpecialty] = useState<string>("");

  // Fetch doctors with distance and specialty filter
  const { data: doctors = [], isLoading: isLoadingDoctors } = useQuery({
    queryKey: ['doctors', userLocation?.lat, userLocation?.lng, specialty],
    queryFn: async () => {
      const params = new URLSearchParams();
      if (userLocation) {
        params.append('lat', userLocation.lat.toString());
        params.append('lng', userLocation.lng.toString());
      }
      if (specialty) {
        params.append('specialty', specialty);
      }
      const response = await fetch(`/api/doctors?${params.toString()}`);
      if (!response.ok) throw new Error('Failed to fetch doctors');
      return response.json();
    }
  });

  // Get user's location when component mounts
  useEffect(() => {
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        (position) => {
          setUserLocation({
            lat: position.coords.latitude,
            lng: position.coords.longitude
          });
        },
        (error) => {
          console.error("Error getting user location:", error);
        }
      );
    }
  }, []);

  const onLoad = useCallback((map: google.maps.Map) => {
    if (doctors.length > 0) {
      const bounds = new google.maps.LatLngBounds();
      doctors.forEach(doctor => {
        bounds.extend({
          lat: Number(doctor.latitude),
          lng: Number(doctor.longitude)
        });
      });
      if (userLocation) {
        bounds.extend(userLocation);
      }
      map.fitBounds(bounds);
    } else {
      map.setCenter(userLocation || defaultCenter);
      map.setZoom(12);
    }
    setMap(map);
  }, [doctors, userLocation]);

  const onUnmount = useCallback(() => {
    setMap(null);
  }, []);

  const handleDoctorClick = useCallback((doctor: Doctor & { distance?: number }) => {
    if (onDoctorSelect) {
      onDoctorSelect({
        ...doctor,
        distance: doctor.distance ? `${doctor.distance.toFixed(1)} km` : undefined
      });
    }
  }, [onDoctorSelect]);

  if (!isLoaded || isLoadingDoctors) {
    return (
      <div className="flex items-center justify-center h-[400px] bg-muted">
        <Loader2 className="h-8 w-8 animate-spin" />
      </div>
    );
  }

  return (
    <div className="space-y-4">
      <div className="mb-4">
        <SpecialtyFilter onSpecialtyChange={setSpecialty} />
      </div>

      <GoogleMap
        mapContainerStyle={containerStyle}
        center={userLocation || defaultCenter}
        zoom={12}
        onLoad={onLoad}
        onUnmount={onUnmount}
        options={{
          disableDefaultUI: false,
          zoomControl: true,
          streetViewControl: false,
          mapTypeControl: false
        }}
      >
        {userLocation && (
          <MarkerF
            position={userLocation}
            icon={{
              url: "https://maps.google.com/mapfiles/ms/icons/blue-dot.png"
            }}
          />
        )}
        {doctors.map((doctor) => (
          <MarkerF
            key={doctor.id}
            position={{
              lat: Number(doctor.latitude),
              lng: Number(doctor.longitude)
            }}
            onClick={() => handleDoctorClick(doctor)}
          />
        ))}
      </GoogleMap>

      <div className="space-y-2">
        <h3 className="text-lg font-semibold">Nearby Doctors</h3>
        <div className="grid gap-2">
          {doctors.map((doctor) => (
            <button
              key={doctor.id}
              onClick={() => handleDoctorClick(doctor)}
              className="flex items-center justify-between p-3 text-left bg-white rounded-lg shadow hover:bg-gray-50"
            >
              <div>
                <div className="font-medium">{doctor.name}</div>
                <div className="text-sm text-gray-500">{doctor.specialty}</div>
              </div>
              {doctor.distance !== undefined && (
                <div className="text-sm text-gray-500">
                  {doctor.distance.toFixed(1)} km away
                </div>
              )}
            </button>
          ))}
        </div>
      </div>
    </div>
  );
}