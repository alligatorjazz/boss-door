import React from "react";
import ReactDOM from "react-dom/client";
import {
	createBrowserRouter,
	createRoutesFromElements,
	Route,
	RouterProvider,
} from "react-router-dom";
import "./Main.css";
import { Editor } from "./views/Editor";

// You can do this:
const router = createBrowserRouter(
	createRoutesFromElements(
		<Route path="/" element={<Editor />}>
			{/* <Route index element={<h1 className="text-2xl">Hello World!</h1>} /> */}
		</Route>
	)
);

const root = document.getElementById("root");
if (!root) {
	throw new Error("Could not initialize root.");
}

ReactDOM.createRoot(root).render(
	<React.StrictMode>
		<RouterProvider router={router} />
	</React.StrictMode>
);