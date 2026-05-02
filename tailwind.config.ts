import type { Config } from 'tailwindcss';

/**
 * Garden palette — warm parchment + soft greens with periwinkle/peach accents
 * for crop-tier glows. Sourced from user-provided mood boards.
 */
const config: Config = {
  content: ['./app/**/*.{ts,tsx}', './components/**/*.{ts,tsx}', './lib/**/*.{ts,tsx}'],
  darkMode: 'class',
  theme: {
    extend: {
      colors: {
        garden: {
          // Backgrounds + surfaces
          cream: '#f7f4ea', // floral white
          parchment: '#f1ead6',
          soil: '#82735c', // olive wood
          loam: '#4b3b40', // deep mocha
          night: '#260c45', // dark amethyst
          fog: '#ded9e2', // lavender mist

          // Foliage
          sprout: '#c2de9b', // tea green
          leaf: '#8fb86b',
          stem: '#3f6a3a',

          // Tier glows (also used for ui badges)
          common: '#c2de9b', // tea green
          rare: '#c0b9dd', // periwinkle
          epic: '#75d1b7', // pearl aqua
          legendary: '#d18a75', // burnt peach
          mythic: '#a33e7e', // berry blush

          // Highlights
          sun: '#f5ecbf', // lemon chiffon
          rose: '#b07b7b', // dusty rose
          ink: '#2a2438',
        },
        // Compatibility aliases (older code imported `realm-*`).
        realm: {
          dawn: '#f5ecbf',
          meadow: '#8fb86b',
          forest: '#3f6a3a',
          sky: '#c0b9dd',
          dusk: '#5b3a85',
          midnight: '#260c45',
          parchment: '#f7f4ea',
          ink: '#2a2438',
          common: '#c2de9b',
          rare: '#c0b9dd',
          legendary: '#d18a75',
        },
      },
      fontFamily: {
        pixel: ['"Press Start 2P"', 'monospace'],
        display: ['system-ui', 'sans-serif'],
      },
      animation: {
        'pulse-slow': 'pulse 3s ease-in-out infinite',
        float: 'float 4s ease-in-out infinite',
        shimmer: 'shimmer 2s linear infinite',
        'sprout-grow': 'sproutGrow 600ms ease-out',
      },
      keyframes: {
        float: {
          '0%, 100%': { transform: 'translateY(0)' },
          '50%': { transform: 'translateY(-6px)' },
        },
        shimmer: {
          '0%': { backgroundPosition: '-200% 0' },
          '100%': { backgroundPosition: '200% 0' },
        },
        sproutGrow: {
          '0%': { transform: 'scale(0.4)', opacity: '0' },
          '60%': { transform: 'scale(1.1)', opacity: '1' },
          '100%': { transform: 'scale(1)', opacity: '1' },
        },
      },
    },
  },
  plugins: [],
};

export default config;
