export enum TableStatus {
  AVAILABLE = 'available',
  OCCUPIED = 'occupied',
  PENDING_PAYMENT = 'pending_payment',
  RESERVED = 'reserved'
}

export interface MenuItem {
  id: string;
  name: string;
  price: number;
  category: string;
  image: string;
  isVeg: boolean;
  status?: 'current' | 'pending' | 'not_selling'; // NEW: Added status
}

export interface OrderItem {
  menuItemId: string;
  quantity: number;
  notes?: string;
}

export interface Table {
  id: number;
  status: TableStatus;
  currentOrder: OrderItem[];
  waiterName?: string;
  label?: string;
}

export interface Transaction {
  id: string;
  tableId: number;
  items: OrderItem[];
  subtotal: number;
  tax: number;
  serviceCharge: number;
  total: number;
  timestamp: Date;
  paymentMethod: 'Cash' | 'Card' | 'UPI';
}

export interface StaffMember {
  id: string;
  name: string;
  userId: string;
  password: string;
  isActive: boolean;
  dateAdded: Date;
}