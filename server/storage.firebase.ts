import { initializeApp, cert, getApps, App } from 'firebase-admin/app';
import { getFirestore, Firestore, FieldValue } from 'firebase-admin/firestore';
import type {
  User, InsertUser, Service, InsertService, Barber, InsertBarber, BarberWithUser,
  Appointment, InsertAppointment, AppointmentWithDetails, Review, InsertReview, ReviewWithDetails
} from '@shared/schema';
import type { IStorage } from './storage';
import * as fs from 'fs';

const serviceAccountPath = 'server/credentials/serviceAccountKey.json';
if (!fs.existsSync(serviceAccountPath)) {
  throw new Error('Arquivo de credenciais do Firebase não encontrado: ' + serviceAccountPath);
}

const serviceAccount = require('../../' + serviceAccountPath);

let app: App;
if (!getApps().length) {
  app = initializeApp({
    credential: cert(serviceAccount),
  });
} else {
  app = getApps()[0];
}

const db: Firestore = getFirestore(app);

function userDocToUser(doc: FirebaseFirestore.DocumentSnapshot): User | undefined {
  if (!doc.exists) return undefined;
  const data = doc.data();
  if (!data) return undefined;
  return {
    id: data.id,
    firstName: data.firstName,
    lastName: data.lastName,
    email: data.email,
    password: data.password,
    role: data.role,
    profileImageUrl: data.profileImageUrl || null,
    createdAt: data.createdAt ? data.createdAt.toDate() : new Date(),
  };
}

export class FirebaseStorage implements IStorage {
  // Usuários
  async getUser(id: number): Promise<User | undefined> {
    const snapshot = await db.collection('users').where('id', '==', id).limit(1).get();
    if (snapshot.empty) return undefined;
    return userDocToUser(snapshot.docs[0]);
  }

  async getUserByEmail(email: string): Promise<User | undefined> {
    const snapshot = await db.collection('users').where('email', '==', email).limit(1).get();
    if (snapshot.empty) return undefined;
    return userDocToUser(snapshot.docs[0]);
  }

  async createUser(user: InsertUser): Promise<User> {
    // Buscar o maior id atual para simular auto-incremento
    const snapshot = await db.collection('users').orderBy('id', 'desc').limit(1).get();
    const lastId = snapshot.empty ? 0 : (snapshot.docs[0].data().id || 0);
    const newId = lastId + 1;
    const now = new Date();
    const newUser: User = {
      ...user,
      id: newId,
      createdAt: now,
      profileImageUrl: user.profileImageUrl || null,
      role: user.role || 'customer',
    };
    await db.collection('users').add({ ...newUser, createdAt: FieldValue.serverTimestamp() });
    return newUser;
  }

  // Serviços
  async getAllServices(): Promise<Service[]> {
    const snapshot = await db.collection('services').where('isActive', '==', true).get();
    return snapshot.docs.map(doc => {
      const data = doc.data();
      return {
        id: data.id,
        name: data.name,
        description: data.description,
        price: data.price,
        duration: data.duration,
        category: data.category,
        imageUrl: data.imageUrl || null,
        isActive: data.isActive ?? true,
      };
    });
  }

  async getServicesByCategory(category: string): Promise<Service[]> {
    const snapshot = await db.collection('services')
      .where('category', '==', category)
      .where('isActive', '==', true)
      .get();
    return snapshot.docs.map(doc => {
      const data = doc.data();
      return {
        id: data.id,
        name: data.name,
        description: data.description,
        price: data.price,
        duration: data.duration,
        category: data.category,
        imageUrl: data.imageUrl || null,
        isActive: data.isActive ?? true,
      };
    });
  }

  async getService(id: number): Promise<Service | undefined> {
    const snapshot = await db.collection('services').where('id', '==', id).limit(1).get();
    if (snapshot.empty) return undefined;
    const data = snapshot.docs[0].data();
    return {
      id: data.id,
      name: data.name,
      description: data.description,
      price: data.price,
      duration: data.duration,
      category: data.category,
      imageUrl: data.imageUrl || null,
      isActive: data.isActive ?? true,
    };
  }

  // Barbeiros
  async getAllBarbers(): Promise<BarberWithUser[]> {
    const snapshot = await db.collection('barbers').where('isAvailable', '==', true).get();
    const barbers = snapshot.docs.map(doc => doc.data() as Barber);
    const usersSnapshot = await db.collection('users').get();
    const usersMap = new Map<number, User>();
    usersSnapshot.docs.forEach(doc => {
      const data = doc.data();
      usersMap.set(data.id, {
        id: data.id,
        firstName: data.firstName,
        lastName: data.lastName,
        email: data.email,
        password: data.password,
        role: data.role,
        profileImageUrl: data.profileImageUrl || null,
        createdAt: data.createdAt ? data.createdAt.toDate() : new Date(),
      });
    });
    return barbers
      .filter(barber => usersMap.has(barber.userId))
      .map(barber => ({
        ...barber,
        user: usersMap.get(barber.userId)!,
      }));
  }

  async getBarber(id: number): Promise<BarberWithUser | undefined> {
    const barberSnap = await db.collection('barbers').where('id', '==', id).limit(1).get();
    if (barberSnap.empty) return undefined;
    const barber = barberSnap.docs[0].data() as Barber;
    const userSnap = await db.collection('users').where('id', '==', barber.userId).limit(1).get();
    if (userSnap.empty) return undefined;
    const userData = userSnap.docs[0].data();
    const user: User = {
      id: userData.id,
      firstName: userData.firstName,
      lastName: userData.lastName,
      email: userData.email,
      password: userData.password,
      role: userData.role,
      profileImageUrl: userData.profileImageUrl || null,
      createdAt: userData.createdAt ? userData.createdAt.toDate() : new Date(),
    };
    return { ...barber, user };
  }

  // Agendamentos
  async createAppointment(appointment: InsertAppointment): Promise<Appointment> {
    // Buscar o maior id atual para simular auto-incremento
    const snapshot = await db.collection('appointments').orderBy('id', 'desc').limit(1).get();
    const lastId = snapshot.empty ? 0 : (snapshot.docs[0].data().id || 0);
    const newId = lastId + 1;
    const now = new Date();
    const newAppointment: Appointment = {
      ...appointment,
      id: newId,
      status: appointment.status || 'scheduled',
      notes: appointment.notes || null,
      createdAt: now,
    };
    await db.collection('appointments').add({ ...newAppointment, createdAt: FieldValue.serverTimestamp() });
    return newAppointment;
  }

  async getUserAppointments(userId: number): Promise<AppointmentWithDetails[]> {
    const appointmentsSnap = await db.collection('appointments').where('customerId', '==', userId).get();
    const appointments = appointmentsSnap.docs.map(doc => doc.data() as Appointment);
    // Buscar dados relacionados
    const usersSnap = await db.collection('users').get();
    const usersMap = new Map<number, User>();
    usersSnap.docs.forEach(doc => {
      const data = doc.data();
      usersMap.set(data.id, {
        id: data.id,
        firstName: data.firstName,
        lastName: data.lastName,
        email: data.email,
        password: data.password,
        role: data.role,
        profileImageUrl: data.profileImageUrl || null,
        createdAt: data.createdAt ? data.createdAt.toDate() : new Date(),
      });
    });
    const barbersSnap = await db.collection('barbers').get();
    const barbers = barbersSnap.docs.map(doc => doc.data() as Barber);
    const servicesSnap = await db.collection('services').get();
    const servicesMap = new Map<number, Service>();
    servicesSnap.docs.forEach(doc => {
      const data = doc.data();
      servicesMap.set(data.id, {
        id: data.id,
        name: data.name,
        description: data.description,
        price: data.price,
        duration: data.duration,
        category: data.category,
        imageUrl: data.imageUrl || null,
        isActive: data.isActive ?? true,
      });
    });
    // Montar os detalhes
    return appointments.map(app => {
      const customer = usersMap.get(app.customerId)!;
      const barber = barbers.find(b => b.id === app.barberId);
      const barberUser = barber ? usersMap.get(barber.userId) : undefined;
      const service = servicesMap.get(app.serviceId);
      return {
        ...app,
        customer,
        barber: barber && barberUser ? { ...barber, user: barberUser } : undefined!,
        service: service!,
      };
    }).sort((a, b) => new Date(b.appointmentDate).getTime() - new Date(a.appointmentDate).getTime());
  }

  async getBarberAppointments(barberId: number, date?: Date): Promise<AppointmentWithDetails[]> {
    let query = db.collection('appointments').where('barberId', '==', barberId);
    if (date) {
      // Firestore não suporta comparação direta de data, então filtra depois
      const snap = await query.get();
      const filtered = snap.docs.map(doc => doc.data() as Appointment)
        .filter(app => new Date(app.appointmentDate).toDateString() === date.toDateString());
      // Buscar dados relacionados (igual ao método acima)
      const usersSnap = await db.collection('users').get();
      const usersMap = new Map<number, User>();
      usersSnap.docs.forEach(doc => {
        const data = doc.data();
        usersMap.set(data.id, {
          id: data.id,
          firstName: data.firstName,
          lastName: data.lastName,
          email: data.email,
          password: data.password,
          role: data.role,
          profileImageUrl: data.profileImageUrl || null,
          createdAt: data.createdAt ? data.createdAt.toDate() : new Date(),
        });
      });
      const barbersSnap = await db.collection('barbers').get();
      const barbers = barbersSnap.docs.map(doc => doc.data() as Barber);
      const servicesSnap = await db.collection('services').get();
      const servicesMap = new Map<number, Service>();
      servicesSnap.docs.forEach(doc => {
        const data = doc.data();
        servicesMap.set(data.id, {
          id: data.id,
          name: data.name,
          description: data.description,
          price: data.price,
          duration: data.duration,
          category: data.category,
          imageUrl: data.imageUrl || null,
          isActive: data.isActive ?? true,
        });
      });
      return filtered.map(app => {
        const customer = usersMap.get(app.customerId)!;
        const barber = barbers.find(b => b.id === app.barberId);
        const barberUser = barber ? usersMap.get(barber.userId) : undefined;
        const service = servicesMap.get(app.serviceId);
        return {
          ...app,
          customer,
          barber: barber && barberUser ? { ...barber, user: barberUser } : undefined!,
          service: service!,
        };
      }).sort((a, b) => new Date(a.appointmentDate).getTime() - new Date(b.appointmentDate).getTime());
    } else {
      const snap = await query.get();
      const appointments = snap.docs.map(doc => doc.data() as Appointment);
      // Buscar dados relacionados (igual ao método acima)
      const usersSnap = await db.collection('users').get();
      const usersMap = new Map<number, User>();
      usersSnap.docs.forEach(doc => {
        const data = doc.data();
        usersMap.set(data.id, {
          id: data.id,
          firstName: data.firstName,
          lastName: data.lastName,
          email: data.email,
          password: data.password,
          role: data.role,
          profileImageUrl: data.profileImageUrl || null,
          createdAt: data.createdAt ? data.createdAt.toDate() : new Date(),
        });
      });
      const barbersSnap = await db.collection('barbers').get();
      const barbers = barbersSnap.docs.map(doc => doc.data() as Barber);
      const servicesSnap = await db.collection('services').get();
      const servicesMap = new Map<number, Service>();
      servicesSnap.docs.forEach(doc => {
        const data = doc.data();
        servicesMap.set(data.id, {
          id: data.id,
          name: data.name,
          description: data.description,
          price: data.price,
          duration: data.duration,
          category: data.category,
          imageUrl: data.imageUrl || null,
          isActive: data.isActive ?? true,
        });
      });
      return appointments.map(app => {
        const customer = usersMap.get(app.customerId)!;
        const barber = barbers.find(b => b.id === app.barberId);
        const barberUser = barber ? usersMap.get(barber.userId) : undefined;
        const service = servicesMap.get(app.serviceId);
        return {
          ...app,
          customer,
          barber: barber && barberUser ? { ...barber, user: barberUser } : undefined!,
          service: service!,
        };
      }).sort((a, b) => new Date(a.appointmentDate).getTime() - new Date(b.appointmentDate).getTime());
    }
  }

  async updateAppointmentStatus(id: number, status: string): Promise<Appointment | undefined> {
    const snap = await db.collection('appointments').where('id', '==', id).limit(1).get();
    if (snap.empty) return undefined;
    const docRef = snap.docs[0].ref;
    await docRef.update({ status });
    const updated = await docRef.get();
    return updated.data() as Appointment;
  }

  // Avaliações
  async createReview(review: InsertReview): Promise<Review> {
    // Buscar o maior id atual para simular auto-incremento
    const snapshot = await db.collection('reviews').orderBy('id', 'desc').limit(1).get();
    const lastId = snapshot.empty ? 0 : (snapshot.docs[0].data().id || 0);
    const newId = lastId + 1;
    const now = new Date();
    const newReview: Review = {
      ...review,
      id: newId,
      createdAt: now,
      comment: review.comment ?? null,
    };
    await db.collection('reviews').add({ ...newReview, createdAt: FieldValue.serverTimestamp() });
    return newReview;
  }

  async getBarberReviews(barberId: number): Promise<ReviewWithDetails[]> {
    const reviewsSnap = await db.collection('reviews').where('barberId', '==', barberId).get();
    const reviews = reviewsSnap.docs.map(doc => doc.data() as Review);
    // Buscar dados relacionados
    const usersSnap = await db.collection('users').get();
    const usersMap = new Map<number, User>();
    usersSnap.docs.forEach(doc => {
      const data = doc.data();
      usersMap.set(data.id, {
        id: data.id,
        firstName: data.firstName,
        lastName: data.lastName,
        email: data.email,
        password: data.password,
        role: data.role,
        profileImageUrl: data.profileImageUrl || null,
        createdAt: data.createdAt ? data.createdAt.toDate() : new Date(),
      });
    });
    const barbersSnap = await db.collection('barbers').get();
    const barbers = barbersSnap.docs.map(doc => doc.data() as Barber);
    return reviews.map(review => {
      const customer = usersMap.get(review.customerId)!;
      const barber = barbers.find(b => b.id === review.barberId);
      const barberUser = barber ? usersMap.get(barber.userId) : undefined;
      return {
        ...review,
        customer,
        barber: barber && barberUser ? { ...barber, user: barberUser } : undefined!,
      };
    }).sort((a, b) => new Date(b.createdAt!).getTime() - new Date(a.createdAt!).getTime());
  }
}

export const storage = new FirebaseStorage(); 