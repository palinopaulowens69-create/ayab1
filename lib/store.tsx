// Ito ang central app state at actions para sa login, bookings, drivers, incidents, anunsyo, at notifications.
'use client';

import React, { createContext, useCallback, useContext, useEffect, useMemo, useRef, useState } from 'react';
import { ANNOUNCEMENTS, BOOKINGS, DRIVERS, INCIDENTS, PLACES, USERS } from './mock-data';
import { clearAllAyabData, loadItem, saveItem } from './storage';
import { distanceKm, estimateFareForCategory, newId } from './utils';
import type {
  Announcement,
  AppNotification,
  Booking,
  BookingStatus,
  Driver,
  FareCategory,
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
  updateUserProfile: (userId: string, profile: Partial<Pick<User, 'name' | 'phone'>>) => void;
  createBooking: (
    pickup: Place,
    destination: Place,
    fareCategory: FareCategory,
    specialFare?: number,
    passengerCount?: number,
  ) => Booking;
  updateBooking: (bookingId: string, patch: Partial<Booking>) => void;
  cancelBooking: (bookingId: string) => void;
  acceptBooking: (bookingId: string, driverId: string) => void;
  declineBooking: (bookingId: string) => void;
  verifyBooking: (bookingId: string) => void;
  startTrip: (bookingId: string) => void;
  completeTrip: (bookingId: string) => void;
  rateBooking: (bookingId: string, rating: number, review: string) => void;
  toggleDriverOnline: (driverId: string) => void;
  updateDriverLocation: (driverId: string, lat: number, lng: number) => void;
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

// Tumatanggap ng children, naglo-load at nagsi-save ng app state, at nagbibigay ng data at actions sa mga child component.
export function AppProvider({ children }: { children: React.ReactNode }) {
  const [state, setState] = useState<AppState>(SEED);
  const hydrated = useRef(false);

  // Hydrate from localStorage once, after mount, so server and first client
  // render match (avoids hydration warnings), then swap in saved data.
  useEffect(() => {
    if (hydrated.current) return;
    hydrated.current = true;
    const savedAnnouncements = loadItem('announcements', ANNOUNCEMENTS);
    const savedBookings = loadItem('bookings', BOOKINGS).map((booking) => ({
      ...booking,
      pickup:
        booking.pickup.id === 'p1' && booking.pickup.lat === 17.603 && booking.pickup.lng === 121.718
          ? PLACES[0]
          : booking.pickup,
      destination:
        booking.destination.id === 'p3' && booking.destination.lat === 17.610 && booking.destination.lng === 121.722
          ? PLACES[2]
          : booking.destination,
    }));
    setState({
      mounted: true,
      currentUser: loadItem('currentUser', null as User | null),
      users: loadItem('users', USERS),
      drivers: loadItem('drivers', DRIVERS),
      bookings: savedBookings,
      incidents: loadItem('incidents', INCIDENTS),
      announcements: savedAnnouncements.map((announcement) =>
        announcement.id === 'an1'
          ? { ...announcement, body: 'Maysa nga Ayab, May Tricy Agad' }
          : announcement,
      ),
      notifications: loadItem('notifications', [] as AppNotification[]),
    });
  }, []);

  // Keep tabs in sync: if another tab (e.g. a driver logged in alongside a
  // commuter) writes to localStorage, reflect that change here too.
  useEffect(() => {
    // Tumatanggap ng browser storage event at ina-update ang katumbas na state slice kapag may pagbabago mula sa ibang tab.
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

  // Tumatanggap ng user ID at message; nagdadagdag ng bagong unread notification na may oras at ID.
  const pushNotification = useCallback((userId: string, message: string) => {
    setState((s) => ({
      ...s,
      notifications: [
        { id: newId('N'), userId, message, read: false, date: new Date().toISOString() },
        ...s.notifications,
      ],
    }));
  }, []);

  // Tumatanggap ng email at password; ibinabalik ang aktibong user kapag match ang credentials, o null kung hindi puwedeng mag-login.
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

  // Walang input o return value; nililinis ang kasalukuyang signed-in user.
  const logout = useCallback(() => {
    setState((s) => ({ ...s, currentUser: null }));
  }, []);

  // Tumatanggap ng user ID at bagong pangalan o phone; ina-update ang katugmang user at driver profile.
  const updateUserProfile = useCallback((userId: string, profile: Partial<Pick<User, 'name' | 'phone'>>) => {
    setState((s) => ({
      ...s,
      users: s.users.map((user) => user.id === userId ? { ...user, ...profile } : user),
      drivers: s.drivers.map((driver) => driver.id === userId ? { ...driver, ...profile } : driver),
    }));
  }, []);

  // Tumatanggap ng pickup, destination, at fare category; gumagawa at nagbabalik ng bagong booking na may distansya at pamasahe.
  const createBooking = useCallback(
    (
      pickup: Place,
      destination: Place,
      fareCategory: FareCategory,
      specialFare?: number,
      passengerCount = 1,
    ): Booking => {
      const normalizedPassengerCount = Number.isFinite(passengerCount) ? Math.max(1, Math.floor(passengerCount)) : 1;
      const distance = Math.max(0.3, distanceKm(pickup, destination));
      const baseFare = estimateFareForCategory(destination, fareCategory === 'special' ? 'regular' : fareCategory);
      const minimumFare = baseFare * normalizedPassengerCount;
      if (specialFare !== undefined && (!Number.isFinite(specialFare) || specialFare < minimumFare)) {
        throw new RangeError(`Special ride fare must be at least ${minimumFare}.`);
      }
      const now = new Date();
      const autoAssignedDriver = state.drivers.find((driver) => driver.online && driver.verified);
      const booking: Booking = {
        id: newId('AYAB'),
        passengerId: state.currentUser?.id ?? 'guest',
        passengerName: state.currentUser?.name ?? 'Guest',
        pickup,
        destination,
        distance,
        fare: specialFare ?? minimumFare,
        fareCategory,
        passengerCount: normalizedPassengerCount,
        ...(specialFare !== undefined && { specialRide: true, fareOffer: specialFare }),
        status: autoAssignedDriver ? 'accepted' : 'searching',
        driverId: autoAssignedDriver?.id,
        paymentStatus: 'pending_payment',
        createdAt: now.toISOString(),
        updatedAt: now.toISOString(),
        driverResponseDeadline: autoAssignedDriver ? undefined : new Date(now.getTime() + 60_000).toISOString(),
      };
      setState((s) => ({ ...s, bookings: [booking, ...s.bookings] }));
      return booking;
    },
    [state.currentUser, state.drivers],
  );

  // Tumatanggap ng booking ID at partial na pagbabago; ina-update lang ang katugmang booking sa state.
  const updateBooking = useCallback((bookingId: string, patch: Partial<Booking>) => {
    setState((s) => ({
      ...s,
      bookings: s.bookings.map((b) =>
        b.id === bookingId ? { ...b, ...patch, updatedAt: new Date().toISOString() } : b,
      ),
    }));
  }, []);

  // Tumatanggap ng booking ID at itinatakda ang status nito sa cancelled.
  const cancelBooking = useCallback((bookingId: string) => {
    setState((s) => ({
      ...s,
      bookings: s.bookings.map((b) => {
        if (b.id !== bookingId) return b;
        if (b.status !== 'verified' || !b.cancellationDeadline || new Date(b.cancellationDeadline).getTime() <= Date.now()) return b;
        return {
          ...b,
          status: 'cancelled' as BookingStatus,
          paymentStatus: b.paymentStatus === 'paid' ? 'refund_pending' : b.paymentStatus,
          cancellationDeadline: undefined,
          updatedAt: new Date().toISOString(),
        };
      }),
    }));
  }, []);

  // Tumatanggap ng booking ID at driver ID; itinatakda ang driver at status, saka nagno-notify sa commuter.
  const acceptBooking = useCallback(
    (bookingId: string, driverId: string) => {
      const booking = state.bookings.find((b) => b.id === bookingId);
      if (!booking || booking.status !== 'searching') return;
      updateBooking(bookingId, {
        status: 'accepted',
        driverId,
        paymentStatus: 'pending_payment',
      });
      const driver = state.drivers.find((d) => d.id === driverId);
      if (booking && driver) {
        pushNotification(booking.passengerId, `${driver.name} accepted your trip request.`);
      }
    },
    [state.bookings, state.drivers, updateBooking, pushNotification],
  );

  // Tumatanggap ng booking ID at itinatakda ang status nito sa declined ng driver.
  const declineBooking = useCallback(
    (bookingId: string) => {
      const booking = state.bookings.find((b) => b.id === bookingId);
      if (!booking || booking.status !== 'searching') return;
      updateBooking(bookingId, { status: 'declined' as BookingStatus, paymentStatus: 'payment_failed' });
      if (booking.passengerId) {
        pushNotification(booking.passengerId, 'A driver declined your trip request. Please try another request.');
      }
    },
    [state.bookings, updateBooking, pushNotification],
  );

  // Tumatanggap ng booking ID at inililipat ang booking sa verified status.
  const verifyBooking = useCallback(
    (bookingId: string) => {
      const booking = state.bookings.find((b) => b.id === bookingId);
      if (!booking || booking.status !== 'accepted') return;
      const now = new Date();
      updateBooking(bookingId, {
        status: 'verified',
        paymentStatus: 'paid',
        paymentCompletedAt: now.toISOString(),
        cancellationDeadline: new Date(now.getTime() + 60_000).toISOString(),
      });
    },
    [state.bookings, updateBooking],
  );

  // Tumatanggap ng booking ID at inililipat ang booking sa started status.
  const startTrip = useCallback(
    (bookingId: string) => {
      const booking = state.bookings.find((b) => b.id === bookingId);
      if (!booking || booking.status !== 'confirmed') return;
      updateBooking(bookingId, { status: 'started', cancellationDeadline: undefined });
    },
    [state.bookings, updateBooking],
  );

  // Tumatanggap ng booking ID; tinatapos ang booking, dinadagdagan ang completed trip count ng driver, at nagpapadala ng notification.
  const completeTrip = useCallback(
    (bookingId: string) => {
      const booking = state.bookings.find((b) => b.id === bookingId);
      if (!booking || booking.status !== 'started') return;
      updateBooking(bookingId, { status: 'completed' });
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

  // Tumatanggap ng booking ID, rating, at review; sine-save ang feedback at kinukuwenta ulit ang average rating ng driver.
  const rateBooking = useCallback(
    (bookingId: string, rating: number, review: string) => {
      const booking = state.bookings.find((b) => b.id === bookingId);
      if (!booking || booking.status !== 'completed' || booking.rating !== undefined) return;
      updateBooking(bookingId, { rating, review });
      if (!booking.driverId) return;
      setState((s) => ({
        ...s,
        drivers: s.drivers.map((d) => {
          if (d.id !== booking.driverId) return d;
          // Isinasama ang bagong rating sa mga na-save na rating para makuha ang bagong average ng driver.
          const rated = s.bookings.filter((b) => b.driverId === d.id && b.rating);
          const total = rated.reduce((sum, b) => sum + (b.rating ?? 0), 0) + rating;
          const avg = total / (rated.length + 1);
          return { ...d, rating: Math.round(avg * 10) / 10 };
        }),
      }));
    },
    [state.bookings, updateBooking],
  );

  useEffect(() => {
    if (!state.mounted) return;
    const tick = window.setInterval(() => {
      const now = Date.now();
      setState((s) => ({
        ...s,
        bookings: s.bookings.map((booking) => {
          if (booking.status === 'searching' && booking.driverResponseDeadline) {
            const expiresAt = new Date(booking.driverResponseDeadline).getTime();
            if (expiresAt <= now) {
              return { ...booking, status: 'expired' as BookingStatus, updatedAt: new Date().toISOString() };
            }
          }
          if (booking.status === 'verified' && booking.cancellationDeadline) {
            const expiresAt = new Date(booking.cancellationDeadline).getTime();
            if (expiresAt <= now) {
              return { ...booking, status: 'confirmed' as BookingStatus, updatedAt: new Date().toISOString() };
            }
          }
          return booking;
        }),
      }));
    }, 1000);
    return () => window.clearInterval(tick);
  }, [state.mounted]);

  // Tumatanggap ng driver ID at binabaligtad ang online status ng driver na iyon.
  const toggleDriverOnline = useCallback((driverId: string) => {
    setState((s) => ({
      ...s,
      drivers: s.drivers.map((d) => (d.id === driverId ? { ...d, online: !d.online } : d)),
    }));
  }, []);

  // Tumatanggap ng driver ID at coordinates; ina-update ang lokasyon at oras ng huling update.
  const updateDriverLocation = useCallback((driverId: string, lat: number, lng: number) => {
    setState((s) => ({
      ...s,
      drivers: s.drivers.map((d) =>
        d.id === driverId ? { ...d, lat, lng, locationUpdatedAt: new Date().toISOString() } : d,
      ),
    }));
  }, []);

  // Tumatanggap ng driver ID at boolean; ina-update ang verification status ng driver.
  const setDriverVerified = useCallback((driverId: string, verified: boolean) => {
    setState((s) => ({
      ...s,
      drivers: s.drivers.map((d) => (d.id === driverId ? { ...d, verified } : d)),
    }));
  }, []);

  // Tumatanggap ng user ID at account status; ina-update ang user at katugmang driver record.
  const setUserStatus = useCallback((userId: string, status: User['status']) => {
    setState((s) => ({
      ...s,
      users: s.users.map((u) => (u.id === userId ? { ...u, status } : u)),
      drivers: s.drivers.map((d) => (d.id === userId ? { ...d, status } : d)),
    }));
  }, []);

  // Tumatanggap ng incident ID, bagong status, at notes; ina-update ang incident na iyon.
  const updateIncidentStatus = useCallback((incidentId: string, status: IncidentStatus, notes: string) => {
    setState((s) => ({
      ...s,
      incidents: s.incidents.map((i) => (i.id === incidentId ? { ...i, status, notes } : i)),
    }));
  }, []);

  // Tumatanggap ng title at body; gumagawa ng published announcement na may bagong ID at petsa.
  const addAnnouncement = useCallback((title: string, body: string) => {
    setState((s) => ({
      ...s,
      announcements: [
        { id: newId('AN'), title, body, published: true, date: new Date().toISOString().slice(0, 10) },
        ...s.announcements,
      ],
    }));
  }, []);

  // Tumatanggap ng announcement ID at binabaligtad ang published flag nito.
  const toggleAnnouncementPublished = useCallback((id: string) => {
    setState((s) => ({
      ...s,
      announcements: s.announcements.map((a) => (a.id === id ? { ...a, published: !a.published } : a)),
    }));
  }, []);

  // Tumatanggap ng announcement ID at inaalis ang announcement na iyon sa listahan.
  const deleteAnnouncement = useCallback((id: string) => {
    setState((s) => ({ ...s, announcements: s.announcements.filter((a) => a.id !== id) }));
  }, []);

  // Tumatanggap ng notification ID at minamarkahan itong nabasa.
  const markNotificationRead = useCallback((id: string) => {
    setState((s) => ({
      ...s,
      notifications: s.notifications.map((n) => (n.id === id ? { ...n, read: true } : n)),
    }));
  }, []);

  // Tumatanggap ng user ID at minamarkahang nabasa ang lahat ng notification ng user na iyon.
  const markAllNotificationsRead = useCallback((userId: string) => {
    setState((s) => ({
      ...s,
      notifications: s.notifications.map((n) => (n.userId === userId ? { ...n, read: true } : n)),
    }));
  }, []);

  // Walang input; nililinis ang saved AYAB data at ibinabalik ang app sa seeded demo state.
  const resetDemoData = useCallback(() => {
    clearAllAyabData();
    setState({ ...SEED, mounted: true, currentUser: null });
  }, []);

  const value = useMemo<AppContextValue>(
    () => ({
      ...state,
      login,
      logout,
      updateUserProfile,
      createBooking,
      updateBooking,
      cancelBooking,
      acceptBooking,
      declineBooking,
      verifyBooking,
      startTrip,
      completeTrip,
      rateBooking,
      toggleDriverOnline,
      updateDriverLocation,
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
      updateUserProfile,
      createBooking,
      updateBooking,
      cancelBooking,
      acceptBooking,
      declineBooking,
      verifyBooking,
      startTrip,
      completeTrip,
      rateBooking,
      toggleDriverOnline,
      updateDriverLocation,
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

// Walang input; ibinabalik ang app context at naghahagis ng error kung wala ito sa loob ng AppProvider.
export function useApp(): AppContextValue {
  const ctx = useContext(AppContext);
  if (!ctx) throw new Error('useApp must be used within AppProvider');
  return ctx;
}
