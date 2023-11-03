import { PixiComponent, useApp } from "@pixi/react";
import { IViewportOptions, Viewport } from "pixi-viewport";
import { EventSystem, Ticker } from "pixi.js";
import { ReactElement } from "react";
import { updatePixiChildren } from "../lib";

type Props = IViewportOptions & {
	children: ReactElement[] | ReactElement;
}

const applyPlugins = (viewport: Viewport) => {
	return viewport
		.drag()
		.pinch()
		.wheel()
		.decelerate();
};

export default PixiComponent<Props, Viewport>("EditCanvas", {
	create({ children, ticker, events, ...options }: Props) {
		const viewport = new Viewport({
			ticker: ticker,
			events: events,
			...options,
		});

		updatePixiChildren(viewport, ...(Array.isArray(children) ? children : [children]));

		return applyPlugins(viewport);

	},
	applyProps(viewport, _, { children, ticker, events, ...newProps }) {
		updatePixiChildren(viewport, ...(Array.isArray(children) ? children : [children]));
		viewport = applyPlugins(new Viewport({
			ticker: ticker,
			events: events,
			...newProps
		}));
	},
	didMount() {
		console.log("viewport mounted");
	}
});