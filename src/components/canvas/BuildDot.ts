import { Viewport } from "pixi-viewport";
import { Graphics, Point, Rectangle } from "pixi.js";

type BuildDotOptions = {
	position: Point,
	color?: string,
	viewport?: Viewport
};

const radius = 8;
export function BuildDot({ position, color, viewport }: BuildDotOptions) {
	const graphics = new Graphics();
	const draw = () => {
		if (graphics) {
			const scaledRadius = radius / (viewport?.scale.x?? 1);
			graphics.pivot.set(radius);
			graphics
				.clear()
				.beginFill(color ?? "white")
				.drawCircle(0, 0, scaledRadius)
				.endFill();

			const hit = scaledRadius * 1.5;
			const hitArea = new Rectangle(-hit, -hit, hit * 2, hit * 2);

			graphics.hitArea = hitArea;
		}
	};
	graphics.position.copyFrom(position);

	graphics.eventMode = "static";

	draw();
	viewport?.on("zoomed", draw);
	graphics.on("destroyed", () => viewport?.removeListener("zoomed", draw));

	return graphics;
}