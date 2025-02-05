<script lang="ts">
	import { dndzone } from 'svelte-dnd-action';
	import { flip } from 'svelte/animate';
	import type { DndEvent } from 'svelte-dnd-action';
	import DeleteItemButton from '$lib/components/deleteItemButton.svelte';
	import { fade } from 'svelte/transition';
	import { createDefaultTask, taskStore } from '$lib/stores/taskStore';
	import { QuadrantTypes } from '$lib/types';
	import type { QuadrantType, Task } from '$lib/types';
	import TaskItem from '$lib/components/TaskItem.svelte';

	let lastDeletedTask: Task | null = null;
	let showUndoDelete = false;
	let undoDeleteTimeout: ReturnType<typeof setTimeout>;

	let lastFinishedTaskID: string | null = null;
	let showUndoFinish = false;
	let undoFinishTimeout: ReturnType<typeof setTimeout>;

	const flipDurationMs = 150;
	let newTaskText = '';

	let unassignedTasks: Task[] = [];
	let urgentImportant: Task[] = [];
	let notUrgentImportant: Task[] = [];
	let urgentNotImportant: Task[] = [];
	let notUrgentNotImportant: Task[] = [];

	// Subscribe to taskStore changes
	$: {
		unassignedTasks = $taskStore.filter((t) => t.quadrant === QuadrantTypes.UNASSIGNED);
		urgentImportant = $taskStore.filter((t) => t.quadrant === QuadrantTypes.URGENT_IMPORTANT);
		notUrgentImportant = $taskStore.filter(
			(t) => t.quadrant === QuadrantTypes.NOT_URGENT_IMPORTANT
		);
		urgentNotImportant = $taskStore.filter(
			(t) => t.quadrant === QuadrantTypes.URGENT_NOT_IMPORTANT
		);
		notUrgentNotImportant = $taskStore.filter(
			(t) => t.quadrant === QuadrantTypes.NOT_URGENT_NOT_IMPORTANT
		);
	}

	function addTask() {
		if (newTaskText.trim()) {
			taskStore.addTask(
				createDefaultTask({
					title: newTaskText,
					quadrant: QuadrantTypes.UNASSIGNED
				})
			);
			newTaskText = '';
		}
	}

	function deleteTask(taskId: string) {
		const task = $taskStore.find((t) => t.id === taskId);
		if (task) {
			lastDeletedTask = task;
			showUndoDelete = true;

			if (undoFinishTimeout) clearTimeout(undoFinishTimeout);

			undoDeleteTimeout = setTimeout(() => {
				showUndoDelete = false;
				lastDeletedTask = null;
			}, 5000);
		}
		taskStore.removeTask(taskId);
	}

	function undoDeleteTask() {
		if (!lastDeletedTask) return;
		taskStore.addTask(lastDeletedTask);
		showUndoDelete = false;
		lastDeletedTask = null;
		if (undoDeleteTimeout) clearTimeout(undoDeleteTimeout);
	}

	function finishTask(taskId: string) {
		const task = $taskStore.find((t) => t.id === taskId);
		if (task) {
			lastFinishedTaskID = taskId;
			showUndoFinish = true;

			if (undoFinishTimeout) clearTimeout(undoFinishTimeout);

			undoFinishTimeout = setTimeout(() => {
				showUndoFinish = false;
				lastFinishedTaskID = null;
			}, 5000);
		}
		taskStore.toggleComplete(taskId);
	}

	function undoFinishTask() {
		if (!lastFinishedTaskID) return;
		taskStore.toggleComplete(lastFinishedTaskID);
		showUndoFinish = false;
		lastFinishedTaskID = null;
		if (undoFinishTimeout) clearTimeout(undoFinishTimeout);
	}

	function handleDndConsider(e: CustomEvent<DndEvent<Task>>, quadrant: string) {
		const { items } = e.detail;
		switch (quadrant) {
			case QuadrantTypes.UNASSIGNED:
				unassignedTasks = items;
				break;
			case QuadrantTypes.URGENT_IMPORTANT:
				urgentImportant = items;
				break;
			case QuadrantTypes.NOT_URGENT_IMPORTANT:
				notUrgentImportant = items;
				break;
			case QuadrantTypes.URGENT_NOT_IMPORTANT:
				urgentNotImportant = items;
				break;
			case QuadrantTypes.NOT_URGENT_NOT_IMPORTANT:
				notUrgentNotImportant = items;
				break;
		}
	}

	function handleDndFinalize(e: CustomEvent<DndEvent<Task>>, quadrant: QuadrantType) {
		const { items } = e.detail;
		items.forEach((item) => {
			taskStore.updateTask({ ...item, quadrant });
		});
	}
</script>

<div class="flex flex-col gap-4 p-4 dark:bg-neutral-900 md:flex-row">
	<!-- Sidebar -->
	<div class="w-full rounded-lg bg-gray-100 p-4 dark:bg-neutral-800 dark:text-neutral-100 md:w-64">
		<h2 class="mb-4 text-lg font-bold">Tasks</h2>

		<!-- Add new task form -->
		<div class="mb-4">
			<input
				type="text"
				bind:value={newTaskText}
				placeholder="New task..."
				class="mb-2 w-full rounded border p-2 dark:border-neutral-600 dark:bg-neutral-700 dark:text-neutral-100"
				on:keydown={(e) => e.key === 'Enter' && addTask()}
			/>
			<button
				on:click={addTask}
				class="w-full rounded bg-gray-200 p-2 text-blue-500 transition-all hover:bg-blue-600 hover:text-white dark:bg-neutral-700 dark:hover:bg-blue-600"
			>
				Add Task
			</button>
		</div>

		<!-- Unassigned tasks -->
		<h3 class="mb-2 font-bold">Unassigned Tasks</h3>
		<div
			use:dndzone={{
				items: unassignedTasks,
				flipDurationMs,
				dropTargetStyle: {},
				dropTargetClasses: ['rounded', 'outline-gray-300', 'outline-dotted', 'outline-offset-4']
			}}
			on:consider={(e) => handleDndConsider(e, 'unassigned')}
			on:finalize={(e) => handleDndFinalize(e, 'unassigned')}
			class="min-h-[100px]"
		>
			{#each unassignedTasks as task (task.id)}
				<TaskItem
					{task}
					toggleTask={() => {
						finishTask(task.id);
					}}
					deleteTask={() => {
						deleteTask(task.id);
					}}
				/>
			{/each}
		</div>
	</div>

	<!-- Matrix -->
	<div class="w-full md:flex-1">
		<div class="grid w-full grid-cols-1 gap-4 md:grid-cols-2 md:grid-rows-2">
			<div class="rounded-lg bg-red-100 p-4 dark:bg-neutral-800">
				<h2 class="mb-2 font-bold dark:text-red-400">Urgent & Important</h2>
				<div
					use:dndzone={{
						items: urgentImportant,
						flipDurationMs,
						dropTargetStyle: {},
						dropTargetClasses: ['rounded', 'outline-red-300', 'outline-dotted', 'outline-offset-4']
					}}
					on:consider={(e) => handleDndConsider(e, 'urgent-important')}
					on:finalize={(e) => handleDndFinalize(e, 'urgent-important')}
					class="min-h-[200px]"
				>
					{#each urgentImportant as task (task.id)}
						<TaskItem
							{task}
							toggleTask={() => {
								finishTask(task.id);
							}}
							deleteTask={() => {
								deleteTask(task.id);
							}}
						/>
					{/each}
				</div>
			</div>

			<div class="rounded-lg bg-orange-100 p-4 dark:bg-neutral-800">
				<h2 class="mb-2 font-bold dark:text-orange-400">Not Urgent & Important</h2>
				<div
					use:dndzone={{
						items: notUrgentImportant,
						flipDurationMs,
						dropTargetStyle: {},
						dropTargetClasses: [
							'rounded',
							'outline-orange-300',
							'outline-dotted',
							'outline-offset-4'
						]
					}}
					on:consider={(e) => handleDndConsider(e, 'not-urgent-important')}
					on:finalize={(e) => handleDndFinalize(e, 'not-urgent-important')}
					class="min-h-[200px]"
				>
					{#each notUrgentImportant as task (task.id)}
						<TaskItem
							{task}
							toggleTask={() => {
								finishTask(task.id);
							}}
							deleteTask={() => {
								deleteTask(task.id);
							}}
						/>
					{/each}
				</div>
			</div>

			<div class="rounded-lg bg-blue-100 p-4 dark:bg-neutral-800">
				<h2 class="mb-2 font-bold dark:text-blue-400">Urgent & Not Important</h2>
				<div
					use:dndzone={{
						items: urgentNotImportant,
						flipDurationMs,
						dropTargetStyle: {},
						dropTargetClasses: ['rounded', 'outline-blue-300', 'outline-dotted', 'outline-offset-4']
					}}
					on:consider={(e) => handleDndConsider(e, 'urgent-not-important')}
					on:finalize={(e) => handleDndFinalize(e, 'urgent-not-important')}
					class="min-h-[200px]"
				>
					{#each urgentNotImportant as task (task.id)}
						<TaskItem
							{task}
							toggleTask={() => {
								finishTask(task.id);
							}}
							deleteTask={() => {
								deleteTask(task.id);
							}}
						/>
					{/each}
				</div>
			</div>

			<div class="rounded-lg bg-gray-100 p-4 dark:bg-neutral-800">
				<h2 class="mb-2 font-bold dark:text-gray-400">Not Urgent & Not Important</h2>
				<div
					use:dndzone={{
						items: notUrgentNotImportant,
						flipDurationMs,
						dropTargetStyle: {},
						dropTargetClasses: ['rounded', 'outline-gray-300', 'outline-dotted', 'outline-offset-4']
					}}
					on:consider={(e) => handleDndConsider(e, 'not-urgent-not-important')}
					on:finalize={(e) => handleDndFinalize(e, 'not-urgent-not-important')}
					class="min-h-[200px]"
				>
					{#each notUrgentNotImportant as task (task.id)}
						<TaskItem
							{task}
							toggleTask={() => {
								finishTask(task.id);
							}}
							deleteTask={() => {
								deleteTask(task.id);
							}}
						/>
					{/each}
				</div>
			</div>
		</div>
	</div>
	{#if showUndoFinish && lastFinishedTaskID}
		<div
			class="fixed bottom-4 left-4 flex items-center gap-2 rounded bg-neutral-200 px-4 py-2 shadow transition-all dark:bg-neutral-700 dark:text-neutral-100"
			in:fade
			out:fade
		>
			<span>
				<span class="font-bold">
					{$taskStore.filter((t) => t.id == lastFinishedTaskID)[0].title}
				</span> finished</span
			>
			<button
				class="font-medium transition-all hover:text-blue-400"
				on:click={undoFinishTask}
				aria-label="Undo"
			>
				<svg
					xmlns="http://www.w3.org/2000/svg"
					fill="none"
					viewBox="0 0 24 24"
					stroke-width="1.5"
					stroke="currentColor"
					class="size-5"
				>
					<path
						stroke-linecap="round"
						stroke-linejoin="round"
						d="M9 15 3 9m0 0 6-6M3 9h12a6 6 0 0 1 0 12h-3"
					/>
				</svg>
			</button>
		</div>
	{/if}
	{#if showUndoDelete && lastDeletedTask}
		<div
			class="fixed bottom-4 left-4 flex items-center gap-2 rounded bg-neutral-200 px-4 py-2 shadow transition-all dark:bg-neutral-700 dark:text-neutral-100"
			in:fade
			out:fade
		>
			<span>
				<span class="font-bold">
					{lastDeletedTask.title}
				</span> removed</span
			>
			<button
				class="font-medium transition-all hover:text-blue-400"
				on:click={undoDeleteTask}
				aria-label="Undo"
			>
				<svg
					xmlns="http://www.w3.org/2000/svg"
					fill="none"
					viewBox="0 0 24 24"
					stroke-width="1.5"
					stroke="currentColor"
					class="size-5"
				>
					<path
						stroke-linecap="round"
						stroke-linejoin="round"
						d="M9 15 3 9m0 0 6-6M3 9h12a6 6 0 0 1 0 12h-3"
					/>
				</svg>
			</button>
		</div>
	{/if}
</div>
