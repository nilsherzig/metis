<script lang="ts">
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

	const flipDurationMs = 200;

	let nextId = 9; // Start after the initial items
	let newTaskText = '';

	let unassignedTasks: Task[] = [{ id: 9, text: 'New task', quadrant: 'unassigned' }];

	let urgentImportant: Task[] = [
		{ id: 1, text: 'Critical deadline', quadrant: 'urgent-important' },
		{ id: 2, text: 'Emergency meeting', quadrant: 'urgent-important' }
	];

	let notUrgentImportant: Task[] = [
		{ id: 3, text: 'Exercise', quadrant: 'not-urgent-important' },
		{ id: 4, text: 'Career planning', quadrant: 'not-urgent-important' }
	];

	let urgentNotImportant: Task[] = [
		{ id: 5, text: 'Answer emails', quadrant: 'urgent-not-important' },
		{ id: 6, text: 'Phone calls', quadrant: 'urgent-not-important' }
	];

	let notUrgentNotImportant: Task[] = [
		{ id: 7, text: 'Social media', quadrant: 'not-urgent-not-important' },
		{ id: 8, text: 'YouTube videos', quadrant: 'not-urgent-not-important' }
	];

	function addTask() {
		if (newTaskText.trim()) {
			unassignedTasks = [
				...unassignedTasks,
				{
					id: nextId++,
					text: newTaskText,
					quadrant: 'unassigned'
				}
			];
			newTaskText = '';
		}
	}

	function removeTask(taskId: number, quadrant: QuadrantType) {
		switch (quadrant) {
			case 'unassigned':
				unassignedTasks = unassignedTasks.filter((task) => task.id !== taskId);
				break;
			case 'urgent-important':
				urgentImportant = urgentImportant.filter((task) => task.id !== taskId);
				break;
			case 'not-urgent-important':
				notUrgentImportant = notUrgentImportant.filter((task) => task.id !== taskId);
				break;
			case 'urgent-not-important':
				urgentNotImportant = urgentNotImportant.filter((task) => task.id !== taskId);
				break;
			case 'not-urgent-not-important':
				notUrgentNotImportant = notUrgentNotImportant.filter((task) => task.id !== taskId);
				break;
		}
	}

	function handleDndConsider(e: CustomEvent<DndEvent<Task>>, quadrant: QuadrantType) {
		const { items } = e.detail;
		switch (quadrant) {
			case 'unassigned':
				unassignedTasks = items;
				break;
			case 'urgent-important':
				urgentImportant = items;
				break;
			case 'not-urgent-important':
				notUrgentImportant = items;
				break;
			case 'urgent-not-important':
				urgentNotImportant = items;
				break;
			case 'not-urgent-not-important':
				notUrgentNotImportant = items;
				break;
		}
	}

	function handleDndFinalize(e: CustomEvent<DndEvent<Task>>, quadrant: QuadrantType) {
		const { items } = e.detail;
		items.forEach((item) => (item.quadrant = quadrant));
		switch (quadrant) {
			case 'unassigned':
				unassignedTasks = items;
				break;
			case 'urgent-important':
				urgentImportant = items;
				break;
			case 'not-urgent-important':
				notUrgentImportant = items;
				break;
			case 'urgent-not-important':
				urgentNotImportant = items;
				break;
			case 'not-urgent-not-important':
				notUrgentNotImportant = items;
				break;
		}
	}
</script>

<div class="flex gap-4 p-4">
	<!-- Sidebar -->
	<div class="w-64 rounded-lg bg-gray-100 p-4 shadow">
		<h2 class="mb-4 text-lg font-bold">Task Management</h2>

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
			use:dndzone={{ items: unassignedTasks, flipDurationMs }}
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
	<div class="flex-1">
		<h1 class="mb-4 text-lg">Eisenhower Matrix</h1>

		<div class="grid w-full grid-cols-2 grid-rows-2 gap-4">
			<div class="rounded-lg bg-red-100 p-4">
				<h2 class="mb-2 font-bold">Urgent & Important</h2>
				<div
					use:dndzone={{ items: urgentImportant, flipDurationMs }}
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
					use:dndzone={{ items: notUrgentImportant, flipDurationMs }}
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
					use:dndzone={{ items: urgentNotImportant, flipDurationMs }}
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
					use:dndzone={{ items: notUrgentNotImportant, flipDurationMs }}
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
