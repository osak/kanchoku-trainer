'use client';

import { Game } from '@/game/main';
import { polano, randChars, texts } from '@/game/text';
import { tutStrokeTable } from '@/game/tut';
import { ChangeEvent, useCallback, useEffect, useRef, useState } from 'react';

interface MissCountRankingEntry {
	char: string;
	missCount: number;
}

interface SlowestRankingEntry {
	char: string;
	time: number;
}

export default function Home() {
	const ref = useRef(null as HTMLCanvasElement | null);
	const gameRef = useRef(null as Game | null);
	const [missCountRanking, setMissCountRanking] = useState<MissCountRankingEntry[]>([]);
	const [slowestRanking, setSlowestCountRanking] = useState<SlowestRankingEntry[]>([]);
	const submit = useCallback((formData: FormData) => {
		const text = formData.get('text');
		gameRef.current?.setTargetText(text as string);
	}, []);
	const onSelectProblemSet = useCallback((e: ChangeEvent<HTMLSelectElement>) => {
		const problemSet = e.currentTarget.value;
		console.log(problemSet);
		if (problemSet === 'aiueo') {
			gameRef.current?.setProblems(texts);
		} else if (problemSet === 'polano') {
			gameRef.current?.setProblems(polano);
		} else if (problemSet === 'random') {
			const problems = [];
			for (let i = 0; i < 10; i++) {
				let text = '';
				for (let j = 0; j < 20; j++) {
					text += randChars[0][Math.floor(Math.random() * randChars[0].length)];
				}
				problems.push(text);
			}
			gameRef.current?.setProblems(problems);
		} else if (problemSet === 'test') {
			gameRef.current?.setProblems(['あいうえお']);
		}
	}, []);
	const onLimitChange = useCallback((e: ChangeEvent<HTMLInputElement>) => {
		const limit = parseInt(e.currentTarget.value);
		gameRef.current?.setSequenceMissLimit(limit);
	}, []);
	const onProblemSetFinished = useCallback(async () => {
		if (gameRef.current) {
			const performanceTable = gameRef.current.getPerformanceTable();
			const newMissCountRanking = Object.entries(performanceTable)
				.sort((a, b) => b[1].missCount - a[1].missCount)
				.map(([char, { missCount }]) => ({ char, missCount }));
			const newSlowestRanking = Object.entries(performanceTable)
				.sort((a, b) => Math.max(...b[1].completionTimesMs) - Math.max(...a[1].completionTimesMs))
				.map(([char, { completionTimesMs }]) => ({ char, time: Math.max(...completionTimesMs) }));
			setMissCountRanking(newMissCountRanking);
			setSlowestCountRanking(newSlowestRanking);
			console.log(newMissCountRanking);
			console.log(newSlowestRanking);
			const res = await fetch('/api/score', {
				method: 'POST',
				headers: {
					'Content-Type': 'application/json',
				},
				body: JSON.stringify({
					missCounts: newMissCountRanking,
					times: newSlowestRanking,
				}),
			});
			const { filename } = await res.json();
			console.log(filename);
		}
	}, [setMissCountRanking, setSlowestCountRanking, gameRef]);

	useEffect(() => {
		if (ref.current) {
			const game = new Game(ref.current);
			game.init();
			game.loadStrokeTable(tutStrokeTable);
			game.setProblems(polano);
			game.on('problemSetFinished', onProblemSetFinished);
			gameRef.current = game;
		}
	}, [onProblemSetFinished]);

	return (
		<div className="main">
			<div className="main-row">
				<canvas ref={ref} width={1200} height={300} tabIndex={1}/>
				<div>
					<form action={submit}>
						<select name="problemSet" multiple onChange={onSelectProblemSet}>
							<option value="aiueo">あめんぼあかいな</option>
							<option value="polano">ポラーノの広場</option>
							<option value="random">ランダム</option>
							<option value="test">テスト用</option>
						</select>
						<div>
							<input type='text' name='text' className='border rounded'/>
						</div>
						<div>
							<label htmlFor='limit'>Miss limit: </label>
							<input type='number' name='limit' className='border rounded' onChange={onLimitChange}/>
						</div>
					</form>
				</div>
			</div>
			<div className="main-row">
				<div>
					<h2>Miss count ranking</h2>
					<table>
						<thead>
							<tr>
								<th>Char</th>
								<th>Miss count</th>
							</tr>
						</thead>
						<tbody>
							{missCountRanking.slice(0, 10).map(({ char, missCount }) => (
								<tr key={char}>
									<td>{char}</td>
									<td>{missCount}</td>
								</tr>
							))}
						</tbody>
					</table>
				</div>
				<div>
					<h2>Slowest ranking</h2>
					<table>
						<thead>
							<tr>
								<th>Char</th>
								<th>Time</th>
							</tr>
						</thead>
						<tbody>
							{slowestRanking.slice(0, 10).map(({ char, time }) => (
								<tr key={char}>
									<td>{char}</td>
									<td>{time}ms</td>
								</tr>
							))}
						</tbody>
					</table>
				</div>
			</div>
		</div>
	);
}
