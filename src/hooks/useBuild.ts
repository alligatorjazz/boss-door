import { Viewport } from "pixi-viewport";
import { Container, FederatedPointerEvent, Graphics, Point } from "pixi.js";
import { useCallback, useContext, useEffect, useMemo, useState } from "react";
import { BuildDot } from "../components/canvas/BuildDot";
import { Room } from "../components/canvas/Room";
import { collisionTest, snap, snapToArray } from "../lib";
import { DungeonContext } from "../routes/Edit/Index.lib";
import { Grid } from "../types";
import { useBindings } from "./useBindings";
import { useNodes } from "./useNodes";

type UseBuildOptions = {
	world?: Container | null;
	viewport?: Viewport | null;
	enabled: boolean;
	nodes: Omit<ReturnType<typeof useNodes>, "add" | "remove" | "removeAll">;
	minCellSize: number;
	setCursor: (mode: string) => void;
}

export function useBuild({ world, enabled, viewport, minCellSize, setCursor }: UseBuildOptions) {
	const [buildDots, setBuildDots] = useState<Graphics[] | null>();
	const [snapEnabled, _setSnapEnabled] = useState(true);
	// TODO: connect to useGrid and enable adaptive snap
	const { cursorOverUI } = useContext(DungeonContext);

	// disables cursor so pseudo-cursor can be enabled
	useEffect(() => {
		if (enabled && world) {
			setCursor("none");
		}
	}, [enabled, setCursor, world]);

	const pseudoCursor = useMemo(() => {
		if (viewport && world) {
			const graphics = world.children.find(obj => obj.name === "pseudoCursor")
				?? BuildDot({ position: new Point(0, 0), viewport, cursor: true });
			return graphics;
		}
	}, [viewport, world]);

	const placeDot = useCallback((position: Point, color?: string) => {
		if (world && viewport) {
			const graphics = BuildDot({ position, color, viewport });
			setBuildDots(prev => {
				world.addChild(graphics);
				if (prev) {
					return [...prev, graphics];
				} else {
					return [graphics];
				}
			});
		}
	}, [viewport, world]);

	const closeShape = useCallback(() => {
		if (buildDots && world) {
			const room = Room(buildDots.map(dot => {
				const { pivot, position } = dot;
				dot.destroy();
				return new Point(
					position.x - pivot.x,
					position.y - pivot.y
				);
			}));

			world.addChild(room);
			setBuildDots(null);
		}
	}, [buildDots, world]);

	// pointer events
	const handleBuildPointerDown = useCallback((e: FederatedPointerEvent) => {
		if (world && enabled) {
			if (e.button === 1) {
				setCursor("grabbing");
				if (pseudoCursor) {
					pseudoCursor.visible = false;
				}

			}
		}
	}, [enabled, pseudoCursor, setCursor, world]);

	const handleBuildPointerMove = useCallback((e: FederatedPointerEvent) => {
		if (world && enabled && pseudoCursor && viewport) {
			if (pseudoCursor.parent != world) { world.addChild(pseudoCursor); }
			const localMouse = e.getLocalPosition(world);

			pseudoCursor.position.copyFrom(snapEnabled ? new Point(
				snap(localMouse.x, minCellSize),
				snap(localMouse.y, minCellSize)
			) : localMouse);
		}
	}, [world, enabled, pseudoCursor, viewport, snapEnabled, minCellSize]);

	const handleBuildPointerUp = useCallback((e: FederatedPointerEvent) => {
		if (world && enabled && pseudoCursor && !cursorOverUI) {
			if (e.button === 0) {
				if (buildDots && buildDots.length > 0) {
					if (collisionTest(buildDots[0], pseudoCursor) && buildDots.length > 2) {
						closeShape();
					} else {
						placeDot(pseudoCursor.position);
					}
				} else {
					placeDot(pseudoCursor.position, "lightblue");
				}
			}

			setCursor("none");
			pseudoCursor.visible = true;
		}
	}, [world, enabled, pseudoCursor, cursorOverUI, setCursor, buildDots, closeShape, placeDot]);

	// key events
	const bind = useBindings();
	useEffect(() => {
		bind("escape", () => setBuildDots(null));
	}, [bind]);

	// deletes build dots on mode change
	useEffect(() => {
		if (!enabled) {
			buildDots?.map(dot => dot.destroy());
			setBuildDots(null);
		}
	}, [buildDots, enabled]);

	// sync with world state 
	useEffect(() => {
		if (world) {
			const worldDots = world.children.filter(obj => obj.name === "buildDot");
			if (!buildDots) {
				worldDots.map(obj => obj.destroy());
			} else {
				worldDots
					.filter(obj => !buildDots.includes(obj as Graphics))
					.map(obj => obj.destroy());
			}
		}
	}, [buildDots, world]);

	// registers event listeners
	useEffect(() => {
		if (world && enabled) {
			world.on("pointerdown", handleBuildPointerDown);
			world.on("pointerup", handleBuildPointerUp);
			world.on("pointermove", handleBuildPointerMove);
			world.on("pointerupoutside", handleBuildPointerUp);
		}

		return () => {
			world?.removeListener("pointerdown", handleBuildPointerDown);
			world?.removeListener("pointerup", handleBuildPointerUp);
			world?.removeListener("pointermove", handleBuildPointerMove);
			world?.removeListener("pointerupoutside", handleBuildPointerUp);
		};
	}, [enabled, handleBuildPointerDown, handleBuildPointerMove, handleBuildPointerUp, world]);
}