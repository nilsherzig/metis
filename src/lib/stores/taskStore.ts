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
		clear: () => {
			set([]);
			saveTasks([]);
		}
	};
}

export const taskStore = createTaskStore();
