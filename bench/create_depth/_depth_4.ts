import * as _woxInject from '../../packages/wox-inject/src/inject';
// Monkey patches wonky ESM import... idk why named import doesn't work here...
const woxInject = (_woxInject as any).default as typeof _woxInject;

export function depth_4() {
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

	woxInject.Injectable.naughtyReflection(_1, []);
	woxInject.Injectable.naughtyReflection(_2, [_1]);
	woxInject.Injectable.naughtyReflection(_3, [_1, _2]);
	woxInject.Injectable.naughtyReflection(_4, [_1, _2, _3]);

	const container = new woxInject.InjectionContainer(new woxInject.DependencyScope());

	const _ = container.resolve(_4);
}
