// Reason: For abstract inheritance usage for ControllerProtocol, this module can't imposed the method shape on the implementor.
/* eslint-disable @typescript-eslint/no-explicit-any */

import { createContext, useContext, useLayoutEffect } from 'react';
import { DependencyScope, InjectionContainer } from './inject';
import type { Token } from './inject';
import { useConstant } from './_use_constant';

const ResolutionContext = createContext(new InjectionContainer(new DependencyScope()));

export function ResolutionProvider(props: React.PropsWithChildren) {
	const parentContainer = useContext(ResolutionContext);
	const container = useConstant(() => new InjectionContainer(new DependencyScope(parentContainer.linkScope())));

	return <ResolutionContext.Provider value={container}>{props.children}</ResolutionContext.Provider>;
}

export function useDependency<T>(dependencyToken: Token<T>): T {
	const container = useContext(ResolutionContext);
	const value = useConstant(() => container.resolve(dependencyToken));

	return value;
}

export function useExposedInjectorContainer(): InjectionContainer {
	return useContext(ResolutionContext);
}

export interface ControllerProtocol {
	whenMount?(): any;
	whenDemount?(): any;
}

type ControllerCtor<T> = {
	new (...args: any[]): T & ControllerProtocol;
};

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
