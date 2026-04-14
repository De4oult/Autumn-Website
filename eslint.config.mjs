import { createConfigForNuxt } from '@nuxt/eslint-config';
import alignImport             from 'eslint-plugin-align-import';

export default createConfigForNuxt(
    {},

    {
        plugins : {
            'align-import' : alignImport
        },

        rules : {
            'quotes' : ['error', 'single', { avoidEscape : true }],

            'semi' : ['error', 'always'], 

            'indent' : ['error', 4],

            'key-spacing' : [
                'error',
                {
                    align       : 'colon',
                    beforeColon : true,
                    afterColon  : true
                }
            ],

            'prefer-arrow-callback' : ['error'],
            'arrow-body-style'      : ['error', 'as-needed'],

            'id-match' : [
                'error',
                '^([A-Z][a-zA-Z0-9]*)|([a-z]+(_[a-z0-9]+)*)$',
                {
                    onlyDeclarations    : true,
                    ignoreDestructuring : false
                }
            ],

            'no-multi-spaces' : ['error', {
                exceptions : { 
                    ImportDeclaration  : true,
                    VariableDeclarator : true
                }
            }],
            'align-import/align-import' : ['error'],

            'comma-dangle' : ['error', 'never'],

            'no-unused-vars' : 'off',

            'keyword-spacing' : ['error', {
                before    : true,
                after     : true,
                overrides : {
                    if     : { after : false },
                    for    : { after : false },
                    while  : { after : false },
                    switch : { after : false },
                    catch  : { after : false }
                }
            }],
            
            'vue/attributes-order'           : 'off',
            'vue/require-component-is'       : 'off',
            'vue/prop-name-casing'           : 'off',
            'vue/multi-word-component-names' : 'off',
            'vue/no-unused-components'       : 'off',
            'vue/no-unused-vars'             : 'off',
            'vue/require-default-prop'       : 'off',
            
            '@typescript-eslint/no-explicit-any' : 'off'
        }
    },

    {
        files : ['./app/**/*.vue'],

        rules : {
            'semi' : ['error', 'never'],

            'indent' : 'off',

            'vue/script-indent' : ['error', 4, {
                baseIndent : 1,
                switchCase : 1,
                ignores    : []
            }],

            'vue/html-indent' : ['error', 4, {
                baseIndent   : 1,
                attribute    : 1,
                closeBracket : 0
            }],

            'vue/html-self-closing' : ['error', {
                html : {
                    void      : 'never',
                    normal    : 'never',
                    component : 'always'
                },
                svg  : 'always',
                math : 'always'
            }],

            'vue/html-closing-bracket-newline' : ['error', {
                singleline : 'never',
                multiline  : 'always'
            }],

            'vue/html-closing-bracket-spacing' : ['error', {
                startTag       : 'never',
                endTag         : 'never',
                selfClosingTag : 'always'
            }]
        }
    }
);