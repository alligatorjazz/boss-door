import React from "react";
import ReactDOM from "react-dom/client";
import {
	createBrowserRouter,
	createRoutesFromElements,
	Route,
	RouterProvider,
} from "react-router-dom";
import "./Main.css";
import { Editor } from "./routes/Editor/Index";

// You can do this:
const router = createBrowserRouter(
	createRoutesFromElements(
		<Route path="/" element={<Editor />}>
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