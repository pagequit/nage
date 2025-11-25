import type { Component, JSX } from "solid-js";
import style from "./controls.module.css";

export const RangeSlider: Component<{
	name: string;
	min: number;
	max: number;
	step: number;
	value: number;
	children?: JSX.Element;
	onChange?: (value: number) => void;
	onInput?: (value: number) => void;
}> = (props) => (
	<label class={style.rangeSlider}>
		{props.children}
		<input
			type="range"
			name={props.name}
			min={props.min}
			max={props.max}
			step={props.step}
			value={props.value}
			onChange={(e) => props.onChange?.(e.target.valueAsNumber)}
			onInput={(e) => props.onInput?.(e.target.valueAsNumber)}
		/>
	</label>
);
