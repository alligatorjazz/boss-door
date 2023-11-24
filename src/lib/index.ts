import { Container, DisplayObject, Point } from "pixi.js";
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

export function pointInBoundingBox(point: Point, box: [Point, Point, Point, Point]): boolean {
	// A bounding box is formed by four points in a specific order.
	// Let's assume the points are ordered in a clockwise manner.

	// Use the shoelace formula to determine the orientation of the points.
	const orientation =
		(box[1].y - box[0].y) * (point.x - box[1].x) -
		(box[1].x - box[0].x) * (point.y - box[1].y);

	// If the orientation is not the same for all edges, the point is outside the box.
	if (orientation !== 0) {
		return false;
	}

	// Check if the point is within the x and y range of the bounding box.
	const minX = Math.min(box[0].x, box[1].x, box[2].x, box[3].x);
	const maxX = Math.max(box[0].x, box[1].x, box[2].x, box[3].x);
	const minY = Math.min(box[0].y, box[1].y, box[2].y, box[3].y);
	const maxY = Math.max(box[0].y, box[1].y, box[2].y, box[3].y);

	return point.x >= minX && point.x <= maxX && point.y >= minY && point.y <= maxY;
}


export function collisionTest(obj1: DisplayObject, obj2: DisplayObject) {
	const bounds1 = obj1.getBounds();
	const bounds2 = obj2.getBounds();

	return bounds1.x < bounds2.x + bounds2.width
		&& bounds1.x + bounds1.width > bounds2.x
		&& bounds1.y < bounds2.y + bounds2.height
		&& bounds1.y + bounds1.height > bounds2.y;
}

export function parsePoint(pt?: Point): string {
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

export function areLinesIntersecting(a1: Point, a2: Point, b1: Point, b2: Point): boolean {
	// Calculate slopes
	const slopeA = (a2.y - a1.y) / (a2.x - a1.x);
	const slopeB = (b2.y - b1.y) / (b2.x - b1.x);

	// Check if lines are parallel
	if (slopeA === slopeB) {
		return false; // Lines are parallel and do not intersect
	}

	// Calculate the intersection point
	const intersectionX = ((slopeA * a1.x - slopeB * b1.x) + b1.y - a1.y) / (slopeA - slopeB);

	// Check if the intersection point lies within the range of both line segments
	if (
		(intersectionX >= Math.min(a1.x, a2.x) && intersectionX <= Math.max(a1.x, a2.x)) &&
		(intersectionX >= Math.min(b1.x, b2.x) && intersectionX <= Math.max(b1.x, b2.x))
	) {
		return true; // Lines intersect
	} else {
		return false; // Lines do not intersect within the given segments
	}
}