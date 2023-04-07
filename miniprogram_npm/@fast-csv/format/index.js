module.exports = (function() {
var __MODS__ = {};
var __DEFINE__ = function(modId, func, req) { var m = { exports: {}, _tempexports: {} }; __MODS__[modId] = { status: 0, func: func, req: req, m: m }; };
var __REQUIRE__ = function(modId, source) { if(!__MODS__[modId]) return require(source); if(!__MODS__[modId].status) { var m = __MODS__[modId].m; m._exports = m._tempexports; var desp = Object.getOwnPropertyDescriptor(m, "exports"); if (desp && desp.configurable) Object.defineProperty(m, "exports", { set: function (val) { if(typeof val === "object" && val !== m._exports) { m._exports.__proto__ = val.__proto__; Object.keys(val).forEach(function (k) { m._exports[k] = val[k]; }); } m._tempexports = val }, get: function () { return m._tempexports; } }); __MODS__[modId].status = 1; __MODS__[modId].func(__MODS__[modId].req, m, m.exports); } return __MODS__[modId].m.exports; };
var __REQUIRE_WILDCARD__ = function(obj) { if(obj && obj.__esModule) { return obj; } else { var newObj = {}; if(obj != null) { for(var k in obj) { if (Object.prototype.hasOwnProperty.call(obj, k)) newObj[k] = obj[k]; } } newObj.default = obj; return newObj; } };
var __REQUIRE_DEFAULT__ = function(obj) { return obj && obj.__esModule ? obj.default : obj; };
__DEFINE__(1676879951187, function(require, module, exports) {

var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    Object.defineProperty(o, k2, { enumerable: true, get: function() { return m[k]; } });
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __importStar = (this && this.__importStar) || function (mod) {
    if (mod && mod.__esModule) return mod;
    var result = {};
    if (mod != null) for (var k in mod) if (k !== "default" && Object.prototype.hasOwnProperty.call(mod, k)) __createBinding(result, mod, k);
    __setModuleDefault(result, mod);
    return result;
};
var __exportStar = (this && this.__exportStar) || function(m, exports) {
    for (var p in m) if (p !== "default" && !Object.prototype.hasOwnProperty.call(exports, p)) __createBinding(exports, m, p);
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.writeToPath = exports.writeToString = exports.writeToBuffer = exports.writeToStream = exports.write = exports.format = exports.FormatterOptions = exports.CsvFormatterStream = void 0;
const util_1 = require("util");
const stream_1 = require("stream");
const fs = __importStar(require("fs"));
const FormatterOptions_1 = require("./FormatterOptions");
const CsvFormatterStream_1 = require("./CsvFormatterStream");
__exportStar(require("./types"), exports);
var CsvFormatterStream_2 = require("./CsvFormatterStream");
Object.defineProperty(exports, "CsvFormatterStream", { enumerable: true, get: function () { return CsvFormatterStream_2.CsvFormatterStream; } });
var FormatterOptions_2 = require("./FormatterOptions");
Object.defineProperty(exports, "FormatterOptions", { enumerable: true, get: function () { return FormatterOptions_2.FormatterOptions; } });
exports.format = (options) => new CsvFormatterStream_1.CsvFormatterStream(new FormatterOptions_1.FormatterOptions(options));
exports.write = (rows, options) => {
    const csvStream = exports.format(options);
    const promiseWrite = util_1.promisify((row, cb) => {
        csvStream.write(row, undefined, cb);
    });
    rows.reduce((prev, row) => prev.then(() => promiseWrite(row)), Promise.resolve())
        .then(() => csvStream.end())
        .catch((err) => {
        csvStream.emit('error', err);
    });
    return csvStream;
};
exports.writeToStream = (ws, rows, options) => exports.write(rows, options).pipe(ws);
exports.writeToBuffer = (rows, opts = {}) => {
    const buffers = [];
    const ws = new stream_1.Writable({
        write(data, enc, writeCb) {
            buffers.push(data);
            writeCb();
        },
    });
    return new Promise((res, rej) => {
        ws.on('error', rej).on('finish', () => res(Buffer.concat(buffers)));
        exports.write(rows, opts).pipe(ws);
    });
};
exports.writeToString = (rows, options) => exports.writeToBuffer(rows, options).then((buffer) => buffer.toString());
exports.writeToPath = (path, rows, options) => {
    const stream = fs.createWriteStream(path, { encoding: 'utf8' });
    return exports.write(rows, options).pipe(stream);
};
//# sourceMappingURL=index.js.map
}, function(modId) {var map = {"./FormatterOptions":1676879951188,"./CsvFormatterStream":1676879951189,"./types":1676879951193}; return __REQUIRE__(map[modId], modId); })
__DEFINE__(1676879951188, function(require, module, exports) {

Object.defineProperty(exports, "__esModule", { value: true });
exports.FormatterOptions = void 0;
class FormatterOptions {
    constructor(opts = {}) {
        var _a;
        this.objectMode = true;
        this.delimiter = ',';
        this.rowDelimiter = '\n';
        this.quote = '"';
        this.escape = this.quote;
        this.quoteColumns = false;
        this.quoteHeaders = this.quoteColumns;
        this.headers = null;
        this.includeEndRowDelimiter = false;
        this.writeBOM = false;
        this.BOM = '\ufeff';
        this.alwaysWriteHeaders = false;
        Object.assign(this, opts || {});
        if (typeof (opts === null || opts === void 0 ? void 0 : opts.quoteHeaders) === 'undefined') {
            this.quoteHeaders = this.quoteColumns;
        }
        if ((opts === null || opts === void 0 ? void 0 : opts.quote) === true) {
            this.quote = '"';
        }
        else if ((opts === null || opts === void 0 ? void 0 : opts.quote) === false) {
            this.quote = '';
        }
        if (typeof (opts === null || opts === void 0 ? void 0 : opts.escape) !== 'string') {
            this.escape = this.quote;
        }
        this.shouldWriteHeaders = !!this.headers && ((_a = opts.writeHeaders) !== null && _a !== void 0 ? _a : true);
        this.headers = Array.isArray(this.headers) ? this.headers : null;
        this.escapedQuote = `${this.escape}${this.quote}`;
    }
}
exports.FormatterOptions = FormatterOptions;
//# sourceMappingURL=FormatterOptions.js.map
}, function(modId) { var map = {}; return __REQUIRE__(map[modId], modId); })
__DEFINE__(1676879951189, function(require, module, exports) {

Object.defineProperty(exports, "__esModule", { value: true });
exports.CsvFormatterStream = void 0;
const stream_1 = require("stream");
const formatter_1 = require("./formatter");
class CsvFormatterStream extends stream_1.Transform {
    constructor(formatterOptions) {
        super({ writableObjectMode: formatterOptions.objectMode });
        this.hasWrittenBOM = false;
        this.formatterOptions = formatterOptions;
        this.rowFormatter = new formatter_1.RowFormatter(formatterOptions);
        // if writeBOM is false then set to true
        // if writeBOM is true then set to false by default so it is written out
        this.hasWrittenBOM = !formatterOptions.writeBOM;
    }
    transform(transformFunction) {
        this.rowFormatter.rowTransform = transformFunction;
        return this;
    }
    _transform(row, encoding, cb) {
        let cbCalled = false;
        try {
            if (!this.hasWrittenBOM) {
                this.push(this.formatterOptions.BOM);
                this.hasWrittenBOM = true;
            }
            this.rowFormatter.format(row, (err, rows) => {
                if (err) {
                    cbCalled = true;
                    return cb(err);
                }
                if (rows) {
                    rows.forEach((r) => {
                        this.push(Buffer.from(r, 'utf8'));
                    });
                }
                cbCalled = true;
                return cb();
            });
        }
        catch (e) {
            if (cbCalled) {
                throw e;
            }
            cb(e);
        }
    }
    _flush(cb) {
        this.rowFormatter.finish((err, rows) => {
            if (err) {
                return cb(err);
            }
            if (rows) {
                rows.forEach((r) => {
                    this.push(Buffer.from(r, 'utf8'));
                });
            }
            return cb();
        });
    }
}
exports.CsvFormatterStream = CsvFormatterStream;
//# sourceMappingURL=CsvFormatterStream.js.map
}, function(modId) { var map = {"./formatter":1676879951190}; return __REQUIRE__(map[modId], modId); })
__DEFINE__(1676879951190, function(require, module, exports) {

Object.defineProperty(exports, "__esModule", { value: true });
exports.FieldFormatter = exports.RowFormatter = void 0;
var RowFormatter_1 = require("./RowFormatter");
Object.defineProperty(exports, "RowFormatter", { enumerable: true, get: function () { return RowFormatter_1.RowFormatter; } });
var FieldFormatter_1 = require("./FieldFormatter");
Object.defineProperty(exports, "FieldFormatter", { enumerable: true, get: function () { return FieldFormatter_1.FieldFormatter; } });
//# sourceMappingURL=index.js.map
}, function(modId) { var map = {"./RowFormatter":1676879951191,"./FieldFormatter":1676879951192}; return __REQUIRE__(map[modId], modId); })
__DEFINE__(1676879951191, function(require, module, exports) {

var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.RowFormatter = void 0;
const lodash_isfunction_1 = __importDefault(require("lodash.isfunction"));
const lodash_isequal_1 = __importDefault(require("lodash.isequal"));
const FieldFormatter_1 = require("./FieldFormatter");
const types_1 = require("../types");
class RowFormatter {
    constructor(formatterOptions) {
        this.rowCount = 0;
        this.formatterOptions = formatterOptions;
        this.fieldFormatter = new FieldFormatter_1.FieldFormatter(formatterOptions);
        this.headers = formatterOptions.headers;
        this.shouldWriteHeaders = formatterOptions.shouldWriteHeaders;
        this.hasWrittenHeaders = false;
        if (this.headers !== null) {
            this.fieldFormatter.headers = this.headers;
        }
        if (formatterOptions.transform) {
            this.rowTransform = formatterOptions.transform;
        }
    }
    static isRowHashArray(row) {
        if (Array.isArray(row)) {
            return Array.isArray(row[0]) && row[0].length === 2;
        }
        return false;
    }
    static isRowArray(row) {
        return Array.isArray(row) && !this.isRowHashArray(row);
    }
    // get headers from a row item
    static gatherHeaders(row) {
        if (RowFormatter.isRowHashArray(row)) {
            // lets assume a multi-dimesional array with item 0 being the header
            return row.map((it) => it[0]);
        }
        if (Array.isArray(row)) {
            return row;
        }
        return Object.keys(row);
    }
    // eslint-disable-next-line @typescript-eslint/no-shadow
    static createTransform(transformFunction) {
        if (types_1.isSyncTransform(transformFunction)) {
            return (row, cb) => {
                let transformedRow = null;
                try {
                    transformedRow = transformFunction(row);
                }
                catch (e) {
                    return cb(e);
                }
                return cb(null, transformedRow);
            };
        }
        return (row, cb) => {
            transformFunction(row, cb);
        };
    }
    set rowTransform(transformFunction) {
        if (!lodash_isfunction_1.default(transformFunction)) {
            throw new TypeError('The transform should be a function');
        }
        this._rowTransform = RowFormatter.createTransform(transformFunction);
    }
    format(row, cb) {
        this.callTransformer(row, (err, transformedRow) => {
            if (err) {
                return cb(err);
            }
            if (!row) {
                return cb(null);
            }
            const rows = [];
            if (transformedRow) {
                const { shouldFormatColumns, headers } = this.checkHeaders(transformedRow);
                if (this.shouldWriteHeaders && headers && !this.hasWrittenHeaders) {
                    rows.push(this.formatColumns(headers, true));
                    this.hasWrittenHeaders = true;
                }
                if (shouldFormatColumns) {
                    const columns = this.gatherColumns(transformedRow);
                    rows.push(this.formatColumns(columns, false));
                }
            }
            return cb(null, rows);
        });
    }
    finish(cb) {
        const rows = [];
        // check if we should write headers and we didnt get any rows
        if (this.formatterOptions.alwaysWriteHeaders && this.rowCount === 0) {
            if (!this.headers) {
                return cb(new Error('`alwaysWriteHeaders` option is set to true but `headers` option not provided.'));
            }
            rows.push(this.formatColumns(this.headers, true));
        }
        if (this.formatterOptions.includeEndRowDelimiter) {
            rows.push(this.formatterOptions.rowDelimiter);
        }
        return cb(null, rows);
    }
    // check if we need to write header return true if we should also write a row
    // could be false if headers is true and the header row(first item) is passed in
    checkHeaders(row) {
        if (this.headers) {
            // either the headers were provided by the user or we have already gathered them.
            return { shouldFormatColumns: true, headers: this.headers };
        }
        const headers = RowFormatter.gatherHeaders(row);
        this.headers = headers;
        this.fieldFormatter.headers = headers;
        if (!this.shouldWriteHeaders) {
            // if we are not supposed to write the headers then
            // always format the columns
            return { shouldFormatColumns: true, headers: null };
        }
        // if the row is equal to headers dont format
        return { shouldFormatColumns: !lodash_isequal_1.default(headers, row), headers };
    }
    // todo change this method to unknown[]
    gatherColumns(row) {
        if (this.headers === null) {
            throw new Error('Headers is currently null');
        }
        if (!Array.isArray(row)) {
            return this.headers.map((header) => row[header]);
        }
        if (RowFormatter.isRowHashArray(row)) {
            return this.headers.map((header, i) => {
                const col = row[i];
                if (col) {
                    return col[1];
                }
                return '';
            });
        }
        // if its a one dimensional array and headers were not provided
        // then just return the row
        if (RowFormatter.isRowArray(row) && !this.shouldWriteHeaders) {
            return row;
        }
        return this.headers.map((header, i) => row[i]);
    }
    callTransformer(row, cb) {
        if (!this._rowTransform) {
            return cb(null, row);
        }
        return this._rowTransform(row, cb);
    }
    formatColumns(columns, isHeadersRow) {
        const formattedCols = columns
            .map((field, i) => this.fieldFormatter.format(field, i, isHeadersRow))
            .join(this.formatterOptions.delimiter);
        const { rowCount } = this;
        this.rowCount += 1;
        if (rowCount) {
            return [this.formatterOptions.rowDelimiter, formattedCols].join('');
        }
        return formattedCols;
    }
}
exports.RowFormatter = RowFormatter;
//# sourceMappingURL=RowFormatter.js.map
}, function(modId) { var map = {"./FieldFormatter":1676879951192,"../types":1676879951193}; return __REQUIRE__(map[modId], modId); })
__DEFINE__(1676879951192, function(require, module, exports) {

var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.FieldFormatter = void 0;
const lodash_isboolean_1 = __importDefault(require("lodash.isboolean"));
const lodash_isnil_1 = __importDefault(require("lodash.isnil"));
const lodash_escaperegexp_1 = __importDefault(require("lodash.escaperegexp"));
class FieldFormatter {
    constructor(formatterOptions) {
        this._headers = null;
        this.formatterOptions = formatterOptions;
        if (formatterOptions.headers !== null) {
            this.headers = formatterOptions.headers;
        }
        this.REPLACE_REGEXP = new RegExp(formatterOptions.quote, 'g');
        const escapePattern = `[${formatterOptions.delimiter}${lodash_escaperegexp_1.default(formatterOptions.rowDelimiter)}|\r|\n]`;
        this.ESCAPE_REGEXP = new RegExp(escapePattern);
    }
    set headers(headers) {
        this._headers = headers;
    }
    shouldQuote(fieldIndex, isHeader) {
        const quoteConfig = isHeader ? this.formatterOptions.quoteHeaders : this.formatterOptions.quoteColumns;
        if (lodash_isboolean_1.default(quoteConfig)) {
            return quoteConfig;
        }
        if (Array.isArray(quoteConfig)) {
            return quoteConfig[fieldIndex];
        }
        if (this._headers !== null) {
            return quoteConfig[this._headers[fieldIndex]];
        }
        return false;
    }
    format(field, fieldIndex, isHeader) {
        const preparedField = `${lodash_isnil_1.default(field) ? '' : field}`.replace(/\0/g, '');
        const { formatterOptions } = this;
        if (formatterOptions.quote !== '') {
            const shouldEscape = preparedField.indexOf(formatterOptions.quote) !== -1;
            if (shouldEscape) {
                return this.quoteField(preparedField.replace(this.REPLACE_REGEXP, formatterOptions.escapedQuote));
            }
        }
        const hasEscapeCharacters = preparedField.search(this.ESCAPE_REGEXP) !== -1;
        if (hasEscapeCharacters || this.shouldQuote(fieldIndex, isHeader)) {
            return this.quoteField(preparedField);
        }
        return preparedField;
    }
    quoteField(field) {
        const { quote } = this.formatterOptions;
        return `${quote}${field}${quote}`;
    }
}
exports.FieldFormatter = FieldFormatter;
//# sourceMappingURL=FieldFormatter.js.map
}, function(modId) { var map = {}; return __REQUIRE__(map[modId], modId); })
__DEFINE__(1676879951193, function(require, module, exports) {

/* eslint-disable @typescript-eslint/no-explicit-any */
Object.defineProperty(exports, "__esModule", { value: true });
exports.isSyncTransform = void 0;
exports.isSyncTransform = (transform) => transform.length === 1;
//# sourceMappingURL=types.js.map
}, function(modId) { var map = {}; return __REQUIRE__(map[modId], modId); })
return __REQUIRE__(1676879951187);
})()
//miniprogram-npm-outsideDeps=["util","stream","fs","lodash.isfunction","lodash.isequal","lodash.isboolean","lodash.isnil","lodash.escaperegexp"]
//# sourceMappingURL=index.js.map