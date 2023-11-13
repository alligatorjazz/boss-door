import { Container, DisplayObject } from "pixi.js";
import { useCallback, useEffect, useState } from "react";
import { MapNode, MapNodes, createNode } from "../lib/nodes";
import { TerminalObject } from "../components/canvas/TerminalObject";
import { SwitchObject } from "../components/canvas/SwitchObject";
import { BarrierObject } from "../components/canvas/BarrierObject";
export function useNodes(world?: Container | null) {
	const [nodes, setNodes] = useState<MapNode[]>([]);
	const [initialStates, setInitialStates] = useState<{ [nodeId: string]: Partial<DisplayObject> }>({});
	const [objects, setObjects] = useState<{ [nodeId: string]: DisplayObject }>({});

	// sync nodes with objects
	useEffect(() => {
		setObjects(prev => {
			const newObjects: typeof objects = {};
			for (const node of nodes) {
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
			}

			for (const nodeId in prev) {
				prev[nodeId].destroy();
			}

			return newObjects;
		});
	}, [nodes]);

	// sync objects with world 
	useEffect(() => {
		if (world) {
			for (const obj of Object.values(objects)) {
				if (!world.children.includes(obj)) {
					world.addChild(obj);
				}
			}
		}
	}, [objects, world]);

	type AddOptions<T extends MapNode["type"]> = {
		name: string,
		initialState?: MapNodes<T>["state"]["derived"] extends keyof DisplayObject ?
	}
	
	const add = useCallback(<T extends MapNode["type"]>({ name, initialState }: AddOptions<T>) => {
		setNodes(prev => {
			const newNode = createNode({ ...options, matchAgainst: prev });
			return [...prev, newNode];
		});
	}, []);

	return { add };
}