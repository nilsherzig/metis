import { writable } from 'svelte/store';
import type { Task } from '$lib/types';

const STORAGE_KEY = 'eisenhower-tasks';

// Helper function to load tasks from localStorage
function loadTasks(): Task[] {
	if (typeof window === 'undefined') return []; // Handle SSR

	const storedTasks = localStorage.getItem(STORAGE_KEY);
	return storedTasks ? JSON.parse(storedTasks) : [];
}

// Helper function to save tasks to localStorage
function saveTasks(tasks: Task[]) {
	if (typeof window === 'undefined') return; // Handle SSR

	localStorage.setItem(STORAGE_KEY, JSON.stringify(tasks));
}

export function createDefaultTask(partialTask: Partial<Task> = {}): Task {
	const defaultTask: Task = {
		id: crypto.randomUUID(),
		title: '',
		description: '',
		dueDate: undefined,
		priority: 0,
		importance: 0,
		urgency: 0,
		completed: false,
		quadrant: 'unassigned',
		status: 'todo',
		goalTime: undefined,
		timeSpent: 0,
		timeEntries: [],
		isTracking: false,
		lastTrackingStart: undefined,
		...partialTask
	};
	return defaultTask;
}

function createTaskStore() {
	const { subscribe, set, update } = writable<Task[]>(loadTasks());

	return {
		subscribe,
		addTask: (task: Task) =>
			update((tasks) => {
				const newTasks = [...tasks, task];
				saveTasks(newTasks);
				return newTasks;
			}),
		removeTask: (id: string) =>
			update((tasks) => {
				const newTasks = tasks.filter((t) => t.id !== id);
				saveTasks(newTasks);
				return newTasks;
			}),
		updateTask: (updatedTask: Task) =>
			update((tasks) => {
				const newTasks = tasks.map((t) => (t.id === updatedTask.id ? updatedTask : t));
				saveTasks(newTasks);
				return newTasks;
			}),
		toggleComplete: (id: string) =>
			update((tasks) => {
				const newTasks = tasks.map((t) => (t.id === id ? { ...t, completed: !t.completed } : t));
				saveTasks(newTasks);
				return newTasks;
			}),
		startTracking: (taskId: string) =>
			update((tasks) => {
				const newTasks = tasks.map((t) =>
					t.id === taskId
						? {
								...t,
								isTracking: true,
								lastTrackingStart: new Date()
							}
						: t
				);
				saveTasks(newTasks);
				return newTasks;
			}),
		stopTracking: (taskId: string, note?: string) =>
			update((tasks) => {
				const task = tasks.find((t) => t.id === taskId);
				if (!task || !task.isTracking) return tasks;

				const endTime = new Date();
				const duration = Math.floor(
					(endTime.getTime() - task.lastTrackingStart!.getTime()) / 60000
				);

				const timeEntry = {
					id: crypto.randomUUID(),
					startTime: task.lastTrackingStart!,
					endTime,
					duration,
					note
				};

				const newTasks = tasks.map((t) =>
					t.id === taskId
						? {
								...t,
								isTracking: false,
								lastTrackingStart: undefined,
								timeSpent: (t.timeSpent || 0) + duration,
								timeEntries: [...(t.timeEntries || []), timeEntry]
							}
						: t
				);
				saveTasks(newTasks);
				return newTasks;
			}),
		updateGoalTime: (taskId: string, goalTime: number) =>
			update((tasks) => {
				const newTasks = tasks.map((t) => (t.id === taskId ? { ...t, goalTime } : t));
				saveTasks(newTasks);
				return newTasks;
			}),
		deleteTimeEntry: (taskId: string, timeEntryId: string) =>
			update((tasks) => {
				const task = tasks.find((t) => t.id === taskId);
				if (!task) return tasks;

				const timeEntry = task.timeEntries?.find((te) => te.id === timeEntryId);
				if (!timeEntry) return tasks;

				const newTasks = tasks.map((t) =>
					t.id === taskId
						? {
								...t,
								timeSpent: (t.timeSpent || 0) - timeEntry.duration,
								timeEntries: t.timeEntries?.filter((te) => te.id !== timeEntryId)
							}
						: t
				);
				saveTasks(newTasks);
				return newTasks;
			}),
		clear: () => {
			set([]);
			saveTasks([]);
		}
	};
}

export const taskStore = createTaskStore();
