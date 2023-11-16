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

export function parsePoint(pt?: Point): string {
	if (!pt) { return "invalid"; }
	return `(${pt.x}, ${pt.y})`;
}