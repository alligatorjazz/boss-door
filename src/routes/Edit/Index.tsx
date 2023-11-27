
import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { ModeSelect } from "../../components/ui/ModeSelect";
import { EditMode } from "../../types";
import { DungeonContext } from "./Index.lib";
import { useView } from "../../hooks/useView";
import { Editor } from "../../components/ui/Editor";
import { KeyBindings } from "../../types/keys";
import { Key } from "ts-key-enum";


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

	const { draw, viewport, world, setCursor, nodes, rooms } = useView({
		width: window.innerWidth,
		height: window.innerHeight,
		worldWidth: 10000,
		worldHeight: 10000,
		ref: windowRef,
		backgroundColor: "slategray",
		antialias: true
	});


	const capturePointer = useCallback((element: HTMLElement) => {
		element.addEventListener("pointerover", () => setCursorOverUI(true));
		element.addEventListener("pointerout", () => setCursorOverUI(false));
	}, []);

	useEffect(() => {
		draw(({ add }) => {
			for (let i = 0; i < 4; i++) {
				const b = add("barrier", { name: "ABCDEF".charAt(Math.floor(Math.random() * 6)) });
				b.obj.position.set(Math.random() * 1000 - 400, Math.random() * 1000 - 300);
			}
		});
	}, [draw]);

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