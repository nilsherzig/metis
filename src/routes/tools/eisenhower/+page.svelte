<script lang="ts">
	import { onMount } from 'svelte';
	import { dndzone } from 'svelte-dnd-action';
	import { flip } from 'svelte/animate';
	import type { DndEvent } from 'svelte-dnd-action';
	import DeleteItemButton from '$lib/components/deleteItemButton.svelte';
	import { fade } from 'svelte/transition';

	let lastDeletedTask: Task | null = null;
	let showUndo = false;
	let undoTimeout: ReturnType<typeof setTimeout>;

	interface Task {
		id: number;
		text: string;
		quadrant: QuadrantType;
	}

	type QuadrantType =
		| 'urgent-important'
		| 'not-urgent-important'
		| 'urgent-not-important'
		| 'not-urgent-not-important'
		| 'unassigned';

	const QuadrantTypes = {
		URGENT_IMPORTANT: 'urgent-important' as QuadrantType,
		NOT_URGENT_IMPORTANT: 'not-urgent-important' as QuadrantType,
		URGENT_NOT_IMPORTANT: 'urgent-not-important' as QuadrantType,
		NOT_URGENT_NOT_IMPORTANT: 'not-urgent-not-important' as QuadrantType,
		UNASSIGNED: 'unassigned' as QuadrantType
	};

	const flipDurationMs = 150;
	let mounted = false;

	let nextId = 9;
	let newTaskText = '';

	const defaultTasks = {
		unassignedTasks: [{ id: 9, text: 'New task', quadrant: QuadrantTypes.UNASSIGNED }] as Task[],
		urgentImportant: [
			{ id: 1, text: 'Critical deadline', quadrant: QuadrantTypes.URGENT_IMPORTANT },
			{ id: 2, text: 'Emergency meeting', quadrant: QuadrantTypes.URGENT_IMPORTANT }
		] as Task[],
		notUrgentImportant: [
			{ id: 3, text: 'Exercise', quadrant: QuadrantTypes.NOT_URGENT_IMPORTANT },
			{ id: 4, text: 'Career planning', quadrant: QuadrantTypes.NOT_URGENT_IMPORTANT }
		] as Task[],
		urgentNotImportant: [
			{ id: 5, text: 'Answer emails', quadrant: QuadrantTypes.URGENT_NOT_IMPORTANT },
			{ id: 6, text: 'Phone calls', quadrant: QuadrantTypes.URGENT_NOT_IMPORTANT }
		] as Task[],
		notUrgentNotImportant: [
			{ id: 7, text: 'Social media', quadrant: QuadrantTypes.NOT_URGENT_NOT_IMPORTANT },
			{ id: 8, text: 'YouTube videos', quadrant: QuadrantTypes.NOT_URGENT_NOT_IMPORTANT }
		] as Task[]
	};

	let unassignedTasks: Task[] = [];
	let urgentImportant: Task[] = [];
	let notUrgentImportant: Task[] = [];
	let urgentNotImportant: Task[] = [];
	let notUrgentNotImportant: Task[] = [];

	function loadTasks() {
		const savedTasks = localStorage.getItem('eisenhowerTasks');
		console.log('loaded tasks', savedTasks);
		if (savedTasks) {
			const parsed = JSON.parse(savedTasks);
			unassignedTasks = parsed.unassignedTasks;
			urgentImportant = parsed.urgentImportant;
			notUrgentImportant = parsed.notUrgentImportant;
			urgentNotImportant = parsed.urgentNotImportant;
			notUrgentNotImportant = parsed.notUrgentNotImportant;

			const allTasks = [
				...unassignedTasks,
				...urgentImportant,
				...notUrgentImportant,
				...urgentNotImportant,
				...notUrgentNotImportant
			];
			nextId = Math.max(...allTasks.map((task) => task.id)) + 1;
		} else {
			unassignedTasks = defaultTasks.unassignedTasks;
			urgentImportant = defaultTasks.urgentImportant;
			notUrgentImportant = defaultTasks.notUrgentImportant;
			urgentNotImportant = defaultTasks.urgentNotImportant;
			notUrgentNotImportant = defaultTasks.notUrgentNotImportant;
		}
	}

	function saveTasks() {
		if (!mounted) return;
		console.log('saving tasks');

		const tasksToSave = {
			unassignedTasks,
			urgentImportant,
			notUrgentImportant,
			urgentNotImportant,
			notUrgentNotImportant
		};
		localStorage.setItem('eisenhowerTasks', JSON.stringify(tasksToSave));
	}

	$: {
		if (mounted) {
			saveTasks();
		}
	}

	onMount(() => {
		loadTasks();
		mounted = true;
	});

	function addTask() {
		if (newTaskText.trim()) {
			unassignedTasks = [
				...unassignedTasks,
				{
					id: nextId++,
					text: newTaskText,
					quadrant: QuadrantTypes.UNASSIGNED
				}
			];
			newTaskText = '';
		}
		saveTasks();
	}

	function removeTask(taskId: number, quadrant: QuadrantType) {
		let removedTask: Task | undefined;

		switch (quadrant) {
			case QuadrantTypes.UNASSIGNED:
				removedTask = unassignedTasks.find((task) => task.id === taskId);
				unassignedTasks = unassignedTasks.filter((task) => task.id !== taskId);
				break;
			case QuadrantTypes.URGENT_IMPORTANT:
				removedTask = urgentImportant.find((task) => task.id === taskId);
				urgentImportant = urgentImportant.filter((task) => task.id !== taskId);
				break;
			case QuadrantTypes.NOT_URGENT_IMPORTANT:
				removedTask = notUrgentImportant.find((task) => task.id === taskId);
				notUrgentImportant = notUrgentImportant.filter((task) => task.id !== taskId);
				break;
			case QuadrantTypes.URGENT_NOT_IMPORTANT:
				removedTask = urgentNotImportant.find((task) => task.id === taskId);
				urgentNotImportant = urgentNotImportant.filter((task) => task.id !== taskId);
				break;
			case QuadrantTypes.NOT_URGENT_NOT_IMPORTANT:
				removedTask = notUrgentNotImportant.find((task) => task.id === taskId);
				notUrgentNotImportant = notUrgentNotImportant.filter((task) => task.id !== taskId);
				break;
		}

		if (removedTask) {
			lastDeletedTask = removedTask;
			showUndo = true;

			// Clear any existing timeout
			if (undoTimeout) clearTimeout(undoTimeout);

			// Hide the undo button after 5 seconds
			undoTimeout = setTimeout(() => {
				showUndo = false;
				lastDeletedTask = null;
			}, 5000);
		}

		saveTasks();
	}

	// Add undo function
	function undoDelete() {
		if (!lastDeletedTask) return;

		switch (lastDeletedTask.quadrant) {
			case QuadrantTypes.UNASSIGNED:
				unassignedTasks = [...unassignedTasks, lastDeletedTask];
				break;
			case QuadrantTypes.URGENT_IMPORTANT:
				urgentImportant = [...urgentImportant, lastDeletedTask];
				break;
			case QuadrantTypes.NOT_URGENT_IMPORTANT:
				notUrgentImportant = [...notUrgentImportant, lastDeletedTask];
				break;
			case QuadrantTypes.URGENT_NOT_IMPORTANT:
				urgentNotImportant = [...urgentNotImportant, lastDeletedTask];
				break;
			case QuadrantTypes.NOT_URGENT_NOT_IMPORTANT:
				notUrgentNotImportant = [...notUrgentNotImportant, lastDeletedTask];
				break;
		}

		showUndo = false;
		lastDeletedTask = null;
		if (undoTimeout) clearTimeout(undoTimeout);
		saveTasks();
	}

	function handleDndConsider(e: CustomEvent<DndEvent<Task>>, quadrant: QuadrantType) {
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
		items.forEach((item) => (item.quadrant = quadrant));
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
		saveTasks();
	}
</script>

<div class="flex flex-col gap-4 p-4 md:flex-row dark:bg-neutral-900">
	<!-- Sidebar -->
	<div class="w-full rounded-lg bg-gray-100 p-4 md:w-64 dark:bg-neutral-800 dark:text-neutral-100">
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
			{#each unassignedTasks as item (item.id)}
				<div
					animate:flip={{ duration: flipDurationMs }}
					class="group relative mb-2 cursor-move rounded bg-gray-50 p-2 shadow dark:bg-neutral-700 dark:text-neutral-100"
				>
					{item.text}
					<DeleteItemButton removeTask={() => removeTask(item.id, item.quadrant)} />
				</div>
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
					{#each urgentImportant as item (item.id)}
						<div
							animate:flip={{ duration: flipDurationMs }}
							class="group relative mb-2 cursor-move rounded bg-white p-2 shadow dark:bg-neutral-700 dark:text-neutral-100"
						>
							{item.text}
							<DeleteItemButton removeTask={() => removeTask(item.id, item.quadrant)} />
						</div>
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
					{#each notUrgentImportant as item (item.id)}
						<div
							animate:flip={{ duration: flipDurationMs }}
							class="group relative mb-2 cursor-move rounded bg-white p-2 shadow dark:bg-neutral-700 dark:text-neutral-100"
						>
							{item.text}
							<DeleteItemButton removeTask={() => removeTask(item.id, item.quadrant)} />
						</div>
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
					{#each urgentNotImportant as item (item.id)}
						<div
							animate:flip={{ duration: flipDurationMs }}
							class="group relative mb-2 cursor-move rounded bg-white p-2 shadow dark:bg-neutral-700 dark:text-neutral-100"
						>
							{item.text}
							<DeleteItemButton removeTask={() => removeTask(item.id, item.quadrant)} />
						</div>
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
					{#each notUrgentNotImportant as item (item.id)}
						<div
							animate:flip={{ duration: flipDurationMs }}
							class="group relative mb-2 cursor-move rounded bg-white p-2 shadow dark:bg-neutral-700 dark:text-neutral-100"
						>
							{item.text}
							<DeleteItemButton removeTask={() => removeTask(item.id, item.quadrant)} />
						</div>
					{/each}
				</div>
			</div>
		</div>
	</div>
	{#if showUndo && lastDeletedTask}
		<div
			class="fixed bottom-4 left-4 flex items-center gap-2 rounded bg-neutral-200 px-4 py-2 shadow transition-all dark:bg-neutral-700 dark:text-neutral-100"
			in:fade
			out:fade
		>
			<span>
				<span class="font-bold">
					{lastDeletedTask.text}
				</span> deleted</span
			>
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
