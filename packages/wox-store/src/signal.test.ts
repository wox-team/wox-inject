import { test, expect } from 'vitest';
import { signal } from './signal';

test('writable signal, when get method is invoked, should return the value', () => {
	const value = signal(1);

	expect(value.get()).toBe(1);
});

test('writable signal, when set method is invoked, should set the previous value to the new value', () => {
	const value = signal(1);

	value.set(2);

	expect(value.get()).toBe(2);
});

test('writable signal, when method is invoked, should compute a new value from the previous value', () => {
	const value = signal(1);

	value.update((v) => v + 1);

	expect(value.get()).toBe(2);
});

test('writable signal, when mutate is invoked, should allow mutations to occur on the current state', () => {
	const value = signal({ x: 1 });

	value.mutate((v) => {
		v.x = 2;
	});

	expect(value.get()).toEqual({ x: 2 });
});

test('writable signal, when mutate is invoked, should dispatch update', () => {
	const value = signal({ x: 1 });

	value.mutate((v) => {
		v.x = 2;
	});

	expect(value.get()).toEqual({ x: 2 });
});
