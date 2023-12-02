import { Container, DisplayObject, IPoint, IPointData, Point } from "pixi.js";
import polylabel from "polylabel";
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

export const standardNodeWidth = 64;
export const standardNodeFontSize = 24;
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

export function snapPointToArray(pt: IPointData, arr: IPointData[]) {
	let lowestDistance = Number.MAX_SAFE_INTEGER;
	let target = pt;
	arr.map(dest => {
		const distance = Math.sqrt((dest.x - pt.x) ** 2 + (dest.y - pt.y) ** 2);
		if (Math.abs(distance) < lowestDistance) {
			lowestDistance = distance;
			target = dest;
		}
	});

	return { point: target, distance: lowestDistance };
}

export function interpolatePoint(p1: IPointData, p2: IPointData, t: number): IPointData {
	if (t < 0 || t > 1) {
		throw new Error("Parameter 't' must be between 0 and 1 inclusive.");
	}

	const x = p1.x + (p2.x - p1.x) * t;
	const y = p1.y + (p2.y - p1.y) * t;

	return { x, y };
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

export function max(array: number[]) {
	let max = array[0];
	array.map((value) => {
		if (!max) {
			max = value;
		}

		if (max < value) {
			max = value;
		}
	});

	return max;
}

export function calculateMidpoint(point1: IPointData, point2: IPointData): IPointData {
	const midpoint = {
		x: (point1.x + point2.x) / 2,
		y: (point1.y + point2.y) / 2,
	};
	return midpoint;
}

export function getInaccessibilityPole(points: IPointData[]) {
	const arrayPoints = points.map(point => [point.x, point.y]);
	const pole = polylabel([arrayPoints]);
	return new Point(pole[0], pole[1]);
}

// export function toTitleCase(str: string) {
// 	return str.replace(
// 		/\w\S*/g,
// 		(txt: string) => {
// 			return txt.charAt(0).toUpperCase() + txt.substr(1).toLowerCase();
// 		}
// 	);
// }