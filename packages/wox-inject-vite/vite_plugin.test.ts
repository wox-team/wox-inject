import { expect, test } from 'vitest';
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

test('transform, when used on an symbol exports, should inject', () => {
	const modified = transform(
		`
		import { Injectable } from '@wox-team/wox-inject';

		@Injectable()
		export class Bar {}

		@Injectable()
		export default class Test {
			constructor(bar: Bar) {}
		}
		`,
	);

	expect(modified).toMatchInlineSnapshot(`
		"
				import { Injectable } from '@wox-team/wox-inject';

				@Injectable()
				export class Bar {}

				@Injectable()
				export default class Test {
					constructor(bar: Bar) {}
				}
				Injectable.naughtyReflection(Bar, []);
		Injectable.naughtyReflection(Test, [Bar]);
		"
	`);
});

test('transform, when weird it encounters weird TS 1 code, should not break', () => {
	const modified = transform(
		`
			import { D } from 'd';

			const _X = withSomeXyz(D) as typeof D;
			export { _X as X };
		`,
	);

	expect(modified).toMatchInlineSnapshot(`
		"
					import { D } from 'd';

					const _X = withSomeXyz(D) as typeof D;
					export { _X as X };
				"
	`);
});

test('transform, when weird it encounters weird TS 2 code, should not break', () => {
	const modified = transform(
		`
		import { Injectable } from '@wox-team/wox-inject';

		@Injectable()
		export class Test implements Foo {
			constructor(bar: Bar) {}
		}
		`,
	);

	expect(modified).toMatchInlineSnapshot(`
		"
				import { Injectable } from '@wox-team/wox-inject';

				@Injectable()
				export class Test implements Foo {
					constructor(bar: Bar) {}
				}
				Injectable.naughtyReflection(Test, [Bar]);
		"
	`);
});

test('transform, when weird it encounters weird TS 3 code, should not break', () => {
	const modified = transform(
		`
		import { Injectable } from '@wox-team/wox-inject';

		// // /* // */
		/* // */@Injectable()/* // */
		// // /* // */
		export class Test extends Foo {
			constructor(bar: Bar) {}
		}
		`,
	);

	expect(modified).toMatchInlineSnapshot(`
		"
				import { Injectable } from '@wox-team/wox-inject';

				// // /* // */
				/* // */@Injectable()/* // */
				// // /* // */
				export class Test extends Foo {
					constructor(bar: Bar) {}
				}
				Injectable.naughtyReflection(Test, [Bar]);
		"
	`);
});

test.only('transform, when "use container" is declared in function scope, should insert correct code', () => {
	const modified = transform(
		`
		import { Injectable } from '@wox-team/wox-inject';

		function FnName({ prop1, porp2 }) {
		  "use container";

			return <div />;
		}

		@Injectable()
		class Foo {}
		`,
	);

	expect(modified).toMatchInlineSnapshot(`
		"
				import { Injectable, NewContainer } from '@wox-team/wox-inject';

				function __INNER_FnName__({ prop1, porp2 }) {
				  return <div />;
				}

				function FnName(...__ARGS) {
				  return (
						<NewContainer>
              <__INNER_FnName__ {...__ARGS} />
						</NewContainer>
					);
				};

				@Injectable()
				class Foo {}
				Injectable.naughtyReflection(Foo, []);
		"
	`);
});

test('transform, when "use container" is declared in function scope and no wox-inject import is found, should insert code correct code', () => {
	const modified = transform(
		`
		function FnName() {
		  "use container";
		}
		`,
	);

	expect(modified).toMatchInlineSnapshot(`
		"import { withNewContainer } from '@wox-team/wox-inject';

				const FnName = withNewContainer(function FnName() {
				  \\"use container\\";
				});
				"
	`);
});
