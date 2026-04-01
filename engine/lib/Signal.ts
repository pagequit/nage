type Current = null | (() => void);

let current: Current = null;

export function createSignal<T>(value: T): [() => T, (value: T) => void] {
	let innerValue = value;
	const observers = new Set<() => void>();

	const getter = () => {
		current !== null && observers.add(current);

		return innerValue;
	};
	const setter = (value: T) => {
		innerValue = value;
		for (const observer of observers) {
			observer();
		}
	};

	return [getter, setter];
}

export function createEffect(callback: () => void): void {
	current = callback;
	callback();
	current = null;
}
