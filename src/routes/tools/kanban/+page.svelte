<script lang="ts">
	import { dndzone } from 'svelte-dnd-action';
	import { flip } from 'svelte/animate';
	import { fade } from 'svelte/transition';
	import { createDefaultTask, taskStore } from '$lib/stores/taskStore';
	import type { Task } from '$lib/types';
	import { COLUMNS } from '$lib/types';

	import TaskCard from '$lib/components/TaskCard.svelte';

	let newTaskText = '';
	const flipDurationMs = 150;

	let todoTasks: Task[] = [];
	let inProgressTasks: Task[] = [];
	let doneTasks: Task[] = [];

	let lastDeletedTask: Task | null = null;
	let showUndo = false;
	let undoTimeout: ReturnType<typeof setTimeout>;

	// Subscribe to taskStore changes
	$: {
		todoTasks = $taskStore.filter((t) => t.status === COLUMNS.TODO);
		inProgressTasks = $taskStore.filter((t) => t.status === COLUMNS.IN_PROGRESS);
		doneTasks = $taskStore.filter((t) => t.status === COLUMNS.DONE);
	}

	function addTask() {
		if (newTaskText.trim()) {
			// taskStore.addTask({
			// 	id: crypto.randomUUID(),
			// 	title: newTaskText,
			// 	status: COLUMNS.TODO
			// });
			taskStore.addTask(
				createDefaultTask({
					title: newTaskText,
					status: COLUMNS.TODO
				})
			);
			newTaskText = '';
		}
	}

	function removeTask(taskId: string) {
		const task = $taskStore.find((t) => t.id === taskId);
		if (task) {
			lastDeletedTask = task;
			showUndo = true;
			if (undoTimeout) clearTimeout(undoTimeout);
			undoTimeout = setTimeout(() => {
				showUndo = false;
				lastDeletedTask = null;
			}, 5000);
		}
		taskStore.removeTask(taskId);
	}

	function undoDelete() {
		if (!lastDeletedTask) return;
		taskStore.addTask(lastDeletedTask);
		showUndo = false;
		lastDeletedTask = null;
		if (undoTimeout) clearTimeout(undoTimeout);
	}

	function handleDndConsider(e: CustomEvent, column: string) {
		const { items } = e.detail;
		switch (column) {
			case COLUMNS.TODO:
				todoTasks = items;
				break;
			case COLUMNS.IN_PROGRESS:
				inProgressTasks = items;
				break;
			case COLUMNS.DONE:
				doneTasks = items;
				break;
		}
	}

	function handleDndFinalize(e: CustomEvent, column: string) {
		const { items } = e.detail;
		items.forEach((item: Task) => {
			taskStore.updateTask({ ...item, status: column });
		});
	}
</script>

<div class="flex flex-col gap-4 p-4 dark:bg-neutral-900 md:flex-row">
	<!-- Add new task input -->
	<div class="mb-4 w-full">
		<input
			type="text"
			bind:value={newTaskText}
			placeholder="New task..."
			class="mb-2 w-full rounded border p-2 dark:border-neutral-600 dark:bg-neutral-700 dark:text-neutral-100"
			on:keydown={(e) => e.key === 'Enter' && addTask()}
		/>
		<button
			on:click={addTask}
			class="w-full rounded bg-blue-500 p-2 text-white transition-all hover:bg-blue-600"
		>
			Add Task
		</button>
	</div>

	<!-- Kanban columns -->
	<div class="grid w-full grid-cols-1 gap-4 md:grid-cols-3">
		<!-- Todo Column -->
		<div class="rounded-lg bg-gray-100 p-4 dark:bg-neutral-800">
			<h2 class="mb-4 font-bold dark:text-neutral-100">To Do</h2>
			<div
				use:dndzone={{
					items: todoTasks,
					flipDurationMs,
					dropTargetStyle: {},
					dropTargetClasses: ['rounded', 'outline-gray-300', 'outline-dashed']
				}}
				on:consider={(e) => handleDndConsider(e, COLUMNS.TODO)}
				on:finalize={(e) => handleDndFinalize(e, COLUMNS.TODO)}
				class="min-h-[200px]"
			>
				{#each todoTasks as task (task.id)}
					<div animate:flip={{ duration: flipDurationMs }}>
						<TaskCard {task} {removeTask} />
					</div>
				{/each}
			</div>
		</div>

		<!-- In Progress Column -->
		<div class="rounded-lg bg-blue-100 p-4 dark:bg-neutral-800">
			<h2 class="mb-4 font-bold dark:text-blue-400">In Progress</h2>
			<div
				use:dndzone={{
					items: inProgressTasks,
					flipDurationMs,
					dropTargetStyle: {},
					dropTargetClasses: ['rounded', 'outline-blue-300', 'outline-dashed']
				}}
				on:consider={(e) => handleDndConsider(e, COLUMNS.IN_PROGRESS)}
				on:finalize={(e) => handleDndFinalize(e, COLUMNS.IN_PROGRESS)}
				class="min-h-[200px]"
			>
				{#each inProgressTasks as task (task.id)}
					<div animate:flip={{ duration: flipDurationMs }}>
						<TaskCard {task} {removeTask} />
					</div>
				{/each}
			</div>
		</div>

		<!-- Done Column -->
		<div class="rounded-lg bg-green-100 p-4 dark:bg-neutral-800">
			<h2 class="mb-4 font-bold dark:text-green-400">Done</h2>
			<div
				use:dndzone={{
					items: doneTasks,
					flipDurationMs,
					dropTargetStyle: {},
					dropTargetClasses: ['rounded', 'outline-green-300', 'outline-dashed']
				}}
				on:consider={(e) => handleDndConsider(e, COLUMNS.DONE)}
				on:finalize={(e) => handleDndFinalize(e, COLUMNS.DONE)}
				class="min-h-[200px]"
			>
				{#each doneTasks as task (task.id)}
					<div animate:flip={{ duration: flipDurationMs }}>
						<TaskCard {task} {removeTask} />
					</div>
				{/each}
			</div>
		</div>
	</div>

	<!-- Undo notification -->
	{#if showUndo && lastDeletedTask}
		<div
			class="fixed bottom-4 left-4 flex items-center gap-2 rounded bg-neutral-200 px-4 py-2 shadow transition-all dark:bg-neutral-700 dark:text-neutral-100"
			in:fade
			out:fade
		>
			<span>
				<span class="font-bold">{lastDeletedTask.title}</span> deleted
			</span>
			<button
				class="font-medium transition-all hover:text-blue-400"
				on:click={undoDelete}
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
						d="M21 16.811c0 .864-.933 1.406-1.683.977l-7.108-4.061a1.125 1.125 0 0 1 0-1.954l7.108-4.061A1.125 1.125 0 0 1 21 8.689v8.122ZM11.25 16.811c0 .864-.933 1.406-1.683.977l-7.108-4.061a1.125 1.125 0 0 1 0-1.954l7.108-4.061a1.125 1.125 0 0 1 1.683.977v8.122Z"
					/>
				</svg>
			</button>
		</div>
	{/if}
</div>
