if (!sqlParser) {
  sqlParser = {};
}

function Sql() {
  this.buffer = '';
}

sqlParser.stringify = function (ast) {
  var sql = new Sql();
  sql.strigifyMain(ast);
  return sql.buffer;
}

Sql.prototype.appendKeyword = function(keyword) {
  this.buffer += keyword.toUpperCase() + ' ';
}
Sql.prototype.append = function(word) {
  this.buffer += word + ' ';
}
Sql.prototype.strigifyMain = function(ast) {
  this.stringifySelectClause(ast.value);
}
Sql.prototype.stringifySelectClause = function(ast) {
  this.appendKeyword('select');
  if (ast.distinctOpt) {
    this.appendKeyword(ast.distinctOpt);
  }
  if (ast.highPriorityOpt) {
    this.appendKeyword(ast.highPriorityOpt);
  }
  if (ast.maxStateMentTimeOpt) {
    this.append('MAX_STATEMENT_TIME = ' + ast.maxStateMentTimeOpt);
  }
  if (ast.straightJoinOpt) {
    this.appendKeyword(ast.straightJoinOpt);
  }
  if (ast.sqlSmallResultOpt) {
    this.appendKeyword(ast.sqlSmallResultOpt);
  }
  if (ast.sqlBigResultOpt) {
    this.appendKeyword(ast.sqlBigResultOpt);
  }
  if (ast.sqlBufferResultOpt) {
    this.appendKeyword(ast.sqlBufferResultOpt);
  }
  if (ast.sqlCacheOpt) {
    this.appendKeyword(ast.sqlCacheOpt);
  }
  if (ast.sqlCalcFoundRowsOpt) {
    this.appendKeyword(ast.sqlCalcFoundRowsOpt);
  }
  if (ast.selectItems) {
    this.stringifySelectItems(ast.selectItems);
  }
}
Sql.prototype.stringifySelectItems = function (ast) {
  var exprList = ast.value;
  for (var i = 0; i < exprList.length; i++) {
    this.stringifySelectExpr(exprList[i]);
    if (i > 0) {
      this.append(',');
    }
  }
}
Sql.prototype.stringifySelectExpr = function (ast) {
  if (typeof ast === 'string') {
    return this.append(ast);
  }
  this.stringifyExpr(ast);
  if (ast.alias) {
    if (ast.hasAs) {
      this.appendKeyword('as');
    }
    this.append(ast.alias);
  }
}
Sql.prototype.stringifyExpr = function (ast) {
  switch (ast.type) {
    case 'IsExpression':
      this.stringifyBooleanPrimary(ast);
      this.appendKeyword('in');
      if (ast.hasNot) {
        this.appendKeyword('not');
      }
      this.append(ast.right.value);
      break;
    case 'NotExpression':
      this.appendKeyword('not');
      this.stringifyExpr(ast.value);
      break;
    case 'OrExpression':
    case 'AndExpression':
    case 'XORExpression':
      this.stringifyExpr(ast.left);
      this.appendKeyword(ast.operator);
      this.stringifyExpr(ast.right);
      break;
    default:
      this.stringifyBooleanPrimary(ast);
      break;
  }
}
Sql.prototype.stringifyBooleanPrimary = function () {
  ;
}

