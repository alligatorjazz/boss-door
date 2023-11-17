import { FederatedPointerEvent, Graphics, Point, Rectangle } from "pixi.js";
import { useCallback, useEffect, useMemo, useState } from "react";
import { NodeHandle } from "../lib/nodes";
import { ViewHook } from "../types";
import { useCanvas } from "./useCanvas";
import { useNodes } from "./useNodes";

const selectColor = "#0253f5";
export type EditMode = "move" | "build";
export const useEdit: ViewHook<{ mode: EditMode }, {
	build: (cb: (actions: {
		add: ReturnType<typeof useNodes>["add"]
		remove: ReturnType<typeof useNodes>["remove"]
	}) => void) => void,
	selected: NodeHandle[]
} & Omit<ReturnType<typeof useNodes>, "add" | "remove">> = ({ mode, ...options }) => {
	const { viewport, world } = useCanvas(options);
	const { add, remove, ...nodes } = useNodes(world);
	const [selectOrigin, setSelectOrigin] = useState<Point | null>(null);
	const [selectTerminus, setSelectTerminus] = useState<Point | null>(null);
	const [selected, setSelected] = useState<NodeHandle[]>([]);
	const [moveOrigin, setMoveOrigin] = useState<Point | null>(null);

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

	const selectedRect = useMemo(() => {
		const prev = world?.children
			.find(child => child.name === "selectedRect" && child instanceof Graphics) as Graphics | undefined;
		const graphics = prev ?? new Graphics();
		graphics.name = "selectedRect";
		graphics.zIndex = 100;
		if (!prev) { world?.addChild(graphics); }
		return graphics;
	}, [world]);

	const outlineSelections = useCallback(() => {
		selectedRect.clear();
		selected.map(({ obj }) => {
			const bounds = obj.getLocalBounds();
			selectedRect
				.lineStyle({ alignment: 0.5, color: selectColor, width: 2 })
				.drawRect(
					bounds.left - obj.pivot.x + obj.position.x,
					bounds.top - obj.pivot.y + obj.position.y,
					bounds.width,
					bounds.height
				);
		});

		// draw huge rect around all selections
		if (selected.length > 1 && world) {
			const ref = {
				obj: selected[0].obj,
				bounds: selected[0].obj.getLocalBounds()
			};
			const superRect = new Rectangle(
				ref.bounds.left - ref.obj.pivot.x + ref.obj.position.x,
				ref.bounds.top - ref.obj.pivot.y + ref.obj.position.y,
				ref.bounds.width,
				ref.bounds.height
			);

			selected.slice(1).map(({ obj }) => {
				const bounds = obj.getLocalBounds();

				const objRect = new Rectangle(
					bounds.left - obj.pivot.x + obj.position.x,
					bounds.top - obj.pivot.y + obj.position.y,
					bounds.width,
					bounds.height
				);

				superRect.enlarge(objRect);
				superRect.x;
			});

			selectedRect
				.lineStyle({ alignment: 0, color: selectColor, width: 4 })
				.drawRect(
					superRect.x,
					superRect.y,
					superRect.width,
					superRect.height
				);
		}
	}, [selected, selectedRect, world]);

	// event handlers for cursors and select
	const handlePointerDown = useCallback((e: FederatedPointerEvent) => {
		if (world) {
			switch (mode) {
				case "move":
				case "build": {
					// left mouse
					if (e.button === 0) {
						const localMousePosition = e.getLocalPosition(world) as Point;
						const beginMovingSelection = selectedRect
							.getLocalBounds()
							.contains(localMousePosition.x, localMousePosition.y);
						console.log(`selected contains point: ${beginMovingSelection}`);
						if (beginMovingSelection) {
							setMoveOrigin(localMousePosition);
						} else {
							// begins selection
							setSelectOrigin(localMousePosition);
						}
					}

					if (e.button === 1) {
						world.cursor = "grabbing";
					}
					break;
				}
			}
		}

	}, [mode, selectedRect, world]);

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
					const pointer = e.getLocalPosition(world);
					if (selectOrigin) {
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

					if (!selectOrigin && moveOrigin && selected) {
						selected.map(({ obj }) => {
							obj.position.set(
								obj.position.x + e.movementX / (viewport?.scale.x ?? 1),
								obj.position.y + e.movementY / (viewport?.scale.x ?? 1)
							);
						});
						outlineSelections();
					}
					break;
				}
			}
		}
	}, [mode, moveOrigin, outlineSelections, selectOrigin, selected, selectorRect, viewport?.scale.x, world]);

	const handlePointerUp = useCallback((e: FederatedPointerEvent) => {
		if (world) {
			switch (mode) {
				case "move":
				case "build": {
					setMoveOrigin(null);
					if (selectOrigin && e.button === 0) {
						setSelectTerminus(e.getLocalPosition(world) as Point);
					}

					if (e.button === 1) {
						world.cursor = "default";
					}
					break;
				}
			}
		}
	}, [mode, selectOrigin, world]);

	// "closes" selection, adding objects under the selectorRect to the list of selected nodes
	useEffect(() => {
		if (selectOrigin && selectTerminus && world) {
			const filteredNodes = nodes
				.filter(({ obj }) => {
					const global = obj.getGlobalPosition();
					const comparePoint = new Point(
						global.x - obj.pivot.x,
						global.y - obj.pivot.y
					);
					return obj && selectorRect.containsPoint(comparePoint);
				});

			setSelected(() => {
				// TODO: add support for alt-select
				setSelectOrigin(null);
				setSelectTerminus(null);
				return filteredNodes;
			});
		} else {
			selectorRect.clear();
			selectedRect.clear();
		}
	}, [nodes, selectOrigin, selectorRect, selectTerminus, world, selectedRect]);



	// draws selected rects
	useEffect(() => {
		if (selected.length > 0) {
			outlineSelections();
		}
	}, [nodes, outlineSelections, selected, selectedRect, world]);

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


	type BuildActions = { add: typeof add, remove: typeof remove };
	const build = useCallback((cb: (actions: BuildActions) => void) => {
		if (world) {
			cb({ add, remove });
		}
	}, [add, remove, world]);


	return { build, selected, ...nodes };
};