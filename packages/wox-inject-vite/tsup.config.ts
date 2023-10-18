import { defineConfig } from 'tsup';

export default defineConfig((options) => ({
	entry: ['main.ts'],
	splitting: false,
	sourcemap: true,
	clean: true,
	treeshake: true,
	dts: options.watch ? false : true,
	format: ['cjs', 'esm'],
	external: ['vite'],
}));
