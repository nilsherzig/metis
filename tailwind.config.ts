import typography from '@tailwindcss/typography';
import type { Config } from 'tailwindcss';

export default {
	content: ['./src/**/*.{html,js,svelte,ts}'],
	darkMode: 'class', // This enables dark mode with class-based switching

	theme: {
		extend: {}
	},

	plugins: [typography]
} satisfies Config;
