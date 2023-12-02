import { HTMLAttributes } from "react";
import { CirclePicker } from "react-color";
import Trash2 from "../../assets/feather/trash-2.svg?react";
import { InspectorHandles } from "./Inspector.lib";

interface Props extends HTMLAttributes<HTMLDivElement> {
	nodeInspect: InspectorHandles<"key">;
}

// TODO: add support for icon selection
export function KeyInspect({ className, nodeInspect }: Props) {
	return (
		<div className={["p-4", className].join(" ")}>
			<div className="flex flex-row gap-2 justify-between">
				<h2 className="text-lg font-bold mb-4">Key</h2>
				<button onClick={() => nodeInspect.delete()}>
					<Trash2 />
				</button>
			</div>
			<div className="flex flex-col items-center gap-4">
				<div className="flex justify-between items-center gap-2">
					<label htmlFor="tag">Tag</label>
					<input
						value={nodeInspect.tag}
						className="p-1 text-black"
						type="text"
						name="tag"
						placeholder={"e.g. \"Small Key\""}
						onChange={(e) => nodeInspect.setTag(e.target.value)}
					></input>
				</div>
				<div className="flex flex-col items-center gap-2">
					<label>Color</label>
					<CirclePicker color={nodeInspect.color} onChange={(res) => nodeInspect.setColor(res.hex)} />
				</div>
			</div>
		</div>
	);
}