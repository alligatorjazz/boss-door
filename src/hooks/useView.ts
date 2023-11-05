import { Viewport } from "pixi-viewport";
import { IApplicationOptions, Application, Container, Graphics } from "pixi.js";
import { useState, useCallback,  useEffect, MutableRefObject } from "react";
import { graphicsTest } from "../components/graphicsTest";

type ViewOptions = Partial<IApplicationOptions> & {
	worldWidth: number,
	worldHeight: number,
	ref: MutableRefObject<HTMLElement | null>
};

type DrawCallback = ({ app, world }: { app: Application, world: Container }) => void;
type ViewHandles = {
    app: Application | null | undefined;
    world: Container | null | undefined;
    draw: (callback: DrawCallback) => void;
};

export function useView(options: ViewOptions): Readonly<ViewHandles> {
	const [app, setApp] = useState<Application | null>();
	const [world, setWorld] = useState<Container | null>();

	const init = useCallback(() => {
		const { worldWidth, worldHeight, ...appOptions } = options;
		const app = new Application(appOptions);
		const viewport = new Viewport({
			screenWidth: window.innerWidth,
			screenHeight: window.innerHeight,
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

		const world = new Container();
		world.sortableChildren = true;

		const bg = new Graphics()
			.beginFill("skyblue")
			.drawRect(0, 0, worldWidth, worldHeight);
		bg.zIndex = -100;

		world.addChild(bg);
		viewport.addChild(world);
		app.stage.addChild(viewport);
		setApp(app);
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


	// drawing 
	useEffect(() => {
		if (world && app) {
			world.addChild(graphicsTest());
			console.log(app.stage.children);
		}
	}, [app, world]);


	const draw = useCallback((callback: DrawCallback) => {
		if (app && world) {
			callback({ app, world });
		} 
	}, [app, world]);

	return { app, world, draw };
}