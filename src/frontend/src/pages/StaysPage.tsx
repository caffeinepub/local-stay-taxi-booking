import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Skeleton } from "@/components/ui/skeleton";
import { Slider } from "@/components/ui/slider";
import { Link } from "@tanstack/react-router";
import {
  Bath,
  Coffee,
  Dumbbell,
  MapPin,
  MessageCircle,
  Phone,
  Star,
  Tv,
  Utensils,
  Wifi,
  Wind,
} from "lucide-react";
import { useState } from "react";
import type { Listing, ListingType } from "../backend";
import {
  useGetActiveListings,
  useGetAllListingPhones,
} from "../hooks/useQueries";

const AMENITY_ICONS: Record<string, React.ReactNode> = {
  WiFi: <Wifi className="w-3 h-3" />,
  Breakfast: <Coffee className="w-3 h-3" />,
  Restaurant: <Utensils className="w-3 h-3" />,
  "Attached Bathroom": <Bath className="w-3 h-3" />,
  TV: <Tv className="w-3 h-3" />,
  "Air Conditioning": <Wind className="w-3 h-3" />,
  Gym: <Dumbbell className="w-3 h-3" />,
};

function ListingCardSkeleton() {
  return (
    <div
      className="bg-card rounded-2xl overflow-hidden shadow-card"
      data-ocid="stays.loading_state"
    >
      <Skeleton className="h-52 w-full" />
      <div className="p-4 space-y-3">
        <Skeleton className="h-5 w-3/4" />
        <Skeleton className="h-4 w-1/2" />
        <Skeleton className="h-4 w-full" />
        <Skeleton className="h-8 w-1/3" />
      </div>
    </div>
  );
}

function ListingCard({
  listing,
  index,
  contactPhone,
}: { listing: Listing; index: number; contactPhone?: string }) {
  const photo = listing.photos[0];
  const imgSrc = photo
    ? photo.getDirectURL()
    : "/assets/generated/listing-hotel-room.dim_800x600.jpg";
  return (
    <div
      className="bg-card rounded-2xl overflow-hidden shadow-card listing-card-hover"
      data-ocid={`stays.item.${index + 1}`}
    >
      <div className="relative h-52 overflow-hidden">
        <img
          src={imgSrc}
          alt={listing.name}
          className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
        />
        <div className="absolute top-3 left-3">
          <Badge className="bg-card text-foreground text-xs font-semibold capitalize">
            {listing.listingType as string}
          </Badge>
        </div>
      </div>
      <div className="p-4">
        <h3 className="font-display text-lg font-semibold mb-1 truncate">
          {listing.name}
        </h3>
        <div className="flex items-center gap-1 text-muted-foreground text-sm mb-3">
          <MapPin className="w-3 h-3 shrink-0" />
          <span className="truncate">{listing.location}</span>
        </div>
        <p className="text-muted-foreground text-sm line-clamp-2 mb-3">
          {listing.description}
        </p>
        <div className="flex flex-wrap gap-1 mb-4">
          {listing.amenities.slice(0, 4).map((a) => (
            <span
              key={a}
              className="flex items-center gap-1 text-xs bg-muted px-2 py-0.5 rounded-full text-muted-foreground"
            >
              {AMENITY_ICONS[a] ?? null} {a}
            </span>
          ))}
          {listing.amenities.length > 4 && (
            <span className="text-xs bg-muted px-2 py-0.5 rounded-full text-muted-foreground">
              +{listing.amenities.length - 4} more
            </span>
          )}
        </div>
        <div className="flex items-center justify-between">
          <div>
            <span className="font-bold text-xl">
              ₹{listing.pricePerNight.toLocaleString("en-IN")}
            </span>
            <span className="text-muted-foreground text-sm"> /night</span>
          </div>
          <Link
            to="/stays/$id"
            params={{ id: listing.id }}
            data-ocid={`stays.item.${index + 1}`}
          >
            <Button size="sm">View Details</Button>
          </Link>
        </div>
        {contactPhone && (
          <div className="flex gap-2 mt-2">
            <a
              href={`tel:${contactPhone}`}
              className="flex-1 flex items-center justify-center gap-1.5 text-xs font-semibold py-2 rounded-lg bg-green-600 hover:bg-green-700 text-white transition-colors"
              data-ocid="stays.button"
            >
              <Phone className="w-3.5 h-3.5" /> Call
            </a>
            <a
              href={`https://wa.me/${(contactPhone ?? "").replace(/\D/g, "")}`}
              target="_blank"
              rel="noopener noreferrer"
              className="flex-1 flex items-center justify-center gap-1.5 text-xs font-semibold py-2 rounded-lg bg-emerald-500 hover:bg-emerald-600 text-white transition-colors"
              data-ocid="stays.button"
            >
              <MessageCircle className="w-3.5 h-3.5" /> WhatsApp
            </a>
          </div>
        )}
      </div>
    </div>
  );
}

export default function StaysPage() {
  const { data: listings, isLoading } = useGetActiveListings();
  const { data: listingPhones } = useGetAllListingPhones();
  const phoneMap = Object.fromEntries(listingPhones ?? []);
  const [typeFilter, setTypeFilter] = useState<string>("all");
  const [locationSearch, setLocationSearch] = useState("");
  const [priceRange, setPriceRange] = useState([0, 50000]);

  const filtered = (listings ?? []).filter((l) => {
    if (
      typeFilter !== "all" &&
      (l.listingType as string) !== (typeFilter as string)
    )
      return false;
    if (
      locationSearch &&
      !l.location.toLowerCase().includes(locationSearch.toLowerCase()) &&
      !l.name.toLowerCase().includes(locationSearch.toLowerCase())
    )
      return false;
    if (l.pricePerNight < priceRange[0] || l.pricePerNight > priceRange[1])
      return false;
    return true;
  });

  return (
    <div className="container mx-auto px-4 py-10">
      <div className="mb-8">
        <p className="text-primary font-semibold text-sm uppercase tracking-widest mb-1">
          Browse
        </p>
        <h1 className="font-display text-4xl md:text-5xl font-bold">
          All Stays
        </h1>
      </div>

      {/* Filter bar */}
      <div className="bg-card rounded-2xl p-4 md:p-5 shadow-card mb-8 flex flex-col md:flex-row gap-4 items-start md:items-end">
        <div className="flex gap-2">
          {(["all", "hotel", "homestay"] as const).map((t) => (
            <Button
              key={t}
              variant={typeFilter === t ? "default" : "outline"}
              size="sm"
              onClick={() => setTypeFilter(t)}
              className="capitalize"
              data-ocid="filter.tab"
            >
              {t === "all" ? "All" : t.charAt(0).toUpperCase() + t.slice(1)}
            </Button>
          ))}
        </div>
        <div className="flex-1 min-w-[180px]">
          <Input
            placeholder="Search by location or name..."
            value={locationSearch}
            onChange={(e) => setLocationSearch(e.target.value)}
            className="bg-muted border-0"
            data-ocid="filter.search_input"
          />
        </div>
        <div className="w-full md:w-56">
          <label
            htmlFor="price-slider"
            className="text-xs text-muted-foreground mb-2 block"
          >
            Price: ₹{priceRange[0].toLocaleString("en-IN")} – ₹
            {priceRange[1].toLocaleString("en-IN")}/night
          </label>
          <Slider
            min={0}
            max={50000}
            step={500}
            value={priceRange}
            onValueChange={setPriceRange}
            className="w-full"
            id="price-slider"
            data-ocid="filter.toggle"
          />
        </div>
      </div>

      {isLoading ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {[1, 2, 3, 4, 5, 6].map((i) => (
            <ListingCardSkeleton key={i} />
          ))}
        </div>
      ) : filtered.length === 0 ? (
        <div className="text-center py-20" data-ocid="stays.empty_state">
          <div className="text-6xl mb-4">🏡</div>
          <h3 className="font-display text-2xl font-semibold mb-2">
            No stays found
          </h3>
          <p className="text-muted-foreground mb-6">
            {listings?.length === 0
              ? "No listings have been added yet. Check back soon or contact the admin."
              : "Try adjusting your filters."}
          </p>
          <Button
            variant="outline"
            onClick={() => {
              setTypeFilter("all");
              setLocationSearch("");
              setPriceRange([0, 50000]);
            }}
          >
            Clear Filters
          </Button>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filtered.map((listing, i) => (
            <ListingCard
              key={listing.id}
              listing={listing}
              index={i}
              contactPhone={phoneMap[listing.id]}
            />
          ))}
        </div>
      )}
    </div>
  );
}
