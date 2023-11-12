import { Container, DisplayObject } from "pixi.js";
import { MutableRefObject, ReactElement } from "react";

export function updatePixiChildren(container: Container, ...children: ReactElement[]) {
	container.removeChildren();
	for (const child of children) {
		try {
			if ("ref" in child) {
				const ref = (child.ref as MutableRefObject<object>);
				if (typeof ref.current === "object" && "prototype" in ref.current && ref.current.prototype instanceof DisplayObject) {
					container.addChild(ref.current as unknown as DisplayObject);
					continue;
				}
			}
		} catch (err) {
			console.error({ message: "Could not add child to container.", container, child, err });
		}
	}
}

export const randomColor = () => "#" + Math.floor(Math.random() * 16777215).toString(16);
export const standardNodeWidth = 128;
export function toTitleCase(str: string) {
	return str.replace(
		/\w\S*/g,
		function (txt) {
			return txt.charAt(0).toUpperCase() + txt.substr(1).toLowerCase();
		}
	);
}