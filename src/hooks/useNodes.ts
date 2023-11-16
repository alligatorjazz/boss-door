import { Container, DisplayObject } from "pixi.js";
import { useCallback, useEffect, useState } from "react";
import { BarrierObject } from "../components/canvas/BarrierObject";
import { SwitchObject } from "../components/canvas/SwitchObject";
import { TerminalObject } from "../components/canvas/TerminalObject";
import { MapNode, MapNodes, NodeHandle, createNode } from "../lib/nodes";

type AddOptions = {
	name: string,
	// state?: MapNodes<T>["state"]["derived"] extends keyof DisplayObject ?
	// { [key in MapNodes<T>["state"]["derived"]]: DisplayObject[key] } : never
}

type RemoveOptions = { id: string };

export function useNodes(world?: Container | null) {
	const [nodes, setNodes] = useState<MapNode[]>([]);
	const [objects, setObjects] = useState<DisplayObject[]>([]);
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

	// sync nodes with objects
	useEffect(() => {
		setObjects(prev => {
			const newObjects: DisplayObject[] = [];
			for (const node of nodes) {
				const oldObject = prev.find(obj => obj.name === node.id);
				if (oldObject) {
					newObjects.push(oldObject);
					continue;
				}

				const obj = createNodeObject(node);
				newObjects.push(obj);
			}

			// delete objects that correspond to non-extant nodes
			for (const obj of prev.filter(obj => !newObjects.includes(obj))) {
				obj.destroy();
			}

			return newObjects;
		});

	}, [createNodeObject, nodes]);

	// sync objects with world 
	useEffect(() => {
		if (world) {
			for (const obj of objects) {
				if (!world.children.includes(obj)) {
					world.addChild(obj);
				}
			}
		}
	}, [objects, world]);

	const remove = useCallback(({ id }: RemoveOptions) => {
		setNodes(prevNodes => {
			return prevNodes.filter(node => node.id !== id);
		});
	}, []);

	const removeAll = useCallback(() => {
		console.count("remove all called");
		setNodes(() => {
			setObjects(prev => { 
				prev.map(prevObj => prevObj.destroy());
				return [];
			});
			return [];
		});
	}, []);

	const map = useCallback((cb: (handle: NodeHandle, index?: number, arr?: NodeHandle[]) => unknown) => {
		return (nodes.map(node => ({ node, obj: objects.find(obj => obj.name === node.id) })) as NodeHandle[])
			.map(cb);
	}, [nodes, objects]);

	const filter = useCallback((cb: (handle: NodeHandle, index?: number, arr?: NodeHandle[]) => boolean) => {
		return (nodes.map(node => ({ node, obj: objects.find(obj => obj.name === node.id) })) as NodeHandle[])
			.filter(cb);
	}, [nodes, objects]);

	const find = useCallback((cb: (handle: NodeHandle, index?: number, arr?: NodeHandle[]) => boolean) => {
		return (nodes.map(node => ({ node, obj: objects.find(obj => obj.name === node.id) })) as NodeHandle[])
			.find(cb);
	}, [nodes, objects]);

	const add = useCallback(<T extends MapNode["type"]>(type: T, options: AddOptions) => {
		const node = createNode({ type, ...options }) as MapNodes<T>;
		setNodes(prevNodes => [...prevNodes, node]);
		return {
			node, get obj() {
				const obj = createNodeObject(node);
				setObjects(prev => prev.filter(prevObj => prevObj.name === obj.name).concat(obj));
				return obj;
			}
		} as NodeHandle;
	}, [createNodeObject]);

	return { add, remove, removeAll, list: nodes, map, filter, find };
}