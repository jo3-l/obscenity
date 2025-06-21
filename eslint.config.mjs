import tseslint from 'typescript-eslint';

export default tseslint.config(
	{ ignores: ['node_modules/**', 'dist/**', 'coverage/**', 'scripts/**', 'examples/**'] },
	tseslint.configs.recommendedTypeChecked,
	{
		languageOptions: {
			parserOptions: {
				project: ['./tsconfig.eslint.json'],
				tsconfigRootDir: import.meta.dirname,
			},
		},
		rules: {
			'@typescript-eslint/no-unsafe-enum-comparison': 'off',
		},
	},
);
