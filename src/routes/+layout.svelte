<script lang="ts">
	import '../app.css';
	let { children } = $props();
	import { onMount } from 'svelte';
	import { theme } from '$lib/stores/theme';
	import ThemeToggle from '$lib/components/ThemeToggle.svelte';
	import HomeButton from '$lib/components/HomeButton.svelte';

	onMount(() => {
		// Initialize theme from localStorage or system preference, defaulting to dark
		const savedTheme = localStorage.getItem('theme') as 'light' | 'dark' | null;
		if (savedTheme) {
			theme.set(savedTheme);
		} else {
			// Default to dark mode
			theme.set('dark');
		}
	});
</script>

<div
	class="min-h-screen bg-white text-neutral-900 transition-colors dark:bg-neutral-900 dark:text-neutral-100"
>
	{@render children()}

	<nav
		class="fixed bottom-4 right-4 flex gap-2 rounded-lg bg-neutral-100 p-2 shadow dark:bg-neutral-800"
	>
		<HomeButton />
		<ThemeToggle />
	</nav>
</div>
