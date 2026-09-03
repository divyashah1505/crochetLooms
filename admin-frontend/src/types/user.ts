export interface User {
  id: string;
  name: string;
  email: string;
  role: 'admin' | 'customer';
  avatarUrl?: string;
  createdAt: string;
}

export interface Customer extends User {
  phone?: string;
  googleId?: string;
  addresses?: Address[];
}

export interface Admin extends User {}

export interface Address {
  id: string;
  customerId: string;
  fullName: string;
  phone: string;
  addressLine1: string;
  addressLine2?: string;
  city: string;
  state: string;
  postalCode: string;
  country: string;
  isDefault: boolean;
  createdAt: string;
}
