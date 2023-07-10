---
layout: "@layouts/MarkdownPostLayout.astro"
title: 面向团队的前端代码规范
author: J10c
pubDate: 2022-06-21
tags: ["programming", "convention"]
---

## 说在前面

> 本文的代码风格为笔者偏好，用于笔者所在的团队，
> 文章仅提供配置思路和选择项参考

规范基于 ES6 语法，可能与一些现有的项目不匹配

前端规范要 5 个插件：
1. ESLint
2. Prettier
3. commitLint
4. styleLint
5. husky

以及一个配置文件：
1. `.editorconfig`


> 不同编辑器可能需要插件等一些手段来支持这些工具，
> VSCode 配置比较方便，ESLint, Prettier, editorconfig 安装插件即可

> 后期团队内可能会构建一个脚手架，方便直接安装必要的包，~~现在还是老老实实复制粘贴代码吧~~

## 必要的依赖

```json
"devDependencies": {
  "eslint": "^8.0.1",
  "eslint-config-prettier": "^8.5.0",
  "eslint-config-standard": "^17.0.0",
  "eslint-plugin-import": "^2.25.2",
  "eslint-plugin-n": "^15.0.0",
  "eslint-plugin-prettier": "^4.0.0",
  "eslint-plugin-promise": "^6.0.0",
  "eslint-plugin-react": "^7.29.4",
  "prettier": "^2.6.2",
}
```

## ESLint

```js
// .eslintrc.js
module.exports = {
  env: {
    browser: true,
    es2021: true
  },
  extends: ["standard", "plugin:prettier/recommended"],
  parser: "@typescript-eslint/parser",
  parserOptions: {
    ecmaFeatures: {
      jsx: true
    },
    ecmaVersion: "latest",
    sourceType: "module"
  },
  plugins: ["react", "@typescript-eslint"],
  rules: {
    semi: ["error", "always"],
    quotes: [1, "double"]
  }
};
```

## Prettier
- `.prettierrc.json`
```json
{
  "printWidth": 80,
  "tabWidth": 2,
  "useTabs": false,
  "semi": true,
  "bracketSpacing": true,
  "endOfLine": "lf"
}
```

- `.prettierignore`
```js
# Ignore artifacts:
build
coverage

# Ignore all HTML files:
*.html
```

## editorconfig

```editorconfig
root = true

[*]
end_of_line = lf
insert_final_newline = true
trim_trailing_whitespace = true
indent_style = space
indent_size = 2
charset = utf-8
```
