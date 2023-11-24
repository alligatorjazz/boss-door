import { Graphics, IPoint, IPointData } from "pixi.js";

export function GenericDot({ size, color, position }: { size: number, color: string, position: IPointData }) {
	const graphics = new Graphics()
		.beginFill(color)
		.drawCircle(-size, -size, size);
	graphics.position.copyFrom(position);
	return graphics;
}