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
    testParser('select distinct max_statement_time = 1.2 a ');
  });

  it('test2', function () {
    testParser('select all 0x1f');
  });

  it('test3', function () {
    testParser('select distinctrow "xx"');
  });

  it('test4', function () {
    testParser('select null');
  });

  it ('test5', function () {
    testParser('select function(), function(1, "sd", 0x1F)');
  });
});

