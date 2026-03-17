# Stay Easy

## Current State
Full-stack booking platform with Hotels, Taxi, Restaurant features. Listing type has: id, name, listingType, description, amenities, pricePerNight, location, photos, isActive. No contact phone field exists.

## Requested Changes (Diff)

### Add
- `contactPhone` optional field to Listing type (backend + frontend types)
- Phone input field in Admin listing form
- Call button (tel: link) and WhatsApp button (wa.me link) on hotel/homestay listing cards (StaysPage, HomePage featured stays)
- Call/WhatsApp buttons on ListingDetailPage

### Modify
- `src/backend/main.mo` Listing type: add `contactPhone : ?Text`
- `src/frontend/src/backend.d.ts` Listing interface: add `contactPhone?: string`
- AdminPage ListingFormDialog: add contactPhone input
- StaysPage ListingCard: show Call + WhatsApp buttons if contactPhone set
- ListingDetailPage: show Call + WhatsApp buttons if contactPhone set
- HomePage featured stay cards: show Call button if contactPhone set

### Remove
- Nothing removed

## Implementation Plan
1. Update Listing type in main.mo with contactPhone optional field
2. Update backend.d.ts Listing interface
3. Update AdminPage: add contactPhone input to listing form, pass it in payload
4. Update StaysPage ListingCard: add Call + WhatsApp buttons
5. Update ListingDetailPage: add Call + WhatsApp buttons below amenities
6. Update HomePage featured stays: add Call button
