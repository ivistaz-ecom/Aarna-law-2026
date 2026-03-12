import flowbite from "flowbite-react/tailwind";
import type { Config } from "tailwindcss";
// @ts-ignore - no types
const tailwindScrollbar = require("tailwind-scrollbar");

const config: Config = {
  content: [
    "./pages/**/*.{js,ts,jsx,tsx,mdx}",
    "./components/**/*.{js,ts,jsx,tsx,mdx}",
    "./app/**/*.{js,ts,jsx,tsx,mdx}",
    flowbite.content(),
  ],
  theme: {
    extend: {
      fontFamily: {
        sans: ["Montserrat", "sans-serif"],
      },
      colors: {
        bgDark: "#22223b",
        bgDark2: "#4a4e69",
        bgDark3: "#16396e",
        bgDark4: "#0E1333",
        "custom-blue": "#1E396A",
        "custom-red": "#E6331C",
        "custom-gray": "#4A4A4A",
        "disclaimer-bg": "#EEEAE1",
      },
      backgroundColor: {
        "151C4A": "#151C4A",
      },
      backgroundimgColor: {
        "16396e": "#16396e",
      },
      backgrounddivColor: {
        "151C4A": "#151C4A",
      },
    },
  },
  plugins: [
    flowbite.plugin(),
    tailwindScrollbar({
      nocompatible: true,
      preferredStrategy: "pseudoelements",
    }),
  ],
};
export default config;
