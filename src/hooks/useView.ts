import { useCallback } from "react";
import { BuildActions, CanvasOptions } from "../types";
import { useCanvas } from "./useCanvas";
import { useNodes } from "./useNodes";
import { Container, DisplayObject } from "pixi.js";
import { Viewport } from "pixi-viewport";

interface Props extends CanvasOptions { }
export const useView = (props: Props): {
	draw: (cb: (actions: BuildActions) => void) => void;
	viewport?: Viewport | null;
	world?: Container<DisplayObject> | null;
	setCursor: (mode: string) => void;
	nodes: Omit<ReturnType<typeof useNodes>, "add" | "remove" | "removeAll">
} => {
	const { viewport, world, setCursor } = useCanvas(props);
	const { add, remove, removeAll, ...nodes } = useNodes(world);


	const draw = useCallback((cb: (actions: BuildActions) => void) => {
		if (world) {
			cb({ add, remove, removeAll });
		}
	}, [add, remove, removeAll, world]);


	return { draw, viewport, world, setCursor, nodes };
};