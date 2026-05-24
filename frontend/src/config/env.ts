export const env = {
  appName: process.env.NEXT_PUBLIC_APP_NAME ?? "Eventisa",
  appUrl: process.env.NEXT_PUBLIC_APP_URL ?? "http://localhost:3000",
  apiUrl: process.env.NEXT_PUBLIC_API_URL ?? "http://localhost:5001/api",
  locale: process.env.NEXT_PUBLIC_DEFAULT_LOCALE ?? "en",
  currency: process.env.NEXT_PUBLIC_DEFAULT_CURRENCY ?? "BDT",
  timezone: process.env.NEXT_PUBLIC_TIMEZONE ?? "Asia/Dhaka",
} as const;
