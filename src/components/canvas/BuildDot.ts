import { Graphics, Point, Polygon, Rectangle } from "pixi.js";

const radius = 8;
export function BuildDot(position: Point, color?: string) {
	const graphics = new Graphics()
		.beginFill(color ?? "white")
		.drawCircle(0, 0, radius)
		.endFill();
	graphics.pivot.set(radius, radius);
	graphics.name = "buildDot";
	graphics.position.copyFrom(position);

	graphics.eventMode = "static";

	const hit = radius * 1.5;
	const hitArea = new Rectangle(-hit, -hit, hit * 2, hit * 2);

	graphics.hitArea = hitArea;
	graphics
		.lineStyle({ alpha: 0.4, color: "black", alignment: 0 })
		.beginFill("black", 0.2)
		.drawRect(-hit, -hit, hit * 2, hit * 2);

	return graphics;
}