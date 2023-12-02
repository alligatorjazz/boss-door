import { HTMLAttributes, useContext, useMemo } from "react";
import { useRooms } from "../../hooks/useRooms";
import { RoomHandle } from "../../lib/rooms";
import { DungeonContext } from "../../routes/Edit.lib";
import { CSSDimension } from "../../types";
import { InspectorHandles } from "./Inspector.lib";
import { RoomInspect } from "./RoomInspect";

interface Props extends HTMLAttributes<HTMLDivElement> {
	enabled: boolean;
	width: CSSDimension;
	roomHandles: ReturnType<typeof useRooms>;
}

export function Inspector({ enabled, width, className, roomHandles }: Props) {
	const { selected } = useContext(DungeonContext);
	const modules = useMemo(() => selected.map((target, index) => {
		const room = roomHandles.find(handle => handle.data.id === target.data.id) as RoomHandle;
		const roomInspect: InspectorHandles<"room"> = {
			name: room.data.name ?? "",
			setName: (name: string) => { room.set(prev => ({ ...prev, name })); },
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
	}), [selected, roomHandles]);

	return (
		<div
			style={enabled ? { width } : { width: 0 }}
			className={["bg-gray-700 h-full overflow-hidden transition-all pointer-events-auto", className].join(" ")}
		>
			{modules}
		</div>
	);
}