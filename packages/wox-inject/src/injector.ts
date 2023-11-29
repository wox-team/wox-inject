import { Injectable, Token, getResolveScopeRef } from './inject';

@Injectable()
export class Injector {
	private readonly currentResolution = getResolveScopeRef();

	public resolve<T>(dependencyToken: Token<T>): T {
		return this.currentResolution.resolve(dependencyToken);
	}
}
Injectable.naughtyReflection(Injector, []);
