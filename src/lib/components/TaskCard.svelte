<script lang="ts">
	import DeleteItemButton from './deleteItemButton.svelte';
	import { taskStore } from '$lib/stores/taskStore';
	import type { Task } from '$lib/types';

	export let task: Task;
	export let removeTask: (id: string) => void;
	export let isDraggable = true;

	let timer: NodeJS.Timer;
	let formattedTimeSpent = '0:00';

	$: progressPercentage = task.goalTime ? ((task.timeSpent || 0) / task.goalTime) * 100 : 0;
	$: isOvertime = progressPercentage > 100;
	$: {
		if (task.isTracking) {
			startTimer();
		} else {
			stopTimer();
		}
	}

	function startTimer() {
		// run once to instant update ui on load
		const currentDuration = Math.floor(
			(new Date().getTime() - task.lastTrackingStart!.getTime()) / 1000
		);
		formattedTimeSpent = formatDuration(currentDuration);

		timer = setInterval(() => {
			const currentDuration = Math.floor(
				(new Date().getTime() - task.lastTrackingStart!.getTime()) / 1000
			);
			formattedTimeSpent = formatDuration(currentDuration);
		}, 1000);
	}

	function stopTimer() {
		if (timer) clearInterval(timer);
	}

	function formatDuration(seconds: number): string {
		const minutes = Math.floor(seconds / 60);
		const remainingSeconds = seconds % 60;
		return `${minutes}:${remainingSeconds.toString().padStart(2, '0')}`;
	}
</script>

<div
	class="group relative mb-1 overflow-hidden rounded p-2 shadow hover:shadow-md dark:text-neutral-100"
	class:cursor-move={isDraggable}
>
	<!-- Add progress background -->
	<div
		class="absolute inset-0 transition-all duration-300"
		class:bg-green-500={!isOvertime}
		class:bg-red-500={isOvertime}
		style:width="{Math.min(progressPercentage, 100)}%"
		style="opacity: 0.15"
	></div>

	<!-- Add white/dark background that sits on top of the progress bar -->
	<div
		class="absolute inset-0 bg-white dark:bg-neutral-700"
		style="z-index: 0; opacity: 0.15"
	></div>

	<!-- Main content - make sure it's above the backgrounds -->
	<div class="relative flex items-start justify-between" style="z-index: 1">
		<div class="flex flex-col gap-1">
			<h3 class="font-medium">{task.title}</h3>
			{#if task.description}
				<p class="text-xs text-gray-600 dark:text-gray-300">{task.description}</p>
			{/if}
			{#if task.goalTime}
				<div class="flex items-center gap-2">
					<div class="flex items-center gap-2 text-xs text-gray-600 dark:text-gray-300">
						<span>{task.timeSpent || 0}/{task.goalTime}m</span>
					</div>
					{#if task.isTracking}
						<button
							on:click={() => taskStore.stopTracking(task.id)}
							class="rounded bg-red-500 px-2 py-0.5 text-xs text-white hover:bg-red-600"
						>
							Stop ({formattedTimeSpent})
						</button>
					{:else}
						<button
							on:click={() => taskStore.startTracking(task.id)}
							class="rounded bg-green-500 px-2 py-0.5 text-xs text-white hover:bg-green-600"
						>
							Start
						</button>
					{/if}
				</div>
			{/if}
			{#if task.dueDate}
				<div class="text-xs text-gray-600 dark:text-gray-300">
					{new Date(task.dueDate).toLocaleDateString()}
				</div>
			{/if}
		</div>
		<DeleteItemButton removeTask={() => removeTask(task.id)} />
	</div>
</div>
