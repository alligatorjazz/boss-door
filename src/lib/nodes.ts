import { DisplayObject } from "pixi.js";
import { AnyZodObject, ZodEnum, ZodLiteral, ZodNull, ZodOptional, z } from "zod";
import { randomColor, toTitleCase } from ".";
import { ArrayElement } from "../types";
import { KeyObject } from "../components/canvas/KeyObject";
import { LockObject } from "../components/canvas/LockObject";
import { TerminalObject } from "../components/canvas/TerminalObject";

const literalSchema = z.union([z.string(), z.number(), z.boolean(), z.null()]);
type Literal = z.infer<typeof literalSchema>;
type Json = Literal | { [key: string]: Json } | Json[];
const JsonSchema: z.ZodType<Json> = z.lazy(() =>
	z.union([literalSchema, z.array(JsonSchema), z.record(JsonSchema)])
);

const MapNodeTypeSchema = z.enum(["entrance", "objective", "key", "lock"]);
type MapNodeType = z.infer<typeof MapNodeTypeSchema>;
type DerivedObjectState = ["position", ...(keyof DisplayObject)[]];
const derive = <T extends DerivedObjectState>(keys: ZodEnum<T>): ZodEnum<T> => {
	return keys;
};

const defaultDerive = derive(z.enum(["position"]));

const defineMapNode = <
	T extends MapNodeType,
	K extends AnyZodObject | ZodOptional<ZodNull>,
	R extends DerivedObjectState
>(type: ZodLiteral<T>, stateSchema: {
	internal: K,
	derived: ZodEnum<R>
}) => {
	// prevent name collisions with display object keys
	if (stateSchema.internal) {
		for (const key in stateSchema.internal) {
			if (key in DisplayObject) {
				throw new Error(`Map node definition is invalid: internal key ${key} collides with DisplayObject.`);
			}
		}
	}

	return z.object({
		type,
		id: z.string(),
		displayName: z.string(),
		state: z.object({
			derived: stateSchema.derived.array().optional(),
			internal: stateSchema.internal,
		})
	});
};



const EntranceNodeSchema = defineMapNode(z.literal("entrance"), {
	derived: defaultDerive,
	internal: z.null().optional()
});

const ObjectiveNodeSchema = defineMapNode(z.literal("objective"), {
	derived: defaultDerive,
	internal: z.null().optional()
});

const LockNodeSchema = defineMapNode(z.literal("lock"), {
	derived: derive(z.enum(["position", "scale", "zIndex"])),
	internal: z.object({
		color: z.string()
	})
});

const KeyNodeSchema = defineMapNode(z.literal("key"), {
	derived: defaultDerive,
	internal: z.object({
		tag: z.string().nullish(),
		color: z.string()
	})
});

export const MapNodeSchema = z.discriminatedUnion("type", [
	EntranceNodeSchema,
	ObjectiveNodeSchema,
	LockNodeSchema,
	KeyNodeSchema
]);

export type MapNode = z.infer<typeof MapNodeSchema>;

export type MapNodes<T extends MapNodeType> =
	T extends "entrance" ? z.infer<typeof EntranceNodeSchema> :
	T extends "objective" ? z.infer<typeof ObjectiveNodeSchema> :
	T extends "key" ? z.infer<typeof KeyNodeSchema> :
	T extends "lock" ? z.infer<typeof LockNodeSchema> :
	never


export type ValidNodeKey<T extends MapNodeType> =
	ArrayElement<NonNullable<MapNodes<T>["state"]["derived"]>> | keyof MapNodes<T>["state"]["internal"];

export type ValidNodeValue<T extends MapNodeType, K extends ValidNodeKey<T>> =
	K extends ArrayElement<NonNullable<MapNodes<T>["state"]["derived"]>> ?
	DisplayObject[K] :
	K extends keyof MapNodes<T>["state"]["internal"] ?
	MapNodes<T>["state"]["internal"][K] :
	never;

export type NodeHandle<T extends MapNode["type"]> = {
	data: MapNodes<T>;
	getObject: () => DisplayObject;
};

type CreateNodeOptions<T extends MapNodeType> = {
	type: T,
	name?: string
}

export function createNode<T extends MapNodeType>({ type, name }: CreateNodeOptions<T>): MapNodes<T> {
	// console.log("createNode: beginning node creation: ", type, name);
	const displayName = name ?? toTitleCase(type);
	const id = crypto.randomUUID();

	switch (type) {
		case "entrance": {
			const node: MapNodes<"entrance"> = {
				type,
				displayName,
				id,
				state: {
					derived: ["position"]
				}
			};

			return node as MapNodes<T>;
		}
		case "objective": {
			const node: MapNodes<"objective"> = {
				type,
				displayName,
				id,
				state: {
					derived: ["position"]
				}
			};

			return node as MapNodes<T>;
		}
		case "key": {
			const node: MapNodes<"key"> = {
				type,
				displayName,
				id,
				state: {
					derived: ["position"],
					internal: { color: "gray" }
				}
			};

			return node as MapNodes<T>;
		}
		case "lock": {
			const node: MapNodes<"lock"> = {
				type,
				displayName,
				id,
				state: {
					derived: ["position"],
					internal: { color: "gray" }
				}
			};
			return node as MapNodes<T>;
		}
		default: {
			throw new Error("Invalid node type: " + type);
		}
	}
}

export function createNodeObject(node: MapNode): DisplayObject {
	let obj: DisplayObject;
	switch (node.type) {
		case "entrance": {
			obj = TerminalObject(node);
			break;
		}
		case "objective": {
			obj = TerminalObject(node);
			break;
		}
		case "key": {
			obj = KeyObject(node);
			break;
		}
		case "lock": {
			obj = LockObject(node);
			break;
		}
	}

	return obj;
}

type MatchableNode = MapNodes<"lock"> | MapNodes<"key">
export function autoMatch<T extends MatchableNode>(node: T, matchAgainst: MatchableNode[]): T {
	switch (node.type) {
		case "key": {
			// attempt to find an existing lock with no key attached
			const autoMatch = matchAgainst?.find(value => {
				if (value.type === "lock") {
					const { id: tag } = value;
					const matchingKey = matchAgainst.find(value => {
						if (value.type === "key" && value.state.internal.tag === tag) {
							return value;
						}
					});
					if (!matchingKey) {
						return value;
					}
				}
			}) as MapNodes<"lock"> | null;

			return {
				...node,
				state: {
					...node.state,
					internal: {
						...node.state.internal,
						tag: autoMatch?.id,
						color: autoMatch?.state.internal?.color ?? randomColor()
					}
				}
			} as T;
		}
		case "lock": {
			// attempt to find an existing key with no lock attached
			const autoMatch = matchAgainst?.find(value => {
				if (value.type === "key" && !value.state.internal.tag) {
					return value;
				}
			}) as MapNodes<"key"> | null;

			return {
				...node,
				state: {
					...node.state,
					internal: {
						...node.state.internal,
						color: autoMatch?.state.internal?.color ?? randomColor()
					}
				}
			} as T;
		}
	}
}