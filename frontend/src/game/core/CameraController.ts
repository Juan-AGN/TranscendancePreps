// importamos de babilon.js las 3 tools que necesitamos auqi
//  ArcR.. camara para 3a persona, Scene, el lugar(universo()) donde se desallra todo, Vector, calcular las posiciones
import { ArcRotateCamera, Scene, Vector3 } from "@babylonjs/core";
        // SCENE: El "Universo" del juego.
            //  Viene de Babylon.js (@babylonjs/core).
            // Es un objeto contenedor (como un struct gigante).
            //  tiene: Listas (arrays) de todos los meshes, luces, texturas y camaras activas.
            // PqLa cámara necesita "registrarse" en estas listas para existir y ser renderizada.

// Definimos el plano de control de camara // expor como siempre
export class CameraController {
    private camera: ArcRotateCamera;
    private scene: Scene;
    //private.. solo las funciones de aqui {} can modify estas variables. protegemos el motor grafico

    //constructor es el metodo de inicialiazion. se ejecuta auto cada vez que se hace new Clase()...
    constructor(scene: Scene, initialTarget: Vector3 = Vector3.Zero()) {
        //pasamos por parametro lo q necesita la clase...
        // le dmos la pos inicial y si no la hay la ponemos a 0
        this.scene = scene;
        // Vinculamos la escena recibida a nuestra propi de clase para usarla globalmente en este objeto.
        
        // creamos la camara y la guardamos en 'this.camera' para poder controlarla luego.
        // es una camara orbital: gira alrededor de un punto central.
        //    Si no hiciéramos 'this.camera =', la cámara se crearía dentro de esta función
        //    pero se PERDERÍA inmediatamente al terminar el constructor (Scope local).
        this.camera = new ArcRotateCamera(
            `camera`,     // nombre interno de la camara
            -Math.PI / 2, // angulo horizontal: desde que lado mira al objetivo (aqui desde atras)
            Math.PI / 3,  // angulo vertical: la altura o inclinacion (aqui una vista 3a persona estandar)
            35,           // el radio: la distancia fisica al objetivo (el zoom)
            initialTarget,// el objetivo: el punto central al que miramos fijamente
            this.scene    // la escena: le decimos en que mundo debe aparecer
        );
        // Desconectamos el control por defecto (ratón/teclado) de la cámara.
        // Si no hacemos esto, al pulsar las teclas para mover al PERSONAJE,
        // Babylon también movería la cámara a la vez, creando un conflicto.
        this.camera.inputs.clear();


        // LIMITES FISICOS (CLAMPING)
        // Babylon restringe estos valores automaticamente (como un if > max then = max).
        // ZOOM (RADIUS)
        this.camera.lowerRadiusLimit = 15; // Minima distancia: Evita atravesar la malla del personaje (Clipping).
        this.camera.upperRadiusLimit = 80; // Maxima distancia: Evita ver el vacio (el "skybox" negro).
        // ANGULO VERTICAL (BETA)
        // Nota: Beta 0 es arriba (cenital), Beta PI es abajo.  
        this.camera.lowerBetaLimit = Math.PI / 6;   // Tope Superior (~30º): Evita ponerse totalmente vertical sobre la cabeza.
        this.camera.upperBetaLimit = Math.PI / 2.1; // Tope Inferior: PI/2 es 90º (el suelo plano).
                                                    // Usamos 2.1 para frenar la camara justo ANTES de que atraviese el terreno.
    }

    // API PUBLICA ( COMO Un ARCHIVO .H)
    // Son las funciones q permitimos q otros archivos llame from outside
    // Getter pa sacar el puntero.
    // Necesario pq 'this.camera' es privada (protected).
    public getCamera(): ArcRotateCamera {
        return this.camera;
    }

    // Enganchar controles.
    // canvas: Es el rectangulo negro de la web
    // Tipo 'HTMLCanvasElement': Le dice al compilador q esto es un <canvas> valido.
    // Le decimos a la camara: Escucha los clicks SOLO! dentro d este rectangulo.
    public attachControl(canvas: HTMLCanvasElement): void {
        // Babylon.js usa esto internamente pa empezar a leer el raton.
        this.camera.attachControl(canvas, true);
    }
    
    // Desenganchar controles.
    // La usamos pa la UI. Si abres un menu, cortas la conexion aqui
    // pa que el raton deje de mover la camara y solo mueva el cursor.
    public detachControl(): void {
        this.camera.detachControl();
    }

    // LOGICA DE MOVIMIENTO (MANUAL)
    // Rotar horizontal (Alpha).
    // direction: TS nos obliga a usar 'left' o 'right' (Enum estricto).
    public rotate(direction: 'left' | 'right', speed: number = 0.03): void {
        if (direction === 'left') {
            this.camera.alpha += speed;
        } else {
            this.camera.alpha -= speed;
        }
    }

    // Rotar vertical (Beta) + clamping
    public tilt(direction: 'up' | 'down', speed: number = 0.03): void {
        if (direction === 'up') {
            this.camera.beta -= speed; // Subir
        } else {
            this.camera.beta += speed; // Bajar
        }
        
        // CLAMP MANUAL (Freno de seguridad).
        // Forzamos con mates (min/max) q el valor nunca se salga de rango.
        // Es redundante con el constructor pro evita bugs si forzamos el valor a mano.
        this.camera.beta = Math.max(
            this.camera.lowerBetaLimit || 0.1,
            Math.min(this.camera.upperBetaLimit || Math.PI / 2, this.camera.beta)
        );
    }

    // FISICA (SUAVIZADO)
    // Perseguir al objetivo (LERP).
    // Se llama 60 veces por segundo.
    // En vez de teletransportar la camara (=), calculamos la distancia
    // y nos movemos solo un 12% (lerpSpeed). Da efecto de muelle.
    public followTarget(targetPos: Vector3, lerpSpeed: number = 0.12): void {
        this.camera.target.x += (targetPos.x - this.camera.target.x) * lerpSpeed;
        this.camera.target.y = 0; // Altura fija.
        this.camera.target.z += (targetPos.z - this.camera.target.z) * lerpSpeed;
    }

    // Zoom inteligente (Logica de juego)(raycast).
    // Si el raycast dice q hay pared cerca (<15), hacemos zoom in automatico.
    public dynamicZoom(minDistanceToObjects: number): void {
        let targetRadius = 35;
        
        if (minDistanceToObjects < 15) {
            targetRadius = 20; 
        } else if (minDistanceToObjects < 25) {
            const t = (minDistanceToObjects - 15) / 10;
            targetRadius = 20 + (15 * t);
        } else if (minDistanceToObjects > 30) {
            targetRadius = 40;
        }
        
        // Aplicamos el zoom con suavizado (Lerp) igual q el movimiento.
        const zoomLerp = 0.05;
        this.camera.radius += (targetRadius - this.camera.radius) * zoomLerp;
    }

    // EVENTOS DEL NAVEGADOR (INTERRUPCIONES)
    // Configuracion manual de la rueda del raton.
    public setupWheelZoom(canvas: HTMLCanvasElement): void {
        
        // addEventListener: Funcion estandar de JS (no es Babylon).
        // Es un "Hook". Le decimos al navegador: "Cuando pase 'wheel', ejecuta esto".
        canvas.addEventListener('wheel', (event) => {
            
            // preventDefault: IMPORTANTE.
            // Bloquea la funcion normal del navegador.
            // Sin esto, al hacer zoom, tambien bajaria la barra de scroll de la web.
            event.preventDefault(); 
            
            const zoomSpeed = 2;
            // deltaY: Dato del evento q dice cuanto giro la rueda fisica.
            this.camera.radius += event.deltaY * 0.01 * zoomSpeed;
            
            // Limites manuales (Ifs de toda la vida).
            if (this.camera.radius < 15)
                this.camera.radius = 15;
            if (this.camera.radius > 80)
                this.camera.radius = 80;
        });
    }

}

//LERP Linear Interpolation = Es una tecnica matematica de suavizado.
    // En vez de pegar la camara de golpe a la posicion del jugador (teletransporte),
    // calculamos la diferencia de distancia y nos movemos solo un 12% en cada frame.
    // EFECTO VISUAL: La camara persigue al jugador como si estuviera atada con una goma elastica.
    // Empieza rapido cuando estas lejos y frena suavemente al llegar. Evita mareos.