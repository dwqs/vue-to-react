const fs = require('fs');
const path = require('path');
const format = require('prettier-eslint');

function output (code, dist) {
    const opts = {
        text: code,
        eslintConfig: {
            parserOptions: {
                ecmaVersion: 7,
                sourceType: 'module',
                allowImportExportEverywhere: false,
                ecmaFeatures: {
                    jsx: true,
                    modules: true
                }
            },
            env: {
                es6: true,
                node: true,
                browser: true
            },
            rules: {
                indent: [2, 2, { 'SwitchCase': 1 }],
                quotes: [2, 'single', { 'allowTemplateLiterals': true }],
                semi: [2, 'always'],
                eqeqeq: [2, 'always'],
                strict: [2, 'global'],
                'object-property-newline': [2, { 'allowAllPropertiesOnSameLine': false }],
                'linebreak-style': [2, 'unix'],
                'object-curly-newline': [2, {
                    'ObjectExpression': 'always',
                    'ObjectPattern': 'always'
                }],
                'no-multiple-empty-lines': [2, { max: 0 }],
                'key-spacing': [2, { 'afterColon': true }],
                'block-spacing': [2, 'always'],
                'space-before-function-paren': [2, 'always'],
                'padding-line-between-statements': [2, 
                    { 'blankLine': 'always', 'prev': 'import', 'next': 'export' }
                ],
                'lines-around-comment': [2, { 'beforeLineComment': true }],
                'no-console': 0,
                'no-empty': 0,
                'no-unused-vars': 0,
                'no-constant-condition': 0,
                'no-trailing-spaces': 0
            }
        }
    };

    const formatCode = format(opts);
    // path.resolve(__dirname, '../demo/react.js')
    fs.writeFileSync(dist, formatCode);
}

module.exports = output;
