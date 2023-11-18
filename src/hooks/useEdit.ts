import { useCallback, useEffect } from "react";
import { NodeHandle } from "../lib/nodes";
import { EditMode, ViewHook } from "../types";
import { useCanvas } from "./useCanvas";
import { useNodes } from "./useNodes";
import { useSelect } from "./useSelect";
import { useGrid } from "./useGrid";
import { useBuild } from "./useBuild";

export const useEdit: ViewHook<{ mode: EditMode }, {
	draw: (cb: (actions: {
		add: ReturnType<typeof useNodes>["add"]
		remove: ReturnType<typeof useNodes>["remove"]
	}) => void) => void,
	selected: ReadonlyArray<NodeHandle>
} & Omit<ReturnType<typeof useNodes>, "add" | "remove">> = ({ mode, ...options }) => {
	const { viewport, world, setCursor } = useCanvas(options);
	const { add, remove, ...nodes } = useNodes(world);
	const selected = useSelect({ world, nodes, viewport, enabled: mode === "move", setCursor });
	useBuild({ world, nodes, enabled: mode === "build", viewport, setCursor });
	
	useGrid({ world, cellSize: 32, color: "lightgray", levels: 16, viewport });

	// console.log("viewport scale: ", viewport?.scale.x);
	// handling mode changes
	useEffect(() => {
		if (world && viewport) {
			viewport.plugins.removeAll();
			switch (mode) {
				case "move": {
					viewport
						.drag({ mouseButtons: "middle", wheel: true })
						.clamp({ direction: "all" })
						.wheel({ keyToPress: ["AltLeft"], wheelZoom: true, trackpadPinch: true })
						.clampZoom({ maxScale: 2 });
					break;
				}
				case "build": {
					viewport
						.drag({ mouseButtons: "middle", wheel: true })
						.clamp({ direction: "all" })
						.wheel({ keyToPress: ["AltLeft"], wheelZoom: true, trackpadPinch: true })
						.clampZoom({ maxScale: 2 });
					break;
				}
			}
		}
	}, [mode, viewport, world]);

	type BuildActions = { add: typeof add, remove: typeof remove };
	const draw = useCallback((cb: (actions: BuildActions) => void) => {
		if (world) {
			cb({ add, remove });
		}
	}, [add, remove, world]);


	return { draw, selected, ...nodes };
};