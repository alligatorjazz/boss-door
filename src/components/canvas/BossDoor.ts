import { Graphics } from "pixi.js";
import { Barrier } from "./Barrier";
import { KeyIcon } from "./KeyIcon";

type Props = { color: string; }
export function BossDoor({ color }: Props) {
	// offsets
	const o = {
		handle: -15,
		staff: { y: -5 },
		t1: { x: -5, y: -20 },
		t2: { x: -5, y: -7 },
		horns: { y: -35 },
		crop: { y: -42 }
	};

	// dimensions
	const d = {
		handle: 15,
		staff: { w: 10, h: 45 }
	};

	const icon = KeyIcon({ bgColor: color, color: "black" });
	const node = Barrier({ color, icon });

	return node;
}