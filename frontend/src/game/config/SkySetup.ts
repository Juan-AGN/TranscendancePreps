// ┌────────────────────────────────────────────────────────────┐
// │                      SkySetup.ts                           │
// ├────────────────────────────────────────────────────────────┤
// │ Creates the custom gradient skybox for the 3D Hub scene.   │
// │ Registers Babylon shader code and applies sky config data. │
// │ It does NOT control lighting, camera or environment HDRI.  │
// └────────────────────────────────────────────────────────────┘

import {
	Scene,
	Mesh,
	MeshBuilder,
	ShaderMaterial,
	Color3,
	Effect,
} from '@babylonjs/core';
import { SKY_CONFIG } from './SkyConfig';

// STEP 1: Define shader and mesh names used by Babylon.
const SKYBOX_MESH_NAME = 'skybox';
const SKYBOX_MATERIAL_NAME = 'skyGradientMat';
const SKY_SHADER_NAME = 'skyGradient';

// ════════ CLASS: SkySetup: Builds and manages the Hub skybox. ════════
export class SkySetup {
	private scene: Scene;
	private skybox: Mesh | null = null;

	constructor(scene: Scene) {
		// STEP 2: Store the Babylon scene and register the custom shader.
		this.scene = scene;
		this.registerSkyGradientShader();
	}

	// ════════ FCT: registerSkyGradientShader: Registers custom GLSL shader code. ════════
	private registerSkyGradientShader(): void {
		// STEP 3: Vertex shader.
		// It passes the local vertex position to the fragment shader.
		Effect.ShadersStore[`${SKY_SHADER_NAME}VertexShader`] = `
			precision highp float;

			attribute vec3 position;

			uniform mat4 worldViewProjection;

			varying vec3 vPosition;

			void main(void) {
				vPosition = position;
				gl_Position = worldViewProjection * vec4(position, 1.0);
			}
		`;

		// STEP 4: Fragment shader.
		// It calculates a vertical color gradient from bottom to top.
		Effect.ShadersStore[`${SKY_SHADER_NAME}FragmentShader`] = `
			precision highp float;

			varying vec3 vPosition;

			uniform vec3 topColor;
			uniform vec3 middleColor;
			uniform vec3 bottomColor;

			uniform float whiteZoneEnd;
			uniform float bottomEnd;

			void main(void) {
				float heightFactor = normalize(vPosition).y * 0.5 + 0.5;

				vec3 finalColor;

				if (heightFactor < whiteZoneEnd) {
					finalColor = bottomColor;
				} else if (heightFactor < bottomEnd) {
					float t = smoothstep(whiteZoneEnd, bottomEnd, heightFactor);
					finalColor = mix(bottomColor, middleColor, t);
				} else {
					float t = smoothstep(bottomEnd, 1.0, heightFactor);
					finalColor = mix(middleColor, topColor, t);
				}

				gl_FragColor = vec4(finalColor, 1.0);
			}
		`;
	}

	// ════════ FCT: setupSkybox: Creates the sphere skybox and applies the shader. ════════
	public setupSkybox(): void {
		// STEP 5: Create a large sphere around the scene.
		this.skybox = MeshBuilder.CreateSphere(
			SKYBOX_MESH_NAME,
			{
				diameter: SKY_CONFIG.skybox.size,
				segments: 64,
			},
			this.scene
		);

		// STEP 6: Disable interaction and collisions for the skybox.
		this.skybox.isPickable = false;
		this.skybox.checkCollisions = false;
		this.skybox.infiniteDistance = true;

		// STEP 7: Create the shader material using the registered shader code.
		const skyboxMat = new ShaderMaterial(
			SKYBOX_MATERIAL_NAME,
			this.scene,
			{
				vertex: SKY_SHADER_NAME,
				fragment: SKY_SHADER_NAME,
			},
			{
				attributes: ['position'],
				uniforms: [
					'worldViewProjection',
					'topColor',
					'middleColor',
					'bottomColor',
					'whiteZoneEnd',
					'bottomEnd',
				],
			}
		);

		// STEP 8: Make the sky render from the inside and avoid depth conflicts.
		skyboxMat.backFaceCulling = false;
		skyboxMat.disableDepthWrite = true;

		// STEP 9: Send color values from SkyConfig to the shader.
		skyboxMat.setColor3(
			'topColor',
			new Color3(...SKY_CONFIG.skybox.topColor)
		);

		skyboxMat.setColor3(
			'middleColor',
			new Color3(...SKY_CONFIG.skybox.middleColor)
		);

		skyboxMat.setColor3(
			'bottomColor',
			new Color3(...SKY_CONFIG.skybox.bottomColor)
		);

		// STEP 10: Send gradient transition values to the shader.
		skyboxMat.setFloat(
			'whiteZoneEnd',
			SKY_CONFIG.skybox.whiteZoneEnd
		);

		skyboxMat.setFloat(
			'bottomEnd',
			SKY_CONFIG.skybox.bottomEnd
		);

		// STEP 11: Apply the final shader material to the skybox mesh.
		this.skybox.material = skyboxMat;
	}

	// ════════ FCT: dispose: Releases the skybox mesh when the scene is destroyed. ════════
	public dispose(): void {
		this.skybox?.dispose();
		this.skybox = null;
	}
}