import { useCallback, useMemo, useState } from "react";
import { Terminal } from "../components/canvas/Terminal";
import { randomColor } from "../lib";
import { Barrier, Boss, Entrance, Goal, Key, Lock, Node, NodePairMatch, NodeType, Nodes, Switch, } from "../types/nodes";
import { BarrierObject } from "../components/canvas/BarrierObject";
import { SwitchObject } from "../components/canvas/SwitchObject";

export function useNodes() {
	const [nodes, setNodes] = useState<Node[]>([]);
	const nextId = useMemo(() => {
		let id = crypto.randomUUID();
		// loops through node list until it finds unused id, prevents id collision
		while (nodes.find(node => node.id === id)) {
			id = crypto.randomUUID();
		}

		return id;
	}, [nodes]);

	const create = useCallback(<T extends NodeType>(type: T, nodeName: string): Nodes<T> => {
		const name = nodeName ?? (nodes.length + 1).toString();
		const tracked = ["position" as const];
		const id = nextId;
		let node: Node;

		switch (type) {
			case "entrance": {
				const data: Entrance = {
					type,
					name,
					id,
					tracked,
					obj: Terminal("entrance")
				};
				node = data;
				break;
			}
			case "key": {
				// attempt to find an existing lock with no key attached
				const autoMatch = nodes.find(node => {
					if (node.type === "lock" && !node.keyId) {
						const match: NodePairMatch<"key"> = { color: node.color, lockId: node.id };
						return match;
					}
				}) as NodePairMatch<"key"> | undefined;

				const color = autoMatch?.color ?? randomColor();
				const data: Key = {
					type,
					name,
					id,
					tracked,
					color,
					lockId: autoMatch?.lockId,
					obj: SwitchObject({ color, iconText: name })
				};
				node = data;
				break;
			}
			case "lock": {
				// attempt to find an existing key with no lock attached
				const autoMatch = nodes.find(node => {
					if (node.type === "key" && !node.lockId) {
						const match: NodePairMatch<"lock"> = { color: node.color, keyId: node.id };
						return match;
					}
				}) as NodePairMatch<"lock"> | undefined;
				const color = autoMatch?.color ?? randomColor();
				const data: Lock = {
					type,
					name,
					id,
					tracked,
					color,
					keyId: autoMatch?.keyId,
					obj: BarrierObject({ color, iconText: name })
				};

				node = data;
				break;
			}
			case "switch": {
				// attempt to find an existing lock with no key attached
				const autoMatch = nodes.find(node => {
					if (node.type === "barrier" && !node.switchId) {
						const match: NodePairMatch<"switch"> = { color: node.color, barrierId: node.id };
						return match;
					}
				}) as NodePairMatch<"switch"> | undefined;

				const color = autoMatch?.color ?? randomColor();
				const data: Switch = {
					type,
					name,
					id,
					tracked,
					color,
					barrierId: autoMatch?.barrierId,
					obj: SwitchObject({ color, iconText: name })
				};
				node = data;
				break;
			}
			case "barrier": {
				// attempt to find an existing key with no lock attached
				const autoMatch = nodes.find(node => {
					if (node.type === "switch" && !node.barrierId) {
						const match: NodePairMatch<"barrier"> = { color: node.color, switchId: node.id };
						return match;
					}
				}) as NodePairMatch<"barrier"> | undefined;
				const color = autoMatch?.color ?? randomColor();
				const data: Barrier = {
					type,
					name,
					id,
					tracked,
					color,
					switchId: autoMatch?.switchId,
					obj: BarrierObject({ color, iconText: name })
				};

				node = data;
				break;
			}
			case "boss": {
				const data: Boss = {
					type,
					name,
					id,
					tracked,
					obj: Terminal(type)
				};
				node = data;
				break;
			}
			case "goal": {
				const data: Goal = {
					type,
					name,
					id,
					tracked,
					obj: Terminal(type)
				};
				node = data;
				break;
			}

			default: {
				throw new Error("Could not create node.");
			}
		}
		setNodes(prev => [...prev, node]);
		return node as Nodes<T>;
	}, [nextId, nodes]);
}