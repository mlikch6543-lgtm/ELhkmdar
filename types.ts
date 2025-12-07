
export enum BookingStatus {
  PENDING = 'PENDING',
  CONFIRMED = 'CONFIRMED',
  REJECTED = 'REJECTED',
}

export interface Shift {
  id: string;
  date: string; // YYYY-MM-DD
  startTime: string;
  endTime: string;
  capacity: number;
  booked: number;
  price: number;
}

export interface BookingDetails {
  id: string;
  userId?: string;
  fullName: string;
  nationalId?: string;
  phoneNumber: string;
  email?: string; // Optional/Deprecated
  university?: string; // Optional/Deprecated
  group: string; // NEW: المجموعة
  applicationNumber: string; // NEW: رقم الابلكيشن / رقمك في المجموعة
  shiftId: string;
  notes?: string;
  status: BookingStatus;
  transactionId?: string; // For Instapay
  senderPhone?: string; // The number money is sent from
  receiptImage?: string; // Mock URL
  createdAt: string;
  ticketNumber?: number; // NEW: Simple incremental number (e.g., 1001)
  attended?: boolean; // NEW: Track if student entered the hall
}

export interface User {
  uid: string;
  displayName: string | null;
  phoneNumber: string | null; // We will use email field as "phone@app" but store real phone here if needed or parse it
  email: string | null;
  isAdmin?: boolean;
  role?: 'super_admin' | 'admin' | 'user'; // Added role
}

export interface AdminData {
  id: string;
  name: string;
  email: string;
  createdAt: string;
}

export interface Stats {
  totalRevenue: number;
  totalBookings: number;
  confirmedBookings: number;
}