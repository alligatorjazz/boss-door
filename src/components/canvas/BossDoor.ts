import { BarrierObject } from "./BarrierObject";
import { KeyIcon } from "./KeyIcon";

type Props = { color: string; }
export function BossDoor({ color }: Props) {
	const icon = KeyIcon({ bgColor: color, color: "black", horns: true });
	const node = BarrierObject({ color, icon });

	return node;
}