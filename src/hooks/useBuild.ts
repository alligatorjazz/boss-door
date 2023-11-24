import { Viewport } from "pixi-viewport";
import { Container, FederatedPointerEvent, Graphics, LINE_JOIN, Point } from "pixi.js";
import { useCallback, useContext, useEffect, useMemo, useState } from "react";
import { BuildDot } from "../components/canvas/BuildDot";
import { Room } from "../components/canvas/Room";
import { collisionTest, snap } from "../lib";
import { DungeonContext } from "../routes/Edit/Index.lib";
import { useBindings } from "./useBindings";
import { useNodes } from "./useNodes";
import { ExtendedGraphics } from "pixi-extended-graphics";

type UseBuildOptions = {
	world?: Container | null;
	viewport?: Viewport | null;
	enabled: boolean;
	nodes: Omit<ReturnType<typeof useNodes>, "add" | "remove" | "removeAll">;
	minCellSize: number;
	setCursor: (mode: string) => void;
}

export function useBuild({ world, enabled, viewport, minCellSize, setCursor }: UseBuildOptions) {
	const [buildDots, setBuildDots] = useState<Graphics[] | null>();
	const [snapEnabled, setSnapEnabled] = useState(false);
	// TODO: connect to useGrid and enable adaptive snap
	const { cursorOverUI } = useContext(DungeonContext);

	// disables cursor so pseudo-cursor can be enabled
	useEffect(() => {
		if (enabled && world) {
			setCursor("none");
		}
	}, [enabled, setCursor, world]);

	const pseudoCursor = useMemo(() => {
		if (viewport && world) {
			const graphics = world.children.find(obj => obj.name === "pseudoCursor")
				?? BuildDot({ position: new Point(0, 0), viewport, cursor: true });
			return graphics;
		}
	}, [viewport, world]);

	const placeDot = useCallback((position: Point, color?: string) => {
		if (world && viewport) {
			const graphics = BuildDot({ position, color, viewport });
			setBuildDots(prev => {
				world.addChild(graphics);
				if (prev) {
					return [...prev, graphics];
				} else {
					return [graphics];
				}
			});
		}
	}, [viewport, world]);

	const closeShape = useCallback(() => {
		if (buildDots && world) {
			const room = Room(buildDots.map(dot => {
				const { pivot, position } = dot;
				dot.destroy();
				return new Point(
					position.x - pivot.x,
					position.y - pivot.y
				);
			}));

			world.addChild(room);
			setBuildDots(null);
		}
	}, [buildDots, world]);

	const placementLine = useMemo(() => {
		const graphics = world?.children.find(obj => obj.name === "placementLine") as ExtendedGraphics
			?? new ExtendedGraphics();
		graphics.clear();
		graphics.name = "placementLine";
		graphics.zIndex = 100;
		world?.addChild(graphics);
		return graphics;
	}, [world]);


	const drawPlacementLine = useCallback(() => {
		if (placementLine && buildDots && buildDots.length > 0 && pseudoCursor) {
			const offset = pseudoCursor.getBounds();
			placementLine.clear().lineStyle({ alignment: 0.5, width: 5, color: "teal", join: LINE_JOIN.ROUND });
			placementLine.moveToPoint(buildDots[buildDots.length - 1].position.subtract({
				x: offset.width / 2,
				y: offset.height / 2
			}));
			placementLine.dashedLineToPoint(pseudoCursor.position.subtract({
				x: offset.width / 2,
				y: offset.height / 2
			}), 10, 2);
		} else {
			placementLine.clear();
		}
	}, [buildDots, placementLine, pseudoCursor]);

	const previewLines = useMemo(() => {
		const graphics = world?.children.find(obj => obj.name === "previewLines") as ExtendedGraphics
			?? new ExtendedGraphics();
		graphics.clear();
		graphics.name = "previewLines";
		graphics.zIndex = 100;
		world?.addChild(graphics);
		return graphics;
	}, [world]);

	const drawPreviewLines = useCallback(() => {
		if (buildDots && buildDots.length > 1 && pseudoCursor) {
			const offset = pseudoCursor.getBounds();
			buildDots.map((dot, index) => {
				if (index < buildDots.length - 1) {
					previewLines.lineStyle({ alignment: 0.5, width: 5, color: "skyblue", join: LINE_JOIN.ROUND });
					previewLines.moveToPoint(dot.position.subtract({
						x: offset.width / 2,
						y: offset.height / 2
					}));
					previewLines.dashedLineToPoint(buildDots[index + 1].position.subtract({
						x: offset.width / 2,
						y: offset.height / 2
					}), 10, 2);
				}
			});
		} else {
			previewLines.clear();
		}
	}, [buildDots, previewLines, pseudoCursor]);

	// pointer events
	const handleBuildPointerDown = useCallback((e: FederatedPointerEvent) => {
		if (world && enabled) {
			if (e.button === 1) {
				setCursor("grabbing");
				if (pseudoCursor) {
					pseudoCursor.visible = false;
				}
				
			}
		}
	}, [enabled, pseudoCursor, setCursor, world]);

	const handleBuildPointerMove = useCallback((e: FederatedPointerEvent) => {
		if (world && enabled && pseudoCursor && viewport) {
			if (pseudoCursor.parent != world) { world.addChild(pseudoCursor); }
			const localMouse = e.getLocalPosition(world);
			const newPoint = snapEnabled ? new Point(
				snap(localMouse.x, minCellSize),
				snap(localMouse.y, minCellSize)
			) : localMouse;
			pseudoCursor.position.copyFrom(newPoint);
			drawPlacementLine();
			drawPreviewLines();
		}
	}, [world, enabled, pseudoCursor, viewport, snapEnabled, minCellSize, drawPlacementLine, drawPreviewLines]);

	const handleBuildPointerUp = useCallback((e: FederatedPointerEvent) => {
		if (world && enabled && pseudoCursor && !cursorOverUI) {
			if (e.button === 0) {
				if (buildDots && buildDots.length > 0) {
					if (collisionTest(buildDots[0], pseudoCursor) && buildDots.length > 2) {
						closeShape();
						previewLines.clear();
						placementLine.clear();
					} else {
						placeDot(pseudoCursor.position);
					}
				} else {
					placeDot(pseudoCursor.position, "lightblue");
				}
			}

			setCursor("none");
			pseudoCursor.visible = true;
		}
	}, [world, enabled, pseudoCursor, cursorOverUI, setCursor, buildDots, closeShape, previewLines, placementLine, placeDot]);

	// key events
	const bind = useBindings();
	useEffect(() => {
		bind("escape", () => setBuildDots(null));
		bind("snap-start", () => setSnapEnabled(true));
		bind("snap-end", () => setSnapEnabled(false));
	}, [bind]);

	// deletes build dots on mode change
	useEffect(() => {
		if (!enabled) {
			buildDots?.map(dot => dot.destroy());
			setBuildDots(null);
		}
	}, [buildDots, enabled]);

	// sync with world state 
	useEffect(() => {
		if (world) {
			const worldDots = world.children.filter(obj => obj.name === "buildDot");
			if (!buildDots) {
				worldDots.map(obj => obj.destroy());
			} else {
				worldDots
					.filter(obj => !buildDots.includes(obj as Graphics))
					.map(obj => obj.destroy());
			}
		}
	}, [buildDots, world]);

	// registers event listeners
	useEffect(() => {
		if (world && enabled) {
			world.on("pointerdown", handleBuildPointerDown);
			world.on("pointerup", handleBuildPointerUp);
			world.on("pointermove", handleBuildPointerMove);
			world.on("pointerupoutside", handleBuildPointerUp);
		}

		return () => {
			world?.removeListener("pointerdown", handleBuildPointerDown);
			world?.removeListener("pointerup", handleBuildPointerUp);
			world?.removeListener("pointermove", handleBuildPointerMove);
			world?.removeListener("pointerupoutside", handleBuildPointerUp);
		};
	}, [enabled, handleBuildPointerDown, handleBuildPointerMove, handleBuildPointerUp, world]);
}