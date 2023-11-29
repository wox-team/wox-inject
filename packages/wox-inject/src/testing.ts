import { Scopes, type Token } from './inject';
import { Container, InjectionContainer } from './inject';

/**
 * Creates a new TestBed instance, which is a container for
 * managing dependencies and facilitating dependency injection.
 */
export function createTestBed() {
	return new TestBed();
}

class TestBed {
	public readonly injectionContainer: InjectionContainer;
	public readonly container: Container;

	constructor() {
		this.container = new Container();
		this.injectionContainer = new InjectionContainer(this.container);
	}

	public resolve<T>(dependencyToken: Token<T>) {
		return this.injectionContainer.resolve(dependencyToken);
	}

	public mockRegister<T>(token: Token<any>, factory: T, lifeTime?: Scopes): void {
		this.container.addHotRegistration(token, factory, lifeTime);
	}

	public clearMocks() {
		this.container.clearHotRegistration();
	}
}
