import { Viewport } from "pixi-viewport";
import { Container, Graphics } from "pixi.js";
import { useCallback, useMemo, useState } from "react";

type UseGridOptions = {
	world?: Container | null,
	viewport?: Viewport | null;
	color: string,
	levels: number,
	baseCellSize: number;
}

export function useGrid({ world, color, levels, viewport, baseCellSize }: UseGridOptions) {
	const [minCellSize, setMinCellSize] = useState(baseCellSize);
	const updateGrid = useCallback((graphics: Graphics) => {
		if (world && viewport) {
			graphics.clear();
			const { worldWidth, worldHeight } = viewport;
			for (let level = levels; level > 0; level--) {
				const prominence = (baseCellSize * level) / ((worldWidth + worldHeight) / 2);
				const alpha = prominence * 20;
				// console.log(`prominence for level ${level}: ${prominence}`);
				if (alpha > 0.1) {
					const levelCellSize = baseCellSize * (2 ** (level - 1));
					graphics
						.lineStyle({
							alignment: 0.5,
							width: Math.min(4, level),
							color,
							alpha: prominence * 20
						});

					for (let i = 0; i < Math.floor(worldHeight / levelCellSize); i++) {
						graphics
							.moveTo(-worldWidth / 2, (i * levelCellSize) - worldHeight / 2)
							.lineTo(worldWidth / 2, (i * levelCellSize) - worldHeight / 2);
						
					}

					for (let i = 0; i < Math.floor(worldWidth / levelCellSize); i++) {
						graphics
							.moveTo((i * levelCellSize) - worldWidth / 2, -worldHeight / 2)
							.lineTo((i * levelCellSize) - worldWidth / 2, worldHeight / 2);
						
					}
					setMinCellSize(levelCellSize);
				}
			}
		}
	}, [world, viewport, levels, baseCellSize, color]);

	const obj = useMemo(() => {
		const graphics = world?.children.find(
			child => child.name === "grid" && child instanceof Graphics
		) as Graphics ?? new Graphics();

		if (world && viewport) {
			graphics.clear();
			updateGrid(graphics);
			viewport.on("zoomed", () => updateGrid(graphics));
			world.addChild(graphics);
		}


		graphics.zIndex = -50;
		graphics.name = "grid";

		return graphics;
	}, [updateGrid, viewport, world]);

	return { obj, updateGrid, minCellSize };
}