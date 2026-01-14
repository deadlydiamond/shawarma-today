import type { Config } from "tailwindcss"

const config = {
  darkMode: ["class"],
  content: [
    './pages/**/*.{ts,tsx}',
    './components/**/*.{ts,tsx}',
    './app/**/*.{ts,tsx}',
    './src/**/*.{ts,tsx}',
  ],
  prefix: "",
  theme: {
    container: {
      center: true,
      padding: "2rem",
      screens: {
        "2xl": "1400px",
      },
    },
    extend: {
      colors: {
        // Shawarma brand colors (extracted from signage)
        shawarma: {
          orange: "#F26522",      // Primary brand - appetite, heat, speed
          black: "#0E0E0E",       // Deep black background
          yellow: "#FFC845",      // Flame accent
          white: "#FFFFFF",       // Contrast/labels
          DEFAULT: "#F26522",
        },
        // Accent colors for UI
        brand: {
          primary: "#F26522",     // Shawarma Orange
          secondary: "#FFC845",   // Flame Yellow
          dark: "#0E0E0E",        // Deep Black
          light: "#FFFFFF",       // White
        },
        // Legacy compatibility
        coffee: {
          dark: "#0E0E0E",
          medium: "#F26522",
          light: "#FFC845",
          latte: "#FFE4B5",
          cream: "#FFF8F0",
          DEFAULT: "#F26522",
        },
        brown: {
          dark: "#0E0E0E",
          medium: "#1a1a1a",
          light: "#333333",
          DEFAULT: "#0E0E0E",
        },
        cream: {
          background: "#FFF8F0",
          light: "#FFFAF5",
          DEFAULT: "#FFF8F0",
        },
        gold: {
          primary: "#FFC845",
          secondary: "#F26522",
        },
        black: {
          primary: "#0E0E0E",
          DEFAULT: "#0E0E0E",
        },
        charcoal: "#1a1a1a",
        border: "hsl(var(--border))",
        input: "hsl(var(--input))",
        ring: "hsl(var(--ring))",
        background: "hsl(var(--background))",
        foreground: "hsl(var(--foreground))",
        primary: {
          DEFAULT: "hsl(var(--primary))",
          foreground: "hsl(var(--primary-foreground))",
        },
        secondary: {
          DEFAULT: "hsl(var(--secondary))",
          foreground: "hsl(var(--secondary-foreground))",
        },
        destructive: {
          DEFAULT: "hsl(var(--destructive))",
          foreground: "hsl(var(--destructive-foreground))",
        },
        muted: {
          DEFAULT: "hsl(var(--muted))",
          foreground: "hsl(var(--muted-foreground))",
        },
        accent: {
          DEFAULT: "hsl(var(--accent))",
          foreground: "hsl(var(--accent-foreground))",
        },
        popover: {
          DEFAULT: "hsl(var(--popover))",
          foreground: "hsl(var(--popover-foreground))",
        },
        card: {
          DEFAULT: "hsl(var(--card))",
          foreground: "hsl(var(--card-foreground))",
        },
      },
      borderRadius: {
        lg: "var(--radius)",
        md: "calc(var(--radius) - 2px)",
        sm: "calc(var(--radius) - 4px)",
      },
      fontFamily: {
        heading: ["var(--font-heading)", "Anton", "sans-serif"],
        body: ["var(--font-body)", "Inter", "sans-serif"],
        display: ["var(--font-heading)", "Anton", "sans-serif"],
      },
      letterSpacing: {
        heading: "0.02em",
      },
      keyframes: {
        "accordion-down": {
          from: { height: "0" },
          to: { height: "var(--radix-accordion-content-height)" },
        },
        "accordion-up": {
          from: { height: "var(--radix-accordion-content-height)" },
          to: { height: "0" },
        },
        "fade-in": {
          "0%": { opacity: "0" },
          "100%": { opacity: "1" },
        },
        "slide-up": {
          "0%": { opacity: "0", transform: "translateY(20px)" },
          "100%": { opacity: "1", transform: "translateY(0)" },
        },
        "scale-in": {
          "0%": { opacity: "0", transform: "scale(0.95)" },
          "100%": { opacity: "1", transform: "scale(1)" },
        },
        "rise": {
          "0%": { height: "0%", opacity: "0.8" },
          "50%": { height: "100%", opacity: "1" },
          "100%": { height: "0%", opacity: "0.8" },
        },
        "bubble": {
          "0%": { transform: "translateY(0) scale(1)", opacity: "0.6" },
          "50%": { transform: "translateY(-8px) scale(1.2)", opacity: "1" },
          "100%": { transform: "translateY(-16px) scale(0.8)", opacity: "0" },
        },
        "dot": {
          "0%, 80%, 100%": { transform: "scale(0.8)", opacity: "0.5" },
          "40%": { transform: "scale(1.2)", opacity: "1" },
        },
        "colorTransition": {
          "0%": { color: "rgb(9 9 11)", borderColor: "rgb(9 9 11 / 0.1)", backgroundColor: "rgb(9 9 11 / 0.05)" },
          "50%": { color: "rgb(255 255 255)", borderColor: "rgb(255 255 255 / 0.3)", backgroundColor: "rgb(255 255 255 / 0.1)" },
          "100%": { color: "rgb(9 9 11)", borderColor: "rgb(9 9 11 / 0.1)", backgroundColor: "rgb(9 9 11 / 0.05)" },
        },
        "bgTransition": {
          "0%": { backgroundColor: "rgb(255 255 255)" },
          "50%": { backgroundColor: "rgb(9 9 11)" },
          "100%": { backgroundColor: "rgb(255 255 255)" },
        },
      },
      animation: {
        "accordion-down": "accordion-down 0.2s ease-out",
        "accordion-up": "accordion-up 0.2s ease-out",
        "fade-in": "fade-in 0.6s ease-out",
        "slide-up": "slide-up 0.6s ease-out",
        "scale-in": "scale-in 0.4s ease-out",
      },
    },
  },
  plugins: [require("tailwindcss-animate")],
} satisfies Config

export default config
