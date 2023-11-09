
import { useRef, useState } from "react";
import { EditMode, useEdit } from "../../hooks/useEdit";

export function Editor() {
	const containerRef = useRef<HTMLDivElement>(null);
	const [mode] = useState<EditMode>("move");

	// const { build } = useEdit({
	// 	width: window.innerWidth,
	// 	height: window.innerHeight,
	// 	worldWidth: 10000,
	// 	worldHeight: 10000,
	// 	ref: containerRef,
	// 	backgroundColor: "slategray", 
	// 	antialias: true,
	// 	mode
	// });

	// drawing 


	return (
		<div className="w-[100dvw] h-[100dvh] overflow-hidden" ref={containerRef}></div>
	);
}