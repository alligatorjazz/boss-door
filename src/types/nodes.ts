import { DisplayObject } from "pixi.js";

type BaseNodeType = "terminal" | "objective" | "switch" | "barrier";
type DerivedNodeType = {
	"terminal": "entrance" | "exit";
	"objective": "boss" | "goal";
	"switch": "switch" | "key";
	"barrier": "barrier" | "lock"
}

export type NodeType = BaseNodeType | DerivedNodeType[BaseNodeType];
export interface INode<Type extends NodeType, TrackedObjectState extends keyof DisplayObject = "position"> {
	type: Type;
	id: string;
	name: string;
	readonly tracked: TrackedObjectState[];
	obj: DisplayObject;
}


export interface Entrance extends INode<"entrance"> { }

export interface Key extends INode<"key"> {
	lockId?: string;
	color: string;
}

export interface Lock extends INode<"lock"> {
	keyId?: string;
	color: string;
}

export interface Boss extends INode<"boss"> { }
export interface Goal extends INode<"goal"> { }
export interface Switch extends INode<"switch"> {
	barrierId?: string;
	color: string;
}
export interface Barrier extends INode<"barrier"> {
	switchId?: string;
	color: string;
}

export type NodePairMatch<T extends "key" | "switch" | "barrier" | "lock"> = { color: string } &
	(
		T extends "key" ? Pick<Key, "lockId"> :
		T extends "switch" ? Pick<Switch, "barrierId"> :
		T extends "barrier" ? Pick<Barrier, "switchId"> :
		T extends "lock" ? Pick<Lock, "keyId"> : never
	);

export type Node = Entrance | Key | Lock | Boss | Goal | Switch | Barrier;
export type Nodes<T extends NodeType> =
	T extends "entrance" ? Entrance :
	T extends "key" ? Key :
	T extends "lock" ? Entrance :
	T extends "boss" ? Entrance :
	T extends "goal" ? Entrance :
	T extends "switch" ? Entrance :
	T extends "barrier" ? Entrance :
	never

