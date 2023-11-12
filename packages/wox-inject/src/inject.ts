/* eslint-disable @typescript-eslint/no-explicit-any */
import { Graph } from './_graph';
import { todo } from '@wox-team/wox-app-vitals';

let currentInjectionContainer: InjectionContainer | null = null;

const NOOP = () => {
	/* noop */
};
const MAX_RECURSION_DEPTH_BEFORE_FLAGGING_CIRCULAR_NODES = 0xffff;

export type Ctor<T> = {
	new (...args: any[]): T;
};

export type GenericClassDecorator<T> = (target: T) => void;

export type Token<T = unknown> = Ctor<T> | symbol;

export enum ServiceLifetimes {
	Singleton,
	Transient,
	Scoped,
	/* @Internal */
	Unknown,
}

interface RegistrationSettings {
	readonly lifeTime: ServiceLifetimes;
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

export function getResolveScopeRef(): InjectionContainer {
	if (currentInjectionContainer == null) throw new Error('Could not reach the current injector');

	return currentInjectionContainer;
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

/**
 * Returns a decorator that that marks a class as available to be provided and injected as a dependency.
 */
export function Injectable(settings?: RegistrationSettings): GenericClassDecorator<Ctor<any>>;
// @internal
export function Injectable(settings?: RegistrationSettings, __fake__reflection?: Token<any>[]): GenericClassDecorator<Ctor<any>> {
	return function decorate<T>(ctor: Ctor<T>) {
		INTERNAL_register(
			ctor,
			ctor,
			settings ?? {
				lifeTime: ServiceLifetimes.Scoped,
			},
			__fake__reflection,
		);
	};
}

export type LookupImpl = <T>(token: Token<T>) => T extends Ctor<any> ? ConcreteMappedSymbols<ConstructorParameters<T>> : Token[];

export function register<T>(token: Token<any>, someValue: Ctor<T>, lifeTime?: ServiceLifetimes): void {
	INTERNAL_register(token, someValue, {
		lifeTime: lifeTime ?? ServiceLifetimes.Scoped,
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
 * The DependencyScope class has the responsibility is to hold onto all the resolved instances during runtime and providing easy to access
 */
export class DependencyScope {
	public readonly singletons: Resolved<unknown>[];
	public readonly scoped: Resolved<unknown>[] = [];
	public hotRegistrationRegister: Registration<any>[];

	constructor(parentScope?: DependencyScope) {
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
		if (registration.settings.lifeTime === ServiceLifetimes.Singleton) {
			return (this.singletons.find((x) => x.token === registration.token) as Resolved<T>) ?? null;
		}

		if (registration.settings.lifeTime === ServiceLifetimes.Scoped) {
			return (this.scoped.find((x) => x.token === registration.token) as Resolved<T>) ?? null;
		}

		return null;
	}

	public addHotRegistration<T>(dependencyToken: Token<T>, value: any, lifetime?: ServiceLifetimes): void {
		this.hotRegistrationRegister.push({
			token: dependencyToken,
			someValue: value as any,
			settings: {
				lifeTime: lifetime ?? ServiceLifetimes.Unknown,
			},
		});
	}

	public clearHotRegistration(): void {
		this.hotRegistrationRegister = [];
	}
}

export class InjectionContainer {
	private static instanceCounter = 0;

	public readonly id: number;
	readonly #dependencyScope: DependencyScope;

	constructor(dependencyScope: Readonly<DependencyScope>) {
		this.id = InjectionContainer.instanceCounter++;

		this.#dependencyScope = dependencyScope as DependencyScope;
	}

	public linkScope(): Readonly<DependencyScope> {
		return this.#dependencyScope;
	}

	public resolve<T>(dependencyToken: Token<T>): T {
		// eslint-disable-next-line @typescript-eslint/no-this-alias
		currentInjectionContainer = this;

		// If the token, for this depth, has already been resolved. Return it.
		const [resolved, registration] = this.#dependencyScope.getPotentialResolvedDependency(dependencyToken);
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
			const registrations = dependencies.map((dependency) => this.#dependencyScope.scanRegistrationStrict(dependency));

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
					let resolved = registration ? this.#dependencyScope.scanResolved(registration) : null;
					if (resolved == null) {
						const args = this.step_two_retrieveArgs(token, dependenciesForEachDependency, transients);
						const instance = new /* As Ctor */ (factory as any)(...args);

						resolved = {
							instance: instance,
							token: token,
						} satisfies Resolved<unknown>;
					}

					if (registration.settings.lifeTime === ServiceLifetimes.Singleton) {
						this.#dependencyScope.singletons.push(resolved);

						continue;
					}

					if (registration.settings.lifeTime === ServiceLifetimes.Scoped) {
						this.#dependencyScope.scoped.push(resolved);

						continue;
					}

					if (registration.settings.lifeTime === ServiceLifetimes.Transient) {
						transients.push(resolved);

						continue;
					}

					throw new Error('Unknown lifetime');
				}
			}
		}

		// -- Step three - Retrieve step --

		let instance: T;
		if (registration.settings.lifeTime === ServiceLifetimes.Transient) {
			instance = transients[0].instance as T;
		} else {
			const newResolved = this.#dependencyScope.scanResolved(registration);
			if (newResolved == null) {
				todo('Cannot get the complete resolution');
			}

			instance = newResolved.instance;
		}

		currentInjectionContainer = null;

		return instance;
	}

	private step_one_createNode<T>(registration: Registration<T>, parent: Registration<unknown> | null): NodeData {
		let id = registration.token;
		if (registration.settings.lifeTime === ServiceLifetimes.Transient) {
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
		console.log('transients', transients);

		const args: unknown[] = [];

		for (const dep of lookupDependencies) {
			let instance: unknown;
			if (dep.settings.lifeTime === ServiceLifetimes.Transient) {
				const i = transients.findIndex((x) => x.token === dep.token);
				if (i === -1) {
					throw new Error('Could not find a transient instance');
				}

				instance = transients[i].instance;
				transients.splice(i, 1);
			} else {
				const resolved = this.#dependencyScope.scanResolved(dep);
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
