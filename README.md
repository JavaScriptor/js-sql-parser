# js-sql-parser

> parse sql (select grammar) in js.

[![Build Status][travis-image]][travis-url]
[![NPM Version][npm-image]][npm-url]
[![NPM Downloads][downloads-image]][downloads-url]

sql grammar follows https://dev.mysql.com/doc/refman/5.7/en/select.html


## TODO

- ${value} like value place holder support.
- parser.stringify(ast)

## unsupport currently

- Hexadecimal Literals as x'01af' X'01af', but 0x01af is supported.
- keyword COLLATE.
- parammarker: keyword PREPARE / EXECUTE / DEALLOCATE
- variable: keyword SET / CREATE PROCEDURE / CREATE FUNCTION
- identifier expr: ODBC escape syntax
- matchexpr: Full-Text Search Functions. // to support
- intervalexpr: Date INTERVAL keyword.   // to support
- into outfile: INTO OUTFILE keyword.    // to support

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

[travis-image]: https://api.travis-ci.org/JavaScriptor/js-sql-parser.svg
[travis-url]: https://travis-ci.org/JavaScriptor/js-sql-parser
[npm-image]: https://img.shields.io/npm/v/js-sql-parser.svg
[npm-url]: https://npmjs.org/package/js-sql-parser
[downloads-image]: https://img.shields.io/npm/dm/js-sql-parser.svg
[downloads-url]: https://npmjs.org/package/js-sql-parser

