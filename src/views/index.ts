import { Application, Container, DisplayObject, IApplicationOptions } from "pixi.js";

const useDispatch = (listeners: (() => void)[]) => {
	return () => listeners.map(listener => listener());
};

function useDraw(target: Container, dispatch: () => void) {
	return (...objects: DisplayObject[]) => {
		for (const obj of objects) {
			target.addChild(obj);
			dispatch();
		}
	};
}

function useErase(target: Container, dispatch: () => void) {
	return (...objects: DisplayObject[]) => {
		for (const obj of objects) {
			target.removeChild(obj);
			dispatch();
		}
	};
}

type ViewState = Record<string, string>;
type AppState = Omit<Application, "screen" | "view">;

export function View(options: Partial<IApplicationOptions>) {
	const app = new Application(options);
	let listeners: (() => void)[] = [];
	const state: ViewState = {};
	const dispatch = useDispatch(listeners);
	const draw = useDraw(app.stage, dispatch);
	const erase = useErase(app.stage, dispatch);
	const reset = () => app.stage.removeChildren();
	const set = <T extends keyof AppState>(key: T, value: AppState[T]) => {
		(app as AppState)[key] = value;
	};

	const render = (target: HTMLDivElement | null) => {
		if (!target) {
			throw new Error("Couldn't render to target because ref was not initialized.");
		}

		app.resizeTo = target;
		app.view.width = target.offsetWidth;
		app.view.height = target.offsetHeight;

		target.appendChild(app.view as HTMLCanvasElement);
		return () => {
			target.removeChild(app.view as HTMLCanvasElement);
		};
	};

	return {
		subscribe: (listener: () => void) => {
			listeners = [...listeners, listener];
			return () => {
				listeners = listeners.filter(l => l !== listener);
			};
		},
		getSnapshot: () => state,
		draw,
		erase,
		reset,
		render,
		set
	};
}
