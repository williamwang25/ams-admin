import daisyui from "daisyui";

/** @type {import('tailwindcss').Config} */
export default {
  content: ["./index.html", "./src/**/*.{vue,js,ts,jsx,tsx}"],
  theme: {
    extend: {
      colors: {
        brand: {
          DEFAULT: "#0096C2",
          focus: "#006B8F",
        },
      },
      boxShadow: {
        card: "0 1px 2px rgba(0,0,0,.06)",
      },
    },
  },
  plugins: [daisyui],
  daisyui: {
    themes: [
      {
        ams: {
          primary: "#0096C2",
          "primary-focus": "#006B8F",
          "primary-content": "#ffffff",
          secondary: "#006B8F",
          accent: "#0096C2",
          neutral: "#1F2937",
          "base-100": "#ffffff",
          "base-200": "#F9FAFB",
          "base-300": "#E5E7EB",
          "base-content": "#1F2937",
          info: "#0EA5E9",
          success: "#16A34A",
          warning: "#F59E0B",
          error: "#DC2626",
        },
      },
    ],
    darkTheme: false,
    base: true,
    styled: true,
    utils: true,
  },
};
