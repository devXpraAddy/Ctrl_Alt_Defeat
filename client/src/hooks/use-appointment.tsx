import { useMutation, useQueryClient } from "@tanstack/react-query";
import { useToast } from "@/hooks/use-toast";
import { format } from "date-fns";
import type { Doctor } from "@shared/schema";
import React from "react";

interface AppointmentInput {
  doctorId: number;
  date: string;
}

interface AppointmentResponse {
  appointment: {
    id: number;
    doctorId: number;
    patientId: number;
    date: string;
    status: string;
  };
  doctor: {
    name: string;
    specialty: string;
  };
  message: string;
}

export function useAppointment() {
  const { toast } = useToast();
  const queryClient = useQueryClient();

  const appointmentMutation = useMutation({
    mutationFn: async (data: AppointmentInput) => {
      const response = await fetch("/api/appointments", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(data),
      });

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.message || "Failed to book appointment");
      }

      return response.json() as Promise<AppointmentResponse>;
    },
    onSuccess: (data) => {
      // Format the appointment date
      const formattedDate = format(
        new Date(data.appointment.date),
        "MMMM d, yyyy 'at' h:mm aa"
      );

      // Show a detailed toast notification
      toast({
        variant: "default",
        title: "🎉 Appointment Successfully Booked!",
        description: (
          <div className="mt-2 space-y-2">
            <p className="font-medium">Appointment Details:</p>
            <p>🏥 Doctor: {data.doctor.name}</p>
            <p>👨‍⚕️ Specialty: {data.doctor.specialty}</p>
            <p>📅 Date: {formattedDate}</p>
            <p>🎫 Booking ID: #{data.appointment.id}</p>
            <p className="mt-4 text-sm">
              Please arrive 15 minutes before your appointment.
            </p>
          </div>
        ),
        duration: 15000, // Show for 15 seconds
      });

      // Show browser notification
      if ('Notification' in window && Notification.permission === 'granted') {
        new Notification('Appointment Confirmed! 🎉', {
          body: `Your appointment with ${data.doctor.name} is scheduled for ${formattedDate}`,
          icon: '/favicon.ico',
          tag: 'appointment-confirmation'
        });
      } else if ('Notification' in window && Notification.permission !== 'denied') {
        Notification.requestPermission();
      }

      // Refresh appointments list
      queryClient.invalidateQueries({ queryKey: ["/api/appointments"] });
    },
    onError: (error: Error) => {
      toast({
        variant: "destructive",
        title: "❌ Booking Failed",
        description: error.message || "Failed to book appointment. Please try again.",
        duration: 10000, // Show for 10 seconds
      });
    },
  });

  return {
    bookAppointment: appointmentMutation.mutate,
    isBooking: appointmentMutation.isPending,
  };
}
