import { Container, DisplayObject } from "pixi.js";
import { useCallback, useEffect, useMemo, useState } from "react";
import { BarrierObject } from "../components/canvas/BarrierObject";
import { SwitchObject } from "../components/canvas/SwitchObject";
import { TerminalObject } from "../components/canvas/TerminalObject";
import { MapNode, MapNodes, NodeHandle, createNode } from "../lib/nodes";

type AddOptions<T extends MapNode["type"]> = {
	name: string,
	initialState?: MapNodes<T>["state"]["derived"] extends keyof DisplayObject ?
	{ [key in MapNodes<T>["state"]["derived"]]: DisplayObject[key] } : never
}

type RemoveOptions = { id: string };

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

			const newNode = createNode({ type, name, matchAgainst: prevNodes, });
			if (initialState) {
				setInitialStates(prevStates => ({ ...prevStates, [newNode.id]: initialState }));
			}

			return [...prevNodes, newNode];
		});
	}, []);

	const remove = useCallback(({ id }: RemoveOptions) => {
		setNodes(prevNodes => {
			return prevNodes.filter(node => node.id !== id);
		});
	}, []);

	const removeAll = useCallback(() => {
		console.count("remove all called");
		setNodes(() => {
			setObjects(prev => {
				Object.values(prev).map(obj => obj.destroy());
				return {};
			});
			return [];
		});
	}, []);

	const map = useCallback((cb: (handle: NodeHandle, index?: number, arr?: NodeHandle[]) => unknown) => {
		return (nodes.map(node => ({ node, obj: node.id in objects ? objects[node.id] : null })) as NodeHandle[])
			.map(cb);
	}, [nodes, objects]);

	const filter = useCallback((cb: (handle: NodeHandle, index?: number, arr?: NodeHandle[]) => boolean) => {
		return (nodes.map(node => ({ node, obj: node.id in objects ? objects[node.id] : null })) as NodeHandle[])
			.filter(cb);
	}, [nodes, objects]);

	const find = useCallback((cb: (handle: NodeHandle, index?: number, arr?: NodeHandle[]) => boolean) => {
		return (nodes.map(node => ({ node, obj: node.id in objects ? objects[node.id] : null })) as NodeHandle[])
			.find(cb);
	}, [nodes, objects]);

	return { add, remove, removeAll, objects, list: nodes, map, filter, find };
}