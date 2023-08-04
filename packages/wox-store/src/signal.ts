/* eslint-disable @typescript-eslint/no-explicit-any */
/* eslint-disable @typescript-eslint/ban-types */

import { EventEmitter, Disposer } from '@wox-team/wox-app-vitals';

export class ReactiveNode<T> {
	private readonly dispatch = new EventEmitter<{
		update: Readonly<T>;
	}>();

	constructor(private value: T) {
		// Empty
	}

	public sub(fn: (value: T) => void): Disposer {
		return this.dispatch.on('update', fn);
	}

	public get(): T {
		return this.value;
	}

	public set(value: T): void {
		this.value = value;

		this.dispatch.emit('update', this.value);
	}

	public update(fn: (value: Readonly<T>) => T): void {
		try {
			this.set(fn(this.value));
		} catch (e) {
			console.error(e);
		}
	}

	public mutate(fn: (value: T) => void): void {
		try {
			fn(this.value);

			this.dispatch.emit('update', this.value);
		} catch (e) {
			console.error(e);
		}
	}
}

interface Signal<T> extends Composable<T> {
	set(value: T): void;
	update(updateFn: (value: T) => T): void;
	mutate(mutatorFn: (value: T) => void): void;
	sub(subFn: (value: T) => void): Disposer;
}

const SIGNAL = Symbol('SIGNAL');

export type Composable<T> = (() => T) & {
	[SIGNAL]: unknown;
};

export function createSignalFromFunction<T>(node: ReactiveNode<T>, fn: () => T): Composable<T>;
export function createSignalFromFunction<T, U extends Record<string, unknown>>(
	node: ReactiveNode<T>,
	fn: () => T,
	extraApi: U,
): Composable<T> & U;
export function createSignalFromFunction<T, U extends Record<string, unknown> = {}>(
	node: ReactiveNode<T>,
	fn: () => T,
	extraApi: U = {} as U,
): Composable<T> & U {
	(fn as any)[SIGNAL] = node;

	return Object.assign(fn, extraApi) as Composable<T> & U;
}

export function signal<T>(initialValue: T): Signal<T> {
	const reactiveNode = new ReactiveNode(initialValue);

	return createSignalFromFunction(reactiveNode, reactiveNode.get.bind(reactiveNode), {
		set: reactiveNode.set.bind(reactiveNode),
		update: reactiveNode.update.bind(reactiveNode),
		mutate: reactiveNode.mutate.bind(reactiveNode),
		sub: reactiveNode.sub.bind(reactiveNode),
	});
}
