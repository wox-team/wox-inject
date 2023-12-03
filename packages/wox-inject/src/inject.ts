/* eslint-disable @typescript-eslint/no-explicit-any */
import { Graph } from './_graph';
import { todo } from '@wox-team/wox-app-vitals';

let currentResolution: Resolution | null = null;

const NOOP = () => {
	/* noop */
};
const MAX_RECURSION_DEPTH_BEFORE_FLAGGING_CIRCULAR_NODES = 0xffff;

export type Ctor<T> = {
	new (...args: any[]): T;
};

export type GenericClassDecorator<T> = (target: T) => void;

export type Token<T = unknown> = Ctor<T> | symbol;

export enum Scopes {
	Singleton,
	Transient,
	Scoped,
	/* @Internal */
	Unknown,
}

interface RegistrationSettings {
	readonly scope: Scopes;
}

interface Registration<T> {
	readonly token: Token<T>;
	readonly someValue: Token<T>;
	readonly settings: RegistrationSettings;
}

const registry: Registration<any>[] = [];

function INTERNAL_register<T>(
	token: Token<any>,
	someValue: Ctor<T>,
	settings: RegistrationSettings,
	__fake__reflection?: any[],
): void {
	registry.push({
		token,
		someValue,
		settings,
	});

	if (__fake__reflection != null) {
		INTERNAL_setCachedReflection(token, __fake__reflection);
	}
}

export function getResolveScopeRef(): Resolution {
	if (currentResolution == null) throw new Error('Could not reach the current injector');

	return currentResolution;
}

export function resolve<T>(token: Token<T>): T {
	return getResolveScopeRef().resolve(token);
}

export function clearRegistry(): void {
	while (registry.length) {
		registry.pop();
	}
}

interface ReflectedData {
	key: Token;
	value: Token[];
}

const REFLECTED_DATA_REGISTRY_CACHE: ReflectedData[] = [];

function INTERNAL_getCachedReflection<T extends Token<any>>(reflector: T): Token[] {
	const cachedReflection = REFLECTED_DATA_REGISTRY_CACHE.find((x) => x.key === reflector);
	if (cachedReflection != null) return cachedReflection.value;

	if (Injectable.lookup !== (NOOP as any)) {
		const reflectedData = INTERNAL_setCachedReflection(reflector, Injectable.lookup<T>(reflector));

		return reflectedData.value;
	}

	return [];
}

interface ConcreteClassSymbol<K, T extends K> {
	new (...args: any): T;
}

type ConcreteMappedSymbols<Type extends (abstract new (...args: any) => any)[]> = {
	[Property in keyof Type]: ConcreteClassSymbol<any, Type[Property]>;
};

function INTERNAL_setCachedReflection<T extends Token<any>>(
	reflector: T,
	reflectedTokens: T extends Ctor<any> ? ConcreteMappedSymbols<ConstructorParameters<T>> : Token[],
): ReflectedData {
	const cachedReflection = REFLECTED_DATA_REGISTRY_CACHE.find((x) => x.key === reflector);
	if (cachedReflection != null) return cachedReflection;

	const newCachedReflectionData: ReflectedData = {
		key: reflector,
		value: reflectedTokens,
	};
	REFLECTED_DATA_REGISTRY_CACHE.push(newCachedReflectionData);

	return newCachedReflectionData;
}

interface InjectableSettings {
	/**
	 * @deprecated Use `scope` instead.
	 */
	readonly lifetime?: Scopes;
	readonly scope?: Scopes;
}

/**
 * Returns a decorator that that marks a class as available to be provided and injected as a dependency.
 */
export function Injectable(settings?: InjectableSettings): GenericClassDecorator<Ctor<any>>;
// @internal
export function Injectable(settings?: InjectableSettings, __fake__reflection?: Token<any>[]): GenericClassDecorator<Ctor<any>> {
	const scope = settings?.scope ?? settings?.lifetime ?? Scopes.Scoped;

	return function decorate<T>(ctor: Ctor<T>) {
		INTERNAL_register(
			ctor,
			ctor,
			{
				scope: scope,
			},
			__fake__reflection,
		);
	};
}

export type LookupImpl = <T>(token: Token<T>) => T extends Ctor<any> ? ConcreteMappedSymbols<ConstructorParameters<T>> : Token[];

export function register<T>(token: Token<any>, someValue: Ctor<T>, scope?: Scopes): void {
	INTERNAL_register(token, someValue, {
		scope: scope ?? Scopes.Scoped,
	});
}

Injectable.naughtyReflection = INTERNAL_setCachedReflection;
Injectable.lookup = NOOP as unknown as LookupImpl;
Injectable.register = register;

interface Resolved<T> {
	token: Token<T>;
	instance: T;
}

/**
 * The Container class has the responsibility is to hold onto all the resolved instances during runtime and providing easy to access
 */
export class Container {
	public readonly singletons: Resolved<unknown>[];
	public readonly inheritedScoped: Resolved<unknown>[];
	public readonly scoped: Resolved<unknown>[];
	public hotRegistrationRegister: Registration<any>[];

	constructor(parentScope?: Container, shouldInherit = true) {
		this.scoped = [];
		this.inheritedScoped = shouldInherit ? parentScope?.scoped ?? [] : [];
		this.singletons = parentScope?.singletons ?? [];
		this.hotRegistrationRegister = parentScope?.hotRegistrationRegister ?? [];
	}

	/**
	 * Given the current context, it'll try to find any resolved Singletons or Scoped instances.
	 *
	 * @throws Will throw an error if dependency is not registered.
	 */
	public getPotentialResolvedDependency<T>(dependencyToken: Token<T>): [resolved: T | null, registration: Registration<T>] {
		const registration = this.scanRegistration(dependencyToken);
		if (registration == null) {
			throw new Error(`Dependency not registered: ${dependencyToken.toString()}`);
		}

		const resolved = this.scanResolved(registration);
		if (resolved != null) return [resolved.instance, registration];

		return [null, registration];
	}

	public scanRegistration<T>(dependencyToken: Token<T>): Registration<T> | null {
		// Goes backwards to make it simpler compatible with testing.
		let registration: Registration<T> | null = null;
		for (let index = registry.length; index > 0; index--) {
			const item = registry[index - 1];
			if (item.token === dependencyToken) {
				registration = item;

				break;
			}
		}

		if (this.hotRegistrationRegister.length > 0) {
			for (const hotRegistration of this.hotRegistrationRegister) {
				if (hotRegistration.token === dependencyToken) {
					if (registration) {
						(registration.someValue as any) = hotRegistration.someValue;
					} else {
						registration = hotRegistration;
					}

					break;
				}
			}
		}

		if (registration != null) {
			return registration;
		}

		return null;
	}

	public scanRegistrationStrict<T>(dependencyToken: Token<T>): Registration<T> {
		const registration = this.scanRegistration(dependencyToken);
		if (registration == null) throw new Error(`Could not retrieve registration. "${unwrapTokenForPrint(dependencyToken)}"`);

		return registration;
	}

	public scanResolved<T>(registration: Registration<T>): Resolved<T> | null {
		if (registration.settings.scope === Scopes.Singleton) {
			return (this.singletons.find((x) => x.token === registration.token) as Resolved<T>) ?? null;
		}

		if (registration.settings.scope === Scopes.Scoped) {
			return (
				(this.scoped.find((x) => x.token === registration.token) as Resolved<T>) ??
				this.inheritedScoped.find((x) => x.token === registration.token) ??
				null
			);
		}

		return null;
	}

	public addHotRegistration<T>(dependencyToken: Token<T>, value: any, scope?: Scopes): void {
		this.hotRegistrationRegister.push({
			token: dependencyToken,
			someValue: value as any,
			settings: {
				scope: scope ?? Scopes.Unknown,
			},
		});
	}

	public clearHotRegistration(): void {
		this.hotRegistrationRegister = [];
	}
}

export class Resolution {
	private static instanceCounter = 0;

	public readonly id: number;
	readonly #container: Container;

	constructor(container: Readonly<Container>) {
		this.id = Resolution.instanceCounter++;

		this.#container = container as Container;
	}

	public linkScope(): Readonly<Container> {
		return this.#container;
	}

	public resolve<T>(dependencyToken: Token<T>): T {
		// eslint-disable-next-line @typescript-eslint/no-this-alias
		currentResolution = this;

		// If the token, for this depth, has already been resolved. Return it.
		const [resolved, registration] = this.#container.getPotentialResolvedDependency(dependencyToken);
		if (resolved != null) return resolved;

		const dependenciesForEachDependency = new Map<Token, Registration<unknown>[]>();

		// Here we're setting up a graph to plot out all the included dependencies of the resolving dependency.
		const dependencyGraph = new Graph<NodeData>((node) => node.id);

		const transients: Resolved<unknown>[] = [];

		// -- Step one - Branch Step --

		const nodeStack = [this.step_one_createNode(registration, null)];

		// Keeping track of the depth might seem redundant but it does provide an early sign that something is wrong.
		// If a tree structure is approaching the maximum depth, something is up...
		let depth = 0;
		while (nodeStack.length > 0) {
			const node = nodeStack.pop();
			if (node == null) throw new Error('Undefined behavior, how did you end up here?');
			if (depth++ > MAX_RECURSION_DEPTH_BEFORE_FLAGGING_CIRCULAR_NODES) throw new Error('Reach max depth, recursive dependency?');

			dependencyGraph.lookupOrInsertNode(node);

			const dependencies = INTERNAL_getCachedReflection(node.registration.token);
			const registrations = dependencies.map((dependency) => this.#container.scanRegistrationStrict(dependency));

			for (const registration of registrations) {
				if (registration == null) throw new Error('A dependency was not registered.');

				const newEdge = this.step_one_createNode(registration, node.parent);
				dependencyGraph.insertEdge(node, newEdge);

				nodeStack.push(newEdge);
			}

			dependenciesForEachDependency.set(node.registration.token, registrations);
		}

		// -- Step two - Producer Step --

		depth = 0;
		while (true) {
			if (depth++ > MAX_RECURSION_DEPTH_BEFORE_FLAGGING_CIRCULAR_NODES) throw new Error('Reach max depth, recursive dependency?');

			const edges = dependencyGraph.edges();

			if (edges.length === 0) {
				if (!dependencyGraph.isEmpty()) throw new Error('Graph contains nodes which never got removed.');

				break;
			}

			for (const edge of edges) {
				const registration = edge.data.registration;
				const token = registration.token;
				const factory = registration.someValue;

				dependencyGraph.removeNode(edge.data.id);

				if (typeof token === 'symbol') {
					todo('Non ctor injection');
				} else {
					let resolved = registration ? this.#container.scanResolved(registration) : null;
					if (resolved == null) {
						const args = this.step_two_retrieveArgs(token, dependenciesForEachDependency, transients);
						const instance = new /* As Ctor */ (factory as any)(...args);

						resolved = {
							instance: instance,
							token: token,
						} satisfies Resolved<unknown>;
					}

					if (registration.settings.scope === Scopes.Singleton) {
						this.#container.singletons.push(resolved);

						continue;
					}

					if (registration.settings.scope === Scopes.Scoped) {
						this.#container.scoped.push(resolved);

						continue;
					}

					if (registration.settings.scope === Scopes.Transient) {
						transients.push(resolved);

						continue;
					}

					throw new Error('Unknown scope');
				}
			}
		}

		// -- Step three - Retrieve step --

		let instance: T;
		if (registration.settings.scope === Scopes.Transient) {
			instance = transients[0].instance as T;
		} else {
			const newResolved = this.#container.scanResolved(registration);
			if (newResolved == null) {
				todo('Cannot get the complete resolution');
			}

			instance = newResolved.instance;
		}

		currentResolution = null;

		return instance;
	}

	private step_one_createNode<T>(registration: Registration<T>, parent: Registration<unknown> | null): NodeData {
		let id = registration.token;
		if (registration.settings.scope === Scopes.Transient) {
			id = Symbol('force new edge');
		}

		return {
			id,
			registration,
			parent,
		};
	}

	private step_two_retrieveArgs(
		token: Ctor<unknown>,
		depRef: Map<Token, Registration<unknown>[]>,
		transients: Resolved<unknown>[],
	): unknown[] {
		const lookupDependencies = depRef.get(token) ?? [];

		const args: unknown[] = [];

		for (const dep of lookupDependencies) {
			let instance: unknown;
			if (dep.settings.scope === Scopes.Transient) {
				const i = transients.findIndex((x) => x.token === dep.token);
				if (i === -1) {
					throw new Error('Could not find a transient instance');
				}

				instance = transients[i].instance;
				transients.splice(i, 1);
			} else {
				const resolved = this.#container.scanResolved(dep);
				if (resolved == null) {
					todo('Failed to a resolved dep');
				}

				instance = resolved.instance;
			}

			args.push(instance);
		}

		return args;
	}
}

interface NodeData {
	id: Token<unknown>;
	registration: Registration<unknown>;
	parent: Registration<unknown> | null;
}

function unwrapTokenForPrint(token: Token): string {
	if (token instanceof Symbol) {
		return token.toString();
	}

	return token.toString();
}
