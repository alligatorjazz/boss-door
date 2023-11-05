import { Sprite } from "pixi.js";
import entrance from "../assets/gmtk/graph-entrance.png";

export function graphicsTest() {
	const sprite = Sprite.from(entrance);
	sprite.anchor.set(0.5);
	return sprite;
}