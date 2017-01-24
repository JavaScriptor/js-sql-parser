/* description: Parses SQL */
/* :tabSize=4:indentSize=4:noTabs=true: */
%lex

%options case-insensitive

%%

\s+                                              /* skip whitespace */
[/][*](.|\n)*?[*][/]                             /* skip comments */
[-][-]\s.*\n                                     /* skip sql comments */

SELECT                                           return 'SELECT'
ALL                                              return 'ALL'
DISTINCT                                         return 'DISTINCT'
DISTINCTROW                                      return 'DISTINCTROW'

['](\\.|[^'])*[']                                return 'STRING'
["](\\.|[^"])*["]                                return 'STRING'
[0-9]+(\.[0-9]+)?                                return 'NUMERIC'

<<EOF>>                                          return 'EOF'
.                                                return 'INVALID'

/lex

%start main

%% /* language grammar */

main
  : selectClause EOF { return {nodeType: 'Main', value: $1}; }
  ;

selectClause
  : SELECT 
      distinctOpt
      {
        return {
          distinctOpt: $2
        }
      }
  ;

distinctOpt
  : ALL { $$ = $1 } 
  | DISTINCT { $$ = $1 }
  | DISTINCTROW { $$ = $1 }
  | { $$ = null }
  ;

