// ┌────────────────────────────────────────────────────────────┐
// │          HubObjectClickHandler.ts                          │
// ├────────────────────────────────────────────────────────────┤
// │ Converts 3D objects into clickable navigation buttons.      │
// │ Detects clicks on meshes and executes React Router nav.     │
// │ Manages interactive object map and associated routes.       │
// └────────────────────────────────────────────────────────────┘

// STEP 1: Import Babylon.js pointer and mesh detection tools
import { Scene, Mesh, PointerEventTypes } from '@babylonjs/core';

// STEP 2: Define template class for 3D menu interaction system
export class HubObjectClickHandler {
	private scene: Scene;                                                    // Babylon scene where clicks occur
	private clickableObjects: Map<string, { mesh: Mesh, entity: any }> = new Map(); // Maps routes to 3D objects
	// Map = dictionary-like data structure (key-value pairs)
	// string = key is the route (e.g., '/trophy')
	// { mesh, entity } = value is an object with 3D mesh and logic entity
	// = new Map() = start with empty dictionary
	private navigateToRoute: (route: string) => void;                      // Function to navigate pages
	// (route: string) => void = receives a route, returns nothing
	// This callback comes from outside (React Router)

	// STEP 3: Constructor - initialize with scene and navigation callback
	constructor(scene: Scene, navigateToRoute: (route: string) => void) {
		this.scene = scene;                         // Store the Babylon scene
		this.navigateToRoute = navigateToRoute;    // Store the navigation function
		this.registerClickHandlers();               // Setup click event listeners
	}

	// STEP 4: Register pointer event listeners
	private registerClickHandlers(): void {
		// onPointerObservable = Babylon's observable for mouse events
		// .add() = add a listener that executes for every pointer event
		this.scene.onPointerObservable.add((pointerInfo) => {
			// Check if event is a click (POINTERDOWN)
			// We don't care about other events like hover, move, etc.
			if (pointerInfo.type === PointerEventTypes.POINTERDOWN) {
				// STEP 5: Cast a ray from cursor to detect which mesh was clicked
				// pick() = fire a ray from cursor to see what mesh it touches
				// scene.pointerX, pointerY = cursor coordinates on screen
				// Filter function = only consider meshes that are NOT the ground
				const pickResult = this.scene.pick(this.scene.pointerX, this.scene.pointerY, (mesh) => {
					return mesh.name !== 'ground'; // Ignore the ground
				});

				// STEP 6: Check if ray hit something and process the click
				if (pickResult?.hit && pickResult.pickedMesh) {
					const picked = pickResult.pickedMesh;
					for (const [route, clickableObjects] of this.clickableObjects.entries()) {
						const collider = clickableObjects.entity?.getColliderMesh?.();

						// CASE 1: Click on invisible physics collider box covering the building
						// The collider (invisible physics box) always receives click before GLB
						// Without this check, we'd never match and click would be lost
						if (collider && picked === collider) {
							this.navigateToRoute(route);
							break;
						}

						// CASE 2: Direct click on GLB mesh (traverse up the hierarchy)
						// GLBs have deep structure with multiple parent levels
						// E.g.: pickedMesh → __root__ → glb_node → mesh_0 → clickableObjects.mesh
						// Single .parent would never reach the registered mesh
						let node: any = picked;
						let found = false;
						while (node) {
							if (node === clickableObjects.mesh) {
								found = true;
								break;
							}
							node = node.parent;
						}
						if (found) {
							this.navigateToRoute(route);
							break;
						}
					}
				}
			}
		});
	}

	// STEP 7: Register a clickable object with its route
	public registerClickableObject(route: string, mesh: Mesh, entity: any): void {
		// set() = add a key-value pair to Map
		// Store route as key and mesh + entity as value
		// When this mesh is clicked, we'll know which route to navigate to
		this.clickableObjects.set(route, { mesh, entity });
	}

	// STEP 8: Get all registered clickable objects (for debugging/inspection)
	public getClickableObjects(): Map<string, { mesh: Mesh, entity: any }> {
		return this.clickableObjects;
	}
}

// ===== MINI DICTIONARY =====
// Raycast = invisible ray cast from a point to detect intersections
// PointerEvent = mouse or touch input event
// Pick = select/detect mesh using a ray from cursor
// Collider = invisible physics box for collision detection
// GLB = binary 3D model format
// Hierarchy = parent-child relationship in 3D scene graph
// Observable = pattern for event listening
// Route = navigation path in React Router