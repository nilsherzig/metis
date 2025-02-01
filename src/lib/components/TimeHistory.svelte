<script lang="ts">
	import { taskStore } from '$lib/stores/taskStore';
	import type { Task } from '$lib/types';

	export let task: Task;

	function formatDateTime(date: Date): string {
		return new Date(date).toLocaleString();
	}

	function handleDeleteEntry(timeEntryId: string) {
		taskStore.deleteTimeEntry(task.id, timeEntryId);
	}
</script>

<div class="time-history">
	<h3>Time History</h3>
	{#if task.timeEntries && task.timeEntries.length > 0}
		<ul>
			{#each task.timeEntries as entry}
				<li>
					<div class="entry-details">
						<span>{formatDateTime(entry.startTime)}</span>
						<span>{entry.duration} minutes</span>
						{#if entry.note}
							<span>{entry.note}</span>
						{/if}
					</div>
					<button on:click={() => handleDeleteEntry(entry.id)}>Delete</button>
				</li>
			{/each}
		</ul>
	{:else}
		<p>No time entries yet</p>
	{/if}
</div>
