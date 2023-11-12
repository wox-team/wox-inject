/// <reference types="vitest" />
import { defineConfig, mergeConfig } from 'vitest/config';
import react from '@vitejs/plugin-react';
import { vitestConfig } from '../../vitest.config';

export default mergeConfig(
	vitestConfig,
	defineConfig({
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
			globals: true,
			environment: 'jsdom',
		},
	}),
);
