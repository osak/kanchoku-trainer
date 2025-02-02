import { Canvas } from "./canvas";

export type StrokeTable = { [stroke: string]: string };

interface Stroke {
	sequence: string;
	char: string;
}

export class Game {
	private readonly canvas: Canvas;
	private strokeTable: StrokeTable = {};
	private reverseStrokeTable: { [char: string]: string } = {};
	private precomposition: string = '';
	private text: string = '';
	private lastError: string = '';

	// Target text
	private targetText: string = '';
	private targetStrokes: Stroke[] = [];
	private targetIndex: number = 0;
	private seqMissCount: number = 0;
	private seqMissLimit: number = 3;

	// Problem set
	private problems: string[] = [];
	private problemIndex: number = 0;
	private totalMissCount: number = 0;

	constructor(private readonly dom: HTMLCanvasElement) {
		this.canvas = new Canvas(dom);
	}

	init() {
		this.dom.addEventListener('keydown', (e: KeyboardEvent) => {
			console.debug(e);
			if (e.key === 'Backspace') {
				if (this.precomposition !== '') {
					this.precomposition = this.precomposition.substring(0, this.precomposition.length - 1);
				}
			} else if (e.key.length === 1 && this.targetIndex < this.targetStrokes.length) {
				const currentTarget = this.targetStrokes[this.targetIndex];
				const buf = this.precomposition + e.key;
				if (buf == currentTarget.sequence) {
					this.targetIndex++;
					this.precomposition = '';
					this.lastError = '';
					this.seqMissCount = 0;
					if (this.targetIndex == this.targetStrokes.length) {
						this.nextProblem();
					}
				} else if (currentTarget.sequence.startsWith(buf)) {
					this.precomposition = buf;
					this.lastError = '';
				} else {
					this.lastError = buf;
					this.precomposition = '';
					this.seqMissCount++;
					this.totalMissCount++;
				}
			}
			this.draw();
		});
		this.draw();
	}

	loadStrokeTable(table: StrokeTable) {
		this.strokeTable = table;
		const reverseStrokeTable: { [char: string]: string } = {};
		for (const [stroke, char] of Object.entries(table)) {
			reverseStrokeTable[char] = stroke;
		}
		this.reverseStrokeTable = reverseStrokeTable;
	}

	setTargetText(targetText: string) {
		this.targetText = targetText;
		this.targetStrokes = [];
		for (const char of targetText) {
			const normalized = char.replace(/[\u30a1-\u30f6]/g, function(match) {
				var chr = match.charCodeAt(0) - 0x60;
				return String.fromCharCode(chr);
			});
			const sequence = this.reverseStrokeTable[normalized] || this.reverseStrokeTable[char];
			this.targetStrokes.push({ sequence, char });
		}
		this.targetIndex = 0;
		this.draw();
	}

	setProblems(problems: string[]) {
		this.problems = problems;
		this.setProblem(0);
	}

	setProblem(idx: number) {
		if (idx < 0 || idx >= this.problems.length) {
			throw new Error(`Invalid problem number: ${idx}`);
		}
		this.problemIndex = idx;
		this.setTargetText(this.problems[this.problemIndex]);
	}

	setSequenceMissLimit(limit: number) {
		this.seqMissLimit = limit;
		this.draw();
	}

	nextProblem() {
		this.problemIndex++;
		if (this.problemIndex < this.problems.length) {
			this.setProblem(this.problemIndex);
		}
	}

	draw() {
		this.canvas.clear();
		this.canvas.drawRect(0, 0, 1200, 300, 'gray');
		//this.canvas.drawText(this.text, 200, 50, { fontSize: 40 });
		//this.canvas.drawText(this.precomposition, 200, 100, { fontSize: 30, color: 'gray' });

		this.targetStrokes.forEach((stroke, i) => {
			this.canvas.drawText(stroke.char, 100 + i * 50, 50, { fontSize: 40, color: this.getTextColor(i, this.targetIndex) });
			if (this.seqMissCount >= this.seqMissLimit && i == this.targetIndex) {
				this.canvas.drawText(stroke.sequence, 100 + i * 50, 70, { fontSize: 20, color: this.getSequenceColor(i, this.targetIndex) });
			}
		});

		if (this.lastError !== '' && this.precomposition === '') {
			this.canvas.drawText(this.lastError, 200, 120, { fontSize: 30, color: 'red' });
		}
		this.canvas.drawText(this.precomposition, 200, 120, { fontSize: 30, color: 'black' });
	}

	private getTextColor(pos: number, currentTargetPos: number): string {
		if (pos === currentTargetPos) {
			return 'blue';
		} else if (pos < currentTargetPos) {
			return 'black';
		} else if (pos > currentTargetPos) {
			return 'darkgray';
		} else {
			throw new Error(`getTextColor failed: ${pos} ${currentTargetPos}`);
		}
	}

	private getSequenceColor(pos: number, currentTargetPos: number): string {
		if (pos === currentTargetPos) {
			return 'gray';
		} else if (pos < currentTargetPos) {
			return 'green';
		} else if (pos > currentTargetPos) {
			return 'gray';
		} else {
			throw new Error(`getTextColor failed: ${pos} ${currentTargetPos}`);
		}
	}
}

