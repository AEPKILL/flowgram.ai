/**
 * Copyright (c) 2025 Bytedance Ltd. and/or its affiliates
 * SPDX-License-Identifier: MIT
 */

const { defineConfig } = require('@flowgram.ai/eslint-config');

module.exports = defineConfig({
  parser: '@babel/eslint-parser',
  preset: 'web',
  packageRoot: __dirname,
  parserOptions: {
    requireConfigFile: false,
    babelOptions: {
      presets: [require.resolve('next/babel')],
    },
  },
  rules: {
    'no-console': 'off',
    'react/prop-types': 'off',
    'react-hooks/exhaustive-deps': 'off',
    '@next/next/no-img-element': 'off',
    'jsx-a11y/alt-text': 'off'
  },
  plugins: ['json'],
  extends: ['next', 'next/core-web-vitals'],
  settings: {
    react: {
      version: 'detect',
    },
  },
});
