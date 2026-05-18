import { useEffect, useRef } from 'react'
import {
	Engine,
	Scene,
	ArcRotateCamera,
	HemisphericLight,
	DirectionalLight,
	Vector3,
	SceneLoader,
	DracoCompression,
	Color3,
	Color4,
	GlowLayer,
	PBRMaterial,
	StandardMaterial,
	AbstractMesh
} from '@babylonjs/core'
import '@babylonjs/loaders'

// Ensure Draco is configured for this flow too (MainPage), not only HubScene.
DracoCompression.Configuration.decoder = {
	wasmUrl: 'https://www.gstatic.com/draco/versioned/decoders/1.5.6/draco_wasm_wrapper.js',
	wasmBinaryUrl: 'https://www.gstatic.com/draco/versioned/decoders/1.5.6/draco_decoder.wasm',
	fallbackUrl: 'https://www.gstatic.com/draco/versioned/decoders/1.5.6/draco_decoder.js',
}

export function PlanetBackground() {
	const canvasRef = useRef<HTMLCanvasElement | null>(null)

	useEffect(() => {
		if (!canvasRef.current)
			return

		const canvas = canvasRef.current
		const engine = new Engine(canvas, true, {
			preserveDrawingBuffer: true,
			stencil: true
		})

		const scene = new Scene(engine)
		scene.clearColor = new Color4(0, 0, 0, 0)

		// camara fija: no queremos que el usuario la mueva
		const camera = new ArcRotateCamera(
			'camera',
			-Math.PI / 2,
			Math.PI / 2.25,
			12,
			new Vector3(0, 0, 0),
			scene
		)
		camera.inputs.clear()

		// luz ambiente principal: aclara toda la esfera
		const hemiLight = new HemisphericLight(
			'hemiLight',
			new Vector3(0, 1, 0),
			scene
		)
		hemiLight.intensity = 1.45
		hemiLight.diffuse = new Color3(1, 1, 1)
		hemiLight.specular = new Color3(1, 1, 1)
		hemiLight.groundColor = new Color3(0.95, 0.95, 1)

		// luz direccional frontal/superior para dar look mas premium
		const frontLight = new DirectionalLight(
			'frontLight',
			new Vector3(-0.25, -0.8, 1),
			scene
		)
		frontLight.position = new Vector3(0, 6, -8)
		frontLight.intensity = 0.15
		frontLight.diffuse = new Color3(1, 1, 1)
		frontLight.specular = new Color3(1, 1, 1)

		// glow suave para que las lineas y bordes respiren mejor
		const glow = new GlowLayer('planetGlow', scene)
		glow.intensity = 0.11

		SceneLoader.ImportMesh(
			'',
			'/models/',
			'planetbg3.glb',
			scene,
			(meshes) => {
				const root = meshes[0]

				root.position = new Vector3(0, 0.80, 8)
				root.scaling = new Vector3(4.1, 4.1, 4.1)
				root.rotationQuaternion = null

				// recorremos todos los meshes para tocar materiales
				meshes.forEach((mesh) => {
					const currentMesh = mesh as AbstractMesh
					if (!currentMesh.material)
						return

					// si el material es PBR, aqui esta la magia buena
					if (currentMesh.material instanceof PBRMaterial) {
						const mat = currentMesh.material

						// base mas blanca
						mat.albedoColor = new Color3(1, 1, 1)

						// menos gris mate, mas pulido
						mat.roughness = 0.24
						mat.metallic = 0.03

						// mas reflejo del entorno claro
						mat.environmentIntensity = 1.72

						// pequeña emision blanca para levantar zonas apagadas
						mat.emissiveColor = new Color3(0.035, 0.035, 0.0045)

						// si la textura base oscurece mucho, con esto se aclara
						if (mat.albedoTexture)
							mat.albedoTexture.level = 1.18

						// si las lineas emissive existen, esto ayuda a que respiren mas
						if (mat.emissiveTexture)
							mat.emissiveTexture.level = 1.35
					}

					// por si algun mesh viene con material clasico
					else if (currentMesh.material instanceof StandardMaterial) {
						const mat = currentMesh.material
						mat.diffuseColor = new Color3(1, 1, 1)
						mat.specularColor = new Color3(1, 1, 1)
						mat.emissiveColor = new Color3(0.03, 0.032, 0.04)

						if (mat.diffuseTexture)
							mat.diffuseTexture.level = 1.15
					}
				})

				scene.onBeforeRenderObservable.add(() => {
					root.rotation.y += 0.00099
					root.position.y = -1
				})
			}
		)

		engine.runRenderLoop(() => {
			scene.render()
		})

		const handleResize = () => {
			engine.resize()
		}

		window.addEventListener('resize', handleResize)

		return () => {
			window.removeEventListener('resize', handleResize)
			engine.dispose()
		}
	}, [])

	return (
		<canvas
			ref={canvasRef}
			className="w-full h-full"
		/>
	)
}