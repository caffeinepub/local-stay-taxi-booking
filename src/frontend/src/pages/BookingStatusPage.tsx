import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { CheckCircle, Clock, XCircle } from "lucide-react";
import { useState } from "react";
import { useGetBookingsByPhone } from "../hooks/useQueries";

export default function BookingStatusPage() {
  const [phone, setPhone] = useState("");
  const [searchPhone, setSearchPhone] = useState("");

  const {
    data: bookings,
    isLoading,
    isFetched,
  } = useGetBookingsByPhone(searchPhone);

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    setSearchPhone(phone.trim());
  };

  const formatINR = (amount: number) => `₹${amount.toLocaleString("en-IN")}`;

  return (
    <div className="min-h-[80vh] bg-background">
      {/* Hero header */}
      <div className="bg-gradient-to-br from-emerald-600 to-teal-700 text-white py-12 px-4">
        <div className="container mx-auto max-w-xl text-center">
          <h1 className="font-display text-3xl md:text-4xl font-bold mb-2">
            Booking & Payment Status
          </h1>
          <p className="text-emerald-100 text-lg">अपना पेमेंट स्टेटस चेक करें</p>
        </div>
      </div>

      <div className="container mx-auto max-w-xl px-4 py-8">
        {/* Search form */}
        <div
          className="bg-card rounded-2xl shadow-card p-6 mb-6"
          data-ocid="status.panel"
        >
          <form onSubmit={handleSearch} className="space-y-4">
            <div>
              <Label htmlFor="phone" className="text-base font-semibold">
                अपना Phone Number डालें
              </Label>
              <p className="text-sm text-muted-foreground mt-0.5 mb-2">
                Enter the phone number you used during booking
              </p>
              <Input
                id="phone"
                type="tel"
                value={phone}
                onChange={(e) => setPhone(e.target.value)}
                placeholder="+91 98765 43210"
                className="text-base"
                data-ocid="status.input"
              />
            </div>
            <Button
              type="submit"
              className="w-full bg-emerald-600 hover:bg-emerald-700 text-white"
              disabled={phone.trim().length < 10 || isLoading}
              data-ocid="status.submit_button"
            >
              {isLoading ? "Searching..." : "Check Status"}
            </Button>
          </form>
        </div>

        {/* Results */}
        {isLoading && (
          <div
            className="text-center py-8 text-muted-foreground"
            data-ocid="status.loading_state"
          >
            <div className="w-8 h-8 border-4 border-emerald-500 border-t-transparent rounded-full animate-spin mx-auto mb-3" />
            <p>Searching bookings...</p>
          </div>
        )}

        {!isLoading && isFetched && searchPhone && bookings?.length === 0 && (
          <div
            className="text-center py-10 bg-card rounded-2xl border border-border"
            data-ocid="status.empty_state"
          >
            <p className="text-2xl mb-2">🔍</p>
            <p className="font-semibold text-foreground">
              कोई Booking नहीं मिली
            </p>
            <p className="text-sm text-muted-foreground mt-1">
              No bookings found for{" "}
              <span className="font-mono">{searchPhone}</span>
            </p>
            <p className="text-sm text-muted-foreground mt-1">
              Please check your phone number and try again.
            </p>
          </div>
        )}

        {!isLoading && bookings && bookings.length > 0 && (
          <div className="space-y-4">
            <p className="text-sm text-muted-foreground">
              {bookings.length} booking{bookings.length > 1 ? "s" : ""} found
            </p>
            {bookings.map((b, i) => {
              const status = b.status as string;
              return (
                <div
                  key={b.id}
                  className="bg-card rounded-2xl border border-border p-5 shadow-sm"
                  data-ocid={`status.item.${i + 1}`}
                >
                  {/* Status badge */}
                  {status === "confirmed" && (
                    <div className="flex items-center gap-2 mb-3 p-3 bg-emerald-50 dark:bg-emerald-950/30 rounded-xl border border-emerald-200 dark:border-emerald-800">
                      <CheckCircle className="w-5 h-5 text-emerald-600 shrink-0" />
                      <div>
                        <p className="font-semibold text-emerald-800 dark:text-emerald-300 text-sm">
                          Payment Received ✓
                        </p>
                        <p className="text-xs text-emerald-700 dark:text-emerald-400">
                          Aapki booking confirm ho gayi hai!
                        </p>
                      </div>
                      <Badge className="ml-auto bg-emerald-600 text-white hover:bg-emerald-700">
                        Confirmed
                      </Badge>
                    </div>
                  )}
                  {status === "pending" && (
                    <div className="flex items-center gap-2 mb-3 p-3 bg-amber-50 dark:bg-amber-950/30 rounded-xl border border-amber-200 dark:border-amber-700">
                      <Clock className="w-5 h-5 text-amber-600 shrink-0" />
                      <div>
                        <p className="font-semibold text-amber-800 dark:text-amber-300 text-sm">
                          Payment Pending
                        </p>
                        <p className="text-xs text-amber-700 dark:text-amber-400">
                          Aapki payment ka wait hai. QR se advance pay karein.
                        </p>
                      </div>
                      <Badge className="ml-auto bg-amber-500 text-white hover:bg-amber-600">
                        Pending
                      </Badge>
                    </div>
                  )}
                  {status === "cancelled" && (
                    <div className="flex items-center gap-2 mb-3 p-3 bg-red-50 dark:bg-red-950/30 rounded-xl border border-red-200 dark:border-red-800">
                      <XCircle className="w-5 h-5 text-red-600 shrink-0" />
                      <div>
                        <p className="font-semibold text-red-800 dark:text-red-300 text-sm">
                          Booking Cancelled
                        </p>
                        <p className="text-xs text-red-700 dark:text-red-400">
                          Yeh booking cancel ho gayi hai.
                        </p>
                      </div>
                      <Badge variant="destructive" className="ml-auto">
                        Cancelled
                      </Badge>
                    </div>
                  )}

                  {/* Booking details */}
                  <div className="space-y-2 text-sm">
                    <div className="flex justify-between items-center">
                      <span className="text-muted-foreground">Type</span>
                      <Badge variant="outline" className="capitalize">
                        {b.bookingType as string}
                      </Badge>
                    </div>
                    <div className="flex justify-between items-center">
                      <span className="text-muted-foreground">Guest</span>
                      <span className="font-medium">{b.guestName}</span>
                    </div>
                    {(b.bookingType as string) === "listing" && b.checkIn && (
                      <div className="flex justify-between items-center">
                        <span className="text-muted-foreground">Dates</span>
                        <span>
                          {b.checkIn} → {b.checkOut}
                        </span>
                      </div>
                    )}
                    {(b.bookingType as string) === "taxi" && b.pickupDate && (
                      <div className="flex justify-between items-center">
                        <span className="text-muted-foreground">
                          Pickup Date
                        </span>
                        <span>{b.pickupDate}</span>
                      </div>
                    )}
                    <div className="flex justify-between items-center border-t border-border pt-2 mt-2">
                      <span className="text-muted-foreground font-medium">
                        Total Amount
                      </span>
                      <span className="font-bold text-base">
                        {formatINR(b.totalPrice)}
                      </span>
                    </div>
                    {status === "pending" && (
                      <div className="flex justify-between items-center">
                        <span className="text-muted-foreground">
                          Advance Due
                        </span>
                        <span className="font-semibold text-amber-600">
                          {formatINR(
                            Math.max(500, Math.round(b.totalPrice * 0.3)),
                          )}
                        </span>
                      </div>
                    )}
                  </div>

                  {/* Pay now link for pending */}
                  {status === "pending" && (
                    <div className="mt-3 pt-3 border-t border-border">
                      <a href={`/stays/${b.listingId ?? ""}`}>
                        <Button
                          size="sm"
                          variant="outline"
                          className="w-full border-amber-400 text-amber-700 hover:bg-amber-50"
                        >
                          View Booking & Pay Advance →
                        </Button>
                      </a>
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        )}

        {/* Help text */}
        <div className="mt-8 text-center text-sm text-muted-foreground">
          <p>Payment ki koi problem? Admin se contact karein.</p>
        </div>
      </div>
    </div>
  );
}
