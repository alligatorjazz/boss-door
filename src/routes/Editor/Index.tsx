
import { useRef } from "react";
import { useView } from "../../hooks/useView";
import { Access } from "../../components/canvas/Access";
import { DisplayObject } from "pixi.js";

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
			Access("exit")
		];
		
		icons.map((icon, index) => {
			icon.position.set(index * 200, 0);
			world.addChild(icon);
		});
	});

	return (
		<div className="w-[100dvw] h-[100dvh] overflow-hidden" ref={containerRef}></div>
	);
}