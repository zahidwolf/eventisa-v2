"use client";

import { useState } from "react";
import { Pencil, Plus, Trash2 } from "lucide-react";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import { AdminConfirmDialog } from "@/components/admin/events/AdminConfirmDialog";
import { AdminPageHeader } from "@/components/admin/admin-page-header";
import { CoverImage } from "@/components/media/cover-image";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { ImageUpload } from "@/components/media/image-upload";
import {
  createVenue,
  deleteVenue,
  fetchAdminVenues,
  updateVenue,
  type Venue,
  type VenueInput,
} from "@/services/admin/venues.service";
import { fetchAdminCities } from "@/services/admin/cities.service";
import { getApiErrorMessage } from "@/services/api/client";

const EMPTY: VenueInput = {
  name: "",
  address: "",
  city: "Dhaka",
  capacity: undefined,
  image: "",
  googleMapsUrl: "",
  isActive: true,
};

export function VenuesManager() {
  const qc = useQueryClient();
  const [modal, setModal] = useState<"create" | Venue | null>(null);
  const [form, setForm] = useState<VenueInput>(EMPTY);
  const [deleteId, setDeleteId] = useState<string | null>(null);

  const { data: venues = [], isLoading } = useQuery({
    queryKey: ["admin-venues"],
    queryFn: fetchAdminVenues,
  });

  const { data: cities = [] } = useQuery({
    queryKey: ["admin-cities"],
    queryFn: fetchAdminCities,
  });

  const cityOptions = cities.length ? cities.map((c) => c.name) : ["Dhaka"];

  const invalidate = () => void qc.invalidateQueries({ queryKey: ["admin-venues"] });

  const saveMut = useMutation({
    mutationFn: async () => {
      const payload: VenueInput = {
        ...form,
        address: form.address?.trim() || undefined,
        image: form.image?.trim() || undefined,
        googleMapsUrl: form.googleMapsUrl?.trim() || undefined,
        capacity: form.capacity ? Number(form.capacity) : undefined,
      };
      if (modal === "create") return createVenue(payload);
      if (modal && typeof modal === "object") return updateVenue(modal._id, payload);
      throw new Error("Invalid state");
    },
    onSuccess: () => {
      toast.success(modal === "create" ? "Venue created" : "Venue updated");
      setModal(null);
      setForm(EMPTY);
      invalidate();
    },
    onError: (e) => toast.error(getApiErrorMessage(e)),
  });

  const deleteMut = useMutation({
    mutationFn: deleteVenue,
    onSuccess: () => {
      toast.success("Venue deleted");
      setDeleteId(null);
      invalidate();
    },
    onError: (e) => toast.error(getApiErrorMessage(e)),
  });

  const openCreate = () => {
    setForm({ ...EMPTY, city: cityOptions[0] ?? "Dhaka" });
    setModal("create");
  };

  const openEdit = (venue: Venue) => {
    setForm({
      name: venue.name,
      address: venue.address ?? "",
      city: venue.city,
      capacity: venue.capacity,
      image: venue.image ?? "",
      googleMapsUrl: venue.googleMapsUrl ?? "",
      isActive: venue.isActive,
    });
    setModal(venue);
  };

  return (
    <div>
      <AdminPageHeader
        title="Venues"
        description="Venue directory for organizers to pick when creating in-person events."
      />

      <div className="mb-6 flex justify-end">
        <Button className="bg-[#FF3EA5] hover:bg-[#FF3EA5]/90" onClick={openCreate}>
          <Plus className="mr-1 h-4 w-4" />
          Add venue
        </Button>
      </div>

      {isLoading ? (
        <p className="text-sm text-zinc-500">Loading…</p>
      ) : venues.length === 0 ? (
        <p className="rounded-xl border border-dashed border-white/10 p-8 text-center text-sm text-zinc-500">
          No venues in the directory yet.
        </p>
      ) : (
        <div className="grid gap-3 md:grid-cols-2">
          {venues.map((venue) => (
            <div key={venue._id} className="flex gap-3 rounded-xl border border-white/10 bg-white/5 p-4">
              <div className="relative h-16 w-20 shrink-0 overflow-hidden rounded-lg bg-zinc-900">
                {venue.image ? (
                  <CoverImage src={venue.image} alt="" fill sizes="80px" />
                ) : null}
              </div>
              <div className="min-w-0 flex-1">
                <p className="font-medium text-white">{venue.name}</p>
                <p className="text-xs text-zinc-500">{venue.city}</p>
                {venue.address && <p className="truncate text-xs text-zinc-600">{venue.address}</p>}
                <p className="mt-1 text-xs text-zinc-600">
                  {venue.capacity ? `${venue.capacity} cap · ` : ""}
                  {venue.isActive ? "Active" : "Inactive"}
                </p>
              </div>
              <div className="flex flex-col gap-1">
                <Button type="button" variant="ghost" size="icon" onClick={() => openEdit(venue)}>
                  <Pencil className="h-4 w-4" />
                </Button>
                <Button type="button" variant="ghost" size="icon" onClick={() => setDeleteId(venue._id)}>
                  <Trash2 className="h-4 w-4 text-red-400" />
                </Button>
              </div>
            </div>
          ))}
        </div>
      )}

      <Dialog open={modal !== null} onOpenChange={(o) => !o && setModal(null)}>
        <DialogContent className="max-h-[90vh] overflow-y-auto sm:max-w-lg">
          <DialogHeader>
            <DialogTitle>{modal === "create" ? "Add venue" : "Edit venue"}</DialogTitle>
          </DialogHeader>
          <div className="space-y-4">
            <div className="space-y-2">
              <Label>Name</Label>
              <Input
                value={form.name}
                onChange={(e) => setForm((f) => ({ ...f, name: e.target.value }))}
                className="border-white/10 bg-white/5"
              />
            </div>
            <div className="space-y-2">
              <Label>City</Label>
              <select
                className="flex h-11 w-full rounded-lg border border-white/10 bg-[#070B1A] px-3 text-sm"
                value={form.city}
                onChange={(e) => setForm((f) => ({ ...f, city: e.target.value }))}
              >
                {cityOptions.map((city) => (
                  <option key={city} value={city}>
                    {city}
                  </option>
                ))}
              </select>
            </div>
            <div className="space-y-2">
              <Label>Address</Label>
              <Input
                value={form.address ?? ""}
                onChange={(e) => setForm((f) => ({ ...f, address: e.target.value }))}
                className="border-white/10 bg-white/5"
              />
            </div>
            <div className="grid gap-4 sm:grid-cols-2">
              <div className="space-y-2">
                <Label>Capacity</Label>
                <Input
                  type="number"
                  min={0}
                  value={form.capacity ?? ""}
                  onChange={(e) =>
                    setForm((f) => ({
                      ...f,
                      capacity: e.target.value ? Number(e.target.value) : undefined,
                    }))
                  }
                  className="border-white/10 bg-white/5"
                />
              </div>
              <div className="space-y-2">
                <Label>Google Maps URL</Label>
                <Input
                  value={form.googleMapsUrl ?? ""}
                  onChange={(e) => setForm((f) => ({ ...f, googleMapsUrl: e.target.value }))}
                  className="border-white/10 bg-white/5"
                />
              </div>
            </div>
            <ImageUpload
              label="Venue image"
              uploadType="event-banner"
              value={form.image ?? ""}
              onChange={(url) => setForm((f) => ({ ...f, image: url }))}
              aspect="square"
            />
            <label className="flex items-center gap-2 text-sm text-zinc-300">
              <input
                type="checkbox"
                checked={form.isActive ?? true}
                onChange={(e) => setForm((f) => ({ ...f, isActive: e.target.checked }))}
              />
              Active
            </label>
            <div className="flex justify-end gap-2">
              <Button variant="secondary" onClick={() => setModal(null)}>Cancel</Button>
              <Button
                className="bg-[#FF3EA5] hover:bg-[#FF3EA5]/90"
                disabled={!form.name.trim() || !form.city.trim() || saveMut.isPending}
                onClick={() => saveMut.mutate()}
              >
                {saveMut.isPending ? "Saving…" : "Save venue"}
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>

      <AdminConfirmDialog
        open={deleteId !== null}
        title="Delete venue?"
        description="Existing events keep their saved venue details."
        confirmLabel="Delete"
        destructive
        loading={deleteMut.isPending}
        onOpenChange={(o) => !o && setDeleteId(null)}
        onConfirm={() => deleteId && deleteMut.mutate(deleteId)}
      />
    </div>
  );
}
