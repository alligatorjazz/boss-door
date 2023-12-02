import { Dispatch, SetStateAction, createContext } from "react";
import { EditMode } from "../types";
import { KeyBindings } from "../types/keys";
import { Application } from "pixi.js";

type DungeonContextData = {
	mode: EditMode,
	setMode: Dispatch<SetStateAction<EditMode>>,
	cursorOverUI: boolean,
	bindings: KeyBindings,
	app?: Application | null;
};

export const DungeonContext = createContext<DungeonContextData>({} as DungeonContextData);