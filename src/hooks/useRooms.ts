import { Container, Graphics } from "pixi.js";
import { ReactNode, useCallback, useEffect, useState } from "react";
import { RoomObject } from "../components/canvas/RoomObject";
import { RoomHandle, createRoom } from "../lib/rooms";
import { DungeonRoom } from "../types";
type RemoveOptions = { id: string };

export function useRooms(world?: Container | null) {
	const [rooms, setRooms] = useState<DungeonRoom[]>([]);
	const [objects, setObjects] = useState<Graphics[]>([]);

	// sync rooms with objects
	useEffect(() => {
		setObjects(prev => {
			const newObjects: Graphics[] = [];
			for (const room of rooms) {
				const oldObject = prev.find(obj => obj.name === room.id);
				if (oldObject) {
					newObjects.push(oldObject);
					continue;
				}

				const obj = RoomObject(room);
				newObjects.push(obj);
			}

			// delete objects that correspond to non-extant rooms
			for (const obj of prev.filter(obj => !newObjects.includes(obj))) {
				console.count("destroying object");
				obj.destroy();
			}

			return newObjects;
		});
		console.log(rooms);
	}, [rooms]);

	// sync objects with world 
	useEffect(() => {
		if (world) {
			for (const obj of objects) {
				if (!world.children.includes(obj)) {
					world.addChild(obj);
				}
			}
		}
	}, [objects, world]);

	const remove = useCallback(({ id }: RemoveOptions) => {
		setRooms(prevNodes => {
			return prevNodes.filter(room => room.id !== id);
		});
	}, []);

	const removeAll = useCallback(() => {
		console.count("remove all called");
		setRooms(() => {
			setObjects(prev => {
				prev.map(prevObj => prevObj.destroy());
				return [];
			});
			return [];
		});
	}, []);

	const map = useCallback((cb: (handle: RoomHandle, index?: number, arr?: RoomHandle[]) => ReactNode) => {
		return (rooms.map(room => ({ room, obj: objects.find(obj => obj.name === room.id) })) as RoomHandle[])
			.map(cb);
	}, [rooms, objects]);

	const filter = useCallback((cb: (handle: RoomHandle, index?: number, arr?: RoomHandle[]) => boolean) => {
		return (rooms.map(room => ({ room, obj: objects.find(obj => obj.name === room.id) })) as RoomHandle[])
			.filter(cb);
	}, [rooms, objects]);

	const find = useCallback((cb: (handle: RoomHandle, index?: number, arr?: RoomHandle[]) => boolean) => {
		return (rooms.map(room => ({ room, obj: objects.find(obj => obj.name === room.id) })) as RoomHandle[])
			.find(cb);
	}, [rooms, objects]);

	const add = useCallback((params: Pick<DungeonRoom, "points" | "position">) => {
		const room = createRoom(params);
		setRooms(prevNodes => [...prevNodes, room]);
		return {
			room, get obj() {
				return objects.find(obj => obj.name === room.id);
			}
		} as RoomHandle;
	}, [objects]);

	return { add, remove, removeAll, list: rooms, map, filter, find };
}