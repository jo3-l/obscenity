import type { Config } from '@jest/types';

const config: Config.InitialOptions = {
	preset: 'ts-jest',
	testEnvironment: 'node',
	testRunner: 'jest-circus/runner',
	testMatch: ['<rootDir>/test/**/*.test.ts'],
	transform: {
		'^.+\\.ts$': [
			'ts-jest',
			{
				tsconfig: '<rootDir>/test/tsconfig.json',
			},
		],
	},
	collectCoverage: true,
	collectCoverageFrom: ['<rootDir>/src/**/*.ts'],
	coverageDirectory: 'coverage',
	coverageReporters: ['text', 'lcov', 'clover'],
	coveragePathIgnorePatterns: [
		'<rootDir>/src/index\\.ts', // library entry point
		'<rootDir>/src/preset/.*\\.ts', // presets
	],
	setupFilesAfterEnv: ['<rootDir>/test/jest.setup.ts'],
};

export default config;
