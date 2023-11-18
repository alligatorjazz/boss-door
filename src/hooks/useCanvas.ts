import { Viewport } from "pixi-viewport";
import { Application, Container, Graphics } from "pixi.js";
import { useCallback, useEffect, useState } from "react";
import { ExtendedViewport } from "../lib/viewport";
import { CanvasHandles, CanvasOptions } from "../types";

export function useCanvas({ ...options }: CanvasOptions): Readonly<CanvasHandles> {
	const [app, setApp] = useState<Application | null>();
	const [viewport, setViewport] = useState<Viewport | null>();
	const [world, setWorld] = useState<Container | null>();
	const [appContainer, setAppContainer] = useState<HTMLElement>();

	const init = useCallback(() => {
		// console.count("initializing app...");
		const { worldWidth, worldHeight, backgroundColor, ...appOptions } = options;
		const app = new Application(appOptions);
		// app.renderer.events.cursorStyles = {
		// 	...app.renderer.events.cursorStyles,
		// 	empty: `url("${empty}"),auto`
		// };

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
			setAppContainer(container);
		}
	}, [app, init, options.ref, world]);

	// ensures viewport size maintains parity with app size
	useEffect(() => {
		if (app && viewport) {
			app.renderer.on("resize", () => {
				viewport.resize(app.view.width, app.view.height);
			});
		}

		return () => {
			app?.destroy();
		};
	}, [app, viewport]);

	const setCursor = useCallback((mode: string) => {
		if (app && appContainer && app.view.parentNode === appContainer) {
			return appContainer.style.setProperty("cursor", mode);
		}
		return () => console.warn("setCursor() called before app initialized.");
	}, [app, appContainer]);

	return { app, world, viewport, setCursor };
}