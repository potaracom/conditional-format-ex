"use strict";

module.exports = {
  extends: [
    "@cybozu",
    "@cybozu/eslint-config/globals/kintone",
    "@cybozu/eslint-config/presets/prettier"
  ],
  globals: {},
  parserOptions: {
    ecmaVersion: 2018
  },
  env: {
    browser: true
  }
};
