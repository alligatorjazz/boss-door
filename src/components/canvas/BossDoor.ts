import { LockObject } from "./LockObject";
import { KeyIcon } from "./KeyIcon";

type Props = { color: string; }
export function BossDoor({ color }: Props) {
	const icon = KeyIcon({ bgColor: color, color: "black", horns: true });
	const node = LockObject({ color, icon });

	return node;
}