import { DisplayObject } from "pixi.js";
import { useCallback } from "react";
import { LockObject } from "../components/canvas/LockObject";
import { KeyObject } from "../components/canvas/KeyObject";
import { TerminalObject } from "../components/canvas/TerminalObject";
import { MapNode, MapNodes, NodeHandle, createNode } from "../lib/nodes";
import { useRooms } from "./useRooms";
import { usePaths } from "./usePaths";

type UseNodesOptions = {
	world?: Container | null;
	roomHandles: ReturnType<typeof useRooms>;
	pathHandles: ReturnType<typeof usePaths>;
}

export function useNodes({ roomHandles, pathHandles }: UseNodesOptions) {
	const getObject = useCallback((node: MapNode): DisplayObject => {
		let obj: DisplayObject;
		switch (node.type) {
			case "entrance": {
				obj = TerminalObject(node);
				break;
			}
			case "objective": {
				obj = TerminalObject(node);
				break;
			}
			case "key": {
				obj = KeyObject(node);
				break;
			}
			case "lock": {
				obj = LockObject(node);
				break;
			}
		}

		return obj;
	}, []);

	// const getImage = useCallback

	return { create };
}