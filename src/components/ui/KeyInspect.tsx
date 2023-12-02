import { HTMLAttributes } from "react";
import { CirclePicker } from "react-color";

interface Props extends HTMLAttributes<HTMLDivElement> {
}

// TODO: add support for icon selection
export function KeyInspect({ className }: Props) {
	return (
		<div className={["p-4", className].join(" ")}>
			<h2 className="text-lg font-bold mb-4 text-center">Key</h2>
			<div className="flex flex-col items-center gap-4">
				<div className="flex justify-between items-center gap-2">
					<label htmlFor="tag">Tag</label>
					<input className="p-1 text-black" type="text" name="tag" placeholder={"e.g. \"Small Key\""}></input>
				</div>
				<div className="flex flex-col items-center gap-2">
					<label>Color</label>
					<CirclePicker />
				</div>
				{/* <div className="flex flex-col items-center gap-2">
					<label>Icon</label>
					<IconPicker />
				</div> */}
			</div>
		</div>
	);
}