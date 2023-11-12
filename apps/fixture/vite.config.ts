/// <reference types="vitest" />
import { defineConfig } from 'vitest/config';
import react from '@vitejs/plugin-react';
import { dependencyInjection } from '@wox-team/wox-inject-vite';
import inspect from 'vite-plugin-inspect';

export default defineConfig({
	plugins: [
		inspect(),
		dependencyInjection(),
		react({
			babel: {
				parserOpts: {
					plugins: ['decorators-legacy'],
				},
			},
		}),
	],
});
