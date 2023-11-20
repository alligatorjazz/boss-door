import { useCallback, useContext, useEffect, useState } from "react";
import { EditorContext } from "../routes/Edit/Index.lib";
import { Command, Modifiers } from "../types/keys";
import { Key } from "ts-key-enum";
export function useBindings() {
	const { bindings } = useContext(EditorContext);
	const [cmdBindings, setCommandBindings] = useState<Partial<Record<Command, (e?: KeyboardEvent) => void>>>({});

	const bind = useCallback((cmd: Command, action: (e?: KeyboardEvent) => void) => {
		setCommandBindings(prev => {
			// removes previous listener if it was already bound
			const prevAction = prev[cmd];
			if (prevAction) { document.body.removeEventListener("keydown", prevAction); }
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

	const handler = useCallback((action: (e?: KeyboardEvent) => void, key: Omit<Key, Modifiers>, modifiers?: Modifiers[]) => {
		return (e: KeyboardEvent) => {
			if (e.key === key && modifiersMatch(e, modifiers))
				action(e);
		};
	}, [modifiersMatch]);

	useEffect(() => {
		for (const cmd in cmdBindings) {
			const action = cmdBindings[cmd as Command];
			if (action) {
				const { key, modifiers } = bindings[cmd as Command];
				document.body.addEventListener("keydown", handler(action, key, modifiers));
			}
		}

		return () => {
			console.log("removing bindings...");
			for (const cmd in cmdBindings) {
				const handler = cmdBindings[cmd as Command];
				if (handler) {
					document.body.removeEventListener("keydown", handler);
				}
			}
		};
	}, [bindings, cmdBindings, handler]);

	return bind;
}