<script lang="ts">
	import { createEventDispatcher } from 'svelte';
	import { createDefaultTask } from '$lib/stores/taskStore';
	import type { Task } from '$lib/types';
	import { fade } from 'svelte/transition';

	const dispatch = createEventDispatcher<{
		close: void;
		save: Task;
	}>();

	export let show = false;
	export let initialQuadrant: string | undefined = undefined;
	export let initialStatus: string | undefined = undefined;

	let task = createDefaultTask({
		quadrant: initialQuadrant,
		status: initialStatus
	});

	function handleSubmit() {
		dispatch('save', task);
		task = createDefaultTask();
		dispatch('close');
	}

	function handleClose() {
		task = createDefaultTask();
		dispatch('close');
	}
</script>

{#if show}
	<div
		class="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50"
		transition:fade
	>
		<div class="w-full max-w-md rounded-lg bg-white p-6 shadow-xl dark:bg-neutral-800">
			<h2 class="mb-4 text-xl font-bold">Create New Task</h2>

			<form on:submit|preventDefault={handleSubmit} class="space-y-4">
				<!-- Title -->
				<div>
					<label for="title" class="mb-1 block text-sm font-medium">Title</label>
					<input
						type="text"
						id="title"
						bind:value={task.title}
						required
						class="w-full rounded border p-2 dark:border-neutral-600 dark:bg-neutral-700"
					/>
				</div>

				<!-- Description -->
				<div>
					<label for="description" class="mb-1 block text-sm font-medium">Description</label>
					<textarea
						id="description"
						bind:value={task.description}
						rows="3"
						class="w-full rounded border p-2 dark:border-neutral-600 dark:bg-neutral-700"
					></textarea>
				</div>

				<!-- Due Date -->
				<div>
					<label for="dueDate" class="mb-1 block text-sm font-medium">Due Date</label>
					<input
						type="datetime-local"
						id="dueDate"
						bind:value={task.dueDate}
						class="w-full rounded border p-2 dark:border-neutral-600 dark:bg-neutral-700"
					/>
				</div>

				<!-- Goal Time -->
				<div>
					<label for="goalTime" class="mb-1 block text-sm font-medium">Goal Time (minutes)</label>
					<input
						type="number"
						id="goalTime"
						bind:value={task.goalTime}
						min="0"
						class="w-full rounded border p-2 dark:border-neutral-600 dark:bg-neutral-700"
					/>
				</div>

				<!-- Priority Slider -->
				<div>
					<label for="priority" class="mb-1 block text-sm font-medium">
						Priority: {task.priority}
					</label>
					<input
						type="range"
						id="priority"
						bind:value={task.priority}
						min="0"
						max="10"
						class="w-full"
					/>
				</div>

				<!-- Button Group -->
				<div class="flex justify-end gap-2 pt-4">
					<button
						type="button"
						on:click={handleClose}
						class="rounded bg-gray-200 px-4 py-2 hover:bg-gray-300 dark:bg-neutral-700 dark:hover:bg-neutral-600"
					>
						Cancel
					</button>
					<button type="submit" class="rounded bg-blue-500 px-4 py-2 text-white hover:bg-blue-600">
						Create Task
					</button>
				</div>
			</form>
		</div>
	</div>
{/if}
