import { Graphics } from "pixi.js";

interface Props {
	bgColor: string,
	color: string
}

export function KeyIcon({ bgColor, color }: Props) {
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
		.beginFill(color)
		.drawRect(-d.staff.w / 2, o.staff.y, d.staff.w, d.staff.h)
		// teeth
		.drawRoundedRect(d.staff.w / 2 + o.t1.x, d.staff.h + o.staff.y + o.t1.y, 10, 7, 10)
		.drawRoundedRect(d.staff.w / 2 + o.t2.x, d.staff.h + o.staff.y + o.t2.y, 14, 7, 10)
		// horns
		.drawEllipse(0, o.horns.y, 20, 20)
		// crop
		.beginFill(bgColor)
		.drawEllipse(0, o.crop.y, 24, 16)
		// handle
		.beginFill(color)
		.drawCircle(0, o.handle, d.handle)
		.beginFill(bgColor)
		.drawCircle(0, o.handle, d.handle / 2.5);

	return icon;
}