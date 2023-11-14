import { FederatedPointerEvent } from "pixi.js";
import { useCallback, useEffect } from "react";
import { ViewHook } from "../types";
import { useCanvas } from "./useCanvas";
import { useNodes } from "./useNodes";

export type EditMode = "move" | "build";
export const useEdit: ViewHook<{ mode: EditMode }, ReturnType<typeof useNodes>> = ({ mode, ...options }) => {
	const { app, viewport, world } = useCanvas(options);
	const { add } = useNodes(world);

	// callbacks to change cursors based on pointer events
	const handlePointerDown = useCallback((e: FederatedPointerEvent) => {
		console.log(e, world?.cursor);
		if (world) {
			switch (mode) {
				case "move":
				case "build": {
					if (e.button === 1)
						world.cursor = "grabbing";
					break;
				}
			}
		}

	}, [mode, world]);

	const handlePointerUp = useCallback(() => {
		if (world) {
			switch (mode) {
				case "move":
				case "build": {
					world.cursor = "default";
					break;
				}
			}
		}
	}, [mode, world]);

	// const handleWheel = useCallback(() => {
	// 	if (world) {
	// 		switch (mode) {
	// 			case "static": {
	// 				world.cursor = "default";
	// 				break;
	// 			}
	// 		}
	// 	}
	// }, [mode, world]);

	useEffect(() => {
		if (world) {
			world.on("pointerdown", handlePointerDown);
			world.on("pointerup", handlePointerUp);
			// world.on("wheel", handleWheel);
		}
	}, [app, handlePointerDown, handlePointerUp, options.ref, world]);

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

	return { add };
};