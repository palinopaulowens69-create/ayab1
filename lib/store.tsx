'use client';

import React, { createContext, useCallback, useContext, useEffect, useMemo, useRef, useState } from 'react';
import { ANNOUNCEMENTS, BOOKINGS, DRIVERS, INCIDENTS, USERS } from './mock-data';
import { clearAllAyabData, loadItem, saveItem } from './storage';
import { distanceKm, estimateFare, newId } from './utils';
import type {
  Announcement,
  AppNotification,
  Booking,
  BookingStatus,
  Driver,
  Incident,
  IncidentStatus,
  Place,
  User,
} from './types';

interface AppState {
  mounted: boolean;
  currentUser: User | null;
  users: User[];
  drivers: Driver[];
  bookings: Booking[];
  incidents: Incident[];
  announcements: Announcement[];
  notifications: AppNotification[];
}

interface AppContextValue extends AppState {
  login: (email: string, password: string) => User | null;
  logout: () => void;
  createBooking: (pickup: Place, destination: Place) => Booking;
  cancelBooking: (bookingId: string) => void;
  acceptBooking: (bookingId: string, driverId: string) => void;
  verifyBooking: (bookingId: string) => void;
  startTrip: (bookingId: string) => void;
  completeTrip: (bookingId: string) => void;
  rateBooking: (bookingId: string, rating: number, review: string) => void;
  toggleDriverOnline: (driverId: string) => void;
  setDriverVerified: (driverId: string, verified: boolean) => void;
  setUserStatus: (userId: string, status: User['status']) => void;
  updateIncidentStatus: (incidentId: string, status: IncidentStatus, notes: string) => void;
  addAnnouncement: (title: string, body: string) => void;
  toggleAnnouncementPublished: (id: string) => void;
  deleteAnnouncement: (id: string) => void;
  markNotificationRead: (id: string) => void;
  markAllNotificationsRead: (userId: string) => void;
  resetDemoData: () => void;
}

const AppContext = createContext<AppContextValue | null>(null);

const SEED: AppState = {
  mounted: false,
  currentUser: null,
  users: USERS,
  drivers: DRIVERS,
  bookings: BOOKINGS,
  incidents: INCIDENTS,
  announcements: ANNOUNCEMENTS,
  notifications: [],
};

export function AppProvider({ children }: { children: React.ReactNode }) {
  const [state, setState] = useState<AppState>(SEED);
  const hydrated = useRef(false);

  // Hydrate from localStorage once, after mount, so server and first client
  // render match (avoids hydration warnings), then swap in saved data.
  useEffect(() => {
    if (hydrated.current) return;
    hydrated.current = true;
    setState({
      mounted: true,
      currentUser: loadItem('currentUser', null as User | null),
      users: loadItem('users', USERS),
      drivers: loadItem('drivers', DRIVERS),
      bookings: loadItem('bookings', BOOKINGS),
      incidents: loadItem('incidents', INCIDENTS),
      announcements: loadItem('announcements', ANNOUNCEMENTS),
      notifications: loadItem('notifications', [] as AppNotification[]),
    });
  }, []);

  // Keep tabs in sync: if another tab (e.g. a driver logged in alongside a
  // commuter) writes to localStorage, reflect that change here too.
  useEffect(() => {
    function onStorage(e: StorageEvent) {
      if (!e.key || !e.newValue) return;
      const key = e.key.replace('ayab_', '');
      try {
        const value = JSON.parse(e.newValue);
        setState((s) => (key in s ? { ...s, [key]: value } : s));
      } catch {
        // ignore malformed payloads from other tabs
      }
    }
    window.addEventListener('storage', onStorage);
    return () => window.removeEventListener('storage', onStorage);
  }, []);

  // Persist slices whenever they change (skip the very first pre-hydration render).
  useEffect(() => {
    if (!state.mounted) return;
    saveItem('currentUser', state.currentUser);
  }, [state.mounted, state.currentUser]);

  useEffect(() => {
    if (!state.mounted) return;
    saveItem('users', state.users);
  }, [state.mounted, state.users]);

  useEffect(() => {
    if (!state.mounted) return;
    saveItem('drivers', state.drivers);
  }, [state.mounted, state.drivers]);

  useEffect(() => {
    if (!state.mounted) return;
    saveItem('bookings', state.bookings);
  }, [state.mounted, state.bookings]);

  useEffect(() => {
    if (!state.mounted) return;
    saveItem('incidents', state.incidents);
  }, [state.mounted, state.incidents]);

  useEffect(() => {
    if (!state.mounted) return;
    saveItem('announcements', state.announcements);
  }, [state.mounted, state.announcements]);

  useEffect(() => {
    if (!state.mounted) return;
    saveItem('notifications', state.notifications);
  }, [state.mounted, state.notifications]);

  const pushNotification = useCallback((userId: string, message: string) => {
    setState((s) => ({
      ...s,
      notifications: [
        { id: newId('N'), userId, message, read: false, date: new Date().toISOString() },
        ...s.notifications,
      ],
    }));
  }, []);

  const login = useCallback((email: string, password: string): User | null => {
    let found: User | null = null;
    setState((s) => {
      const match = s.users.find(
        (u) => u.email.toLowerCase() === email.trim().toLowerCase() && u.password === password,
      );
      if (!match) return s;
      if (match.status === 'suspended') return s;
      found = match;
      return { ...s, currentUser: match };
    });
    return found;
  }, []);

  const logout = useCallback(() => {
    setState((s) => ({ ...s, currentUser: null }));
  }, []);

  const createBooking = useCallback(
    (pickup: Place, destination: Place): Booking => {
      const distance = Math.max(0.3, distanceKm(pickup, destination));
      const booking: Booking = {
        id: newId('AYAB'),
        passengerId: state.currentUser?.id ?? 'guest',
        passengerName: state.currentUser?.name ?? 'Guest',
        pickup,
        destination,
        distance,
        fare: estimateFare(distance),
        status: 'searching',
        createdAt: new Date().toISOString(),
      };
      setState((s) => ({ ...s, bookings: [booking, ...s.bookings] }));
      return booking;
    },
    [state.currentUser],
  );

  const updateBooking = useCallback((bookingId: string, patch: Partial<Booking>) => {
    setState((s) => ({
      ...s,
      bookings: s.bookings.map((b) => (b.id === bookingId ? { ...b, ...patch } : b)),
    }));
  }, []);

  const cancelBooking = useCallback(
    (bookingId: string) => updateBooking(bookingId, { status: 'cancelled' as BookingStatus }),
    [updateBooking],
  );

  const acceptBooking = useCallback(
    (bookingId: string, driverId: string) => {
      updateBooking(bookingId, { status: 'accepted', driverId });
      const booking = state.bookings.find((b) => b.id === bookingId);
      const driver = state.drivers.find((d) => d.id === driverId);
      if (booking && driver) {
        pushNotification(booking.passengerId, `${driver.name} accepted your trip request.`);
      }
    },
    [state.bookings, state.drivers, updateBooking, pushNotification],
  );

  const verifyBooking = useCallback(
    (bookingId: string) => updateBooking(bookingId, { status: 'verified' }),
    [updateBooking],
  );

  const startTrip = useCallback(
    (bookingId: string) => updateBooking(bookingId, { status: 'started' }),
    [updateBooking],
  );

  const completeTrip = useCallback(
    (bookingId: string) => {
      updateBooking(bookingId, { status: 'completed' });
      const booking = state.bookings.find((b) => b.id === bookingId);
      if (booking) {
        setState((s) => ({
          ...s,
          drivers: s.drivers.map((d) =>
            d.id === booking.driverId ? { ...d, completedTrips: d.completedTrips + 1 } : d,
          ),
        }));
        pushNotification(booking.passengerId, 'Trip completed. Thanks for riding with AYAB!');
      }
    },
    [state.bookings, updateBooking, pushNotification],
  );

  const rateBooking = useCallback(
    (bookingId: string, rating: number, review: string) => {
      updateBooking(bookingId, { rating, review });
      const booking = state.bookings.find((b) => b.id === bookingId);
      if (!booking?.driverId) return;
      setState((s) => ({
        ...s,
        drivers: s.drivers.map((d) => {
          if (d.id !== booking.driverId) return d;
          const rated = s.bookings.filter((b) => b.driverId === d.id && b.rating);
          const total = rated.reduce((sum, b) => sum + (b.rating ?? 0), 0) + rating;
          const avg = total / (rated.length + 1);
          return { ...d, rating: Math.round(avg * 10) / 10 };
        }),
      }));
    },
    [state.bookings, updateBooking],
  );

  const toggleDriverOnline = useCallback((driverId: string) => {
    setState((s) => ({
      ...s,
      drivers: s.drivers.map((d) => (d.id === driverId ? { ...d, online: !d.online } : d)),
    }));
  }, []);

  const setDriverVerified = useCallback((driverId: string, verified: boolean) => {
    setState((s) => ({
      ...s,
      drivers: s.drivers.map((d) => (d.id === driverId ? { ...d, verified } : d)),
    }));
  }, []);

  const setUserStatus = useCallback((userId: string, status: User['status']) => {
    setState((s) => ({
      ...s,
      users: s.users.map((u) => (u.id === userId ? { ...u, status } : u)),
      drivers: s.drivers.map((d) => (d.id === userId ? { ...d, status } : d)),
    }));
  }, []);

  const updateIncidentStatus = useCallback((incidentId: string, status: IncidentStatus, notes: string) => {
    setState((s) => ({
      ...s,
      incidents: s.incidents.map((i) => (i.id === incidentId ? { ...i, status, notes } : i)),
    }));
  }, []);

  const addAnnouncement = useCallback((title: string, body: string) => {
    setState((s) => ({
      ...s,
      announcements: [
        { id: newId('AN'), title, body, published: true, date: new Date().toISOString().slice(0, 10) },
        ...s.announcements,
      ],
    }));
  }, []);

  const toggleAnnouncementPublished = useCallback((id: string) => {
    setState((s) => ({
      ...s,
      announcements: s.announcements.map((a) => (a.id === id ? { ...a, published: !a.published } : a)),
    }));
  }, []);

  const deleteAnnouncement = useCallback((id: string) => {
    setState((s) => ({ ...s, announcements: s.announcements.filter((a) => a.id !== id) }));
  }, []);

  const markNotificationRead = useCallback((id: string) => {
    setState((s) => ({
      ...s,
      notifications: s.notifications.map((n) => (n.id === id ? { ...n, read: true } : n)),
    }));
  }, []);

  const markAllNotificationsRead = useCallback((userId: string) => {
    setState((s) => ({
      ...s,
      notifications: s.notifications.map((n) => (n.userId === userId ? { ...n, read: true } : n)),
    }));
  }, []);

  const resetDemoData = useCallback(() => {
    clearAllAyabData();
    setState({ ...SEED, mounted: true, currentUser: null });
  }, []);

  const value = useMemo<AppContextValue>(
    () => ({
      ...state,
      login,
      logout,
      createBooking,
      cancelBooking,
      acceptBooking,
      verifyBooking,
      startTrip,
      completeTrip,
      rateBooking,
      toggleDriverOnline,
      setDriverVerified,
      setUserStatus,
      updateIncidentStatus,
      addAnnouncement,
      toggleAnnouncementPublished,
      deleteAnnouncement,
      markNotificationRead,
      markAllNotificationsRead,
      resetDemoData,
    }),
    [
      state,
      login,
      logout,
      createBooking,
      cancelBooking,
      acceptBooking,
      verifyBooking,
      startTrip,
      completeTrip,
      rateBooking,
      toggleDriverOnline,
      setDriverVerified,
      setUserStatus,
      updateIncidentStatus,
      addAnnouncement,
      toggleAnnouncementPublished,
      deleteAnnouncement,
      markNotificationRead,
      markAllNotificationsRead,
      resetDemoData,
    ],
  );

  return <AppContext.Provider value={value}>{children}</AppContext.Provider>;
}

export function useApp(): AppContextValue {
  const ctx = useContext(AppContext);
  if (!ctx) throw new Error('useApp must be used within AppProvider');
  return ctx;
}
