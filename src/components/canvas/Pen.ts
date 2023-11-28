import { Container, Graphics, Point, Sprite } from "pixi.js";
import PenTool from "../../assets/feather/pen-tool.svg";
import { BuildDot } from "./BuildDot";
export function Pen() {
	const sprite = Sprite.from(PenTool);
	sprite.tint = "white";
	sprite.anchor.set(0.3, 0.3);
	const dot = BuildDot({ color: "blue", position: new Point(0, 0) });
	const referenceRadius = dot.getLocalBounds().width / 2;
	dot.position.set(referenceRadius);
	sprite.position.set(referenceRadius);
	const container = new Container();

	container.addChild(dot);
	container.addChild(sprite);
	container.addChild(new Graphics().beginFill("magenta").drawCircle(0, 0, 4));
	container.zIndex = 50;
	return container;
}