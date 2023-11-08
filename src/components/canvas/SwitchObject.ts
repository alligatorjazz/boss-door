import { Graphics, Sprite } from "pixi.js";
import { NodeObject } from "./NodeObject";

type Props = { color: string; } & ({ iconText: string; } | { icon: Graphics | Sprite });
export function SwitchObject({ color, ...otherProps }: Props) {
	const node = NodeObject({
		bgColor: "black",
		fgColor: color,
		width: 100,
		shape: "diamond",
		fontSize: 40,
		bgOffset: 0.04,
		...otherProps
	});

	return node;
}