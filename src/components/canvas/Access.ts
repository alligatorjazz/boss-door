import { standardNodeWidth } from "../../lib";
import { NodeObject } from "./NodeObject";

export function Access(entryType: "entrance" | "exit" | "boss") {
	const node = NodeObject({
		bgColor: "black",
		fgColor: "white",
		width: standardNodeWidth,
		iconText: entryType.toUpperCase(),
		shape: "circle",
	});

	return node;
}