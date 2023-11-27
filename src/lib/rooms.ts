import { DungeonRoom } from "../types";

export function createRoom({ points, position }: Pick<DungeonRoom, "points" | "position">): DungeonRoom {
	return {
		id: crypto.randomUUID(),
		points,
		position,
		paths: []
	};
}