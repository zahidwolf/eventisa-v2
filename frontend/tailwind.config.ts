import type { Config } from "tailwindcss";
import tailwindcssAnimate from "tailwindcss-animate";

const config: Config = {
  darkMode: ["class"],
  content: ["./src/**/*.{ts,tsx}"],
  theme: {
    extend: {
      colors: {
        border: "hsl(var(--border))",
        input: "hsl(var(--input))",
        ring: "hsl(var(--ring))",
        background: "hsl(var(--background))",
        foreground: "hsl(var(--foreground))",
        destructive: {
          DEFAULT: "hsl(var(--destructive))",
          foreground: "hsl(var(--foreground))",
        },
        muted: {
          DEFAULT: "hsl(var(--muted))",
          foreground: "hsl(var(--muted-foreground))",
        },
        secondary: {
          DEFAULT: "hsl(var(--secondary))",
          foreground: "hsl(var(--secondary-foreground))",
        },
        card: {
          DEFAULT: "hsl(var(--card))",
          foreground: "hsl(var(--card-foreground))",
        },
        primary: {
          DEFAULT: "#FF3EA5",
          foreground: "#FFFFFF",
          neon: "#9B5CFF",
          dark: "#C42D7A",
        },
        accent: {
          DEFAULT: "#9B5CFF",
          magenta: "#FF3EA5",
          hot: "#E6368A",
          purple: "#9B5CFF",
          pink: "#FF3EA5",
          blue: "#4F8CFF",
        },
        surface: {
          DEFAULT: "#070B1A",
          elevated: "#10162A",
          card: "#151B31",
          glass: "rgba(21, 27, 49, 0.72)",
          border: "rgba(255, 255, 255, 0.08)",
        },
        brand: {
          DEFAULT: "#FF3EA5",
          dark: "#C42D7A",
          light: "#FF6BB8",
        },
        gold: "#F5D061",
      },
      fontFamily: {
        sans: ["var(--font-inter)", "system-ui", "sans-serif"],
        display: ["var(--font-display)", "system-ui", "sans-serif"],
        bengali: ["var(--font-hind-siliguri)", "system-ui", "sans-serif"],
      },
      backgroundImage: {
        "hero-luxury":
          "radial-gradient(ellipse 80% 50% at 50% -20%, rgba(155, 92, 255, 0.2), transparent), radial-gradient(ellipse 60% 40% at 100% 0%, rgba(255, 62, 165, 0.15), transparent), radial-gradient(ellipse 50% 30% at 0% 30%, rgba(79, 140, 255, 0.08), transparent), linear-gradient(180deg, #070B1A 0%, #10162A 100%)",
        "card-glow":
          "radial-gradient(circle at top right, rgba(255, 62, 165, 0.15), transparent 55%)",
        "gradient-text": "linear-gradient(90deg, #FF3EA5, #FFFFFF, #9B5CFF)",
      },
      boxShadow: {
        "glow-pink": "0 20px 50px -12px rgba(255, 62, 165, 0.35)",
        "glow-purple": "0 20px 50px -12px rgba(155, 92, 255, 0.3)",
      },
      animation: {
        "fade-in": "fadeIn 0.5s ease-out",
        "slide-up": "slideUp 0.5s ease-out",
        "pulse-glow": "pulseGlow 4s ease-in-out infinite",
        shimmer: "shimmer 2s linear infinite",
      },
      keyframes: {
        fadeIn: {
          "0%": { opacity: "0" },
          "100%": { opacity: "1" },
        },
        slideUp: {
          "0%": { opacity: "0", transform: "translateY(16px)" },
          "100%": { opacity: "1", transform: "translateY(0)" },
        },
        pulseGlow: {
          "0%, 100%": { opacity: "0.35" },
          "50%": { opacity: "0.7" },
        },
        shimmer: {
          "0%": { backgroundPosition: "-200% 0" },
          "100%": { backgroundPosition: "200% 0" },
        },
      },
    },
  },
  plugins: [tailwindcssAnimate],
};

export default config;
