import { useCallback } from "react";
import { BuildActions, CanvasOptions, WithoutBuildActions } from "../types";
import { useCanvas } from "./useCanvas";
import { useNodes } from "./useNodes";
import { Container, DisplayObject } from "pixi.js";
import { Viewport } from "pixi-viewport";
import { useRooms } from "./useRooms";

interface Props extends CanvasOptions { }
export const useView = (props: Props): {
	draw: (cb: (actions: BuildActions) => void) => void;
	viewport?: Viewport | null;
	world?: Container<DisplayObject> | null;
	setCursor: (mode: string) => void;
	nodes: WithoutBuildActions<ReturnType<typeof useNodes>>
	rooms: ReturnType<typeof useRooms>;
} => {
	const { viewport, world, setCursor } = useCanvas(props);
	const { add, remove, removeAll, ...nodes } = useNodes(world);
	const rooms = useRooms(world);

	const draw = useCallback((cb: (actions: BuildActions) => void) => {
		if (world) {
			cb({ add, remove, removeAll });
		}
	}, [add, remove, removeAll, world]);


	return { draw, viewport, world, setCursor, nodes, rooms };
};