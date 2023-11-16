import { FederatedPointerEvent, Graphics, Point, Rectangle } from "pixi.js";
import { useCallback, useEffect, useMemo, useState } from "react";
import { NodeHandle } from "../lib/nodes";
import { ViewHook } from "../types";
import { useCanvas } from "./useCanvas";
import { useNodes } from "./useNodes";

const selectColor = "#0253f5";
export type EditMode = "move" | "build";
export const useEdit: ViewHook<{ mode: EditMode }, ReturnType<typeof useNodes> & { selected: NodeHandle[] }> = ({ mode, ...options }) => {
	const { viewport, world } = useCanvas(options);
	const nodes = useNodes(world);
	const [selectOrigin, setSelectOrigin] = useState<Point | null>(null);
	const [selectTerminus, setSelectTerminus] = useState<Point | null>(null);
	const [selected, setSelected] = useState<NodeHandle[]>([]);

	// event handlers for cursors and select
	const handlePointerDown = useCallback((e: FederatedPointerEvent) => {
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

	const selectorRect = useMemo(() => {
		const prev = world?.children
			.find(child => child.name === "selectorRect" && child instanceof Graphics) as Graphics | undefined;
		const graphics = prev ?? new Graphics();
		// graphics.position.copyFrom(selectOrigin ?? new Point(0, 0));
		graphics.name = "selectorRect";
		graphics.zIndex = 100;
		if (!prev) { world?.addChild(graphics); }
		return graphics;
	}, [world]);

	useEffect(() => {
		if (world && !world.children.includes(selectorRect)) {
			world.addChild(selectorRect);
		}
	}, [selectorRect, world]);

	const handlePointerMove = useCallback((e: FederatedPointerEvent) => {
		if (world) {
			switch (mode) {
				case "move":
				case "build": {
					if (selectOrigin) {
						const pointer = e.getLocalPosition(world);
						selectorRect.clear();
						selectorRect
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
	}, [mode, selectOrigin, selectorRect, world]);

	const handlePointerUp = useCallback((e: FederatedPointerEvent) => {
		if (world) {
			switch (mode) {
				case "move":
				case "build": {
					setSelectTerminus(e.getLocalPosition(world) as Point);
					break;
				}
			}
		}
	}, [mode, world]);

	// "closes" selection, adding objects under the selectorRect to the list of
	// selected nodes
	useEffect(() => {
		if (selectOrigin && selectTerminus && world) {
			nodes.map(({ node, obj }) => {
				if (obj && selectorRect.containsPoint(obj.getGlobalPosition())) {
					setSelected(prev => {
						const isAlreadySelected = !!prev.find(({ node: prevSelection }) => prevSelection.id === node.id);
						if (isAlreadySelected) { return prev; }
						return [...prev, { node, obj }];
					});
				}
			});

			console.log("selected: ", selected);
			setSelectOrigin(null);
			setSelectTerminus(null);
		} else {
			selectorRect.clear();
		}
	}, [nodes, selectOrigin, selectorRect, selectTerminus, world, selected]);

	const selectedRect = useMemo(() => {
		const prev = world?.children
			.find(child => child.name === "selectedRect" && child instanceof Graphics) as Graphics | undefined;
		const graphics = prev ?? new Graphics();
		graphics.name = "selectedRect";
		graphics.zIndex = 100;
		if (!prev) { world?.addChild(graphics); }
		return graphics;
	}, [world]);

	useEffect(() => {
		// TODO: replace with optimized bounds function (see: https://pixijs.download/dev/docs/PIXI.Graphics.html#getBounds)
		selectedRect.clear();
		nodes.map(({ node, obj }) => {
			if (obj && selected.includes({ node, obj })) {
				const bounds = obj.getBounds();
				selectedRect
					.lineStyle({ alignment: 0.5, color: selectColor, width: 2 })
					.beginFill(selectColor, 0.5)
					.drawRect(bounds.left, bounds.top, bounds.width, bounds.height);
			}
		});
	}, [nodes, selected, selectedRect]);

	useEffect(() => {
		if (world) {
			world.on("pointerdown", handlePointerDown);
			world.on("pointermove", handlePointerMove);
			world.on("pointerup", handlePointerUp);
			world.on("pointerupoutside", handlePointerUp);
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

	return { ...nodes, selected };
};