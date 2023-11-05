
import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { graphicsTest } from "../../components/graphicsTest";
import { useView } from "../../hooks/useView";
import { Application, Container, Graphics, IApplicationOptions } from "pixi.js";
import { IViewportOptions, Viewport } from "pixi-viewport";

export function Editor() {
	const options: Partial<IApplicationOptions> & {
		worldWidth: number,
		worldHeight: number
	} = useMemo(() => ({
		width: window.innerWidth,
		height: window.innerHeight,
		worldWidth: 10000,
		worldHeight: 10000
	}), []);

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
	const containerRef = useRef<HTMLDivElement>(null);
	useEffect(() => {
		const { current: container } = containerRef;
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
	}, [app, init]);


	// drawing 
	useEffect(() => {
		if (world && app) {
			world.addChild(graphicsTest());
			console.log(app.stage.children);
		}
	}, [app, world]);

	return (
		<div className="w-[100dvw] h-[100dvh] overflow-hidden" ref={containerRef}></div>
	);
}