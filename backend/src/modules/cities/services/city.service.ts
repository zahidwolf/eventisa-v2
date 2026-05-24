import { AppError } from "@/shared/errors/AppError.js";
import { ErrorCodes } from "@/shared/errors/errorCodes.js";
import { City, type CityDocument } from "@/modules/cities/models/city.model.js";

export type CityInput = {
  name: string;
  slug?: string;
  image?: string;
  isActive?: boolean;
  order?: number;
};

function slugify(name: string) {
  return name
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-|-$/g, "");
}

function serialize(doc: CityDocument) {
  return {
    _id: doc._id.toString(),
    name: doc.name,
    slug: doc.slug,
    image: doc.image,
    isActive: doc.isActive,
    order: doc.order,
    createdAt: doc.createdAt,
    updatedAt: doc.updatedAt,
  };
}

export async function listCitiesAdmin() {
  const docs = await City.find().sort({ order: 1, name: 1 });
  return docs.map(serialize);
}

export async function listActiveCities() {
  const docs = await City.find({ isActive: true }).sort({ order: 1, name: 1 });
  return docs.map(serialize);
}

export async function createCity(input: CityInput) {
  const slug = input.slug?.trim() || slugify(input.name);
  const existing = await City.findOne({ $or: [{ slug }, { name: input.name.trim() }] });
  if (existing) {
    throw new AppError("City name or slug already exists", 409, ErrorCodes.CONFLICT);
  }
  const count = await City.countDocuments();
  const doc = await City.create({
    name: input.name.trim(),
    slug,
    image: input.image,
    isActive: input.isActive ?? true,
    order: input.order ?? count,
  });
  return serialize(doc);
}

export async function updateCity(id: string, input: Partial<CityInput>) {
  const doc = await City.findById(id);
  if (!doc) throw new AppError("City not found", 404, ErrorCodes.NOT_FOUND);

  if (input.name && input.name.trim() !== doc.name) {
    const clash = await City.findOne({ name: input.name.trim(), _id: { $ne: doc._id } });
    if (clash) throw new AppError("City name already exists", 409, ErrorCodes.CONFLICT);
    doc.name = input.name.trim();
  }

  if (input.slug) {
    const clash = await City.findOne({ slug: input.slug.trim(), _id: { $ne: doc._id } });
    if (clash) throw new AppError("City slug already exists", 409, ErrorCodes.CONFLICT);
    doc.slug = input.slug.trim();
  } else if (input.name) {
    doc.slug = slugify(input.name);
  }

  if (input.image !== undefined) doc.image = input.image;
  if (input.isActive !== undefined) doc.isActive = input.isActive;
  if (input.order !== undefined) doc.order = input.order;
  await doc.save();
  return serialize(doc);
}

export async function deleteCity(id: string) {
  const doc = await City.findByIdAndDelete(id);
  if (!doc) throw new AppError("City not found", 404, ErrorCodes.NOT_FOUND);
}
