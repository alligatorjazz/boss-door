import { HTMLAttributes, useContext } from "react";
import Pointer from "../../assets/feather/mouse-pointer.svg?react";
import Hammer from "../../assets/iconoir/hammer.svg?react";
import Edit3 from "../../assets/feather/edit-3.svg?react";
import Key from "../../assets/feather/key.svg?react";
import Lock from "../../assets/feather/lock.svg?react";
import { EditMode } from "../../types";
import { DungeonContext } from "../../routes/Edit.lib";

interface Props extends HTMLAttributes<HTMLDivElement> { }

export function ModeSelect({ className, ...props }: Props) {
	const { mode: selectedMode, setMode } = useContext(DungeonContext);
	const ModeButton = ({ mode, children, ...buttonProps }: HTMLAttributes<HTMLButtonElement> & { mode: EditMode }) => (
		<button
			{...buttonProps}
			className={
				[
					"p-1 cursor-pointer hover:backdrop-brightness-125 transition-all",
					"active:shadow-indent active:backdrop-brightness-200",
					mode == selectedMode ? "shadow-indent" : "shadow-none"
				].join(" ")
			}
			onClick={() => setMode?.(mode)}
		>
			{children}
		</button >
	);

	const size = 24;
	return (
		<section {...props} className={[
			"bg-gray-700 flex flex-col gap-2",
			"items-center my-auto w-16 p-4 pointer-events-auto",
			className
		].join(" ")}>
			{/* <img src={pointer} alt="Switch to move mode." />
			<img src={grid} alt="Switch to grid mode." /> */}
			<ModeButton mode="move">
				<Pointer stroke="white" width={size} height={size} />
			</ModeButton>
			<ModeButton mode="build">
				<Hammer stroke="white" width={size} height={size} />
			</ModeButton>
			<ModeButton mode="path">
				<Edit3 stroke="white" width={size} height={size} />
			</ModeButton>
			<ModeButton mode="key">
				<Key stroke="white" width={size} height={size} />
			</ModeButton>
			<ModeButton mode="lock">
				<Lock stroke="white" width={size} height={size} />
			</ModeButton>
		</section>
	);
}