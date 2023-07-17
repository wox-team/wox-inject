import * as _woxInject from '../../packages/wox-inject/src/inject';
// Monkey patches wonky ESM import... idk why named import doesn't work here...
const woxInject = (_woxInject as any).default as typeof _woxInject;

export function depth_8() {
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

	woxInject.Injectable.naughtyReflection(_1, []);
	woxInject.Injectable.naughtyReflection(_2, [_1]);
	woxInject.Injectable.naughtyReflection(_3, [_1, _2]);
	woxInject.Injectable.naughtyReflection(_4, [_1, _2, _3]);
	woxInject.Injectable.naughtyReflection(_5, [_1, _2, _3, _4]);
	woxInject.Injectable.naughtyReflection(_6, [_1, _2, _3, _4, _5]);
	woxInject.Injectable.naughtyReflection(_7, [_1, _2, _3, _4, _5, _6]);
	woxInject.Injectable.naughtyReflection(_8, [_1, _2, _3, _4, _5, _6, _7]);

	const container = new woxInject.InjectionContainer(new woxInject.DependencyScope());

	const _ = container.resolve(_8);
}
