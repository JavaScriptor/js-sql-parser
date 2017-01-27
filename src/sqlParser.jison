/* description: Parses SQL */
/* :tabSize=4:indentSize=4:noTabs=true: */
%lex

%options case-insensitive

%%

[/][*](.|\n)*?[*][/]                                               /* skip comments */
[-][-]\s.*\n                                                       /* skip sql comments */
[#]\s.*\n                                                          /* skip sql comments */
\s+                                                                /* skip whitespace */
                                                                   
SELECT                                                             return 'SELECT'
ALL                                                                return 'ALL'
DISTINCT                                                           return 'DISTINCT'
DISTINCTROW                                                        return 'DISTINCTROW'
HIGH_PRIORITY                                                      return 'HIGH_PRIORITY'
MAX_STATEMENT_TIME                                                 return 'MAX_STATEMENT_TIME'
STRAIGHT_JOIN                                                      return 'STRAIGHT_JOIN'
SQL_SMALL_RESULT                                                   return 'SQL_SMALL_RESULT'
SQL_BIG_RESULT                                                     return 'SQL_BIG_RESULT'
SQL_BUFFER_RESULT                                                  return 'SQL_BUFFER_RESULT'
SQL_CACHE                                                          return 'SQL_CACHE'
SQL_NO_CACHE                                                       return 'SQL_NO_CACHE'
SQL_CALC_FOUND_ROWS                                                return 'SQL_CALC_FOUND_ROWS'
'*'                                                                return '*';
([a-zA-Z_\u4e00-\u9fa5][a-zA-Z0-9_\u4e00-\u9fa5]+\.){1,2}\*        return 'SELECT_EXPR_STAR'
AS                                                                 return 'AS'
TRUE                                                               return 'TRUE'
FALSE                                                              return 'FALSE'
NULL                                                               return 'NULL'

','                                                                return ','
'='                                                                return '='
'('                                                                return '('
')'                                                                return ')'
                                                                 
['](\\.|[^'])*[']                                                  return 'STRING'
["](\\.|[^"])*["]                                                  return 'STRING'
[0][x][0-9a-fA-F]+                                                 return 'HEX_NUMERIC'
[-]?[0-9]+(\.[0-9]+)?                                              return 'NUMERIC'
[-]?[0-9]+(\.[0-9]+)?[eE][-][0-9]+(\.[0-9]+)?                      return 'EXPONENT_NUMERIC'

[a-zA-Z_\u4e00-\u9fa5][a-zA-Z0-9_\u4e00-\u9fa5]*                   return 'IDENTIFIER'
['"][a-zA-Z_\u4e00-\u9fa5][a-zA-Z0-9_\u4e00-\u9fa5]*["']           return 'QUOTED_IDENTIFIER'
                                                                 
<<EOF>>                                                            return 'EOF'
.                                                                  return 'INVALID'

/lex

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
          selectExprList: $12
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
  | NULL { $$ = $1 }
  | '*' { $$ = $1 }
  | SELECT_EXPR_STAR { $$ = $1 }
  | expr { $$ = $1 }
  ;
identifier
  : IDENTIFIER { $$ = { type: 'Identifier', value: $1 } }
  ;
simple_expr
  : literal { $$ = $1 }
  | identifier { $$ = $1 }
  | function_call { $$ = $1 }
  ;
bit_expr
  : simple_expr { $$ = $1 }
  ;
predicate
  : bit_expr { $$ = $1 }
  ;
boolean_primary
  : predicate { $$ = $1 }
  ;
expr
  : boolean_primary { $$ = $1 }
  ;
