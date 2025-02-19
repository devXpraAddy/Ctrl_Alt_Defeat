import { pgTable, text, serial, integer, timestamp, boolean, numeric } from "drizzle-orm/pg-core";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod";

export const users = pgTable("users", {
  id: serial("id").primaryKey(),
  username: text("username"),  // Made optional by removing .notNull()
  password: text("password").notNull(),
  fullName: text("full_name").notNull(),
  email: text("email").notNull().unique(),
  role: text("role").notNull().default("patient"),
});

export const doctors = pgTable("doctors", {
  id: serial("id").primaryKey(),
  name: text("name").notNull(),
  specialty: text("specialty").notNull(),
  imageUrl: text("image_url").notNull(),
  bio: text("bio").notNull(),
  location: text("location").notNull(),
  latitude: numeric("latitude").notNull(),
  longitude: numeric("longitude").notNull(),
  availableHours: text("available_hours").array().notNull(),
  city: text("city").notNull(),
  state: text("state").notNull(),
  ratings: numeric("ratings").default("4.5"),
  experience: integer("experience").notNull(), // years of experience
});

export const appointments = pgTable("appointments", {
  id: serial("id").primaryKey(),
  doctorId: integer("doctor_id").notNull(),
  patientId: integer("patient_id").notNull(),
  date: timestamp("date").notNull(),
  status: text("status").notNull().default("pending"),
});

export const insertUserSchema = createInsertSchema(users)
  .pick({
    username: true,
    password: true,
    fullName: true,
    email: true,
  })
  .extend({
    email: z.string().email("Invalid email address"),
    username: z.string().optional(),
    password: z.string().min(6, "Password must be at least 6 characters"),
    fullName: z.string().min(1, "Full name is required"),
  });

export const insertDoctorSchema = createInsertSchema(doctors);

export const insertAppointmentSchema = z.object({
  doctorId: z.number(),
  date: z.string().datetime(),
  time: z.string().regex(/^([0-1]?[0-9]|2[0-3]):[0-5][0-9]$/, "Invalid time format. Use HH:mm"),
});

export type InsertUser = z.infer<typeof insertUserSchema>;
export type User = typeof users.$inferSelect;
export type Doctor = typeof doctors.$inferSelect;
export type Appointment = typeof appointments.$inferSelect;