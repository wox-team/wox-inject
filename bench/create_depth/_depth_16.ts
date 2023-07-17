import * as _woxInject from '../../packages/wox-inject/src/inject';
// Monkey patches wonky ESM import... idk why named import doesn't work here...
const woxInject = (_woxInject as any).default as typeof _woxInject;

export function depth_16() {
	woxInject.clearRegistry();

	@woxInject.Injectable()
	class _1 {}

	@woxInject.Injectable()
	class _2 {
		constructor(public _1: _1) {}
	}

	@woxInject.Injectable()
	class _3 {
		constructor(public _1: _1, public _2: _2) {}
	}

	@woxInject.Injectable()
	class _4 {
		constructor(public _1: _1, public _2: _2, public _3: _3) {}
	}

	@woxInject.Injectable()
	class _5 {
		constructor(public _1: _1, public _2: _2, public _3: _3, public _4: _4) {}
	}

	@woxInject.Injectable()
	class _6 {
		constructor(public _1: _1, public _2: _2, public _3: _3, public _4: _4, public _5: _5) {}
	}

	@woxInject.Injectable()
	class _7 {
		constructor(public _1: _1, public _2: _2, public _3: _3, public _4: _4, public _5: _5, public _6: _6) {}
	}

	@woxInject.Injectable()
	class _8 {
		constructor(public _1: _1, public _2: _2, public _3: _3, public _4: _4, public _5: _5, public _6: _6, public _7: _7) {}
	}

	@woxInject.Injectable()
	class _9 {
		constructor(
			public _1: _1,
			public _2: _2,
			public _3: _3,
			public _4: _4,
			public _5: _5,
			public _6: _6,
			public _7: _7,
			public _8: _8,
		) {}
	}

	@woxInject.Injectable()
	class _10 {
		constructor(
			public _1: _1,
			public _2: _2,
			public _3: _3,
			public _4: _4,
			public _5: _5,
			public _6: _6,
			public _7: _7,
			public _8: _8,
			public _9: _9,
		) {}
	}

	@woxInject.Injectable()
	class _11 {
		constructor(
			public _1: _1,
			public _2: _2,
			public _3: _3,
			public _4: _4,
			public _5: _5,
			public _6: _6,
			public _7: _7,
			public _8: _8,
			public _9: _9,
			public _10: _10,
		) {}
	}

	@woxInject.Injectable()
	class _12 {
		constructor(
			public _1: _1,
			public _2: _2,
			public _3: _3,
			public _4: _4,
			public _5: _5,
			public _6: _6,
			public _7: _7,
			public _8: _8,
			public _9: _9,
			public _10: _10,
			public _11: _11,
		) {}
	}

	@woxInject.Injectable()
	class _13 {
		constructor(
			public _1: _1,
			public _2: _2,
			public _3: _3,
			public _4: _4,
			public _5: _5,
			public _6: _6,
			public _7: _7,
			public _8: _8,
			public _9: _9,
			public _10: _10,
			public _11: _11,
			public _12: _12,
		) {}
	}

	@woxInject.Injectable()
	class _14 {
		constructor(
			public _1: _1,
			public _2: _2,
			public _3: _3,
			public _4: _4,
			public _5: _5,
			public _6: _6,
			public _7: _7,
			public _8: _8,
			public _9: _9,
			public _10: _10,
			public _11: _11,
			public _12: _12,
			public _13: _13,
		) {}
	}

	@woxInject.Injectable()
	class _15 {
		constructor(
			public _1: _1,
			public _2: _2,
			public _3: _3,
			public _4: _4,
			public _5: _5,
			public _6: _6,
			public _7: _7,
			public _8: _8,
			public _9: _9,
			public _10: _10,
			public _11: _11,
			public _12: _12,
			public _13: _13,
			public _14: _14,
		) {}
	}

	@woxInject.Injectable()
	class _16 {
		constructor(
			public _1: _1,
			public _2: _2,
			public _3: _3,
			public _4: _4,
			public _5: _5,
			public _6: _6,
			public _7: _7,
			public _8: _8,
			public _9: _9,
			public _10: _10,
			public _11: _11,
			public _12: _12,
			public _13: _13,
			public _14: _14,
			public _15: _15,
		) {}
	}

	woxInject.Injectable.naughtyReflection(_1, []);
	woxInject.Injectable.naughtyReflection(_2, [_1]);
	woxInject.Injectable.naughtyReflection(_3, [_1, _2]);
	woxInject.Injectable.naughtyReflection(_4, [_1, _2, _3]);
	woxInject.Injectable.naughtyReflection(_5, [_1, _2, _3, _4]);
	woxInject.Injectable.naughtyReflection(_6, [_1, _2, _3, _4, _5]);
	woxInject.Injectable.naughtyReflection(_7, [_1, _2, _3, _4, _5, _6]);
	woxInject.Injectable.naughtyReflection(_8, [_1, _2, _3, _4, _5, _6, _7]);
	woxInject.Injectable.naughtyReflection(_9, [_1, _2, _3, _4, _5, _6, _7, _8]);
	woxInject.Injectable.naughtyReflection(_10, [_1, _2, _3, _4, _5, _6, _7, _8, _9]);
	woxInject.Injectable.naughtyReflection(_11, [_1, _2, _3, _4, _5, _6, _7, _8, _9, _10]);
	woxInject.Injectable.naughtyReflection(_12, [_1, _2, _3, _4, _5, _6, _7, _8, _9, _10, _11]);
	woxInject.Injectable.naughtyReflection(_13, [_1, _2, _3, _4, _5, _6, _7, _8, _9, _10, _11, _12]);
	woxInject.Injectable.naughtyReflection(_14, [_1, _2, _3, _4, _5, _6, _7, _8, _9, _10, _11, _12, _13]);
	woxInject.Injectable.naughtyReflection(_15, [_1, _2, _3, _4, _5, _6, _7, _8, _9, _10, _11, _12, _13, _14]);
	woxInject.Injectable.naughtyReflection(_16, [_1, _2, _3, _4, _5, _6, _7, _8, _9, _10, _11, _12, _13, _14, _15]);

	const container = new woxInject.InjectionContainer(new woxInject.DependencyScope());

	const _ = container.resolve(_16);
}
