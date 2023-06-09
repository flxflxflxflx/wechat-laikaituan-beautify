module.exports = (function() {
var __MODS__ = {};
var __DEFINE__ = function(modId, func, req) { var m = { exports: {}, _tempexports: {} }; __MODS__[modId] = { status: 0, func: func, req: req, m: m }; };
var __REQUIRE__ = function(modId, source) { if(!__MODS__[modId]) return require(source); if(!__MODS__[modId].status) { var m = __MODS__[modId].m; m._exports = m._tempexports; var desp = Object.getOwnPropertyDescriptor(m, "exports"); if (desp && desp.configurable) Object.defineProperty(m, "exports", { set: function (val) { if(typeof val === "object" && val !== m._exports) { m._exports.__proto__ = val.__proto__; Object.keys(val).forEach(function (k) { m._exports[k] = val[k]; }); } m._tempexports = val }, get: function () { return m._tempexports; } }); __MODS__[modId].status = 1; __MODS__[modId].func(__MODS__[modId].req, m, m.exports); } return __MODS__[modId].m.exports; };
var __REQUIRE_WILDCARD__ = function(obj) { if(obj && obj.__esModule) { return obj; } else { var newObj = {}; if(obj != null) { for(var k in obj) { if (Object.prototype.hasOwnProperty.call(obj, k)) newObj[k] = obj[k]; } } newObj.default = obj; return newObj; } };
var __REQUIRE_DEFAULT__ = function(obj) { return obj && obj.__esModule ? obj.default : obj; };
__DEFINE__(1676879951665, function(require, module, exports) {

/**
 * Character classes for XML.
 *
 * @deprecated since 1.3.0. Import from the ``xml`` and ``xmlns`` hierarchies
 * instead.
 *
 * @author Louis-Dominique Dubeau
 * @license MIT
 * @copyright Louis-Dominique Dubeau
 */
Object.defineProperty(exports, "__esModule", { value: true });
var ed4 = require("./xml/1.0/ed4");
var ed5 = require("./xml/1.0/ed5");
var nsed3 = require("./xmlns/1.0/ed3");
// tslint:disable-next-line:no-console
console.warn("DEPRECATION WARNING: the xmlchar *module* is deprecated: please \
replace e.g. require('xmlchars') with require('xmlchars/xml/...')");
/**
 * Character class utilities for XML 1.0.
 */
// tslint:disable-next-line:no-namespace
var XML_1_0;
(function (XML_1_0) {
    /**
     * Fifth edition.
     */
    var ED5;
    (function (ED5) {
        /**
         * Regular expression fragments. These fragments are designed to be included
         * inside square brackets in a regular expression.
         */
        var fragments;
        (function (fragments) {
            fragments.CHAR = ed5.CHAR;
            fragments.S = ed5.S;
            fragments.NAME_START_CHAR = ed5.NAME_START_CHAR;
            fragments.NAME_CHAR = ed5.NAME_CHAR;
        })(fragments = ED5.fragments || (ED5.fragments = {}));
        /**
         * Regular expression. These correspond to the productions of the same name
         * in the specification.
         */
        var regexes;
        (function (regexes) {
            regexes.CHAR = ed5.CHAR_RE;
            regexes.S = ed5.S_RE;
            regexes.NAME_START_CHAR = ed5.NAME_START_CHAR_RE;
            regexes.NAME_CHAR = ed5.NAME_CHAR_RE;
            regexes.NAME = ed5.NAME_RE;
            regexes.NMTOKEN = ed5.NMTOKEN_RE;
        })(regexes = ED5.regexes || (ED5.regexes = {}));
        /**
         * Lists of characters.
         *
         * The names defined in this namespace are arrays of codepoints which
         * contain the set of codepoints that an XML production encompasses. Note
         * that many productions are too large to be reasonably represented as sets.
         */
        var lists;
        (function (lists) {
            lists.S = ed5.S_LIST;
        })(lists = ED5.lists || (ED5.lists = {}));
        /**
         * Determines whether a codepoint matches the ``CHAR`` production.
         *
         * @param c The code point.
         *
         * @returns ``true`` if the codepoint matches ``CHAR``.
         */
        ED5.isChar = ed5.isChar;
        /**
         * Determines whether a codepoint matches the ``S`` (space) production.
         *
         * @param c The code point.
         *
         * @returns ``true`` if the codepoint matches ``S``.
         */
        ED5.isS = ed5.isS;
        /**
         * Determines whether a codepoint matches the ``NAME_START_CHAR``
         * production.
         *
         * @param c The code point.
         *
         * @returns ``true`` if the codepoint matches ``NAME_START_CHAR``.
         */
        ED5.isNameStartChar = ed5.isNameStartChar;
        /**
         * Determines whether a codepoint matches the ``NAME_CHAR`` production.
         *
         * @param c The code point.
         *
         * @returns ``true`` if the codepoint matches ``NAME_CHAR``.
         */
        ED5.isNameChar = ed5.isNameChar;
    })(ED5 = XML_1_0.ED5 || (XML_1_0.ED5 = {}));
    /**
     * Fourth edition. These are deprecated in the 5th edition but some of the
     * standards related to XML 1.0 (e.g. XML Schema 1.0) refer to these. So they
     * are still generally useful.
     */
    var ED4;
    (function (ED4) {
        /**
         * Regular expression fragments. These fragments are designed to be included
         * inside square brackets in a regular expression.
         */
        var fragments;
        (function (fragments) {
            fragments.CHAR = ed4.CHAR;
            fragments.S = ed4.S;
            fragments.BASE_CHAR = ed4.BASE_CHAR;
            fragments.IDEOGRAPHIC = ed4.IDEOGRAPHIC;
            fragments.COMBINING_CHAR = ed4.COMBINING_CHAR;
            fragments.DIGIT = ed4.DIGIT;
            fragments.EXTENDER = ed4.EXTENDER;
            fragments.LETTER = ed4.LETTER;
            fragments.NAME_CHAR = ed4.NAME_CHAR;
        })(fragments = ED4.fragments || (ED4.fragments = {}));
        /**
         * Regular expression. These correspond to the productions of the same
         * name in the specification.
         */
        var regexes;
        (function (regexes) {
            regexes.CHAR = ed4.CHAR_RE;
            regexes.S = ed4.S_RE;
            regexes.BASE_CHAR = ed4.BASE_CHAR_RE;
            regexes.IDEOGRAPHIC = ed4.IDEOGRAPHIC_RE;
            regexes.COMBINING_CHAR = ed4.COMBINING_CHAR_RE;
            regexes.DIGIT = ed4.DIGIT_RE;
            regexes.EXTENDER = ed4.EXTENDER_RE;
            regexes.LETTER = ed4.LETTER_RE;
            regexes.NAME_CHAR = ed4.NAME_CHAR_RE;
            regexes.NAME = ed4.NAME_RE;
            regexes.NMTOKEN = ed4.NMTOKEN_RE;
        })(regexes = ED4.regexes || (ED4.regexes = {}));
    })(ED4 = XML_1_0.ED4 || (XML_1_0.ED4 = {}));
})(XML_1_0 = exports.XML_1_0 || (exports.XML_1_0 = {}));
/**
 * Character class utilities for XML NS 1.0.
 */
// tslint:disable-next-line:no-namespace
var XMLNS_1_0;
(function (XMLNS_1_0) {
    /**
     * Third edition.
     */
    var ED3;
    (function (ED3) {
        /**
         * Regular expression fragments. These fragments are designed to be included
         * inside square brackets in a regular expression.
         */
        var fragments;
        (function (fragments) {
            fragments.NC_NAME_START_CHAR = nsed3.NC_NAME_START_CHAR;
            fragments.NC_NAME_CHAR = nsed3.NC_NAME_CHAR;
        })(fragments = ED3.fragments || (ED3.fragments = {}));
        /**
         * Regular expression. These correspond to the productions of the same name
         * in the specification.
         */
        var regexes;
        (function (regexes) {
            regexes.NC_NAME_START_CHAR = nsed3.NC_NAME_START_CHAR_RE;
            regexes.NC_NAME_CHAR = nsed3.NC_NAME_CHAR_RE;
            regexes.NC_NAME = nsed3.NC_NAME_RE;
        })(regexes = ED3.regexes || (ED3.regexes = {}));
        /**
         * Determines whether a codepoint matches
         * [[regexes.NC_NAME_START_CHAR]].
         *
         * @param c The code point.
         *
         * @returns ``true`` if the codepoint matches.
         */
        ED3.isNCNameStartChar = nsed3.isNCNameStartChar;
        /**
         * Determines whether a codepoint matches [[regexes.NC_NAME_CHAR]].
         *
         * @param c The code point.
         *
         * @returns ``true`` if the codepoint matches.
         */
        ED3.isNCNameChar = nsed3.isNCNameChar;
    })(ED3 = XMLNS_1_0.ED3 || (XMLNS_1_0.ED3 = {}));
})(XMLNS_1_0 = exports.XMLNS_1_0 || (exports.XMLNS_1_0 = {}));
//# sourceMappingURL=xmlchars.js.map
}, function(modId) {var map = {"./xml/1.0/ed4":1676879951666,"./xml/1.0/ed5":1676879951667,"./xmlns/1.0/ed3":1676879951668}; return __REQUIRE__(map[modId], modId); })
__DEFINE__(1676879951666, function(require, module, exports) {

/**
 * Character classes and associated utilities for the 4th edition of XML 1.0.
 *
 * These are deprecated in the 5th edition but some of the standards related to
 * XML 1.0 (e.g. XML Schema 1.0) refer to these. So they are still generally
 * useful.
 *
 * @author Louis-Dominique Dubeau
 * @license MIT
 * @copyright Louis-Dominique Dubeau
 */
Object.defineProperty(exports, "__esModule", { value: true });
//
// Fragments.
//
exports.CHAR = "\t\n\r -\uD7FF\uE000-\uFFFD\uD800\uDC00-\uDBFF\uDFFF";
exports.S = " \t\r\n";
// tslint:disable-next-line:missing-jsdoc max-line-length
exports.BASE_CHAR = "A-Za-z\u00C0-\u00D6\u00D8-\u00F6\u00F8-\u00FF\u0100-\u0131\u0134-\u013E\u0141-\u0148\u014A-\u017E\u0180-\u01C3\u01CD-\u01F0\u01F4-\u01F5\u01FA-\u0217\u0250-\u02A8\u02BB-\u02C1\u0386\u0388-\u038A\u038C\u038E-\u03A1\u03A3-\u03CE\u03D0-\u03D6\u03DA\u03DC\u03DE\u03E0\u03E2-\u03F3\u0401-\u040C\u040E-\u044F\u0451-\u045C\u045E-\u0481\u0490-\u04C4\u04C7-\u04C8\u04CB-\u04CC\u04D0-\u04EB\u04EE-\u04F5\u04F8-\u04F9\u0531-\u0556\u0559\u0561-\u0586\u05D0-\u05EA\u05F0-\u05F2\u0621-\u063A\u0641-\u064A\u0671-\u06B7\u06BA-\u06BE\u06C0-\u06CE\u06D0-\u06D3\u06D5\u06E5-\u06E6\u0905-\u0939\u093D\u0958-\u0961\u0985-\u098C\u098F-\u0990\u0993-\u09A8\u09AA-\u09B0\u09B2\u09B6-\u09B9\u09DC-\u09DD\u09DF-\u09E1\u09F0-\u09F1\u0A05-\u0A0A\u0A0F-\u0A10\u0A13-\u0A28\u0A2A-\u0A30\u0A32-\u0A33\u0A35-\u0A36\u0A38-\u0A39\u0A59-\u0A5C\u0A5E\u0A72-\u0A74\u0A85-\u0A8B\u0A8D\u0A8F-\u0A91\u0A93-\u0AA8\u0AAA-\u0AB0\u0AB2-\u0AB3\u0AB5-\u0AB9\u0ABD\u0AE0\u0B05-\u0B0C\u0B0F-\u0B10\u0B13-\u0B28\u0B2A-\u0B30\u0B32-\u0B33\u0B36-\u0B39\u0B3D\u0B5C-\u0B5D\u0B5F-\u0B61\u0B85-\u0B8A\u0B8E-\u0B90\u0B92-\u0B95\u0B99-\u0B9A\u0B9C\u0B9E-\u0B9F\u0BA3-\u0BA4\u0BA8-\u0BAA\u0BAE-\u0BB5\u0BB7-\u0BB9\u0C05-\u0C0C\u0C0E-\u0C10\u0C12-\u0C28\u0C2A-\u0C33\u0C35-\u0C39\u0C60-\u0C61\u0C85-\u0C8C\u0C8E-\u0C90\u0C92-\u0CA8\u0CAA-\u0CB3\u0CB5-\u0CB9\u0CDE\u0CE0-\u0CE1\u0D05-\u0D0C\u0D0E-\u0D10\u0D12-\u0D28\u0D2A-\u0D39\u0D60-\u0D61\u0E01-\u0E2E\u0E30\u0E32-\u0E33\u0E40-\u0E45\u0E81-\u0E82\u0E84\u0E87-\u0E88\u0E8A\u0E8D\u0E94-\u0E97\u0E99-\u0E9F\u0EA1-\u0EA3\u0EA5\u0EA7\u0EAA-\u0EAB\u0EAD-\u0EAE\u0EB0\u0EB2-\u0EB3\u0EBD\u0EC0-\u0EC4\u0F40-\u0F47\u0F49-\u0F69\u10A0-\u10C5\u10D0-\u10F6\u1100\u1102-\u1103\u1105-\u1107\u1109\u110B-\u110C\u110E-\u1112\u113C\u113E\u1140\u114C\u114E\u1150\u1154-\u1155\u1159\u115F-\u1161\u1163\u1165\u1167\u1169\u116D-\u116E\u1172-\u1173\u1175\u119E\u11A8\u11AB\u11AE-\u11AF\u11B7-\u11B8\u11BA\u11BC-\u11C2\u11EB\u11F0\u11F9\u1E00-\u1E9B\u1EA0-\u1EF9\u1F00-\u1F15\u1F18-\u1F1D\u1F20-\u1F45\u1F48-\u1F4D\u1F50-\u1F57\u1F59\u1F5B\u1F5D\u1F5F-\u1F7D\u1F80-\u1FB4\u1FB6-\u1FBC\u1FBE\u1FC2-\u1FC4\u1FC6-\u1FCC\u1FD0-\u1FD3\u1FD6-\u1FDB\u1FE0-\u1FEC\u1FF2-\u1FF4\u1FF6-\u1FFC\u2126\u212A-\u212B\u212E\u2180-\u2182\u3041-\u3094\u30A1-\u30FA\u3105-\u312C\uAC00-\uD7A3";
exports.IDEOGRAPHIC = "\u4E00-\u9FA5\u3007\u3021-\u3029";
// tslint:disable-next-line:missing-jsdoc max-line-length
exports.COMBINING_CHAR = "\u0300-\u0345\u0360-\u0361\u0483-\u0486\u0591-\u05A1\u05A3-\u05B9\u05BB-\u05BD\u05BF\u05C1-\u05C2\u05C4\u064B-\u0652\u0670\u06D6-\u06DC\u06DD-\u06DF\u06E0-\u06E4\u06E7-\u06E8\u06EA-\u06ED\u0901-\u0903\u093C\u093E-\u094C\u094D\u0951-\u0954\u0962-\u0963\u0981-\u0983\u09BC\u09BE\u09BF\u09C0-\u09C4\u09C7-\u09C8\u09CB-\u09CD\u09D7\u09E2-\u09E3\u0A02\u0A3C\u0A3E\u0A3F\u0A40-\u0A42\u0A47-\u0A48\u0A4B-\u0A4D\u0A70-\u0A71\u0A81-\u0A83\u0ABC\u0ABE-\u0AC5\u0AC7-\u0AC9\u0ACB-\u0ACD\u0B01-\u0B03\u0B3C\u0B3E-\u0B43\u0B47-\u0B48\u0B4B-\u0B4D\u0B56-\u0B57\u0B82-\u0B83\u0BBE-\u0BC2\u0BC6-\u0BC8\u0BCA-\u0BCD\u0BD7\u0C01-\u0C03\u0C3E-\u0C44\u0C46-\u0C48\u0C4A-\u0C4D\u0C55-\u0C56\u0C82-\u0C83\u0CBE-\u0CC4\u0CC6-\u0CC8\u0CCA-\u0CCD\u0CD5-\u0CD6\u0D02-\u0D03\u0D3E-\u0D43\u0D46-\u0D48\u0D4A-\u0D4D\u0D57\u0E31\u0E34-\u0E3A\u0E47-\u0E4E\u0EB1\u0EB4-\u0EB9\u0EBB-\u0EBC\u0EC8-\u0ECD\u0F18-\u0F19\u0F35\u0F37\u0F39\u0F3E\u0F3F\u0F71-\u0F84\u0F86-\u0F8B\u0F90-\u0F95\u0F97\u0F99-\u0FAD\u0FB1-\u0FB7\u0FB9\u20D0-\u20DC\u20E1\u302A-\u302F\u3099\u309A";
// tslint:disable-next-line:missing-jsdoc max-line-length
exports.DIGIT = "0-9\u0660-\u0669\u06F0-\u06F9\u0966-\u096F\u09E6-\u09EF\u0A66-\u0A6F\u0AE6-\u0AEF\u0B66-\u0B6F\u0BE7-\u0BEF\u0C66-\u0C6F\u0CE6-\u0CEF\u0D66-\u0D6F\u0E50-\u0E59\u0ED0-\u0ED9\u0F20-\u0F29";
// tslint:disable-next-line:missing-jsdoc max-line-length
exports.EXTENDER = "\u00B7\u02D0\u02D1\u0387\u0640\u0E46\u0EC6\u3005\u3031-\u3035\u309D-\u309E\u30FC-\u30FE";
exports.LETTER = exports.BASE_CHAR + exports.IDEOGRAPHIC;
exports.NAME_CHAR = "-" + exports.LETTER + exports.DIGIT + "._:" + exports.COMBINING_CHAR + exports.EXTENDER;
//
// Regular expressions.
//
exports.CHAR_RE = new RegExp("^[" + exports.CHAR + "]$", "u");
exports.S_RE = new RegExp("^[" + exports.S + "]+$", "u");
exports.BASE_CHAR_RE = new RegExp("^[" + exports.BASE_CHAR + "]$", "u");
exports.IDEOGRAPHIC_RE = new RegExp("^[" + exports.IDEOGRAPHIC + "]$", "u");
exports.COMBINING_CHAR_RE = new RegExp("^[" + exports.COMBINING_CHAR + "]$", "u");
exports.DIGIT_RE = new RegExp("^[" + exports.DIGIT + "]$", "u");
exports.EXTENDER_RE = new RegExp("^[" + exports.EXTENDER + "]$", "u");
exports.LETTER_RE = new RegExp("^[" + exports.LETTER + "]$", "u");
exports.NAME_CHAR_RE = new RegExp("^[" + exports.NAME_CHAR + "]$", "u");
exports.NAME_RE = new RegExp("^[" + exports.LETTER + "_:][" + exports.NAME_CHAR + "]*$", "u");
exports.NMTOKEN_RE = new RegExp("^[" + exports.NAME_CHAR + "]+$", "u");
//# sourceMappingURL=ed4.js.map
}, function(modId) { var map = {}; return __REQUIRE__(map[modId], modId); })
__DEFINE__(1676879951667, function(require, module, exports) {

/**
 * Character classes and associated utilities for the 5th edition of XML 1.0.
 *
 * @author Louis-Dominique Dubeau
 * @license MIT
 * @copyright Louis-Dominique Dubeau
 */
Object.defineProperty(exports, "__esModule", { value: true });
//
// Fragments.
//
exports.CHAR = "\t\n\r -\uD7FF\uE000-\uFFFD\uD800\uDC00-\uDBFF\uDFFF";
exports.S = " \t\r\n";
// tslint:disable-next-line:max-line-length
exports.NAME_START_CHAR = ":A-Z_a-z\u00C0-\u00D6\u00D8-\u00F6\u00F8-\u02FF\u0370-\u037D\u037F-\u1FFF\u200C\u200D\u2070-\u218F\u2C00-\u2FEF\u3001-\uD7FF\uF900-\uFDCF\uFDF0-\uFFFD\uD800\uDC00-\uDB7F\uDFFF";
exports.NAME_CHAR = "-" + exports.NAME_START_CHAR + ".0-9\u00B7\u0300-\u036F\u203F-\u2040";
//
// Regular expressions.
//
exports.CHAR_RE = new RegExp("^[" + exports.CHAR + "]$", "u");
exports.S_RE = new RegExp("^[" + exports.S + "]+$", "u");
exports.NAME_START_CHAR_RE = new RegExp("^[" + exports.NAME_START_CHAR + "]$", "u");
exports.NAME_CHAR_RE = new RegExp("^[" + exports.NAME_CHAR + "]$", "u");
exports.NAME_RE = new RegExp("^[" + exports.NAME_START_CHAR + "][" + exports.NAME_CHAR + "]*$", "u");
exports.NMTOKEN_RE = new RegExp("^[" + exports.NAME_CHAR + "]+$", "u");
var TAB = 9;
var NL = 0xA;
var CR = 0xD;
var SPACE = 0x20;
//
// Lists.
//
/** All characters in the ``S`` production. */
exports.S_LIST = [SPACE, NL, CR, TAB];
/**
 * Determines whether a codepoint matches the ``CHAR`` production.
 *
 * @param c The code point.
 *
 * @returns ``true`` if the codepoint matches ``CHAR``.
 */
function isChar(c) {
    return (c >= SPACE && c <= 0xD7FF) ||
        c === NL || c === CR || c === TAB ||
        (c >= 0xE000 && c <= 0xFFFD) ||
        (c >= 0x10000 && c <= 0x10FFFF);
}
exports.isChar = isChar;
/**
 * Determines whether a codepoint matches the ``S`` (space) production.
 *
 * @param c The code point.
 *
 * @returns ``true`` if the codepoint matches ``S``.
 */
function isS(c) {
    return c === SPACE || c === NL || c === CR || c === TAB;
}
exports.isS = isS;
/**
 * Determines whether a codepoint matches the ``NAME_START_CHAR`` production.
 *
 * @param c The code point.
 *
 * @returns ``true`` if the codepoint matches ``NAME_START_CHAR``.
 */
function isNameStartChar(c) {
    return ((c >= 0x41 && c <= 0x5A) ||
        (c >= 0x61 && c <= 0x7A) ||
        c === 0x3A ||
        c === 0x5F ||
        c === 0x200C ||
        c === 0x200D ||
        (c >= 0xC0 && c <= 0xD6) ||
        (c >= 0xD8 && c <= 0xF6) ||
        (c >= 0x00F8 && c <= 0x02FF) ||
        (c >= 0x0370 && c <= 0x037D) ||
        (c >= 0x037F && c <= 0x1FFF) ||
        (c >= 0x2070 && c <= 0x218F) ||
        (c >= 0x2C00 && c <= 0x2FEF) ||
        (c >= 0x3001 && c <= 0xD7FF) ||
        (c >= 0xF900 && c <= 0xFDCF) ||
        (c >= 0xFDF0 && c <= 0xFFFD) ||
        (c >= 0x10000 && c <= 0xEFFFF));
}
exports.isNameStartChar = isNameStartChar;
/**
 * Determines whether a codepoint matches the ``NAME_CHAR`` production.
 *
 * @param c The code point.
 *
 * @returns ``true`` if the codepoint matches ``NAME_CHAR``.
 */
function isNameChar(c) {
    return isNameStartChar(c) ||
        (c >= 0x30 && c <= 0x39) ||
        c === 0x2D ||
        c === 0x2E ||
        c === 0xB7 ||
        (c >= 0x0300 && c <= 0x036F) ||
        (c >= 0x203F && c <= 0x2040);
}
exports.isNameChar = isNameChar;
//# sourceMappingURL=ed5.js.map
}, function(modId) { var map = {}; return __REQUIRE__(map[modId], modId); })
__DEFINE__(1676879951668, function(require, module, exports) {

/**
 * Character class utilities for XML NS 1.0 edition 3.
 *
 * @author Louis-Dominique Dubeau
 * @license MIT
 * @copyright Louis-Dominique Dubeau
 */
Object.defineProperty(exports, "__esModule", { value: true });
//
// Fragments.
//
// tslint:disable-next-line:max-line-length
exports.NC_NAME_START_CHAR = "A-Z_a-z\u00C0-\u00D6\u00D8-\u00F6\u00F8-\u02FF\u0370-\u037D\u037F-\u1FFF\u200C-\u200D\u2070-\u218F\u2C00-\u2FEF\u3001-\uD7FF\uF900-\uFDCF\uFDF0-\uFFFD\uD800\uDC00-\uDB7F\uDFFF";
exports.NC_NAME_CHAR = "-" + exports.NC_NAME_START_CHAR + ".0-9\u00B7\u0300-\u036F\u203F-\u2040";
//
// Regular expressions.
//
exports.NC_NAME_START_CHAR_RE = new RegExp("^[" + exports.NC_NAME_START_CHAR + "]$", "u");
exports.NC_NAME_CHAR_RE = new RegExp("^[" + exports.NC_NAME_CHAR + "]$", "u");
exports.NC_NAME_RE = new RegExp("^[" + exports.NC_NAME_START_CHAR + "][" + exports.NC_NAME_CHAR + "]*$", "u");
/**
 * Determines whether a codepoint matches [[NC_NAME_START_CHAR]].
 *
 * @param c The code point.
 *
 * @returns ``true`` if the codepoint matches.
 */
// tslint:disable-next-line:cyclomatic-complexity
function isNCNameStartChar(c) {
    return ((c >= 0x41 && c <= 0x5A) ||
        c === 0x5F ||
        (c >= 0x61 && c <= 0x7A) ||
        (c >= 0xC0 && c <= 0xD6) ||
        (c >= 0xD8 && c <= 0xF6) ||
        (c >= 0x00F8 && c <= 0x02FF) ||
        (c >= 0x0370 && c <= 0x037D) ||
        (c >= 0x037F && c <= 0x1FFF) ||
        (c >= 0x200C && c <= 0x200D) ||
        (c >= 0x2070 && c <= 0x218F) ||
        (c >= 0x2C00 && c <= 0x2FEF) ||
        (c >= 0x3001 && c <= 0xD7FF) ||
        (c >= 0xF900 && c <= 0xFDCF) ||
        (c >= 0xFDF0 && c <= 0xFFFD) ||
        (c >= 0x10000 && c <= 0xEFFFF));
}
exports.isNCNameStartChar = isNCNameStartChar;
/**
 * Determines whether a codepoint matches [[NC_NAME_CHAR]].
 *
 * @param c The code point.
 *
 * @returns ``true`` if the codepoint matches.
 */
function isNCNameChar(c) {
    return isNCNameStartChar(c) ||
        (c === 0x2D ||
            c === 0x2E ||
            (c >= 0x30 && c <= 0x39) ||
            c === 0x00B7 ||
            (c >= 0x0300 && c <= 0x036F) ||
            (c >= 0x203F && c <= 0x2040));
}
exports.isNCNameChar = isNCNameChar;
//# sourceMappingURL=ed3.js.map
}, function(modId) { var map = {}; return __REQUIRE__(map[modId], modId); })
return __REQUIRE__(1676879951665);
})()
//miniprogram-npm-outsideDeps=[]
//# sourceMappingURL=index.js.map