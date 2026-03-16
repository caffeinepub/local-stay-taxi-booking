import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Skeleton } from "@/components/ui/skeleton";
import { Link } from "@tanstack/react-router";
import { MapPin, Search, Utensils } from "lucide-react";
import { useState } from "react";
import type { ListingType } from "../backend";
import { useGetActiveListings } from "../hooks/useQueries";

export default function RestaurantsPage() {
  const { data: listings, isLoading } = useGetActiveListings();
  const [filter, setFilter] = useState<"all" | "restaurant" | "dhaba">("all");
  const [search, setSearch] = useState("");

  const filtered = (listings ?? []).filter((l) => {
    const isFood =
      l.listingType === ("restaurant" as ListingType) ||
      l.listingType === ("dhaba" as ListingType);
    if (!isFood) return false;
    if (
      filter === "restaurant" &&
      l.listingType !== ("restaurant" as ListingType)
    )
      return false;
    if (filter === "dhaba" && l.listingType !== ("dhaba" as ListingType))
      return false;
    if (search) {
      const q = search.toLowerCase();
      return (
        l.name.toLowerCase().includes(q) ||
        l.location.toLowerCase().includes(q) ||
        l.description.toLowerCase().includes(q)
      );
    }
    return true;
  });

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <section className="bg-gradient-to-br from-amber-950 via-orange-900 to-amber-800 py-14 px-4">
        <div className="container mx-auto max-w-5xl">
          <div className="flex items-center gap-3 mb-3">
            <div className="bg-amber-400/20 p-2 rounded-lg">
              <Utensils className="w-6 h-6 text-amber-300" />
            </div>
            <Badge
              variant="secondary"
              className="bg-amber-400/20 text-amber-200 border-amber-400/30"
            >
              Dine Local
            </Badge>
          </div>
          <h1 className="font-display text-4xl md:text-5xl font-bold text-amber-50 mb-2">
            Restaurants & Dhabas
          </h1>
          <p className="text-amber-200/80 text-lg">
            Authentic local flavours — from fine dining to roadside dhabas
          </p>
        </div>
      </section>

      {/* Filters */}
      <section className="container mx-auto max-w-5xl px-4 py-6">
        <div className="flex flex-col sm:flex-row gap-3 items-start sm:items-center justify-between">
          <div className="flex gap-2">
            {(["all", "restaurant", "dhaba"] as const).map((f) => (
              <Button
                key={f}
                variant={filter === f ? "default" : "outline"}
                size="sm"
                onClick={() => setFilter(f)}
                className="capitalize"
                data-ocid="restaurants.tab"
              >
                {f === "all"
                  ? "All"
                  : f === "restaurant"
                    ? "Restaurant"
                    : "Dhaba"}
              </Button>
            ))}
          </div>
          <div className="relative w-full sm:w-64">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
            <Input
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Search restaurants..."
              className="pl-9"
              data-ocid="restaurants.search_input"
            />
          </div>
        </div>
      </section>

      {/* Listings */}
      <section className="container mx-auto max-w-5xl px-4 pb-16">
        {isLoading ? (
          <div
            className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6"
            data-ocid="restaurants.loading_state"
          >
            {[1, 2, 3, 4, 5, 6].map((i) => (
              <Skeleton key={i} className="h-64 rounded-2xl" />
            ))}
          </div>
        ) : filtered.length === 0 ? (
          <div
            className="text-center py-20 text-muted-foreground"
            data-ocid="restaurants.empty_state"
          >
            <Utensils className="w-12 h-12 mx-auto mb-4 opacity-30" />
            <p className="text-lg font-medium">No restaurants found</p>
            <p className="text-sm mt-1">
              Try adjusting your search or check back later.
            </p>
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {filtered.map((listing, i) => (
              <Link
                key={listing.id}
                to="/stays/$id"
                params={{ id: listing.id }}
                className="block group"
                data-ocid={`restaurants.item.${i + 1}`}
              >
                <div className="bg-card rounded-2xl overflow-hidden shadow-sm border border-border hover:shadow-md hover:-translate-y-1 transition-all duration-200">
                  {/* Photo */}
                  <div className="relative h-44 overflow-hidden">
                    {listing.photos[0] ? (
                      <img
                        src={listing.photos[0].getDirectURL()}
                        alt={listing.name}
                        className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                      />
                    ) : (
                      <div className="w-full h-full bg-gradient-to-br from-amber-100 to-orange-100 flex items-center justify-center">
                        <Utensils className="w-10 h-10 text-amber-400" />
                      </div>
                    )}
                    <Badge className="absolute top-3 left-3 capitalize bg-amber-600/90 text-white border-0">
                      {listing.listingType as string}
                    </Badge>
                  </div>

                  {/* Content */}
                  <div className="p-4">
                    <h3 className="font-semibold text-foreground text-lg leading-tight mb-1 group-hover:text-primary transition-colors">
                      {listing.name}
                    </h3>
                    <div className="flex items-center gap-1 text-muted-foreground text-sm mb-2">
                      <MapPin className="w-3.5 h-3.5" />
                      <span>{listing.location}</span>
                    </div>
                    {/* Menu Highlights (amenities) */}
                    {listing.amenities.length > 0 && (
                      <div className="flex flex-wrap gap-1 mb-3">
                        {listing.amenities.slice(0, 3).map((a) => (
                          <Badge
                            key={a}
                            variant="secondary"
                            className="text-xs"
                          >
                            {a}
                          </Badge>
                        ))}
                        {listing.amenities.length > 3 && (
                          <Badge variant="secondary" className="text-xs">
                            +{listing.amenities.length - 3} more
                          </Badge>
                        )}
                      </div>
                    )}

                    <div className="flex items-center justify-between">
                      <div>
                        <span className="font-bold text-foreground">
                          ₹{listing.pricePerNight.toLocaleString("en-IN")}
                        </span>
                        <span className="text-muted-foreground text-sm">
                          {" "}
                          /person
                        </span>
                      </div>
                      <Button size="sm" variant="outline" className="text-xs">
                        View Menu
                      </Button>
                    </div>
                  </div>
                </div>
              </Link>
            ))}
          </div>
        )}
      </section>
    </div>
  );
}
