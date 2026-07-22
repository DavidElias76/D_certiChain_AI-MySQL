/** @type {import('tailwindcss').Config} */
export default {
  darkMode: 'class',
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      fontFamily: {
        sans: ["'Inter'", "system-ui", "sans-serif"],
        mono: ["'Inter'", "monospace"],
      },
      colors: {
        // Design System Colors from DESIGN.md
        primary: {
          DEFAULT: '#0051ae',
          container: '#0a69da',
          fixed: '#d8e2ff',
          'fixed-dim': '#adc6ff',
        },
        surface: {
          DEFAULT: '#f7f9ff',
          dim: '#d3dbe5',
          bright: '#f7f9ff',
          subtle: '#F6F8FA',
          container: {
            lowest: '#ffffff',
            low: '#edf4ff',
            DEFAULT: '#e7eff9',
            high: '#e1e9f3',
            highest: '#dbe3ee',
          }
        },
        on: {
          surface: '#151c24',
          'surface-variant': '#424753',
          primary: '#ffffff',
        },
        security: {
          green: '#10B981',
        },
        auth: {
          navy: '#0A2540',
        },
        border: {
          muted: '#D0D7DE',
        }
      },
      borderRadius: {
        'sm': '0.125rem',
        'DEFAULT': '0.25rem',
        'md': '0.375rem',
        'lg': '0.5rem',
        'xl': '0.75rem',
      },
      spacing: {
        'unit': '8px',
      },
      maxWidth: {
        'container': '1280px',
      },
      boxShadow: {
        'surface-1': '0 2px 4px 0 rgba(31, 35, 40, 0.05)',
        'surface-2': '0 8px 24px 0 rgba(31, 35, 40, 0.12)',
      }
    },
  },
  plugins: [],
}
