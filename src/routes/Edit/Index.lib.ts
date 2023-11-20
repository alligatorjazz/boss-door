import { Dispatch, SetStateAction, createContext } from "react";
import { EditMode } from "../../types";

export const EditorContext = createContext<{
	mode: EditMode,
	setMode?: Dispatch<SetStateAction<EditMode>>
	cursorOverUI: boolean
}>({
	mode: "move",
	cursorOverUI: false
});