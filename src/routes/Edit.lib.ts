import { Dispatch, SetStateAction, createContext } from "react";
import { EditMode } from "../types";
import { KeyBindings } from "../types/keys";

type DungeonContextData = {
	mode: EditMode,
	setMode: Dispatch<SetStateAction<EditMode>>,
	cursorOverUI: boolean,
	bindings: KeyBindings,
	// debug tool
	ui: { log: Dispatch<SetStateAction<string | null>> }
};

export const DungeonContext = createContext<DungeonContextData>({} as DungeonContextData);