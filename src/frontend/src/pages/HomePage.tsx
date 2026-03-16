import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { Link } from "@tanstack/react-router";
import { ArrowRight, Car, Coffee, MapPin, Utensils, Wifi } from "lucide-react";
import { ListingType } from "../backend";
import {
  useGetActiveListings,
  useGetActiveTaxiRoutes,
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
    <div>
      {/* Hero */}
      <section
        className="relative min-h-[600px] flex items-center justify-center grain-overlay"
        style={{
          backgroundImage: `url('/assets/uploads/IMG_20260315_104438-1-1.jpg')`,
          backgroundSize: "cover",
          backgroundPosition: "center",
        }}
      >
        <div className="hero-overlay absolute inset-0" />
        <div className="relative z-10 container mx-auto px-4 text-center">
          <div className="animate-fade-up">
            <Badge className="mb-4 bg-accent/90 text-accent-foreground border-0 font-medium">
              🏡 Local Stays & Transport
            </Badge>
            <h1 className="font-display text-5xl md:text-7xl font-bold text-yellow-300 drop-shadow-[0_2px_8px_rgba(0,0,0,0.9)] mb-4 leading-tight">
              Find Your Perfect
              <span className="block italic font-light">Home Away</span>
            </h1>
            <p className="text-yellow-100/90 drop-shadow-[0_1px_4px_rgba(0,0,0,0.8)] text-lg md:text-xl mb-10 max-w-xl mx-auto">
              Discover cozy homestays, boutique hotels, and reliable taxis — all
              in one place.
            </p>
            <div className="flex flex-col sm:flex-row gap-3 justify-center">
              <Link to="/stays" data-ocid="hero.primary_button">
                <Button size="lg" className="font-semibold">
                  Browse Stays
                </Button>
              </Link>
              <Link to="/taxis" data-ocid="hero.secondary_button">
                <Button
                  size="lg"
                  variant="outline"
                  className="text-yellow-200 border-yellow-300/60 hover:bg-yellow-300/10 font-semibold"
                >
                  Book a Taxi
                </Button>
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* Featured Stays */}
      <section className="container mx-auto px-4 py-16">
        <div className="flex items-end justify-between mb-8">
          <div>
            <p className="text-primary font-semibold text-sm uppercase tracking-widest mb-1">
              Hand-picked
            </p>
            <h2 className="font-display text-4xl font-bold">Featured Stays</h2>
          </div>
          <Link to="/stays" data-ocid="featured.link">
            <Button variant="ghost" className="gap-2 text-primary">
              View all <ArrowRight className="w-4 h-4" />
            </Button>
          </Link>
        </div>

        {listingsLoading ? (
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {[1, 2, 3].map((i) => (
              <Skeleton
                key={i}
                className="h-80 rounded-2xl"
                data-ocid="featured.loading_state"
              />
            ))}
          </div>
        ) : featuredStays.length === 0 ? (
          <div
            className="text-center py-12 text-muted-foreground"
            data-ocid="featured.empty_state"
          >
            <p className="text-lg">Abhi koi listing nahi hai.</p>
            <p className="text-sm mt-1">
              Admin panel se hotels/homestays add karein.
            </p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {featuredStays.map((stay, i) => (
              <Link
                key={stay.id}
                to="/stays/$id"
                params={{ id: stay.id }}
                className="group block"
                data-ocid={`featured.item.${i + 1}`}
              >
                <div className="bg-card rounded-2xl overflow-hidden shadow-card listing-card-hover">
                  <div className="relative h-52 overflow-hidden">
                    {stay.photos && stay.photos.length > 0 ? (
                      <img
                        src={stay.photos[0].getDirectURL()}
                        alt={stay.name}
                        className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                      />
                    ) : (
                      <div className="w-full h-full bg-muted flex items-center justify-center">
                        <span className="text-muted-foreground text-sm">
                          No photo
                        </span>
                      </div>
                    )}
                    <div className="absolute top-3 left-3">
                      <Badge className="bg-card text-foreground text-xs font-semibold">
                        {listingTypeLabel(stay.listingType)}
                      </Badge>
                    </div>
                  </div>
                  <div className="p-4">
                    <h3 className="font-display text-lg font-semibold mb-1">
                      {stay.name}
                    </h3>
                    <div className="flex items-center gap-1 text-muted-foreground text-sm mb-3">
                      <MapPin className="w-3 h-3" />
                      {stay.location}
                    </div>
                    {stay.amenities && stay.amenities.length > 0 && (
                      <div className="flex flex-wrap gap-1 mb-4">
                        {stay.amenities.slice(0, 3).map((a) => (
                          <span
                            key={a}
                            className="flex items-center gap-1 text-xs bg-muted px-2 py-0.5 rounded-full text-muted-foreground"
                          >
                            {AMENITY_ICONS[a] ?? null} {a}
                          </span>
                        ))}
                      </div>
                    )}
                    <div className="flex items-center justify-between">
                      <div>
                        <span className="font-bold text-xl text-foreground">
                          ₹{stay.pricePerNight.toLocaleString("en-IN")}
                        </span>
                        <span className="text-muted-foreground text-sm">
                          {" "}
                          /night
                        </span>
                      </div>
                      <Button size="sm" className="text-xs">
                        Book Now
                      </Button>
                    </div>
                  </div>
                </div>
              </Link>
            ))}
          </div>
        )}
      </section>

      {/* Taxi Services */}
      <section className="bg-muted py-16">
        <div className="container mx-auto px-4">
          <div className="flex items-end justify-between mb-8">
            <div>
              <p className="text-primary font-semibold text-sm uppercase tracking-widest mb-1">
                On the road
              </p>
              <h2 className="font-display text-4xl font-bold">Taxi Services</h2>
            </div>
            <Link to="/taxis" data-ocid="taxi.link">
              <Button variant="ghost" className="gap-2 text-primary">
                View all <ArrowRight className="w-4 h-4" />
              </Button>
            </Link>
          </div>

          {taxiLoading ? (
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              {[1, 2, 3].map((i) => (
                <Skeleton
                  key={i}
                  className="h-32 rounded-2xl"
                  data-ocid="taxi.loading_state"
                />
              ))}
            </div>
          ) : taxiRoutes && taxiRoutes.length > 0 ? (
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              {taxiRoutes.slice(0, 3).map((route, i) => (
                <Link
                  key={route.id}
                  to="/taxis"
                  className="block"
                  data-ocid={`taxi.item.${i + 1}`}
                >
                  <div className="bg-card rounded-2xl p-5 shadow-card listing-card-hover">
                    <div className="flex items-center gap-3 mb-3">
                      <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center">
                        <Car className="w-5 h-5 text-primary" />
                      </div>
                      <Badge variant="secondary" className="text-xs">
                        {(route.rateType as string) === "perKm"
                          ? "Per Km"
                          : "Flat Rate"}
                      </Badge>
                    </div>
                    <p className="font-semibold text-sm">
                      {route.origin} → {route.destination}
                    </p>
                    {route.estimatedKm && (
                      <p className="text-xs text-muted-foreground mt-1">
                        ~{route.estimatedKm} km
                      </p>
                    )}
                    <p className="text-primary font-bold text-lg mt-2">
                      ₹{route.rate}
                      {(route.rateType as string) === "perKm" ? "/km" : " flat"}
                    </p>
                  </div>
                </Link>
              ))}
            </div>
          ) : (
            <div
              className="text-center py-8 text-muted-foreground"
              data-ocid="taxi.empty_state"
            >
              <p>Admin panel se taxi routes add karein.</p>
            </div>
          )}
        </div>
      </section>

      {/* CTA banner */}
      <section className="container mx-auto px-4 py-16">
        <div
          className="rounded-3xl p-10 md:p-14 text-center relative overflow-hidden grain-overlay"
          style={{ background: "oklch(0.57 0.135 38)" }}
        >
          <div
            className="absolute inset-0 opacity-10"
            style={{
              background:
                "radial-gradient(circle at 30% 50%, oklch(0.82 0.1 75), transparent 60%)",
            }}
          />
          <h2 className="font-display text-4xl md:text-5xl font-bold text-white mb-4 relative z-10">
            Ready to explore?
          </h2>
          <p className="text-white/80 text-lg mb-8 max-w-lg mx-auto relative z-10">
            Browse all our curated stays and book your next adventure today.
          </p>
          <div className="flex flex-col sm:flex-row gap-3 justify-center relative z-10">
            <Link to="/stays" data-ocid="cta.primary_button">
              <Button size="lg" variant="secondary" className="font-semibold">
                Browse Stays
              </Button>
            </Link>
            <Link to="/taxis" data-ocid="cta.secondary_button">
              <Button
                size="lg"
                variant="outline"
                className="text-yellow-200 border-yellow-300/60 hover:bg-yellow-300/10 font-semibold"
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
