import { Container, Graphics, Sprite, Text, TextStyle } from "pixi.js";

type NodeObjectShape = "circle" | "diamond" | "square";

export type NodeObjectIcon = Graphics | Sprite;

export type NodeObjectProps = {
	fgColor: string;
	bgColor: string;
	width: number;
	height?: number;
	bgOffset?: number;
	sizeOffset?: number;
	shape: NodeObjectShape;
} & ({ icon: NodeObjectIcon } | { iconText: string, fontSize?: number })

export function NodeObject(props: NodeObjectProps) {
	const { fgColor, bgColor, width, shape } = props;
	const height = props.height ?? width;

	const container = new Container();
	container.pivot.set(width / 2, height / 2);

	const bgOffset = props.bgOffset ?? 0.02;
	const sizeOffset = props.sizeOffset ?? 0.92;
	let bg: Graphics | Container;
	let fg: Graphics | Container;

	switch (shape) {
		case "circle": {
			bg = new Graphics()
				.beginFill(bgColor)
				.drawEllipse(0, height * bgOffset, width / 2, height * (1 + bgOffset) / 2);
			fg = new Graphics()
				.beginFill(fgColor)
				.drawCircle(0, 0, width * sizeOffset / 2);
			break;
		}

		case "square": {
			const radius = 5;
			bg = new Graphics()
				.beginFill(bgColor)
				.drawRoundedRect(-width / 2, -height / 2, width, height * (1 + bgOffset), radius);
			fg = new Graphics()
				.beginFill(fgColor)
				.drawRoundedRect(
					(-width / 2) + width * (1 - sizeOffset) / 2,
					(-height / 2) + height * (1 - sizeOffset) / 2,
					width * sizeOffset,
					height * sizeOffset,
					radius
				);
			break;
		}

		case "diamond": {
			const bgGraphics = new Graphics()
				.beginFill(bgColor)
				.drawEllipse(0, height * bgOffset, width, height * (1 + bgOffset));
			const fgGraphics = new Graphics()
				.beginFill(fgColor)
				.drawCircle(0, 0, width * sizeOffset);
			bg = new Container();
			fg = new Container();
			bg.addChild(bgGraphics);
			fg.addChild(fgGraphics);
			bg.angle = 45;
			fg.angle = 45;
			break;
		}
	}

	container.addChild(bg);
	container.addChild(fg);

	if ("iconText" in props) {
		const text = new Text(props.iconText, new TextStyle({
			align: "center",
			fontFamily: "Poppins",
			fontSize: props.fontSize ?? 20
		}));

		text.anchor.set(0.5);
		container.addChild(text);
	}

	if ("icon" in props) {
		container.addChild(props.icon);
	}

	return container;
}