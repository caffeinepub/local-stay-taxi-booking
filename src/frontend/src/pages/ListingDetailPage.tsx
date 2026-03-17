import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Skeleton } from "@/components/ui/skeleton";
import { Textarea } from "@/components/ui/textarea";
import { Link, useParams } from "@tanstack/react-router";
import {
  CheckCircle,
  ChevronLeft,
  ChevronRight,
  Copy,
  Loader2,
  MapPin,
  MessageCircle,
  Phone,
} from "lucide-react";
import { useState } from "react";
import { toast } from "sonner";
import { BookingStatus, BookingType } from "../backend";
import {
  useGetAllListingPhones,
  useGetListing,
  useSubmitBooking,
} from "../hooks/useQueries";

export default function ListingDetailPage() {
  const { id } = useParams({ from: "/stays/$id" });
  const { data: listing, isLoading, isError } = useGetListing(id);
  const { data: listingPhones } = useGetAllListingPhones();
  const phoneMap = Object.fromEntries(listingPhones ?? []);
  const submitBooking = useSubmitBooking();

  const [photoIdx, setPhotoIdx] = useState(0);
  const [bookingSubmitted, setBookingSubmitted] = useState(false);
  const [form, setForm] = useState({
    guestName: "",
    email: "",
    phone: "",
    checkIn: "",
    checkOut: "",
    notes: "",
  });

  const photos = listing?.photos ?? [];
  const currentPhoto =
    photos[photoIdx]?.getDirectURL() ??
    "/assets/generated/listing-hotel-room.dim_800x600.jpg";

  const nights = (() => {
    if (!form.checkIn || !form.checkOut) return 0;
    const diff =
      new Date(form.checkOut).getTime() - new Date(form.checkIn).getTime();
    return Math.max(0, Math.round(diff / (1000 * 60 * 60 * 24)));
  })();

  const total = nights * (listing?.pricePerNight ?? 0);
  const advance = nights > 0 ? Math.max(500, Math.round(total * 0.3)) : 0;

  const handleCopyUPI = () => {
    navigator.clipboard.writeText("ishwarbharti615@okaxis");
    toast.success("UPI ID copied!");
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!listing) return;
    if (
      !form.guestName ||
      !form.email ||
      !form.phone ||
      !form.checkIn ||
      !form.checkOut
    ) {
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
        bookingType: BookingType.listing,
        totalPrice: total,
        listingId: listing.id,
        checkIn: form.checkIn,
        checkOut: form.checkOut,
      });
      toast.success(
        "Booking request submitted! Please complete advance payment to confirm.",
      );
      setBookingSubmitted(true);
      setForm({
        guestName: "",
        email: "",
        phone: "",
        checkIn: "",
        checkOut: "",
        notes: "",
      });
    } catch {
      toast.error("Failed to submit booking. Please try again.");
    }
  };

  if (isLoading) {
    return (
      <div className="container mx-auto px-4 py-10">
        <Skeleton className="h-8 w-32 mb-6" />
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          <div className="lg:col-span-2 space-y-4">
            <Skeleton
              className="h-80 w-full rounded-2xl"
              data-ocid="detail.loading_state"
            />
            <Skeleton className="h-6 w-2/3" />
            <Skeleton className="h-4 w-full" />
            <Skeleton className="h-4 w-4/5" />
          </div>
          <Skeleton className="h-96 rounded-2xl" />
        </div>
      </div>
    );
  }

  if (isError || !listing) {
    return (
      <div
        className="container mx-auto px-4 py-20 text-center"
        data-ocid="detail.error_state"
      >
        <p className="text-2xl font-display font-semibold mb-4">
          Listing not found
        </p>
        <Link to="/stays">
          <Button variant="outline">Back to Stays</Button>
        </Link>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-10">
      <Link to="/stays" data-ocid="detail.link">
        <Button
          variant="ghost"
          size="sm"
          className="mb-6 gap-2 text-muted-foreground"
        >
          <ChevronLeft className="w-4 h-4" /> Back to Stays
        </Button>
      </Link>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Left: Gallery + Details */}
        <div className="lg:col-span-2">
          {/* Photo gallery */}
          <div className="relative rounded-2xl overflow-hidden mb-3 aspect-[16/9]">
            <img
              src={currentPhoto}
              alt={listing.name}
              className="w-full h-full object-cover"
            />
            {photos.length > 1 && (
              <>
                <button
                  type="button"
                  onClick={() =>
                    setPhotoIdx((i) => (i - 1 + photos.length) % photos.length)
                  }
                  className="absolute left-3 top-1/2 -translate-y-1/2 bg-card/80 rounded-full p-2 hover:bg-card transition-colors"
                  data-ocid="gallery.button"
                >
                  <ChevronLeft className="w-4 h-4" />
                </button>
                <button
                  type="button"
                  onClick={() => setPhotoIdx((i) => (i + 1) % photos.length)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 bg-card/80 rounded-full p-2 hover:bg-card transition-colors"
                  data-ocid="gallery.button"
                >
                  <ChevronRight className="w-4 h-4" />
                </button>
              </>
            )}
          </div>
          {photos.length > 1 && (
            <div className="flex gap-2 overflow-x-auto pb-2">
              {photos.map((p, i) => (
                <button
                  type="button"
                  key={p.getDirectURL()}
                  onClick={() => setPhotoIdx(i)}
                  className={`shrink-0 w-20 h-16 rounded-lg overflow-hidden border-2 transition-colors ${
                    i === photoIdx ? "border-primary" : "border-transparent"
                  }`}
                  data-ocid="gallery.button"
                >
                  <img
                    src={p.getDirectURL()}
                    alt=""
                    className="w-full h-full object-cover"
                  />
                </button>
              ))}
            </div>
          )}

          <div className="mt-6">
            <div className="flex items-start justify-between gap-4 mb-2">
              <h1 className="font-display text-3xl md:text-4xl font-bold">
                {listing.name}
              </h1>
              <Badge className="shrink-0 capitalize mt-1">
                {listing.listingType as string}
              </Badge>
            </div>
            <div className="flex items-center gap-1 text-muted-foreground mb-4">
              <MapPin className="w-4 h-4" />
              <span>{listing.location}</span>
            </div>
            <p className="text-foreground leading-relaxed mb-6">
              {listing.description}
            </p>

            <h3 className="font-semibold text-lg mb-3">Amenities</h3>
            <div className="flex flex-wrap gap-2">
              {listing.amenities.map((a) => (
                <Badge
                  key={a}
                  variant="secondary"
                  className="text-sm px-3 py-1"
                >
                  {a}
                </Badge>
              ))}
            </div>
            {phoneMap[listing.id] && (
              <div className="flex gap-3 mt-6">
                <a
                  href={`tel:${phoneMap[listing.id]}`}
                  className="flex items-center gap-2 px-5 py-3 rounded-xl bg-green-600 hover:bg-green-700 text-white font-semibold transition-colors"
                  data-ocid="listing.button"
                >
                  <Phone className="w-4 h-4" /> Call Now
                </a>
                <a
                  href={`https://wa.me/${(phoneMap[listing.id] ?? "").replace(/\D/g, "")}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex items-center gap-2 px-5 py-3 rounded-xl bg-emerald-500 hover:bg-emerald-600 text-white font-semibold transition-colors"
                  data-ocid="listing.button"
                >
                  <MessageCircle className="w-4 h-4" /> WhatsApp
                </a>
              </div>
            )}
          </div>
        </div>

        {/* Right: Booking form */}
        <div className="lg:col-span-1">
          <div className="bg-card rounded-2xl shadow-card p-6 sticky top-20">
            <div className="mb-5">
              <span className="font-bold text-3xl">
                ₹{listing.pricePerNight.toLocaleString("en-IN")}
              </span>
              <span className="text-muted-foreground"> /night</span>
            </div>

            <form
              onSubmit={handleSubmit}
              className="space-y-4"
              data-ocid="booking.panel"
            >
              <div>
                <Label htmlFor="guestName">Full Name *</Label>
                <Input
                  id="guestName"
                  value={form.guestName}
                  onChange={(e) =>
                    setForm((f) => ({ ...f, guestName: e.target.value }))
                  }
                  placeholder="John Doe"
                  required
                  data-ocid="booking.input"
                />
              </div>
              <div>
                <Label htmlFor="email">Email *</Label>
                <Input
                  id="email"
                  type="email"
                  value={form.email}
                  onChange={(e) =>
                    setForm((f) => ({ ...f, email: e.target.value }))
                  }
                  placeholder="john@example.com"
                  required
                  data-ocid="booking.input"
                />
              </div>
              <div>
                <Label htmlFor="phone">Phone *</Label>
                <Input
                  id="phone"
                  type="tel"
                  value={form.phone}
                  onChange={(e) =>
                    setForm((f) => ({ ...f, phone: e.target.value }))
                  }
                  placeholder="+91 98765 43210"
                  required
                  data-ocid="booking.input"
                />
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <Label htmlFor="checkIn">Check-in *</Label>
                  <Input
                    id="checkIn"
                    type="date"
                    value={form.checkIn}
                    onChange={(e) =>
                      setForm((f) => ({ ...f, checkIn: e.target.value }))
                    }
                    required
                    data-ocid="booking.input"
                  />
                </div>
                <div>
                  <Label htmlFor="checkOut">Check-out *</Label>
                  <Input
                    id="checkOut"
                    type="date"
                    value={form.checkOut}
                    onChange={(e) =>
                      setForm((f) => ({ ...f, checkOut: e.target.value }))
                    }
                    required
                    data-ocid="booking.input"
                  />
                </div>
              </div>
              <div>
                <Label htmlFor="notes">Special Requests</Label>
                <Textarea
                  id="notes"
                  value={form.notes}
                  onChange={(e) =>
                    setForm((f) => ({ ...f, notes: e.target.value }))
                  }
                  placeholder="Any special requests..."
                  rows={3}
                  data-ocid="booking.textarea"
                />
              </div>

              {nights > 0 && (
                <div className="bg-muted rounded-xl p-3 text-sm space-y-1">
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">
                      ₹{listing.pricePerNight.toLocaleString("en-IN")} ×{" "}
                      {nights} nights
                    </span>
                    <span>₹{total.toLocaleString("en-IN")}</span>
                  </div>
                  <div className="flex justify-between font-semibold pt-1 border-t border-border">
                    <span>Total</span>
                    <span>₹{total.toLocaleString("en-IN")}</span>
                  </div>
                </div>
              )}

              {/* Advance Payment Box */}
              {nights > 0 && (
                <div
                  className="rounded-2xl border-2 border-emerald-400 bg-emerald-50 dark:bg-emerald-950/30 dark:border-emerald-600 p-4 space-y-3"
                  data-ocid="payment.panel"
                >
                  {/* Heading */}
                  <div className="text-center">
                    <p className="font-bold text-emerald-800 dark:text-emerald-300 text-base leading-snug">
                      Advance Payment Required
                    </p>
                    <p className="text-xs text-emerald-700 dark:text-emerald-400 mt-0.5">
                      बुकिंग कन्फर्म करने के लिए Advance Pay करें
                    </p>
                  </div>

                  {/* Amount */}
                  <div className="text-center">
                    <p className="text-xs text-emerald-700 dark:text-emerald-400 mb-0.5">
                      Advance Amount (30%)
                    </p>
                    <p className="text-3xl font-extrabold text-emerald-700 dark:text-emerald-300 tracking-tight">
                      ₹{advance.toLocaleString("en-IN")}
                    </p>
                  </div>

                  {/* QR Code */}
                  <div className="flex justify-center">
                    <img
                      src="/assets/uploads/IMG-20260316-WA0000-1.jpg"
                      alt="UPI Payment QR Code"
                      className="w-48 h-48 object-contain rounded-xl border border-emerald-200 dark:border-emerald-700 bg-white"
                    />
                  </div>

                  {/* UPI ID */}
                  <div className="flex items-center justify-between bg-white dark:bg-emerald-900/40 rounded-xl px-3 py-2 border border-emerald-200 dark:border-emerald-700">
                    <div>
                      <p className="text-xs text-emerald-600 dark:text-emerald-400">
                        UPI ID
                      </p>
                      <p className="font-mono font-semibold text-sm text-emerald-900 dark:text-emerald-100 select-all">
                        ishwarbharti615@okaxis
                      </p>
                    </div>
                    <button
                      type="button"
                      onClick={handleCopyUPI}
                      className="ml-2 p-2 rounded-lg hover:bg-emerald-100 dark:hover:bg-emerald-800 transition-colors"
                      title="Copy UPI ID"
                      data-ocid="payment.button"
                    >
                      <Copy className="w-4 h-4 text-emerald-600 dark:text-emerald-400" />
                    </button>
                  </div>

                  {/* Instructions */}
                  <p className="text-xs text-center text-emerald-700 dark:text-emerald-400">
                    Scan QR code with any UPI app (GPay, PhonePe, Paytm) to pay
                    advance
                  </p>

                  {/* Note */}
                  <div className="flex items-start gap-2 bg-amber-50 dark:bg-amber-950/30 border border-amber-300 dark:border-amber-700 rounded-xl px-3 py-2">
                    <span className="text-amber-500 text-base mt-0.5">⚠️</span>
                    <p className="text-xs text-amber-800 dark:text-amber-300 leading-snug">
                      Booking will be confirmed only after advance payment.
                      Please share payment screenshot on WhatsApp/call after
                      paying.
                    </p>
                  </div>
                </div>
              )}

              <Button
                type="submit"
                className="w-full"
                disabled={submitBooking.isPending}
                data-ocid="booking.submit_button"
              >
                {submitBooking.isPending ? (
                  <>
                    <Loader2 className="w-4 h-4 mr-2 animate-spin" />{" "}
                    Submitting...
                  </>
                ) : (
                  "Submit Booking Request"
                )}
              </Button>

              {nights > 0 && (
                <p className="text-xs text-center text-muted-foreground">
                  ⚠️ Advance payment via QR/UPI is required to confirm your
                  booking.
                </p>
              )}
            </form>

            {/* Booking submitted success box */}
            {bookingSubmitted && (
              <div
                className="mt-4 rounded-2xl border-2 border-emerald-400 bg-emerald-50 dark:bg-emerald-950/30 p-4 text-center"
                data-ocid="booking.success_state"
              >
                <CheckCircle className="w-8 h-8 text-emerald-600 mx-auto mb-2" />
                <p className="font-bold text-emerald-800 dark:text-emerald-300 text-base">
                  Booking request submitted!
                </p>
                <p className="text-xs text-emerald-700 dark:text-emerald-400 mt-1 mb-3">
                  Advance payment QR se karein. Payment ke baad status check
                  karne ke liye:
                </p>
                <a
                  href="/booking-status"
                  className="inline-flex items-center gap-1 bg-emerald-600 hover:bg-emerald-700 text-white text-sm font-medium px-4 py-2 rounded-xl transition-colors"
                  data-ocid="booking.link"
                >
                  Check Payment Status →
                </a>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
