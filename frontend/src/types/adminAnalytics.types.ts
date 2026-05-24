export type AnalyticsDays = 7 | 30 | 90 | 365;

export interface PlatformOverview {
  totalUsers: number;
  newUsersToday: number;
  newUsersThisMonth: number;
  userGrowthPercent: number;
  totalEvents: number;
  liveEvents: number;
  pendingApproval: number;
  totalEventsThisMonth: number;
  totalTicketsSold: number;
  totalRevenue: number;
  revenueThisMonth: number;
  revenueLastMonth: number;
  revenueGrowthPercent: number;
  avgOrderValue: number;
  totalOrders: number;
  totalOrganizers: number;
  approvedOrganizers: number;
  pendingOrganizers: number;
  todayRevenue: number;
  todayTickets: number;
  todayOrders: number;
  todayNewUsers: number;
}

export interface RevenueTimeSeriesPoint {
  date: string;
  revenue: number;
  orders: number;
}

export interface TicketsTimeSeriesPoint {
  date: string;
  tickets: number;
}

export interface UsersTimeSeriesPoint {
  date: string;
  users: number;
}

export interface EventsTimeSeriesPoint {
  date: string;
  events: number;
}

export interface CategoryBreakdown {
  category: string;
  revenue: number;
  orders: number;
  percentage: number;
}

export interface CityBreakdown {
  city: string;
  revenue: number;
  events: number;
}

export interface TopEvent {
  eventId: string;
  title: string;
  organizerName: string;
  revenue: number;
  ticketsSold: number;
  category: string;
}

export interface TopOrganizer {
  organizerId: string;
  name: string;
  organizationName: string;
  totalRevenue: number;
  totalEvents: number;
  totalTicketsSold: number;
}

export interface StatusBreakdown {
  status: string;
  count: number;
  percentage: number;
}

export interface RecentOrder {
  orderId: string;
  buyerName: string;
  eventTitle: string;
  amount: number;
  createdAt: string;
}

export interface RecentEvent {
  eventId: string;
  title: string;
  organizerName: string;
  status: string;
  createdAt: string;
}

export interface RecentOrganizer {
  organizerId: string;
  name: string;
  orgName: string;
  approvalStatus: string;
  createdAt: string;
}

export interface RecentActivity {
  recentOrders: RecentOrder[];
  recentEvents: RecentEvent[];
  recentOrganizers: RecentOrganizer[];
}
