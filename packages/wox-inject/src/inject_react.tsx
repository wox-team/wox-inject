// Reason: For abstract inheritance usage for ControllerProtocol, this module can't imposed the method shape on the implementor.
/* eslint-disable @typescript-eslint/no-explicit-any */

import { useConstant } from '@wox-team/wox-app-vitals';
import { createContext, useContext, useLayoutEffect, useRef } from 'react';
import { DependencyScope, InjectionContainer } from './inject';
import type { Token } from './inject';

const ResolutionContext = createContext(new InjectionContainer(new DependencyScope()));

interface ResolutionProviderProps extends React.PropsWithChildren {
	parentContainer?: InjectionContainer;
	useInheritanceLink?: boolean;
}

/**
 * A React component that provides an optional dependency resolution scope to its child components.
 * When used, it creates a new dependency injection container and sets it as the context value,
 * allowing for isolated dependency management within its subtree.
 *
 * @param {ResolutionProviderProps} props - The properties and children to be rendered.
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
 * <ComponentWithDependencies />
 */
export function ResolutionProvider(props: ResolutionProviderProps) {
	const parentContainer = useContext(ResolutionContext);
	const container = useConstant(
		() =>
			new InjectionContainer(
				new DependencyScope(props.parentContainer?.linkScope() ?? parentContainer.linkScope(), props.useInheritanceLink ?? true),
			),
	);

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
 * // Use useResolve to resolve and use a dependency in a functional component.
 * function MyComponent() {
 *   const someService = useResolve(SomeServiceToken);
 *   // Now you can use someService within your component.
 * }
 */
export function useResolve<T>(dependencyToken: Token<T>): T {
	const container = useContext(ResolutionContext);
	const value = useConstant(() => container.resolve(dependencyToken));

	return value;
}

/**
 * @deprecated use "useResolve" instead.
 */
export const useDependency = useResolve;

export interface ControllerProtocol<T extends any[] = any[]> {
	whenMount?(...args: T): any;
	whenUpdate?(...args: T): any;
	whenDemount?(...args: T): any;
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
 * // Use useController to resolve and use a controller in a React component.
 * function MyComponent() {
 *   const controller = useController(MyControllerToken);
 *   // Now you can use the controller instance within your component.
 * }
 */
export function useController<T extends ControllerProtocol>(
	dependencyToken: ControllerCtor<T>,
	...params: T['whenMount'] extends (...args: any) => any
		? Parameters<T['whenMount']>
		: T['whenUpdate'] extends (...args: any) => any
		? Parameters<T['whenUpdate']>
		: T['whenDemount'] extends (...args: any) => any
		? Parameters<T['whenDemount']>
		: never[]
): T {
	const instance = useResolve(dependencyToken);
	const hasCalledMount = useRef(false);
	const latestParams = useRef(params);

	useLayoutEffect(
		function ReactLifeCycleTapIn() {
			if (hasCalledMount.current) {
				latestParams.current = params;
				boxFn(instance.whenUpdate?.bind(instance), latestParams.current);

				return;
			}

			hasCalledMount.current = true;
			boxFn(instance.whenMount?.bind(instance), params);
		},
		[instance, params],
	);

	useLayoutEffect(() => {
		return () => {
			boxFn(instance.whenDemount?.bind(instance), latestParams.current);
		};
	}, [instance]);

	return instance;
}

function boxFn(fn: ((...args: any[]) => any) | undefined, params: any[]) {
	try {
		const response = fn?.(...params);
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
