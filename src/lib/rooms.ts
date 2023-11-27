import { Graphics, Point } from "pixi.js";
import { max, min } from ".";
import { DungeonRoom } from "../types";

export type RoomHandle = { room: DungeonRoom, obj: Graphics };
export function createRoom({ points }: Pick<DungeonRoom, "points">): DungeonRoom {
	// calculate the theoretical bounds of the room
	const bounds = {
		top: min(points.map(({ y }) => y)),
		bottom: max(points.map(({ y }) => y)),
		left: min(points.map(({ y }) => y)),
		right: max(points.map(({ y }) => y))
	};

	// calculate width and height of the room
	const [width, height] = [
		bounds.right - bounds.left,
		bounds.bottom - bounds.top
	];

	// calculate the center of the room in world space
	const center = new Point(bounds.top + (height / 2), bounds.left + (width / 2));

	// recalculate the room's points relative to the center
	const relativePoints = points.map(({x, y}) => {
		return new Point(x, y).subtract(center);
	});

	return {
		id: crypto.randomUUID(),
		points: relativePoints,
		position: center,
		paths: []
	};
}