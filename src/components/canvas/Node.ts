import { Container, Graphics, TextStyle, Text, Sprite, Point } from "pixi.js";

type Props = {
	fgColor: string;
	bgColor: string;
	width: number;
	height?: number;
	bgOffset?: number;
} & ({
	icon: {
		url: string;
		scale?: Point;
		color: string;
	}
} | { iconText: string })

export function Node(props: Props) {
	const { fgColor, bgColor, width } = props;
	const height = props.height ?? width;

	const container = new Container();
	container.pivot.set(width / 2, height / 2);

	const bgOffset = props.bgOffset ?? 0.04;
	const bg = new Graphics()
		.beginFill(bgColor)
		.drawEllipse(0, height * bgOffset, width, height * (1 + bgOffset));

	const fg = new Graphics()
		.beginFill(fgColor)
		.drawCircle(0, 0, width * 0.92);

	container.addChild(bg);
	container.addChild(fg);

	if ("iconText" in props) {
		const text = new Text(props.iconText, new TextStyle({
			align: "center",
			fontFamily: "Poppins",
			fontSize: 20
		}));

		text.anchor.set(0.5);
		container.addChild(text);
	}

	if ("icon" in props) {
		const { url, scale, color } = props.icon;
		const sprite = Sprite.from(url);
		if (scale) { sprite.scale.copyFrom(scale); }
		sprite.tint = color;
		container.addChild(sprite);
	}

	return container;
}