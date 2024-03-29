import { Viewport } from "pixi-viewport";
import { Container } from "pixi.js";
import { MutableRefObject, useEffect } from "react";
import { useBuild } from "../../hooks/useBuild";
import { useGrid } from "../../hooks/useGrid";
import { useSelect } from "../../hooks/useSelect";
import { EditMode } from "../../types";
import { useRooms } from "../../hooks/useRooms";
import { usePen } from "../../hooks/usePen";
import { usePaths } from "../../hooks/usePaths";
import { useKeys } from "../../hooks/useKeys";

interface Props {
	world?: Container | null;
	viewport?: Viewport | null;
	setCursor: (mode: string) => void;
	mode: EditMode;
	windowRef: MutableRefObject<HTMLDivElement | null>;
	roomHandles: ReturnType<typeof useRooms>;
	pathHandles: ReturnType<typeof usePaths>;
}

export function Editor({ world, viewport, setCursor, mode, windowRef, roomHandles, pathHandles }: Props) {
	const baseCellSize = 16;
	const grid = useGrid({ world, baseCellSize, color: "lightgray", levels: 16, viewport });
	useSelect({ world, viewport, enabled: mode === "move", setCursor, roomHandles, pathHandles });
	useBuild({ world, enabled: mode === "build", viewport, setCursor, minCellSize: grid.minCellSize, roomHandles });
	usePen({ world, enabled: mode === "path", viewport, setCursor, roomHandles, pathHandles });
	useKeys({ world, enabled: mode === "key", viewport, setCursor, roomHandles });

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
				case "path": {
					viewport
						.drag({ mouseButtons: "middle", wheel: true })
						.clamp({ direction: "all" })
						.wheel({ keyToPress: ["AltLeft"], wheelZoom: true, trackpadPinch: true })
						.clampZoom({ maxScale: 1 });
					break;
				}
				case "key": {
					viewport
						.drag({ mouseButtons: "middle", wheel: true })
						.clamp({ direction: "all" })
						.wheel({ keyToPress: ["AltLeft"], wheelZoom: true, trackpadPinch: true })
						.clampZoom({ maxScale: 1 });
					break;
				}
				case "lock": {
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