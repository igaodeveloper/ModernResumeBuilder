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

export class MemStorage implements IStorage {
  private users: Map<number, User>;
  private services: Map<number, Service>;
  private barbers: Map<number, Barber>;
  private appointments: Map<number, Appointment>;
  private reviews: Map<number, Review>;
  private currentUserId: number;
  private currentServiceId: number;
  private currentBarberId: number;
  private currentAppointmentId: number;
  private currentReviewId: number;

  constructor() {
    this.users = new Map();
    this.services = new Map();
    this.barbers = new Map();
    this.appointments = new Map();
    this.reviews = new Map();
    this.currentUserId = 1;
    this.currentServiceId = 1;
    this.currentBarberId = 1;
    this.currentAppointmentId = 1;
    this.currentReviewId = 1;
    
    this.seedData();
  }

  private seedData() {
    // Seed customers
    const customer1: User = {
      id: this.currentUserId++,
      firstName: "John",
      lastName: "Doe",
      email: "john@example.com",
      password: "password123",
      role: "customer",
      profileImageUrl: "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?ixlib=rb-4.0.3&auto=format&fit=crop&w=150&h=150",
      createdAt: new Date("2023-01-15"),
    };
    this.users.set(customer1.id, customer1);

    // Seed barber users
    const barberUser1: User = {
      id: this.currentUserId++,
      firstName: "Mike",
      lastName: "Johnson",
      email: "mike@barberpro.com",
      password: "password123",
      role: "barber",
      profileImageUrl: "https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?ixlib=rb-4.0.3&auto=format&fit=crop&w=150&h=150",
      createdAt: new Date("2022-06-01"),
    };
    this.users.set(barberUser1.id, barberUser1);

    const barberUser2: User = {
      id: this.currentUserId++,
      firstName: "Alex",
      lastName: "Thompson",
      email: "alex@barberpro.com",
      password: "password123",
      role: "barber",
      profileImageUrl: "https://images.unsplash.com/photo-1438761681033-6461ffad8d80?ixlib=rb-4.0.3&auto=format&fit=crop&w=150&h=150",
      createdAt: new Date("2022-03-10"),
    };
    this.users.set(barberUser2.id, barberUser2);

    const barberUser3: User = {
      id: this.currentUserId++,
      firstName: "David",
      lastName: "Rodriguez",
      email: "david@barberpro.com",
      password: "password123",
      role: "barber",
      profileImageUrl: "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?ixlib=rb-4.0.3&auto=format&fit=crop&w=150&h=150",
      createdAt: new Date("2021-08-20"),
    };
    this.users.set(barberUser3.id, barberUser3);

    // Seed barbers
    const barber1: Barber = {
      id: this.currentBarberId++,
      userId: barberUser1.id,
      specialty: "Classic cuts and beard styling",
      experience: 5,
      rating: "4.9",
      reviewCount: 127,
      isAvailable: true,
    };
    this.barbers.set(barber1.id, barber1);

    const barber2: Barber = {
      id: this.currentBarberId++,
      userId: barberUser2.id,
      specialty: "Modern styling and color",
      experience: 3,
      rating: "4.8",
      reviewCount: 98,
      isAvailable: true,
    };
    this.barbers.set(barber2.id, barber2);

    const barber3: Barber = {
      id: this.currentBarberId++,
      userId: barberUser3.id,
      specialty: "Traditional techniques and hot shaves",
      experience: 8,
      rating: "5.0",
      reviewCount: 156,
      isAvailable: true,
    };
    this.barbers.set(barber3.id, barber3);

    // Seed services
    const services: Omit<Service, 'id'>[] = [
      {
        name: "Classic Cut",
        description: "Traditional haircut with precision and style. Includes wash and basic styling.",
        price: "25.00",
        duration: 30,
        category: "haircuts",
        imageUrl: "https://images.unsplash.com/photo-1503951914875-452162b0f3f1?ixlib=rb-4.0.3&auto=format&fit=crop&w=400&h=200",
        isActive: true,
      },
      {
        name: "Beard Trim",
        description: "Expert beard trimming and shaping. Includes hot towel treatment and beard oil.",
        price: "20.00",
        duration: 25,
        category: "beard-care",
        imageUrl: "https://images.unsplash.com/photo-1621605815971-fbc98d665033?ixlib=rb-4.0.3&auto=format&fit=crop&w=400&h=200",
        isActive: true,
      },
      {
        name: "Deluxe Package",
        description: "Complete grooming experience. Cut, beard trim, wash, style, and hot towel treatment.",
        price: "65.00",
        duration: 75,
        category: "packages",
        imageUrl: "https://images.unsplash.com/photo-1585747860715-2ba37e788b70?ixlib=rb-4.0.3&auto=format&fit=crop&w=400&h=200",
        isActive: true,
      },
      {
        name: "Wash & Style",
        description: "Premium hair wash with scalp massage and professional styling.",
        price: "15.00",
        duration: 20,
        category: "styling",
        imageUrl: "https://images.unsplash.com/photo-1599351431202-1e0f0137899a?ixlib=rb-4.0.3&auto=format&fit=crop&w=400&h=200",
        isActive: true,
      },
      {
        name: "Hot Towel Shave",
        description: "Traditional straight razor shave with hot towel preparation and aftercare.",
        price: "35.00",
        duration: 40,
        category: "styling",
        imageUrl: "https://images.unsplash.com/photo-1622296089863-eb7fc530daa8?ixlib=rb-4.0.3&auto=format&fit=crop&w=400&h=200",
        isActive: true,
      },
      {
        name: "Hair Styling",
        description: "Professional styling for special occasions. Includes consultation and premium products.",
        price: "30.00",
        duration: 45,
        category: "styling",
        imageUrl: "https://images.unsplash.com/photo-1493256338651-d82f7acb2b38?ixlib=rb-4.0.3&auto=format&fit=crop&w=400&h=200",
        isActive: true,
      },
    ];

    services.forEach(service => {
      this.services.set(this.currentServiceId, { ...service, id: this.currentServiceId });
      this.currentServiceId++;
    });

    // Seed appointments
    const tomorrow = new Date();
    tomorrow.setDate(tomorrow.getDate() + 1);
    tomorrow.setHours(14, 0, 0, 0);

    const appointment1: Appointment = {
      id: this.currentAppointmentId++,
      customerId: customer1.id,
      barberId: barber1.id,
      serviceId: 1, // Classic Cut
      appointmentDate: tomorrow,
      status: "scheduled",
      totalPrice: "45.00",
      notes: "Classic Cut & Beard Trim combo",
      createdAt: new Date(),
    };
    this.appointments.set(appointment1.id, appointment1);

    // Add some historical appointments
    const pastDate1 = new Date();
    pastDate1.setDate(pastDate1.getDate() - 2);
    pastDate1.setHours(14, 0, 0, 0);

    const pastAppointment1: Appointment = {
      id: this.currentAppointmentId++,
      customerId: customer1.id,
      barberId: barber1.id,
      serviceId: 1,
      appointmentDate: pastDate1,
      status: "completed",
      totalPrice: "25.00",
      notes: "Classic haircut",
      createdAt: new Date(pastDate1.getTime() - 86400000), // Created day before
    };
    this.appointments.set(pastAppointment1.id, pastAppointment1);
  }

  // User operations
  async getUser(id: number): Promise<User | undefined> {
    return this.users.get(id);
  }

  async getUserByEmail(email: string): Promise<User | undefined> {
    return Array.from(this.users.values()).find(user => user.email === email);
  }

  async createUser(insertUser: InsertUser): Promise<User> {
    const user: User = {
      ...insertUser,
      id: this.currentUserId++,
      role: insertUser.role || "customer",
      profileImageUrl: insertUser.profileImageUrl || null,
      createdAt: new Date(),
    };
    this.users.set(user.id, user);
    return user;
  }

  // Service operations
  async getAllServices(): Promise<Service[]> {
    return Array.from(this.services.values()).filter(service => service.isActive);
  }

  async getServicesByCategory(category: string): Promise<Service[]> {
    return Array.from(this.services.values()).filter(
      service => service.isActive && service.category === category
    );
  }

  async getService(id: number): Promise<Service | undefined> {
    return this.services.get(id);
  }

  // Barber operations
  async getAllBarbers(): Promise<BarberWithUser[]> {
    const barbersWithUsers: BarberWithUser[] = [];
    for (const barber of Array.from(this.barbers.values())) {
      const user = this.users.get(barber.userId);
      if (user && barber.isAvailable) {
        barbersWithUsers.push({ ...barber, user });
      }
    }
    return barbersWithUsers;
  }

  async getBarber(id: number): Promise<BarberWithUser | undefined> {
    const barber = this.barbers.get(id);
    if (!barber) return undefined;
    
    const user = this.users.get(barber.userId);
    if (!user) return undefined;
    
    return { ...barber, user };
  }

  // Appointment operations
  async createAppointment(insertAppointment: InsertAppointment): Promise<Appointment> {
    const appointment: Appointment = {
      ...insertAppointment,
      id: this.currentAppointmentId++,
      status: insertAppointment.status || "scheduled",
      notes: insertAppointment.notes || null,
      createdAt: new Date(),
    };
    this.appointments.set(appointment.id, appointment);
    return appointment;
  }

  async getUserAppointments(userId: number): Promise<AppointmentWithDetails[]> {
    const appointmentsWithDetails: AppointmentWithDetails[] = [];
    
    for (const appointment of Array.from(this.appointments.values())) {
      if (appointment.customerId === userId) {
        const customer = this.users.get(appointment.customerId);
        const barber = await this.getBarber(appointment.barberId);
        const service = this.services.get(appointment.serviceId);
        
        if (customer && barber && service) {
          appointmentsWithDetails.push({
            ...appointment,
            customer,
            barber,
            service,
          });
        }
      }
    }
    
    return appointmentsWithDetails.sort((a, b) => 
      new Date(b.appointmentDate).getTime() - new Date(a.appointmentDate).getTime()
    );
  }

  async getBarberAppointments(barberId: number, date?: Date): Promise<AppointmentWithDetails[]> {
    const appointmentsWithDetails: AppointmentWithDetails[] = [];
    
    for (const appointment of Array.from(this.appointments.values())) {
      if (appointment.barberId === barberId) {
        if (date) {
          const appointmentDate = new Date(appointment.appointmentDate);
          if (appointmentDate.toDateString() !== date.toDateString()) {
            continue;
          }
        }
        
        const customer = this.users.get(appointment.customerId);
        const barber = await this.getBarber(appointment.barberId);
        const service = this.services.get(appointment.serviceId);
        
        if (customer && barber && service) {
          appointmentsWithDetails.push({
            ...appointment,
            customer,
            barber,
            service,
          });
        }
      }
    }
    
    return appointmentsWithDetails.sort((a, b) => 
      new Date(a.appointmentDate).getTime() - new Date(b.appointmentDate).getTime()
    );
  }

  async updateAppointmentStatus(id: number, status: string): Promise<Appointment | undefined> {
    const appointment = this.appointments.get(id);
    if (!appointment) return undefined;
    
    const updatedAppointment = { ...appointment, status };
    this.appointments.set(id, updatedAppointment);
    return updatedAppointment;
  }

  // Review operations
  async createReview(insertReview: InsertReview): Promise<Review> {
    const review: Review = {
      ...insertReview,
      id: this.currentReviewId++,
      comment: insertReview.comment || null,
      createdAt: new Date(),
    };
    this.reviews.set(review.id, review);
    
    // Update barber rating
    await this.updateBarberRating(insertReview.barberId);
    
    return review;
  }

  async getBarberReviews(barberId: number): Promise<ReviewWithDetails[]> {
    const reviewsWithDetails: ReviewWithDetails[] = [];
    
    for (const review of Array.from(this.reviews.values())) {
      if (review.barberId === barberId) {
        const customer = this.users.get(review.customerId);
        const barber = await this.getBarber(review.barberId);
        
        if (customer && barber) {
          reviewsWithDetails.push({
            ...review,
            customer,
            barber,
          });
        }
      }
    }
    
    return reviewsWithDetails.sort((a, b) => 
      new Date(b.createdAt!).getTime() - new Date(a.createdAt!).getTime()
    );
  }

  private async updateBarberRating(barberId: number): Promise<void> {
    const reviews = Array.from(this.reviews.values()).filter(r => r.barberId === barberId);
    if (reviews.length === 0) return;
    
    const totalRating = reviews.reduce((sum, review) => sum + review.rating, 0);
    const averageRating = totalRating / reviews.length;
    
    const barber = this.barbers.get(barberId);
    if (barber) {
      const updatedBarber = {
        ...barber,
        rating: averageRating.toFixed(1),
        reviewCount: reviews.length,
      };
      this.barbers.set(barberId, updatedBarber);
    }
  }
}

export const storage = new MemStorage();
