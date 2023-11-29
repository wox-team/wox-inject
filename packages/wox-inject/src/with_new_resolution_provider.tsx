import { NewContainer } from './inject_react';
import { type ComponentType } from 'react';

export function withNewContainer<T extends Record<string, unknown>>(Component: ComponentType<T>) {
	return function NewDependencyScope(props: T) {
		return <NewContainer>{<Component {...props} />}</NewContainer>;
	};
}

/**
 * @deprecated use "withNewContainer" instead.
 */
export const withNewResolutionProvider = withNewContainer;
