import { Viewport } from "pixi-viewport";
import { Graphics, Point, Rectangle } from "pixi.js";

type BuildDotOptions = {
	position: Point,
	color?: string,
	viewport: Viewport
	cursor?: boolean
};

const radius = 8;
export function BuildDot({ position, color, viewport, cursor }: BuildDotOptions) {
	const graphics = new Graphics();
	const draw = () => {
		if (graphics) {
			const scaledRadius = radius / viewport.scale.x;
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

	cursor ?
		graphics.name = "pseudoCursor" :
		graphics.name = "buildDot";
	graphics.position.copyFrom(position);

	graphics.eventMode = "static";

	// debug dot
	const debug = new Graphics()
		.beginFill("magenta")
		.drawCircle(0, 0, 4);
	debug.pivot.set(4);

	graphics.addChild(debug);

	draw();
	viewport.on("zoomed", draw);
	graphics.on("destroyed", () => viewport.removeListener("zoomed", draw));

	return graphics;
}