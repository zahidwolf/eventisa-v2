import { AppError } from "@/shared/errors/AppError.js";
import { ErrorCodes } from "@/shared/errors/errorCodes.js";
import { Venue, type VenueDocument } from "@/modules/venues/models/venue.model.js";

export type VenueInput = {
  name: string;
  address?: string;
  city: string;
  capacity?: number;
  image?: string;
  googleMapsUrl?: string;
  isActive?: boolean;
};

function serialize(doc: VenueDocument) {
  return {
    _id: doc._id.toString(),
    name: doc.name,
    address: doc.address,
    city: doc.city,
    capacity: doc.capacity,
    image: doc.image,
    googleMapsUrl: doc.googleMapsUrl,
    isActive: doc.isActive,
    createdAt: doc.createdAt,
    updatedAt: doc.updatedAt,
  };
}

export async function listVenuesAdmin() {
  const docs = await Venue.find().sort({ city: 1, name: 1 });
  return docs.map(serialize);
}

export async function listActiveVenues(city?: string) {
  const filter: Record<string, unknown> = { isActive: true };
  if (city?.trim()) filter.city = city.trim();
  const docs = await Venue.find(filter).sort({ name: 1 });
  return docs.map(serialize);
}

export async function createVenue(input: VenueInput) {
  const doc = await Venue.create({
    ...input,
    name: input.name.trim(),
    city: input.city.trim(),
    isActive: input.isActive ?? true,
  });
  return serialize(doc);
}

export async function updateVenue(id: string, input: Partial<VenueInput>) {
  const doc = await Venue.findById(id);
  if (!doc) throw new AppError("Venue not found", 404, ErrorCodes.NOT_FOUND);
  if (input.name) doc.name = input.name.trim();
  if (input.address !== undefined) doc.address = input.address;
  if (input.city) doc.city = input.city.trim();
  if (input.capacity !== undefined) doc.capacity = input.capacity;
  if (input.image !== undefined) doc.image = input.image;
  if (input.googleMapsUrl !== undefined) doc.googleMapsUrl = input.googleMapsUrl;
  if (input.isActive !== undefined) doc.isActive = input.isActive;
  await doc.save();
  return serialize(doc);
}

export async function deleteVenue(id: string) {
  const doc = await Venue.findByIdAndDelete(id);
  if (!doc) throw new AppError("Venue not found", 404, ErrorCodes.NOT_FOUND);
}
