import { AppProvider } from "@pixi/react";
import { Application } from "pixi.js";
import { Outlet } from "react-router-dom";

export function Editor() {
	return (
		<AppProvider value={new Application({
			width: window.innerWidth,
			height: window.innerHeight,
			backgroundColor: "gray"
		})}>
			<Outlet />
		</AppProvider>
	);
}
