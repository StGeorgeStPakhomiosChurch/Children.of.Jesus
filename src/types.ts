import { SERVICE_STRUCTURE } from './constants';

export type Role = 'admin' | 'priest' | 'service_leader' | 'servant';

export interface ServiceAssignment {
  main: string;
  sub: string;
  role: Role;
}

export interface User {
  id: string;
  username: string;
  password: string;
  role: Role;
  fullName: string;
  birthDate: string;
  email: string;
  phone: string;
  whatsapp: string;
  address: string;
  location?: { lat: number; lng: number };
  photo?: string;
  assignments: ServiceAssignment[];
}

export interface Service {
  label: string;
  icon?: any;
  color: string;
  bg: string;
  subServices: string[];
  subServiceAliases?: Record<string, string>;
}

export interface Servant {
  id: string;
  name: string;
  birthDate?: string;
  phone?: string;
  address?: string;
  service: string;
  subService: string;
  gender: 'male' | 'female';
  confession?: string;
  father?: { name?: string; phone?: string; confession?: string; job?: string };
  mother?: { name?: string; phone?: string; confession?: string; job?: string };
  whatsapp?: string;
  facebook?: string;
  telegram?: string;
  instagram?: string;
  gmail?: string;
  landline?: string;
  notes?: string;
  lat?: number;
  lng?: number;
  photo?: string;
}

export interface AttendanceRecord {
  date: string;
  records: Record<string, { mass: boolean; service: boolean }>;
}

export interface Trip {
  id: string;
  name: string;
  date: string;
  price: number;
  service: string;
  subService?: string;
  bookings: { servantId: string; amount: number }[];
}
