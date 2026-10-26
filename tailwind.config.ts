import type { Config } from 'tailwindcss'

const config: Config = {
  content: [
    './src/pages/**/*.{js,ts,jsx,tsx,mdx}',
    './src/components/**/*.{js,ts,jsx,tsx,mdx}',
    './src/app/**/*.{js,ts,jsx,tsx,mdx}',
  ],
  theme: {
    extend: {
      colors: {
        background: '#0a0a0a',
        foreground: '#ffffff',
        card: '#0f0f0f',
        muted: '#262626',
        'muted-foreground': '#999999',
        accent: '#c9a558',
        'accent-foreground': '#ffffff',
      },
      fontFamily: {
        sans: ['var(--font-geist)', 'system-ui', 'sans-serif'],
        serif: ['var(--font-noto-serif-sc)', 'serif'],
      },
    },
  },
  plugins: [],
}
export default config
