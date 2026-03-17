import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { Link } from "@tanstack/react-router";
import {
  ArrowRight,
  Car,
  Coffee,
  MapPin,
  Phone,
  Star,
  Utensils,
  Wifi,
} from "lucide-react";
import { ListingType } from "../backend";
import {
  useGetActiveListings,
  useGetActiveTaxiRoutes,
  useGetAllListingPhones,
} from "../hooks/useQueries";

const AMENITY_ICONS: Record<string, React.ReactNode> = {
  WiFi: <Wifi className="w-3 h-3" />,
  Breakfast: <Coffee className="w-3 h-3" />,
  Restaurant: <Utensils className="w-3 h-3" />,
};

function listingTypeLabel(type: ListingType) {
  switch (type) {
    case ListingType.hotel:
      return "Hotel";
    case ListingType.homestay:
      return "Homestay";
    case "restaurant" as ListingType:
      return "Restaurant";
    case "dhaba" as ListingType:
      return "Dhaba";
    default:
      return "Stay";
  }
}

export default function HomePage() {
  const { data: taxiRoutes, isLoading: taxiLoading } = useGetActiveTaxiRoutes();
  const { data: listings, isLoading: listingsLoading } = useGetActiveListings();
  const { data: listingPhones } = useGetAllListingPhones();
  const phoneMap = Object.fromEntries(listingPhones ?? []);

  const featuredStays = listings
    ? listings
        .filter(
          (l) =>
            l.listingType === ListingType.hotel ||
            l.listingType === ListingType.homestay,
        )
        .slice(0, 3)
    : [];

  return (
    <div className="overflow-x-hidden">
      {/* Hero */}
      <section
        className="relative min-h-[85vh] flex items-end justify-center pb-20"
        style={{
          backgroundImage: `url('/assets/uploads/IMG_20260315_104438-1-1.jpg')`,
          backgroundSize: "cover",
          backgroundPosition: "center top",
        }}
      >
        {/* Elegant gradient overlay — light at top, deep at bottom */}
        <div
          className="absolute inset-0"
          style={{
            background:
              "linear-gradient(to bottom, oklch(0.1 0.015 40 / 0.1) 0%, oklch(0.1 0.015 40 / 0.35) 40%, oklch(0.08 0.012 38 / 0.82) 80%, oklch(0.06 0.01 35 / 0.95) 100%)",
          }}
        />

        <div className="relative z-10 container mx-auto px-4 text-center">
          {/* Frosted-glass pill badge */}
          <div className="inline-flex items-center gap-2 mb-6 px-4 py-2 rounded-full border border-white/20 bg-white/10 backdrop-blur-md text-white/90 text-sm font-medium shadow-lg">
            <Star className="w-3.5 h-3.5 text-amber-300 fill-amber-300" />
            <span>Curated Local Stays &amp; Transport</span>
          </div>

          <h1 className="font-display text-5xl md:text-7xl font-bold text-white mb-5 leading-tight drop-shadow-[0_2px_12px_rgba(0,0,0,0.5)]">
            Find Your Perfect
            <span className="block font-light italic text-amber-200">
              Home Away
            </span>
          </h1>
          <p className="text-white/80 text-lg md:text-xl mb-10 max-w-lg mx-auto leading-relaxed">
            Discover cozy homestays, boutique hotels, and reliable taxis — all
            in one place.
          </p>

          <div className="flex flex-col sm:flex-row gap-3 justify-center">
            <Link to="/stays" data-ocid="hero.primary_button">
              <Button
                size="lg"
                className="font-semibold px-8 shadow-warm hover:shadow-xl transition-shadow duration-300"
              >
                Browse Stays
              </Button>
            </Link>
            <Link to="/taxis" data-ocid="hero.secondary_button">
              <Button
                size="lg"
                variant="outline"
                className="font-semibold px-8 bg-white/10 backdrop-blur-sm border-white/40 text-white hover:bg-white/20 hover:border-white/60 transition-all duration-300"
              >
                Book a Taxi
              </Button>
            </Link>
          </div>
        </div>
      </section>

      {/* Featured Stays */}
      <section className="container mx-auto px-4 py-20">
        <div className="flex items-end justify-between mb-10">
          <div>
            <p className="text-primary font-semibold text-sm uppercase tracking-widest mb-2">
              Hand-picked
            </p>
            <h2 className="font-display text-4xl font-bold relative inline-block">
              Featured Stays
              {/* Decorative accent underline */}
              <span
                className="absolute -bottom-2 left-0 h-1 rounded-full"
                style={{
                  width: "60%",
                  background: "oklch(var(--primary))",
                  opacity: 0.6,
                }}
              />
            </h2>
          </div>
          <Link to="/stays" data-ocid="featured.link">
            <Button variant="ghost" className="gap-2 text-primary font-medium">
              View all <ArrowRight className="w-4 h-4" />
            </Button>
          </Link>
        </div>

        {listingsLoading ? (
          <div className="grid grid-cols-1 md:grid-cols-3 gap-7">
            {[1, 2, 3].map((i) => (
              <Skeleton
                key={i}
                className="h-96 rounded-3xl"
                data-ocid="featured.loading_state"
              />
            ))}
          </div>
        ) : featuredStays.length === 0 ? (
          <div
            className="text-center py-16 text-muted-foreground rounded-3xl border-2 border-dashed border-border"
            data-ocid="featured.empty_state"
          >
            <p className="text-lg font-medium">Abhi koi listing nahi hai.</p>
            <p className="text-sm mt-1">
              Admin panel se hotels/homestays add karein.
            </p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-3 gap-7">
            {featuredStays.map((stay, i) => (
              <Link
                key={stay.id}
                to="/stays/$id"
                params={{ id: stay.id }}
                className="group block"
                data-ocid={`featured.item.${i + 1}`}
              >
                <div className="bg-card rounded-3xl overflow-hidden shadow-card listing-card-hover border border-border/50">
                  {/* Image — taller */}
                  <div className="relative h-64 overflow-hidden">
                    {stay.photos && stay.photos.length > 0 ? (
                      <img
                        src={stay.photos[0].getDirectURL()}
                        alt={stay.name}
                        className="w-full h-full object-cover group-hover:scale-108 transition-transform duration-700"
                      />
                    ) : (
                      <div
                        className="w-full h-full flex items-center justify-center"
                        style={{
                          background:
                            "linear-gradient(135deg, oklch(0.93 0.04 75) 0%, oklch(0.88 0.06 55) 100%)",
                        }}
                      >
                        <span className="text-muted-foreground text-sm font-medium">
                          No photo
                        </span>
                      </div>
                    )}
                    {/* Type badge */}
                    <div className="absolute top-3 left-3">
                      <Badge className="bg-card/90 backdrop-blur-sm text-foreground text-xs font-semibold border-0 shadow">
                        {listingTypeLabel(stay.listingType)}
                      </Badge>
                    </div>
                    {/* Subtle bottom gradient on image */}
                    <div
                      className="absolute bottom-0 left-0 right-0 h-16"
                      style={{
                        background:
                          "linear-gradient(to top, oklch(0.99 0.005 80 / 0.8), transparent)",
                      }}
                    />
                  </div>

                  <div className="p-5">
                    <h3 className="font-display text-lg font-semibold mb-1.5">
                      {stay.name}
                    </h3>
                    <div className="flex items-center gap-1.5 text-muted-foreground text-sm mb-3">
                      <MapPin className="w-3.5 h-3.5 flex-shrink-0" />
                      {stay.location}
                    </div>
                    {stay.amenities && stay.amenities.length > 0 && (
                      <div className="flex flex-wrap gap-1.5 mb-4">
                        {stay.amenities.slice(0, 3).map((a) => (
                          <span
                            key={a}
                            className="flex items-center gap-1 text-xs bg-muted px-2.5 py-1 rounded-full text-muted-foreground"
                          >
                            {AMENITY_ICONS[a] ?? null} {a}
                          </span>
                        ))}
                      </div>
                    )}
                    <div className="flex items-center justify-between pt-2 border-t border-border/50">
                      <div>
                        <span
                          className="font-bold text-2xl"
                          style={{ color: "oklch(var(--primary))" }}
                        >
                          ₹{stay.pricePerNight.toLocaleString("en-IN")}
                        </span>
                        <span className="text-muted-foreground text-sm ml-1">
                          /night
                        </span>
                      </div>
                      <Button
                        size="sm"
                        className="text-xs font-semibold px-4 shadow-warm"
                      >
                        Book Now
                      </Button>
                      {phoneMap[stay.id] && (
                        <a
                          href={`tel:${phoneMap[stay.id]}`}
                          className="flex items-center gap-1 text-xs font-semibold px-3 py-2 rounded-lg bg-green-600 hover:bg-green-700 text-white transition-colors"
                          onClick={(e) => e.stopPropagation()}
                          data-ocid="home.button"
                        >
                          <Phone className="w-3 h-3" /> Call
                        </a>
                      )}
                    </div>
                  </div>
                </div>
              </Link>
            ))}
          </div>
        )}
      </section>

      {/* Taxi Services */}
      <section
        className="py-20"
        style={{
          background:
            "linear-gradient(135deg, oklch(0.95 0.02 75) 0%, oklch(0.96 0.015 55) 50%, oklch(0.95 0.018 80) 100%)",
        }}
      >
        <div className="container mx-auto px-4">
          <div className="flex items-end justify-between mb-10">
            <div>
              <p className="text-primary font-semibold text-sm uppercase tracking-widest mb-2">
                On the road
              </p>
              <h2 className="font-display text-4xl font-bold relative inline-block">
                Taxi Services
                <span
                  className="absolute -bottom-2 left-0 h-1 rounded-full"
                  style={{
                    width: "60%",
                    background: "oklch(var(--primary))",
                    opacity: 0.6,
                  }}
                />
              </h2>
            </div>
            <Link to="/taxis" data-ocid="taxi.link">
              <Button
                variant="ghost"
                className="gap-2 text-primary font-medium"
              >
                View all <ArrowRight className="w-4 h-4" />
              </Button>
            </Link>
          </div>

          {taxiLoading ? (
            <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
              {[1, 2, 3].map((i) => (
                <Skeleton
                  key={i}
                  className="h-40 rounded-3xl"
                  data-ocid="taxi.loading_state"
                />
              ))}
            </div>
          ) : taxiRoutes && taxiRoutes.length > 0 ? (
            <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
              {taxiRoutes.slice(0, 3).map((route, i) => (
                <Link
                  key={route.id}
                  to="/taxis"
                  className="block"
                  data-ocid={`taxi.item.${i + 1}`}
                >
                  <div className="bg-card/80 backdrop-blur-sm rounded-3xl p-6 shadow-card listing-card-hover border border-border/40">
                    <div className="flex items-center gap-3 mb-4">
                      {/* Icon with gradient background */}
                      <div
                        className="w-11 h-11 rounded-2xl flex items-center justify-center shadow-sm"
                        style={{
                          background:
                            "linear-gradient(135deg, oklch(0.57 0.135 38 / 0.15) 0%, oklch(0.82 0.1 75 / 0.2) 100%)",
                        }}
                      >
                        <Car className="w-5 h-5 text-primary" />
                      </div>
                      <Badge
                        variant="secondary"
                        className="text-xs font-semibold"
                      >
                        {(route.rateType as string) === "perKm"
                          ? "Per Km"
                          : "Flat Rate"}
                      </Badge>
                    </div>
                    <p className="font-semibold text-base mb-1">
                      {route.origin} → {route.destination}
                    </p>
                    {route.estimatedKm && (
                      <p className="text-xs text-muted-foreground mb-2">
                        ~{route.estimatedKm} km
                      </p>
                    )}
                    <p
                      className="font-bold text-xl mt-1"
                      style={{ color: "oklch(var(--primary))" }}
                    >
                      ₹{route.rate}
                      <span className="text-sm font-medium text-muted-foreground ml-1">
                        {(route.rateType as string) === "perKm"
                          ? "/km"
                          : "flat"}
                      </span>
                    </p>
                  </div>
                </Link>
              ))}
            </div>
          ) : (
            <div
              className="text-center py-10 text-muted-foreground rounded-3xl border-2 border-dashed border-border/60"
              data-ocid="taxi.empty_state"
            >
              <p className="font-medium">
                Admin panel se taxi routes add karein.
              </p>
            </div>
          )}
        </div>
      </section>

      {/* CTA banner */}
      <section className="container mx-auto px-4 py-20">
        <div
          className="rounded-3xl p-12 md:p-16 text-center relative overflow-hidden"
          style={{
            background:
              "linear-gradient(135deg, oklch(0.5 0.14 38) 0%, oklch(0.55 0.13 30) 50%, oklch(0.48 0.12 25) 100%)",
          }}
        >
          {/* Decorative radial glow */}
          <div
            className="absolute inset-0 opacity-20"
            style={{
              background:
                "radial-gradient(ellipse at 25% 50%, oklch(0.85 0.12 75), transparent 55%), radial-gradient(ellipse at 75% 30%, oklch(0.7 0.1 50), transparent 45%)",
            }}
          />
          {/* Subtle grain */}
          <div
            className="absolute inset-0 opacity-30"
            style={{
              backgroundImage:
                "url(\"data:image/svg+xml,%3Csvg viewBox='0 0 200 200' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='n'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.75' numOctaves='4' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23n)' opacity='0.08'/%3E%3C/svg%3E\")",
            }}
          />
          <h2 className="font-display text-4xl md:text-5xl font-bold text-white mb-4 relative z-10">
            Ready to explore?
          </h2>
          <p className="text-white/75 text-lg mb-10 max-w-md mx-auto relative z-10 leading-relaxed">
            Browse all our curated stays and book your next adventure today.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center relative z-10">
            <Link to="/stays" data-ocid="cta.primary_button">
              <Button
                size="lg"
                className="font-semibold px-8 bg-white text-foreground hover:bg-white/90 shadow-lg transition-all duration-300"
              >
                Browse Stays
              </Button>
            </Link>
            <Link to="/taxis" data-ocid="cta.secondary_button">
              <Button
                size="lg"
                variant="outline"
                className="font-semibold px-8 border-white/50 text-white bg-white/10 backdrop-blur-sm hover:bg-white/20 hover:border-white/70 transition-all duration-300"
              >
                Book a Taxi
              </Button>
            </Link>
          </div>
        </div>
      </section>
    </div>
  );
}
