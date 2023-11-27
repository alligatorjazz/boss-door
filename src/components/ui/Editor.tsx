import { Viewport } from "pixi-viewport";
import { Container } from "pixi.js";
import { MutableRefObject, useEffect } from "react";
import { useBuild } from "../../hooks/useBuild";
import { useGrid } from "../../hooks/useGrid";
import { useNodes } from "../../hooks/useNodes";
import { useSelect } from "../../hooks/useSelect";
import { EditMode, WithoutBuildActions } from "../../types";
import { useRooms } from "../../hooks/useRooms";

interface Props {
	world?: Container | null;
	viewport?: Viewport | null;
	setCursor: (mode: string) => void;
	nodes: WithoutBuildActions<ReturnType<typeof useNodes>>
	mode: EditMode;
	windowRef: MutableRefObject<HTMLDivElement | null>;
	rooms: ReturnType<typeof useRooms>;
}
export function Editor({ world, viewport, setCursor, nodes, mode, windowRef, rooms }: Props) {
	const baseCellSize = 16;
	const grid = useGrid({ world, baseCellSize, color: "lightgray", levels: 16, viewport });
	useSelect({ world, nodes, viewport, enabled: mode === "move", setCursor, rooms });
	useBuild({ world, nodes, enabled: mode === "build", viewport, setCursor, minCellSize: grid.minCellSize, rooms });

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
						.clampZoom({ maxScale: 1 });
					break;
				}
				case "build": {
					viewport
						.drag({ mouseButtons: "middle", wheel: true })
						.clamp({ direction: "all" })
						.wheel({ keyToPress: ["AltLeft"], wheelZoom: true, trackpadPinch: true })
						.clampZoom({ maxScale: 1 });
					break;
				}
			}
		}
	}, [mode, viewport, world]);

	return (
		<div className={["w-full h-full",].join(" ")} ref={windowRef}></div>
	);
}