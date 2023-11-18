import { Viewport } from "pixi-viewport";
import { Graphics, Point, Rectangle } from "pixi.js";

type BuildDotOptions = {
	position: Point,
	color?: string,
	viewport: Viewport
};

const radius = 8;
export function BuildDot({ position, color, viewport }: BuildDotOptions) {
	const graphics = new Graphics();
	const draw = () => {
		const scaledRadius = radius * (1 / viewport.scale.x);
		graphics.pivot.set(scaledRadius, scaledRadius);
		graphics
			.clear()
			.beginFill(color ?? "white")
			.drawCircle(0, 0, scaledRadius)
			.endFill();

		const hit = scaledRadius * 1.5;
		const hitArea = new Rectangle(-hit, -hit, hit * 2, hit * 2);

		graphics.hitArea = hitArea;
	};

	graphics.name = "buildDot";
	graphics.position.copyFrom(position);

	graphics.eventMode = "static";

	draw();
	viewport.on("zoomed", draw);
	graphics.on("destroyed", () => viewport.removeListener("zoomed", draw));

	return graphics;
}