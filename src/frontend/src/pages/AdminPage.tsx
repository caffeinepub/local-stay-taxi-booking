import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import {
  Dialog,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Skeleton } from "@/components/ui/skeleton";
import { Switch } from "@/components/ui/switch";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Textarea } from "@/components/ui/textarea";
import { useQueryClient } from "@tanstack/react-query";
import { Check, Loader2, Pencil, Plus, Trash2, X } from "lucide-react";
import { useEffect, useRef, useState } from "react";
import { toast } from "sonner";
import {
  type BookingStatus,
  BookingType,
  ExternalBlob,
  type ListingType,
  type TaxiRateType,
} from "../backend";
import type { Booking, Listing, TaxiRoute } from "../backend";
import { useInternetIdentity } from "../hooks/useInternetIdentity";
import {
  useClaimFirstAdmin,
  useCreateListing,
  useCreateTaxiRoute,
  useDeleteBooking,
  useDeleteListing,
  useDeleteTaxiRoute,
  useGetActiveListings,
  useGetActiveTaxiRoutes,
  useGetAllBookings,
  useIsCallerAdmin,
  useUpdateBookingStatus,
  useUpdateListing,
  useUpdateTaxiRoute,
} from "../hooks/useQueries";

// ─── Listing Form ────────────────────────────────────────────────────────────

interface ListingFormData {
  name: string;
  listingType: string;
  location: string;
  description: string;
  amenities: string[];
  pricePerNight: string;
  isActive: boolean;
  photos: ExternalBlob[];
}

const defaultListingForm = (): ListingFormData => ({
  name: "",
  listingType: "hotel",
  location: "",
  description: "",
  amenities: [],
  pricePerNight: "",
  isActive: true,
  photos: [],
});

function ListingFormDialog({
  open,
  onClose,
  existing,
  defaultListingType,
}: {
  open: boolean;
  onClose: () => void;
  existing?: Listing;
  defaultListingType?: string;
}) {
  const createListing = useCreateListing();
  const updateListing = useUpdateListing();
  const fileRef = useRef<HTMLInputElement>(null);

  const [form, setForm] = useState<ListingFormData>(() =>
    existing
      ? {
          name: existing.name,
          listingType: existing.listingType as string,
          location: existing.location,
          description: existing.description,
          amenities: existing.amenities,
          pricePerNight: String(existing.pricePerNight),
          isActive: existing.isActive,
          photos: existing.photos,
        }
      : {
          ...defaultListingForm(),
          ...(defaultListingType ? { listingType: defaultListingType } : {}),
        },
  );
  const [uploadProgress, setUploadProgress] = useState<number[]>([]);

  const handleFileAdd = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(e.target.files ?? []);
    if (!files.length) return;
    const newProgress = files.map(() => 0);
    setUploadProgress((p) => [...p, ...newProgress]);
    const blobs = await Promise.all(
      files.map(async (file, i) => {
        const buffer = await file.arrayBuffer();
        const blob = ExternalBlob.fromBytes(
          new Uint8Array(buffer),
        ).withUploadProgress((pct) => {
          setUploadProgress((prev) => {
            const next = [...prev];
            next[prev.length - files.length + i] = pct;
            return next;
          });
        });
        return blob;
      }),
    );
    setForm((f) => ({ ...f, photos: [...f.photos, ...blobs] }));
    setUploadProgress([]);
    if (fileRef.current) fileRef.current.value = "";
  };

  const removePhoto = (i: number) =>
    setForm((f) => ({ ...f, photos: f.photos.filter((_, idx) => idx !== i) }));

  const handleSave = async () => {
    if (!form.name || !form.location || !form.pricePerNight) {
      toast.error("Please fill in all required fields.");
      return;
    }
    const payload: Listing = {
      id: existing?.id ?? crypto.randomUUID(),
      name: form.name,
      listingType: form.listingType as ListingType,
      location: form.location,
      description: form.description,
      amenities: form.amenities,
      pricePerNight: Number.parseFloat(form.pricePerNight) || 0,
      isActive: form.isActive,
      photos: form.photos,
    };
    try {
      if (existing) {
        await updateListing.mutateAsync({ id: existing.id, listing: payload });
        toast.success("Listing updated!");
      } else {
        await createListing.mutateAsync(payload);
        toast.success("Listing created!");
      }
      onClose();
    } catch {
      toast.error("Failed to save listing.");
    }
  };

  const isPending = createListing.isPending || updateListing.isPending;

  return (
    <Dialog open={open} onOpenChange={(o) => !o && onClose()}>
      <DialogContent
        className="max-w-lg max-h-[90vh] overflow-y-auto"
        data-ocid="listing.dialog"
      >
        <DialogHeader>
          <DialogTitle className="font-display text-xl">
            {existing ? "Edit Listing" : "Add New Listing"}
          </DialogTitle>
        </DialogHeader>
        <div className="space-y-4 py-2">
          <div>
            <Label>Name *</Label>
            <Input
              value={form.name}
              onChange={(e) => setForm((f) => ({ ...f, name: e.target.value }))}
              placeholder="Mountain View Homestay"
              data-ocid="listing.input"
            />
          </div>
          <div className="grid grid-cols-2 gap-3">
            <div>
              <Label>Type *</Label>
              <Select
                value={form.listingType}
                onValueChange={(v) =>
                  setForm((f) => ({ ...f, listingType: v }))
                }
              >
                <SelectTrigger data-ocid="listing.select">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="hotel">Hotel</SelectItem>
                  <SelectItem value="homestay">Homestay</SelectItem>
                  <SelectItem value="restaurant">Restaurant</SelectItem>
                  <SelectItem value="dhaba">Dhaba</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div>
              <Label>
                {["restaurant", "dhaba"].includes(form.listingType)
                  ? "Price / person (₹) *"
                  : "Price / night (₹) *"}
              </Label>
              <Input
                type="number"
                min="0"
                value={form.pricePerNight}
                onChange={(e) =>
                  setForm((f) => ({ ...f, pricePerNight: e.target.value }))
                }
                placeholder="75"
                data-ocid="listing.input"
              />
            </div>
          </div>
          <div>
            <Label>Location *</Label>
            <Input
              value={form.location}
              onChange={(e) =>
                setForm((f) => ({ ...f, location: e.target.value }))
              }
              placeholder="Old Town, City"
              data-ocid="listing.input"
            />
          </div>
          <div>
            <Label>Description</Label>
            <Textarea
              value={form.description}
              onChange={(e) =>
                setForm((f) => ({ ...f, description: e.target.value }))
              }
              rows={3}
              placeholder="Describe the property..."
              data-ocid="listing.textarea"
            />
          </div>
          <div>
            <Label className="mb-2 block">Facilities / Amenities</Label>
            <div className="grid grid-cols-2 gap-2">
              {[
                "WiFi",
                "Breakfast",
                "Parking",
                "AC",
                "Geyser",
                "Room Heater",
                "Hot Water",
                "Swimming Pool",
                "Gym",
                "Restaurant",
                "Room Service",
                "Laundry",
                "TV",
                "Kitchen",
                "Garden View",
                "Mountain View",
              ].map((facility) => (
                <label
                  key={facility}
                  htmlFor={`facility-${facility}`}
                  className="flex items-center gap-2 cursor-pointer select-none"
                >
                  <Checkbox
                    id={`facility-${facility}`}
                    checked={form.amenities.includes(facility)}
                    onCheckedChange={(checked) =>
                      setForm((f) => ({
                        ...f,
                        amenities: checked
                          ? [...f.amenities, facility]
                          : f.amenities.filter((a) => a !== facility),
                      }))
                    }
                    data-ocid={"listing.checkbox"}
                  />
                  <span className="text-sm">{facility}</span>
                </label>
              ))}
            </div>
          </div>
          <div className="flex items-center gap-3">
            <Switch
              id="isActive"
              checked={form.isActive}
              onCheckedChange={(v) => setForm((f) => ({ ...f, isActive: v }))}
              data-ocid="listing.switch"
            />
            <Label htmlFor="isActive">Active (visible to guests)</Label>
          </div>

          {/* Photos */}
          <div>
            <Label className="mb-2 block">Photos</Label>
            {form.photos.length > 0 && (
              <div className="flex flex-wrap gap-2 mb-3">
                {form.photos.map((photo, i) => (
                  <div
                    // biome-ignore lint/suspicious/noArrayIndexKey: photos don't have stable IDs
                    key={`photo-upload-${i}`}
                    className="relative w-20 h-20 rounded-lg overflow-hidden border border-border"
                  >
                    <img
                      src={photo.getDirectURL()}
                      alt=""
                      className="w-full h-full object-cover"
                    />
                    <button
                      type="button"
                      onClick={() => removePhoto(i)}
                      className="absolute top-0.5 right-0.5 bg-destructive text-destructive-foreground rounded-full w-5 h-5 flex items-center justify-center"
                      data-ocid="listing.delete_button"
                    >
                      <X className="w-3 h-3" />
                    </button>
                  </div>
                ))}
              </div>
            )}
            <input
              ref={fileRef}
              type="file"
              accept="image/*"
              multiple
              className="hidden"
              onChange={handleFileAdd}
            />
            <Button
              type="button"
              variant="outline"
              size="sm"
              onClick={() => fileRef.current?.click()}
              data-ocid="listing.upload_button"
            >
              <Plus className="w-4 h-4 mr-2" /> Add Photos
            </Button>
            {uploadProgress.length > 0 && (
              <p className="text-xs text-muted-foreground mt-1">Uploading...</p>
            )}
          </div>
        </div>
        <DialogFooter>
          <Button
            variant="outline"
            onClick={onClose}
            data-ocid="listing.cancel_button"
          >
            Cancel
          </Button>
          <Button
            onClick={handleSave}
            disabled={isPending}
            data-ocid="listing.save_button"
          >
            {isPending ? (
              <>
                <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                Saving...
              </>
            ) : (
              "Save Listing"
            )}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}

// ─── Taxi Route Form ─────────────────────────────────────────────────────────

interface TaxiFormData {
  origin: string;
  destination: string;
  rateType: string;
  rate: string;
  estimatedKm: string;
  isActive: boolean;
}

const defaultTaxiForm = (): TaxiFormData => ({
  origin: "",
  destination: "",
  rateType: "flat",
  rate: "",
  estimatedKm: "",
  isActive: true,
});

function TaxiFormDialog({
  open,
  onClose,
  existing,
}: {
  open: boolean;
  onClose: () => void;
  existing?: TaxiRoute;
}) {
  const createRoute = useCreateTaxiRoute();
  const updateRoute = useUpdateTaxiRoute();
  const [form, setForm] = useState<TaxiFormData>(() =>
    existing
      ? {
          origin: existing.origin,
          destination: existing.destination,
          rateType: existing.rateType as string,
          rate: String(existing.rate),
          estimatedKm: existing.estimatedKm ? String(existing.estimatedKm) : "",
          isActive: existing.isActive,
        }
      : defaultTaxiForm(),
  );

  const handleSave = async () => {
    if (!form.origin || !form.destination || !form.rate) {
      toast.error("Please fill in all required fields.");
      return;
    }
    const payload: TaxiRoute = {
      id: existing?.id ?? crypto.randomUUID(),
      origin: form.origin,
      destination: form.destination,
      rateType: form.rateType as TaxiRateType,
      rate: Number.parseFloat(form.rate) || 0,
      estimatedKm: form.estimatedKm
        ? Number.parseFloat(form.estimatedKm)
        : undefined,
      isActive: form.isActive,
    };
    try {
      if (existing) {
        await updateRoute.mutateAsync({ id: existing.id, route: payload });
        toast.success("Route updated!");
      } else {
        await createRoute.mutateAsync(payload);
        toast.success("Route created!");
      }
      onClose();
    } catch {
      toast.error("Failed to save route.");
    }
  };

  const isPending = createRoute.isPending || updateRoute.isPending;

  return (
    <Dialog open={open} onOpenChange={(o) => !o && onClose()}>
      <DialogContent className="max-w-md" data-ocid="taxi.dialog">
        <DialogHeader>
          <DialogTitle className="font-display text-xl">
            {existing ? "Edit Route" : "Add Taxi Route"}
          </DialogTitle>
        </DialogHeader>
        <div className="space-y-4 py-2">
          <div className="grid grid-cols-2 gap-3">
            <div>
              <Label>Origin *</Label>
              <Input
                value={form.origin}
                onChange={(e) =>
                  setForm((f) => ({ ...f, origin: e.target.value }))
                }
                placeholder="Airport"
                data-ocid="taxi.input"
              />
            </div>
            <div>
              <Label>Destination *</Label>
              <Input
                value={form.destination}
                onChange={(e) =>
                  setForm((f) => ({ ...f, destination: e.target.value }))
                }
                placeholder="City Center"
                data-ocid="taxi.input"
              />
            </div>
          </div>
          <div className="grid grid-cols-2 gap-3">
            <div>
              <Label>Rate Type *</Label>
              <Select
                value={form.rateType}
                onValueChange={(v) => setForm((f) => ({ ...f, rateType: v }))}
              >
                <SelectTrigger data-ocid="taxi.select">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="flat">Flat Rate</SelectItem>
                  <SelectItem value="perKm">Per Km</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div>
              <Label>Rate (₹) *</Label>
              <Input
                type="number"
                min="0"
                step="0.01"
                value={form.rate}
                onChange={(e) =>
                  setForm((f) => ({ ...f, rate: e.target.value }))
                }
                placeholder="25"
                data-ocid="taxi.input"
              />
            </div>
          </div>
          <div>
            <Label>Estimated Km (optional)</Label>
            <Input
              type="number"
              min="0"
              value={form.estimatedKm}
              onChange={(e) =>
                setForm((f) => ({ ...f, estimatedKm: e.target.value }))
              }
              placeholder="18"
              data-ocid="taxi.input"
            />
          </div>
          <div className="flex items-center gap-3">
            <Switch
              id="taxiActive"
              checked={form.isActive}
              onCheckedChange={(v) => setForm((f) => ({ ...f, isActive: v }))}
              data-ocid="taxi.switch"
            />
            <Label htmlFor="taxiActive">Active</Label>
          </div>
        </div>
        <DialogFooter>
          <Button
            variant="outline"
            onClick={onClose}
            data-ocid="taxi.cancel_button"
          >
            Cancel
          </Button>
          <Button
            onClick={handleSave}
            disabled={isPending}
            data-ocid="taxi.save_button"
          >
            {isPending ? (
              <>
                <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                Saving...
              </>
            ) : (
              "Save Route"
            )}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}

// ─── Delete Confirm ───────────────────────────────────────────────────────────

function DeleteConfirmDialog({
  open,
  onClose,
  onConfirm,
  label,
  isPending,
}: {
  open: boolean;
  onClose: () => void;
  onConfirm: () => void;
  label: string;
  isPending: boolean;
}) {
  return (
    <Dialog open={open} onOpenChange={(o) => !o && onClose()}>
      <DialogContent className="max-w-sm" data-ocid="delete.dialog">
        <DialogHeader>
          <DialogTitle>Delete {label}?</DialogTitle>
        </DialogHeader>
        <p className="text-muted-foreground text-sm">
          This action cannot be undone.
        </p>
        <DialogFooter>
          <Button
            variant="outline"
            onClick={onClose}
            data-ocid="delete.cancel_button"
          >
            Cancel
          </Button>
          <Button
            variant="destructive"
            onClick={onConfirm}
            disabled={isPending}
            data-ocid="delete.confirm_button"
          >
            {isPending ? (
              <Loader2 className="w-4 h-4 animate-spin" />
            ) : (
              "Delete"
            )}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}

// ─── Listings Tab ─────────────────────────────────────────────────────────────

function ListingsTab() {
  const { data: listings, isLoading } = useGetActiveListings();
  const deleteListing = useDeleteListing();
  const [formOpen, setFormOpen] = useState(false);
  const [editTarget, setEditTarget] = useState<Listing | undefined>();
  const [deleteTarget, setDeleteTarget] = useState<string | null>(null);

  const openEdit = (l: Listing) => {
    setEditTarget(l);
    setFormOpen(true);
  };
  const openAdd = () => {
    setEditTarget(undefined);
    setFormOpen(true);
  };
  const handleDelete = async () => {
    if (!deleteTarget) return;
    try {
      await deleteListing.mutateAsync(deleteTarget);
      toast.success("Listing deleted.");
      setDeleteTarget(null);
    } catch {
      toast.error("Failed to delete listing.");
    }
  };

  return (
    <div>
      <div className="flex justify-between items-center mb-4">
        <h2 className="font-display text-xl font-semibold">Listings</h2>
        <Button
          onClick={openAdd}
          size="sm"
          data-ocid="listings.open_modal_button"
        >
          <Plus className="w-4 h-4 mr-2" /> Add Listing
        </Button>
      </div>

      {isLoading ? (
        <div className="space-y-2">
          {[1, 2, 3].map((i) => (
            <Skeleton
              key={i}
              className="h-12 rounded-lg"
              data-ocid="listings.loading_state"
            />
          ))}
        </div>
      ) : !listings?.length ? (
        <div
          className="text-center py-12 text-muted-foreground"
          data-ocid="listings.empty_state"
        >
          No listings yet. Add one to get started.
        </div>
      ) : (
        <div className="rounded-xl border border-border overflow-hidden">
          <Table data-ocid="listings.table">
            <TableHeader>
              <TableRow>
                <TableHead>Photo</TableHead>
                <TableHead>Name</TableHead>
                <TableHead>Type</TableHead>
                <TableHead>Location</TableHead>
                <TableHead>Price/night</TableHead>
                <TableHead>Active</TableHead>
                <TableHead>Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {listings.map((l, i) => (
                <TableRow key={l.id} data-ocid={`listings.row.${i + 1}`}>
                  <TableCell>
                    {l.photos[0] ? (
                      <img
                        src={l.photos[0].getDirectURL()}
                        alt=""
                        className="w-12 h-10 object-cover rounded-md"
                      />
                    ) : (
                      <div className="w-12 h-10 bg-muted rounded-md" />
                    )}
                  </TableCell>
                  <TableCell className="font-medium">{l.name}</TableCell>
                  <TableCell>
                    <Badge variant="secondary" className="capitalize">
                      {l.listingType as string}
                    </Badge>
                  </TableCell>
                  <TableCell className="text-muted-foreground text-sm">
                    {l.location}
                  </TableCell>
                  <TableCell>
                    ₹{l.pricePerNight.toLocaleString("en-IN")}
                  </TableCell>
                  <TableCell>
                    {l.isActive ? (
                      <Check className="w-4 h-4 text-green-600" />
                    ) : (
                      <X className="w-4 h-4 text-muted-foreground" />
                    )}
                  </TableCell>
                  <TableCell>
                    <div className="flex gap-2">
                      <Button
                        variant="ghost"
                        size="icon"
                        onClick={() => openEdit(l)}
                        data-ocid={`listings.edit_button.${i + 1}`}
                      >
                        <Pencil className="w-4 h-4" />
                      </Button>
                      <Button
                        variant="ghost"
                        size="icon"
                        onClick={() => setDeleteTarget(l.id)}
                        data-ocid={`listings.delete_button.${i + 1}`}
                      >
                        <Trash2 className="w-4 h-4 text-destructive" />
                      </Button>
                    </div>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </div>
      )}

      <ListingFormDialog
        open={formOpen}
        onClose={() => setFormOpen(false)}
        existing={editTarget}
      />
      <DeleteConfirmDialog
        open={!!deleteTarget}
        onClose={() => setDeleteTarget(null)}
        onConfirm={handleDelete}
        label="Listing"
        isPending={deleteListing.isPending}
      />
    </div>
  );
}

// ─── Taxi Routes Tab ──────────────────────────────────────────────────────────

function TaxiRoutesTab() {
  const { data: routes, isLoading } = useGetActiveTaxiRoutes();
  const deleteRoute = useDeleteTaxiRoute();
  const [formOpen, setFormOpen] = useState(false);
  const [editTarget, setEditTarget] = useState<TaxiRoute | undefined>();
  const [deleteTarget, setDeleteTarget] = useState<string | null>(null);

  const openEdit = (r: TaxiRoute) => {
    setEditTarget(r);
    setFormOpen(true);
  };
  const openAdd = () => {
    setEditTarget(undefined);
    setFormOpen(true);
  };
  const handleDelete = async () => {
    if (!deleteTarget) return;
    try {
      await deleteRoute.mutateAsync(deleteTarget);
      toast.success("Route deleted.");
      setDeleteTarget(null);
    } catch {
      toast.error("Failed to delete route.");
    }
  };

  return (
    <div>
      <div className="flex justify-between items-center mb-4">
        <h2 className="font-display text-xl font-semibold">Taxi Routes</h2>
        <Button
          onClick={openAdd}
          size="sm"
          data-ocid="routes.open_modal_button"
        >
          <Plus className="w-4 h-4 mr-2" /> Add Route
        </Button>
      </div>

      {isLoading ? (
        <div className="space-y-2">
          {[1, 2].map((i) => (
            <Skeleton
              key={i}
              className="h-12 rounded-lg"
              data-ocid="routes.loading_state"
            />
          ))}
        </div>
      ) : !routes?.length ? (
        <div
          className="text-center py-12 text-muted-foreground"
          data-ocid="routes.empty_state"
        >
          No taxi routes yet.
        </div>
      ) : (
        <div className="rounded-xl border border-border overflow-hidden">
          <Table data-ocid="routes.table">
            <TableHeader>
              <TableRow>
                <TableHead>Origin</TableHead>
                <TableHead>Destination</TableHead>
                <TableHead>Rate Type</TableHead>
                <TableHead>Rate</TableHead>
                <TableHead>Est. Km</TableHead>
                <TableHead>Active</TableHead>
                <TableHead>Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {routes.map((r, i) => (
                <TableRow key={r.id} data-ocid={`routes.row.${i + 1}`}>
                  <TableCell className="font-medium">{r.origin}</TableCell>
                  <TableCell>{r.destination}</TableCell>
                  <TableCell>
                    <Badge variant="secondary">
                      {(r.rateType as string) === "perKm" ? "Per Km" : "Flat"}
                    </Badge>
                  </TableCell>
                  <TableCell>
                    ₹{r.rate.toLocaleString("en-IN")}
                    {(r.rateType as string) === "perKm" ? "/km" : ""}
                  </TableCell>
                  <TableCell className="text-muted-foreground">
                    {r.estimatedKm ?? "—"}
                  </TableCell>
                  <TableCell>
                    {r.isActive ? (
                      <Check className="w-4 h-4 text-green-600" />
                    ) : (
                      <X className="w-4 h-4 text-muted-foreground" />
                    )}
                  </TableCell>
                  <TableCell>
                    <div className="flex gap-2">
                      <Button
                        variant="ghost"
                        size="icon"
                        onClick={() => openEdit(r)}
                        data-ocid={`routes.edit_button.${i + 1}`}
                      >
                        <Pencil className="w-4 h-4" />
                      </Button>
                      <Button
                        variant="ghost"
                        size="icon"
                        onClick={() => setDeleteTarget(r.id)}
                        data-ocid={`routes.delete_button.${i + 1}`}
                      >
                        <Trash2 className="w-4 h-4 text-destructive" />
                      </Button>
                    </div>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </div>
      )}

      <TaxiFormDialog
        open={formOpen}
        onClose={() => setFormOpen(false)}
        existing={editTarget}
      />
      <DeleteConfirmDialog
        open={!!deleteTarget}
        onClose={() => setDeleteTarget(null)}
        onConfirm={handleDelete}
        label="Route"
        isPending={deleteRoute.isPending}
      />
    </div>
  );
}

// ─── Bookings Tab ─────────────────────────────────────────────────────────────

const STATUS_COLORS: Record<string, string> = {
  pending: "bg-accent/30 text-accent-foreground border-accent/30",
  confirmed: "bg-green-100 text-green-800 border-green-200",
  cancelled: "bg-destructive/10 text-destructive border-destructive/20",
};

function RestaurantsAdminTab() {
  const { data: listings, isLoading } = useGetActiveListings();
  const [editListing, setEditListing] = useState<Listing | undefined>();
  const [showAdd, setShowAdd] = useState(false);
  const deleteListing = useDeleteListing();

  const restaurants = (listings ?? []).filter(
    (l) =>
      (l.listingType as string) === "restaurant" ||
      (l.listingType as string) === "dhaba",
  );

  return (
    <div>
      <div className="flex items-center justify-between mb-4">
        <h2 className="font-semibold text-lg">Restaurants & Dhabas</h2>
        <Button
          size="sm"
          onClick={() => setShowAdd(true)}
          data-ocid="admin.primary_button"
        >
          <Plus className="w-4 h-4 mr-1" /> Add Restaurant
        </Button>
      </div>

      {isLoading ? (
        <div className="space-y-2" data-ocid="restaurants.loading_state">
          {[1, 2, 3].map((i) => (
            <Skeleton key={i} className="h-16 rounded-lg" />
          ))}
        </div>
      ) : !restaurants.length ? (
        <div
          className="text-center py-12 text-muted-foreground"
          data-ocid="restaurants.empty_state"
        >
          No restaurants yet. Add one to get started.
        </div>
      ) : (
        <div className="rounded-xl border border-border overflow-hidden">
          <Table data-ocid="restaurants.table">
            <TableHeader>
              <TableRow>
                <TableHead>Photo</TableHead>
                <TableHead>Name</TableHead>
                <TableHead>Type</TableHead>
                <TableHead>Location</TableHead>
                <TableHead>Price/person</TableHead>
                <TableHead>Active</TableHead>
                <TableHead>Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {restaurants.map((l, i) => (
                <TableRow key={l.id} data-ocid={`restaurants.row.${i + 1}`}>
                  <TableCell>
                    {l.photos[0] ? (
                      <img
                        src={l.photos[0].getDirectURL()}
                        alt=""
                        className="w-12 h-10 object-cover rounded-md"
                      />
                    ) : (
                      <div className="w-12 h-10 bg-muted rounded-md" />
                    )}
                  </TableCell>
                  <TableCell className="font-medium">{l.name}</TableCell>
                  <TableCell>
                    <Badge variant="secondary" className="capitalize">
                      {l.listingType as string}
                    </Badge>
                  </TableCell>
                  <TableCell className="text-muted-foreground text-sm">
                    {l.location}
                  </TableCell>
                  <TableCell>
                    ₹{l.pricePerNight.toLocaleString("en-IN")}
                  </TableCell>
                  <TableCell>
                    {l.isActive ? (
                      <Check className="w-4 h-4 text-green-600" />
                    ) : (
                      <X className="w-4 h-4 text-muted-foreground" />
                    )}
                  </TableCell>
                  <TableCell>
                    <div className="flex gap-2">
                      <Button
                        size="icon"
                        variant="ghost"
                        onClick={() => setEditListing(l)}
                        data-ocid={`restaurants.edit_button.${i + 1}`}
                      >
                        <Pencil className="w-4 h-4" />
                      </Button>
                      <Button
                        size="icon"
                        variant="ghost"
                        className="text-destructive hover:text-destructive"
                        onClick={() => deleteListing.mutate(l.id)}
                        data-ocid={`restaurants.delete_button.${i + 1}`}
                      >
                        <Trash2 className="w-4 h-4" />
                      </Button>
                    </div>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </div>
      )}

      {showAdd && (
        <ListingFormDialog
          open={showAdd}
          onClose={() => setShowAdd(false)}
          defaultListingType="restaurant"
        />
      )}
      {editListing && (
        <ListingFormDialog
          open={!!editListing}
          onClose={() => setEditListing(undefined)}
          existing={editListing}
        />
      )}
    </div>
  );
}

function BookingsTab() {
  const { data: bookings, isLoading } = useGetAllBookings();
  const updateStatus = useUpdateBookingStatus();
  const deleteBooking = useDeleteBooking();
  const [statusFilter, setStatusFilter] = useState<string>("all");
  const [deleteTarget, setDeleteTarget] = useState<string | null>(null);

  const filtered = (bookings ?? []).filter(
    (b) =>
      statusFilter === "all" ||
      (b.status as string) === (statusFilter as string),
  );

  const handleStatusChange = async (id: string, status: string) => {
    try {
      await updateStatus.mutateAsync({ id, status: status as BookingStatus });
      toast.success("Status updated.");
    } catch {
      toast.error("Failed to update status.");
    }
  };

  const handleDelete = async () => {
    if (!deleteTarget) return;
    try {
      await deleteBooking.mutateAsync(deleteTarget);
      toast.success("Booking deleted.");
      setDeleteTarget(null);
    } catch {
      toast.error("Failed to delete booking.");
    }
  };

  return (
    <div>
      <div className="flex justify-between items-center mb-4">
        <h2 className="font-display text-xl font-semibold">Bookings</h2>
        <div className="flex gap-2">
          {(["all", "pending", "confirmed", "cancelled"] as const).map((s) => (
            <Button
              key={s}
              size="sm"
              variant={statusFilter === s ? "default" : "outline"}
              onClick={() => setStatusFilter(s)}
              className="capitalize text-xs"
              data-ocid="bookings.tab"
            >
              {s}
            </Button>
          ))}
        </div>
      </div>

      {isLoading ? (
        <div className="space-y-2">
          {[1, 2, 3].map((i) => (
            <Skeleton
              key={i}
              className="h-12 rounded-lg"
              data-ocid="bookings.loading_state"
            />
          ))}
        </div>
      ) : filtered.length === 0 ? (
        <div
          className="text-center py-12 text-muted-foreground"
          data-ocid="bookings.empty_state"
        >
          No {statusFilter === "all" ? "" : statusFilter} bookings found.
        </div>
      ) : (
        <div className="rounded-xl border border-border overflow-hidden overflow-x-auto">
          <Table data-ocid="bookings.table">
            <TableHeader>
              <TableRow>
                <TableHead>Type</TableHead>
                <TableHead>Guest</TableHead>
                <TableHead>Contact</TableHead>
                <TableHead>Details</TableHead>
                <TableHead>Total</TableHead>
                <TableHead>Status</TableHead>
                <TableHead>Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filtered.map((b: Booking, i) => (
                <TableRow key={b.id} data-ocid={`bookings.row.${i + 1}`}>
                  <TableCell>
                    <Badge variant="outline" className="capitalize text-xs">
                      {b.bookingType as string}
                    </Badge>
                  </TableCell>
                  <TableCell className="font-medium">{b.guestName}</TableCell>
                  <TableCell className="text-sm text-muted-foreground">
                    <div>{b.email}</div>
                    <div>{b.phone}</div>
                  </TableCell>
                  <TableCell className="text-sm text-muted-foreground">
                    {(b.bookingType as string) === "listing" ? (
                      <div>
                        <div>
                          {b.checkIn} → {b.checkOut}
                        </div>
                      </div>
                    ) : (
                      <div>
                        {b.pickupDate} · {b.passengers?.toString()} pax
                      </div>
                    )}
                  </TableCell>
                  <TableCell className="font-medium">
                    ₹{b.totalPrice.toLocaleString("en-IN")}
                  </TableCell>
                  <TableCell>
                    <Select
                      value={b.status as string}
                      onValueChange={(v) => handleStatusChange(b.id, v)}
                    >
                      <SelectTrigger
                        className={`h-7 text-xs w-28 border ${STATUS_COLORS[b.status as string] ?? ""}`}
                        data-ocid={`bookings.select.${i + 1}`}
                      >
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="pending">Pending</SelectItem>
                        <SelectItem value="confirmed">Confirmed</SelectItem>
                        <SelectItem value="cancelled">Cancelled</SelectItem>
                      </SelectContent>
                    </Select>
                  </TableCell>
                  <TableCell>
                    <Button
                      variant="ghost"
                      size="icon"
                      onClick={() => setDeleteTarget(b.id)}
                      data-ocid={`bookings.delete_button.${i + 1}`}
                    >
                      <Trash2 className="w-4 h-4 text-destructive" />
                    </Button>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </div>
      )}

      <DeleteConfirmDialog
        open={!!deleteTarget}
        onClose={() => setDeleteTarget(null)}
        onConfirm={handleDelete}
        label="Booking"
        isPending={deleteBooking.isPending}
      />
    </div>
  );
}

// ─── Main Admin Page ──────────────────────────────────────────────────────────

export default function AdminPage() {
  const { data: isAdmin, isLoading: adminLoading } = useIsCallerAdmin();
  const { login, clear, loginStatus, identity } = useInternetIdentity();
  const claimFirstAdmin = useClaimFirstAdmin();
  const qc = useQueryClient();
  const isAuthenticated = !!identity;

  // Track claim attempts to avoid infinite loops
  const claimAttemptsRef = useRef(0);

  // Auto-claim admin role when authenticated but not yet admin
  // biome-ignore lint/correctness/useExhaustiveDependencies: claimFirstAdmin is stable
  useEffect(() => {
    if (
      isAuthenticated &&
      isAdmin === false &&
      !claimFirstAdmin.isPending &&
      !claimFirstAdmin.isError &&
      claimAttemptsRef.current < 3
    ) {
      claimAttemptsRef.current += 1;
      claimFirstAdmin.mutate();
    }
  }, [
    isAuthenticated,
    isAdmin,
    claimFirstAdmin.isPending,
    claimFirstAdmin.isError,
  ]);

  const handleLogin = () => {
    if (loginStatus === "loginError") {
      clear();
      setTimeout(() => login(), 300);
      return;
    }
    login();
  };

  const handleLogout = async () => {
    claimAttemptsRef.current = 0;
    await clear();
    qc.clear();
  };

  if (adminLoading || claimFirstAdmin.isPending) {
    return (
      <div
        className="container mx-auto px-4 py-20 flex justify-center"
        data-ocid="admin.loading_state"
      >
        <Loader2 className="w-8 h-8 animate-spin text-primary" />
      </div>
    );
  }

  if (!isAuthenticated) {
    return (
      <div className="min-h-[80vh] flex items-center justify-center bg-background px-4">
        <div className="w-full max-w-md">
          <div className="bg-card border border-border rounded-2xl shadow-lg overflow-hidden">
            {/* Header */}
            <div className="bg-primary/5 border-b border-border px-8 py-6 text-center">
              <div className="w-16 h-16 rounded-2xl bg-primary/10 flex items-center justify-center mx-auto mb-4">
                <span className="text-3xl">🔐</span>
              </div>
              <h1 className="font-display text-2xl font-bold text-foreground">
                Admin Login
              </h1>
              <p className="text-muted-foreground text-sm mt-1">
                Login to access the admin dashboard
              </p>
            </div>

            {/* Form */}
            <div className="px-8 py-6 space-y-4">
              <Button
                onClick={handleLogin}
                disabled={loginStatus === "logging-in"}
                size="lg"
                className="w-full mt-2"
                data-ocid="admin.primary_button"
              >
                {loginStatus === "logging-in" ? (
                  <>
                    <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                    Logging in...
                  </>
                ) : (
                  "Login with Internet Identity"
                )}
              </Button>
              <p className="text-center text-xs text-muted-foreground pt-1">
                Powered by Internet Identity — secure decentralized login
              </p>
            </div>
          </div>
        </div>
      </div>
    );
  }

  if (!isAdmin) {
    if (claimFirstAdmin.isError) {
      return (
        <div className="min-h-[80vh] flex items-center justify-center bg-background px-4">
          <div className="w-full max-w-md text-center">
            <div className="text-4xl mb-4">⚠️</div>
            <h2 className="font-semibold text-lg mb-2">Admin Access Failed</h2>
            <p className="text-muted-foreground text-sm mb-6">
              Could not set up admin access. This account may not have admin
              privileges, or there was a connection error. Please try again.
            </p>
            <div className="flex gap-3 justify-center">
              <Button
                onClick={() => {
                  claimAttemptsRef.current = 0;
                  claimFirstAdmin.mutate();
                }}
                data-ocid="admin.primary_button"
              >
                Try Again
              </Button>
              <Button
                variant="outline"
                onClick={handleLogout}
                data-ocid="admin.secondary_button"
              >
                Logout
              </Button>
            </div>
          </div>
        </div>
      );
    }

    return (
      <div className="min-h-[80vh] flex items-center justify-center bg-background px-4">
        <div className="w-full max-w-md text-center">
          <Loader2 className="w-8 h-8 animate-spin text-primary mx-auto mb-4" />
          <p className="text-muted-foreground">Setting up admin access...</p>
          <Button
            variant="outline"
            onClick={handleLogout}
            className="mt-4"
            data-ocid="admin.secondary_button"
          >
            Logout
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-10">
      <div className="flex items-center justify-between mb-8">
        <div>
          <p className="text-primary font-semibold text-sm uppercase tracking-widest mb-1">
            Dashboard
          </p>
          <h1 className="font-display text-4xl font-bold">Admin Panel</h1>
        </div>
        <Button
          variant="outline"
          size="sm"
          onClick={handleLogout}
          data-ocid="admin.secondary_button"
        >
          Logout
        </Button>
      </div>

      <Tabs defaultValue="listings">
        <TabsList className="mb-6" data-ocid="admin.tab">
          <TabsTrigger value="listings" data-ocid="admin.tab">
            Listings
          </TabsTrigger>
          <TabsTrigger value="taxi" data-ocid="admin.tab">
            Taxi Routes
          </TabsTrigger>
          <TabsTrigger value="restaurants" data-ocid="admin.tab">
            Restaurants
          </TabsTrigger>
          <TabsTrigger value="bookings" data-ocid="admin.tab">
            Bookings
          </TabsTrigger>
        </TabsList>
        <TabsContent value="listings">
          <ListingsTab />
        </TabsContent>
        <TabsContent value="taxi">
          <TaxiRoutesTab />
        </TabsContent>
        <TabsContent value="restaurants">
          <RestaurantsAdminTab />
        </TabsContent>
        <TabsContent value="bookings">
          <BookingsTab />
        </TabsContent>
      </Tabs>
    </div>
  );
}
