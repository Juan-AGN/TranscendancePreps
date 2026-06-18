// ┌────────────────────────────────────────────────────────────┐
// │                LoadingProgress.ts                          │
// ├────────────────────────────────────────────────────────────┤
// │ Async loading task queue with progress callbacks.          │
// │ Stores promise-returning tasks and executes them in order. │
// │ Reports loaded/total progress and current task label.      │
// └────────────────────────────────────────────────────────────┘

// STEP 1: Define load task contract

type LoadTask = {
	label: string;
	task: () => Promise<void>;
};

export class LoadingProgress {
	private tasks: LoadTask[] = [];

	// STEP 2: Register a task in the queue
	public add(label: string, task: () => Promise<void>): void {
		this.tasks.push({ label, task });
	}

	// STEP 3: Execute tasks sequentially with progress reporting
	public async execute(onProgress?: (loaded: number, total: number, label: string) => void): Promise<void> {
		const total = this.tasks.length;
		let loaded = 0;

		for (const item of this.tasks) {
			onProgress?.(loaded, total, item.label);
			await item.task();
			loaded++;
			onProgress?.(loaded, total, item.label);
		}
	}
}

// ===== MINI DICTIONARY =====
// async task -> function that resolves in the future (Promise)
// queue -> ordered list of pending tasks
// sequential execution -> run tasks one by one in order
// progress callback -> function notified with loaded/total values