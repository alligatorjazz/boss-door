import { HTMLAttributes, useContext } from "react";
import Grid from "../../assets/feather/grid.svg?react";
import Pointer from "../../assets/feather/mouse-pointer.svg?react";
import { EditMode } from "../../types";
import { EditorContext } from "../../routes/Editor/Index.lib";



export function ModeSelect() {
	const { mode: selectedMode, setMode } = useContext(EditorContext);
	const ModeButton = ({ mode, children, ...buttonProps }: HTMLAttributes<HTMLButtonElement> & { mode: EditMode }) => (
		<button
			{...buttonProps}
			className={
				["p-1", mode == selectedMode ? "shadow-indent" : "shadow-none"].join(" ")
			}
			onClick={() => setMode?.(mode)}
		>
			{children}
		</button >
	);

	const size = 24;
	return (
		<section className="bg-gray-700 flex flex-col items-center my-auto h-full w-16 p-4 pointer-events-auto">
			{/* <img src={pointer} alt="Switch to move mode." />
			<img src={grid} alt="Switch to grid mode." /> */}
			<ModeButton mode="move">
				<Pointer stroke="white" width={size} height={size} />
			</ModeButton>
			<ModeButton mode="build">
				<Grid stroke="white" width={size} height={size} />
			</ModeButton>
		</section>
	);
}