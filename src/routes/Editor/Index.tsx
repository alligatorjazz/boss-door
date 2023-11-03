
import { useEffect, useMemo, useRef, useSyncExternalStore } from "react";
import { View } from "../../views";
import { graphicsTest } from "../../components/graphicsTest";

export function Editor() {
	const viewRef = useRef<HTMLDivElement>(null);
	const { subscribe, getSnapshot, ...view } = useMemo(() => View({}), []);

	const viewState = useSyncExternalStore(subscribe, getSnapshot);

	useEffect(() => {
		view.draw(graphicsTest());
		console.log(viewState);
	}, [view, viewState]);

	useEffect(() => {
		const unrender = view.render(viewRef.current);
		return unrender;
	}, [view]);

	return (
		<div className="w-[100dvw] h-[100dvh]" ref={viewRef}></div>
	);
}