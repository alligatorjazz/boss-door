import { Barrier } from "./Barrier";
import { KeyIcon } from "./KeyIcon";
import { Switch } from "./Switch";

type Props = { color: string; }
export function BossKey({ color }: Props) {
	const icon = KeyIcon({ bgColor: color, color: "black", horns: true });
	const node = Switch({ color, icon });

	return node;
}