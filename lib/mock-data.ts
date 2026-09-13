import type { Announcement, Booking, Driver, Incident, Place, User } from './types';

export const PLACES: Place[] = [
  { id: 'p1', name: 'Cagayan State University', lat: 17.6158, lng: 121.7272 },
  { id: 'p2', name: 'Tuguegarao City Hall', lat: 17.6131, lng: 121.7272 },
  { id: 'p3', name: 'SM City Tuguegarao', lat: 17.6154, lng: 121.7352 },
  { id: 'p4', name: 'Tuguegarao Cathedral', lat: 17.6098, lng: 121.7265 },
  { id: 'p5', name: 'Carig Sur', lat: 17.6220, lng: 121.7190 },
  { id: 'p6', name: 'Robinsons Place Tuguegarao', lat: 17.6178, lng: 121.7337 },
];

export const USERS: User[] = [
  { id: 'u1', name: 'Juan Dela Cruz', email: 'commuter@ayab.com', password: '123456', role: 'commuter', phone: '09171234567', status: 'active' },
  { id: 'u2', name: 'Maria Garcia', email: 'maria@ayab.com', password: '123456', role: 'commuter', phone: '09171234568', status: 'active' },
  { id: 'u3', name: 'Carlo Reyes', email: 'carlo@ayab.com', password: '123456', role: 'commuter', phone: '09171234569', status: 'active' },
  { id: 'd1', name: 'Pedro Santos', email: 'driver@ayab.com', password: '123456', role: 'driver', phone: '09181234567', status: 'active' },
  { id: 'd2', name: 'Ramon Bautista', email: 'ramon@ayab.com', password: '123456', role: 'driver', phone: '09181234568', status: 'active' },
  { id: 'd3', name: 'Noel Ramirez', email: 'noel@ayab.com', password: '123456', role: 'driver', phone: '09181234569', status: 'active' },
  { id: 'a1', name: 'AYAB Administrator', email: 'admin@ayab.com', password: '123456', role: 'admin', phone: '09991234567', status: 'active' },
];

export const DRIVERS: Driver[] = [
  { id: 'd1', name: 'Pedro Santos', email: 'driver@ayab.com', password: '123456', role: 'driver', phone: '09181234567', status: 'active', rating: 4.8, completedTrips: 125, plate: 'ABC 1234', tricycle: 'AYAB Blue Tricycle', qrId: 'AYAB-DRIVER-001', online: true, verified: true, lat: 17.6132, lng: 121.7269, eta: 4 },
  { id: 'd2', name: 'Ramon Bautista', email: 'ramon@ayab.com', password: '123456', role: 'driver', phone: '09181234568', status: 'active', rating: 4.6, completedTrips: 98, plate: 'DEF 5678', tricycle: 'AYAB Green Tricycle', qrId: 'AYAB-DRIVER-002', online: true, verified: true, lat: 17.6151, lng: 121.7310, eta: 6 },
  { id: 'd3', name: 'Noel Ramirez', email: 'noel@ayab.com', password: '123456', role: 'driver', phone: '09181234569', status: 'active', rating: 4.9, completedTrips: 210, plate: 'GHI 9012', tricycle: 'AYAB Red Tricycle', qrId: 'AYAB-DRIVER-003', online: false, verified: false, lat: 17.6180, lng: 121.7300, eta: 8 },
];

export const BOOKINGS: Booking[] = [
  {
    id: 'AYAB-DEMO01',
    passengerId: 'u2',
    passengerName: 'Maria Garcia',
    pickup: PLACES[0],
    destination: PLACES[2],
    distance: 1.4,
    fare: 23.2,
    status: 'searching',
    createdAt: '2026-09-02T10:00:00+08:00',
  },
];

export const INCIDENTS: Incident[] = [
  {
    id: 'i1',
    title: 'Late pickup',
    passenger: 'Maria Garcia',
    driver: 'Ramon Bautista',
    description: 'Driver arrived later than expected.',
    status: 'Resolved',
    notes: 'Demo incident.',
    date: '2026-08-28',
  },
  {
    id: 'i2',
    title: 'QR verification issue',
    passenger: 'Juan Dela Cruz',
    driver: 'Pedro Santos',
    description: 'QR did not scan on first attempt.',
    status: 'Investigating',
    notes: '',
    date: '2026-09-01',
  },
];

export const ANNOUNCEMENTS: Announcement[] = [
  {
    id: 'an1',
    title: 'Welcome to AYAB',
    body: "Your Ride. Your way. TODA na 'to!",
    published: true,
    date: '2026-09-01',
  },
  {
    id: 'an2',
    title: 'Ride Safely',
    body: 'Please verify the driver QR before starting your trip.',
    published: true,
    date: '2026-08-30',
  },
];

export const BASE_FARE = 20;
export const PER_KM_RATE = 8;
