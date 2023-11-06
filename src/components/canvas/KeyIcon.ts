import { Graphics } from "pixi.js";

interface Props {
	bgColor: string,
	color: string,
	horns?: boolean
}

export function KeyIcon({ bgColor, color, horns }: Props) {
	// offsets
	const o = {
		handle: -15,
		staff: { y: -5 },
		t1: { x: -5, y: -20 },
		t2: { x: -5, y: -7 },
		horns: { y: -35 },
		crop1: { y: -38 },
		crop2: { x: 20, y: -40 },
		crop3: { y: -58 }
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
		.drawRoundedRect(d.staff.w / 2 + o.t2.x, d.staff.h + o.staff.y + o.t2.y, 14, 7, 10);

	if (horns) {
		icon
			// horns
			.beginFill(color)
			.drawEllipse(0, o.horns.y, 18, 20)
			// crop
			.beginFill(bgColor)
			.drawEllipse(0, o.crop1.y, 20, 10)
			.endFill()
			.beginFill(bgColor)
			.lineStyle({ color, width: 0, alignment: 1 })
			.moveTo(o.crop2.x, o.crop2.y)
			.lineTo(o.crop2.x / 2, o.crop3.y * 0.93)
			.lineTo(0, o.crop3.y)
			.lineTo(-o.crop2.x / 2, o.crop3.y * 0.93)
			.lineTo(-o.crop2.x, o.crop2.y);
	}

	icon
		// handle
		.beginFill(color)
		.drawCircle(0, o.handle, d.handle)
		.beginFill(bgColor)
		.drawCircle(0, o.handle, d.handle / 2.5);

	return icon;
}