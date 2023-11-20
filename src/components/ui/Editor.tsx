import { Viewport } from "pixi-viewport";
import { Container } from "pixi.js";
import { MutableRefObject, useEffect } from "react";
import { useBuild } from "../../hooks/useBuild";
import { useGrid } from "../../hooks/useGrid";
import { useNodes } from "../../hooks/useNodes";
import { useSelect } from "../../hooks/useSelect";
import { EditMode } from "../../types";

interface Props {
	world?: Container | null;
	viewport?: Viewport | null;
	setCursor: (mode: string) => void;
	nodes: Omit<ReturnType<typeof useNodes>, "add" | "remove" | "removeAll">
	mode: EditMode;
	windowRef: MutableRefObject<HTMLDivElement | null>;
}
export function Editor({ world, viewport, setCursor, nodes, mode, windowRef }: Props) {
	useSelect({ world, nodes, viewport, enabled: mode === "move", setCursor });
	useBuild({ world, nodes, enabled: mode === "build", viewport, setCursor });
	useGrid({ world, cellSize: 32, color: "lightgray", levels: 16, viewport });

	// handling mode changes
	useEffect(() => {
		if (world && viewport) {
			viewport.plugins.removeAll();
			switch (mode) {
				case "move": {
					viewport
						.drag({ mouseButtons: "middle", wheel: true })
						.clamp({ direction: "all" })
						.wheel({ keyToPress: ["AltLeft"], wheelZoom: true, trackpadPinch: true })
						.clampZoom({ maxScale: 2 });
					break;
				}
				case "build": {
					viewport
						.drag({ mouseButtons: "middle", wheel: true })
						.clamp({ direction: "all" })
						.wheel({ keyToPress: ["AltLeft"], wheelZoom: true, trackpadPinch: true })
						.clampZoom({ maxScale: 2 });
					break;
				}
			}
		}
	}, [mode, viewport, world]);

	return (
		<div className={["w-full h-full",].join(" ")} ref={windowRef}></div>
	);
}