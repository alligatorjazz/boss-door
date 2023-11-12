import { Container } from "pixi.js";
import { useCallback, useEffect, useState } from "react";
import { BarrierObject } from "../components/canvas/BarrierObject";
import { SwitchObject } from "../components/canvas/SwitchObject";
import { Terminal } from "../components/canvas/Terminal";
import { randomColor, toTitleCase } from "../lib";
import { Barrier, Boss, Entrance, Goal, Key, Lock, MapNode, MapNodeType, MapNodes, NodePairMatch, Switch } from "../lib/nodes";

export function useNodes(world?: Container | null) {
	const [nodes, setNodes] = useState<MapNode[]>([]);

	// const addNode = useCallback((newNode: MapNode) => {
	// 	const collision = nodes.find(node => node.id == newNode.id);
	// 	console.log(`checking id: ${collision?.id} | ${newNode.id}`);
	// 	if (!collision) {
	// 		setNodes(prev => [...prev, newNode]);
	// 	} else {
	// 		console.warn("Attempt to add node failed - name collision.");
	// 		console.trace();
	// 	}
	// }, [nodes]);

	

	useEffect(() => {
		if (world) {
			console.log("useNodes/useEffect: syncing nodes with world");

			nodes.map(node => {
				if (!world.children.includes(node.obj)) {
					world.addChild(node.obj);
				}
			});
		}
	}, [nodes, world]);

	return { nodes, createNode };
}