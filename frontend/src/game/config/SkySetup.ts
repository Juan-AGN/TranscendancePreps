import {
	Scene,
	Mesh,
	MeshBuilder,
	ShaderMaterial,
	Color3,
	Effect,
} from '@babylonjs/core';
import { SKY_CONFIG } from './SkyConfig';

export class SkySetup {
	private scene: Scene;
	private skybox: Mesh | null = null;

	constructor(scene: Scene) {
		this.scene = scene;
		this.registerSkyGradientShader();
	}

	private registerSkyGradientShader(): void {
		Effect.ShadersStore['skyGradientVertexShader'] = `
			precision highp float;

			attribute vec3 position;

			uniform mat4 worldViewProjection;

			varying vec3 vPosition;

			void main(void) {
				vPosition = position;
				gl_Position = worldViewProjection * vec4(position, 1.0);
			}
		`;

		Effect.ShadersStore['skyGradientFragmentShader'] = ` 
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

	public setupSkybox(): void {
		this.skybox = MeshBuilder.CreateSphere(
			'skybox',
			{
				diameter: SKY_CONFIG.skybox.size,
				segments: 64,
			},
			this.scene
		);

		this.skybox.isPickable = false;
		this.skybox.checkCollisions = false;
		this.skybox.infiniteDistance = true;

		const skyboxMat = new ShaderMaterial(
			'skyGradientMat',
			this.scene,
			{
				vertex: 'skyGradient',
				fragment: 'skyGradient',
			},
			{
				attributes: ['position'],
				uniforms: [
					'worldViewProjection',
					'topColor',
					'middleColor',
					'whiteZoneEnd',
					'bottomColor',
					'bottomEnd',
				],
			}
		);

		skyboxMat.backFaceCulling = false;
		skyboxMat.disableDepthWrite = true;

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
		skyboxMat.setFloat(
			'whiteZoneEnd',
			SKY_CONFIG.skybox.whiteZoneEnd
		);

		skyboxMat.setFloat(
			'bottomEnd',
			SKY_CONFIG.skybox.bottomEnd
		);



		this.skybox.material = skyboxMat;
	}

	public dispose(): void {
		this.skybox?.dispose();
		this.skybox = null;
	}
}