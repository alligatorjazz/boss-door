import { Viewport } from "pixi-viewport";
import { Application, IApplicationOptions, Container, DisplayObject } from "pixi.js";
import { MutableRefObject } from "react";
import { ZodRawShape, z } from "zod";
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
type BaseNodeType = "terminal" | "objective" | "switch" | "barrier";
type DerivedNodeType = {
	"terminal": "entrance" | "exit";
	"objective": "boss" | "goal";
	"switch": "switch" | "key";
	"barrier": "barrier" | "lock"
}

type NodeType = BaseNodeType | DerivedNodeType[BaseNodeType];
interface INode<Type extends NodeType, TrackedObjectState extends keyof DisplayObject = "position" | "scale"> {
	type: Type;
	id: string;
	name: string;
	readonly tracked: TrackedObjectState[];
	obj: DisplayObject;
}

export interface Entrance extends INode<"entrance"> { }

export interface Key extends INode<"key"> {
	lockId?: string;
}

export interface Lock extends INode<"lock"> {
	keyId?: string;
}

export interface Boss extends INode<"boss"> { }
export interface Goal extends INode<"goal"> { }
export interface Switch extends INode<"switch"> {
	barrierId?: string;
}
export interface Barrier extends INode<"barrier"> {
	switchId?: string;
}

export type Node = Entrance | Key | Lock | Boss | Goal | Switch | Barrier;