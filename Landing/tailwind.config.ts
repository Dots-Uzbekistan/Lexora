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
        background: "#EAEAEA",
        foreground: "#1A1A18",
        accent: "#BCB1AA",
        "light-green": "#D9E9D8",
      },
      fontFamily: {
        serif: ["Domine", "serif"],
      },
    },
  },
  plugins: [],
};
export default config;
