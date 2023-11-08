
import { DisplayObject } from "pixi.js";
import { useRef, useState } from "react";
import { BossDoor } from "../../components/canvas/BossDoor";
import { BossKey } from "../../components/canvas/BossKey";
import { ViewMode, useView } from "../../hooks/useView";

export function Editor() {
	const containerRef = useRef<HTMLDivElement>(null);
	const [mode] = useState<ViewMode>("move");

	const { build } = useView({
		width: window.innerWidth,
		height: window.innerHeight,
		worldWidth: 10000,
		worldHeight: 10000,
		ref: containerRef,
		backgroundColor: "slategray", 
		antialias: true,
		mode
	});

	// drawing 
	build(({ world }) => {
		const icons: DisplayObject[] = [
			BossKey({ color: "red" }),
			BossDoor({ color: "red" })
		];

		icons.map((icon, index) => {
			index % 2 == 0 ?
				icon.position.set(0, (index / 2 * 200) + 100) :
				icon.position.set(400, (Math.floor(index / 2) * 200) + 100);
			icon.scale.set(4);
			world.addChild(icon);
		});
	});

	return (
		<div className="w-[100dvw] h-[100dvh] overflow-hidden" ref={containerRef}></div>
	);
}