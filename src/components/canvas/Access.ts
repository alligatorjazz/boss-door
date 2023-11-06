import { Container, Graphics, Text, TextStyle } from "pixi.js";
import { Node } from "./Node";

export function Access(entryType: "entrance" | "exit") {
	const node = Node({
		bgColor: "black",
		fgColor: "white",
		width: 64,
		iconText: entryType.toUpperCase()
	});

	return node;
}