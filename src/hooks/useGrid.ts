import { Viewport } from "pixi-viewport";
import { Container, Graphics } from "pixi.js";
import { useCallback, useMemo } from "react";

type UseGridOptions = {
	world?: Container | null,
	viewport?: Viewport | null;
	cellSize: number,
	color: string,
	levels: number
}

export function useGrid({ world, cellSize, color, levels, viewport }: UseGridOptions) {
	const updateGrid = useCallback((graphics: Graphics) => {
		if (world && viewport) {
			// console.log("updating grid...");
			graphics.clear();
			const bounds = world.getLocalBounds();
			for (let level = levels; level > 0; level--) {
				const prominence = (level * viewport.scale.x) / cellSize;
				// console.log(`prominence for level ${level}: ${prominence}`);

				if (prominence > 0.025) { 
					const levelCellSize = cellSize * (2 ** (level - 1));
					// console.log("drawing grid level: ", level, levelCellSize, prominence);

					graphics
						.lineStyle({
							alignment: 0.5,
							width: Math.min(4, level),
							color: color,
							alpha: prominence < 0.05 ? 0.5 : 1
						});

					for (let i = 0; i < bounds.height / levelCellSize; i++) {
						graphics
							.moveTo(-bounds.width / 2, (i * levelCellSize) - bounds.height / 2)
							.lineTo(bounds.width / 2, (i * levelCellSize) - bounds.height / 2);
					}

					for (let i = 0; i < bounds.width / levelCellSize; i++) {
						graphics
							.moveTo((i * levelCellSize) - bounds.width / 2, -bounds.height / 2)
							.lineTo((i * levelCellSize) - bounds.width / 2, bounds.height / 2);
					}
				}
			}
		}
	}, [cellSize, color, levels, viewport, world]);

	const grid = useMemo(() => {
		const graphics = world?.children.find(
			child => child.name === "grid" && child instanceof Graphics
		) as Graphics ?? new Graphics();

		if (world && viewport) {
			graphics.clear();
			updateGrid(graphics);
			viewport.on("zoomed", () => updateGrid(graphics));
			world.addChild(graphics);
		}

		graphics.name = "grid";
		return graphics;
	}, [updateGrid, viewport, world]);

	return grid;
}