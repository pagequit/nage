import type { Box } from "#/engine/Box.ts";

export type Component<T> = Record<string, Box<T>>;
