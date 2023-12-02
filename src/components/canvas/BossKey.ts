import { KeyIcon } from "./KeyIcon";
import { KeyObject } from "./KeyObject";

type Props = { color: string; }
export function BossKey({ color }: Props) {
	const icon = KeyIcon({ bgColor: color, color: "black", horns: true });
	const node = KeyObject({ color, icon });

	return node;
}