import { HTMLAttributes } from "react";
import { CSSDimension, EditMode } from "../../types";
import { toTitleCase } from "../../lib";

interface Props extends HTMLAttributes<HTMLDivElement> {
	mode: EditMode;
}
export function TopMenu({ mode, className }: Props) {
	return (
		<div className={["bg-gray-700 overflow-hidden transition-all pointer-events-auto flex flex-row items-center", className].join(" ")}>
			<div className="w-16 h-auto flex justify-center font-bold pt-2">
				{toTitleCase(mode)}
			</div>
		</div>
	);
}