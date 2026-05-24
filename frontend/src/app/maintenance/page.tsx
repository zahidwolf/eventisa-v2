import { env } from "@/config/env";

export default function MaintenancePage() {
  return (
    <div className="flex min-h-screen flex-col items-center justify-center bg-[#070B1A] px-6 text-center">
      <p className="font-display text-3xl font-bold text-gradient-luxury">{env.appName}</p>
      <h1 className="mt-8 font-display text-2xl font-bold text-white">We&apos;ll be right back</h1>
      <p className="mt-4 max-w-md text-zinc-400">
        {env.appName} is currently undergoing scheduled maintenance. We&apos;ll be back shortly.
      </p>
      <p className="mt-8 text-sm text-zinc-500">
        Support:{" "}
        <a href="mailto:eventisa.contact@gmail.com" className="text-[#FF3EA5]">
          eventisa.contact@gmail.com
        </a>
      </p>
    </div>
  );
}
