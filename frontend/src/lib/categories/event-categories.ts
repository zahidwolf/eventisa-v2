import type { LucideIcon } from "lucide-react";
import {
  Briefcase,
  Cpu,
  GraduationCap,
  Laugh,
  Music2,
  Presentation,
  Trophy,
  Utensils,
  Users,
  Building2,
  Sparkles,
} from "lucide-react";

/** Top-level categories shown on homepage & filters */
export const POPULAR_EVENT_CATEGORIES = [
  { slug: "Concert", label: "Concert", icon: Music2 },
  { slug: "Conference", label: "Conference", icon: Presentation },
  { slug: "Seminar", label: "Seminar", icon: Briefcase },
  { slug: "Workshop", label: "Workshop", icon: Cpu },
  { slug: "Hackathon", label: "Hackathon", icon: Cpu },
  { slug: "Sports", label: "Sports", icon: Trophy },
  { slug: "Comedy", label: "Comedy", icon: Laugh },
  { slug: "Food Festival", label: "Food Festival", icon: Utensils },
  { slug: "University Fest", label: "University Fest", icon: GraduationCap },
  { slug: "Business Summit", label: "Business Summit", icon: Building2 },
  { slug: "Career Fair", label: "Career Fair", icon: Briefcase },
  { slug: "Club Event", label: "Club Event", icon: Users },
  { slug: "Cultural Event", label: "Cultural Event", icon: Sparkles },
] as const;

/** Scalable taxonomy for organizer event builder */
export const EVENT_CATEGORY_TAXONOMY: {
  category: string;
  subcategories?: string[];
}[] = [
  { category: "Concert", subcategories: ["Live Music", "DJ Night", "Acoustic"] },
  { category: "Conference", subcategories: ["Business", "Tech", "Startup"] },
  { category: "Seminar", subcategories: ["Academic", "Professional"] },
  { category: "Workshop", subcategories: ["Creative", "Technical", "Business"] },
  { category: "Hackathon", subcategories: ["University", "Open"] },
  { category: "Sports", subcategories: ["Cricket", "Football", "Esports"] },
  { category: "Comedy", subcategories: ["Stand-up", "Improv"] },
  { category: "Food Festival", subcategories: ["Street Food", "Fine Dining"] },
  { category: "University Fest", subcategories: ["Club Fest", "Department Event", "Cultural Night"] },
  { category: "Business Summit", subcategories: ["Corporate", "Industry"] },
  { category: "Career Fair", subcategories: ["Campus", "Industry"] },
  { category: "Club Event", subcategories: ["Meetup", "Social"] },
  { category: "Cultural Event", subcategories: ["Traditional", "Modern"] },
  { category: "Festival", subcategories: ["Music", "Art", "Multi-day"] },
  { category: "Theatre", subcategories: ["Drama", "Musical"] },
];

export const CATEGORY_ICONS: Record<string, LucideIcon> = Object.fromEntries(
  POPULAR_EVENT_CATEGORIES.map((c) => [c.slug, c.icon])
) as Record<string, LucideIcon>;

/** Flat list for selects / API filter compatibility */
export const EVENT_CATEGORY_LABELS = POPULAR_EVENT_CATEGORIES.map((c) => c.slug);

export const ORGANIZER_TYPES = [
  { value: "event_organizer", label: "Event Organizer" },
  { value: "company", label: "Company / Brand" },
  { value: "agency", label: "Agency" },
  { value: "corporate", label: "Corporate" },
  { value: "university", label: "University" },
  { value: "club", label: "Club / Society" },
  { value: "community", label: "Community" },
  { value: "ngo", label: "NGO" },
] as const;
