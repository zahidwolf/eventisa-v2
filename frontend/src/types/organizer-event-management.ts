export type OrganizerEventFilterStatus = "all" | "published" | "draft" | "ended";
export type OrganizerEventSort = "newest" | "oldest" | "most_sold" | "revenue";

export interface OrganizerEventListItem {
  _id: string;
  title: string;
  slug: string;
  coverImage?: string;
  startDate: string;
  status: string;
  approvalStatus: string;
  ticketsSold: number;
  capacity: number;
  /** @deprecated use capacity */
  totalCapacity?: number;
  revenue: number;
  segmentCount: number;
  checkedInCount: number;
}

export interface OrganizerEventsListResponse {
  events: OrganizerEventListItem[];
  page: number;
  limit: number;
  total: number;
}

export interface OrganizerEventsFilters {
  search?: string;
  status?: OrganizerEventFilterStatus;
  sort?: OrganizerEventSort;
  page?: number;
  limit?: number;
}

export interface EventOverviewSegment {
  segmentId: string;
  name: string;
  price: number;
  isFree?: boolean;
  capacity: number;
  sold: number;
  remaining: number;
  revenue: number;
  status: string;
  ticketColor?: string;
  isSoldOut?: boolean;
}

export interface EventOverviewStats {
  totalSold: number;
  capacity: number;
  revenue: number;
  checkedIn: number;
  platformFee: number;
  netRevenue: number;
  activePromoCodes: number;
  /** @deprecated use totalSold */
  ticketsSold?: number;
  /** @deprecated use capacity */
  totalCapacity?: number;
  /** @deprecated use checkedIn */
  checkedInCount?: number;
  checkInRate?: number;
}

export interface EventOverviewData {
  event?: {
    _id: string;
    title: string;
    slug: string;
    status: string;
    approvalStatus: string;
    startDate: string;
    venue?: { name: string; city: string };
    coverImage?: string;
  };
  stats: EventOverviewStats;
  segments: EventOverviewSegment[];
  recentAttendees: {
    name: string;
    email?: string;
    segmentName: string;
    createdAt: string;
    /** @deprecated use createdAt */
    purchasedAt?: string;
  }[];
  recentCheckIns: {
    attendeeName: string;
    segmentName: string;
    scannedAt: string;
  }[];
}

export interface EventAnalyticsData {
  salesByDay: { date: string; count: number; revenue: number }[];
  segmentBreakdown: {
    segmentId?: string;
    name: string;
    sold: number;
    revenue: number;
    color?: string;
  }[];
  checkInRate: { checkedIn: number; totalSold: number; percentage: number };
  summary: {
    totalRevenue: number;
    avgTicketPrice: number;
    bestSegment: string;
    checkInRate: number;
    platformFee?: number;
    netRevenue?: number;
  };
}
