import { Container, Graphics, Text, TextStyle } from "pixi.js";

export function Entrance() {
	const [width, height] = [100, 100];

	const container = new Container();
	container.pivot.set(width / 2, height / 2);

	const graphics = new Graphics()
		.beginFill("white")
		.drawCircle(0, 0, width);

	const text = new Text("ENTRANCE", new TextStyle({
		align: "center",
		fontFamily: "Poppins"
	}));

	text.anchor.set(0.5);

	container.addChild(graphics);
	container.addChild(text);
	return container;
}