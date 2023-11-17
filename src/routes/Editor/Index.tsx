
import { useEffect, useRef, useState } from "react";
import { EditMode, useEdit } from "../../hooks/useEdit";
import { parsePoint, randomColor } from "../../lib";

export function Editor() {
	const containerRef = useRef<HTMLDivElement>(null);
	const [mode] = useState<EditMode>("move");

	const { build, selected, map } = useEdit({
		width: window.innerWidth,
		height: window.innerHeight,
		worldWidth: 10000,
		worldHeight: 10000,
		ref: containerRef,
		backgroundColor: "slategray",
		antialias: true,
		mode
	});

	useEffect(() => {
		build(({ add }) => {
			for (let i = 0; i < 4; i++) {
				const b = add("barrier", { name: "ABCDEF".charAt(Math.floor(Math.random() * 6)) });
				b.obj.position.set(Math.random() * 1000 - 400, Math.random() * 1000 - 300);
			}
		});
	}, [build]);
	return (
		<div className="w-[100dvw] h-[100dvh] overflow-hidden">
			<div className="w-full h-full" ref={containerRef}></div>
			<section className="absolute top-0 left-0 p-4 bg-slate-300">
				<h1 className="text-2xl">Debug </h1>
				<h3 className="text-lg mb-1">Selected:</h3>
				<ul>
					{selected.map(({ node, obj }) => (
						<li key={node.id}>{node.displayName} ({parsePoint(obj?.position) ?? "N/A"})</li>
					))}
				</ul>
				<h3 className="text-lg mb-1">List:</h3>
				<ul>
					{map(({ node, obj }) => (
						<li key={node.id}>{node.displayName} ({parsePoint(obj?.position) ?? "N/A"})</li>
					))}
				</ul>
			</section>
		</div>
	);
}