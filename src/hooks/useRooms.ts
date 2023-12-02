import { Container, Graphics } from "pixi.js";
import { ReactNode, useCallback, useEffect } from "react";
import { RoomObject } from "../components/canvas/RoomObject";
import { RoomHandle, createRoom } from "../lib/rooms";
import { CustomDispatch, DungeonRoom } from "../types";
import { createNodeObject } from "../lib/nodes";
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

	const setRoom = useCallback((room: DungeonRoom) => {
		return (cb: (prev: DungeonRoom) => DungeonRoom) => {
			setRooms(prev => {
				const index = prev.findIndex(data => data.id === room.id);
				if (index === -1) {
					throw new Error("Tried to set room that does not exist.");
				}

				const newData = cb(room);
				console.log("setting room data: ", newData);
				return [...prev.slice(0, index), newData, ...prev.slice(index + 1, prev.length)];
			});
		};
	}, [setRooms]);

	const remove = useCallback(({ id }: RemoveOptions) => {
		setRooms(prevNodes => {
			return prevNodes.filter(data => data.id !== id);
		});
	}, [setRooms]);

	const map = useCallback((cb: (handle: RoomHandle, index?: number, arr?: RoomHandle[]) => ReactNode | void) => {
		return (rooms.map(data => ({
			get data() { return rooms.find(room => room.id === data.id); }, get obj() { return getObject(data); },
			set: setRoom(data)
		})) as RoomHandle[])
			.map(cb);
	}, [getObject, rooms, setRoom]);

	const filter = useCallback((cb: (handle: RoomHandle, index?: number, arr?: RoomHandle[]) => boolean) => {
		return (rooms.map(data => ({
			get data() { return rooms.find(room => room.id === data.id); }, get obj() { return getObject(data); },
			set: setRoom(data)
		})) as RoomHandle[])
			.filter(cb);
	}, [getObject, rooms, setRoom]);

	const find = useCallback((cb: (handle: RoomHandle, index?: number, arr?: RoomHandle[]) => boolean) => {
		return (rooms.map(data => ({
			get data() { return rooms.find(room => room.id === data.id); }, get obj() { return getObject(data); },
			set: setRoom(data)
		})) as RoomHandle[])
			.find(cb);
	}, [getObject, rooms, setRoom]);

	const add = useCallback((params: Pick<DungeonRoom, "points">) => {
		console.count("adding room");
		// debugger;
		const data = createRoom(params);
		setRooms(prev => [...prev, data]);
		world?.addChild(RoomObject(data));
		return {
			get data() { return rooms.find(room => room.id === data.id); }, get obj() {
				return world?.children.find(obj => obj.name === data.id) as Graphics | undefined;
			}
		} as RoomHandle;
	}, [rooms, setRooms, world]);


	useEffect(() => {
		map(room => {
			if (room.data.nodes.length > 0) {
				const nodeContainer = new Container();
				for (const node of room.data.nodes) {
					const nodeObject = world?.children.find(obj => obj.name === node.id) ?? createNodeObject(node);
					nodeContainer.addChild(nodeObject);
				}
				room.obj.removeChildren();
				room.obj.addChild(nodeContainer);
			}
		});
	}, [map, world?.children]);

	return { add, remove, list: rooms, map, filter, find };
}