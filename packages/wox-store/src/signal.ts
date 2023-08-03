import { EventEmitter, Disposer } from '@wox-team/wox-app-vitals';

export class Signal<T> {
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

export function signal<T>(initialValue: T) {
	const signal = new Signal(initialValue);

	return signal;
}
