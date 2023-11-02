import { ServiceLifetimes, type Token } from './inject';
import { DependencyScope, InjectionContainer } from './inject';

/**
 * Creates a new TestBed instance, which is a container for
 * managing dependencies and facilitating dependency injection.
 */
export function createTestBed() {
	return new TestBed();
}

class TestBed {
	public readonly injectionContainer: InjectionContainer;
	public readonly dependencyScope: DependencyScope;

	constructor() {
		this.dependencyScope = new DependencyScope();
		this.injectionContainer = new InjectionContainer(this.dependencyScope);
	}

	public resolve<T>(dependencyToken: Token<T>) {
		return this.injectionContainer.resolve(dependencyToken);
	}

	public mockRegister<T>(token: Token<any>, factory: T, lifeTime?: ServiceLifetimes): void {
		this.dependencyScope.addHotRegistration(token, factory, lifeTime);
	}

	public clearMocks() {
		this.dependencyScope.clearHotRegistration();
	}
}
