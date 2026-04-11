// GROUND TEXT HOLOGRAM -- letras 3D planas en el suelo, emergen suavemente desde abajo
// rotation.x = +PI/2 → cara del texto apunta hacia ARRIBA (legible desde encima)
// animacion: las letras suben desde bajo el suelo hasta el nivel 0
// sin panel de fondo → solo letras neon

import { Scene, Mesh, MeshBuilder, Vector3, StandardMaterial, Color3, Animation, EasingFunction, SineEase } from '@babylonjs/core';
import earcut from 'earcut';
(globalThis as any).earcut = earcut;

import {
	HOLOGRAM_FONT_URL,
	HOLOGRAM_ANIM_FPS,
	HOLOGRAM_GLYPH_RESOLUTION,
	HOLOGRAM_TEXT_SIZE,
	HOLOGRAM_TEXT_DEPTH,
	HOLOGRAM_OUTLINE_WIDTH,
	HOLOGRAM_EMERGE_FROMSKY,
	HOLOGRAM_FRAMES_UP,
	HOLOGRAM_FRAMES_DOWN,
} from '../config/HologramConfig';

export class SkyTextHologram { // Define la clase que se encarga de crear, mostrar, ocultar y destruir el holograma de texto
	private scene: Scene; // Guarda la escena de Babylon donde existe el holograma
	private label: string; // Guarda el texto que se va a mostrar, por ejemplo "PONG" o "SETTINGS"
	private glowColor: Color3; // Guarda el color brillante/emissive del holograma
	private textMesh: Mesh | null = null; // Guarda la malla del texto 3D una vez creada; empieza en null porque tarda en cargarse
	private groundY: number = 0; // Guarda la altura Y final donde debe quedar apoyado el texto, normalmente el nivel del suelo
	private isVisible: boolean = false; // Indica si el holograma se considera visible lógicamente
	private waitingToShow: boolean = false; // Sirve para recordar que alguien call a show() antes de que el texto terminara de cargarse

	constructor(
		scene: Scene,
		label: string,
		emissiveColor: Color3,
		position: Vector3,
	) {
		this.scene     = scene;
		this.label     = label;
		this.glowColor = emissiveColor;
		this.loadFontAndCreateTextMesh(position);
	}

	private async loadFontAndCreateTextMesh(position: Vector3): Promise<void> {
		try {
			const fontData = await (await fetch(HOLOGRAM_FONT_URL)).json();

			const mesh = MeshBuilder.CreateText(
				`hologram3d_${this.label}`,
				this.label,
				fontData,
				{ size: HOLOGRAM_TEXT_SIZE, resolution: HOLOGRAM_GLYPH_RESOLUTION, depth: HOLOGRAM_TEXT_DEPTH },
				this.scene,
			) as Mesh;

			if (!mesh) { // Comprueba si Babylon devolvió null o algo no valid al crear el texto
				console.warn(`[Hologram3D] CreateText devolvio null para "${this.label}"`); // Muestra aviso en consola para saber q texto fallo
				return; // Sale del método porque no puede continuar sin mesh
			} // Cierra el if

			// contorno negro gordo
			mesh.renderOutline = false;
			mesh.outlineColor  = new Color3(0, 0, 0);
			mesh.outlineWidth  = HOLOGRAM_OUTLINE_WIDTH;

			this.groundY     = position.y;
			mesh.position    = new Vector3(position.x, this.groundY + HOLOGRAM_EMERGE_FROMSKY, position.z);
			mesh.rotation.x  = 0;

			mesh.billboardMode = Mesh.BILLBOARDMODE_Y; // Rota en el eje Y para siempre mirar al jugador
			mesh.isVisible = false; // Lo deja oculto hasta que alguien llame a show()
			mesh.isPickable = false; // Evita que el texto intercepte clics o raycasts; asi el edificio sigue siendo clicable

			// material solido con relieve visible:
			// - cara frontal casi blanca (diffuse) → la luz de escena crea claroscuro en el relieve
			// - especular brillante → cantos y aristas captan la luz
			// - emissive muy suave con el color del objeto → tinte identidad sin aplanar el relieve
			const mat = new StandardMaterial(`hologram3d_mat_${this.label}`, this.scene);
			const g = this.glowColor;
			mat.diffuseColor  = new Color3(
				0.85 + g.r * 0.15,
				0.85 + g.g * 0.15,
				0.85 + g.b * 0.15,
			); // casi blanco con ligero tinte del color del objeto
			mat.specularColor = new Color3(g.r * 0.8, g.g * 0.8, g.b * 0.8);
			mat.specularPower = 64;  // reflejo concentrado en aristas → da efecto brillante/lacado
			mat.emissiveColor = new Color3(g.r * 0.08, g.g * 0.08, g.b * 0.08); // tinte identidad muy sutil
			mesh.material = mat;

			this.textMesh = mesh; // Guarda la referencia al texto ya creado en la propiedad de la clase

			if (this.waitingToShow) {
				this.waitingToShow = false;
				mesh.isVisible     = true;
				this.animateEmerge(this.groundY, HOLOGRAM_FRAMES_DOWN);
			}

		} catch (err) { // Captura cualquier error ocurrido en fetch, json() o CreateText
			console.error(`[Hologram3D] Error creando texto "${this.label}":`, err); // Muestra el error completo en consola para depurar
		} // Cierra el catch
	} // Cierra el metodo de creación

	private animateEmerge(targetY: number, frames: number, onEnd?: () => void): void {
		if (!this.textMesh)
			return;

		// SineEase IN → empieza MUY lento (sensacion de peso/gravedad) y va acelerando
		const ease = new SineEase();
		ease.setEasingMode(EasingFunction.EASINGMODE_EASEOUT);

		Animation.CreateAndStartAnimation(
			`hologram3d_emerge_${this.label}`,
			this.textMesh,
			'position.y',
			HOLOGRAM_ANIM_FPS,
			frames,
			this.textMesh.position.y,
			targetY,
			Animation.ANIMATIONLOOPMODE_CONSTANT,
			ease,
			onEnd,
		);
	}

	public show(): void { // Metodo publico para mostrar el holograma
		if (this.isVisible)
			return; // Si ya está visible , no hace nada para evitar repetir la animation
		this.isVisible = true; // Marca el holograma como visible

		if (!this.textMesh) { // Comprueba si el texto aun no se ha creado porque la fuente sigue cargando
			this.waitingToShow = true; // Guarda la intención de mostrarlo + tarde cuando termine la carga
			return; // Sale del metodo porque todavía no puede mostrar nada
		} // Cierra el if

		this.textMesh.position.y = this.groundY + HOLOGRAM_EMERGE_FROMSKY;
		this.textMesh.isVisible  = true;
		this.animateEmerge(this.groundY, HOLOGRAM_FRAMES_DOWN);
	} // Cierra show()

	public hide(): void { // metodo publico para ocultar el holograma
		if (!this.isVisible)
			return; // Si ya ta oculto  no hace nada
		this.isVisible = false; // Marca el holograma como oculto 
		this.waitingToShow = false; // Cancela cualquier show pendiente que hubiera quedado guardado
		if (!this.textMesh)
			return; // Si aun no existe el mesh, no hay nada que ocultar

		this.animateEmerge(this.groundY + HOLOGRAM_EMERGE_FROMSKY, HOLOGRAM_FRAMES_UP, () => {
			if (this.textMesh)
				this.textMesh.isVisible = false;
		});
	} // Cierra hide()

	public cleanUp(): void {
		this.textMesh?.dispose();
		this.textMesh = null;
	}
}