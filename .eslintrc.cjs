module.exports = {
    env: { browser: true, es2020: true },
    extends: [
        'eslint:recommended',
        'plugin:@typescript-eslint/recommended',
        'standard'
    ],
    parser: '@typescript-eslint/parser',
    parserOptions: { ecmaVersion: 'latest', sourceType: 'module' },
    rules: {
        '@typescript-eslint/explicit-function-return-type': 'error',
        indent: ['error', 4, { SwitchCase: 1 }]
    }
}