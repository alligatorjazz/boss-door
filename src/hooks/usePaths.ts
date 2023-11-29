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

// TODO: implement usePaths, then add to usePen
export function usePaths({ world, rooms, paths, setPaths }: UsePathsOptions) {
	const pathLayer = useMemo(() => {
		const graphics = world?.children.find(obj => obj.name == "pathLayer") ?? new ExtendedGraphics();
		graphics.name = "pathLayer";
		return graphics as ExtendedGraphics;
	}, [world?.children]);

	// draw paths
	useEffect(() => {
		console.count("drawing paths");
		paths.map(path => {
			const [{ roomId: id1, point: pRoom1 }, { roomId: id2, point: pRoom2 }] = path.between;
			const room1 = rooms.find(room => room.id == id1);
			const room2 = rooms.find(room => room.id == id2);
			try {
				if (!(room1 && room2)) {
					throw new Error(`Path could not be drawn between: ${room1} -> ${room2}`);
				}

				const [p1World, p2World]: [IPointData, IPointData] = [
					{
						x: pRoom1.x + room1.position.x,
						y: pRoom1.y + room1.position.y,
					},
					{
						x: pRoom2.x + room2.position.x,
						y: pRoom2.y + room2.position.y,
					}
				];

				pathLayer
					.clear()
					.lineStyle({ alignment: 0.5, color: "black" })
					.moveTo(p1World.x, p1World.y)
					.lineTo(p2World.x, p2World.y);
			} catch (err) {
				console.error(err);
			}
		});
	}, [pathLayer, paths, rooms]);

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

	return { link, sever, changePathNode };
}