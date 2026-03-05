"use client";

/**
 * useHaptic — wrapper around web-haptics (https://haptics.lochie.me/).
 *
 * Returns a `haptic(pattern)` function. Silent no-op on unsupported browsers
 * (desktop, iOS Safari) and during SSR.
 *
 * Presets from the web-haptics library:
 *   "light"     — 15ms @ 0.4 intensity   — subtle micro-tap
 *   "medium"    — 25ms @ 0.7 intensity   — standard press confirmation
 *   "heavy"     — 35ms @ 1.0 intensity   — strong action confirmation
 *   "soft"      — 40ms @ 0.5 intensity   — gentle impression
 *   "rigid"     — 10ms @ 1.0 intensity   — crisp snap
 *   "selection" —  8ms @ 0.3 intensity   — picker / toggle micro-tap
 *   "nudge"     — 80ms @ 0.8 + 50ms @ 0.3 — double-pulse (avoid for navigation)
 *   "buzz"      — 1000ms @ 1.0           — long sustained buzz
 *   "success"   — 30ms @ 0.5 + 40ms @ 1.0 — two-stage confirmation
 *   "warning"   — 40ms @ 0.8 + 40ms @ 0.6 — double caution pulse
 *   "error"     — triple 40ms @ 0.9 burst — destructive / failure feedback
 *
 * "navigation" is a convenience alias for "selection" (subtle 8ms micro-tap — keeps nav light).
 *
 * Usage:
 *   const haptic = useHaptic();
 *   haptic("light");        // subtle tap on minor UI interaction
 *   haptic("medium");       // normal button press
 *   haptic("heavy");        // prominent action
 *   haptic("selection");    // picker item / toggle state change
 *   haptic("navigation");   // page swipe or tab switch
 *   haptic("success");      // schedule generated, saved, shared
 *   haptic("error");        // delete, destructive action
 *   haptic("warning");      // caution-level action
 *   haptic([30, 50, 30]);   // custom alternating on/off/on pattern (ms)
 */

import { useCallback } from "react";
import { useWebHaptics } from "web-haptics/react";
import type { HapticInput } from "web-haptics";

export type HapticPattern =
	| "light"
	| "medium"
	| "heavy"
	| "soft"
	| "rigid"
	| "selection"
	| "nudge"
	| "navigation" // alias → "nudge" (two-pulse: perfect for page swipes / tab switches)
	| "buzz"
	| "success"
	| "warning"
	| "error"
	| number[]; // raw alternating vibration pattern (ms on, ms off, ms on, …)

export function useHaptic() {
	const { trigger } = useWebHaptics();

	return useCallback(
		(pattern: HapticPattern = "medium") => {
			// Map our "navigation" alias to the library's "nudge" preset
			const resolved: HapticInput =
				pattern === "navigation" ? "selection" : pattern;
			trigger(resolved);
		},
		[trigger]
	);
}
