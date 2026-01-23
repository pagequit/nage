export type KeyboardInput = {
	arrowUp: boolean;
	arrowDown: boolean;
	arrowLeft: boolean;
	arrowRight: boolean;
	enter: boolean;
	escape: boolean;
};

export const keyboardInput: KeyboardInput = {
	arrowUp: false,
	arrowDown: false,
	arrowLeft: false,
	arrowRight: false,
	enter: false,
	escape: false,
};

function onKeyDown(event: KeyboardEvent) {
	switch (event.key) {
		case "ArrowUp":
			keyboardInput.arrowUp = true;
			break;
		case "ArrowDown":
			keyboardInput.arrowDown = true;
			break;
		case "ArrowLeft":
			keyboardInput.arrowLeft = true;
			break;
		case "ArrowRight":
			keyboardInput.arrowRight = true;
			break;
		case "Enter":
			keyboardInput.enter = true;
			break;
		case "Escape":
			keyboardInput.escape = true;
			break;
	}
}

function onKeyUp(event: KeyboardEvent) {
	switch (event.key) {
		case "ArrowUp":
			keyboardInput.arrowUp = false;
			break;
		case "ArrowDown":
			keyboardInput.arrowDown = false;
			break;
		case "ArrowLeft":
			keyboardInput.arrowLeft = false;
			break;
		case "ArrowRight":
			keyboardInput.arrowRight = false;
			break;
		case "Enter":
			keyboardInput.enter = false;
			break;
		case "Escape":
			keyboardInput.escape = false;
			break;
	}
}

export function listenKeyboard(): () => void {
	document.addEventListener("keydown", onKeyDown);
	document.addEventListener("keyup", onKeyUp);

	return () => {
		document.removeEventListener("keydown", onKeyDown);
		document.removeEventListener("keyup", onKeyUp);
	};
}
