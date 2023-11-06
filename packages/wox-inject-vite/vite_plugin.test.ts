import { test } from 'vitest';
import { transform } from './vite_plugin';

test('', () => {
	expect(
		transform(
			`
			import { Injectable, useDependency } from '@wox-team/wox-inject';

			@Injectable()
			class FooService {

			}
		`,
		),
	).toMatchInlineSnapshot(
		`
			import { Injectable, useDependency } from '@wox-team/wox-inject';

			@Injectable()
			class FooService {

			}
			Injectable.naughtyReflection(FooService, []);
		`,
	);
});

// test('', () => {
// 	expect(
// 		transform(
// 			`
// 			import { Injectable, useDependency } from '@wox-team/wox-inject';

// 			@Injectable()
// 			class FooService {}
// 		`,
// 		),
// 	).toMatchInlineSnapshot(
// 		`
// 			import { Injectable, useDependency } from '@wox-team/wox-inject';

// 			@Injectable()
// 			class FooService {}
// 			Injectable.naughtyReflection(FooService, []);

// 			@Injectable()
// 			class BarService {
// 				constructor(private readonly fooService: FooService) {}
// 			}
// 			Injectable.naughtyReflection(BarService, [FooService]);
// 		`,
// 	);
// });
