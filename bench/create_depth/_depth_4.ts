import * as woxInject from '../../packages/wox-inject/src/inject';

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

	const container = new woxInject.Resolution(new woxInject.Container());

	const _ = container.resolve(_4);
}
