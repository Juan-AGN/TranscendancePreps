import {
	Scene,
	Mesh,
	MeshBuilder,
	StandardMaterial,
	Color3,
	Texture,
} from '@babylonjs/core';

export class GroundSetup {
	private scene: Scene;
	private ground: Mesh | null = null;

	constructor(scene: Scene) {
		this.scene = scene;
	}

	public create(): void {
		this.createCelestialGround();
	}

	private createCelestialGround(): void {
		this.ground = MeshBuilder.CreateGround(
			"celestialGround",
			{
				width: 300,
				height: 300,
			},
			this.scene
		);

		this.ground.position.y = 0;

		const material = new StandardMaterial(
			"celestialGroundMaterial",
			this.scene
		);

		const textureUrl = `${import.meta.env.BASE_URL}images/groundfloor6.png`;
		const texture = new Texture(
			textureUrl,
			this.scene,
			true
		);

		texture.wrapU = Texture.WRAP_ADDRESSMODE;
		texture.wrapV = Texture.WRAP_ADDRESSMODE;

		texture.uScale = 6;
		texture.vScale = 6;

		material.diffuseTexture = texture;
		material.diffuseColor = new Color3(0.95, 0.92, 0.86);
		material.specularColor = new Color3(0.18, 0.14, 0.08);
		material.emissiveColor = new Color3(0.0025, 0.022, 0.018);

		this.ground.material = material;
	}
}