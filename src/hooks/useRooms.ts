import { Container, Graphics } from "pixi.js";
import { ReactNode, useCallback, useState } from "react";
import { RoomObject } from "../components/canvas/RoomObject";
import { RoomHandle, createRoom } from "../lib/rooms";
import { DungeonRoom } from "../types";
type RemoveOptions = { id: string };

export function useRooms(world?: Container | null) {
	const [rooms, setRooms] = useState<DungeonRoom[]>([]);
	const getObject = useCallback((room: DungeonRoom) => {
		return world?.children.find(obj => obj.name === room.id) as Graphics | undefined;
	}, [world?.children]);

	const remove = useCallback(({ id }: RemoveOptions) => {
		setRooms(prevNodes => {
			return prevNodes.filter(room => room.id !== id);
		});
	}, []);

	const map = useCallback((cb: (handle: RoomHandle, index?: number, arr?: RoomHandle[]) => ReactNode) => {
		return (rooms.map(room => ({ room, get obj() { return getObject(room); } })) as RoomHandle[])
			.map(cb);
	}, [getObject, rooms]);

	const filter = useCallback((cb: (handle: RoomHandle, index?: number, arr?: RoomHandle[]) => boolean) => {
		return (rooms.map(room => ({ room, get obj() { return getObject(room); } })) as RoomHandle[])
			.filter(cb);
	}, [getObject, rooms]);

	const find = useCallback((cb: (handle: RoomHandle, index?: number, arr?: RoomHandle[]) => boolean) => {
		return (rooms.map(room => ({ room, get obj() { return getObject(room); } })) as RoomHandle[])
			.find(cb);
	}, [getObject, rooms]);

	const add = useCallback((params: Pick<DungeonRoom, "points">) => {
		const room = createRoom(params);
		setRooms(prevNodes => [...prevNodes, room]);
		world?.addChild(RoomObject(room));
		return {
			room, get obj() {
				return world?.children.find(obj => obj.name === room.id) as Graphics | undefined;
			}
		} as RoomHandle;
	}, [world]);

	return { add, remove,list: rooms, map, filter, find };
}