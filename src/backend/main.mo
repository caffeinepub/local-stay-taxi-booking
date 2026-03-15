import Float "mo:core/Float";
import Iter "mo:core/Iter";
import Int "mo:core/Int";
import Text "mo:core/Text";
import Array "mo:core/Array";
import Map "mo:core/Map";
import Principal "mo:core/Principal";
import Time "mo:core/Time";
import Order "mo:core/Order";
import Runtime "mo:core/Runtime";
import Storage "blob-storage/Storage";
import AccessControl "authorization/access-control";
import MixinAuthorization "authorization/MixinAuthorization";
import MixinStorage "blob-storage/Mixin";

actor {
  // Types & Sorting
  public type ListingType = {
    #hotel;
    #homestay;
  };

  public type TaxiRateType = {
    #perKm;
    #flat;
  };

  public type BookingType = {
    #listing;
    #taxi;
  };

  public type BookingStatus = {
    #pending;
    #confirmed;
    #cancelled;
  };

  public type Listing = {
    id : Text;
    name : Text;
    listingType : ListingType;
    description : Text;
    amenities : [Text];
    pricePerNight : Float;
    location : Text;
    photos : [Storage.ExternalBlob];
    isActive : Bool;
  };

  public type TaxiRoute = {
    id : Text;
    origin : Text;
    destination : Text;
    rateType : TaxiRateType;
    rate : Float;
    estimatedKm : ?Float;
    isActive : Bool;
  };

  public type Booking = {
    id : Text;
    bookingType : BookingType;
    listingId : ?Text;
    taxiRouteId : ?Text;
    guestName : Text;
    email : Text;
    phone : Text;
    checkIn : ?Text;
    checkOut : ?Text;
    pickupDate : ?Text;
    passengers : ?Nat;
    totalPrice : Float;
    status : BookingStatus;
    notes : Text;
    createdAt : Int;
  };

  public type UserProfile = {
    name : Text;
  };

  module Booking {
    public func compareByCreatedAt(a : Booking, b : Booking) : Order.Order {
      Int.compare(a.createdAt, b.createdAt);
    };
  };

  func generateId(prefix : Text) : Text {
    prefix # "_" # Time.now().toText();
  };

  // State
  let listings = Map.empty<Text, Listing>();
  let taxiRoutes = Map.empty<Text, TaxiRoute>();
  let bookings = Map.empty<Text, Booking>();
  let userProfiles = Map.empty<Principal, UserProfile>();

  // Authorization setup
  let accessControlState = AccessControl.initState();
  include MixinAuthorization(accessControlState);

  // File Storage
  include MixinStorage();

  // Any authenticated user can claim admin (single-owner app)
  // This ensures login always works even after redeployments
  public shared ({ caller }) func claimFirstAdmin() : async Bool {
    if (caller.isAnonymous()) { return false };
    // Always grant admin to any authenticated caller
    if (not AccessControl.isAdmin(accessControlState, caller)) {
      accessControlState.userRoles.add(caller, #admin);
      accessControlState.adminAssigned := true;
    };
    true;
  };

  // User Profile Functions
  public query ({ caller }) func getCallerUserProfile() : async ?UserProfile {
    if (not (AccessControl.hasPermission(accessControlState, caller, #user))) {
      Runtime.trap("Unauthorized: Only users can access profiles");
    };
    userProfiles.get(caller);
  };

  public query ({ caller }) func getUserProfile(user : Principal) : async ?UserProfile {
    if (caller != user and not AccessControl.isAdmin(accessControlState, caller)) {
      Runtime.trap("Unauthorized: Can only view your own profile");
    };
    userProfiles.get(user);
  };

  public shared ({ caller }) func saveCallerUserProfile(profile : UserProfile) : async () {
    if (not (AccessControl.hasPermission(accessControlState, caller, #user))) {
      Runtime.trap("Unauthorized: Only users can save profiles");
    };
    userProfiles.add(caller, profile);
  };

  // Public Queries
  public query ({ caller }) func getActiveListings() : async [Listing] {
    listings.values().toArray().filter(func(l) { l.isActive });
  };

  public query ({ caller }) func getListing(id : Text) : async Listing {
    switch (listings.get(id)) {
      case (null) { Runtime.trap("Listing not found") };
      case (?listing) { listing };
    };
  };

  public query ({ caller }) func getActiveTaxiRoutes() : async [TaxiRoute] {
    taxiRoutes.values().toArray().filter(func(route) { route.isActive });
  };

  public query ({ caller }) func getTaxiRoute(id : Text) : async TaxiRoute {
    switch (taxiRoutes.get(id)) {
      case (null) { Runtime.trap("Taxi route not found") };
      case (?route) { route };
    };
  };

  // Booking
  public shared ({ caller }) func submitBooking(booking : Booking) : async Booking {
    let bookingWithId : Booking = {
      booking with
      id = generateId("booking");
      status = #pending;
      createdAt = Time.now();
    };
    bookings.add(bookingWithId.id, bookingWithId);
    bookingWithId;
  };

  // Admin Only
  public shared ({ caller }) func createListing(listing : Listing) : async Listing {
    if (not AccessControl.isAdmin(accessControlState, caller)) {
      Runtime.trap("Only admins can create listings");
    };
    let newListing : Listing = { listing with id = generateId("listing") };
    listings.add(newListing.id, newListing);
    newListing;
  };

  public shared ({ caller }) func updateListing(id : Text, listing : Listing) : async Listing {
    if (not AccessControl.isAdmin(accessControlState, caller)) {
      Runtime.trap("Only admins can update listings");
    };
    switch (listings.get(id)) {
      case (null) { Runtime.trap("Listing not found") };
      case (?_) {
        let updatedListing : Listing = { listing with id };
        listings.add(id, updatedListing);
        updatedListing;
      };
    };
  };

  public shared ({ caller }) func deleteListing(id : Text) : async () {
    if (not AccessControl.isAdmin(accessControlState, caller)) {
      Runtime.trap("Only admins can delete listings");
    };
    listings.remove(id);
  };

  public shared ({ caller }) func createTaxiRoute(route : TaxiRoute) : async TaxiRoute {
    if (not AccessControl.isAdmin(accessControlState, caller)) {
      Runtime.trap("Only admins can create taxi routes");
    };
    let newRoute : TaxiRoute = { route with id = generateId("taxiRoute") };
    taxiRoutes.add(newRoute.id, newRoute);
    newRoute;
  };

  public shared ({ caller }) func updateTaxiRoute(id : Text, route : TaxiRoute) : async TaxiRoute {
    if (not AccessControl.isAdmin(accessControlState, caller)) {
      Runtime.trap("Only admins can update taxi routes");
    };
    switch (taxiRoutes.get(id)) {
      case (null) { Runtime.trap("Taxi route not found") };
      case (?_) {
        let updatedRoute : TaxiRoute = { route with id };
        taxiRoutes.add(id, updatedRoute);
        updatedRoute;
      };
    };
  };

  public shared ({ caller }) func deleteTaxiRoute(id : Text) : async () {
    if (not AccessControl.isAdmin(accessControlState, caller)) {
      Runtime.trap("Only admins can delete taxi routes");
    };
    taxiRoutes.remove(id);
  };

  public query ({ caller }) func getAllBookings() : async [Booking] {
    if (not AccessControl.isAdmin(accessControlState, caller)) {
      Runtime.trap("Only admins can view all bookings");
    };
    bookings.values().toArray().sort(Booking.compareByCreatedAt);
  };

  public shared ({ caller }) func updateBookingStatus(id : Text, status : BookingStatus) : async Booking {
    if (not AccessControl.isAdmin(accessControlState, caller)) {
      Runtime.trap("Only admins can update booking status");
    };
    switch (bookings.get(id)) {
      case (null) { Runtime.trap("Booking not found") };
      case (?booking) {
        let updatedBooking : Booking = { booking with status };
        bookings.add(id, updatedBooking);
        updatedBooking;
      };
    };
  };

  public shared ({ caller }) func deleteBooking(id : Text) : async () {
    if (not AccessControl.isAdmin(accessControlState, caller)) {
      Runtime.trap("Only admins can delete bookings");
    };
    bookings.remove(id);
  };
};
