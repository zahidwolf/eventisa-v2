"use client";

import { useEffect, useState } from "react";
import {
  DndContext,
  closestCenter,
  PointerSensor,
  useSensor,
  useSensors,
  type DragEndEvent,
} from "@dnd-kit/core";
import {
  SortableContext,
  arrayMove,
  useSortable,
  verticalListSortingStrategy,
} from "@dnd-kit/sortable";
import { CSS } from "@dnd-kit/utilities";
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
  createHeroBanner,
  deleteHeroBanner,
  fetchHeroBanners,
  updateHeroBanner,
  type HeroBanner,
  type HeroBannerInput,
} from "@/services/admin/hero-banners.service";
import { getApiErrorMessage } from "@/services/api/client";

const EMPTY_FORM: HeroBannerInput = {
  imageUrl: "",
  title: "",
  subtitle: "",
  ctaText: "",
  ctaLink: "",
  isActive: true,
};

function SortableBannerRow({
  banner,
  onEdit,
  onRemove,
}: {
  banner: HeroBanner;
  onEdit: () => void;
  onRemove: () => void;
}) {
  const { attributes, listeners, setNodeRef, transform, transition } = useSortable({
    id: banner._id,
  });
  const style = { transform: CSS.Transform.toString(transform), transition };

  return (
    <div ref={setNodeRef} style={style} className="flex items-center gap-3 rounded-xl border border-white/10 bg-white/5 p-3">
      <button type="button" className="text-zinc-500" {...attributes} {...listeners}>
        <GripVertical className="h-5 w-5" />
      </button>
      <div className="relative h-14 w-24 shrink-0 overflow-hidden rounded-lg bg-zinc-900">
        {banner.imageUrl ? (
          <CoverImage src={banner.imageUrl} alt="" fill sizes="96px" />
        ) : (
          <span className="flex h-full items-center justify-center text-xs text-zinc-600">No image</span>
        )}
      </div>
      <div className="min-w-0 flex-1">
        <p className="truncate font-medium text-white">{banner.title}</p>
        <p className="truncate text-xs text-zinc-500">{banner.subtitle || "No subtitle"}</p>
        <p className="text-xs text-zinc-600">
          {banner.isActive ? "Active" : "Inactive"}
          {banner.ctaText ? ` · CTA: ${banner.ctaText}` : ""}
        </p>
      </div>
      <Button type="button" variant="ghost" size="icon" onClick={onEdit} aria-label="Edit">
        <Pencil className="h-4 w-4" />
      </Button>
      <Button type="button" variant="ghost" size="icon" onClick={onRemove} aria-label="Remove">
        <Trash2 className="h-4 w-4 text-red-400" />
      </Button>
    </div>
  );
}

export function HeroBannersManager() {
  const qc = useQueryClient();
  const [items, setItems] = useState<HeroBanner[]>([]);
  const [modal, setModal] = useState<"create" | HeroBanner | null>(null);
  const [form, setForm] = useState<HeroBannerInput>(EMPTY_FORM);
  const [deleteId, setDeleteId] = useState<string | null>(null);

  const sensors = useSensors(useSensor(PointerSensor, { activationConstraint: { distance: 6 } }));

  const { data, isLoading } = useQuery({
    queryKey: ["admin-hero-banners"],
    queryFn: fetchHeroBanners,
  });

  useEffect(() => {
    if (data) setItems(data);
  }, [data]);

  const invalidate = () => void qc.invalidateQueries({ queryKey: ["admin-hero-banners"] });

  const saveOrderMut = useMutation({
    mutationFn: async (ordered: HeroBanner[]) => {
      await Promise.all(
        ordered.map((b, i) => (b.order !== i ? updateHeroBanner(b._id, { order: i }) : Promise.resolve()))
      );
    },
    onSuccess: () => invalidate(),
    onError: (e) => toast.error(getApiErrorMessage(e)),
  });

  const saveMut = useMutation({
    mutationFn: async () => {
      if (modal === "create") return createHeroBanner({ ...form, order: items.length });
      if (modal && typeof modal === "object") return updateHeroBanner(modal._id, form);
      throw new Error("Invalid state");
    },
    onSuccess: () => {
      toast.success(modal === "create" ? "Banner created" : "Banner updated");
      setModal(null);
      setForm(EMPTY_FORM);
      invalidate();
    },
    onError: (e) => toast.error(getApiErrorMessage(e)),
  });

  const deleteMut = useMutation({
    mutationFn: deleteHeroBanner,
    onSuccess: () => {
      toast.success("Banner deleted");
      setDeleteId(null);
      invalidate();
    },
    onError: (e) => toast.error(getApiErrorMessage(e)),
  });

  const openCreate = () => {
    setForm(EMPTY_FORM);
    setModal("create");
  };

  const openEdit = (banner: HeroBanner) => {
    setForm({
      imageUrl: banner.imageUrl,
      title: banner.title,
      subtitle: banner.subtitle ?? "",
      ctaText: banner.ctaText ?? "",
      ctaLink: banner.ctaLink ?? "",
      isActive: banner.isActive,
    });
    setModal(banner);
  };

  const onDragEnd = (ev: DragEndEvent) => {
    const { active, over } = ev;
    if (!over || active.id === over.id) return;
    setItems((prev) => {
      const oldIndex = prev.findIndex((i) => i._id === active.id);
      const newIndex = prev.findIndex((i) => i._id === over.id);
      if (oldIndex < 0 || newIndex < 0) return prev;
      const next = arrayMove(prev, oldIndex, newIndex);
      saveOrderMut.mutate(next);
      return next;
    });
  };

  return (
    <div>
      <AdminPageHeader
        title="Hero banners"
        description="Manage homepage hero slides. Drag to reorder; only active banners appear on the site."
      />

      <div className="mb-6 flex justify-end">
        <Button className="bg-[#FF3EA5] hover:bg-[#FF3EA5]/90" onClick={openCreate}>
          <Plus className="mr-1 h-4 w-4" />
          Add banner
        </Button>
      </div>

      {isLoading ? (
        <p className="text-sm text-zinc-500">Loading…</p>
      ) : items.length === 0 ? (
        <p className="rounded-xl border border-dashed border-white/10 p-8 text-center text-sm text-zinc-500">
          No hero banners yet.
        </p>
      ) : (
        <DndContext sensors={sensors} collisionDetection={closestCenter} onDragEnd={onDragEnd}>
          <SortableContext items={items.map((b) => b._id)} strategy={verticalListSortingStrategy}>
            <div className="space-y-2">
              {items.map((banner) => (
                <SortableBannerRow
                  key={banner._id}
                  banner={banner}
                  onEdit={() => openEdit(banner)}
                  onRemove={() => setDeleteId(banner._id)}
                />
              ))}
            </div>
          </SortableContext>
        </DndContext>
      )}

      <Dialog open={modal !== null} onOpenChange={(o) => !o && setModal(null)}>
        <DialogContent className="max-h-[90vh] overflow-y-auto sm:max-w-lg">
          <DialogHeader>
            <DialogTitle>{modal === "create" ? "Add hero banner" : "Edit hero banner"}</DialogTitle>
          </DialogHeader>
          <div className="space-y-4">
            <ImageUpload
              label="Banner image"
              uploadType="event-banner"
              value={form.imageUrl}
              onChange={(url) => setForm((f) => ({ ...f, imageUrl: url }))}
            />
            <div className="space-y-2">
              <Label>Title</Label>
              <Input
                value={form.title}
                onChange={(e) => setForm((f) => ({ ...f, title: e.target.value }))}
                className="border-white/10 bg-white/5"
              />
            </div>
            <div className="space-y-2">
              <Label>Subtitle</Label>
              <Input
                value={form.subtitle ?? ""}
                onChange={(e) => setForm((f) => ({ ...f, subtitle: e.target.value }))}
                className="border-white/10 bg-white/5"
              />
            </div>
            <div className="grid gap-4 sm:grid-cols-2">
              <div className="space-y-2">
                <Label>CTA text</Label>
                <Input
                  value={form.ctaText ?? ""}
                  onChange={(e) => setForm((f) => ({ ...f, ctaText: e.target.value }))}
                  className="border-white/10 bg-white/5"
                />
              </div>
              <div className="space-y-2">
                <Label>CTA link</Label>
                <Input
                  value={form.ctaLink ?? ""}
                  onChange={(e) => setForm((f) => ({ ...f, ctaLink: e.target.value }))}
                  className="border-white/10 bg-white/5"
                />
              </div>
            </div>
            <label className="flex items-center gap-2 text-sm text-zinc-300">
              <input
                type="checkbox"
                checked={form.isActive ?? true}
                onChange={(e) => setForm((f) => ({ ...f, isActive: e.target.checked }))}
              />
              Active on homepage
            </label>
            <div className="flex justify-end gap-2">
              <Button variant="secondary" onClick={() => setModal(null)}>
                Cancel
              </Button>
              <Button
                className="bg-[#FF3EA5] hover:bg-[#FF3EA5]/90"
                disabled={!form.imageUrl.trim() || !form.title.trim() || saveMut.isPending}
                onClick={() => saveMut.mutate()}
              >
                {saveMut.isPending ? "Saving…" : "Save banner"}
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>

      <AdminConfirmDialog
        open={deleteId !== null}
        title="Delete hero banner?"
        description="This slide will be removed from the homepage immediately."
        confirmLabel="Delete"
        destructive
        loading={deleteMut.isPending}
        onOpenChange={(o) => !o && setDeleteId(null)}
        onConfirm={() => deleteId && deleteMut.mutate(deleteId)}
      />
    </div>
  );
}
