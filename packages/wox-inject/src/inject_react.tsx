// Reason: For abstract inheritance usage for ControllerProtocol, this module can't imposed the method shape on the implementor.
/* eslint-disable @typescript-eslint/no-explicit-any */

import { useConstant } from '@wox-team/wox-app-vitals';
import { createContext, useContext, useLayoutEffect, useRef } from 'react';
import { Container, Resolution } from './inject';
import type { Token } from './inject';

const GlobalResolutionContext = createContext(new Resolution(new Container()));

interface NewContainerProps extends React.PropsWithChildren {
	/**
	 * If provided, Singletons and Scoped instances from this container will be inherited by the new container.
	 */
	inheritFrom?: Container;

	/**
	 * Whether the new container should inherit the parent container's Scoped instances.
	 */
	shouldInheritScopes?: boolean;

	/**
	 * @deprecated
	 * Use `inheritContainer` instead.
	 */
	parentContainer?: Resolution;

	/**
	 * @deprecated
	 * Use `shouldInheritScopes` instead.
	 */
	useInheritanceLink?: boolean;
}

/**
 * A React component that provides an optional dependency resolution scope to its child components.
 * When used, it creates a new dependency injection container and sets it as the context value,
 * allowing for isolated dependency management within its subtree.
 *
 * @param {NewContainerProps} props - The properties and children to be rendered.
 * @returns {JSX.Element} A JSX element that wraps its children with an optional dependency resolution context.
 *
 * @example
 * // To enable isolated dependency resolution within a component subtree, wrap it with NewContainer.
 * <NewContainer>
 *   <ComponentWithDependencies />
 * </NewContainer>
 *
 * // Alternatively, the app can still function without using NewContainer.
 * // In this case, dependency resolution will use the parent container's scope.
 * <ComponentWithDependencies />
 */
export function NewContainer(props: NewContainerProps) {
	let backwards_compatible__inheritFrom: Readonly<Container> | null;
	if (props.parentContainer != null) {
		backwards_compatible__inheritFrom = props.parentContainer.container;
	} else if (props.inheritFrom != null) {
		backwards_compatible__inheritFrom = props.inheritFrom;
	} else {
		backwards_compatible__inheritFrom = null;
	}

	let backwards_compatible__useInheritanceLink: boolean;
	if (props.useInheritanceLink != null) {
		backwards_compatible__useInheritanceLink = props.useInheritanceLink;
	} else if (props.shouldInheritScopes != null) {
		backwards_compatible__useInheritanceLink = props.shouldInheritScopes;
	} else {
		backwards_compatible__useInheritanceLink = true;
	}

	const globalResolutionCtx = useContext(GlobalResolutionContext);
	const container = useConstant(
		() =>
			new Resolution(
				new Container(backwards_compatible__inheritFrom ?? globalResolutionCtx.container, backwards_compatible__useInheritanceLink),
			),
	);

	return <GlobalResolutionContext.Provider value={container}>{props.children}</GlobalResolutionContext.Provider>;
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
	const globalResolutionCtx = useContext(GlobalResolutionContext);
	const value = useConstant(() => globalResolutionCtx.resolve(dependencyToken));

	return value;
}

export interface Lifecycle<T extends any[] = any[]> {
	whenMount?(...args: T): any;
	whenRepeatedlyMount?(...args: T): any;
	whenUpdate?(...args: T): any;
	whenDemount?(...args: T): any;
}

type ControllerCtor<T> = {
	new (...args: any[]): T & Lifecycle;
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
 * // Use useResolveLifecycle to resolve and use a controller in a React component.
 * function MyComponent() {
 *   const controller = useResolveLifecycle(MyControllerToken);
 *   // Now you can use the controller instance within your component.
 * }
 */
export function useResolveLifecycle<T extends Lifecycle>(
	dependencyToken: ControllerCtor<T>,
	...params: T['whenMount'] extends (...args: any) => any
		? Parameters<T['whenMount']>
		: T['whenUpdate'] extends (...args: any) => any
		  ? Parameters<T['whenUpdate']>
		  : T['whenDemount'] extends (...args: any) => any
		    ? Parameters<T['whenDemount']>
		    : T['whenRepeatedlyMount'] extends (...args: any) => any
		      ? Parameters<T['whenRepeatedlyMount']>
		      : never[]
): T {
	const globalResolutionCtx = useContext(GlobalResolutionContext);
	const hasBeenResolved = useConstant(() => {
		const container = globalResolutionCtx.container;
		const registration = container.scanRegistration(dependencyToken);
		if (registration == null) return false;

		const instance = container.scanResolved(registration);
		return instance != null;
	});
	const instance = useConstant(() => globalResolutionCtx.resolve(dependencyToken));

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

			if (hasBeenResolved) {
				boxFn(instance.whenRepeatedlyMount?.bind(instance), params);
			} else {
				boxFn(instance.whenMount?.bind(instance), params);
			}
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
