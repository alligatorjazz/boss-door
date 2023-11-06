
import { DisplayObject, Sprite } from "pixi.js";
import { useRef } from "react";
import ref1 from "../../assets/gmtk/graph-bossdoor.png";
import ref2 from "../../assets/gmtk/graph-bosskey.png";
import { BossDoor } from "../../components/canvas/BossDoor";
import { useView } from "../../hooks/useView";
import { Switch } from "../../components/canvas/Switch";
import { BossKey } from "../../components/canvas/BossKey";

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
			// Sprite.from(ref1),
			// Sprite.from(ref2),
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