import { arrayMoveImmutable } from "array-move";
import { useCallback, useState } from "react";
import { version } from "../../package.json";
import { CustomDispatch, Dungeon, DungeonFloor, DungeonPath, DungeonRoom } from "../types";

type FloorHandles = {
	readonly index: number,
	setOrder: CustomDispatch<number>
	setRooms: CustomDispatch<DungeonRoom[]>
	setPaths: CustomDispatch<DungeonPath[]>
} & Readonly<DungeonFloor>;

export function useDungeon(data?: Dungeon) {
	const [name, setName] = useState<string>(data?.name ?? "New Dungeon");
	const [floors, setFloors] = useState<DungeonFloor[]>(data?.floors ?? [{
		id: crypto.randomUUID(),
		name: "Floor 1",
		rooms: [],
		paths: []
	}]);

	const getFloorHandles = useCallback((index: number): FloorHandles => {
		return {
			...floors[index],
			index,
			setOrder: (value) => {
				if (typeof value === "number") {
					setFloors(prev => arrayMoveImmutable(prev, index, value));
				} else {
					setFloors(prev => arrayMoveImmutable(prev, index, value(index)));
				}
			},
			setPaths: (value) => {
				if (typeof value === "function") {
					setFloors(prev => [...prev.slice(0, index), {
						...prev[index],
						paths: value(prev[index].paths)
					}, ...prev.slice(index + 1)]);
				} else {
					setFloors(prev => [...prev.slice(0, index), {
						...prev[index],
						paths: value
					}, ...prev.slice(index + 1)]);
				}
			},
			setRooms: (value) => {
				if (typeof value === "function") {
					setFloors(prev => [...prev.slice(0, index), {
						...prev[index],
						rooms: value(prev[index].rooms)
					}, ...prev.slice(index + 1)]);
				} else {
					setFloors(prev => [...prev.slice(0, index), {
						...prev[index],
						rooms: value
					}, ...prev.slice(index + 1)]);
				}
			}
		};
	}, [floors]);

	const serialize = useCallback((): Dungeon => {
		return { name, floors, version };
	}, [floors, name]);

	return { getFloorHandles, serialize, name, setName };
}