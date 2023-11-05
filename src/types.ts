import { Viewport } from "pixi-viewport";
import { Application, ICanvas } from "pixi.js";
import { Container } from "postcss";

export type View = {
    app: Application<ICanvas>;
    viewport: Viewport;
	canvas: Container;
    onUnmount: () => void;
}