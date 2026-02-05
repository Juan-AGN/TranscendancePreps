/**
 * SceneEntityManager:
 * Centraliza la creacion, carga y registro de todas las entidades 3D del Hub
 * Gestiona personaje, objetos interactivos, decorativos, sombras y progreso de carga
 * Separa la logica de entidades del setup de escena e iluminacion
 */

import { Scene, ShadowGenerator } from '@babylonjs/core';
import { SCENE_CONFIG } from '../config/SceneConfig';

// Entidades aun por poner, de momento probariamos los ismples en public
import { StickmanCharacter } from '../entities/characters/StickmanCharacter';
import { TownHouse } from '../entities/objects/TownHouse';
import { Trophy } from '../entities/objects/Trophy';
import { PingPongTable } from '../entities/objects/PingPongTable';
import { TorreMonica } from '../entities/objects/TorreMonica';
import { Computer } from '../entities/objects/Computer';
import { LaRosaleda } from '../entities/objects/LaRosaleda';
import { LaFarola } from '../entities/objects/LaFarola';
import { Arcade } from '../entities/objects/Arcade';
//import { GroundSignTrophy } from '../ui/sign/GroundSignTrophy';
import { MenuInteraction } from '../interaction/MenuInteraction';


//Clse molde para crear el objeto. 
export class SceneEntityManager {
	//propiedade priv unicamente para este objeto
    private scene: Scene;										//scene de baylon
	private shadowGenerator: ShadowGenerator | null;			//sistem de sombras, null x si no estan aun configuradas
	private menuInteraction: MenuInteraction;					//registrar los cliclables... nav, rutas, etc..
	private loadTasks: Array<() => Promise<void>> = [];			//guardamos en un array cosas pendientes por cargar
	//Esta variable es nuestra "Libreta de Pendientes". Guardamos aquí todas las funciones
    // q cargan modelos 3D para poder ejecutarlas una a una y mover la barra de carga.
    // : Array< ... > : Es una LISTA. Lo de dentro < > es el tipo de dato.
    // () ............: Las funciones de la lista NO piden params (son botones simples).
    // => ............: Indica que es una función (Arrow Function).
    // Promise .......: La tarea TARDA TIEMPO (es asíncrona, hay que esperar), es una promesa, para q 
	// se quede freezing esperando. se hace todo en segundo plano.
    // <void> ........: La task NO DEVUELVE NADA util (solo avisa cuando acaba).
    //  = [] ..........: La lista empieza VACÍA al iniciar el juego.

	public character: StickmanCharacter | null = null;
	public trophy: Trophy | null = null;

	constructor(
		scene: Scene,
		shadowGenerator: ShadowGenerator | null,
		menuInteraction: MenuInteraction
	) {
		this.scene = scene;
		this.shadowGenerator = shadowGenerator;
		this.menuInteraction = menuInteraction;
	}


	 /**
     * programar la creacion y carga para q forme part del sistema de carga del HUB
     */

	public createCharacter(onShadowCaster?: (character: StickmanCharacter) => void): void {
			//onshadowCaster? -> esto sintaxis siginifica que es opcional.
			//recibe una funcion q recibe un Sitckman y no devuelve nada (callback)
			//no devuelve nada, aqui se crea, registra y prepara.
			
			const config = SCENE_CONFIG.character; // aqui le pasamos la parte del caracter, q esta en el obj SCENE_CONFIG(ver).
			// Obtenemos la configuracion del personaje desde SCENE_CONFIG
			this.character = new StickmanCharacter(this.scene, config.pos);
			// Creamos el objeto logico del personaje y lo guardamos en el manager
    		// AUN no se carga el modelo ni aparece en escena
    		// solo se prepara para el sistema de carga


			// Registramos la carga del personaje como una tarea async
			// esta funcion NO se ejecuta aqui, se guarda para ejecutarse mas tarde
			// asi el loading screen puede controlar el orden y el progreso
			this.addLoadTask(async () => {
				// Esperamos a que el personaje termine de cargarse (GLB, meshes, etc)
				// hasta que ready() no termina, el personaje no es usable
				await this.character!.ready(); // 

				// Si el personaje ya existe y se ha pasado un callback
				// este es el momento seguro para usar el personaje (ya esta cargado)
				// avisamos al sistema externo para que haga acciones extra (ej: sombras)			
				if (this.character && onShadowCaster) {
					onShadowCaster(this.character);
				}
			});
	}

	// Este es el Arqui de Interactivad, convertimos el 3D en un menu funcional (trofeo lleva a trophy, etc..)
	// esta fun los creamos y los conectamos con la navegacion de react
	public createNavigationObjects(navigate: (route: string) => void): void {
		//le pasamos navigate, desde fuera (ReRouterDom)

		const townhouse = new TownHouse(
			this.scene, 				//le decimos en la escena(Mundo) que va a aprecer.
			SCENE_CONFIG.townhouse.pos, // la posicion establecida en SCENCONFIG.
			() =>navigate(SCENE_CONFIG.townhouse.route), 
			//funcion flecha .. A.-() disparador(trigger).B.-=> ak dispara ejecuta todo lo q hay a la right..
			// funcino navigate psada dsde fuera. C. le pasamos la configuracion de SCENE para townhouse
			this.shadowGenerator
			//le pasamos el sist de sombras
		);
		this.registerInteractiveObject(
			SCENE_CONFIG.townhouse.route, //ruta a la q navega el objeto
			townhouse);						//obj 3D que se registra como clickable
		// aqui conectamos el mesh 3D con el sistema de interaccion
		// convierte la casa en un boton del menu 3D

		//trofeo // aqui .this quizas tenga que acceder desde fuera para acceder a el mas adelante
		this.trophy = new Trophy(
			this.scene,
			SCENE_CONFIG.trophy.pos,
			() =>navigate(SCENE_CONFIG.trophy.route),
			this.shadowGenerator
			// Callback de GroundSignTrophy comentado x ahora (no se usa)
			// () => { 
            //     if (this.trophy?.getMesh()) {
            //         const trophyPos = this.trophy.getMesh()!.position.clone();
            //         new GroundSignTrophy(this.scene, trophyPos);
            //     }
            // }
        );
        this.registerInteractiveObject(
			SCENE_CONFIG.trophy.route,
			this.trophy);

		// LaFarola - Settings
        const lafarola = new LaFarola(
            this.scene, 
            SCENE_CONFIG.lafarola.pos, 
            SCENE_CONFIG.lafarola.scale, 
            this.shadowGenerator, 
            SCENE_CONFIG.lafarola.rotation,
            () => navigate(SCENE_CONFIG.lafarola.route)
        );
        this.registerInteractiveObject(
			SCENE_CONFIG.lafarola.route,
			lafarola);
	}
	
		
	/**
     * Crea los objetos decorativos del escenario (sin interaccion)
     * Estos objetos son elementos visuales q embellecen el Hub pero no son clickables
     * se cargan en el sist de progreso pa actualizar la barra de carga
     * cada objeto se coloca segun su pos, escala y rotacion en SCENE_CONFIG
     */
    public createDecorationObjects(): void {
        // Mesa de PingPong -> obj decorativo con rotacion establecida
        // le pasamos la escena (mundo), pos en SCENE_CONFIG, escala y el sist de sombras
        // esta tabla tiene rotacion pa que quede colocada correctamente en el espacio
        const pingpong = new PingPongTable(
            this.scene, 
            SCENE_CONFIG.pingpong.pos, 
            SCENE_CONFIG.pingpong.scale, 
            this.shadowGenerator
        );
        // Registramos su carga en el sist de progreso
        // pingpong.ready() espera a q cargue el modelo completamente
        this.addLoadTask(() => pingpong.ready());
        
        // Torre Monica -> torre decorativa iconica del escenario
        // se coloca en su pos con escala y sombras configuradas
        // es un obj pasivo, simplemente embellece el ambiente
        new TorreMonica(
            this.scene, 
            SCENE_CONFIG.torre.pos, 
            SCENE_CONFIG.torre.scale, 
            this.shadowGenerator
        );
        // Aunque no tenga ready(), lo registramos pa mantener sincronizado el loading
        // Promise.resolve() termina inmediatamente, sin esperar tiempo
        this.addLoadTask(() => Promise.resolve());
        
        // Computadora -> maquina decorativa dentro del escenario
        // se instancia con su ubicacion, tamaño y casting de sombras
        // solo es visual, no tiene interactividad directa
        new Computer(
            this.scene, 
            SCENE_CONFIG.computer.pos, 
            SCENE_CONFIG.computer.scale, 
            this.shadowGenerator
        );
        // La registramos en el sist de carga pa q la barra progrese uniformemente
        this.addLoadTask(() => Promise.resolve());

        // LaRosaleda (Estadio de futbol) -> estructura grande y iconica
        // se posiciona con escala diferente (es un estadio, muy grande)
        // ademas recibe una rotacion personalizada desde SCENE_CONFIG
        // esto permite q el estadio este orientado correctamente en el mundo 3D
        new LaRosaleda(
            this.scene, 
            SCENE_CONFIG.rosaleda.pos, 
            SCENE_CONFIG.rosaleda.scale, 
            this.shadowGenerator, 
            SCENE_CONFIG.rosaleda.rotation
        );
        // Lo añadimos al sist de progreso de carga
        this.addLoadTask(() => Promise.resolve());

        // Arcade -> maquina arcade interactiva en el escenario
        // se coloca con su pos, escala y rotacion predefinida
        // la rotacion es importante pa q los jugadores vean bien la maquina
        new Arcade(
            this.scene, 
            SCENE_CONFIG.arcade.pos, 
            SCENE_CONFIG.arcade.scale, 
            this.shadowGenerator, 
            SCENE_CONFIG.arcade.rotation
        );
        // Se registra en el sist de cargas
        this.addLoadTask(() => Promise.resolve());
    }

    /**
     * Añade sombras dinamicas a los objetos del escenario
     * las sombras hacen q la iluminacion sea mas realista
     * iteramos sobre todos los meshes (mallas 3D) de la escena
     * y añadimos como "shadow casters" aquellos q deberian proyectar sombra
     * los identificamos x el nombre del mesh (ej: TownHouse, Trophy)
     */
    public addShadowsToBuildings(): void {
        // forEach -> recorre cada mesh (obj 3D) en la escena uno x uno
        this.scene.meshes.forEach((mesh) => {
            // Si el nombre del mesh contiene "TownHouse" o "Trophy"
            // significa q es uno de los objetos principales q debe proyectar sombra
            if (mesh.name.includes('TownHouse') || mesh.name.includes('Trophy')) {
                // Añadimos este mesh como "shadow caster"
                // esto significa q este obj proyectara sombras en la escena
                // shadowGenerator es el sist q controla las sombras (si existe)
                this.shadowGenerator?.addShadowCaster(mesh);
            }
        });
    }
    
    /**
     * Registra un obj interactivo con su ruta de navegacion
     * este es un metodo PRIVADO, solo lo usa la clase internamente
     * conecta un obj 3D con el sist de menu de interaccion
     * cuando un usuario clickea el mesh, se navega a la ruta asociada
     * @param route -> cadena de texto con la ruta a navegar (ej: '/trophy')
     * @param obj -> el obj 3D q se vuelve clickable
     */
    private registerInteractiveObject(route: string, obj: any): void {
        // Añadimos la registracion como una tarea de carga
        // esto asegura q el mesh este completamente cargado antes de hacerlo interactivo
        this.addLoadTask(async () => {
            // Esperamos 100 milisegundos pa asegurar q el mesh ya existe en la escena
            // esto es temporal hasta q todos los objetos tengan un metodo ready()
            // setTimeout es una forma de esperar sin congelar el programa
            await new Promise(r => setTimeout(r, 100)); // Temporal hasta que todos tengan ready()
            
            // Obtenemos el mesh (la geometria 3D) del obj
            // getMesh() es un metodo q tienen todos los objetos 3D
            // devuelve la malla q representa ese obj en el espacio 3D
            const mesh = obj.getMesh();
            
            // Si el mesh existe (no es null o undefined)
            // lo registramos en el sist de interaccion pa q sea clickable
            if (mesh) {
                // registerMenuObject conecta el mesh con la navegacion de react
                // cuando hagas click en el mesh, se ejecutara la navegacion a la ruta
                this.menuInteraction.registerMenuObject(route, mesh, obj);
            }
        });
    }
    
    /**
     * Helper: Agrega tarea de carga a la cola
     * este metodo PRIVADO añade una tarea de carga al array de loadTasks
     * cada tarea es una funcion asincrona q carga un modelo o recurso
     * se iran ejecutando una x una pa actualizar la barra de progreso
     */
    private addLoadTask(task: () => Promise<void>): void {
        // push() -> mete la tarea al final del array loadTasks
        // asi todas las tareas se ejecutan en el orden q se añadieron
        this.loadTasks.push(task);
    }

    /**
     * Ejecuta todas las tareas de carga con progreso
     * este es el motor del loading screen: ejecuta cada tarea paso a paso
     * y va actualizando la barra de carga llamando a onProgress
     * @param onProgress -> callback opcional q recibe (cargados, total) pa actualizar UI
     */
    public async executeLoadTasks(onProgress?: (loaded: number, total: number) => void): Promise<void> {
        // total -> numero total de tareas pendientes
        const total = this.loadTasks.length;
        // loaded -> contador de tareas completadas (empieza en 0)
        let loaded = 0;
        
        // for...of -> recorre cada tarea del array una x una (secuencial)
        // no se ejecutan en paralelo, se espera a q una acabe antes de empezar la siguiente
        for (const task of this.loadTasks) {
            try {
                // Ejecutamos la tarea (puede tardar, await espera a q termine)
                await task();
                // Incrementamos el contador de tareas completadas
                loaded++;
                // Si nos pasaron un callback, lo ejecutamos pa actualizar la barra
                if (onProgress) {
                    onProgress(loaded, total);
                }
            } catch (error) {
                // Si algo falla al cargar, lo mostramos en consola con un emoji
                console.error(' Error loading the asset:', error);
                // Contamos la tarea como "cargada" igualmente pa no bloquear el juego
                loaded++; // Contar como "cargado" para no bloquear
                // Actualizamos el progreso aunque haya fallado
                if (onProgress) {
                    onProgress(loaded, total);
                }
            }
        }
        
        // Cuando todas las tareas estan completadas (o fallaron)
        // añadimos las sombras a los edificios como paso final
        this.addShadowsToBuildings();
    }
}

