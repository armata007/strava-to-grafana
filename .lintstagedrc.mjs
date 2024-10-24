export default {
    '*.{js,jsx,ts,tsx,json,mjs}': [
        'prettier --write',
        'eslint -c eslint.config.mjs --fix',
        () => 'pnpm run checkTS',
    ],
    '*.{schema,yml,md}': ['prettier --write'],
};
