import { Graphics, Sprite } from "pixi.js";
import { Node } from "./Node";

type Props = { color: string; } & ({ iconText: string; } | { icon: Graphics | Sprite });
export function Barrier({ color, ...otherProps }: Props) {
	const node = Node({
		width: 128,
		fgColor: color,
		bgColor: "black",
		shape: "square",
		fontSize: 40,
		bgOffset: 0.03,
		...otherProps
	});

	return node;
}