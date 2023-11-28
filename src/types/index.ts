import { Viewport } from "pixi-viewport";
import { Application, Container, DisplayObject, IApplicationOptions, ICanvas, IPointData } from "pixi.js";
import { MutableRefObject } from "react";
import { useGrid } from "../hooks/useGrid";
import { useNodes } from "../hooks/useNodes";
import { MapNode } from "../lib/nodes";
import { useRooms } from "../hooks/useRooms";

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

export type EditMode = "move" | "build" | "path";
export type DrawActions = Pick<ReturnType<typeof useNodes>, "add" | "remove" | "removeAll">;
export type WithoutDrawActions<T> = Omit<T, "add" | "remove" | "removeAll">;

export type BuildActions = Pick<ReturnType<typeof useRooms>, "add" | "remove">;
export type WithoutBuildActions<T> = Omit<T, "add" | "remove" | "removeAll">;

export type Grid = ReturnType<typeof useGrid>;

export type DungeonRoom = {
	id: string;
	points: IPointData[];
	paths: { points: [IPointData, IPointData], nodeId: string | null, linkedRoomId: string | null }[]
	position: IPointData;
}

export type DungeonFloor = { id: string; name: string | null; rooms: DungeonRoom[] };

export type Dungeon = {
	id: string;
	floors: DungeonFloor[];
	orphanNodes: MapNode[];
};

