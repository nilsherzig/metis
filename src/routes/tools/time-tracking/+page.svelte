<script lang="ts">
	import { taskStore } from '$lib/stores/taskStore';
	import type { Task } from '$lib/types';
	import { onDestroy } from 'svelte';

	let tasks: Task[] = [];
	let unsubscribe = taskStore.subscribe((value) => {
		tasks = value;
	});

	onDestroy(() => {
		unsubscribe();
	});

	function startTracking(taskId: string) {
		taskStore.startTracking(taskId);
	}

	function stopTracking(taskId: string) {
		taskStore.stopTracking(taskId);
	}

	function updateGoalTime(task: Task, event: Event) {
		const input = event.target as HTMLInputElement;
		taskStore.updateGoalTime(task.id, parseInt(input.value));
	}

	function formatTime(minutes: number): string {
		const hrs = Math.floor(minutes / 60);
		const mins = minutes % 60;
		return `${hrs}h ${mins}m`;
	}
</script>

<div class="container mx-auto p-4">
	<h1 class="mb-4 text-2xl font-bold">Task Time Tracking</h1>

	<div class="space-y-4">
		{#each tasks as task}
			<div class="rounded-lg border p-4 shadow">
				<div class="flex items-center justify-between">
					<h2 class="text-xl">{task.title}</h2>
					<div class="flex items-center gap-4">
						<input
							type="number"
							placeholder="Goal time (minutes)"
							value={task.goalTime}
							on:change={(e) => updateGoalTime(task, e)}
							class="w-40 rounded border p-2"
						/>
						{#if task.isTracking}
							<button
								on:click={() => stopTracking(task.id)}
								class="rounded bg-red-500 px-4 py-2 text-white"
							>
								Stop Tracking
							</button>
						{:else}
							<button
								on:click={() => startTracking(task.id)}
								class="rounded bg-green-500 px-4 py-2 text-white"
							>
								Start Tracking
							</button>
						{/if}
					</div>
				</div>

				<div class="mt-4">
					<p>Time spent: {formatTime(task.timeSpent || 0)}</p>
					{#if task.goalTime}
						<p>Goal time: {formatTime(task.goalTime)}</p>
						<div class="mt-2 h-2.5 w-full rounded-full bg-gray-200">
							<div
								class="h-2.5 rounded-full bg-blue-600"
								style="width: {Math.min(((task.timeSpent || 0) / task.goalTime) * 100, 100)}%"
							></div>
						</div>
					{/if}
				</div>

				{#if task.timeEntries && task.timeEntries.length > 0}
					<div class="mt-4">
						<h3 class="font-semibold">Time Entries:</h3>
						<ul class="mt-2 space-y-2">
							{#each task.timeEntries as entry}
								<li class="text-sm text-gray-600">
									{new Date(entry.startTime).toLocaleString()} - {entry.duration} minutes
								</li>
							{/each}
						</ul>
					</div>
				{/if}
			</div>
		{/each}
	</div>
</div>
