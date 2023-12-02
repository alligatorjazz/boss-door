import { standardNodeFontSize, standardNodeWidth } from "../../lib";
import { MapNodes } from "../../lib/nodes";
import { NodeObject } from "./NodeObject";

export function KeyObject(node: MapNodes<"key">) {
	const obj = NodeObject({
		bgColor: "black",
		fgColor: node.state.internal.color,
		width: standardNodeWidth,
		shape: "diamond",
		fontSize: standardNodeFontSize,
		bgOffset: 0.04,
		iconText: node.state.internal.tag?? "K",
		id: node.id
	});

	return obj;
}