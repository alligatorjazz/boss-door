import { HTMLAttributes, useEffect } from "react";
import Trash2 from "../../assets/feather/trash-2.svg?react";
import { InspectorHandles } from "./Inspector.lib";
import { KeyInspect } from "./KeyInspect";
interface Props extends HTMLAttributes<HTMLDivElement> {
	roomInspect: InspectorHandles<"room">;
	keysInspect: InspectorHandles<"key">[];
}

// TODO: add support for icon selection
export function RoomInspect({ className, roomInspect, keysInspect }: Props) {
	useEffect(() => {
		console.log(roomInspect, keysInspect);
	}, [keysInspect, roomInspect]);
	return (
		<div className={["p-4", className].join(" ")}>
			<div className="flex flex-row gap-2 justify-center items-center mb-4">
				<input
					type="text"
					className="text-center bg-slate-500"
					value={roomInspect.name}
					onChange={(e) => roomInspect.setName(e.target.value)}
				></input>
				<button onClick={() => roomInspect.delete()}>
					<Trash2 />
				</button>
			</div>
			<div className="flex flex-col items-center gap-6 p-4">
				{keysInspect.map((inspect, index) => <KeyInspect key={index} nodeInspect={inspect} />)}
			</div>
		</div>
	);
}