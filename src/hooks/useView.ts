import { Viewport } from "pixi-viewport";
import { Application, Container, FederatedPointerEvent, Graphics, IApplicationOptions } from "pixi.js";
import { MutableRefObject, useCallback, useEffect, useState } from "react";
import { ExtendedViewport } from "../components/canvas/ExtendedViewport";

type ViewOptions = Partial<IApplicationOptions> & {
	worldWidth: number,
	worldHeight: number,
	ref: MutableRefObject<HTMLElement | null>;
	mode: ViewMode;
};

type DrawCallback = ({ app, world }: { app: Application, world: Container }) => void;
export type ViewMode = "move" | "static";
type ViewHandles = {
	app?: Application | null;
	world?: Container | null;
	viewport?: Viewport | null;
	build: (callback: DrawCallback) => void;
};

export function useView({ mode, ...options }: ViewOptions): Readonly<ViewHandles> {
	const [app, setApp] = useState<Application | null>();
	const [viewport, setViewport] = useState<Viewport | null>();
	const [world, setWorld] = useState<Container | null>();

	// callbacks to change cursors based on pointer events
	const handlePointerDown = useCallback((e: FederatedPointerEvent) => {
		console.log(e, world?.cursor);
		if (world) {
			switch (mode) {
				case "move": {
					if (e.button === 0)
						world.cursor = "grabbing";
					break;
				}
				case "static": {
					world.cursor = "default";
					break;
				}
			}
		}

	}, [mode, world]);

	// callbacks to change cursors based on pointer events
	const handlePointerUp = useCallback(() => {
		if (world) {
			switch (mode) {
				case "move": {
					world.cursor = "grab";
					break;
				}
				case "static": {
					world.cursor = "default";
					break;
				}
			}
		}

	}, [mode, world]);

	// callbacks to change cursors based on pointer events
	const handleWheel = useCallback(() => {
		if (world) {
			switch (mode) {
				case "static": {
					world.cursor = "default";
					break;
				}
			}
		}
	}, [mode, world]);

	const init = useCallback(() => {
		const { worldWidth, worldHeight, backgroundColor, ...appOptions } = options;
		const app = new Application(appOptions);
		const viewport = new ExtendedViewport({
			screenWidth: app.view.width,
			screenHeight: app.view.height,
			worldWidth,
			worldHeight,
			events: app.renderer.events
		});

		viewport.moveCenter(worldWidth / 2, worldHeight / 2);
		const world = new Container();
		world.sortableChildren = true;
		world.eventMode = "static";
		world.position.set(worldWidth / 2, worldHeight / 2);

		const bg = new Graphics()
			.beginFill(backgroundColor)
			.drawRect(-worldWidth / 2, -worldHeight / 2, worldWidth, worldHeight);

		bg.zIndex = -100;

		world.addChild(bg);
		viewport.addChild(world);
		app.stage.addChild(viewport);

		setApp(app);
		setViewport(viewport);
		setWorld(world);
	}, [options]);

	// initializing app
	useEffect(() => {
		const { current: container } = options.ref;
		if (!container) {
			throw new Error("Could not initialize app because the container was not found.");
		}

		if (!app) {
			init();
		}

		if (app && app.view && container) {
			container.appendChild(app.view as HTMLCanvasElement);
			app.resize();
			app.resizeTo = container;
		}

		if (world) {
			world.on("pointerdown", handlePointerDown);
			world.on("pointerup", handlePointerUp);
			world.on("wheel", handleWheel);
		}
	}, [app, handlePointerDown, handlePointerUp, handleWheel, init, options.ref, world]);

	// ensures viewport size maintains parity with app size
	useEffect(() => {
		if (app && viewport) {
			app.renderer.on("resize", () => {
				viewport.resize(app.view.width, app.view.height);
			});
		}
	}, [app, viewport]);

	// handling mode changes
	useEffect(() => {
		if (world && viewport) {
			viewport.plugins.removeAll();
			switch (mode) {
				case "move": {
					viewport
						.drag({ mouseButtons: "left", wheel: true })
						.decelerate()
						.clamp({ direction: "all" })
						.wheel({ keyToPress: ["AltLeft"], wheelZoom: true, trackpadPinch: true });
					world.cursor = "grab";
					break;
				} case "static": {
					viewport
						.clamp({ direction: "all" });
					world.cursor = "default";
					break;
				}
			}
		}
	}, [mode, viewport, world]);

	const build = useCallback((callback: DrawCallback) => {
		if (app && world) {
			callback({ app, world });
		}
	}, [app, world]);

	return { app, world, viewport, build };
}