
import { useRef } from "react";
import { useView } from "../../hooks/useView";
import { Access } from "../../components/canvas/Access";
import { DisplayObject, Graphics, Sprite } from "pixi.js";
import { Barrier } from "../../components/canvas/Barrier";
import reference from "../../assets/gmtk/graph-bossdoor.png";
import { BossDoor } from "../../components/canvas/BossDoor";

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
			// Access("entrance"),
			// Access("boss"),
			// Barrier({color: "green", iconText: "A"}),
			// Barrier({color: "blue", iconText: "B"}),
			// Barrier({color: "red", iconText: "C"}),
			// Barrier({color: "orange", iconText: "D"}),
			// Barrier({color: "violet", iconText: "E"}),
			// Barrier({color: "teal", iconText: "F"}),
			Sprite.from(reference),
			BossDoor({ color: "#46b4f0" })
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