import { defineConfig } from 'vitest/config';
import { fileURLToPath } from 'node:url';

export default defineConfig({
	test: {
		include: ['test/**/*.test.ts'],
		alias: {
			'@': fileURLToPath(new URL('./src', import.meta.url)),
		},
		coverage: {
			provider: 'istanbul',
			include: ['src/**/*'],
			exclude: ['src/index.ts', 'src/preset/*.ts'],
			reporter: ['text', 'lcov', 'clover'],
		},
	},
});
