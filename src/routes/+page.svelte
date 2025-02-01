<script lang="ts">
	let tools = [{ name: 'Eisenhower-Matrix', link: 'eisenhower' }];
	import { base } from '$app/paths';
</script>

<div class="p-4">
	<h1 class="text-xl">Welcome to Metis</h1>
	<div>
		<h3 class="text-lg">Available Tools</h3>
		<ul>
			{#each tools as tool}
				<li>
					<a class="text-blue-500 hover:underline" href="{base}/tools/{tool.link}">{tool.name}</a>
				</li>
			{/each}
		</ul>
	</div>
</div>
