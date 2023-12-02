import { Sprite } from "pixi.js";
import flag from "../../assets/feather/flag.svg";
import { standardNodeWidth, standardNodeFontSize } from "../../lib";
import { MapNodes } from "../../lib/nodes";
import { NodeObject } from "./NodeObject";

export function TerminalObject(node: MapNodes<"entrance"> | MapNodes<"objective">) {
	const getDisplay = (): { iconText: string } | { icon: Sprite } => {
		if (node.type === "entrance") {
			return { iconText: "ENTRANCE" };
		}

		if (node.type === "objective") {
			return node.displayName ?
				{ iconText: node.displayName } :
				{ icon: Sprite.from(flag) };
		}
		throw new Error("Invalid props passed to TerminalObject.");
	};

	// TODO: add case that adds flag icon when "objective" is enabled
	const obj = NodeObject({
		bgColor: "black",
		fgColor: "white",
		width: standardNodeWidth,
		shape: "circle",
		id: node.id,
		...getDisplay()
	});

	return obj;
}