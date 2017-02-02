var root = this
// AMD / RequireJS
if (typeof define !== 'undefined' && define.amd) {
    define([], function () {
        return sqlParser;
    });
}
// Node.js
else if (typeof module !== 'undefined' && module.exports) {
    module.exports = sqlParser;
}
// included directly via <script> tag
else {
    root.sqlParser = sqlParser;
}

