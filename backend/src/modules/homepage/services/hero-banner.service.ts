import { AppError } from "@/shared/errors/AppError.js";
import { ErrorCodes } from "@/shared/errors/errorCodes.js";
import {
  HeroBanner,
  type HeroBannerDocument,
} from "@/modules/homepage/models/hero-banner.model.js";

export type HeroBannerInput = {
  imageUrl: string;
  title: string;
  subtitle?: string;
  ctaText?: string;
  ctaLink?: string;
  order?: number;
  isActive?: boolean;
};

function serialize(doc: HeroBannerDocument) {
  return {
    _id: doc._id.toString(),
    imageUrl: doc.imageUrl,
    title: doc.title,
    subtitle: doc.subtitle,
    ctaText: doc.ctaText,
    ctaLink: doc.ctaLink,
    order: doc.order,
    isActive: doc.isActive,
    createdAt: doc.createdAt,
    updatedAt: doc.updatedAt,
  };
}

export async function listHeroBannersAdmin() {
  const docs = await HeroBanner.find().sort({ order: 1, createdAt: 1 });
  return docs.map(serialize);
}

export async function listActiveHeroBanners() {
  const docs = await HeroBanner.find({ isActive: true }).sort({ order: 1, createdAt: 1 });
  return docs.map(serialize);
}

export async function createHeroBanner(input: HeroBannerInput) {
  const count = await HeroBanner.countDocuments();
  const doc = await HeroBanner.create({
    ...input,
    order: input.order ?? count,
    isActive: input.isActive ?? true,
  });
  return serialize(doc);
}

export async function updateHeroBanner(id: string, input: Partial<HeroBannerInput>) {
  const doc = await HeroBanner.findById(id);
  if (!doc) throw new AppError("Hero banner not found", 404, ErrorCodes.NOT_FOUND);
  Object.assign(doc, input);
  await doc.save();
  return serialize(doc);
}

export async function deleteHeroBanner(id: string) {
  const doc = await HeroBanner.findByIdAndDelete(id);
  if (!doc) throw new AppError("Hero banner not found", 404, ErrorCodes.NOT_FOUND);
}
