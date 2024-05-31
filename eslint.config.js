export default [
    {
        languageOptions: {
            ecmaVersion: 'latest'
        },
        rules: {
            // Caboodle Tech rules:
            'class-methods-use-this': 'off',
            'comma-dangle': ['error', 'never'],
            'default-case': 'off',
            indent: [
                'error',
                4,
                {
                    SwitchCase: 1
                }
            ],
            'max-len': ['warn', 120],
            'no-continue': 'warn',
            'no-param-reassign': 'warn',
            'no-plusplus': [
                'error',
                {
                    allowForLoopAfterthoughts: true
                }
            ],
            'no-restricted-syntax': 'off',
            'no-use-before-define': 'off',
            'object-curly-spacing': ['error', 'always'],
            'padded-blocks': [
                'error',
                {
                    classes: 'always'
                }
            ],
            // Modified AirBnB base rules:
            'arrow-body-style': ['error', 'as-needed'],
            'arrow-parens': ['error', 'always'],
            'arrow-spacing': ['error', { before: true, after: true }],
            'block-spacing': ['error', 'always'],
            'brace-style': ['error', '1tbs', { allowSingleLine: true }],
            'comma-spacing': ['error', { before: false, after: true }],
            'computed-property-spacing': ['error', 'never'],
            'dot-location': ['error', 'property'],
            'dot-notation': ['error', { allowKeywords: true }],
            'eol-last': ['error', 'always'],
            eqeqeq: ['error', 'always', { null: 'ignore' }],
            'func-call-spacing': ['error', 'never'],
            'func-name-matching': 'error',
            'func-names': ['error', 'always'],
            'func-style': [
                'error',
                'declaration',
                { allowArrowFunctions: true }
            ],
            'generator-star-spacing': ['error', { before: true, after: true }],
            'key-spacing': ['error', { beforeColon: false, afterColon: true }],
            'keyword-spacing': ['error', { before: true, after: true }],
            'lines-between-class-members': [
                'error',
                'always',
                { exceptAfterSingleLine: true }
            ],
            'newline-per-chained-call': ['error', { ignoreChainWithDepth: 4 }],
            'no-confusing-arrow': ['error', { allowParens: true }],
            'no-dupe-class-members': 'error',
            'no-duplicate-imports': 'error',
            'no-else-return': ['error', { allowElseIf: false }],
            'no-eval': 'error',
            'no-extra-parens': [
                'error',
                'all',
                { nestedBinaryExpressions: false }
            ],
            'no-floating-decimal': 'error',
            'no-lonely-if': 'error',
            'no-mixed-operators': 'error',
            'no-multi-assign': 'error',
            'no-multiple-empty-lines': [
                'error',
                { max: 1, maxEOF: 0, maxBOF: 0 }
            ],
            'no-return-await': 'error',
            'no-self-compare': 'error',
            'no-trailing-spaces': 'error',
            'no-unneeded-ternary': 'error',
            'no-useless-concat': 'error',
            'no-var': 'error',
            'object-curly-newline': ['error', { consistent: true }],
            'object-curly-spacing': ['error', 'always'],
            'object-shorthand': [
                'error',
                'always',
                { ignoreConstructors: false, avoidQuotes: true }
            ],
            'one-var': ['error', 'never'],
            'one-var-declaration-per-line': ['error', 'always'],
            'operator-assignment': ['error', 'always'],
            'operator-linebreak': ['error', 'after'],
            'prefer-arrow-callback': 'error',
            'prefer-const': 'error',
            'prefer-destructuring': [
                'error',
                {
                    VariableDeclarator: { array: false, object: true },
                    AssignmentExpression: { array: true, object: true }
                }
            ],
            'prefer-numeric-literals': 'error',
            'prefer-template': 'error',
            'quote-props': ['error', 'as-needed'],
            quotes: [
                'error',
                'single',
                { avoidEscape: true, allowTemplateLiterals: true }
            ],
            'require-await': 'off',
            'rest-spread-spacing': ['error', 'never'],
            semi: ['error', 'always'],
            'semi-spacing': ['error', { before: false, after: true }],
            'semi-style': ['error', 'last'],
            'space-before-blocks': 'error',
            'space-before-function-paren': ['error', 'never'],
            'space-in-parens': ['error', 'never'],
            'space-infix-ops': 'error',
            'space-unary-ops': ['error', { words: true, nonwords: false }],
            'spaced-comment': [
                'error',
                'always',
                {
                    line: { markers: ['/'] },
                    block: {
                        balanced: true,
                        markers: ['*'],
                        exceptions: ['*']
                    }
                }
            ],
            'template-curly-spacing': ['error', 'never'],
            'template-tag-spacing': ['error', 'never'],
            yoda: ['error', 'never', { exceptRange: true }]
        }
    }
];
