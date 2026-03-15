import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
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
import { useRef, useState } from "react";
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
  amenities: string;
  pricePerNight: string;
  isActive: boolean;
  photos: ExternalBlob[];
}

const defaultListingForm = (): ListingFormData => ({
  name: "",
  listingType: "hotel",
  location: "",
  description: "",
  amenities: "",
  pricePerNight: "",
  isActive: true,
  photos: [],
});

function ListingFormDialog({
  open,
  onClose,
  existing,
}: {
  open: boolean;
  onClose: () => void;
  existing?: Listing;
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
          amenities: existing.amenities.join(", "),
          pricePerNight: String(existing.pricePerNight),
          isActive: existing.isActive,
          photos: existing.photos,
        }
      : defaultListingForm(),
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
      amenities: form.amenities
        .split(",")
        .map((a) => a.trim())
        .filter(Boolean),
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
                </SelectContent>
              </Select>
            </div>
            <div>
              <Label>Price / night ($) *</Label>
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
            <Label>Amenities (comma-separated)</Label>
            <Input
              value={form.amenities}
              onChange={(e) =>
                setForm((f) => ({ ...f, amenities: e.target.value }))
              }
              placeholder="WiFi, Breakfast, Parking"
              data-ocid="listing.input"
            />
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
              <Label>Rate ($) *</Label>
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
                  <TableCell>${l.pricePerNight}</TableCell>
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
                    ${r.rate}
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
                  <TableCell className="font-medium">${b.totalPrice}</TableCell>
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
  const qc = useQueryClient();
  const isAuthenticated = !!identity;

  const handleLogin = async () => {
    try {
      await login();
    } catch (e: any) {
      if (e?.message === "User is already authenticated") {
        await clear();
        setTimeout(() => login(), 300);
      }
    }
  };

  const handleLogout = async () => {
    await clear();
    qc.clear();
  };

  if (adminLoading) {
    return (
      <div
        className="container mx-auto px-4 py-20 flex justify-center"
        data-ocid="admin.loading_state"
      >
        <Loader2 className="w-8 h-8 animate-spin text-primary" />
      </div>
    );
  }

  if (!isAuthenticated || !isAdmin) {
    return (
      <div className="container mx-auto px-4 py-20">
        <div className="max-w-md mx-auto text-center">
          <div className="w-16 h-16 rounded-full bg-primary/10 flex items-center justify-center mx-auto mb-6">
            <span className="text-3xl">🔐</span>
          </div>
          <h1 className="font-display text-3xl font-bold mb-3">Admin Panel</h1>
          <p className="text-muted-foreground mb-8">
            {isAuthenticated
              ? "You don't have admin access. Please contact the platform owner."
              : "Please log in with your admin account to access the dashboard."}
          </p>
          {isAuthenticated ? (
            <Button
              variant="outline"
              onClick={handleLogout}
              data-ocid="admin.secondary_button"
            >
              Logout
            </Button>
          ) : (
            <Button
              onClick={handleLogin}
              disabled={loginStatus === "logging-in"}
              size="lg"
              data-ocid="admin.primary_button"
            >
              {loginStatus === "logging-in" ? (
                <>
                  <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                  Logging in...
                </>
              ) : (
                "Login to Admin"
              )}
            </Button>
          )}
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
        <TabsContent value="bookings">
          <BookingsTab />
        </TabsContent>
      </Tabs>
    </div>
  );
}
