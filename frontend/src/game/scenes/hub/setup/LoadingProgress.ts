// LoadingProgress — cola de tareas de carga asincrona
// gestiona una lista de funciones que devuelven promesas
// las ejecuta en orden y reporta el progreso (loaded/total)

type LoadTask = {
	label: string;
	task: () => Promise<void>;
};

export class LoadingProgress {
	private tasks: LoadTask[] = [];

	public add(label: string, task: () => Promise<void>): void {
		this.tasks.push({ label, task });
	}

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