import { MapNode } from "../../lib/nodes";

type KeyInspectorHandles = {
	readonly tag: string;
	setTag: (tag: string) => void;
	readonly color: string;
	setColor: (color: string) => void;
	delete: () => void;
}

type RoomInspectorHandles = {
	readonly name: string;
	setName: (name: string) => void;
	delete: () => void;

}

export type InspectorHandles<T extends MapNode["type"] | "room"> =
	T extends "room" ? RoomInspectorHandles :
	T extends "key" ? KeyInspectorHandles :
	never;
