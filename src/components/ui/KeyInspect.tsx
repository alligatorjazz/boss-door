import { HTMLAttributes } from "react";
import { CirclePicker } from "react-color";
import Trash2 from "../../assets/feather/trash-2.svg?react";
import { InspectorHandles } from "./Inspector.lib";

interface Props extends HTMLAttributes<HTMLDivElement> {
	node: InspectorHandles<"key">;
}

// TODO: add support for icon selection
export function KeyInspect({ className, node }: Props) {
	return (
		<div className={["p-4", className].join(" ")}>
			<div className="flex flex-row gap-2 justify-between">
				<h2 className="text-lg font-bold mb-4">Key</h2>
				<button onClick={() => node.delete()}>
					<Trash2 />
				</button>
			</div>
			<div className="flex flex-col items-center gap-4">
				<div className="flex justify-between items-center gap-2">
					<label htmlFor="tag">Tag</label>
					<input className="p-1 text-black" type="text" name="tag" placeholder={"e.g. \"Small Key\""}></input>
				</div>
				<div className="flex flex-col items-center gap-2">
					<label>Color</label>
					<CirclePicker color={node.color} onChange={(res) => node.setColor(res.hex)} />
				</div>
				{/* <div className="flex flex-col items-center gap-2">
					<label>Icon</label>
					<IconPicker />
				</div> */}
			</div>
		</div>
	);
}