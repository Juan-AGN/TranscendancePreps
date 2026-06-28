// ┌────────────────────────────────────────────────────────────┐
// │                    DebugConfig.ts                          │
// ├────────────────────────────────────────────────────────────┤
// │ Defines debug flags for the 3D engine and Hub scene.       │
// │ Controls optional visual helpers such as collider display. │
// │ It does NOT change gameplay logic when flags are disabled. │
// └────────────────────────────────────────────────────────────┘

export const DEBUG_CONFIG = {
	showColliders: true,
} as const;

