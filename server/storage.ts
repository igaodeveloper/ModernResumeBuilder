import {
  users,
  services,
  barbers,
  appointments,
  reviews,
  type User,
  type InsertUser,
  type Service,
  type InsertService,
  type Barber,
  type InsertBarber,
  type BarberWithUser,
  type Appointment,
  type InsertAppointment,
  type AppointmentWithDetails,
  type Review,
  type InsertReview,
  type ReviewWithDetails,
} from "@shared/schema";
import { FirebaseStorage } from './storage.firebase';

export interface IStorage {
  // User operations
  getUser(id: number): Promise<User | undefined>;
  getUserByEmail(email: string): Promise<User | undefined>;
  createUser(user: InsertUser): Promise<User>;
  
  // Service operations
  getAllServices(): Promise<Service[]>;
  getServicesByCategory(category: string): Promise<Service[]>;
  getService(id: number): Promise<Service | undefined>;
  
  // Barber operations
  getAllBarbers(): Promise<BarberWithUser[]>;
  getBarber(id: number): Promise<BarberWithUser | undefined>;
  
  // Appointment operations
  createAppointment(appointment: InsertAppointment): Promise<Appointment>;
  getUserAppointments(userId: number): Promise<AppointmentWithDetails[]>;
  getBarberAppointments(barberId: number, date?: Date): Promise<AppointmentWithDetails[]>;
  updateAppointmentStatus(id: number, status: string): Promise<Appointment | undefined>;
  
  // Review operations
  createReview(review: InsertReview): Promise<Review>;
  getBarberReviews(barberId: number): Promise<ReviewWithDetails[]>;
}

export const storage = new FirebaseStorage();
