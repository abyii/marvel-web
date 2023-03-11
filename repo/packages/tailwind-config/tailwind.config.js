/** @type {import('tailwindcss').Config} */

const primaryHue = 0;
const secondaryHue = 170;

module.exports = {
  future: {
    hoverOnlyWhenSupported: true,
  },
  content: [`src/**/*.{js,ts,jsx,tsx}`, `lib/**/*.{js,ts,jsx,tsx}`],
  theme: {
    colors: {
      transparent: "hsla(0,0%,0%,0)",
      //primary
      p: {
        0: `hsla(${primaryHue}, 0%, 0%, 1)`,
        1: `hsla(${primaryHue}, 0%, 9%, 1)`,
        2: `hsla(${primaryHue}, 0%, 18%, 1)`,
        3: `hsla(${primaryHue}, 0%, 27%, 1)`,
        4: `hsla(${primaryHue}, 0%, 36%, 1)`,

        5: `hsla(${primaryHue}, 0%, 57%, 1)`,
        6: `hsla(${primaryHue}, 0%, 66%, 1)`,
        7: `hsla(${primaryHue}, 0%, 73%, 1)`,
        8: `hsla(${primaryHue}, 0%, 82%, 1)`,
        9: `hsla(${primaryHue}, 0%, 91%, 1)`,
        10: `hsla(${primaryHue}, 0%, 100%, 1)`,
      },

      //secondary
      s: {
        0: `hsla(${secondaryHue}, 60%, 5%, 1)`,
        1: `hsla(${secondaryHue}, 60%, 9%, 1)`,
        2: `hsla(${secondaryHue}, 60%, 18%, 1)`,
        3: `hsla(${secondaryHue}, 60%, 27%, 1)`,
        4: `hsla(${secondaryHue}, 60%, 36%, 1)`,

        5: `hsla(${secondaryHue}, 65%, 57%, 1)`,
        6: `hsla(${secondaryHue}, 65%, 66%, 1)`,
        7: `hsla(${secondaryHue}, 65%, 73%, 1)`,
        8: `hsla(${secondaryHue}, 70%, 82%, 1)`,
        9: `hsla(${secondaryHue}, 70%, 91%, 1)`,
        10: `hsla(${secondaryHue}, 100%, 95%, 1)`,
      },
    },
    fontFamily: {
      sans: ["IBM Plex Sans", "sans-serif"],
      serif: ["IBM Plex Serif", "serif"],
      mono: ["IBM Plex Mono", "mono"],
    },
    extend: {
      zIndex: {
        max: "100",
      },
    },
  },
  plugins: [],
};