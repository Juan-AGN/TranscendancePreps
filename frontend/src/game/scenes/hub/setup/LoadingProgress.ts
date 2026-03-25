// LoadingProgress — cola de tareas de carga asincrona
// gestiona una lista de funciones que devuelven promesas
// las ejecuta en orden y reporta el progreso (loaded/total)

type LoadTask = () => Promise<void>;

export class LoadingProgress {
	private tasks: LoadTask[] = [];  // array de tareas de carga

	// añade una tarea a la cola
	public add(task: LoadTask): void {
		this.tasks.push(task);
	}

	// ejecuta todas las tareas en orden y reporta progreso
	// onProgress -> callback pa actualizar la barra de carga (loaded, total)
	public async execute(onProgress?: (loaded: number, total: number) => void): Promise<void> {
		const total = this.tasks.length;
		let loaded = 0;

		for (const task of this.tasks) {
			await task();
			loaded++;
			onProgress?.(loaded, total);
		}
	}
}
