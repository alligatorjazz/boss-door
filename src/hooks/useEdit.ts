import { useCallback, useEffect } from "react";
import { NodeHandle } from "../lib/nodes";
import { EditMode, ViewHook } from "../types";
import { useCanvas } from "./useCanvas";
import { useNodes } from "./useNodes";
import { useSelect } from "./useSelect";

export const useEdit: ViewHook<{ mode: EditMode }, {
	build: (cb: (actions: {
		add: ReturnType<typeof useNodes>["add"]
		remove: ReturnType<typeof useNodes>["remove"]
	}) => void) => void,
	selected: ReadonlyArray<NodeHandle>
} & Omit<ReturnType<typeof useNodes>, "add" | "remove">> = ({ mode, ...options }) => {
	const { viewport, world } = useCanvas(options);
	const { add, remove, ...nodes } = useNodes(world);
	const selected = useSelect({ world, nodes, viewport, enabled: mode === "move" });

	// handling mode changes
	useEffect(() => {
		if (world && viewport) {
			viewport.plugins.removeAll();
			switch (mode) {
				case "move":
				case "build": {
					viewport
						.drag({ mouseButtons: "middle", wheel: true })
						.clamp({ direction: "all" })
						.wheel({ keyToPress: ["AltLeft"], wheelZoom: true, trackpadPinch: true });
					break;
				}
			}
		}
	}, [mode, viewport, world]);

	type BuildActions = { add: typeof add, remove: typeof remove };
	const build = useCallback((cb: (actions: BuildActions) => void) => {
		if (world) {
			cb({ add, remove });
		}
	}, [add, remove, world]);


	return { build, selected, ...nodes };
};