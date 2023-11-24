import { Key } from "ts-key-enum";
export type Command = "escape" | "snap-start" | "snap-end";
export type Modifiers = Key.Control | Key.Alt | Key.Meta | Key.Shift;
export type KeyBindings = Record<Command, {
	modifiers?: Modifiers[],
	key?: Omit<Key, Modifiers>,
	onkey?: "down" | "up" 
}>;
