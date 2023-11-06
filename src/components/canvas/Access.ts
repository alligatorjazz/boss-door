import { Node } from "./Node";

export function Access(entryType: "entrance" | "exit" | "boss") {
	const node = Node({
		bgColor: "black",
		fgColor: "white",
		width: 128,
		iconText: entryType.toUpperCase(),
		shape: "circle",
	});

	return node;
}