import { segmentIntersection } from "@pixi/math-extras";
import { ExtendedGraphics } from "pixi-extended-graphics";
import { Viewport } from "pixi-viewport";
import { Container, FederatedPointerEvent, Graphics, IPoint, LINE_JOIN, Point } from "pixi.js";
import { useCallback, useContext, useEffect, useMemo, useState } from "react";
import { BuildDot } from "../components/canvas/BuildDot";
import { collisionTest, snap } from "../lib";
import { DungeonContext } from "../routes/Edit/Index.lib";
import { WithoutBuildActions } from "../types";
import { useBindings } from "./useBindings";
import { useNodes } from "./useNodes";
import { useRooms } from "./useRooms";

type UseBuildOptions = {
	world?: Container | null;
	viewport?: Viewport | null;
	enabled: boolean;
	nodes: WithoutBuildActions<ReturnType<typeof useNodes>>;
	minCellSize: number;
	rooms: ReturnType<typeof useRooms>;
	setCursor: (mode: string) => void;
}

export function useBuild({ world, enabled, viewport, minCellSize, setCursor, rooms }: UseBuildOptions) {
	const [buildDots, setBuildDots] = useState<Graphics[] | null>();
	const [snapEnabled, setSnapEnabled] = useState(false);
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
			return graphics as Graphics;
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
						// console.log(`lines: ${lines.map(line => line.map(pt => parsePoint(pt)))}, newline: ${newLine.map(pt => parsePoint(pt))}`);
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

	const closeShape = useCallback(() => {
		if (buildDots && world) {
			rooms.add({
				points: buildDots.map(dot => {
					const { pivot, position } = dot;
					dot.destroy();
					return new Point(
						position.x - pivot.x,
						position.y - pivot.y
					);
				})
			});
			setBuildDots(null);
		}
	}, [buildDots, rooms, world]);

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
		if (placementLine && buildDots && buildDots.length > 0 && pseudoCursor) {
			const offset = pseudoCursor.getBounds();
			placementLine.clear().lineStyle({ alignment: 0.5, width: 5, color: "teal", join: LINE_JOIN.ROUND });
			placementLine.moveToPoint(buildDots[buildDots.length - 1].position.subtract({
				x: offset.width / 2,
				y: offset.height / 2
			}));
			placementLine.dashedLineToPoint(pseudoCursor.position.subtract({
				x: offset.width / 2,
				y: offset.height / 2
			}), 10, 2);
		} else {
			placementLine.clear();
		}
	}, [buildDots, placementLine, pseudoCursor]);

	const previewLines = useMemo(() => {
		const graphics = world?.children.find(obj => obj.name === "previewLines") as ExtendedGraphics
			?? new ExtendedGraphics();
		graphics.clear();
		graphics.name = "previewLines";
		graphics.zIndex = 100;
		world?.addChild(graphics);
		return graphics;
	}, [world]);

	const drawPreviewLines = useCallback(() => {
		if (buildDots && buildDots.length > 1 && pseudoCursor) {
			const offset = pseudoCursor.getBounds();
			buildDots.map((dot, index) => {
				if (index < buildDots.length - 1) {
					previewLines.lineStyle({ alignment: 0.5, width: 5, color: "skyblue", join: LINE_JOIN.ROUND });
					previewLines.moveToPoint(dot.position.subtract({
						x: offset.width / 2,
						y: offset.height / 2
					}));
					previewLines.dashedLineToPoint(buildDots[index + 1].position.subtract({
						x: offset.width / 2,
						y: offset.height / 2
					}), 10, 2);
				}
			});
		} else {
			previewLines.clear();
		}
	}, [buildDots, previewLines, pseudoCursor]);

	useEffect(() => {
		drawPreviewLines();
	}, [buildDots, drawPreviewLines]);

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

	const syncCursor = useCallback((e: { getLocalPosition: (world: Container) => IPoint }) => {
		if (world && pseudoCursor) {
			const localMouse = e.getLocalPosition(world);
			const newPoint = snapEnabled ? new Point(
				snap(localMouse.x, minCellSize),
				snap(localMouse.y, minCellSize)
			) : localMouse;
			pseudoCursor.position.copyFrom(newPoint);
		}
	}, [minCellSize, pseudoCursor, snapEnabled, world]);

	const handleBuildPointerMove = useCallback((e: FederatedPointerEvent) => {
		if (world && enabled && pseudoCursor && viewport) {
			if (pseudoCursor.parent != world) { world.addChild(pseudoCursor); }
			syncCursor(e);
			drawPlacementLine();
		}
	}, [world, enabled, pseudoCursor, viewport, syncCursor, drawPlacementLine]);

	const handleBuildPointerUp = useCallback((e: FederatedPointerEvent) => {
		if (world && enabled && pseudoCursor && !cursorOverUI) {
			if (e.button === 0) {
				if (buildDots && buildDots.length > 0) {
					if (collisionTest(buildDots[0], pseudoCursor) && buildDots.length > 2) {
						closeShape();
						previewLines.clear();
						placementLine.clear();
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
	}, [world, enabled, pseudoCursor, cursorOverUI, setCursor, buildDots, closeShape, previewLines, placementLine, placeDot]);

	// key events
	const bind = useBindings();
	useEffect(() => {
		bind("escape", () => { 
			setBuildDots(null);
			previewLines.clear();
			placementLine.clear();
		});
		bind("snap-start", () => setSnapEnabled(true));
		bind("snap-end", () => setSnapEnabled(false));
	}, [bind, placementLine, previewLines]);

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
			pseudoCursor?.scale.set(1);
		} else {
			pseudoCursor?.scale.set(0);
			previewLines.clear();
			placementLine.clear();
		}

		return () => {
			world?.removeListener("pointerdown", handleBuildPointerDown);
			world?.removeListener("pointerup", handleBuildPointerUp);
			world?.removeListener("pointermove", handleBuildPointerMove);
			world?.removeListener("pointerupoutside", handleBuildPointerUp);
			world?.removeListener("wheel", syncCursor);
		};
	}, [enabled, handleBuildPointerDown, handleBuildPointerMove, handleBuildPointerUp, syncCursor, world]);
}