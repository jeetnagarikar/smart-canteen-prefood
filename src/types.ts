/**
 * Smart Canteen Pre-Order System - TypeScript Types
 */

export interface Student {
  id: string;
  name: string;
  email: string;
  phone: string;
  balance: number; // Student virtual pre-paid wallet balance
  loyaltyPoints: number; // Student loyalty points balance
}

export type FoodCategory = 'Main Course' | 'Drinks' | 'Desserts';

export interface NutritionalInfo {
  calories: number;
  protein: number; // in grams
  carbs: number;   // in grams
  fat: number;     // in grams
}

export interface MenuItem {
  id: string;
  name: string;
  price: number;
  category: FoodCategory;
  availability: boolean;
  description: string;
  image: string; // URL or emoji-based placeholder
  prepTimeMinutes: number; // Average time to prepare
  nutrition: NutritionalInfo;
}

export type OrderStatus = 'Pending' | 'Preparing' | 'Ready for Pickup' | 'Collected' | 'Cancelled';
export type PaymentStatus = 'Paid' | 'Unpaid' | 'Refunded';

export interface OrderItem {
  foodId: string;
  name: string;
  price: number;
  quantity: number;
  customization?: {
    size: 'Small' | 'Medium' | 'Large';
    addOns: string[];
    dietaryNotes?: string;
  };
}

export interface Order {
  id: string;
  studentId: string;
  studentName: string;
  orderDate: string; // ISO String
  items: OrderItem[];
  totalAmount: number;
  discountApplied?: number; // Discount from redeeming points
  pointsEarned?: number; // Loyalty points earned in this order
  pointsRedeemed?: number; // Loyalty points redeemed in this order
  paymentStatus: PaymentStatus;
  pickupTime: string; // Estimated pickup time, e.g., "12:45 PM"
  orderStatus: OrderStatus;
  estimatedPrepTimeMinutes: number;
  paymentMethod: 'Wallet' | 'UPI' | 'Card';
}

export interface Notification {
  id: string;
  message: string;
  timestamp: string; // ISO String
  read: boolean;
  type: 'info' | 'success' | 'alert';
}
