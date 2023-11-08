import { standardNodeWidth } from "../../lib";
import { NodeObject } from "./NodeObject";

export function Terminal(entryType: "entrance"  | "exit") {
	// TODO: add case that adds flag icon when "objective" is enabled
	const node = NodeObject({
		bgColor: "black",
		fgColor: "white",
		width: standardNodeWidth,
		shape: "circle",
		iconText: entryType.toUpperCase(),
	});

	return node;
}