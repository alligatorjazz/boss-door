
import { useEffect, useRef, useState } from "react";
import { EditMode, useEdit } from "../../hooks/useEdit";
import { parsePoint } from "../../lib";

export function Editor() {
	const containerRef = useRef<HTMLDivElement>(null);
	const [mode] = useState<EditMode>("move");

	const { build, selected } = useEdit({
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
			// const e = add("entrance", { name: "Entrance" });
			// e.obj.position.set(-3500, 0);
			const b = add("barrier", { name: "B" });
			b.obj.position.set(150, 0);
		});
	}, [build]);

	return (
		<div className="w-[100dvw] h-[100dvh] overflow-hidden">
			<div className="w-full h-full" ref={containerRef}></div>
			<section className="absolute top-0 left-0 p-4 bg-slate-300">
				<h1 className="text-2xl">Debug </h1>
				<h3>Selected:</h3>
				<ul>
					{selected.map(({ node, obj }) => (
						<li key={node.id}>{node.displayName} ({parsePoint(obj?.position) ?? "N/A"})</li>
					))}
				</ul>
			</section>
		</div>
	);
}