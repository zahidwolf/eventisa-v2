"use client";

import { useEffect } from "react";

export default function GlobalError({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    console.error(error);
  }, [error]);

  return (
    <html lang="en">
      <body className="min-h-screen bg-[#050508] text-white antialiased">
        <main className="flex min-h-screen flex-col items-center justify-center px-6 text-center">
          <h1 className="text-2xl font-bold">Something went wrong</h1>
          <p className="mt-2 max-w-md text-sm text-zinc-500">
            A critical error occurred. Please try again.
          </p>
          <button
            type="button"
            onClick={reset}
            className="mt-8 rounded-lg bg-[#A855F7] px-6 py-3 text-sm font-semibold text-white hover:bg-[#7C3AED]"
          >
            Try again
          </button>
        </main>
      </body>
    </html>
  );
}
