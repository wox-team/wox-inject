import { Injectable, ServiceLifetimes } from '../src/inject';

export function setupScopedResolution() {
	@Injectable()
	class _1 {
		value = Symbol(1);
	}

	@Injectable()
	class _2 {
		value = Symbol(2);

		constructor(public readonly _1: _1) {
			// Empty
		}
	}

	@Injectable()
	class _3 {
		value = Symbol(3);

		constructor(public readonly _1: _1) {
			// Empty
		}
	}

	@Injectable()
	class _4 {
		value = Symbol(4);

		constructor(public readonly _2: _2, public readonly _3: _3) {
			// Empty
		}
	}

	Injectable.naughtyReflection(_1, []);
	Injectable.naughtyReflection(_2, [_1]);
	Injectable.naughtyReflection(_3, [_1]);
	Injectable.naughtyReflection(_4, [_2, _3]);

	return [null, _1, _2, _3, _4] as const;
}

export function setupSingletonResolution() {
	@Injectable({
		lifeTime: ServiceLifetimes.Singleton,
	})
	class _1 {
		value = Symbol(1);
	}

	@Injectable({
		lifeTime: ServiceLifetimes.Singleton,
	})
	class _2 {
		value = Symbol(2);

		constructor(public readonly _1: _1) {
			// Empty
		}
	}

	@Injectable({
		lifeTime: ServiceLifetimes.Singleton,
	})
	class _3 {
		value = Symbol(3);

		constructor(public readonly _1: _1) {
			// Empty
		}
	}

	@Injectable({
		lifeTime: ServiceLifetimes.Singleton,
	})
	class _4 {
		value = Symbol(4);

		constructor(public readonly _2: _2, public readonly _3: _3) {
			// Empty
		}
	}

	Injectable.naughtyReflection(_1, []);
	Injectable.naughtyReflection(_2, [_1]);
	Injectable.naughtyReflection(_3, [_1]);
	Injectable.naughtyReflection(_4, [_2, _3]);

	return [null, _1, _2, _3, _4] as const;
}

export function setupTransientResolution() {
	@Injectable({
		lifeTime: ServiceLifetimes.Transient,
	})
	class _1 {
		value = Symbol(1);
	}

	@Injectable({
		lifeTime: ServiceLifetimes.Transient,
	})
	class _2 {
		value = Symbol(2);

		constructor(public readonly _1: _1) {
			// Empty
		}
	}

	@Injectable({
		lifeTime: ServiceLifetimes.Transient,
	})
	class _3 {
		value = Symbol(3);

		constructor(public readonly _1: _1) {
			// Empty
		}
	}

	@Injectable({
		lifeTime: ServiceLifetimes.Transient,
	})
	class _4 {
		value = Symbol(4);

		constructor(public readonly _2: _2, public readonly _3: _3) {
			// Empty
		}
	}

	Injectable.naughtyReflection(_1, []);
	Injectable.naughtyReflection(_2, [_1]);
	Injectable.naughtyReflection(_3, [_1]);
	Injectable.naughtyReflection(_4, [_2, _3]);

	return [null, _1, _2, _3, _4] as const;
}
