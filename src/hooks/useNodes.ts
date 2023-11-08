import { DisplayObject } from "pixi.js";
import { useCallback, useMemo, useState } from "react";
import { Terminal } from "../components/canvas/Terminal";
import { randomColor } from "../lib";



export function useNodes() {
	const [nodes, setNodes] = useState<Node[]>([]);
	const nextId = useMemo(() => {
		let id = crypto.randomUUID();
		// loops through node list until it finds unused id, prevents id collision
		while (nodes.find(node => node.meta.id === id)) {
			id = crypto.randomUUID();
		}

		return id;
	}, [nodes]);

	const create = useCallback(({ type, name }: Omit<Node["meta"], "name"> & { name?: string }): Node => {
		if (type == "entrance" || type == "objective" || type == "boss") {
			const node: TerminalNode = {
				meta: { type, name: name ?? (nodes.length + 1).toString(), id: nextId },
				obj: Terminal(type)
			};

			setNodes(prev => [...prev, node]);
			return node;
		}

		if (type === "key") {
			// try to find a lock with no key to automatically match to
			const refLock: LockNode | undefined = nodes.find(node => {
				if (node.meta.type === "lock") {
					const n = node;
				}
			});

			const node: KeyNode = {
				meta: { type, ...(refLock ? { lockId: refLock.meta.id, color: refLock.meta.} : { lockId: null, color: randomColor() }) }
			}
		}
	}, []);
}