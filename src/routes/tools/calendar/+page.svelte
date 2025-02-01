<script lang="ts">
	import { taskStore } from '$lib/stores/taskStore';

	// Subscribe to the task store to get all tasks
	$: tasks = $taskStore;
	$: console.log(tasks);
</script>
