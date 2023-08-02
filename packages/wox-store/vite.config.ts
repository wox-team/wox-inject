/// <reference types="vitest" />
import { defineProject } from 'vitest/config';
import react from '@vitejs/plugin-react';

export default defineProject({
	plugins: [
		react({
			babel: {
				parserOpts: {
					plugins: ['decorators-legacy'],
				},
			},
		}),
	],
	test: {
		environment: 'happy-dom',
		globals: true,
		setupFiles: '../../tests/setup.ts',
	},
});
