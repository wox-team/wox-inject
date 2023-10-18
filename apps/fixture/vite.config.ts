/// <reference types="vitest" />
import { defineConfig } from 'vitest/config';
import react from '@vitejs/plugin-react';
import { dependencyInjection } from '@wox-team/wox-inject-vite';

export default defineConfig({
	plugins: [
		dependencyInjection() as any,
		react({
			babel: {
				parserOpts: {
					plugins: ['decorators-legacy'],
				},
			},
		}),
	],
});
