import type { Config } from "tailwindcss";

const config: Config = {
  content: [
    "./src/pages/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/components/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/app/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  theme: {
    extend: {
      colors: {
        primary: {
          DEFAULT: "#2563eb", // blue-600
          light: "#3b82f6", // blue-500
        },
        accent: {
          DEFAULT: "#a78bfa", // violet-400
          light: "#c4b5fd", // violet-300
        },
        success: {
          DEFAULT: "#10b981", // emerald-500
          light: "#34d399", // emerald-400
        },
        mood: {
          1: "#fb7185", // rose-400
          2: "#fbbf24", // amber-400
          3: "#94a3b8", // slate-400
          4: "#34d399", // emerald-400
          5: "#059669", // emerald-600
        },
      },
    },
  },
  plugins: [],
};
export default config;
