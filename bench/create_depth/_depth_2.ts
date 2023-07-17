import * as _woxInject from '../../packages/wox-inject/src/inject';
// Monkey patches wonky ESM import... idk why named import doesn't work here...
const woxInject = (_woxInject as any).default as typeof _woxInject;

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
	const container = new woxInject.InjectionContainer(new woxInject.DependencyScope());

	const _ = container.resolve(_2);
}
