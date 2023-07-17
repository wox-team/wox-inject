module.exports = {
	root: true,
	parser: '@typescript-eslint/parser',
	plugins: ['@typescript-eslint'],
	parserOptions: {
		// Allows ESLint to parse modern ECMAScript features.
		ecmaVersion: 2020,

		// Allows for the use of JS modules.
		sourceType: 'module',

		ecmaFeatures: {
			// Allows for the parsing of JSX.
			jsx: true,
		},
	},
	settings: {
		react: {
			// Tells "eslint-plugin-react" to automatically detect the version of React to use.
			version: 'detect',
		},
	},
	extends: [
		'plugin:react/recommended',
		'plugin:react-hooks/recommended',
		'plugin:jsx-a11y/strict',

		// Basic config
		'eslint:recommended',

		// Uses the recommended linting for jest-dom
		'plugin:jest-dom/recommended',

		// Uses the recommended rules from @typescript-eslint/eslint-plugin
		'plugin:@typescript-eslint/recommended',

		// Enables eslint-plugin-prettier and eslint-config-prettier. This will display prettier errors as ESLint errors. Make sure this is always the last configuration in the extends array.
		'plugin:prettier/recommended',
	],
	rules: {
		// Place to specify ESLint rules. Can be used to overwrite rules specified from the extended configs
		// ↓ ↓ ↓
		// Allows the namespace usage.
		'@typescript-eslint/no-namespace': 0,

		// Allows blocked-scoped functions (as in namespaces).
		'no-inner-declarations': 0,

		// TypeScript's compiler already checks for duplicate function implementations.
		'no-dupe-class-members': 0,

		// Allows for "while (true)" statements
		'no-constant-condition': 0,

		// Allows unused declarations but flags them with error.
		'no-unused-vars': 'off',
		'@typescript-eslint/no-unused-vars': ['error', { varsIgnorePattern: '^_', argsIgnorePattern: '^_' }],

		// Ensures consistencies with blank lines.
		'padding-line-between-statements': [
			'error',
			// Ensures returns have a blank line before them.
			{ blankLine: 'always', prev: '*', next: 'return' },
		],

		// ESlint should not warn about globals, the TypeScript compiler already does this.
		'no-undef': 0,

		// Turns off explicit return type (you should type em tho...).
		'@typescript-eslint/explicit-function-return-type': 'off',

		// Allow function hoisting.
		'no-use-before-define': 'off',
		'@typescript-eslint/no-use-before-define': 0,

		// Allows empty TypeScript interfaces.
		'@typescript-eslint/no-empty-interface': 'off',

		// Disabled since TypeScript will validate the props at compile time
		// rather than runtime.
		'react/prop-types': 0,

		// Since React 17 this is no longer needed.
		'react/react-in-jsx-scope': 0,

		// Force EoL -> LF
		'linebreak-style': ['error', 'unix'],
		'prettier/prettier': [2, { endOfLine: 'lf' }],
	},
};
