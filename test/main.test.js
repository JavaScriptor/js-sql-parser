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
    testParser('select distinctrow "xx", a in (1,2)');
  });

  it('test4', function () {
    testParser(`
      select
        tag_basic.gender as gender,
        tag_basic.age as age,
        trade_m.cate_id as cate_id,
        trade_m.brand_id as bid,
        sum(trade_m.amt_alipay) as amt_alipay
      from
        tags
      where
        trade_m.thedate in (201501, '201502',201503)
      group by
       tag_basic.gender, tag_basic.age, trade_m.cate_id, trade_m.brand_id
      order by
       sum(tag_trade_m.amt_alipay) desc
    `);
  });

  it ('test5', function () {
    testParser('select function(), function(1, "sd", 0x1F)');
  });

  it ('test6', function () {
    testParser(`
      SELECT fm_customer.lname AS 名字1,
          fm_customer.fname AS 名字2,
              fm_customer.address1 AS 地址1,fm_customer.phone1 AS 电话1,fm_customer.yearly_income AS 年收入,fm_customer.num_cars_owned AS 拥有车辆数 FROM fm_customer inner join fm_sales_link on fm_customer.customer_id = fm_sales_link.fm_customer.customer_id AND fm_sales_link.store_sales IS NOT NULL\nAND fm_sales_link.store_cost IS NOT NULL\nAND fm_sales_link.unit_sales IS NOT NULL inner join fm_store on fm_sales_link.fm_store.store_id = fm_store.store_id AND fm_store.store_name IS NOT NULL
    `);
  });

  it ('test7', function () {
    testParser(`
      select in中文 from tags
    `);
  });
});

