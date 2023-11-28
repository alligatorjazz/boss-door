import { segmentIntersection } from "@pixi/math-extras";
import { ExtendedGraphics } from "pixi-extended-graphics";
import { Viewport } from "pixi-viewport";
import { Container, FederatedPointerEvent, Graphics, IPoint, IPointData, LINE_JOIN, Point, Sprite } from "pixi.js";
import { useCallback, useContext, useEffect, useMemo, useState } from "react";
import { BuildDot } from "../components/canvas/BuildDot";
import { Pen } from "../components/canvas/Pen";
import { collisionTest, interpolatePoint, snapPointToArray } from "../lib";
import { DungeonContext } from "../routes/Edit.lib";
import { WithoutDrawActions } from "../types";
import { useBindings } from "./useBindings";
import { useNodes } from "./useNodes";
import { useRooms } from "./useRooms";

type UseBuildOptions = {
	world?: Container | null;
	viewport?: Viewport | null;
	enabled: boolean;
	nodes: WithoutDrawActions<ReturnType<typeof useNodes>>;
	rooms: ReturnType<typeof useRooms>;
	setCursor: (mode: string) => void;
}

export function usePaths({ world, enabled, viewport, setCursor, rooms }: UseBuildOptions) {
	// TODO: adjust for erroneous pencursor position / point placement
	const [pathDots, setPathDots] = useState<Graphics[] | null>();
	const [snapEnabled] = useState(true);
	const [snapPoints, setSnapPoints] = useState<IPointData[]>([]);
	const { cursorOverUI } = useContext(DungeonContext);

	// disables cursor so pen-cursor can be enabled
	useEffect(() => {
		if (enabled && world) {
			setCursor("none");
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
			graphics.name = "pathDot";
			setPathDots(prev => {
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
		if (placementLine && pathDots && pathDots.length > 0 && penCursor) {
			const dotBounds = pathDots[0].getLocalBounds();
			const offset = new Point(dotBounds.width / 2, dotBounds.width / 2);
			placementLine.clear().lineStyle({ alignment: 0.5, width: 5, color: "ghostwhite", join: LINE_JOIN.ROUND });
			placementLine.moveToPoint(pathDots[pathDots.length - 1].position.subtract(offset));
			placementLine.dashedLineToPoint(penCursor.position, 10, 2);
		} else {
			placementLine.clear();
		}
	}, [pathDots, placementLine, penCursor]);
	// recalculates valid snap points based on number of rooms 
	useEffect(() => {
		setSnapPoints(() => {
			// get a list of all snap points: 
			// corners, edges @ 33%, edges @ 50%, edges @66%, edges @75%
			const points: IPointData[] = [];
			rooms.map(({ room, obj }) => {
				const edgePoints: IPointData[] = [];
				const worldPoints = room.points.map(pt => obj.position.add(pt));
				worldPoints.map((current, index) => {
					if (index < room.points.length - 1) {
						const next = worldPoints[index + 1];
						edgePoints.push(
							interpolatePoint(current, next, 0.33),
							interpolatePoint(current, next, 0.50),
							interpolatePoint(current, next, 0.66),
							interpolatePoint(current, next, 0.75),
						);
					}
				});

				points.push(...worldPoints);
				points.push(...edgePoints);
				return null;
			});
			return points;
		});
	}, [rooms]);

	const syncCursor = useCallback((e: { getLocalPosition: (world: Container) => IPoint }) => {
		// TODO: implement snap-to-object
		if (world && penCursor) {
			const localMouse = e.getLocalPosition(world);
			if (snapEnabled) {
				const closestSnap = snapPointToArray(localMouse, snapPoints);
				if (closestSnap.distance > 50) {
					penCursor.position.copyFrom(localMouse);
				} else {
					penCursor.position.copyFrom(closestSnap.point);
				}
			} else {
				penCursor.position.copyFrom(localMouse);
			}
		}
	}, [penCursor, snapEnabled, snapPoints, world]);

	// "closes" path, adding permanent line to world
	useEffect(() => {
		if (pathDots && pathDots.length == 2 && world && viewport) {
			const referenceRadius = 8 * viewport.scale.x;
			const dot1 = pathDots[0];
			const dot2 = pathDots[1];
			const newPath = new ExtendedGraphics()
				.lineStyle({ alignment: 0.5, width: 4, color: "black" })
				.moveToPoint(dot1.position.subtract({ x: referenceRadius, y: referenceRadius }))
				.lineToPoint(dot2.position.subtract({ x: referenceRadius, y: referenceRadius }));
			console.log(newPath);
			world.addChild(newPath);
			setPathDots(null);
		}
	}, [world, pathDots, viewport]);

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

	const handleBuildPointerMove = useCallback((e: FederatedPointerEvent) => {
		if (world && enabled && penCursor && viewport) {
			if (penCursor.parent != world) { world.addChild(penCursor); }
			syncCursor(e);
			drawPlacementLine();
		}
	}, [world, enabled, penCursor, viewport, syncCursor, drawPlacementLine]);

	const handleBuildPointerUp = useCallback((e: FederatedPointerEvent) => {
		if (world && viewport && enabled && penCursor && !cursorOverUI) {
			const referenceRadius = 8 * viewport.scale.x;
			if (e.button === 0) {
				if (pathDots && pathDots.length > 0) {
					if (collisionTest(pathDots[0], penCursor) && pathDots.length > 2) {
						placementLine.clear();
					} else {
						placeDot(penCursor.position.add(new Point(referenceRadius, referenceRadius)));
					}
				} else {
					placeDot(penCursor.position.add(new Point(referenceRadius, referenceRadius)));
				}
			}

			// setCursor("none");
			penCursor.visible = true;
		}
	}, [world, viewport, enabled, penCursor, cursorOverUI, pathDots, placementLine, placeDot]);

	// key events
	const bind = useBindings();
	useEffect(() => {
		bind("escape", () => {
			setPathDots(null);
			placementLine.clear();
		});
	}, [bind, placementLine]);

	// deletes build dots on mode change
	useEffect(() => {
		if (!enabled) {
			pathDots?.map(dot => dot.destroy());
			setPathDots(null);
		}
	}, [pathDots, enabled]);

	// sync with world state 
	useEffect(() => {
		if (world) {
			const worldDots = world.children.filter(obj => obj.name === "pathDot");
			if (!pathDots) {
				worldDots.map(obj => obj.destroy());
			} else {
				worldDots
					.filter(obj => !pathDots.includes(obj as Graphics))
					.map(obj => obj.destroy());
			}
		}
	}, [pathDots, world]);

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