// Reason: For abstract inheritance usage for ControllerProtocol, this module can't imposed the method shape on the implementor.
/* eslint-disable @typescript-eslint/no-explicit-any */

import { useConstant } from '@wox-team/wox-app-vitals';
import { createContext, useContext, useLayoutEffect } from 'react';
import { DependencyScope, InjectionContainer } from './inject';
import type { Token } from './inject';

const ResolutionContext = createContext(new InjectionContainer(new DependencyScope()));

/**
 * A React component that provides an optional dependency resolution scope to its child components.
 * When used, it creates a new dependency injection container and sets it as the context value,
 * allowing for isolated dependency management within its subtree.
 *
 * @param {React.PropsWithChildren} props - The properties and children to be rendered.
 * @returns {JSX.Element} A JSX element that wraps its children with an optional dependency resolution context.
 *
 * @example
 * // To enable isolated dependency resolution within a component subtree, wrap it with ResolutionProvider.
 * <ResolutionProvider>
 *   <ComponentWithDependencies />
 * </ResolutionProvider>
 *
 * // Alternatively, the app can still function without using ResolutionProvider.
 * // In this case, dependency resolution will use the parent container's scope.
 * <App />
 */
export function ResolutionProvider(props: React.PropsWithChildren) {
	const parentContainer = useContext(ResolutionContext);
	const container = useConstant(() => new InjectionContainer(new DependencyScope(parentContainer.linkScope())));

	return <ResolutionContext.Provider value={container}>{props.children}</ResolutionContext.Provider>;
}

/**
 * A custom React hook for resolving and using dependencies from the dependency injection container.
 *
 * @param {Token<T>} dependencyToken - The token representing the desired dependency to resolve.
 * @returns {T} The resolved dependency value.
 *
 * @template T
 *
 * @example
 * // Use useDependency to resolve and use a dependency in a functional component.
 * function MyComponent() {
 *   const someService = useDependency(SomeServiceToken);
 *   // Now you can use someService within your component.
 * }
 */
export function useDependency<T>(dependencyToken: Token<T>): T {
	const container = useContext(ResolutionContext);
	const value = useConstant(() => container.resolve(dependencyToken));

	return value;
}

export interface ControllerProtocol {
	whenMount?(): any;
	whenDemount?(): any;
}

type ControllerCtor<T> = {
	new (...args: any[]): T & ControllerProtocol;
};

/**
 * A custom React hook for resolving and using a controller instance from the dependency injection container.
 *
 * @param {ControllerCtor<T>} dependencyToken - The token representing the controller's constructor function.
 * @returns {T} The resolved controller instance.
 *
 * @template T
 *
 * @example
 * // Use useController to resolve and use a controller in a functional component.
 * function MyComponent() {
 *   const controller = useController(MyControllerToken);
 *   // Now you can use the controller instance within your component.
 * }
 */
export function useController<T extends ControllerProtocol>(dependencyToken: ControllerCtor<T>): T {
	const instance = useDependency(dependencyToken);

	useLayoutEffect(
		function ReactLifeCycleTapIn() {
			boxFn(instance.whenMount?.bind(instance));

			return () => {
				boxFn(instance.whenDemount?.bind(instance));
			};
		},
		[instance],
	);

	return instance;
}

function boxFn(fn: ((...args: any[]) => any) | undefined) {
	try {
		const response = fn?.();
		if (response instanceof Promise) {
			response.catch((error) => {
				printBoxedError(error);
			});
		}
	} catch (error) {
		printBoxedError(error);
	}
}

function printBoxedError(exception: unknown) {
	let error: Error;
	if (exception instanceof Error) {
		error = exception;
	} else {
		error = new Error('unknown', {
			cause: exception,
		});
	}

	console.error(error);
}
