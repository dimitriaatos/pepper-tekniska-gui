module.exports = {
  root: true,
  parser: 'vue-eslint-parser',
  parserOptions: {
    sourceType: 'module',
  },
  env: {
    browser: true,
    node: true
  },
  extends: [
		'eslint:recommended',
		'plugin:vue/recommended',
		'prettier'
	],
  globals: {
    __static: true
  },
  plugins: [
		'vue'
  ],
  'rules': {
		"no-console": "warn",
    // allow paren-less arrow functions
    'arrow-parens': 0,
    // allow async-await
    'generator-star-spacing': 0,
    // allow debugger during development
    'no-debugger': process.env.NODE_ENV === 'production' ? 2 : 0
  }
}
