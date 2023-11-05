
import { useRef } from "react";
import { useView } from "../../hooks/useView";
import { Entrance } from "../../components/canvas/Entrance";

export function Editor() {
	const containerRef = useRef<HTMLDivElement>(null);
	const { useCanvas } = useView({
		width: window.innerWidth,
		height: window.innerHeight,
		worldWidth: 10000,
		worldHeight: 10000,
		ref: containerRef
	});

	// drawing 
	useCanvas(({ world }) => {
		world.addChild(Entrance());
	});

	return (
		<div className="w-[100dvw] h-[100dvh] overflow-hidden" ref={containerRef}></div>
	);
}