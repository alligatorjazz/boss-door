import { Drag, IDragOptions, IWheelOptions, Viewport, Wheel } from "pixi-viewport";

class ExtendedDrag extends Drag {
	public wheel(event: WheelEvent): boolean {
		if (this.paused) {
			return false;
		}

		if (this.options.wheel) {
			// console.log("drag plugin: running wheel proc");
			const wheel = this.parent.plugins.get("wheel", true) as ExtendedWheel;

			if (!wheel || ((!wheel.options.wheelZoom || !wheel.keyIsPressed) && !event.ctrlKey)) {
				const step = event.deltaMode ? this.options.lineHeight : 1;

				const deltas = [event.deltaX, event.deltaY];
				const [deltaX, deltaY] = this.options.wheelSwapAxes ? deltas.reverse() : deltas;

				if (this.xDirection) {
					this.parent.x += deltaX * step * this.options.wheelScroll * this.reverse;
				}
				if (this.yDirection) {
					this.parent.y += deltaY * step * this.options.wheelScroll * this.reverse;
				}
				if (this.options.clampWheel) {
					this.clamp();
				}
				this.parent.emit("wheel-scroll", this.parent);
				this.parent.emit("moved", { viewport: this.parent, type: "wheel" });
				if (!this.parent.options.passiveWheel) {
					event.preventDefault();
				}
				if (this.parent.options.stopPropagation) {
					event.stopPropagation();
				}

				return true;
			}
		}

		return false;
	}
}

class ExtendedWheel extends Wheel {
	/** Flags whether the keys required to zoom are pressed currently. */
	public keyIsPressed: boolean;
	constructor(parent: Viewport, options: IWheelOptions = {}) {
		super(parent, options);
		this.keyIsPressed = false;
	}

}

export class ExtendedViewport extends Viewport {
	public drag(options?: IDragOptions): Viewport {
		this.plugins.add("drag", new ExtendedDrag(this, options));

		return this;
	}

	public wheel(options?: IDragOptions): Viewport {
		this.plugins.add("wheel", new ExtendedWheel(this, options));

		return this;
	}
}