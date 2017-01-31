/* description: Parses SQL */
/* :tabSize=4:indentSize=4:noTabs=true: */
%lex

%options case-insensitive

%%

[/][*](.|\n)*?[*][/]                                              /* skip comments */
[-][-]\s.*\n                                                      /* skip sql comments */
[#]\s.*\n                                                         /* skip sql comments */
\s+                                                               /* skip whitespace */
                                                                  
SELECT                                                            return 'SELECT'
ALL                                                               return 'ALL'
ANY                                                               return 'ANY'
DISTINCT                                                          return 'DISTINCT'
DISTINCTROW                                                       return 'DISTINCTROW'
HIGH_PRIORITY                                                     return 'HIGH_PRIORITY'
MAX_STATEMENT_TIME                                                return 'MAX_STATEMENT_TIME'
STRAIGHT_JOIN                                                     return 'STRAIGHT_JOIN'
SQL_SMALL_RESULT                                                  return 'SQL_SMALL_RESULT'
SQL_BIG_RESULT                                                    return 'SQL_BIG_RESULT'
SQL_BUFFER_RESULT                                                 return 'SQL_BUFFER_RESULT'
SQL_CACHE                                                         return 'SQL_CACHE'
SQL_NO_CACHE                                                      return 'SQL_NO_CACHE'
SQL_CALC_FOUND_ROWS                                               return 'SQL_CALC_FOUND_ROWS'
([a-zA-Z_\u4e00-\u9fa5][a-zA-Z0-9_\u4e00-\u9fa5]+\.){1,2}\*       return 'SELECT_EXPR_STAR'
AS                                                                return 'AS'
TRUE                                                              return 'TRUE'
FALSE                                                             return 'FALSE'
NULL                                                              return 'NULL'
COLLATE                                                           return 'COLLATE'
BINARY                                                            return 'BINARY'
ROW                                                               return 'ROW'
EXISTS                                                            return 'EXISTS'
CASE                                                              return 'CASE'
WHEN                                                              return 'WHEN'
THEN                                                              return 'THEN'
ELSE                                                              return 'ELSE'
END                                                               return 'END'
DIV                                                               return 'DIV'
MOD                                                               return 'MOD'
NOT                                                               return 'NOT'
BETWEEN                                                           return 'BETWEEN'
SOUNDS                                                            return 'SOUNDS'
LIKE                                                              return 'LIKE'
ESCAPE                                                            return 'ESCAPE'
REGEXP                                                            return 'REGEXP'
IS                                                                return 'IS'
UNKNOWN                                                           return 'UNKNOWN'
AND                                                               return 'AND'
OR                                                                return 'OR'
XOR                                                               return 'XOR'
FROM                                                              return 'FROM'
PARTITION                                                         return 'PARTITION'
USE                                                               return 'USE'
INDEX                                                             return 'INDEX'
KEY                                                               return 'KEY'
FOR                                                               return 'FOR'
JOIN                                                              return 'JOIN'
ORDER\s+BY                                                        return 'ORDER_BY'
GROUP\s+BY                                                        return 'GROUP_BY'
IGNORE                                                            return 'IGNORE'
FORCE                                                             return 'FORCE'
INNER                                                             return 'INNER'
CROSS                                                             return 'CROSS'
ON                                                                return 'ON'
USING                                                             return 'USING'
LEFT                                                              return 'LEFT'
RIGHT                                                             return 'RIGHT'
OUTER                                                             return 'OUTER'
NATURAL                                                           return 'NATURAL'

","                                                               return ','
"="                                                               return '='
"("                                                               return '('
")"                                                               return ')'
"~"                                                               return '~'
"!"                                                               return '!'
"|"                                                               return '|'
"&"                                                               return '&'
"<<"                                                              return '<<'
">>"                                                              return '>>'
"+"                                                               return '+'
"-"                                                               return '-'
"*"                                                               return '*'
"/"                                                               return '/'
"%"                                                               return '%'
"^"                                                               return '^'
">="                                                              return '>='
">"                                                               return '>'
"<"                                                               return '<'
"<="                                                              return '<='
"<>"                                                              return '<>'
"!="                                                              return '!='
"<=>"                                                             return '<=>'
"{"                                                               return '{'
"}"                                                               return '}'
                                                                 
['](\\.|[^'])*[']                                                 return 'STRING'
["](\\.|[^"])*["]                                                 return 'STRING'
[0][x][0-9a-fA-F]+                                                return 'HEX_NUMERIC'
[-]?[0-9]+(\.[0-9]+)?                                             return 'NUMERIC'
[-]?[0-9]+(\.[0-9]+)?[eE][-][0-9]+(\.[0-9]+)?                     return 'EXPONENT_NUMERIC'

[a-zA-Z_\u4e00-\u9fa5][a-zA-Z0-9_\u4e00-\u9fa5]*                  return 'IDENTIFIER'
\.                                                                return 'DOT'
['"][a-zA-Z_\u4e00-\u9fa5][a-zA-Z0-9_\u4e00-\u9fa5]*["']          return 'QUOTED_IDENTIFIER'
                                                                 
<<EOF>>                                                           return 'EOF'
.                                                                 return 'INVALID'

/lex

%left ',' TABLE_REF_COMMA
%left INDEX_HINT_LIST
%left INDEX_HINT_COMMA
%left INNER_CROSS_JOIN_NULL LEFT_RIGHT_JOIN
%left INNER_CROSS_JOIN
%right USING
%right ON
%left OR XOR '||'
%left '&&' AND
%left '|'
%left '^'
%left '&'
%left '=' '!='        /* = in sql equels == */
%left '>' '>=' '<' '<='
%left '<<' '>>'
%left '+' '-'
%left DIV MOD '/' '%' '*'
%right UPLUS UMINUS UNOT '~' NOT
%left DOT

%start main

%% /* language grammar */

main
  : selectClause EOF { return {nodeType: 'Main', value: $1}; }
  ;

selectClause
  : SELECT 
      distinctOpt
      highPriorityOpt
      maxStateMentTimeOpt
      straightJoinOpt
      sqlSmallResultOpt
      sqlBigResultOpt
      sqlBufferResultOpt
      sqlCacheOpt
      sqlNoCacheOpt
      sqlCalcFoundRowsOpt
      selectExprList
      selectDataSetOpt
      {
        return {
          type: 'Select',
          distinctOpt: $2,
          highPriorityOpt: $3,
          maxStateMentTimeOpt: $4,
          straightJoinOpt: $5,
          sqlSmallResultOpt: $6,
          sqlBigResultOpt: $7,
          sqlBufferResultOpt: $8,
          sqlCacheOpt: $9,
          sqlNoCacheOpt: $10,
          sqlCalcFoundRowsOpt: $11,
          selectExprList: $12,
          from: $13.from
        }
      }
  ;

distinctOpt
  : ALL { $$ = $1 } 
  | DISTINCT { $$ = $1 }
  | DISTINCTROW { $$ = $1 }
  | { $$ = null }
  ;
highPriorityOpt
  : HIGH_PRIORITY { $$ = true }
  | { $$ = null }
  ;
maxStateMentTimeOpt
  : MAX_STATEMENT_TIME '=' NUMERIC { $$ = $3 }
  | { $$ = null }
  ;
straightJoinOpt
  : STRAIGHT_JOIN { $$ = true }
  | { $$ = null }
  ;
sqlSmallResultOpt
  : SQL_SMALL_RESULT { $$ = true }
  | { $$ = null }
  ;
sqlBigResultOpt
  : SQL_BIG_RESULT { $$ = true }
  | { $$ = null }
  ;
sqlBufferResultOpt
  : SQL_BUFFER_RESULT { $$ = true }
  | { $$ = null }
  ;
sqlCacheOpt
  : SQL_CACHE { $$ = true }
  | { $$ = null }
  ;
sqlNoCacheOpt
  : SQL_NO_CACHE { $$ = true }
  | { $$ = null }
  ;
sqlCalcFoundRowsOpt
  : SQL_CALC_FOUND_ROWS { $$ = true }
  | { $$ = null }
  ;
selectExprList
  : selectExprList ',' selectExpr { $3.type = 'SelectExpr'; $$.push($3); }
  | selectExpr { $1.type = 'SelectExpr'; $$ = [ $1 ]; }
  ;
selectExpr
  : '*' { $$ = { value: $1 } }
  | SELECT_EXPR_STAR { $$ = { value: $1 } }
  | expr selectExprAliasOpt { $$ = $1; $$.alias = $2.alias; $$.hasAs = $2.hasAs; }
  ;
selectExprAliasOpt
  : { $$ = {alias: null, hasAs: null} }
  | AS IDENTIFIER { $$ = {alias: $2, hasAs: true} }
  | IDENTIFIER { $$ = {alias: $1, hasAs: false} }
  ;

string
  : QUOTED_IDENTIFIER { $$ = { type: 'String', value: $1 } }
  | STRING { $$ = { type: 'String', value: $1 } }
  ;
number
  : NUMERIC { $$ = { type: 'Number', value: $1 } }
  | EXPONENT_NUMERIC = { $$ = { type: 'Number', value: $1 } }
  | HEX_NUMERIC = { $$ = { type: 'Number', value: $1 } }
  ;
boolean
  : TRUE { $$ = { type: 'Boolean', value: 'TRUE' } }
  | FALSE { $$ = { type: 'Boolean', value: 'FALSE' } }
  ;
null
  : NULL { $$ = { type: 'Null', value: 'null' } }
  ;
literal
  : string { $$ = $1 }
  | number { $$ = $1 }
  | boolean { $$ = $1 }
  | null { $$ = $1 }
  ;
function_call
  : IDENTIFIER '(' function_call_param_list ')' { $$ = {type: 'FunctionCall', name: $1, params: $3} }
  ;
function_call_param_list
  : function_call_param_list ',' function_call_param { $1.push($3); $$ = $1; }
  | function_call_param { $$ = [$1]; }
  ;
function_call_param
  : { $$ = null }
  | '*' { $$ = $1 }
  | SELECT_EXPR_STAR { $$ = $1 }
  | DISTINCT expr { $$ = { type: 'FunctionCallParam', distinctOpt: $1, value: $2 } }
  | expr { $$ = $1 }
  ;
identifier
  : IDENTIFIER { $$ = { type: 'Identifier', value: $1 } }
  | identifier DOT IDENTIFIER { $$ = $1; $1.value += '.' + $3 }
  ;
identifier_list
  : identifier { $$ = { type: 'IdentifierList', value: [ $1 ] } }
  | identifier_list ',' identifier { $$ = $1; $1.value.push($3); }
  ;
case_expr
  : { $$ = null }
  | expr { $$ = $1 }
  ;
when_then_list
  : WHEN expr THEN expr { $$ = { type: 'WhenThenList', value: [ { when: $2, then: $4 } ] }; }
  | when_then_list WHEN expr THEN expr { $$ = $1; $$.value.push({ when: $3, then: $5 }); }
  ;
case_when_else
  : { $$ = null }
  | ELSE expr { $$ = $2 }
  ;
case_when
  : CASE case_expr when_then_list case_when_else END { $$ = { type: 'CaseWhen', caseExpr: $2, whenThenList: $3, else: $4 } }
  ;
simple_expr_prefix
  : '+' simple_expr %prec UPLUS { $$ = $2; if (!$$.prefix) $$.prefix = [ $1 ]; else $$.prefix.push($1); }
  | '-' simple_expr %prec UMINUS { $$ = $2; if (!$$.prefix) $$.prefix = [ $1 ]; else $$.prefix.push($1); }
  | '~' simple_expr { $$ = $2; if (!$$.prefix) $$.prefix = [ $1 ]; else $$.prefix.push($1); }
  | '!' simple_expr %prec UNOT { $$ = $2; if (!$$.prefix) $$.prefix = [ $1 ]; else $$.prefix.push($1); }
  |  BINARY simple_expr { $$ = $2; if (!$$.prefix) $$.prefix = [ $1 ]; else $$.prefix.push($1); }
  ;
simple_expr
  : literal { $$ = $1 }
  | identifier { $$ = $1 }
  | function_call { $$ = $1 }
  | simple_expr_prefix { $$ = $1 }
  | '(' expr_list ')' { $$ = $2; $$.hasParentheses = true; }
  | ROW '(' expr_list ')' { $$ = $3; $$.hasParentheses = true; $$.hasRow = true; }
  | '(' selectClause ')' { $$ = { type: 'SubQuery', value: $2 } }
  | EXISTS '(' selectClause ')' { $$ = { type: 'ExistsSubQuery', value: $3 } }
  | '{' identifier expr '}' { $$ = { type: 'IdentifierExpr', identifier: $2, value: $3 } }
  | case_when { $$ = $1 }
  ;
bit_expr
  : simple_expr { $$ = $1 }
  | bit_expr '|' bit_expr { $$ = { type: 'BitExpression', operator: '|', left: $1, right: $3 } } 
  | bit_expr '&' bit_expr { $$ = { type: 'BitExpression', operator: '&', left: $1, right: $3 } }
  | bit_expr '<<' bit_expr { $$ = { type: 'BitExpression', operator: '<<', left: $1, right: $3 } }
  | bit_expr '>>' bit_expr { $$ = { type: 'BitExpression', operator: '>>', left: $1, right: $3 } }
  | bit_expr '+' bit_expr { $$ = { type: 'BitExpression', operator: '+', left: $1, right: $3 } }
  | bit_expr '-' bit_expr { $$ = { type: 'BitExpression', operator: '-', left: $1, right: $3 } }
  | bit_expr '*' bit_expr %prec MULTI { $$ = { type: 'BitExpression', operator: '*', left: $1, right: $3 } }
  | bit_expr '/' bit_expr { $$ = { type: 'BitExpression', operator: '/', left: $1, right: $3 } }
  | bit_expr DIV bit_expr { $$ = { type: 'BitExpression', operator: 'DIV', left: $1, right: $3 } }
  | bit_expr MOD bit_expr { $$ = { type: 'BitExpression', operator: 'MOD', left: $1, right: $3 } }
  | bit_expr '%' bit_expr { $$ = { type: 'BitExpression', operator: '%', left: $1, right: $3 } }
  | bit_expr '^' bit_expr { $$ = { type: 'BitExpression', operator: '^', left: $1, right: $3 } }
  ;
not_opt
  : { $$ = false }
  | NOT { $$ = true }
  ;
escape_opt
  : { $$ = null }
  | ESCAPE simple_expr { $$ = $2 }
  ;
predicate
  : bit_expr { $$ = $1 }
  | bit_expr not_opt IN '(' selectClause ')' { $$ = { type: 'InPredicate', hasNot: $2, left: $1 ,right: $5 } }
  | bit_expr not_opt BETWEEN bit_expr AND predicate { $$ = { type: 'BetweenPredicate', hasNot: $2, left: $1, right: { left: $3, right: $5 } } }
  | bit_expr SOUNDS LIKE bit_expr { $$ = { type: 'SoundsLikePredicate', hasNot: false, left: $1, right: $4 } }
  | bit_expr not_opt LIKE simple_expr escape_opt { $$ = { type: 'LikePredicate', hasNot: $2, left: $1, right: $4, escape: $5 } }
  | bit_expr not_opt REGEXP bit_expr { $$ = { type: 'RegexpPredicate', hasNot: $2, left: $1, right: $4 } }
  ;
comparison_operator
  : '=' { $$ = $1 }
  | '>=' { $$ = $1 }
  | '>' { $$ = $1 }
  | '<=' { $$ = $1 }
  | '<' { $$ = $1 }
  | '<>' { $$ = $1 }
  | '!=' { $$ = $1 }
  ;
sub_query_data_set_opt
 : ALL { $$ = $1 }
 | ANY { $$ = $1 }
 ;
boolean_primary
  : predicate { $$ = $1 }
  | boolean_primary IS not_opt NULL { $$ = { type: 'IsNullBooleanPrimary', hasNot: $3 , value: $1 } }
  | boolean_primary comparison_operator predicate { $$ = { type: 'ComparisonBooleanPrimary', left: $1, operator: $2, right: $3 } }
  | boolean_primary comparison_operator sub_query_data_set_opt '(' selectClause ')' { $$ = { type: 'ComparisonSubQueryBooleanPrimary', operator: $2, subQueryOpt: $3, left: $1, right: $5 } }
  ;
boolean_extra
  : boolean { $$ = $1 }
  | UNKNOWN { $$ = { type: 'BooleanExtra', value: $1 } }
  ;
expr
  : boolean_primary { $$ = $1 }
  | boolean_primary IS not_opt boolean_extra { $$ = { type: 'IsExpression', hasNot: $3, left: $1, right: $4 } }
  | NOT expr { $$ = { type: 'NotExpression', value: $2 } }
  | expr '&&' expr { $$ = { type: 'AndOpExpression', left: $1, right: $3 } }
  | expr '||' expr { $$ = { type: 'OrOpExpression', left: $1, right: $3 } }
  | expr OR expr { $$ = { type: 'OrExpression', left: $1, right: $3 } }
  | expr AND expr { $$ = { type: 'AndExpression', left: $1, right: $3 } }
  | expr XOR expr { $$ = { type: 'XORExpression', left: $1, right: $3 } }
  ;
expr_list
  : expr { $$ = { type: 'ExpressionList', value: [ $1 ] } }
  | expr_list ',' expr { $$ = $1; $$.value.push($3); }
  ;

selectDataSetOpt
  : { $$ = {} }
  | FROM table_refrences { $$ = { from: $2 } }
  ;
table_refrences
  : escaped_table_reference { $$ = { type: 'TableRefrences', value: [ $1 ] } }
  | table_refrences ',' escaped_table_reference %prec TABLE_REF_COMMA { $$ = $1; $1.value.push($3); }
  ;
escaped_table_reference
  : table_reference { $$ = { type: 'TableRefrence', value: $1 } }
  | '{' OJ table_reference '}' { $$ = { type: 'TableRefrence', hasOj: true, value: $3 } }
  ;
join_inner_cross
  : { $$ = null }
  | INNER { $$ = $1 }
  | CROSS { $$ = $1 }
  ;
left_right
  : LEFT { $$ = $1 }
  | RIGHT { $$ = $1 }
  ;
out_opt
  : { $$ = null }
  | OUTER { $$ = $1 }
  ;
left_right_out_opt
  : { $$ = { leftRight: null, outOpt: null } }
  | left_right out_opt { $$ = { leftRight: $1, outOpt: $2 } }
  ;
join_table
  : table_reference join_inner_cross JOIN table_factor %prec INNER_CROSS_JOIN_NULL { $$ = { type: 'InnerCrossJoinTable', innerCross: $2, left: $1, right: $4, condition: $5 } }
  | table_reference join_inner_cross JOIN table_factor join_condition  %prec INNER_CROSS_JOIN { $$ = { type: 'InnerCrossJoinTable', innerCross: $2, left: $1, right: $4, condition: $5 } }
  | table_reference STRAIGHT_JOIN table_factor on_join_condition { $$ = { type: 'StraightJoinTable', left: $1, right: $3, condition: $4 } }
  | table_reference left_right out_opt JOIN table_reference join_condition %prec LEFT_RIGHT_JOIN { $$ = { type: 'LeftRightJoinTable', leftRight: $2, outOpt: $3, left: $1, right: $5, condition: $6 } }
  | table_reference NATURAL left_right_out_opt JOIN table_factor { $$ = { type: 'NaturalJoinTable', leftRight: $3.leftRight, outOpt: $3.outOpt, left: $1, right: $5 } }
  ;
join_condition_opt
  : %prec SYMBOL_JOIN_CONDITION_NULL { $$ = null }
  | join_condition { $$ = $1 }
  ;
on_join_condition
  : ON expr { $$ = { type: 'OnJoinCondition', value: $2 } }
  ;
join_condition
  : on_join_condition { $$ = $1 }
  | USING '(' identifier_list ')' { $$ = { type: 'UsingJoinCondition', value: $3 } }
  ;
table_reference
  : table_factor { $$ = $1 }
  | join_table { $$ = $1 }
  ;
partition_names
  : identifier { $$ = { type: 'Partitions', value: [ $1 ] } }
  | partition_names ',' identifier { $$ = $1; $1.value.push($3) }
  ;
partitionOpt
  : { $$ = null }
  | PARTITION '(' partition_names ')' { $$ = $3 }
  ;
aliasOpt
  : { $$ = {alias: null, hasAs: null} }
  | AS identifier { $$ = { hasAs: true, alias: $2 } }
  | identifier { $$ = { hasAs: false, alias: $1 } }
  ;
index_or_key
  : INDEX { $$ = $1 }
  | KEY { $$ = $1 }
  ;
for_opt
  : { $$ = null }
  | FOR JOIN { $$ = { type: 'ForOptIndexHint', value: $2 } }
  | FOR ORDER_BY { $$ = { type: 'ForOptIndexHint', value: $2 } }
  | FOR GROUP_BY { $$ = { type: 'ForOptIndexHint', value: $2 } }
  ;
index_name
  : identifier { $$ = $1 }
  ;
index_list
  : index_name { $$ = { type: 'IndexList', value: [ $1 ] } }
  | index_list ',' index_name { $$ = $1; $$.value.push($3); }
  ;
index_list_opt
  : { $$ = null }
  | index_list { $$ = $1 }
  ;
index_hint_list_opt
  : { $$ = null }
  | index_hint_list %prec INDEX_HINT_LIST { $$ = $1 }
  ;
index_hint_list
  : index_hint { $$ = { type: 'IndexHintList', value: [ $1 ] } }
  | index_hint_list ',' index_hint %prec INDEX_HINT_COMMA { $$ = $1; $$.value.push($3); }
  ;
index_hint
  : USE index_or_key for_opt '(' index_list_opt ')' { $$ = { type: 'UseIndexHint', value: $5, forOpt: $3, indexOrKey: $2 } }
  | IGNORE index_or_key for_opt '(' index_list ')' { $$ = { type: 'IgnoreIndexHint', value: $5, forOpt: $3, indexOrKey: $2 } }
  | FORCE index_or_key for_opt '(' index_list ')' { $$ = { type: 'ForceIndexHint', value: $5, forOpt: $3, indexOrKey: $2 } }
  ;
table_factor
  : identifier partitionOpt aliasOpt index_hint_list_opt { $$ = { type: 'TableFactor', value: $1, partition: $2, alias: $3.alias, hasAs: $3.hasAs } }
  | '(' selectClause ')' aliasOpt { $$ = { type: 'SubQuery', value: $2, alias: $4.alias, hasAs: $4.hasAs } }
  | '(' table_refrences ')' { $$ = $2; $$.hasParentheses = true }
  ;
