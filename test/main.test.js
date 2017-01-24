'use strict';

const debug = true;
const parser = require('../dist/parser/sqlParser');

const testParser = function (sql) {
  let ast = parser.parse(sql);

  if (debug) {
    console.log(
      JSON.stringify(ast, null, 2)
    );
  }

  return ast;
}


describe('simple sql support', function () {
  it('test1', function () {
    testParser('select distinct ');
  });

  it('test2', function () {
    testParser('select all ');
  });

  it('test3', function () {
    testParser('select distinctrow ');
  });

  it('test4', function () {
    testParser('select ');
  });
});

