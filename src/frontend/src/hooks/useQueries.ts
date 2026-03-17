import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import type { Booking, BookingStatus, Listing, TaxiRoute } from "../backend";
import { useActor } from "./useActor";

export function useGetActiveListings() {
  const { actor, isFetching } = useActor();
  return useQuery<Listing[]>({
    queryKey: ["activeListings"],
    queryFn: async () => {
      if (!actor) return [];
      return actor.getActiveListings();
    },
    enabled: !!actor && !isFetching,
  });
}

export function useGetActiveTaxiRoutes() {
  const { actor, isFetching } = useActor();
  return useQuery<TaxiRoute[]>({
    queryKey: ["activeTaxiRoutes"],
    queryFn: async () => {
      if (!actor) return [];
      return actor.getActiveTaxiRoutes();
    },
    enabled: !!actor && !isFetching,
  });
}

export function useGetListing(id: string) {
  const { actor, isFetching } = useActor();
  return useQuery<Listing>({
    queryKey: ["listing", id],
    queryFn: async () => {
      if (!actor) throw new Error("Actor not available");
      return actor.getListing(id);
    },
    enabled: !!actor && !isFetching && !!id,
  });
}

export function useGetAllBookings() {
  const { actor, isFetching } = useActor();
  return useQuery<Booking[]>({
    queryKey: ["allBookings"],
    queryFn: async () => {
      if (!actor) return [];
      return actor.getAllBookings();
    },
    enabled: !!actor && !isFetching,
  });
}

export function useGetBookingsByPhone(phone: string) {
  const { actor, isFetching } = useActor();
  return useQuery<Booking[]>({
    queryKey: ["bookingsByPhone", phone],
    queryFn: async () => {
      if (!actor || !phone) return [];
      // biome-ignore lint/suspicious/noExplicitAny: getBookingsByPhone may not be in generated types
      return (actor as any).getBookingsByPhone(phone);
    },
    enabled: !!actor && !isFetching && phone.length >= 10,
  });
}

export function useIsCallerAdmin() {
  const { actor, isFetching } = useActor();
  return useQuery<boolean>({
    queryKey: ["isCallerAdmin"],
    queryFn: async () => {
      if (!actor) return false;
      return actor.isCallerAdmin();
    },
    enabled: !!actor && !isFetching,
  });
}

export function useClaimFirstAdmin() {
  const { actor } = useActor();
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async () => {
      if (!actor) throw new Error("Actor not available");
      return actor.claimFirstAdmin();
    },
    onSuccess: () => qc.invalidateQueries({ queryKey: ["isCallerAdmin"] }),
  });
}

export function useSubmitBooking() {
  const { actor } = useActor();
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async (booking: Booking) => {
      if (!actor) throw new Error("Actor not available");
      return actor.submitBooking(booking);
    },
    onSuccess: () => qc.invalidateQueries({ queryKey: ["allBookings"] }),
  });
}

export function useCreateListing() {
  const { actor } = useActor();
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async (listing: Listing) => {
      if (!actor) throw new Error("Actor not available");
      return actor.createListing(listing);
    },
    onSuccess: () => qc.invalidateQueries({ queryKey: ["activeListings"] }),
  });
}

export function useUpdateListing() {
  const { actor } = useActor();
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async ({ id, listing }: { id: string; listing: Listing }) => {
      if (!actor) throw new Error("Actor not available");
      return actor.updateListing(id, listing);
    },
    onSuccess: () => qc.invalidateQueries({ queryKey: ["activeListings"] }),
  });
}

export function useDeleteListing() {
  const { actor } = useActor();
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async (id: string) => {
      if (!actor) throw new Error("Actor not available");
      return actor.deleteListing(id);
    },
    onSuccess: () => qc.invalidateQueries({ queryKey: ["activeListings"] }),
  });
}

export function useCreateTaxiRoute() {
  const { actor } = useActor();
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async (route: TaxiRoute) => {
      if (!actor) throw new Error("Actor not available");
      return actor.createTaxiRoute(route);
    },
    onSuccess: () => qc.invalidateQueries({ queryKey: ["activeTaxiRoutes"] }),
  });
}

export function useUpdateTaxiRoute() {
  const { actor } = useActor();
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async ({ id, route }: { id: string; route: TaxiRoute }) => {
      if (!actor) throw new Error("Actor not available");
      return actor.updateTaxiRoute(id, route);
    },
    onSuccess: () => qc.invalidateQueries({ queryKey: ["activeTaxiRoutes"] }),
  });
}

export function useDeleteTaxiRoute() {
  const { actor } = useActor();
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async (id: string) => {
      if (!actor) throw new Error("Actor not available");
      return actor.deleteTaxiRoute(id);
    },
    onSuccess: () => qc.invalidateQueries({ queryKey: ["activeTaxiRoutes"] }),
  });
}

export function useUpdateBookingStatus() {
  const { actor } = useActor();
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async ({
      id,
      status,
    }: { id: string; status: BookingStatus }) => {
      if (!actor) throw new Error("Actor not available");
      return actor.updateBookingStatus(id, status);
    },
    onSuccess: () => qc.invalidateQueries({ queryKey: ["allBookings"] }),
  });
}

export function useDeleteBooking() {
  const { actor } = useActor();
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async (id: string) => {
      if (!actor) throw new Error("Actor not available");
      return actor.deleteBooking(id);
    },
    onSuccess: () => qc.invalidateQueries({ queryKey: ["allBookings"] }),
  });
}

export function useGetAllListingPhones() {
  const { actor, isFetching } = useActor();
  return useQuery<Array<[string, string]>>({
    queryKey: ["listingPhones"],
    queryFn: async () => {
      if (!actor) return [];
      return (actor as any).getAllListingPhones();
    },
    enabled: !!actor && !isFetching,
  });
}

export function useSetListingPhone() {
  const { actor } = useActor();
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async ({ id, phone }: { id: string; phone: string }) => {
      if (!actor) throw new Error("Actor not available");
      return (actor as any).setListingPhone(id, phone);
    },
    onSuccess: () => qc.invalidateQueries({ queryKey: ["listingPhones"] }),
  });
}
