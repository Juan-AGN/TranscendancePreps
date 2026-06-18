// ┌────────────────────────────────────────────────────────────┐
// │                     GroundSetup.ts                         │
// ├────────────────────────────────────────────────────────────┤
// │ Creates and configures the textured ground for the 3D Hub. │
// │ Applies Babylon material, texture tiling and color tuning. │
// │ It does NOT control player movement or collision logic.    │
// └────────────
import { Scene, Mesh, MeshBuilder, StandardMaterial, Color3, Texture } from '@babylonjs/core';

// STEP 1: Define ground visual constants.
// These values control only the visual floor mesh and its material.
const GROUND_NAME = 'celestialGround';
const GROUND_MATERIAL_NAME = 'celestialGroundMaterial';
const GROUND_SIZE = 300;
const TEXTURE_PATH = 'images/groundfloor6.png';
const TEXTURE_REPEAT = 6;

// ════════ CLASS: GroundSetup: Creates the 3D Hub ground mesh. ════════
export class GroundSetup {
	private scene: Scene;
	private ground: Mesh | null = null;

	constructor(scene: Scene) {
		// STEP 2: Store the Babylon scene where the ground will be created.
		this.scene = scene;
	}

	// ════════ FCT: create: Public entry point for ground creation. ════════
	public create(): void {
		this.createCelestialGround();
	}

	// ════════ FCT: createCelestialGround: Builds the floor mesh and material. ════════
	private createCelestialGround(): void {
		// STEP 3: Create a flat ground mesh in the Babylon scene.
		this.ground = MeshBuilder.CreateGround(
			GROUND_NAME,
			{
				width: GROUND_SIZE,
				height: GROUND_SIZE,
			},
			this.scene
		);

		// STEP 4: Place the ground at world height 0.
		this.ground.position.y = 0;

		// STEP 5: Create the material used by the ground.
		const material = new StandardMaterial(
			GROUND_MATERIAL_NAME,
			this.scene
		);

		// STEP 6: Build the texture URL using Vite base path.
		const textureUrl = `${import.meta.env.BASE_URL}${TEXTURE_PATH}`;

		// STEP 7: Load the ground texture.
		const texture = new Texture(
			textureUrl,
			this.scene,
			true
		);

		// STEP 8: Repeat the texture instead of stretching it once.
		texture.wrapU = Texture.WRAP_ADDRESSMODE;
		texture.wrapV = Texture.WRAP_ADDRESSMODE;

		// STEP 9: Tile the texture across the ground.
		texture.uScale = TEXTURE_REPEAT;
		texture.vScale = TEXTURE_REPEAT;

		// STEP 10: Configure material colors.
		material.diffuseTexture = texture;
		material.diffuseColor = new Color3(0.95, 0.92, 0.86);
		material.specularColor = new Color3(0.18, 0.14, 0.08);
		material.emissiveColor = new Color3(0.0025, 0.022, 0.018);

		// STEP 11: Apply the finished material to the ground mesh.
		this.ground.material = material;
	}
}