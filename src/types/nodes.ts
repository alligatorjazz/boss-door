import { DisplayObject } from "pixi.js";

type BaseNodeType = "terminal" | "objective" | "switch" | "barrier";
type DerivedNodeType = {
	"terminal": "entrance" | "exit";
	"objective": "boss" | "goal";
	"switch": "switch" | "key";
	"barrier": "barrier" | "lock"
}

export type MapNodeType = BaseNodeType | DerivedNodeType[BaseNodeType];
interface IMapNode<Type extends MapNodeType, TrackedObjectState extends keyof DisplayObject = "position"> {
	type: Type;
	id: string;
	name: string;
	readonly tracked: TrackedObjectState[];
	obj: DisplayObject;
}


export interface Entrance extends IMapNode<"entrance"> { }

export interface Key extends IMapNode<"key"> {
	lockId?: string;
	color: string;
}

export interface Lock extends IMapNode<"lock"> {
	keyId?: string;
	color: string;
}

export interface Boss extends IMapNode<"boss"> { }
export interface Goal extends IMapNode<"goal"> { }
export interface Switch extends IMapNode<"switch"> {
	barrierId?: string;
	color: string;
}
export interface Barrier extends IMapNode<"barrier"> {
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

export type MapNode = Entrance | Key | Lock | Boss | Goal | Switch | Barrier;
export type MapNodes<T extends MapNodeType> =
	T extends "entrance" ? Entrance :
	T extends "key" ? Key :
	T extends "lock" ? Entrance :
	T extends "boss" ? Entrance :
	T extends "goal" ? Entrance :
	T extends "switch" ? Entrance :
	T extends "barrier" ? Entrance :
	never

