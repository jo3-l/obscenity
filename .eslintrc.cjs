/* eslint-env node */
module.exports = {
	extends: ['eslint:recommended', 'plugin:@typescript-eslint/recommended-type-checked', 'plugin:prettier/recommended'],
	plugins: ['prettier', '@typescript-eslint'],
	parser: '@typescript-eslint/parser',
	root: true,
	parserOptions: {
		project: ['tsconfig.eslint.json', 'src/tsconfig.json', 'test/tsconfig.json'],
	},
	rules: {
		curly: ['error', 'multi-line'],
		'@typescript-eslint/no-unsafe-enum-comparison': 'off',
		'@typescript-eslint/restrict-plus-operands': 'off',
		'@typescript-eslint/no-explicit-any': 'off',
		'@typescript-eslint/consistent-type-definitions': ['error', 'interface'],
		'@typescript-eslint/indent': 'off',
		'@typescript-eslint/consistent-type-imports': 'error',
		'@typescript-eslint/no-unused-vars': ['error', { varsIgnorePattern: '^_' }],
	},
};
