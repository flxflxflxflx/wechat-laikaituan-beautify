module.exports = (function() {
var __MODS__ = {};
var __DEFINE__ = function(modId, func, req) { var m = { exports: {}, _tempexports: {} }; __MODS__[modId] = { status: 0, func: func, req: req, m: m }; };
var __REQUIRE__ = function(modId, source) { if(!__MODS__[modId]) return require(source); if(!__MODS__[modId].status) { var m = __MODS__[modId].m; m._exports = m._tempexports; var desp = Object.getOwnPropertyDescriptor(m, "exports"); if (desp && desp.configurable) Object.defineProperty(m, "exports", { set: function (val) { if(typeof val === "object" && val !== m._exports) { m._exports.__proto__ = val.__proto__; Object.keys(val).forEach(function (k) { m._exports[k] = val[k]; }); } m._tempexports = val }, get: function () { return m._tempexports; } }); __MODS__[modId].status = 1; __MODS__[modId].func(__MODS__[modId].req, m, m.exports); } return __MODS__[modId].m.exports; };
var __REQUIRE_WILDCARD__ = function(obj) { if(obj && obj.__esModule) { return obj; } else { var newObj = {}; if(obj != null) { for(var k in obj) { if (Object.prototype.hasOwnProperty.call(obj, k)) newObj[k] = obj[k]; } } newObj.default = obj; return newObj; } };
var __REQUIRE_DEFAULT__ = function(obj) { return obj && obj.__esModule ? obj.default : obj; };
__DEFINE__(1676879951464, function(require, module, exports) {

Object.defineProperty(exports, "__esModule", { value: true });
exports.CsvParserStream = exports.ParserOptions = exports.parseFile = exports.parseStream = exports.parseString = exports.parse = exports.FormatterOptions = exports.CsvFormatterStream = exports.writeToPath = exports.writeToString = exports.writeToBuffer = exports.writeToStream = exports.write = exports.format = void 0;
var format_1 = require("@fast-csv/format");
Object.defineProperty(exports, "format", { enumerable: true, get: function () { return format_1.format; } });
Object.defineProperty(exports, "write", { enumerable: true, get: function () { return format_1.write; } });
Object.defineProperty(exports, "writeToStream", { enumerable: true, get: function () { return format_1.writeToStream; } });
Object.defineProperty(exports, "writeToBuffer", { enumerable: true, get: function () { return format_1.writeToBuffer; } });
Object.defineProperty(exports, "writeToString", { enumerable: true, get: function () { return format_1.writeToString; } });
Object.defineProperty(exports, "writeToPath", { enumerable: true, get: function () { return format_1.writeToPath; } });
Object.defineProperty(exports, "CsvFormatterStream", { enumerable: true, get: function () { return format_1.CsvFormatterStream; } });
Object.defineProperty(exports, "FormatterOptions", { enumerable: true, get: function () { return format_1.FormatterOptions; } });
var parse_1 = require("@fast-csv/parse");
Object.defineProperty(exports, "parse", { enumerable: true, get: function () { return parse_1.parse; } });
Object.defineProperty(exports, "parseString", { enumerable: true, get: function () { return parse_1.parseString; } });
Object.defineProperty(exports, "parseStream", { enumerable: true, get: function () { return parse_1.parseStream; } });
Object.defineProperty(exports, "parseFile", { enumerable: true, get: function () { return parse_1.parseFile; } });
Object.defineProperty(exports, "ParserOptions", { enumerable: true, get: function () { return parse_1.ParserOptions; } });
Object.defineProperty(exports, "CsvParserStream", { enumerable: true, get: function () { return parse_1.CsvParserStream; } });
//# sourceMappingURL=index.js.map
}, function(modId) {var map = {}; return __REQUIRE__(map[modId], modId); })
return __REQUIRE__(1676879951464);
})()
//miniprogram-npm-outsideDeps=["@fast-csv/format","@fast-csv/parse"]
//# sourceMappingURL=index.js.map