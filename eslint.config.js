import js from '@eslint/js'
import pluginVue from 'eslint-plugin-vue'
import globals from 'globals'

export default [
  { ignores: ['dist/**'] },
  js.configs.recommended,
  ...pluginVue.configs['flat/essential'],
  {
    languageOptions: {
      ecmaVersion: 'latest',
      sourceType: 'module',
      globals: {
        ...globals.browser
      }
    },
    rules: {
      // Kit / Stadium / App are established names in this project.
      'vue/multi-word-component-names': 'off'
    }
  },
  {
    // The colour checks run under plain node, not in the browser.
    files: ['**/*.test.mjs'],
    languageOptions: {
      globals: {
        ...globals.node
      }
    }
  }
]
