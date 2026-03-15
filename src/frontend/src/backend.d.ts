import type { Principal } from "@icp-sdk/core/principal";
export interface Some<T> {
    __kind__: "Some";
    value: T;
}
export interface None {
    __kind__: "None";
}
export type Option<T> = Some<T> | None;
export class ExternalBlob {
    getBytes(): Promise<Uint8Array<ArrayBuffer>>;
    getDirectURL(): string;
    static fromURL(url: string): ExternalBlob;
    static fromBytes(blob: Uint8Array<ArrayBuffer>): ExternalBlob;
    withUploadProgress(onProgress: (percentage: number) => void): ExternalBlob;
}
export interface TaxiRoute {
    id: string;
    destination: string;
    origin: string;
    rate: number;
    isActive: boolean;
    estimatedKm?: number;
    rateType: TaxiRateType;
}
export interface Listing {
    id: string;
    pricePerNight: number;
    name: string;
    description: string;
    amenities: Array<string>;
    isActive: boolean;
    listingType: ListingType;
    location: string;
    photos: Array<ExternalBlob>;
}
export interface Booking {
    id: string;
    status: BookingStatus;
    checkIn?: string;
    listingId?: string;
    createdAt: bigint;
    guestName: string;
    passengers?: bigint;
    email: string;
    pickupDate?: string;
    notes: string;
    bookingType: BookingType;
    checkOut?: string;
    phone: string;
    totalPrice: number;
    taxiRouteId?: string;
}
export interface UserProfile {
    name: string;
}
export enum BookingStatus {
    cancelled = "cancelled",
    pending = "pending",
    confirmed = "confirmed"
}
export enum BookingType {
    listing = "listing",
    taxi = "taxi"
}
export enum ListingType {
    hotel = "hotel",
    homestay = "homestay"
}
export enum TaxiRateType {
    flat = "flat",
    perKm = "perKm"
}
export enum UserRole {
    admin = "admin",
    user = "user",
    guest = "guest"
}
export interface backendInterface {
    assignCallerUserRole(user: Principal, role: UserRole): Promise<void>;
    createListing(listing: Listing): Promise<Listing>;
    createTaxiRoute(route: TaxiRoute): Promise<TaxiRoute>;
    deleteBooking(id: string): Promise<void>;
    deleteListing(id: string): Promise<void>;
    deleteTaxiRoute(id: string): Promise<void>;
    getActiveListings(): Promise<Array<Listing>>;
    getActiveTaxiRoutes(): Promise<Array<TaxiRoute>>;
    getAllBookings(): Promise<Array<Booking>>;
    getCallerUserProfile(): Promise<UserProfile | null>;
    getCallerUserRole(): Promise<UserRole>;
    getListing(id: string): Promise<Listing>;
    getTaxiRoute(id: string): Promise<TaxiRoute>;
    getUserProfile(user: Principal): Promise<UserProfile | null>;
    isCallerAdmin(): Promise<boolean>;
    saveCallerUserProfile(profile: UserProfile): Promise<void>;
    submitBooking(booking: Booking): Promise<Booking>;
    updateBookingStatus(id: string, status: BookingStatus): Promise<Booking>;
    updateListing(id: string, listing: Listing): Promise<Listing>;
    updateTaxiRoute(id: string, route: TaxiRoute): Promise<TaxiRoute>;
}
