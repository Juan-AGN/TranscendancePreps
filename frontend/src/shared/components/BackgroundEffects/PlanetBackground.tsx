// ┌────────────────────────────────────────────────────────────┐
// │                    PlanetBackground.tsx                    │
// ├────────────────────────────────────────────────────────────┤
// │ Babylon.js animated planet background used by StartGate.   │
// │ It loads a Draco-compressed GLB model, configures lights,  │
// │ materials, glow and a continuous render loop.              │
// └────────────────────────────────────────────────────────────┘
import { useEffect, useRef } from 'react';
import { Engine, Scene, ArcRotateCamera, HemisphericLight, DirectionalLight, Vector3, SceneLoader, Logger,
	DracoCompression, Color3, Color4, GlowLayer, PBRMaterial, StandardMaterial, AbstractMesh, } from '@babylonjs/core';
import '@babylonjs/loaders';

// STEP 2: Configure the Draco decoder used by the compressed planet model.
DracoCompression.Configuration.decoder = {
	wasmUrl: 'https://www.gstatic.com/draco/versioned/decoders/1.5.6/draco_wasm_wrapper.js',
	wasmBinaryUrl: 'https://www.gstatic.com/draco/versioned/decoders/1.5.6/draco_decoder.wasm',
	fallbackUrl: 'https://www.gstatic.com/draco/versioned/decoders/1.5.6/draco_decoder.js',
};

// ════════ COMPONENT: PlanetBackground: Render the animated Babylon.js planet background. ════════
export function PlanetBackground() {
	// Step 1: Keep a reference to the canvas used by Babylon.js.
	const canvasRef = useRef<HTMLCanvasElement | null>(null);

	useEffect(() => {
		// Step 2: Stop if the canvas is not available.
		if (!canvasRef.current)
			return;

		const canvas = canvasRef.current;
		// Step 3: Keep Babylon console output limited to real errors.
		Logger.LogLevels = Logger.ErrorLogLevel;
		// Step 4: Create the Babylon engine and transparent scene.
		const engine = new Engine(canvas, true, {
			preserveDrawingBuffer: true,
			stencil: true,
		});

		const scene = new Scene(engine)
		scene.clearColor = new Color4(0, 0, 0, 0)

		// Step 5: Create a fixed camera without user controls.
		const camera = new ArcRotateCamera(
			'camera',
			-Math.PI / 2,
			Math.PI / 2.25,
			12,
			new Vector3(0, 0, 0),
			scene,
		);

		camera.inputs.clear();

		// Step 6: Add soft ambient lighting for the planet surface.
		const hemiLight = new HemisphericLight(
			'hemiLight',
			new Vector3(0, 1, 0),
			scene,
		);

		hemiLight.intensity = 1.45;
		hemiLight.diffuse = new Color3(1, 1, 1);
		hemiLight.specular = new Color3(1, 1, 1);
		hemiLight.groundColor = new Color3(0.95, 0.95, 1);

		// Step 7: Add a subtle directional light to improve the premium look.
		const frontLight = new DirectionalLight(
			'frontLight',
			new Vector3(-0.25, -0.8, 1),
			scene,
		);

		frontLight.position = new Vector3(0, 6, -8);
		frontLight.intensity = 0.15;
		frontLight.diffuse = new Color3(1, 1, 1);
		frontLight.specular = new Color3(1, 1, 1);

		// Step 8: Add a soft glow layer around bright planet details.
		const glow = new GlowLayer('planetGlow', scene);
		glow.intensity = 0.11;
		// Step 9: Load the Draco-compressed planet model.
		SceneLoader.ImportMesh(
			'',
			'/models/',
			'planetbg3Draco.glb',
			scene,
			(meshes) => {
				const root = meshes[0];

				root.position = new Vector3(0, 0.80, 8);
				root.scaling = new Vector3(4.1, 4.1, 4.1);
				root.rotationQuaternion = null;

				// Step 10: Tune loaded mesh materials for a brighter visual style.
				meshes.forEach((mesh) => {
					const currentMesh = mesh as AbstractMesh;
					if (!currentMesh.material)
						return;

					// if material is PBR
					if (currentMesh.material instanceof PBRMaterial) {
						const mat = currentMesh.material;
						// base more wehite
						mat.albedoColor = new Color3(1, 1, 1);
						// les grey, more pulish
						mat.roughness = 0.24;
						mat.metallic = 0.03;
						// more relfex on sky
						mat.environmentIntensity = 1.72;
						//little white emission to see mar lighter
						mat.emissiveColor = new Color3(0.035, 0.035, 0.0045);
						//if texture is dark, with this its more clear
						if (mat.albedoTexture)
							mat.albedoTexture.level = 1.18;
						if (mat.emissiveTexture)
							mat.emissiveTexture.level = 1.35;
					}
					// if any mesh comes whit classic material
					else if (currentMesh.material instanceof StandardMaterial) {
						const mat = currentMesh.material;
						mat.diffuseColor = new Color3(1, 1, 1);
						mat.specularColor = new Color3(1, 1, 1);
						mat.emissiveColor = new Color3(0.03, 0.032, 0.04);
						if (mat.diffuseTexture)
							mat.diffuseTexture.level = 1.15;
					}
				})
				// Step 11: Rotate the planet slowly before each rendered frame.
				scene.onBeforeRenderObservable.add(() => {
					root.rotation.y += 0.00099;
					root.position.y = -1;
				})
			}
		)
		// Step 12: Start the render loop.
		engine.runRenderLoop(() => {
			scene.render();
		})
		// Step 13: Keep the Babylon engine synchronized with browser resizing.
		const handleResize = () => {
			engine.resize();
		}

		window.addEventListener('resize', handleResize);

		return () => {
			// Step 14: Clean browser listeners and dispose the Babylon engine.
			window.removeEventListener('resize', handleResize);
			engine.dispose();
		}
	}, [])

	return (
		<canvas
			ref={canvasRef}
			className="w-full h-full"/>
	)
}