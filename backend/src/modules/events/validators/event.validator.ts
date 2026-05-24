import { z } from "zod";
import {
  eventCustomFormSchema,
  formFieldSchema,
  ticketSegmentSchema,
} from "@/modules/forms/validators/form-field.validator.js";
import { SponsorTier, UniversityEventType } from "@/modules/events/types/university.types.js";

export { formFieldSchema, ticketSegmentSchema as ticketSectionSchema, eventCustomFormSchema };

/** Absolute URL or same-origin upload path from `/api/uploads`. */
export const mediaUrlSchema = z.union([
  z.string().url(),
  z.string().regex(/^\/api\/uploads\/files\/.+/),
]);

const venueSchema = z.object({
  name: z.string().min(1),
  address: z.string().optional(),
  city: z.string().min(1),
  country: z.string().default("Bangladesh"),
  mapUrl: z.string().url().optional(),
});

const eventBodySchema = z.object({
  title: z.string().min(3).max(200),
  slug: z
    .string()
    .min(2)
    .max(120)
    .regex(/^[a-z0-9]+(?:-[a-z0-9]+)*$/),
  shortDescription: z.string().max(300),
  description: z.string().min(10),
  coverImage: mediaUrlSchema.optional(),
  videoThumbnail: mediaUrlSchema.optional(),
  university: z
    .object({
      eventType: z.nativeEnum(UniversityEventType).or(z.string()).optional(),
      universityName: z.string().optional(),
      department: z.string().optional(),
      clubName: z.string().optional(),
      batch: z.string().optional(),
      session: z.string().optional(),
      studentOnly: z.boolean().optional(),
      requiresStudentId: z.boolean().optional(),
      allowedEmailDomains: z.array(z.string()).optional(),
    })
    .optional(),
  sponsors: z
    .array(
      z.object({
        name: z.string().min(1),
        logo: z.string().url(),
        tier: z.nativeEnum(SponsorTier),
        websiteUrl: z.string().url().optional(),
        order: z.number().optional(),
      })
    )
    .default([]),
  category: z.string().min(1),
  tags: z.array(z.string()).default([]),
  venue: venueSchema,
  startDate: z.coerce.date(),
  endDate: z.coerce.date(),
  registrationStart: z.coerce.date().optional(),
  registrationEnd: z.coerce.date().optional(),
  ticketSections: z.array(ticketSegmentSchema).min(1),
  capacity: z.number().int().min(1),
  seo: z
    .object({
      title: z.string().optional(),
      description: z.string().optional(),
      keywords: z.array(z.string()).optional(),
    })
    .optional(),
  customForm: eventCustomFormSchema.optional(),
  metaPixel: z
    .object({
      enabled: z.boolean().optional(),
      pixelId: z.string().optional(),
      googleAnalyticsId: z.string().optional(),
    })
    .optional(),
});

function applyEventDateRefinements(
  data: {
    startDate: Date;
    endDate: Date;
    registrationStart?: Date;
    registrationEnd?: Date;
  },
  ctx: z.RefinementCtx
) {
  if (data.endDate <= data.startDate) {
    ctx.addIssue({
      code: "custom",
      message: "Event end must be after event start",
      path: ["endDate"],
    });
  }
  if (
    data.registrationStart &&
    data.registrationEnd &&
    data.registrationEnd <= data.registrationStart
  ) {
    ctx.addIssue({
      code: "custom",
      message: "Registration close must be after registration open",
      path: ["registrationEnd"],
    });
  }
  if (data.registrationEnd && data.registrationEnd > data.endDate) {
    ctx.addIssue({
      code: "custom",
      message: "Registration cannot close after the event ends",
      path: ["registrationEnd"],
    });
  }
}

export const createEventSchema = eventBodySchema.superRefine(applyEventDateRefinements);

export const updateEventSchema = eventBodySchema.partial().superRefine((data, ctx) => {
  if (data.startDate && data.endDate) {
    applyEventDateRefinements(
      {
        startDate: data.startDate,
        endDate: data.endDate,
        registrationStart: data.registrationStart,
        registrationEnd: data.registrationEnd,
      },
      ctx
    );
  }
});

/** Admin full event edit — relaxed description length; may replace all segments. */
export const adminUpdateEventSchema = eventBodySchema
  .partial()
  .extend({
    description: z.string().min(1).max(100_000).optional(),
    ticketSections: z.array(ticketSegmentSchema).optional(),
    customForm: eventCustomFormSchema.optional(),
  })
  .superRefine((data, ctx) => {
    if (data.startDate && data.endDate) {
      applyEventDateRefinements(
        {
          startDate: data.startDate,
          endDate: data.endDate,
          registrationStart: data.registrationStart,
          registrationEnd: data.registrationEnd,
        },
        ctx
      );
    }
  });

export type CreateEventInput = z.infer<typeof eventBodySchema>;
