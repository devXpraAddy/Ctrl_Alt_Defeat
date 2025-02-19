import { useQuery, useMutation } from "@tanstack/react-query";
import { useParams, useLocation } from "wouter";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Calendar } from "@/components/ui/calendar";
import { 
  Select, 
  SelectContent, 
  SelectItem, 
  SelectTrigger, 
  SelectValue 
} from "@/components/ui/select";
import { Skeleton } from "@/components/ui/skeleton";
import { useState } from "react";
import { type Doctor, insertAppointmentSchema } from "@shared/schema";
import { apiRequest, queryClient } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";
import { format, parse } from "date-fns";
import { Star, MapPin, Award, Clock } from "lucide-react";

export default function DoctorPage() {
  const { id } = useParams();
  const [, setLocation] = useLocation();
  const { toast } = useToast();
  const [date, setDate] = useState<Date>();
  const [selectedTime, setSelectedTime] = useState<string>();

  const { data: doctor, isLoading } = useQuery<Doctor>({
    queryKey: [`/api/doctors/${id}`],
    enabled: !isNaN(Number(id)),
  });

  const bookMutation = useMutation({
    mutationFn: async () => {
      if (!date || !selectedTime || !id) return;

      const [hours, minutes] = selectedTime.split(':').map(Number);
      const appointmentDate = new Date(date);
      appointmentDate.setUTCHours(0, 0, 0, 0);

      const finalDate = new Date(appointmentDate);
      finalDate.setHours(hours);
      finalDate.setMinutes(minutes);

      const appointmentData = {
        doctorId: Number(id),
        date: finalDate.toISOString(),
        time: selectedTime
      };

      const res = await apiRequest("POST", "/api/appointments", appointmentData);
      return await res.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/appointments"] });
      toast({
        title: "Appointment Booked",
        description: "Your appointment has been scheduled successfully. You will receive a confirmation email with details.",
      });
      setLocation("/appointments");
    },
    onError: (error: Error) => {
      toast({
        title: "Booking Failed",
        description: error.message,
        variant: "destructive",
      });
    },
  });

  if (isLoading) {
    return <DoctorPageSkeleton />;
  }

  if (!doctor) {
    return (
      <div className="min-h-screen bg-background p-4 sm:p-8 flex items-center justify-center">
        <p className="text-muted-foreground">Doctor not found</p>
      </div>
    );
  }

  const availableHours = Array.isArray(doctor.availableHours) ? doctor.availableHours : [];

  return (
    <div className="min-h-screen bg-background p-4 sm:p-8">
      <Card className="max-w-4xl mx-auto shadow-lg">
        <CardHeader className="flex flex-col sm:flex-row items-start sm:items-center gap-6 p-6">
          <div className="relative">
            <img
              src={doctor.imageUrl}
              alt={doctor.name}
              className="w-24 h-24 sm:w-32 sm:h-32 rounded-full object-cover border-4 border-background shadow-xl"
            />
            <div className="absolute -bottom-2 right-0 bg-primary text-primary-foreground px-2 py-1 rounded-full text-sm font-medium flex items-center gap-1">
              <Star className="w-4 h-4" />
              {doctor.ratings}
            </div>
          </div>
          <div className="flex-1 space-y-2">
            <div>
              <CardTitle className="text-2xl sm:text-3xl text-foreground">{doctor.name}</CardTitle>
              <CardDescription className="text-lg text-primary">
                {doctor.specialty}
              </CardDescription>
            </div>
            <div className="space-y-2 text-muted-foreground">
              <div className="flex items-center gap-2">
                <MapPin className="w-4 h-4" />
                <span>{doctor.location}</span>
              </div>
              <div className="flex items-center gap-2">
                <Award className="w-4 h-4" />
                <span>{doctor.experience} years experience</span>
              </div>
              <div className="flex items-center gap-2">
                <Clock className="w-4 h-4" />
                <span>Available today</span>
              </div>
            </div>
          </div>
        </CardHeader>
        <CardContent className="grid md:grid-cols-2 gap-8 p-6">
          <div className="space-y-6">
            <div>
              <h3 className="text-lg font-semibold mb-3">About</h3>
              <p className="text-muted-foreground leading-relaxed">{doctor.bio}</p>
            </div>
            <div>
              <h4 className="font-semibold mb-2">Location</h4>
              <p className="text-muted-foreground">
                {doctor.city}, {doctor.state}
              </p>
            </div>
          </div>
          <div className="space-y-6">
            <h3 className="text-lg font-semibold">Book Appointment</h3>
            <div className="space-y-4">
              <Calendar
                mode="single"
                selected={date}
                onSelect={setDate}
                className="rounded-md border shadow-sm"
                disabled={(date) => date < new Date()}
              />
              {date && availableHours.length > 0 ? (
                <div className="space-y-2">
                  <label className="text-sm font-medium">Select Time</label>
                  <Select
                    value={selectedTime}
                    onValueChange={setSelectedTime}
                  >
                    <SelectTrigger className="w-full">
                      <SelectValue placeholder="Choose an available time slot" />
                    </SelectTrigger>
                    <SelectContent>
                      {availableHours.map((time) => (
                        <SelectItem key={time} value={time}>
                          {format(parse(time, 'HH:mm', new Date()), 'h:mm a')}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              ) : date ? (
                <p className="text-sm text-muted-foreground">No available time slots for this date</p>
              ) : null}
              <Button
                className="w-full"
                size="lg"
                disabled={!date || !selectedTime || bookMutation.isPending}
                onClick={() => bookMutation.mutate()}
              >
                {bookMutation.isPending ? (
                  <div className="flex items-center gap-2">
                    <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                    Booking...
                  </div>
                ) : (
                  "Book Appointment"
                )}
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}

function DoctorPageSkeleton() {
  return (
    <div className="min-h-screen bg-background p-4 sm:p-8">
      <Card className="max-w-4xl mx-auto">
        <CardHeader className="flex flex-col sm:flex-row items-start sm:items-center gap-6 p-6">
          <Skeleton className="w-24 h-24 sm:w-32 sm:h-32 rounded-full" />
          <div className="flex-1 space-y-4">
            <Skeleton className="h-8 w-64" />
            <Skeleton className="h-6 w-48" />
            <div className="space-y-2">
              <Skeleton className="h-4 w-full" />
              <Skeleton className="h-4 w-3/4" />
            </div>
          </div>
        </CardHeader>
        <CardContent className="grid md:grid-cols-2 gap-8 p-6">
          <div className="space-y-4">
            <Skeleton className="h-6 w-32" />
            <div className="space-y-2">
              <Skeleton className="h-4 w-full" />
              <Skeleton className="h-4 w-full" />
              <Skeleton className="h-4 w-3/4" />
            </div>
          </div>
          <div className="space-y-4">
            <Skeleton className="h-6 w-48" />
            <Skeleton className="h-[300px] w-full" />
          </div>
        </CardContent>
      </Card>
    </div>
  );
}