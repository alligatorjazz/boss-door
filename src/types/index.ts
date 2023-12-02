import { Viewport } from "pixi-viewport";
import { Application, Container, DisplayObject, IApplicationOptions, ICanvas, IPointData } from "pixi.js";
import { MutableRefObject } from "react";
import { useGrid } from "../hooks/useGrid";
import { MapNode } from "../lib/nodes";

export type CSSDimension =
	| "auto"
	| "inherit"
	| "initial"
	| "fit-content"
	| "max-content"
	| "min-content"
	| "unset"
	| `${number}px`
	| `${number}vw`
	| `${number}vh`
	| `${number}dvw`
	| `${number}dvh`;

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

export type EditMode = "move" | "build" | "path" | "key" | "lock";

export type Grid = ReturnType<typeof useGrid>;
export type DungeonPath = {
	id: string;
	nodes: MapNode[],
	// relative to room position
	between: [{
		roomId: string,
		point: IPointData
	}, {
		roomId: string,
		point: IPointData
	}]
}

export type DungeonRoom = {
	id: string;
	points: IPointData[];
	nodes: MapNode[];
	position: IPointData;
}

export type DungeonFloor = {
	id: string;
	name: string | null;
	rooms: DungeonRoom[];
	paths: DungeonPath[];
};

export type Dungeon = {
	version: string;
	floors: DungeonFloor[];
	name: string | null;
};

export type CustomDispatch<T> = (value: (T | ((prev: T) => T))) => void;
export type PartialBy<T, K extends keyof T> = Omit<T, K> & Partial<Pick<T, K>>
