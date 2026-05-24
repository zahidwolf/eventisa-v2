"use client";

import { useState } from "react";
import { GripVertical, Pencil, Plus, Trash2 } from "lucide-react";
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
  createCity,
  deleteCity,
  fetchAdminCities,
  updateCity,
  type City,
  type CityInput,
} from "@/services/admin/cities.service";
import { getApiErrorMessage } from "@/services/api/client";

const EMPTY: CityInput = { name: "", slug: "", image: "", isActive: true, order: 0 };

export function CitiesManager() {
  const qc = useQueryClient();
  const [modal, setModal] = useState<"create" | City | null>(null);
  const [form, setForm] = useState<CityInput>(EMPTY);
  const [deleteId, setDeleteId] = useState<string | null>(null);

  const { data: cities = [], isLoading } = useQuery({
    queryKey: ["admin-cities"],
    queryFn: fetchAdminCities,
  });

  const invalidate = () => void qc.invalidateQueries({ queryKey: ["admin-cities"] });

  const saveMut = useMutation({
    mutationFn: async () => {
      const payload = {
        ...form,
        slug: form.slug?.trim() || undefined,
        image: form.image?.trim() || undefined,
      };
      if (modal === "create") return createCity(payload);
      if (modal && typeof modal === "object") return updateCity(modal._id, payload);
      throw new Error("Invalid state");
    },
    onSuccess: () => {
      toast.success(modal === "create" ? "City created" : "City updated");
      setModal(null);
      setForm(EMPTY);
      invalidate();
    },
    onError: (e) => toast.error(getApiErrorMessage(e)),
  });

  const deleteMut = useMutation({
    mutationFn: deleteCity,
    onSuccess: () => {
      toast.success("City deleted");
      setDeleteId(null);
      invalidate();
    },
    onError: (e) => toast.error(getApiErrorMessage(e)),
  });

  const openCreate = () => {
    setForm({ ...EMPTY, order: cities.length });
    setModal("create");
  };

  const openEdit = (city: City) => {
    setForm({
      name: city.name,
      slug: city.slug,
      image: city.image ?? "",
      isActive: city.isActive,
      order: city.order,
    });
    setModal(city);
  };

  return (
    <div>
      <AdminPageHeader
        title="Cities"
        description="Manage cities shown in search filters, event creation, and homepage browsing."
      />

      <div className="mb-6 flex justify-end">
        <Button className="bg-[#FF3EA5] hover:bg-[#FF3EA5]/90" onClick={openCreate}>
          <Plus className="mr-1 h-4 w-4" />
          Add city
        </Button>
      </div>

      {isLoading ? (
        <p className="text-sm text-zinc-500">Loading…</p>
      ) : cities.length === 0 ? (
        <p className="rounded-xl border border-dashed border-white/10 p-8 text-center text-sm text-zinc-500">
          No cities configured yet.
        </p>
      ) : (
        <div className="space-y-2">
          {cities.map((city) => (
            <div
              key={city._id}
              className="flex items-center gap-3 rounded-xl border border-white/10 bg-white/5 p-3"
            >
              <GripVertical className="h-5 w-5 text-zinc-600" />
              <div className="relative h-12 w-16 shrink-0 overflow-hidden rounded-md bg-zinc-900">
                {city.image ? (
                  <CoverImage src={city.image} alt="" fill sizes="64px" />
                ) : (
                  <span className="flex h-full items-center justify-center text-[10px] text-zinc-600">
                    No img
                  </span>
                )}
              </div>
              <div className="min-w-0 flex-1">
                <p className="font-medium text-white">{city.name}</p>
                <p className="text-xs text-zinc-500">
                  /{city.slug} · order {city.order} · {city.isActive ? "Active" : "Inactive"}
                </p>
              </div>
              <Button type="button" variant="ghost" size="icon" onClick={() => openEdit(city)}>
                <Pencil className="h-4 w-4" />
              </Button>
              <Button type="button" variant="ghost" size="icon" onClick={() => setDeleteId(city._id)}>
                <Trash2 className="h-4 w-4 text-red-400" />
              </Button>
            </div>
          ))}
        </div>
      )}

      <Dialog open={modal !== null} onOpenChange={(o) => !o && setModal(null)}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>{modal === "create" ? "Add city" : "Edit city"}</DialogTitle>
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
              <Label>Slug <span className="text-zinc-500">(optional)</span></Label>
              <Input
                value={form.slug ?? ""}
                onChange={(e) => setForm((f) => ({ ...f, slug: e.target.value }))}
                placeholder="auto-generated from name"
                className="border-white/10 bg-white/5"
              />
            </div>
            <ImageUpload
              label="City image"
              uploadType="event-banner"
              value={form.image ?? ""}
              onChange={(url) => setForm((f) => ({ ...f, image: url }))}
              aspect="square"
            />
            <div className="space-y-2">
              <Label>Display order</Label>
              <Input
                type="number"
                min={0}
                value={form.order ?? 0}
                onChange={(e) => setForm((f) => ({ ...f, order: Number(e.target.value) }))}
                className="border-white/10 bg-white/5"
              />
            </div>
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
                disabled={!form.name.trim() || saveMut.isPending}
                onClick={() => saveMut.mutate()}
              >
                {saveMut.isPending ? "Saving…" : "Save city"}
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>

      <AdminConfirmDialog
        open={deleteId !== null}
        title="Delete city?"
        description="Events using this city name will not be affected."
        confirmLabel="Delete"
        destructive
        loading={deleteMut.isPending}
        onOpenChange={(o) => !o && setDeleteId(null)}
        onConfirm={() => deleteId && deleteMut.mutate(deleteId)}
      />
    </div>
  );
}
