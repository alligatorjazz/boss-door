
import { useCallback, useEffect, useRef, useState } from "react";
import { ModeSelect } from "../../components/ui/ModeSelect";
import { EditMode } from "../../types";
import { EditorContext } from "./Index.lib";
import { useEdit } from "../../hooks/useEdit";

export function Editor() {
	const uiRef = useRef<HTMLDivElement>(null);
	const viewRef = useRef<HTMLDivElement>(null);
	const [mode, setMode] = useState<EditMode>("build");
	const [cursorOverUI, setCursorOverUI] = useState(false);

	const { draw, world } = useEdit({
		width: window.innerWidth,
		height: window.innerHeight,
		worldWidth: 10000,
		worldHeight: 10000,
		ref: viewRef,
		backgroundColor: "slategray",
		antialias: true,
		mode
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
		<EditorContext.Provider value={{ mode, setMode, cursorOverUI }}>
			<div className="w-[100dvw] h-[100dvh] overflow-hidden">
				<div className={["w-full h-full",].join(" ")} ref={viewRef}></div>
				<section className="absolute top-0 left-0 h-full w-full bg-transparent pointer-events-none">
					<div ref={uiRef} className="h-full flex flex-col">
						<ModeSelect className="flex-1" />
						<p className="bg-gray-700">{`${cursorOverUI}`}</p>
					</div>
				</section>
			</div>
		</EditorContext.Provider>
	);
}