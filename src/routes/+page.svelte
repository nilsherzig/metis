<script lang="ts">
	import { tools } from '$lib/config/tools';
	import { base } from '$app/paths';
</script>

<div class="p-4 dark:bg-neutral-900 dark:text-neutral-100">
	<h1 class="text-xl">Welcome to Metis</h1>
	<div>
		<h3 class="text-lg">Available Tools</h3>
		<div class="mt-4 grid grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-3">
			{#each tools as tool}
				<div class="rounded-lg border p-4 transition-shadow hover:shadow-lg">
					<a
						class="text-lg text-blue-500 hover:underline dark:text-blue-400"
						href="{base}/tools/{tool.link}"
					>
						{tool.name}
					</a>
					<p class="mt-2 text-sm text-gray-600 dark:text-gray-300">
						{tool.description}
					</p>
				</div>
			{/each}
		</div>
	</div>
</div>
