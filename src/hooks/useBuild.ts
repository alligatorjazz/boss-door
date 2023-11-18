import { Viewport } from "pixi-viewport";
import { Container, FederatedPointerEvent, Graphics, Point } from "pixi.js";
import { useCallback, useEffect, useMemo, useState } from "react";
import { BuildDot } from "../components/canvas/BuildDot";
import { Room } from "../components/canvas/Room";
import { collisionTest } from "../lib";
import { EditModeOptions } from "../types";
import { useNodes } from "./useNodes";

type UseBuildOptions = {
	world?: Container | null;
	viewport?: Viewport | null;
	enabled: boolean;
	nodes: Omit<ReturnType<typeof useNodes>, "add" | "remove">;
} & EditModeOptions

export function useBuild({ world, enabled, viewport, setCursor }: UseBuildOptions) {
	const [buildDots, setBuildDots] = useState<Graphics[] | null>();

	// disables cursor so pseudo-cursor can be enabled
	useEffect(() => {
		if (enabled && world) {
			setCursor("none");
		}
	}, [enabled, setCursor, world]);

	const pseudoCursor = useMemo(() => {
		if (viewport) {
			const graphics = BuildDot({ position: new Point(0, 0), viewport });
			graphics.name = "pseudoCursor";
			return graphics;
		}
	}, [viewport]);


	const buildRect = useMemo(() => {
		const prev = world?.children
			.find(child => child.name === "buildRect" && child instanceof Graphics) as Graphics | undefined;
		const graphics = prev ?? new Graphics();
		// graphics.position.copyFrom(buildOrigin ?? new Point(0, 0));
		graphics.name = "buildRect";
		graphics.zIndex = 100;
		if (!prev) { world?.addChild(graphics); }
		return graphics;
	}, [world]);

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
				const position = dot.position.clone();
				dot.destroy();
				return position;
			}));

			world.addChild(room);
			setBuildDots(null);
		}
	}, [buildDots, world]);

	// event handlers 
	const handleBuildPointerDown = useCallback((e: FederatedPointerEvent) => {
		if (world && enabled) {
			// const localMousePosition = e.getLocalPosition(world);
			// left mouse
			// if (e.button === 0) {
			// 	setCursor("crosshair");
			// }

			if (e.button === 1) {
				setCursor("grabbing");
				if (pseudoCursor) {
					pseudoCursor.visible = false;
				}

			}
		}

	}, [enabled, pseudoCursor, setCursor, world]);

	const handleBuildPointerMove = useCallback((e: FederatedPointerEvent) => {
		if (world && enabled && pseudoCursor) {
			if (pseudoCursor.parent != world) {
				world.addChild(pseudoCursor);
			}

			pseudoCursor.position.copyFrom(e.getLocalPosition(world));
		}
	}, [world, enabled, pseudoCursor]);

	const handleBuildPointerUp = useCallback((e: FederatedPointerEvent) => {
		if (world && enabled && pseudoCursor) {
			const localMousePosition = e.getLocalPosition(world);
			if (e.button === 0) {
				if (buildDots) {
					console.log("processing dot");
					if (collisionTest(buildDots[0], pseudoCursor) && buildDots.length > 2) {
						closeShape();
					} else {
						placeDot(localMousePosition);
					}
				} else {
					placeDot(localMousePosition, "lightblue");
				}
			}

			setCursor("none");
			pseudoCursor.visible = true;
		}
	}, [world, enabled, pseudoCursor, setCursor, buildDots, closeShape, placeDot]);

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