import { Container, FederatedPointerEvent, Graphics, Point, Rectangle } from "pixi.js";
import { useState, useMemo, useCallback, useEffect } from "react";
import { NodeHandle } from "../lib/nodes";
import { Viewport } from "pixi-viewport";
import { useNodes } from "./useNodes";
import { EditModeOptions } from "../types";

type UseSelectOptions = {
	world?: Container | null;
	viewport?: Viewport | null;
	enabled: boolean;
	nodes: Omit<ReturnType<typeof useNodes>, "add" | "remove">;
} & EditModeOptions

const selectColor = "#0253f5";
export function useSelect({ world, enabled, viewport, nodes, setCursor }: UseSelectOptions) {
	const [selectOrigin, setSelectOrigin] = useState<Point | null>(null);
	const [selectTerminus, setSelectTerminus] = useState<Point | null>(null);
	const [selected, setSelected] = useState<NodeHandle[]>([]);
	const [moveOrigin, setMoveOrigin] = useState<Point | null>(null);

	useEffect(() => {
		if (enabled && world) {
			setCursor("default");
		}

		if (!enabled) {
			setSelectOrigin(null);
			setSelectTerminus(null);
			setSelected([]);
			setMoveOrigin(null);
		}
	}, [enabled, setCursor, world]);

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
	const handleSelectPointerDown = useCallback((e: FederatedPointerEvent) => {
		if (world && enabled) {
			// left mouse
			if (e.button === 0) {
				const localMousePosition = e.getLocalPosition(world) as Point;
				const beginMovingSelection = selectedRect
					.getLocalBounds()
					.contains(localMousePosition.x, localMousePosition.y);
				if (beginMovingSelection) {
					setMoveOrigin(localMousePosition);
				} else {
					// begins selection
					setSelectOrigin(localMousePosition);
				}
			}

			if (e.button === 1) {
				setCursor("grabbing");
			}
		}

	}, [enabled, selectedRect, setCursor, world]);

	const handleSelectPointerMove = useCallback((e: FederatedPointerEvent) => {
		if (world && enabled) {

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
		}
	}, [enabled, moveOrigin, outlineSelections, selectOrigin, selected, selectorRect, viewport?.scale.x, world]);

	const handleSelectPointerUp = useCallback((e: FederatedPointerEvent) => {
		if (world && enabled) {
			setMoveOrigin(null);
			if (selectOrigin && e.button === 0) {
				setSelectTerminus(e.getLocalPosition(world) as Point);
			}

			if (e.button === 1) {
				setCursor("default");
			}
		}
	}, [enabled, selectOrigin, setCursor, world]);

	useEffect(() => {
		if (world && !world.children.includes(selectorRect)) {
			world.addChild(selectorRect);
		}
	}, [selectorRect, world]);

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

	// draws selection outlines around selected objects
	useEffect(() => {
		if (selected.length > 0) { outlineSelections(); }
	}, [nodes, outlineSelections, selected, selectedRect, world]);

	// registers event listeners
	useEffect(() => {
		if (world && enabled) {
			world.on("pointerdown", handleSelectPointerDown);
			world.on("pointermove", handleSelectPointerMove);
			world.on("pointerup", handleSelectPointerUp);
			world.on("pointerupoutside", handleSelectPointerUp);
		}
		return () => {
			world?.removeListener("pointerdown", handleSelectPointerDown);
			world?.removeListener("pointermove", handleSelectPointerMove);
			world?.removeListener("pointerup", handleSelectPointerUp);
			world?.removeListener("pointerupoutside", handleSelectPointerUp);
		};
	}, [enabled, handleSelectPointerDown, handleSelectPointerMove, handleSelectPointerUp, world]);


	return selected as ReadonlyArray<NodeHandle>;
}