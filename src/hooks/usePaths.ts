import { ExtendedGraphics } from "pixi-extended-graphics";
import { Container, IPointData } from "pixi.js";
import { useCallback, useEffect, useMemo } from "react";
import { MapNode } from "../lib/nodes";
import { CustomDispatch, DungeonPath, DungeonRoom } from "../types";
type UsePathsOptions = {
	world?: Container | null;
	readonly rooms: DungeonRoom[];
	paths: DungeonPath[];
	setPaths: CustomDispatch<DungeonPath[]>;
}

export function usePaths({ world, rooms, paths, setPaths }: UsePathsOptions) {
	const pathLayer = useMemo(() => {
		const prev = world?.children.find(obj => obj.name == "pathLayer");
		const graphics = prev ?? new ExtendedGraphics();
		graphics.name = "pathLayer";
		if (graphics.parent != world) { 
			world?.addChild(graphics); 
		}
		return graphics as ExtendedGraphics;
	}, [world]);

	const drawPaths = useCallback(() => {
		pathLayer.clear();
		paths.map(path => {
			const [{ roomId: id1, point: pRoom1 }, { roomId: id2, point: pRoom2 }] = path.between;
			const room1 = world?.children.find(room => room.name == id1);
			const room2 = world?.children.find(room => room.name == id2);
			try {
				if (!(room1 && room2)) {
					throw new Error(`Path could not be drawn between: ${room1} -> ${room2}`);
				}

				const [p1World, p2World]: [IPointData, IPointData] = [
					room1.toGlobal(pRoom1),
					room2.toGlobal(pRoom2),
				];

				console.count("drawing path");
				pathLayer
					.lineStyle({ alignment: 0.5, color: "black", width: 4 })
					.moveTo(p1World.x, p1World.y)
					.lineTo(p2World.x, p2World.y);
			} catch (err) {
				console.error(err);
			}
		});
	}, [pathLayer, paths, world?.children]);

	// draw paths
	useEffect(() => {
		drawPaths();
	}, [drawPaths, pathLayer, paths, rooms]);

	// create handles to add / sever paths
	const link = useCallback((between: DungeonPath["between"]) => {
		const path = { between, id: crypto.randomUUID() };
		setPaths(prev => [...prev, path]);
		return path;
	}, [setPaths]);

	const sever = useCallback((pathId: string) => {
		setPaths(prev => prev.filter(path => path.id !== pathId));
	}, [setPaths]);

	const changePathNode = useCallback((pathId: string, node: MapNode) => {
		try {
			setPaths(prev => {
				const index = prev.findIndex((path) => path.id == pathId);
				if (index === -1) {
					throw new Error(`Path with id ${pathId} not found.`);
				}
				return [...prev.slice(0, index), { ...prev[index], node }, ...prev.slice(index + 1)];
			});
		} catch (err) {
			console.error(err);
		}
	}, [setPaths]);

	return { link, sever, drawPaths, changePathNode };
}