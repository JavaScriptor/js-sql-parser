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

  it ('test6', function () {
    testParser(`
      SELECT t3.gender as tb_basic___gender, t3.age_level as tb_basic___age_level, t2.brand_id as tb_basic___user_collect_m___brand_id, t2.cat1_id as
      tb_basic___user_collect_m___cat1_id, COUNT(distinct t1.aid) as aid_uniq_count
    `);
  })
});

