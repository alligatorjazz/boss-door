import { Container, Graphics, Sprite, Text, TextStyle } from "pixi.js";
import img from "../../assets/gmtk/graph-entrance.png";

export function Entrance() {
	const [width, height] = [64, 64];

	const container = new Container();
	container.pivot.set(width / 2, height / 2);

	const graphics = new Graphics()
		.beginFill("white")
		.drawCircle(0, 0, width);

	const text = new Text("ENTRANCE", new TextStyle({
		align: "center",
		fontFamily: "Poppins",
		fontSize: 20
	}));

	text.anchor.set(0.5);

	const comp = Sprite.from(img);
	comp.position.set(width * 2, 0);
	container.addChild(graphics);
	container.addChild(text);
	container.addChild(comp);
	return container;
}