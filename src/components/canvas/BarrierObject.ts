import { standardNodeWidth } from "../../lib";
import { MapNodes } from "../../lib/nodes";
import { NodeObject } from "./NodeObject";

export function BarrierObject(node: MapNodes<"barrier">) {
	const obj = NodeObject({
		width: standardNodeWidth,
		fgColor: node.state.internal.color,
		bgColor: "black",
		shape: "square",
		fontSize: 40,
		bgOffset: 0.03,
		iconText: node.displayName,
		id: node.id,
	});

	return obj;
}