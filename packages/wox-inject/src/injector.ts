import { Injectable, Token, getResolveScopeRef } from './inject';

@Injectable()
export class Injector {
	private readonly currentInjectionContainer = getResolveScopeRef();

	public resolve<T>(dependencyToken: Token<T>): T {
		return this.currentInjectionContainer.resolve(dependencyToken);
	}
}
Injectable.naughtyReflection(Injector, []);
