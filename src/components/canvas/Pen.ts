import { Sprite } from "pixi.js";
import PenTool from "../../assets/feather/pen-tool.svg";
export function Pen() {
	const sprite = Sprite.from(PenTool);
	sprite.tint = "white";
	return sprite;
}