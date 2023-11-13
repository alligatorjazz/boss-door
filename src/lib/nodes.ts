import { DisplayObject } from "pixi.js";
import { AnyZodObject, ZodLiteral, ZodNull, ZodOptional, z } from "zod";
import { randomColor, toTitleCase } from ".";

const DisplayObjectReferenceSchema = z.string()
	.refine(key => key in DisplayObject)
	.transform(key => key as keyof DisplayObject);
const literalSchema = z.union([z.string(), z.number(), z.boolean(), z.null()]);
type Literal = z.infer<typeof literalSchema>;
type Json = Literal | { [key: string]: Json } | Json[];
const JsonSchema: z.ZodType<Json> = z.lazy(() =>
	z.union([literalSchema, z.array(JsonSchema), z.record(JsonSchema)])
);

const MapNodeTypeSchema = z.enum(["entrance", "objective", "switch", "barrier"]);
type MapNodeType = z.infer<typeof MapNodeTypeSchema>;

const defaultDerive: (keyof DisplayObject)[] = ["position"];
const derive = <T extends keyof DisplayObject>(...keys: (T)[]) => DisplayObjectReferenceSchema
	.array()
	.refine(allPossibleKeys => {
		let valid = true;
		for (const value of allPossibleKeys) {
			valid = value in keys;
		}

		return valid;
	})
	.transform(keys => keys as T[]);


const defineMapNode = <T extends MapNodeType, K extends AnyZodObject | ZodOptional<ZodNull>>(type: ZodLiteral<T>, stateSchema: {
	internal: K,
	derived: ReturnType<typeof derive>
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
			derived: stateSchema.derived.optional(),
			internal: stateSchema.internal,
		})
	});
};

// type f = ReturnType<typeof defineMapNode<"barrier", ZodObject<{ test: ZodString }>>>;

const EntranceNodeSchema = defineMapNode(z.literal("entrance"), {
	derived: derive(...defaultDerive),
	internal: z.null().optional()
});

const ObjectiveNodeSchema = defineMapNode(z.literal("objective"), {
	derived: derive(...defaultDerive),
	internal: z.null().optional()
});

const BarrierNodeSchema = defineMapNode(z.literal("barrier"), {
	derived: derive(...defaultDerive),
	internal: z.object({
		color: z.string()
	})
});

const SwitchNodeSchema = defineMapNode(z.literal("switch"), {
	derived: derive(...defaultDerive),
	internal: z.object({
		barrierId: z.string().nullish(),
		color: z.string()
	})
});

export const MapNodeSchema = z.discriminatedUnion("type", [
	EntranceNodeSchema,
	ObjectiveNodeSchema,
	BarrierNodeSchema,
	SwitchNodeSchema
]);

export type MapNode = z.infer<typeof MapNodeSchema>;

export type MapNodes<T extends MapNodeType> =
	T extends "entrance" ? z.infer<typeof EntranceNodeSchema> :
	T extends "objective" ? z.infer<typeof ObjectiveNodeSchema> :
	T extends "switch" ? z.infer<typeof SwitchNodeSchema> :
	T extends "barrier" ? z.infer<typeof BarrierNodeSchema> :
	never


type CreateNodeOptions<T extends MapNodeType> = {
	type: T,
	name?: string,
	matchAgainst: MapNode[]
}
export function createNode<T extends MapNodeType>({ type, name, matchAgainst }: CreateNodeOptions<T>): MapNodes<T> {
	console.log("createNode: beginning node creation: ", type, name);
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
		case "switch": {
			// attempt to find an existing barrier with no switch attached
			const autoMatch = matchAgainst?.find(value => {
				if (value.type === "barrier") {
					const { id: barrierId } = value;
					const matchingSwitch = matchAgainst.find(value => {
						if (value.type === "switch" && value.state.internal.barrierId === barrierId) {
							return value;
						}
					});
					if (!matchingSwitch) {
						return value;
					}
				}
			}) as MapNodes<"barrier"> | null;

			// const color = autoMatch?.color ?? randomColor();
			const node: MapNodes<"switch"> = {
				type,
				displayName,
				id,
				state: {
					internal: {
						barrierId: autoMatch?.id,
						color: autoMatch?.state.internal?.color ?? randomColor()
					}
				}
			};

			return node as MapNodes<T>;
		}
		case "barrier": {
			// attempt to find an existing key with no lock attached
			const autoMatch = matchAgainst?.find(value => {
				if (value.type === "switch" && !value.state.internal.barrierId) {
					return value;
				}
			}) as MapNodes<"switch"> | null;

			const node: MapNodes<"barrier"> = {
				type,
				displayName: autoMatch?.displayName ?? String.fromCharCode(97 + matchAgainst.length - 1),
				id,
				state: {
					internal: { color: autoMatch?.state.internal?.color ?? randomColor() }
				}
			};
			return node as MapNodes<T>;
		}
		default: {
			throw new Error("Invalid node type: " + type);
		}
	}
}