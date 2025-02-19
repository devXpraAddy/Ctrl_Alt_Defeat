import type { Express } from "express";
import { createServer, type Server } from "http";
import { setupAuth } from "./auth";
import { storage } from "./storage";
import { insertAppointmentSchema } from "@shared/schema";
import { sendAppointmentConfirmation, sendAppointmentReminder } from "./notifications";
import { and, or, eq, gte, lte } from "drizzle-orm";

// Helper function to calculate distance between two points using Haversine formula
function calculateDistance(lat1: number, lon1: number, lat2: number, lon2: number): number {
  const R = 6371; // Earth's radius in kilometers
  const dLat = (lat2 - lat1) * Math.PI / 180;
  const dLon = (lon2 - lon1) * Math.PI / 180;
  const a =
    Math.sin(dLat / 2) * Math.sin(dLat / 2) +
    Math.cos(lat1 * Math.PI / 180) * Math.cos(lat2 * Math.PI / 180) *
    Math.sin(dLon / 2) * Math.sin(dLon / 2);
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  return R * c;
}

// Improved helper function to schedule reminder with better error handling
function scheduleReminder(email: string, appointment: any, doctor: any) {
  const appointmentTime = new Date(appointment.date);
  const reminderTime = new Date(appointmentTime.getTime() - 60 * 60 * 1000); // 1 hour before
  const now = new Date();

  // Calculate delay in milliseconds
  const delay = reminderTime.getTime() - now.getTime();

  // Only schedule if the appointment is more than an hour away and less than max timeout
  if (delay > 0 && delay <= 2147483647) { // Max 32-bit integer (about 24.8 days)
    setTimeout(async () => {
      try {
        await sendAppointmentReminder(email, {
          ...appointment,
          doctorName: doctor.name,
          location: doctor.location
        });
        console.log(`Reminder sent successfully for appointment ID ${appointment.id}`);
      } catch (error) {
        console.error(`Failed to send reminder for appointment ID ${appointment.id}:`, error);
      }
    }, delay);

    console.log(`Reminder scheduled for ${reminderTime.toLocaleString()} for appointment ID ${appointment.id}`);
  } else if (delay <= 0) {
    console.log(`Appointment ${appointment.id} is less than an hour away, skipping reminder`);
  } else {
    console.log(`Appointment ${appointment.id} is too far in the future for setTimeout, reminder will be scheduled later`);
  }
}

export function registerRoutes(app: Express): Server {
  setupAuth(app);

  // Update the doctors route to properly handle specialty filtering
  app.get("/api/doctors", async (req, res) => {
    const { lat, lng, specialty } = req.query;

    try {
      // If specialty is provided, use the specialized function
      let doctors = specialty
        ? await storage.getDoctorsBySpecialty(specialty as string)
        : await storage.getDoctors();

      // Add distance if location provided
      if (lat && lng) {
        const userLat = parseFloat(lat as string);
        const userLng = parseFloat(lng as string);

        if (!isNaN(userLat) && !isNaN(userLng)) {
          const doctorsWithDistance = doctors.map(doctor => ({
            ...doctor,
            distance: calculateDistance(
              userLat,
              userLng,
              Number(doctor.latitude),
              Number(doctor.longitude)
            )
          }));

          // Sort by distance
          doctorsWithDistance.sort((a, b) => a.distance - b.distance);
          return res.json(doctorsWithDistance);
        }
      }

      res.json(doctors);
    } catch (error) {
      console.error('Error fetching doctors:', error);
      res.status(500).json({ error: 'Failed to fetch doctors' });
    }
  });

  app.get("/api/doctors/:id", async (req, res) => {
    const id = Number(req.params.id);
    if (isNaN(id)) {
      res.status(400).send("Invalid doctor ID");
      return;
    }

    const doctor = await storage.getDoctorById(id);
    if (!doctor) {
      res.status(404).send("Doctor not found");
      return;
    }
    res.json(doctor);
  });

  app.get("/api/doctors/specialty/:specialty", async (req, res) => {
    const doctors = await storage.getDoctorsBySpecialty(req.params.specialty);
    res.json(doctors);
  });

  // Enhanced appointment creation with email notification and conflict checking
  app.post("/api/appointments", async (req, res) => {
    if (!req.isAuthenticated()) {
      res.status(401).send("Unauthorized");
      return;
    }

    const parsed = insertAppointmentSchema.safeParse(req.body);
    if (!parsed.success) {
      res.status(400).send(parsed.error);
      return;
    }

    try {
      // Get doctor details first
      const doctor = await storage.getDoctorById(parsed.data.doctorId);
      if (!doctor) {
        res.status(404).send("Doctor not found");
        return;
      }

      // Check for time slot conflicts
      const hasConflict = await storage.checkTimeSlotConflict(
        parsed.data.doctorId,
        req.user.id,
        new Date(parsed.data.date)
      );

      if (hasConflict) {
        return res.status(409).json({
          error: "Time slot conflict",
          message: "The selected time slot conflicts with an existing appointment."
        });
      }

      // Create appointment
      const appointment = await storage.createAppointment({
        ...parsed.data,
        patientId: req.user.id,
        status: "confirmed",
        date: new Date(parsed.data.date),
      });

      // Send email confirmation with doctor's location
      const emailData = {
        ...appointment,
        doctorName: doctor.name,
        location: doctor.location
      };

      const emailSent = await sendAppointmentConfirmation(
        req.user.email,
        emailData
      );

      // Schedule reminder email
      scheduleReminder(req.user.email, appointment, doctor);

      // Return detailed response with doctor info and email status
      res.status(201).json({
        appointment,
        doctor: {
          name: doctor.name,
          specialty: doctor.specialty,
          location: doctor.location
        },
        emailStatus: emailSent ? 'sent' : 'failed',
        message: emailSent
          ? 'Appointment booked successfully and confirmation email sent. You will receive a reminder 1 hour before your appointment.'
          : 'Appointment booked successfully but confirmation email could not be sent.'
      });
    } catch (error) {
      console.error('Error creating appointment:', error);
      res.status(500).json({
        error: "Failed to create appointment",
        message: error instanceof Error ? error.message : "There was an error booking your appointment. Please try again."
      });
    }
  });

  app.get("/api/appointments", async (req, res) => {
    if (!req.isAuthenticated()) {
      res.status(401).send("Unauthorized");
      return;
    }

    const appointments = await storage.getAppointmentsByPatient(req.user.id);
    res.json(appointments);
  });

  app.get("/api/config", (_req, res) => {
    const apiKey = process.env.GOOGLE_MAPS_API_KEY;

    if (!apiKey) {
      console.error("Google Maps API key is not configured");
      return res.status(500).json({
        error: "Maps configuration is not available"
      });
    }

    res.json({
      googleMapsApiKey: apiKey
    });
  });

  const httpServer = createServer(app);
  return httpServer;
}