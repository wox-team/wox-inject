import { test, expect } from 'vitest';
import { signal } from './signal';

test('signal', () => {
	const value = signal(0);

	expect(value.get());
});
