import { Container, Graphics, Text, TextStyle } from "pixi.js";

export function Access(entryType: "entrance" | "exit") {
	const [width, height] = [64, 64]; 

	const container = new Container();
	container.pivot.set(width / 2, height / 2);

	const bgOffset = 0.04;
	const bg = new Graphics()
		.beginFill("black")
		.drawEllipse(0, height * bgOffset, width, height * (1 + bgOffset));

	const fg = new Graphics()
		.beginFill("white")
		.drawCircle(0, 0, width * 0.92);

	const text = new Text(entryType.toUpperCase(), new TextStyle({
		align: "center",
		fontFamily: "Poppins",
		fontSize: 20
	}));

	text.anchor.set(0.5);


	container.addChild(bg);
	container.addChild(fg);
	container.addChild(text);
	return container;
}