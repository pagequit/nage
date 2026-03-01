export type Box<T> = {
	value: T;
};

export function box<T>(value: T): Box<T> {
	return { value };
}
