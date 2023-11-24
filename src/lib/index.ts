import { Container, DisplayObject, IPoint, Point} from "pixi.js";
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

export const randomColor = () => "#" + new Array(6).fill("1234567890ABCDEF".charAt(Math.floor(16 * Math.random()))).join("");

export const standardNodeWidth = 128;
export function toTitleCase(str: string) {
	return str.replace(
		/\w\S*/g,
		function (txt) {
			return txt.charAt(0).toUpperCase() + txt.substr(1).toLowerCase();
		}
	);
}

export function collisionTest(obj1: DisplayObject, obj2: DisplayObject) {
	const bounds1 = obj1.getBounds();
	const bounds2 = obj2.getBounds();

	return bounds1.x < bounds2.x + bounds2.width
		&& bounds1.x + bounds1.width > bounds2.x
		&& bounds1.y < bounds2.y + bounds2.height
		&& bounds1.y + bounds1.height > bounds2.y;
}

export function parsePoint(pt?: IPoint): string {
	if (!pt) { return "invalid"; }
	return `(${pt.x}, ${pt.y})`;
}

export function snap(x: number, step: number) {
	return Math.round(x / step) * step;
}

export function snapPoint(pt: Point, step: number | [x: number, y: number]) {
	console.log("snapping: ", pt, step);
	if (typeof step === "number") {
		return new Point(snap(pt.x, step), snap(pt.y, step));
	} else {
		return new Point(snap(pt.x, step[0]), snap(pt.y, step[1]));
	}
}

export function snapToArray(x: number, arr: number[]) {
	let lowestDifference = Number.MAX_SAFE_INTEGER;
	let target = 0;
	arr.map(value => {
		if (Math.abs(x - value) < lowestDifference) {
			lowestDifference = x - value;
			target = value;
		}
	});

	return target;
}
export function min(array: number[]) {
	let min = array[0];
	array.map((value) => {
		if (!min) {
			min = value;
		}

		if (min > value) {
			min = value;
		}
	});

	return min;
}
