import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { Key } from "ts-key-enum";
import { Editor } from "../components/ui/Editor";
import { ModeSelect } from "../components/ui/ModeSelect";
import { useCanvas } from "../hooks/useCanvas";
import { useNodes } from "../hooks/useNodes";
import { useRooms } from "../hooks/useRooms";
import { BuildActions, DrawActions, EditMode } from "../types";
import { KeyBindings } from "../types/keys";
import { DungeonContext } from "./Edit.lib";

export function Edit() {
	const uiRef = useRef<HTMLDivElement>(null);
	const windowRef = useRef<HTMLDivElement>(null);
	const [mode, setMode] = useState<EditMode>("move");
	const [cursorOverUI, setCursorOverUI] = useState(false);
	const [debug, log] = useState<string | null>(null);

	const bindings: KeyBindings = useMemo(() => {
		return {
			"escape": { key: Key.Escape },
			"snap-start": { modifiers: [Key.Shift], onkey: "down" },
			"snap-end": { modifiers: [Key.Shift], onkey: "up" }
		};
	}, []);

	const { viewport, world, setCursor } = useCanvas({
		width: window.innerWidth,
		height: window.innerHeight,
		worldWidth: 10000,
		worldHeight: 10000,
		ref: windowRef,
		backgroundColor: "slategray",
		antialias: true
	});

	const { add, remove, removeAll, ...nodes } = useNodes(world);
	const rooms = useRooms(world);

	const draw = useCallback((cb: (actions: DrawActions) => void) => {
		if (world) {
			cb({ add, remove, removeAll });
		}
	}, [add, remove, removeAll, world]);

	const build = useCallback((cb: (actions: BuildActions) => void) => {
		if (world) {
			cb({ add: rooms.add, remove: rooms.remove });
		}
	}, [rooms.add, rooms.remove, world]);

	const capturePointer = useCallback((element: HTMLElement) => {
		element.addEventListener("pointerover", () => setCursorOverUI(true));
		element.addEventListener("pointerout", () => setCursorOverUI(false));
	}, []);

	useEffect(() => {
		// draw(({ add }) => {
		// 	for (let i = 0; i < 4; i++) {
		// 		const b = add("barrier", { name: "ABCDEF".charAt(Math.floor(Math.random() * 6)) });
		// 		b.obj.position.set(Math.random() * 1000 - 400, Math.random() * 1000 - 300);
		// 	}
		// });
		build(({ add }) => {
			const points = [];
			for (let i = 0; i < 8; i++) {
				const r = (n: number) => Math.random() > 0.5 ?
					-n * Math.random() : n * Math.random();
				points.push({ x: r(100), y: r(100) });
			}
			add({ points });
		});
	}, [build]);

	useEffect(() => {
		if (uiRef.current) {
			capturePointer(uiRef.current);
		}
	}, [capturePointer]);


	return (
		<DungeonContext.Provider value={{ mode, setMode, cursorOverUI, bindings, ui: { log } }}>
			<div className="w-[100dvw] h-[100dvh] overflow-hidden">
				<Editor {...{ draw, viewport, world, setCursor, nodes, mode, windowRef, rooms }} />
				<section className="absolute top-0 left-0 h-full w-full bg-transparent pointer-events-none">
					<div ref={uiRef} className="h-full flex flex-col">
						<ModeSelect className="flex-1" />
						{debug && <div className="bg-black">{debug}</div>}
					</div>
				</section>
			</div>
		</DungeonContext.Provider>
	);
}