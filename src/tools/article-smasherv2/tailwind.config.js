/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{js,ts,jsx,tsx}'],
  theme: {
    extend: {
      colors: {
        primary: {
          DEFAULT: "#0068B3",
          light: "#3389CA",
          dark: "#00559A",
          50: "#E6F1F9",
          100: "#CCE3F4",
          200: "#99C7E9",
          300: "#66ABDE",
          400: "#338FD3",
          500: "#0068B3",
          600: "#00539F",
          700: "#003E7A",
          800: "#002A55",
          900: "#001530",
        },
        border: "hsl(var(--border))",
        input: "hsl(var(--input))",
        ring: "#0068B3",
        background: "hsl(var(--background))",
        foreground: "hsl(var(--foreground))",
        secondary: {
          DEFAULT: "hsl(var(--secondary))",
          foreground: "hsl(var(--secondary-foreground))",
        },
        success: {
          DEFAULT: "hsl(var(--success))",
          foreground: "hsl(var(--success-foreground))",
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
      typography: {
        DEFAULT: {
          css: {
            maxWidth: '100%',
            color: 'var(--tw-prose-body)',
            a: {
              color: '#0068B3',
              textDecoration: 'underline',
              fontWeight: '500',
            },
            'a:hover': {
              color: '#00559A',
            },
          },
        },
      },
      boxShadow: {
        'soft': '0 4px 20px rgba(0, 0, 0, 0.08)',
        'card': '0 2px 10px rgba(0, 0, 0, 0.05)',
      },
    },
  },
  plugins: [],
};