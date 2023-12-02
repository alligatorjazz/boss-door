import { Graphics, Point } from "pixi.js";
import { getInaccessibilityPole } from ".";
import { CustomDispatch, DungeonRoom } from "../types";

export type RoomHandle = {
	data: DungeonRoom,
	obj: Graphics,
	set: CustomDispatch<DungeonRoom>;
};
export function createRoom({ points }: Pick<DungeonRoom, "points">): DungeonRoom {
	// calculate the center of the room's area using polylabel
	const center = getInaccessibilityPole(points);

	// recalculate the room's points relative to the center
	const relativePoints = points.map(({ x, y }) => {
		return new Point(x, y).subtract(center);
	});

	return {
		id: crypto.randomUUID(),
		points: relativePoints,
		position: center,
		nodes: []
	};
}