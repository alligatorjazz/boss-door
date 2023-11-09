import { Graphics, Sprite } from "pixi.js";
import { nodeObject } from "./nodeObject";
import { standardnodeWidth } from "../../lib";

type Props = { color: string; } & ({ iconText: string; } | { icon: Graphics | Sprite });
export function BarrierObject({ color, ...otherProps }: Props) {
	const node = nodeObject({
		width: standardnodeWidth,
		fgColor: color,
		bgColor: "black",
		shape: "square",
		fontSize: 40,
		bgOffset: 0.03,
		...otherProps
	});

	return node;
}