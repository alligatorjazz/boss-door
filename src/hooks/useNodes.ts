import { Container, DisplayObject } from "pixi.js";
import { useCallback, useEffect, useState } from "react";
import { MapNode, createNode } from "../lib/nodes";
import { TerminalObject } from "../components/canvas/TerminalObject";
import { SwitchObject } from "../components/canvas/SwitchObject";
import { BarrierObject } from "../components/canvas/BarrierObject";
export function useNodes(world?: Container | null) {
	const [nodes, setNodes] = useState<MapNode[]>([]);
	const [objects, setObjects] = useState<{ [nodeId: string]: DisplayObject }>({});

	// sync nodes with objects
	useEffect(() => {
		setObjects(prev => {
			const newObjects: typeof objects = {};
			for (const node of nodes) {
				switch (node.type) {
					case "entrance": {
						newObjects[node.id] = TerminalObject(node);
						break;
					}
					case "objective": {
						newObjects[node.id] = TerminalObject(node);
						break;
					}
					case "switch": {
						newObjects[node.id] = SwitchObject(node);
						break;
					}
					case "barrier": {
						newObjects[node.id] = BarrierObject(node);
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

	type AddOptions = { name: string, type: MapNode["type"] }
	const add = useCallback((options: AddOptions) => {
		setNodes(prev => {
			const newNode = createNode({ ...options, matchAgainst: prev });
			return [...prev, newNode];
		});
	}, []);

	return { add };
}