import { Viewport } from "pixi-viewport";
import { Container, FederatedPointerEvent, IPoint, IPointData } from "pixi.js";
import { useCallback, useContext, useEffect, useMemo, useState } from "react";
import { DungeonContext } from "../routes/Edit.lib";
import { WithoutDrawActions } from "../types";
import { useBindings } from "./useBindings";
import { useNodes } from "./useNodes";
import { usePaths } from "./usePaths";
import { useRooms } from "./useRooms";
import { calculateMidpoint, snapPointToArray } from "../lib";
import { MapNode } from "../lib/nodes";

type UseKeysOptions = {
	world?: Container | null;
	viewport?: Viewport | null;
	enabled: boolean;
	nodeHandles: WithoutDrawActions<ReturnType<typeof useNodes>>;
	roomHandles: ReturnType<typeof useRooms>;
	pathHandles: ReturnType<typeof usePaths>;
	setCursor: (mode: string) => void;
}
export function useKeys({
	world,
	enabled,
	viewport,
	setCursor,
	roomHandles: { map: mapRooms },
	pathHandles: { paths }
}: UseKeysOptions) {
	const [snapPoints, setSnapPoints] = useState<{ linkedId: string, point: IPointData }[]>([]);
	const [queuedNode, setQueuedNode] = useState<MapNode | null>(null);
	const { cursorOverUI } = useContext(DungeonContext);

	// initializes cursor state
	useEffect(() => {
		if (enabled && world && queuedNode) {
			setCursor("none");
		}
	}, [enabled, queuedNode, setCursor, world]);

	// recalculates valid snap points based on number of roomHandles 
	useEffect(() => {
		setSnapPoints(() => {
			const points: (typeof snapPoints) = [];
			// get list of path midpoints
			paths.map(path => {
				points.push({
					linkedId: path.id,
					point: calculateMidpoint(path.between[0].point, path.between[1].point)
				});
			});
			return points;
		});
	}, [mapRooms, paths]);

	const nodeCursor = useMemo(() => {
		const prev = world?.children.find(obj => obj.name === "nodeCursor") as Container | undefined;
		const container = prev ?? new Container();
		container.name = "nodeCursor";
		return container;
	}, [world]);

	const syncCursor = useCallback((e: { getLocalPosition: (world: Container) => IPoint }) => {
		if (world) {
			const localMouse = e.getLocalPosition(world);
			const closestSnap = snapPointToArray(localMouse, snapPoints.map((({ point }) => point)));
			if (closestSnap.distance > 50) {
				nodeCursor.position.copyFrom(localMouse);
			} else {
				nodeCursor.position.copyFrom(closestSnap.point);
			}
		}
	}, [nodeCursor.position, snapPoints, world]);

	// pointer events
	const handleBuildPointerDown = useCallback((e: FederatedPointerEvent) => {
		if (world && enabled) {
			if (e.button === 1) {
				setCursor("grabbing");
			} else if (e.button === 0 && queuedNode) {
				setCursor("none");
			} else {
				setCursor("default");
			}
		}
	}, [enabled, queuedNode, setCursor, world]);

	const handleBuildPointerMove = useCallback((e: FederatedPointerEvent) => {
		if (e.button != 1) {
			setCursor("none");
		}

		if (world && enabled && viewport) {
			if (e.button === 1) {
				setCursor("grabbing");
			} else if (e.button === 0 && queuedNode) {
				setCursor("none");
			} else {
				setCursor("default");
			}
		}
	}, [world, enabled, viewport, setCursor, queuedNode]);

	const handleBuildPointerUp = useCallback((e: FederatedPointerEvent) => {
		if (world && viewport && enabled && !cursorOverUI) {
			// node placement code here
			if (e.button === 1) {
				setCursor("grabbing");
			} else {
				setCursor("default");
			}
		}
	}, [world, viewport, enabled, cursorOverUI, setCursor]);

	// key events
	const bind = useBindings();
	useEffect(() => {
		bind("escape", () => { });
	}, [bind]);

	// sync with world state 
	useEffect(() => {

	}, [world]);

	// registers event listeners
	useEffect(() => {
		if (world && enabled) {
			world.on("pointerdown", handleBuildPointerDown);
			world.on("pointerup", handleBuildPointerUp);
			world.on("pointermove", handleBuildPointerMove);
			world.on("pointerupoutside", handleBuildPointerUp);
			world.on("wheel", syncCursor);
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