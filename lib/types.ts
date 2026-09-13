export type Role = 'commuter' | 'driver' | 'admin';

export type BookingStatus =
  | 'searching'
  | 'accepted'
  | 'verified'
  | 'arrived'
  | 'started'
  | 'completed'
  | 'cancelled';

export interface User {
  id: string;
  name: string;
  email: string;
  password: string;
  role: Role;
  phone: string;
  status: 'active' | 'suspended';
}

export interface Driver extends User {
  role: 'driver';
  rating: number;
  completedTrips: number;
  plate: string;
  tricycle: string;
  qrId: string;
  online: boolean;
  verified: boolean;
  lat: number;
  lng: number;
  eta: number;
}

export interface Place {
  id: string;
  name: string;
  lat: number;
  lng: number;
}

export interface Booking {
  id: string;
  passengerId: string;
  passengerName: string;
  driverId?: string;
  pickup: Place;
  destination: Place;
  distance: number;
  fare: number;
  status: BookingStatus;
  createdAt: string;
  rating?: number;
  review?: string;
}

export type IncidentStatus = 'Pending' | 'Investigating' | 'Resolved' | 'Closed';

export interface Incident {
  id: string;
  title: string;
  passenger: string;
  driver: string;
  description: string;
  status: IncidentStatus;
  notes: string;
  date: string;
}

export interface Announcement {
  id: string;
  title: string;
  body: string;
  published: boolean;
  date: string;
}

export interface AppNotification {
  id: string;
  userId: string;
  message: string;
  read: boolean;
  date: string;
}

export const TRIP_STEPS: { key: BookingStatus; label: string }[] = [
  { key: 'searching', label: 'Finding driver' },
  { key: 'accepted', label: 'Driver assigned' },
  { key: 'verified', label: 'QR verified' },
  { key: 'started', label: 'On trip' },
  { key: 'completed', label: 'Completed' },
];
