'use client';

import { Game } from '@/game/main';
import { polano, texts } from '@/game/text';
import { tutStrokeTable } from '@/game/tut';
import { ChangeEvent, useCallback, useEffect, useRef } from 'react';

export default function Home() {
	const ref = useRef(null as HTMLCanvasElement | null);
	const gameRef = useRef(null as Game | null);
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
		}
	}, []);
	const onLimitChange = useCallback((e: ChangeEvent<HTMLInputElement>) => {
		const limit = parseInt(e.currentTarget.value);
		gameRef.current?.setSequenceMissLimit(limit);
	}, []);

	useEffect(() => {
		if (ref.current) {
			const game = new Game(ref.current);
			game.init();
			game.loadStrokeTable(tutStrokeTable);
			game.setProblems(polano);
			gameRef.current = game;
		}
	}, []);

	return (
		<div className="main">
			<div className="main-row">
				<canvas ref={ref} width={1200} height={300} tabIndex={1}/>
				<div>
					<form action={submit}>
						<select name="problemSet" multiple onChange={onSelectProblemSet}>
							<option value="aiueo">あめんぼあかいな</option>
							<option value="polano">ポラーノの広場</option>
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
		</div>
	);
}
