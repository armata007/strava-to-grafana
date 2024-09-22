import { FlatCompat } from '@eslint/eslintrc';
import tsParser from '@typescript-eslint/parser';
// import globals from 'globals';
import path from 'path';
import { fileURLToPath } from 'url';

const filename = fileURLToPath(import.meta.url);
const dirname = path.dirname(filename);
const compat = new FlatCompat({
    baseDirectory: dirname,
});

const ignoresBlock = {
    ignores: ['**/node_modules', 'eslint.config.mjs', '.lintstagedrc.mjs'],
};

export const mainRulesBlock = {
    languageOptions: {
        parser: tsParser,
        ecmaVersion: 5,
        sourceType: 'module',

        parserOptions: {
            project: './tsconfig.json',
            tsconfigRootDir: dirname,
        },
    },

    settings: {
        node: {
            extensions: ['.js', '.ts'],
        },
    },

    rules: {
        '@tidio/rules/prefer-type-reference-instead-of-inline-type-annotation': 2,
        'class-methods-use-this': 0,
        'no-useless-constructor': 0,
        'no-empty-function': 0,
        'no-await-in-loop': 0,
    },
};

export const linterOptionsBlock = {
    linterOptions: {
        reportUnusedDisableDirectives: 'error',
    },
};

export const pluginsList = ['plugin:@tidio/eslint-plugin-tidio/basic'];

export const plugins = compat.extends(...pluginsList);

export const overrides = [];

export default [ignoresBlock, ...plugins, mainRulesBlock, ...overrides, linterOptionsBlock];
