import { Viewport } from "pixi-viewport";
import { Application, Container, DisplayObject, IApplicationOptions, ICanvas } from "pixi.js";
import { MutableRefObject } from "react";
import { MapNode, MapNodeType, MapNodes } from "./nodes";

export type Empty = Record<string, never>
export type DrawCallback = ({ app, world }: { app: Application, world: Container }) => void;
export type CanvasOptions = Partial<IApplicationOptions> & {
	worldWidth: number,
	worldHeight: number,
	ref: MutableRefObject<HTMLElement | null>;
};

export type CanvasHandles = {
	app: Application<ICanvas> | null | undefined;
	world: Container<DisplayObject> | null | undefined;
	viewport: Viewport | null | undefined;
	nodes: MapNode[];
	createNode: <T extends MapNodeType>(type: T, nodeName: string) => MapNodes<T>;
};

type ViewOptions<T extends object> = CanvasOptions & T;
type ViewHandles<T extends object> = Readonly<T>;
export type ViewHook<T extends object = object, K extends object = object> = (options: ViewOptions<T>) => ViewHandles<K>;