import { Graphics } from "pixi.js";
import { Barrier } from "./Barrier";

type Props = { color: string; }
export function BossDoor({ color }: Props) {
	// offsets
	const o = {
		handle: -15,
		staff: { y: -5 },
		t1: { x: -5, y: -20 },
		t2: { x: -5, y: -7 },
		horns: { y: -35 },
		crop: { y: -42 }
	};

	// dimensions
	const d = {
		handle: 15,
		staff: { w: 10, h: 45 }
	};

	const icon = new Graphics()

		// staff
		.beginFill("black")
		.drawRect(-d.staff.w / 2, o.staff.y, d.staff.w, d.staff.h)
		// teeth
		.drawRoundedRect(d.staff.w / 2 + o.t1.x, d.staff.h + o.staff.y + o.t1.y, 10, 7, 10)
		.drawRoundedRect(d.staff.w / 2 + o.t2.x, d.staff.h + o.staff.y + o.t2.y, 14, 7, 10)
		// horns
		.drawEllipse(0, o.horns.y, 20, 20)
		// crop
		.beginFill(color)
		.drawEllipse(0, o.crop.y, 24, 16)
		// handle
		.beginFill("black")
		.drawCircle(0, o.handle, d.handle)
		.beginFill(color)
		.drawCircle(0, o.handle, d.handle / 2.5);


	const node = Barrier({ color, icon });

	return node;
}