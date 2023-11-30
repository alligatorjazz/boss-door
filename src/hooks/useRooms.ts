import { Container, Graphics } from "pixi.js";
import { ReactNode, useCallback } from "react";
import { RoomObject } from "../components/canvas/RoomObject";
import { RoomHandle, createRoom } from "../lib/rooms";
import { CustomDispatch, DungeonRoom } from "../types";
type RemoveOptions = { id: string };
type UseRoomsOptions = {
	world?: Container | null;
	readonly rooms: DungeonRoom[];
	setRooms: CustomDispatch<DungeonRoom[]>;
}

export function useRooms({ world, rooms, setRooms }: UseRoomsOptions) {
	const getObject = useCallback((room: DungeonRoom) => {
		return world?.children.find(obj => obj.name === room.id) as Graphics | undefined;
	}, [world?.children]);

	const remove = useCallback(({ id }: RemoveOptions) => {
		setRooms(prevNodes => {
			return prevNodes.filter(room => room.id !== id);
		});
	}, [setRooms]);

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
		console.count("adding room");
		// debugger;
		const room = createRoom(params);
		setRooms(prev => [...prev, room]);
		world?.addChild(RoomObject(room));
		return {
			room, get obj() {
				return world?.children.find(obj => obj.name === room.id) as Graphics | undefined;
			}
		} as RoomHandle;
	}, [setRooms, world]);

	return { add, remove, list: rooms, map, filter, find };
}