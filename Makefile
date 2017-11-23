TEST = $(shell ls -S `find test -type f -name "*.test.js"`)

test:
	node --harmony ./node_modules/.bin/jison -m js ./src/sqlParser.jison  -o ./dist/parser/sqlParser.js
	cat src/stringify.js >> ./dist/parser/sqlParser.js
	cat src/suffix.js >> ./dist/parser/sqlParser.js
	./node_modules/mocha/bin/mocha $(TEST) --require babel-register
  
.PHONY: test

