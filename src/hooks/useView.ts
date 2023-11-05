import { Viewport } from "pixi-viewport";
import { IApplicationOptions, Application, Container, Graphics } from "pixi.js";
import { useState, useCallback, useEffect, MutableRefObject } from "react";

type ViewOptions = Partial<IApplicationOptions> & {
	worldWidth: number,
	worldHeight: number,
	ref: MutableRefObject<HTMLElement | null>
};

type DrawCallback = ({ app, world }: { app: Application, world: Container }) => void;
type ViewHandles = {
	app?: Application | null;
	world?: Container | null;
	viewport?: Viewport | null;
	useCanvas: (callback: DrawCallback) => void;
};

export function useView(options: ViewOptions): Readonly<ViewHandles> {
	const [app, setApp] = useState<Application | null>();
	const [viewport, setViewport] = useState<Viewport | null>();
	const [world, setWorld] = useState<Container | null>();

	const init = useCallback(() => {
		const { worldWidth, worldHeight, ...appOptions } = options;
		const app = new Application(appOptions);
		const viewport = new Viewport({
			screenWidth: app.view.width,
			screenHeight: app.view.height,
			worldWidth,
			worldHeight,
			events: app.renderer.events
		});

		viewport.cursor = "move";

		viewport
			.drag()
			.decelerate()
			.wheel()
			.clamp({ direction: "all" });
		// viewport.fit();
		viewport.moveCenter(worldWidth / 2, worldHeight / 2);

		const world = new Container();
		world.sortableChildren = true;
		world.position.set(worldWidth / 2, worldHeight / 2);

		const bg = new Graphics()
			.beginFill("skyblue")
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
	}, [app, init, options.ref]);

	// ensures viewport size maintains parity with app size
	useEffect(() => {
		if (app && viewport) {
			app.renderer.on("resize", () => {
				viewport.resize(app.view.width, app.view.height);
			});
		}
	}, [app, viewport]);

	const useCanvas = useCallback((callback: DrawCallback) => {
		if (app && world) {
			callback({ app, world });
		}
	}, [app, world]);

	return { app, world, viewport, useCanvas };
}