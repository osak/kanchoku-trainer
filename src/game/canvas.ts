export interface TextConfig {
	fontFamily: string;
	fontSize: number;
	color: string;
}

export class Canvas {
	private readonly context: CanvasRenderingContext2D;

	constructor(private readonly dom: HTMLCanvasElement) {
		const ctx = dom.getContext('2d');
		if (ctx == null) {
			throw new Error('Failed to get 2d context');
		}
		this.context = ctx;
	}

	clear() {
		this.context.clearRect(0, 0, this.dom.width, this.dom.height);
	}

	drawText(text: string, x: number, y: number, config: Partial<TextConfig>) {
		const fullConfig: TextConfig = {
			fontFamily: 'Sans-serif',
			fontSize: 14,
			color: 'black',
			...config
		};
		this.context.strokeStyle = fullConfig.color;
		this.context.fillStyle = fullConfig.color;
		this.context.font = `normal ${fullConfig.fontSize}px ${fullConfig.fontFamily}`;
		this.context.fillText(text, x, y);
	}

	drawRect(x: number, y: number, w: number, h: number, color: string) {
		this.context.strokeStyle = color;
		this.context.strokeRect(x, y, w, h);
	}
}
