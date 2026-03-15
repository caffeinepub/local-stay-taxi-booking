import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Skeleton } from "@/components/ui/skeleton";
import { Link, useNavigate } from "@tanstack/react-router";
import {
  ArrowRight,
  Car,
  Coffee,
  MapPin,
  Search,
  Star,
  Utensils,
  Wifi,
} from "lucide-react";
import { useState } from "react";
import type { TaxiRateType } from "../backend";
import {
  useGetActiveListings,
  useGetActiveTaxiRoutes,
} from "../hooks/useQueries";

const SAMPLE_STAYS = [
  {
    id: "sample-1",
    name: "Mountain View Homestay",
    type: "Homestay",
    location: "Hilltop Village",
    price: 45,
    rating: 4.9,
    image: "/assets/generated/listing-homestay-1.dim_800x600.jpg",
    amenities: ["WiFi", "Breakfast", "Garden"],
  },
  {
    id: "sample-2",
    name: "The Terracotta Boutique",
    type: "Hotel",
    location: "Old Town Quarter",
    price: 89,
    rating: 4.8,
    image: "/assets/generated/listing-hotel-room.dim_800x600.jpg",
    amenities: ["WiFi", "Pool", "Restaurant"],
  },
  {
    id: "sample-3",
    name: "Pine Ridge Resort",
    type: "Hotel",
    location: "Forest Trail, Eastwood",
    price: 120,
    rating: 4.7,
    image: "/assets/generated/listing-hotel-2.dim_800x600.jpg",
    amenities: ["WiFi", "Spa", "Mountain View"],
  },
];

const AMENITY_ICONS: Record<string, React.ReactNode> = {
  WiFi: <Wifi className="w-3 h-3" />,
  Breakfast: <Coffee className="w-3 h-3" />,
  Restaurant: <Utensils className="w-3 h-3" />,
};

export default function HomePage() {
  const navigate = useNavigate();
  const [location, setLocation] = useState("");
  const [checkIn, setCheckIn] = useState("");
  const [checkOut, setCheckOut] = useState("");
  const guests = "1";

  const { data: taxiRoutes, isLoading: taxiLoading } = useGetActiveTaxiRoutes();

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    navigate({
      to: "/stays",
      search: { location, checkIn, checkOut, guests },
    } as any);
  };

  return (
    <div>
      {/* Hero */}
      <section
        className="relative min-h-[600px] flex items-center justify-center grain-overlay"
        style={{
          backgroundImage: `url('/assets/generated/hero-homestay.dim_1600x800.jpg')`,
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
            <h1 className="font-display text-5xl md:text-7xl font-bold text-white mb-4 leading-tight">
              Find Your Perfect
              <span className="block italic font-light">Home Away</span>
            </h1>
            <p className="text-white/80 text-lg md:text-xl mb-10 max-w-xl mx-auto">
              Discover cozy homestays, boutique hotels, and reliable taxis — all
              in one place.
            </p>
          </div>

          {/* Search form */}
          <form
            onSubmit={handleSearch}
            className="bg-card rounded-2xl p-4 md:p-5 shadow-warm max-w-3xl mx-auto"
            data-ocid="search.panel"
          >
            <div className="grid grid-cols-1 md:grid-cols-4 gap-3">
              <div className="relative md:col-span-1">
                <MapPin className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                <Input
                  placeholder="Where to?"
                  value={location}
                  onChange={(e) => setLocation(e.target.value)}
                  className="pl-9 bg-muted border-0 focus-visible:ring-primary"
                  data-ocid="search.input"
                />
              </div>
              <div>
                <Input
                  type="date"
                  value={checkIn}
                  onChange={(e) => setCheckIn(e.target.value)}
                  className="bg-muted border-0 focus-visible:ring-primary"
                  data-ocid="search.input"
                />
              </div>
              <div>
                <Input
                  type="date"
                  value={checkOut}
                  onChange={(e) => setCheckOut(e.target.value)}
                  className="bg-muted border-0 focus-visible:ring-primary"
                  data-ocid="search.input"
                />
              </div>
              <Button
                type="submit"
                className="w-full"
                data-ocid="search.primary_button"
              >
                <Search className="w-4 h-4 mr-2" /> Search
              </Button>
            </div>
          </form>
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

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {SAMPLE_STAYS.map((stay, i) => (
            <Link
              key={stay.id}
              to="/stays"
              className="group block"
              data-ocid={`featured.item.${i + 1}`}
            >
              <div className="bg-card rounded-2xl overflow-hidden shadow-card listing-card-hover">
                <div className="relative h-52 overflow-hidden">
                  <img
                    src={stay.image}
                    alt={stay.name}
                    className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                  />
                  <div className="absolute top-3 left-3">
                    <Badge className="bg-card text-foreground text-xs font-semibold">
                      {stay.type}
                    </Badge>
                  </div>
                  <div className="absolute top-3 right-3 flex items-center gap-1 bg-card/90 rounded-full px-2 py-0.5 text-xs font-semibold">
                    <Star className="w-3 h-3 fill-accent text-accent" />
                    {stay.rating}
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
                  <div className="flex flex-wrap gap-1 mb-4">
                    {stay.amenities.map((a) => (
                      <span
                        key={a}
                        className="flex items-center gap-1 text-xs bg-muted px-2 py-0.5 rounded-full text-muted-foreground"
                      >
                        {AMENITY_ICONS[a] ?? null} {a}
                      </span>
                    ))}
                  </div>
                  <div className="flex items-center justify-between">
                    <div>
                      <span className="font-bold text-xl text-foreground">
                        ${stay.price}
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
                      ${route.rate}
                      {(route.rateType as string) === "perKm" ? "/km" : " flat"}
                    </p>
                  </div>
                </Link>
              ))}
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              {[
                {
                  from: "Airport",
                  to: "City Center",
                  price: "$25 flat",
                  km: "18 km",
                },
                {
                  from: "City Center",
                  to: "Mountain Resort",
                  price: "$1.50/km",
                  km: "~45 km",
                },
                {
                  from: "Bus Station",
                  to: "Beach Town",
                  price: "$30 flat",
                  km: "22 km",
                },
              ].map((route, i) => (
                <Link
                  key={route.from}
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
                        Sample Route
                      </Badge>
                    </div>
                    <p className="font-semibold text-sm">
                      {route.from} → {route.to}
                    </p>
                    <p className="text-xs text-muted-foreground mt-1">
                      {route.km}
                    </p>
                    <p className="text-primary font-bold text-lg mt-2">
                      {route.price}
                    </p>
                  </div>
                </Link>
              ))}
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
                className="text-white border-white/40 hover:bg-white/10 font-semibold"
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
