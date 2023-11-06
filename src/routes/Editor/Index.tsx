
import { useRef } from "react";
import { useView } from "../../hooks/useView";
import { Access } from "../../components/canvas/Access";
import { DisplayObject } from "pixi.js";
import { Barrier } from "../../components/canvas/Barrier";

export function Editor() {
	const containerRef = useRef<HTMLDivElement>(null);
	const { useCanvas } = useView({
		width: window.innerWidth,
		height: window.innerHeight,
		worldWidth: 10000,
		worldHeight: 10000,
		ref: containerRef,
		backgroundColor: "slategray",
		antialias: true
	});

	// drawing 
	useCanvas(({ world }) => {
		const icons: DisplayObject[] = [
			Access("entrance"),
			Access("exit"),
			Barrier({color: "green", label: "A"}),
			Barrier({color: "blue", label: "B"}),
			Barrier({color: "red", label: "C"}),
			Barrier({color: "orange", label: "D"}),
			Barrier({color: "violet", label: "E"}),
			Barrier({color: "teal", label: "F"}),
			
		];

		icons.map((icon, index) => {
			index % 2 == 0 ?
				icon.position.set(0, index / 2 * 200) :
				icon.position.set(200, Math.floor(index / 2) * 200);
			world.addChild(icon);
		});
	});

	return (
		<div className="w-[100dvw] h-[100dvh] overflow-hidden" ref={containerRef}></div>
	);
}