import { HTMLAttributes, useContext, useMemo } from "react";
import { CSSDimension } from "../../types";
import { DungeonContext } from "../../routes/Edit.lib";
import { RoomInspect } from "./RoomInspect";
import { InspectorHandles } from "./Inspector.lib";

interface Props extends HTMLAttributes<HTMLDivElement> {
	enabled: boolean;
	width: CSSDimension;
}

export function Inspector({ enabled, width, className }: Props) {
	const { selected } = useContext(DungeonContext);
	const modules = useMemo(() => selected.map((room, index) => {
		console.log("building modules for room: ", room);
		const roomInspect: InspectorHandles<"room"> = {
			name: room.data.name ?? "",
			setName: (name: string) => room.set(prev => ({ ...prev, name })),
			delete: () => console.warn("unimplemented")
		};

		const keysInspect: InspectorHandles<"key">[] = room.data.nodes.map(node => {
			return {
				tag: node.state.internal.tag ?? "",
				setTag: (tag: string) => room.set(prev => {
					const index = prev.nodes.indexOf(node);
					const nodes = [...prev.nodes.slice(0, index), { ...node, tag }, ...prev.nodes.slice(index + 1)];
					return { ...prev, nodes };
				}),
				color: node.state.internal.color ?? "darkgray",
				setColor: (color: string) => room.set(prev => {
					const index = prev.nodes.indexOf(node);
					const nodes = [...prev.nodes.slice(0, index), { ...node, color }, ...prev.nodes.slice(index + 1)];
					return { ...prev, nodes };
				}),
				delete: () => console.warn("unimplemented")
			};
		});

		return <RoomInspect key={index} roomInspect={roomInspect} keysInspect={keysInspect} />;
	}), [selected]);

	return (
		<div
			style={enabled ? { width } : { width: 0 }}
			className={["bg-gray-700 h-full overflow-hidden transition-all pointer-events-auto", className].join(" ")}
		>
			{modules}
		</div>
	);
}