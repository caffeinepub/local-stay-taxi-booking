# Local Stay & Taxi Booking

## Current State
New project. No existing code.

## Requested Changes (Diff)

### Add
- Homepage with search bar (location, check-in/check-out, guests) and featured listings grid
- Hotel/Homestay listings page with photos, description, amenities list, per-night rate, and booking form
- Taxi/Cab booking section with route selector (origin/destination), per-km or flat-rate pricing, and booking form
- Individual listing detail page with photo gallery, amenities, and inquiry/booking form
- Admin Panel (authenticated) with:
  - Listings manager: add/edit/remove hotel & homestay listings
  - Photo upload/management per listing (blob storage)
  - Room rate management
  - Taxi rate management (routes, per-km/flat)
  - Bookings/inquiries viewer with status management
- Sample seed data: 3 hotels, 2 homestays, 3 taxi routes with placeholder rates

### Modify
- None

### Remove
- None

## Implementation Plan
1. Select `authorization` and `blob-storage` Caffeine components
2. Generate Motoko backend with:
   - Listing CRUD (id, name, type: hotel|homestay, description, amenities, pricePerNight, photos)
   - TaxiRoute CRUD (id, origin, destination, rateType: per-km|flat, rate)
   - Booking CRUD (id, listingId or routeId, guestName, email, phone, dates, status: pending|confirmed|cancelled, notes)
   - Role-based access: admin can write, public can read listings and submit bookings
   - Seed sample data
3. Build frontend:
   - Public: Homepage, Listings page, Listing detail, Taxi booking page
   - Admin: Dashboard, Listings manager, Taxi rates manager, Bookings manager
   - Photo upload wired to blob-storage
   - Search/filter by name, type, price
