if (!sqlParser) {
  sqlParser = {};
}

function Sql() {
  this.buffer = '';
}

sqlParser.stringify = function (ast) {
  var sql = new Sql();
  sql.travelMain(ast);
  return sql.buffer;
}

Sql.prototype.travel = function (ast) {
  if (!ast) return;

  if (typeof ast === 'string') {
    return this.append(ast);
  }

  var processor = this['travel' + ast.type];
  processor.call(this, ast);
}

var noSuffixFlag = false;
Sql.prototype.appendKeyword = function(keyword, noPrefix, noSuffix) {
  if (noSuffixFlag) {
    noPrefix = true;
    noSuffixFlag = false;
  }
  if (noPrefix) {
    this.buffer += keyword.toUpperCase();
  } else {
    this.buffer += ' ' + keyword.toUpperCase();
  }

  if (noSuffix) {
    noSuffixFlag = true;
  }
}
Sql.prototype.append = function(word, noPrefix, noSuffix) {
  if (noSuffixFlag) {
    noPrefix = true;
    noSuffixFlag = false;
  }
  if (noPrefix) {
    this.buffer += word;
  } else {
    this.buffer += ' ' + word;
  }

  if (noSuffix) {
    noSuffixFlag = true;
  }
}
Sql.prototype.travelMain = function(ast) {
  if (ast.value.type === 'Select') {
    this.travelSelect(ast.value);
  } else if (ast.value.type === 'Update') {
    this.travelUpdate(ast.value);
  } else if (ast.value.type === 'Insert') {
    this.travelInsert(ast.value);
  } else {
    throw new Error('Unknown query value type');
  }
  if (ast.hasSemicolon) {
    this.append(';', true);
  }
}
Sql.prototype.travelSelect = function(ast) {
  this.appendKeyword('select', true);
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
    this.travelSelectExpr(ast.selectItems);
  }
  if (ast.from) {
    this.appendKeyword('from');
    this.travel(ast.from);
  }
  if (ast.partition) {
    this.travel(ast.partition);
  }
  if (ast.where) {
    this.appendKeyword('where');
    this.travel(ast.where);
  }
  if (ast.groupBy) {
    this.travel(ast.groupBy);
  }
  if (ast.having) {
    this.travel(ast.having);
  }
  if (ast.orderBy) {
    this.travel(ast.orderBy);
  }
  if (ast.limit) {
    this.travel(ast.limit);
  }
  if (ast.procedure) {
    this.appendKeyword('procedure');
    this.travel(ast.procedure);
  }
  if (ast.updateLockMode) {
    this.appendKeyword(ast.updateLockMode);
  }
}
Sql.prototype.travelInsert = function(ast) {
  this.appendKeyword('insert', true);

  if (ast.lowPriority) {
    this.appendKeyword('low_priority');
  }
  if (ast.ignore) {
    this.appendKeyword('ignore');
  }
  if (ast.into) {
    this.appendKeyword('into');
  }
  this.travelTableRefrence(ast.table);
  if (ast.partitions) {
    this.travelPartitions(ast.partitions);
  }
  if (ast.cols) {
    this.travel('(');
    this.travelIdentifierList(ast.cols);
    this.travel(')');
  }
  this.travel(ast.value);
  if (ast.src.type === 'Select') {
    this.travelSelect(ast.src);
  } else if (ast.src.type === 'Values') {
    this.travel(ast.src.keyword);
    this.travelInsertRows(ast.src.values);
  }
  if (ast.duplicateAssignments) {
    this.appendKeyword('ON');
    this.appendKeyword('DUPLICATE');
    this.appendKeyword('KEY');
    this.appendKeyword('UPDATE');
    this.travelAssignments(ast.duplicateAssignments);
  }
}
Sql.prototype.travelInsertRows = function(ast) {
  for (var i = 0; i < ast.value.length; i++) {
    var x = ast.value[i];
    this.travel('(');
    this.travelValueList(x.value);
    this.travel(')');

    if (i !== ast.value.length - 1) {
      this.append(',', true);
    }
  }
}
Sql.prototype.travelValueList = function(ast) {
  for (var i = 0; i < ast.length; i++) {
    var x = ast[i];
    this.travel(x);

    if (i !== ast.length - 1) {
      this.append(',', true);
    }
  }
}
Sql.prototype.travelUpdate = function(ast) {
  this.appendKeyword('update', true);
  if (ast.lowPriority) {
    this.appendKeyword('low_priority');
  }
  if (ast.ignore) {
    this.appendKeyword('ignore');
  }
  this.travelTableRefrences(ast.tables);
  this.appendKeyword('set');
  this.travelAssignments(ast.assignments);
  if (ast.where) {
    this.appendKeyword('where');
    this.travel(ast.where);
  }
  if (ast.orderBy) {
    this.travel(ast.orderBy);
  }
  if (ast.limit) {
    this.travel(ast.limit);
  }
}
Sql.prototype.travelAssignments = function(ast) {
  for (var i = 0; i < ast.value.length; i++) {
    var x = ast.value[i];
    this.travel(x.left);
    this.travel('=');
    this.travel(x.right);

    if (i !== ast.value.length - 1) {
      this.append(',', true);
    }
  }
}
Sql.prototype.travelSelectExpr = function (ast) {
  var exprList = ast.value;
  for (var i = 0; i < exprList.length; i++) {
    if (typeof ast === 'string') {
      this.append(exprList[i]);
    } else {
      this.travel(exprList[i]);
      if (ast.alias) {
        if (ast.hasAs) {
          this.appendKeyword('as');
        }
        this.travel(ast.alias);
      }
    }
    if (i !== exprList.length - 1) {
      this.append(',', true);
    }
  }
}
Sql.prototype.travelIsExpression = function (ast) {
  this.travel(ast.left);
  this.appendKeyword('in');
  if (ast.hasNot) {
    this.appendKeyword('not');
  }
  this.append(ast.right);
}
Sql.prototype.travelNotExpression = function (ast) {
  this.appendKeyword('not');
  this.travel(ast.value);
}
Sql.prototype.travelOrExpression =
Sql.prototype.travelAndExpression =
Sql.prototype.travelXORExpression = function (ast) {
  this.travel(ast.left);
  this.appendKeyword(ast.operator);
  this.travel(ast.right);
}
Sql.prototype.travelNull =
Sql.prototype.travelBoolean =
Sql.prototype.travelBooleanExtra = function (ast) {
  this.appendKeyword(ast.value);
}
Sql.prototype.travelNumber = function (ast) {
  this.append(ast.value);
}
Sql.prototype.travelString = function (ast) {
  this.append(ast.value);
}
Sql.prototype.travelFunctionCall = function (ast) {
  this.append(ast.name);
  this.append('(', true, true);
  var params = ast.params;
  for (var i = 0; i < params.length; i++) {
    var param = params[i];
    this.travel(param);
    if (i !== params.length -1) {
      this.append(',', true);
    }
  }
  this.append(')', true);
}
Sql.prototype.travelFunctionCallParam = function (ast) {
  if (ast.distinctOpt) {
    this.appendKeyword(ast.distinctOpt);
  }
  this.travel(ast.value);
}
Sql.prototype.travelIdentifier = function (ast) {
  this.append(ast.value);
}
Sql.prototype.travelIdentifierList = function (ast) {
  var list = ast.value;
  for (var i = 0; i < list.length; i++) {
    this.travel(list[i]);
    if (i !== list.length -1) {
      this.append(',', true);
    }
  }
}
Sql.prototype.travelWhenThenList = function (ast) {
  var list = ast.value;
  for (var i = 0; i < list.length; i++) {
    this.appendKeyword('when');
    this.travel(list[i].when);
    this.appendKeyword('then');
    this.travel(list[i].then);
  }
}
Sql.prototype.travelCaseWhen = function (ast) {
  this.appendKeyword('case');
  if (ast.caseExprOpt) {
    this.travel(ast.caseExprOpt);
  }
  this.travel(ast.whenThenList);
  if (ast.else) {
    this.appendKeyword('else');
    this.travel(ast.else);
  }
  this.appendKeyword('end');
}
Sql.prototype.travelPrefix = function (ast) {
  this.appendKeyword(ast.prefix);
  this.travel(ast.value);
}
Sql.prototype.travelSimpleExprParentheses = function (ast) {
  if (ast.hasRow) {
    this.appendKeyword('row');
  }
  this.append('(', false, true);
  this.travel(ast.value);
  this.append(')', true);
}
Sql.prototype.travelSubQuery = function (ast) {
  if (ast.hasExists) {
    this.appendKeyword('exists');
  }
  this.append('(', false, true);
  this.travel(ast.value);
  this.append(')', true);
  if (ast.alias) {
    if (ast.hasAs) {
      this.appendKeyword('as');
    }
    this.travel(ast.alias);
  }
}
Sql.prototype.travelIdentifierExpr = function (ast) {
  this.append('{');
  this.travel(ast.identifier);
  this.travel(ast.value);
  this.append('}');
}
Sql.prototype.travelBitExpression = function (ast) {
  this.travel(ast.left);
  this.appendKeyword(ast.operator);
  this.travel(ast.right);
}
Sql.prototype.travelInSubQueryPredicate = function (ast) {
  this.travel(ast.left);
  if (ast.hasNot) {
    this.appendKeyword('not');
  }
  this.appendKeyword('in');
  this.append('(', false, true);
  this.travel(ast.right);
  this.append(')');
}
Sql.prototype.travelInExpressionListPredicate = function (ast) {
  this.travel(ast.left);
  if (ast.hasNot) {
    this.appendKeyword('not');
  }
  this.appendKeyword('in');
  this.append('(', false, true);
  this.travel(ast.right);
  this.append(')');
}
Sql.prototype.travelBetweenPredicate = function (ast) {
  this.travel(ast.left);
  if (ast.hasNot) {
    this.appendKeyword('not');
  }
  this.appendKeyword('between');
  this.travel(ast.right.left);
  this.appendKeyword('and');
  this.travel(ast.right.right);
}
Sql.prototype.travelSoundsLikePredicate = function (ast) {
  this.travel(ast.left);
  this.appendKeyword('sounds');
  this.appendKeyword('like');
  this.travel(ast.right);
}
Sql.prototype.travelLikePredicate = function (ast) {
  this.travel(ast.left);
  if (ast.hasNot) {
    this.appendKeyword('not');
  }
  this.appendKeyword('like');
  this.travel(ast.right);
  if (ast.escape) {
    this.appendKeyword('escape')
    this.travel(ast.escape);
  }
}
Sql.prototype.travelRegexpPredicate = function (ast) {
  this.travel(ast.left);
  if (ast.hasNot) {
    this.appendKeyword('not');
  }
  this.appendKeyword('regexp');
  this.travel(ast.right);
}
Sql.prototype.travelIsNullBooleanPrimary = function (ast) {
  this.travel(ast.value);
  this.appendKeyword('is');
  if (ast.hasNot) {
    this.appendKeyword('not');
  }
  this.appendKeyword('null');
}
Sql.prototype.travelComparisonBooleanPrimary = function (ast) {
  this.travel(ast.left);
  this.append(ast.operator);
  this.travel(ast.right);
}
Sql.prototype.travelComparisonSubQueryBooleanPrimary = function (ast) {
  this.travel(ast.left);
  this.append(ast.operator);
  this.appendKeyword(ast.subQueryOpt);
  this.append('(', false, true);
  this.travel(ast.right);
  this.append(')');
}
Sql.prototype.travelExpressionList = function (ast) {
  var list = ast.value;
  for (var i = 0; i < list.length; i++) {
    this.travel(list[i]);
    if (i !== list.length - 1) {
      this.append(',', true);
    }
  }
}
Sql.prototype.travelGroupBy = function (ast) {
  this.appendKeyword('group by');
  var list = ast.value;
  for (var i = 0; i < list.length; i++) {
    this.travel(list[i]);
    if (i !== list.length - 1) {
      this.append(',', true);
    }
  }
}
Sql.prototype.travelOrderBy = function (ast) {
  this.appendKeyword('order by');
  var list = ast.value;
  for (var i = 0; i < list.length; i++) {
    this.travel(list[i]);
    if (i !== list.length - 1) {
      this.append(',', true);
    }
  }
  if (ast.rollUp) {
    this.appendKeyword('with rollup');
  }
}
Sql.prototype.travelGroupByOrderByItem = function (ast) {
  this.travel(ast.value);
  if (ast.sortOpt) {
    this.appendKeyword(ast.sortOpt);
  }
}
Sql.prototype.travelLimit = function (ast) {
  this.appendKeyword('limit');
  var list = ast.value;
  if (list.length === 1) {
    this.append(list[0]);
  } else if (list.length === 2) {
    if (ast.offsetMode) {
      this.append(list[1]);
      this.append('offset');
      this.append(list[0]);
    } else {
      this.append(list[0]);
      this.append(',', true);
      this.append(list[1]);
    }
  }
}
Sql.prototype.travelTableRefrences = function (ast) {
  var list = ast.value;
  if (ast.TableRefrences) {
    this.append('(', false, true);
  }
  for (var i = 0; i < list.length; i++) {
    this.travel(list[i]);
    if (i !== list.length - 1) {
      this.append(',', true);
    }
  }
  if (ast.TableRefrences) {
    this.append(')');
  }
}
Sql.prototype.travelTableRefrence = function (ast) {
  if (ast.hasOj) {
    this.append('{');
    this.appendKeyword('oj');
    this.travel(ast.value);
    this.append('}');
  } else {
    this.travel(ast.value);
  }
}
Sql.prototype.travelInnerCrossJoinTable = function (ast) {
  this.travel(ast.left);
  if (ast.innerCrossOpt) {
    this.appendKeyword(ast.innerCrossOpt);
  }
  this.appendKeyword('join');
  this.travel(ast.right);
  if (ast.condition) {
    this.travel(ast.condition);
  }
}
Sql.prototype.travelStraightJoinTable = function (ast) {
  this.travel(ast.left);
  this.appendKeyword('straight_join');
  this.travel(ast.right);
  this.travel(ast.condition);
}
Sql.prototype.travelLeftRightJoinTable = function (ast) {
  this.travel(ast.left);
  this.appendKeyword(ast.leftRight);
  if (ast.outOpt) {
    this.appendKeyword(ast.outOpt);
  }
  this.appendKeyword('join');
  this.travel(ast.right);
  this.travel(ast.condition);
}
Sql.prototype.travelNaturalJoinTable = function (ast) {
  this.travel(ast.left);
  this.appendKeyword('natural');
  if (ast.leftRight) {
    this.appendKeyword(ast.leftRight);
  }
  if (ast.outOpt) {
    this.appendKeyword(ast.outOpt);
  }
  this.appendKeyword('join');
  this.travel(ast.right);
}
Sql.prototype.travelOnJoinCondition = function (ast) {
  this.appendKeyword('on');
  this.travel(ast.value);
}
Sql.prototype.travelUsingJoinCondition = function (ast) {
  this.appendKeyword('using');
  this.appendKeyword('(', false, true);
  this.travel(ast.value);
  this.appendKeyword(')');
}
Sql.prototype.travelPartitions = function (ast) {
  this.appendKeyword('partition');
  this.appendKeyword('(', false, true);
  var list = ast.value;
  for (var i = 0; i < list.length; i++) {
    this.travel(list[i]);
    if (i !== list.length - 1) {
      this.append(',', true);
    }
  }
  this.appendKeyword(')');
}
Sql.prototype.travelForOptIndexHint = function (ast) {
  this.appendKeyword('for');
  this.appendKeyword(ast.value);
}
Sql.prototype.travelIndexList = function (ast) {
  var list = ast.value;
  for (var i = 0; i < list.length; i++) {
    this.travel(list[i]);
    if (i !== list.length - 1) {
      this.append(',', true);
    }
  }
}
Sql.prototype.travelUseIndexHint = function (ast) {
  this.appendKeyword('use');
  this.appendKeyword(ast.indexOrKey);
  if (ast.forOpt) {
    this.travel(ast.forOpt);
  }
  this.appendKeyword('(', false, true);
  if (ast.value) {
    this.travel(ast.value);
  }
  this.appendKeyword(')');
}
Sql.prototype.travelIgnoreIndexHint = function (ast) {
  this.appendKeyword('ignore');
  this.appendKeyword(ast.indexOrKey);
  if (ast.forOpt) {
    this.travel(ast.forOpt);
  }
  this.appendKeyword('(', false, true);
  if (ast.value) {
    this.travel(ast.value);
  }
  this.appendKeyword(')');
}
Sql.prototype.travelForceIndexHint = function (ast) {
  this.appendKeyword('force');
  this.appendKeyword(ast.indexOrKey);
  if (ast.forOpt) {
    this.travel(ast.forOpt);
  }
  this.appendKeyword('(', false, true);
  if (ast.value) {
    this.travel(ast.value);
  }
  this.appendKeyword(')');
}
Sql.prototype.travelTableFactor = function (ast) {
  this.travel(ast.value);
  if (ast.partition) {
    this.travel(ast.partition);
  }
  if (ast.alias) {
    if (ast.hasAs) {
      this.appendKeyword('as');
    }
    this.travel(ast.alias);
  }
  if (ast.indexHintOpt) {
    this.travel(ast.indexHintOpt);
  }
}
