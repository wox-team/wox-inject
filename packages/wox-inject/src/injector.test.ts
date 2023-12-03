import { expect, test } from 'vitest';
import { Container, Injectable, Resolution, Scopes, Token } from './inject';
import { Injector } from './injector';

test('Injector, when being resolved, should have stored a reference to the Resolution', () => {
	@Injectable()
	class Dep {
		constructor(public injector: Injector) {}
	}
	Injectable.naughtyReflection(Dep, [Injector]);

	const scope = new Container();
	const container = new Resolution(scope);

	const dep = container.resolve(Dep);

	expect(dep.injector['currentResolution']).toBe(container);
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

	const scope = new Container();
	const container = new Resolution(scope);

	const dep = container.resolve(Dep);
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

	const scope = new Container();
	const container = new Resolution(scope);

	const dep = container.resolve(Dep);
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

	const scope = new Container();
	const container = new Resolution(scope);

	const dep = container.resolve(Dep);
	const dep2 = dep.resolveFromInstance(Dep);

	expect(dep).not.toBe(dep2);
});
