import { Graphics, Point } from "pixi.js";
const roomColor = "ghostwhite";
const roomBorder = "#222";
export function Room(pts: Point[]) {
	const graphics = new Graphics()
		.beginFill(roomColor)
		.lineStyle({alignment: 0.5, color: roomBorder})
		.drawPolygon(pts)
		.endFill();
		
	return graphics;
}