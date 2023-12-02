import { Viewport } from "pixi-viewport";
import { Container, FederatedPointerEvent, IPoint } from "pixi.js";
import { useCallback, useContext, useEffect, useMemo } from "react";
import { NodeObject } from "../components/canvas/NodeObject";
import { DungeonContext } from "../routes/Edit.lib";
import { useBindings } from "./useBindings";
import { useRooms } from "./useRooms";
import { createNode } from "../lib/nodes";
import { standardNodeFontSize, standardNodeWidth } from "../lib";

type UseKeysOptions = {
	world?: Container | null;
	viewport?: Viewport | null;
	enabled: boolean;
	roomHandles: ReturnType<typeof useRooms>;
	setCursor: (mode: string) => void;
}

// TODO: place key on room
export function useKeys({
	world,
	enabled,
	viewport,
	setCursor,
	roomHandles: { find: findRoom }
}: UseKeysOptions) {
	const { cursorOverUI, setSelected, setMode } = useContext(DungeonContext);

	// initializes cursor state
	useEffect(() => {
		if (enabled && world) {
			setCursor("none");
		}
	}, [enabled, setCursor, world]);

	const nodeCursor = useMemo(() => {
		const prev = world?.children.find(obj => obj.name === "nodeCursor") as Container | undefined;
		const container = prev ?? NodeObject({
			bgColor: "black",
			fgColor: "darkgray",
			width: standardNodeWidth,
			shape: "diamond",
			fontSize: standardNodeFontSize,
			bgOffset: 0.04,
			iconText: "",
			id: "nodeCursor"
		});
		container.zIndex = 100;
		container.alpha = 0.5;
		world?.addChild(container);
		console.log(container);
		return container;
	}, [world]);

	const syncCursor = useCallback((e: { getLocalPosition: (world: Container) => IPoint }) => {
		if (world) {
			const localMouse = e.getLocalPosition(world);
			nodeCursor.position.copyFrom(localMouse);
		}
	}, [nodeCursor.position, world]);

	// pointer events
	const handleBuildPointerDown = useCallback((e: FederatedPointerEvent) => {
		if (world && enabled) {
			if (e.button === 1) {
				setCursor("grabbing");
				nodeCursor.visible = false;
			} else if (e.button === 0) {
				setCursor("none");
			} else {
				setCursor("default");
			}
		}
	}, [enabled, nodeCursor, setCursor, world]);

	const handleBuildPointerMove = useCallback((e: FederatedPointerEvent) => {
		if (world && enabled && viewport) {
			if (e.button === 1) {
				setCursor("grabbing");
			} else {
				syncCursor(e);
			}
		}
	}, [world, enabled, viewport, setCursor, syncCursor]);

	const handleBuildPointerUp = useCallback((e: FederatedPointerEvent) => {
		if (world && viewport && enabled && !cursorOverUI) {
			// node placement code here
			if (e.button === 1) {
				setCursor("none");
				nodeCursor.visible = true;
			} else {
				// check for room placement
				const roomTarget = findRoom(room => room.obj.getBounds().intersects(
					nodeCursor.getBounds()
				));
				if (roomTarget) {
					const newNode = createNode({ type: "key" });
					setMode(() => {
						roomTarget.set(prev => {
							const nodes = Array.from(new Set([...prev.nodes, newNode]));
							const newRoom = { ...prev, nodes };
							setSelected([{...roomTarget, data: newRoom}]);
							return newRoom;
						});
						return "move";
					});
				}
			}
		}
	}, [world, viewport, enabled, cursorOverUI, setCursor, nodeCursor, findRoom, setSelected, setMode]);

	// key events
	const bind = useBindings();
	useEffect(() => {
		bind("escape", () => { });
	}, [bind]);

	// registers event listeners
	useEffect(() => {
		if (world && enabled) {
			world.on("pointerdown", handleBuildPointerDown);
			world.on("pointerup", handleBuildPointerUp);
			world.on("pointermove", handleBuildPointerMove);
			world.on("pointerupoutside", handleBuildPointerUp);
			world.on("wheel", syncCursor);
			nodeCursor.visible = true;
		} else {
			nodeCursor.visible = false;
		}

		return () => {
			world?.removeListener("pointerdown", handleBuildPointerDown);
			world?.removeListener("pointerup", handleBuildPointerUp);
			world?.removeListener("pointermove", handleBuildPointerMove);
			world?.removeListener("pointerupoutside", handleBuildPointerUp);
			world?.removeListener("wheel", syncCursor);
		};
	}, [enabled, handleBuildPointerDown, handleBuildPointerMove, handleBuildPointerUp, nodeCursor, syncCursor, world]);
}