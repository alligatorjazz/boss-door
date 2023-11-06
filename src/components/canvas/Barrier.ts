import { Node } from "./Node";

type Props = { color: string; label: string; };
export function Barrier({ color, label }: Props) {
	const node = Node({
		width: 128,
		fgColor: color,
		bgColor: "black",
		shape: "square",
		iconText: label,
		fontSize: 40,
		bgOffset: 0.03
	});

	return node;
}