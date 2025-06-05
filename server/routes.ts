import type { Express } from "express";
import { createServer, type Server } from "http";
import { storage } from "./storage";
import { insertUserSchema, loginSchema, insertAppointmentSchema, insertReviewSchema } from "@shared/schema";
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';

const JWT_SECRET = process.env.JWT_SECRET || 'changeme';

function generateToken(user) {
  return jwt.sign({ id: user.id, email: user.email, role: user.role }, JWT_SECRET, { expiresIn: '7d' });
}

function authMiddleware(req, res, next) {
  const auth = req.headers.authorization;
  if (!auth || !auth.startsWith('Bearer ')) return res.status(401).json({ message: 'No token' });
  try {
    const decoded = jwt.verify(auth.replace('Bearer ', ''), JWT_SECRET);
    req.user = decoded;
    next();
  } catch {
    return res.status(401).json({ message: 'Invalid token' });
  }
}

export async function registerRoutes(app: Express): Promise<Server> {
  // Auth routes
  app.post("/api/auth/login", async (req, res) => {
    try {
      const { email, password } = loginSchema.parse(req.body);
      const user = await storage.getUserByEmail(email);
      
      if (!user || !(await bcrypt.compare(password, user.password))) {
        return res.status(401).json({ message: "Invalid credentials" });
      }
      
      const token = generateToken(user);
      res.json({ 
        user: { 
          id: user.id, 
          firstName: user.firstName, 
          lastName: user.lastName, 
          email: user.email, 
          role: user.role,
          profileImageUrl: user.profileImageUrl 
        },
        token
      });
    } catch (error) {
      res.status(400).json({ message: "Invalid request data" });
    }
  });

  app.post("/api/auth/register", async (req, res) => {
    try {
      const userData = insertUserSchema.parse(req.body);
      
      // Check if user already exists
      const existingUser = await storage.getUserByEmail(userData.email);
      if (existingUser) {
        return res.status(409).json({ message: "User already exists" });
      }
      
      const hashed = await bcrypt.hash(userData.password, 10);
      const user = await storage.createUser({ ...userData, password: hashed });
      const token = generateToken(user);
      res.status(201).json({ 
        user: { 
          id: user.id, 
          firstName: user.firstName, 
          lastName: user.lastName, 
          email: user.email, 
          role: user.role,
          profileImageUrl: user.profileImageUrl 
        },
        token
      });
    } catch (error) {
      res.status(400).json({ message: "Invalid request data" });
    }
  });

  // Services routes
  app.get("/api/services", async (req, res) => {
    try {
      const { category } = req.query;
      let services;
      
      if (category && typeof category === 'string') {
        services = await storage.getServicesByCategory(category);
      } else {
        services = await storage.getAllServices();
      }
      
      res.json(services);
    } catch (error) {
      res.status(500).json({ message: "Failed to fetch services" });
    }
  });

  app.get("/api/services/:id", async (req, res) => {
    try {
      const id = parseInt(req.params.id);
      const service = await storage.getService(id);
      
      if (!service) {
        return res.status(404).json({ message: "Service not found" });
      }
      
      res.json(service);
    } catch (error) {
      res.status(500).json({ message: "Failed to fetch service" });
    }
  });

  // Barbers routes
  app.get("/api/barbers", async (req, res) => {
    try {
      const barbers = await storage.getAllBarbers();
      res.json(barbers);
    } catch (error) {
      res.status(500).json({ message: "Failed to fetch barbers" });
    }
  });

  app.get("/api/barbers/:id", async (req, res) => {
    try {
      const id = parseInt(req.params.id);
      const barber = await storage.getBarber(id);
      
      if (!barber) {
        return res.status(404).json({ message: "Barber not found" });
      }
      
      res.json(barber);
    } catch (error) {
      res.status(500).json({ message: "Failed to fetch barber" });
    }
  });

  // Appointments routes
  app.post("/api/appointments", async (req, res) => {
    try {
      const appointmentData = insertAppointmentSchema.parse(req.body);
      const appointment = await storage.createAppointment(appointmentData);
      res.status(201).json(appointment);
    } catch (error) {
      res.status(400).json({ message: "Invalid appointment data" });
    }
  });

  app.get("/api/users/:userId/appointments", async (req, res) => {
    try {
      const userId = parseInt(req.params.userId);
      const appointments = await storage.getUserAppointments(userId);
      res.json(appointments);
    } catch (error) {
      res.status(500).json({ message: "Failed to fetch appointments" });
    }
  });

  app.get("/api/barbers/:barberId/appointments", async (req, res) => {
    try {
      const barberId = parseInt(req.params.barberId);
      const { date } = req.query;
      
      let filterDate: Date | undefined;
      if (date && typeof date === 'string') {
        filterDate = new Date(date);
      }
      
      const appointments = await storage.getBarberAppointments(barberId, filterDate);
      res.json(appointments);
    } catch (error) {
      res.status(500).json({ message: "Failed to fetch barber appointments" });
    }
  });

  app.patch("/api/appointments/:id/status", async (req, res) => {
    try {
      const id = parseInt(req.params.id);
      const { status } = req.body;
      
      if (!status || typeof status !== 'string') {
        return res.status(400).json({ message: "Status is required" });
      }
      
      const appointment = await storage.updateAppointmentStatus(id, status);
      
      if (!appointment) {
        return res.status(404).json({ message: "Appointment not found" });
      }
      
      res.json(appointment);
    } catch (error) {
      res.status(500).json({ message: "Failed to update appointment status" });
    }
  });

  // Reviews routes
  app.post("/api/reviews", async (req, res) => {
    try {
      const reviewData = insertReviewSchema.parse(req.body);
      const review = await storage.createReview(reviewData);
      res.status(201).json(review);
    } catch (error) {
      res.status(400).json({ message: "Invalid review data" });
    }
  });

  app.get("/api/barbers/:barberId/reviews", async (req, res) => {
    try {
      const barberId = parseInt(req.params.barberId);
      const reviews = await storage.getBarberReviews(barberId);
      res.json(reviews);
    } catch (error) {
      res.status(500).json({ message: "Failed to fetch reviews" });
    }
  });

  const httpServer = createServer(app);
  return httpServer;
}
