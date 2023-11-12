import { FederatedPointerEvent } from "pixi.js";
import { useCallback, useEffect } from "react";
import { ViewHook } from "../types";
import { useCanvas } from "./useCanvas";
import { useNodes } from "./useNodes";

export type EditMode = "move" | "static"
export const useEdit: ViewHook<{ mode: EditMode }, any> = ({ mode, ...options }) => {
	const { app, viewport, world } = useCanvas(options);
	const { nodes, createNode } = useNodes(world);

	// callbacks to change cursors based on pointer events
	const handlePointerDown = useCallback((e: FederatedPointerEvent) => {
		console.log(e, world?.cursor);
		if (world) {
			switch (mode) {
				case "move": {
					if (e.button === 0)
						world.cursor = "grabbing";
					break;
				}
				case "static": {
					world.cursor = "default";
					break;
				}
			}
		}

	}, [mode, world]);

	const handlePointerUp = useCallback(() => {
		if (world) {
			switch (mode) {
				case "move": {
					world.cursor = "grab";
					break;
				}
				case "static": {
					world.cursor = "default";
					break;
				}
			}
		}
	}, [mode, world]);

	const handleWheel = useCallback(() => {
		if (world) {
			switch (mode) {
				case "static": {
					world.cursor = "default";
					break;
				}
			}
		}
	}, [mode, world]);

	useEffect(() => {
		if (world) {
			world.on("pointerdown", handlePointerDown);
			world.on("pointerup", handlePointerUp);
			world.on("wheel", handleWheel);
		}
	}, [app, handlePointerDown, handlePointerUp, handleWheel, options.ref, world]);

	// handling mode changes
	useEffect(() => {
		if (world && viewport) {
			viewport.plugins.removeAll();
			switch (mode) {
				case "move": {
					viewport
						.drag({ mouseButtons: "left", wheel: true })
						.decelerate()
						.clamp({ direction: "all" })
						.wheel({ keyToPress: ["AltLeft"], wheelZoom: true, trackpadPinch: true });
					world.cursor = "grab";
					break;
				} case "static": {
					viewport
						.clamp({ direction: "all" });
					world.cursor = "default";
					break;
				}
			}
		}
	}, [mode, viewport, world]);

	return { createNode, nodes };
};