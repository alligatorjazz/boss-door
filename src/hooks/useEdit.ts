import { FederatedPointerEvent, Graphics, Point } from "pixi.js";
import { useCallback, useEffect, useMemo, useState } from "react";
import { ViewHook } from "../types";
import { useCanvas } from "./useCanvas";
import { useNodes } from "./useNodes";

const selectColor = "#0253f5";
export type EditMode = "move" | "build";
export const useEdit: ViewHook<{ mode: EditMode }, ReturnType<typeof useNodes>> = ({ mode, ...options }) => {
	const { app, viewport, world } = useCanvas(options);
	const { add } = useNodes(world);

	// manages selecting nodes
	const [selectOrigin, setSelectOrigin] = useState<Point | null>(null);
	const [selectTerminus, setSelectTerminus] = useState<Point | null>(null);

	useEffect(() => {
		if (selectOrigin) {
			console.log(`origin: ${selectOrigin}`);
		}
	}, [selectOrigin, selectTerminus]);

	// event handlers for cursors and select
	const handlePointerDown = useCallback((e: FederatedPointerEvent) => {
		console.log(e, world?.cursor);
		if (world) {
			switch (mode) {
				case "move":
				case "build": {
					if (e.button === 0) {
						setSelectOrigin(e.getLocalPosition(world) as Point);
					}

					if (e.button === 1)
						world.cursor = "grabbing";
					break;
				}
			}
		}

	}, [mode, world]);

	const selectRect = useMemo(() => {
		const prev = world?.children
			.find(child => child.name === "selectRect" && child instanceof Graphics) as Graphics | undefined;
		const graphics = prev ?? new Graphics();
		// graphics.position.copyFrom(selectOrigin ?? new Point(0, 0));
		graphics.name = "selectRect";
		graphics.zIndex = 100;
		if (!prev) { world?.addChild(graphics); }
		return graphics;
	}, [world]);

	useEffect(() => {
		if (world && !world.children.includes(selectRect)) {
			world.addChild(selectRect);
		}
	}, [selectRect, world]);

	const handlePointerMove = useCallback((e: FederatedPointerEvent) => {
		if (world) {
			switch (mode) {
				case "move":
				case "build": {
					if (selectOrigin) {
						console.log("moving...", selectRect.x, selectRect.y);
						const pointer = e.getLocalPosition(world);
						selectRect.clear();
						selectRect
							.lineStyle({ alignment: 0.5, color: selectColor, width: 2 })
							.beginFill(selectColor, 0.5)
							.moveTo(selectOrigin.x, selectOrigin.y)
							.lineTo(pointer.x, selectOrigin.y)
							.lineTo(pointer.x, pointer.y)
							.lineTo(selectOrigin.x, pointer.y)
							.lineTo(selectOrigin.x, selectOrigin.y);
					}
					break;
				}
			}
		}
	}, [mode, selectOrigin, selectRect, world]);

	const handlePointerUp = useCallback((e: FederatedPointerEvent) => {
		if (world) {
			switch (mode) {
				case "move":
				case "build": {
					console.log("pointer up");
					// const resetting origin
					world.cursor = "default";
					setSelectOrigin(null);
					break;
				}
			}
		}
	}, [mode, world]);

	useEffect(() => {
		if (world) {
			world.on("pointerdown", handlePointerDown);
			world.on("pointermove", handlePointerMove);
			world.on("pointerup", handlePointerUp);

			console.log(world.children);
		}
		return () => { world?.removeAllListeners(); };
	}, [handlePointerDown, handlePointerMove, handlePointerUp, world]);

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