import { MapNodes } from "../../lib/nodes";
import { NodeObject } from "./NodeObject";

export function SwitchObject(node: MapNodes<"switch">) {
	const obj = NodeObject({
		bgColor: "black",
		fgColor: node.state.internal.color,
		width: 100,
		shape: "diamond",
		fontSize: 40,
		bgOffset: 0.04,
		iconText: node.displayName
	});

	return obj;
}