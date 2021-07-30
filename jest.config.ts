import type { Config } from '@jest/types';

const config: Config.InitialOptions = {
	displayName: 'unit test',
	preset: 'ts-jest',
	testEnvironment: 'node',
	testRunner: 'jest-circus/runner',
	testMatch: ['<rootDir>/test/**/*.test.ts'],
	globals: {
		'ts-jest': { tsconfig: '<rootDir>/test/tsconfig.json' },
	},
	collectCoverage: true,
	collectCoverageFrom: ['src/**/*.ts'],
	coverageDirectory: 'coverage',
	coverageReporters: ['text', 'lcov', 'clover'],
};

export default config;
