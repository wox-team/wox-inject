import { defineConfig } from 'vitest/config';

export const vitestConfig = defineConfig({
	test: {
		setupFiles: ['vitest.setup.ts'],
	},
});
