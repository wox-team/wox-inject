/* eslint-disable @typescript-eslint/no-explicit-any */
import { Graph } from './_graph';
import { todo } from './_todo';

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
}

interface RegistrationSettings {
	readonly lifeTime: ServiceLifetimes;
}

interface Registration<T> {
	readonly token: Token<T>;
	readonly settings: RegistrationSettings;
}

const registry: Registration<any>[] = [];

function INTERNAL_register<T>(token: Ctor<T>, settings: RegistrationSettings, __fake__reflection?: any[]): void {
	registry.push({
		token,
		settings,
	});

	if (__fake__reflection != null) {
		INTERNAL_setCachedReflection(token, __fake__reflection);
	}
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

function INTERNAL_getCachedReflection(reflector: Token): Token[] {
	const cachedReflection = REFLECTED_DATA_REGISTRY_CACHE.find((x) => x.key === reflector);
	if (cachedReflection != null) return cachedReflection.value;

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
			settings ?? {
				lifeTime: ServiceLifetimes.Scoped,
			},
			__fake__reflection,
		);
	};
}

Injectable.naughtyReflection = INTERNAL_setCachedReflection;
Injectable.resolve = INTERNAL_setCachedReflection;

interface Resolved<T> {
	token: Token<T>;
	instance: T;
}

/**
 * The DependencyScope class has the responsibility is to hold onto all the resolved instances during runtime and providing easy to access
 */
export class DependencyScope {
	readonly singletons: Resolved<unknown>[];
	readonly scoped: Resolved<unknown>[] = [];

	constructor(parentScope?: DependencyScope) {
		this.singletons = parentScope?.singletons ?? [];
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

		if (registration != null) {
			return registration;
		}

		return null;
	}

	public scanRegistrationStrict<T>(dependencyToken: Token<T>): Registration<T> {
		const registration = this.scanRegistration(dependencyToken);
		if (registration == null) throw new Error('Could not retrieve registration.');

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
}

export class InjectionContainer {
	static instanceCounter = 0;

	public readonly id: number;
	readonly #dependencyScope: DependencyScope;

	constructor(dependencyScope: DependencyScope) {
		this.id = InjectionContainer.instanceCounter++;

		this.#dependencyScope = dependencyScope;
	}

	public linkScope(): Readonly<DependencyScope> {
		return this.#dependencyScope;
	}

	public resolve<T>(dependencyToken: Token<T>): T {
		const [resolved, registration] = this.#dependencyScope.getPotentialResolvedDependency(dependencyToken);
		if (resolved != null) return resolved;

		const dependenciesForEachDependency = new Map<Token, Registration<unknown>[]>();

		// Here we're setting up a graph to plot out all the included dependencies of the resolving dependency.
		const dependencyGraph = new Graph<NodeData>((node) => node.id);

		// Step one - Branch Step

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

		// Step two - Producer Step

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

				dependencyGraph.removeNode(edge.data.id);

				if (typeof token === 'symbol') {
					todo('Non ctor injection');
				} else {
					const args = this.step_two_retrieveArgs(token, dependenciesForEachDependency);
					const instance = new /* As Ctor */ token(...args);

					const resolved = {
						instance: instance,
						token: token,
					} satisfies Resolved<unknown>;

					if (registration.settings.lifeTime === ServiceLifetimes.Singleton) {
						this.#dependencyScope.singletons.push(resolved);

						continue;
					}

					if (registration.settings.lifeTime === ServiceLifetimes.Scoped) {
						this.#dependencyScope.scoped.push(resolved);

						continue;
					}

					if (registration.settings.lifeTime === ServiceLifetimes.Transient) {
						todo('Resolve transients');

						continue;
					}

					throw new Error('Unknown lifetime');
				}
			}
		}

		// Step three - Retrieve step

		const newResolved = this.#dependencyScope.scanResolved(registration);
		if (newResolved == null) {
			todo('Cannot get the complete resolution');
		}

		return newResolved.instance;
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

	private step_two_retrieveArgs(token: Ctor<unknown>, depRef: Map<Token, Registration<unknown>[]>): unknown[] {
		const lookupDependencies = depRef.get(token) ?? [];
		const args: unknown[] = [];

		for (const dep of lookupDependencies) {
			const resolved = this.#dependencyScope.scanResolved(dep);
			if (resolved == null) {
				todo('Failed to a resolved dep');
			}

			args.push(resolved.instance);
		}

		return args;
	}
}

interface NodeData {
	id: Token<unknown>;
	registration: Registration<unknown>;
	parent: Registration<unknown> | null;
}
