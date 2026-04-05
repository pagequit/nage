export type Circle = {
	radius: number;
};

export function createCircle(radius: number): Circle {
	return {
		radius,
	};
}

export function strokeCircle(
	ctx: CanvasRenderingContext2D,
	circle: Circle,
	x: number,
	y: number,
	color: string = "#fff",
	alpha: number = 1.0,
	lineWidth: number = 1,
): void {
	ctx.save();
	ctx.strokeStyle = color;
	ctx.globalAlpha = alpha;
	ctx.lineWidth = lineWidth;
	ctx.beginPath();
	ctx.arc(x, y, circle.radius, 0, 2 * Math.PI);
	ctx.stroke();
	ctx.restore();
}

export function fillCircle(
	ctx: CanvasRenderingContext2D,
	circle: Circle,
	x: number,
	y: number,
	color: string = "#fff",
	alpha: number = 1.0,
): void {
	ctx.save();
	ctx.fillStyle = color;
	ctx.globalAlpha = alpha;
	ctx.beginPath();
	ctx.arc(x, y, circle.radius, 0, 2 * Math.PI);
	ctx.fill();
	ctx.restore();
}
