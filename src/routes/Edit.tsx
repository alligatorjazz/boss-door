import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { Key } from "ts-key-enum";
import { Editor } from "../components/ui/Editor";
import { Inspector } from "../components/ui/Inspector";
import { KeyInspect } from "../components/ui/KeyInspect";
import { ModeSelect } from "../components/ui/ModeSelect";
import { SubMenu } from "../components/ui/SubMenu";
import { TopMenu } from "../components/ui/TopMenu";
import { useCanvas } from "../hooks/useCanvas";
import { useDungeon } from "../hooks/useDungeon";
import { usePaths } from "../hooks/usePaths";
import { useRooms } from "../hooks/useRooms";
import { EditMode } from "../types";
import { KeyBindings } from "../types/keys";
import { DungeonContext } from "./Edit.lib";
import { RoomHandle } from "../lib/rooms";

export function Edit() {
	const toolsRef = useRef<HTMLDivElement>(null);
	const inspectorRef = useRef<HTMLDivElement>(null);
	const windowRef = useRef<HTMLDivElement>(null);
	const [mode, setMode] = useState<EditMode>("key");
	const [cursorOverUI, setCursorOverUI] = useState(false);
	const [activeFloor] = useState(0);
	const [selected, setSelected] = useState<(RoomHandle)[]>([]);
	
	const dungeon = useDungeon();
	const { rooms, setRooms, paths, setPaths } = useMemo(() => {
		return dungeon.getFloorHandles(activeFloor);
	}, [activeFloor, dungeon]);

	const bindings: KeyBindings = useMemo(() => {
		return {
			"escape": { key: Key.Escape },
			"snap-start": { modifiers: [Key.Shift], onkey: "down" },
			"snap-end": { modifiers: [Key.Shift], onkey: "up" }
		};
	}, []);

	const { viewport, world, setCursor, app } = useCanvas({
		width: window.innerWidth,
		height: window.innerHeight,
		worldWidth: 10000,
		worldHeight: 10000,
		ref: windowRef,
		backgroundColor: "slategray",
		antialias: true
	});

	const roomHandles = useRooms({ world, rooms, setRooms });
	const pathHandles = usePaths({ world, paths, setPaths, rooms });

	const capturePointer = useCallback((element: HTMLElement) => {
		element.addEventListener("pointerover", () => setCursorOverUI(true));
		element.addEventListener("pointerout", () => setCursorOverUI(false));
	}, []);

	useEffect(() => {
		console.log(world?.children.map(child => ({ [child.name ?? crypto.randomUUID()]: child })));
	}, [paths, world?.children]);

	useEffect(() => {
		if (toolsRef.current && inspectorRef.current) {
			capturePointer(toolsRef.current);
			capturePointer(inspectorRef.current);
		}
	}, [capturePointer]);

	return (
		<DungeonContext.Provider value={{ selected, setSelected, mode, setMode, cursorOverUI, bindings, app }}>
			<div className="w-[100dvw] h-[100dvh] overflow-hidden">
				<Editor {...{ viewport, world, setCursor,  mode, windowRef, roomHandles, pathHandles }} />
				<section className="absolute top-0 left-0 h-full w-full bg-transparent pointer-events-none">
					<TopMenu mode={mode} />
					<div className="h-full w-full flex flex-row justify-between">
						<div ref={toolsRef} className="h-full flex flex-row w-min">
							<ModeSelect className="flex-1 h-full" />
							<SubMenu enabled={mode === "lock"} width={"300px"}>
								locks
							</SubMenu>
						</div>
						<div ref={inspectorRef} className="h-full flex flex-row w-min">
							<Inspector enabled={mode === "move"} width={"300px"} >
								<KeyInspect />
							</Inspector>
						</div>
					</div>
				</section>
			</div>
		</DungeonContext.Provider>
	);
}
