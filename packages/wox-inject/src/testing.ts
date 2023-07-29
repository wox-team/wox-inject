import { DependencyScope, InjectionContainer } from './inject';

export function createTestBed(): InjectionContainer {
	return new InjectionContainer(new DependencyScope());
}
