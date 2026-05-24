import { z } from "zod";

const venueFields = {
  name: z.string().min(1).max(200),
  address: z.string().max(500).optional(),
  city: z.string().min(1).max(120),
  capacity: z.number().int().min(0).optional(),
  image: z.string().max(500).optional(),
  googleMapsUrl: z.string().max(500).optional(),
  isActive: z.boolean().optional(),
};

export const createVenueSchema = z.object(venueFields);

export const updateVenueSchema = z.object(venueFields).partial();
