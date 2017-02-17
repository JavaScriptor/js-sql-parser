'use strict';

const Benchmark = require('benchmark');
const suite = new Benchmark.Suite;
const parser = require('../');

let simpleAst = {};
let complexAst = {};
const simpleSql = `
  select a from b where c > 1 group by d order by e desc
`;
const complexSql = `
      SELECT rd.*, ((rd.rd_numberofrooms) - (select sum(rn.reservation_numberofrooms) as count_reserve_room from reservation as rn WHERE rn.reservation_rd_id = rd.rd_id AND (str_to_date('$data_Check_in_date','%d-%m-%y') BETWEEN str_to_date(rn.reservation_check_in_date,'%d-%m-%y') AND str_to_date(rn.reservation_check_out_date,'%d-%m-%y') OR str_to_date('$data_Check_out_date','%d-%m-%y') BETWEEN str_to_date(rn.reservation_check_in_date,'%d-%m-%y') AND str_to_date(rn.reservation_check_out_date,'%d-%m-%y') OR str_to_date('$data_Check_in_date','%d-%m-%y') <= str_to_date(rn.reservation_check_in_date,'%d-%m-%y') AND str_to_date('$data_Check_out_date','%d-%m-%y') ) )) as reserve

FROM room_details rd LEFT JOIN reservation rn ON rd.rd_id = rn.reservation_rd_id WHERE NOT EXISTS

(

SELECT rn.* FROM reservation rn WHERE rn.reservation_rd_id = rd.rd_id

AND (str_to_date('$data_Check_in_date','%d-%m-%y') BETWEEN str_to_date(rn.reservation_check_in_date,'%d-%m-%y') AND str_to_date(rn.reservation_check_out_date,'%d-%m-%y') OR str_to_date('$data_Check_out_date','%d-%m-%y') BETWEEN str_to_date(rn.reservation_check_in_date,'%d-%m-%y') AND str_to_date(rn.reservation_check_out_date,'%d-%m-%y') OR str_to_date('$data_Check_in_date','%d-%m-%y') <= str_to_date(rn.reservation_check_in_date,'%d-%m-%y') AND str_to_date('$data_Check_out_date','%d-%m-%y') >= str_to_date(rn.reservation_check_out_date,'%d-%m-%y'))

AND (rd.rd_numberofrooms <= (select sum(rn.reservation_numberofrooms) as count_reserve_room from reservation as rn WHERE rn.reservation_rd_id = rd.rd_id AND (str_to_date('$data_Check_in_date','%d-%m-%y') BETWEEN str_to_date(rn.reservation_check_in_date,'%d-%m-%y') AND str_to_date(rn.reservation_check_out_date,'%d-%m-%y') OR str_to_date('$data_Check_out_date','%d-%m-%y') BETWEEN str_to_date(rn.reservation_check_in_date,'%d-%m-%y') AND str_to_date(rn.reservation_check_out_date,'%d-%m-%y') OR str_to_date('$data_Check_in_date','%d-%m-%y') <= str_to_date(rn.reservation_check_in_date,'%d-%m-%y') AND str_to_date('$data_Check_out_date','%d-%m-%y') ) ) )

)
`;

suite
.add('simpleSql', function () {
  let ast = parser.parse(simpleSql);
  let newSql = parser.stringify(ast);
})
.add('complexSql', function () {
  let ast = parser.parse(complexSql);
  let newSql = parser.stringify(ast);
})
.add('simpleParse', function () {
  simpleAst = parser.parse(simpleSql);
})
.add('complexParse', function () {
  complexAst = parser.parse(complexSql);
})
.add('simpleStringify', function () {
  parser.stringify(simpleAst);
})
.add('complexStringify', function () {
  parser.stringify(complexAst);
})
.on('cycle', function (event) {
  console.log('' + event.target);
})
.run();

