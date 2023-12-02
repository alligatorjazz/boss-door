import { MapNodes } from "../../lib/nodes";
import { NodeObject } from "./NodeObject";

export function KeyObject(node: MapNodes<"key">) {
	const obj = NodeObject({
		bgColor: "black",
		fgColor: node.state.internal.color,
		width: 100,
		shape: "diamond",
		fontSize: 40,
		bgOffset: 0.04,
		iconText: node.displayName,
		id: node.id
	});

	return obj;
}