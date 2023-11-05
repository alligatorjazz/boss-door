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
import FontFaceObserver from "fontfaceobserver";

const router = createBrowserRouter(
	createRoutesFromElements(
		<Route path="/" element={<Editor />}>
		</Route>
	)
);

const Poppins = new FontFaceObserver("Poppins", {
	weight: 400,
	style: "normal"
});

Poppins.load("test").then(() => {
	// wait until all assets are loaded to run react
	const root = document.getElementById("root");
	if (!root) {
		throw new Error("Could not initialize root.");
	}

	ReactDOM.createRoot(root).render(
		<React.StrictMode>
			<RouterProvider router={router} />
		</React.StrictMode>
	);
}).catch((err) => {
	console.error(err);
});

