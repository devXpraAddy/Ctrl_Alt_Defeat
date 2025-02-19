import { useQuery } from "@tanstack/react-query";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useState } from "react";
import { Link } from "wouter";
import { type Doctor } from "@shared/schema";
import { useAuth } from "@/hooks/use-auth";
import DoctorMap from "@/components/DoctorMap";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { LogOut } from "lucide-react"; // Import logout icon

interface DoctorWithDistance extends Doctor {
  distance?: string;
}

export default function HomePage() {
  const { user, logoutMutation } = useAuth(); // Get logout mutation
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedSpecialty, setSelectedSpecialty] = useState<string>("all");
  const [selectedDoctor, setSelectedDoctor] = useState<DoctorWithDistance | null>(null);

  const { data: doctors = [] } = useQuery<Doctor[]>({
    queryKey: ["/api/doctors"],
  });

  // Get unique specialties for the filter dropdown
  const specialties = Array.from(new Set(doctors.map(doctor => doctor.specialty)));

  const filteredDoctors = doctors.filter(
    (doctor) =>
      (selectedSpecialty === "all" || doctor.specialty === selectedSpecialty) &&
      (doctor.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        doctor.specialty.toLowerCase().includes(searchTerm.toLowerCase()) ||
        doctor.location.toLowerCase().includes(searchTerm.toLowerCase()))
  );

  return (
    <div className="min-h-screen bg-background">
      <header className="bg-[#0066CC] text-white py-6">
        <div className="container mx-auto px-4">
          <div className="flex justify-between items-center">
            <h1 className="text-2xl font-bold">Doctor Appointments</h1>
            <div className="flex items-center gap-4">
              <span>Welcome, {user?.fullName}</span>
              <Link href="/appointments">
                <Button variant="secondary" className="bg-[#00B894] hover:bg-[#00A080]">
                  My Appointments
                </Button>
              </Link>
              <Button 
                variant="ghost" 
                className="text-white hover:text-white/80 hover:bg-[#0052A3]"
                onClick={() => logoutMutation.mutate()}
                disabled={logoutMutation.isPending}
              >
                <LogOut className="h-4 w-4 mr-2" />
                Logout
              </Button>
            </div>
          </div>
        </div>
      </header>

      <main className="container mx-auto px-4 py-8">
        <div className="max-w-xl mx-auto mb-8 space-y-4">
          <div className="flex gap-4">
            <Input
              type="search"
              placeholder="Search doctors by name, specialty, or location..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="flex-1"
            />
            <Select value={selectedSpecialty} onValueChange={setSelectedSpecialty}>
              <SelectTrigger className="w-[200px]">
                <SelectValue placeholder="All Specialties" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Specialties</SelectItem>
                {specialties.map((specialty) => (
                  <SelectItem key={specialty} value={specialty}>
                    {specialty}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        </div>

        <Tabs defaultValue="list" className="mb-8">
          <TabsList className="grid w-[400px] grid-cols-2">
            <TabsTrigger value="list">List View</TabsTrigger>
            <TabsTrigger value="map">Map View</TabsTrigger>
          </TabsList>
          <TabsContent value="list" className="mt-6">
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {filteredDoctors.map((doctor) => (
                <Link key={doctor.id} href={`/doctor/${doctor.id}`}>
                  <Card className="cursor-pointer hover:shadow-lg transition-shadow">
                    <CardHeader className="flex flex-row items-center gap-4">
                      <Avatar className="h-12 w-12">
                        <AvatarImage src={doctor.imageUrl} />
                        <AvatarFallback>
                          {doctor.name
                            .split(" ")
                            .map((n) => n[0])
                            .join("")}
                        </AvatarFallback>
                      </Avatar>
                      <div>
                        <CardTitle className="text-[#2D3748]">{doctor.name}</CardTitle>
                        <p className="text-sm text-muted-foreground">
                          {doctor.specialty}
                        </p>
                      </div>
                    </CardHeader>
                    <CardContent>
                      <p className="text-sm text-[#2D3748]">{doctor.bio}</p>
                      <p className="text-sm text-muted-foreground mt-2">
                        {doctor.location}
                      </p>
                    </CardContent>
                  </Card>
                </Link>
              ))}
            </div>
          </TabsContent>
          <TabsContent value="map" className="mt-6">
            <Card>
              <CardContent className="pt-6">
                <DoctorMap 
                  doctors={filteredDoctors}
                  onDoctorSelect={(doctor) => setSelectedDoctor(doctor)}
                />
                {selectedDoctor && (
                  <div className="mt-4 p-4 border-t">
                    <h3 className="font-semibold mb-2">{selectedDoctor.name}</h3>
                    <p className="text-sm text-muted-foreground mb-2">
                      {selectedDoctor.specialty}
                      {selectedDoctor.distance && ` • ${selectedDoctor.distance} away`}
                    </p>
                    <p className="text-sm mb-4">{selectedDoctor.location}</p>
                    <Link href={`/doctor/${selectedDoctor.id}`}>
                      <Button>View Profile</Button>
                    </Link>
                  </div>
                )}
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </main>
    </div>
  );
}