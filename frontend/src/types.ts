export type Role = 'customer' | 'consultant' | 'sales' | 'admin';

export interface User {
  id: string;
  name: string;
  email: string;
  phone?: string;
  address?: string;
  role: Role;
  password?: string; // In a real app, this would be hashed
  isLocked?: boolean;
}

export interface Pet {
  id: string;
  userId: string;
  name: string;
  species: string; // e.g., Dog, Cat
  breed?: string;
  age?: number;
  weight?: number;
  healthStatus?: string;
  notes?: string;
  imageUrl?: string;
  lastVaccinationDate?: string;
  nextVaccinationDate?: string;
}

export interface Promotion {
  id: string;
  code: string;
  discountPercent: number;
  startDate: string; // YYYY-MM-DD
  endDate: string; // YYYY-MM-DD
  isActive: boolean;
}

export interface Service {
  id: string;
  name: string;
  description: string;
  price: number;
  durationMinutes: number;
  isActive: boolean;
}

export interface Category {
  categoryId: number;
  name: string;
}

export interface Product {
  id: string;
  name: string;
  description: string;
  price: number;
  categories: Category[];
  stock: number;
  imageUrl?: string;
}

export interface Appointment {
  id: string;
  userId: string;
  petId: string;
  serviceIds: string[];
  date: string; // YYYY-MM-DD
  time: string; // HH:MM
  status: 'pending' | 'confirmed' | 'completed' | 'cancelled';
  notes?: string;
  createdAt: string;
}

export interface CartItem {
  productId: string;
  quantity: number;
}

export interface OrderItem {
  productId: string;
  quantity: number;
  price: number;
}

export interface ShippingInfo {
  fullName: string;
  phone: string;
  address: string;
  notes?: string;
}

export interface Order {
  id: string;
  userId: string;
  items: OrderItem[];
  totalAmount: number;
  status: 'pending' | 'processing' | 'completed' | 'cancelled';
  paymentMethod?: string;
  paymentStatus?: 'pending' | 'paid' | 'failed';
  shippingInfo?: ShippingInfo;
  createdAt: string;
}
