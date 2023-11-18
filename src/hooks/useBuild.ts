import { Viewport } from "pixi-viewport";
import { Container, FederatedPointerEvent, Graphics, Point, Rectangle } from "pixi.js";
import { useCallback, useEffect, useMemo, useState } from "react";
import { useNodes } from "./useNodes";
import { Room } from "../components/canvas/Room";
import { BuildDot } from "../components/canvas/BuildDot";
import { collisionTest } from "../lib";

type UseBuildOptions = {
	world?: Container | null;
	viewport?: Viewport | null;
	enabled: boolean;
	nodes: Omit<ReturnType<typeof useNodes>, "add" | "remove">;
}
export function useBuild({ world, enabled, nodes }: UseBuildOptions) {
	const [buildDots, setBuildDots] = useState<Graphics[] | null>();

	// disables cursor so pseudo-cursor can be enabled
	useEffect(() => {
		if (enabled && world) {
			world.cursor = "none";
		}
	}, [enabled, world]);

	const pseudoCursor = useMemo(() => {
		const graphics = BuildDot(new Point(0, 0));
		graphics.name = "pseudoCursor";
		return graphics;
	}, []);


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
		if (world) {
			const graphics = BuildDot(position, color);
			setBuildDots(prev => {
				world.addChild(graphics);
				if (prev) {
					return [...prev, graphics];
				} else {
					return [graphics];
				}
			});
		}
	}, [world]);

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
			// 	world.cursor = "crosshair";
			// }

			if (e.button === 1) {
				world.cursor = "grabbing";
				pseudoCursor.visible = false;
			}
		}

	}, [enabled, pseudoCursor, world]);


	const handleBuildPointerMove = useCallback((e: FederatedPointerEvent) => {
		if (world && enabled) {
			if (pseudoCursor.parent != world) {
				world.addChild(pseudoCursor);
			}

			pseudoCursor.position.copyFrom(e.getLocalPosition(world));
		}
	}, [world, enabled, pseudoCursor]);

	const handleBuildPointerUp = useCallback((e: FederatedPointerEvent) => {
		if (world && enabled) {
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

			world.cursor = "none";
			pseudoCursor.visible = true;
		}
	}, [world, enabled, pseudoCursor, buildDots, closeShape, placeDot]);


	useEffect(() => {
		console.log("build dots: ", buildDots);
		if (buildDots && buildDots[0]) {

		}
	}, [buildDots, nodes, world]);

	// registers event listeners
	useEffect(() => {
		if (world && enabled) {
			world.on("pointerdown", handleBuildPointerDown);
			world.on("pointerup", handleBuildPointerUp);
			world.on("pointermove", handleBuildPointerMove);
			world.on("pointerupoutside", handleBuildPointerUp);
		}
		return () => { world?.removeAllListeners(); };
	}, [enabled, handleBuildPointerDown, handleBuildPointerMove, handleBuildPointerUp, world]);
}