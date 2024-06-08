'use client';

import { useResolve } from '@wox-team/wox-inject';
import { Dep } from './dep';
import B from './b';
import { useEffect } from 'react';

export default function A(props: React.PropsWithChildren) {
	const dep = useResolve(Dep);

	useEffect(() => {
		dep.dep2.increment();

		return () => {
			dep.dep2.decrement();
		};
	}, []);

	return (
		<fieldset>
			<legend>A</legend>
			<B />
		</fieldset>
	);
}
