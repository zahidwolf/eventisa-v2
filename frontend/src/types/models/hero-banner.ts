export interface HeroBanner {
  _id: string;
  imageUrl: string;
  title: string;
  subtitle?: string;
  ctaText?: string;
  ctaLink?: string;
  order: number;
  isActive: boolean;
}

export type HeroBannerInput = Omit<HeroBanner, "_id" | "order"> & { order?: number };
