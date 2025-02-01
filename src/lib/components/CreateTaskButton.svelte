<script lang="ts">
	export let label = 'Create Task';
	export let onClick: () => void;
</script>

<button
	on:click={onClick}
	class="rounded bg-blue-500 px-4 py-2 text-white transition-colors hover:bg-blue-600"
>
	{label}
</button>
