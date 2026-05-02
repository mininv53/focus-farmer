import type { Config } from 'tailwindcss';

const config: Config = {
  content: ['./app/**/*.{ts,tsx}', './components/**/*.{ts,tsx}', './lib/**/*.{ts,tsx}'],
  darkMode: 'class',
  theme: {
    extend: {
      colors: {
        realm: {
          dawn: '#f4d3a0',
          meadow: '#8fb86b',
          forest: '#3f6a3a',
          sky: '#a8d5e2',
          dusk: '#5b3a85',
          midnight: '#1a1530',
          parchment: '#f6efe1',
          ink: '#2a2438',
          common: '#a8c5d4',
          rare: '#a78bfa',
          legendary: '#fbbf24',
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
      },
    },
  },
  plugins: [],
};

export default config;
