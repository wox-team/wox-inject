import { ResolutionProvider } from './inject_react';
import { type ComponentType } from 'react';

export function withNewResolutionProvider<T extends Record<string, unknown>>(Component: ComponentType<T>) {
	return function NewDependencyScope(props: T) {
		return <ResolutionProvider>{<Component {...props} />}</ResolutionProvider>;
	};
}
