import { ExtendedGraphics } from "pixi-extended-graphics";
import { Viewport } from "pixi-viewport";
import { Container, FederatedPointerEvent, Graphics, IPoint, IPointData, LINE_JOIN, Point, Sprite } from "pixi.js";
import { useCallback, useContext, useEffect, useMemo, useState } from "react";
import { BuildDot } from "../components/canvas/BuildDot";
import { Pen } from "../components/canvas/Pen";
import { collisionTest, interpolatePoint, snapPointToArray } from "../lib";
import { DungeonContext } from "../routes/Edit.lib";
import { useBindings } from "./useBindings";
import { usePaths } from "./usePaths";
import { useRooms } from "./useRooms";

type UsePenOptions = {
	world?: Container | null;
	viewport?: Viewport | null;
	enabled: boolean;
	roomHandles: ReturnType<typeof useRooms>;
	pathHandles: ReturnType<typeof usePaths>;
	setCursor: (mode: string) => void;
}
export function usePen({ world, enabled, viewport, setCursor, roomHandles: { find: findRoom, map: mapRooms }, pathHandles: { link } }: UsePenOptions) {
	const [pathDots, setPathDots] = useState<{ roomId: string, dot: Graphics }[] | null>();
	const [snapEnabled] = useState(true);
	const [snapPoints, setSnapPoints] = useState<{ roomId: string, point: IPointData }[]>([]);
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

	const placeDot = useCallback((position: Point, roomId: string, color?: string) => {
		if (world && viewport) {
			const dot = BuildDot({ position, color, viewport });
			dot.name = "pathDot";
			setPathDots(prev => {
				try {
					if (prev) {
						world.addChild(dot);
						return [...prev, { roomId, dot }];
					} else {
						world.addChild(dot);
						return [{ roomId, dot }];
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
			const dotBounds = pathDots[0].dot.getLocalBounds();
			const offset = new Point(dotBounds.width / 2, dotBounds.width / 2);
			placementLine.clear().lineStyle({ alignment: 0.5, width: 5, color: "ghostwhite", join: LINE_JOIN.ROUND });
			placementLine.moveToPoint(pathDots[pathDots.length - 1].dot.position.subtract(offset));
			placementLine.dashedLineToPoint(penCursor.position, 10, 2);
		} else {
			placementLine.clear();
		}
	}, [pathDots, placementLine, penCursor]);

	// recalculates valid snap points based on number of roomHandles 
	useEffect(() => {
		setSnapPoints(() => {
			// get a list of all snap points: 
			// corners, edges @ 33%, edges @ 50%, edges @66%, edges @75%
			const points: (typeof snapPoints) = [];
			mapRooms(({ data, obj }) => {
				const edgePoints: IPointData[] = [];
				const worldPoints = data.points.map(pt => obj.position.add(pt));
				worldPoints.map((current, index) => {
					if (index < data.points.length - 1) {
						const next = worldPoints[index + 1];
						edgePoints.push(
							interpolatePoint(current, next, 0.33),
							interpolatePoint(current, next, 0.50),
							interpolatePoint(current, next, 0.66),
							interpolatePoint(current, next, 0.75),
						);
					} else {
						// handles case for final point => first point
						edgePoints.push(
							interpolatePoint(current, worldPoints[0], 0.33),
							interpolatePoint(current, worldPoints[0], 0.50),
							interpolatePoint(current, worldPoints[0], 0.66),
							interpolatePoint(current, worldPoints[0], 0.75),
						);
					}
				});

				points.push(...worldPoints.map(point => ({ roomId: data.id, point })));
				points.push(...edgePoints.map(point => ({ roomId: data.id, point })));
				return null;
			});
			return points;
		});
	}, [mapRooms]);

	const syncCursor = useCallback((e: { getLocalPosition: (world: Container) => IPoint }) => {
		if (world && penCursor) {
			const localMouse = e.getLocalPosition(world);
			if (snapEnabled) {
				const closestSnap = snapPointToArray(localMouse, snapPoints.map((({ point }) => point)));
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
			const { roomId: id1, dot: dot1 } = pathDots[0];
			const { roomId: id2, dot: dot2 } = pathDots[1];

			const room1 = findRoom(({ data }) => data.id === id1);
			const room2 = findRoom(({ data }) => data.id === id2);
			const offset: IPointData = { x: referenceRadius, y: referenceRadius };
			if (!(room1 && room2)) {
				throw new Error(`Error: Rooms ${[room1, room2].filter(r => !r)} do not exist.`);
			}

			const link1 = room1.obj.toLocal(dot1).subtract(offset);
			const link2 = room2.obj.toLocal(dot2).subtract(offset);

			link([
				{
					roomId: id1,
					point: link1
				},
				{
					roomId: id2,
					point: link2
				}
			]);
			setPathDots(null);
		}
	}, [world, pathDots, viewport, link, findRoom]);

	// pointer events
	const handleBuildPointerDown = useCallback((e: FederatedPointerEvent) => {
		if (world && enabled) {
			if (e.button === 1) {
				setCursor("grabbing");
				if (penCursor) {
					penCursor.visible = false;
				}

			} else {
				setCursor("none");
			}
		}
	}, [enabled, penCursor, setCursor, world]);

	const handleBuildPointerMove = useCallback((e: FederatedPointerEvent) => {
		if (e.button != 1) {
			setCursor("none");
		}
		
		if (world && enabled && penCursor && viewport) {
			if (penCursor.parent != world) { world.addChild(penCursor); }
			syncCursor(e);
			drawPlacementLine();
		}
	}, [world, enabled, penCursor, viewport, setCursor, syncCursor, drawPlacementLine]);

	const handleBuildPointerUp = useCallback((e: FederatedPointerEvent) => {
		if (world && viewport && enabled && penCursor && !cursorOverUI) {
			const referenceRadius = 8 * viewport.scale.x;
			if (e.button === 0) {
				const closestSnap = snapPointToArray(penCursor.position, snapPoints.map((({ point }) => point)));
				const closestRoomId = snapPoints.find(({ point }) =>
					point.x === closestSnap.point.x && point.y === closestSnap.point.y
				)?.roomId;
				try {
					if (!closestRoomId) {
						throw new Error("Cannot draw path to nothing.");
					}

					if (pathDots && pathDots.length > 0) {
						if (collisionTest(pathDots[0].dot, penCursor) && pathDots.length > 2) {
							placementLine.clear();
						} else {
							placeDot(penCursor.position.add(new Point(referenceRadius, referenceRadius)), closestRoomId);
						}
					} else {
						placeDot(penCursor.position.add(new Point(referenceRadius, referenceRadius)), closestRoomId);
					}
				} catch (err) {
					console.error(err);
				}

			}
			penCursor.visible = true;
		}
	}, [world, viewport, enabled, penCursor, cursorOverUI, snapPoints, pathDots, placementLine, placeDot]);

	// key events
	const bind = useBindings();
	useEffect(() => {
		bind("escape", () => { setPathDots(null); placementLine.clear(); });
	}, [bind, placementLine]);

	// deletes build dots on mode change
	useEffect(() => {
		if (!enabled) {
			pathDots?.map(({ dot }) => dot.destroy());
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
					.filter(obj => !pathDots.find(({ dot }) => dot == obj))
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