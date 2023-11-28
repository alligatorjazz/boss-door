import { segmentIntersection } from "@pixi/math-extras";
import { ExtendedGraphics } from "pixi-extended-graphics";
import { Viewport } from "pixi-viewport";
import { Container, FederatedPointerEvent, Graphics, IPoint, LINE_JOIN, Point, Sprite } from "pixi.js";
import { useCallback, useContext, useEffect, useMemo, useState } from "react";
import { BuildDot } from "../components/canvas/BuildDot";
import { collisionTest, snap } from "../lib";
import { WithoutDrawActions } from "../types";
import { useBindings } from "./useBindings";
import { useNodes } from "./useNodes";
import { useRooms } from "./useRooms";
import { DungeonContext } from "../routes/Edit.lib";
import { Pen } from "../components/canvas/Pen";

type UseBuildOptions = {
	world?: Container | null;
	viewport?: Viewport | null;
	enabled: boolean;
	nodes: WithoutDrawActions<ReturnType<typeof useNodes>>;
	minCellSize: number;
	rooms: ReturnType<typeof useRooms>;
	setCursor: (mode: string) => void;
}

export function usePaths({ world, enabled, viewport, minCellSize, setCursor, rooms }: UseBuildOptions) {
	const [buildDots, setBuildDots] = useState<Graphics[] | null>();
	const [snapEnabled, setSnapEnabled] = useState(false);
	const { cursorOverUI } = useContext(DungeonContext);

	// disables cursor so pen-cursor can be enabled
	useEffect(() => {
		if (enabled && world) {
			// setCursor("none");
		}
	}, [enabled, setCursor, world]);

	const penCursor = useMemo(() => {
		if (viewport && world) {
			const sprite = world.children.find(obj => obj.name === "penCursor")
				?? Pen();
			return sprite as Sprite;
		}
	}, [viewport, world]);

	const placeDot = useCallback((position: Point, color?: string) => {
		if (world && viewport) {
			const graphics = BuildDot({ position, color, viewport });
			setBuildDots(prev => {
				try {
					if (prev) {
						// disallow intersection
						const lines: [Point, Point][] = [];
						prev.map((dot, index) => {
							if (index < prev.length - 1) {
								lines.push([dot.position, prev[index + 1].position]);
							}
						});
						const newLine: [IPoint, IPoint] = [prev[prev.length - 1].position, position];
						for (const line of lines) {
							const intersection = segmentIntersection(line[0], line[1], newLine[0], newLine[1]);
							if (!isNaN(intersection.x) && intersection.x != newLine[0].x) {
								throw new Error("Cannot place a dot that intersects a previously drawn line.");
							}
						}
						world.addChild(graphics);
						return [...prev, graphics];
					} else {
						world.addChild(graphics);
						return [graphics];
					}
				} catch (err) {
					console.error(err);
					return prev;
				}
			});
		}
	}, [viewport, world]);

	const placementLine = useMemo(() => {
		const graphics = world?.children.find(obj => obj.name === "placementLine") as ExtendedGraphics
			?? new ExtendedGraphics();
		graphics.clear();
		graphics.name = "placementLine";
		graphics.zIndex = 100;
		world?.addChild(graphics);
		return graphics;
	}, [world]);


	const drawPlacementLine = useCallback(() => {
		if (placementLine && buildDots && buildDots.length > 0 && penCursor) {
			const dotOffset = buildDots[0].getLocalBounds();
			placementLine.clear().lineStyle({ alignment: 0.5, width: 5, color: "teal", join: LINE_JOIN.ROUND });
			placementLine.moveToPoint(buildDots[buildDots.length - 1].position
				.subtract({
					x: dotOffset.width /2,
					y: dotOffset.height /2
				})
			);
			placementLine.dashedLineToPoint(penCursor.position
				.subtract({
					x: dotOffset.width /2,
					y: dotOffset.height /2
				}), 10, 2);
		} else {
			placementLine.clear();
		}
	}, [buildDots, placementLine, penCursor]);

	// pointer events
	const handleBuildPointerDown = useCallback((e: FederatedPointerEvent) => {
		if (world && enabled) {
			if (e.button === 1) {
				setCursor("grabbing");
				if (penCursor) {
					penCursor.visible = false;
				}

			}
		}
	}, [enabled, penCursor, setCursor, world]);

	const syncCursor = useCallback((e: { getLocalPosition: (world: Container) => IPoint }) => {
		if (world && penCursor) {
			const localMouse = e.getLocalPosition(world);
			const newPoint = snapEnabled ? new Point(
				snap(localMouse.x, minCellSize),
				snap(localMouse.y, minCellSize)
			) : localMouse;
			penCursor.position.copyFrom(newPoint);
		}
	}, [minCellSize, penCursor, snapEnabled, world]);

	const handleBuildPointerMove = useCallback((e: FederatedPointerEvent) => {
		if (world && enabled && penCursor && viewport) {
			if (penCursor.parent != world) { world.addChild(penCursor); }
			syncCursor(e);
			drawPlacementLine();
		}
	}, [world, enabled, penCursor, viewport, syncCursor, drawPlacementLine]);

	const handleBuildPointerUp = useCallback((e: FederatedPointerEvent) => {
		if (world && enabled && penCursor && !cursorOverUI) {
			if (e.button === 0) {
				if (buildDots && buildDots.length > 0) {
					if (collisionTest(buildDots[0], penCursor) && buildDots.length > 2) {
						placementLine.clear();
					} else {
						placeDot(penCursor.position);
					}
				} else {
					placeDot(penCursor.position, "lightblue");
				}
			}

			setCursor("none");
			penCursor.visible = true;
		}
	}, [world, enabled, penCursor, cursorOverUI, setCursor, buildDots, placementLine, placeDot]);

	// key events
	const bind = useBindings();
	useEffect(() => {
		bind("escape", () => {
			setBuildDots(null);
			placementLine.clear();
		});
		bind("snap-start", () => setSnapEnabled(true));
		bind("snap-end", () => setSnapEnabled(false));
	}, [bind, placementLine]);

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
			world.on("wheel", syncCursor);
			penCursor?.scale.set(1);
		} else {
			penCursor?.scale.set(0);
			placementLine.clear();
		}

		return () => {
			world?.removeListener("pointerdown", handleBuildPointerDown);
			world?.removeListener("pointerup", handleBuildPointerUp);
			world?.removeListener("pointermove", handleBuildPointerMove);
			world?.removeListener("pointerupoutside", handleBuildPointerUp);
			world?.removeListener("wheel", syncCursor);
		};
	}, [enabled, handleBuildPointerDown, handleBuildPointerMove, handleBuildPointerUp, placementLine, penCursor?.scale, syncCursor, world]);
}