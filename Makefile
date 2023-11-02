publish: test
	@npm publish

test:
	@npm test

test-with-log:
	@DEBUG=js-sql-parser npm test

.PHONY: publish test
