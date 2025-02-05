<script lang="ts">
	import type { Task } from '$lib/types';
	import DeleteItemButton from '$lib/components/deleteItemButton.svelte';
	import ToggleItemButton from './toggleItemButton.svelte';

	export let task: Task;
	export let toggleTask: () => void;
	export let deleteTask: () => void;
</script>

<div>
	<div
		class="mb-2 flex cursor-move flex-row justify-between rounded bg-white p-2 shadow transition-opacity dark:bg-neutral-700 dark:text-neutral-100"
		class:opacity-50={task.completed}
	>
		<div class="flex flex-row gap-2">
			<div>
				<ToggleItemButton toggleTask={() => toggleTask()} {task} />
			</div>
			<span class:line-through={task.completed}>
				{task.title}
			</span>
		</div>
		{#if task.completed}
			<DeleteItemButton removeTask={() => deleteTask()} />
		{/if}
	</div>
</div>
