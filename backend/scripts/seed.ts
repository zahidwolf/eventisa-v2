/**
 * Demo seed — run: npm run seed (from backend/)
 * Requires MongoDB on localhost and .env with JWT secrets.
 */
import dotenv from "dotenv";
dotenv.config();

import mongoose from "mongoose";
import bcrypt from "bcryptjs";
import { env } from "../src/config/env.js";
import { User } from "../src/modules/users/models/user.model.js";
import { Role } from "../src/shared/enums/role.enum.js";
import { AdminStaffRole } from "../src/shared/enums/admin-staff-role.enum.js";
import { AdminRefreshToken } from "../src/modules/admin-auth/models/admin-refresh-token.model.js";
import { UserStatus } from "../src/modules/users/types/user.types.js";
import { Organizer } from "../src/modules/organizers/models/organizer.model.js";
import { OrganizerVerificationStatus } from "../src/modules/organizers/types/organizer.types.js";
import { Event } from "../src/modules/events/models/event.model.js";
import { EventApprovalStatus, EventStatus } from "../src/modules/events/types/event.types.js";
import { FormFieldType } from "../src/modules/events/models/event-custom-form.schema.js";
import { Order } from "../src/modules/orders/models/order.model.js";
import { Ticket } from "../src/modules/tickets/models/ticket.model.js";
import { TicketReservation } from "../src/modules/tickets/models/ticket-reservation.model.js";
import {
  PaymentStatus,
  OrderStatus,
  OrderReservationStatus,
} from "../src/modules/orders/types/order.types.js";
import { generateOrderId, generateTicketNumber } from "../src/shared/utils/order-id.util.js";
import QRCode from "qrcode";

type DemoEventSeed = {
  title: string;
  slug: string;
  category: string;
  city: string;
  venueName: string;
  shortDescription: string;
  description: string;
  coverImage: string;
  daysFromNow: number;
  durationHours?: number;
  featured?: boolean;
  trending?: boolean;
  listingRank?: number;
  approvalStatus?: EventApprovalStatus;
  status?: EventStatus;
  vipPrice?: number;
  regularPrice?: number;
  soldOut?: boolean;
  university?: {
    universityName?: string;
    eventType?: string;
    clubName?: string;
    studentOnly?: boolean;
  };
  tags?: string[];
};

const DEMO_EVENTS: DemoEventSeed[] = [
  {
    title: "Dhaka Arena Live — Star Night",
    slug: "dhaka-arena-star-night",
    category: "Concert",
    city: "Dhaka",
    venueName: "Dhaka Arena",
    shortDescription: "Bangladesh's biggest stadium concert with international acts.",
    description:
      "Experience a full-scale production with LED stages, guest DJs, and premium sound. Gates open 2 hours before showtime.",
    coverImage: "https://images.unsplash.com/photo-1470229722913-7c0e2dbbafd3?w=1200&h=630&fit=crop",
    daysFromNow: 3,
    featured: true,
    trending: true,
    listingRank: 100,
    vipPrice: 4500,
    regularPrice: 1500,
  },
  {
    title: "Chattogram Sunset Music Fest",
    slug: "chattogram-sunset-music-fest",
    category: "Concert",
    city: "Chattogram",
    venueName: "ICC Chattogram",
    shortDescription: "Open-air festival on the Bay with 12 artists.",
    description: "Food trucks, merch village, and two stages. Family zone available.",
    coverImage: "https://images.unsplash.com/photo-1459742919991-ef5ebc06a46b?w=1200&h=630&fit=crop",
    daysFromNow: 5,
    trending: true,
    listingRank: 95,
    regularPrice: 1200,
  },
  {
    title: "Tech Summit Bangladesh 2026",
    slug: "tech-summit-bangladesh-2026",
    category: "Conference",
    city: "Dhaka",
    venueName: "Bangabandhu International Conference Center",
    shortDescription: "500+ speakers on AI, fintech, and startups.",
    description: "Networking lounges, expo hall, and hiring fair for tech talent.",
    coverImage: "https://images.unsplash.com/photo-1540575467063-178a50c2df87?w=1200&h=630&fit=crop",
    daysFromNow: 10,
    featured: true,
    trending: true,
    vipPrice: 8000,
    regularPrice: 2500,
  },
  {
    title: "Sylhet Startup Seminar",
    slug: "sylhet-startup-seminar",
    category: "Seminar",
    city: "Sylhet",
    venueName: "Sylhet International Convention Centre",
    shortDescription: "Founders share playbooks for scaling in Bangladesh.",
    description: "Includes Q&A panels and investor office hours.",
    coverImage: "https://images.unsplash.com/photo-1511578314322-379afb4768f1?w=1200&h=630&fit=crop",
    daysFromNow: 4,
    trending: true,
    regularPrice: 500,
  },
  {
    title: "UI/UX Design Workshop — Pro Track",
    slug: "ui-ux-design-workshop-pro",
    category: "Workshop",
    city: "Dhaka",
    venueName: "Innovation Hub Gulshan",
    shortDescription: "Hands-on Figma + design systems in one day.",
    description: "Bring your laptop. Certificate included. Limited seats.",
    coverImage: "https://images.unsplash.com/photo-1552664730-d307ca884978?w=1200&h=630&fit=crop",
    daysFromNow: 6,
    featured: true,
    regularPrice: 1800,
  },
  {
    title: "National Hackathon 48H",
    slug: "national-hackathon-48h",
    category: "Hackathon",
    city: "Dhaka",
    venueName: "BUET Campus Hall",
    shortDescription: "Build solutions for climate & health — ৳10L prize pool.",
    description: "Teams of 2–4. Mentors on-site. Free meals for participants.",
    coverImage: "https://images.unsplash.com/photo-1517245386807-bb43f82c33c4?w=1200&h=630&fit=crop",
    daysFromNow: 14,
    trending: true,
    regularPrice: 300,
  },
  {
    title: "BPL Final Watch Party",
    slug: "bpl-final-watch-party",
    category: "Sports",
    city: "Dhaka",
    venueName: "Sher-e-Bangla National Stadium",
    shortDescription: "Giant screens, fan zone, and live commentary.",
    description: "Includes stadium entry for watch party zone and refreshments.",
    coverImage: "https://images.unsplash.com/photo-1531415071318-de3cfbe45daf?w=1200&h=630&fit=crop",
    daysFromNow: 2,
    trending: true,
    listingRank: 90,
    regularPrice: 800,
  },
  {
    title: "Rajshahi Cricket Carnival",
    slug: "rajshahi-cricket-carnival",
    category: "Sports",
    city: "Rajshahi",
    venueName: "Rajshahi Divisional Stadium",
    shortDescription: "Local league finals with food stalls and music.",
    description: "All-ages event. Parking available on-site.",
    coverImage: "https://images.unsplash.com/photo-1624526260202-81f9eaa56948?w=1200&h=630&fit=crop",
    daysFromNow: 12,
    regularPrice: 600,
  },
  {
    title: "Dhaka Comedy Night — Sold Out Soon",
    slug: "dhaka-comedy-night",
    category: "Comedy",
    city: "Dhaka",
    venueName: "Hatirjheel Amphitheatre",
    shortDescription: "Stand-up lineup featuring top BD comedians.",
    description: "18+ recommended. No refunds within 48h of event.",
    coverImage: "https://images.unsplash.com/photo-1585699324551-28566d9d5c5d?w=1200&h=630&fit=crop",
    daysFromNow: 7,
    trending: true,
    regularPrice: 900,
  },
  {
    title: "Street Food Festival Dhaka",
    slug: "street-food-festival-dhaka",
    category: "Food Festival",
    city: "Dhaka",
    venueName: "Hatirjheel Lakefront",
    shortDescription: "100+ vendors, live bands, and family activities.",
    description: "Entry includes tasting passport for 5 signature dishes.",
    coverImage: "https://images.unsplash.com/photo-1555939594-58d7cb561ad1?w=1200&h=630&fit=crop",
    daysFromNow: 5,
    featured: true,
    trending: true,
    regularPrice: 400,
  },
  {
    title: "BRAC University Spring Fest",
    slug: "brac-university-spring-fest",
    category: "University Fest",
    city: "Dhaka",
    venueName: "BRAC University Campus",
    shortDescription: "Campus bands, gaming zone, and career booths.",
    description: "Student ID required at gate. Alumni welcome on day 2.",
    coverImage: "https://images.unsplash.com/photo-1523050854058-8df90110c9f1?w=1200&h=630&fit=crop",
    daysFromNow: 8,
    trending: true,
    university: {
      universityName: "BRAC University",
      eventType: "Club Fest",
      clubName: "BRAC Cultural Club",
      studentOnly: true,
    },
    regularPrice: 350,
  },
  {
    title: "Bangladesh Business Summit",
    slug: "bangladesh-business-summit",
    category: "Business Summit",
    city: "Dhaka",
    venueName: "Pan Pacific Sonargaon",
    shortDescription: "CEOs & policymakers on trade and digital economy.",
    description: "Gala dinner optional. Business formal dress code.",
    coverImage: "https://images.unsplash.com/photo-1560472354-b33ff0c44a43?w=1200&h=630&fit=crop",
    daysFromNow: 18,
    featured: true,
    vipPrice: 12000,
    regularPrice: 4500,
  },
  {
    title: "National Career Fair 2026",
    slug: "national-career-fair-2026",
    category: "Career Fair",
    city: "Dhaka",
    venueName: "Bangladesh China Friendship Center",
    shortDescription: "80+ employers hiring across engineering & business.",
    description: "Bring printed CVs. On-spot interviews for shortlisted roles.",
    coverImage: "https://images.unsplash.com/photo-1521737711867-e3b97375f902?w=1200&h=630&fit=crop",
    daysFromNow: 4,
    trending: true,
    regularPrice: 0,
  },
  {
    title: "Chattogram Creators Meetup",
    slug: "chattogram-creators-meetup",
    category: "Club Event",
    city: "Chattogram",
    venueName: "The Peninsula Chattogram",
    shortDescription: "YouTubers & podcasters share monetization tips.",
    description: "Community networking with light refreshments.",
    coverImage: "https://images.unsplash.com/photo-1515187027835-9f73d0a329bd?w=1200&h=630&fit=crop",
    daysFromNow: 9,
    regularPrice: 250,
  },
  {
    title: "Pohela Boishakh Cultural Night",
    slug: "pohela-boishakh-cultural-night",
    category: "Cultural Event",
    city: "Dhaka",
    venueName: "Rabindra Sarobar",
    shortDescription: "Traditional dance, folk music, and artisan market.",
    description: "Celebrate Bengali New Year with local artists and crafts.",
    coverImage: "https://images.unsplash.com/photo-1516450360452-9312f5e86fc7?w=1200&h=630&fit=crop",
    daysFromNow: 6,
    featured: true,
    regularPrice: 700,
  },
  {
    title: "Khulna Riverfront Jazz Evening",
    slug: "khulna-riverfront-jazz",
    category: "Concert",
    city: "Khulna",
    venueName: "Khulna City Hall",
    shortDescription: "Smooth jazz under the stars by the Rupsha.",
    description: "Seated and standing zones. Rain date announced 24h prior.",
    coverImage: "https://images.unsplash.com/photo-1415201364774-f6fbaa03a3ee?w=1200&h=630&fit=crop",
    daysFromNow: 11,
    regularPrice: 1100,
  },
  {
    title: "Sylhet Tea Festival",
    slug: "sylhet-tea-festival",
    category: "Food Festival",
    city: "Sylhet",
    venueName: "Sylhet Tea Estate Grounds",
    shortDescription: "Tastings, plantation tours, and live folk music.",
    description: "Shuttle from Sylhet city center included with VIP pass.",
    coverImage: "https://images.unsplash.com/photo-1556679343-c7306c1976bc?w=1200&h=630&fit=crop",
    daysFromNow: 15,
    trending: true,
    vipPrice: 2200,
    regularPrice: 650,
  },
  {
    title: "Barishal Boat Race & Fair",
    slug: "barishal-boat-race-fair",
    category: "Cultural Event",
    city: "Barishal",
    venueName: "Kirtankhola Riverfront",
    shortDescription: "Traditional nouka baich and riverside fair.",
    description: "Family-friendly. Local handicrafts and street food.",
    coverImage: "https://images.unsplash.com/photo-1506905925346-21bda4d32df4?w=1200&h=630&fit=crop",
    daysFromNow: 20,
    regularPrice: 300,
  },
  {
    title: "Rangpur Tech Meetup",
    slug: "rangpur-tech-meetup",
    category: "Workshop",
    city: "Rangpur",
    venueName: "Rangpur Engineering College",
    shortDescription: "Intro to cloud & DevOps for students and juniors.",
    description: "Free swag for first 50 registrations.",
    coverImage: "https://images.unsplash.com/photo-1504384308090-c894fdcc538d?w=1200&h=630&fit=crop",
    daysFromNow: 3,
    trending: true,
    regularPrice: 200,
  },
  {
    title: "Dhaka International Theatre Fest",
    slug: "dhaka-theatre-fest",
    category: "Cultural Event",
    city: "Dhaka",
    venueName: "Shilpakala Academy",
    shortDescription: "5 plays from Bangladesh and South Asia.",
    description: "Choose individual shows or full festival pass.",
    coverImage: "https://images.unsplash.com/photo-1503095396549-7597b3d31e0a?w=1200&h=630&fit=crop",
    daysFromNow: 13,
    regularPrice: 850,
  },
  {
    title: "Esports Championship Finals",
    slug: "esports-championship-finals",
    category: "Sports",
    city: "Dhaka",
    venueName: "Gaming Arena Banani",
    shortDescription: "Top teams battle for ৳5L in VALORANT & FC Mobile.",
    description: "Spectator tickets include merch discount codes.",
    coverImage: "https://images.unsplash.com/photo-1542751371-adc38448a05e?w=1200&h=630&fit=crop",
    daysFromNow: 1,
    trending: true,
    listingRank: 88,
    regularPrice: 500,
    soldOut: false,
  },
  {
    title: "Corporate Leadership Masterclass",
    slug: "corporate-leadership-masterclass",
    category: "Seminar",
    city: "Dhaka",
    venueName: "Westin Dhaka",
    shortDescription: "Executive coaching for managers and team leads.",
    description: "Includes workbook and lunch. Dress business casual.",
    coverImage: "https://images.unsplash.com/photo-1556761175-b413da4baf72?w=1200&h=630&fit=crop",
    daysFromNow: 16,
    vipPrice: 6000,
    regularPrice: 3200,
  },
  {
    title: "Chattogram Food & Music Carnival",
    slug: "chattogram-food-music-carnival",
    category: "Festival",
    city: "Chattogram",
    venueName: "Patenga Beach Park",
    shortDescription: "Beachside DJs, seafood, and fireworks finale.",
    description: "Weekend pass saves 20% vs single-day tickets.",
    coverImage: "https://images.unsplash.com/photo-1492684223066-81342ee5ff30?w=1200&h=630&fit=crop",
    daysFromNow: 5,
    featured: true,
    trending: true,
    regularPrice: 950,
  },
  {
    title: "Sold Out Showcase (Demo)",
    slug: "sold-out-showcase-demo",
    category: "Concert",
    city: "Dhaka",
    venueName: "Army Stadium",
    shortDescription: "Demo event with no remaining tickets — UI testing.",
    description: "Use this event to verify sold-out states across the site.",
    coverImage: "https://images.unsplash.com/photo-1501281668745-f7f57925c3b4?w=1200&h=630&fit=crop",
    daysFromNow: 7,
    soldOut: true,
    regularPrice: 2000,
  },
  // Pending approval — for admin review flow
  {
    title: "Pending: Khulna Night Market Fest",
    slug: "pending-khulna-night-market",
    category: "Food Festival",
    city: "Khulna",
    venueName: "Khulna City Center",
    shortDescription: "Awaiting admin approval — test moderation queue.",
    description: "Organizer submitted this event for review.",
    coverImage: "https://images.unsplash.com/photo-1559339352-11d035aa65de?w=1200&h=630&fit=crop",
    daysFromNow: 25,
    approvalStatus: EventApprovalStatus.Pending,
    status: EventStatus.Pending,
    regularPrice: 350,
  },
  {
    title: "Pending: Private Corporate Gala",
    slug: "pending-corporate-gala",
    category: "Business Summit",
    city: "Dhaka",
    venueName: "Le Méridien Dhaka",
    shortDescription: "Invite-only gala — pending admin approval.",
    description: "Test approve/reject in admin dashboard.",
    coverImage: "https://images.unsplash.com/photo-1511795409834-ef04bbd61622?w=1200&h=630&fit=crop",
    daysFromNow: 30,
    approvalStatus: EventApprovalStatus.Pending,
    status: EventStatus.Pending,
    vipPrice: 15000,
    regularPrice: 7500,
  },
];

function addDays(base: Date, days: number, hours = 4): { start: Date; end: Date } {
  const start = new Date(base);
  start.setDate(start.getDate() + days);
  start.setHours(18, 0, 0, 0);
  const end = new Date(start);
  end.setHours(end.getHours() + hours);
  return { start, end };
}

async function seed() {
  await mongoose.connect(env.MONGO_URI);
  console.log("Connected to MongoDB");

  await Promise.all([
    User.deleteMany({}),
    Organizer.deleteMany({}),
    Event.deleteMany({}),
    Order.deleteMany({}),
    Ticket.deleteMany({}),
    TicketReservation.deleteMany({}),
    AdminRefreshToken.deleteMany({}),
  ]);

  const passwordHash = await bcrypt.hash("Password123", 12);

  await User.insertMany([
    {
      name: "Super Admin",
      email: "superadmin@eventisa.com",
      phone: "01700000001",
      password: passwordHash,
      role: Role.SuperAdmin,
      staffRole: AdminStaffRole.SuperAdmin,
      isVerified: true,
      status: UserStatus.Active,
    },
    {
      name: "Platform Admin",
      email: "admin@eventisa.com",
      phone: "01700000011",
      password: passwordHash,
      role: Role.Admin,
      staffRole: AdminStaffRole.Admin,
      isVerified: true,
      status: UserStatus.Active,
    },
    {
      name: "Event Moderator",
      email: "moderator@eventisa.com",
      phone: "01700000012",
      password: passwordHash,
      role: Role.Admin,
      staffRole: AdminStaffRole.Moderator,
      isVerified: true,
      status: UserStatus.Active,
    },
  ]);

  const orgUsers = await User.insertMany([
    {
      name: "Dhaka Events Co",
      email: "organizer1@eventisa.com",
      phone: "01700000002",
      password: passwordHash,
      role: Role.Organizer,
      isVerified: true,
      status: UserStatus.Active,
    },
    {
      name: "Chattogram Live",
      email: "organizer2@eventisa.com",
      phone: "01700000003",
      password: passwordHash,
      role: Role.Organizer,
      isVerified: true,
      status: UserStatus.Active,
    },
  ]);

  const organizers = await Organizer.insertMany([
    {
      userId: orgUsers[0]._id,
      businessName: "Dhaka Events Co",
      slug: "dhaka-events",
      phone: "01700000002",
      email: "organizer1@eventisa.com",
      description: "Premium concerts, conferences & festivals in Dhaka",
      verificationStatus: OrganizerVerificationStatus.Approved,
    },
    {
      userId: orgUsers[1]._id,
      businessName: "Chattogram Live",
      slug: "chattogram-live",
      phone: "01700000003",
      email: "organizer2@eventisa.com",
      description: "Sports, food & cultural events across Bangladesh",
      verificationStatus: OrganizerVerificationStatus.Approved,
    },
  ]);

  const demoUser = await User.create({
    name: "Demo User",
    email: "user@eventisa.com",
    phone: "01700000004",
    password: passwordHash,
    role: Role.User,
    isVerified: true,
    status: UserStatus.Active,
  });

  const now = new Date();
  const liveEvents = [];
  let rank = 100;

  for (let i = 0; i < DEMO_EVENTS.length; i++) {
    const d = DEMO_EVENTS[i];
    const org = organizers[i % 2];
    const { start, end } = addDays(now, d.daysFromNow, d.durationHours ?? 4);
    const isLive = (d.approvalStatus ?? EventApprovalStatus.Approved) === EventApprovalStatus.Approved;
    const regularCap = d.soldOut ? 50 : 500;
    const regularSold = d.soldOut ? 50 : i < 5 ? 8 + i : 0;
    const vipPrice = d.vipPrice ?? 3500;
    const regularPrice = d.regularPrice ?? 1200;

    const event = await Event.create({
      title: d.title,
      slug: d.slug,
      shortDescription: d.shortDescription,
      description: d.description,
      coverImage: d.coverImage,
      category: d.category,
      university: d.university ?? {},
      tags: d.tags ?? ["demo", d.category.toLowerCase(), d.city.toLowerCase()],
      venue: {
        name: d.venueName,
        city: d.city,
        country: "Bangladesh",
        address: `${d.venueName}, ${d.city}`,
      },
      city: d.city,
      country: "Bangladesh",
      startDate: start,
      endDate: end,
      ticketSections: [
        {
          title: "VIP",
          price: vipPrice,
          capacity: 80,
          quantitySold: d.soldOut ? 80 : i < 3 ? 10 : 0,
          maxPurchase: 4,
          benefits: ["Priority entry", "Lounge"],
          isVisible: vipPrice > 0,
        },
        {
          title: "Regular",
          price: regularPrice,
          capacity: regularCap,
          quantitySold: regularSold,
          maxPurchase: 10,
          benefits: ["General admission"],
          isVisible: true,
        },
        {
          title: "Early Bird",
          price: Math.max(0, Math.round(regularPrice * 0.75)),
          capacity: 150,
          quantitySold: i === 2 ? 40 : 0,
          maxPurchase: 6,
          benefits: ["Limited time pricing"],
          isVisible: regularPrice > 0 && !d.soldOut,
        },
      ],
      capacity: 730,
      status: d.status ?? (isLive ? EventStatus.Live : EventStatus.Draft),
      approvalStatus: d.approvalStatus ?? EventApprovalStatus.Approved,
      organizer: org._id,
      featured: d.featured ?? false,
      trending: d.trending ?? false,
      homepagePriority: rank,
      listingRank: d.listingRank ?? rank,
      customForm: {
        enabled: i % 3 === 0,
        fields: [
          {
            key: "phone_alt",
            label: "Alternate phone",
            type: FormFieldType.Text,
            required: false,
            order: 0,
          },
          {
            key: "tshirt",
            label: "T-Shirt size",
            type: FormFieldType.Select,
            required: false,
            options: ["S", "M", "L", "XL"],
            order: 1,
          },
        ],
      },
      seo: {
        title: `${d.title} | Eventisa`,
        description: d.shortDescription,
        keywords: [d.category, d.city, "tickets", "Bangladesh"],
      },
    });

    if (isLive) liveEvents.push(event);
    rank -= 2;
  }

  // Sample paid orders + QR tickets for first 4 live events
  for (let i = 0; i < Math.min(4, liveEvents.length); i++) {
    const event = liveEvents[i];
    const section = event.ticketSections.find((s) => s.title === "Regular") ?? event.ticketSections[0];
    const orderId = generateOrderId();
    const subtotal = section.price * 2;
    const serviceFee = Math.round(subtotal * 0.05);

    const order = await Order.create({
      orderId,
      guestName: "Guest Booker",
      guestEmail: `guest${i}@example.com`,
      guestPhone: "01711223344",
      userId: i === 0 ? demoUser._id : undefined,
      eventId: event._id,
      organizerId: event.organizer,
      reservationId: new mongoose.Types.ObjectId(),
      ticketItems: [
        {
          sectionId: section._id?.toString() ?? "",
          sectionTitle: section.title,
          quantity: 2,
          unitPrice: section.price,
          lineTotal: subtotal,
        },
      ],
      subtotal,
      serviceFee,
      discount: 0,
      total: subtotal + serviceFee,
      currency: "BDT",
      paymentStatus: PaymentStatus.Paid,
      orderStatus: OrderStatus.Completed,
      reservationStatus: OrderReservationStatus.Reserved,
      paymentMethod: "seed_demo",
      expiresAt: new Date(Date.now() + 86400000),
    });

    for (let t = 0; t < 2; t++) {
      const ticketNumber = generateTicketNumber();
      const qrCodeData = await QRCode.toDataURL(
        JSON.stringify({ ticketNumber, bookingId: orderId, eventId: event._id.toString() })
      );
      await Ticket.create({
        ticketNumber,
        bookingId: orderId,
        orderId: order._id,
        eventId: event._id,
        sectionId: section._id?.toString() ?? "",
        sectionTitle: section.title,
        holderName: order.guestName,
        holderEmail: order.guestEmail,
        holderPhone: order.guestPhone,
        qrCodeData,
        userId: order.userId,
      });
    }
  }

  const pendingCount = DEMO_EVENTS.filter(
    (e) => e.approvalStatus === EventApprovalStatus.Pending
  ).length;

  console.log("\n✅ Seed complete\n");
  console.log("Accounts (password: Password123):");
  console.log("  Super Admin: superadmin@eventisa.com  → /admin/login");
  console.log("  Admin:       admin@eventisa.com");
  console.log("  Moderator:   moderator@eventisa.com");
  console.log("  Organizer1: organizer1@eventisa.com");
  console.log("  Organizer2: organizer2@eventisa.com");
  console.log("  User:       user@eventisa.com");
  console.log(`\n  ${liveEvents.length} live events · ${pendingCount} pending (admin review)`);
  console.log("  Sample tickets on first 4 events\n");
  console.log("Try:");
  console.log("  Homepage:     http://localhost:3000");
  console.log("  All events:   http://localhost:3000/events");
  console.log("  Admin portal: http://localhost:3000/admin/login\n");

  await mongoose.disconnect();
}

seed().catch((err) => {
  console.error(err);
  process.exit(1);
});
