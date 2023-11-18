
import { useEffect, useRef, useState } from "react";
import { ModeSelect } from "../../components/ui/ModeSelect";
import { EditMode } from "../../types";
import { EditorContext } from "./Index.lib";
import { useEdit } from "../../hooks/useEdit";

export function Editor() {
	const containerRef = useRef<HTMLDivElement>(null);
	const [mode, setMode] = useState<EditMode>("build");

	const { draw } = useEdit({
		width: window.innerWidth,
		height: window.innerHeight,
		worldWidth: 10000,
		worldHeight: 10000,
		ref: containerRef,
		backgroundColor: "slategray",
		antialias: true,
		mode
	});

	useEffect(() => {
		draw(({ add }) => {
			for (let i = 0; i < 4; i++) {
				const b = add("barrier", { name: "ABCDEF".charAt(Math.floor(Math.random() * 6)) });
				b.obj.position.set(Math.random() * 1000 - 400, Math.random() * 1000 - 300);
			}
		});
	}, [draw]);


	return (
		<EditorContext.Provider value={{ mode, setMode }}>
			<div className="w-[100dvw] h-[100dvh] overflow-hidden">
				<div className="w-full h-full" ref={containerRef}></div>
				<section className="absolute top-0 left-0 h-full w-full bg-transparent pointer-events-none">
					<ModeSelect />
				</section>
			</div>
		</EditorContext.Provider>
	);
}