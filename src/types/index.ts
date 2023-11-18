import { Viewport } from "pixi-viewport";
import { Application, Container, DisplayObject, IApplicationOptions, ICanvas } from "pixi.js";
import { MutableRefObject } from "react";
import { MapNode } from "../lib/nodes";

export type Empty = Record<string, never>

export type CanvasOptions = Partial<IApplicationOptions> & {
	worldWidth: number,
	worldHeight: number,
	ref: MutableRefObject<HTMLElement | null>;
};

export type CanvasHandles = {
	app: Application<ICanvas> | null | undefined;
	world: Container<DisplayObject> | null | undefined;
	viewport: Viewport | null | undefined;
	setCursor: (mode: string) => void;
};

export type DrawCallback = (handles: {
	nodes: MapNode[];
	createNode: <T extends MapNode>(type: T, nodeName?: string) => MapNode;
}) => void;

type ViewOptions<T extends object> = CanvasOptions & T;
type ViewHandles<T extends object> = Readonly<T>;
export type ViewHook<T extends object = object, K extends object = object> = (options: ViewOptions<T>) => ViewHandles<K>;
export type ArrayElement<ArrayType extends readonly unknown[]> =
	ArrayType extends readonly (infer ElementType)[] ? ElementType : never;

export type EditMode = "move" | "build";

export type EditModeOptions = {
	setCursor: (mode: string) => void;
}