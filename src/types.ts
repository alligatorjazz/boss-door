import { Viewport } from "pixi-viewport";
import { Application, IApplicationOptions, Container } from "pixi.js";
import { MutableRefObject } from "react";
type Empty = Record<string, unknown>
export type DrawCallback = ({ app, world }: { app: Application, world: Container }) => void;
export type CanvasOptions = Partial<IApplicationOptions> & {
	worldWidth: number,
	worldHeight: number,
	ref: MutableRefObject<HTMLElement | null>;
};

export type CanvasHandles = {
	app?: Application | null;
	world?: Container | null;
	viewport?: Viewport | null;
	build: (callback: DrawCallback) => void;
};

type ViewOptions<T extends object> = CanvasOptions & T;
type ViewHandles<T extends object> = Readonly<T & { build: CanvasHandles["build"] }>;
export type ViewHook<T extends object = Empty, K extends object = Empty> = (options: ViewOptions<T>) => ViewHandles<K>;