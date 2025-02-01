<script lang="ts">
	import { onMount } from 'svelte';
	import { dndzone } from 'svelte-dnd-action';
	import { flip } from 'svelte/animate';
	import type { DndEvent } from 'svelte-dnd-action';
	import DeleteItemButton from '$lib/components/deleteItemButton.svelte';

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
		switch (quadrant) {
			case QuadrantTypes.UNASSIGNED:
				unassignedTasks = unassignedTasks.filter((task) => task.id !== taskId);
				break;
			case QuadrantTypes.URGENT_IMPORTANT:
				urgentImportant = urgentImportant.filter((task) => task.id !== taskId);
				break;
			case QuadrantTypes.NOT_URGENT_IMPORTANT:
				notUrgentImportant = notUrgentImportant.filter((task) => task.id !== taskId);
				break;
			case QuadrantTypes.URGENT_NOT_IMPORTANT:
				urgentNotImportant = urgentNotImportant.filter((task) => task.id !== taskId);
				break;
			case QuadrantTypes.NOT_URGENT_NOT_IMPORTANT:
				notUrgentNotImportant = notUrgentNotImportant.filter((task) => task.id !== taskId);
				break;
		}
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

<div class="flex flex-col gap-4 p-4 md:flex-row">
	<!-- Sidebar -->
	<div class="w-full rounded-lg bg-gray-100 p-4 md:w-64">
		<h2 class="mb-4 text-lg font-bold">Tasks</h2>

		<!-- Add new task form -->
		<div class="mb-4">
			<input
				type="text"
				bind:value={newTaskText}
				placeholder="New task..."
				class="mb-2 w-full rounded border p-2"
				on:keydown={(e) => e.key === 'Enter' && addTask()}
			/>
			<button
				on:click={addTask}
				class="w-full rounded bg-gray-200 p-2 text-blue-500 transition-all hover:bg-blue-600 hover:text-white"
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
					class="group relative mb-2 cursor-move rounded bg-gray-50 p-2 shadow"
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
			<div class="rounded-lg bg-red-100 p-4">
				<h2 class="mb-2 font-bold">Urgent & Important</h2>
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
							class="group relative mb-2 cursor-move rounded bg-white p-2 shadow"
						>
							{item.text}
							<DeleteItemButton removeTask={() => removeTask(item.id, item.quadrant)} />
						</div>
					{/each}
				</div>
			</div>

			<div class="rounded-lg bg-orange-100 p-4">
				<h2 class="mb-2 font-bold">Not Urgent & Important</h2>
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
							class="group relative mb-2 cursor-move rounded bg-white p-2 shadow"
						>
							{item.text}
							<DeleteItemButton removeTask={() => removeTask(item.id, item.quadrant)} />
						</div>
					{/each}
				</div>
			</div>

			<div class="rounded-lg bg-blue-100 p-4">
				<h2 class="mb-2 font-bold">Urgent & Not Important</h2>
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
							class="group relative mb-2 cursor-move rounded bg-white p-2 shadow"
						>
							{item.text}
							<DeleteItemButton removeTask={() => removeTask(item.id, item.quadrant)} />
						</div>
					{/each}
				</div>
			</div>

			<div class="rounded-lg bg-gray-100 p-4">
				<h2 class="mb-2 font-bold">Not Urgent & Not Important</h2>
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
							class="group relative mb-2 cursor-move rounded bg-white p-2 shadow"
						>
							{item.text}
							<DeleteItemButton removeTask={() => removeTask(item.id, item.quadrant)} />
						</div>
					{/each}
				</div>
			</div>
		</div>
	</div>
</div>
