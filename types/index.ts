import { SVGProps } from "react";

export type IconSvgProps = SVGProps<SVGSVGElement> & {
  size?: number;
};

export interface CartItem {
  id: string;
  slug: string;
  name: string;
  price: number;
  size: string;
  quantity: number;
  image: string;
}

export interface OrderItem {
  slug: string;
  name: string;
  price: number;
  size: string;
  quantity: number;
  image: string;
}

export interface Order {
  orderId: string;
  userId: string;
  userEmail: string;
  items: OrderItem[];
  shippingAddress: {
    fullName: string;
    phone: string;
    street: string;
    city: string;
    province: string;
    postalCode: string;
  };
  paymentMethod: 'gcash' | 'cod' | 'card';
  shippingCost: number;
  subtotal: number;
  total: number;
  status:
    | 'pending'
    | 'confirmed'
    | 'processing'
    | 'ready_for_pickup'
    | 'completed'
    | 'cancelled'
    | 'approved'
    | 'rejected';
  createdAt: Date;
  updatedAt: Date;
}
