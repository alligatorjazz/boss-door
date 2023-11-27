import { Graphics } from "pixi.js";
import { DungeonRoom } from "../types";

export type RoomHandle = { room: DungeonRoom, obj: Graphics };
export function createRoom({ points, position }: Pick<DungeonRoom, "points" | "position">): DungeonRoom {
	return {
		id: crypto.randomUUID(),
		points,
		position,
		paths: []
	};
}