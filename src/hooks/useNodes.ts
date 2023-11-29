import { Container, DisplayObject } from "pixi.js";
import { ReactNode, useCallback, useEffect, useState } from "react";
import { BarrierObject } from "../components/canvas/BarrierObject";
import { SwitchObject } from "../components/canvas/SwitchObject";
import { TerminalObject } from "../components/canvas/TerminalObject";
import { MapNode, MapNodes, NodeHandle, createNode } from "../lib/nodes";

export function useNodes() {
	const createNodeObject = useCallback((node: MapNode): DisplayObject => {
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
			case "switch": {
				obj = SwitchObject(node);
				break;
			}
			case "barrier": {
				obj = BarrierObject(node);
				break;
			}
		}

		return obj;
	}, []);

	const create = useCallback(<T extends MapNode["type"]>(type: T) => {
		const data = createNode({ type }) as MapNodes<T>;
		return { data, getObject: () => createNodeObject(data) } as NodeHandle<T>;
	}, [createNodeObject]);

	return { create };
}