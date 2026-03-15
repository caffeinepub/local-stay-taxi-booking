import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Skeleton } from "@/components/ui/skeleton";
import { Textarea } from "@/components/ui/textarea";
import { ArrowRight, Car, Loader2, MapPin } from "lucide-react";
import { useState } from "react";
import { toast } from "sonner";
import { BookingStatus, BookingType } from "../backend";
import type { TaxiRoute } from "../backend";
import { useGetActiveTaxiRoutes, useSubmitBooking } from "../hooks/useQueries";

function TaxiBookingForm({
  route,
  onClose,
}: { route: TaxiRoute; onClose: () => void }) {
  const submitBooking = useSubmitBooking();
  const [form, setForm] = useState({
    guestName: "",
    email: "",
    phone: "",
    pickupDate: "",
    passengers: "1",
    notes: "",
  });

  const calcTotal = () => {
    if ((route.rateType as string) === "flat") return route.rate;
    return route.estimatedKm ? route.rate * route.estimatedKm : route.rate;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!form.guestName || !form.email || !form.phone || !form.pickupDate) {
      toast.error("Please fill in all required fields.");
      return;
    }
    try {
      await submitBooking.mutateAsync({
        id: crypto.randomUUID(),
        status: BookingStatus.pending,
        createdAt: BigInt(Date.now()),
        guestName: form.guestName,
        email: form.email,
        phone: form.phone,
        notes: form.notes,
        bookingType: BookingType.taxi,
        totalPrice: calcTotal(),
        taxiRouteId: route.id,
        pickupDate: form.pickupDate,
        passengers: BigInt(Number.parseInt(form.passengers) || 1),
      });
      toast.success("Taxi booking submitted! We'll confirm shortly.");
      onClose();
    } catch {
      toast.error("Failed to submit booking. Please try again.");
    }
  };

  return (
    <form
      onSubmit={handleSubmit}
      className="space-y-4"
      data-ocid="taxi-booking.panel"
    >
      <div className="bg-muted rounded-xl p-3 text-sm">
        <p className="font-semibold">
          {route.origin} → {route.destination}
        </p>
        <p className="text-muted-foreground mt-0.5">
          {(route.rateType as string) === "perKm"
            ? `$${route.rate}/km`
            : `$${route.rate} flat rate`}
          {route.estimatedKm ? ` · ~${route.estimatedKm} km` : ""}
        </p>
      </div>
      <div>
        <Label>Full Name *</Label>
        <Input
          value={form.guestName}
          onChange={(e) =>
            setForm((f) => ({ ...f, guestName: e.target.value }))
          }
          placeholder="John Doe"
          required
          data-ocid="taxi-booking.input"
        />
      </div>
      <div>
        <Label>Email *</Label>
        <Input
          type="email"
          value={form.email}
          onChange={(e) => setForm((f) => ({ ...f, email: e.target.value }))}
          placeholder="john@example.com"
          required
          data-ocid="taxi-booking.input"
        />
      </div>
      <div>
        <Label>Phone *</Label>
        <Input
          type="tel"
          value={form.phone}
          onChange={(e) => setForm((f) => ({ ...f, phone: e.target.value }))}
          placeholder="+1 234 567 8900"
          required
          data-ocid="taxi-booking.input"
        />
      </div>
      <div className="grid grid-cols-2 gap-3">
        <div>
          <Label>Pickup Date *</Label>
          <Input
            type="date"
            value={form.pickupDate}
            onChange={(e) =>
              setForm((f) => ({ ...f, pickupDate: e.target.value }))
            }
            required
            data-ocid="taxi-booking.input"
          />
        </div>
        <div>
          <Label>Passengers</Label>
          <Input
            type="number"
            min="1"
            max="8"
            value={form.passengers}
            onChange={(e) =>
              setForm((f) => ({ ...f, passengers: e.target.value }))
            }
            data-ocid="taxi-booking.input"
          />
        </div>
      </div>
      <div>
        <Label>Notes</Label>
        <Textarea
          value={form.notes}
          onChange={(e) => setForm((f) => ({ ...f, notes: e.target.value }))}
          placeholder="Pickup address, special requests..."
          rows={2}
          data-ocid="taxi-booking.textarea"
        />
      </div>
      <div className="bg-muted rounded-xl p-3 flex justify-between text-sm font-semibold">
        <span>Estimated Total</span>
        <span>${calcTotal()}</span>
      </div>
      <div className="flex gap-3">
        <Button
          type="button"
          variant="outline"
          className="flex-1"
          onClick={onClose}
          data-ocid="taxi-booking.cancel_button"
        >
          Cancel
        </Button>
        <Button
          type="submit"
          className="flex-1"
          disabled={submitBooking.isPending}
          data-ocid="taxi-booking.submit_button"
        >
          {submitBooking.isPending ? (
            <>
              <Loader2 className="w-4 h-4 mr-2 animate-spin" />
              Booking...
            </>
          ) : (
            "Confirm Booking"
          )}
        </Button>
      </div>
    </form>
  );
}

function TaxiRouteCard({ route, index }: { route: TaxiRoute; index: number }) {
  const [open, setOpen] = useState(false);
  const isPerKm = (route.rateType as string) === "perKm";
  return (
    <div
      className="bg-card rounded-2xl p-5 shadow-card listing-card-hover"
      data-ocid={`taxi.item.${index + 1}`}
    >
      <div className="flex items-start justify-between mb-4">
        <div className="flex items-center gap-3">
          <div className="w-11 h-11 rounded-full bg-primary/10 flex items-center justify-center shrink-0">
            <Car className="w-5 h-5 text-primary" />
          </div>
          <div>
            <Badge variant="secondary" className="text-xs mb-1">
              {isPerKm ? "Per Km" : "Flat Rate"}
            </Badge>
            <p className="font-semibold">{route.origin}</p>
          </div>
        </div>
        <div className="text-right">
          <p className="text-primary font-bold text-2xl">
            ${route.rate}
            {isPerKm ? "/km" : ""}
          </p>
          {isPerKm && route.estimatedKm && (
            <p className="text-xs text-muted-foreground">
              {route.estimatedKm} km est.
            </p>
          )}
        </div>
      </div>
      <div className="flex items-center gap-2 text-muted-foreground text-sm mb-4">
        <MapPin className="w-3.5 h-3.5 shrink-0" />
        <span>{route.origin}</span>
        <ArrowRight className="w-3.5 h-3.5 shrink-0" />
        <MapPin className="w-3.5 h-3.5 shrink-0" />
        <span>{route.destination}</span>
      </div>
      {isPerKm && route.estimatedKm && (
        <div className="bg-muted rounded-lg p-2 text-xs text-muted-foreground mb-4">
          Estimated total: ${(route.rate * route.estimatedKm).toFixed(2)}
        </div>
      )}
      <Dialog open={open} onOpenChange={setOpen}>
        <DialogTrigger asChild>
          <Button className="w-full" data-ocid={`taxi.item.${index + 1}`}>
            Book This Route
          </Button>
        </DialogTrigger>
        <DialogContent className="max-w-md" data-ocid="taxi-booking.dialog">
          <DialogHeader>
            <DialogTitle className="font-display text-xl">
              Book Taxi
            </DialogTitle>
          </DialogHeader>
          <TaxiBookingForm route={route} onClose={() => setOpen(false)} />
        </DialogContent>
      </Dialog>
    </div>
  );
}

export default function TaxisPage() {
  const { data: routes, isLoading } = useGetActiveTaxiRoutes();

  return (
    <div className="container mx-auto px-4 py-10">
      <div className="mb-8">
        <p className="text-primary font-semibold text-sm uppercase tracking-widest mb-1">
          On-demand
        </p>
        <h1 className="font-display text-4xl md:text-5xl font-bold">
          Taxi Services
        </h1>
        <p className="text-muted-foreground mt-2 max-w-xl">
          Reliable local taxi services with transparent pricing. Book directly
          and we'll confirm your ride.
        </p>
      </div>

      {isLoading ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {[1, 2, 3].map((i) => (
            <Skeleton
              key={i}
              className="h-52 rounded-2xl"
              data-ocid="taxis.loading_state"
            />
          ))}
        </div>
      ) : routes && routes.length > 0 ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {routes.map((route, i) => (
            <TaxiRouteCard key={route.id} route={route} index={i} />
          ))}
        </div>
      ) : (
        <div className="text-center py-20" data-ocid="taxis.empty_state">
          <div className="text-6xl mb-4">🚕</div>
          <h3 className="font-display text-2xl font-semibold mb-2">
            No taxi routes yet
          </h3>
          <p className="text-muted-foreground">
            Taxi routes will appear here once the admin adds them.
          </p>
        </div>
      )}
    </div>
  );
}
