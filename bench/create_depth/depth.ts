import { Bench, Options } from 'tinybench';
import type { BenchEntity } from '../common';
// import { Depth_2 } from './_depth_2';
// import { Depth_4 } from './_depth_4';
import { depth_8 } from './_depth_8';
import { depth_16 } from './_depth_16';
// import { Depth_32 } from './_depth_32';

export function createDepthBench(options: Options): BenchEntity {
	const bench = new Bench(options);

	// bench.add('depth 2', Depth_2);
	// bench.add('depth 4', Depth_4);
	bench.add('depth 8', depth_8);
	bench.add('depth 16', depth_16);
	// bench.add('depth 32', Depth_32);

	bench.addEventListener('error', (e) => {
		console.error(e);
		process.exit(1);
	});

	return {
		title: 'depth',
		bench,
	};
}
