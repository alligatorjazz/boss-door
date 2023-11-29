import { Container, Point, Sprite } from "pixi.js";
import PenTool from "../../assets/feather/pen-tool.svg";
import { BuildDot } from "./BuildDot";
export function Pen() {
	const sprite = Sprite.from(PenTool);
	sprite.tint = "white";
	sprite.anchor.set(0.3, 0.3);
	const dot = BuildDot({ color: "darkgray", position: new Point(0, 0) });
	const referenceRadius = dot.getLocalBounds().width / 2;
	dot.position.set(referenceRadius);
	sprite.position.set(referenceRadius);
	const container = new Container();

	container.addChild(dot);
	container.addChild(sprite);
	container.zIndex = 50;
	return container;
}