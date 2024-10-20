import { beforeEach, expect, test } from 'vitest';
import { Resolution, Container, clearRegistry, Injectable, LookupImpl, resolve, Scopes } from './inject';
import { setupScopedResolution, setupSingletonResolution, setupTransientResolution } from '../tests/setup_dependencies';
import { createTestBed } from './testing';

beforeEach(() => {
	clearRegistry();
});

test('resolve, when obtaining the required scoped dependencies, should complete the dependency resolution', () => {
	const deps = setupScopedResolution();

	const scope = new Container();
	const container = new Resolution(scope);
	const dep = container.resolve(deps[2]);

	expect(dep._1.value).toBeTruthy();
});

test('resolve, when obtaining the required singleton dependencies, should complete the dependency resolution', () => {
	const deps = setupSingletonResolution();

	const scope = new Container();
	const container = new Resolution(scope);
	const dep = container.resolve(deps[2]);

	expect(dep._1.value).toBeTruthy();
});

test('resolve, when obtaining the required transient dependencies, should complete the dependency resolution', () => {
	const deps = setupTransientResolution();

	const scope = new Container();
	const container = new Resolution(scope);
	const dep = container.resolve(deps[2]);

	expect(dep._1.value).toBeTruthy();
});

test('resolve, when procedural resolutions occurs between different containers, singletons instances should remain the same', () => {
	const deps = setupSingletonResolution();

	const scope_1 = new Container();
	const container_1 = new Resolution(scope_1);
	const scope_2 = new Container(scope_1);
	const container_2 = new Resolution(scope_2);

	container_1.resolve(deps[4]);
	container_2.resolve(deps[4]);

	const _c1_d4 = container_1.resolve(deps[4]);
	const _c2_d4 = container_2.resolve(deps[4]);

	expect(_c2_d4._2._1).toBe(_c1_d4._2._1);
});

test('resolve, when procedural resolutions occurs between different containers, scoped instances should be unique per scope if not inherited', () => {
	const deps = setupScopedResolution();

	const scope_1 = new Container();
	const container_1 = new Resolution(scope_1);
	const scope_2 = new Container(scope_1, false);
	const container_2 = new Resolution(scope_2);

	container_1.resolve(deps[4]);
	container_2.resolve(deps[4]);

	const _c1_d4 = container_1.resolve(deps[4]);
	const _c2_d4 = container_2.resolve(deps[4]);

	expect(_c2_d4._2._1).not.toBe(_c1_d4._2._1);
});

test('resolve, when procedural resolutions occurs between different containers, scoped instances should not be unique per scope if inherited', () => {
	const deps = setupScopedResolution();

	const scope_1 = new Container();
	const container_1 = new Resolution(scope_1);
	const scope_2 = new Container(scope_1);
	const container_2 = new Resolution(scope_2);

	container_1.resolve(deps[4]);
	container_2.resolve(deps[4]);

	const _c1_d4 = container_1.resolve(deps[4]);
	const _c2_d4 = container_2.resolve(deps[4]);

	expect(_c2_d4._2._1).toBe(_c1_d4._2._1);
});

test('resolve, when graphing identical nodes, should keep the same singleton instance until resolution complete', () => {
	const deps = setupSingletonResolution();

	const scope_1 = new Container();
	const container_1 = new Resolution(scope_1);

	container_1.resolve(deps[4]);

	const _c1_d4 = container_1.resolve(deps[4]);

	expect(_c1_d4._2._1).toBe(_c1_d4._3._1);
});

test('resolve, when graphing identical nodes, should keep the same scoped instance until resolution complete', () => {
	const deps = setupScopedResolution();

	const scope_1 = new Container();
	const container_1 = new Resolution(scope_1);

	container_1.resolve(deps[4]);

	const _c1_d4 = container_1.resolve(deps[4]);

	expect(_c1_d4._2._1).toBe(_c1_d4._3._1);
});

test('resolve, when graphing identical nodes, should not keep the same transient instance until resolution complete', () => {
	const deps = setupTransientResolution();

	const scope_1 = new Container();
	const container = new Resolution(scope_1);

	const _4 = container.resolve(deps[4]);

	expect(_4._2._1).not.toBe(_4._3._1);
});

test('Virtual Injectable.lookup method, when method is reassigned, internal reflector lookup should prioritize to use it', () => {
	class IgnoreThis {
		public readonly data = 'should be replaced';
	}

	@Injectable()
	class ReplaceWithThis {
		public readonly data = 'replaced with this';
	}

	@Injectable()
	class Ctor {
		constructor(public readonly shouldBeReplaced: IgnoreThis) {
			// Empty
		}
	}

	Injectable.lookup = ((token) => {
		if (token !== Ctor) return [];

		return [ReplaceWithThis];
	}) as LookupImpl;

	const container = createTestBed();
	const instance = container.resolve(Ctor);

	expect(instance.shouldBeReplaced.data).toBe('replaced with this');
});

// Need more work, it will go out of the resolve scope.
test.skip('resolve function, when invoked during ctor creation, should finish resolving as if it was ctor injected', () => {
	@Injectable()
	class ChildDep {}
	Injectable.naughtyReflection(ChildDep, []);

	@Injectable()
	class ParentDep {
		child = resolve(ChildDep);
	}
	Injectable.naughtyReflection(ParentDep, []);

	const scope = new Container();
	const container = new Resolution(scope);

	const dep = container.resolve(ParentDep);

	expect(dep.child).toBeInstanceOf(ChildDep);
});

test('Singleton instance, when being resolved multiple times in different branches, should retain one instance', () => {
	let resolvedTimes = 0;

	@Injectable({
		scope: Scopes.Singleton,
	})
	class _1 {
		value = Symbol(1);

		constructor() {
			++resolvedTimes;
		}
	}
	Injectable.naughtyReflection(_1, []);

	@Injectable({
		scope: Scopes.Singleton,
	})
	class _2 {
		value = Symbol(2);

		constructor(public readonly _1: _1) {
			++resolvedTimes;
		}
	}
	Injectable.naughtyReflection(_2, [_1]);

	@Injectable({
		scope: Scopes.Singleton,
	})
	class _3 {
		value = Symbol(3);

		constructor(public readonly _2: _2) {
			++resolvedTimes;
		}
	}
	Injectable.naughtyReflection(_3, [_2]);

	const scope = new Container();
	const container_1 = new Resolution(scope);

	container_1.resolve(_1);
	container_1.resolve(_2);
	container_1.resolve(_3);

	expect(resolvedTimes).toBe(3);
});

test('Scoped instance, when being resolved multiple times in different branches, should retain one instance', () => {
	let resolvedTimes = 0;

	@Injectable({
		scope: Scopes.Scoped,
	})
	class _1 {
		value = Symbol(1);

		constructor() {
			++resolvedTimes;
		}
	}
	Injectable.naughtyReflection(_1, []);

	@Injectable({
		scope: Scopes.Scoped,
	})
	class _2 {
		value = Symbol(2);

		constructor(public readonly _1: _1) {
			++resolvedTimes;
		}
	}
	Injectable.naughtyReflection(_2, [_1]);

	@Injectable({
		scope: Scopes.Singleton,
	})
	class _3 {
		value = Symbol(3);

		constructor(public readonly _2: _2) {
			++resolvedTimes;
		}
	}
	Injectable.naughtyReflection(_3, [_2]);

	const scope = new Container();
	const container_1 = new Resolution(scope);

	container_1.resolve(_1);
	container_1.resolve(_2);
	container_1.resolve(_3);

	expect(resolvedTimes).toBe(3);
});

test('Scoped instance, when being resolved multiple times in different branches and scopes, should retain one instance', () => {
	let resolvedTimes = 0;

	@Injectable({
		scope: Scopes.Scoped,
	})
	class _1 {
		value = Symbol(1);

		constructor() {
			++resolvedTimes;
		}
	}
	Injectable.naughtyReflection(_1, []);

	@Injectable({
		scope: Scopes.Scoped,
	})
	class _2 {
		value = Symbol(2);

		constructor(public readonly _1: _1) {
			++resolvedTimes;
		}
	}
	Injectable.naughtyReflection(_2, [_1]);

	@Injectable({
		scope: Scopes.Singleton,
	})
	class _3 {
		value = Symbol(3);

		constructor(public readonly _2: _2) {
			++resolvedTimes;
		}
	}
	Injectable.naughtyReflection(_3, [_2]);

	const scope = new Container();
	const container_1 = new Resolution(scope);

	const container_2 = new Resolution(scope);

	container_1.resolve(_1);
	container_1.resolve(_2);
	container_2.resolve(_3);

	expect(resolvedTimes).toBe(3);
});

test('Transient instance, when being resolved multiple times in different branches, should create new instances', () => {
	let resolvedTimes = 0;

	@Injectable({
		scope: Scopes.Transient,
	})
	class _1 {
		value = Symbol(1);

		constructor() {
			++resolvedTimes;
		}
	}
	Injectable.naughtyReflection(_1, []);

	@Injectable({
		scope: Scopes.Transient,
	})
	class _2 {
		value = Symbol(2);

		constructor(public readonly _1: _1) {
			++resolvedTimes;
		}
	}
	Injectable.naughtyReflection(_2, [_1]);

	@Injectable({
		scope: Scopes.Transient,
	})
	class _3 {
		value = Symbol(3);

		constructor(public readonly _2: _2) {
			++resolvedTimes;
		}
	}
	Injectable.naughtyReflection(_3, [_2]);

	const scope = new Container();
	const container_1 = new Resolution(scope);

	container_1.resolve(_1);
	container_1.resolve(_2);
	container_1.resolve(_3);

	expect(resolvedTimes).toBe(6);
});

test("Scope instances, when being resolved through nestled containers, should be able to derive instance wherever it's resolved", () => {
	@Injectable()
	class I {}

	Injectable.naughtyReflection(I, []);

	const c1 = new Container();
	const c2 = new Container(c1);
	const c3 = new Container(c2);

	const r1 = new Resolution(c1);
	const r2 = new Resolution(c2);
	const r3 = new Resolution(c3);

	const i1 = r1.resolve(I);
	const i2 = r2.resolve(I);
	const i3 = r3.resolve(I);

	expect(i1).toBe(i2);
	expect(i2).toBe(i3);
	expect(i3).toBe(i1);
	expect(i3).toBe(i2);
});

test('Singleton instance, when being resolved using str, should apply Singleton rules', () => {
	let resolvedTimes = 0;

	@Injectable({
		scope: 'singleton',
	})
	class _1 {
		value = Symbol(1);

		constructor() {
			++resolvedTimes;
		}
	}
	Injectable.naughtyReflection(_1, []);

	@Injectable({
		scope: 'singleton',
	})
	class _2 {
		value = Symbol(2);

		constructor(public readonly _1: _1) {
			++resolvedTimes;
		}
	}
	Injectable.naughtyReflection(_2, [_1]);

	@Injectable({
		scope: 'singleton',
	})
	class _3 {
		value = Symbol(3);

		constructor(public readonly _2: _2) {
			++resolvedTimes;
		}
	}
	Injectable.naughtyReflection(_3, [_2]);

	const scope = new Container();
	const container_1 = new Resolution(scope);

	container_1.resolve(_1);
	container_1.resolve(_2);
	container_1.resolve(_3);

	expect(resolvedTimes).toBe(3);
});

test('Scoped instance, when being resolved using str, should apply Scoped rules', () => {
	let resolvedTimes = 0;

	@Injectable({
		scope: 'scoped',
	})
	class _1 {
		value = Symbol(1);

		constructor() {
			++resolvedTimes;
		}
	}
	Injectable.naughtyReflection(_1, []);

	@Injectable({
		scope: 'scoped',
	})
	class _2 {
		value = Symbol(2);

		constructor(public readonly _1: _1) {
			++resolvedTimes;
		}
	}
	Injectable.naughtyReflection(_2, [_1]);

	@Injectable({
		scope: 'singleton',
	})
	class _3 {
		value = Symbol(3);

		constructor(public readonly _2: _2) {
			++resolvedTimes;
		}
	}
	Injectable.naughtyReflection(_3, [_2]);

	const scope = new Container();
	const container_1 = new Resolution(scope);

	const container_2 = new Resolution(scope);

	container_1.resolve(_1);
	container_1.resolve(_2);
	container_2.resolve(_3);

	expect(resolvedTimes).toBe(3);
});

test('Transient instance, when being resolved using str, should apply Transient rules', () => {
	let resolvedTimes = 0;

	@Injectable({
		scope: 'transient',
	})
	class _1 {
		value = Symbol(1);

		constructor() {
			++resolvedTimes;
		}
	}
	Injectable.naughtyReflection(_1, []);

	@Injectable({
		scope: 'transient',
	})
	class _2 {
		value = Symbol(2);

		constructor(public readonly _1: _1) {
			++resolvedTimes;
		}
	}
	Injectable.naughtyReflection(_2, [_1]);

	@Injectable({
		scope: 'transient',
	})
	class _3 {
		value = Symbol(3);

		constructor(public readonly _2: _2) {
			++resolvedTimes;
		}
	}
	Injectable.naughtyReflection(_3, [_2]);

	const scope = new Container();
	const container_1 = new Resolution(scope);

	container_1.resolve(_1);
	container_1.resolve(_2);
	container_1.resolve(_3);

	expect(resolvedTimes).toBe(6);
});
