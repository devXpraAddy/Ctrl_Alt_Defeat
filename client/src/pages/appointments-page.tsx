import { useQuery } from "@tanstack/react-query";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { type Appointment, type Doctor } from "@shared/schema";
import { format } from "date-fns";
import { Button } from "@/components/ui/button";
import { Link } from "wouter";
import { Calendar } from "lucide-react";

export default function AppointmentsPage() {
  const { data: appointments = [] } = useQuery<
    (Appointment & { doctor: Doctor })[]
  >({
    queryKey: ["/api/appointments"],
  });

  return (
    <div className="min-h-screen bg-background p-8">
      <div className="max-w-4xl mx-auto">
        <div className="flex justify-between items-center mb-8">
          <h1 className="text-3xl font-bold">My Appointments</h1>
          <Link href="/">
            <Button>Find Doctors</Button>
          </Link>
        </div>

        <div className="space-y-6">
          {appointments.map((appointment) => (
            <Card key={appointment.id}>
              <CardHeader>
                <CardTitle>{appointment.doctor.name}</CardTitle>
                <CardDescription>{appointment.doctor.specialty}</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="flex items-center gap-2 text-muted-foreground">
                  <Calendar className="h-4 w-4" />
                  <span>
                    {format(new Date(appointment.date), "PPP 'at' p")}
                  </span>
                </div>
                <p className="mt-2">{appointment.doctor.location}</p>
              </CardContent>
            </Card>
          ))}

          {appointments.length === 0 && (
            <Card>
              <CardContent className="py-8 text-center text-muted-foreground">
                No appointments scheduled. Find a doctor to book your first
                appointment.
              </CardContent>
            </Card>
          )}
        </div>
      </div>
    </div>
  );
}
