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

describe('select grammar support', function () {
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

  it ('test6 unicode', function () {
    testParser(`
      select in中文 from tags
    `);
  });

  it ('test7', function () {
    testParser(`
      SELECT 
        DISTINCT high_priority MAX_STATEMENT_TIME=1 STRAIGHT_JOIN SQL_SMALL_RESULT SQL_BIG_RESULT SQL_BUFFER_RESULT SQL_CACHE SQL_CALC_FOUND_ROWS fm_customer.lname AS name1,
        fm_customer.fname AS name2,
        fm_customer.address1 AS addr1,
        fm_customer.phone1 AS tel1,
        fm_customer.yearly_income AS amount,
        fm_customer.num_cars_owned AS car_num
      FROM fm_customer
      INNER JOIN fm_sales_link
      ON fm_customer.customer_id = fm_sales_link.fm_customer.customer_id
         AND fm_sales_link.store_sales IS NOT NULL
         AND fm_sales_link.store_cost IS NOT NULL
         AND fm_sales_link.unit_sales IS NOT NULL
      INNER JOIN fm_store
      ON fm_sales_link.fm_store.store_id = fm_store.store_id
         AND fm_store.store_name IS NOT NULL
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
      SELECT rd.*, rd.rd_numberofrooms - (
        SELECT SUM(rn.reservation_numberofrooms) AS count_reserve_room
        FROM reservation rn
        WHERE rn.reservation_rd_id = rd.rd_id
          AND (str_to_date('$data_Check_in_date', '%d-%m-%y') BETWEEN str_to_date(rn.reservation_check_in_date, '%d-%m-%y') AND str_to_date(rn.reservation_check_out_date, '%d-%m-%y')
          OR str_to_date('$data_Check_out_date', '%d-%m-%y') BETWEEN str_to_date(rn.reservation_check_in_date, '%d-%m-%y') AND str_to_date(rn.reservation_check_out_date, '%d-%m-%y')
          OR str_to_date('$data_Check_in_date', '%d-%m-%y') <= str_to_date(rn.reservation_check_in_date, '%d-%m-%y')
          AND str_to_date('$data_Check_out_date', '%d-%m-%y'))
      ) AS reserve
      FROM room_details rd
      LEFT JOIN reservation rn ON rd.rd_id = rn.reservation_rd_id
      WHERE NOT EXISTS (
        SELECT rn.*
        FROM reservation rn
        WHERE (rn.reservation_rd_id = rd.rd_id
          AND ((str_to_date('$data_Check_in_date', '%d-%m-%y') BETWEEN str_to_date(rn.reservation_check_in_date, '%d-%m-%y') AND str_to_date(rn.reservation_check_out_date, '%d-%m-%y')
            OR str_to_date('$data_Check_out_date', '%d-%m-%y') BETWEEN str_to_date(rn.reservation_check_in_date, '%d-%m-%y') AND str_to_date(rn.reservation_check_out_date, '%d-%m-%y')
            OR str_to_date('$data_Check_in_date', '%d-%m-%y') <= str_to_date(rn.reservation_check_in_date, '%d-%m-%y')
              AND str_to_date('$data_Check_out_date', '%d-%m-%y') >= str_to_date(rn.reservation_check_out_date, '%d-%m-%y')))
          AND (rd.rd_numberofrooms <= (
            SELECT SUM(rn.reservation_numberofrooms) AS count_reserve_room
            FROM reservation rn
            WHERE rn.reservation_rd_id = rd.rd_id
              AND (str_to_date('$data_Check_in_date', '%d-%m-%y') BETWEEN str_to_date(rn.reservation_check_in_date, '%d-%m-%y') AND str_to_date(rn.reservation_check_out_date, '%d-%m-%y')
              OR str_to_date('$data_Check_out_date', '%d-%m-%y') BETWEEN str_to_date(rn.reservation_check_in_date, '%d-%m-%y') AND str_to_date(rn.reservation_check_out_date, '%d-%m-%y')
              OR str_to_date('$data_Check_in_date', '%d-%m-%y') <= str_to_date(rn.reservation_check_in_date, '%d-%m-%y')
                AND str_to_date('$data_Check_out_date', '%d-%m-%y'))
          )))
      )
    `);
  });

  it ('test11 SELECT `LEFT`(a, 3) FROM b support.', function () {
    testParser('SELECT `LEFT`(a, 3) FROM b');
  });

  it ('test12', function () {
    testParser(`
      select
          a.product_id,
          a.product_name,
          count(a.ins_id) as ins_num,
          count(a.f) as f_num,
          count(a.m) as m_num,
          count(a.p_1) as p_1_num,
          count(a.p_2) as p_1_num,
          count(a.p_3) as p_1_num,
          count(a.gt3) as gt3_num,
          count(lt25) as lt25_num,
          count(gt25lt35) as gt25lt35_num,
          count(gt35lt45) as gt25lt35_num,
          count(gt45lt55) as gt25lt35_num,
          count(gt55) as gt55_num
      from(
          select
                  a.ins_id,
                  b.product_id,
                  b.product_name,
                  c.cust_id,
                  c.cust_name,
                  c.cust_sex,
                  c.cust_age,
                  c.family_num,
                  (case when c.cust_sex='f' then 1 else 0 end) as f,
                  (case when c.cust_sex='m' then 1 else 0 end) as m,
                  (case when c.family_num=1 then 1 else 0 end) as p_1,
                  (case when c.family_num=2 then 1 else 0 end) as P_2,
                  (case when c.family_num=3 then 1 else 0 end) as p_3,
                  (case when c.family_num>3 then 1 else 0 end) as gt3,
                  (case when c.cust_age<=25 then 1 else 0 end) as lt25,
                  (case when c.cust_age>25 and c.cust_age<=35 then 1 else 0 end) as gt25lt35,
                  (case when c.cust_age>35 and c.cust_age<=45 then 1 else 0 end) as gt35lt45,
                  (case when c.cust_age>45 and c.cust_age<=55 then 1 else 0 end) as gt45lt55,
                  (case when c.cust_age>55 then 1 else 0 end) as gt55
          from
                  insurance a,
                  product b,
                  customer c
          where
                  a.product_id=b.product_id
                  and a.cust_id=c.cust_id
      ) a
      group by b.product_id, b.product_name
    `);
  });

  it ('test13', function () {
    testParser(`
      SELECT
          a.*, f.ORG_NAME DEPT_NAME,
          IFNULL(d.CONT_COUNT, 0) SIGN_CONT_COUNT,
          IFNULL(d.TOTAL_PRICE, 0) SIGN_CONT_MONEY,
          IFNULL(c.CONT_COUNT, 0) SIGN_ARRI_CONT_COUNT,
          IFNULL(c.TOTAL_PRICE, 0) SIGN_ARRI_CONT_MONEY,
          IFNULL(b.CONT_COUNT, 0) TOTAL_ARRI_CONT_COUNT,
          IFNULL(b.TOTAL_PRICE, 0) TOTAL_ARRI_MONEY,
          0 PUBLISH_TOTAL_COUNT,
          0 PROJECT_COUNT,
          0 COMMON_COUNT,
          0 STOCK_COUNT,
          0 MERGER_COUNT,
          0 INDUSTRY_COUNT,
          0 BRAND_COUNT
      FROM
          (
              SELECT
                  u.USER_ID,
                  u.REAL_NAME,
                  u.ORG_PARENT_ID,
                  o.ORG_NAME,
                  u.ORG_ID
              FROM
                  SE_USER u
              INNER JOIN SE_ORGANIZ o ON u.ORG_PARENT_ID = o.ORG_ID
              WHERE
                  u.\`STATUS\` = 1
              AND u.\`LEVEL\` IN (1, 2, 3)
              AND o.PARENT_ID <> 0
          ) a
      -- 查询部门名称
      LEFT JOIN SE_ORGANIZ f ON a.ORG_ID = f.ORG_ID
      -- 签约合同数与合同金额
      LEFT JOIN (
          SELECT
              CUST_MGR_ID,
              COUNT(CONT_ID) CONT_COUNT,
              SUM(TOTAL_PRICE) TOTAL_PRICE
          FROM
              SE_CONTRACT
          WHERE
              DATE_FORMAT(CREATE_TIME, '%Y-%m-%d') = '2012-06-08'
          GROUP BY
              CUST_MGR_ID
      ) d ON a.USER_ID = d.CUST_MGR_ID
      -- 签约并回款合同数与回款金额
      LEFT JOIN (
          SELECT
              CUST_MGR_ID,
              COUNT(CONT_ID) CONT_COUNT,
              SUM(TOTAL_PRICE) TOTAL_PRICE
          FROM
              SE_CONTRACT
          WHERE
              (STATUS = 6 OR STATUS = 10)
          AND DATE_FORMAT(CREATE_TIME, '%Y-%m-%d') = '2012-06-08'
          GROUP BY
              CUST_MGR_ID
      ) c ON a.USER_ID = c.CUST_MGR_ID
      -- 总回款合同数与总回款金额
      LEFT JOIN (
          SELECT
              c.CUST_MGR_ID,
              COUNT(c.CONT_ID) CONT_COUNT,
              SUM(c.TOTAL_PRICE) TOTAL_PRICE
          FROM
              SE_CONTRACT c
          INNER JOIN SE_CONT_AUDIT a ON c.CONT_ID = a.CONT_ID
          WHERE
              (c. STATUS = 6 OR c. STATUS = 10)
          AND a.IS_PASS = 1
          AND DATE_FORMAT(a.AUDIT_TIME, '%Y-%m-%d') = '2012-06-08'
          GROUP BY
              c.CUST_MGR_ID
      ) b ON a.USER_ID = b.CUST_MGR_ID
      ORDER BY
          a.ORG_PARENT_ID,
          a.USER_ID
    `);
  });

  it ('test14', function () {
    testParser(`
      SELECT
          k.*,
      IF (
          k.LAST_PUBLISH_TOTAL_COUNT > 0,
          ROUND((k.RISE_PUBLISH_TOTAL_COUNT / k.LAST_PUBLISH_TOTAL_COUNT) * 100, 2),
          0
      ) RELATIVE_PUBLISH_RATIO,
      IF (
          k.LAST_PROJECT_COUNT > 0,
          ROUND((k.RISE_PROJECT_COUNT / k.LAST_PROJECT_COUNT) * 100, 2),
          0
      ) RELATIVE_PROJECT_RATIO,
      IF (
          k.LAST_COMMON_COUNT > 0,
          ROUND((k.RISE_COMMON_COUNT / k.LAST_COMMON_COUNT) * 100, 2),
          0
      ) RELATIVE_COMMON_RATIO
      FROM
        (
            SELECT
                m.ORG_NAME,
                IFNULL(n.LAST_PUBLISH_TOTAL_COUNT, 0) LAST_PUBLISH_TOTAL_COUNT,
                IFNULL(n.LAST_PROJECT_COUNT, 0) LAST_PROJECT_COUNT,
                IFNULL(n.LAST_COMMON_COUNT, 0) LAST_COMMON_COUNT,
                m.PUBLISH_TOTAL_COUNT,
                m.PROJECT_COUNT,
                m.COMMON_COUNT,
                IFNULL(m.PUBLISH_TOTAL_COUNT - n.LAST_PUBLISH_TOTAL_COUNT, 0) RISE_PUBLISH_TOTAL_COUNT,
                IFNULL(m.PROJECT_COUNT - n.LAST_PROJECT_COUNT, 0) RISE_PROJECT_COUNT,
                IFNULL(m.COMMON_COUNT - n.LAST_COMMON_COUNT, 0) RISE_COMMON_COUNT
            FROM
                (
                    SELECT
                        'c' AS ORG_NAME,
                        SUM(PUBLISH_TOTAL_COUNT) AS PUBLISH_TOTAL_COUNT,
                        SUM(PROJECT_COUNT) AS PROJECT_COUNT,
                        SUM(COMMON_COUNT) AS COMMON_COUNT
                    FROM
                        SE_STAT_ORG
                    WHERE
                        DATE_FORMAT(RECORD_DATE, '%Y-%m') = '2012-07'
                ) m
            LEFT JOIN (
                SELECT
                    'c' AS ORG_NAME,
                    SUM(PUBLISH_TOTAL_COUNT) AS LAST_PUBLISH_TOTAL_COUNT,
                    SUM(PROJECT_COUNT) AS LAST_PROJECT_COUNT,
                    SUM(COMMON_COUNT) AS LAST_COMMON_COUNT
                FROM
                    SE_STAT_ORG
                WHERE
                    DATE_FORMAT(RECORD_DATE, '%Y-%m') = '2012-06'
            ) n ON m.ORG_NAME = n.ORG_NAME
        ) k
    `);
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

  it ('recognoce alias for sql-function calls in stringify function.', function () {
    testParser('SELECT COUNT(*) AS total FROM b');
  });

  it ('allow prepared statement prefix ("$" or ":") or plain ?.', function () {
    testParser('SELECT * FROM b WHERE id=$id OR id=:id ORDER BY ?');
  });
});
