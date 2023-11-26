// Reason: Doing hacky stuff, and hacky stuff needs any.
/* eslint-disable @typescript-eslint/no-explicit-any */

import * as woxInject from '../../packages/wox-inject/src/inject';

let cache: any | null = null;

function setup(ignoreCache?: boolean): any {
	type ReturnValue = readonly [null, typeof _1, typeof _2, typeof _3, typeof _4, typeof _5];

	if (!ignoreCache && cache != null) return cache as unknown as ReturnValue;

	@woxInject.Injectable()
	class _1 {
		value = Symbol(1);
	}

	@woxInject.Injectable()
	class _2 {
		value = Symbol(2);

		constructor(public readonly _1: _1) {
			// Empty
		}
	}

	@woxInject.Injectable()
	class _3 {
		value = Symbol(3);

		constructor() {
			// Empty
		}
	}

	@woxInject.Injectable()
	class _4 {
		value = Symbol(4);

		constructor(
			public readonly _2: _2,
			public readonly _3: _3,
		) {
			// Empty
		}
	}

	@woxInject.Injectable()
	class _5 {
		value = Symbol(5);

		constructor(
			public readonly _3: _3,
			public readonly _1: _1,
		) {
			// Empty
		}
	}

	woxInject.Injectable.naughtyReflection(_1, []);
	woxInject.Injectable.naughtyReflection(_2, [_1]);
	woxInject.Injectable.naughtyReflection(_3, []);
	woxInject.Injectable.naughtyReflection(_4, [_2, _3]);
	woxInject.Injectable.naughtyReflection(_5, [_3, _1]);

	return (cache ??= [null, _1, _2, _3, _4, _5] as ReturnValue);
}

export function smallTree() {
	const deps = setup();

	const container = new woxInject.InjectionContainer(new woxInject.DependencyScope());

	const _ = container.resolve(deps[4]);
}
