# js-sql-parser

> parse sql in js.

[![Build Status](https://travis-ci.org/JavaScriptor/js-sql-parser.svg?branch=master)](https://travis-ci.org/JavaScriptor/js-sql-parser)

## commonjs usage

`npm install --save js-sql-parser`

```
const parser = require('js-sql-parser');
const ast = parser.parse('select * from dual');

console.log(JSON.stringify(ast, null, 2));
```

## script tag

```js
<script src="./dist/parser/sqlParser.js"><script/>

var sqlParser = window.sqlParser;
sqlParser.parse('select * from dual');
```

## AMD support

...

