import { ResolutionProvider } from './inject_react';
import { type ComponentType } from 'react';

export function withNewContainer<T extends Record<string, unknown>>(Component: ComponentType<T>) {
	return function NewDependencyScope(props: T) {
		return <ResolutionProvider>{<Component {...props} />}</ResolutionProvider>;
	};
}

/**
 * @deprecated use "withNewContainer" instead.
 */
export const withNewResolutionProvider = withNewContainer;
