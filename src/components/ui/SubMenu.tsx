import { HTMLAttributes } from "react";
import { CSSDimension } from "../../types";

export interface SubMenuProps extends HTMLAttributes<HTMLDivElement> {
	enabled: boolean;
	width: CSSDimension;
}

export function SubMenu({ enabled, width, className, children }: SubMenuProps) {
	return (
		<div
			style={enabled ? { width } : { width: 0 }}
			className={["bg-gray-600 h-full overflow-hidden transition-all pointer-events-auto", className].join(" ")}
		>
			{children}
		</div>
	);
}