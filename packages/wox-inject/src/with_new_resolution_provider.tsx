import { NewContainer } from './inject_react';
import { type ComponentType } from 'react';

export function withNewContainer<T extends Record<string, unknown>>(Component: ComponentType<T>) {
	return function (props: T) {
		return <NewContainer>{<Component {...props} />}</NewContainer>;
	};
}
