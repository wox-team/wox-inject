import { test } from 'vitest';
import { transform } from './vite_plugin';

test('transform, when used on an class with empty constructor, should concat a 0 list naughtyReflection', () => {
	const modified = transform(
		`
		import { Injectable } from '@wox-team/wox-inject';

		@Injectable()
		class Foo {}
		`,
	);

	expect(modified).toMatchInlineSnapshot(`
		"
				import { Injectable } from '@wox-team/wox-inject';

				@Injectable()
				class Foo {}
				Injectable.naughtyReflection(Foo, []);
		"
	`);
});

test('transform, when used on an class with constructor params, should concat a list of those', () => {
	const modified = transform(
		`
		import { Injectable } from '@wox-team/wox-inject';

		@Injectable()
		class Bar {}

		@Injectable()
		class Test {
			constructor(bar: Bar) {}
		}
		`,
	);

	expect(modified).toMatchInlineSnapshot(`
		"
				import { Injectable } from '@wox-team/wox-inject';

				@Injectable()
				class Bar {}

				@Injectable()
				class Test {
					constructor(bar: Bar) {}
				}
				Injectable.naughtyReflection(Bar, []);
		Injectable.naughtyReflection(Test, [Bar]);
		"
	`);
});
