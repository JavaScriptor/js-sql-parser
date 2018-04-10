'use strict';

const debug = require('debug')('js-sql-parser');
const parser = require('../');

const testParser = function (sql) {
  let firstAst = parser.parse(sql);
  let firstSql = parser.stringify(firstAst);
  let secondAst = parser.parse(firstSql);
  let secondSql = parser.stringify(secondAst);

  if (firstSql !== secondSql) {
    console.log('firstSql', firstSql);
    console.log('secondSql', secondSql);
    throw 'err firstSql don\'t equals secondSql. ';
  }

  debug(JSON.stringify(secondAst, null, 2));
  debug(parser.stringify(secondAst));

  return secondAst;
}


describe('simple sql support', function () {
  it('test0', function () {
    testParser('select a from b where c > 1 group by d order by e desc;');
  });

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
      select in中文 from tags
    `);
  });

  it ('test7', function () {
    testParser(`
      SELECT distinct high_priority MAX_STATEMENT_TIME=1 STRAIGHT_JOIN SQL_SMALL_RESULT
      SQL_BIG_RESULT SQL_BUFFER_RESULT SQL_CACHE SQL_CALC_FOUND_ROWS
      fm_customer.lname AS 名字1,
          fm_customer.fname AS 名字2,
              fm_customer.address1 AS 地址1,fm_customer.phone1 AS 电话1,fm_customer.yearly_income AS 年收入,fm_customer.num_cars_owned AS 拥有车辆数 FROM fm_customer inner join fm_sales_link on fm_customer.customer_id = fm_sales_link.fm_customer.customer_id AND fm_sales_link.store_sales IS NOT NULL\nAND fm_sales_link.store_cost IS NOT NULL\nAND fm_sales_link.unit_sales IS NOT NULL inner join fm_store on fm_sales_link.fm_store.store_id = fm_store.store_id AND fm_store.store_name IS NOT NULL
    `);
  });

  it ('test8', function () {
    testParser(`
      SELECT   P1.PAYMENTNO, P1.AMOUNT,
      (P1.AMOUNT * 100) / SUM(P2.AMOUNT)
      FROM     PENALTIES AS P1, PENALTIES AS P2
      GROUP BY P1.PAYMENTNO, P1.AMOUNT
      ORDER BY P1.PAYMENTNO
    `);
  });

  it ('test9', function () {
    testParser(`
        SELECT  PLAYERS.PLAYERNO, NAME,
       (SELECT   COUNT(*)
        FROM     PENALTIES
        WHERE    PLAYERS.PLAYERNO =
                 PENALTIES.PLAYERNO) AS NUMBER_OF_PENALTIES,
       (SELECT   COUNT(*)
        FROM     TEAMS
        WHERE    PLAYERS.PLAYERNO =
                 TEAMS.PLAYERNO) AS NUMBER_OF_TEAMS
        FROM    PLAYERS
    `);
  });

  it ('test10', function () {
    testParser(`
      SELECT rd.*, ((rd.rd_numberofrooms) - (select sum(rn.reservation_numberofrooms) as count_reserve_room from reservation as rn WHERE rn.reservation_rd_id = rd.rd_id AND (str_to_date('$data_Check_in_date','%d-%m-%y') BETWEEN str_to_date(rn.reservation_check_in_date,'%d-%m-%y') AND str_to_date(rn.reservation_check_out_date,'%d-%m-%y') OR str_to_date('$data_Check_out_date','%d-%m-%y') BETWEEN str_to_date(rn.reservation_check_in_date,'%d-%m-%y') AND str_to_date(rn.reservation_check_out_date,'%d-%m-%y') OR str_to_date('$data_Check_in_date','%d-%m-%y') <= str_to_date(rn.reservation_check_in_date,'%d-%m-%y') AND str_to_date('$data_Check_out_date','%d-%m-%y') ) )) as reserve

FROM room_details rd LEFT JOIN reservation rn ON rd.rd_id = rn.reservation_rd_id WHERE NOT EXISTS

(

SELECT rn.* FROM reservation rn WHERE rn.reservation_rd_id = rd.rd_id

AND (str_to_date('$data_Check_in_date','%d-%m-%y') BETWEEN str_to_date(rn.reservation_check_in_date,'%d-%m-%y') AND str_to_date(rn.reservation_check_out_date,'%d-%m-%y') OR str_to_date('$data_Check_out_date','%d-%m-%y') BETWEEN str_to_date(rn.reservation_check_in_date,'%d-%m-%y') AND str_to_date(rn.reservation_check_out_date,'%d-%m-%y') OR str_to_date('$data_Check_in_date','%d-%m-%y') <= str_to_date(rn.reservation_check_in_date,'%d-%m-%y') AND str_to_date('$data_Check_out_date','%d-%m-%y') >= str_to_date(rn.reservation_check_out_date,'%d-%m-%y'))

AND (rd.rd_numberofrooms <= (select sum(rn.reservation_numberofrooms) as count_reserve_room from reservation as rn WHERE rn.reservation_rd_id = rd.rd_id AND (str_to_date('$data_Check_in_date','%d-%m-%y') BETWEEN str_to_date(rn.reservation_check_in_date,'%d-%m-%y') AND str_to_date(rn.reservation_check_out_date,'%d-%m-%y') OR str_to_date('$data_Check_out_date','%d-%m-%y') BETWEEN str_to_date(rn.reservation_check_in_date,'%d-%m-%y') AND str_to_date(rn.reservation_check_out_date,'%d-%m-%y') OR str_to_date('$data_Check_in_date','%d-%m-%y') <= str_to_date(rn.reservation_check_in_date,'%d-%m-%y') AND str_to_date('$data_Check_out_date','%d-%m-%y') ) ) )

)
    `);
  });

  it ('test11 SELECT `LEFT`(a, 3) FROM b support.', function () {
    testParser('SELECT `LEFT`(a, 3) FROM b');
  });

  it ('limit support.', function () {
    testParser('select a from b limit 2, 3');
  });

  it ('fix not equal.', function () {
    testParser('select a from b where a <> 1 limit 2, 3');
  });

  it ('restore semicolon.', function () {
    testParser('select a from b limit 2;');
  });

  it ('subquery.', function () {
    testParser('select a from (select 1 as x) b limit 2;');
  });

  it('update0', function () {
    testParser('update A SET b=2 WHERE c=3;');
  });

  it('update1', function () {
    testParser('update LOW_PRIORITY ignore A SET b=2, c=d WHERE e=4 ORDER BY d DESC limit 1;');
  });

  it('update2', function () {
    testParser('update LOW_PRIORITY ignore A, B, C SET b=2, `C`.c=d WHERE e=4 ORDER BY d DESC limit 1;');
  });

  it('insert0', function () {
    testParser('INSERT INTO A VALUES (a, `b`), (c, 3)');
  });

  it('insert1', function () {
    testParser('INSERT DELAYED IGNORE INTO A VALUE (a, DEFAULT, 3+2)');
  });

  it('insert2', function () {
    testParser('INSERT DELAYED IGNORE INTO A VALUE (a, `b`)');
  });

  it('insert3', function () {
    testParser('INSERT DELAYED IGNORE INTO A (`a`, b, c) VALUE (1, 2+3)');
  });

  it('insert4', function () {
    testParser('INSERT DELAYED IGNORE INTO `s0`.`A` PARTITION (p0, p1) (`a`, b, c) VALUE (1, 2+3)');
  });

  it('insert5', function () {
    testParser(`
  INSERT DELAYED IGNORE INTO \`s0\`.\`A\`
  PARTITION (p0, p1) (\`a\`, b, c)
  VALUE (1, 2+3), (5, '6')
  ON DUPLICATE KEY UPDATE q=q+1, c=b
`);
  });

  it('insert6', function () {
    testParser(`
  INSERT HIGH_PRIORITY \`massdrop\`.\`A\`
  PARTITION (p0, p1) (\`a\`, b, c)
  SELECT 1+1 as b, d
  FROM B
  ON DUPLICATE KEY UPDATE q=q+1, c=b
`);
  });
});
