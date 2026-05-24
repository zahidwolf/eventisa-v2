"use client";

import { useEffect, useMemo, useState } from "react";
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
import { GripVertical, Plus, Trash2 } from "lucide-react";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import { AdminPageHeader } from "@/components/admin/admin-page-header";
import { CoverImage } from "@/components/media/cover-image";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { fetchAdminEvents } from "@/services/admin/admin-events.service";
import { fetchTrendingCuration, saveTrendingCuration } from "@/services/admin/homepage.service";
import { getApiErrorMessage } from "@/services/api/client";
import type { EventListItem } from "@/types/models/event";

function SortableTrendingRow({
  event,
  onRemove,
}: {
  event: EventListItem;
  onRemove: () => void;
}) {
  const { attributes, listeners, setNodeRef, transform, transition } = useSortable({
    id: event._id,
  });
  const style = { transform: CSS.Transform.toString(transform), transition };

  return (
    <div
      ref={setNodeRef}
      style={style}
      className="flex items-center gap-3 rounded-xl border border-white/10 bg-white/5 p-3"
    >
      <button type="button" className="text-zinc-500" {...attributes} {...listeners}>
        <GripVertical className="h-5 w-5" />
      </button>
      <div className="relative h-14 w-20 shrink-0 overflow-hidden rounded-lg bg-zinc-900">
        {event.coverImage ? (
          <CoverImage src={event.coverImage} alt="" fill sizes="80px" />
        ) : (
          <span className="flex h-full items-center justify-center text-xs text-zinc-600">No image</span>
        )}
      </div>
      <div className="min-w-0 flex-1">
        <p className="truncate font-medium text-white">{event.title}</p>
        <p className="text-xs text-zinc-500">{event.city}</p>
      </div>
      <Button type="button" variant="ghost" size="icon" onClick={onRemove} aria-label="Remove">
        <Trash2 className="h-4 w-4 text-red-400" />
      </Button>
    </div>
  );
}

export function TrendingEventsManager() {
  const qc = useQueryClient();
  const [selected, setSelected] = useState<EventListItem[]>([]);
  const [search, setSearch] = useState("");
  const [dirty, setDirty] = useState(false);

  const sensors = useSensors(useSensor(PointerSensor, { activationConstraint: { distance: 6 } }));

  const { data, isLoading } = useQuery({
    queryKey: ["admin-trending-curation"],
    queryFn: fetchTrendingCuration,
  });

  const { data: liveEventsRes } = useQuery({
    queryKey: ["admin-events-live-picker-trending"],
    queryFn: () => fetchAdminEvents({ status: "live" }),
  });

  useEffect(() => {
    if (data?.events) {
      setSelected(data.events);
      setDirty(false);
    }
  }, [data]);

  const liveEvents = liveEventsRes?.data.events ?? [];
  const selectedIds = useMemo(() => new Set(selected.map((e) => e._id)), [selected]);

  const pickerResults = useMemo(() => {
    const q = search.trim().toLowerCase();
    return liveEvents
      .filter((e) => !selectedIds.has(e._id))
      .filter((e) => !q || e.title.toLowerCase().includes(q) || e.city?.toLowerCase().includes(q))
      .slice(0, 8);
  }, [liveEvents, search, selectedIds]);

  const saveMut = useMutation({
    mutationFn: () => saveTrendingCuration(selected.map((e) => e._id)),
    onSuccess: async () => {
      toast.success("Trending events saved");
      setDirty(false);
      await qc.invalidateQueries({ queryKey: ["admin-trending-curation"] });
    },
    onError: (e) => toast.error(getApiErrorMessage(e)),
  });

  const onDragEnd = (ev: DragEndEvent) => {
    const { active, over } = ev;
    if (!over || active.id === over.id) return;
    setSelected((items) => {
      const oldIndex = items.findIndex((i) => i._id === active.id);
      const newIndex = items.findIndex((i) => i._id === over.id);
      if (oldIndex < 0 || newIndex < 0) return items;
      return arrayMove(items, oldIndex, newIndex);
    });
    setDirty(true);
  };

  const addEvent = (event: EventListItem) => {
    setSelected((s) => [...s, event]);
    setDirty(true);
    setSearch("");
  };

  return (
    <div>
      <AdminPageHeader
        title="Trending events"
        description="Choose and order events for the homepage Trending section. Drag to reorder."
      />

      <div className="mb-6 flex flex-wrap items-center justify-between gap-3">
        <p className="text-sm text-zinc-500">
          {selected.length} event{selected.length === 1 ? "" : "s"} on homepage
          {dirty ? " · unsaved changes" : ""}
        </p>
        <Button
          className="bg-[#FF3EA5] hover:bg-[#FF3EA5]/90"
          disabled={!dirty || saveMut.isPending}
          onClick={() => saveMut.mutate()}
        >
          {saveMut.isPending ? "Saving…" : "Save trending order"}
        </Button>
      </div>

      {isLoading ? (
        <p className="text-sm text-zinc-500">Loading…</p>
      ) : (
        <div className="grid gap-8 lg:grid-cols-2">
          <div>
            <h2 className="mb-3 text-sm font-semibold uppercase tracking-wider text-zinc-500">
              Homepage order
            </h2>
            {selected.length === 0 ? (
              <p className="rounded-xl border border-dashed border-white/10 p-8 text-center text-sm text-zinc-500">
                No trending events yet. Add live events from the panel on the right.
              </p>
            ) : (
              <DndContext sensors={sensors} collisionDetection={closestCenter} onDragEnd={onDragEnd}>
                <SortableContext items={selected.map((e) => e._id)} strategy={verticalListSortingStrategy}>
                  <div className="space-y-2">
                    {selected.map((event) => (
                      <SortableTrendingRow
                        key={event._id}
                        event={event}
                        onRemove={() => {
                          setSelected((s) => s.filter((x) => x._id !== event._id));
                          setDirty(true);
                        }}
                      />
                    ))}
                  </div>
                </SortableContext>
              </DndContext>
            )}
          </div>

          <div>
            <h2 className="mb-3 text-sm font-semibold uppercase tracking-wider text-zinc-500">
              Add live event
            </h2>
            <Input
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Search by title or city…"
              className="border-white/10 bg-white/5"
            />
            <ul className="mt-3 space-y-2">
              {pickerResults.map((event) => (
                <li
                  key={event._id}
                  className="flex items-center gap-3 rounded-xl border border-white/10 bg-white/5 p-3"
                >
                  <div className="relative h-12 w-16 shrink-0 overflow-hidden rounded-md bg-zinc-900">
                    {event.coverImage ? (
                      <CoverImage src={event.coverImage} alt="" fill sizes="64px" />
                    ) : null}
                  </div>
                  <div className="min-w-0 flex-1">
                    <p className="truncate text-sm font-medium text-white">{event.title}</p>
                    <p className="text-xs text-zinc-500">{event.city}</p>
                  </div>
                  <Button type="button" size="sm" variant="outline" onClick={() => addEvent(event)}>
                    <Plus className="mr-1 h-3 w-3" />
                    Add
                  </Button>
                </li>
              ))}
              {pickerResults.length === 0 && (
                <li className="py-6 text-center text-sm text-zinc-500">No matching live events</li>
              )}
            </ul>
          </div>
        </div>
      )}
    </div>
  );
}
