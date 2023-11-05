
import { useRef } from "react";
import { graphicsTest } from "../../components/graphicsTest";
import { useView } from "../../hooks/useView";

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
		world.addChild(graphicsTest());
	});

	return (
		<div className="w-[100dvw] h-[100dvh] overflow-hidden" ref={containerRef}></div>
	);
}