import { KeyIcon } from "./KeyIcon";
import { SwitchObject } from "./SwitchObject";

type Props = { color: string; }
export function BossKey({ color }: Props) {
	const icon = KeyIcon({ bgColor: color, color: "black", horns: true });
	const node = SwitchObject({ color, icon });

	return node;
}