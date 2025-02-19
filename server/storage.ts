import { type User, type Doctor, type Appointment, users, doctors, appointments } from "@shared/schema";
import session from "express-session";
import connectPg from "connect-pg-simple";
import { pool } from "./db";
import { db } from "./db";
import { eq, or, and, gte, lte } from "drizzle-orm";

const PostgresSessionStore = connectPg(session);

export interface IStorage {
  getUser(id: number): Promise<User | undefined>;
  getUserByUsername(username: string): Promise<User | undefined>;
  getUserByEmail(email: string): Promise<User | undefined>;
  createUser(user: Omit<User, "id">): Promise<User>;

  getDoctors(): Promise<Doctor[]>;
  getDoctorById(id: number): Promise<Doctor | undefined>;
  getDoctorsBySpecialty(specialty: string): Promise<Doctor[]>;

  createAppointment(appointment: Omit<Appointment, "id">): Promise<Appointment>;
  getAppointmentsByPatient(patientId: number): Promise<(Appointment & { doctor: Doctor })[]>;
  getAppointmentsByDoctor(doctorId: number): Promise<Appointment[]>;
  updateAppointmentStatus(id: number, status: string): Promise<void>;
  checkTimeSlotConflict(doctorId: number, patientId: number, date: Date): Promise<boolean>;

  sessionStore: session.Store;
}

export class DatabaseStorage implements IStorage {
  sessionStore: session.Store;

  constructor() {
    this.sessionStore = new PostgresSessionStore({
      pool,
      createTableIfMissing: true,
    });

    // Seed some doctors if none exist
    this.seedDoctors();
  }

  private async seedDoctors() {
    const existingDoctors = await this.getDoctors();
    if (existingDoctors.length === 0) {
      // First clear existing doctors
      await db.delete(doctors);

      // Then insert the new doctors
      const doctorsToInsert = [
        {
          name: "Dr. Priya Sharma",
          specialty: "Cardiologist",
          imageUrl: "https://images.unsplash.com/photo-1559839734-2b71ea197ec2",
          bio: "MBBS, MD (Cardiology) from AIIMS Delhi with 15 years of experience in treating cardiac conditions. Specializes in interventional cardiology.",
          location: "Fortis Hospital, Bannerghatta Road",
          city: "Bangalore",
          state: "Karnataka",
          latitude: "12.8916",
          longitude: "77.5967",
          availableHours: ["09:00", "10:00", "11:00", "14:00", "15:00", "16:00"],
          experience: 15,
          ratings: "4.8"
        },
        {
          name: "Dr. Rajesh Kumar",
          specialty: "Orthopedic Surgeon",
          imageUrl: "https://images.unsplash.com/photo-1537368910025-700350fe46c7",
          bio: "MBBS, MS (Ortho) from KEM Hospital Mumbai. 12 years of experience in joint replacement surgery and sports medicine.",
          location: "Apollo Hospitals, Greams Road",
          city: "Chennai",
          state: "Tamil Nadu",
          latitude: "13.0569",
          longitude: "80.2425",
          availableHours: ["08:00", "09:00", "10:00", "14:00", "15:00", "16:00"],
          experience: 12,
          ratings: "4.7"
        },
        {
          name: "Dr. Anjali Desai",
          specialty: "Dermatologist",
          imageUrl: "https://images.unsplash.com/photo-1594824476967-48c8b964273f",
          bio: "MBBS, MD (Dermatology) from Manipal University. Expert in cosmetic dermatology and skin disorders with 8 years of experience.",
          location: "Max Hospital, Saket",
          city: "Delhi",
          state: "Delhi",
          latitude: "28.5274",
          longitude: "77.2159",
          availableHours: ["10:00", "11:00", "12:00", "15:00", "16:00", "17:00"],
          experience: 8,
          ratings: "4.9"
        },
        {
          name: "Dr. Vikram Reddy",
          specialty: "Neurologist",
          imageUrl: "https://images.unsplash.com/photo-1612349317150-e413f6a5b16d",
          bio: "MBBS, DM (Neurology) from PGIMER Chandigarh. Expert in stroke management with 14 years of experience.",
          location: "Care Hospitals",
          city: "Hyderabad",
          state: "Telangana",
          latitude: "17.4123",
          longitude: "78.5270",
          availableHours: ["09:00", "10:00", "11:00", "14:00", "15:00", "16:00"],
          experience: 14,
          ratings: "4.8"
        },
        {
          name: "Dr. Sarah Khan",
          specialty: "Gynecologist",
          imageUrl: "https://images.unsplash.com/photo-1585842378054-ee2e52f94ba2",
          bio: "MBBS, MD (Obstetrics & Gynecology) from King George's Medical University. Expert in high-risk pregnancies with 16 years of experience.",
          location: "Medica Superspecialty Hospital",
          city: "Kolkata",
          state: "West Bengal",
          latitude: "22.5726",
          longitude: "88.3639",
          availableHours: ["08:00", "09:00", "10:00", "14:00", "15:00", "16:00"],
          experience: 16,
          ratings: "4.9"
        },
        {
          name: "Dr. Arun Mehta",
          specialty: "Cardiologist",
          imageUrl: "https://images.unsplash.com/photo-1622253692010-333f2da6031d",
          bio: "MBBS, DM (Cardiology) from GB Pant Hospital. Specializes in interventional cardiology with 20 years of experience.",
          location: "Sterling Hospital",
          city: "Ahmedabad",
          state: "Gujarat",
          latitude: "23.0225",
          longitude: "72.5714",
          availableHours: ["09:00", "10:00", "11:00", "14:00", "15:00", "16:00"],
          experience: 20,
          ratings: "4.9"
        },
        {
          name: "Dr. Neha Gupta",
          specialty: "Pediatrician",
          imageUrl: "https://images.unsplash.com/photo-1623854767648-e7bb8009f0db",
          bio: "MBBS, MD (Pediatrics) from AIIMS Delhi. Specialized in pediatric neurology with 12 years of experience.",
          location: "Shalby Hospital",
          city: "Indore",
          state: "Madhya Pradesh",
          latitude: "22.7196",
          longitude: "75.8577",
          availableHours: ["09:00", "10:00", "11:00", "14:00", "15:00", "16:00"],
          experience: 12,
          ratings: "4.8"
        },
        {
          name: "Dr. Ravi Verma",
          specialty: "Orthopedic Surgeon",
          imageUrl: "https://images.unsplash.com/photo-1612531386530-97286d97c2d2",
          bio: "MBBS, MS (Ortho) from SMS Medical College. Expert in joint replacement and sports injuries with 18 years of experience.",
          location: "Narayana Hospital",
          city: "Jaipur",
          state: "Rajasthan",
          latitude: "26.9124",
          longitude: "75.7873",
          availableHours: ["08:00", "09:00", "10:00", "14:00", "15:00", "16:00"],
          experience: 18,
          ratings: "4.9"
        },
        {
          name: "Dr. Maya Patel",
          specialty: "Dermatologist",
          imageUrl: "https://images.unsplash.com/photo-1651008376811-b90baee60c1f",
          bio: "MBBS, MD (Dermatology) from GMC Nagpur. Specializes in cosmetic dermatology with 10 years of experience.",
          location: "Sahyadri Hospital",
          city: "Pune",
          state: "Maharashtra",
          latitude: "18.5204",
          longitude: "73.8567",
          availableHours: ["10:00", "11:00", "12:00", "15:00", "16:00", "17:00"],
          experience: 10,
          ratings: "4.8"
        },
        {
          name: "Dr. Sanjay Kapoor",
          specialty: "Neurologist",
          imageUrl: "https://images.unsplash.com/photo-1618498082410-b4aa22193b38",
          bio: "MBBS, DM (Neurology) from SGPGI Lucknow. Expert in neuro-rehabilitation with 22 years of experience.",
          location: "KIMS Hospital",
          city: "Bhubaneswar",
          state: "Odisha",
          latitude: "20.2961",
          longitude: "85.8245",
          availableHours: ["09:00", "10:00", "11:00", "14:00", "15:00", "16:00"],
          experience: 22,
          ratings: "4.9"
        },
        {
          name: "Dr. Rakesh Kumar",
          specialty: "Gastroenterologist",
          imageUrl: "https://images.unsplash.com/photo-1637059824899-a441006a6875",
          bio: "MBBS, DM (Gastroenterology) from KGMU Lucknow. Specialized in advanced endoscopy and liver diseases with 15 years of experience.",
          location: "Sahara Hospital",
          city: "Lucknow",
          state: "Uttar Pradesh",
          latitude: "26.8467",
          longitude: "80.9462",
          availableHours: ["09:00", "10:00", "11:00", "14:00", "15:00", "16:00"],
          experience: 15,
          ratings: "4.8"
        }
      ];

      // Insert all doctors at once
      await db.insert(doctors).values(doctorsToInsert);
      console.log('Seeded database with Indian doctors data');
    }
  }

  async getUser(id: number): Promise<User | undefined> {
    const [user] = await db.select().from(users).where(eq(users.id, id));
    return user;
  }

  async getUserByUsername(username: string): Promise<User | undefined> {
    const [user] = await db.select().from(users).where(eq(users.username, username));
    return user;
  }

  async getUserByEmail(email: string): Promise<User | undefined> {
    const [user] = await db.select().from(users).where(eq(users.email, email));
    return user;
  }

  async createUser(user: Omit<User, "id">): Promise<User> {
    const [newUser] = await db.insert(users).values(user).returning();
    return newUser;
  }

  async getDoctors(): Promise<Doctor[]> {
    return await db.select().from(doctors);
  }

  async getDoctorById(id: number): Promise<Doctor | undefined> {
    const [doctor] = await db.select().from(doctors).where(eq(doctors.id, id));
    return doctor;
  }

  async getDoctorsBySpecialty(specialty: string): Promise<Doctor[]> {
    return await db
      .select()
      .from(doctors)
      .where(eq(doctors.specialty, specialty));
  }

  async createAppointment(appointment: Omit<Appointment, "id">): Promise<Appointment> {
    const [newAppointment] = await db
      .insert(appointments)
      .values(appointment)
      .returning();
    return newAppointment;
  }

  async getAppointmentsByPatient(patientId: number): Promise<(Appointment & { doctor: Doctor })[]> {
    return await db
      .select({
        id: appointments.id,
        doctorId: appointments.doctorId,
        patientId: appointments.patientId,
        date: appointments.date,
        status: appointments.status,
        doctor: doctors,
      })
      .from(appointments)
      .where(eq(appointments.patientId, patientId))
      .innerJoin(doctors, eq(appointments.doctorId, doctors.id));
  }

  async getAppointmentsByDoctor(doctorId: number): Promise<Appointment[]> {
    return await db
      .select()
      .from(appointments)
      .where(eq(appointments.doctorId, doctorId));
  }

  async updateAppointmentStatus(id: number, status: string): Promise<void> {
    await db
      .update(appointments)
      .set({ status })
      .where(eq(appointments.id, id));
  }

  async checkTimeSlotConflict(doctorId: number, patientId: number, date: Date): Promise<boolean> {
    const appointmentDate = new Date(date);
    const buffer = 30 * 60 * 1000; // 30 minutes in milliseconds
    const startTime = new Date(appointmentDate.getTime() - buffer);
    const endTime = new Date(appointmentDate.getTime() + buffer);

    const conflicts = await db
      .select()
      .from(appointments)
      .where(
        and(
          or(
            eq(appointments.doctorId, doctorId),
            eq(appointments.patientId, patientId)
          ),
          and(
            gte(appointments.date, startTime),
            lte(appointments.date, endTime)
          )
        )
      );

    return conflicts.length > 0;
  }
}

export const storage = new DatabaseStorage();