'use client';

import { useResolve } from '@wox-team/wox-inject';
import { Dep } from './dep';
import { useEffect } from 'react';

export default function B() {
	const dep = useResolve(Dep);

	useEffect(() => {
		dep.dep2.increment();

		return () => {
			dep.dep2.decrement();
		};
	}, []);

	return (
		<fieldset>
			<legend>B</legend>
		</fieldset>
	);
}
