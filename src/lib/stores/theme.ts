import { writable } from 'svelte/store';
import { browser } from '$app/environment';

type Theme = 'light' | 'dark';

function createThemeStore() {
	// Set dark as the default theme
	const defaultTheme: Theme = 'dark';

	const { subscribe, set } = writable<Theme>(defaultTheme);

	return {
		subscribe,
		set: (theme: Theme) => {
			if (browser) {
				localStorage.setItem('theme', theme);
				if (theme === 'dark') {
					document.documentElement.classList.add('dark');
				} else {
					document.documentElement.classList.remove('dark');
				}
			}
			set(theme);
		},
		toggle: () => {
			if (browser) {
				const current = localStorage.getItem('theme') || 'dark'; // Default to dark
				const newTheme = current === 'light' ? 'dark' : 'light';
				localStorage.setItem('theme', newTheme);
				if (newTheme === 'dark') {
					document.documentElement.classList.add('dark');
				} else {
					document.documentElement.classList.remove('dark');
				}
				set(newTheme as Theme);
			}
		}
	};
}

export const theme = createThemeStore();
