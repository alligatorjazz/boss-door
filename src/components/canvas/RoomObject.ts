import { Graphics } from "pixi.js";
import { DungeonRoom } from "../../types";
const roomColor = "ghostwhite";
const roomBorder = "#222";

export function RoomObject({ id, points, position }: Pick<DungeonRoom, "id" | "points" | "position">) {
	const graphics = new Graphics()
		.beginFill(roomColor)
		.lineStyle({ alignment: 0.5, color: roomBorder, width: 5 })
		.drawPolygon(points)
		.endFill();

	graphics.name = id;
	graphics.position.copyFrom(position);
	return graphics;
}