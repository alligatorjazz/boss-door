import { Barrier } from "./Barrier";
import { KeyIcon } from "./KeyIcon";

type Props = { color: string; }
export function BossDoor({ color }: Props) {
	const icon = KeyIcon({ bgColor: color, color: "black", horns: true });
	const node = Barrier({ color, icon });

	return node;
}