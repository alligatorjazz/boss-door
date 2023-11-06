import { NodeObject } from "./NodeObject";

export function Access(entryType: "entrance" | "exit" | "boss") {
	const node = NodeObject({
		bgColor: "black",
		fgColor: "white",
		width: 128,
		iconText: entryType.toUpperCase(),
		shape: "circle",
	});

	return node;
}