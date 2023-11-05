
import { useEffect, useMemo, useRef } from "react";
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

	const { app, viewport, canvas } = useMemo(() => {
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
			.decelerate();
		
		const canvas = new Container();
		canvas.sortableChildren = true;

		const bg = new Graphics()
			.beginFill("skyblue")
			.drawRect(0, 0, worldWidth, worldHeight);
		bg.zIndex = -100;

		canvas.addChild(bg);
		viewport.addChild(canvas);
		app.stage.addChild(viewport);
		return { app, viewport, canvas };
	}, [options]);

	// initializing app
	const containerRef = useRef<HTMLDivElement>(null);
	useEffect(() => {
		const { current: container } = containerRef;
		if (!container) {
			throw new Error("Could not initialize app because the container was not found.");
		}

		// remove any extraneous canvases
		document.querySelectorAll("canvas").forEach(element => element.remove());
		if (!document.body.contains(app.view as HTMLCanvasElement)) {
			app.resizeTo = container;
			container.appendChild(app.view as HTMLCanvasElement);
		}
	}, [app]);


	// drawing 
	useEffect(() => {
		canvas.addChild(graphicsTest());
		console.log(app.stage.children);
	}, [app.stage.children, canvas]);

	return (
		<div className="w-[100dvw] h-[100dvh] overflow-hidden" ref={containerRef}></div>
	);
}