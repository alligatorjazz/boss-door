import { standardNodeWidth, standardNodeFontSize } from "../../lib";
import { MapNodes } from "../../lib/nodes";
import { NodeObject } from "./NodeObject";

export function LockObject(node: MapNodes<"lock">) {
	const obj = NodeObject({
		width: standardNodeWidth,
		fgColor: node.state.internal.color,
		bgColor: "black",
		shape: "square",
		fontSize: standardNodeFontSize,
		bgOffset: 0.03,
		iconText: node.displayName,
		id: node.id,
	});

	return obj;
}