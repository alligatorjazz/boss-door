import { Dispatch, SetStateAction, createContext } from "react";
import { EditMode } from "../../types";
import { KeyBindings } from "../../types/keys";

type EditorContextData = {
	mode: EditMode,
	setMode?: Dispatch<SetStateAction<EditMode>>,
	cursorOverUI: boolean,
	bindings: KeyBindings
};

export const EditorContext = createContext<EditorContextData>({} as EditorContextData);