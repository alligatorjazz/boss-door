import { Graphics, Sprite } from "pixi.js";
import { NodeObject } from "./NodeObject";
import { standardNodeWidth } from "../../lib";

type Props = { color: string; } & ({ iconText: string; } | { icon: Graphics | Sprite });
export function BarrierObject({ color, ...otherProps }: Props) {
	const node = NodeObject({
		width: standardNodeWidth,
		fgColor: color,
		bgColor: "black",
		shape: "square",
		fontSize: 40,
		bgOffset: 0.03,
		...otherProps
	});

	return node;
}