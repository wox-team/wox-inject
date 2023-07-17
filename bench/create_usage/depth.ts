import { Bench, Options } from 'tinybench';
import type { BenchEntity } from '../common';
import { smallTree } from './_small_tree';

export function createUsageBench(options: Options): BenchEntity {
	const bench = new Bench(options);

	bench.add('small tree', smallTree);

	bench.addEventListener('error', (e) => {
		console.error(e);
		process.exit(1);
	});

	return {
		title: 'small tree',
		bench,
	};
}
