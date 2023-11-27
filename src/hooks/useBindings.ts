import { useCallback, useContext, useEffect, useState } from "react";
import { DungeonContext } from "../routes/Edit/Index.lib";
import { Command, Modifiers } from "../types/keys";
import { Key } from "ts-key-enum";
export function useBindings() {
	const { bindings } = useContext(DungeonContext);
	const [cmdBindings, setCommandBindings] = useState<Partial<Record<Command, (e?: KeyboardEvent) => void>>>({});

	const bind = useCallback((cmd: Command, action: (e?: KeyboardEvent) => void) => {
		setCommandBindings(prev => {
			// removes previous listener if it was already bound
			const prevAction = prev[cmd];
			if (prevAction) {
				document.body.removeEventListener("keyup", prevAction);
				document.body.removeEventListener("keydown", prevAction);
			}
			// adds new binding to cmdBindings, will be attached to event listener with useEffect below
			return { ...prev, [cmd]: action };
		});
	}, []);

	const modifiersMatch = useCallback((e: KeyboardEvent, modifiers?: Modifiers[]) => {
		if (!modifiers) { return true; }
		return !modifiers.some(mod => {
			switch (mod) {
				case Key.Control: {
					return !e.ctrlKey;
				}
				case Key.Alt: {
					return !e.altKey;
				}
				case Key.Meta: {
					return !e.metaKey;
				}
				case Key.Shift: {
					return !e.shiftKey;
				}
			}
		});
	}, []);

	const handler = useCallback((action: (e?: KeyboardEvent) => void, key?: Omit<Key, Modifiers>, modifiers?: Modifiers[]) => {
		return (e: KeyboardEvent) => {
			if (
				// 1: key matches, modifiers match
				(e.key == key && modifiersMatch(e, modifiers)) ||
				// 2. modifiers match + there is no key for this command
				(!key && modifiersMatch(e, modifiers)) ||
				// 2: no matches, but event is firing for keyup
				(!key && !modifiersMatch(e, modifiers) && e.type == "keyup")
			) {
				// console.log("exec binding: ", { key, modifiers, ev: e.type });
				action(e);
			}
		};
	}, [modifiersMatch]);

	useEffect(() => {
		for (const cmd in cmdBindings) {
			const action = cmdBindings[cmd as Command];
			if (action) {
				const { key, modifiers, onkey } = bindings[cmd as Command];
				// console.log("loading bindings: ", { key, modifiers, onkey });
				const event = onkey ?? "down";
				switch (event) {
					case "up":
						document.body.addEventListener("keyup", handler(action, key, modifiers));
						break;
					case "down":
						document.body.addEventListener("keydown", handler(action, key, modifiers));
						break;
				}

			}
		}

		return () => {
			// console.log("removing bindings...");
			for (const cmd in cmdBindings) {
				const handler = cmdBindings[cmd as Command];
				if (handler) {
					document.body.removeEventListener("keyup", handler);
					document.body.removeEventListener("keydown", handler);
				}
			}
		};
	}, [bindings, cmdBindings, handler]);

	return bind;
}