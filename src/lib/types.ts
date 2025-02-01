export interface Task {
	id: string;
	title: string;
	description?: string;
	dueDate?: Date;
	priority?: number;
	importance?: number;
	urgency?: number;
	completed?: boolean;
	quadrant?: QuadrantType;
	status?: (typeof COLUMNS)[keyof typeof COLUMNS];
	goalTime?: number;
	timeSpent?: number;
	timeEntries?: TimeEntry[];
	isTracking?: boolean;
	lastTrackingStart?: Date;
}

export interface TimeEntry {
	id: string;
	startTime: Date;
	endTime: Date;
	duration: number;
	note?: string;
}

export type QuadrantType =
	| 'urgent-important'
	| 'not-urgent-important'
	| 'urgent-not-important'
	| 'not-urgent-not-important'
	| 'unassigned';

export const QuadrantTypes = {
	URGENT_IMPORTANT: 'urgent-important' as QuadrantType,
	NOT_URGENT_IMPORTANT: 'not-urgent-important' as QuadrantType,
	URGENT_NOT_IMPORTANT: 'urgent-not-important' as QuadrantType,
	NOT_URGENT_NOT_IMPORTANT: 'not-urgent-not-important' as QuadrantType,
	UNASSIGNED: 'unassigned' as QuadrantType
};

export const COLUMNS = {
	TODO: 'todo',
	IN_PROGRESS: 'in-progress',
	DONE: 'done'
};
