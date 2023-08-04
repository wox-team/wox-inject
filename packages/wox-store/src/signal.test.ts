import { test, expect } from 'vitest';
import { signal } from './signal';

test('writable signal, when getter method is invoked, should return the value', () => {
	const value = signal(1);

	expect(value()).toBe(1);
});

test('writable signal, when set method is invoked, should set the previous value to the new value', () => {
	const value = signal(1);

	value.set(2);

	expect(value()).toBe(2);
});

test('writable signal, when method is invoked, should compute a new value from the previous value', () => {
	const value = signal(1);

	value.update((v) => v + 1);

	expect(value()).toBe(2);
});

test('writable signal, when mutate is invoked, should allow mutations to occur on the current state', () => {
	const value = signal({ x: 1 });

	value.mutate((v) => {
		v.x = 2;
	});

	expect(value()).toEqual({ x: 2 });
});

test('writable signal, when value is change, should dispatch update', () => {
	const value = signal(1);

	let emitted = 0;
	value.sub((value) => {
		emitted = value;
	});
	value.set(2);

	expect(emitted).toBe(2);
});
