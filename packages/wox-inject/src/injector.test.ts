import { expect, test } from 'vitest';
import { Container, Injectable, Resolution, Scopes, Token } from './inject';
import { Injector } from './injector';
import { createTestBed } from './testing';

test('Injector, when being resolved, should have stored a reference to the Resolution', () => {
	@Injectable()
	class Dep {
		constructor(public injector: Injector) {}
	}
	Injectable.naughtyReflection(Dep, [Injector]);

	const container = new Container();
	const resolution = new Resolution(container);

	const dep = resolution.resolve(Dep);

	expect(dep.injector['currentResolution']).toBe(resolution);
});

test('Injector, when injector resolves a Singleton, should resolve from the referenced Resolution', () => {
	@Injectable({
		scope: Scopes.Singleton,
	})
	class Dep {
		constructor(public injector: Injector) {}

		resolveFromInstance<T>(token: Token<T>): T {
			return this.injector.resolve(token);
		}
	}
	Injectable.naughtyReflection(Dep, [Injector]);

	const container = new Container();
	const resolution = new Resolution(container);

	const dep = resolution.resolve(Dep);
	const dep2 = dep.resolveFromInstance(Dep);

	expect(dep).toBe(dep2);
});

test('Injector, when injector resolves a Scoped, should resolve from the referenced Resolution', () => {
	@Injectable({
		scope: Scopes.Scoped,
	})
	class Dep {
		constructor(public injector: Injector) {}

		resolveFromInstance<T>(token: Token<T>): T {
			return this.injector.resolve(token);
		}
	}
	Injectable.naughtyReflection(Dep, [Injector]);

	const container = new Container();
	const resolution = new Resolution(container);

	const dep = resolution.resolve(Dep);
	const dep2 = dep.resolveFromInstance(Dep);

	expect(dep).toBe(dep2);
});

test('Injector, when injector resolves a Transient, should resolve from the referenced Resolution', () => {
	@Injectable({
		scope: Scopes.Transient,
	})
	class Dep {
		constructor(public injector: Injector) {}

		resolveFromInstance<T>(token: Token<T>): T {
			return this.injector.resolve(token);
		}
	}
	Injectable.naughtyReflection(Dep, [Injector]);

	const container = new Container();
	const resolution = new Resolution(container);

	const dep = resolution.resolve(Dep);
	const dep2 = dep.resolveFromInstance(Dep);

	expect(dep).not.toBe(dep2);
});

test('Injector, real world scenario, transient should return correct instance', () => {
	// The setup here is a bit contrived, but it's to test the real world scenario of resolving a transient instance.

	@Injectable({
		scope: Scopes.Transient,
	})
	class CorrectClass {
		constructor(b: B, e: E, g: G, h: H, i: I, j: J, injector: Injector, k: K, l: L, m: M, o: O) {}
	}

	@Injectable({
		scope: Scopes.Transient,
	})
	class WrongClass {
		constructor(c: C, u: J) {}
	}

	@Injectable({
		scope: Scopes.Singleton,
	})
	class B {
		constructor() {}
	}

	@Injectable({
		scope: Scopes.Singleton,
	})
	class C {
		constructor() {}
	}

	@Injectable()
	class E {
		constructor(h: WrongClass) {}
	}

	@Injectable({
		scope: Scopes.Singleton,
	})
	class F {
		constructor(h: WrongClass) {}
	}

	@Injectable()
	class G {
		constructor(u: F) {}
	}

	@Injectable({
		scope: Scopes.Singleton,
	})
	class H {
		constructor() {}
	}

	@Injectable({
		scope: Scopes.Singleton,
	})
	class I {
		constructor() {}
	}

	@Injectable({
		scope: Scopes.Singleton,
	})
	class J {
		constructor() {}
	}

	@Injectable({
		scope: Scopes.Singleton,
	})
	class K {
		constructor() {}
	}

	@Injectable()
	class L {
		constructor(d: WrongClass) {}
	}

	@Injectable()
	class M {
		constructor() {}
	}

	@Injectable()
	class O {
		constructor(c: C, j: J) {}
	}

	Injectable.naughtyReflection(CorrectClass, [B, E, G, H, I, J, Injector, K, L, M, O]);
	Injectable.naughtyReflection(B, []);
	Injectable.naughtyReflection(C, []);
	Injectable.naughtyReflection(H, []);
	Injectable.naughtyReflection(I, []);
	Injectable.naughtyReflection(J, []);
	Injectable.naughtyReflection(K, []);
	Injectable.naughtyReflection(M, []);
	Injectable.naughtyReflection(E, [WrongClass]);
	Injectable.naughtyReflection(F, [WrongClass]);
	Injectable.naughtyReflection(G, [F]);
	Injectable.naughtyReflection(L, [WrongClass]);
	Injectable.naughtyReflection(WrongClass, [C, J]);
	Injectable.naughtyReflection(O, [C, J]);

	const testBed = createTestBed();
	const injector = testBed.resolve(Injector);

	// In the real world scenario all the instances has been resolved.
	injector.resolve(B);
	injector.resolve(C);
	injector.resolve(WrongClass);
	injector.resolve(E);
	injector.resolve(F);
	injector.resolve(G);
	injector.resolve(H);
	injector.resolve(I);
	injector.resolve(J);
	injector.resolve(K);
	injector.resolve(L);
	injector.resolve(M);
	injector.resolve(O);

	const instance = injector.resolve(CorrectClass);

	expect(instance).toBeInstanceOf(CorrectClass);
});
