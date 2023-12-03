import { beforeEach, expect, test } from 'vitest';
import { Injectable, Scopes, clearRegistry } from './inject';
import { createTestBed } from './testing';

beforeEach(() => {
	clearRegistry();
});

test('Singleton over-register, when developers register mock values for a token, it should retrieve the mock value', () => {
	@Injectable({
		scope: Scopes.Singleton,
	})
	class Child {
		data = 'should be replaced';
	}

	@Injectable({
		scope: Scopes.Singleton,
	})
	class Parent {
		constructor(public readonly child: Child) {
			// Empty
		}
	}
	Injectable.naughtyReflection(Parent, [Child]);

	const testBed = createTestBed();
	testBed.mockRegister(
		Child,
		class {
			data = 'replaced with this';
		},
	);

	const instance = testBed.resolve(Parent);

	expect(instance.child.data).toBe('replaced with this');
});

test('Scoped over-register, when developers register mock values for a token, it should retrieve the mock value', () => {
	@Injectable({
		scope: Scopes.Scoped,
	})
	class Child {
		data = 'should be replaced';
	}

	@Injectable({
		scope: Scopes.Scoped,
	})
	class Parent {
		constructor(public readonly child: Child) {
			// Empty
		}
	}
	Injectable.naughtyReflection(Parent, [Child]);

	const testBed = createTestBed();
	testBed.mockRegister(
		Child,
		class {
			data = 'replaced with this';
		},
	);

	const instance = testBed.resolve(Parent);

	expect(instance.child.data).toBe('replaced with this');
});

test('Transient over-register, when developers register mock values for a token, it should retrieve the mock value', () => {
	@Injectable({
		scope: Scopes.Transient,
	})
	class Child {
		data = 'should be replaced';
	}

	@Injectable({
		scope: Scopes.Transient,
	})
	class Parent {
		constructor(public readonly child: Child) {
			// Empty
		}
	}
	Injectable.naughtyReflection(Parent, [Child]);

	const testBed = createTestBed();
	testBed.mockRegister(
		Child,
		class {
			data = 'replaced with this';
		},
	);

	const instance = testBed.resolve(Parent);

	expect(instance.child.data).toBe('replaced with this');
});
