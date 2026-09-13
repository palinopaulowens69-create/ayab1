# AYAB — Your Ride. Your way.

A tricycle booking demo for Tuguegarao City, Philippines, covering commuter, driver, and admin flows. This is a full rebuild of the original AYAB concept on **Next.js + React + Tailwind CSS** instead of Ionic/Angular, specifically to avoid the web-component registration issues that broke the previous version in production. Plain React rendering has no such failure mode.

No backend, database, or API key is required — all data is mock data held in React state and mirrored to `localStorage`, including across browser tabs (open a commuter and a driver tab side by side and actions sync live).

## Tech stack
- Next.js 14 (App Router)
- React 18 + TypeScript
- Tailwind CSS
- `qrcode` for on-device QR generation

## Local development
```bash
npm install
npm run dev
```
Visit `http://localhost:3000`.

## Production build
```bash
npm run build
npm start
```

## Deploying to Vercel
This is a standard Next.js app, so Vercel needs **zero configuration**:
1. Push this project to a Git repository.
2. Import it in the Vercel dashboard (Framework Preset: Next.js is auto-detected).
3. Deploy. No environment variables are required.

## Demo accounts
All demo accounts use the password `123456`.
- Commuter: `commuter@ayab.com`
- Driver: `driver@ayab.com`
- Admin: `admin@ayab.com`

## Structure
- `app/` — routes, grouped by role (`commuter/`, `driver/`, `admin/`) plus `login/`
- `components/` — shared UI: page header, bottom tab bar, role guard, step tracker, QR renderer, icon set
- `lib/` — domain types, mock seed data, the central state store (`store.tsx`), and small utilities (fare/distance/formatting)

## Notes
- The map on booking/tracking screens is a stylized offline mock — no map or geocoding API is used, so the app works fully without external network calls at runtime.
- A trip auto-advances through its steps for a smooth solo demo, but the driver-side trip screen also has manual controls, so it works whether you're testing as one role or driving both sides in two tabs.
- Use **Profile → Settings → Reset demo data** (commuter) to clear local state and start fresh.
