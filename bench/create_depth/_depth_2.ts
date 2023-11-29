import * as woxInject from '../../packages/wox-inject/src/inject';

export function depth_2() {
	woxInject.clearRegistry();

	@woxInject.Injectable()
	class _1 {}

	@woxInject.Injectable()
	class _2 {
		constructor(public _1: _1) {}
	}

	woxInject.Injectable.naughtyReflection(_1, []);
	woxInject.Injectable.naughtyReflection(_2, [_1]);
	const container = new woxInject.InjectionContainer(new woxInject.Container());

	const _ = container.resolve(_2);
}
