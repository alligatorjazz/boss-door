import { Container, DisplayObject } from "pixi.js";
import { useCallback, useEffect, useState } from "react";
import { BarrierObject } from "../components/canvas/BarrierObject";
import { SwitchObject } from "../components/canvas/SwitchObject";
import { TerminalObject } from "../components/canvas/TerminalObject";
import { MapNode, MapNodes, createNode } from "../lib/nodes";

type AddOptions<T extends MapNode["type"]> = {
	name: string,
	initialState?: MapNodes<T>["state"]["derived"] extends keyof DisplayObject ?
	{ [key in MapNodes<T>["state"]["derived"]]: DisplayObject[key] } : never
}

export function useNodes(world?: Container | null) {
	const [nodes, setNodes] = useState<MapNode[]>([]);
	const [initialStates, setInitialStates] = useState<{ [nodeId: string]: Partial<DisplayObject> | null }>({});
	const [objects, setObjects] = useState<{ [nodeId: string]: DisplayObject }>({});

	// sync nodes with objects
	useEffect(() => {
		setObjects(prevObjects => {
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

				// load initial state if it exists
				if (initialStates[node.id]) {
					obj = { ...obj, ...initialStates[node.id] } as DisplayObject;
					// delete initial state once used
					setInitialStates(prevStates => ({ ...prevStates, [node.id]: null }));
				}

				// TODO: test initial state loading
				newObjects[node.id] = obj;
			}

			for (const nodeId in prevObjects) {
				prevObjects[nodeId].destroy();
			}

			return newObjects;
		});
	}, [initialStates, nodes]);

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

	const add = useCallback(<T extends MapNode["type"]>(type: MapNode["type"], { name, initialState }: AddOptions<T>) => {
		setNodes(prevNodes => {
			const newNode = createNode({ type, name, matchAgainst: prevNodes });
			if (initialState) {
				setInitialStates(prevStates => ({ ...prevStates, [newNode.id]: initialState }));
			}

			return [...prevNodes, newNode];
		});
	}, []);

	return { add };
}