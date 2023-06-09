module.exports = (function() {
var __MODS__ = {};
var __DEFINE__ = function(modId, func, req) { var m = { exports: {}, _tempexports: {} }; __MODS__[modId] = { status: 0, func: func, req: req, m: m }; };
var __REQUIRE__ = function(modId, source) { if(!__MODS__[modId]) return require(source); if(!__MODS__[modId].status) { var m = __MODS__[modId].m; m._exports = m._tempexports; var desp = Object.getOwnPropertyDescriptor(m, "exports"); if (desp && desp.configurable) Object.defineProperty(m, "exports", { set: function (val) { if(typeof val === "object" && val !== m._exports) { m._exports.__proto__ = val.__proto__; Object.keys(val).forEach(function (k) { m._exports[k] = val[k]; }); } m._tempexports = val }, get: function () { return m._tempexports; } }); __MODS__[modId].status = 1; __MODS__[modId].func(__MODS__[modId].req, m, m.exports); } return __MODS__[modId].m.exports; };
var __REQUIRE_WILDCARD__ = function(obj) { if(obj && obj.__esModule) { return obj; } else { var newObj = {}; if(obj != null) { for(var k in obj) { if (Object.prototype.hasOwnProperty.call(obj, k)) newObj[k] = obj[k]; } } newObj.default = obj; return newObj; } };
var __REQUIRE_DEFAULT__ = function(obj) { return obj && obj.__esModule ? obj.default : obj; };
__DEFINE__(1676879951311, function(require, module, exports) {
/**
 * Copyright (c) 2014-2019 Guyon Roche
 * LICENCE: MIT - please refer to LICENSE file included with this module
 * or https://github.com/exceljs/exceljs/blob/master/LICENSE
 */

if (parseInt(process.versions.node.split('.')[0], 10) < 10) {
  throw new Error(
    'For node versions older than 10, please use the ES5 Import: https://github.com/exceljs/exceljs#es5-imports'
  );
}

module.exports = require('./lib/exceljs.nodejs.js');

}, function(modId) {var map = {"./lib/exceljs.nodejs.js":1676879951312}; return __REQUIRE__(map[modId], modId); })
__DEFINE__(1676879951312, function(require, module, exports) {
const ExcelJS = {
  Workbook: require('./doc/workbook'),
  ModelContainer: require('./doc/modelcontainer'),
  stream: {
    xlsx: {
      WorkbookWriter: require('./stream/xlsx/workbook-writer'),
      WorkbookReader: require('./stream/xlsx/workbook-reader'),
    },
  },
};

Object.assign(ExcelJS, require('./doc/enums'));

module.exports = ExcelJS;

}, function(modId) { var map = {"./doc/workbook":1676879951313,"./doc/modelcontainer":1676879951454,"./stream/xlsx/workbook-writer":1676879951455,"./stream/xlsx/workbook-reader":1676879951460,"./doc/enums":1676879951319}; return __REQUIRE__(map[modId], modId); })
__DEFINE__(1676879951313, function(require, module, exports) {


const Worksheet = require('./worksheet');
const DefinedNames = require('./defined-names');
const XLSX = require('../xlsx/xlsx');
const CSV = require('../csv/csv');

// Workbook requirements
//  Load and Save from file and stream
//  Access/Add/Delete individual worksheets
//  Manage String table, Hyperlink table, etc.
//  Manage scaffolding for contained objects to write to/read from

class Workbook {
  constructor() {
    this.category = '';
    this.company = '';
    this.created = new Date();
    this.description = '';
    this.keywords = '';
    this.manager = '';
    this.modified = this.created;
    this.properties = {};
    this.calcProperties = {};
    this._worksheets = [];
    this.subject = '';
    this.title = '';
    this.views = [];
    this.media = [];
    this._definedNames = new DefinedNames();
  }

  get xlsx() {
    if (!this._xlsx) this._xlsx = new XLSX(this);
    return this._xlsx;
  }

  get csv() {
    if (!this._csv) this._csv = new CSV(this);
    return this._csv;
  }

  get nextId() {
    // find the next unique spot to add worksheet
    for (let i = 1; i < this._worksheets.length; i++) {
      if (!this._worksheets[i]) {
        return i;
      }
    }
    return this._worksheets.length || 1;
  }

  addWorksheet(name, options) {
    const id = this.nextId;

    if (name && name.length > 31) {
      // eslint-disable-next-line no-console
      console.warn(`Worksheet name ${name} exceeds 31 chars. This will be truncated`);
    }

    // Illegal character in worksheet name: asterisk (*), question mark (?),
    // colon (:), forward slash (/ \), or bracket ([])
    if (/[*?:/\\[\]]/.test(name)) {
      throw new Error(
        `Worksheet name ${name} cannot include any of the following characters: * ? : \\ / [ ]`
      );
    }

    if (/(^')|('$)/.test(name)) {
      throw new Error(
        `The first or last character of worksheet name cannot be a single quotation mark: ${name}`
      );
    }

    name = (name || `sheet${id}`).substring(0, 31);
    if (this._worksheets.find(ws => ws && ws.name.toLowerCase() === name.toLowerCase())) {
      throw new Error(`Worksheet name already exists: ${name}`);
    }

    // if options is a color, call it tabColor (and signal deprecated message)
    if (options) {
      if (typeof options === 'string') {
        // eslint-disable-next-line no-console
        console.trace(
          'tabColor argument is now deprecated. Please use workbook.addWorksheet(name, {properties: { tabColor: { argb: "rbg value" } }'
        );
        options = {
          properties: {
            tabColor: {argb: options},
          },
        };
      } else if (options.argb || options.theme || options.indexed) {
        // eslint-disable-next-line no-console
        console.trace(
          'tabColor argument is now deprecated. Please use workbook.addWorksheet(name, {properties: { tabColor: { ... } }'
        );
        options = {
          properties: {
            tabColor: options,
          },
        };
      }
    }

    const lastOrderNo = this._worksheets.reduce(
      (acc, ws) => ((ws && ws.orderNo) > acc ? ws.orderNo : acc),
      0
    );
    const worksheetOptions = Object.assign({}, options, {
      id,
      name,
      orderNo: lastOrderNo + 1,
      workbook: this,
    });

    const worksheet = new Worksheet(worksheetOptions);

    this._worksheets[id] = worksheet;
    return worksheet;
  }

  removeWorksheetEx(worksheet) {
    delete this._worksheets[worksheet.id];
  }

  removeWorksheet(id) {
    const worksheet = this.getWorksheet(id);
    if (worksheet) {
      worksheet.destroy();
    }
  }

  getWorksheet(id) {
    if (id === undefined) {
      return this._worksheets.find(Boolean);
    }
    if (typeof id === 'number') {
      return this._worksheets[id];
    }
    if (typeof id === 'string') {
      return this._worksheets.find(worksheet => worksheet && worksheet.name === id);
    }
    return undefined;
  }

  get worksheets() {
    // return a clone of _worksheets
    return this._worksheets
      .slice(1)
      .sort((a, b) => a.orderNo - b.orderNo)
      .filter(Boolean);
  }

  eachSheet(iteratee) {
    this.worksheets.forEach(sheet => {
      iteratee(sheet, sheet.id);
    });
  }

  get definedNames() {
    return this._definedNames;
  }

  clearThemes() {
    // Note: themes are not an exposed feature, meddle at your peril!
    this._themes = undefined;
  }

  addImage(image) {
    // TODO:  validation?
    const id = this.media.length;
    this.media.push(Object.assign({}, image, {type: 'image'}));
    return id;
  }

  getImage(id) {
    return this.media[id];
  }

  get model() {
    return {
      creator: this.creator || 'Unknown',
      lastModifiedBy: this.lastModifiedBy || 'Unknown',
      lastPrinted: this.lastPrinted,
      created: this.created,
      modified: this.modified,
      properties: this.properties,
      worksheets: this.worksheets.map(worksheet => worksheet.model),
      sheets: this.worksheets.map(ws => ws.model).filter(Boolean),
      definedNames: this._definedNames.model,
      views: this.views,
      company: this.company,
      manager: this.manager,
      title: this.title,
      subject: this.subject,
      keywords: this.keywords,
      category: this.category,
      description: this.description,
      language: this.language,
      revision: this.revision,
      contentStatus: this.contentStatus,
      themes: this._themes,
      media: this.media,
      calcProperties: this.calcProperties,
    };
  }

  set model(value) {
    this.creator = value.creator;
    this.lastModifiedBy = value.lastModifiedBy;
    this.lastPrinted = value.lastPrinted;
    this.created = value.created;
    this.modified = value.modified;
    this.company = value.company;
    this.manager = value.manager;
    this.title = value.title;
    this.subject = value.subject;
    this.keywords = value.keywords;
    this.category = value.category;
    this.description = value.description;
    this.language = value.language;
    this.revision = value.revision;
    this.contentStatus = value.contentStatus;

    this.properties = value.properties;
    this.calcProperties = value.calcProperties;
    this._worksheets = [];
    value.worksheets.forEach(worksheetModel => {
      const {id, name, state} = worksheetModel;
      const orderNo = value.sheets && value.sheets.findIndex(ws => ws.id === id);
      const worksheet = (this._worksheets[id] = new Worksheet({
        id,
        name,
        orderNo,
        state,
        workbook: this,
      }));

      worksheet.model = worksheetModel;
    });

    this._definedNames.model = value.definedNames;
    this.views = value.views;
    this._themes = value.themes;
    this.media = value.media || [];
  }
}

module.exports = Workbook;

}, function(modId) { var map = {"./worksheet":1676879951314,"./defined-names":1676879951329,"../xlsx/xlsx":1676879951331,"../csv/csv":1676879951453}; return __REQUIRE__(map[modId], modId); })
__DEFINE__(1676879951314, function(require, module, exports) {
const _ = require('../utils/under-dash');

const colCache = require('../utils/col-cache');
const Range = require('./range');
const Row = require('./row');
const Column = require('./column');
const Enums = require('./enums');
const Image = require('./image');
const Table = require('./table');
const DataValidations = require('./data-validations');
const Encryptor = require('../utils/encryptor');

// Worksheet requirements
//  Operate as sheet inside workbook or standalone
//  Load and Save from file and stream
//  Access/Add/Delete individual cells
//  Manage column widths and row heights

class Worksheet {
  constructor(options) {
    options = options || {};

    // in a workbook, each sheet will have a number
    this.id = options.id;
    this.orderNo = options.orderNo;

    // and a name
    this.name = options.name || `Sheet${this.id}`;

    // add a state
    this.state = options.state || 'visible';

    // rows allows access organised by row. Sparse array of arrays indexed by row-1, col
    // Note: _rows is zero based. Must subtract 1 to go from cell.row to index
    this._rows = [];

    // column definitions
    this._columns = null;

    // column keys (addRow convenience): key ==> this._collumns index
    this._keys = {};

    // keep record of all merges
    this._merges = {};

    // record of all row and column pageBreaks
    this.rowBreaks = [];

    this._workbook = options.workbook;

    // for tabColor, default row height, outline levels, etc
    this.properties = Object.assign(
      {},
      {
        defaultRowHeight: 15,
        dyDescent: 55,
        outlineLevelCol: 0,
        outlineLevelRow: 0,
      },
      options.properties
    );

    // for all things printing
    this.pageSetup = Object.assign(
      {},
      {
        margins: {left: 0.7, right: 0.7, top: 0.75, bottom: 0.75, header: 0.3, footer: 0.3},
        orientation: 'portrait',
        horizontalDpi: 4294967295,
        verticalDpi: 4294967295,
        fitToPage: !!(
          options.pageSetup &&
          (options.pageSetup.fitToWidth || options.pageSetup.fitToHeight) &&
          !options.pageSetup.scale
        ),
        pageOrder: 'downThenOver',
        blackAndWhite: false,
        draft: false,
        cellComments: 'None',
        errors: 'displayed',
        scale: 100,
        fitToWidth: 1,
        fitToHeight: 1,
        paperSize: undefined,
        showRowColHeaders: false,
        showGridLines: false,
        firstPageNumber: undefined,
        horizontalCentered: false,
        verticalCentered: false,
        rowBreaks: null,
        colBreaks: null,
      },
      options.pageSetup
    );

    this.headerFooter = Object.assign(
      {},
      {
        differentFirst: false,
        differentOddEven: false,
        oddHeader: null,
        oddFooter: null,
        evenHeader: null,
        evenFooter: null,
        firstHeader: null,
        firstFooter: null,
      },
      options.headerFooter
    );

    this.dataValidations = new DataValidations();

    // for freezepanes, split, zoom, gridlines, etc
    this.views = options.views || [];

    this.autoFilter = options.autoFilter || null;

    // for images, etc
    this._media = [];

    // worksheet protection
    this.sheetProtection = null;

    // for tables
    this.tables = {};

    this.conditionalFormattings = [];
  }

  get workbook() {
    return this._workbook;
  }

  // when you're done with this worksheet, call this to remove from workbook
  destroy() {
    this._workbook.removeWorksheetEx(this);
  }

  // Get the bounding range of the cells in this worksheet
  get dimensions() {
    const dimensions = new Range();
    this._rows.forEach(row => {
      if (row) {
        const rowDims = row.dimensions;
        if (rowDims) {
          dimensions.expand(row.number, rowDims.min, row.number, rowDims.max);
        }
      }
    });
    return dimensions;
  }

  // =========================================================================
  // Columns

  // get the current columns array.
  get columns() {
    return this._columns;
  }

  // set the columns from an array of column definitions.
  // Note: any headers defined will overwrite existing values.
  set columns(value) {
    // calculate max header row count
    this._headerRowCount = value.reduce((pv, cv) => {
      const headerCount = (cv.header && 1) || (cv.headers && cv.headers.length) || 0;
      return Math.max(pv, headerCount);
    }, 0);

    // construct Column objects
    let count = 1;
    const columns = (this._columns = []);
    value.forEach(defn => {
      const column = new Column(this, count++, false);
      columns.push(column);
      column.defn = defn;
    });
  }

  getColumnKey(key) {
    return this._keys[key];
  }

  setColumnKey(key, value) {
    this._keys[key] = value;
  }

  deleteColumnKey(key) {
    delete this._keys[key];
  }

  eachColumnKey(f) {
    _.each(this._keys, f);
  }

  // get a single column by col number. If it doesn't exist, create it and any gaps before it
  getColumn(c) {
    if (typeof c === 'string') {
      // if it matches a key'd column, return that
      const col = this._keys[c];
      if (col) return col;

      // otherwise, assume letter
      c = colCache.l2n(c);
    }
    if (!this._columns) {
      this._columns = [];
    }
    if (c > this._columns.length) {
      let n = this._columns.length + 1;
      while (n <= c) {
        this._columns.push(new Column(this, n++));
      }
    }
    return this._columns[c - 1];
  }

  spliceColumns(start, count, ...inserts) {
    const rows = this._rows;
    const nRows = rows.length;
    if (inserts.length > 0) {
      // must iterate over all rows whether they exist yet or not
      for (let i = 0; i < nRows; i++) {
        const rowArguments = [start, count];
        // eslint-disable-next-line no-loop-func
        inserts.forEach(insert => {
          rowArguments.push(insert[i] || null);
        });
        const row = this.getRow(i + 1);
        // eslint-disable-next-line prefer-spread
        row.splice.apply(row, rowArguments);
      }
    } else {
      // nothing to insert, so just splice all rows
      this._rows.forEach(r => {
        if (r) {
          r.splice(start, count);
        }
      });
    }

    // splice column definitions
    const nExpand = inserts.length - count;
    const nKeep = start + count;
    const nEnd = this._columns.length;
    if (nExpand < 0) {
      for (let i = start + inserts.length; i <= nEnd; i++) {
        this.getColumn(i).defn = this.getColumn(i - nExpand).defn;
      }
    } else if (nExpand > 0) {
      for (let i = nEnd; i >= nKeep; i--) {
        this.getColumn(i + nExpand).defn = this.getColumn(i).defn;
      }
    }
    for (let i = start; i < start + inserts.length; i++) {
      this.getColumn(i).defn = null;
    }

    // account for defined names
    this.workbook.definedNames.spliceColumns(this.name, start, count, inserts.length);
  }

  get lastColumn() {
    return this.getColumn(this.columnCount);
  }

  get columnCount() {
    let maxCount = 0;
    this.eachRow(row => {
      maxCount = Math.max(maxCount, row.cellCount);
    });
    return maxCount;
  }

  get actualColumnCount() {
    // performance nightmare - for each row, counts all the columns used
    const counts = [];
    let count = 0;
    this.eachRow(row => {
      row.eachCell(({col}) => {
        if (!counts[col]) {
          counts[col] = true;
          count++;
        }
      });
    });
    return count;
  }

  // =========================================================================
  // Rows

  _commitRow() {
    // nop - allows streaming reader to fill a document
  }

  get _lastRowNumber() {
    // need to cope with results of splice
    const rows = this._rows;
    let n = rows.length;
    while (n > 0 && rows[n - 1] === undefined) {
      n--;
    }
    return n;
  }

  get _nextRow() {
    return this._lastRowNumber + 1;
  }

  get lastRow() {
    if (this._rows.length) {
      return this._rows[this._rows.length - 1];
    }
    return undefined;
  }

  // find a row (if exists) by row number
  findRow(r) {
    return this._rows[r - 1];
  }

  // find multiple rows (if exists) by row number
  findRows(start, length) {
    return this._rows.slice(start - 1, start - 1 + length);
  }

  get rowCount() {
    return this._lastRowNumber;
  }

  get actualRowCount() {
    // counts actual rows that have actual data
    let count = 0;
    this.eachRow(() => {
      count++;
    });
    return count;
  }

  // get a row by row number.
  getRow(r) {
    let row = this._rows[r - 1];
    if (!row) {
      row = this._rows[r - 1] = new Row(this, r);
    }
    return row;
  }

  // get multiple rows by row number.
  getRows(start, length) {
    if (length < 1) return undefined;
    const rows = [];
    for (let i = start; i < start + length; i++) {
      rows.push(this.getRow(i));
    }
    return rows;
  }

  addRow(value, style = 'n') {
    const rowNo = this._nextRow;
    const row = this.getRow(rowNo);
    row.values = value;
    this._setStyleOption(rowNo, style[0] === 'i' ? style : 'n');
    return row;
  }

  addRows(value, style = 'n') {
    const rows = [];
    value.forEach(row => {
      rows.push(this.addRow(row, style));
    });
    return rows;
  }

  insertRow(pos, value, style = 'n') {
    this.spliceRows(pos, 0, value);
    this._setStyleOption(pos, style);
    return this.getRow(pos);
  }

  insertRows(pos, values, style = 'n') {
    this.spliceRows(pos, 0, ...values);
    if (style !== 'n') {
      // copy over the styles
      for (let i = 0; i < values.length; i++) {
        if (style[0] === 'o' && this.findRow(values.length + pos + i) !== undefined) {
          this._copyStyle(values.length + pos + i, pos + i, style[1] === '+');
        } else if (style[0] === 'i' && this.findRow(pos - 1) !== undefined) {
          this._copyStyle(pos - 1, pos + i, style[1] === '+');
        }
      }
    }
    return this.getRows(pos, values.length);
  }

  // set row at position to same style as of either pervious row (option 'i') or next row (option 'o')
  _setStyleOption(pos, style = 'n') {
    if (style[0] === 'o' && this.findRow(pos + 1) !== undefined) {
      this._copyStyle(pos + 1, pos, style[1] === '+');
    } else if (style[0] === 'i' && this.findRow(pos - 1) !== undefined) {
      this._copyStyle(pos - 1, pos, style[1] === '+');
    }
  }

  _copyStyle(src, dest, styleEmpty = false) {
    const rSrc = this.getRow(src);
    const rDst = this.getRow(dest);
    rDst.style = Object.freeze({...rSrc.style});
    // eslint-disable-next-line no-loop-func
    rSrc.eachCell({includeEmpty: styleEmpty}, (cell, colNumber) => {
      rDst.getCell(colNumber).style = Object.freeze({...cell.style});
    });
    rDst.height = rSrc.height;
  }

  duplicateRow(rowNum, count, insert = false) {
    // create count duplicates of rowNum
    // either inserting new or overwriting existing rows

    const rSrc = this._rows[rowNum - 1];
    const inserts = new Array(count).fill(rSrc.values);
    this.spliceRows(rowNum + 1, insert ? 0 : count, ...inserts);

    // now copy styles...
    for (let i = 0; i < count; i++) {
      const rDst = this._rows[rowNum + i];
      rDst.style = rSrc.style;
      rDst.height = rSrc.height;
      // eslint-disable-next-line no-loop-func
      rSrc.eachCell({includeEmpty: true}, (cell, colNumber) => {
        rDst.getCell(colNumber).style = cell.style;
      });
    }
  }

  spliceRows(start, count, ...inserts) {
    // same problem as row.splice, except worse.
    const nKeep = start + count;
    const nInserts = inserts.length;
    const nExpand = nInserts - count;
    const nEnd = this._rows.length;
    let i;
    let rSrc;
    if (nExpand < 0) {
      // remove rows
      for (i = nKeep; i <= nEnd; i++) {
        rSrc = this._rows[i - 1];
        if (rSrc) {
          const rDst = this.getRow(i + nExpand);
          rDst.values = rSrc.values;
          rDst.style = rSrc.style;
          rDst.height = rSrc.height;
          // eslint-disable-next-line no-loop-func
          rSrc.eachCell({includeEmpty: true}, (cell, colNumber) => {
            rDst.getCell(colNumber).style = cell.style;
          });
          this._rows[i - 1] = undefined;
        } else {
          this._rows[i + nExpand - 1] = undefined;
        }
      }
    } else if (nExpand > 0) {
      // insert new cells
      for (i = nEnd; i >= nKeep; i--) {
        rSrc = this._rows[i - 1];
        if (rSrc) {
          const rDst = this.getRow(i + nExpand);
          rDst.values = rSrc.values;
          rDst.style = rSrc.style;
          rDst.height = rSrc.height;
          // eslint-disable-next-line no-loop-func
          rSrc.eachCell({includeEmpty: true}, (cell, colNumber) => {
            rDst.getCell(colNumber).style = cell.style;

            // remerge cells accounting for insert offset
            if (cell._value.constructor.name === 'MergeValue') {
              const cellToBeMerged = this.getRow(cell._row._number + nInserts).getCell(colNumber);
              const prevMaster = cell._value._master;
              const newMaster = this.getRow(prevMaster._row._number + nInserts).getCell(prevMaster._column._number);
              cellToBeMerged.merge(newMaster);
            }
          });
        } else {
          this._rows[i + nExpand - 1] = undefined;
        }
      }
    }

    // now copy over the new values
    for (i = 0; i < nInserts; i++) {
      const rDst = this.getRow(start + i);
      rDst.style = {};
      rDst.values = inserts[i];
    }

    // account for defined names
    this.workbook.definedNames.spliceRows(this.name, start, count, nInserts);
  }

  // iterate over every row in the worksheet, including maybe empty rows
  eachRow(options, iteratee) {
    if (!iteratee) {
      iteratee = options;
      options = undefined;
    }
    if (options && options.includeEmpty) {
      const n = this._rows.length;
      for (let i = 1; i <= n; i++) {
        iteratee(this.getRow(i), i);
      }
    } else {
      this._rows.forEach(row => {
        if (row && row.hasValues) {
          iteratee(row, row.number);
        }
      });
    }
  }

  // return all rows as sparse array
  getSheetValues() {
    const rows = [];
    this._rows.forEach(row => {
      if (row) {
        rows[row.number] = row.values;
      }
    });
    return rows;
  }

  // =========================================================================
  // Cells

  // returns the cell at [r,c] or address given by r. If not found, return undefined
  findCell(r, c) {
    const address = colCache.getAddress(r, c);
    const row = this._rows[address.row - 1];
    return row ? row.findCell(address.col) : undefined;
  }

  // return the cell at [r,c] or address given by r. If not found, create a new one.
  getCell(r, c) {
    const address = colCache.getAddress(r, c);
    const row = this.getRow(address.row);
    return row.getCellEx(address);
  }

  // =========================================================================
  // Merge

  // convert the range defined by ['tl:br'], [tl,br] or [t,l,b,r] into a single 'merged' cell
  mergeCells(...cells) {
    const dimensions = new Range(cells);
    this._mergeCellsInternal(dimensions);
  }

  mergeCellsWithoutStyle(...cells) {
    const dimensions = new Range(cells);
    this._mergeCellsInternal(dimensions, true);
  }

  _mergeCellsInternal(dimensions, ignoreStyle) {
    // check cells aren't already merged
    _.each(this._merges, merge => {
      if (merge.intersects(dimensions)) {
        throw new Error('Cannot merge already merged cells');
      }
    });

    // apply merge
    const master = this.getCell(dimensions.top, dimensions.left);
    for (let i = dimensions.top; i <= dimensions.bottom; i++) {
      for (let j = dimensions.left; j <= dimensions.right; j++) {
        // merge all but the master cell
        if (i > dimensions.top || j > dimensions.left) {
          this.getCell(i, j).merge(master, ignoreStyle);
        }
      }
    }

    // index merge
    this._merges[master.address] = dimensions;
  }

  _unMergeMaster(master) {
    // master is always top left of a rectangle
    const merge = this._merges[master.address];
    if (merge) {
      for (let i = merge.top; i <= merge.bottom; i++) {
        for (let j = merge.left; j <= merge.right; j++) {
          this.getCell(i, j).unmerge();
        }
      }
      delete this._merges[master.address];
    }
  }

  get hasMerges() {
    // return true if this._merges has a merge object
    return _.some(this._merges, Boolean);
  }

  // scan the range defined by ['tl:br'], [tl,br] or [t,l,b,r] and if any cell is part of a merge,
  // un-merge the group. Note this function can affect multiple merges and merge-blocks are
  // atomic - either they're all merged or all un-merged.
  unMergeCells(...cells) {
    const dimensions = new Range(cells);

    // find any cells in that range and unmerge them
    for (let i = dimensions.top; i <= dimensions.bottom; i++) {
      for (let j = dimensions.left; j <= dimensions.right; j++) {
        const cell = this.findCell(i, j);
        if (cell) {
          if (cell.type === Enums.ValueType.Merge) {
            // this cell merges to another master
            this._unMergeMaster(cell.master);
          } else if (this._merges[cell.address]) {
            // this cell is a master
            this._unMergeMaster(cell);
          }
        }
      }
    }
  }

  // ===========================================================================
  // Shared/Array Formula
  fillFormula(range, formula, results, shareType = 'shared') {
    // Define formula for top-left cell and share to rest
    const decoded = colCache.decode(range);
    const {top, left, bottom, right} = decoded;
    const width = right - left + 1;
    const masterAddress = colCache.encodeAddress(top, left);
    const isShared = shareType === 'shared';

    // work out result accessor
    let getResult;
    if (typeof results === 'function') {
      getResult = results;
    } else if (Array.isArray(results)) {
      if (Array.isArray(results[0])) {
        getResult = (row, col) => results[row - top][col - left];
      } else {
        // eslint-disable-next-line no-mixed-operators
        getResult = (row, col) => results[(row - top) * width + (col - left)];
      }
    } else {
      getResult = () => undefined;
    }
    let first = true;
    for (let r = top; r <= bottom; r++) {
      for (let c = left; c <= right; c++) {
        if (first) {
          this.getCell(r, c).value = {
            shareType,
            formula,
            ref: range,
            result: getResult(r, c),
          };
          first = false;
        } else {
          this.getCell(r, c).value = isShared
            ? {
                sharedFormula: masterAddress,
                result: getResult(r, c),
              }
            : getResult(r, c);
        }
      }
    }
  }

  // =========================================================================
  // Images
  addImage(imageId, range) {
    const model = {
      type: 'image',
      imageId,
      range,
    };
    this._media.push(new Image(this, model));
  }

  getImages() {
    return this._media.filter(m => m.type === 'image');
  }

  addBackgroundImage(imageId) {
    const model = {
      type: 'background',
      imageId,
    };
    this._media.push(new Image(this, model));
  }

  getBackgroundImageId() {
    const image = this._media.find(m => m.type === 'background');
    return image && image.imageId;
  }

  // =========================================================================
  // Worksheet Protection
  protect(password, options) {
    // TODO: make this function truly async
    // perhaps marshal to worker thread or something
    return new Promise(resolve => {
      this.sheetProtection = {
        sheet: true,
      };
      if (options && 'spinCount' in options) {
        // force spinCount to be integer >= 0
        options.spinCount = Number.isFinite(options.spinCount) ? Math.round(Math.max(0, options.spinCount)) : 100000;
      }
      if (password) {
        this.sheetProtection.algorithmName = 'SHA-512';
        this.sheetProtection.saltValue = Encryptor.randomBytes(16).toString('base64');
        this.sheetProtection.spinCount = options && 'spinCount' in options ? options.spinCount : 100000; // allow user specified spinCount
        this.sheetProtection.hashValue = Encryptor.convertPasswordToHash(
          password,
          'SHA512',
          this.sheetProtection.saltValue,
          this.sheetProtection.spinCount
        );
      }
      if (options) {
        this.sheetProtection = Object.assign(this.sheetProtection, options);
        if (!password && 'spinCount' in options) {
          delete this.sheetProtection.spinCount;
        }
      }
      resolve();
    });
  }

  unprotect() {
    this.sheetProtection = null;
  }

  // =========================================================================
  // Tables
  addTable(model) {
    const table = new Table(this, model);
    this.tables[model.name] = table;
    return table;
  }

  getTable(name) {
    return this.tables[name];
  }

  removeTable(name) {
    delete this.tables[name];
  }

  getTables() {
    return Object.values(this.tables);
  }

  // ===========================================================================
  // Conditional Formatting
  addConditionalFormatting(cf) {
    this.conditionalFormattings.push(cf);
  }

  removeConditionalFormatting(filter) {
    if (typeof filter === 'number') {
      this.conditionalFormattings.splice(filter, 1);
    } else if (filter instanceof Function) {
      this.conditionalFormattings = this.conditionalFormattings.filter(filter);
    } else {
      this.conditionalFormattings = [];
    }
  }

  // ===========================================================================
  // Deprecated
  get tabColor() {
    // eslint-disable-next-line no-console
    console.trace('worksheet.tabColor property is now deprecated. Please use worksheet.properties.tabColor');
    return this.properties.tabColor;
  }

  set tabColor(value) {
    // eslint-disable-next-line no-console
    console.trace('worksheet.tabColor property is now deprecated. Please use worksheet.properties.tabColor');
    this.properties.tabColor = value;
  }

  // ===========================================================================
  // Model

  get model() {
    const model = {
      id: this.id,
      name: this.name,
      dataValidations: this.dataValidations.model,
      properties: this.properties,
      state: this.state,
      pageSetup: this.pageSetup,
      headerFooter: this.headerFooter,
      rowBreaks: this.rowBreaks,
      views: this.views,
      autoFilter: this.autoFilter,
      media: this._media.map(medium => medium.model),
      sheetProtection: this.sheetProtection,
      tables: Object.values(this.tables).map(table => table.model),
      conditionalFormattings: this.conditionalFormattings,
    };

    // =================================================
    // columns
    model.cols = Column.toModel(this.columns);

    // ==========================================================
    // Rows
    const rows = (model.rows = []);
    const dimensions = (model.dimensions = new Range());
    this._rows.forEach(row => {
      const rowModel = row && row.model;
      if (rowModel) {
        dimensions.expand(rowModel.number, rowModel.min, rowModel.number, rowModel.max);
        rows.push(rowModel);
      }
    });

    // ==========================================================
    // Merges
    model.merges = [];
    _.each(this._merges, merge => {
      model.merges.push(merge.range);
    });

    return model;
  }

  _parseRows(model) {
    this._rows = [];
    model.rows.forEach(rowModel => {
      const row = new Row(this, rowModel.number);
      this._rows[row.number - 1] = row;
      row.model = rowModel;
    });
  }

  _parseMergeCells(model) {
    _.each(model.mergeCells, merge => {
      // Do not merge styles when importing an Excel file
      // since each cell may have different styles intentionally.
      this.mergeCellsWithoutStyle(merge);
    });
  }

  set model(value) {
    this.name = value.name;
    this._columns = Column.fromModel(this, value.cols);
    this._parseRows(value);

    this._parseMergeCells(value);
    this.dataValidations = new DataValidations(value.dataValidations);
    this.properties = value.properties;
    this.pageSetup = value.pageSetup;
    this.headerFooter = value.headerFooter;
    this.views = value.views;
    this.autoFilter = value.autoFilter;
    this._media = value.media.map(medium => new Image(this, medium));
    this.sheetProtection = value.sheetProtection;
    this.tables = value.tables.reduce((tables, table) => {
      const t = new Table();
      t.model = table;
      tables[table.name] = t;
      return tables;
    }, {});
    this.conditionalFormattings = value.conditionalFormattings;
  }
}

module.exports = Worksheet;

}, function(modId) { var map = {"../utils/under-dash":1676879951315,"../utils/col-cache":1676879951316,"./range":1676879951317,"./row":1676879951318,"./column":1676879951323,"./enums":1676879951319,"./image":1676879951324,"./table":1676879951326,"./data-validations":1676879951327,"../utils/encryptor":1676879951328}; return __REQUIRE__(map[modId], modId); })
__DEFINE__(1676879951315, function(require, module, exports) {
const {toString} = Object.prototype;
const escapeHtmlRegex = /["&<>]/;
const _ = {
  each: function each(obj, cb) {
    if (obj) {
      if (Array.isArray(obj)) {
        obj.forEach(cb);
      } else {
        Object.keys(obj).forEach(key => {
          cb(obj[key], key);
        });
      }
    }
  },

  some: function some(obj, cb) {
    if (obj) {
      if (Array.isArray(obj)) {
        return obj.some(cb);
      }
      return Object.keys(obj).some(key => cb(obj[key], key));
    }
    return false;
  },

  every: function every(obj, cb) {
    if (obj) {
      if (Array.isArray(obj)) {
        return obj.every(cb);
      }
      return Object.keys(obj).every(key => cb(obj[key], key));
    }
    return true;
  },

  map: function map(obj, cb) {
    if (obj) {
      if (Array.isArray(obj)) {
        return obj.map(cb);
      }
      return Object.keys(obj).map(key => cb(obj[key], key));
    }
    return [];
  },

  keyBy(a, p) {
    return a.reduce((o, v) => {
      o[v[p]] = v;
      return o;
    }, {});
  },

  isEqual: function isEqual(a, b) {
    const aType = typeof a;
    const bType = typeof b;
    const aArray = Array.isArray(a);
    const bArray = Array.isArray(b);

    if (aType !== bType) {
      return false;
    }
    switch (typeof a) {
      case 'object':
        if (aArray || bArray) {
          if (aArray && bArray) {
            return (
              a.length === b.length &&
              a.every((aValue, index) => {
                const bValue = b[index];
                return _.isEqual(aValue, bValue);
              })
            );
          }
          return false;
        }
        return _.every(a, (aValue, key) => {
          const bValue = b[key];
          return _.isEqual(aValue, bValue);
        });

      default:
        return a === b;
    }
  },

  escapeHtml(html) {
    const regexResult = escapeHtmlRegex.exec(html);
    if (!regexResult) return html;

    let result = '';
    let escape = '';
    let lastIndex = 0;
    let i = regexResult.index;
    for (; i < html.length; i++) {
      switch (html.charAt(i)) {
        case '"':
          escape = '&quot;';
          break;
        case '&':
          escape = '&amp;';
          break;
        case '\'':
          escape = '&apos;';
          break;
        case '<':
          escape = '&lt;';
          break;
        case '>':
          escape = '&gt;';
          break;
        default:
          continue;
      }
      if (lastIndex !== i) result += html.substring(lastIndex, i);
      lastIndex = i + 1;
      result += escape;
    }
    if (lastIndex !== i) return result + html.substring(lastIndex, i);
    return result;
  },

  strcmp(a, b) {
    if (a < b) return -1;
    if (a > b) return 1;
    return 0;
  },

  isUndefined(val) {
    return toString.call(val) === '[object Undefined]';
  },

  isObject(val) {
    return toString.call(val) === '[object Object]';
  },

  deepMerge() {
    const target = arguments[0] || {};
    const {length} = arguments;
    // eslint-disable-next-line one-var
    let src, clone, copyIsArray;

    function assignValue(val, key) {
      src = target[key];
      copyIsArray = Array.isArray(val);
      if (_.isObject(val) || copyIsArray) {
        if (copyIsArray) {
          copyIsArray = false;
          clone = src && Array.isArray(src) ? src : [];
        } else {
          clone = src && _.isObject(src) ? src : {};
        }
        target[key] = _.deepMerge(clone, val);
      } else if (!_.isUndefined(val)) {
        target[key] = val;
      }
    }

    for (let i = 0; i < length; i++) {
      _.each(arguments[i], assignValue);
    }
    return target;
  },
};

module.exports = _;

}, function(modId) { var map = {}; return __REQUIRE__(map[modId], modId); })
__DEFINE__(1676879951316, function(require, module, exports) {
const addressRegex = /^[A-Z]+\d+$/;
// =========================================================================
// Column Letter to Number conversion
const colCache = {
  _dictionary: [
    'A',
    'B',
    'C',
    'D',
    'E',
    'F',
    'G',
    'H',
    'I',
    'J',
    'K',
    'L',
    'M',
    'N',
    'O',
    'P',
    'Q',
    'R',
    'S',
    'T',
    'U',
    'V',
    'W',
    'X',
    'Y',
    'Z',
  ],
  _l2nFill: 0,
  _l2n: {},
  _n2l: [],
  _level(n) {
    if (n <= 26) {
      return 1;
    }
    if (n <= 26 * 26) {
      return 2;
    }
    return 3;
  },
  _fill(level) {
    let c;
    let v;
    let l1;
    let l2;
    let l3;
    let n = 1;
    if (level >= 4) {
      throw new Error('Out of bounds. Excel supports columns from 1 to 16384');
    }
    if (this._l2nFill < 1 && level >= 1) {
      while (n <= 26) {
        c = this._dictionary[n - 1];
        this._n2l[n] = c;
        this._l2n[c] = n;
        n++;
      }
      this._l2nFill = 1;
    }
    if (this._l2nFill < 2 && level >= 2) {
      n = 27;
      while (n <= 26 + (26 * 26)) {
        v = n - (26 + 1);
        l1 = v % 26;
        l2 = Math.floor(v / 26);
        c = this._dictionary[l2] + this._dictionary[l1];
        this._n2l[n] = c;
        this._l2n[c] = n;
        n++;
      }
      this._l2nFill = 2;
    }
    if (this._l2nFill < 3 && level >= 3) {
      n = 26 + (26 * 26) + 1;
      while (n <= 16384) {
        v = n - ((26 * 26) + 26 + 1);
        l1 = v % 26;
        l2 = Math.floor(v / 26) % 26;
        l3 = Math.floor(v / (26 * 26));
        c = this._dictionary[l3] + this._dictionary[l2] + this._dictionary[l1];
        this._n2l[n] = c;
        this._l2n[c] = n;
        n++;
      }
      this._l2nFill = 3;
    }
  },
  l2n(l) {
    if (!this._l2n[l]) {
      this._fill(l.length);
    }
    if (!this._l2n[l]) {
      throw new Error(`Out of bounds. Invalid column letter: ${l}`);
    }
    return this._l2n[l];
  },
  n2l(n) {
    if (n < 1 || n > 16384) {
      throw new Error(`${n} is out of bounds. Excel supports columns from 1 to 16384`);
    }
    if (!this._n2l[n]) {
      this._fill(this._level(n));
    }
    return this._n2l[n];
  },

  // =========================================================================
  // Address processing
  _hash: {},

  // check if value looks like an address
  validateAddress(value) {
    if (!addressRegex.test(value)) {
      throw new Error(`Invalid Address: ${value}`);
    }
    return true;
  },

  // convert address string into structure
  decodeAddress(value) {
    const addr = value.length < 5 && this._hash[value];
    if (addr) {
      return addr;
    }
    let hasCol = false;
    let col = '';
    let colNumber = 0;
    let hasRow = false;
    let row = '';
    let rowNumber = 0;
    for (let i = 0, char; i < value.length; i++) {
      char = value.charCodeAt(i);
      // col should before row
      if (!hasRow && char >= 65 && char <= 90) {
        // 65 = 'A'.charCodeAt(0)
        // 90 = 'Z'.charCodeAt(0)
        hasCol = true;
        col += value[i];
        // colNumber starts from 1
        colNumber = (colNumber * 26) + char - 64;
      } else if (char >= 48 && char <= 57) {
        // 48 = '0'.charCodeAt(0)
        // 57 = '9'.charCodeAt(0)
        hasRow = true;
        row += value[i];
        // rowNumber starts from 0
        rowNumber = (rowNumber * 10) + char - 48;
      } else if (hasRow && hasCol && char !== 36) {
        // 36 = '$'.charCodeAt(0)
        break;
      }
    }
    if (!hasCol) {
      colNumber = undefined;
    } else if (colNumber > 16384) {
      throw new Error(`Out of bounds. Invalid column letter: ${col}`);
    }
    if (!hasRow) {
      rowNumber = undefined;
    }

    // in case $row$col
    value = col + row;

    const address = {
      address: value,
      col: colNumber,
      row: rowNumber,
      $col$row: `$${col}$${row}`,
    };

    // mem fix - cache only the tl 100x100 square
    if (colNumber <= 100 && rowNumber <= 100) {
      this._hash[value] = address;
      this._hash[address.$col$row] = address;
    }

    return address;
  },

  // convert r,c into structure (if only 1 arg, assume r is address string)
  getAddress(r, c) {
    if (c) {
      const address = this.n2l(c) + r;
      return this.decodeAddress(address);
    }
    return this.decodeAddress(r);
  },

  // convert [address], [tl:br] into address structures
  decode(value) {
    const parts = value.split(':');
    if (parts.length === 2) {
      const tl = this.decodeAddress(parts[0]);
      const br = this.decodeAddress(parts[1]);
      const result = {
        top: Math.min(tl.row, br.row),
        left: Math.min(tl.col, br.col),
        bottom: Math.max(tl.row, br.row),
        right: Math.max(tl.col, br.col),
      };
      // reconstruct tl, br and dimensions
      result.tl = this.n2l(result.left) + result.top;
      result.br = this.n2l(result.right) + result.bottom;
      result.dimensions = `${result.tl}:${result.br}`;
      return result;
    }
    return this.decodeAddress(value);
  },

  // convert [sheetName!][$]col[$]row[[$]col[$]row] into address or range structures
  decodeEx(value) {
    const groups = value.match(/(?:(?:(?:'((?:[^']|'')*)')|([^'^ !]*))!)?(.*)/);

    const sheetName = groups[1] || groups[2]; // Qouted and unqouted groups
    const reference = groups[3]; // Remaining address

    const parts = reference.split(':');
    if (parts.length > 1) {
      let tl = this.decodeAddress(parts[0]);
      let br = this.decodeAddress(parts[1]);
      const top = Math.min(tl.row, br.row);
      const left = Math.min(tl.col, br.col);
      const bottom = Math.max(tl.row, br.row);
      const right = Math.max(tl.col, br.col);

      tl = this.n2l(left) + top;
      br = this.n2l(right) + bottom;

      return {
        top,
        left,
        bottom,
        right,
        sheetName,
        tl: {address: tl, col: left, row: top, $col$row: `$${this.n2l(left)}$${top}`, sheetName},
        br: {
          address: br,
          col: right,
          row: bottom,
          $col$row: `$${this.n2l(right)}$${bottom}`,
          sheetName,
        },
        dimensions: `${tl}:${br}`,
      };
    }
    if (reference.startsWith('#')) {
      return sheetName ? {sheetName, error: reference} : {error: reference};
    }

    const address = this.decodeAddress(reference);
    return sheetName ? {sheetName, ...address} : address;
  },

  // convert row,col into address string
  encodeAddress(row, col) {
    return colCache.n2l(col) + row;
  },

  // convert row,col into string address or t,l,b,r into range
  encode() {
    switch (arguments.length) {
      case 2:
        return colCache.encodeAddress(arguments[0], arguments[1]);
      case 4:
        return `${colCache.encodeAddress(arguments[0], arguments[1])}:${colCache.encodeAddress(
          arguments[2],
          arguments[3]
        )}`;
      default:
        throw new Error('Can only encode with 2 or 4 arguments');
    }
  },

  // return true if address is contained within range
  inRange(range, address) {
    const [left, top, , right, bottom] = range;
    const [col, row] = address;
    return col >= left && col <= right && row >= top && row <= bottom;
  },
};

module.exports = colCache;

}, function(modId) { var map = {}; return __REQUIRE__(map[modId], modId); })
__DEFINE__(1676879951317, function(require, module, exports) {
const colCache = require('../utils/col-cache');

// used by worksheet to calculate sheet dimensions
class Range {
  constructor() {
    this.decode(arguments);
  }

  setTLBR(t, l, b, r, s) {
    if (arguments.length < 4) {
      // setTLBR(tl, br, s)
      const tl = colCache.decodeAddress(t);
      const br = colCache.decodeAddress(l);
      this.model = {
        top: Math.min(tl.row, br.row),
        left: Math.min(tl.col, br.col),
        bottom: Math.max(tl.row, br.row),
        right: Math.max(tl.col, br.col),
        sheetName: b,
      };

      this.setTLBR(tl.row, tl.col, br.row, br.col, s);
    } else {
      // setTLBR(t, l, b, r, s)
      this.model = {
        top: Math.min(t, b),
        left: Math.min(l, r),
        bottom: Math.max(t, b),
        right: Math.max(l, r),
        sheetName: s,
      };
    }
  }

  decode(argv) {
    switch (argv.length) {
      case 5: // [t,l,b,r,s]
        this.setTLBR(argv[0], argv[1], argv[2], argv[3], argv[4]);
        break;
      case 4: // [t,l,b,r]
        this.setTLBR(argv[0], argv[1], argv[2], argv[3]);
        break;

      case 3: // [tl,br,s]
        this.setTLBR(argv[0], argv[1], argv[2]);
        break;
      case 2: // [tl,br]
        this.setTLBR(argv[0], argv[1]);
        break;

      case 1: {
        const value = argv[0];
        if (value instanceof Range) {
          // copy constructor
          this.model = {
            top: value.model.top,
            left: value.model.left,
            bottom: value.model.bottom,
            right: value.model.right,
            sheetName: value.sheetName,
          };
        } else if (value instanceof Array) {
          // an arguments array
          this.decode(value);
        } else if (value.top && value.left && value.bottom && value.right) {
          // a model
          this.model = {
            top: value.top,
            left: value.left,
            bottom: value.bottom,
            right: value.right,
            sheetName: value.sheetName,
          };
        } else {
          // [sheetName!]tl:br
          const tlbr = colCache.decodeEx(value);
          if (tlbr.top) {
            this.model = {
              top: tlbr.top,
              left: tlbr.left,
              bottom: tlbr.bottom,
              right: tlbr.right,
              sheetName: tlbr.sheetName,
            };
          } else {
            this.model = {
              top: tlbr.row,
              left: tlbr.col,
              bottom: tlbr.row,
              right: tlbr.col,
              sheetName: tlbr.sheetName,
            };
          }
        }
        break;
      }

      case 0:
        this.model = {
          top: 0,
          left: 0,
          bottom: 0,
          right: 0,
        };
        break;

      default:
        throw new Error(`Invalid number of arguments to _getDimensions() - ${argv.length}`);
    }
  }

  get top() {
    return this.model.top || 1;
  }

  set top(value) {
    this.model.top = value;
  }

  get left() {
    return this.model.left || 1;
  }

  set left(value) {
    this.model.left = value;
  }

  get bottom() {
    return this.model.bottom || 1;
  }

  set bottom(value) {
    this.model.bottom = value;
  }

  get right() {
    return this.model.right || 1;
  }

  set right(value) {
    this.model.right = value;
  }

  get sheetName() {
    return this.model.sheetName;
  }

  set sheetName(value) {
    this.model.sheetName = value;
  }

  get _serialisedSheetName() {
    const {sheetName} = this.model;
    if (sheetName) {
      if (/^[a-zA-Z0-9]*$/.test(sheetName)) {
        return `${sheetName}!`;
      }
      return `'${sheetName}'!`;
    }
    return '';
  }

  expand(top, left, bottom, right) {
    if (!this.model.top || top < this.top) this.top = top;
    if (!this.model.left || left < this.left) this.left = left;
    if (!this.model.bottom || bottom > this.bottom) this.bottom = bottom;
    if (!this.model.right || right > this.right) this.right = right;
  }

  expandRow(row) {
    if (row) {
      const {dimensions, number} = row;
      if (dimensions) {
        this.expand(number, dimensions.min, number, dimensions.max);
      }
    }
  }

  expandToAddress(addressStr) {
    const address = colCache.decodeEx(addressStr);
    this.expand(address.row, address.col, address.row, address.col);
  }

  get tl() {
    return colCache.n2l(this.left) + this.top;
  }

  get $t$l() {
    return `$${colCache.n2l(this.left)}$${this.top}`;
  }

  get br() {
    return colCache.n2l(this.right) + this.bottom;
  }

  get $b$r() {
    return `$${colCache.n2l(this.right)}$${this.bottom}`;
  }

  get range() {
    return `${this._serialisedSheetName + this.tl}:${this.br}`;
  }

  get $range() {
    return `${this._serialisedSheetName + this.$t$l}:${this.$b$r}`;
  }

  get shortRange() {
    return this.count > 1 ? this.range : this._serialisedSheetName + this.tl;
  }

  get $shortRange() {
    return this.count > 1 ? this.$range : this._serialisedSheetName + this.$t$l;
  }

  get count() {
    return (1 + this.bottom - this.top) * (1 + this.right - this.left);
  }

  toString() {
    return this.range;
  }

  intersects(other) {
    if (other.sheetName && this.sheetName && other.sheetName !== this.sheetName) return false;
    if (other.bottom < this.top) return false;
    if (other.top > this.bottom) return false;
    if (other.right < this.left) return false;
    if (other.left > this.right) return false;
    return true;
  }

  contains(addressStr) {
    const address = colCache.decodeEx(addressStr);
    return this.containsEx(address);
  }

  containsEx(address) {
    if (address.sheetName && this.sheetName && address.sheetName !== this.sheetName) return false;
    return (
      address.row >= this.top &&
      address.row <= this.bottom &&
      address.col >= this.left &&
      address.col <= this.right
    );
  }

  forEachAddress(cb) {
    for (let col = this.left; col <= this.right; col++) {
      for (let row = this.top; row <= this.bottom; row++) {
        cb(colCache.encodeAddress(row, col), row, col);
      }
    }
  }
}

module.exports = Range;

}, function(modId) { var map = {"../utils/col-cache":1676879951316}; return __REQUIRE__(map[modId], modId); })
__DEFINE__(1676879951318, function(require, module, exports) {


const _ = require('../utils/under-dash');

const Enums = require('./enums');
const colCache = require('../utils/col-cache');
const Cell = require('./cell');

class Row {
  constructor(worksheet, number) {
    this._worksheet = worksheet;
    this._number = number;
    this._cells = [];
    this.style = {};
    this.outlineLevel = 0;
  }

  // return the row number
  get number() {
    return this._number;
  }

  get worksheet() {
    return this._worksheet;
  }

  // Inform Streaming Writer that this row (and all rows before it) are complete
  // and ready to write. Has no effect on Worksheet document
  commit() {
    this._worksheet._commitRow(this); // eslint-disable-line no-underscore-dangle
  }

  // helps GC by breaking cyclic references
  destroy() {
    delete this._worksheet;
    delete this._cells;
    delete this.style;
  }

  findCell(colNumber) {
    return this._cells[colNumber - 1];
  }

  // given {address, row, col}, find or create new cell
  getCellEx(address) {
    let cell = this._cells[address.col - 1];
    if (!cell) {
      const column = this._worksheet.getColumn(address.col);
      cell = new Cell(this, column, address.address);
      this._cells[address.col - 1] = cell;
    }
    return cell;
  }

  // get cell by key, letter or column number
  getCell(col) {
    if (typeof col === 'string') {
      // is it a key?
      const column = this._worksheet.getColumnKey(col);
      if (column) {
        col = column.number;
      } else {
        col = colCache.l2n(col);
      }
    }
    return (
      this._cells[col - 1] ||
      this.getCellEx({
        address: colCache.encodeAddress(this._number, col),
        row: this._number,
        col,
      })
    );
  }

  // remove cell(s) and shift all higher cells down by count
  splice(start, count, ...inserts) {
    const nKeep = start + count;
    const nExpand = inserts.length - count;
    const nEnd = this._cells.length;
    let i;
    let cSrc;
    let cDst;

    if (nExpand < 0) {
      // remove cells
      for (i = start + inserts.length; i <= nEnd; i++) {
        cDst = this._cells[i - 1];
        cSrc = this._cells[i - nExpand - 1];
        if (cSrc) {
          cDst = this.getCell(i);
          cDst.value = cSrc.value;
          cDst.style = cSrc.style;
          // eslint-disable-next-line no-underscore-dangle
          cDst._comment = cSrc._comment;
        } else if (cDst) {
          cDst.value = null;
          cDst.style = {};
          // eslint-disable-next-line no-underscore-dangle
          cDst._comment = undefined;
        }
      }
    } else if (nExpand > 0) {
      // insert new cells
      for (i = nEnd; i >= nKeep; i--) {
        cSrc = this._cells[i - 1];
        if (cSrc) {
          cDst = this.getCell(i + nExpand);
          cDst.value = cSrc.value;
          cDst.style = cSrc.style;
          // eslint-disable-next-line no-underscore-dangle
          cDst._comment = cSrc._comment;
        } else {
          this._cells[i + nExpand - 1] = undefined;
        }
      }
    }

    // now add the new values
    for (i = 0; i < inserts.length; i++) {
      cDst = this.getCell(start + i);
      cDst.value = inserts[i];
      cDst.style = {};
      // eslint-disable-next-line no-underscore-dangle
      cDst._comment = undefined;
    }
  }

  // Iterate over all non-null cells in this row
  eachCell(options, iteratee) {
    if (!iteratee) {
      iteratee = options;
      options = null;
    }
    if (options && options.includeEmpty) {
      const n = this._cells.length;
      for (let i = 1; i <= n; i++) {
        iteratee(this.getCell(i), i);
      }
    } else {
      this._cells.forEach((cell, index) => {
        if (cell && cell.type !== Enums.ValueType.Null) {
          iteratee(cell, index + 1);
        }
      });
    }
  }

  // ===========================================================================
  // Page Breaks
  addPageBreak(lft, rght) {
    const ws = this._worksheet;
    const left = Math.max(0, lft - 1) || 0;
    const right = Math.max(0, rght - 1) || 16838;
    const pb = {
      id: this._number,
      max: right,
      man: 1,
    };
    if (left) pb.min = left;

    ws.rowBreaks.push(pb);
  }

  // return a sparse array of cell values
  get values() {
    const values = [];
    this._cells.forEach(cell => {
      if (cell && cell.type !== Enums.ValueType.Null) {
        values[cell.col] = cell.value;
      }
    });
    return values;
  }

  // set the values by contiguous or sparse array, or by key'd object literal
  set values(value) {
    // this operation is not additive - any prior cells are removed
    this._cells = [];
    if (!value) {
      // empty row
    } else if (value instanceof Array) {
      let offset = 0;
      if (value.hasOwnProperty('0')) {
        // contiguous array - start at column 1
        offset = 1;
      }
      value.forEach((item, index) => {
        if (item !== undefined) {
          this.getCellEx({
            address: colCache.encodeAddress(this._number, index + offset),
            row: this._number,
            col: index + offset,
          }).value = item;
        }
      });
    } else {
      // assume object with column keys
      this._worksheet.eachColumnKey((column, key) => {
        if (value[key] !== undefined) {
          this.getCellEx({
            address: colCache.encodeAddress(this._number, column.number),
            row: this._number,
            col: column.number,
          }).value = value[key];
        }
      });
    }
  }

  // returns true if the row includes at least one cell with a value
  get hasValues() {
    return _.some(this._cells, cell => cell && cell.type !== Enums.ValueType.Null);
  }

  get cellCount() {
    return this._cells.length;
  }

  get actualCellCount() {
    let count = 0;
    this.eachCell(() => {
      count++;
    });
    return count;
  }

  // get the min and max column number for the non-null cells in this row or null
  get dimensions() {
    let min = 0;
    let max = 0;
    this._cells.forEach(cell => {
      if (cell && cell.type !== Enums.ValueType.Null) {
        if (!min || min > cell.col) {
          min = cell.col;
        }
        if (max < cell.col) {
          max = cell.col;
        }
      }
    });
    return min > 0
      ? {
          min,
          max,
        }
      : null;
  }

  // =========================================================================
  // styles
  _applyStyle(name, value) {
    this.style[name] = value;
    this._cells.forEach(cell => {
      if (cell) {
        cell[name] = value;
      }
    });
    return value;
  }

  get numFmt() {
    return this.style.numFmt;
  }

  set numFmt(value) {
    this._applyStyle('numFmt', value);
  }

  get font() {
    return this.style.font;
  }

  set font(value) {
    this._applyStyle('font', value);
  }

  get alignment() {
    return this.style.alignment;
  }

  set alignment(value) {
    this._applyStyle('alignment', value);
  }

  get protection() {
    return this.style.protection;
  }

  set protection(value) {
    this._applyStyle('protection', value);
  }

  get border() {
    return this.style.border;
  }

  set border(value) {
    this._applyStyle('border', value);
  }

  get fill() {
    return this.style.fill;
  }

  set fill(value) {
    this._applyStyle('fill', value);
  }

  get hidden() {
    return !!this._hidden;
  }

  set hidden(value) {
    this._hidden = value;
  }

  get outlineLevel() {
    return this._outlineLevel || 0;
  }

  set outlineLevel(value) {
    this._outlineLevel = value;
  }

  get collapsed() {
    return !!(
      this._outlineLevel && this._outlineLevel >= this._worksheet.properties.outlineLevelRow
    );
  }

  // =========================================================================
  get model() {
    const cells = [];
    let min = 0;
    let max = 0;
    this._cells.forEach(cell => {
      if (cell) {
        const cellModel = cell.model;
        if (cellModel) {
          if (!min || min > cell.col) {
            min = cell.col;
          }
          if (max < cell.col) {
            max = cell.col;
          }
          cells.push(cellModel);
        }
      }
    });

    return this.height || cells.length
      ? {
          cells,
          number: this.number,
          min,
          max,
          height: this.height,
          style: this.style,
          hidden: this.hidden,
          outlineLevel: this.outlineLevel,
          collapsed: this.collapsed,
        }
      : null;
  }

  set model(value) {
    if (value.number !== this._number) {
      throw new Error('Invalid row number in model');
    }
    this._cells = [];
    let previousAddress;
    value.cells.forEach(cellModel => {
      switch (cellModel.type) {
        case Cell.Types.Merge:
          // special case - don't add this types
          break;
        default: {
          let address;
          if (cellModel.address) {
            address = colCache.decodeAddress(cellModel.address);
          } else if (previousAddress) {
            // This is a <c> element without an r attribute
            // Assume that it's the cell for the next column
            const {row} = previousAddress;
            const col = previousAddress.col + 1;
            address = {
              row,
              col,
              address: colCache.encodeAddress(row, col),
              $col$row: `$${colCache.n2l(col)}$${row}`,
            };
          }
          previousAddress = address;
          const cell = this.getCellEx(address);
          cell.model = cellModel;
          break;
        }
      }
    });

    if (value.height) {
      this.height = value.height;
    } else {
      delete this.height;
    }

    this.hidden = value.hidden;
    this.outlineLevel = value.outlineLevel || 0;

    this.style = (value.style && JSON.parse(JSON.stringify(value.style))) || {};
  }
}

module.exports = Row;

}, function(modId) { var map = {"../utils/under-dash":1676879951315,"./enums":1676879951319,"../utils/col-cache":1676879951316,"./cell":1676879951320}; return __REQUIRE__(map[modId], modId); })
__DEFINE__(1676879951319, function(require, module, exports) {


module.exports = {
  ValueType: {
    Null: 0,
    Merge: 1,
    Number: 2,
    String: 3,
    Date: 4,
    Hyperlink: 5,
    Formula: 6,
    SharedString: 7,
    RichText: 8,
    Boolean: 9,
    Error: 10,
  },
  FormulaType: {
    None: 0,
    Master: 1,
    Shared: 2,
  },
  RelationshipType: {
    None: 0,
    OfficeDocument: 1,
    Worksheet: 2,
    CalcChain: 3,
    SharedStrings: 4,
    Styles: 5,
    Theme: 6,
    Hyperlink: 7,
  },
  DocumentType: {
    Xlsx: 1,
  },
  ReadingOrder: {
    LeftToRight: 1,
    RightToLeft: 2,
  },
  ErrorValue: {
    NotApplicable: '#N/A',
    Ref: '#REF!',
    Name: '#NAME?',
    DivZero: '#DIV/0!',
    Null: '#NULL!',
    Value: '#VALUE!',
    Num: '#NUM!',
  },
};

}, function(modId) { var map = {}; return __REQUIRE__(map[modId], modId); })
__DEFINE__(1676879951320, function(require, module, exports) {
/* eslint-disable max-classes-per-file */
const colCache = require('../utils/col-cache');
const _ = require('../utils/under-dash');
const Enums = require('./enums');
const {slideFormula} = require('../utils/shared-formula');
const Note = require('./note');
// Cell requirements
//  Operate inside a worksheet
//  Store and retrieve a value with a range of types: text, number, date, hyperlink, reference, formula, etc.
//  Manage/use and manipulate cell format either as local to cell or inherited from column or row.

class Cell {
  constructor(row, column, address) {
    if (!row || !column) {
      throw new Error('A Cell needs a Row');
    }

    this._row = row;
    this._column = column;

    colCache.validateAddress(address);
    this._address = address;

    // TODO: lazy evaluation of this._value
    this._value = Value.create(Cell.Types.Null, this);

    this.style = this._mergeStyle(row.style, column.style, {});

    this._mergeCount = 0;
  }

  get worksheet() {
    return this._row.worksheet;
  }

  get workbook() {
    return this._row.worksheet.workbook;
  }

  // help GC by removing cyclic (and other) references
  destroy() {
    delete this.style;
    delete this._value;
    delete this._row;
    delete this._column;
    delete this._address;
  }

  // =========================================================================
  // Styles stuff
  get numFmt() {
    return this.style.numFmt;
  }

  set numFmt(value) {
    this.style.numFmt = value;
  }

  get font() {
    return this.style.font;
  }

  set font(value) {
    this.style.font = value;
  }

  get alignment() {
    return this.style.alignment;
  }

  set alignment(value) {
    this.style.alignment = value;
  }

  get border() {
    return this.style.border;
  }

  set border(value) {
    this.style.border = value;
  }

  get fill() {
    return this.style.fill;
  }

  set fill(value) {
    this.style.fill = value;
  }

  get protection() {
    return this.style.protection;
  }

  set protection(value) {
    this.style.protection = value;
  }

  _mergeStyle(rowStyle, colStyle, style) {
    const numFmt = (rowStyle && rowStyle.numFmt) || (colStyle && colStyle.numFmt);
    if (numFmt) style.numFmt = numFmt;

    const font = (rowStyle && rowStyle.font) || (colStyle && colStyle.font);
    if (font) style.font = font;

    const alignment = (rowStyle && rowStyle.alignment) || (colStyle && colStyle.alignment);
    if (alignment) style.alignment = alignment;

    const border = (rowStyle && rowStyle.border) || (colStyle && colStyle.border);
    if (border) style.border = border;

    const fill = (rowStyle && rowStyle.fill) || (colStyle && colStyle.fill);
    if (fill) style.fill = fill;

    const protection = (rowStyle && rowStyle.protection) || (colStyle && colStyle.protection);
    if (protection) style.protection = protection;

    return style;
  }

  // =========================================================================
  // return the address for this cell
  get address() {
    return this._address;
  }

  get row() {
    return this._row.number;
  }

  get col() {
    return this._column.number;
  }

  get $col$row() {
    return `$${this._column.letter}$${this.row}`;
  }

  // =========================================================================
  // Value stuff

  get type() {
    return this._value.type;
  }

  get effectiveType() {
    return this._value.effectiveType;
  }

  toCsvString() {
    return this._value.toCsvString();
  }

  // =========================================================================
  // Merge stuff

  addMergeRef() {
    this._mergeCount++;
  }

  releaseMergeRef() {
    this._mergeCount--;
  }

  get isMerged() {
    return this._mergeCount > 0 || this.type === Cell.Types.Merge;
  }

  merge(master, ignoreStyle) {
    this._value.release();
    this._value = Value.create(Cell.Types.Merge, this, master);
    if (!ignoreStyle) {
      this.style = master.style;
    }
  }

  unmerge() {
    if (this.type === Cell.Types.Merge) {
      this._value.release();
      this._value = Value.create(Cell.Types.Null, this);
      this.style = this._mergeStyle(this._row.style, this._column.style, {});
    }
  }

  isMergedTo(master) {
    if (this._value.type !== Cell.Types.Merge) return false;
    return this._value.isMergedTo(master);
  }

  get master() {
    if (this.type === Cell.Types.Merge) {
      return this._value.master;
    }
    return this; // an unmerged cell is its own master
  }

  get isHyperlink() {
    return this._value.type === Cell.Types.Hyperlink;
  }

  get hyperlink() {
    return this._value.hyperlink;
  }

  // return the value
  get value() {
    return this._value.value;
  }

  // set the value - can be number, string or raw
  set value(v) {
    // special case - merge cells set their master's value
    if (this.type === Cell.Types.Merge) {
      this._value.master.value = v;
      return;
    }

    this._value.release();

    // assign value
    this._value = Value.create(Value.getType(v), this, v);
  }

  get note() {
    return this._comment && this._comment.note;
  }

  set note(note) {
    this._comment = new Note(note);
  }

  get text() {
    return this._value.toString();
  }

  get html() {
    return _.escapeHtml(this.text);
  }

  toString() {
    return this.text;
  }

  _upgradeToHyperlink(hyperlink) {
    // if this cell is a string, turn it into a Hyperlink
    if (this.type === Cell.Types.String) {
      this._value = Value.create(Cell.Types.Hyperlink, this, {
        text: this._value.value,
        hyperlink,
      });
    }
  }

  // =========================================================================
  // Formula stuff
  get formula() {
    return this._value.formula;
  }

  get result() {
    return this._value.result;
  }

  get formulaType() {
    return this._value.formulaType;
  }

  // =========================================================================
  // Name stuff
  get fullAddress() {
    const {worksheet} = this._row;
    return {
      sheetName: worksheet.name,
      address: this.address,
      row: this.row,
      col: this.col,
    };
  }

  get name() {
    return this.names[0];
  }

  set name(value) {
    this.names = [value];
  }

  get names() {
    return this.workbook.definedNames.getNamesEx(this.fullAddress);
  }

  set names(value) {
    const {definedNames} = this.workbook;
    definedNames.removeAllNames(this.fullAddress);
    value.forEach(name => {
      definedNames.addEx(this.fullAddress, name);
    });
  }

  addName(name) {
    this.workbook.definedNames.addEx(this.fullAddress, name);
  }

  removeName(name) {
    this.workbook.definedNames.removeEx(this.fullAddress, name);
  }

  removeAllNames() {
    this.workbook.definedNames.removeAllNames(this.fullAddress);
  }

  // =========================================================================
  // Data Validation stuff
  get _dataValidations() {
    return this.worksheet.dataValidations;
  }

  get dataValidation() {
    return this._dataValidations.find(this.address);
  }

  set dataValidation(value) {
    this._dataValidations.add(this.address, value);
  }

  // =========================================================================
  // Model stuff

  get model() {
    const {model} = this._value;
    model.style = this.style;
    if (this._comment) {
      model.comment = this._comment.model;
    }
    return model;
  }

  set model(value) {
    this._value.release();
    this._value = Value.create(value.type, this);
    this._value.model = value;

    if (value.comment) {
      switch (value.comment.type) {
        case 'note':
          this._comment = Note.fromModel(value.comment);
          break;
      }
    }

    if (value.style) {
      this.style = value.style;
    } else {
      this.style = {};
    }
  }
}
Cell.Types = Enums.ValueType;

// =============================================================================
// Internal Value Types

class NullValue {
  constructor(cell) {
    this.model = {
      address: cell.address,
      type: Cell.Types.Null,
    };
  }

  get value() {
    return null;
  }

  set value(value) {
    // nothing to do
  }

  get type() {
    return Cell.Types.Null;
  }

  get effectiveType() {
    return Cell.Types.Null;
  }

  get address() {
    return this.model.address;
  }

  set address(value) {
    this.model.address = value;
  }

  toCsvString() {
    return '';
  }

  release() {}

  toString() {
    return '';
  }
}

class NumberValue {
  constructor(cell, value) {
    this.model = {
      address: cell.address,
      type: Cell.Types.Number,
      value,
    };
  }

  get value() {
    return this.model.value;
  }

  set value(value) {
    this.model.value = value;
  }

  get type() {
    return Cell.Types.Number;
  }

  get effectiveType() {
    return Cell.Types.Number;
  }

  get address() {
    return this.model.address;
  }

  set address(value) {
    this.model.address = value;
  }

  toCsvString() {
    return this.model.value.toString();
  }

  release() {}

  toString() {
    return this.model.value.toString();
  }
}

class StringValue {
  constructor(cell, value) {
    this.model = {
      address: cell.address,
      type: Cell.Types.String,
      value,
    };
  }

  get value() {
    return this.model.value;
  }

  set value(value) {
    this.model.value = value;
  }

  get type() {
    return Cell.Types.String;
  }

  get effectiveType() {
    return Cell.Types.String;
  }

  get address() {
    return this.model.address;
  }

  set address(value) {
    this.model.address = value;
  }

  toCsvString() {
    return `"${this.model.value.replace(/"/g, '""')}"`;
  }

  release() {}

  toString() {
    return this.model.value;
  }
}

class RichTextValue {
  constructor(cell, value) {
    this.model = {
      address: cell.address,
      type: Cell.Types.String,
      value,
    };
  }

  get value() {
    return this.model.value;
  }

  set value(value) {
    this.model.value = value;
  }

  toString() {
    return this.model.value.richText.map(t => t.text).join('');
  }

  get type() {
    return Cell.Types.RichText;
  }

  get effectiveType() {
    return Cell.Types.RichText;
  }

  get address() {
    return this.model.address;
  }

  set address(value) {
    this.model.address = value;
  }

  toCsvString() {
    return `"${this.text.replace(/"/g, '""')}"`;
  }

  release() {}
}

class DateValue {
  constructor(cell, value) {
    this.model = {
      address: cell.address,
      type: Cell.Types.Date,
      value,
    };
  }

  get value() {
    return this.model.value;
  }

  set value(value) {
    this.model.value = value;
  }

  get type() {
    return Cell.Types.Date;
  }

  get effectiveType() {
    return Cell.Types.Date;
  }

  get address() {
    return this.model.address;
  }

  set address(value) {
    this.model.address = value;
  }

  toCsvString() {
    return this.model.value.toISOString();
  }

  release() {}

  toString() {
    return this.model.value.toString();
  }
}

class HyperlinkValue {
  constructor(cell, value) {
    this.model = {
      address: cell.address,
      type: Cell.Types.Hyperlink,
      text: value ? value.text : undefined,
      hyperlink: value ? value.hyperlink : undefined,
    };
    if (value && value.tooltip) {
      this.model.tooltip = value.tooltip;
    }
  }

  get value() {
    const v = {
      text: this.model.text,
      hyperlink: this.model.hyperlink,
    };
    if (this.model.tooltip) {
      v.tooltip = this.model.tooltip;
    }
    return v;
  }

  set value(value) {
    this.model = {
      text: value.text,
      hyperlink: value.hyperlink,
    };
    if (value.tooltip) {
      this.model.tooltip = value.tooltip;
    }
  }

  get text() {
    return this.model.text;
  }

  set text(value) {
    this.model.text = value;
  }

  /*
  get tooltip() {
    return this.model.tooltip;
  }

  set tooltip(value) {
    this.model.tooltip = value;
  } */

  get hyperlink() {
    return this.model.hyperlink;
  }

  set hyperlink(value) {
    this.model.hyperlink = value;
  }

  get type() {
    return Cell.Types.Hyperlink;
  }

  get effectiveType() {
    return Cell.Types.Hyperlink;
  }

  get address() {
    return this.model.address;
  }

  set address(value) {
    this.model.address = value;
  }

  toCsvString() {
    return this.model.hyperlink;
  }

  release() {}

  toString() {
    return this.model.text;
  }
}

class MergeValue {
  constructor(cell, master) {
    this.model = {
      address: cell.address,
      type: Cell.Types.Merge,
      master: master ? master.address : undefined,
    };
    this._master = master;
    if (master) {
      master.addMergeRef();
    }
  }

  get value() {
    return this._master.value;
  }

  set value(value) {
    if (value instanceof Cell) {
      if (this._master) {
        this._master.releaseMergeRef();
      }
      value.addMergeRef();
      this._master = value;
    } else {
      this._master.value = value;
    }
  }

  isMergedTo(master) {
    return master === this._master;
  }

  get master() {
    return this._master;
  }

  get type() {
    return Cell.Types.Merge;
  }

  get effectiveType() {
    return this._master.effectiveType;
  }

  get address() {
    return this.model.address;
  }

  set address(value) {
    this.model.address = value;
  }

  toCsvString() {
    return '';
  }

  release() {
    this._master.releaseMergeRef();
  }

  toString() {
    return this.value.toString();
  }
}

class FormulaValue {
  constructor(cell, value) {
    this.cell = cell;

    this.model = {
      address: cell.address,
      type: Cell.Types.Formula,
      shareType: value ? value.shareType : undefined,
      ref: value ? value.ref : undefined,
      formula: value ? value.formula : undefined,
      sharedFormula: value ? value.sharedFormula : undefined,
      result: value ? value.result : undefined,
    };
  }

  _copyModel(model) {
    const copy = {};
    const cp = name => {
      const value = model[name];
      if (value) {
        copy[name] = value;
      }
    };
    cp('formula');
    cp('result');
    cp('ref');
    cp('shareType');
    cp('sharedFormula');
    return copy;
  }

  get value() {
    return this._copyModel(this.model);
  }

  set value(value) {
    this.model = this._copyModel(value);
  }

  validate(value) {
    switch (Value.getType(value)) {
      case Cell.Types.Null:
      case Cell.Types.String:
      case Cell.Types.Number:
      case Cell.Types.Date:
        break;
      case Cell.Types.Hyperlink:
      case Cell.Types.Formula:
      default:
        throw new Error('Cannot process that type of result value');
    }
  }

  get dependencies() {
    // find all the ranges and cells mentioned in the formula
    const ranges = this.formula.match(/([a-zA-Z0-9]+!)?[A-Z]{1,3}\d{1,4}:[A-Z]{1,3}\d{1,4}/g);
    const cells = this.formula
      .replace(/([a-zA-Z0-9]+!)?[A-Z]{1,3}\d{1,4}:[A-Z]{1,3}\d{1,4}/g, '')
      .match(/([a-zA-Z0-9]+!)?[A-Z]{1,3}\d{1,4}/g);
    return {
      ranges,
      cells,
    };
  }

  get formula() {
    return this.model.formula || this._getTranslatedFormula();
  }

  set formula(value) {
    this.model.formula = value;
  }

  get formulaType() {
    if (this.model.formula) {
      return Enums.FormulaType.Master;
    }
    if (this.model.sharedFormula) {
      return Enums.FormulaType.Shared;
    }
    return Enums.FormulaType.None;
  }

  get result() {
    return this.model.result;
  }

  set result(value) {
    this.model.result = value;
  }

  get type() {
    return Cell.Types.Formula;
  }

  get effectiveType() {
    const v = this.model.result;
    if (v === null || v === undefined) {
      return Enums.ValueType.Null;
    }
    if (v instanceof String || typeof v === 'string') {
      return Enums.ValueType.String;
    }
    if (typeof v === 'number') {
      return Enums.ValueType.Number;
    }
    if (v instanceof Date) {
      return Enums.ValueType.Date;
    }
    if (v.text && v.hyperlink) {
      return Enums.ValueType.Hyperlink;
    }
    if (v.formula) {
      return Enums.ValueType.Formula;
    }

    return Enums.ValueType.Null;
  }

  get address() {
    return this.model.address;
  }

  set address(value) {
    this.model.address = value;
  }

  _getTranslatedFormula() {
    if (!this._translatedFormula && this.model.sharedFormula) {
      const {worksheet} = this.cell;
      const master = worksheet.findCell(this.model.sharedFormula);
      this._translatedFormula =
        master && slideFormula(master.formula, master.address, this.model.address);
    }
    return this._translatedFormula;
  }

  toCsvString() {
    return `${this.model.result || ''}`;
  }

  release() {}

  toString() {
    return this.model.result ? this.model.result.toString() : '';
  }
}

class SharedStringValue {
  constructor(cell, value) {
    this.model = {
      address: cell.address,
      type: Cell.Types.SharedString,
      value,
    };
  }

  get value() {
    return this.model.value;
  }

  set value(value) {
    this.model.value = value;
  }

  get type() {
    return Cell.Types.SharedString;
  }

  get effectiveType() {
    return Cell.Types.SharedString;
  }

  get address() {
    return this.model.address;
  }

  set address(value) {
    this.model.address = value;
  }

  toCsvString() {
    return this.model.value.toString();
  }

  release() {}

  toString() {
    return this.model.value.toString();
  }
}

class BooleanValue {
  constructor(cell, value) {
    this.model = {
      address: cell.address,
      type: Cell.Types.Boolean,
      value,
    };
  }

  get value() {
    return this.model.value;
  }

  set value(value) {
    this.model.value = value;
  }

  get type() {
    return Cell.Types.Boolean;
  }

  get effectiveType() {
    return Cell.Types.Boolean;
  }

  get address() {
    return this.model.address;
  }

  set address(value) {
    this.model.address = value;
  }

  toCsvString() {
    return this.model.value ? 1 : 0;
  }

  release() {}

  toString() {
    return this.model.value.toString();
  }
}

class ErrorValue {
  constructor(cell, value) {
    this.model = {
      address: cell.address,
      type: Cell.Types.Error,
      value,
    };
  }

  get value() {
    return this.model.value;
  }

  set value(value) {
    this.model.value = value;
  }

  get type() {
    return Cell.Types.Error;
  }

  get effectiveType() {
    return Cell.Types.Error;
  }

  get address() {
    return this.model.address;
  }

  set address(value) {
    this.model.address = value;
  }

  toCsvString() {
    return this.toString();
  }

  release() {}

  toString() {
    return this.model.value.error.toString();
  }
}

class JSONValue {
  constructor(cell, value) {
    this.model = {
      address: cell.address,
      type: Cell.Types.String,
      value: JSON.stringify(value),
      rawValue: value,
    };
  }

  get value() {
    return this.model.rawValue;
  }

  set value(value) {
    this.model.rawValue = value;
    this.model.value = JSON.stringify(value);
  }

  get type() {
    return Cell.Types.String;
  }

  get effectiveType() {
    return Cell.Types.String;
  }

  get address() {
    return this.model.address;
  }

  set address(value) {
    this.model.address = value;
  }

  toCsvString() {
    return this.model.value;
  }

  release() {}

  toString() {
    return this.model.value;
  }
}

// Value is a place to hold common static Value type functions
const Value = {
  getType(value) {
    if (value === null || value === undefined) {
      return Cell.Types.Null;
    }
    if (value instanceof String || typeof value === 'string') {
      return Cell.Types.String;
    }
    if (typeof value === 'number') {
      return Cell.Types.Number;
    }
    if (typeof value === 'boolean') {
      return Cell.Types.Boolean;
    }
    if (value instanceof Date) {
      return Cell.Types.Date;
    }
    if (value.text && value.hyperlink) {
      return Cell.Types.Hyperlink;
    }
    if (value.formula || value.sharedFormula) {
      return Cell.Types.Formula;
    }
    if (value.richText) {
      return Cell.Types.RichText;
    }
    if (value.sharedString) {
      return Cell.Types.SharedString;
    }
    if (value.error) {
      return Cell.Types.Error;
    }
    return Cell.Types.JSON;
  },

  // map valueType to constructor
  types: [
    {t: Cell.Types.Null, f: NullValue},
    {t: Cell.Types.Number, f: NumberValue},
    {t: Cell.Types.String, f: StringValue},
    {t: Cell.Types.Date, f: DateValue},
    {t: Cell.Types.Hyperlink, f: HyperlinkValue},
    {t: Cell.Types.Formula, f: FormulaValue},
    {t: Cell.Types.Merge, f: MergeValue},
    {t: Cell.Types.JSON, f: JSONValue},
    {t: Cell.Types.SharedString, f: SharedStringValue},
    {t: Cell.Types.RichText, f: RichTextValue},
    {t: Cell.Types.Boolean, f: BooleanValue},
    {t: Cell.Types.Error, f: ErrorValue},
  ].reduce((p, t) => {
    p[t.t] = t.f;
    return p;
  }, []),

  create(type, cell, value) {
    const T = this.types[type];
    if (!T) {
      throw new Error(`Could not create Value of type ${type}`);
    }
    return new T(cell, value);
  },
};

module.exports = Cell;

}, function(modId) { var map = {"../utils/col-cache":1676879951316,"../utils/under-dash":1676879951315,"./enums":1676879951319,"../utils/shared-formula":1676879951321,"./note":1676879951322}; return __REQUIRE__(map[modId], modId); })
__DEFINE__(1676879951321, function(require, module, exports) {
const colCache = require('./col-cache');

// const cellRefRegex = /(([a-z_\-0-9]*)!)?[$]?([a-z]+)[$]?([1-9][0-9]*)/i;
const replacementCandidateRx = /(([a-z_\-0-9]*)!)?([a-z0-9_$]{2,})([(])?/gi;
const CRrx = /^([$])?([a-z]+)([$])?([1-9][0-9]*)$/i;

function slideFormula(formula, fromCell, toCell) {
  const offset = colCache.decode(fromCell);
  const to = colCache.decode(toCell);
  return formula.replace(
    replacementCandidateRx,
    (refMatch, sheet, sheetMaybe, addrPart, trailingParen) => {
      if (trailingParen) {
        return refMatch;
      }
      const match = CRrx.exec(addrPart);
      if (match) {
        const colDollar = match[1];
        const colStr = match[2].toUpperCase();
        const rowDollar = match[3];
        const rowStr = match[4];
        if (colStr.length > 3 || (colStr.length === 3 && colStr > 'XFD')) {
          // > XFD is the highest col number in excel 2007 and beyond, so this is a named range
          return refMatch;
        }
        let col = colCache.l2n(colStr);
        let row = parseInt(rowStr, 10);
        if (!colDollar) {
          col += to.col - offset.col;
        }
        if (!rowDollar) {
          row += to.row - offset.row;
        }
        const res = (sheet || '') + (colDollar || '') + colCache.n2l(col) + (rowDollar || '') + row;
        return res;
      }
      return refMatch;
    }
  );
}

module.exports = {
  slideFormula,
};

}, function(modId) { var map = {"./col-cache":1676879951316}; return __REQUIRE__(map[modId], modId); })
__DEFINE__(1676879951322, function(require, module, exports) {
const _ = require('../utils/under-dash');

class Note {
  constructor(note) {
    this.note = note;
  }

  get model() {
    let value = null;
    switch (typeof this.note) {
      case 'string':
        value = {
          type: 'note',
          note: {
            texts: [
              {
                text: this.note,
              },
            ],
          },
        };
        break;
      default:
        value = {
          type: 'note',
          note: this.note,
        };
        break;
    }
    // Suitable for all cell comments
    return _.deepMerge({}, Note.DEFAULT_CONFIGS, value);
  }

  set model(value) {
    const {note} = value;
    const {texts} = note;
    if (texts.length === 1 && Object.keys(texts[0]).length === 1) {
      this.note = texts[0].text;
    } else {
      this.note = note;
    }
  }

  static fromModel(model) {
    const note = new Note();
    note.model = model;
    return note;
  }
}

Note.DEFAULT_CONFIGS = {
  note: {
    margins: {
      insetmode: 'auto',
      inset: [0.13, 0.13, 0.25, 0.25],
    },
    protection: {
      locked: 'True',
      lockText: 'True',
    },
    editAs: 'absolute',
  },
};

module.exports = Note;

}, function(modId) { var map = {"../utils/under-dash":1676879951315}; return __REQUIRE__(map[modId], modId); })
__DEFINE__(1676879951323, function(require, module, exports) {


const _ = require('../utils/under-dash');

const Enums = require('./enums');
const colCache = require('../utils/col-cache');

const DEFAULT_COLUMN_WIDTH = 9;

// Column defines the column properties for 1 column.
// This includes header rows, widths, key, (style), etc.
// Worksheet will condense the columns as appropriate during serialization
class Column {
  constructor(worksheet, number, defn) {
    this._worksheet = worksheet;
    this._number = number;
    if (defn !== false) {
      // sometimes defn will follow
      this.defn = defn;
    }
  }

  get number() {
    return this._number;
  }

  get worksheet() {
    return this._worksheet;
  }

  get letter() {
    return colCache.n2l(this._number);
  }

  get isCustomWidth() {
    return this.width !== undefined && this.width !== DEFAULT_COLUMN_WIDTH;
  }

  get defn() {
    return {
      header: this._header,
      key: this.key,
      width: this.width,
      style: this.style,
      hidden: this.hidden,
      outlineLevel: this.outlineLevel,
    };
  }

  set defn(value) {
    if (value) {
      this.key = value.key;
      this.width = value.width !== undefined ? value.width : DEFAULT_COLUMN_WIDTH;
      this.outlineLevel = value.outlineLevel;
      if (value.style) {
        this.style = value.style;
      } else {
        this.style = {};
      }

      // headers must be set after style
      this.header = value.header;
      this._hidden = !!value.hidden;
    } else {
      delete this._header;
      delete this._key;
      delete this.width;
      this.style = {};
      this.outlineLevel = 0;
    }
  }

  get headers() {
    return this._header && this._header instanceof Array ? this._header : [this._header];
  }

  get header() {
    return this._header;
  }

  set header(value) {
    if (value !== undefined) {
      this._header = value;
      this.headers.forEach((text, index) => {
        this._worksheet.getCell(index + 1, this.number).value = text;
      });
    } else {
      this._header = undefined;
    }
  }

  get key() {
    return this._key;
  }

  set key(value) {
    const column = this._key && this._worksheet.getColumnKey(this._key);
    if (column === this) {
      this._worksheet.deleteColumnKey(this._key);
    }

    this._key = value;
    if (value) {
      this._worksheet.setColumnKey(this._key, this);
    }
  }

  get hidden() {
    return !!this._hidden;
  }

  set hidden(value) {
    this._hidden = value;
  }

  get outlineLevel() {
    return this._outlineLevel || 0;
  }

  set outlineLevel(value) {
    this._outlineLevel = value;
  }

  get collapsed() {
    return !!(
      this._outlineLevel && this._outlineLevel >= this._worksheet.properties.outlineLevelCol
    );
  }

  toString() {
    return JSON.stringify({
      key: this.key,
      width: this.width,
      headers: this.headers.length ? this.headers : undefined,
    });
  }

  equivalentTo(other) {
    return (
      this.width === other.width &&
      this.hidden === other.hidden &&
      this.outlineLevel === other.outlineLevel &&
      _.isEqual(this.style, other.style)
    );
  }

  get isDefault() {
    if (this.isCustomWidth) {
      return false;
    }
    if (this.hidden) {
      return false;
    }
    if (this.outlineLevel) {
      return false;
    }
    const s = this.style;
    if (s && (s.font || s.numFmt || s.alignment || s.border || s.fill || s.protection)) {
      return false;
    }
    return true;
  }

  get headerCount() {
    return this.headers.length;
  }

  eachCell(options, iteratee) {
    const colNumber = this.number;
    if (!iteratee) {
      iteratee = options;
      options = null;
    }
    this._worksheet.eachRow(options, (row, rowNumber) => {
      iteratee(row.getCell(colNumber), rowNumber);
    });
  }

  get values() {
    const v = [];
    this.eachCell((cell, rowNumber) => {
      if (cell && cell.type !== Enums.ValueType.Null) {
        v[rowNumber] = cell.value;
      }
    });
    return v;
  }

  set values(v) {
    if (!v) {
      return;
    }
    const colNumber = this.number;
    let offset = 0;
    if (v.hasOwnProperty('0')) {
      // assume contiguous array, start at row 1
      offset = 1;
    }
    v.forEach((value, index) => {
      this._worksheet.getCell(index + offset, colNumber).value = value;
    });
  }

  // =========================================================================
  // styles
  _applyStyle(name, value) {
    this.style[name] = value;
    this.eachCell(cell => {
      cell[name] = value;
    });
    return value;
  }

  get numFmt() {
    return this.style.numFmt;
  }

  set numFmt(value) {
    this._applyStyle('numFmt', value);
  }

  get font() {
    return this.style.font;
  }

  set font(value) {
    this._applyStyle('font', value);
  }

  get alignment() {
    return this.style.alignment;
  }

  set alignment(value) {
    this._applyStyle('alignment', value);
  }

  get protection() {
    return this.style.protection;
  }

  set protection(value) {
    this._applyStyle('protection', value);
  }

  get border() {
    return this.style.border;
  }

  set border(value) {
    this._applyStyle('border', value);
  }

  get fill() {
    return this.style.fill;
  }

  set fill(value) {
    this._applyStyle('fill', value);
  }

  // =============================================================================
  // static functions

  static toModel(columns) {
    // Convert array of Column into compressed list cols
    const cols = [];
    let col = null;
    if (columns) {
      columns.forEach((column, index) => {
        if (column.isDefault) {
          if (col) {
            col = null;
          }
        } else if (!col || !column.equivalentTo(col)) {
          col = {
            min: index + 1,
            max: index + 1,
            width: column.width !== undefined ? column.width : DEFAULT_COLUMN_WIDTH,
            style: column.style,
            isCustomWidth: column.isCustomWidth,
            hidden: column.hidden,
            outlineLevel: column.outlineLevel,
            collapsed: column.collapsed,
          };
          cols.push(col);
        } else {
          col.max = index + 1;
        }
      });
    }
    return cols.length ? cols : undefined;
  }

  static fromModel(worksheet, cols) {
    cols = cols || [];
    const columns = [];
    let count = 1;
    let index = 0;
    while (index < cols.length) {
      const col = cols[index++];
      while (count < col.min) {
        columns.push(new Column(worksheet, count++));
      }
      while (count <= col.max) {
        columns.push(new Column(worksheet, count++, col));
      }
    }
    return columns.length ? columns : null;
  }
}

module.exports = Column;

}, function(modId) { var map = {"../utils/under-dash":1676879951315,"./enums":1676879951319,"../utils/col-cache":1676879951316}; return __REQUIRE__(map[modId], modId); })
__DEFINE__(1676879951324, function(require, module, exports) {
const colCache = require('../utils/col-cache');
const Anchor = require('./anchor');

class Image {
  constructor(worksheet, model) {
    this.worksheet = worksheet;
    this.model = model;
  }

  get model() {
    switch (this.type) {
      case 'background':
        return {
          type: this.type,
          imageId: this.imageId,
        };
      case 'image':
        return {
          type: this.type,
          imageId: this.imageId,
          hyperlinks: this.range.hyperlinks,
          range: {
            tl: this.range.tl.model,
            br: this.range.br && this.range.br.model,
            ext: this.range.ext,
            editAs: this.range.editAs,
          },
        };
      default:
        throw new Error('Invalid Image Type');
    }
  }

  set model({type, imageId, range, hyperlinks}) {
    this.type = type;
    this.imageId = imageId;

    if (type === 'image') {
      if (typeof range === 'string') {
        const decoded = colCache.decode(range);
        this.range = {
          tl: new Anchor(this.worksheet, {col: decoded.left, row: decoded.top}, -1),
          br: new Anchor(this.worksheet, {col: decoded.right, row: decoded.bottom}, 0),
          editAs: 'oneCell',
        };
      } else {
        this.range = {
          tl: new Anchor(this.worksheet, range.tl, 0),
          br: range.br && new Anchor(this.worksheet, range.br, 0),
          ext: range.ext,
          editAs: range.editAs,
          hyperlinks: hyperlinks || range.hyperlinks,
        };
      }
    }
  }
}

module.exports = Image;

}, function(modId) { var map = {"../utils/col-cache":1676879951316,"./anchor":1676879951325}; return __REQUIRE__(map[modId], modId); })
__DEFINE__(1676879951325, function(require, module, exports) {


const colCache = require('../utils/col-cache');

class Anchor {
  constructor(worksheet, address, offset = 0) {
    if (!address) {
      this.nativeCol = 0;
      this.nativeColOff = 0;
      this.nativeRow = 0;
      this.nativeRowOff = 0;
    } else if (typeof address === 'string') {
      const decoded = colCache.decodeAddress(address);
      this.nativeCol = decoded.col + offset;
      this.nativeColOff = 0;
      this.nativeRow = decoded.row + offset;
      this.nativeRowOff = 0;
    } else if (address.nativeCol !== undefined) {
      this.nativeCol = address.nativeCol || 0;
      this.nativeColOff = address.nativeColOff || 0;
      this.nativeRow = address.nativeRow || 0;
      this.nativeRowOff = address.nativeRowOff || 0;
    } else if (address.col !== undefined) {
      this.col = address.col + offset;
      this.row = address.row + offset;
    } else {
      this.nativeCol = 0;
      this.nativeColOff = 0;
      this.nativeRow = 0;
      this.nativeRowOff = 0;
    }

    this.worksheet = worksheet;
  }

  static asInstance(model) {
    return model instanceof Anchor || model == null ? model : new Anchor(model);
  }

  get col() {
    return this.nativeCol + (Math.min(this.colWidth - 1, this.nativeColOff) / this.colWidth);
  }

  set col(v) {
    this.nativeCol = Math.floor(v);
    this.nativeColOff = Math.floor((v - this.nativeCol) * this.colWidth);
  }

  get row() {
    return this.nativeRow + (Math.min(this.rowHeight - 1, this.nativeRowOff) / this.rowHeight);
  }

  set row(v) {
    this.nativeRow = Math.floor(v);
    this.nativeRowOff = Math.floor((v - this.nativeRow) * this.rowHeight);
  }

  get colWidth() {
    return this.worksheet &&
      this.worksheet.getColumn(this.nativeCol + 1) &&
      this.worksheet.getColumn(this.nativeCol + 1).isCustomWidth
      ? Math.floor(this.worksheet.getColumn(this.nativeCol + 1).width * 10000)
      : 640000;
  }

  get rowHeight() {
    return this.worksheet &&
      this.worksheet.getRow(this.nativeRow + 1) &&
      this.worksheet.getRow(this.nativeRow + 1).height
      ? Math.floor(this.worksheet.getRow(this.nativeRow + 1).height * 10000)
      : 180000;
  }

  get model() {
    return {
      nativeCol: this.nativeCol,
      nativeColOff: this.nativeColOff,
      nativeRow: this.nativeRow,
      nativeRowOff: this.nativeRowOff,
    };
  }

  set model(value) {
    this.nativeCol = value.nativeCol;
    this.nativeColOff = value.nativeColOff;
    this.nativeRow = value.nativeRow;
    this.nativeRowOff = value.nativeRowOff;
  }
}

module.exports = Anchor;

}, function(modId) { var map = {"../utils/col-cache":1676879951316}; return __REQUIRE__(map[modId], modId); })
__DEFINE__(1676879951326, function(require, module, exports) {
/* eslint-disable max-classes-per-file */
const colCache = require('../utils/col-cache');

class Column {
  // wrapper around column model, allowing access and manipulation
  constructor(table, column, index) {
    this.table = table;
    this.column = column;
    this.index = index;
  }

  _set(name, value) {
    this.table.cacheState();
    this.column[name] = value;
  }

  /* eslint-disable lines-between-class-members */
  get name() {
    return this.column.name;
  }
  set name(value) {
    this._set('name', value);
  }

  get filterButton() {
    return this.column.filterButton;
  }
  set filterButton(value) {
    this.column.filterButton = value;
  }

  get style() {
    return this.column.style;
  }
  set style(value) {
    this.column.style = value;
  }

  get totalsRowLabel() {
    return this.column.totalsRowLabel;
  }
  set totalsRowLabel(value) {
    this._set('totalsRowLabel', value);
  }

  get totalsRowFunction() {
    return this.column.totalsRowFunction;
  }
  set totalsRowFunction(value) {
    this._set('totalsRowFunction', value);
  }

  get totalsRowResult() {
    return this.column.totalsRowResult;
  }
  set totalsRowResult(value) {
    this._set('totalsRowResult', value);
  }

  get totalsRowFormula() {
    return this.column.totalsRowFormula;
  }
  set totalsRowFormula(value) {
    this._set('totalsRowFormula', value);
  }
  /* eslint-enable lines-between-class-members */
}

class Table {
  constructor(worksheet, table) {
    this.worksheet = worksheet;
    if (table) {
      this.table = table;
      // check things are ok first
      this.validate();

      this.store();
    }
  }

  getFormula(column) {
    // get the correct formula to apply to the totals row
    switch (column.totalsRowFunction) {
      case 'none':
        return null;
      case 'average':
        return `SUBTOTAL(101,${this.table.name}[${column.name}])`;
      case 'countNums':
        return `SUBTOTAL(102,${this.table.name}[${column.name}])`;
      case 'count':
        return `SUBTOTAL(103,${this.table.name}[${column.name}])`;
      case 'max':
        return `SUBTOTAL(104,${this.table.name}[${column.name}])`;
      case 'min':
        return `SUBTOTAL(105,${this.table.name}[${column.name}])`;
      case 'stdDev':
        return `SUBTOTAL(106,${this.table.name}[${column.name}])`;
      case 'var':
        return `SUBTOTAL(107,${this.table.name}[${column.name}])`;
      case 'sum':
        return `SUBTOTAL(109,${this.table.name}[${column.name}])`;
      case 'custom':
        return column.totalsRowFormula;
      default:
        throw new Error(`Invalid Totals Row Function: ${column.totalsRowFunction}`);
    }
  }

  get width() {
    // width of the table
    return this.table.columns.length;
  }

  get height() {
    // height of the table data
    return this.table.rows.length;
  }

  get filterHeight() {
    // height of the table data plus optional header row
    return this.height + (this.table.headerRow ? 1 : 0);
  }

  get tableHeight() {
    // full height of the table on the sheet
    return this.filterHeight + (this.table.totalsRow ? 1 : 0);
  }

  validate() {
    const {table} = this;
    // set defaults and check is valid
    const assign = (o, name, dflt) => {
      if (o[name] === undefined) {
        o[name] = dflt;
      }
    };
    assign(table, 'headerRow', true);
    assign(table, 'totalsRow', false);

    assign(table, 'style', {});
    assign(table.style, 'theme', 'TableStyleMedium2');
    assign(table.style, 'showFirstColumn', false);
    assign(table.style, 'showLastColumn', false);
    assign(table.style, 'showRowStripes', false);
    assign(table.style, 'showColumnStripes', false);

    const assert = (test, message) => {
      if (!test) {
        throw new Error(message);
      }
    };
    assert(table.ref, 'Table must have ref');
    assert(table.columns, 'Table must have column definitions');
    assert(table.rows, 'Table must have row definitions');

    table.tl = colCache.decodeAddress(table.ref);
    const {row, col} = table.tl;
    assert(row > 0, 'Table must be on valid row');
    assert(col > 0, 'Table must be on valid col');

    const {width, filterHeight, tableHeight} = this;

    // autoFilterRef is a range that includes optional headers only
    table.autoFilterRef = colCache.encode(row, col, row + filterHeight - 1, col + width - 1);

    // tableRef is a range that includes optional headers and totals
    table.tableRef = colCache.encode(row, col, row + tableHeight - 1, col + width - 1);

    table.columns.forEach((column, i) => {
      assert(column.name, `Column ${i} must have a name`);
      if (i === 0) {
        assign(column, 'totalsRowLabel', 'Total');
      } else {
        assign(column, 'totalsRowFunction', 'none');
        column.totalsRowFormula = this.getFormula(column);
      }
    });
  }

  store() {
    // where the table needs to store table data, headers, footers in
    // the sheet...
    const assignStyle = (cell, style) => {
      if (style) {
        Object.keys(style).forEach(key => {
          cell[key] = style[key];
        });
      }
    };

    const {worksheet, table} = this;
    const {row, col} = table.tl;
    let count = 0;
    if (table.headerRow) {
      const r = worksheet.getRow(row + count++);
      table.columns.forEach((column, j) => {
        const {style, name} = column;
        const cell = r.getCell(col + j);
        cell.value = name;
        assignStyle(cell, style);
      });
    }
    table.rows.forEach(data => {
      const r = worksheet.getRow(row + count++);
      data.forEach((value, j) => {
        const cell = r.getCell(col + j);
        cell.value = value;

        assignStyle(cell, table.columns[j].style);
      });
    });

    if (table.totalsRow) {
      const r = worksheet.getRow(row + count++);
      table.columns.forEach((column, j) => {
        const cell = r.getCell(col + j);
        if (j === 0) {
          cell.value = column.totalsRowLabel;
        } else {
          const formula = this.getFormula(column);
          if (formula) {
            cell.value = {
              formula: column.totalsRowFormula,
              result: column.totalsRowResult,
            };
          } else {
            cell.value = null;
          }
        }

        assignStyle(cell, column.style);
      });
    }
  }

  load(worksheet) {
    // where the table will read necessary features from a loaded sheet
    const {table} = this;
    const {row, col} = table.tl;
    let count = 0;
    if (table.headerRow) {
      const r = worksheet.getRow(row + count++);
      table.columns.forEach((column, j) => {
        const cell = r.getCell(col + j);
        cell.value = column.name;
      });
    }
    table.rows.forEach(data => {
      const r = worksheet.getRow(row + count++);
      data.forEach((value, j) => {
        const cell = r.getCell(col + j);
        cell.value = value;
      });
    });

    if (table.totalsRow) {
      const r = worksheet.getRow(row + count++);
      table.columns.forEach((column, j) => {
        const cell = r.getCell(col + j);
        if (j === 0) {
          cell.value = column.totalsRowLabel;
        } else {
          const formula = this.getFormula(column);
          if (formula) {
            cell.value = {
              formula: column.totalsRowFormula,
              result: column.totalsRowResult,
            };
          }
        }
      });
    }
  }

  get model() {
    return this.table;
  }

  set model(value) {
    this.table = value;
  }

  // ================================================================
  // TODO: Mutating methods
  cacheState() {
    if (!this._cache) {
      this._cache = {
        ref: this.ref,
        width: this.width,
        tableHeight: this.tableHeight,
      };
    }
  }

  commit() {
    // changes may have been made that might have on-sheet effects
    if (!this._cache) {
      return;
    }

    // check things are ok first
    this.validate();

    const ref = colCache.decodeAddress(this._cache.ref);
    if (this.ref !== this._cache.ref) {
      // wipe out whole table footprint at previous location
      for (let i = 0; i < this._cache.tableHeight; i++) {
        const row = this.worksheet.getRow(ref.row + i);
        for (let j = 0; j < this._cache.width; j++) {
          const cell = row.getCell(ref.col + j);
          cell.value = null;
        }
      }
    } else {
      // clear out below table if it has shrunk
      for (let i = this.tableHeight; i < this._cache.tableHeight; i++) {
        const row = this.worksheet.getRow(ref.row + i);
        for (let j = 0; j < this._cache.width; j++) {
          const cell = row.getCell(ref.col + j);
          cell.value = null;
        }
      }

      // clear out to right of table if it has lost columns
      for (let i = 0; i < this.tableHeight; i++) {
        const row = this.worksheet.getRow(ref.row + i);
        for (let j = this.width; j < this._cache.width; j++) {
          const cell = row.getCell(ref.col + j);
          cell.value = null;
        }
      }
    }

    this.store();
  }

  addRow(values, rowNumber) {
    // Add a row of data, either insert at rowNumber or append
    this.cacheState();

    if (rowNumber === undefined) {
      this.table.rows.push(values);
    } else {
      this.table.rows.splice(rowNumber, 0, values);
    }
  }

  removeRows(rowIndex, count = 1) {
    // Remove a rows of data
    this.cacheState();
    this.table.rows.splice(rowIndex, count);
  }

  getColumn(colIndex) {
    const column = this.table.columns[colIndex];
    return new Column(this, column, colIndex);
  }

  addColumn(column, values, colIndex) {
    // Add a new column, including column defn and values
    // Inserts at colNumber or adds to the right
    this.cacheState();

    if (colIndex === undefined) {
      this.table.columns.push(column);
      this.table.rows.forEach((row, i) => {
        row.push(values[i]);
      });
    } else {
      this.table.columns.splice(colIndex, 0, column);
      this.table.rows.forEach((row, i) => {
        row.splice(colIndex, 0, values[i]);
      });
    }
  }

  removeColumns(colIndex, count = 1) {
    // Remove a column with data
    this.cacheState();

    this.table.columns.splice(colIndex, count);
    this.table.rows.forEach(row => {
      row.splice(colIndex, count);
    });
  }

  _assign(target, prop, value) {
    this.cacheState();
    target[prop] = value;
  }

  /* eslint-disable lines-between-class-members */
  get ref() {
    return this.table.ref;
  }
  set ref(value) {
    this._assign(this.table, 'ref', value);
  }

  get name() {
    return this.table.name;
  }
  set name(value) {
    this.table.name = value;
  }

  get displayName() {
    return this.table.displyName || this.table.name;
  }
  set displayNamename(value) {
    this.table.displayName = value;
  }

  get headerRow() {
    return this.table.headerRow;
  }
  set headerRow(value) {
    this._assign(this.table, 'headerRow', value);
  }

  get totalsRow() {
    return this.table.totalsRow;
  }
  set totalsRow(value) {
    this._assign(this.table, 'totalsRow', value);
  }

  get theme() {
    return this.table.style.name;
  }
  set theme(value) {
    this.table.style.name = value;
  }

  get showFirstColumn() {
    return this.table.style.showFirstColumn;
  }
  set showFirstColumn(value) {
    this.table.style.showFirstColumn = value;
  }

  get showLastColumn() {
    return this.table.style.showLastColumn;
  }
  set showLastColumn(value) {
    this.table.style.showLastColumn = value;
  }

  get showRowStripes() {
    return this.table.style.showRowStripes;
  }
  set showRowStripes(value) {
    this.table.style.showRowStripes = value;
  }

  get showColumnStripes() {
    return this.table.style.showColumnStripes;
  }
  set showColumnStripes(value) {
    this.table.style.showColumnStripes = value;
  }
  /* eslint-enable lines-between-class-members */
}

module.exports = Table;

}, function(modId) { var map = {"../utils/col-cache":1676879951316}; return __REQUIRE__(map[modId], modId); })
__DEFINE__(1676879951327, function(require, module, exports) {
class DataValidations {
  constructor(model) {
    this.model = model || {};
  }

  add(address, validation) {
    return (this.model[address] = validation);
  }

  find(address) {
    return this.model[address];
  }

  remove(address) {
    this.model[address] = undefined;
  }
}

module.exports = DataValidations;

}, function(modId) { var map = {}; return __REQUIRE__(map[modId], modId); })
__DEFINE__(1676879951328, function(require, module, exports) {


const crypto = require('crypto');

const Encryptor = {
  /**
   * Calculate a hash of the concatenated buffers with the given algorithm.
   * @param {string} algorithm - The hash algorithm.
   * @returns {Buffer} The hash
   */
  hash(algorithm, ...buffers) {
    const hash = crypto.createHash(algorithm);
    hash.update(Buffer.concat(buffers));
    return hash.digest();
  },
  /**
   * Convert a password into an encryption key
   * @param {string} password - The password
   * @param {string} hashAlgorithm - The hash algoritm
   * @param {string} saltValue - The salt value
   * @param {number} spinCount - The spin count
   * @param {number} keyBits - The length of the key in bits
   * @param {Buffer} blockKey - The block key
   * @returns {Buffer} The encryption key
   */
  convertPasswordToHash(password, hashAlgorithm, saltValue, spinCount) {
    hashAlgorithm = hashAlgorithm.toLowerCase();
    const hashes = crypto.getHashes();
    if (hashes.indexOf(hashAlgorithm) < 0) {
      throw new Error(`Hash algorithm '${hashAlgorithm}' not supported!`);
    }

    // Password must be in unicode buffer
    const passwordBuffer = Buffer.from(password, 'utf16le');
    // Generate the initial hash
    let key = this.hash(hashAlgorithm, Buffer.from(saltValue, 'base64'), passwordBuffer);
    // Now regenerate until spin count
    for (let i = 0; i < spinCount; i++) {
      const iterator = Buffer.alloc(4);
      // this is the 'special' element of Excel password hashing
      // that stops us from using crypto.pbkdf2()
      iterator.writeUInt32LE(i, 0);
      key = this.hash(hashAlgorithm, key, iterator);
    }
    return key.toString('base64');
  },
  /**
   * Generates cryptographically strong pseudo-random data.
   * @param size The size argument is a number indicating the number of bytes to generate.
   */
  randomBytes(size) {
    return crypto.randomBytes(size);
  },
};
module.exports = Encryptor;

}, function(modId) { var map = {}; return __REQUIRE__(map[modId], modId); })
__DEFINE__(1676879951329, function(require, module, exports) {


const _ = require('../utils/under-dash');
const colCache = require('../utils/col-cache');
const CellMatrix = require('../utils/cell-matrix');
const Range = require('./range');

const rangeRegexp = /[$](\w+)[$](\d+)(:[$](\w+)[$](\d+))?/;

class DefinedNames {
  constructor() {
    this.matrixMap = {};
  }

  getMatrix(name) {
    const matrix = this.matrixMap[name] || (this.matrixMap[name] = new CellMatrix());
    return matrix;
  }

  // add a name to a cell. locStr in the form SheetName!$col$row or SheetName!$c1$r1:$c2:$r2
  add(locStr, name) {
    const location = colCache.decodeEx(locStr);
    this.addEx(location, name);
  }

  addEx(location, name) {
    const matrix = this.getMatrix(name);
    if (location.top) {
      for (let col = location.left; col <= location.right; col++) {
        for (let row = location.top; row <= location.bottom; row++) {
          const address = {
            sheetName: location.sheetName,
            address: colCache.n2l(col) + row,
            row,
            col,
          };

          matrix.addCellEx(address);
        }
      }
    } else {
      matrix.addCellEx(location);
    }
  }

  remove(locStr, name) {
    const location = colCache.decodeEx(locStr);
    this.removeEx(location, name);
  }

  removeEx(location, name) {
    const matrix = this.getMatrix(name);
    matrix.removeCellEx(location);
  }

  removeAllNames(location) {
    _.each(this.matrixMap, matrix => {
      matrix.removeCellEx(location);
    });
  }

  forEach(callback) {
    _.each(this.matrixMap, (matrix, name) => {
      matrix.forEach(cell => {
        callback(name, cell);
      });
    });
  }

  // get all the names of a cell
  getNames(addressStr) {
    return this.getNamesEx(colCache.decodeEx(addressStr));
  }

  getNamesEx(address) {
    return _.map(this.matrixMap, (matrix, name) => matrix.findCellEx(address) && name).filter(
      Boolean
    );
  }

  _explore(matrix, cell) {
    cell.mark = false;
    const {sheetName} = cell;

    const range = new Range(cell.row, cell.col, cell.row, cell.col, sheetName);
    let x;
    let y;

    // grow vertical - only one col to worry about
    function vGrow(yy, edge) {
      const c = matrix.findCellAt(sheetName, yy, cell.col);
      if (!c || !c.mark) {
        return false;
      }
      range[edge] = yy;
      c.mark = false;
      return true;
    }
    for (y = cell.row - 1; vGrow(y, 'top'); y--);
    for (y = cell.row + 1; vGrow(y, 'bottom'); y++);

    // grow horizontal - ensure all rows can grow
    function hGrow(xx, edge) {
      const cells = [];
      for (y = range.top; y <= range.bottom; y++) {
        const c = matrix.findCellAt(sheetName, y, xx);
        if (c && c.mark) {
          cells.push(c);
        } else {
          return false;
        }
      }
      range[edge] = xx;
      for (let i = 0; i < cells.length; i++) {
        cells[i].mark = false;
      }
      return true;
    }
    for (x = cell.col - 1; hGrow(x, 'left'); x--);
    for (x = cell.col + 1; hGrow(x, 'right'); x++);

    return range;
  }

  getRanges(name, matrix) {
    matrix = matrix || this.matrixMap[name];

    if (!matrix) {
      return {name, ranges: []};
    }

    // mark and sweep!
    matrix.forEach(cell => {
      cell.mark = true;
    });
    const ranges = matrix
      .map(cell => cell.mark && this._explore(matrix, cell))
      .filter(Boolean)
      .map(range => range.$shortRange);

    return {
      name,
      ranges,
    };
  }

  normaliseMatrix(matrix, sheetName) {
    // some of the cells might have shifted on specified sheet
    // need to reassign rows, cols
    matrix.forEachInSheet(sheetName, (cell, row, col) => {
      if (cell) {
        if (cell.row !== row || cell.col !== col) {
          cell.row = row;
          cell.col = col;
          cell.address = colCache.n2l(col) + row;
        }
      }
    });
  }

  spliceRows(sheetName, start, numDelete, numInsert) {
    _.each(this.matrixMap, matrix => {
      matrix.spliceRows(sheetName, start, numDelete, numInsert);
      this.normaliseMatrix(matrix, sheetName);
    });
  }

  spliceColumns(sheetName, start, numDelete, numInsert) {
    _.each(this.matrixMap, matrix => {
      matrix.spliceColumns(sheetName, start, numDelete, numInsert);
      this.normaliseMatrix(matrix, sheetName);
    });
  }

  get model() {
    // To get names per cell - just iterate over all names finding cells if they exist
    return _.map(this.matrixMap, (matrix, name) => this.getRanges(name, matrix)).filter(
      definedName => definedName.ranges.length
    );
  }

  set model(value) {
    // value is [ { name, ranges }, ... ]
    const matrixMap = (this.matrixMap = {});
    value.forEach(definedName => {
      const matrix = (matrixMap[definedName.name] = new CellMatrix());
      definedName.ranges.forEach(rangeStr => {
        if (rangeRegexp.test(rangeStr.split('!').pop() || '')) {
          matrix.addCell(rangeStr);
        }
      });
    });
  }
}

module.exports = DefinedNames;

}, function(modId) { var map = {"../utils/under-dash":1676879951315,"../utils/col-cache":1676879951316,"../utils/cell-matrix":1676879951330,"./range":1676879951317}; return __REQUIRE__(map[modId], modId); })
__DEFINE__(1676879951330, function(require, module, exports) {
const _ = require('./under-dash');
const colCache = require('./col-cache');

class CellMatrix {
  constructor(template) {
    this.template = template;
    this.sheets = {};
  }

  addCell(addressStr) {
    this.addCellEx(colCache.decodeEx(addressStr));
  }

  getCell(addressStr) {
    return this.findCellEx(colCache.decodeEx(addressStr), true);
  }

  findCell(addressStr) {
    return this.findCellEx(colCache.decodeEx(addressStr), false);
  }

  findCellAt(sheetName, rowNumber, colNumber) {
    const sheet = this.sheets[sheetName];
    const row = sheet && sheet[rowNumber];
    return row && row[colNumber];
  }

  addCellEx(address) {
    if (address.top) {
      for (let row = address.top; row <= address.bottom; row++) {
        for (let col = address.left; col <= address.right; col++) {
          this.getCellAt(address.sheetName, row, col);
        }
      }
    } else {
      this.findCellEx(address, true);
    }
  }

  getCellEx(address) {
    return this.findCellEx(address, true);
  }

  findCellEx(address, create) {
    const sheet = this.findSheet(address, create);
    const row = this.findSheetRow(sheet, address, create);
    return this.findRowCell(row, address, create);
  }

  getCellAt(sheetName, rowNumber, colNumber) {
    const sheet = this.sheets[sheetName] || (this.sheets[sheetName] = []);
    const row = sheet[rowNumber] || (sheet[rowNumber] = []);
    const cell =
      row[colNumber] ||
      (row[colNumber] = {
        sheetName,
        address: colCache.n2l(colNumber) + rowNumber,
        row: rowNumber,
        col: colNumber,
      });
    return cell;
  }

  removeCellEx(address) {
    const sheet = this.findSheet(address);
    if (!sheet) {
      return;
    }
    const row = this.findSheetRow(sheet, address);
    if (!row) {
      return;
    }
    delete row[address.col];
  }

  forEachInSheet(sheetName, callback) {
    const sheet = this.sheets[sheetName];
    if (sheet) {
      sheet.forEach((row, rowNumber) => {
        if (row) {
          row.forEach((cell, colNumber) => {
            if (cell) {
              callback(cell, rowNumber, colNumber);
            }
          });
        }
      });
    }
  }

  forEach(callback) {
    _.each(this.sheets, (sheet, sheetName) => {
      this.forEachInSheet(sheetName, callback);
    });
  }

  map(callback) {
    const results = [];
    this.forEach(cell => {
      results.push(callback(cell));
    });
    return results;
  }

  findSheet(address, create) {
    const name = address.sheetName;
    if (this.sheets[name]) {
      return this.sheets[name];
    }
    if (create) {
      return (this.sheets[name] = []);
    }
    return undefined;
  }

  findSheetRow(sheet, address, create) {
    const {row} = address;
    if (sheet && sheet[row]) {
      return sheet[row];
    }
    if (create) {
      return (sheet[row] = []);
    }
    return undefined;
  }

  findRowCell(row, address, create) {
    const {col} = address;
    if (row && row[col]) {
      return row[col];
    }
    if (create) {
      return (row[col] = this.template
        ? Object.assign(address, JSON.parse(JSON.stringify(this.template)))
        : address);
    }
    return undefined;
  }

  spliceRows(sheetName, start, numDelete, numInsert) {
    const sheet = this.sheets[sheetName];
    if (sheet) {
      const inserts = [];
      for (let i = 0; i < numInsert; i++) {
        inserts.push([]);
      }
      sheet.splice(start, numDelete, ...inserts);
    }
  }

  spliceColumns(sheetName, start, numDelete, numInsert) {
    const sheet = this.sheets[sheetName];
    if (sheet) {
      const inserts = [];
      for (let i = 0; i < numInsert; i++) {
        inserts.push(null);
      }
      _.each(sheet, row => {
        row.splice(start, numDelete, ...inserts);
      });
    }
  }
}

module.exports = CellMatrix;

}, function(modId) { var map = {"./under-dash":1676879951315,"./col-cache":1676879951316}; return __REQUIRE__(map[modId], modId); })
__DEFINE__(1676879951331, function(require, module, exports) {
const fs = require('fs');
const JSZip = require('jszip');
const {PassThrough} = require('readable-stream');
const ZipStream = require('../utils/zip-stream');
const StreamBuf = require('../utils/stream-buf');

const utils = require('../utils/utils');
const XmlStream = require('../utils/xml-stream');
const {bufferToString} = require('../utils/browser-buffer-decode');

const StylesXform = require('./xform/style/styles-xform');

const CoreXform = require('./xform/core/core-xform');
const SharedStringsXform = require('./xform/strings/shared-strings-xform');
const RelationshipsXform = require('./xform/core/relationships-xform');
const ContentTypesXform = require('./xform/core/content-types-xform');
const AppXform = require('./xform/core/app-xform');
const WorkbookXform = require('./xform/book/workbook-xform');
const WorksheetXform = require('./xform/sheet/worksheet-xform');
const DrawingXform = require('./xform/drawing/drawing-xform');
const TableXform = require('./xform/table/table-xform');
const CommentsXform = require('./xform/comment/comments-xform');
const VmlNotesXform = require('./xform/comment/vml-notes-xform');

const theme1Xml = require('./xml/theme1.js');

function fsReadFileAsync(filename, options) {
  return new Promise((resolve, reject) => {
    fs.readFile(filename, options, (error, data) => {
      if (error) {
        reject(error);
      } else {
        resolve(data);
      }
    });
  });
}

class XLSX {
  constructor(workbook) {
    this.workbook = workbook;
  }

  // ===============================================================================
  // Workbook
  // =========================================================================
  // Read

  async readFile(filename, options) {
    if (!(await utils.fs.exists(filename))) {
      throw new Error(`File not found: ${filename}`);
    }
    const stream = fs.createReadStream(filename);
    try {
      const workbook = await this.read(stream, options);
      stream.close();
      return workbook;
    } catch (error) {
      stream.close();
      throw error;
    }
  }

  parseRels(stream) {
    const xform = new RelationshipsXform();
    return xform.parseStream(stream);
  }

  parseWorkbook(stream) {
    const xform = new WorkbookXform();
    return xform.parseStream(stream);
  }

  parseSharedStrings(stream) {
    const xform = new SharedStringsXform();
    return xform.parseStream(stream);
  }

  reconcile(model, options) {
    const workbookXform = new WorkbookXform();
    const worksheetXform = new WorksheetXform(options);
    const drawingXform = new DrawingXform();
    const tableXform = new TableXform();

    workbookXform.reconcile(model);

    // reconcile drawings with their rels
    const drawingOptions = {
      media: model.media,
      mediaIndex: model.mediaIndex,
    };
    Object.keys(model.drawings).forEach(name => {
      const drawing = model.drawings[name];
      const drawingRel = model.drawingRels[name];
      if (drawingRel) {
        drawingOptions.rels = drawingRel.reduce((o, rel) => {
          o[rel.Id] = rel;
          return o;
        }, {});
        (drawing.anchors || []).forEach(anchor => {
          const hyperlinks = anchor.picture && anchor.picture.hyperlinks;
          if (hyperlinks && drawingOptions.rels[hyperlinks.rId]) {
            hyperlinks.hyperlink = drawingOptions.rels[hyperlinks.rId].Target;
            delete hyperlinks.rId;
          }
        });
        drawingXform.reconcile(drawing, drawingOptions);
      }
    });

    // reconcile tables with the default styles
    const tableOptions = {
      styles: model.styles,
    };
    Object.values(model.tables).forEach(table => {
      tableXform.reconcile(table, tableOptions);
    });

    const sheetOptions = {
      styles: model.styles,
      sharedStrings: model.sharedStrings,
      media: model.media,
      mediaIndex: model.mediaIndex,
      date1904: model.properties && model.properties.date1904,
      drawings: model.drawings,
      comments: model.comments,
      tables: model.tables,
      vmlDrawings: model.vmlDrawings,
    };
    model.worksheets.forEach(worksheet => {
      worksheet.relationships = model.worksheetRels[worksheet.sheetNo];
      worksheetXform.reconcile(worksheet, sheetOptions);
    });

    // delete unnecessary parts
    delete model.worksheetHash;
    delete model.worksheetRels;
    delete model.globalRels;
    delete model.sharedStrings;
    delete model.workbookRels;
    delete model.sheetDefs;
    delete model.styles;
    delete model.mediaIndex;
    delete model.drawings;
    delete model.drawingRels;
    delete model.vmlDrawings;
  }

  async _processWorksheetEntry(stream, model, sheetNo, options, path) {
    const xform = new WorksheetXform(options);
    const worksheet = await xform.parseStream(stream);
    worksheet.sheetNo = sheetNo;
    model.worksheetHash[path] = worksheet;
    model.worksheets.push(worksheet);
  }

  async _processCommentEntry(stream, model, name) {
    const xform = new CommentsXform();
    const comments = await xform.parseStream(stream);
    model.comments[`../${name}.xml`] = comments;
  }

  async _processTableEntry(stream, model, name) {
    const xform = new TableXform();
    const table = await xform.parseStream(stream);
    model.tables[`../tables/${name}.xml`] = table;
  }

  async _processWorksheetRelsEntry(stream, model, sheetNo) {
    const xform = new RelationshipsXform();
    const relationships = await xform.parseStream(stream);
    model.worksheetRels[sheetNo] = relationships;
  }

  async _processMediaEntry(entry, model, filename) {
    const lastDot = filename.lastIndexOf('.');
    // if we can't determine extension, ignore it
    if (lastDot >= 1) {
      const extension = filename.substr(lastDot + 1);
      const name = filename.substr(0, lastDot);
      await new Promise((resolve, reject) => {
        const streamBuf = new StreamBuf();
        streamBuf.on('finish', () => {
          model.mediaIndex[filename] = model.media.length;
          model.mediaIndex[name] = model.media.length;
          const medium = {
            type: 'image',
            name,
            extension,
            buffer: streamBuf.toBuffer(),
          };
          model.media.push(medium);
          resolve();
        });
        entry.on('error', error => {
          reject(error);
        });
        entry.pipe(streamBuf);
      });
    }
  }

  async _processDrawingEntry(entry, model, name) {
    const xform = new DrawingXform();
    const drawing = await xform.parseStream(entry);
    model.drawings[name] = drawing;
  }

  async _processDrawingRelsEntry(entry, model, name) {
    const xform = new RelationshipsXform();
    const relationships = await xform.parseStream(entry);
    model.drawingRels[name] = relationships;
  }

  async _processVmlDrawingEntry(entry, model, name) {
    const xform = new VmlNotesXform();
    const vmlDrawing = await xform.parseStream(entry);
    model.vmlDrawings[`../drawings/${name}.vml`] = vmlDrawing;
  }

  async _processThemeEntry(entry, model, name) {
    await new Promise((resolve, reject) => {
      // TODO: stream entry into buffer and store the xml in the model.themes[]
      const stream = new StreamBuf();
      entry.on('error', reject);
      stream.on('error', reject);
      stream.on('finish', () => {
        model.themes[name] = stream.read().toString();
        resolve();
      });
      entry.pipe(stream);
    });
  }

  /**
   * @deprecated since version 4.0. You should use `#read` instead. Please follow upgrade instruction: https://github.com/exceljs/exceljs/blob/master/UPGRADE-4.0.md
   */
  createInputStream() {
    throw new Error(
      '`XLSX#createInputStream` is deprecated. You should use `XLSX#read` instead. This method will be removed in version 5.0. Please follow upgrade instruction: https://github.com/exceljs/exceljs/blob/master/UPGRADE-4.0.md'
    );
  }

  async read(stream, options) {
    // TODO: Remove once node v8 is deprecated
    // Detect and upgrade old streams
    if (!stream[Symbol.asyncIterator] && stream.pipe) {
      stream = stream.pipe(new PassThrough());
    }
    const chunks = [];
    for await (const chunk of stream) {
      chunks.push(chunk);
    }
    return this.load(Buffer.concat(chunks), options);
  }

  async load(data, options) {
    let buffer;
    if (options && options.base64) {
      buffer = Buffer.from(data.toString(), 'base64');
    } else {
      buffer = data;
    }

    const model = {
      worksheets: [],
      worksheetHash: {},
      worksheetRels: [],
      themes: {},
      media: [],
      mediaIndex: {},
      drawings: {},
      drawingRels: {},
      comments: {},
      tables: {},
      vmlDrawings: {},
    };

    const zip = await JSZip.loadAsync(buffer);
    for (const entry of Object.values(zip.files)) {
      /* eslint-disable no-await-in-loop */
      if (!entry.dir) {
        let entryName = entry.name;
        if (entryName[0] === '/') {
          entryName = entryName.substr(1);
        }
        let stream;
        if (entryName.match(/xl\/media\//) ||
          // themes are not parsed as stream
          entryName.match(/xl\/theme\/([a-zA-Z0-9]+)[.]xml/)) {
          stream = new PassThrough();
          stream.write(await entry.async('nodebuffer'));
        } else {
          // use object mode to avoid buffer-string convention
          stream = new PassThrough({
            writableObjectMode: true,
            readableObjectMode: true,
          });
          let content;
          // https://www.npmjs.com/package/process
          if (process.browser) {
            // running in browser, use TextDecoder if possible
            content = bufferToString(await entry.async('nodebuffer'));
          } else {
            // running in node.js
            content = await entry.async('string');
          }
          const chunkSize = 16 * 1024;
          for (let i = 0; i < content.length; i += chunkSize) {
            stream.write(content.substring(i, i + chunkSize));
          }
        }
        stream.end();
        switch (entryName) {
          case '_rels/.rels':
            model.globalRels = await this.parseRels(stream);
            break;

          case 'xl/workbook.xml': {
            const workbook = await this.parseWorkbook(stream);
            model.sheets = workbook.sheets;
            model.definedNames = workbook.definedNames;
            model.views = workbook.views;
            model.properties = workbook.properties;
            model.calcProperties = workbook.calcProperties;
            break;
          }

          case 'xl/_rels/workbook.xml.rels':
            model.workbookRels = await this.parseRels(stream);
            break;

          case 'xl/sharedStrings.xml':
            model.sharedStrings = new SharedStringsXform();
            await model.sharedStrings.parseStream(stream);
            break;

          case 'xl/styles.xml':
            model.styles = new StylesXform();
            await model.styles.parseStream(stream);
            break;

          case 'docProps/app.xml': {
            const appXform = new AppXform();
            const appProperties = await appXform.parseStream(stream);
            model.company = appProperties.company;
            model.manager = appProperties.manager;
            break;
          }

          case 'docProps/core.xml': {
            const coreXform = new CoreXform();
            const coreProperties = await coreXform.parseStream(stream);
            Object.assign(model, coreProperties);
            break;
          }

          default: {
            let match = entryName.match(/xl\/worksheets\/sheet(\d+)[.]xml/);
            if (match) {
              await this._processWorksheetEntry(stream, model, match[1], options, entryName);
              break;
            }
            match = entryName.match(/xl\/worksheets\/_rels\/sheet(\d+)[.]xml.rels/);
            if (match) {
              await this._processWorksheetRelsEntry(stream, model, match[1]);
              break;
            }
            match = entryName.match(/xl\/theme\/([a-zA-Z0-9]+)[.]xml/);
            if (match) {
              await this._processThemeEntry(stream, model, match[1]);
              break;
            }
            match = entryName.match(/xl\/media\/([a-zA-Z0-9]+[.][a-zA-Z0-9]{3,4})$/);
            if (match) {
              await this._processMediaEntry(stream, model, match[1]);
              break;
            }
            match = entryName.match(/xl\/drawings\/([a-zA-Z0-9]+)[.]xml/);
            if (match) {
              await this._processDrawingEntry(stream, model, match[1]);
              break;
            }
            match = entryName.match(/xl\/(comments\d+)[.]xml/);
            if (match) {
              await this._processCommentEntry(stream, model, match[1]);
              break;
            }
            match = entryName.match(/xl\/tables\/(table\d+)[.]xml/);
            if (match) {
              await this._processTableEntry(stream, model, match[1]);
              break;
            }
            match = entryName.match(/xl\/drawings\/_rels\/([a-zA-Z0-9]+)[.]xml[.]rels/);
            if (match) {
              await this._processDrawingRelsEntry(stream, model, match[1]);
              break;
            }
            match = entryName.match(/xl\/drawings\/(vmlDrawing\d+)[.]vml/);
            if (match) {
              await this._processVmlDrawingEntry(stream, model, match[1]);
              break;
            }
          }
        }
      }
    }

    this.reconcile(model, options);

    // apply model
    this.workbook.model = model;
    return this.workbook;
  }

  // =========================================================================
  // Write

  async addMedia(zip, model) {
    await Promise.all(
      model.media.map(async medium => {
        if (medium.type === 'image') {
          const filename = `xl/media/${medium.name}.${medium.extension}`;
          if (medium.filename) {
            const data = await fsReadFileAsync(medium.filename);
            return zip.append(data, {name: filename});
          }
          if (medium.buffer) {
            return zip.append(medium.buffer, {name: filename});
          }
          if (medium.base64) {
            const dataimg64 = medium.base64;
            const content = dataimg64.substring(dataimg64.indexOf(',') + 1);
            return zip.append(content, {name: filename, base64: true});
          }
        }
        throw new Error('Unsupported media');
      })
    );
  }

  addDrawings(zip, model) {
    const drawingXform = new DrawingXform();
    const relsXform = new RelationshipsXform();

    model.worksheets.forEach(worksheet => {
      const {drawing} = worksheet;
      if (drawing) {
        drawingXform.prepare(drawing, {});
        let xml = drawingXform.toXml(drawing);
        zip.append(xml, {name: `xl/drawings/${drawing.name}.xml`});

        xml = relsXform.toXml(drawing.rels);
        zip.append(xml, {name: `xl/drawings/_rels/${drawing.name}.xml.rels`});
      }
    });
  }

  addTables(zip, model) {
    const tableXform = new TableXform();

    model.worksheets.forEach(worksheet => {
      const {tables} = worksheet;
      tables.forEach(table => {
        tableXform.prepare(table, {});
        const tableXml = tableXform.toXml(table);
        zip.append(tableXml, {name: `xl/tables/${table.target}`});
      });
    });
  }

  async addContentTypes(zip, model) {
    const xform = new ContentTypesXform();
    const xml = xform.toXml(model);
    zip.append(xml, {name: '[Content_Types].xml'});
  }

  async addApp(zip, model) {
    const xform = new AppXform();
    const xml = xform.toXml(model);
    zip.append(xml, {name: 'docProps/app.xml'});
  }

  async addCore(zip, model) {
    const coreXform = new CoreXform();
    zip.append(coreXform.toXml(model), {name: 'docProps/core.xml'});
  }

  async addThemes(zip, model) {
    const themes = model.themes || {theme1: theme1Xml};
    Object.keys(themes).forEach(name => {
      const xml = themes[name];
      const path = `xl/theme/${name}.xml`;
      zip.append(xml, {name: path});
    });
  }

  async addOfficeRels(zip) {
    const xform = new RelationshipsXform();
    const xml = xform.toXml([
      {Id: 'rId1', Type: XLSX.RelType.OfficeDocument, Target: 'xl/workbook.xml'},
      {Id: 'rId2', Type: XLSX.RelType.CoreProperties, Target: 'docProps/core.xml'},
      {Id: 'rId3', Type: XLSX.RelType.ExtenderProperties, Target: 'docProps/app.xml'},
    ]);
    zip.append(xml, {name: '_rels/.rels'});
  }

  async addWorkbookRels(zip, model) {
    let count = 1;
    const relationships = [
      {Id: `rId${count++}`, Type: XLSX.RelType.Styles, Target: 'styles.xml'},
      {Id: `rId${count++}`, Type: XLSX.RelType.Theme, Target: 'theme/theme1.xml'},
    ];
    if (model.sharedStrings.count) {
      relationships.push({
        Id: `rId${count++}`,
        Type: XLSX.RelType.SharedStrings,
        Target: 'sharedStrings.xml',
      });
    }
    model.worksheets.forEach(worksheet => {
      worksheet.rId = `rId${count++}`;
      relationships.push({
        Id: worksheet.rId,
        Type: XLSX.RelType.Worksheet,
        Target: `worksheets/sheet${worksheet.id}.xml`,
      });
    });
    const xform = new RelationshipsXform();
    const xml = xform.toXml(relationships);
    zip.append(xml, {name: 'xl/_rels/workbook.xml.rels'});
  }

  async addSharedStrings(zip, model) {
    if (model.sharedStrings && model.sharedStrings.count) {
      zip.append(model.sharedStrings.xml, {name: 'xl/sharedStrings.xml'});
    }
  }

  async addStyles(zip, model) {
    const {xml} = model.styles;
    if (xml) {
      zip.append(xml, {name: 'xl/styles.xml'});
    }
  }

  async addWorkbook(zip, model) {
    const xform = new WorkbookXform();
    zip.append(xform.toXml(model), {name: 'xl/workbook.xml'});
  }

  async addWorksheets(zip, model) {
    // preparation phase
    const worksheetXform = new WorksheetXform();
    const relationshipsXform = new RelationshipsXform();
    const commentsXform = new CommentsXform();
    const vmlNotesXform = new VmlNotesXform();

    // write sheets
    model.worksheets.forEach(worksheet => {
      let xmlStream = new XmlStream();
      worksheetXform.render(xmlStream, worksheet);
      zip.append(xmlStream.xml, {name: `xl/worksheets/sheet${worksheet.id}.xml`});

      if (worksheet.rels && worksheet.rels.length) {
        xmlStream = new XmlStream();
        relationshipsXform.render(xmlStream, worksheet.rels);
        zip.append(xmlStream.xml, {name: `xl/worksheets/_rels/sheet${worksheet.id}.xml.rels`});
      }

      if (worksheet.comments.length > 0) {
        xmlStream = new XmlStream();
        commentsXform.render(xmlStream, worksheet);
        zip.append(xmlStream.xml, {name: `xl/comments${worksheet.id}.xml`});

        xmlStream = new XmlStream();
        vmlNotesXform.render(xmlStream, worksheet);
        zip.append(xmlStream.xml, {name: `xl/drawings/vmlDrawing${worksheet.id}.vml`});
      }
    });
  }

  _finalize(zip) {
    return new Promise((resolve, reject) => {
      zip.on('finish', () => {
        resolve(this);
      });
      zip.on('error', reject);
      zip.finalize();
    });
  }

  prepareModel(model, options) {
    // ensure following properties have sane values
    model.creator = model.creator || 'ExcelJS';
    model.lastModifiedBy = model.lastModifiedBy || 'ExcelJS';
    model.created = model.created || new Date();
    model.modified = model.modified || new Date();

    model.useSharedStrings =
      options.useSharedStrings !== undefined ? options.useSharedStrings : true;
    model.useStyles = options.useStyles !== undefined ? options.useStyles : true;

    // Manage the shared strings
    model.sharedStrings = new SharedStringsXform();

    // add a style manager to handle cell formats, fonts, etc.
    model.styles = model.useStyles ? new StylesXform(true) : new StylesXform.Mock();

    // prepare all of the things before the render
    const workbookXform = new WorkbookXform();
    const worksheetXform = new WorksheetXform();

    workbookXform.prepare(model);

    const worksheetOptions = {
      sharedStrings: model.sharedStrings,
      styles: model.styles,
      date1904: model.properties.date1904,
      drawingsCount: 0,
      media: model.media,
    };
    worksheetOptions.drawings = model.drawings = [];
    worksheetOptions.commentRefs = model.commentRefs = [];
    let tableCount = 0;
    model.tables = [];
    model.worksheets.forEach(worksheet => {
      // assign unique filenames to tables
      worksheet.tables.forEach(table => {
        tableCount++;
        table.target = `table${tableCount}.xml`;
        table.id = tableCount;
        model.tables.push(table);
      });

      worksheetXform.prepare(worksheet, worksheetOptions);
    });

    // TODO: workbook drawing list
  }

  async write(stream, options) {
    options = options || {};
    const {model} = this.workbook;
    const zip = new ZipStream.ZipWriter(options.zip);
    zip.pipe(stream);

    this.prepareModel(model, options);

    // render
    await this.addContentTypes(zip, model);
    await this.addOfficeRels(zip, model);
    await this.addWorkbookRels(zip, model);
    await this.addWorksheets(zip, model);
    await this.addSharedStrings(zip, model); // always after worksheets
    await this.addDrawings(zip, model);
    await this.addTables(zip, model);
    await Promise.all([this.addThemes(zip, model), this.addStyles(zip, model)]);
    await this.addMedia(zip, model);
    await Promise.all([this.addApp(zip, model), this.addCore(zip, model)]);
    await this.addWorkbook(zip, model);
    return this._finalize(zip);
  }

  writeFile(filename, options) {
    const stream = fs.createWriteStream(filename);

    return new Promise((resolve, reject) => {
      stream.on('finish', () => {
        resolve();
      });
      stream.on('error', error => {
        reject(error);
      });

      this.write(stream, options).then(() => {
        stream.end();
      });
    });
  }

  async writeBuffer(options) {
    const stream = new StreamBuf();
    await this.write(stream, options);
    return stream.read();
  }
}

XLSX.RelType = require('./rel-type');

module.exports = XLSX;

}, function(modId) { var map = {"../utils/zip-stream":1676879951332,"../utils/stream-buf":1676879951333,"../utils/utils":1676879951334,"../utils/xml-stream":1676879951337,"../utils/browser-buffer-decode":1676879951338,"./xform/style/styles-xform":1676879951339,"./xform/core/core-xform":1676879951358,"./xform/strings/shared-strings-xform":1676879951360,"./xform/core/relationships-xform":1676879951365,"./xform/core/content-types-xform":1676879951367,"./xform/core/app-xform":1676879951368,"./xform/book/workbook-xform":1676879951371,"./xform/sheet/worksheet-xform":1676879951377,"./xform/drawing/drawing-xform":1676879951423,"./xform/table/table-xform":1676879951438,"./xform/comment/comments-xform":1676879951443,"./xform/comment/vml-notes-xform":1676879951445,"./xml/theme1.js":1676879951452,"./rel-type":1676879951378}; return __REQUIRE__(map[modId], modId); })
__DEFINE__(1676879951332, function(require, module, exports) {
const events = require('events');
const JSZip = require('jszip');

const StreamBuf = require('./stream-buf');
const {stringToBuffer} = require('./browser-buffer-encode');

// =============================================================================
// The ZipWriter class
// Packs streamed data into an output zip stream
class ZipWriter extends events.EventEmitter {
  constructor(options) {
    super();
    this.options = Object.assign(
      {
        type: 'nodebuffer',
        compression: 'DEFLATE',
      },
      options
    );

    this.zip = new JSZip();
    this.stream = new StreamBuf();
  }

  append(data, options) {
    if (options.hasOwnProperty('base64') && options.base64) {
      this.zip.file(options.name, data, {base64: true});
    } else {
      // https://www.npmjs.com/package/process
      if (process.browser && typeof data === 'string') {
        // use TextEncoder in browser
        data = stringToBuffer(data);
      }
      this.zip.file(options.name, data);
    }
  }

  async finalize() {
    const content = await this.zip.generateAsync(this.options);
    this.stream.end(content);
    this.emit('finish');
  }

  // ==========================================================================
  // Stream.Readable interface
  read(size) {
    return this.stream.read(size);
  }

  setEncoding(encoding) {
    return this.stream.setEncoding(encoding);
  }

  pause() {
    return this.stream.pause();
  }

  resume() {
    return this.stream.resume();
  }

  isPaused() {
    return this.stream.isPaused();
  }

  pipe(destination, options) {
    return this.stream.pipe(destination, options);
  }

  unpipe(destination) {
    return this.stream.unpipe(destination);
  }

  unshift(chunk) {
    return this.stream.unshift(chunk);
  }

  wrap(stream) {
    return this.stream.wrap(stream);
  }
}

// =============================================================================

module.exports = {
  ZipWriter,
};

}, function(modId) { var map = {"./stream-buf":1676879951333,"./browser-buffer-encode":1676879951336}; return __REQUIRE__(map[modId], modId); })
__DEFINE__(1676879951333, function(require, module, exports) {
/* eslint-disable max-classes-per-file */
const Stream = require('readable-stream');

const utils = require('./utils');
const StringBuf = require('./string-buf');

// =============================================================================
// data chunks - encapsulating incoming data
class StringChunk {
  constructor(data, encoding) {
    this._data = data;
    this._encoding = encoding;
  }

  get length() {
    return this.toBuffer().length;
  }

  // copy to target buffer
  copy(target, targetOffset, offset, length) {
    return this.toBuffer().copy(target, targetOffset, offset, length);
  }

  toBuffer() {
    if (!this._buffer) {
      this._buffer = Buffer.from(this._data, this._encoding);
    }
    return this._buffer;
  }
}

class StringBufChunk {
  constructor(data) {
    this._data = data;
  }

  get length() {
    return this._data.length;
  }

  // copy to target buffer
  copy(target, targetOffset, offset, length) {
    // eslint-disable-next-line no-underscore-dangle
    return this._data._buf.copy(target, targetOffset, offset, length);
  }

  toBuffer() {
    return this._data.toBuffer();
  }
}

class BufferChunk {
  constructor(data) {
    this._data = data;
  }

  get length() {
    return this._data.length;
  }

  // copy to target buffer
  copy(target, targetOffset, offset, length) {
    this._data.copy(target, targetOffset, offset, length);
  }

  toBuffer() {
    return this._data;
  }
}

// =============================================================================
// ReadWriteBuf - a single buffer supporting simple read-write
class ReadWriteBuf {
  constructor(size) {
    this.size = size;
    // the buffer
    this.buffer = Buffer.alloc(size);
    // read index
    this.iRead = 0;
    // write index
    this.iWrite = 0;
  }

  toBuffer() {
    if (this.iRead === 0 && this.iWrite === this.size) {
      return this.buffer;
    }

    const buf = Buffer.alloc(this.iWrite - this.iRead);
    this.buffer.copy(buf, 0, this.iRead, this.iWrite);
    return buf;
  }

  get length() {
    return this.iWrite - this.iRead;
  }

  get eod() {
    return this.iRead === this.iWrite;
  }

  get full() {
    return this.iWrite === this.size;
  }

  read(size) {
    let buf;
    // read size bytes from buffer and return buffer
    if (size === 0) {
      // special case - return null if no data requested
      return null;
    }

    if (size === undefined || size >= this.length) {
      // if no size specified or size is at least what we have then return all of the bytes
      buf = this.toBuffer();
      this.iRead = this.iWrite;
      return buf;
    }

    // otherwise return a chunk
    buf = Buffer.alloc(size);
    this.buffer.copy(buf, 0, this.iRead, size);
    this.iRead += size;
    return buf;
  }

  write(chunk, offset, length) {
    // write as many bytes from data from optional source offset
    // and return number of bytes written
    const size = Math.min(length, this.size - this.iWrite);
    chunk.copy(this.buffer, this.iWrite, offset, offset + size);
    this.iWrite += size;
    return size;
  }
}

// =============================================================================
// StreamBuf - a multi-purpose read-write stream
//  As MemBuf - write as much data as you like. Then call toBuffer() to consolidate
//  As StreamHub - pipe to multiple writables
//  As readable stream - feed data into the writable part and have some other code read from it.

// Note: Not sure why but StreamBuf does not like JS "class" sugar. It fails the
// integration tests
const StreamBuf = function(options) {
  options = options || {};
  this.bufSize = options.bufSize || 1024 * 1024;
  this.buffers = [];

  // batch mode fills a buffer completely before passing the data on
  // to pipes or 'readable' event listeners
  this.batch = options.batch || false;

  this.corked = false;
  // where in the current writable buffer we're up to
  this.inPos = 0;

  // where in the current readable buffer we've read up to
  this.outPos = 0;

  // consuming pipe streams go here
  this.pipes = [];

  // controls emit('data')
  this.paused = false;

  this.encoding = null;
};

utils.inherits(StreamBuf, Stream.Duplex, {
  toBuffer() {
    switch (this.buffers.length) {
      case 0:
        return null;
      case 1:
        return this.buffers[0].toBuffer();
      default:
        return Buffer.concat(this.buffers.map(rwBuf => rwBuf.toBuffer()));
    }
  },

  // writable
  // event drain - if write returns false (which it won't), indicates when safe to write again.
  // finish - end() has been called
  // pipe(src) - pipe() has been called on readable
  // unpipe(src) - unpipe() has been called on readable
  // error - duh

  _getWritableBuffer() {
    if (this.buffers.length) {
      const last = this.buffers[this.buffers.length - 1];
      if (!last.full) {
        return last;
      }
    }
    const buf = new ReadWriteBuf(this.bufSize);
    this.buffers.push(buf);
    return buf;
  },

  async _pipe(chunk) {
    const write = function(pipe) {
      return new Promise(resolve => {
        pipe.write(chunk.toBuffer(), () => {
          resolve();
        });
      });
    };
    await Promise.all(this.pipes.map(write));
  },
  _writeToBuffers(chunk) {
    let inPos = 0;
    const inLen = chunk.length;
    while (inPos < inLen) {
      // find writable buffer
      const buffer = this._getWritableBuffer();

      // write some data
      inPos += buffer.write(chunk, inPos, inLen - inPos);
    }
  },
  async write(data, encoding, callback) {
    if (encoding instanceof Function) {
      callback = encoding;
      encoding = 'utf8';
    }
    callback = callback || utils.nop;

    // encapsulate data into a chunk
    let chunk;
    if (data instanceof StringBuf) {
      chunk = new StringBufChunk(data);
    } else if (data instanceof Buffer) {
      chunk = new BufferChunk(data);
    } else if (typeof data === 'string' || data instanceof String || data instanceof ArrayBuffer) {
      chunk = new StringChunk(data, encoding);
    } else {
      throw new Error('Chunk must be one of type String, Buffer or StringBuf.');
    }

    // now, do something with the chunk
    if (this.pipes.length) {
      if (this.batch) {
        this._writeToBuffers(chunk);
        while (!this.corked && this.buffers.length > 1) {
          this._pipe(this.buffers.shift());
        }
      } else if (!this.corked) {
        await this._pipe(chunk);
        callback();
      } else {
        this._writeToBuffers(chunk);
        process.nextTick(callback);
      }
    } else {
      if (!this.paused) {
        this.emit('data', chunk.toBuffer());
      }

      this._writeToBuffers(chunk);
      this.emit('readable');
    }

    return true;
  },
  cork() {
    this.corked = true;
  },
  _flush(/* destination */) {
    // if we have comsumers...
    if (this.pipes.length) {
      // and there's stuff not written
      while (this.buffers.length) {
        this._pipe(this.buffers.shift());
      }
    }
  },
  uncork() {
    this.corked = false;
    this._flush();
  },
  end(chunk, encoding, callback) {
    const writeComplete = error => {
      if (error) {
        callback(error);
      } else {
        this._flush();
        this.pipes.forEach(pipe => {
          pipe.end();
        });
        this.emit('finish');
      }
    };
    if (chunk) {
      this.write(chunk, encoding, writeComplete);
    } else {
      writeComplete();
    }
  },

  // readable
  // event readable - some data is now available
  // event data - switch to flowing mode - feeds chunks to handler
  // event end - no more data
  // event close - optional, indicates upstream close
  // event error - duh
  read(size) {
    let buffers;
    // read min(buffer, size || infinity)
    if (size) {
      buffers = [];
      while (size && this.buffers.length && !this.buffers[0].eod) {
        const first = this.buffers[0];
        const buffer = first.read(size);
        size -= buffer.length;
        buffers.push(buffer);
        if (first.eod && first.full) {
          this.buffers.shift();
        }
      }
      return Buffer.concat(buffers);
    }

    buffers = this.buffers.map(buf => buf.toBuffer()).filter(Boolean);
    this.buffers = [];
    return Buffer.concat(buffers);
  },
  setEncoding(encoding) {
    // causes stream.read or stream.on('data) to return strings of encoding instead of Buffer objects
    this.encoding = encoding;
  },
  pause() {
    this.paused = true;
  },
  resume() {
    this.paused = false;
  },
  isPaused() {
    return !!this.paused;
  },
  pipe(destination) {
    // add destination to pipe list & write current buffer
    this.pipes.push(destination);
    if (!this.paused && this.buffers.length) {
      this.end();
    }
  },
  unpipe(destination) {
    // remove destination from pipe list
    this.pipes = this.pipes.filter(pipe => pipe !== destination);
  },
  unshift(/* chunk */) {
    // some numpty has read some data that's not for them and they want to put it back!
    // Might implement this some day
    throw new Error('Not Implemented');
  },
  wrap(/* stream */) {
    // not implemented
    throw new Error('Not Implemented');
  },
});

module.exports = StreamBuf;

}, function(modId) { var map = {"./utils":1676879951334,"./string-buf":1676879951335}; return __REQUIRE__(map[modId], modId); })
__DEFINE__(1676879951334, function(require, module, exports) {
const fs = require('fs');

// useful stuff
const inherits = function(cls, superCtor, statics, prototype) {
  // eslint-disable-next-line no-underscore-dangle
  cls.super_ = superCtor;

  if (!prototype) {
    prototype = statics;
    statics = null;
  }

  if (statics) {
    Object.keys(statics).forEach(i => {
      Object.defineProperty(cls, i, Object.getOwnPropertyDescriptor(statics, i));
    });
  }

  const properties = {
    constructor: {
      value: cls,
      enumerable: false,
      writable: false,
      configurable: true,
    },
  };
  if (prototype) {
    Object.keys(prototype).forEach(i => {
      properties[i] = Object.getOwnPropertyDescriptor(prototype, i);
    });
  }

  cls.prototype = Object.create(superCtor.prototype, properties);
};

// eslint-disable-next-line no-control-regex
const xmlDecodeRegex = /[<>&'"\x7F\x00-\x08\x0B-\x0C\x0E-\x1F]/;
const utils = {
  nop() {},
  promiseImmediate(value) {
    return new Promise(resolve => {
      if (global.setImmediate) {
        setImmediate(() => {
          resolve(value);
        });
      } else {
        // poorman's setImmediate - must wait at least 1ms
        setTimeout(() => {
          resolve(value);
        }, 1);
      }
    });
  },
  inherits,
  dateToExcel(d, date1904) {
    return 25569 + ( d.getTime() / (24 * 3600 * 1000) ) - (date1904 ? 1462 : 0);
  },
  excelToDate(v, date1904) {
    const millisecondSinceEpoch = Math.round((v - 25569 + (date1904 ? 1462 : 0)) * 24 * 3600 * 1000);
    return new Date(millisecondSinceEpoch);
  },
  parsePath(filepath) {
    const last = filepath.lastIndexOf('/');
    return {
      path: filepath.substring(0, last),
      name: filepath.substring(last + 1),
    };
  },
  getRelsPath(filepath) {
    const path = utils.parsePath(filepath);
    return `${path.path}/_rels/${path.name}.rels`;
  },
  xmlEncode(text) {
    const regexResult = xmlDecodeRegex.exec(text);
    if (!regexResult) return text;

    let result = '';
    let escape = '';
    let lastIndex = 0;
    let i = regexResult.index;
    for (; i < text.length; i++) {
      const charCode = text.charCodeAt(i);
      switch (charCode) {
        case 34: // "
          escape = '&quot;';
          break;
        case 38: // &
          escape = '&amp;';
          break;
        case 39: // '
          escape = '&apos;';
          break;
        case 60: // <
          escape = '&lt;';
          break;
        case 62: // >
          escape = '&gt;';
          break;
        case 127:
          escape = '';
          break;
        default: {
          if (charCode <= 31 && (charCode <= 8 || (charCode >= 11 && charCode !== 13))) {
            escape = '';
            break;
          }
          continue;
        }
      }
      if (lastIndex !== i) result += text.substring(lastIndex, i);
      lastIndex = i + 1;
      if (escape) result += escape;
    }
    if (lastIndex !== i) return result + text.substring(lastIndex, i);
    return result;
  },
  xmlDecode(text) {
    return text.replace(/&([a-z]*);/g, c => {
      switch (c) {
        case '&lt;':
          return '<';
        case '&gt;':
          return '>';
        case '&amp;':
          return '&';
        case '&apos;':
          return '\'';
        case '&quot;':
          return '"';
        default:
          return c;
      }
    });
  },
  validInt(value) {
    const i = parseInt(value, 10);
    return !Number.isNaN(i) ? i : 0;
  },

  isDateFmt(fmt) {
    if (!fmt) {
      return false;
    }

    // must remove all chars inside quotes and []
    fmt = fmt.replace(/\[[^\]]*]/g, '');
    fmt = fmt.replace(/"[^"]*"/g, '');
    // then check for date formatting chars
    const result = fmt.match(/[ymdhMsb]+/) !== null;
    return result;
  },

  fs: {
    exists(path) {
      return new Promise(resolve => {
        fs.access(path, fs.constants.F_OK, err => {
          resolve(!err);
        });
      });
    },
  },

  toIsoDateString(dt) {
    return dt.toIsoString().subsstr(0, 10);
  },
};

module.exports = utils;

}, function(modId) { var map = {}; return __REQUIRE__(map[modId], modId); })
__DEFINE__(1676879951335, function(require, module, exports) {
// StringBuf - a way to keep string memory operations to a minimum
// while building the strings for the xml files
class StringBuf {
  constructor(options) {
    this._buf = Buffer.alloc((options && options.size) || 16384);
    this._encoding = (options && options.encoding) || 'utf8';

    // where in the buffer we are at
    this._inPos = 0;

    // for use by toBuffer()
    this._buffer = undefined;
  }

  get length() {
    return this._inPos;
  }

  get capacity() {
    return this._buf.length;
  }

  get buffer() {
    return this._buf;
  }

  toBuffer() {
    // return the current data as a single enclosing buffer
    if (!this._buffer) {
      this._buffer = Buffer.alloc(this.length);
      this._buf.copy(this._buffer, 0, 0, this.length);
    }
    return this._buffer;
  }

  reset(position) {
    position = position || 0;
    this._buffer = undefined;
    this._inPos = position;
  }

  _grow(min) {
    let size = this._buf.length * 2;
    while (size < min) {
      size *= 2;
    }
    const buf = Buffer.alloc(size);
    this._buf.copy(buf, 0);
    this._buf = buf;
  }

  addText(text) {
    this._buffer = undefined;

    let inPos = this._inPos + this._buf.write(text, this._inPos, this._encoding);

    // if we've hit (or nearing capacity), grow the buf
    while (inPos >= this._buf.length - 4) {
      this._grow(this._inPos + text.length);

      // keep trying to write until we've completely written the text
      inPos = this._inPos + this._buf.write(text, this._inPos, this._encoding);
    }

    this._inPos = inPos;
  }

  addStringBuf(inBuf) {
    if (inBuf.length) {
      this._buffer = undefined;

      if (this.length + inBuf.length > this.capacity) {
        this._grow(this.length + inBuf.length);
      }
      // eslint-disable-next-line no-underscore-dangle
      inBuf._buf.copy(this._buf, this._inPos, 0, inBuf.length);
      this._inPos += inBuf.length;
    }
  }
}

module.exports = StringBuf;

}, function(modId) { var map = {}; return __REQUIRE__(map[modId], modId); })
__DEFINE__(1676879951336, function(require, module, exports) {
// eslint-disable-next-line node/no-unsupported-features/node-builtins
const textEncoder = typeof TextEncoder === 'undefined' ? null : new TextEncoder('utf-8');
const {Buffer} = require('buffer');

function stringToBuffer(str) {
  if (typeof str !== 'string') {
    return str;
  }
  if (textEncoder) {
    return Buffer.from(textEncoder.encode(str).buffer);
  }
  return Buffer.from(str);
}

exports.stringToBuffer = stringToBuffer;

}, function(modId) { var map = {}; return __REQUIRE__(map[modId], modId); })
__DEFINE__(1676879951337, function(require, module, exports) {
const _ = require('./under-dash');

const utils = require('./utils');

// constants
const OPEN_ANGLE = '<';
const CLOSE_ANGLE = '>';
const OPEN_ANGLE_SLASH = '</';
const CLOSE_SLASH_ANGLE = '/>';
const EQUALS_QUOTE = '="';
const QUOTE = '"';
const SPACE = ' ';

function pushAttribute(xml, name, value) {
  xml.push(SPACE);
  xml.push(name);
  xml.push(EQUALS_QUOTE);
  xml.push(utils.xmlEncode(value.toString()));
  xml.push(QUOTE);
}
function pushAttributes(xml, attributes) {
  if (attributes) {
    _.each(attributes, (value, name) => {
      if (value !== undefined) {
        pushAttribute(xml, name, value);
      }
    });
  }
}

class XmlStream {
  constructor() {
    this._xml = [];
    this._stack = [];
    this._rollbacks = [];
  }

  get tos() {
    return this._stack.length ? this._stack[this._stack.length - 1] : undefined;
  }

  get cursor() {
    // handy way to track whether anything has been added
    return this._xml.length;
  }

  openXml(docAttributes) {
    const xml = this._xml;
    // <?xml version="1.0" encoding="UTF-8" standalone="yes"?>
    xml.push('<?xml');
    pushAttributes(xml, docAttributes);
    xml.push('?>\n');
  }

  openNode(name, attributes) {
    const parent = this.tos;
    const xml = this._xml;
    if (parent && this.open) {
      xml.push(CLOSE_ANGLE);
    }

    this._stack.push(name);

    // start streaming node
    xml.push(OPEN_ANGLE);
    xml.push(name);
    pushAttributes(xml, attributes);
    this.leaf = true;
    this.open = true;
  }

  addAttribute(name, value) {
    if (!this.open) {
      throw new Error('Cannot write attributes to node if it is not open');
    }
    if (value !== undefined) {
      pushAttribute(this._xml, name, value);
    }
  }

  addAttributes(attrs) {
    if (!this.open) {
      throw new Error('Cannot write attributes to node if it is not open');
    }
    pushAttributes(this._xml, attrs);
  }

  writeText(text) {
    const xml = this._xml;
    if (this.open) {
      xml.push(CLOSE_ANGLE);
      this.open = false;
    }
    this.leaf = false;
    xml.push(utils.xmlEncode(text.toString()));
  }

  writeXml(xml) {
    if (this.open) {
      this._xml.push(CLOSE_ANGLE);
      this.open = false;
    }
    this.leaf = false;
    this._xml.push(xml);
  }

  closeNode() {
    const node = this._stack.pop();
    const xml = this._xml;
    if (this.leaf) {
      xml.push(CLOSE_SLASH_ANGLE);
    } else {
      xml.push(OPEN_ANGLE_SLASH);
      xml.push(node);
      xml.push(CLOSE_ANGLE);
    }
    this.open = false;
    this.leaf = false;
  }

  leafNode(name, attributes, text) {
    this.openNode(name, attributes);
    if (text !== undefined) {
      // zeros need to be written
      this.writeText(text);
    }
    this.closeNode();
  }

  closeAll() {
    while (this._stack.length) {
      this.closeNode();
    }
  }

  addRollback() {
    this._rollbacks.push({
      xml: this._xml.length,
      stack: this._stack.length,
      leaf: this.leaf,
      open: this.open,
    });
    return this.cursor;
  }

  commit() {
    this._rollbacks.pop();
  }

  rollback() {
    const r = this._rollbacks.pop();
    if (this._xml.length > r.xml) {
      this._xml.splice(r.xml, this._xml.length - r.xml);
    }
    if (this._stack.length > r.stack) {
      this._stack.splice(r.stack, this._stack.length - r.stack);
    }
    this.leaf = r.leaf;
    this.open = r.open;
  }

  get xml() {
    this.closeAll();
    return this._xml.join('');
  }
}

XmlStream.StdDocAttributes = {
  version: '1.0',
  encoding: 'UTF-8',
  standalone: 'yes',
};

module.exports = XmlStream;

}, function(modId) { var map = {"./under-dash":1676879951315,"./utils":1676879951334}; return __REQUIRE__(map[modId], modId); })
__DEFINE__(1676879951338, function(require, module, exports) {
// eslint-disable-next-line node/no-unsupported-features/node-builtins
const textDecoder = typeof TextDecoder === 'undefined' ? null : new TextDecoder('utf-8');

function bufferToString(chunk) {
  if (typeof chunk === 'string') {
    return chunk;
  }
  if (textDecoder) {
    return textDecoder.decode(chunk);
  }
  return chunk.toString();
}

exports.bufferToString = bufferToString;

}, function(modId) { var map = {}; return __REQUIRE__(map[modId], modId); })
__DEFINE__(1676879951339, function(require, module, exports) {
/* eslint-disable max-classes-per-file */
const Enums = require('../../../doc/enums');
const XmlStream = require('../../../utils/xml-stream');

const BaseXform = require('../base-xform');
const StaticXform = require('../static-xform');
const ListXform = require('../list-xform');
const FontXform = require('./font-xform');
const FillXform = require('./fill-xform');
const BorderXform = require('./border-xform');
const NumFmtXform = require('./numfmt-xform');
const StyleXform = require('./style-xform');
const DxfXform = require('./dxf-xform');

// custom numfmt ids start here
const NUMFMT_BASE = 164;

// =============================================================================
// StylesXform is used to generate and parse the styles.xml file
// it manages the collections of fonts, number formats, alignments, etc
class StylesXform extends BaseXform {
  constructor(initialise) {
    super();

    this.map = {
      numFmts: new ListXform({tag: 'numFmts', count: true, childXform: new NumFmtXform()}),
      fonts: new ListXform({
        tag: 'fonts',
        count: true,
        childXform: new FontXform(),
        $: {'x14ac:knownFonts': 1},
      }),
      fills: new ListXform({tag: 'fills', count: true, childXform: new FillXform()}),
      borders: new ListXform({tag: 'borders', count: true, childXform: new BorderXform()}),
      cellStyleXfs: new ListXform({tag: 'cellStyleXfs', count: true, childXform: new StyleXform()}),
      cellXfs: new ListXform({
        tag: 'cellXfs',
        count: true,
        childXform: new StyleXform({xfId: true}),
      }),
      dxfs: new ListXform({tag: 'dxfs', always: true, count: true, childXform: new DxfXform()}),

      // for style manager
      numFmt: new NumFmtXform(),
      font: new FontXform(),
      fill: new FillXform(),
      border: new BorderXform(),
      style: new StyleXform({xfId: true}),

      cellStyles: StylesXform.STATIC_XFORMS.cellStyles,
      tableStyles: StylesXform.STATIC_XFORMS.tableStyles,
      extLst: StylesXform.STATIC_XFORMS.extLst,
    };

    if (initialise) {
      // StylesXform also acts as style manager and is used to build up styles-model during worksheet processing
      this.init();
    }
  }

  initIndex() {
    this.index = {
      style: {},
      numFmt: {},
      numFmtNextId: 164, // start custom format ids here
      font: {},
      border: {},
      fill: {},
    };
  }

  init() {
    // Prepare for Style Manager role
    this.model = {
      styles: [],
      numFmts: [],
      fonts: [],
      borders: [],
      fills: [],
      dxfs: [],
    };

    this.initIndex();

    // default (zero) border
    this._addBorder({});

    // add default (all zero) style
    this._addStyle({numFmtId: 0, fontId: 0, fillId: 0, borderId: 0, xfId: 0});

    // add default fills
    this._addFill({type: 'pattern', pattern: 'none'});
    this._addFill({type: 'pattern', pattern: 'gray125'});

    this.weakMap = new WeakMap();
  }

  render(xmlStream, model) {
    model = model || this.model;
    //
    //   <fonts count="2" x14ac:knownFonts="1">
    xmlStream.openXml(XmlStream.StdDocAttributes);

    xmlStream.openNode('styleSheet', StylesXform.STYLESHEET_ATTRIBUTES);

    if (this.index) {
      // model has been built by style manager role (contains xml)
      if (model.numFmts && model.numFmts.length) {
        xmlStream.openNode('numFmts', {count: model.numFmts.length});
        model.numFmts.forEach(numFmtXml => {
          xmlStream.writeXml(numFmtXml);
        });
        xmlStream.closeNode();
      }

      if (!model.fonts.length) {
        // default (zero) font
        this._addFont({size: 11, color: {theme: 1}, name: 'Calibri', family: 2, scheme: 'minor'});
      }
      xmlStream.openNode('fonts', {count: model.fonts.length, 'x14ac:knownFonts': 1});
      model.fonts.forEach(fontXml => {
        xmlStream.writeXml(fontXml);
      });
      xmlStream.closeNode();

      xmlStream.openNode('fills', {count: model.fills.length});
      model.fills.forEach(fillXml => {
        xmlStream.writeXml(fillXml);
      });
      xmlStream.closeNode();

      xmlStream.openNode('borders', {count: model.borders.length});
      model.borders.forEach(borderXml => {
        xmlStream.writeXml(borderXml);
      });
      xmlStream.closeNode();

      this.map.cellStyleXfs.render(xmlStream, [
        {numFmtId: 0, fontId: 0, fillId: 0, borderId: 0, xfId: 0},
      ]);

      xmlStream.openNode('cellXfs', {count: model.styles.length});
      model.styles.forEach(styleXml => {
        xmlStream.writeXml(styleXml);
      });
      xmlStream.closeNode();
    } else {
      // model is plain JSON and needs to be xformed
      this.map.numFmts.render(xmlStream, model.numFmts);
      this.map.fonts.render(xmlStream, model.fonts);
      this.map.fills.render(xmlStream, model.fills);
      this.map.borders.render(xmlStream, model.borders);
      this.map.cellStyleXfs.render(xmlStream, [
        {numFmtId: 0, fontId: 0, fillId: 0, borderId: 0, xfId: 0},
      ]);
      this.map.cellXfs.render(xmlStream, model.styles);
    }

    StylesXform.STATIC_XFORMS.cellStyles.render(xmlStream);

    this.map.dxfs.render(xmlStream, model.dxfs);

    StylesXform.STATIC_XFORMS.tableStyles.render(xmlStream);
    StylesXform.STATIC_XFORMS.extLst.render(xmlStream);

    xmlStream.closeNode();
  }

  parseOpen(node) {
    if (this.parser) {
      this.parser.parseOpen(node);
      return true;
    }
    switch (node.name) {
      case 'styleSheet':
        this.initIndex();
        return true;
      default:
        this.parser = this.map[node.name];
        if (this.parser) {
          this.parser.parseOpen(node);
        }
        return true;
    }
  }

  parseText(text) {
    if (this.parser) {
      this.parser.parseText(text);
    }
  }

  parseClose(name) {
    if (this.parser) {
      if (!this.parser.parseClose(name)) {
        this.parser = undefined;
      }
      return true;
    }
    switch (name) {
      case 'styleSheet': {
        this.model = {};
        const add = (propName, xform) => {
          if (xform.model && xform.model.length) {
            this.model[propName] = xform.model;
          }
        };
        add('numFmts', this.map.numFmts);
        add('fonts', this.map.fonts);
        add('fills', this.map.fills);
        add('borders', this.map.borders);
        add('styles', this.map.cellXfs);
        add('dxfs', this.map.dxfs);

        // index numFmts
        this.index = {
          model: [],
          numFmt: [],
        };
        if (this.model.numFmts) {
          const numFmtIndex = this.index.numFmt;
          this.model.numFmts.forEach(numFmt => {
            numFmtIndex[numFmt.id] = numFmt.formatCode;
          });
        }

        return false;
      }
      default:
        // not quite sure how we get here!
        return true;
    }
  }

  // add a cell's style model to the collection
  // each style property is processed and cross-referenced, etc.
  // the styleId is returned. Note: cellType is used when numFmt not defined
  addStyleModel(model, cellType) {
    if (!model) {
      return 0;
    }

    // if we have no default font, add it here now
    if (!this.model.fonts.length) {
      // default (zero) font
      this._addFont({size: 11, color: {theme: 1}, name: 'Calibri', family: 2, scheme: 'minor'});
    }

    // if we have seen this style object before, assume it has the same styleId
    if (this.weakMap && this.weakMap.has(model)) {
      return this.weakMap.get(model);
    }

    const style = {};
    cellType = cellType || Enums.ValueType.Number;

    if (model.numFmt) {
      style.numFmtId = this._addNumFmtStr(model.numFmt);
    } else {
      switch (cellType) {
        case Enums.ValueType.Number:
          style.numFmtId = this._addNumFmtStr('General');
          break;
        case Enums.ValueType.Date:
          style.numFmtId = this._addNumFmtStr('mm-dd-yy');
          break;
        default:
          break;
      }
    }

    if (model.font) {
      style.fontId = this._addFont(model.font);
    }

    if (model.border) {
      style.borderId = this._addBorder(model.border);
    }

    if (model.fill) {
      style.fillId = this._addFill(model.fill);
    }

    if (model.alignment) {
      style.alignment = model.alignment;
    }

    if (model.protection) {
      style.protection = model.protection;
    }

    const styleId = this._addStyle(style);
    if (this.weakMap) {
      this.weakMap.set(model, styleId);
    }
    return styleId;
  }

  // given a styleId (i.e. s="n"), get the cell's style model
  // objects are shared where possible.
  getStyleModel(id) {
    // if the style doesn't exist return null
    const style = this.model.styles[id];
    if (!style) return null;

    // have we built this model before?
    let model = this.index.model[id];
    if (model) return model;

    // build a new model
    model = this.index.model[id] = {};

    // -------------------------------------------------------
    // number format
    if (style.numFmtId) {
      const numFmt =
        this.index.numFmt[style.numFmtId] || NumFmtXform.getDefaultFmtCode(style.numFmtId);
      if (numFmt) {
        model.numFmt = numFmt;
      }
    }

    function addStyle(name, group, styleId) {
      if (styleId || styleId === 0) {
        const part = group[styleId];
        if (part) {
          model[name] = part;
        }
      }
    }

    addStyle('font', this.model.fonts, style.fontId);
    addStyle('border', this.model.borders, style.borderId);
    addStyle('fill', this.model.fills, style.fillId);

    // -------------------------------------------------------
    // alignment
    if (style.alignment) {
      model.alignment = style.alignment;
    }

    // -------------------------------------------------------
    // protection
    if (style.protection) {
      model.protection = style.protection;
    }

    return model;
  }

  addDxfStyle(style) {
    this.model.dxfs.push(style);
    return this.model.dxfs.length - 1;
  }

  getDxfStyle(id) {
    return this.model.dxfs[id];
  }

  // =========================================================================
  // Private Interface
  _addStyle(style) {
    const xml = this.map.style.toXml(style);
    let index = this.index.style[xml];
    if (index === undefined) {
      index = this.index.style[xml] = this.model.styles.length;
      this.model.styles.push(xml);
    }
    return index;
  }

  // =========================================================================
  // Number Formats
  _addNumFmtStr(formatCode) {
    // check if default format
    let index = NumFmtXform.getDefaultFmtId(formatCode);
    if (index !== undefined) return index;

    // check if already in
    index = this.index.numFmt[formatCode];
    if (index !== undefined) return index;

    index = this.index.numFmt[formatCode] = NUMFMT_BASE + this.model.numFmts.length;
    const xml = this.map.numFmt.toXml({id: index, formatCode});
    this.model.numFmts.push(xml);
    return index;
  }

  // =========================================================================
  // Fonts
  _addFont(font) {
    const xml = this.map.font.toXml(font);
    let index = this.index.font[xml];
    if (index === undefined) {
      index = this.index.font[xml] = this.model.fonts.length;
      this.model.fonts.push(xml);
    }
    return index;
  }

  // =========================================================================
  // Borders
  _addBorder(border) {
    const xml = this.map.border.toXml(border);
    let index = this.index.border[xml];
    if (index === undefined) {
      index = this.index.border[xml] = this.model.borders.length;
      this.model.borders.push(xml);
    }
    return index;
  }

  // =========================================================================
  // Fills
  _addFill(fill) {
    const xml = this.map.fill.toXml(fill);
    let index = this.index.fill[xml];
    if (index === undefined) {
      index = this.index.fill[xml] = this.model.fills.length;
      this.model.fills.push(xml);
    }
    return index;
  }

  // =========================================================================
}

StylesXform.STYLESHEET_ATTRIBUTES = {
  xmlns: 'http://schemas.openxmlformats.org/spreadsheetml/2006/main',
  'xmlns:mc': 'http://schemas.openxmlformats.org/markup-compatibility/2006',
  'mc:Ignorable': 'x14ac x16r2',
  'xmlns:x14ac': 'http://schemas.microsoft.com/office/spreadsheetml/2009/9/ac',
  'xmlns:x16r2': 'http://schemas.microsoft.com/office/spreadsheetml/2015/02/main',
};
StylesXform.STATIC_XFORMS = {
  cellStyles: new StaticXform({
    tag: 'cellStyles',
    $: {count: 1},
    c: [{tag: 'cellStyle', $: {name: 'Normal', xfId: 0, builtinId: 0}}],
  }),
  dxfs: new StaticXform({tag: 'dxfs', $: {count: 0}}),
  tableStyles: new StaticXform({
    tag: 'tableStyles',
    $: {count: 0, defaultTableStyle: 'TableStyleMedium2', defaultPivotStyle: 'PivotStyleLight16'},
  }),
  extLst: new StaticXform({
    tag: 'extLst',
    c: [
      {
        tag: 'ext',
        $: {
          uri: '{EB79DEF2-80B8-43e5-95BD-54CBDDF9020C}',
          'xmlns:x14': 'http://schemas.microsoft.com/office/spreadsheetml/2009/9/main',
        },
        c: [{tag: 'x14:slicerStyles', $: {defaultSlicerStyle: 'SlicerStyleLight1'}}],
      },
      {
        tag: 'ext',
        $: {
          uri: '{9260A510-F301-46a8-8635-F512D64BE5F5}',
          'xmlns:x15': 'http://schemas.microsoft.com/office/spreadsheetml/2010/11/main',
        },
        c: [{tag: 'x15:timelineStyles', $: {defaultTimelineStyle: 'TimeSlicerStyleLight1'}}],
      },
    ],
  }),
};

// the stylemanager mock acts like StyleManager except that it always returns 0 or {}
class StylesXformMock extends StylesXform {
  constructor() {
    super();

    this.model = {
      styles: [{numFmtId: 0, fontId: 0, fillId: 0, borderId: 0, xfId: 0}],
      numFmts: [],
      fonts: [{size: 11, color: {theme: 1}, name: 'Calibri', family: 2, scheme: 'minor'}],
      borders: [{}],
      fills: [
        {type: 'pattern', pattern: 'none'},
        {type: 'pattern', pattern: 'gray125'},
      ],
    };
  }

  // =========================================================================
  // Style Manager Interface

  // override normal behaviour - consume and dispose
  parseStream(stream) {
    stream.autodrain();
    return Promise.resolve();
  }

  // add a cell's style model to the collection
  // each style property is processed and cross-referenced, etc.
  // the styleId is returned. Note: cellType is used when numFmt not defined
  addStyleModel(model, cellType) {
    switch (cellType) {
      case Enums.ValueType.Date:
        return this.dateStyleId;
      default:
        return 0;
    }
  }

  get dateStyleId() {
    if (!this._dateStyleId) {
      const dateStyle = {
        numFmtId: NumFmtXform.getDefaultFmtId('mm-dd-yy'),
      };
      this._dateStyleId = this.model.styles.length;
      this.model.styles.push(dateStyle);
    }
    return this._dateStyleId;
  }

  // given a styleId (i.e. s="n"), get the cell's style model
  // objects are shared where possible.
  getStyleModel(/* id */) {
    return {};
  }
}

StylesXform.Mock = StylesXformMock;

module.exports = StylesXform;

}, function(modId) { var map = {"../../../doc/enums":1676879951319,"../../../utils/xml-stream":1676879951337,"../base-xform":1676879951340,"../static-xform":1676879951342,"../list-xform":1676879951343,"./font-xform":1676879951344,"./fill-xform":1676879951350,"./border-xform":1676879951351,"./numfmt-xform":1676879951352,"./style-xform":1676879951354,"./dxf-xform":1676879951357}; return __REQUIRE__(map[modId], modId); })
__DEFINE__(1676879951340, function(require, module, exports) {
const parseSax = require('../../utils/parse-sax');
const XmlStream = require('../../utils/xml-stream');

/* 'virtual' methods used as a form of documentation */
/* eslint-disable class-methods-use-this */

// Base class for Xforms
class BaseXform {
  // constructor(/* model, name */) {}

  // ============================================================
  // Virtual Interface
  prepare(/* model, options */) {
    // optional preparation (mutation) of model so it is ready for write
  }

  render(/* xmlStream, model */) {
    // convert model to xml
  }

  parseOpen(node) {
    // XML node opened
  }

  parseText(text) {
    // chunk of text encountered for current node
  }

  parseClose(name) {
    // XML node closed
  }

  reconcile(model, options) {
    // optional post-parse step (opposite to prepare)
  }

  // ============================================================
  reset() {
    // to make sure parses don't bleed to next iteration
    this.model = null;

    // if we have a map - reset them too
    if (this.map) {
      Object.values(this.map).forEach(xform => {
        if (xform instanceof BaseXform) {
          xform.reset();
        } else if (xform.xform) {
          xform.xform.reset();
        }
      });
    }
  }

  mergeModel(obj) {
    // set obj's props to this.model
    this.model = Object.assign(this.model || {}, obj);
  }

  async parse(saxParser) {
    for await (const events of saxParser) {
      for (const {eventType, value} of events) {
        if (eventType === 'opentag') {
          this.parseOpen(value);
        } else if (eventType === 'text') {
          this.parseText(value);
        } else if (eventType === 'closetag') {
          if (!this.parseClose(value.name)) {
            return this.model;
          }
        }
      }
    }
    return this.model;
  }

  async parseStream(stream) {
    return this.parse(parseSax(stream));
  }

  get xml() {
    // convenience function to get the xml of this.model
    // useful for manager types that are built during the prepare phase
    return this.toXml(this.model);
  }

  toXml(model) {
    const xmlStream = new XmlStream();
    this.render(xmlStream, model);
    return xmlStream.xml;
  }

  // ============================================================
  // Useful Utilities
  static toAttribute(value, dflt, always = false) {
    if (value === undefined) {
      if (always) {
        return dflt;
      }
    } else if (always || value !== dflt) {
      return value.toString();
    }
    return undefined;
  }

  static toStringAttribute(value, dflt, always = false) {
    return BaseXform.toAttribute(value, dflt, always);
  }

  static toStringValue(attr, dflt) {
    return attr === undefined ? dflt : attr;
  }

  static toBoolAttribute(value, dflt, always = false) {
    if (value === undefined) {
      if (always) {
        return dflt;
      }
    } else if (always || value !== dflt) {
      return value ? '1' : '0';
    }
    return undefined;
  }

  static toBoolValue(attr, dflt) {
    return attr === undefined ? dflt : attr === '1';
  }

  static toIntAttribute(value, dflt, always = false) {
    return BaseXform.toAttribute(value, dflt, always);
  }

  static toIntValue(attr, dflt) {
    return attr === undefined ? dflt : parseInt(attr, 10);
  }

  static toFloatAttribute(value, dflt, always = false) {
    return BaseXform.toAttribute(value, dflt, always);
  }

  static toFloatValue(attr, dflt) {
    return attr === undefined ? dflt : parseFloat(attr);
  }
}

module.exports = BaseXform;

}, function(modId) { var map = {"../../utils/parse-sax":1676879951341,"../../utils/xml-stream":1676879951337}; return __REQUIRE__(map[modId], modId); })
__DEFINE__(1676879951341, function(require, module, exports) {
const {SaxesParser} = require('saxes');
const {PassThrough} = require('readable-stream');
const {bufferToString} = require('./browser-buffer-decode');

module.exports = async function* (iterable) {
  // TODO: Remove once node v8 is deprecated
  // Detect and upgrade old streams
  if (iterable.pipe && !iterable[Symbol.asyncIterator]) {
    iterable = iterable.pipe(new PassThrough());
  }
  const saxesParser = new SaxesParser();
  let error;
  saxesParser.on('error', err => {
    error = err;
  });
  let events = [];
  saxesParser.on('opentag', value => events.push({eventType: 'opentag', value}));
  saxesParser.on('text', value => events.push({eventType: 'text', value}));
  saxesParser.on('closetag', value => events.push({eventType: 'closetag', value}));
  for await (const chunk of iterable) {
    saxesParser.write(bufferToString(chunk));
    // saxesParser.write and saxesParser.on() are synchronous,
    // so we can only reach the below line once all events have been emitted
    if (error) throw error;
    // As a performance optimization, we gather all events instead of passing
    // them one by one, which would cause each event to go through the event queue
    yield events;
    events = [];
  }
};

}, function(modId) { var map = {"./browser-buffer-decode":1676879951338}; return __REQUIRE__(map[modId], modId); })
__DEFINE__(1676879951342, function(require, module, exports) {
const BaseXform = require('./base-xform');
const XmlStream = require('../../utils/xml-stream');

// const model = {
//   tag: 'name',
//   $: {attr: 'value'},
//   c: [
//     { tag: 'child' }
//   ],
//   t: 'some text'
// };

function build(xmlStream, model) {
  xmlStream.openNode(model.tag, model.$);
  if (model.c) {
    model.c.forEach(child => {
      build(xmlStream, child);
    });
  }
  if (model.t) {
    xmlStream.writeText(model.t);
  }
  xmlStream.closeNode();
}

class StaticXform extends BaseXform {
  constructor(model) {
    super();

    // This class is an optimisation for static (unimportant and unchanging) xml
    // It is stateless - apart from its static model and so can be used as a singleton
    // Being stateless - it will only track entry to and exit from it's root xml tag during parsing and nothing else
    // Known issues:
    //    since stateless - parseOpen always returns true. Parent xform must know when to start using this xform
    //    if the root tag is recursive, the parsing will behave unpredictably
    this._model = model;
  }

  render(xmlStream) {
    if (!this._xml) {
      const stream = new XmlStream();
      build(stream, this._model);
      this._xml = stream.xml;
    }
    xmlStream.writeXml(this._xml);
  }

  parseOpen() {
    return true;
  }

  parseText() {}

  parseClose(name) {
    switch (name) {
      case this._model.tag:
        return false;
      default:
        return true;
    }
  }
}

module.exports = StaticXform;

}, function(modId) { var map = {"./base-xform":1676879951340,"../../utils/xml-stream":1676879951337}; return __REQUIRE__(map[modId], modId); })
__DEFINE__(1676879951343, function(require, module, exports) {
const BaseXform = require('./base-xform');

class ListXform extends BaseXform {
  constructor(options) {
    super();

    this.tag = options.tag;
    this.always = !!options.always;
    this.count = options.count;
    this.empty = options.empty;
    this.$count = options.$count || 'count';
    this.$ = options.$;
    this.childXform = options.childXform;
    this.maxItems = options.maxItems;
  }

  prepare(model, options) {
    const {childXform} = this;
    if (model) {
      model.forEach((childModel, index) => {
        options.index = index;
        childXform.prepare(childModel, options);
      });
    }
  }

  render(xmlStream, model) {
    if (this.always || (model && model.length)) {
      xmlStream.openNode(this.tag, this.$);
      if (this.count) {
        xmlStream.addAttribute(this.$count, (model && model.length) || 0);
      }

      const {childXform} = this;
      (model || []).forEach((childModel, index) => {
        childXform.render(xmlStream, childModel, index);
      });

      xmlStream.closeNode();
    } else if (this.empty) {
      xmlStream.leafNode(this.tag);
    }
  }

  parseOpen(node) {
    if (this.parser) {
      this.parser.parseOpen(node);
      return true;
    }
    switch (node.name) {
      case this.tag:
        this.model = [];
        return true;
      default:
        if (this.childXform.parseOpen(node)) {
          this.parser = this.childXform;
          return true;
        }
        return false;
    }
  }

  parseText(text) {
    if (this.parser) {
      this.parser.parseText(text);
    }
  }

  parseClose(name) {
    if (this.parser) {
      if (!this.parser.parseClose(name)) {
        this.model.push(this.parser.model);
        this.parser = undefined;

        if (this.maxItems && this.model.length > this.maxItems) {
          throw new Error(`Max ${this.childXform.tag} count (${this.maxItems}) exceeded`);
        }
      }
      return true;
    }

    return false;
  }

  reconcile(model, options) {
    if (model) {
      const {childXform} = this;
      model.forEach(childModel => {
        childXform.reconcile(childModel, options);
      });
    }
  }
}

module.exports = ListXform;

}, function(modId) { var map = {"./base-xform":1676879951340}; return __REQUIRE__(map[modId], modId); })
__DEFINE__(1676879951344, function(require, module, exports) {


const ColorXform = require('./color-xform');
const BooleanXform = require('../simple/boolean-xform');
const IntegerXform = require('../simple/integer-xform');
const StringXform = require('../simple/string-xform');
const UnderlineXform = require('./underline-xform');

const _ = require('../../../utils/under-dash');
const BaseXform = require('../base-xform');

// Font encapsulates translation from font model to xlsx
class FontXform extends BaseXform {
  constructor(options) {
    super();

    this.options = options || FontXform.OPTIONS;

    this.map = {
      b: {prop: 'bold', xform: new BooleanXform({tag: 'b', attr: 'val'})},
      i: {prop: 'italic', xform: new BooleanXform({tag: 'i', attr: 'val'})},
      u: {prop: 'underline', xform: new UnderlineXform()},
      charset: {prop: 'charset', xform: new IntegerXform({tag: 'charset', attr: 'val'})},
      color: {prop: 'color', xform: new ColorXform()},
      condense: {prop: 'condense', xform: new BooleanXform({tag: 'condense', attr: 'val'})},
      extend: {prop: 'extend', xform: new BooleanXform({tag: 'extend', attr: 'val'})},
      family: {prop: 'family', xform: new IntegerXform({tag: 'family', attr: 'val'})},
      outline: {prop: 'outline', xform: new BooleanXform({tag: 'outline', attr: 'val'})},
      vertAlign: {prop: 'vertAlign', xform: new StringXform({tag: 'vertAlign', attr: 'val'})},
      scheme: {prop: 'scheme', xform: new StringXform({tag: 'scheme', attr: 'val'})},
      shadow: {prop: 'shadow', xform: new BooleanXform({tag: 'shadow', attr: 'val'})},
      strike: {prop: 'strike', xform: new BooleanXform({tag: 'strike', attr: 'val'})},
      sz: {prop: 'size', xform: new IntegerXform({tag: 'sz', attr: 'val'})},
    };
    this.map[this.options.fontNameTag] = {
      prop: 'name',
      xform: new StringXform({tag: this.options.fontNameTag, attr: 'val'}),
    };
  }

  get tag() {
    return this.options.tagName;
  }

  render(xmlStream, model) {
    const {map} = this;

    xmlStream.openNode(this.options.tagName);
    _.each(this.map, (defn, tag) => {
      map[tag].xform.render(xmlStream, model[defn.prop]);
    });
    xmlStream.closeNode();
  }

  parseOpen(node) {
    if (this.parser) {
      this.parser.parseOpen(node);
      return true;
    }
    if (this.map[node.name]) {
      this.parser = this.map[node.name].xform;
      return this.parser.parseOpen(node);
    }
    switch (node.name) {
      case this.options.tagName:
        this.model = {};
        return true;
      default:
        return false;
    }
  }

  parseText(text) {
    if (this.parser) {
      this.parser.parseText(text);
    }
  }

  parseClose(name) {
    if (this.parser && !this.parser.parseClose(name)) {
      const item = this.map[name];
      if (this.parser.model) {
        this.model[item.prop] = this.parser.model;
      }
      this.parser = undefined;
      return true;
    }
    switch (name) {
      case this.options.tagName:
        return false;
      default:
        return true;
    }
  }
}

FontXform.OPTIONS = {
  tagName: 'font',
  fontNameTag: 'name',
};

module.exports = FontXform;

}, function(modId) { var map = {"./color-xform":1676879951345,"../simple/boolean-xform":1676879951346,"../simple/integer-xform":1676879951347,"../simple/string-xform":1676879951348,"./underline-xform":1676879951349,"../../../utils/under-dash":1676879951315,"../base-xform":1676879951340}; return __REQUIRE__(map[modId], modId); })
__DEFINE__(1676879951345, function(require, module, exports) {
const BaseXform = require('../base-xform');

// Color encapsulates translation from color model to/from xlsx
class ColorXform extends BaseXform {
  constructor(name) {
    super();

    // this.name controls the xm node name
    this.name = name || 'color';
  }

  get tag() {
    return this.name;
  }

  render(xmlStream, model) {
    if (model) {
      xmlStream.openNode(this.name);
      if (model.argb) {
        xmlStream.addAttribute('rgb', model.argb);
      } else if (model.theme !== undefined) {
        xmlStream.addAttribute('theme', model.theme);
        if (model.tint !== undefined) {
          xmlStream.addAttribute('tint', model.tint);
        }
      } else if (model.indexed !== undefined) {
        xmlStream.addAttribute('indexed', model.indexed);
      } else {
        xmlStream.addAttribute('auto', '1');
      }
      xmlStream.closeNode();
      return true;
    }
    return false;
  }

  parseOpen(node) {
    if (node.name === this.name) {
      if (node.attributes.rgb) {
        this.model = {argb: node.attributes.rgb};
      } else if (node.attributes.theme) {
        this.model = {theme: parseInt(node.attributes.theme, 10)};
        if (node.attributes.tint) {
          this.model.tint = parseFloat(node.attributes.tint);
        }
      } else if (node.attributes.indexed) {
        this.model = {indexed: parseInt(node.attributes.indexed, 10)};
      } else {
        this.model = undefined;
      }
      return true;
    }
    return false;
  }

  parseText() {}

  parseClose() {
    return false;
  }
}

module.exports = ColorXform;

}, function(modId) { var map = {"../base-xform":1676879951340}; return __REQUIRE__(map[modId], modId); })
__DEFINE__(1676879951346, function(require, module, exports) {
const BaseXform = require('../base-xform');

class BooleanXform extends BaseXform {
  constructor(options) {
    super();

    this.tag = options.tag;
    this.attr = options.attr;
  }

  render(xmlStream, model) {
    if (model) {
      xmlStream.openNode(this.tag);
      xmlStream.closeNode();
    }
  }

  parseOpen(node) {
    if (node.name === this.tag) {
      this.model = true;
    }
  }

  parseText() {}

  parseClose() {
    return false;
  }
}

module.exports = BooleanXform;

}, function(modId) { var map = {"../base-xform":1676879951340}; return __REQUIRE__(map[modId], modId); })
__DEFINE__(1676879951347, function(require, module, exports) {
const BaseXform = require('../base-xform');

class IntegerXform extends BaseXform {
  constructor(options) {
    super();

    this.tag = options.tag;
    this.attr = options.attr;
    this.attrs = options.attrs;

    // option to render zero
    this.zero = options.zero;
  }

  render(xmlStream, model) {
    // int is different to float in that zero is not rendered
    if (model || this.zero) {
      xmlStream.openNode(this.tag);
      if (this.attrs) {
        xmlStream.addAttributes(this.attrs);
      }
      if (this.attr) {
        xmlStream.addAttribute(this.attr, model);
      } else {
        xmlStream.writeText(model);
      }
      xmlStream.closeNode();
    }
  }

  parseOpen(node) {
    if (node.name === this.tag) {
      if (this.attr) {
        this.model = parseInt(node.attributes[this.attr], 10);
      } else {
        this.text = [];
      }
      return true;
    }
    return false;
  }

  parseText(text) {
    if (!this.attr) {
      this.text.push(text);
    }
  }

  parseClose() {
    if (!this.attr) {
      this.model = parseInt(this.text.join('') || 0, 10);
    }
    return false;
  }
}

module.exports = IntegerXform;

}, function(modId) { var map = {"../base-xform":1676879951340}; return __REQUIRE__(map[modId], modId); })
__DEFINE__(1676879951348, function(require, module, exports) {
const BaseXform = require('../base-xform');

class StringXform extends BaseXform {
  constructor(options) {
    super();

    this.tag = options.tag;
    this.attr = options.attr;
    this.attrs = options.attrs;
  }

  render(xmlStream, model) {
    if (model !== undefined) {
      xmlStream.openNode(this.tag);
      if (this.attrs) {
        xmlStream.addAttributes(this.attrs);
      }
      if (this.attr) {
        xmlStream.addAttribute(this.attr, model);
      } else {
        xmlStream.writeText(model);
      }
      xmlStream.closeNode();
    }
  }

  parseOpen(node) {
    if (node.name === this.tag) {
      if (this.attr) {
        this.model = node.attributes[this.attr];
      } else {
        this.text = [];
      }
    }
  }

  parseText(text) {
    if (!this.attr) {
      this.text.push(text);
    }
  }

  parseClose() {
    if (!this.attr) {
      this.model = this.text.join('');
    }
    return false;
  }
}

module.exports = StringXform;

}, function(modId) { var map = {"../base-xform":1676879951340}; return __REQUIRE__(map[modId], modId); })
__DEFINE__(1676879951349, function(require, module, exports) {
const BaseXform = require('../base-xform');

class UnderlineXform extends BaseXform {
  constructor(model) {
    super();

    this.model = model;
  }

  get tag() {
    return 'u';
  }

  render(xmlStream, model) {
    model = model || this.model;

    if (model === true) {
      xmlStream.leafNode('u');
    } else {
      const attr = UnderlineXform.Attributes[model];
      if (attr) {
        xmlStream.leafNode('u', attr);
      }
    }
  }

  parseOpen(node) {
    if (node.name === 'u') {
      this.model = node.attributes.val || true;
    }
  }

  parseText() {}

  parseClose() {
    return false;
  }
}

UnderlineXform.Attributes = {
  single: {},
  double: {val: 'double'},
  singleAccounting: {val: 'singleAccounting'},
  doubleAccounting: {val: 'doubleAccounting'},
};

module.exports = UnderlineXform;

}, function(modId) { var map = {"../base-xform":1676879951340}; return __REQUIRE__(map[modId], modId); })
__DEFINE__(1676879951350, function(require, module, exports) {
/* eslint-disable max-classes-per-file */
const BaseXform = require('../base-xform');

const ColorXform = require('./color-xform');

class StopXform extends BaseXform {
  constructor() {
    super();

    this.map = {
      color: new ColorXform(),
    };
  }

  get tag() {
    return 'stop';
  }

  render(xmlStream, model) {
    xmlStream.openNode('stop');
    xmlStream.addAttribute('position', model.position);
    this.map.color.render(xmlStream, model.color);
    xmlStream.closeNode();
  }

  parseOpen(node) {
    if (this.parser) {
      this.parser.parseOpen(node);
      return true;
    }
    switch (node.name) {
      case 'stop':
        this.model = {
          position: parseFloat(node.attributes.position),
        };
        return true;
      case 'color':
        this.parser = this.map.color;
        this.parser.parseOpen(node);
        return true;
      default:
        return false;
    }
  }

  parseText() {}

  parseClose(name) {
    if (this.parser) {
      if (!this.parser.parseClose(name)) {
        this.model.color = this.parser.model;
        this.parser = undefined;
      }
      return true;
    }
    return false;
  }
}

class PatternFillXform extends BaseXform {
  constructor() {
    super();

    this.map = {
      fgColor: new ColorXform('fgColor'),
      bgColor: new ColorXform('bgColor'),
    };
  }

  get name() {
    return 'pattern';
  }

  get tag() {
    return 'patternFill';
  }

  render(xmlStream, model) {
    xmlStream.openNode('patternFill');
    xmlStream.addAttribute('patternType', model.pattern);
    if (model.fgColor) {
      this.map.fgColor.render(xmlStream, model.fgColor);
    }
    if (model.bgColor) {
      this.map.bgColor.render(xmlStream, model.bgColor);
    }
    xmlStream.closeNode();
  }

  parseOpen(node) {
    if (this.parser) {
      this.parser.parseOpen(node);
      return true;
    }
    switch (node.name) {
      case 'patternFill':
        this.model = {
          type: 'pattern',
          pattern: node.attributes.patternType,
        };
        return true;
      default:
        this.parser = this.map[node.name];
        if (this.parser) {
          this.parser.parseOpen(node);
          return true;
        }
        return false;
    }
  }

  parseText(text) {
    if (this.parser) {
      this.parser.parseText(text);
    }
  }

  parseClose(name) {
    if (this.parser) {
      if (!this.parser.parseClose(name)) {
        if (this.parser.model) {
          this.model[name] = this.parser.model;
        }
        this.parser = undefined;
      }
      return true;
    }
    return false;
  }
}

class GradientFillXform extends BaseXform {
  constructor() {
    super();

    this.map = {
      stop: new StopXform(),
    };
    // if (model) {
    //   this.gradient = model.gradient;
    //   if (model.center) {
    //     this.center = model.center;
    //   }
    //   if (model.degree !== undefined) {
    //     this.degree = model.degree;
    //   }
    //   this.stops = model.stops.map(function(stop) { return new StopXform(stop); });
    // } else {
    //   this.stops = [];
    // }
  }

  get name() {
    return 'gradient';
  }

  get tag() {
    return 'gradientFill';
  }

  render(xmlStream, model) {
    xmlStream.openNode('gradientFill');
    switch (model.gradient) {
      case 'angle':
        xmlStream.addAttribute('degree', model.degree);
        break;
      case 'path':
        xmlStream.addAttribute('type', 'path');
        if (model.center.left) {
          xmlStream.addAttribute('left', model.center.left);
          if (model.center.right === undefined) {
            xmlStream.addAttribute('right', model.center.left);
          }
        }
        if (model.center.right) {
          xmlStream.addAttribute('right', model.center.right);
        }
        if (model.center.top) {
          xmlStream.addAttribute('top', model.center.top);
          if (model.center.bottom === undefined) {
            xmlStream.addAttribute('bottom', model.center.top);
          }
        }
        if (model.center.bottom) {
          xmlStream.addAttribute('bottom', model.center.bottom);
        }
        break;

      default:
        break;
    }

    const stopXform = this.map.stop;
    model.stops.forEach(stopModel => {
      stopXform.render(xmlStream, stopModel);
    });

    xmlStream.closeNode();
  }

  parseOpen(node) {
    if (this.parser) {
      this.parser.parseOpen(node);
      return true;
    }
    switch (node.name) {
      case 'gradientFill': {
        const model = (this.model = {
          stops: [],
        });
        if (node.attributes.degree) {
          model.gradient = 'angle';
          model.degree = parseInt(node.attributes.degree, 10);
        } else if (node.attributes.type === 'path') {
          model.gradient = 'path';
          model.center = {
            left: node.attributes.left ? parseFloat(node.attributes.left) : 0,
            top: node.attributes.top ? parseFloat(node.attributes.top) : 0,
          };
          if (node.attributes.right !== node.attributes.left) {
            model.center.right = node.attributes.right ? parseFloat(node.attributes.right) : 0;
          }
          if (node.attributes.bottom !== node.attributes.top) {
            model.center.bottom = node.attributes.bottom ? parseFloat(node.attributes.bottom) : 0;
          }
        }
        return true;
      }

      case 'stop':
        this.parser = this.map.stop;
        this.parser.parseOpen(node);
        return true;

      default:
        return false;
    }
  }

  parseText(text) {
    if (this.parser) {
      this.parser.parseText(text);
    }
  }

  parseClose(name) {
    if (this.parser) {
      if (!this.parser.parseClose(name)) {
        this.model.stops.push(this.parser.model);
        this.parser = undefined;
      }
      return true;
    }
    return false;
  }
}

// Fill encapsulates translation from fill model to/from xlsx
class FillXform extends BaseXform {
  constructor() {
    super();

    this.map = {
      patternFill: new PatternFillXform(),
      gradientFill: new GradientFillXform(),
    };
  }

  get tag() {
    return 'fill';
  }

  render(xmlStream, model) {
    xmlStream.addRollback();
    xmlStream.openNode('fill');
    switch (model.type) {
      case 'pattern':
        this.map.patternFill.render(xmlStream, model);
        break;
      case 'gradient':
        this.map.gradientFill.render(xmlStream, model);
        break;
      default:
        xmlStream.rollback();
        return;
    }
    xmlStream.closeNode();
    xmlStream.commit();
  }

  parseOpen(node) {
    if (this.parser) {
      this.parser.parseOpen(node);
      return true;
    }
    switch (node.name) {
      case 'fill':
        this.model = {};
        return true;
      default:
        this.parser = this.map[node.name];
        if (this.parser) {
          this.parser.parseOpen(node);
          return true;
        }
        return false;
    }
  }

  parseText(text) {
    if (this.parser) {
      this.parser.parseText(text);
    }
  }

  parseClose(name) {
    if (this.parser) {
      if (!this.parser.parseClose(name)) {
        this.model = this.parser.model;
        this.model.type = this.parser.name;
        this.parser = undefined;
      }
      return true;
    }
    return false;
  }

  validStyle(value) {
    return FillXform.validPatternValues[value];
  }
}

FillXform.validPatternValues = [
  'none',
  'solid',
  'darkVertical',
  'darkGray',
  'mediumGray',
  'lightGray',
  'gray125',
  'gray0625',
  'darkHorizontal',
  'darkVertical',
  'darkDown',
  'darkUp',
  'darkGrid',
  'darkTrellis',
  'lightHorizontal',
  'lightVertical',
  'lightDown',
  'lightUp',
  'lightGrid',
  'lightTrellis',
  'lightGrid',
].reduce((p, v) => {
  p[v] = true;
  return p;
}, {});

FillXform.StopXform = StopXform;
FillXform.PatternFillXform = PatternFillXform;
FillXform.GradientFillXform = GradientFillXform;

module.exports = FillXform;

}, function(modId) { var map = {"../base-xform":1676879951340,"./color-xform":1676879951345}; return __REQUIRE__(map[modId], modId); })
__DEFINE__(1676879951351, function(require, module, exports) {
/* eslint-disable max-classes-per-file */
const BaseXform = require('../base-xform');

const ColorXform = require('./color-xform');

class EdgeXform extends BaseXform {
  constructor(name) {
    super();

    this.name = name;
    this.map = {
      color: new ColorXform(),
    };
  }

  get tag() {
    return this.name;
  }

  render(xmlStream, model, defaultColor) {
    const color = (model && model.color) || defaultColor || this.defaultColor;
    xmlStream.openNode(this.name);
    if (model && model.style) {
      xmlStream.addAttribute('style', model.style);
      if (color) {
        this.map.color.render(xmlStream, color);
      }
    }
    xmlStream.closeNode();
  }

  parseOpen(node) {
    if (this.parser) {
      this.parser.parseOpen(node);
      return true;
    }
    switch (node.name) {
      case this.name: {
        const {style} = node.attributes;
        if (style) {
          this.model = {
            style,
          };
        } else {
          this.model = undefined;
        }
        return true;
      }
      case 'color':
        this.parser = this.map.color;
        this.parser.parseOpen(node);
        return true;
      default:
        return false;
    }
  }

  parseText(text) {
    if (this.parser) {
      this.parser.parseText(text);
    }
  }

  parseClose(name) {
    if (this.parser) {
      if (!this.parser.parseClose(name)) {
        this.parser = undefined;
      }
      return true;
    }

    if (name === this.name) {
      if (this.map.color.model) {
        if (!this.model) {
          this.model = {};
        }
        this.model.color = this.map.color.model;
      }
    }

    return false;
  }

  validStyle(value) {
    return EdgeXform.validStyleValues[value];
  }
}

EdgeXform.validStyleValues = [
  'thin',
  'dotted',
  'dashDot',
  'hair',
  'dashDotDot',
  'slantDashDot',
  'mediumDashed',
  'mediumDashDotDot',
  'mediumDashDot',
  'medium',
  'double',
  'thick',
].reduce((p, v) => {
  p[v] = true;
  return p;
}, {});

// Border encapsulates translation from border model to/from xlsx
class BorderXform extends BaseXform {
  constructor() {
    super();

    this.map = {
      top: new EdgeXform('top'),
      left: new EdgeXform('left'),
      bottom: new EdgeXform('bottom'),
      right: new EdgeXform('right'),
      diagonal: new EdgeXform('diagonal'),
    };
  }

  render(xmlStream, model) {
    const {color} = model;
    xmlStream.openNode('border');
    if (model.diagonal && model.diagonal.style) {
      if (model.diagonal.up) {
        xmlStream.addAttribute('diagonalUp', '1');
      }
      if (model.diagonal.down) {
        xmlStream.addAttribute('diagonalDown', '1');
      }
    }
    function add(edgeModel, edgeXform) {
      if (edgeModel && !edgeModel.color && model.color) {
        // don't mess with incoming models
        edgeModel = {
          ...edgeModel,
          color: model.color,
        };
      }
      edgeXform.render(xmlStream, edgeModel, color);
    }
    add(model.left, this.map.left);
    add(model.right, this.map.right);
    add(model.top, this.map.top);
    add(model.bottom, this.map.bottom);
    add(model.diagonal, this.map.diagonal);

    xmlStream.closeNode();
  }

  parseOpen(node) {
    if (this.parser) {
      this.parser.parseOpen(node);
      return true;
    }
    switch (node.name) {
      case 'border':
        this.reset();
        this.diagonalUp = !!node.attributes.diagonalUp;
        this.diagonalDown = !!node.attributes.diagonalDown;
        return true;
      default:
        this.parser = this.map[node.name];
        if (this.parser) {
          this.parser.parseOpen(node);
          return true;
        }
        return false;
    }
  }

  parseText(text) {
    if (this.parser) {
      this.parser.parseText(text);
    }
  }

  parseClose(name) {
    if (this.parser) {
      if (!this.parser.parseClose(name)) {
        this.parser = undefined;
      }
      return true;
    }
    if (name === 'border') {
      const model = (this.model = {});
      const add = function(key, edgeModel, extensions) {
        if (edgeModel) {
          if (extensions) {
            Object.assign(edgeModel, extensions);
          }
          model[key] = edgeModel;
        }
      };
      add('left', this.map.left.model);
      add('right', this.map.right.model);
      add('top', this.map.top.model);
      add('bottom', this.map.bottom.model);
      add('diagonal', this.map.diagonal.model, {up: this.diagonalUp, down: this.diagonalDown});
    }
    return false;
  }
}

module.exports = BorderXform;

}, function(modId) { var map = {"../base-xform":1676879951340,"./color-xform":1676879951345}; return __REQUIRE__(map[modId], modId); })
__DEFINE__(1676879951352, function(require, module, exports) {
const _ = require('../../../utils/under-dash');
const defaultNumFormats = require('../../defaultnumformats');

const BaseXform = require('../base-xform');

function hashDefaultFormats() {
  const hash = {};
  _.each(defaultNumFormats, (dnf, id) => {
    if (dnf.f) {
      hash[dnf.f] = parseInt(id, 10);
    }
    // at some point, add the other cultures here...
  });
  return hash;
}
const defaultFmtHash = hashDefaultFormats();

// NumFmt encapsulates translation between number format and xlsx
class NumFmtXform extends BaseXform {
  constructor(id, formatCode) {
    super();

    this.id = id;
    this.formatCode = formatCode;
  }

  get tag() {
    return 'numFmt';
  }

  render(xmlStream, model) {
    xmlStream.leafNode('numFmt', {numFmtId: model.id, formatCode: model.formatCode});
  }

  parseOpen(node) {
    switch (node.name) {
      case 'numFmt':
        this.model = {
          id: parseInt(node.attributes.numFmtId, 10),
          formatCode: node.attributes.formatCode.replace(/[\\](.)/g, '$1'),
        };
        return true;
      default:
        return false;
    }
  }

  parseText() {}

  parseClose() {
    return false;
  }
}

NumFmtXform.getDefaultFmtId = function getDefaultFmtId(formatCode) {
  return defaultFmtHash[formatCode];
};

NumFmtXform.getDefaultFmtCode = function getDefaultFmtCode(numFmtId) {
  return defaultNumFormats[numFmtId] && defaultNumFormats[numFmtId].f;
};

module.exports = NumFmtXform;

}, function(modId) { var map = {"../../../utils/under-dash":1676879951315,"../../defaultnumformats":1676879951353,"../base-xform":1676879951340}; return __REQUIRE__(map[modId], modId); })
__DEFINE__(1676879951353, function(require, module, exports) {
module.exports = {
  0: {f: 'General'},
  1: {f: '0'},
  2: {f: '0.00'},
  3: {f: '#,##0'},
  4: {f: '#,##0.00'},
  9: {f: '0%'},
  10: {f: '0.00%'},
  11: {f: '0.00E+00'},
  12: {f: '# ?/?'},
  13: {f: '# ??/??'},
  14: {f: 'mm-dd-yy'},
  15: {f: 'd-mmm-yy'},
  16: {f: 'd-mmm'},
  17: {f: 'mmm-yy'},
  18: {f: 'h:mm AM/PM'},
  19: {f: 'h:mm:ss AM/PM'},
  20: {f: 'h:mm'},
  21: {f: 'h:mm:ss'},
  22: {f: 'm/d/yy "h":mm'},

  27: {
    'zh-tw': '[$-404]e/m/d',
    'zh-cn': 'yyyy"年"m"月"',
    'ja-jp': '[$-411]ge.m.d',
    'ko-kr': 'yyyy"年" mm"月" dd"日"',
  },
  28: {
    'zh-tw': '[$-404]e"年"m"月"d"日"',
    'zh-cn': 'm"月"d"日"',
    'ja-jp': '[$-411]ggge"年"m"月"d"日"',
    'ko-kr': 'mm-dd',
  },
  29: {
    'zh-tw': '[$-404]e"年"m"月"d"日"',
    'zh-cn': 'm"月"d"日"',
    'ja-jp': '[$-411]ggge"年"m"月"d"日"',
    'ko-kr': 'mm-dd',
  },
  30: {'zh-tw': 'm/d/yy ', 'zh-cn': 'm-d-yy', 'ja-jp': 'm/d/yy', 'ko-kr': 'mm-dd-yy'},
  31: {
    'zh-tw': 'yyyy"年"m"月"d"日"',
    'zh-cn': 'yyyy"年"m"月"d"日"',
    'ja-jp': 'yyyy"年"m"月"d"日"',
    'ko-kr': 'yyyy"년" mm"월" dd"일"',
  },
  32: {
    'zh-tw': 'hh"時"mm"分"',
    'zh-cn': 'h"时"mm"分"',
    'ja-jp': 'h"時"mm"分"',
    'ko-kr': 'h"시" mm"분"',
  },
  33: {
    'zh-tw': 'hh"時"mm"分"ss"秒"',
    'zh-cn': 'h"时"mm"分"ss"秒"',
    'ja-jp': 'h"時"mm"分"ss"秒"',
    'ko-kr': 'h"시" mm"분" ss"초"',
  },
  34: {
    'zh-tw': '上午/下午 hh"時"mm"分"',
    'zh-cn': '上午/下午 h"时"mm"分"',
    'ja-jp': 'yyyy"年"m"月"',
    'ko-kr': 'yyyy-mm-dd',
  },
  35: {
    'zh-tw': '上午/下午 hh"時"mm"分"ss"秒"',
    'zh-cn': '上午/下午 h"时"mm"分"ss"秒"',
    'ja-jp': 'm"月"d"日"',
    'ko-kr': 'yyyy-mm-dd',
  },
  36: {
    'zh-tw': '[$-404]e/m/d',
    'zh-cn': 'yyyy"年"m"月"',
    'ja-jp': '[$-411]ge.m.d',
    'ko-kr': 'yyyy"年" mm"月" dd"日"',
  },

  37: {f: '#,##0 ;(#,##0)'},
  38: {f: '#,##0 ;[Red](#,##0)'},
  39: {f: '#,##0.00 ;(#,##0.00)'},
  40: {f: '#,##0.00 ;[Red](#,##0.00)'},
  45: {f: 'mm:ss'},
  46: {f: '[h]:mm:ss'},
  47: {f: 'mmss.0'},
  48: {f: '##0.0E+0'},
  49: {f: '@'},

  50: {
    'zh-tw': '[$-404]e/m/d',
    'zh-cn': 'yyyy"年"m"月"',
    'ja-jp': '[$-411]ge.m.d',
    'ko-kr': 'yyyy"年" mm"月" dd"日"',
  },
  51: {
    'zh-tw': '[$-404]e"年"m"月"d"日"',
    'zh-cn': 'm"月"d"日"',
    'ja-jp': '[$-411]ggge"年"m"月"d"日"',
    'ko-kr': 'mm-dd',
  },
  52: {
    'zh-tw': '上午/下午 hh"時"mm"分"',
    'zh-cn': 'yyyy"年"m"月"',
    'ja-jp': 'yyyy"年"m"月"',
    'ko-kr': 'yyyy-mm-dd',
  },
  53: {
    'zh-tw': '上午/下午 hh"時"mm"分"ss"秒"',
    'zh-cn': 'm"月"d"日"',
    'ja-jp': 'm"月"d"日"',
    'ko-kr': 'yyyy-mm-dd',
  },
  54: {
    'zh-tw': '[$-404]e"年"m"月"d"日"',
    'zh-cn': 'm"月"d"日"',
    'ja-jp': '[$-411]ggge"年"m"月"d"日"',
    'ko-kr': 'mm-dd',
  },
  55: {
    'zh-tw': '上午/下午 hh"時"mm"分"',
    'zh-cn': '上午/下午 h"时"mm"分"',
    'ja-jp': 'yyyy"年"m"月"',
    'ko-kr': 'yyyy-mm-dd',
  },
  56: {
    'zh-tw': '上午/下午 hh"時"mm"分"ss"秒"',
    'zh-cn': '上午/下午 h"时"mm"分"ss"秒"',
    'ja-jp': 'm"月"d"日"',
    'ko-kr': 'yyyy-mm-dd',
  },
  57: {
    'zh-tw': '[$-404]e/m/d',
    'zh-cn': 'yyyy"年"m"月"',
    'ja-jp': '[$-411]ge.m.d',
    'ko-kr': 'yyyy"年" mm"月" dd"日"',
  },
  58: {
    'zh-tw': '[$-404]e"年"m"月"d"日"',
    'zh-cn': 'm"月"d"日"',
    'ja-jp': '[$-411]ggge"年"m"月"d"日"',
    'ko-kr': 'mm-dd',
  },

  59: {'th-th': 't0'},
  60: {'th-th': 't0.00'},
  61: {'th-th': 't#,##0'},
  62: {'th-th': 't#,##0.00'},
  67: {'th-th': 't0%'},
  68: {'th-th': 't0.00%'},
  69: {'th-th': 't# ?/?'},
  70: {'th-th': 't# ??/??'},

  81: {'th-th': 'd/m/bb'},
};

}, function(modId) { var map = {}; return __REQUIRE__(map[modId], modId); })
__DEFINE__(1676879951354, function(require, module, exports) {
const BaseXform = require('../base-xform');

const AlignmentXform = require('./alignment-xform');
const ProtectionXform = require('./protection-xform');

// <xf numFmtId="[numFmtId]" fontId="[fontId]" fillId="[fillId]" borderId="[xf.borderId]" xfId="[xfId]">
//   Optional <alignment>
//   Optional <protection>
// </xf>

// Style assists translation from style model to/from xlsx
class StyleXform extends BaseXform {
  constructor(options) {
    super();

    this.xfId = !!(options && options.xfId);
    this.map = {
      alignment: new AlignmentXform(),
      protection: new ProtectionXform(),
    };
  }

  get tag() {
    return 'xf';
  }

  render(xmlStream, model) {
    xmlStream.openNode('xf', {
      numFmtId: model.numFmtId || 0,
      fontId: model.fontId || 0,
      fillId: model.fillId || 0,
      borderId: model.borderId || 0,
    });
    if (this.xfId) {
      xmlStream.addAttribute('xfId', model.xfId || 0);
    }

    if (model.numFmtId) {
      xmlStream.addAttribute('applyNumberFormat', '1');
    }
    if (model.fontId) {
      xmlStream.addAttribute('applyFont', '1');
    }
    if (model.fillId) {
      xmlStream.addAttribute('applyFill', '1');
    }
    if (model.borderId) {
      xmlStream.addAttribute('applyBorder', '1');
    }
    if (model.alignment) {
      xmlStream.addAttribute('applyAlignment', '1');
    }
    if (model.protection) {
      xmlStream.addAttribute('applyProtection', '1');
    }

    /**
     * Rendering tags causes close of XML stream.
     * Therefore adding attributes must be done before rendering tags.
     */

    if (model.alignment) {
      this.map.alignment.render(xmlStream, model.alignment);
    }
    if (model.protection) {
      this.map.protection.render(xmlStream, model.protection);
    }

    xmlStream.closeNode();
  }

  parseOpen(node) {
    if (this.parser) {
      this.parser.parseOpen(node);
      return true;
    }
    // used during sax parsing of xml to build font object
    switch (node.name) {
      case 'xf':
        this.model = {
          numFmtId: parseInt(node.attributes.numFmtId, 10),
          fontId: parseInt(node.attributes.fontId, 10),
          fillId: parseInt(node.attributes.fillId, 10),
          borderId: parseInt(node.attributes.borderId, 10),
        };
        if (this.xfId) {
          this.model.xfId = parseInt(node.attributes.xfId, 10);
        }
        return true;
      case 'alignment':
        this.parser = this.map.alignment;
        this.parser.parseOpen(node);
        return true;
      case 'protection':
        this.parser = this.map.protection;
        this.parser.parseOpen(node);
        return true;
      default:
        return false;
    }
  }

  parseText(text) {
    if (this.parser) {
      this.parser.parseText(text);
    }
  }

  parseClose(name) {
    if (this.parser) {
      if (!this.parser.parseClose(name)) {
        if (this.map.protection === this.parser) {
          this.model.protection = this.parser.model;
        } else {
          this.model.alignment = this.parser.model;
        }
        this.parser = undefined;
      }
      return true;
    }
    return name !== 'xf';
  }
}

module.exports = StyleXform;

}, function(modId) { var map = {"../base-xform":1676879951340,"./alignment-xform":1676879951355,"./protection-xform":1676879951356}; return __REQUIRE__(map[modId], modId); })
__DEFINE__(1676879951355, function(require, module, exports) {
const Enums = require('../../../doc/enums');

const utils = require('../../../utils/utils');
const BaseXform = require('../base-xform');

const validation = {
  horizontalValues: [
    'left',
    'center',
    'right',
    'fill',
    'centerContinuous',
    'distributed',
    'justify',
  ].reduce((p, v) => {
    p[v] = true;
    return p;
  }, {}),
  horizontal(value) {
    return this.horizontalValues[value] ? value : undefined;
  },

  verticalValues: ['top', 'middle', 'bottom', 'distributed', 'justify'].reduce((p, v) => {
    p[v] = true;
    return p;
  }, {}),
  vertical(value) {
    if (value === 'middle') return 'center';
    return this.verticalValues[value] ? value : undefined;
  },
  wrapText(value) {
    return value ? true : undefined;
  },
  shrinkToFit(value) {
    return value ? true : undefined;
  },
  textRotation(value) {
    switch (value) {
      case 'vertical':
        return value;
      default:
        value = utils.validInt(value);
        return value >= -90 && value <= 90 ? value : undefined;
    }
  },
  indent(value) {
    value = utils.validInt(value);
    return Math.max(0, value);
  },
  readingOrder(value) {
    switch (value) {
      case 'ltr':
        return Enums.ReadingOrder.LeftToRight;
      case 'rtl':
        return Enums.ReadingOrder.RightToLeft;
      default:
        return undefined;
    }
  },
};

const textRotationXform = {
  toXml(textRotation) {
    textRotation = validation.textRotation(textRotation);
    if (textRotation) {
      if (textRotation === 'vertical') {
        return 255;
      }

      const tr = Math.round(textRotation);
      if (tr >= 0 && tr <= 90) {
        return tr;
      }

      if (tr < 0 && tr >= -90) {
        return 90 - tr;
      }
    }
    return undefined;
  },
  toModel(textRotation) {
    const tr = utils.validInt(textRotation);
    if (tr !== undefined) {
      if (tr === 255) {
        return 'vertical';
      }
      if (tr >= 0 && tr <= 90) {
        return tr;
      }
      if (tr > 90 && tr <= 180) {
        return 90 - tr;
      }
    }
    return undefined;
  },
};

// Alignment encapsulates translation from style.alignment model to/from xlsx
class AlignmentXform extends BaseXform {
  get tag() {
    return 'alignment';
  }

  render(xmlStream, model) {
    xmlStream.addRollback();
    xmlStream.openNode('alignment');

    let isValid = false;
    function add(name, value) {
      if (value) {
        xmlStream.addAttribute(name, value);
        isValid = true;
      }
    }
    add('horizontal', validation.horizontal(model.horizontal));
    add('vertical', validation.vertical(model.vertical));
    add('wrapText', validation.wrapText(model.wrapText) ? '1' : false);
    add('shrinkToFit', validation.shrinkToFit(model.shrinkToFit) ? '1' : false);
    add('indent', validation.indent(model.indent));
    add('textRotation', textRotationXform.toXml(model.textRotation));
    add('readingOrder', validation.readingOrder(model.readingOrder));

    xmlStream.closeNode();

    if (isValid) {
      xmlStream.commit();
    } else {
      xmlStream.rollback();
    }
  }

  parseOpen(node) {
    const model = {};

    let valid = false;
    function add(truthy, name, value) {
      if (truthy) {
        model[name] = value;
        valid = true;
      }
    }
    add(node.attributes.horizontal, 'horizontal', node.attributes.horizontal);
    add(
      node.attributes.vertical,
      'vertical',
      node.attributes.vertical === 'center' ? 'middle' : node.attributes.vertical
    );
    add(node.attributes.wrapText, 'wrapText', !!node.attributes.wrapText);
    add(node.attributes.shrinkToFit, 'shrinkToFit', !!node.attributes.shrinkToFit);
    add(node.attributes.indent, 'indent', parseInt(node.attributes.indent, 10));
    add(
      node.attributes.textRotation,
      'textRotation',
      textRotationXform.toModel(node.attributes.textRotation)
    );
    add(
      node.attributes.readingOrder,
      'readingOrder',
      node.attributes.readingOrder === '2' ? 'rtl' : 'ltr'
    );

    this.model = valid ? model : null;
  }

  parseText() {}

  parseClose() {
    return false;
  }
}

module.exports = AlignmentXform;

}, function(modId) { var map = {"../../../doc/enums":1676879951319,"../../../utils/utils":1676879951334,"../base-xform":1676879951340}; return __REQUIRE__(map[modId], modId); })
__DEFINE__(1676879951356, function(require, module, exports) {
const BaseXform = require('../base-xform');

const validation = {
  boolean(value, dflt) {
    if (value === undefined) {
      return dflt;
    }
    return value;
  },
};

// Protection encapsulates translation from style.protection model to/from xlsx
class ProtectionXform extends BaseXform {
  get tag() {
    return 'protection';
  }

  render(xmlStream, model) {
    xmlStream.addRollback();
    xmlStream.openNode('protection');

    let isValid = false;
    function add(name, value) {
      if (value !== undefined) {
        xmlStream.addAttribute(name, value);
        isValid = true;
      }
    }
    add('locked', validation.boolean(model.locked, true) ? undefined : '0');
    add('hidden', validation.boolean(model.hidden, false) ? '1' : undefined);

    xmlStream.closeNode();

    if (isValid) {
      xmlStream.commit();
    } else {
      xmlStream.rollback();
    }
  }

  parseOpen(node) {
    const model = {
      locked: !(node.attributes.locked === '0'),
      hidden: node.attributes.hidden === '1',
    };

    // only want to record models that differ from defaults
    const isSignificant = !model.locked || model.hidden;

    this.model = isSignificant ? model : null;
  }

  parseText() {}

  parseClose() {
    return false;
  }
}

module.exports = ProtectionXform;

}, function(modId) { var map = {"../base-xform":1676879951340}; return __REQUIRE__(map[modId], modId); })
__DEFINE__(1676879951357, function(require, module, exports) {
const BaseXform = require('../base-xform');

const AlignmentXform = require('./alignment-xform');
const BorderXform = require('./border-xform');
const FillXform = require('./fill-xform');
const FontXform = require('./font-xform');
const NumFmtXform = require('./numfmt-xform');
const ProtectionXform = require('./protection-xform');

// <xf numFmtId="[numFmtId]" fontId="[fontId]" fillId="[fillId]" borderId="[xf.borderId]" xfId="[xfId]">
//   Optional <alignment>
//   Optional <protection>
// </xf>

// Style assists translation from style model to/from xlsx
class DxfXform extends BaseXform {
  constructor() {
    super();

    this.map = {
      alignment: new AlignmentXform(),
      border: new BorderXform(),
      fill: new FillXform(),
      font: new FontXform(),
      numFmt: new NumFmtXform(),
      protection: new ProtectionXform(),
    };
  }

  get tag() {
    return 'dxf';
  }

  // how do we generate dxfid?

  render(xmlStream, model) {
    xmlStream.openNode(this.tag);

    if (model.font) {
      this.map.font.render(xmlStream, model.font);
    }
    if (model.numFmt) {
      this.map.numFmt.render(xmlStream, model.numFmt);
    }
    if (model.fill) {
      this.map.fill.render(xmlStream, model.fill);
    }
    if (model.alignment) {
      this.map.alignment.render(xmlStream, model.alignment);
    }
    if (model.border) {
      this.map.border.render(xmlStream, model.border);
    }
    if (model.protection) {
      this.map.protection.render(xmlStream, model.protection);
    }

    xmlStream.closeNode();
  }

  parseOpen(node) {
    if (this.parser) {
      this.parser.parseOpen(node);
      return true;
    }

    switch (node.name) {
      case this.tag:
        // this node is often repeated. Need to reset children
        this.reset();
        return true;
      default:
        this.parser = this.map[node.name];
        if (this.parser) {
          this.parser.parseOpen(node);
        }
        return true;
    }
  }

  parseText(text) {
    if (this.parser) {
      this.parser.parseText(text);
    }
  }

  parseClose(name) {
    if (this.parser) {
      if (!this.parser.parseClose(name)) {
        this.parser = undefined;
      }
      return true;
    }
    if (name === this.tag) {
      this.model = {
        alignment: this.map.alignment.model,
        border: this.map.border.model,
        fill: this.map.fill.model,
        font: this.map.font.model,
        numFmt: this.map.numFmt.model,
        protection: this.map.protection.model,
      };
      return false;
    }

    return true;
  }
}

module.exports = DxfXform;

}, function(modId) { var map = {"../base-xform":1676879951340,"./alignment-xform":1676879951355,"./border-xform":1676879951351,"./fill-xform":1676879951350,"./font-xform":1676879951344,"./numfmt-xform":1676879951352,"./protection-xform":1676879951356}; return __REQUIRE__(map[modId], modId); })
__DEFINE__(1676879951358, function(require, module, exports) {
const XmlStream = require('../../../utils/xml-stream');
const BaseXform = require('../base-xform');
const DateXform = require('../simple/date-xform');
const StringXform = require('../simple/string-xform');
const IntegerXform = require('../simple/integer-xform');

class CoreXform extends BaseXform {
  constructor() {
    super();

    this.map = {
      'dc:creator': new StringXform({tag: 'dc:creator'}),
      'dc:title': new StringXform({tag: 'dc:title'}),
      'dc:subject': new StringXform({tag: 'dc:subject'}),
      'dc:description': new StringXform({tag: 'dc:description'}),
      'dc:identifier': new StringXform({tag: 'dc:identifier'}),
      'dc:language': new StringXform({tag: 'dc:language'}),
      'cp:keywords': new StringXform({tag: 'cp:keywords'}),
      'cp:category': new StringXform({tag: 'cp:category'}),
      'cp:lastModifiedBy': new StringXform({tag: 'cp:lastModifiedBy'}),
      'cp:lastPrinted': new DateXform({tag: 'cp:lastPrinted', format: CoreXform.DateFormat}),
      'cp:revision': new IntegerXform({tag: 'cp:revision'}),
      'cp:version': new StringXform({tag: 'cp:version'}),
      'cp:contentStatus': new StringXform({tag: 'cp:contentStatus'}),
      'cp:contentType': new StringXform({tag: 'cp:contentType'}),
      'dcterms:created': new DateXform({
        tag: 'dcterms:created',
        attrs: CoreXform.DateAttrs,
        format: CoreXform.DateFormat,
      }),
      'dcterms:modified': new DateXform({
        tag: 'dcterms:modified',
        attrs: CoreXform.DateAttrs,
        format: CoreXform.DateFormat,
      }),
    };
  }

  render(xmlStream, model) {
    xmlStream.openXml(XmlStream.StdDocAttributes);

    xmlStream.openNode('cp:coreProperties', CoreXform.CORE_PROPERTY_ATTRIBUTES);

    this.map['dc:creator'].render(xmlStream, model.creator);
    this.map['dc:title'].render(xmlStream, model.title);
    this.map['dc:subject'].render(xmlStream, model.subject);
    this.map['dc:description'].render(xmlStream, model.description);
    this.map['dc:identifier'].render(xmlStream, model.identifier);
    this.map['dc:language'].render(xmlStream, model.language);
    this.map['cp:keywords'].render(xmlStream, model.keywords);
    this.map['cp:category'].render(xmlStream, model.category);
    this.map['cp:lastModifiedBy'].render(xmlStream, model.lastModifiedBy);
    this.map['cp:lastPrinted'].render(xmlStream, model.lastPrinted);
    this.map['cp:revision'].render(xmlStream, model.revision);
    this.map['cp:version'].render(xmlStream, model.version);
    this.map['cp:contentStatus'].render(xmlStream, model.contentStatus);
    this.map['cp:contentType'].render(xmlStream, model.contentType);
    this.map['dcterms:created'].render(xmlStream, model.created);
    this.map['dcterms:modified'].render(xmlStream, model.modified);

    xmlStream.closeNode();
  }

  parseOpen(node) {
    if (this.parser) {
      this.parser.parseOpen(node);
      return true;
    }
    switch (node.name) {
      case 'cp:coreProperties':
      case 'coreProperties':
        return true;
      default:
        this.parser = this.map[node.name];
        if (this.parser) {
          this.parser.parseOpen(node);
          return true;
        }
        throw new Error(`Unexpected xml node in parseOpen: ${JSON.stringify(node)}`);
    }
  }

  parseText(text) {
    if (this.parser) {
      this.parser.parseText(text);
    }
  }

  parseClose(name) {
    if (this.parser) {
      if (!this.parser.parseClose(name)) {
        this.parser = undefined;
      }
      return true;
    }
    switch (name) {
      case 'cp:coreProperties':
      case 'coreProperties':
        this.model = {
          creator: this.map['dc:creator'].model,
          title: this.map['dc:title'].model,
          subject: this.map['dc:subject'].model,
          description: this.map['dc:description'].model,
          identifier: this.map['dc:identifier'].model,
          language: this.map['dc:language'].model,
          keywords: this.map['cp:keywords'].model,
          category: this.map['cp:category'].model,
          lastModifiedBy: this.map['cp:lastModifiedBy'].model,
          lastPrinted: this.map['cp:lastPrinted'].model,
          revision: this.map['cp:revision'].model,
          contentStatus: this.map['cp:contentStatus'].model,
          contentType: this.map['cp:contentType'].model,
          created: this.map['dcterms:created'].model,
          modified: this.map['dcterms:modified'].model,
        };
        return false;
      default:
        throw new Error(`Unexpected xml node in parseClose: ${name}`);
    }
  }
}

CoreXform.DateFormat = function(dt) {
  return dt.toISOString().replace(/[.]\d{3}/, '');
};
CoreXform.DateAttrs = {'xsi:type': 'dcterms:W3CDTF'};

CoreXform.CORE_PROPERTY_ATTRIBUTES = {
  'xmlns:cp': 'http://schemas.openxmlformats.org/package/2006/metadata/core-properties',
  'xmlns:dc': 'http://purl.org/dc/elements/1.1/',
  'xmlns:dcterms': 'http://purl.org/dc/terms/',
  'xmlns:dcmitype': 'http://purl.org/dc/dcmitype/',
  'xmlns:xsi': 'http://www.w3.org/2001/XMLSchema-instance',
};

module.exports = CoreXform;

}, function(modId) { var map = {"../../../utils/xml-stream":1676879951337,"../base-xform":1676879951340,"../simple/date-xform":1676879951359,"../simple/string-xform":1676879951348,"../simple/integer-xform":1676879951347}; return __REQUIRE__(map[modId], modId); })
__DEFINE__(1676879951359, function(require, module, exports) {
const BaseXform = require('../base-xform');

class DateXform extends BaseXform {
  constructor(options) {
    super();

    this.tag = options.tag;
    this.attr = options.attr;
    this.attrs = options.attrs;
    this._format =
      options.format ||
      function(dt) {
        try {
          if (Number.isNaN(dt.getTime())) return '';
          return dt.toISOString();
        } catch (e) {
          return '';
        }
      };
    this._parse =
      options.parse ||
      function(str) {
        return new Date(str);
      };
  }

  render(xmlStream, model) {
    if (model) {
      xmlStream.openNode(this.tag);
      if (this.attrs) {
        xmlStream.addAttributes(this.attrs);
      }
      if (this.attr) {
        xmlStream.addAttribute(this.attr, this._format(model));
      } else {
        xmlStream.writeText(this._format(model));
      }
      xmlStream.closeNode();
    }
  }

  parseOpen(node) {
    if (node.name === this.tag) {
      if (this.attr) {
        this.model = this._parse(node.attributes[this.attr]);
      } else {
        this.text = [];
      }
    }
  }

  parseText(text) {
    if (!this.attr) {
      this.text.push(text);
    }
  }

  parseClose() {
    if (!this.attr) {
      this.model = this._parse(this.text.join(''));
    }
    return false;
  }
}

module.exports = DateXform;

}, function(modId) { var map = {"../base-xform":1676879951340}; return __REQUIRE__(map[modId], modId); })
__DEFINE__(1676879951360, function(require, module, exports) {
const XmlStream = require('../../../utils/xml-stream');
const BaseXform = require('../base-xform');
const SharedStringXform = require('./shared-string-xform');

class SharedStringsXform extends BaseXform {
  constructor(model) {
    super();

    this.model = model || {
      values: [],
      count: 0,
    };
    this.hash = Object.create(null);
    this.rich = Object.create(null);
  }

  get sharedStringXform() {
    return this._sharedStringXform || (this._sharedStringXform = new SharedStringXform());
  }

  get values() {
    return this.model.values;
  }

  get uniqueCount() {
    return this.model.values.length;
  }

  get count() {
    return this.model.count;
  }

  getString(index) {
    return this.model.values[index];
  }

  add(value) {
    return value.richText ? this.addRichText(value) : this.addText(value);
  }

  addText(value) {
    let index = this.hash[value];
    if (index === undefined) {
      index = this.hash[value] = this.model.values.length;
      this.model.values.push(value);
    }
    this.model.count++;
    return index;
  }

  addRichText(value) {
    // TODO: add WeakMap here
    const xml = this.sharedStringXform.toXml(value);
    let index = this.rich[xml];
    if (index === undefined) {
      index = this.rich[xml] = this.model.values.length;
      this.model.values.push(value);
    }
    this.model.count++;
    return index;
  }

  // <?xml version="1.0" encoding="UTF-8" standalone="yes"?>
  // <sst xmlns="http://schemas.openxmlformats.org/spreadsheetml/2006/main" count="<%=totalRefs%>" uniqueCount="<%=count%>">
  //   <si><t><%=text%></t></si>
  //   <si><r><rPr></rPr><t></t></r></si>
  // </sst>

  render(xmlStream, model) {
    model = model || this._values;
    xmlStream.openXml(XmlStream.StdDocAttributes);

    xmlStream.openNode('sst', {
      xmlns: 'http://schemas.openxmlformats.org/spreadsheetml/2006/main',
      count: model.count,
      uniqueCount: model.values.length,
    });

    const sx = this.sharedStringXform;
    model.values.forEach(sharedString => {
      sx.render(xmlStream, sharedString);
    });
    xmlStream.closeNode();
  }

  parseOpen(node) {
    if (this.parser) {
      this.parser.parseOpen(node);
      return true;
    }
    switch (node.name) {
      case 'sst':
        return true;
      case 'si':
        this.parser = this.sharedStringXform;
        this.parser.parseOpen(node);
        return true;
      default:
        throw new Error(`Unexpected xml node in parseOpen: ${JSON.stringify(node)}`);
    }
  }

  parseText(text) {
    if (this.parser) {
      this.parser.parseText(text);
    }
  }

  parseClose(name) {
    if (this.parser) {
      if (!this.parser.parseClose(name)) {
        this.model.values.push(this.parser.model);
        this.model.count++;
        this.parser = undefined;
      }
      return true;
    }
    switch (name) {
      case 'sst':
        return false;
      default:
        throw new Error(`Unexpected xml node in parseClose: ${name}`);
    }
  }
}

module.exports = SharedStringsXform;

}, function(modId) { var map = {"../../../utils/xml-stream":1676879951337,"../base-xform":1676879951340,"./shared-string-xform":1676879951361}; return __REQUIRE__(map[modId], modId); })
__DEFINE__(1676879951361, function(require, module, exports) {
const TextXform = require('./text-xform');
const RichTextXform = require('./rich-text-xform');
const PhoneticTextXform = require('./phonetic-text-xform');

const BaseXform = require('../base-xform');

// <si>
//   <r></r><r></r>...
// </si>
// <si>
//   <t></t>
// </si>

class SharedStringXform extends BaseXform {
  constructor(model) {
    super();

    this.model = model;

    this.map = {
      r: new RichTextXform(),
      t: new TextXform(),
      rPh: new PhoneticTextXform(),
    };
  }

  get tag() {
    return 'si';
  }

  render(xmlStream, model) {
    xmlStream.openNode(this.tag);
    if (model && model.hasOwnProperty('richText') && model.richText) {
      if (model.richText.length) {
        model.richText.forEach(text => {
          this.map.r.render(xmlStream, text);
        });
      } else {
        this.map.t.render(xmlStream, '');
      }
    } else if (model !== undefined && model !== null) {
      this.map.t.render(xmlStream, model);
    }
    xmlStream.closeNode();
  }

  parseOpen(node) {
    const {name} = node;
    if (this.parser) {
      this.parser.parseOpen(node);
      return true;
    }
    if (name === this.tag) {
      this.model = {};
      return true;
    }
    this.parser = this.map[name];
    if (this.parser) {
      this.parser.parseOpen(node);
      return true;
    }
    return false;
  }

  parseText(text) {
    if (this.parser) {
      this.parser.parseText(text);
    }
  }

  parseClose(name) {
    if (this.parser) {
      if (!this.parser.parseClose(name)) {
        switch (name) {
          case 'r': {
            let rt = this.model.richText;
            if (!rt) {
              rt = this.model.richText = [];
            }
            rt.push(this.parser.model);
            break;
          }
          case 't':
            this.model = this.parser.model;
            break;
          default:
            break;
        }
        this.parser = undefined;
      }
      return true;
    }
    switch (name) {
      case this.tag:
        return false;
      default:
        return true;
    }
  }
}

module.exports = SharedStringXform;

}, function(modId) { var map = {"./text-xform":1676879951362,"./rich-text-xform":1676879951363,"./phonetic-text-xform":1676879951364,"../base-xform":1676879951340}; return __REQUIRE__(map[modId], modId); })
__DEFINE__(1676879951362, function(require, module, exports) {
const BaseXform = require('../base-xform');

//   <t xml:space="preserve"> is </t>

class TextXform extends BaseXform {
  get tag() {
    return 't';
  }

  render(xmlStream, model) {
    xmlStream.openNode('t');
    if (/^\s|\n|\s$/.test(model)) {
      xmlStream.addAttribute('xml:space', 'preserve');
    }
    xmlStream.writeText(model);
    xmlStream.closeNode();
  }

  get model() {
    return this._text
      .join('')
      .replace(/_x([0-9A-F]{4})_/g, ($0, $1) => String.fromCharCode(parseInt($1, 16)));
  }

  parseOpen(node) {
    switch (node.name) {
      case 't':
        this._text = [];
        return true;
      default:
        return false;
    }
  }

  parseText(text) {
    this._text.push(text);
  }

  parseClose() {
    return false;
  }
}

module.exports = TextXform;

}, function(modId) { var map = {"../base-xform":1676879951340}; return __REQUIRE__(map[modId], modId); })
__DEFINE__(1676879951363, function(require, module, exports) {
const TextXform = require('./text-xform');
const FontXform = require('../style/font-xform');

const BaseXform = require('../base-xform');

// <r>
//   <rPr>
//     <sz val="11"/>
//     <color theme="1" tint="5"/>
//     <rFont val="Calibri"/>
//     <family val="2"/>
//     <scheme val="minor"/>
//   </rPr>
//   <t xml:space="preserve"> is </t>
// </r>

class RichTextXform extends BaseXform {
  constructor(model) {
    super();

    this.model = model;
  }

  get tag() {
    return 'r';
  }

  get textXform() {
    return this._textXform || (this._textXform = new TextXform());
  }

  get fontXform() {
    return this._fontXform || (this._fontXform = new FontXform(RichTextXform.FONT_OPTIONS));
  }

  render(xmlStream, model) {
    model = model || this.model;

    xmlStream.openNode('r');
    if (model.font) {
      this.fontXform.render(xmlStream, model.font);
    }
    this.textXform.render(xmlStream, model.text);
    xmlStream.closeNode();
  }

  parseOpen(node) {
    if (this.parser) {
      this.parser.parseOpen(node);
      return true;
    }
    switch (node.name) {
      case 'r':
        this.model = {};
        return true;
      case 't':
        this.parser = this.textXform;
        this.parser.parseOpen(node);
        return true;
      case 'rPr':
        this.parser = this.fontXform;
        this.parser.parseOpen(node);
        return true;
      default:
        return false;
    }
  }

  parseText(text) {
    if (this.parser) {
      this.parser.parseText(text);
    }
  }

  parseClose(name) {
    switch (name) {
      case 'r':
        return false;
      case 't':
        this.model.text = this.parser.model;
        this.parser = undefined;
        return true;
      case 'rPr':
        this.model.font = this.parser.model;
        this.parser = undefined;
        return true;
      default:
        if (this.parser) {
          this.parser.parseClose(name);
        }
        return true;
    }
  }
}

RichTextXform.FONT_OPTIONS = {
  tagName: 'rPr',
  fontNameTag: 'rFont',
};

module.exports = RichTextXform;

}, function(modId) { var map = {"./text-xform":1676879951362,"../style/font-xform":1676879951344,"../base-xform":1676879951340}; return __REQUIRE__(map[modId], modId); })
__DEFINE__(1676879951364, function(require, module, exports) {
const TextXform = require('./text-xform');
const RichTextXform = require('./rich-text-xform');

const BaseXform = require('../base-xform');

// <rPh sb="0" eb="1">
//   <t>(its pronounciation in KATAKANA)</t>
// </rPh>

class PhoneticTextXform extends BaseXform {
  constructor() {
    super();

    this.map = {
      r: new RichTextXform(),
      t: new TextXform(),
    };
  }

  get tag() {
    return 'rPh';
  }

  render(xmlStream, model) {
    xmlStream.openNode(this.tag, {
      sb: model.sb || 0,
      eb: model.eb || 0,
    });
    if (model && model.hasOwnProperty('richText') && model.richText) {
      const {r} = this.map;
      model.richText.forEach(text => {
        r.render(xmlStream, text);
      });
    } else if (model) {
      this.map.t.render(xmlStream, model.text);
    }
    xmlStream.closeNode();
  }

  parseOpen(node) {
    const {name} = node;
    if (this.parser) {
      this.parser.parseOpen(node);
      return true;
    }
    if (name === this.tag) {
      this.model = {
        sb: parseInt(node.attributes.sb, 10),
        eb: parseInt(node.attributes.eb, 10),
      };
      return true;
    }
    this.parser = this.map[name];
    if (this.parser) {
      this.parser.parseOpen(node);
      return true;
    }
    return false;
  }

  parseText(text) {
    if (this.parser) {
      this.parser.parseText(text);
    }
  }

  parseClose(name) {
    if (this.parser) {
      if (!this.parser.parseClose(name)) {
        switch (name) {
          case 'r': {
            let rt = this.model.richText;
            if (!rt) {
              rt = this.model.richText = [];
            }
            rt.push(this.parser.model);
            break;
          }
          case 't':
            this.model.text = this.parser.model;
            break;
          default:
            break;
        }
        this.parser = undefined;
      }
      return true;
    }
    switch (name) {
      case this.tag:
        return false;
      default:
        return true;
    }
  }
}

module.exports = PhoneticTextXform;

}, function(modId) { var map = {"./text-xform":1676879951362,"./rich-text-xform":1676879951363,"../base-xform":1676879951340}; return __REQUIRE__(map[modId], modId); })
__DEFINE__(1676879951365, function(require, module, exports) {
const XmlStream = require('../../../utils/xml-stream');
const BaseXform = require('../base-xform');

const RelationshipXform = require('./relationship-xform');

class RelationshipsXform extends BaseXform {
  constructor() {
    super();

    this.map = {
      Relationship: new RelationshipXform(),
    };
  }

  render(xmlStream, model) {
    model = model || this._values;
    xmlStream.openXml(XmlStream.StdDocAttributes);
    xmlStream.openNode('Relationships', RelationshipsXform.RELATIONSHIPS_ATTRIBUTES);

    model.forEach(relationship => {
      this.map.Relationship.render(xmlStream, relationship);
    });

    xmlStream.closeNode();
  }

  parseOpen(node) {
    if (this.parser) {
      this.parser.parseOpen(node);
      return true;
    }
    switch (node.name) {
      case 'Relationships':
        this.model = [];
        return true;
      default:
        this.parser = this.map[node.name];
        if (this.parser) {
          this.parser.parseOpen(node);
          return true;
        }
        throw new Error(`Unexpected xml node in parseOpen: ${JSON.stringify(node)}`);
    }
  }

  parseText(text) {
    if (this.parser) {
      this.parser.parseText(text);
    }
  }

  parseClose(name) {
    if (this.parser) {
      if (!this.parser.parseClose(name)) {
        this.model.push(this.parser.model);
        this.parser = undefined;
      }
      return true;
    }
    switch (name) {
      case 'Relationships':
        return false;
      default:
        throw new Error(`Unexpected xml node in parseClose: ${name}`);
    }
  }
}

RelationshipsXform.RELATIONSHIPS_ATTRIBUTES = {
  xmlns: 'http://schemas.openxmlformats.org/package/2006/relationships',
};

module.exports = RelationshipsXform;

}, function(modId) { var map = {"../../../utils/xml-stream":1676879951337,"../base-xform":1676879951340,"./relationship-xform":1676879951366}; return __REQUIRE__(map[modId], modId); })
__DEFINE__(1676879951366, function(require, module, exports) {
const BaseXform = require('../base-xform');

class RelationshipXform extends BaseXform {
  render(xmlStream, model) {
    xmlStream.leafNode('Relationship', model);
  }

  parseOpen(node) {
    switch (node.name) {
      case 'Relationship':
        this.model = node.attributes;
        return true;
      default:
        return false;
    }
  }

  parseText() {}

  parseClose() {
    return false;
  }
}

module.exports = RelationshipXform;

}, function(modId) { var map = {"../base-xform":1676879951340}; return __REQUIRE__(map[modId], modId); })
__DEFINE__(1676879951367, function(require, module, exports) {
const XmlStream = require('../../../utils/xml-stream');

const BaseXform = require('../base-xform');

// used for rendering the [Content_Types].xml file
// not used for parsing
class ContentTypesXform extends BaseXform {
  render(xmlStream, model) {
    xmlStream.openXml(XmlStream.StdDocAttributes);

    xmlStream.openNode('Types', ContentTypesXform.PROPERTY_ATTRIBUTES);

    const mediaHash = {};
    (model.media || []).forEach(medium => {
      if (medium.type === 'image') {
        const imageType = medium.extension;
        if (!mediaHash[imageType]) {
          mediaHash[imageType] = true;
          xmlStream.leafNode('Default', {Extension: imageType, ContentType: `image/${imageType}`});
        }
      }
    });

    xmlStream.leafNode('Default', {
      Extension: 'rels',
      ContentType: 'application/vnd.openxmlformats-package.relationships+xml',
    });
    xmlStream.leafNode('Default', {Extension: 'xml', ContentType: 'application/xml'});

    xmlStream.leafNode('Override', {
      PartName: '/xl/workbook.xml',
      ContentType: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet.main+xml',
    });

    model.worksheets.forEach(worksheet => {
      const name = `/xl/worksheets/sheet${worksheet.id}.xml`;
      xmlStream.leafNode('Override', {
        PartName: name,
        ContentType: 'application/vnd.openxmlformats-officedocument.spreadsheetml.worksheet+xml',
      });
    });

    xmlStream.leafNode('Override', {
      PartName: '/xl/theme/theme1.xml',
      ContentType: 'application/vnd.openxmlformats-officedocument.theme+xml',
    });
    xmlStream.leafNode('Override', {
      PartName: '/xl/styles.xml',
      ContentType: 'application/vnd.openxmlformats-officedocument.spreadsheetml.styles+xml',
    });

    const hasSharedStrings = model.sharedStrings && model.sharedStrings.count;
    if (hasSharedStrings) {
      xmlStream.leafNode('Override', {
        PartName: '/xl/sharedStrings.xml',
        ContentType:
          'application/vnd.openxmlformats-officedocument.spreadsheetml.sharedStrings+xml',
      });
    }

    if (model.tables) {
      model.tables.forEach(table => {
        xmlStream.leafNode('Override', {
          PartName: `/xl/tables/${table.target}`,
          ContentType: 'application/vnd.openxmlformats-officedocument.spreadsheetml.table+xml',
        });
      });
    }

    if (model.drawings) {
      model.drawings.forEach(drawing => {
        xmlStream.leafNode('Override', {
          PartName: `/xl/drawings/${drawing.name}.xml`,
          ContentType: 'application/vnd.openxmlformats-officedocument.drawing+xml',
        });
      });
    }

    if (model.commentRefs) {
      xmlStream.leafNode('Default', {
        Extension: 'vml',
        ContentType: 'application/vnd.openxmlformats-officedocument.vmlDrawing',
      });

      model.commentRefs.forEach(({commentName}) => {
        xmlStream.leafNode('Override', {
          PartName: `/xl/${commentName}.xml`,
          ContentType: 'application/vnd.openxmlformats-officedocument.spreadsheetml.comments+xml',
        });
      });
    }

    xmlStream.leafNode('Override', {
      PartName: '/docProps/core.xml',
      ContentType: 'application/vnd.openxmlformats-package.core-properties+xml',
    });
    xmlStream.leafNode('Override', {
      PartName: '/docProps/app.xml',
      ContentType: 'application/vnd.openxmlformats-officedocument.extended-properties+xml',
    });

    xmlStream.closeNode();
  }

  parseOpen() {
    return false;
  }

  parseText() {}

  parseClose() {
    return false;
  }
}

ContentTypesXform.PROPERTY_ATTRIBUTES = {
  xmlns: 'http://schemas.openxmlformats.org/package/2006/content-types',
};

module.exports = ContentTypesXform;

}, function(modId) { var map = {"../../../utils/xml-stream":1676879951337,"../base-xform":1676879951340}; return __REQUIRE__(map[modId], modId); })
__DEFINE__(1676879951368, function(require, module, exports) {
const XmlStream = require('../../../utils/xml-stream');
const BaseXform = require('../base-xform');
const StringXform = require('../simple/string-xform');

const AppHeadingPairsXform = require('./app-heading-pairs-xform');
const AppTitleOfPartsXform = require('./app-titles-of-parts-xform');

class AppXform extends BaseXform {
  constructor() {
    super();

    this.map = {
      Company: new StringXform({tag: 'Company'}),
      Manager: new StringXform({tag: 'Manager'}),
      HeadingPairs: new AppHeadingPairsXform(),
      TitleOfParts: new AppTitleOfPartsXform(),
    };
  }

  render(xmlStream, model) {
    xmlStream.openXml(XmlStream.StdDocAttributes);

    xmlStream.openNode('Properties', AppXform.PROPERTY_ATTRIBUTES);

    xmlStream.leafNode('Application', undefined, 'Microsoft Excel');
    xmlStream.leafNode('DocSecurity', undefined, '0');
    xmlStream.leafNode('ScaleCrop', undefined, 'false');

    this.map.HeadingPairs.render(xmlStream, model.worksheets);
    this.map.TitleOfParts.render(xmlStream, model.worksheets);
    this.map.Company.render(xmlStream, model.company || '');
    this.map.Manager.render(xmlStream, model.manager);

    xmlStream.leafNode('LinksUpToDate', undefined, 'false');
    xmlStream.leafNode('SharedDoc', undefined, 'false');
    xmlStream.leafNode('HyperlinksChanged', undefined, 'false');
    xmlStream.leafNode('AppVersion', undefined, '16.0300');

    xmlStream.closeNode();
  }

  parseOpen(node) {
    if (this.parser) {
      this.parser.parseOpen(node);
      return true;
    }
    switch (node.name) {
      case 'Properties':
        return true;
      default:
        this.parser = this.map[node.name];
        if (this.parser) {
          this.parser.parseOpen(node);
          return true;
        }

        // there's a lot we don't bother to parse
        return false;
    }
  }

  parseText(text) {
    if (this.parser) {
      this.parser.parseText(text);
    }
  }

  parseClose(name) {
    if (this.parser) {
      if (!this.parser.parseClose(name)) {
        this.parser = undefined;
      }
      return true;
    }
    switch (name) {
      case 'Properties':
        this.model = {
          worksheets: this.map.TitleOfParts.model,
          company: this.map.Company.model,
          manager: this.map.Manager.model,
        };
        return false;
      default:
        return true;
    }
  }
}

AppXform.DateFormat = function(dt) {
  return dt.toISOString().replace(/[.]\d{3,6}/, '');
};

AppXform.DateAttrs = {'xsi:type': 'dcterms:W3CDTF'};

AppXform.PROPERTY_ATTRIBUTES = {
  xmlns: 'http://schemas.openxmlformats.org/officeDocument/2006/extended-properties',
  'xmlns:vt': 'http://schemas.openxmlformats.org/officeDocument/2006/docPropsVTypes',
};

module.exports = AppXform;

}, function(modId) { var map = {"../../../utils/xml-stream":1676879951337,"../base-xform":1676879951340,"../simple/string-xform":1676879951348,"./app-heading-pairs-xform":1676879951369,"./app-titles-of-parts-xform":1676879951370}; return __REQUIRE__(map[modId], modId); })
__DEFINE__(1676879951369, function(require, module, exports) {
const BaseXform = require('../base-xform');

class AppHeadingPairsXform extends BaseXform {
  render(xmlStream, model) {
    xmlStream.openNode('HeadingPairs');
    xmlStream.openNode('vt:vector', {size: 2, baseType: 'variant'});

    xmlStream.openNode('vt:variant');
    xmlStream.leafNode('vt:lpstr', undefined, 'Worksheets');
    xmlStream.closeNode();

    xmlStream.openNode('vt:variant');
    xmlStream.leafNode('vt:i4', undefined, model.length);
    xmlStream.closeNode();

    xmlStream.closeNode();
    xmlStream.closeNode();
  }

  parseOpen(node) {
    // no parsing
    return node.name === 'HeadingPairs';
  }

  parseText() {}

  parseClose(name) {
    return name !== 'HeadingPairs';
  }
}

module.exports = AppHeadingPairsXform;

}, function(modId) { var map = {"../base-xform":1676879951340}; return __REQUIRE__(map[modId], modId); })
__DEFINE__(1676879951370, function(require, module, exports) {
const BaseXform = require('../base-xform');

class AppTitlesOfPartsXform extends BaseXform {
  render(xmlStream, model) {
    xmlStream.openNode('TitlesOfParts');
    xmlStream.openNode('vt:vector', {size: model.length, baseType: 'lpstr'});

    model.forEach(sheet => {
      xmlStream.leafNode('vt:lpstr', undefined, sheet.name);
    });

    xmlStream.closeNode();
    xmlStream.closeNode();
  }

  parseOpen(node) {
    // no parsing
    return node.name === 'TitlesOfParts';
  }

  parseText() {}

  parseClose(name) {
    return name !== 'TitlesOfParts';
  }
}

module.exports = AppTitlesOfPartsXform;

}, function(modId) { var map = {"../base-xform":1676879951340}; return __REQUIRE__(map[modId], modId); })
__DEFINE__(1676879951371, function(require, module, exports) {
const _ = require('../../../utils/under-dash');

const colCache = require('../../../utils/col-cache');
const XmlStream = require('../../../utils/xml-stream');

const BaseXform = require('../base-xform');
const StaticXform = require('../static-xform');
const ListXform = require('../list-xform');
const DefinedNameXform = require('./defined-name-xform');
const SheetXform = require('./sheet-xform');
const WorkbookViewXform = require('./workbook-view-xform');
const WorkbookPropertiesXform = require('./workbook-properties-xform');
const WorkbookCalcPropertiesXform = require('./workbook-calc-properties-xform');

class WorkbookXform extends BaseXform {
  constructor() {
    super();

    this.map = {
      fileVersion: WorkbookXform.STATIC_XFORMS.fileVersion,
      workbookPr: new WorkbookPropertiesXform(),
      bookViews: new ListXform({
        tag: 'bookViews',
        count: false,
        childXform: new WorkbookViewXform(),
      }),
      sheets: new ListXform({tag: 'sheets', count: false, childXform: new SheetXform()}),
      definedNames: new ListXform({
        tag: 'definedNames',
        count: false,
        childXform: new DefinedNameXform(),
      }),
      calcPr: new WorkbookCalcPropertiesXform(),
    };
  }

  prepare(model) {
    model.sheets = model.worksheets;

    // collate all the print areas from all of the sheets and add them to the defined names
    const printAreas = [];
    let index = 0; // sheets is sparse array - calc index manually
    model.sheets.forEach(sheet => {
      if (sheet.pageSetup && sheet.pageSetup.printArea) {
        sheet.pageSetup.printArea.split('&&').forEach(printArea => {
          const printAreaComponents = printArea.split(':');
          const definedName = {
            name: '_xlnm.Print_Area',
            ranges: [`'${sheet.name}'!$${printAreaComponents[0]}:$${printAreaComponents[1]}`],
            localSheetId: index,
          };
          printAreas.push(definedName);
        });
      }

      if (
        sheet.pageSetup &&
        (sheet.pageSetup.printTitlesRow || sheet.pageSetup.printTitlesColumn)
      ) {
        const ranges = [];

        if (sheet.pageSetup.printTitlesColumn) {
          const titlesColumns = sheet.pageSetup.printTitlesColumn.split(':');
          ranges.push(`'${sheet.name}'!$${titlesColumns[0]}:$${titlesColumns[1]}`);
        }

        if (sheet.pageSetup.printTitlesRow) {
          const titlesRows = sheet.pageSetup.printTitlesRow.split(':');
          ranges.push(`'${sheet.name}'!$${titlesRows[0]}:$${titlesRows[1]}`);
        }

        const definedName = {
          name: '_xlnm.Print_Titles',
          ranges,
          localSheetId: index,
        };

        printAreas.push(definedName);
      }
      index++;
    });
    if (printAreas.length) {
      model.definedNames = model.definedNames.concat(printAreas);
    }

    (model.media || []).forEach((medium, i) => {
      // assign name
      medium.name = medium.type + (i + 1);
    });
  }

  render(xmlStream, model) {
    xmlStream.openXml(XmlStream.StdDocAttributes);
    xmlStream.openNode('workbook', WorkbookXform.WORKBOOK_ATTRIBUTES);

    this.map.fileVersion.render(xmlStream);
    this.map.workbookPr.render(xmlStream, model.properties);
    this.map.bookViews.render(xmlStream, model.views);
    this.map.sheets.render(xmlStream, model.sheets);
    this.map.definedNames.render(xmlStream, model.definedNames);
    this.map.calcPr.render(xmlStream, model.calcProperties);

    xmlStream.closeNode();
  }

  parseOpen(node) {
    if (this.parser) {
      this.parser.parseOpen(node);
      return true;
    }
    switch (node.name) {
      case 'workbook':
        return true;
      default:
        this.parser = this.map[node.name];
        if (this.parser) {
          this.parser.parseOpen(node);
        }
        return true;
    }
  }

  parseText(text) {
    if (this.parser) {
      this.parser.parseText(text);
    }
  }

  parseClose(name) {
    if (this.parser) {
      if (!this.parser.parseClose(name)) {
        this.parser = undefined;
      }
      return true;
    }
    switch (name) {
      case 'workbook':
        this.model = {
          sheets: this.map.sheets.model,
          properties: this.map.workbookPr.model || {},
          views: this.map.bookViews.model,
          calcProperties: {},
        };
        if (this.map.definedNames.model) {
          this.model.definedNames = this.map.definedNames.model;
        }

        return false;
      default:
        // not quite sure how we get here!
        return true;
    }
  }

  reconcile(model) {
    const rels = (model.workbookRels || []).reduce((map, rel) => {
      map[rel.Id] = rel;
      return map;
    }, {});

    // reconcile sheet ids, rIds and names
    const worksheets = [];
    let worksheet;
    let index = 0;

    (model.sheets || []).forEach(sheet => {
      const rel = rels[sheet.rId];
      if (!rel) {
        return;
      }
      // if rel.Target start with `[space]/xl/` or `/xl/` , then it will be replaced with `''` and spliced behind `xl/`,
      // otherwise it will be spliced directly behind `xl/`. i.g.
      worksheet = model.worksheetHash[`xl/${rel.Target.replace(/^(\s|\/xl\/)+/, '')}`];
      // If there are "chartsheets" in the file, rel.Target will
      // come out as chartsheets/sheet1.xml or similar here, and
      // that won't be in model.worksheetHash.
      // As we don't have the infrastructure to support chartsheets,
      // we will ignore them for now:
      if (worksheet) {
        worksheet.name = sheet.name;
        worksheet.id = sheet.id;
        worksheet.state = sheet.state;
        worksheets[index++] = worksheet;
      }
    });

    // reconcile print areas
    const definedNames = [];
    _.each(model.definedNames, definedName => {
      if (definedName.name === '_xlnm.Print_Area') {
        worksheet = worksheets[definedName.localSheetId];
        if (worksheet) {
          if (!worksheet.pageSetup) {
            worksheet.pageSetup = {};
          }
          const range = colCache.decodeEx(definedName.ranges[0]);
          worksheet.pageSetup.printArea = worksheet.pageSetup.printArea
            ? `${worksheet.pageSetup.printArea}&&${range.dimensions}`
            : range.dimensions;
        }
      } else if (definedName.name === '_xlnm.Print_Titles') {
        worksheet = worksheets[definedName.localSheetId];
        if (worksheet) {
          if (!worksheet.pageSetup) {
            worksheet.pageSetup = {};
          }

          const rangeString = definedName.ranges.join(',');

          const dollarRegex = /\$/g;

          const rowRangeRegex = /\$\d+:\$\d+/;
          const rowRangeMatches = rangeString.match(rowRangeRegex);

          if (rowRangeMatches && rowRangeMatches.length) {
            const range = rowRangeMatches[0];
            worksheet.pageSetup.printTitlesRow = range.replace(dollarRegex, '');
          }

          const columnRangeRegex = /\$[A-Z]+:\$[A-Z]+/;
          const columnRangeMatches = rangeString.match(columnRangeRegex);

          if (columnRangeMatches && columnRangeMatches.length) {
            const range = columnRangeMatches[0];
            worksheet.pageSetup.printTitlesColumn = range.replace(dollarRegex, '');
          }
        }
      } else {
        definedNames.push(definedName);
      }
    });
    model.definedNames = definedNames;

    // used by sheets to build their image models
    model.media.forEach((media, i) => {
      media.index = i;
    });
  }
}

WorkbookXform.WORKBOOK_ATTRIBUTES = {
  xmlns: 'http://schemas.openxmlformats.org/spreadsheetml/2006/main',
  'xmlns:r': 'http://schemas.openxmlformats.org/officeDocument/2006/relationships',
  'xmlns:mc': 'http://schemas.openxmlformats.org/markup-compatibility/2006',
  'mc:Ignorable': 'x15',
  'xmlns:x15': 'http://schemas.microsoft.com/office/spreadsheetml/2010/11/main',
};
WorkbookXform.STATIC_XFORMS = {
  fileVersion: new StaticXform({
    tag: 'fileVersion',
    $: {appName: 'xl', lastEdited: 5, lowestEdited: 5, rupBuild: 9303},
  }),
};

module.exports = WorkbookXform;

}, function(modId) { var map = {"../../../utils/under-dash":1676879951315,"../../../utils/col-cache":1676879951316,"../../../utils/xml-stream":1676879951337,"../base-xform":1676879951340,"../static-xform":1676879951342,"../list-xform":1676879951343,"./defined-name-xform":1676879951372,"./sheet-xform":1676879951373,"./workbook-view-xform":1676879951374,"./workbook-properties-xform":1676879951375,"./workbook-calc-properties-xform":1676879951376}; return __REQUIRE__(map[modId], modId); })
__DEFINE__(1676879951372, function(require, module, exports) {
const BaseXform = require('../base-xform');
const colCache = require('../../../utils/col-cache');

class DefinedNamesXform extends BaseXform {
  render(xmlStream, model) {
    // <definedNames>
    //   <definedName name="name">name.ranges.join(',')</definedName>
    //   <definedName name="_xlnm.Print_Area" localSheetId="0">name.ranges.join(',')</definedName>
    // </definedNames>
    xmlStream.openNode('definedName', {
      name: model.name,
      localSheetId: model.localSheetId,
    });
    xmlStream.writeText(model.ranges.join(','));
    xmlStream.closeNode();
  }

  parseOpen(node) {
    switch (node.name) {
      case 'definedName':
        this._parsedName = node.attributes.name;
        this._parsedLocalSheetId = node.attributes.localSheetId;
        this._parsedText = [];
        return true;
      default:
        return false;
    }
  }

  parseText(text) {
    this._parsedText.push(text);
  }

  parseClose() {
    this.model = {
      name: this._parsedName,
      ranges: extractRanges(this._parsedText.join('')),
    };
    if (this._parsedLocalSheetId !== undefined) {
      this.model.localSheetId = parseInt(this._parsedLocalSheetId, 10);
    }
    return false;
  }
}

function isValidRange(range) {
  try {
    colCache.decodeEx(range);
    return true;
  } catch (err) {
    return false;
  }
}

function extractRanges(parsedText) {
  const ranges = [];
  let quotesOpened = false;
  let last = '';
  parsedText.split(',').forEach(item => {
    if (!item) {
      return;
    }
    const quotes = (item.match(/'/g) || []).length;

    if (!quotes) {
      if (quotesOpened) {
        last += `${item},`;
      } else if (isValidRange(item)) {
        ranges.push(item);
      }
      return;
    }
    const quotesEven = quotes % 2 === 0;

    if (!quotesOpened && quotesEven && isValidRange(item)) {
      ranges.push(item);
    } else if (quotesOpened && !quotesEven) {
      quotesOpened = false;
      if (isValidRange(last + item)) {
        ranges.push(last + item);
      }
      last = '';
    } else {
      quotesOpened = true;
      last += `${item},`;
    }
  });
  return ranges;
}

module.exports = DefinedNamesXform;

}, function(modId) { var map = {"../base-xform":1676879951340,"../../../utils/col-cache":1676879951316}; return __REQUIRE__(map[modId], modId); })
__DEFINE__(1676879951373, function(require, module, exports) {
const utils = require('../../../utils/utils');
const BaseXform = require('../base-xform');

class WorksheetXform extends BaseXform {
  render(xmlStream, model) {
    xmlStream.leafNode('sheet', {
      sheetId: model.id,
      name: model.name,
      state: model.state,
      'r:id': model.rId,
    });
  }

  parseOpen(node) {
    if (node.name === 'sheet') {
      this.model = {
        name: utils.xmlDecode(node.attributes.name),
        id: parseInt(node.attributes.sheetId, 10),
        state: node.attributes.state,
        rId: node.attributes['r:id'],
      };
      return true;
    }
    return false;
  }

  parseText() {}

  parseClose() {
    return false;
  }
}

module.exports = WorksheetXform;

}, function(modId) { var map = {"../../../utils/utils":1676879951334,"../base-xform":1676879951340}; return __REQUIRE__(map[modId], modId); })
__DEFINE__(1676879951374, function(require, module, exports) {
const BaseXform = require('../base-xform');

class WorkbookViewXform extends BaseXform {
  render(xmlStream, model) {
    const attributes = {
      xWindow: model.x || 0,
      yWindow: model.y || 0,
      windowWidth: model.width || 12000,
      windowHeight: model.height || 24000,
      firstSheet: model.firstSheet,
      activeTab: model.activeTab,
    };
    if (model.visibility && model.visibility !== 'visible') {
      attributes.visibility = model.visibility;
    }
    xmlStream.leafNode('workbookView', attributes);
  }

  parseOpen(node) {
    if (node.name === 'workbookView') {
      const model = (this.model = {});
      const addS = function(name, value, dflt) {
        const s = value !== undefined ? (model[name] = value) : dflt;
        if (s !== undefined) {
          model[name] = s;
        }
      };
      const addN = function(name, value, dflt) {
        const n = value !== undefined ? (model[name] = parseInt(value, 10)) : dflt;
        if (n !== undefined) {
          model[name] = n;
        }
      };
      addN('x', node.attributes.xWindow, 0);
      addN('y', node.attributes.yWindow, 0);
      addN('width', node.attributes.windowWidth, 25000);
      addN('height', node.attributes.windowHeight, 10000);
      addS('visibility', node.attributes.visibility, 'visible');
      addN('activeTab', node.attributes.activeTab, undefined);
      addN('firstSheet', node.attributes.firstSheet, undefined);
      return true;
    }
    return false;
  }

  parseText() {}

  parseClose() {
    return false;
  }
}

module.exports = WorkbookViewXform;

}, function(modId) { var map = {"../base-xform":1676879951340}; return __REQUIRE__(map[modId], modId); })
__DEFINE__(1676879951375, function(require, module, exports) {
const BaseXform = require('../base-xform');

class WorksheetPropertiesXform extends BaseXform {
  render(xmlStream, model) {
    xmlStream.leafNode('workbookPr', {
      date1904: model.date1904 ? 1 : undefined,
      defaultThemeVersion: 164011,
      filterPrivacy: 1,
    });
  }

  parseOpen(node) {
    if (node.name === 'workbookPr') {
      this.model = {
        date1904: node.attributes.date1904 === '1',
      };
      return true;
    }
    return false;
  }

  parseText() {}

  parseClose() {
    return false;
  }
}

module.exports = WorksheetPropertiesXform;

}, function(modId) { var map = {"../base-xform":1676879951340}; return __REQUIRE__(map[modId], modId); })
__DEFINE__(1676879951376, function(require, module, exports) {
const BaseXform = require('../base-xform');

class WorkbookCalcPropertiesXform extends BaseXform {
  render(xmlStream, model) {
    xmlStream.leafNode('calcPr', {
      calcId: 171027,
      fullCalcOnLoad: model.fullCalcOnLoad ? 1 : undefined,
    });
  }

  parseOpen(node) {
    if (node.name === 'calcPr') {
      this.model = {};
      return true;
    }
    return false;
  }

  parseText() {}

  parseClose() {
    return false;
  }
}

module.exports = WorkbookCalcPropertiesXform;

}, function(modId) { var map = {"../base-xform":1676879951340}; return __REQUIRE__(map[modId], modId); })
__DEFINE__(1676879951377, function(require, module, exports) {
const _ = require('../../../utils/under-dash');

const colCache = require('../../../utils/col-cache');
const XmlStream = require('../../../utils/xml-stream');

const RelType = require('../../rel-type');

const Merges = require('./merges');

const BaseXform = require('../base-xform');
const ListXform = require('../list-xform');
const RowXform = require('./row-xform');
const ColXform = require('./col-xform');
const DimensionXform = require('./dimension-xform');
const HyperlinkXform = require('./hyperlink-xform');
const MergeCellXform = require('./merge-cell-xform');
const DataValidationsXform = require('./data-validations-xform');
const SheetPropertiesXform = require('./sheet-properties-xform');
const SheetFormatPropertiesXform = require('./sheet-format-properties-xform');
const SheetViewXform = require('./sheet-view-xform');
const SheetProtectionXform = require('./sheet-protection-xform');
const PageMarginsXform = require('./page-margins-xform');
const PageSetupXform = require('./page-setup-xform');
const PrintOptionsXform = require('./print-options-xform');
const AutoFilterXform = require('./auto-filter-xform');
const PictureXform = require('./picture-xform');
const DrawingXform = require('./drawing-xform');
const TablePartXform = require('./table-part-xform');
const RowBreaksXform = require('./row-breaks-xform');
const HeaderFooterXform = require('./header-footer-xform');
const ConditionalFormattingsXform = require('./cf/conditional-formattings-xform');
const ExtListXform = require('./ext-lst-xform');

const mergeRule = (rule, extRule) => {
  Object.keys(extRule).forEach(key => {
    const value = rule[key];
    const extValue = extRule[key];
    if (value === undefined && extValue !== undefined) {
      rule[key] = extValue;
    }
  });
};

const mergeConditionalFormattings = (model, extModel) => {
  // conditional formattings are rendered in worksheet.conditionalFormatting and also in
  // worksheet.extLst.ext.x14:conditionalFormattings
  // some (e.g. dataBar) are even spread across both!
  if (!extModel || !extModel.length) {
    return model;
  }
  if (!model || !model.length) {
    return extModel;
  }

  // index model rules by x14Id
  const cfMap = {};
  const ruleMap = {};
  model.forEach(cf => {
    cfMap[cf.ref] = cf;
    cf.rules.forEach(rule => {
      const {x14Id} = rule;
      if (x14Id) {
        ruleMap[x14Id] = rule;
      }
    });
  });

  extModel.forEach(extCf => {
    extCf.rules.forEach(extRule => {
      const rule = ruleMap[extRule.x14Id];
      if (rule) {
        // merge with matching rule
        mergeRule(rule, extRule);
      } else if (cfMap[extCf.ref]) {
        // reuse existing cf ref
        cfMap[extCf.ref].rules.push(extRule);
      } else {
        // create new cf
        model.push({
          ref: extCf.ref,
          rules: [extRule],
        });
      }
    });
  });

  // need to cope with rules in extModel that don't exist in model
  return model;
};

class WorkSheetXform extends BaseXform {
  constructor(options) {
    super();

    const {maxRows, maxCols} = options || {};
    this.map = {
      sheetPr: new SheetPropertiesXform(),
      dimension: new DimensionXform(),
      sheetViews: new ListXform({
        tag: 'sheetViews',
        count: false,
        childXform: new SheetViewXform(),
      }),
      sheetFormatPr: new SheetFormatPropertiesXform(),
      cols: new ListXform({tag: 'cols', count: false, childXform: new ColXform()}),
      sheetData: new ListXform({
        tag: 'sheetData',
        count: false,
        empty: true,
        childXform: new RowXform({maxItems: maxCols}),
        maxItems: maxRows,
      }),
      autoFilter: new AutoFilterXform(),
      mergeCells: new ListXform({tag: 'mergeCells', count: true, childXform: new MergeCellXform()}),
      rowBreaks: new RowBreaksXform(),
      hyperlinks: new ListXform({
        tag: 'hyperlinks',
        count: false,
        childXform: new HyperlinkXform(),
      }),
      pageMargins: new PageMarginsXform(),
      dataValidations: new DataValidationsXform(),
      pageSetup: new PageSetupXform(),
      headerFooter: new HeaderFooterXform(),
      printOptions: new PrintOptionsXform(),
      picture: new PictureXform(),
      drawing: new DrawingXform(),
      sheetProtection: new SheetProtectionXform(),
      tableParts: new ListXform({tag: 'tableParts', count: true, childXform: new TablePartXform()}),
      conditionalFormatting: new ConditionalFormattingsXform(),
      extLst: new ExtListXform(),
    };
  }

  prepare(model, options) {
    options.merges = new Merges();
    model.hyperlinks = options.hyperlinks = [];
    model.comments = options.comments = [];

    options.formulae = {};
    options.siFormulae = 0;
    this.map.cols.prepare(model.cols, options);
    this.map.sheetData.prepare(model.rows, options);
    this.map.conditionalFormatting.prepare(model.conditionalFormattings, options);

    model.mergeCells = options.merges.mergeCells;

    // prepare relationships
    const rels = (model.rels = []);

    function nextRid(r) {
      return `rId${r.length + 1}`;
    }

    model.hyperlinks.forEach(hyperlink => {
      const rId = nextRid(rels);
      hyperlink.rId = rId;
      rels.push({
        Id: rId,
        Type: RelType.Hyperlink,
        Target: hyperlink.target,
        TargetMode: 'External',
      });
    });

    // prepare comment relationships
    if (model.comments.length > 0) {
      const comment = {
        Id: nextRid(rels),
        Type: RelType.Comments,
        Target: `../comments${model.id}.xml`,
      };
      rels.push(comment);
      const vmlDrawing = {
        Id: nextRid(rels),
        Type: RelType.VmlDrawing,
        Target: `../drawings/vmlDrawing${model.id}.vml`,
      };
      rels.push(vmlDrawing);

      model.comments.forEach(item => {
        item.refAddress = colCache.decodeAddress(item.ref);
      });

      options.commentRefs.push({
        commentName: `comments${model.id}`,
        vmlDrawing: `vmlDrawing${model.id}`,
      });
    }

    const drawingRelsHash = [];
    let bookImage;
    model.media.forEach(medium => {
      if (medium.type === 'background') {
        const rId = nextRid(rels);
        bookImage = options.media[medium.imageId];
        rels.push({
          Id: rId,
          Type: RelType.Image,
          Target: `../media/${bookImage.name}.${bookImage.extension}`,
        });
        model.background = {
          rId,
        };
        model.image = options.media[medium.imageId];
      } else if (medium.type === 'image') {
        let {drawing} = model;
        bookImage = options.media[medium.imageId];
        if (!drawing) {
          drawing = model.drawing = {
            rId: nextRid(rels),
            name: `drawing${++options.drawingsCount}`,
            anchors: [],
            rels: [],
          };
          options.drawings.push(drawing);
          rels.push({
            Id: drawing.rId,
            Type: 'http://schemas.openxmlformats.org/officeDocument/2006/relationships/drawing',
            Target: `../drawings/${drawing.name}.xml`,
          });
        }
        let rIdImage =
          this.preImageId === medium.imageId
            ? drawingRelsHash[medium.imageId]
            : drawingRelsHash[drawing.rels.length];
        if (!rIdImage) {
          rIdImage = nextRid(drawing.rels);
          drawingRelsHash[drawing.rels.length] = rIdImage;
          drawing.rels.push({
            Id: rIdImage,
            Type: 'http://schemas.openxmlformats.org/officeDocument/2006/relationships/image',
            Target: `../media/${bookImage.name}.${bookImage.extension}`,
          });
        }

        const anchor = {
          picture: {
            rId: rIdImage,
          },
          range: medium.range,
        };
        if (medium.hyperlinks && medium.hyperlinks.hyperlink) {
          const rIdHyperLink = nextRid(drawing.rels);
          drawingRelsHash[drawing.rels.length] = rIdHyperLink;
          anchor.picture.hyperlinks = {
            tooltip: medium.hyperlinks.tooltip,
            rId: rIdHyperLink,
          };
          drawing.rels.push({
            Id: rIdHyperLink,
            Type: RelType.Hyperlink,
            Target: medium.hyperlinks.hyperlink,
            TargetMode: 'External',
          });
        }
        this.preImageId = medium.imageId;
        drawing.anchors.push(anchor);
      }
    });

    // prepare tables
    model.tables.forEach(table => {
      // relationships
      const rId = nextRid(rels);
      table.rId = rId;
      rels.push({
        Id: rId,
        Type: RelType.Table,
        Target: `../tables/${table.target}`,
      });

      // dynamic styles
      table.columns.forEach(column => {
        const {style} = column;
        if (style) {
          column.dxfId = options.styles.addDxfStyle(style);
        }
      });
    });

    // prepare ext items
    this.map.extLst.prepare(model, options);
  }

  render(xmlStream, model) {
    xmlStream.openXml(XmlStream.StdDocAttributes);
    xmlStream.openNode('worksheet', WorkSheetXform.WORKSHEET_ATTRIBUTES);

    const sheetFormatPropertiesModel = model.properties
      ? {
          defaultRowHeight: model.properties.defaultRowHeight,
          dyDescent: model.properties.dyDescent,
          outlineLevelCol: model.properties.outlineLevelCol,
          outlineLevelRow: model.properties.outlineLevelRow,
        }
      : undefined;
    if (model.properties && model.properties.defaultColWidth) {
      sheetFormatPropertiesModel.defaultColWidth = model.properties.defaultColWidth;
    }
    const sheetPropertiesModel = {
      outlineProperties: model.properties && model.properties.outlineProperties,
      tabColor: model.properties && model.properties.tabColor,
      pageSetup:
        model.pageSetup && model.pageSetup.fitToPage
          ? {
              fitToPage: model.pageSetup.fitToPage,
            }
          : undefined,
    };
    const pageMarginsModel = model.pageSetup && model.pageSetup.margins;
    const printOptionsModel = {
      showRowColHeaders: model.pageSetup && model.pageSetup.showRowColHeaders,
      showGridLines: model.pageSetup && model.pageSetup.showGridLines,
      horizontalCentered: model.pageSetup && model.pageSetup.horizontalCentered,
      verticalCentered: model.pageSetup && model.pageSetup.verticalCentered,
    };
    const sheetProtectionModel = model.sheetProtection;

    this.map.sheetPr.render(xmlStream, sheetPropertiesModel);
    this.map.dimension.render(xmlStream, model.dimensions);
    this.map.sheetViews.render(xmlStream, model.views);
    this.map.sheetFormatPr.render(xmlStream, sheetFormatPropertiesModel);
    this.map.cols.render(xmlStream, model.cols);
    this.map.sheetData.render(xmlStream, model.rows);
    this.map.sheetProtection.render(xmlStream, sheetProtectionModel); // Note: must be after sheetData and before autoFilter
    this.map.autoFilter.render(xmlStream, model.autoFilter);
    this.map.mergeCells.render(xmlStream, model.mergeCells);
    this.map.conditionalFormatting.render(xmlStream, model.conditionalFormattings); // Note: must be before dataValidations
    this.map.dataValidations.render(xmlStream, model.dataValidations);

    // For some reason hyperlinks have to be after the data validations
    this.map.hyperlinks.render(xmlStream, model.hyperlinks);

    this.map.printOptions.render(xmlStream, printOptionsModel); // Note: must be before pageMargins
    this.map.pageMargins.render(xmlStream, pageMarginsModel);
    this.map.pageSetup.render(xmlStream, model.pageSetup);
    this.map.headerFooter.render(xmlStream, model.headerFooter);
    this.map.rowBreaks.render(xmlStream, model.rowBreaks);
    this.map.drawing.render(xmlStream, model.drawing); // Note: must be after rowBreaks
    this.map.picture.render(xmlStream, model.background); // Note: must be after drawing
    this.map.tableParts.render(xmlStream, model.tables);

    this.map.extLst.render(xmlStream, model);

    if (model.rels) {
      // add a <legacyDrawing /> node for each comment
      model.rels.forEach(rel => {
        if (rel.Type === RelType.VmlDrawing) {
          xmlStream.leafNode('legacyDrawing', {'r:id': rel.Id});
        }
      });
    }

    xmlStream.closeNode();
  }

  parseOpen(node) {
    if (this.parser) {
      this.parser.parseOpen(node);
      return true;
    }

    if (node.name === 'worksheet') {
      _.each(this.map, xform => {
        xform.reset();
      });
      return true;
    }

    this.parser = this.map[node.name];
    if (this.parser) {
      this.parser.parseOpen(node);
    }
    return true;
  }

  parseText(text) {
    if (this.parser) {
      this.parser.parseText(text);
    }
  }

  parseClose(name) {
    if (this.parser) {
      if (!this.parser.parseClose(name)) {
        this.parser = undefined;
      }
      return true;
    }
    switch (name) {
      case 'worksheet': {
        const properties = this.map.sheetFormatPr.model || {};
        if (this.map.sheetPr.model && this.map.sheetPr.model.tabColor) {
          properties.tabColor = this.map.sheetPr.model.tabColor;
        }
        if (this.map.sheetPr.model && this.map.sheetPr.model.outlineProperties) {
          properties.outlineProperties = this.map.sheetPr.model.outlineProperties;
        }
        const sheetProperties = {
          fitToPage:
            (this.map.sheetPr.model &&
              this.map.sheetPr.model.pageSetup &&
              this.map.sheetPr.model.pageSetup.fitToPage) ||
            false,
          margins: this.map.pageMargins.model,
        };
        const pageSetup = Object.assign(
          sheetProperties,
          this.map.pageSetup.model,
          this.map.printOptions.model
        );
        const conditionalFormattings = mergeConditionalFormattings(
          this.map.conditionalFormatting.model,
          this.map.extLst.model && this.map.extLst.model['x14:conditionalFormattings']
        );
        this.model = {
          dimensions: this.map.dimension.model,
          cols: this.map.cols.model,
          rows: this.map.sheetData.model,
          mergeCells: this.map.mergeCells.model,
          hyperlinks: this.map.hyperlinks.model,
          dataValidations: this.map.dataValidations.model,
          properties,
          views: this.map.sheetViews.model,
          pageSetup,
          headerFooter: this.map.headerFooter.model,
          background: this.map.picture.model,
          drawing: this.map.drawing.model,
          tables: this.map.tableParts.model,
          conditionalFormattings,
        };

        if (this.map.autoFilter.model) {
          this.model.autoFilter = this.map.autoFilter.model;
        }
        if (this.map.sheetProtection.model) {
          this.model.sheetProtection = this.map.sheetProtection.model;
        }

        return false;
      }

      default:
        // not quite sure how we get here!
        return true;
    }
  }

  reconcile(model, options) {
    // options.merges = new Merges();
    // options.merges.reconcile(model.mergeCells, model.rows);
    const rels = (model.relationships || []).reduce((h, rel) => {
      h[rel.Id] = rel;
      if (rel.Type === RelType.Comments) {
        model.comments = options.comments[rel.Target].comments;
      }
      if (rel.Type === RelType.VmlDrawing && model.comments && model.comments.length) {
        const vmlComment = options.vmlDrawings[rel.Target].comments;
        model.comments.forEach((comment, index) => {
          comment.note = Object.assign({}, comment.note, vmlComment[index]);
        });
      }
      return h;
    }, {});
    options.commentsMap = (model.comments || []).reduce((h, comment) => {
      if (comment.ref) {
        h[comment.ref] = comment;
      }
      return h;
    }, {});
    options.hyperlinkMap = (model.hyperlinks || []).reduce((h, hyperlink) => {
      if (hyperlink.rId) {
        h[hyperlink.address] = rels[hyperlink.rId].Target;
      }
      return h;
    }, {});
    options.formulae = {};

    // compact the rows and cells
    model.rows = (model.rows && model.rows.filter(Boolean)) || [];
    model.rows.forEach(row => {
      row.cells = (row.cells && row.cells.filter(Boolean)) || [];
    });

    this.map.cols.reconcile(model.cols, options);
    this.map.sheetData.reconcile(model.rows, options);
    this.map.conditionalFormatting.reconcile(model.conditionalFormattings, options);

    model.media = [];
    if (model.drawing) {
      const drawingRel = rels[model.drawing.rId];
      const match = drawingRel.Target.match(/\/drawings\/([a-zA-Z0-9]+)[.][a-zA-Z]{3,4}$/);
      if (match) {
        const drawingName = match[1];
        const drawing = options.drawings[drawingName];
        drawing.anchors.forEach(anchor => {
          if (anchor.medium) {
            const image = {
              type: 'image',
              imageId: anchor.medium.index,
              range: anchor.range,
              hyperlinks: anchor.picture.hyperlinks,
            };
            model.media.push(image);
          }
        });
      }
    }

    const backgroundRel = model.background && rels[model.background.rId];
    if (backgroundRel) {
      const target = backgroundRel.Target.split('/media/')[1];
      const imageId = options.mediaIndex && options.mediaIndex[target];
      if (imageId !== undefined) {
        model.media.push({
          type: 'background',
          imageId,
        });
      }
    }

    model.tables = (model.tables || []).map(tablePart => {
      const rel = rels[tablePart.rId];
      return options.tables[rel.Target];
    });

    delete model.relationships;
    delete model.hyperlinks;
    delete model.comments;
  }
}

WorkSheetXform.WORKSHEET_ATTRIBUTES = {
  xmlns: 'http://schemas.openxmlformats.org/spreadsheetml/2006/main',
  'xmlns:r': 'http://schemas.openxmlformats.org/officeDocument/2006/relationships',
  'xmlns:mc': 'http://schemas.openxmlformats.org/markup-compatibility/2006',
  'mc:Ignorable': 'x14ac',
  'xmlns:x14ac': 'http://schemas.microsoft.com/office/spreadsheetml/2009/9/ac',
};

module.exports = WorkSheetXform;

}, function(modId) { var map = {"../../../utils/under-dash":1676879951315,"../../../utils/col-cache":1676879951316,"../../../utils/xml-stream":1676879951337,"../../rel-type":1676879951378,"./merges":1676879951379,"../base-xform":1676879951340,"../list-xform":1676879951343,"./row-xform":1676879951380,"./col-xform":1676879951382,"./dimension-xform":1676879951383,"./hyperlink-xform":1676879951384,"./merge-cell-xform":1676879951385,"./data-validations-xform":1676879951386,"./sheet-properties-xform":1676879951387,"./sheet-format-properties-xform":1676879951390,"./sheet-view-xform":1676879951391,"./sheet-protection-xform":1676879951392,"./page-margins-xform":1676879951393,"./page-setup-xform":1676879951394,"./print-options-xform":1676879951395,"./auto-filter-xform":1676879951396,"./picture-xform":1676879951397,"./drawing-xform":1676879951398,"./table-part-xform":1676879951399,"./row-breaks-xform":1676879951400,"./header-footer-xform":1676879951402,"./cf/conditional-formattings-xform":1676879951403,"./ext-lst-xform":1676879951413}; return __REQUIRE__(map[modId], modId); })
__DEFINE__(1676879951378, function(require, module, exports) {


module.exports = {
  OfficeDocument:
    'http://schemas.openxmlformats.org/officeDocument/2006/relationships/officeDocument',
  Worksheet: 'http://schemas.openxmlformats.org/officeDocument/2006/relationships/worksheet',
  CalcChain: 'http://schemas.openxmlformats.org/officeDocument/2006/relationships/calcChain',
  SharedStrings:
    'http://schemas.openxmlformats.org/officeDocument/2006/relationships/sharedStrings',
  Styles: 'http://schemas.openxmlformats.org/officeDocument/2006/relationships/styles',
  Theme: 'http://schemas.openxmlformats.org/officeDocument/2006/relationships/theme',
  Hyperlink: 'http://schemas.openxmlformats.org/officeDocument/2006/relationships/hyperlink',
  Image: 'http://schemas.openxmlformats.org/officeDocument/2006/relationships/image',
  CoreProperties:
    'http://schemas.openxmlformats.org/package/2006/relationships/metadata/core-properties',
  ExtenderProperties:
    'http://schemas.openxmlformats.org/officeDocument/2006/relationships/extended-properties',
  Comments: 'http://schemas.openxmlformats.org/officeDocument/2006/relationships/comments',
  VmlDrawing: 'http://schemas.openxmlformats.org/officeDocument/2006/relationships/vmlDrawing',
  Table: 'http://schemas.openxmlformats.org/officeDocument/2006/relationships/table',
};

}, function(modId) { var map = {}; return __REQUIRE__(map[modId], modId); })
__DEFINE__(1676879951379, function(require, module, exports) {
const _ = require('../../../utils/under-dash');

const Range = require('../../../doc/range');
const colCache = require('../../../utils/col-cache');
const Enums = require('../../../doc/enums');

class Merges {
  constructor() {
    // optional mergeCells is array of ranges (like the xml)
    this.merges = {};
  }

  add(merge) {
    // merge is {address, master}
    if (this.merges[merge.master]) {
      this.merges[merge.master].expandToAddress(merge.address);
    } else {
      const range = `${merge.master}:${merge.address}`;
      this.merges[merge.master] = new Range(range);
    }
  }

  get mergeCells() {
    return _.map(this.merges, merge => merge.range);
  }

  reconcile(mergeCells, rows) {
    // reconcile merge list with merge cells
    _.each(mergeCells, merge => {
      const dimensions = colCache.decode(merge);
      for (let i = dimensions.top; i <= dimensions.bottom; i++) {
        const row = rows[i - 1];
        for (let j = dimensions.left; j <= dimensions.right; j++) {
          const cell = row.cells[j - 1];
          if (!cell) {
            // nulls are not included in document - so if master cell has no value - add a null one here
            row.cells[j] = {
              type: Enums.ValueType.Null,
              address: colCache.encodeAddress(i, j),
            };
          } else if (cell.type === Enums.ValueType.Merge) {
            cell.master = dimensions.tl;
          }
        }
      }
    });
  }

  getMasterAddress(address) {
    // if address has been merged, return its master's address. Assumes reconcile has been called
    const range = this.hash[address];
    return range && range.tl;
  }
}

module.exports = Merges;

}, function(modId) { var map = {"../../../utils/under-dash":1676879951315,"../../../doc/range":1676879951317,"../../../utils/col-cache":1676879951316,"../../../doc/enums":1676879951319}; return __REQUIRE__(map[modId], modId); })
__DEFINE__(1676879951380, function(require, module, exports) {
const BaseXform = require('../base-xform');

const CellXform = require('./cell-xform');

class RowXform extends BaseXform {
  constructor(options) {
    super();

    this.maxItems = options && options.maxItems;
    this.map = {
      c: new CellXform(),
    };
  }

  get tag() {
    return 'row';
  }

  prepare(model, options) {
    const styleId = options.styles.addStyleModel(model.style);
    if (styleId) {
      model.styleId = styleId;
    }
    const cellXform = this.map.c;
    model.cells.forEach(cellModel => {
      cellXform.prepare(cellModel, options);
    });
  }

  render(xmlStream, model, options) {
    xmlStream.openNode('row');
    xmlStream.addAttribute('r', model.number);
    if (model.height) {
      xmlStream.addAttribute('ht', model.height);
      xmlStream.addAttribute('customHeight', '1');
    }
    if (model.hidden) {
      xmlStream.addAttribute('hidden', '1');
    }
    if (model.min > 0 && model.max > 0 && model.min <= model.max) {
      xmlStream.addAttribute('spans', `${model.min}:${model.max}`);
    }
    if (model.styleId) {
      xmlStream.addAttribute('s', model.styleId);
      xmlStream.addAttribute('customFormat', '1');
    }
    xmlStream.addAttribute('x14ac:dyDescent', '0.25');
    if (model.outlineLevel) {
      xmlStream.addAttribute('outlineLevel', model.outlineLevel);
    }
    if (model.collapsed) {
      xmlStream.addAttribute('collapsed', '1');
    }

    const cellXform = this.map.c;
    model.cells.forEach(cellModel => {
      cellXform.render(xmlStream, cellModel, options);
    });

    xmlStream.closeNode();
  }

  parseOpen(node) {
    if (this.parser) {
      this.parser.parseOpen(node);
      return true;
    }
    if (node.name === 'row') {
      this.numRowsSeen += 1;
      const spans = node.attributes.spans
        ? node.attributes.spans.split(':').map(span => parseInt(span, 10))
        : [undefined, undefined];
      const model = (this.model = {
        number: parseInt(node.attributes.r, 10),
        min: spans[0],
        max: spans[1],
        cells: [],
      });
      if (node.attributes.s) {
        model.styleId = parseInt(node.attributes.s, 10);
      }
      if (
        node.attributes.hidden === true ||
        node.attributes.hidden === 'true' ||
        node.attributes.hidden === 1 ||
        node.attributes.hidden === '1'
      ) {
        model.hidden = true;
      }
      if (node.attributes.bestFit) {
        model.bestFit = true;
      }
      if (node.attributes.ht) {
        model.height = parseFloat(node.attributes.ht);
      }
      if (node.attributes.outlineLevel) {
        model.outlineLevel = parseInt(node.attributes.outlineLevel, 10);
      }
      if (node.attributes.collapsed) {
        model.collapsed = true;
      }
      return true;
    }

    this.parser = this.map[node.name];
    if (this.parser) {
      this.parser.parseOpen(node);
      return true;
    }
    return false;
  }

  parseText(text) {
    if (this.parser) {
      this.parser.parseText(text);
    }
  }

  parseClose(name) {
    if (this.parser) {
      if (!this.parser.parseClose(name)) {
        this.model.cells.push(this.parser.model);
        if (this.maxItems && this.model.cells.length > this.maxItems) {
          throw new Error(`Max column count (${this.maxItems}) exceeded`);
        }
        this.parser = undefined;
      }
      return true;
    }
    return false;
  }

  reconcile(model, options) {
    model.style = model.styleId ? options.styles.getStyleModel(model.styleId) : {};
    if (model.styleId !== undefined) {
      model.styleId = undefined;
    }

    const cellXform = this.map.c;
    model.cells.forEach(cellModel => {
      cellXform.reconcile(cellModel, options);
    });
  }
}

module.exports = RowXform;

}, function(modId) { var map = {"../base-xform":1676879951340,"./cell-xform":1676879951381}; return __REQUIRE__(map[modId], modId); })
__DEFINE__(1676879951381, function(require, module, exports) {
const utils = require('../../../utils/utils');
const BaseXform = require('../base-xform');
const Range = require('../../../doc/range');
const Enums = require('../../../doc/enums');

const RichTextXform = require('../strings/rich-text-xform');

function getValueType(v) {
  if (v === null || v === undefined) {
    return Enums.ValueType.Null;
  }
  if (v instanceof String || typeof v === 'string') {
    return Enums.ValueType.String;
  }
  if (typeof v === 'number') {
    return Enums.ValueType.Number;
  }
  if (typeof v === 'boolean') {
    return Enums.ValueType.Boolean;
  }
  if (v instanceof Date) {
    return Enums.ValueType.Date;
  }
  if (v.text && v.hyperlink) {
    return Enums.ValueType.Hyperlink;
  }
  if (v.formula) {
    return Enums.ValueType.Formula;
  }
  if (v.error) {
    return Enums.ValueType.Error;
  }
  throw new Error('I could not understand type of value');
}

function getEffectiveCellType(cell) {
  switch (cell.type) {
    case Enums.ValueType.Formula:
      return getValueType(cell.result);
    default:
      return cell.type;
  }
}

class CellXform extends BaseXform {
  constructor() {
    super();

    this.richTextXForm = new RichTextXform();
  }

  get tag() {
    return 'c';
  }

  prepare(model, options) {
    const styleId = options.styles.addStyleModel(model.style || {}, getEffectiveCellType(model));
    if (styleId) {
      model.styleId = styleId;
    }

    if (model.comment) {
      options.comments.push({...model.comment, ref: model.address});
    }

    switch (model.type) {
      case Enums.ValueType.String:
      case Enums.ValueType.RichText:
        if (options.sharedStrings) {
          model.ssId = options.sharedStrings.add(model.value);
        }
        break;

      case Enums.ValueType.Date:
        if (options.date1904) {
          model.date1904 = true;
        }
        break;

      case Enums.ValueType.Hyperlink:
        if (options.sharedStrings && model.text !== undefined && model.text !== null) {
          model.ssId = options.sharedStrings.add(model.text);
        }
        options.hyperlinks.push({
          address: model.address,
          target: model.hyperlink,
          tooltip: model.tooltip,
        });
        break;

      case Enums.ValueType.Merge:
        options.merges.add(model);
        break;

      case Enums.ValueType.Formula:
        if (options.date1904) {
          // in case valueType is date
          model.date1904 = true;
        }

        if (model.shareType === 'shared') {
          model.si = options.siFormulae++;
        }

        if (model.formula) {
          options.formulae[model.address] = model;
        } else if (model.sharedFormula) {
          const master = options.formulae[model.sharedFormula];
          if (!master) {
            throw new Error(
              `Shared Formula master must exist above and or left of clone for cell ${model.address}`
            );
          }
          if (master.si === undefined) {
            master.shareType = 'shared';
            master.si = options.siFormulae++;
            master.range = new Range(master.address, model.address);
          } else if (master.range) {
            master.range.expandToAddress(model.address);
          }
          model.si = master.si;
        }
        break;

      default:
        break;
    }
  }

  renderFormula(xmlStream, model) {
    let attrs = null;
    switch (model.shareType) {
      case 'shared':
        attrs = {
          t: 'shared',
          ref: model.ref || model.range.range,
          si: model.si,
        };
        break;

      case 'array':
        attrs = {
          t: 'array',
          ref: model.ref,
        };
        break;

      default:
        if (model.si !== undefined) {
          attrs = {
            t: 'shared',
            si: model.si,
          };
        }
        break;
    }

    switch (getValueType(model.result)) {
      case Enums.ValueType.Null: // ?
        xmlStream.leafNode('f', attrs, model.formula);
        break;

      case Enums.ValueType.String:
        // oddly, formula results don't ever use shared strings
        xmlStream.addAttribute('t', 'str');
        xmlStream.leafNode('f', attrs, model.formula);
        xmlStream.leafNode('v', null, model.result);
        break;

      case Enums.ValueType.Number:
        xmlStream.leafNode('f', attrs, model.formula);
        xmlStream.leafNode('v', null, model.result);
        break;

      case Enums.ValueType.Boolean:
        xmlStream.addAttribute('t', 'b');
        xmlStream.leafNode('f', attrs, model.formula);
        xmlStream.leafNode('v', null, model.result ? 1 : 0);
        break;

      case Enums.ValueType.Error:
        xmlStream.addAttribute('t', 'e');
        xmlStream.leafNode('f', attrs, model.formula);
        xmlStream.leafNode('v', null, model.result.error);
        break;

      case Enums.ValueType.Date:
        xmlStream.leafNode('f', attrs, model.formula);
        xmlStream.leafNode('v', null, utils.dateToExcel(model.result, model.date1904));
        break;

      // case Enums.ValueType.Hyperlink: // ??
      // case Enums.ValueType.Formula:
      default:
        throw new Error('I could not understand type of value');
    }
  }

  render(xmlStream, model) {
    if (model.type === Enums.ValueType.Null && !model.styleId) {
      // if null and no style, exit
      return;
    }

    xmlStream.openNode('c');
    xmlStream.addAttribute('r', model.address);

    if (model.styleId) {
      xmlStream.addAttribute('s', model.styleId);
    }

    switch (model.type) {
      case Enums.ValueType.Null:
        break;

      case Enums.ValueType.Number:
        xmlStream.leafNode('v', null, model.value);
        break;

      case Enums.ValueType.Boolean:
        xmlStream.addAttribute('t', 'b');
        xmlStream.leafNode('v', null, model.value ? '1' : '0');
        break;

      case Enums.ValueType.Error:
        xmlStream.addAttribute('t', 'e');
        xmlStream.leafNode('v', null, model.value.error);
        break;

      case Enums.ValueType.String:
      case Enums.ValueType.RichText:
        if (model.ssId !== undefined) {
          xmlStream.addAttribute('t', 's');
          xmlStream.leafNode('v', null, model.ssId);
        } else if (model.value && model.value.richText) {
          xmlStream.addAttribute('t', 'inlineStr');
          xmlStream.openNode('is');
          model.value.richText.forEach(text => {
            this.richTextXForm.render(xmlStream, text);
          });
          xmlStream.closeNode('is');
        } else {
          xmlStream.addAttribute('t', 'str');
          xmlStream.leafNode('v', null, model.value);
        }
        break;

      case Enums.ValueType.Date:
        xmlStream.leafNode('v', null, utils.dateToExcel(model.value, model.date1904));
        break;

      case Enums.ValueType.Hyperlink:
        if (model.ssId !== undefined) {
          xmlStream.addAttribute('t', 's');
          xmlStream.leafNode('v', null, model.ssId);
        } else {
          xmlStream.addAttribute('t', 'str');
          xmlStream.leafNode('v', null, model.text);
        }
        break;

      case Enums.ValueType.Formula:
        this.renderFormula(xmlStream, model);
        break;

      case Enums.ValueType.Merge:
        // nothing to add
        break;

      default:
        break;
    }

    xmlStream.closeNode(); // </c>
  }

  parseOpen(node) {
    if (this.parser) {
      this.parser.parseOpen(node);
      return true;
    }
    switch (node.name) {
      case 'c':
        // const address = colCache.decodeAddress(node.attributes.r);
        this.model = {
          address: node.attributes.r,
        };
        this.t = node.attributes.t;
        if (node.attributes.s) {
          this.model.styleId = parseInt(node.attributes.s, 10);
        }
        return true;

      case 'f':
        this.currentNode = 'f';
        this.model.si = node.attributes.si;
        this.model.shareType = node.attributes.t;
        this.model.ref = node.attributes.ref;
        return true;

      case 'v':
        this.currentNode = 'v';
        return true;

      case 't':
        this.currentNode = 't';
        return true;

      case 'r':
        this.parser = this.richTextXForm;
        this.parser.parseOpen(node);
        return true;

      default:
        return false;
    }
  }

  parseText(text) {
    if (this.parser) {
      this.parser.parseText(text);
      return;
    }
    switch (this.currentNode) {
      case 'f':
        this.model.formula = this.model.formula ? this.model.formula + text : text;
        break;
      case 'v':
      case 't':
        if (this.model.value && this.model.value.richText) {
          this.model.value.richText.text = this.model.value.richText.text
            ? this.model.value.richText.text + text
            : text;
        } else {
          this.model.value = this.model.value ? this.model.value + text : text;
        }
        break;
      default:
        break;
    }
  }

  parseClose(name) {
    switch (name) {
      case 'c': {
        const {model} = this;

        // first guess on cell type
        if (model.formula || model.shareType) {
          model.type = Enums.ValueType.Formula;
          if (model.value) {
            if (this.t === 'str') {
              model.result = utils.xmlDecode(model.value);
            } else if (this.t === 'b') {
              model.result = parseInt(model.value, 10) !== 0;
            } else if (this.t === 'e') {
              model.result = {error: model.value};
            } else {
              model.result = parseFloat(model.value);
            }
            model.value = undefined;
          }
        } else if (model.value !== undefined) {
          switch (this.t) {
            case 's':
              model.type = Enums.ValueType.String;
              model.value = parseInt(model.value, 10);
              break;
            case 'str':
              model.type = Enums.ValueType.String;
              model.value = utils.xmlDecode(model.value);
              break;
            case 'inlineStr':
              model.type = Enums.ValueType.String;
              break;
            case 'b':
              model.type = Enums.ValueType.Boolean;
              model.value = parseInt(model.value, 10) !== 0;
              break;
            case 'e':
              model.type = Enums.ValueType.Error;
              model.value = {error: model.value};
              break;
            default:
              model.type = Enums.ValueType.Number;
              model.value = parseFloat(model.value);
              break;
          }
        } else if (model.styleId) {
          model.type = Enums.ValueType.Null;
        } else {
          model.type = Enums.ValueType.Merge;
        }
        return false;
      }

      case 'f':
      case 'v':
      case 'is':
        this.currentNode = undefined;
        return true;

      case 't':
        if (this.parser) {
          this.parser.parseClose(name);
          return true;
        }
        this.currentNode = undefined;
        return true;

      case 'r':
        this.model.value = this.model.value || {};
        this.model.value.richText = this.model.value.richText || [];
        this.model.value.richText.push(this.parser.model);
        this.parser = undefined;
        this.currentNode = undefined;
        return true;

      default:
        if (this.parser) {
          this.parser.parseClose(name);
          return true;
        }
        return false;
    }
  }

  reconcile(model, options) {
    const style = model.styleId && options.styles && options.styles.getStyleModel(model.styleId);
    if (style) {
      model.style = style;
    }
    if (model.styleId !== undefined) {
      model.styleId = undefined;
    }

    switch (model.type) {
      case Enums.ValueType.String:
        if (typeof model.value === 'number') {
          if (options.sharedStrings) {
            model.value = options.sharedStrings.getString(model.value);
          }
        }
        if (model.value.richText) {
          model.type = Enums.ValueType.RichText;
        }
        break;

      case Enums.ValueType.Number:
        if (style && utils.isDateFmt(style.numFmt)) {
          model.type = Enums.ValueType.Date;
          model.value = utils.excelToDate(model.value, options.date1904);
        }
        break;

      case Enums.ValueType.Formula:
        if (model.result !== undefined && style && utils.isDateFmt(style.numFmt)) {
          model.result = utils.excelToDate(model.result, options.date1904);
        }
        if (model.shareType === 'shared') {
          if (model.ref) {
            // master
            options.formulae[model.si] = model.address;
          } else {
            // slave
            model.sharedFormula = options.formulae[model.si];
            delete model.shareType;
          }
          delete model.si;
        }
        break;

      default:
        break;
    }

    // look for hyperlink
    const hyperlink = options.hyperlinkMap[model.address];
    if (hyperlink) {
      if (model.type === Enums.ValueType.Formula) {
        model.text = model.result;
        model.result = undefined;
      } else {
        model.text = model.value;
        model.value = undefined;
      }
      model.type = Enums.ValueType.Hyperlink;
      model.hyperlink = hyperlink;
    }

    const comment = options.commentsMap && options.commentsMap[model.address];
    if (comment) {
      model.comment = comment;
    }
  }
}

module.exports = CellXform;

}, function(modId) { var map = {"../../../utils/utils":1676879951334,"../base-xform":1676879951340,"../../../doc/range":1676879951317,"../../../doc/enums":1676879951319,"../strings/rich-text-xform":1676879951363}; return __REQUIRE__(map[modId], modId); })
__DEFINE__(1676879951382, function(require, module, exports) {
const BaseXform = require('../base-xform');

class ColXform extends BaseXform {
  get tag() {
    return 'col';
  }

  prepare(model, options) {
    const styleId = options.styles.addStyleModel(model.style || {});
    if (styleId) {
      model.styleId = styleId;
    }
  }

  render(xmlStream, model) {
    xmlStream.openNode('col');
    xmlStream.addAttribute('min', model.min);
    xmlStream.addAttribute('max', model.max);
    if (model.width) {
      xmlStream.addAttribute('width', model.width);
    }
    if (model.styleId) {
      xmlStream.addAttribute('style', model.styleId);
    }
    if (model.hidden) {
      xmlStream.addAttribute('hidden', '1');
    }
    if (model.bestFit) {
      xmlStream.addAttribute('bestFit', '1');
    }
    if (model.outlineLevel) {
      xmlStream.addAttribute('outlineLevel', model.outlineLevel);
    }
    if (model.collapsed) {
      xmlStream.addAttribute('collapsed', '1');
    }
    xmlStream.addAttribute('customWidth', '1');
    xmlStream.closeNode();
  }

  parseOpen(node) {
    if (node.name === 'col') {
      const model = (this.model = {
        min: parseInt(node.attributes.min || '0', 10),
        max: parseInt(node.attributes.max || '0', 10),
        width:
          node.attributes.width === undefined
            ? undefined
            : parseFloat(node.attributes.width || '0'),
      });
      if (node.attributes.style) {
        model.styleId = parseInt(node.attributes.style, 10);
      }
      if (
        node.attributes.hidden === true ||
        node.attributes.hidden === 'true' ||
        node.attributes.hidden === 1 ||
        node.attributes.hidden === '1'
      ) {
        model.hidden = true;
      }
      if (node.attributes.bestFit) {
        model.bestFit = true;
      }
      if (node.attributes.outlineLevel) {
        model.outlineLevel = parseInt(node.attributes.outlineLevel, 10);
      }
      if (node.attributes.collapsed) {
        model.collapsed = true;
      }
      return true;
    }
    return false;
  }

  parseText() {}

  parseClose() {
    return false;
  }

  reconcile(model, options) {
    // reconcile column styles
    if (model.styleId) {
      model.style = options.styles.getStyleModel(model.styleId);
    }
  }
}

module.exports = ColXform;

}, function(modId) { var map = {"../base-xform":1676879951340}; return __REQUIRE__(map[modId], modId); })
__DEFINE__(1676879951383, function(require, module, exports) {
const BaseXform = require('../base-xform');

class DimensionXform extends BaseXform {
  get tag() {
    return 'dimension';
  }

  render(xmlStream, model) {
    if (model) {
      xmlStream.leafNode('dimension', {ref: model});
    }
  }

  parseOpen(node) {
    if (node.name === 'dimension') {
      this.model = node.attributes.ref;
      return true;
    }
    return false;
  }

  parseText() {}

  parseClose() {
    return false;
  }
}

module.exports = DimensionXform;

}, function(modId) { var map = {"../base-xform":1676879951340}; return __REQUIRE__(map[modId], modId); })
__DEFINE__(1676879951384, function(require, module, exports) {
const BaseXform = require('../base-xform');

class HyperlinkXform extends BaseXform {
  get tag() {
    return 'hyperlink';
  }

  render(xmlStream, model) {
    xmlStream.leafNode('hyperlink', {
      ref: model.address,
      'r:id': model.rId,
      tooltip: model.tooltip,
    });
  }

  parseOpen(node) {
    if (node.name === 'hyperlink') {
      this.model = {
        address: node.attributes.ref,
        rId: node.attributes['r:id'],
        tooltip: node.attributes.tooltip,
      };
      return true;
    }
    return false;
  }

  parseText() {}

  parseClose() {
    return false;
  }
}

module.exports = HyperlinkXform;

}, function(modId) { var map = {"../base-xform":1676879951340}; return __REQUIRE__(map[modId], modId); })
__DEFINE__(1676879951385, function(require, module, exports) {
const BaseXform = require('../base-xform');

class MergeCellXform extends BaseXform {
  get tag() {
    return 'mergeCell';
  }

  render(xmlStream, model) {
    xmlStream.leafNode('mergeCell', {ref: model});
  }

  parseOpen(node) {
    if (node.name === 'mergeCell') {
      this.model = node.attributes.ref;
      return true;
    }
    return false;
  }

  parseText() {}

  parseClose() {
    return false;
  }
}

module.exports = MergeCellXform;

}, function(modId) { var map = {"../base-xform":1676879951340}; return __REQUIRE__(map[modId], modId); })
__DEFINE__(1676879951386, function(require, module, exports) {
const _ = require('../../../utils/under-dash');
const utils = require('../../../utils/utils');
const colCache = require('../../../utils/col-cache');
const BaseXform = require('../base-xform');
const Range = require('../../../doc/range');

function assign(definedName, attributes, name, defaultValue) {
  const value = attributes[name];
  if (value !== undefined) {
    definedName[name] = value;
  } else if (defaultValue !== undefined) {
    definedName[name] = defaultValue;
  }
}
function parseBool(value) {
  switch (value) {
    case '1':
    case 'true':
      return true;
    default:
      return false;
  }
}
function assignBool(definedName, attributes, name, defaultValue) {
  const value = attributes[name];
  if (value !== undefined) {
    definedName[name] = parseBool(value);
  } else if (defaultValue !== undefined) {
    definedName[name] = defaultValue;
  }
}

function optimiseDataValidations(model) {
  // Squeeze alike data validations together into rectangular ranges
  // to reduce file size and speed up Excel load time
  const dvList = _.map(model, (dataValidation, address) => ({
    address,
    dataValidation,
    marked: false,
  })).sort((a, b) => _.strcmp(a.address, b.address));
  const dvMap = _.keyBy(dvList, 'address');
  const matchCol = (addr, height, col) => {
    for (let i = 0; i < height; i++) {
      const otherAddress = colCache.encodeAddress(addr.row + i, col);
      if (!model[otherAddress] || !_.isEqual(model[addr.address], model[otherAddress])) {
        return false;
      }
    }
    return true;
  };
  return dvList
    .map(dv => {
      if (!dv.marked) {
        const addr = colCache.decodeEx(dv.address);
        if (addr.dimensions) {
          dvMap[addr.dimensions].marked = true;
          return {
            ...dv.dataValidation,
            sqref: dv.address,
          };
        }

        // iterate downwards - finding matching cells
        let height = 1;
        let otherAddress = colCache.encodeAddress(addr.row + height, addr.col);
        while (model[otherAddress] && _.isEqual(dv.dataValidation, model[otherAddress])) {
          height++;
          otherAddress = colCache.encodeAddress(addr.row + height, addr.col);
        }

        // iterate rightwards...

        let width = 1;
        while (matchCol(addr, height, addr.col + width)) {
          width++;
        }

        // mark all included addresses
        for (let i = 0; i < height; i++) {
          for (let j = 0; j < width; j++) {
            otherAddress = colCache.encodeAddress(addr.row + i, addr.col + j);
            dvMap[otherAddress].marked = true;
          }
        }

        if (height > 1 || width > 1) {
          const bottom = addr.row + (height - 1);
          const right = addr.col + (width - 1);
          return {
            ...dv.dataValidation,
            sqref: `${dv.address}:${colCache.encodeAddress(bottom, right)}`,
          };
        }
        return {
          ...dv.dataValidation,
          sqref: dv.address,
        };
      }
      return null;
    })
    .filter(Boolean);
}

class DataValidationsXform extends BaseXform {
  get tag() {
    return 'dataValidations';
  }

  render(xmlStream, model) {
    const optimizedModel = optimiseDataValidations(model);
    if (optimizedModel.length) {
      xmlStream.openNode('dataValidations', {count: optimizedModel.length});

      optimizedModel.forEach(value => {
        xmlStream.openNode('dataValidation');

        if (value.type !== 'any') {
          xmlStream.addAttribute('type', value.type);

          if (value.operator && value.type !== 'list' && value.operator !== 'between') {
            xmlStream.addAttribute('operator', value.operator);
          }
          if (value.allowBlank) {
            xmlStream.addAttribute('allowBlank', '1');
          }
        }
        if (value.showInputMessage) {
          xmlStream.addAttribute('showInputMessage', '1');
        }
        if (value.promptTitle) {
          xmlStream.addAttribute('promptTitle', value.promptTitle);
        }
        if (value.prompt) {
          xmlStream.addAttribute('prompt', value.prompt);
        }
        if (value.showErrorMessage) {
          xmlStream.addAttribute('showErrorMessage', '1');
        }
        if (value.errorStyle) {
          xmlStream.addAttribute('errorStyle', value.errorStyle);
        }
        if (value.errorTitle) {
          xmlStream.addAttribute('errorTitle', value.errorTitle);
        }
        if (value.error) {
          xmlStream.addAttribute('error', value.error);
        }
        xmlStream.addAttribute('sqref', value.sqref);
        (value.formulae || []).forEach((formula, index) => {
          xmlStream.openNode(`formula${index + 1}`);
          if (value.type === 'date') {
            xmlStream.writeText(utils.dateToExcel(new Date(formula)));
          } else {
            xmlStream.writeText(formula);
          }
          xmlStream.closeNode();
        });
        xmlStream.closeNode();
      });
      xmlStream.closeNode();
    }
  }

  parseOpen(node) {
    switch (node.name) {
      case 'dataValidations':
        this.model = {};
        return true;

      case 'dataValidation': {
        this._address = node.attributes.sqref;
        const dataValidation = {type: node.attributes.type || 'any', formulae: []};

        if (node.attributes.type) {
          assignBool(dataValidation, node.attributes, 'allowBlank');
        }
        assignBool(dataValidation, node.attributes, 'showInputMessage');
        assignBool(dataValidation, node.attributes, 'showErrorMessage');

        switch (dataValidation.type) {
          case 'any':
          case 'list':
          case 'custom':
            break;
          default:
            assign(dataValidation, node.attributes, 'operator', 'between');
            break;
        }
        assign(dataValidation, node.attributes, 'promptTitle');
        assign(dataValidation, node.attributes, 'prompt');
        assign(dataValidation, node.attributes, 'errorStyle');
        assign(dataValidation, node.attributes, 'errorTitle');
        assign(dataValidation, node.attributes, 'error');

        this._dataValidation = dataValidation;
        return true;
      }

      case 'formula1':
      case 'formula2':
        this._formula = [];
        return true;

      default:
        return false;
    }
  }

  parseText(text) {
    if (this._formula) {
      this._formula.push(text);
    }
  }

  parseClose(name) {
    switch (name) {
      case 'dataValidations':
        return false;
      case 'dataValidation': {
        if (!this._dataValidation.formulae || !this._dataValidation.formulae.length) {
          delete this._dataValidation.formulae;
          delete this._dataValidation.operator;
        }
        // The four known cases: 1. E4:L9 N4:U9  2.E4 L9  3. N4:U9  4. E4
        const list = this._address.split(/\s+/g) || [];
        list.forEach(addr => {
          if (addr.includes(':')) {
            const range = new Range(addr);
            range.forEachAddress(address => {
              this.model[address] = this._dataValidation;
            });
          } else {
            this.model[addr] = this._dataValidation;
          }
        });
        return true;
      }
      case 'formula1':
      case 'formula2': {
        let formula = this._formula.join('');
        switch (this._dataValidation.type) {
          case 'whole':
          case 'textLength':
            formula = parseInt(formula, 10);
            break;
          case 'decimal':
            formula = parseFloat(formula);
            break;
          case 'date':
            formula = utils.excelToDate(parseFloat(formula));
            break;
          default:
            break;
        }
        this._dataValidation.formulae.push(formula);
        this._formula = undefined;
        return true;
      }
      default:
        return true;
    }
  }
}

module.exports = DataValidationsXform;

}, function(modId) { var map = {"../../../utils/under-dash":1676879951315,"../../../utils/utils":1676879951334,"../../../utils/col-cache":1676879951316,"../base-xform":1676879951340,"../../../doc/range":1676879951317}; return __REQUIRE__(map[modId], modId); })
__DEFINE__(1676879951387, function(require, module, exports) {
const BaseXform = require('../base-xform');
const ColorXform = require('../style/color-xform');
const PageSetupPropertiesXform = require('./page-setup-properties-xform');
const OutlinePropertiesXform = require('./outline-properties-xform');

class SheetPropertiesXform extends BaseXform {
  constructor() {
    super();

    this.map = {
      tabColor: new ColorXform('tabColor'),
      pageSetUpPr: new PageSetupPropertiesXform(),
      outlinePr: new OutlinePropertiesXform(),
    };
  }

  get tag() {
    return 'sheetPr';
  }

  render(xmlStream, model) {
    if (model) {
      xmlStream.addRollback();
      xmlStream.openNode('sheetPr');

      let inner = false;
      inner = this.map.tabColor.render(xmlStream, model.tabColor) || inner;
      inner = this.map.pageSetUpPr.render(xmlStream, model.pageSetup) || inner;
      inner = this.map.outlinePr.render(xmlStream, model.outlineProperties) || inner;

      if (inner) {
        xmlStream.closeNode();
        xmlStream.commit();
      } else {
        xmlStream.rollback();
      }
    }
  }

  parseOpen(node) {
    if (this.parser) {
      this.parser.parseOpen(node);
      return true;
    }
    if (node.name === this.tag) {
      this.reset();
      return true;
    }
    if (this.map[node.name]) {
      this.parser = this.map[node.name];
      this.parser.parseOpen(node);
      return true;
    }
    return false;
  }

  parseText(text) {
    if (this.parser) {
      this.parser.parseText(text);
      return true;
    }
    return false;
  }

  parseClose(name) {
    if (this.parser) {
      if (!this.parser.parseClose(name)) {
        this.parser = undefined;
      }
      return true;
    }
    if (this.map.tabColor.model || this.map.pageSetUpPr.model || this.map.outlinePr.model) {
      this.model = {};
      if (this.map.tabColor.model) {
        this.model.tabColor = this.map.tabColor.model;
      }
      if (this.map.pageSetUpPr.model) {
        this.model.pageSetup = this.map.pageSetUpPr.model;
      }
      if (this.map.outlinePr.model) {
        this.model.outlineProperties = this.map.outlinePr.model;
      }
    } else {
      this.model = null;
    }
    return false;
  }
}

module.exports = SheetPropertiesXform;

}, function(modId) { var map = {"../base-xform":1676879951340,"../style/color-xform":1676879951345,"./page-setup-properties-xform":1676879951388,"./outline-properties-xform":1676879951389}; return __REQUIRE__(map[modId], modId); })
__DEFINE__(1676879951388, function(require, module, exports) {
const BaseXform = require('../base-xform');

class PageSetupPropertiesXform extends BaseXform {
  get tag() {
    return 'pageSetUpPr';
  }

  render(xmlStream, model) {
    if (model && model.fitToPage) {
      xmlStream.leafNode(this.tag, {
        fitToPage: model.fitToPage ? '1' : undefined,
      });
      return true;
    }
    return false;
  }

  parseOpen(node) {
    if (node.name === this.tag) {
      this.model = {
        fitToPage: node.attributes.fitToPage === '1',
      };
      return true;
    }
    return false;
  }

  parseText() {}

  parseClose() {
    return false;
  }
}

module.exports = PageSetupPropertiesXform;

}, function(modId) { var map = {"../base-xform":1676879951340}; return __REQUIRE__(map[modId], modId); })
__DEFINE__(1676879951389, function(require, module, exports) {
const BaseXform = require('../base-xform');

const isDefined = attr => typeof attr !== 'undefined';

class OutlinePropertiesXform extends BaseXform {
  get tag() {
    return 'outlinePr';
  }

  render(xmlStream, model) {
    if (model && (isDefined(model.summaryBelow) || isDefined(model.summaryRight))) {
      xmlStream.leafNode(this.tag, {
        summaryBelow: isDefined(model.summaryBelow) ? Number(model.summaryBelow) : undefined,
        summaryRight: isDefined(model.summaryRight) ? Number(model.summaryRight) : undefined,
      });
      return true;
    }
    return false;
  }

  parseOpen(node) {
    if (node.name === this.tag) {
      this.model = {
        summaryBelow: isDefined(node.attributes.summaryBelow)
          ? Boolean(Number(node.attributes.summaryBelow))
          : undefined,
        summaryRight: isDefined(node.attributes.summaryRight)
          ? Boolean(Number(node.attributes.summaryRight))
          : undefined,
      };
      return true;
    }
    return false;
  }

  parseText() {}

  parseClose() {
    return false;
  }
}

module.exports = OutlinePropertiesXform;

}, function(modId) { var map = {"../base-xform":1676879951340}; return __REQUIRE__(map[modId], modId); })
__DEFINE__(1676879951390, function(require, module, exports) {
const _ = require('../../../utils/under-dash');
const BaseXform = require('../base-xform');

class SheetFormatPropertiesXform extends BaseXform {
  get tag() {
    return 'sheetFormatPr';
  }

  render(xmlStream, model) {
    if (model) {
      const attributes = {
        defaultRowHeight: model.defaultRowHeight,
        outlineLevelRow: model.outlineLevelRow,
        outlineLevelCol: model.outlineLevelCol,
        'x14ac:dyDescent': model.dyDescent,
      };
      if (model.defaultColWidth) {
        attributes.defaultColWidth = model.defaultColWidth;
      }

      // default value for 'defaultRowHeight' is 15, this should not be 'custom'
      if (!model.defaultRowHeight || model.defaultRowHeight !== 15) {
        attributes.customHeight = '1';
      }

      if (_.some(attributes, value => value !== undefined)) {
        xmlStream.leafNode('sheetFormatPr', attributes);
      }
    }
  }

  parseOpen(node) {
    if (node.name === 'sheetFormatPr') {
      this.model = {
        defaultRowHeight: parseFloat(node.attributes.defaultRowHeight || '0'),
        dyDescent: parseFloat(node.attributes['x14ac:dyDescent'] || '0'),
        outlineLevelRow: parseInt(node.attributes.outlineLevelRow || '0', 10),
        outlineLevelCol: parseInt(node.attributes.outlineLevelCol || '0', 10),
      };
      if (node.attributes.defaultColWidth) {
        this.model.defaultColWidth = parseFloat(node.attributes.defaultColWidth);
      }
      return true;
    }
    return false;
  }

  parseText() {}

  parseClose() {
    return false;
  }
}

module.exports = SheetFormatPropertiesXform;

}, function(modId) { var map = {"../../../utils/under-dash":1676879951315,"../base-xform":1676879951340}; return __REQUIRE__(map[modId], modId); })
__DEFINE__(1676879951391, function(require, module, exports) {
const colCache = require('../../../utils/col-cache');
const BaseXform = require('../base-xform');

const VIEW_STATES = {
  frozen: 'frozen',
  frozenSplit: 'frozen',
  split: 'split',
};

class SheetViewXform extends BaseXform {
  get tag() {
    return 'sheetView';
  }

  prepare(model) {
    switch (model.state) {
      case 'frozen':
      case 'split':
        break;
      default:
        model.state = 'normal';
        break;
    }
  }

  render(xmlStream, model) {
    xmlStream.openNode('sheetView', {
      workbookViewId: model.workbookViewId || 0,
    });
    const add = function(name, value, included) {
      if (included) {
        xmlStream.addAttribute(name, value);
      }
    };
    add('rightToLeft', '1', model.rightToLeft === true);
    add('tabSelected', '1', model.tabSelected);
    add('showRuler', '0', model.showRuler === false);
    add('showRowColHeaders', '0', model.showRowColHeaders === false);
    add('showGridLines', '0', model.showGridLines === false);
    add('zoomScale', model.zoomScale, model.zoomScale);
    add('zoomScaleNormal', model.zoomScaleNormal, model.zoomScaleNormal);
    add('view', model.style, model.style);

    let topLeftCell;
    let xSplit;
    let ySplit;
    let activePane;
    switch (model.state) {
      case 'frozen':
        xSplit = model.xSplit || 0;
        ySplit = model.ySplit || 0;
        topLeftCell = model.topLeftCell || colCache.getAddress(ySplit + 1, xSplit + 1).address;
        activePane =
          (model.xSplit && model.ySplit && 'bottomRight') ||
          (model.xSplit && 'topRight') ||
          'bottomLeft';

        xmlStream.leafNode('pane', {
          xSplit: model.xSplit || undefined,
          ySplit: model.ySplit || undefined,
          topLeftCell,
          activePane,
          state: 'frozen',
        });
        xmlStream.leafNode('selection', {
          pane: activePane,
          activeCell: model.activeCell,
          sqref: model.activeCell,
        });
        break;
      case 'split':
        if (model.activePane === 'topLeft') {
          model.activePane = undefined;
        }
        xmlStream.leafNode('pane', {
          xSplit: model.xSplit || undefined,
          ySplit: model.ySplit || undefined,
          topLeftCell: model.topLeftCell,
          activePane: model.activePane,
        });
        xmlStream.leafNode('selection', {
          pane: model.activePane,
          activeCell: model.activeCell,
          sqref: model.activeCell,
        });
        break;
      case 'normal':
        if (model.activeCell) {
          xmlStream.leafNode('selection', {
            activeCell: model.activeCell,
            sqref: model.activeCell,
          });
        }
        break;
      default:
        break;
    }
    xmlStream.closeNode();
  }

  parseOpen(node) {
    switch (node.name) {
      case 'sheetView':
        this.sheetView = {
          workbookViewId: parseInt(node.attributes.workbookViewId, 10),
          rightToLeft: node.attributes.rightToLeft === '1',
          tabSelected: node.attributes.tabSelected === '1',
          showRuler: !(node.attributes.showRuler === '0'),
          showRowColHeaders: !(node.attributes.showRowColHeaders === '0'),
          showGridLines: !(node.attributes.showGridLines === '0'),
          zoomScale: parseInt(node.attributes.zoomScale || '100', 10),
          zoomScaleNormal: parseInt(node.attributes.zoomScaleNormal || '100', 10),
          style: node.attributes.view,
        };
        this.pane = undefined;
        this.selections = {};
        return true;

      case 'pane':
        this.pane = {
          xSplit: parseInt(node.attributes.xSplit || '0', 10),
          ySplit: parseInt(node.attributes.ySplit || '0', 10),
          topLeftCell: node.attributes.topLeftCell,
          activePane: node.attributes.activePane || 'topLeft',
          state: node.attributes.state,
        };
        return true;

      case 'selection': {
        const name = node.attributes.pane || 'topLeft';
        this.selections[name] = {
          pane: name,
          activeCell: node.attributes.activeCell,
        };
        return true;
      }

      default:
        return false;
    }
  }

  parseText() {}

  parseClose(name) {
    let model;
    let selection;
    switch (name) {
      case 'sheetView':
        if (this.sheetView && this.pane) {
          model = this.model = {
            workbookViewId: this.sheetView.workbookViewId,
            rightToLeft: this.sheetView.rightToLeft,
            state: VIEW_STATES[this.pane.state] || 'split', // split is default
            xSplit: this.pane.xSplit,
            ySplit: this.pane.ySplit,
            topLeftCell: this.pane.topLeftCell,
            showRuler: this.sheetView.showRuler,
            showRowColHeaders: this.sheetView.showRowColHeaders,
            showGridLines: this.sheetView.showGridLines,
            zoomScale: this.sheetView.zoomScale,
            zoomScaleNormal: this.sheetView.zoomScaleNormal,
          };
          if (this.model.state === 'split') {
            model.activePane = this.pane.activePane;
          }
          selection = this.selections[this.pane.activePane];
          if (selection && selection.activeCell) {
            model.activeCell = selection.activeCell;
          }
          if (this.sheetView.style) {
            model.style = this.sheetView.style;
          }
        } else {
          model = this.model = {
            workbookViewId: this.sheetView.workbookViewId,
            rightToLeft: this.sheetView.rightToLeft,
            state: 'normal',
            showRuler: this.sheetView.showRuler,
            showRowColHeaders: this.sheetView.showRowColHeaders,
            showGridLines: this.sheetView.showGridLines,
            zoomScale: this.sheetView.zoomScale,
            zoomScaleNormal: this.sheetView.zoomScaleNormal,
          };
          selection = this.selections.topLeft;
          if (selection && selection.activeCell) {
            model.activeCell = selection.activeCell;
          }
          if (this.sheetView.style) {
            model.style = this.sheetView.style;
          }
        }
        return false;
      default:
        return true;
    }
  }

  reconcile() {}
}

module.exports = SheetViewXform;

}, function(modId) { var map = {"../../../utils/col-cache":1676879951316,"../base-xform":1676879951340}; return __REQUIRE__(map[modId], modId); })
__DEFINE__(1676879951392, function(require, module, exports) {
const _ = require('../../../utils/under-dash');
const BaseXform = require('../base-xform');

function booleanToXml(model, value) {
  return model ? value : undefined;
}

function xmlToBoolean(value, equals) {
  return value === equals ? true : undefined;
}

class SheetProtectionXform extends BaseXform {
  get tag() {
    return 'sheetProtection';
  }

  render(xmlStream, model) {
    if (model) {
      const attributes = {
        sheet: booleanToXml(model.sheet, '1'),
        selectLockedCells: model.selectLockedCells === false ? '1' : undefined,
        selectUnlockedCells: model.selectUnlockedCells === false ? '1' : undefined,
        formatCells: booleanToXml(model.formatCells, '0'),
        formatColumns: booleanToXml(model.formatColumns, '0'),
        formatRows: booleanToXml(model.formatRows, '0'),
        insertColumns: booleanToXml(model.insertColumns, '0'),
        insertRows: booleanToXml(model.insertRows, '0'),
        insertHyperlinks: booleanToXml(model.insertHyperlinks, '0'),
        deleteColumns: booleanToXml(model.deleteColumns, '0'),
        deleteRows: booleanToXml(model.deleteRows, '0'),
        sort: booleanToXml(model.sort, '0'),
        autoFilter: booleanToXml(model.autoFilter, '0'),
        pivotTables: booleanToXml(model.pivotTables, '0'),
      };
      if (model.sheet) {
        attributes.algorithmName = model.algorithmName;
        attributes.hashValue = model.hashValue;
        attributes.saltValue = model.saltValue;
        attributes.spinCount = model.spinCount;
        attributes.objects = booleanToXml(model.objects === false, '1');
        attributes.scenarios = booleanToXml(model.scenarios === false, '1');
      }
      if (_.some(attributes, value => value !== undefined)) {
        xmlStream.leafNode(this.tag, attributes);
      }
    }
  }

  parseOpen(node) {
    switch (node.name) {
      case this.tag:
        this.model = {
          sheet: xmlToBoolean(node.attributes.sheet, '1'),
          objects: node.attributes.objects === '1' ? false : undefined,
          scenarios: node.attributes.scenarios === '1' ? false : undefined,
          selectLockedCells: node.attributes.selectLockedCells === '1' ? false : undefined,
          selectUnlockedCells: node.attributes.selectUnlockedCells === '1' ? false : undefined,
          formatCells: xmlToBoolean(node.attributes.formatCells, '0'),
          formatColumns: xmlToBoolean(node.attributes.formatColumns, '0'),
          formatRows: xmlToBoolean(node.attributes.formatRows, '0'),
          insertColumns: xmlToBoolean(node.attributes.insertColumns, '0'),
          insertRows: xmlToBoolean(node.attributes.insertRows, '0'),
          insertHyperlinks: xmlToBoolean(node.attributes.insertHyperlinks, '0'),
          deleteColumns: xmlToBoolean(node.attributes.deleteColumns, '0'),
          deleteRows: xmlToBoolean(node.attributes.deleteRows, '0'),
          sort: xmlToBoolean(node.attributes.sort, '0'),
          autoFilter: xmlToBoolean(node.attributes.autoFilter, '0'),
          pivotTables: xmlToBoolean(node.attributes.pivotTables, '0'),
        };
        if (node.attributes.algorithmName) {
          this.model.algorithmName = node.attributes.algorithmName;
          this.model.hashValue = node.attributes.hashValue;
          this.model.saltValue = node.attributes.saltValue;
          this.model.spinCount = parseInt(node.attributes.spinCount, 10);
        }
        return true;
      default:
        return false;
    }
  }

  parseText() {}

  parseClose() {
    return false;
  }
}

module.exports = SheetProtectionXform;

}, function(modId) { var map = {"../../../utils/under-dash":1676879951315,"../base-xform":1676879951340}; return __REQUIRE__(map[modId], modId); })
__DEFINE__(1676879951393, function(require, module, exports) {
const _ = require('../../../utils/under-dash');
const BaseXform = require('../base-xform');

class PageMarginsXform extends BaseXform {
  get tag() {
    return 'pageMargins';
  }

  render(xmlStream, model) {
    if (model) {
      const attributes = {
        left: model.left,
        right: model.right,
        top: model.top,
        bottom: model.bottom,
        header: model.header,
        footer: model.footer,
      };
      if (_.some(attributes, value => value !== undefined)) {
        xmlStream.leafNode(this.tag, attributes);
      }
    }
  }

  parseOpen(node) {
    switch (node.name) {
      case this.tag:
        this.model = {
          left: parseFloat(node.attributes.left || 0.7),
          right: parseFloat(node.attributes.right || 0.7),
          top: parseFloat(node.attributes.top || 0.75),
          bottom: parseFloat(node.attributes.bottom || 0.75),
          header: parseFloat(node.attributes.header || 0.3),
          footer: parseFloat(node.attributes.footer || 0.3),
        };
        return true;
      default:
        return false;
    }
  }

  parseText() {}

  parseClose() {
    return false;
  }
}

module.exports = PageMarginsXform;

}, function(modId) { var map = {"../../../utils/under-dash":1676879951315,"../base-xform":1676879951340}; return __REQUIRE__(map[modId], modId); })
__DEFINE__(1676879951394, function(require, module, exports) {
const _ = require('../../../utils/under-dash');
const BaseXform = require('../base-xform');

function booleanToXml(model) {
  return model ? '1' : undefined;
}
function pageOrderToXml(model) {
  switch (model) {
    case 'overThenDown':
      return model;
    default:
      return undefined;
  }
}
function cellCommentsToXml(model) {
  switch (model) {
    case 'atEnd':
    case 'asDisplyed':
      return model;
    default:
      return undefined;
  }
}
function errorsToXml(model) {
  switch (model) {
    case 'dash':
    case 'blank':
    case 'NA':
      return model;
    default:
      return undefined;
  }
}
function pageSizeToModel(value) {
  return value !== undefined ? parseInt(value, 10) : undefined;
}

class PageSetupXform extends BaseXform {
  get tag() {
    return 'pageSetup';
  }

  render(xmlStream, model) {
    if (model) {
      const attributes = {
        paperSize: model.paperSize,
        orientation: model.orientation,
        horizontalDpi: model.horizontalDpi,
        verticalDpi: model.verticalDpi,
        pageOrder: pageOrderToXml(model.pageOrder),
        blackAndWhite: booleanToXml(model.blackAndWhite),
        draft: booleanToXml(model.draft),
        cellComments: cellCommentsToXml(model.cellComments),
        errors: errorsToXml(model.errors),
        scale: model.scale,
        fitToWidth: model.fitToWidth,
        fitToHeight: model.fitToHeight,
        firstPageNumber: model.firstPageNumber,
        useFirstPageNumber: booleanToXml(model.firstPageNumber),
        usePrinterDefaults: booleanToXml(model.usePrinterDefaults),
        copies: model.copies,
      };
      if (_.some(attributes, value => value !== undefined)) {
        xmlStream.leafNode(this.tag, attributes);
      }
    }
  }

  parseOpen(node) {
    switch (node.name) {
      case this.tag:
        this.model = {
          paperSize: pageSizeToModel(node.attributes.paperSize),
          orientation: node.attributes.orientation || 'portrait',
          horizontalDpi: parseInt(node.attributes.horizontalDpi || '4294967295', 10),
          verticalDpi: parseInt(node.attributes.verticalDpi || '4294967295', 10),
          pageOrder: node.attributes.pageOrder || 'downThenOver',
          blackAndWhite: node.attributes.blackAndWhite === '1',
          draft: node.attributes.draft === '1',
          cellComments: node.attributes.cellComments || 'None',
          errors: node.attributes.errors || 'displayed',
          scale: parseInt(node.attributes.scale || '100', 10),
          fitToWidth: parseInt(node.attributes.fitToWidth || '1', 10),
          fitToHeight: parseInt(node.attributes.fitToHeight || '1', 10),
          firstPageNumber: parseInt(node.attributes.firstPageNumber || '1', 10),
          useFirstPageNumber: node.attributes.useFirstPageNumber === '1',
          usePrinterDefaults: node.attributes.usePrinterDefaults === '1',
          copies: parseInt(node.attributes.copies || '1', 10),
        };
        return true;
      default:
        return false;
    }
  }

  parseText() {}

  parseClose() {
    return false;
  }
}

module.exports = PageSetupXform;

}, function(modId) { var map = {"../../../utils/under-dash":1676879951315,"../base-xform":1676879951340}; return __REQUIRE__(map[modId], modId); })
__DEFINE__(1676879951395, function(require, module, exports) {
const _ = require('../../../utils/under-dash');
const BaseXform = require('../base-xform');

function booleanToXml(model) {
  return model ? '1' : undefined;
}

class PrintOptionsXform extends BaseXform {
  get tag() {
    return 'printOptions';
  }

  render(xmlStream, model) {
    if (model) {
      const attributes = {
        headings: booleanToXml(model.showRowColHeaders),
        gridLines: booleanToXml(model.showGridLines),
        horizontalCentered: booleanToXml(model.horizontalCentered),
        verticalCentered: booleanToXml(model.verticalCentered),
      };
      if (_.some(attributes, value => value !== undefined)) {
        xmlStream.leafNode(this.tag, attributes);
      }
    }
  }

  parseOpen(node) {
    switch (node.name) {
      case this.tag:
        this.model = {
          showRowColHeaders: node.attributes.headings === '1',
          showGridLines: node.attributes.gridLines === '1',
          horizontalCentered: node.attributes.horizontalCentered === '1',
          verticalCentered: node.attributes.verticalCentered === '1',
        };
        return true;
      default:
        return false;
    }
  }

  parseText() {}

  parseClose() {
    return false;
  }
}

module.exports = PrintOptionsXform;

}, function(modId) { var map = {"../../../utils/under-dash":1676879951315,"../base-xform":1676879951340}; return __REQUIRE__(map[modId], modId); })
__DEFINE__(1676879951396, function(require, module, exports) {
const colCache = require('../../../utils/col-cache');
const BaseXform = require('../base-xform');

class AutoFilterXform extends BaseXform {
  get tag() {
    return 'autoFilter';
  }

  render(xmlStream, model) {
    if (model) {
      if (typeof model === 'string') {
        // assume range
        xmlStream.leafNode('autoFilter', {ref: model});
      } else {
        const getAddress = function(addr) {
          if (typeof addr === 'string') {
            return addr;
          }
          return colCache.getAddress(addr.row, addr.column).address;
        };

        const firstAddress = getAddress(model.from);
        const secondAddress = getAddress(model.to);
        if (firstAddress && secondAddress) {
          xmlStream.leafNode('autoFilter', {ref: `${firstAddress}:${secondAddress}`});
        }
      }
    }
  }

  parseOpen(node) {
    if (node.name === 'autoFilter') {
      this.model = node.attributes.ref;
    }
  }
}

module.exports = AutoFilterXform;

}, function(modId) { var map = {"../../../utils/col-cache":1676879951316,"../base-xform":1676879951340}; return __REQUIRE__(map[modId], modId); })
__DEFINE__(1676879951397, function(require, module, exports) {
const BaseXform = require('../base-xform');

class PictureXform extends BaseXform {
  get tag() {
    return 'picture';
  }

  render(xmlStream, model) {
    if (model) {
      xmlStream.leafNode(this.tag, {'r:id': model.rId});
    }
  }

  parseOpen(node) {
    switch (node.name) {
      case this.tag:
        this.model = {
          rId: node.attributes['r:id'],
        };
        return true;
      default:
        return false;
    }
  }

  parseText() {}

  parseClose() {
    return false;
  }
}

module.exports = PictureXform;

}, function(modId) { var map = {"../base-xform":1676879951340}; return __REQUIRE__(map[modId], modId); })
__DEFINE__(1676879951398, function(require, module, exports) {
const BaseXform = require('../base-xform');

class DrawingXform extends BaseXform {
  get tag() {
    return 'drawing';
  }

  render(xmlStream, model) {
    if (model) {
      xmlStream.leafNode(this.tag, {'r:id': model.rId});
    }
  }

  parseOpen(node) {
    switch (node.name) {
      case this.tag:
        this.model = {
          rId: node.attributes['r:id'],
        };
        return true;
      default:
        return false;
    }
  }

  parseText() {}

  parseClose() {
    return false;
  }
}

module.exports = DrawingXform;

}, function(modId) { var map = {"../base-xform":1676879951340}; return __REQUIRE__(map[modId], modId); })
__DEFINE__(1676879951399, function(require, module, exports) {
const BaseXform = require('../base-xform');

class TablePartXform extends BaseXform {
  get tag() {
    return 'tablePart';
  }

  render(xmlStream, model) {
    if (model) {
      xmlStream.leafNode(this.tag, {'r:id': model.rId});
    }
  }

  parseOpen(node) {
    switch (node.name) {
      case this.tag:
        this.model = {
          rId: node.attributes['r:id'],
        };
        return true;
      default:
        return false;
    }
  }

  parseText() {}

  parseClose() {
    return false;
  }
}

module.exports = TablePartXform;

}, function(modId) { var map = {"../base-xform":1676879951340}; return __REQUIRE__(map[modId], modId); })
__DEFINE__(1676879951400, function(require, module, exports) {


const PageBreaksXform = require('./page-breaks-xform');

const ListXform = require('../list-xform');

class RowBreaksXform extends ListXform {
  constructor() {
    const options = {
      tag: 'rowBreaks',
      count: true,
      childXform: new PageBreaksXform(),
    };
    super(options);
  }

  // get tag() { return 'rowBreaks'; }

  render(xmlStream, model) {
    if (model && model.length) {
      xmlStream.openNode(this.tag, this.$);
      if (this.count) {
        xmlStream.addAttribute(this.$count, model.length);
        xmlStream.addAttribute('manualBreakCount', model.length);
      }

      const {childXform} = this;
      model.forEach(childModel => {
        childXform.render(xmlStream, childModel);
      });

      xmlStream.closeNode();
    } else if (this.empty) {
      xmlStream.leafNode(this.tag);
    }
  }
}

module.exports = RowBreaksXform;

}, function(modId) { var map = {"./page-breaks-xform":1676879951401,"../list-xform":1676879951343}; return __REQUIRE__(map[modId], modId); })
__DEFINE__(1676879951401, function(require, module, exports) {
const BaseXform = require('../base-xform');

class PageBreaksXform extends BaseXform {
  get tag() {
    return 'brk';
  }

  render(xmlStream, model) {
    xmlStream.leafNode('brk', model);
  }

  parseOpen(node) {
    if (node.name === 'brk') {
      this.model = node.attributes.ref;
      return true;
    }
    return false;
  }

  parseText() {}

  parseClose() {
    return false;
  }
}

module.exports = PageBreaksXform;

}, function(modId) { var map = {"../base-xform":1676879951340}; return __REQUIRE__(map[modId], modId); })
__DEFINE__(1676879951402, function(require, module, exports) {
const BaseXform = require('../base-xform');

class HeaderFooterXform extends BaseXform {
  get tag() {
    return 'headerFooter';
  }

  render(xmlStream, model) {
    if (model) {
      xmlStream.addRollback();

      let createTag = false;

      xmlStream.openNode('headerFooter');
      if (model.differentFirst) {
        xmlStream.addAttribute('differentFirst', '1');
        createTag = true;
      }
      if (model.differentOddEven) {
        xmlStream.addAttribute('differentOddEven', '1');
        createTag = true;
      }
      if (model.oddHeader && typeof model.oddHeader === 'string') {
        xmlStream.leafNode('oddHeader', null, model.oddHeader);
        createTag = true;
      }
      if (model.oddFooter && typeof model.oddFooter === 'string') {
        xmlStream.leafNode('oddFooter', null, model.oddFooter);
        createTag = true;
      }
      if (model.evenHeader && typeof model.evenHeader === 'string') {
        xmlStream.leafNode('evenHeader', null, model.evenHeader);
        createTag = true;
      }
      if (model.evenFooter && typeof model.evenFooter === 'string') {
        xmlStream.leafNode('evenFooter', null, model.evenFooter);
        createTag = true;
      }
      if (model.firstHeader && typeof model.firstHeader === 'string') {
        xmlStream.leafNode('firstHeader', null, model.firstHeader);
        createTag = true;
      }
      if (model.firstFooter && typeof model.firstFooter === 'string') {
        xmlStream.leafNode('firstFooter', null, model.firstFooter);
        createTag = true;
      }

      if (createTag) {
        xmlStream.closeNode();
        xmlStream.commit();
      } else {
        xmlStream.rollback();
      }
    }
  }

  parseOpen(node) {
    switch (node.name) {
      case 'headerFooter':
        this.model = {};
        if (node.attributes.differentFirst) {
          this.model.differentFirst = parseInt(node.attributes.differentFirst, 0) === 1;
        }
        if (node.attributes.differentOddEven) {
          this.model.differentOddEven = parseInt(node.attributes.differentOddEven, 0) === 1;
        }
        return true;

      case 'oddHeader':
        this.currentNode = 'oddHeader';
        return true;

      case 'oddFooter':
        this.currentNode = 'oddFooter';
        return true;

      case 'evenHeader':
        this.currentNode = 'evenHeader';
        return true;

      case 'evenFooter':
        this.currentNode = 'evenFooter';
        return true;

      case 'firstHeader':
        this.currentNode = 'firstHeader';
        return true;

      case 'firstFooter':
        this.currentNode = 'firstFooter';
        return true;

      default:
        return false;
    }
  }

  parseText(text) {
    switch (this.currentNode) {
      case 'oddHeader':
        this.model.oddHeader = text;
        break;

      case 'oddFooter':
        this.model.oddFooter = text;
        break;

      case 'evenHeader':
        this.model.evenHeader = text;
        break;

      case 'evenFooter':
        this.model.evenFooter = text;
        break;

      case 'firstHeader':
        this.model.firstHeader = text;
        break;

      case 'firstFooter':
        this.model.firstFooter = text;
        break;

      default:
        break;
    }
  }

  parseClose() {
    switch (this.currentNode) {
      case 'oddHeader':
      case 'oddFooter':
      case 'evenHeader':
      case 'evenFooter':
      case 'firstHeader':
      case 'firstFooter':
        this.currentNode = undefined;
        return true;

      default:
        return false;
    }
  }
}

module.exports = HeaderFooterXform;

}, function(modId) { var map = {"../base-xform":1676879951340}; return __REQUIRE__(map[modId], modId); })
__DEFINE__(1676879951403, function(require, module, exports) {
const BaseXform = require('../../base-xform');

const ConditionalFormattingXform = require('./conditional-formatting-xform');

class ConditionalFormattingsXform extends BaseXform {
  constructor() {
    super();

    this.cfXform = new ConditionalFormattingXform();
  }

  get tag() {
    return 'conditionalFormatting';
  }

  reset() {
    this.model = [];
  }

  prepare(model, options) {
    // ensure each rule has a priority value
    let nextPriority = model.reduce(
      (p, cf) => Math.max(p, ...cf.rules.map(rule => rule.priority || 0)),
      1
    );
    model.forEach(cf => {
      cf.rules.forEach(rule => {
        if (!rule.priority) {
          rule.priority = nextPriority++;
        }

        if (rule.style) {
          rule.dxfId = options.styles.addDxfStyle(rule.style);
        }
      });
    });
  }

  render(xmlStream, model) {
    model.forEach(cf => {
      this.cfXform.render(xmlStream, cf);
    });
  }

  parseOpen(node) {
    if (this.parser) {
      this.parser.parseOpen(node);
      return true;
    }

    switch (node.name) {
      case 'conditionalFormatting':
        this.parser = this.cfXform;
        this.parser.parseOpen(node);
        return true;

      default:
        return false;
    }
  }

  parseText(text) {
    if (this.parser) {
      this.parser.parseText(text);
    }
  }

  parseClose(name) {
    if (this.parser) {
      if (!this.parser.parseClose(name)) {
        this.model.push(this.parser.model);
        this.parser = undefined;
        return false;
      }
      return true;
    }
    return false;
  }

  reconcile(model, options) {
    model.forEach(cf => {
      cf.rules.forEach(rule => {
        if (rule.dxfId !== undefined) {
          rule.style = options.styles.getDxfStyle(rule.dxfId);
          delete rule.dxfId;
        }
      });
    });
  }
}

module.exports = ConditionalFormattingsXform;

}, function(modId) { var map = {"../../base-xform":1676879951340,"./conditional-formatting-xform":1676879951404}; return __REQUIRE__(map[modId], modId); })
__DEFINE__(1676879951404, function(require, module, exports) {
const CompositeXform = require('../../composite-xform');

const CfRuleXform = require('./cf-rule-xform');

class ConditionalFormattingXform extends CompositeXform {
  constructor() {
    super();

    this.map = {
      cfRule: new CfRuleXform(),
    };
  }

  get tag() {
    return 'conditionalFormatting';
  }

  render(xmlStream, model) {
    // if there are no primitive rules, exit now
    if (!model.rules.some(CfRuleXform.isPrimitive)) {
      return;
    }

    xmlStream.openNode(this.tag, {sqref: model.ref});

    model.rules.forEach(rule => {
      if (CfRuleXform.isPrimitive(rule)) {
        rule.ref = model.ref;
        this.map.cfRule.render(xmlStream, rule);
      }
    });

    xmlStream.closeNode();
  }

  createNewModel({attributes}) {
    return {
      ref: attributes.sqref,
      rules: [],
    };
  }

  onParserClose(name, parser) {
    this.model.rules.push(parser.model);
  }
}

module.exports = ConditionalFormattingXform;

}, function(modId) { var map = {"../../composite-xform":1676879951405,"./cf-rule-xform":1676879951406}; return __REQUIRE__(map[modId], modId); })
__DEFINE__(1676879951405, function(require, module, exports) {
const BaseXform = require('./base-xform');

/* 'virtual' methods used as a form of documentation */
/* eslint-disable class-methods-use-this */

// base class for xforms that are composed of other xforms
// offers some default implementations
class CompositeXform extends BaseXform {
  createNewModel(node) {
    return {};
  }

  parseOpen(node) {
    // Typical pattern for composite xform
    this.parser = this.parser || this.map[node.name];
    if (this.parser) {
      this.parser.parseOpen(node);
      return true;
    }

    if (node.name === this.tag) {
      this.model = this.createNewModel(node);
      return true;
    }

    return false;
  }

  parseText(text) {
    // Default implementation. Send text to child parser
    if (this.parser) {
      this.parser.parseText(text);
    }
  }

  onParserClose(name, parser) {
    // parseClose has seen a child parser close
    // now need to incorporate into this.model somehow
    this.model[name] = parser.model;
  }

  parseClose(name) {
    // Default implementation
    if (this.parser) {
      if (!this.parser.parseClose(name)) {
        this.onParserClose(name, this.parser);
        this.parser = undefined;
      }
      return true;
    }

    return name !== this.tag;
  }
}

module.exports = CompositeXform;

}, function(modId) { var map = {"./base-xform":1676879951340}; return __REQUIRE__(map[modId], modId); })
__DEFINE__(1676879951406, function(require, module, exports) {
const BaseXform = require('../../base-xform');
const CompositeXform = require('../../composite-xform');

const Range = require('../../../../doc/range');

const DatabarXform = require('./databar-xform');
const ExtLstRefXform = require('./ext-lst-ref-xform');
const FormulaXform = require('./formula-xform');
const ColorScaleXform = require('./color-scale-xform');
const IconSetXform = require('./icon-set-xform');

const extIcons = {
  '3Triangles': true,
  '3Stars': true,
  '5Boxes': true,
};

const getTextFormula = model => {
  if (model.formulae && model.formulae[0]) {
    return model.formulae[0];
  }

  const range = new Range(model.ref);
  const {tl} = range;
  switch (model.operator) {
    case 'containsText':
      return `NOT(ISERROR(SEARCH("${model.text}",${tl})))`;
    case 'containsBlanks':
      return `LEN(TRIM(${tl}))=0`;
    case 'notContainsBlanks':
      return `LEN(TRIM(${tl}))>0`;
    case 'containsErrors':
      return `ISERROR(${tl})`;
    case 'notContainsErrors':
      return `NOT(ISERROR(${tl}))`;
    default:
      return undefined;
  }
};

const getTimePeriodFormula = model => {
  if (model.formulae && model.formulae[0]) {
    return model.formulae[0];
  }

  const range = new Range(model.ref);
  const {tl} = range;
  switch (model.timePeriod) {
    case 'thisWeek':
      return `AND(TODAY()-ROUNDDOWN(${tl},0)<=WEEKDAY(TODAY())-1,ROUNDDOWN(${tl},0)-TODAY()<=7-WEEKDAY(TODAY()))`;
    case 'lastWeek':
      return `AND(TODAY()-ROUNDDOWN(${tl},0)>=(WEEKDAY(TODAY())),TODAY()-ROUNDDOWN(${tl},0)<(WEEKDAY(TODAY())+7))`;
    case 'nextWeek':
      return `AND(ROUNDDOWN(${tl},0)-TODAY()>(7-WEEKDAY(TODAY())),ROUNDDOWN(${tl},0)-TODAY()<(15-WEEKDAY(TODAY())))`;
    case 'yesterday':
      return `FLOOR(${tl},1)=TODAY()-1`;
    case 'today':
      return `FLOOR(${tl},1)=TODAY()`;
    case 'tomorrow':
      return `FLOOR(${tl},1)=TODAY()+1`;
    case 'last7Days':
      return `AND(TODAY()-FLOOR(${tl},1)<=6,FLOOR(${tl},1)<=TODAY())`;
    case 'lastMonth':
      return `AND(MONTH(${tl})=MONTH(EDATE(TODAY(),0-1)),YEAR(${tl})=YEAR(EDATE(TODAY(),0-1)))`;
    case 'thisMonth':
      return `AND(MONTH(${tl})=MONTH(TODAY()),YEAR(${tl})=YEAR(TODAY()))`;
    case 'nextMonth':
      return `AND(MONTH(${tl})=MONTH(EDATE(TODAY(),0+1)),YEAR(${tl})=YEAR(EDATE(TODAY(),0+1)))`;
    default:
      return undefined;
  }
};

const opType = attributes => {
  const {type, operator} = attributes;
  switch (type) {
    case 'containsText':
    case 'containsBlanks':
    case 'notContainsBlanks':
    case 'containsErrors':
    case 'notContainsErrors':
      return {
        type: 'containsText',
        operator: type,
      };

    default:
      return {type, operator};
  }
};

class CfRuleXform extends CompositeXform {
  constructor() {
    super();

    this.map = {
      dataBar: (this.databarXform = new DatabarXform()),
      extLst: (this.extLstRefXform = new ExtLstRefXform()),
      formula: (this.formulaXform = new FormulaXform()),
      colorScale: (this.colorScaleXform = new ColorScaleXform()),
      iconSet: (this.iconSetXform = new IconSetXform()),
    };
  }

  get tag() {
    return 'cfRule';
  }

  static isPrimitive(rule) {
    // is this rule primitive?
    if (rule.type === 'iconSet') {
      if (rule.custom || extIcons[rule.iconSet]) {
        return false;
      }
    }
    return true;
  }

  render(xmlStream, model) {
    switch (model.type) {
      case 'expression':
        this.renderExpression(xmlStream, model);
        break;
      case 'cellIs':
        this.renderCellIs(xmlStream, model);
        break;
      case 'top10':
        this.renderTop10(xmlStream, model);
        break;
      case 'aboveAverage':
        this.renderAboveAverage(xmlStream, model);
        break;
      case 'dataBar':
        this.renderDataBar(xmlStream, model);
        break;
      case 'colorScale':
        this.renderColorScale(xmlStream, model);
        break;
      case 'iconSet':
        this.renderIconSet(xmlStream, model);
        break;
      case 'containsText':
        this.renderText(xmlStream, model);
        break;
      case 'timePeriod':
        this.renderTimePeriod(xmlStream, model);
        break;
    }
  }

  renderExpression(xmlStream, model) {
    xmlStream.openNode(this.tag, {
      type: 'expression',
      dxfId: model.dxfId,
      priority: model.priority,
    });

    this.formulaXform.render(xmlStream, model.formulae[0]);

    xmlStream.closeNode();
  }

  renderCellIs(xmlStream, model) {
    xmlStream.openNode(this.tag, {
      type: 'cellIs',
      dxfId: model.dxfId,
      priority: model.priority,
      operator: model.operator,
    });

    model.formulae.forEach(formula => {
      this.formulaXform.render(xmlStream, formula);
    });

    xmlStream.closeNode();
  }

  renderTop10(xmlStream, model) {
    xmlStream.leafNode(this.tag, {
      type: 'top10',
      dxfId: model.dxfId,
      priority: model.priority,
      percent: BaseXform.toBoolAttribute(model.percent, false),
      bottom: BaseXform.toBoolAttribute(model.bottom, false),
      rank: BaseXform.toIntValue(model.rank, 10, true),
    });
  }

  renderAboveAverage(xmlStream, model) {
    xmlStream.leafNode(this.tag, {
      type: 'aboveAverage',
      dxfId: model.dxfId,
      priority: model.priority,
      aboveAverage: BaseXform.toBoolAttribute(model.aboveAverage, true),
    });
  }

  renderDataBar(xmlStream, model) {
    xmlStream.openNode(this.tag, {
      type: 'dataBar',
      priority: model.priority,
    });

    this.databarXform.render(xmlStream, model);
    this.extLstRefXform.render(xmlStream, model);

    xmlStream.closeNode();
  }

  renderColorScale(xmlStream, model) {
    xmlStream.openNode(this.tag, {
      type: 'colorScale',
      priority: model.priority,
    });

    this.colorScaleXform.render(xmlStream, model);

    xmlStream.closeNode();
  }

  renderIconSet(xmlStream, model) {
    // iconset is all primitive or all extLst
    if (!CfRuleXform.isPrimitive(model)) {
      return;
    }

    xmlStream.openNode(this.tag, {
      type: 'iconSet',
      priority: model.priority,
    });

    this.iconSetXform.render(xmlStream, model);

    xmlStream.closeNode();
  }

  renderText(xmlStream, model) {
    xmlStream.openNode(this.tag, {
      type: model.operator,
      dxfId: model.dxfId,
      priority: model.priority,
      operator: BaseXform.toStringAttribute(model.operator, 'containsText'),
    });

    const formula = getTextFormula(model);
    if (formula) {
      this.formulaXform.render(xmlStream, formula);
    }

    xmlStream.closeNode();
  }

  renderTimePeriod(xmlStream, model) {
    xmlStream.openNode(this.tag, {
      type: 'timePeriod',
      dxfId: model.dxfId,
      priority: model.priority,
      timePeriod: model.timePeriod,
    });

    const formula = getTimePeriodFormula(model);
    if (formula) {
      this.formulaXform.render(xmlStream, formula);
    }

    xmlStream.closeNode();
  }

  createNewModel({attributes}) {
    return {
      ...opType(attributes),
      dxfId: BaseXform.toIntValue(attributes.dxfId),
      priority: BaseXform.toIntValue(attributes.priority),
      timePeriod: attributes.timePeriod,
      percent: BaseXform.toBoolValue(attributes.percent),
      bottom: BaseXform.toBoolValue(attributes.bottom),
      rank: BaseXform.toIntValue(attributes.rank),
      aboveAverage: BaseXform.toBoolValue(attributes.aboveAverage),
    };
  }

  onParserClose(name, parser) {
    switch (name) {
      case 'dataBar':
      case 'extLst':
      case 'colorScale':
      case 'iconSet':
        // merge parser model with ours
        Object.assign(this.model, parser.model);
        break;

      case 'formula':
        // except - formula is a string and appends to formulae
        this.model.formulae = this.model.formulae || [];
        this.model.formulae.push(parser.model);
        break;
    }
  }
}

module.exports = CfRuleXform;

}, function(modId) { var map = {"../../base-xform":1676879951340,"../../composite-xform":1676879951405,"../../../../doc/range":1676879951317,"./databar-xform":1676879951407,"./ext-lst-ref-xform":1676879951409,"./formula-xform":1676879951410,"./color-scale-xform":1676879951411,"./icon-set-xform":1676879951412}; return __REQUIRE__(map[modId], modId); })
__DEFINE__(1676879951407, function(require, module, exports) {
const CompositeXform = require('../../composite-xform');

const ColorXform = require('../../style/color-xform');
const CfvoXform = require('./cfvo-xform');

class DatabarXform extends CompositeXform {
  constructor() {
    super();

    this.map = {
      cfvo: (this.cfvoXform = new CfvoXform()),
      color: (this.colorXform = new ColorXform()),
    };
  }

  get tag() {
    return 'dataBar';
  }

  render(xmlStream, model) {
    xmlStream.openNode(this.tag);

    model.cfvo.forEach(cfvo => {
      this.cfvoXform.render(xmlStream, cfvo);
    });
    this.colorXform.render(xmlStream, model.color);

    xmlStream.closeNode();
  }

  createNewModel() {
    return {
      cfvo: [],
    };
  }

  onParserClose(name, parser) {
    switch (name) {
      case 'cfvo':
        this.model.cfvo.push(parser.model);
        break;
      case 'color':
        this.model.color = parser.model;
        break;
    }
  }
}

module.exports = DatabarXform;

}, function(modId) { var map = {"../../composite-xform":1676879951405,"../../style/color-xform":1676879951345,"./cfvo-xform":1676879951408}; return __REQUIRE__(map[modId], modId); })
__DEFINE__(1676879951408, function(require, module, exports) {
const BaseXform = require('../../base-xform');

class CfvoXform extends BaseXform {
  get tag() {
    return 'cfvo';
  }

  render(xmlStream, model) {
    xmlStream.leafNode(this.tag, {
      type: model.type,
      val: model.value,
    });
  }

  parseOpen(node) {
    this.model = {
      type: node.attributes.type,
      value: BaseXform.toFloatValue(node.attributes.val),
    };
  }

  parseClose(name) {
    return name !== this.tag;
  }
}

module.exports = CfvoXform;

}, function(modId) { var map = {"../../base-xform":1676879951340}; return __REQUIRE__(map[modId], modId); })
__DEFINE__(1676879951409, function(require, module, exports) {
/* eslint-disable max-classes-per-file */
const BaseXform = require('../../base-xform');
const CompositeXform = require('../../composite-xform');

class X14IdXform extends BaseXform {
  get tag() {
    return 'x14:id';
  }

  render(xmlStream, model) {
    xmlStream.leafNode(this.tag, null, model);
  }

  parseOpen() {
    this.model = '';
  }

  parseText(text) {
    this.model += text;
  }

  parseClose(name) {
    return name !== this.tag;
  }
}

class ExtXform extends CompositeXform {
  constructor() {
    super();

    this.map = {
      'x14:id': (this.idXform = new X14IdXform()),
    };
  }

  get tag() {
    return 'ext';
  }

  render(xmlStream, model) {
    xmlStream.openNode(this.tag, {
      uri: '{B025F937-C7B1-47D3-B67F-A62EFF666E3E}',
      'xmlns:x14': 'http://schemas.microsoft.com/office/spreadsheetml/2009/9/main',
    });

    this.idXform.render(xmlStream, model.x14Id);

    xmlStream.closeNode();
  }

  createNewModel() {
    return {};
  }

  onParserClose(name, parser) {
    this.model.x14Id = parser.model;
  }
}

class ExtLstRefXform extends CompositeXform {
  constructor() {
    super();
    this.map = {
      ext: new ExtXform(),
    };
  }

  get tag() {
    return 'extLst';
  }

  render(xmlStream, model) {
    xmlStream.openNode(this.tag);
    this.map.ext.render(xmlStream, model);
    xmlStream.closeNode();
  }

  createNewModel() {
    return {};
  }

  onParserClose(name, parser) {
    Object.assign(this.model, parser.model);
  }
}

module.exports = ExtLstRefXform;

}, function(modId) { var map = {"../../base-xform":1676879951340,"../../composite-xform":1676879951405}; return __REQUIRE__(map[modId], modId); })
__DEFINE__(1676879951410, function(require, module, exports) {
const BaseXform = require('../../base-xform');

class FormulaXform extends BaseXform {
  get tag() {
    return 'formula';
  }

  render(xmlStream, model) {
    xmlStream.leafNode(this.tag, null, model);
  }

  parseOpen() {
    this.model = '';
  }

  parseText(text) {
    this.model += text;
  }

  parseClose(name) {
    return name !== this.tag;
  }
}

module.exports = FormulaXform;

}, function(modId) { var map = {"../../base-xform":1676879951340}; return __REQUIRE__(map[modId], modId); })
__DEFINE__(1676879951411, function(require, module, exports) {
const CompositeXform = require('../../composite-xform');

const ColorXform = require('../../style/color-xform');
const CfvoXform = require('./cfvo-xform');

class ColorScaleXform extends CompositeXform {
  constructor() {
    super();

    this.map = {
      cfvo: (this.cfvoXform = new CfvoXform()),
      color: (this.colorXform = new ColorXform()),
    };
  }

  get tag() {
    return 'colorScale';
  }

  render(xmlStream, model) {
    xmlStream.openNode(this.tag);

    model.cfvo.forEach(cfvo => {
      this.cfvoXform.render(xmlStream, cfvo);
    });
    model.color.forEach(color => {
      this.colorXform.render(xmlStream, color);
    });

    xmlStream.closeNode();
  }

  createNewModel(node) {
    return {
      cfvo: [],
      color: [],
    };
  }

  onParserClose(name, parser) {
    this.model[name].push(parser.model);
  }
}

module.exports = ColorScaleXform;

}, function(modId) { var map = {"../../composite-xform":1676879951405,"../../style/color-xform":1676879951345,"./cfvo-xform":1676879951408}; return __REQUIRE__(map[modId], modId); })
__DEFINE__(1676879951412, function(require, module, exports) {
const BaseXform = require('../../base-xform');
const CompositeXform = require('../../composite-xform');

const CfvoXform = require('./cfvo-xform');

class IconSetXform extends CompositeXform {
  constructor() {
    super();

    this.map = {
      cfvo: (this.cfvoXform = new CfvoXform()),
    };
  }

  get tag() {
    return 'iconSet';
  }

  render(xmlStream, model) {
    xmlStream.openNode(this.tag, {
      iconSet: BaseXform.toStringAttribute(model.iconSet, '3TrafficLights'),
      reverse: BaseXform.toBoolAttribute(model.reverse, false),
      showValue: BaseXform.toBoolAttribute(model.showValue, true),
    });

    model.cfvo.forEach(cfvo => {
      this.cfvoXform.render(xmlStream, cfvo);
    });

    xmlStream.closeNode();
  }

  createNewModel({attributes}) {
    return {
      iconSet: BaseXform.toStringValue(attributes.iconSet, '3TrafficLights'),
      reverse: BaseXform.toBoolValue(attributes.reverse),
      showValue: BaseXform.toBoolValue(attributes.showValue),
      cfvo: [],
    };
  }

  onParserClose(name, parser) {
    this.model[name].push(parser.model);
  }
}

module.exports = IconSetXform;

}, function(modId) { var map = {"../../base-xform":1676879951340,"../../composite-xform":1676879951405,"./cfvo-xform":1676879951408}; return __REQUIRE__(map[modId], modId); })
__DEFINE__(1676879951413, function(require, module, exports) {
/* eslint-disable max-classes-per-file */
const CompositeXform = require('../composite-xform');

const ConditionalFormattingsExt = require('./cf-ext/conditional-formattings-ext-xform');

class ExtXform extends CompositeXform {
  constructor() {
    super();
    this.map = {
      'x14:conditionalFormattings': (this.conditionalFormattings = new ConditionalFormattingsExt()),
    };
  }

  get tag() {
    return 'ext';
  }

  hasContent(model) {
    return this.conditionalFormattings.hasContent(model.conditionalFormattings);
  }

  prepare(model, options) {
    this.conditionalFormattings.prepare(model.conditionalFormattings, options);
  }

  render(xmlStream, model) {
    xmlStream.openNode('ext', {
      uri: '{78C0D931-6437-407d-A8EE-F0AAD7539E65}',
      'xmlns:x14': 'http://schemas.microsoft.com/office/spreadsheetml/2009/9/main',
    });

    this.conditionalFormattings.render(xmlStream, model.conditionalFormattings);

    xmlStream.closeNode();
  }

  createNewModel() {
    return {};
  }

  onParserClose(name, parser) {
    this.model[name] = parser.model;
  }
}

class ExtLstXform extends CompositeXform {
  constructor() {
    super();

    this.map = {
      ext: (this.ext = new ExtXform()),
    };
  }

  get tag() {
    return 'extLst';
  }

  prepare(model, options) {
    this.ext.prepare(model, options);
  }

  hasContent(model) {
    return this.ext.hasContent(model);
  }

  render(xmlStream, model) {
    if (!this.hasContent(model)) {
      return;
    }

    xmlStream.openNode('extLst');
    this.ext.render(xmlStream, model);
    xmlStream.closeNode();
  }

  createNewModel() {
    return {};
  }

  onParserClose(name, parser) {
    Object.assign(this.model, parser.model);
  }
}

module.exports = ExtLstXform;

}, function(modId) { var map = {"../composite-xform":1676879951405,"./cf-ext/conditional-formattings-ext-xform":1676879951414}; return __REQUIRE__(map[modId], modId); })
__DEFINE__(1676879951414, function(require, module, exports) {
const CompositeXform = require('../../composite-xform');

const CfRuleExtXform = require('./cf-rule-ext-xform');
const ConditionalFormattingExtXform = require('./conditional-formatting-ext-xform');

class ConditionalFormattingsExtXform extends CompositeXform {
  constructor() {
    super();

    this.map = {
      'x14:conditionalFormatting': (this.cfXform = new ConditionalFormattingExtXform()),
    };
  }

  get tag() {
    return 'x14:conditionalFormattings';
  }

  hasContent(model) {
    if (model.hasExtContent === undefined) {
      model.hasExtContent = model.some(cf => cf.rules.some(CfRuleExtXform.isExt));
    }
    return model.hasExtContent;
  }

  prepare(model, options) {
    model.forEach(cf => {
      this.cfXform.prepare(cf, options);
    });
  }

  render(xmlStream, model) {
    if (this.hasContent(model)) {
      xmlStream.openNode(this.tag);
      model.forEach(cf => this.cfXform.render(xmlStream, cf));
      xmlStream.closeNode();
    }
  }

  createNewModel() {
    return [];
  }

  onParserClose(name, parser) {
    // model is array of conditional formatting objects
    this.model.push(parser.model);
  }
}

module.exports = ConditionalFormattingsExtXform;

}, function(modId) { var map = {"../../composite-xform":1676879951405,"./cf-rule-ext-xform":1676879951415,"./conditional-formatting-ext-xform":1676879951421}; return __REQUIRE__(map[modId], modId); })
__DEFINE__(1676879951415, function(require, module, exports) {
const {v4: uuidv4} = require('uuid');
const BaseXform = require('../../base-xform');
const CompositeXform = require('../../composite-xform');

const DatabarExtXform = require('./databar-ext-xform');
const IconSetExtXform = require('./icon-set-ext-xform');

const extIcons = {
  '3Triangles': true,
  '3Stars': true,
  '5Boxes': true,
};

class CfRuleExtXform extends CompositeXform {
  constructor() {
    super();

    this.map = {
      'x14:dataBar': (this.databarXform = new DatabarExtXform()),
      'x14:iconSet': (this.iconSetXform = new IconSetExtXform()),
    };
  }

  get tag() {
    return 'x14:cfRule';
  }

  static isExt(rule) {
    // is this rule primitive?
    if (rule.type === 'dataBar') {
      return DatabarExtXform.isExt(rule);
    }
    if (rule.type === 'iconSet') {
      if (rule.custom || extIcons[rule.iconSet]) {
        return true;
      }
    }
    return false;
  }

  prepare(model) {
    if (CfRuleExtXform.isExt(model)) {
      model.x14Id = `{${uuidv4()}}`.toUpperCase();
    }
  }

  render(xmlStream, model) {
    if (!CfRuleExtXform.isExt(model)) {
      return;
    }

    switch (model.type) {
      case 'dataBar':
        this.renderDataBar(xmlStream, model);
        break;
      case 'iconSet':
        this.renderIconSet(xmlStream, model);
        break;
    }
  }

  renderDataBar(xmlStream, model) {
    xmlStream.openNode(this.tag, {
      type: 'dataBar',
      id: model.x14Id,
    });

    this.databarXform.render(xmlStream, model);

    xmlStream.closeNode();
  }

  renderIconSet(xmlStream, model) {
    xmlStream.openNode(this.tag, {
      type: 'iconSet',
      priority: model.priority,
      id: model.x14Id || `{${uuidv4()}}`,
    });

    this.iconSetXform.render(xmlStream, model);

    xmlStream.closeNode();
  }

  createNewModel({attributes}) {
    return {
      type: attributes.type,
      x14Id: attributes.id,
      priority: BaseXform.toIntValue(attributes.priority),
    };
  }

  onParserClose(name, parser) {
    Object.assign(this.model, parser.model);
  }
}

module.exports = CfRuleExtXform;

}, function(modId) { var map = {"../../base-xform":1676879951340,"../../composite-xform":1676879951405,"./databar-ext-xform":1676879951416,"./icon-set-ext-xform":1676879951419}; return __REQUIRE__(map[modId], modId); })
__DEFINE__(1676879951416, function(require, module, exports) {
const BaseXform = require('../../base-xform');
const CompositeXform = require('../../composite-xform');

const ColorXform = require('../../style/color-xform');
const CfvoExtXform = require('./cfvo-ext-xform');

class DatabarExtXform extends CompositeXform {
  constructor() {
    super();

    this.map = {
      'x14:cfvo': (this.cfvoXform = new CfvoExtXform()),
      'x14:borderColor': (this.borderColorXform = new ColorXform('x14:borderColor')),
      'x14:negativeBorderColor': (this.negativeBorderColorXform = new ColorXform(
        'x14:negativeBorderColor'
      )),
      'x14:negativeFillColor': (this.negativeFillColorXform = new ColorXform(
        'x14:negativeFillColor'
      )),
      'x14:axisColor': (this.axisColorXform = new ColorXform('x14:axisColor')),
    };
  }

  static isExt(rule) {
    // not all databars need ext
    // TODO: refine this
    return !rule.gradient;
  }

  get tag() {
    return 'x14:dataBar';
  }

  render(xmlStream, model) {
    xmlStream.openNode(this.tag, {
      minLength: BaseXform.toIntAttribute(model.minLength, 0, true),
      maxLength: BaseXform.toIntAttribute(model.maxLength, 100, true),
      border: BaseXform.toBoolAttribute(model.border, false),
      gradient: BaseXform.toBoolAttribute(model.gradient, true),
      negativeBarColorSameAsPositive: BaseXform.toBoolAttribute(
        model.negativeBarColorSameAsPositive,
        true
      ),
      negativeBarBorderColorSameAsPositive: BaseXform.toBoolAttribute(
        model.negativeBarBorderColorSameAsPositive,
        true
      ),
      axisPosition: BaseXform.toAttribute(model.axisPosition, 'auto'),
      direction: BaseXform.toAttribute(model.direction, 'leftToRight'),
    });

    model.cfvo.forEach(cfvo => {
      this.cfvoXform.render(xmlStream, cfvo);
    });

    this.borderColorXform.render(xmlStream, model.borderColor);
    this.negativeBorderColorXform.render(xmlStream, model.negativeBorderColor);
    this.negativeFillColorXform.render(xmlStream, model.negativeFillColor);
    this.axisColorXform.render(xmlStream, model.axisColor);

    xmlStream.closeNode();
  }

  createNewModel({attributes}) {
    return {
      cfvo: [],
      minLength: BaseXform.toIntValue(attributes.minLength, 0),
      maxLength: BaseXform.toIntValue(attributes.maxLength, 100),
      border: BaseXform.toBoolValue(attributes.border, false),
      gradient: BaseXform.toBoolValue(attributes.gradient, true),
      negativeBarColorSameAsPositive: BaseXform.toBoolValue(
        attributes.negativeBarColorSameAsPositive,
        true
      ),
      negativeBarBorderColorSameAsPositive: BaseXform.toBoolValue(
        attributes.negativeBarBorderColorSameAsPositive,
        true
      ),
      axisPosition: BaseXform.toStringValue(attributes.axisPosition, 'auto'),
      direction: BaseXform.toStringValue(attributes.direction, 'leftToRight'),
    };
  }

  onParserClose(name, parser) {
    const [, prop] = name.split(':');
    switch (prop) {
      case 'cfvo':
        this.model.cfvo.push(parser.model);
        break;

      default:
        this.model[prop] = parser.model;
        break;
    }
  }
}

module.exports = DatabarExtXform;

}, function(modId) { var map = {"../../base-xform":1676879951340,"../../composite-xform":1676879951405,"../../style/color-xform":1676879951345,"./cfvo-ext-xform":1676879951417}; return __REQUIRE__(map[modId], modId); })
__DEFINE__(1676879951417, function(require, module, exports) {
const CompositeXform = require('../../composite-xform');

const FExtXform = require('./f-ext-xform');

class CfvoExtXform extends CompositeXform {
  constructor() {
    super();

    this.map = {
      'xm:f': (this.fExtXform = new FExtXform()),
    };
  }

  get tag() {
    return 'x14:cfvo';
  }

  render(xmlStream, model) {
    xmlStream.openNode(this.tag, {
      type: model.type,
    });
    if (model.value !== undefined) {
      this.fExtXform.render(xmlStream, model.value);
    }
    xmlStream.closeNode();
  }

  createNewModel(node) {
    return {
      type: node.attributes.type,
    };
  }

  onParserClose(name, parser) {
    switch (name) {
      case 'xm:f':
        this.model.value = parser.model ? parseFloat(parser.model) : 0;
        break;
    }
  }
}

module.exports = CfvoExtXform;

}, function(modId) { var map = {"../../composite-xform":1676879951405,"./f-ext-xform":1676879951418}; return __REQUIRE__(map[modId], modId); })
__DEFINE__(1676879951418, function(require, module, exports) {
const BaseXform = require('../../base-xform');

class FExtXform extends BaseXform {
  get tag() {
    return 'xm:f';
  }

  render(xmlStream, model) {
    xmlStream.leafNode(this.tag, null, model);
  }

  parseOpen() {
    this.model = '';
  }

  parseText(text) {
    this.model += text;
  }

  parseClose(name) {
    return name !== this.tag;
  }
}

module.exports = FExtXform;

}, function(modId) { var map = {"../../base-xform":1676879951340}; return __REQUIRE__(map[modId], modId); })
__DEFINE__(1676879951419, function(require, module, exports) {
const BaseXform = require('../../base-xform');
const CompositeXform = require('../../composite-xform');

const CfvoExtXform = require('./cfvo-ext-xform');
const CfIconExtXform = require('./cf-icon-ext-xform');

class IconSetExtXform extends CompositeXform {
  constructor() {
    super();

    this.map = {
      'x14:cfvo': (this.cfvoXform = new CfvoExtXform()),
      'x14:cfIcon': (this.cfIconXform = new CfIconExtXform()),
    };
  }

  get tag() {
    return 'x14:iconSet';
  }

  render(xmlStream, model) {
    xmlStream.openNode(this.tag, {
      iconSet: BaseXform.toStringAttribute(model.iconSet),
      reverse: BaseXform.toBoolAttribute(model.reverse, false),
      showValue: BaseXform.toBoolAttribute(model.showValue, true),
      custom: BaseXform.toBoolAttribute(model.icons, false),
    });

    model.cfvo.forEach(cfvo => {
      this.cfvoXform.render(xmlStream, cfvo);
    });

    if (model.icons) {
      model.icons.forEach((icon, i) => {
        icon.iconId = i;
        this.cfIconXform.render(xmlStream, icon);
      });
    }

    xmlStream.closeNode();
  }

  createNewModel({attributes}) {
    return {
      cfvo: [],
      iconSet: BaseXform.toStringValue(attributes.iconSet, '3TrafficLights'),
      reverse: BaseXform.toBoolValue(attributes.reverse, false),
      showValue: BaseXform.toBoolValue(attributes.showValue, true),
    };
  }

  onParserClose(name, parser) {
    const [, prop] = name.split(':');
    switch (prop) {
      case 'cfvo':
        this.model.cfvo.push(parser.model);
        break;

      case 'cfIcon':
        if (!this.model.icons) {
          this.model.icons = [];
        }
        this.model.icons.push(parser.model);
        break;

      default:
        this.model[prop] = parser.model;
        break;
    }
  }
}

module.exports = IconSetExtXform;

}, function(modId) { var map = {"../../base-xform":1676879951340,"../../composite-xform":1676879951405,"./cfvo-ext-xform":1676879951417,"./cf-icon-ext-xform":1676879951420}; return __REQUIRE__(map[modId], modId); })
__DEFINE__(1676879951420, function(require, module, exports) {
const BaseXform = require('../../base-xform');

class CfIconExtXform extends BaseXform {
  get tag() {
    return 'x14:cfIcon';
  }

  render(xmlStream, model) {
    xmlStream.leafNode(this.tag, {
      iconSet: model.iconSet,
      iconId: model.iconId,
    });
  }

  parseOpen({attributes}) {
    this.model = {
      iconSet: attributes.iconSet,
      iconId: BaseXform.toIntValue(attributes.iconId),
    };
  }

  parseClose(name) {
    return name !== this.tag;
  }
}

module.exports = CfIconExtXform;

}, function(modId) { var map = {"../../base-xform":1676879951340}; return __REQUIRE__(map[modId], modId); })
__DEFINE__(1676879951421, function(require, module, exports) {
const CompositeXform = require('../../composite-xform');

const SqRefExtXform = require('./sqref-ext-xform');
const CfRuleExtXform = require('./cf-rule-ext-xform');

class ConditionalFormattingExtXform extends CompositeXform {
  constructor() {
    super();

    this.map = {
      'xm:sqref': (this.sqRef = new SqRefExtXform()),
      'x14:cfRule': (this.cfRule = new CfRuleExtXform()),
    };
  }

  get tag() {
    return 'x14:conditionalFormatting';
  }

  prepare(model, options) {
    model.rules.forEach(rule => {
      this.cfRule.prepare(rule, options);
    });
  }

  render(xmlStream, model) {
    if (!model.rules.some(CfRuleExtXform.isExt)) {
      return;
    }

    xmlStream.openNode(this.tag, {
      'xmlns:xm': 'http://schemas.microsoft.com/office/excel/2006/main',
    });

    model.rules.filter(CfRuleExtXform.isExt).forEach(rule => this.cfRule.render(xmlStream, rule));

    // for some odd reason, Excel needs the <xm:sqref> node to be after the rules
    this.sqRef.render(xmlStream, model.ref);

    xmlStream.closeNode();
  }

  createNewModel() {
    return {
      rules: [],
    };
  }

  onParserClose(name, parser) {
    switch (name) {
      case 'xm:sqref':
        this.model.ref = parser.model;
        break;

      case 'x14:cfRule':
        this.model.rules.push(parser.model);
        break;
    }
  }
}

module.exports = ConditionalFormattingExtXform;

}, function(modId) { var map = {"../../composite-xform":1676879951405,"./sqref-ext-xform":1676879951422,"./cf-rule-ext-xform":1676879951415}; return __REQUIRE__(map[modId], modId); })
__DEFINE__(1676879951422, function(require, module, exports) {
const BaseXform = require('../../base-xform');

class SqrefExtXform extends BaseXform {
  get tag() {
    return 'xm:sqref';
  }

  render(xmlStream, model) {
    xmlStream.leafNode(this.tag, null, model);
  }

  parseOpen() {
    this.model = '';
  }

  parseText(text) {
    this.model += text;
  }

  parseClose(name) {
    return name !== this.tag;
  }
}

module.exports = SqrefExtXform;

}, function(modId) { var map = {"../../base-xform":1676879951340}; return __REQUIRE__(map[modId], modId); })
__DEFINE__(1676879951423, function(require, module, exports) {
const colCache = require('../../../utils/col-cache');
const XmlStream = require('../../../utils/xml-stream');

const BaseXform = require('../base-xform');
const TwoCellAnchorXform = require('./two-cell-anchor-xform');
const OneCellAnchorXform = require('./one-cell-anchor-xform');

function getAnchorType(model) {
  const range = typeof model.range === 'string' ? colCache.decode(model.range) : model.range;

  return range.br ? 'xdr:twoCellAnchor' : 'xdr:oneCellAnchor';
}

class DrawingXform extends BaseXform {
  constructor() {
    super();

    this.map = {
      'xdr:twoCellAnchor': new TwoCellAnchorXform(),
      'xdr:oneCellAnchor': new OneCellAnchorXform(),
    };
  }

  prepare(model) {
    model.anchors.forEach((item, index) => {
      item.anchorType = getAnchorType(item);
      const anchor = this.map[item.anchorType];
      anchor.prepare(item, {index});
    });
  }

  get tag() {
    return 'xdr:wsDr';
  }

  render(xmlStream, model) {
    xmlStream.openXml(XmlStream.StdDocAttributes);
    xmlStream.openNode(this.tag, DrawingXform.DRAWING_ATTRIBUTES);

    model.anchors.forEach(item => {
      const anchor = this.map[item.anchorType];
      anchor.render(xmlStream, item);
    });

    xmlStream.closeNode();
  }

  parseOpen(node) {
    if (this.parser) {
      this.parser.parseOpen(node);
      return true;
    }
    switch (node.name) {
      case this.tag:
        this.reset();
        this.model = {
          anchors: [],
        };
        break;
      default:
        this.parser = this.map[node.name];
        if (this.parser) {
          this.parser.parseOpen(node);
        }
        break;
    }
    return true;
  }

  parseText(text) {
    if (this.parser) {
      this.parser.parseText(text);
    }
  }

  parseClose(name) {
    if (this.parser) {
      if (!this.parser.parseClose(name)) {
        this.model.anchors.push(this.parser.model);
        this.parser = undefined;
      }
      return true;
    }
    switch (name) {
      case this.tag:
        return false;
      default:
        // could be some unrecognised tags
        return true;
    }
  }

  reconcile(model, options) {
    model.anchors.forEach(anchor => {
      if (anchor.br) {
        this.map['xdr:twoCellAnchor'].reconcile(anchor, options);
      } else {
        this.map['xdr:oneCellAnchor'].reconcile(anchor, options);
      }
    });
  }
}

DrawingXform.DRAWING_ATTRIBUTES = {
  'xmlns:xdr': 'http://schemas.openxmlformats.org/drawingml/2006/spreadsheetDrawing',
  'xmlns:a': 'http://schemas.openxmlformats.org/drawingml/2006/main',
};

module.exports = DrawingXform;

}, function(modId) { var map = {"../../../utils/col-cache":1676879951316,"../../../utils/xml-stream":1676879951337,"../base-xform":1676879951340,"./two-cell-anchor-xform":1676879951424,"./one-cell-anchor-xform":1676879951436}; return __REQUIRE__(map[modId], modId); })
__DEFINE__(1676879951424, function(require, module, exports) {
const BaseCellAnchorXform = require('./base-cell-anchor-xform');
const StaticXform = require('../static-xform');

const CellPositionXform = require('./cell-position-xform');
const PicXform = require('./pic-xform');

class TwoCellAnchorXform extends BaseCellAnchorXform {
  constructor() {
    super();

    this.map = {
      'xdr:from': new CellPositionXform({tag: 'xdr:from'}),
      'xdr:to': new CellPositionXform({tag: 'xdr:to'}),
      'xdr:pic': new PicXform(),
      'xdr:clientData': new StaticXform({tag: 'xdr:clientData'}),
    };
  }

  get tag() {
    return 'xdr:twoCellAnchor';
  }

  prepare(model, options) {
    this.map['xdr:pic'].prepare(model.picture, options);
  }

  render(xmlStream, model) {
    xmlStream.openNode(this.tag, {editAs: model.range.editAs || 'oneCell'});

    this.map['xdr:from'].render(xmlStream, model.range.tl);
    this.map['xdr:to'].render(xmlStream, model.range.br);
    this.map['xdr:pic'].render(xmlStream, model.picture);
    this.map['xdr:clientData'].render(xmlStream, {});

    xmlStream.closeNode();
  }

  parseClose(name) {
    if (this.parser) {
      if (!this.parser.parseClose(name)) {
        this.parser = undefined;
      }
      return true;
    }
    switch (name) {
      case this.tag:
        this.model.range.tl = this.map['xdr:from'].model;
        this.model.range.br = this.map['xdr:to'].model;
        this.model.picture = this.map['xdr:pic'].model;
        return false;
      default:
        // could be some unrecognised tags
        return true;
    }
  }

  reconcile(model, options) {
    model.medium = this.reconcilePicture(model.picture, options);
  }
}

module.exports = TwoCellAnchorXform;

}, function(modId) { var map = {"./base-cell-anchor-xform":1676879951425,"../static-xform":1676879951342,"./cell-position-xform":1676879951426,"./pic-xform":1676879951427}; return __REQUIRE__(map[modId], modId); })
__DEFINE__(1676879951425, function(require, module, exports) {
const BaseXform = require('../base-xform');

class BaseCellAnchorXform extends BaseXform {
  parseOpen(node) {
    if (this.parser) {
      this.parser.parseOpen(node);
      return true;
    }
    switch (node.name) {
      case this.tag:
        this.reset();
        this.model = {
          range: {
            editAs: node.attributes.editAs || 'oneCell',
          },
        };
        break;
      default:
        this.parser = this.map[node.name];
        if (this.parser) {
          this.parser.parseOpen(node);
        }
        break;
    }
    return true;
  }

  parseText(text) {
    if (this.parser) {
      this.parser.parseText(text);
    }
  }

  reconcilePicture(model, options) {
    if (model && model.rId) {
      const rel = options.rels[model.rId];
      const match = rel.Target.match(/.*\/media\/(.+[.][a-zA-Z]{3,4})/);
      if (match) {
        const name = match[1];
        const mediaId = options.mediaIndex[name];
        return options.media[mediaId];
      }
    }
    return undefined;
  }
}

module.exports = BaseCellAnchorXform;

}, function(modId) { var map = {"../base-xform":1676879951340}; return __REQUIRE__(map[modId], modId); })
__DEFINE__(1676879951426, function(require, module, exports) {
const BaseXform = require('../base-xform');
const IntegerXform = require('../simple/integer-xform');

class CellPositionXform extends BaseXform {
  constructor(options) {
    super();

    this.tag = options.tag;
    this.map = {
      'xdr:col': new IntegerXform({tag: 'xdr:col', zero: true}),
      'xdr:colOff': new IntegerXform({tag: 'xdr:colOff', zero: true}),
      'xdr:row': new IntegerXform({tag: 'xdr:row', zero: true}),
      'xdr:rowOff': new IntegerXform({tag: 'xdr:rowOff', zero: true}),
    };
  }

  render(xmlStream, model) {
    xmlStream.openNode(this.tag);

    this.map['xdr:col'].render(xmlStream, model.nativeCol);
    this.map['xdr:colOff'].render(xmlStream, model.nativeColOff);

    this.map['xdr:row'].render(xmlStream, model.nativeRow);
    this.map['xdr:rowOff'].render(xmlStream, model.nativeRowOff);

    xmlStream.closeNode();
  }

  parseOpen(node) {
    if (this.parser) {
      this.parser.parseOpen(node);
      return true;
    }
    switch (node.name) {
      case this.tag:
        this.reset();
        break;
      default:
        this.parser = this.map[node.name];
        if (this.parser) {
          this.parser.parseOpen(node);
        }
        break;
    }
    return true;
  }

  parseText(text) {
    if (this.parser) {
      this.parser.parseText(text);
    }
  }

  parseClose(name) {
    if (this.parser) {
      if (!this.parser.parseClose(name)) {
        this.parser = undefined;
      }
      return true;
    }
    switch (name) {
      case this.tag:
        this.model = {
          nativeCol: this.map['xdr:col'].model,
          nativeColOff: this.map['xdr:colOff'].model,
          nativeRow: this.map['xdr:row'].model,
          nativeRowOff: this.map['xdr:rowOff'].model,
        };
        return false;
      default:
        // not quite sure how we get here!
        return true;
    }
  }
}

module.exports = CellPositionXform;

}, function(modId) { var map = {"../base-xform":1676879951340,"../simple/integer-xform":1676879951347}; return __REQUIRE__(map[modId], modId); })
__DEFINE__(1676879951427, function(require, module, exports) {
const BaseXform = require('../base-xform');
const StaticXform = require('../static-xform');

const BlipFillXform = require('./blip-fill-xform');
const NvPicPrXform = require('./nv-pic-pr-xform');

const spPrJSON = require('./sp-pr');

class PicXform extends BaseXform {
  constructor() {
    super();

    this.map = {
      'xdr:nvPicPr': new NvPicPrXform(),
      'xdr:blipFill': new BlipFillXform(),
      'xdr:spPr': new StaticXform(spPrJSON),
    };
  }

  get tag() {
    return 'xdr:pic';
  }

  prepare(model, options) {
    model.index = options.index + 1;
  }

  render(xmlStream, model) {
    xmlStream.openNode(this.tag);

    this.map['xdr:nvPicPr'].render(xmlStream, model);
    this.map['xdr:blipFill'].render(xmlStream, model);
    this.map['xdr:spPr'].render(xmlStream, model);

    xmlStream.closeNode();
  }

  parseOpen(node) {
    if (this.parser) {
      this.parser.parseOpen(node);
      return true;
    }
    switch (node.name) {
      case this.tag:
        this.reset();
        break;
      default:
        this.parser = this.map[node.name];
        if (this.parser) {
          this.parser.parseOpen(node);
        }
        break;
    }
    return true;
  }

  parseText() {}

  parseClose(name) {
    if (this.parser) {
      if (!this.parser.parseClose(name)) {
        this.mergeModel(this.parser.model);
        this.parser = undefined;
      }
      return true;
    }
    switch (name) {
      case this.tag:
        return false;
      default:
        // not quite sure how we get here!
        return true;
    }
  }
}

module.exports = PicXform;

}, function(modId) { var map = {"../base-xform":1676879951340,"../static-xform":1676879951342,"./blip-fill-xform":1676879951428,"./nv-pic-pr-xform":1676879951430,"./sp-pr":1676879951435}; return __REQUIRE__(map[modId], modId); })
__DEFINE__(1676879951428, function(require, module, exports) {
const BaseXform = require('../base-xform');
const BlipXform = require('./blip-xform');

class BlipFillXform extends BaseXform {
  constructor() {
    super();

    this.map = {
      'a:blip': new BlipXform(),
    };
  }

  get tag() {
    return 'xdr:blipFill';
  }

  render(xmlStream, model) {
    xmlStream.openNode(this.tag);

    this.map['a:blip'].render(xmlStream, model);

    // TODO: options for this + parsing
    xmlStream.openNode('a:stretch');
    xmlStream.leafNode('a:fillRect');
    xmlStream.closeNode();

    xmlStream.closeNode();
  }

  parseOpen(node) {
    if (this.parser) {
      this.parser.parseOpen(node);
      return true;
    }

    switch (node.name) {
      case this.tag:
        this.reset();
        break;

      default:
        this.parser = this.map[node.name];
        if (this.parser) {
          this.parser.parseOpen(node);
        }
        break;
    }
    return true;
  }

  parseText() {}

  parseClose(name) {
    if (this.parser) {
      if (!this.parser.parseClose(name)) {
        this.parser = undefined;
      }
      return true;
    }
    switch (name) {
      case this.tag:
        this.model = this.map['a:blip'].model;
        return false;

      default:
        return true;
    }
  }
}

module.exports = BlipFillXform;

}, function(modId) { var map = {"../base-xform":1676879951340,"./blip-xform":1676879951429}; return __REQUIRE__(map[modId], modId); })
__DEFINE__(1676879951429, function(require, module, exports) {
const BaseXform = require('../base-xform');

class BlipXform extends BaseXform {
  get tag() {
    return 'a:blip';
  }

  render(xmlStream, model) {
    xmlStream.leafNode(this.tag, {
      'xmlns:r': 'http://schemas.openxmlformats.org/officeDocument/2006/relationships',
      'r:embed': model.rId,
      cstate: 'print',
    });
    // TODO: handle children (e.g. a:extLst=>a:ext=>a14:useLocalDpi
  }

  parseOpen(node) {
    switch (node.name) {
      case this.tag:
        this.model = {
          rId: node.attributes['r:embed'],
        };
        return true;
      default:
        return true;
    }
  }

  parseText() {}

  parseClose(name) {
    switch (name) {
      case this.tag:
        return false;
      default:
        // unprocessed internal nodes
        return true;
    }
  }
}

module.exports = BlipXform;

}, function(modId) { var map = {"../base-xform":1676879951340}; return __REQUIRE__(map[modId], modId); })
__DEFINE__(1676879951430, function(require, module, exports) {
const BaseXform = require('../base-xform');
const CNvPrXform = require('./c-nv-pr-xform');
const CNvPicPrXform = require('./c-nv-pic-pr-xform');

class NvPicPrXform extends BaseXform {
  constructor() {
    super();

    this.map = {
      'xdr:cNvPr': new CNvPrXform(),
      'xdr:cNvPicPr': new CNvPicPrXform(),
    };
  }

  get tag() {
    return 'xdr:nvPicPr';
  }

  render(xmlStream, model) {
    xmlStream.openNode(this.tag);
    this.map['xdr:cNvPr'].render(xmlStream, model);
    this.map['xdr:cNvPicPr'].render(xmlStream, model);
    xmlStream.closeNode();
  }

  parseOpen(node) {
    if (this.parser) {
      this.parser.parseOpen(node);
      return true;
    }

    switch (node.name) {
      case this.tag:
        this.reset();
        break;
      default:
        this.parser = this.map[node.name];
        if (this.parser) {
          this.parser.parseOpen(node);
        }
        break;
    }
    return true;
  }

  parseText() {}

  parseClose(name) {
    if (this.parser) {
      if (!this.parser.parseClose(name)) {
        this.parser = undefined;
      }
      return true;
    }
    switch (name) {
      case this.tag:
        this.model = this.map['xdr:cNvPr'].model;
        return false;
      default:
        return true;
    }
  }
}

module.exports = NvPicPrXform;

}, function(modId) { var map = {"../base-xform":1676879951340,"./c-nv-pr-xform":1676879951431,"./c-nv-pic-pr-xform":1676879951434}; return __REQUIRE__(map[modId], modId); })
__DEFINE__(1676879951431, function(require, module, exports) {
const BaseXform = require('../base-xform');
const HlickClickXform = require('./hlink-click-xform');
const ExtLstXform = require('./ext-lst-xform');

class CNvPrXform extends BaseXform {
  constructor() {
    super();

    this.map = {
      'a:hlinkClick': new HlickClickXform(),
      'a:extLst': new ExtLstXform(),
    };
  }

  get tag() {
    return 'xdr:cNvPr';
  }

  render(xmlStream, model) {
    xmlStream.openNode(this.tag, {
      id: model.index,
      name: `Picture ${model.index}`,
    });
    this.map['a:hlinkClick'].render(xmlStream, model);
    this.map['a:extLst'].render(xmlStream, model);
    xmlStream.closeNode();
  }

  parseOpen(node) {
    if (this.parser) {
      this.parser.parseOpen(node);
      return true;
    }

    switch (node.name) {
      case this.tag:
        this.reset();
        break;
      default:
        this.parser = this.map[node.name];
        if (this.parser) {
          this.parser.parseOpen(node);
        }
        break;
    }
    return true;
  }

  parseText() {}

  parseClose(name) {
    if (this.parser) {
      if (!this.parser.parseClose(name)) {
        this.parser = undefined;
      }
      return true;
    }
    switch (name) {
      case this.tag:
        this.model = this.map['a:hlinkClick'].model;
        return false;
      default:
        return true;
    }
  }
}

module.exports = CNvPrXform;

}, function(modId) { var map = {"../base-xform":1676879951340,"./hlink-click-xform":1676879951432,"./ext-lst-xform":1676879951433}; return __REQUIRE__(map[modId], modId); })
__DEFINE__(1676879951432, function(require, module, exports) {
const BaseXform = require('../base-xform');

class HLinkClickXform extends BaseXform {
  get tag() {
    return 'a:hlinkClick';
  }

  render(xmlStream, model) {
    if (!(model.hyperlinks && model.hyperlinks.rId)) {
      return;
    }
    xmlStream.leafNode(this.tag, {
      'xmlns:r': 'http://schemas.openxmlformats.org/officeDocument/2006/relationships',
      'r:id': model.hyperlinks.rId,
      tooltip: model.hyperlinks.tooltip,
    });
  }

  parseOpen(node) {
    switch (node.name) {
      case this.tag:
        this.model = {
          hyperlinks: {
            rId: node.attributes['r:id'],
            tooltip: node.attributes.tooltip,
          },
        };
        return true;
      default:
        return true;
    }
  }

  parseText() {}

  parseClose() {
    return false;
  }
}

module.exports = HLinkClickXform;

}, function(modId) { var map = {"../base-xform":1676879951340}; return __REQUIRE__(map[modId], modId); })
__DEFINE__(1676879951433, function(require, module, exports) {
const BaseXform = require('../base-xform');

class ExtLstXform extends BaseXform {
  get tag() {
    return 'a:extLst';
  }

  render(xmlStream) {
    xmlStream.openNode(this.tag);
    xmlStream.openNode('a:ext', {
      uri: '{FF2B5EF4-FFF2-40B4-BE49-F238E27FC236}',
    });
    xmlStream.leafNode('a16:creationId', {
      'xmlns:a16': 'http://schemas.microsoft.com/office/drawing/2014/main',
      id: '{00000000-0008-0000-0000-000002000000}',
    });
    xmlStream.closeNode();
    xmlStream.closeNode();
  }

  parseOpen(node) {
    switch (node.name) {
      case this.tag:
        return true;
      default:
        return true;
    }
  }

  parseText() {}

  parseClose(name) {
    switch (name) {
      case this.tag:
        return false;
      default:
        // unprocessed internal nodes
        return true;
    }
  }
}

module.exports = ExtLstXform;

}, function(modId) { var map = {"../base-xform":1676879951340}; return __REQUIRE__(map[modId], modId); })
__DEFINE__(1676879951434, function(require, module, exports) {
const BaseXform = require('../base-xform');

class CNvPicPrXform extends BaseXform {
  get tag() {
    return 'xdr:cNvPicPr';
  }

  render(xmlStream) {
    xmlStream.openNode(this.tag);
    xmlStream.leafNode('a:picLocks', {
      noChangeAspect: '1',
    });
    xmlStream.closeNode();
  }

  parseOpen(node) {
    switch (node.name) {
      case this.tag:
        return true;
      default:
        return true;
    }
  }

  parseText() {}

  parseClose(name) {
    switch (name) {
      case this.tag:
        return false;
      default:
        // unprocessed internal nodes
        return true;
    }
  }
}

module.exports = CNvPicPrXform;

}, function(modId) { var map = {"../base-xform":1676879951340}; return __REQUIRE__(map[modId], modId); })
__DEFINE__(1676879951435, function(require, module, exports) {
module.exports = {
  tag: 'xdr:spPr',
  c: [
    {
      tag: 'a:xfrm',
      c: [
        {tag: 'a:off', $: {x: '0', y: '0'}},
        {tag: 'a:ext', $: {cx: '0', cy: '0'}},
      ],
    },
    {
      tag: 'a:prstGeom',
      $: {prst: 'rect'},
      c: [{tag: 'a:avLst'}],
    },
  ],
};

}, function(modId) { var map = {}; return __REQUIRE__(map[modId], modId); })
__DEFINE__(1676879951436, function(require, module, exports) {
const BaseCellAnchorXform = require('./base-cell-anchor-xform');
const StaticXform = require('../static-xform');

const CellPositionXform = require('./cell-position-xform');
const ExtXform = require('./ext-xform');
const PicXform = require('./pic-xform');

class OneCellAnchorXform extends BaseCellAnchorXform {
  constructor() {
    super();

    this.map = {
      'xdr:from': new CellPositionXform({tag: 'xdr:from'}),
      'xdr:ext': new ExtXform({tag: 'xdr:ext'}),
      'xdr:pic': new PicXform(),
      'xdr:clientData': new StaticXform({tag: 'xdr:clientData'}),
    };
  }

  get tag() {
    return 'xdr:oneCellAnchor';
  }

  prepare(model, options) {
    this.map['xdr:pic'].prepare(model.picture, options);
  }

  render(xmlStream, model) {
    xmlStream.openNode(this.tag, {editAs: model.range.editAs || 'oneCell'});

    this.map['xdr:from'].render(xmlStream, model.range.tl);
    this.map['xdr:ext'].render(xmlStream, model.range.ext);
    this.map['xdr:pic'].render(xmlStream, model.picture);
    this.map['xdr:clientData'].render(xmlStream, {});

    xmlStream.closeNode();
  }

  parseClose(name) {
    if (this.parser) {
      if (!this.parser.parseClose(name)) {
        this.parser = undefined;
      }
      return true;
    }
    switch (name) {
      case this.tag:
        this.model.range.tl = this.map['xdr:from'].model;
        this.model.range.ext = this.map['xdr:ext'].model;
        this.model.picture = this.map['xdr:pic'].model;
        return false;
      default:
        // could be some unrecognised tags
        return true;
    }
  }

  reconcile(model, options) {
    model.medium = this.reconcilePicture(model.picture, options);
  }
}

module.exports = OneCellAnchorXform;

}, function(modId) { var map = {"./base-cell-anchor-xform":1676879951425,"../static-xform":1676879951342,"./cell-position-xform":1676879951426,"./ext-xform":1676879951437,"./pic-xform":1676879951427}; return __REQUIRE__(map[modId], modId); })
__DEFINE__(1676879951437, function(require, module, exports) {
const BaseXform = require('../base-xform');

/** https://en.wikipedia.org/wiki/Office_Open_XML_file_formats#DrawingML */
const EMU_PER_PIXEL_AT_96_DPI = 9525;

class ExtXform extends BaseXform {
  constructor(options) {
    super();

    this.tag = options.tag;
    this.map = {};
  }

  render(xmlStream, model) {
    xmlStream.openNode(this.tag);

    const width = Math.floor(model.width * EMU_PER_PIXEL_AT_96_DPI);
    const height = Math.floor(model.height * EMU_PER_PIXEL_AT_96_DPI);

    xmlStream.addAttribute('cx', width);
    xmlStream.addAttribute('cy', height);

    xmlStream.closeNode();
  }

  parseOpen(node) {
    if (node.name === this.tag) {
      this.model = {
        width: parseInt(node.attributes.cx || '0', 10) / EMU_PER_PIXEL_AT_96_DPI,
        height: parseInt(node.attributes.cy || '0', 10) / EMU_PER_PIXEL_AT_96_DPI,
      };
      return true;
    }
    return false;
  }

  parseText(/* text */) {}

  parseClose(/* name */) {
    return false;
  }
}

module.exports = ExtXform;

}, function(modId) { var map = {"../base-xform":1676879951340}; return __REQUIRE__(map[modId], modId); })
__DEFINE__(1676879951438, function(require, module, exports) {
const XmlStream = require('../../../utils/xml-stream');

const BaseXform = require('../base-xform');
const ListXform = require('../list-xform');

const AutoFilterXform = require('./auto-filter-xform');
const TableColumnXform = require('./table-column-xform');
const TableStyleInfoXform = require('./table-style-info-xform');

class TableXform extends BaseXform {
  constructor() {
    super();

    this.map = {
      autoFilter: new AutoFilterXform(),
      tableColumns: new ListXform({
        tag: 'tableColumns',
        count: true,
        empty: true,
        childXform: new TableColumnXform(),
      }),
      tableStyleInfo: new TableStyleInfoXform(),
    };
  }

  prepare(model, options) {
    this.map.autoFilter.prepare(model);
    this.map.tableColumns.prepare(model.columns, options);
  }

  get tag() {
    return 'table';
  }

  render(xmlStream, model) {
    xmlStream.openXml(XmlStream.StdDocAttributes);
    xmlStream.openNode(this.tag, {
      ...TableXform.TABLE_ATTRIBUTES,
      id: model.id,
      name: model.name,
      displayName: model.displayName || model.name,
      ref: model.tableRef,
      totalsRowCount: model.totalsRow ? '1' : undefined,
      totalsRowShown: model.totalsRow ? undefined : '1',
      headerRowCount: model.headerRow ? '1' : '0',
    });

    this.map.autoFilter.render(xmlStream, model);
    this.map.tableColumns.render(xmlStream, model.columns);
    this.map.tableStyleInfo.render(xmlStream, model.style);

    xmlStream.closeNode();
  }

  parseOpen(node) {
    if (this.parser) {
      this.parser.parseOpen(node);
      return true;
    }
    const {name, attributes} = node;
    switch (name) {
      case this.tag:
        this.reset();
        this.model = {
          name: attributes.name,
          displayName: attributes.displayName || attributes.name,
          tableRef: attributes.ref,
          totalsRow: attributes.totalsRowCount === '1',
          headerRow: attributes.headerRowCount === '1',
        };
        break;
      default:
        this.parser = this.map[node.name];
        if (this.parser) {
          this.parser.parseOpen(node);
        }
        break;
    }
    return true;
  }

  parseText(text) {
    if (this.parser) {
      this.parser.parseText(text);
    }
  }

  parseClose(name) {
    if (this.parser) {
      if (!this.parser.parseClose(name)) {
        this.parser = undefined;
      }
      return true;
    }
    switch (name) {
      case this.tag:
        this.model.columns = this.map.tableColumns.model;
        if (this.map.autoFilter.model) {
          this.model.autoFilterRef = this.map.autoFilter.model.autoFilterRef;
          this.map.autoFilter.model.columns.forEach((column, index) => {
            this.model.columns[index].filterButton = column.filterButton;
          });
        }
        this.model.style = this.map.tableStyleInfo.model;
        return false;
      default:
        // could be some unrecognised tags
        return true;
    }
  }

  reconcile(model, options) {
    // fetch the dfxs from styles
    model.columns.forEach(column => {
      if (column.dxfId !== undefined) {
        column.style = options.styles.getDxfStyle(column.dxfId);
      }
    });
  }
}

TableXform.TABLE_ATTRIBUTES = {
  xmlns: 'http://schemas.openxmlformats.org/spreadsheetml/2006/main',
  'xmlns:mc': 'http://schemas.openxmlformats.org/markup-compatibility/2006',
  'mc:Ignorable': 'xr xr3',
  'xmlns:xr': 'http://schemas.microsoft.com/office/spreadsheetml/2014/revision',
  'xmlns:xr3': 'http://schemas.microsoft.com/office/spreadsheetml/2016/revision3',
  // 'xr:uid': '{00000000-000C-0000-FFFF-FFFF00000000}',
};

module.exports = TableXform;

}, function(modId) { var map = {"../../../utils/xml-stream":1676879951337,"../base-xform":1676879951340,"../list-xform":1676879951343,"./auto-filter-xform":1676879951439,"./table-column-xform":1676879951441,"./table-style-info-xform":1676879951442}; return __REQUIRE__(map[modId], modId); })
__DEFINE__(1676879951439, function(require, module, exports) {
const BaseXform = require('../base-xform');

const FilterColumnXform = require('./filter-column-xform');

class AutoFilterXform extends BaseXform {
  constructor() {
    super();

    this.map = {
      filterColumn: new FilterColumnXform(),
    };
  }

  get tag() {
    return 'autoFilter';
  }

  prepare(model) {
    model.columns.forEach((column, index) => {
      this.map.filterColumn.prepare(column, {index});
    });
  }

  render(xmlStream, model) {
    xmlStream.openNode(this.tag, {ref: model.autoFilterRef});

    model.columns.forEach(column => {
      this.map.filterColumn.render(xmlStream, column);
    });

    xmlStream.closeNode();
    return true;
  }

  parseOpen(node) {
    if (this.parser) {
      this.parser.parseOpen(node);
      return true;
    }
    switch (node.name) {
      case this.tag:
        this.model = {
          autoFilterRef: node.attributes.ref,
          columns: [],
        };
        return true;

      default:
        this.parser = this.map[node.name];
        if (this.parser) {
          this.parseOpen(node);
          return true;
        }
        throw new Error(`Unexpected xml node in parseOpen: ${JSON.stringify(node)}`);
    }
  }

  parseText(text) {
    if (this.parser) {
      this.parser.parseText(text);
    }
  }

  parseClose(name) {
    if (this.parser) {
      if (!this.parser.parseClose(name)) {
        this.model.columns.push(this.parser.model);
        this.parser = undefined;
      }
      return true;
    }
    switch (name) {
      case this.tag:
        return false;
      default:
        throw new Error(`Unexpected xml node in parseClose: ${name}`);
    }
  }
}

module.exports = AutoFilterXform;

}, function(modId) { var map = {"../base-xform":1676879951340,"./filter-column-xform":1676879951440}; return __REQUIRE__(map[modId], modId); })
__DEFINE__(1676879951440, function(require, module, exports) {
const BaseXform = require('../base-xform');

class FilterColumnXform extends BaseXform {
  get tag() {
    return 'filterColumn';
  }

  prepare(model, options) {
    model.colId = options.index.toString();
  }

  render(xmlStream, model) {
    xmlStream.leafNode(this.tag, {
      colId: model.colId,
      hiddenButton: model.filterButton ? '0' : '1',
    });
    return true;
  }

  parseOpen(node) {
    if (node.name === this.tag) {
      const {attributes} = node;
      this.model = {
        filterButton: attributes.hiddenButton === '0',
      };
      return true;
    }
    return false;
  }

  parseText() {}

  parseClose() {
    return false;
  }
}

module.exports = FilterColumnXform;

}, function(modId) { var map = {"../base-xform":1676879951340}; return __REQUIRE__(map[modId], modId); })
__DEFINE__(1676879951441, function(require, module, exports) {
const BaseXform = require('../base-xform');

class TableColumnXform extends BaseXform {
  get tag() {
    return 'tableColumn';
  }

  prepare(model, options) {
    model.id = options.index + 1;
  }

  render(xmlStream, model) {
    xmlStream.leafNode(this.tag, {
      id: model.id.toString(),
      name: model.name,
      totalsRowLabel: model.totalsRowLabel,
      totalsRowFunction: model.totalsRowFunction,
      dxfId: model.dxfId,
    });
    return true;
  }

  parseOpen(node) {
    if (node.name === this.tag) {
      const {attributes} = node;
      this.model = {
        name: attributes.name,
        totalsRowLabel: attributes.totalsRowLabel,
        totalsRowFunction: attributes.totalsRowFunction,
        dxfId: attributes.dxfId,
      };
      return true;
    }
    return false;
  }

  parseText() {}

  parseClose() {
    return false;
  }
}

module.exports = TableColumnXform;

}, function(modId) { var map = {"../base-xform":1676879951340}; return __REQUIRE__(map[modId], modId); })
__DEFINE__(1676879951442, function(require, module, exports) {
const BaseXform = require('../base-xform');

class TableStyleInfoXform extends BaseXform {
  get tag() {
    return 'tableStyleInfo';
  }

  render(xmlStream, model) {
    xmlStream.leafNode(this.tag, {
      name: model.theme ? model.theme : undefined,
      showFirstColumn: model.showFirstColumn ? '1' : '0',
      showLastColumn: model.showLastColumn ? '1' : '0',
      showRowStripes: model.showRowStripes ? '1' : '0',
      showColumnStripes: model.showColumnStripes ? '1' : '0',
    });
    return true;
  }

  parseOpen(node) {
    if (node.name === this.tag) {
      const {attributes} = node;
      this.model = {
        theme: attributes.name ? attributes.name : null,
        showFirstColumn: attributes.showFirstColumn === '1',
        showLastColumn: attributes.showLastColumn === '1',
        showRowStripes: attributes.showRowStripes === '1',
        showColumnStripes: attributes.showColumnStripes === '1',
      };
      return true;
    }
    return false;
  }

  parseText() {}

  parseClose() {
    return false;
  }
}

module.exports = TableStyleInfoXform;

}, function(modId) { var map = {"../base-xform":1676879951340}; return __REQUIRE__(map[modId], modId); })
__DEFINE__(1676879951443, function(require, module, exports) {
const XmlStream = require('../../../utils/xml-stream');
const utils = require('../../../utils/utils');
const BaseXform = require('../base-xform');

const CommentXform = require('./comment-xform');

const CommentsXform = (module.exports = function() {
  this.map = {
    comment: new CommentXform(),
  };
});

utils.inherits(
  CommentsXform,
  BaseXform,
  {
    COMMENTS_ATTRIBUTES: {
      xmlns: 'http://schemas.openxmlformats.org/spreadsheetml/2006/main',
    },
  },
  {
    render(xmlStream, model) {
      model = model || this.model;
      xmlStream.openXml(XmlStream.StdDocAttributes);
      xmlStream.openNode('comments', CommentsXform.COMMENTS_ATTRIBUTES);

      // authors
      // TODO: support authors properly
      xmlStream.openNode('authors');
      xmlStream.leafNode('author', null, 'Author');
      xmlStream.closeNode();

      // comments
      xmlStream.openNode('commentList');
      model.comments.forEach(comment => {
        this.map.comment.render(xmlStream, comment);
      });
      xmlStream.closeNode();
      xmlStream.closeNode();
    },

    parseOpen(node) {
      if (this.parser) {
        this.parser.parseOpen(node);
        return true;
      }
      switch (node.name) {
        case 'commentList':
          this.model = {
            comments: [],
          };
          return true;
        case 'comment':
          this.parser = this.map.comment;
          this.parser.parseOpen(node);
          return true;
        default:
          return false;
      }
    },
    parseText(text) {
      if (this.parser) {
        this.parser.parseText(text);
      }
    },
    parseClose(name) {
      switch (name) {
        case 'commentList':
          return false;
        case 'comment':
          this.model.comments.push(this.parser.model);
          this.parser = undefined;
          return true;
        default:
          if (this.parser) {
            this.parser.parseClose(name);
          }
          return true;
      }
    },
  }
);

}, function(modId) { var map = {"../../../utils/xml-stream":1676879951337,"../../../utils/utils":1676879951334,"../base-xform":1676879951340,"./comment-xform":1676879951444}; return __REQUIRE__(map[modId], modId); })
__DEFINE__(1676879951444, function(require, module, exports) {
const RichTextXform = require('../strings/rich-text-xform');
const utils = require('../../../utils/utils');
const BaseXform = require('../base-xform');

/**
  <comment ref="B1" authorId="0">
    <text>
      <r>
        <rPr>
          <b/>
          <sz val="9"/>
          <rFont val="宋体"/>
          <charset val="134"/>
        </rPr>
        <t>51422:</t>
      </r>
      <r>
        <rPr>
          <sz val="9"/>
          <rFont val="宋体"/>
          <charset val="134"/>
        </rPr>
        <t xml:space="preserve">&#10;test</t>
      </r>
    </text>
  </comment>
 */

const CommentXform = (module.exports = function(model) {
  this.model = model;
});

utils.inherits(CommentXform, BaseXform, {
  get tag() {
    return 'r';
  },

  get richTextXform() {
    if (!this._richTextXform) {
      this._richTextXform = new RichTextXform();
    }
    return this._richTextXform;
  },

  render(xmlStream, model) {
    model = model || this.model;

    xmlStream.openNode('comment', {
      ref: model.ref,
      authorId: 0,
    });
    xmlStream.openNode('text');
    if (model && model.note && model.note.texts) {
      model.note.texts.forEach(text => {
        this.richTextXform.render(xmlStream, text);
      });
    }
    xmlStream.closeNode();
    xmlStream.closeNode();
  },

  parseOpen(node) {
    if (this.parser) {
      this.parser.parseOpen(node);
      return true;
    }
    switch (node.name) {
      case 'comment':
        this.model = {
          type: 'note',
          note: {
            texts: [],
          },
          ...node.attributes,
        };
        return true;
      case 'r':
        this.parser = this.richTextXform;
        this.parser.parseOpen(node);
        return true;
      default:
        return false;
    }
  },
  parseText(text) {
    if (this.parser) {
      this.parser.parseText(text);
    }
  },
  parseClose(name) {
    switch (name) {
      case 'comment':
        return false;
      case 'r':
        this.model.note.texts.push(this.parser.model);
        this.parser = undefined;
        return true;
      default:
        if (this.parser) {
          this.parser.parseClose(name);
        }
        return true;
    }
  },
});

}, function(modId) { var map = {"../strings/rich-text-xform":1676879951363,"../../../utils/utils":1676879951334,"../base-xform":1676879951340}; return __REQUIRE__(map[modId], modId); })
__DEFINE__(1676879951445, function(require, module, exports) {
const XmlStream = require('../../../utils/xml-stream');

const BaseXform = require('../base-xform');
const VmlShapeXform = require('./vml-shape-xform');

// This class is (currently) single purposed to insert the triangle
// drawing icons on commented cells
class VmlNotesXform extends BaseXform {
  constructor() {
    super();
    this.map = {
      'v:shape': new VmlShapeXform(),
    };
  }

  get tag() {
    return 'xml';
  }

  render(xmlStream, model) {
    xmlStream.openXml(XmlStream.StdDocAttributes);
    xmlStream.openNode(this.tag, VmlNotesXform.DRAWING_ATTRIBUTES);

    xmlStream.openNode('o:shapelayout', {'v:ext': 'edit'});
    xmlStream.leafNode('o:idmap', {'v:ext': 'edit', data: 1});
    xmlStream.closeNode();

    xmlStream.openNode('v:shapetype', {
      id: '_x0000_t202',
      coordsize: '21600,21600',
      'o:spt': 202,
      path: 'm,l,21600r21600,l21600,xe',
    });
    xmlStream.leafNode('v:stroke', {joinstyle: 'miter'});
    xmlStream.leafNode('v:path', {gradientshapeok: 't', 'o:connecttype': 'rect'});
    xmlStream.closeNode();

    model.comments.forEach((item, index) => {
      this.map['v:shape'].render(xmlStream, item, index);
    });

    xmlStream.closeNode();
  }

  parseOpen(node) {
    if (this.parser) {
      this.parser.parseOpen(node);
      return true;
    }
    switch (node.name) {
      case this.tag:
        this.reset();
        this.model = {
          comments: [],
        };
        break;
      default:
        this.parser = this.map[node.name];
        if (this.parser) {
          this.parser.parseOpen(node);
        }
        break;
    }
    return true;
  }

  parseText(text) {
    if (this.parser) {
      this.parser.parseText(text);
    }
  }

  parseClose(name) {
    if (this.parser) {
      if (!this.parser.parseClose(name)) {
        this.model.comments.push(this.parser.model);
        this.parser = undefined;
      }
      return true;
    }
    switch (name) {
      case this.tag:
        return false;
      default:
        // could be some unrecognised tags
        return true;
    }
  }

  reconcile(model, options) {
    model.anchors.forEach(anchor => {
      if (anchor.br) {
        this.map['xdr:twoCellAnchor'].reconcile(anchor, options);
      } else {
        this.map['xdr:oneCellAnchor'].reconcile(anchor, options);
      }
    });
  }
}

VmlNotesXform.DRAWING_ATTRIBUTES = {
  'xmlns:v': 'urn:schemas-microsoft-com:vml',
  'xmlns:o': 'urn:schemas-microsoft-com:office:office',
  'xmlns:x': 'urn:schemas-microsoft-com:office:excel',
};

module.exports = VmlNotesXform;

}, function(modId) { var map = {"../../../utils/xml-stream":1676879951337,"../base-xform":1676879951340,"./vml-shape-xform":1676879951446}; return __REQUIRE__(map[modId], modId); })
__DEFINE__(1676879951446, function(require, module, exports) {
const BaseXform = require('../base-xform');
const VmlTextboxXform = require('./vml-textbox-xform');
const VmlClientDataXform = require('./vml-client-data-xform');

class VmlShapeXform extends BaseXform {
  constructor() {
    super();
    this.map = {
      'v:textbox': new VmlTextboxXform(),
      'x:ClientData': new VmlClientDataXform(),
    };
  }

  get tag() {
    return 'v:shape';
  }

  render(xmlStream, model, index) {
    xmlStream.openNode('v:shape', VmlShapeXform.V_SHAPE_ATTRIBUTES(model, index));

    xmlStream.leafNode('v:fill', {color2: 'infoBackground [80]'});
    xmlStream.leafNode('v:shadow', {color: 'none [81]', obscured: 't'});
    xmlStream.leafNode('v:path', {'o:connecttype': 'none'});
    this.map['v:textbox'].render(xmlStream, model);
    this.map['x:ClientData'].render(xmlStream, model);

    xmlStream.closeNode();
  }

  parseOpen(node) {
    if (this.parser) {
      this.parser.parseOpen(node);
      return true;
    }

    switch (node.name) {
      case this.tag:
        this.reset();
        this.model = {
          margins: {
            insetmode: node.attributes['o:insetmode'],
          },
          anchor: '',
          editAs: '',
          protection: {},
        };
        break;
      default:
        this.parser = this.map[node.name];
        if (this.parser) {
          this.parser.parseOpen(node);
        }
        break;
    }
    return true;
  }

  parseText(text) {
    if (this.parser) {
      this.parser.parseText(text);
    }
  }

  parseClose(name) {
    if (this.parser) {
      if (!this.parser.parseClose(name)) {
        this.parser = undefined;
      }
      return true;
    }
    switch (name) {
      case this.tag:
        this.model.margins.inset = this.map['v:textbox'].model && this.map['v:textbox'].model.inset;
        this.model.protection =
          this.map['x:ClientData'].model && this.map['x:ClientData'].model.protection;
        this.model.anchor = this.map['x:ClientData'].model && this.map['x:ClientData'].model.anchor;
        this.model.editAs = this.map['x:ClientData'].model && this.map['x:ClientData'].model.editAs;
        return false;
      default:
        return true;
    }
  }
}

VmlShapeXform.V_SHAPE_ATTRIBUTES = (model, index) => ({
  id: `_x0000_s${1025 + index}`,
  type: '#_x0000_t202',
  style:
    'position:absolute; margin-left:105.3pt;margin-top:10.5pt;width:97.8pt;height:59.1pt;z-index:1;visibility:hidden',
  fillcolor: 'infoBackground [80]',
  strokecolor: 'none [81]',
  'o:insetmode': model.note.margins && model.note.margins.insetmode,
});

module.exports = VmlShapeXform;

}, function(modId) { var map = {"../base-xform":1676879951340,"./vml-textbox-xform":1676879951447,"./vml-client-data-xform":1676879951448}; return __REQUIRE__(map[modId], modId); })
__DEFINE__(1676879951447, function(require, module, exports) {
const BaseXform = require('../base-xform');

class VmlTextboxXform extends BaseXform {
  get tag() {
    return 'v:textbox';
  }

  conversionUnit(value, multiple, unit) {
    return `${parseFloat(value) * multiple.toFixed(2)}${unit}`;
  }

  reverseConversionUnit(inset) {
    return (inset || '').split(',').map(margin => {
      return Number(parseFloat(this.conversionUnit(parseFloat(margin), 0.1, '')).toFixed(2));
    });
  }

  render(xmlStream, model) {
    const attributes = {
      style: 'mso-direction-alt:auto',
    };
    if (model && model.note) {
      let {inset} = model.note && model.note.margins;
      if (Array.isArray(inset)) {
        inset = inset
          .map(margin => {
            return this.conversionUnit(margin, 10, 'mm');
          })
          .join(',');
      }
      if (inset) {
        attributes.inset = inset;
      }
    }
    xmlStream.openNode('v:textbox', attributes);
    xmlStream.leafNode('div', {style: 'text-align:left'});
    xmlStream.closeNode();
  }

  parseOpen(node) {
    switch (node.name) {
      case this.tag:
        this.model = {
          inset: this.reverseConversionUnit(node.attributes.inset),
        };
        return true;
      default:
        return true;
    }
  }

  parseText() {}

  parseClose(name) {
    switch (name) {
      case this.tag:
        return false;
      default:
        return true;
    }
  }
}

module.exports = VmlTextboxXform;

}, function(modId) { var map = {"../base-xform":1676879951340}; return __REQUIRE__(map[modId], modId); })
__DEFINE__(1676879951448, function(require, module, exports) {
const BaseXform = require('../base-xform');

const VmlAnchorXform = require('./vml-anchor-xform');
const VmlProtectionXform = require('./style/vml-protection-xform');
const VmlPositionXform = require('./style/vml-position-xform');

const POSITION_TYPE = ['twoCells', 'oneCells', 'absolute'];

class VmlClientDataXform extends BaseXform {
  constructor() {
    super();
    this.map = {
      'x:Anchor': new VmlAnchorXform(),
      'x:Locked': new VmlProtectionXform({tag: 'x:Locked'}),
      'x:LockText': new VmlProtectionXform({tag: 'x:LockText'}),
      'x:SizeWithCells': new VmlPositionXform({tag: 'x:SizeWithCells'}),
      'x:MoveWithCells': new VmlPositionXform({tag: 'x:MoveWithCells'}),
    };
  }

  get tag() {
    return 'x:ClientData';
  }

  render(xmlStream, model) {
    const {protection, editAs} = model.note;
    xmlStream.openNode(this.tag, {ObjectType: 'Note'});
    this.map['x:MoveWithCells'].render(xmlStream, editAs, POSITION_TYPE);
    this.map['x:SizeWithCells'].render(xmlStream, editAs, POSITION_TYPE);
    this.map['x:Anchor'].render(xmlStream, model);
    this.map['x:Locked'].render(xmlStream, protection.locked);
    xmlStream.leafNode('x:AutoFill', null, 'False');
    this.map['x:LockText'].render(xmlStream, protection.lockText);
    xmlStream.leafNode('x:Row', null, model.refAddress.row - 1);
    xmlStream.leafNode('x:Column', null, model.refAddress.col - 1);
    xmlStream.closeNode();
  }

  parseOpen(node) {
    switch (node.name) {
      case this.tag:
        this.reset();
        this.model = {
          anchor: [],
          protection: {},
          editAs: '',
        };
        break;
      default:
        this.parser = this.map[node.name];
        if (this.parser) {
          this.parser.parseOpen(node);
        }
        break;
    }
    return true;
  }

  parseText(text) {
    if (this.parser) {
      this.parser.parseText(text);
    }
  }

  parseClose(name) {
    if (this.parser) {
      if (!this.parser.parseClose(name)) {
        this.parser = undefined;
      }
      return true;
    }
    switch (name) {
      case this.tag:
        this.normalizeModel();
        return false;
      default:
        return true;
    }
  }

  normalizeModel() {
    const position = Object.assign(
      {},
      this.map['x:MoveWithCells'].model,
      this.map['x:SizeWithCells'].model
    );
    const len = Object.keys(position).length;
    this.model.editAs = POSITION_TYPE[len];
    this.model.anchor = this.map['x:Anchor'].text;
    this.model.protection.locked = this.map['x:Locked'].text;
    this.model.protection.lockText = this.map['x:LockText'].text;
  }
}

module.exports = VmlClientDataXform;

}, function(modId) { var map = {"../base-xform":1676879951340,"./vml-anchor-xform":1676879951449,"./style/vml-protection-xform":1676879951450,"./style/vml-position-xform":1676879951451}; return __REQUIRE__(map[modId], modId); })
__DEFINE__(1676879951449, function(require, module, exports) {
const BaseXform = require('../base-xform');

// render the triangle in the cell for the comment
class VmlAnchorXform extends BaseXform {
  get tag() {
    return 'x:Anchor';
  }

  getAnchorRect(anchor) {
    const l = Math.floor(anchor.left);
    const lf = Math.floor((anchor.left - l) * 68);
    const t = Math.floor(anchor.top);
    const tf = Math.floor((anchor.top - t) * 18);
    const r = Math.floor(anchor.right);
    const rf = Math.floor((anchor.right - r) * 68);
    const b = Math.floor(anchor.bottom);
    const bf = Math.floor((anchor.bottom - b) * 18);
    return [l, lf, t, tf, r, rf, b, bf];
  }

  getDefaultRect(ref) {
    const l = ref.col;
    const lf = 6;
    const t = Math.max(ref.row - 2, 0);
    const tf = 14;
    const r = l + 2;
    const rf = 2;
    const b = t + 4;
    const bf = 16;
    return [l, lf, t, tf, r, rf, b, bf];
  }

  render(xmlStream, model) {
    const rect = model.anchor
      ? this.getAnchorRect(model.anchor)
      : this.getDefaultRect(model.refAddress);

    xmlStream.leafNode('x:Anchor', null, rect.join(', '));
  }

  parseOpen(node) {
    switch (node.name) {
      case this.tag:
        this.text = '';
        return true;
      default:
        return false;
    }
  }

  parseText(text) {
    this.text = text;
  }

  parseClose() {
    return false;
  }
}

module.exports = VmlAnchorXform;

}, function(modId) { var map = {"../base-xform":1676879951340}; return __REQUIRE__(map[modId], modId); })
__DEFINE__(1676879951450, function(require, module, exports) {
const BaseXform = require('../../base-xform');

class VmlProtectionXform extends BaseXform {
  constructor(model) {
    super();
    this._model = model;
  }

  get tag() {
    return this._model && this._model.tag;
  }

  render(xmlStream, model) {
    xmlStream.leafNode(this.tag, null, model);
  }

  parseOpen(node) {
    switch (node.name) {
      case this.tag:
        this.text = '';
        return true;
      default:
        return false;
    }
  }

  parseText(text) {
    this.text = text;
  }

  parseClose() {
    return false;
  }
}

module.exports = VmlProtectionXform;

}, function(modId) { var map = {"../../base-xform":1676879951340}; return __REQUIRE__(map[modId], modId); })
__DEFINE__(1676879951451, function(require, module, exports) {
const BaseXform = require('../../base-xform');

class VmlPositionXform extends BaseXform {
  constructor(model) {
    super();
    this._model = model;
  }

  get tag() {
    return this._model && this._model.tag;
  }

  render(xmlStream, model, type) {
    if (model === type[2]) {
      xmlStream.leafNode(this.tag);
    } else if (this.tag === 'x:SizeWithCells' && model === type[1]) {
      xmlStream.leafNode(this.tag);
    }
  }

  parseOpen(node) {
    switch (node.name) {
      case this.tag:
        this.model = {};
        this.model[this.tag] = true;
        return true;
      default:
        return false;
    }
  }

  parseText() {}

  parseClose() {
    return false;
  }
}

module.exports = VmlPositionXform;

}, function(modId) { var map = {"../../base-xform":1676879951340}; return __REQUIRE__(map[modId], modId); })
__DEFINE__(1676879951452, function(require, module, exports) {
/* eslint-disable */
module.exports =
  '<?xml version="1.0" encoding="UTF-8" standalone="yes"?>\n<a:theme xmlns:a="http://schemas.openxmlformats.org/drawingml/2006/main" name="Office Theme"> <a:themeElements> <a:clrScheme name="Office"> <a:dk1> <a:sysClr val="windowText" lastClr="000000"/> </a:dk1> <a:lt1> <a:sysClr val="window" lastClr="FFFFFF"/> </a:lt1> <a:dk2> <a:srgbClr val="1F497D"/> </a:dk2> <a:lt2> <a:srgbClr val="EEECE1"/> </a:lt2> <a:accent1> <a:srgbClr val="4F81BD"/> </a:accent1> <a:accent2> <a:srgbClr val="C0504D"/> </a:accent2> <a:accent3> <a:srgbClr val="9BBB59"/> </a:accent3> <a:accent4> <a:srgbClr val="8064A2"/> </a:accent4> <a:accent5> <a:srgbClr val="4BACC6"/> </a:accent5> <a:accent6> <a:srgbClr val="F79646"/> </a:accent6> <a:hlink> <a:srgbClr val="0000FF"/> </a:hlink> <a:folHlink> <a:srgbClr val="800080"/> </a:folHlink> </a:clrScheme> <a:fontScheme name="Office"> <a:majorFont> <a:latin typeface="Cambria"/> <a:ea typeface=""/> <a:cs typeface=""/> <a:font script="Jpan" typeface="ＭＳ Ｐゴシック"/> <a:font script="Hang" typeface="맑은 고딕"/> <a:font script="Hans" typeface="宋体"/> <a:font script="Hant" typeface="新細明體"/> <a:font script="Arab" typeface="Times New Roman"/> <a:font script="Hebr" typeface="Times New Roman"/> <a:font script="Thai" typeface="Tahoma"/> <a:font script="Ethi" typeface="Nyala"/> <a:font script="Beng" typeface="Vrinda"/> <a:font script="Gujr" typeface="Shruti"/> <a:font script="Khmr" typeface="MoolBoran"/> <a:font script="Knda" typeface="Tunga"/> <a:font script="Guru" typeface="Raavi"/> <a:font script="Cans" typeface="Euphemia"/> <a:font script="Cher" typeface="Plantagenet Cherokee"/> <a:font script="Yiii" typeface="Microsoft Yi Baiti"/> <a:font script="Tibt" typeface="Microsoft Himalaya"/> <a:font script="Thaa" typeface="MV Boli"/> <a:font script="Deva" typeface="Mangal"/> <a:font script="Telu" typeface="Gautami"/> <a:font script="Taml" typeface="Latha"/> <a:font script="Syrc" typeface="Estrangelo Edessa"/> <a:font script="Orya" typeface="Kalinga"/> <a:font script="Mlym" typeface="Kartika"/> <a:font script="Laoo" typeface="DokChampa"/> <a:font script="Sinh" typeface="Iskoola Pota"/> <a:font script="Mong" typeface="Mongolian Baiti"/> <a:font script="Viet" typeface="Times New Roman"/> <a:font script="Uigh" typeface="Microsoft Uighur"/> <a:font script="Geor" typeface="Sylfaen"/> </a:majorFont> <a:minorFont> <a:latin typeface="Calibri"/> <a:ea typeface=""/> <a:cs typeface=""/> <a:font script="Jpan" typeface="ＭＳ Ｐゴシック"/> <a:font script="Hang" typeface="맑은 고딕"/> <a:font script="Hans" typeface="宋体"/> <a:font script="Hant" typeface="新細明體"/> <a:font script="Arab" typeface="Arial"/> <a:font script="Hebr" typeface="Arial"/> <a:font script="Thai" typeface="Tahoma"/> <a:font script="Ethi" typeface="Nyala"/> <a:font script="Beng" typeface="Vrinda"/> <a:font script="Gujr" typeface="Shruti"/> <a:font script="Khmr" typeface="DaunPenh"/> <a:font script="Knda" typeface="Tunga"/> <a:font script="Guru" typeface="Raavi"/> <a:font script="Cans" typeface="Euphemia"/> <a:font script="Cher" typeface="Plantagenet Cherokee"/> <a:font script="Yiii" typeface="Microsoft Yi Baiti"/> <a:font script="Tibt" typeface="Microsoft Himalaya"/> <a:font script="Thaa" typeface="MV Boli"/> <a:font script="Deva" typeface="Mangal"/> <a:font script="Telu" typeface="Gautami"/> <a:font script="Taml" typeface="Latha"/> <a:font script="Syrc" typeface="Estrangelo Edessa"/> <a:font script="Orya" typeface="Kalinga"/> <a:font script="Mlym" typeface="Kartika"/> <a:font script="Laoo" typeface="DokChampa"/> <a:font script="Sinh" typeface="Iskoola Pota"/> <a:font script="Mong" typeface="Mongolian Baiti"/> <a:font script="Viet" typeface="Arial"/> <a:font script="Uigh" typeface="Microsoft Uighur"/> <a:font script="Geor" typeface="Sylfaen"/> </a:minorFont> </a:fontScheme> <a:fmtScheme name="Office"> <a:fillStyleLst> <a:solidFill> <a:schemeClr val="phClr"/> </a:solidFill> <a:gradFill rotWithShape="1"> <a:gsLst> <a:gs pos="0"> <a:schemeClr val="phClr"> <a:tint val="50000"/> <a:satMod val="300000"/> </a:schemeClr> </a:gs> <a:gs pos="35000"> <a:schemeClr val="phClr"> <a:tint val="37000"/> <a:satMod val="300000"/> </a:schemeClr> </a:gs> <a:gs pos="100000"> <a:schemeClr val="phClr"> <a:tint val="15000"/> <a:satMod val="350000"/> </a:schemeClr> </a:gs> </a:gsLst> <a:lin ang="16200000" scaled="1"/> </a:gradFill> <a:gradFill rotWithShape="1"> <a:gsLst> <a:gs pos="0"> <a:schemeClr val="phClr"> <a:tint val="100000"/> <a:shade val="100000"/> <a:satMod val="130000"/> </a:schemeClr> </a:gs> <a:gs pos="100000"> <a:schemeClr val="phClr"> <a:tint val="50000"/> <a:shade val="100000"/> <a:satMod val="350000"/> </a:schemeClr> </a:gs> </a:gsLst> <a:lin ang="16200000" scaled="0"/> </a:gradFill> </a:fillStyleLst> <a:lnStyleLst> <a:ln w="9525" cap="flat" cmpd="sng" algn="ctr"> <a:solidFill> <a:schemeClr val="phClr"> <a:shade val="95000"/> <a:satMod val="105000"/> </a:schemeClr> </a:solidFill> <a:prstDash val="solid"/> </a:ln> <a:ln w="25400" cap="flat" cmpd="sng" algn="ctr"> <a:solidFill> <a:schemeClr val="phClr"/> </a:solidFill> <a:prstDash val="solid"/> </a:ln> <a:ln w="38100" cap="flat" cmpd="sng" algn="ctr"> <a:solidFill> <a:schemeClr val="phClr"/> </a:solidFill> <a:prstDash val="solid"/> </a:ln> </a:lnStyleLst> <a:effectStyleLst> <a:effectStyle> <a:effectLst> <a:outerShdw blurRad="40000" dist="20000" dir="5400000" rotWithShape="0"> <a:srgbClr val="000000"> <a:alpha val="38000"/> </a:srgbClr> </a:outerShdw> </a:effectLst> </a:effectStyle> <a:effectStyle> <a:effectLst> <a:outerShdw blurRad="40000" dist="23000" dir="5400000" rotWithShape="0"> <a:srgbClr val="000000"> <a:alpha val="35000"/> </a:srgbClr> </a:outerShdw> </a:effectLst> </a:effectStyle> <a:effectStyle> <a:effectLst> <a:outerShdw blurRad="40000" dist="23000" dir="5400000" rotWithShape="0"> <a:srgbClr val="000000"> <a:alpha val="35000"/> </a:srgbClr> </a:outerShdw> </a:effectLst> <a:scene3d> <a:camera prst="orthographicFront"> <a:rot lat="0" lon="0" rev="0"/> </a:camera> <a:lightRig rig="threePt" dir="t"> <a:rot lat="0" lon="0" rev="1200000"/> </a:lightRig> </a:scene3d> <a:sp3d> <a:bevelT w="63500" h="25400"/> </a:sp3d> </a:effectStyle> </a:effectStyleLst> <a:bgFillStyleLst> <a:solidFill> <a:schemeClr val="phClr"/> </a:solidFill> <a:gradFill rotWithShape="1"> <a:gsLst> <a:gs pos="0"> <a:schemeClr val="phClr"> <a:tint val="40000"/> <a:satMod val="350000"/> </a:schemeClr> </a:gs> <a:gs pos="40000"> <a:schemeClr val="phClr"> <a:tint val="45000"/> <a:shade val="99000"/> <a:satMod val="350000"/> </a:schemeClr> </a:gs> <a:gs pos="100000"> <a:schemeClr val="phClr"> <a:shade val="20000"/> <a:satMod val="255000"/> </a:schemeClr> </a:gs> </a:gsLst> <a:path path="circle"> <a:fillToRect l="50000" t="-80000" r="50000" b="180000"/> </a:path> </a:gradFill> <a:gradFill rotWithShape="1"> <a:gsLst> <a:gs pos="0"> <a:schemeClr val="phClr"> <a:tint val="80000"/> <a:satMod val="300000"/> </a:schemeClr> </a:gs> <a:gs pos="100000"> <a:schemeClr val="phClr"> <a:shade val="30000"/> <a:satMod val="200000"/> </a:schemeClr> </a:gs> </a:gsLst> <a:path path="circle"> <a:fillToRect l="50000" t="50000" r="50000" b="50000"/> </a:path> </a:gradFill> </a:bgFillStyleLst> </a:fmtScheme> </a:themeElements> <a:objectDefaults> <a:spDef> <a:spPr/> <a:bodyPr/> <a:lstStyle/> <a:style> <a:lnRef idx="1"> <a:schemeClr val="accent1"/> </a:lnRef> <a:fillRef idx="3"> <a:schemeClr val="accent1"/> </a:fillRef> <a:effectRef idx="2"> <a:schemeClr val="accent1"/> </a:effectRef> <a:fontRef idx="minor"> <a:schemeClr val="lt1"/> </a:fontRef> </a:style> </a:spDef> <a:lnDef> <a:spPr/> <a:bodyPr/> <a:lstStyle/> <a:style> <a:lnRef idx="2"> <a:schemeClr val="accent1"/> </a:lnRef> <a:fillRef idx="0"> <a:schemeClr val="accent1"/> </a:fillRef> <a:effectRef idx="1"> <a:schemeClr val="accent1"/> </a:effectRef> <a:fontRef idx="minor"> <a:schemeClr val="tx1"/> </a:fontRef> </a:style> </a:lnDef> </a:objectDefaults> <a:extraClrSchemeLst/> </a:theme>';

}, function(modId) { var map = {}; return __REQUIRE__(map[modId], modId); })
__DEFINE__(1676879951453, function(require, module, exports) {
const fs = require('fs');
const fastCsv = require('fast-csv');
const customParseFormat = require('dayjs/plugin/customParseFormat');
const utc = require('dayjs/plugin/utc');
const dayjs = require('dayjs').extend(customParseFormat).extend(utc);
const StreamBuf = require('../utils/stream-buf');

const {
  fs: {exists},
} = require('../utils/utils');

/* eslint-disable quote-props */
const SpecialValues = {
  true: true,
  false: false,
  '#N/A': {error: '#N/A'},
  '#REF!': {error: '#REF!'},
  '#NAME?': {error: '#NAME?'},
  '#DIV/0!': {error: '#DIV/0!'},
  '#NULL!': {error: '#NULL!'},
  '#VALUE!': {error: '#VALUE!'},
  '#NUM!': {error: '#NUM!'},
};
/* eslint-ensable quote-props */

class CSV {
  constructor(workbook) {
    this.workbook = workbook;
    this.worksheet = null;
  }

  async readFile(filename, options) {
    options = options || {};
    if (!(await exists(filename))) {
      throw new Error(`File not found: ${filename}`);
    }
    const stream = fs.createReadStream(filename);
    const worksheet = await this.read(stream, options);
    stream.close();
    return worksheet;
  }

  read(stream, options) {
    options = options || {};

    return new Promise((resolve, reject) => {
      const worksheet = this.workbook.addWorksheet(options.sheetName);

      const dateFormats = options.dateFormats || [
        'YYYY-MM-DD[T]HH:mm:ssZ',
        'YYYY-MM-DD[T]HH:mm:ss',
        'MM-DD-YYYY',
        'YYYY-MM-DD',
      ];
      const map =
        options.map ||
        function(datum) {
          if (datum === '') {
            return null;
          }
          const datumNumber = Number(datum);
          if (!Number.isNaN(datumNumber) && datumNumber !== Infinity) {
            return datumNumber;
          }
          const dt = dateFormats.reduce((matchingDate, currentDateFormat) => {
            if (matchingDate) {
              return matchingDate;
            }
            const dayjsObj = dayjs(datum, currentDateFormat, true);
            if (dayjsObj.isValid()) {
              return dayjsObj;
            }
            return null;
          }, null);
          if (dt) {
            return new Date(dt.valueOf());
          }
          const special = SpecialValues[datum];
          if (special !== undefined) {
            return special;
          }
          return datum;
        };

      const csvStream = fastCsv
        .parse(options.parserOptions)
        .on('data', data => {
          worksheet.addRow(data.map(map));
        })
        .on('end', () => {
          csvStream.emit('worksheet', worksheet);
        });

      csvStream.on('worksheet', resolve).on('error', reject);

      stream.pipe(csvStream);
    });
  }

  /**
   * @deprecated since version 4.0. You should use `CSV#read` instead. Please follow upgrade instruction: https://github.com/exceljs/exceljs/blob/master/UPGRADE-4.0.md
   */
  createInputStream() {
    throw new Error(
      '`CSV#createInputStream` is deprecated. You should use `CSV#read` instead. This method will be removed in version 5.0. Please follow upgrade instruction: https://github.com/exceljs/exceljs/blob/master/UPGRADE-4.0.md'
    );
  }

  write(stream, options) {
    return new Promise((resolve, reject) => {
      options = options || {};
      // const encoding = options.encoding || 'utf8';
      // const separator = options.separator || ',';
      // const quoteChar = options.quoteChar || '\'';

      const worksheet = this.workbook.getWorksheet(options.sheetName || options.sheetId);

      const csvStream = fastCsv.format(options.formatterOptions);
      stream.on('finish', () => {
        resolve();
      });
      csvStream.on('error', reject);
      csvStream.pipe(stream);

      const {dateFormat, dateUTC} = options;
      const map =
        options.map ||
        (value => {
          if (value) {
            if (value.text || value.hyperlink) {
              return value.hyperlink || value.text || '';
            }
            if (value.formula || value.result) {
              return value.result || '';
            }
            if (value instanceof Date) {
              if (dateFormat) {
                return dateUTC
                  ? dayjs.utc(value).format(dateFormat)
                  : dayjs(value).format(dateFormat);
              }
              return dateUTC ? dayjs.utc(value).format() : dayjs(value).format();
            }
            if (value.error) {
              return value.error;
            }
            if (typeof value === 'object') {
              return JSON.stringify(value);
            }
          }
          return value;
        });

      const includeEmptyRows = options.includeEmptyRows === undefined || options.includeEmptyRows;
      let lastRow = 1;
      if (worksheet) {
        worksheet.eachRow((row, rowNumber) => {
          if (includeEmptyRows) {
            while (lastRow++ < rowNumber - 1) {
              csvStream.write([]);
            }
          }
          const {values} = row;
          values.shift();
          csvStream.write(values.map(map));
          lastRow = rowNumber;
        });
      }
      csvStream.end();
    });
  }

  writeFile(filename, options) {
    options = options || {};

    const streamOptions = {
      encoding: options.encoding || 'utf8',
    };
    const stream = fs.createWriteStream(filename, streamOptions);

    return this.write(stream, options);
  }

  async writeBuffer(options) {
    const stream = new StreamBuf();
    await this.write(stream, options);
    return stream.read();
  }
}

module.exports = CSV;

}, function(modId) { var map = {"../utils/stream-buf":1676879951333,"../utils/utils":1676879951334}; return __REQUIRE__(map[modId], modId); })
__DEFINE__(1676879951454, function(require, module, exports) {


const XLSX = require('../xlsx/xlsx');

class ModelContainer {
  constructor(model) {
    this.model = model;
  }

  get xlsx() {
    if (!this._xlsx) {
      this._xlsx = new XLSX(this);
    }
    return this._xlsx;
  }
}

module.exports = ModelContainer;

}, function(modId) { var map = {"../xlsx/xlsx":1676879951331}; return __REQUIRE__(map[modId], modId); })
__DEFINE__(1676879951455, function(require, module, exports) {
const fs = require('fs');
const Archiver = require('archiver');

const StreamBuf = require('../../utils/stream-buf');

const RelType = require('../../xlsx/rel-type');
const StylesXform = require('../../xlsx/xform/style/styles-xform');
const SharedStrings = require('../../utils/shared-strings');
const DefinedNames = require('../../doc/defined-names');

const CoreXform = require('../../xlsx/xform/core/core-xform');
const RelationshipsXform = require('../../xlsx/xform/core/relationships-xform');
const ContentTypesXform = require('../../xlsx/xform/core/content-types-xform');
const AppXform = require('../../xlsx/xform/core/app-xform');
const WorkbookXform = require('../../xlsx/xform/book/workbook-xform');
const SharedStringsXform = require('../../xlsx/xform/strings/shared-strings-xform');

const WorksheetWriter = require('./worksheet-writer');

const theme1Xml = require('../../xlsx/xml/theme1.js');

class WorkbookWriter {
  constructor(options) {
    options = options || {};

    this.created = options.created || new Date();
    this.modified = options.modified || this.created;
    this.creator = options.creator || 'ExcelJS';
    this.lastModifiedBy = options.lastModifiedBy || 'ExcelJS';
    this.lastPrinted = options.lastPrinted;

    // using shared strings creates a smaller xlsx file but may use more memory
    this.useSharedStrings = options.useSharedStrings || false;
    this.sharedStrings = new SharedStrings();

    // style manager
    this.styles = options.useStyles ? new StylesXform(true) : new StylesXform.Mock(true);

    // defined names
    this._definedNames = new DefinedNames();

    this._worksheets = [];
    this.views = [];

    this.zipOptions = options.zip;

    this.media = [];
    this.commentRefs = [];

    this.zip = Archiver('zip', this.zipOptions);
    if (options.stream) {
      this.stream = options.stream;
    } else if (options.filename) {
      this.stream = fs.createWriteStream(options.filename);
    } else {
      this.stream = new StreamBuf();
    }
    this.zip.pipe(this.stream);

    // these bits can be added right now
    this.promise = Promise.all([this.addThemes(), this.addOfficeRels()]);
  }

  get definedNames() {
    return this._definedNames;
  }

  _openStream(path) {
    const stream = new StreamBuf({bufSize: 65536, batch: true});
    this.zip.append(stream, {name: path});
    stream.on('finish', () => {
      stream.emit('zipped');
    });
    return stream;
  }

  _commitWorksheets() {
    const commitWorksheet = function(worksheet) {
      if (!worksheet.committed) {
        return new Promise(resolve => {
          worksheet.stream.on('zipped', () => {
            resolve();
          });
          worksheet.commit();
        });
      }
      return Promise.resolve();
    };
    // if there are any uncommitted worksheets, commit them now and wait
    const promises = this._worksheets.map(commitWorksheet);
    if (promises.length) {
      return Promise.all(promises);
    }
    return Promise.resolve();
  }

  async commit() {
    // commit all worksheets, then add suplimentary files
    await this.promise;
    await this.addMedia();
    await this._commitWorksheets();
    await Promise.all([
      this.addContentTypes(),
      this.addApp(),
      this.addCore(),
      this.addSharedStrings(),
      this.addStyles(),
      this.addWorkbookRels(),
    ]);
    await this.addWorkbook();
    return this._finalize();
  }

  get nextId() {
    // find the next unique spot to add worksheet
    let i;
    for (i = 1; i < this._worksheets.length; i++) {
      if (!this._worksheets[i]) {
        return i;
      }
    }
    return this._worksheets.length || 1;
  }

  addImage(image) {
    const id = this.media.length;
    const medium = Object.assign({}, image, {type: 'image', name: `image${id}.${image.extension}`});
    this.media.push(medium);
    return id;
  }

  getImage(id) {
    return this.media[id];
  }

  addWorksheet(name, options) {
    // it's possible to add a worksheet with different than default
    // shared string handling
    // in fact, it's even possible to switch it mid-sheet
    options = options || {};
    const useSharedStrings =
      options.useSharedStrings !== undefined ? options.useSharedStrings : this.useSharedStrings;

    if (options.tabColor) {
      // eslint-disable-next-line no-console
      console.trace('tabColor option has moved to { properties: tabColor: {...} }');
      options.properties = Object.assign(
        {
          tabColor: options.tabColor,
        },
        options.properties
      );
    }

    const id = this.nextId;
    name = name || `sheet${id}`;

    const worksheet = new WorksheetWriter({
      id,
      name,
      workbook: this,
      useSharedStrings,
      properties: options.properties,
      state: options.state,
      pageSetup: options.pageSetup,
      views: options.views,
      autoFilter: options.autoFilter,
      headerFooter: options.headerFooter,
    });

    this._worksheets[id] = worksheet;
    return worksheet;
  }

  getWorksheet(id) {
    if (id === undefined) {
      return this._worksheets.find(() => true);
    }
    if (typeof id === 'number') {
      return this._worksheets[id];
    }
    if (typeof id === 'string') {
      return this._worksheets.find(worksheet => worksheet && worksheet.name === id);
    }
    return undefined;
  }

  addStyles() {
    return new Promise(resolve => {
      this.zip.append(this.styles.xml, {name: 'xl/styles.xml'});
      resolve();
    });
  }

  addThemes() {
    return new Promise(resolve => {
      this.zip.append(theme1Xml, {name: 'xl/theme/theme1.xml'});
      resolve();
    });
  }

  addOfficeRels() {
    return new Promise(resolve => {
      const xform = new RelationshipsXform();
      const xml = xform.toXml([
        {Id: 'rId1', Type: RelType.OfficeDocument, Target: 'xl/workbook.xml'},
        {Id: 'rId2', Type: RelType.CoreProperties, Target: 'docProps/core.xml'},
        {Id: 'rId3', Type: RelType.ExtenderProperties, Target: 'docProps/app.xml'},
      ]);
      this.zip.append(xml, {name: '/_rels/.rels'});
      resolve();
    });
  }

  addContentTypes() {
    return new Promise(resolve => {
      const model = {
        worksheets: this._worksheets.filter(Boolean),
        sharedStrings: this.sharedStrings,
        commentRefs: this.commentRefs,
        media: this.media,
      };
      const xform = new ContentTypesXform();
      const xml = xform.toXml(model);
      this.zip.append(xml, {name: '[Content_Types].xml'});
      resolve();
    });
  }

  addMedia() {
    return Promise.all(
      this.media.map(medium => {
        if (medium.type === 'image') {
          const filename = `xl/media/${medium.name}`;
          if (medium.filename) {
            return this.zip.file(medium.filename, {name: filename});
          }
          if (medium.buffer) {
            return this.zip.append(medium.buffer, {name: filename});
          }
          if (medium.base64) {
            const dataimg64 = medium.base64;
            const content = dataimg64.substring(dataimg64.indexOf(',') + 1);
            return this.zip.append(content, {name: filename, base64: true});
          }
        }
        throw new Error('Unsupported media');
      })
    );
  }

  addApp() {
    return new Promise(resolve => {
      const model = {
        worksheets: this._worksheets.filter(Boolean),
      };
      const xform = new AppXform();
      const xml = xform.toXml(model);
      this.zip.append(xml, {name: 'docProps/app.xml'});
      resolve();
    });
  }

  addCore() {
    return new Promise(resolve => {
      const coreXform = new CoreXform();
      const xml = coreXform.toXml(this);
      this.zip.append(xml, {name: 'docProps/core.xml'});
      resolve();
    });
  }

  addSharedStrings() {
    if (this.sharedStrings.count) {
      return new Promise(resolve => {
        const sharedStringsXform = new SharedStringsXform();
        const xml = sharedStringsXform.toXml(this.sharedStrings);
        this.zip.append(xml, {name: '/xl/sharedStrings.xml'});
        resolve();
      });
    }
    return Promise.resolve();
  }

  addWorkbookRels() {
    let count = 1;
    const relationships = [
      {Id: `rId${count++}`, Type: RelType.Styles, Target: 'styles.xml'},
      {Id: `rId${count++}`, Type: RelType.Theme, Target: 'theme/theme1.xml'},
    ];
    if (this.sharedStrings.count) {
      relationships.push({
        Id: `rId${count++}`,
        Type: RelType.SharedStrings,
        Target: 'sharedStrings.xml',
      });
    }
    this._worksheets.forEach(worksheet => {
      if (worksheet) {
        worksheet.rId = `rId${count++}`;
        relationships.push({
          Id: worksheet.rId,
          Type: RelType.Worksheet,
          Target: `worksheets/sheet${worksheet.id}.xml`,
        });
      }
    });
    return new Promise(resolve => {
      const xform = new RelationshipsXform();
      const xml = xform.toXml(relationships);
      this.zip.append(xml, {name: '/xl/_rels/workbook.xml.rels'});
      resolve();
    });
  }

  addWorkbook() {
    const {zip} = this;
    const model = {
      worksheets: this._worksheets.filter(Boolean),
      definedNames: this._definedNames.model,
      views: this.views,
      properties: {},
      calcProperties: {},
    };

    return new Promise(resolve => {
      const xform = new WorkbookXform();
      xform.prepare(model);
      zip.append(xform.toXml(model), {name: '/xl/workbook.xml'});
      resolve();
    });
  }

  _finalize() {
    return new Promise((resolve, reject) => {
      this.stream.on('error', reject);
      this.stream.on('finish', () => {
        resolve(this);
      });
      this.zip.on('error', reject);

      this.zip.finalize();
    });
  }
}

module.exports = WorkbookWriter;

}, function(modId) { var map = {"../../utils/stream-buf":1676879951333,"../../xlsx/rel-type":1676879951378,"../../xlsx/xform/style/styles-xform":1676879951339,"../../utils/shared-strings":1676879951456,"../../doc/defined-names":1676879951329,"../../xlsx/xform/core/core-xform":1676879951358,"../../xlsx/xform/core/relationships-xform":1676879951365,"../../xlsx/xform/core/content-types-xform":1676879951367,"../../xlsx/xform/core/app-xform":1676879951368,"../../xlsx/xform/book/workbook-xform":1676879951371,"../../xlsx/xform/strings/shared-strings-xform":1676879951360,"./worksheet-writer":1676879951457,"../../xlsx/xml/theme1.js":1676879951452}; return __REQUIRE__(map[modId], modId); })
__DEFINE__(1676879951456, function(require, module, exports) {
class SharedStrings {
  constructor() {
    this._values = [];
    this._totalRefs = 0;
    this._hash = Object.create(null);
  }

  get count() {
    return this._values.length;
  }

  get values() {
    return this._values;
  }

  get totalRefs() {
    return this._totalRefs;
  }

  getString(index) {
    return this._values[index];
  }

  add(value) {
    let index = this._hash[value];
    if (index === undefined) {
      index = this._hash[value] = this._values.length;
      this._values.push(value);
    }
    this._totalRefs++;
    return index;
  }
}

module.exports = SharedStrings;

}, function(modId) { var map = {}; return __REQUIRE__(map[modId], modId); })
__DEFINE__(1676879951457, function(require, module, exports) {
const _ = require('../../utils/under-dash');

const RelType = require('../../xlsx/rel-type');

const colCache = require('../../utils/col-cache');
const Encryptor = require('../../utils/encryptor');
const Dimensions = require('../../doc/range');
const StringBuf = require('../../utils/string-buf');

const Row = require('../../doc/row');
const Column = require('../../doc/column');

const SheetRelsWriter = require('./sheet-rels-writer');
const SheetCommentsWriter = require('./sheet-comments-writer');
const DataValidations = require('../../doc/data-validations');

const xmlBuffer = new StringBuf();

// ============================================================================================
// Xforms
const ListXform = require('../../xlsx/xform/list-xform');
const DataValidationsXform = require('../../xlsx/xform/sheet/data-validations-xform');
const SheetPropertiesXform = require('../../xlsx/xform/sheet/sheet-properties-xform');
const SheetFormatPropertiesXform = require('../../xlsx/xform/sheet/sheet-format-properties-xform');
const ColXform = require('../../xlsx/xform/sheet/col-xform');
const RowXform = require('../../xlsx/xform/sheet/row-xform');
const HyperlinkXform = require('../../xlsx/xform/sheet/hyperlink-xform');
const SheetViewXform = require('../../xlsx/xform/sheet/sheet-view-xform');
const SheetProtectionXform = require('../../xlsx/xform/sheet/sheet-protection-xform');
const PageMarginsXform = require('../../xlsx/xform/sheet/page-margins-xform');
const PageSetupXform = require('../../xlsx/xform/sheet/page-setup-xform');
const AutoFilterXform = require('../../xlsx/xform/sheet/auto-filter-xform');
const PictureXform = require('../../xlsx/xform/sheet/picture-xform');
const ConditionalFormattingsXform = require('../../xlsx/xform/sheet/cf/conditional-formattings-xform');
const HeaderFooterXform = require('../../xlsx/xform/sheet/header-footer-xform');
const RowBreaksXform = require('../../xlsx/xform/sheet/row-breaks-xform');

// since prepare and render are functional, we can use singletons
const xform = {
  dataValidations: new DataValidationsXform(),
  sheetProperties: new SheetPropertiesXform(),
  sheetFormatProperties: new SheetFormatPropertiesXform(),
  columns: new ListXform({tag: 'cols', length: false, childXform: new ColXform()}),
  row: new RowXform(),
  hyperlinks: new ListXform({tag: 'hyperlinks', length: false, childXform: new HyperlinkXform()}),
  sheetViews: new ListXform({tag: 'sheetViews', length: false, childXform: new SheetViewXform()}),
  sheetProtection: new SheetProtectionXform(),
  pageMargins: new PageMarginsXform(),
  pageSeteup: new PageSetupXform(),
  autoFilter: new AutoFilterXform(),
  picture: new PictureXform(),
  conditionalFormattings: new ConditionalFormattingsXform(),
  headerFooter: new HeaderFooterXform(),
  rowBreaks: new RowBreaksXform(),
};

// ============================================================================================

class WorksheetWriter {
  constructor(options) {
    // in a workbook, each sheet will have a number
    this.id = options.id;

    // and a name
    this.name = options.name || `Sheet${this.id}`;

    // add a state
    this.state = options.state || 'visible';

    // rows are stored here while they need to be worked on.
    // when they are committed, they will be deleted.
    this._rows = [];

    // column definitions
    this._columns = null;

    // column keys (addRow convenience): key ==> this._columns index
    this._keys = {};

    // keep a record of all row and column pageBreaks
    this._merges = [];
    this._merges.add = function() {}; // ignore cell instruction

    // keep record of all hyperlinks
    this._sheetRelsWriter = new SheetRelsWriter(options);

    this._sheetCommentsWriter = new SheetCommentsWriter(this, this._sheetRelsWriter, options);

    // keep a record of dimensions
    this._dimensions = new Dimensions();

    // first uncommitted row
    this._rowZero = 1;

    // committed flag
    this.committed = false;

    // for data validations
    this.dataValidations = new DataValidations();

    // for sharing formulae
    this._formulae = {};
    this._siFormulae = 0;

    // keep a record of conditionalFormattings
    this.conditionalFormatting = [];

    // keep a record of all row and column pageBreaks
    this.rowBreaks = [];

    // for default row height, outline levels, etc
    this.properties = Object.assign(
      {},
      {
        defaultRowHeight: 15,
        dyDescent: 55,
        outlineLevelCol: 0,
        outlineLevelRow: 0,
      },
      options.properties
    );

    this.headerFooter = Object.assign(
      {},
      {
        differentFirst: false,
        differentOddEven: false,
        oddHeader: null,
        oddFooter: null,
        evenHeader: null,
        evenFooter: null,
        firstHeader: null,
        firstFooter: null,
      },
      options.headerFooter
    );

    // for all things printing
    this.pageSetup = Object.assign(
      {},
      {
        margins: {left: 0.7, right: 0.7, top: 0.75, bottom: 0.75, header: 0.3, footer: 0.3},
        orientation: 'portrait',
        horizontalDpi: 4294967295,
        verticalDpi: 4294967295,
        fitToPage: !!(
          options.pageSetup &&
          (options.pageSetup.fitToWidth || options.pageSetup.fitToHeight) &&
          !options.pageSetup.scale
        ),
        pageOrder: 'downThenOver',
        blackAndWhite: false,
        draft: false,
        cellComments: 'None',
        errors: 'displayed',
        scale: 100,
        fitToWidth: 1,
        fitToHeight: 1,
        paperSize: undefined,
        showRowColHeaders: false,
        showGridLines: false,
        horizontalCentered: false,
        verticalCentered: false,
        rowBreaks: null,
        colBreaks: null,
      },
      options.pageSetup
    );

    // using shared strings creates a smaller xlsx file but may use more memory
    this.useSharedStrings = options.useSharedStrings || false;

    this._workbook = options.workbook;

    this.hasComments = false;

    // views
    this._views = options.views || [];

    // auto filter
    this.autoFilter = options.autoFilter || null;

    this._media = [];

    // worksheet protection
    this.sheetProtection = null;

    // start writing to stream now
    this._writeOpenWorksheet();

    this.startedData = false;
  }

  get workbook() {
    return this._workbook;
  }

  get stream() {
    if (!this._stream) {
      // eslint-disable-next-line no-underscore-dangle
      this._stream = this._workbook._openStream(`/xl/worksheets/sheet${this.id}.xml`);

      // pause stream to prevent 'data' events
      this._stream.pause();
    }
    return this._stream;
  }

  // destroy - not a valid operation for a streaming writer
  // even though some streamers might be able to, it's a bad idea.
  destroy() {
    throw new Error('Invalid Operation: destroy');
  }

  commit() {
    if (this.committed) {
      return;
    }
    // commit all rows
    this._rows.forEach(cRow => {
      if (cRow) {
        // write the row to the stream
        this._writeRow(cRow);
      }
    });

    // we _cannot_ accept new rows from now on
    this._rows = null;

    if (!this.startedData) {
      this._writeOpenSheetData();
    }
    this._writeCloseSheetData();
    this._writeAutoFilter();
    this._writeMergeCells();

    // for some reason, Excel can't handle dimensions at the bottom of the file
    // this._writeDimensions();

    this._writeHyperlinks();
    this._writeConditionalFormatting();
    this._writeDataValidations();
    this._writeSheetProtection();
    this._writePageMargins();
    this._writePageSetup();
    this._writeBackground();
    this._writeHeaderFooter();
    this._writeRowBreaks();

    // Legacy Data tag for comments
    this._writeLegacyData();

    this._writeCloseWorksheet();
    // signal end of stream to workbook
    this.stream.end();

    this._sheetCommentsWriter.commit();
    // also commit the hyperlinks if any
    this._sheetRelsWriter.commit();

    this.committed = true;
  }

  // return the current dimensions of the writer
  get dimensions() {
    return this._dimensions;
  }

  get views() {
    return this._views;
  }

  // =========================================================================
  // Columns

  // get the current columns array.
  get columns() {
    return this._columns;
  }

  // set the columns from an array of column definitions.
  // Note: any headers defined will overwrite existing values.
  set columns(value) {
    // calculate max header row count
    this._headerRowCount = value.reduce((pv, cv) => {
      const headerCount = (cv.header && 1) || (cv.headers && cv.headers.length) || 0;
      return Math.max(pv, headerCount);
    }, 0);

    // construct Column objects
    let count = 1;
    const columns = (this._columns = []);
    value.forEach(defn => {
      const column = new Column(this, count++, false);
      columns.push(column);
      column.defn = defn;
    });
  }

  getColumnKey(key) {
    return this._keys[key];
  }

  setColumnKey(key, value) {
    this._keys[key] = value;
  }

  deleteColumnKey(key) {
    delete this._keys[key];
  }

  eachColumnKey(f) {
    _.each(this._keys, f);
  }

  // get a single column by col number. If it doesn't exist, it and any gaps before it
  // are created.
  getColumn(c) {
    if (typeof c === 'string') {
      // if it matches a key'd column, return that
      const col = this._keys[c];
      if (col) return col;

      // otherwise, assume letter
      c = colCache.l2n(c);
    }
    if (!this._columns) {
      this._columns = [];
    }
    if (c > this._columns.length) {
      let n = this._columns.length + 1;
      while (n <= c) {
        this._columns.push(new Column(this, n++));
      }
    }
    return this._columns[c - 1];
  }

  // =========================================================================
  // Rows
  get _nextRow() {
    return this._rowZero + this._rows.length;
  }

  // iterate over every uncommitted row in the worksheet, including maybe empty rows
  eachRow(options, iteratee) {
    if (!iteratee) {
      iteratee = options;
      options = undefined;
    }
    if (options && options.includeEmpty) {
      const n = this._nextRow;
      for (let i = this._rowZero; i < n; i++) {
        iteratee(this.getRow(i), i);
      }
    } else {
      this._rows.forEach(row => {
        if (row.hasValues) {
          iteratee(row, row.number);
        }
      });
    }
  }

  _commitRow(cRow) {
    // since rows must be written in order, we commit all rows up till and including cRow
    let found = false;
    while (this._rows.length && !found) {
      const row = this._rows.shift();
      this._rowZero++;
      if (row) {
        this._writeRow(row);
        found = row.number === cRow.number;
        this._rowZero = row.number + 1;
      }
    }
  }

  get lastRow() {
    // returns last uncommitted row
    if (this._rows.length) {
      return this._rows[this._rows.length - 1];
    }
    return undefined;
  }

  // find a row (if exists) by row number
  findRow(rowNumber) {
    const index = rowNumber - this._rowZero;
    return this._rows[index];
  }

  getRow(rowNumber) {
    const index = rowNumber - this._rowZero;

    // may fail if rows have been comitted
    if (index < 0) {
      throw new Error('Out of bounds: this row has been committed');
    }
    let row = this._rows[index];
    if (!row) {
      this._rows[index] = row = new Row(this, rowNumber);
    }
    return row;
  }

  addRow(value) {
    const row = new Row(this, this._nextRow);
    this._rows[row.number - this._rowZero] = row;
    row.values = value;
    return row;
  }

  // ================================================================================
  // Cells

  // returns the cell at [r,c] or address given by r. If not found, return undefined
  findCell(r, c) {
    const address = colCache.getAddress(r, c);
    const row = this.findRow(address.row);
    return row ? row.findCell(address.column) : undefined;
  }

  // return the cell at [r,c] or address given by r. If not found, create a new one.
  getCell(r, c) {
    const address = colCache.getAddress(r, c);
    const row = this.getRow(address.row);
    return row.getCellEx(address);
  }

  mergeCells(...cells) {
    // may fail if rows have been comitted
    const dimensions = new Dimensions(cells);

    // check cells aren't already merged
    this._merges.forEach(merge => {
      if (merge.intersects(dimensions)) {
        throw new Error('Cannot merge already merged cells');
      }
    });

    // apply merge
    const master = this.getCell(dimensions.top, dimensions.left);
    for (let i = dimensions.top; i <= dimensions.bottom; i++) {
      for (let j = dimensions.left; j <= dimensions.right; j++) {
        if (i > dimensions.top || j > dimensions.left) {
          this.getCell(i, j).merge(master);
        }
      }
    }

    // index merge
    this._merges.push(dimensions);
  }

  // ===========================================================================
  // Conditional Formatting
  addConditionalFormatting(cf) {
    this.conditionalFormatting.push(cf);
  }

  removeConditionalFormatting(filter) {
    if (typeof filter === 'number') {
      this.conditionalFormatting.splice(filter, 1);
    } else if (filter instanceof Function) {
      this.conditionalFormatting = this.conditionalFormatting.filter(filter);
    } else {
      this.conditionalFormatting = [];
    }
  }

  // =========================================================================

  addBackgroundImage(imageId) {
    this._background = {
      imageId,
    };
  }

  getBackgroundImageId() {
    return this._background && this._background.imageId;
  }

  // =========================================================================
  // Worksheet Protection
  protect(password, options) {
    // TODO: make this function truly async
    // perhaps marshal to worker thread or something
    return new Promise(resolve => {
      this.sheetProtection = {
        sheet: true,
      };
      if (options && 'spinCount' in options) {
        // force spinCount to be integer >= 0
        options.spinCount = Number.isFinite(options.spinCount) ? Math.round(Math.max(0, options.spinCount)) : 100000;
      }
      if (password) {
        this.sheetProtection.algorithmName = 'SHA-512';
        this.sheetProtection.saltValue = Encryptor.randomBytes(16).toString('base64');
        this.sheetProtection.spinCount = options && 'spinCount' in options ? options.spinCount : 100000; // allow user specified spinCount
        this.sheetProtection.hashValue = Encryptor.convertPasswordToHash(
          password,
          'SHA512',
          this.sheetProtection.saltValue,
          this.sheetProtection.spinCount
        );
      }
      if (options) {
        this.sheetProtection = Object.assign(this.sheetProtection, options);
        if (!password && 'spinCount' in options) {
          delete this.sheetProtection.spinCount;
        }
      }
      resolve();
    });
  }

  unprotect() {
    this.sheetProtection = null;
  }

  // ================================================================================

  _write(text) {
    xmlBuffer.reset();
    xmlBuffer.addText(text);
    this.stream.write(xmlBuffer);
  }

  _writeSheetProperties(xmlBuf, properties, pageSetup) {
    const sheetPropertiesModel = {
      outlineProperties: properties && properties.outlineProperties,
      tabColor: properties && properties.tabColor,
      pageSetup:
        pageSetup && pageSetup.fitToPage
          ? {
              fitToPage: pageSetup.fitToPage,
            }
          : undefined,
    };

    xmlBuf.addText(xform.sheetProperties.toXml(sheetPropertiesModel));
  }

  _writeSheetFormatProperties(xmlBuf, properties) {
    const sheetFormatPropertiesModel = properties
      ? {
          defaultRowHeight: properties.defaultRowHeight,
          dyDescent: properties.dyDescent,
          outlineLevelCol: properties.outlineLevelCol,
          outlineLevelRow: properties.outlineLevelRow,
        }
      : undefined;
    if (properties.defaultColWidth) {
      sheetFormatPropertiesModel.defaultColWidth = properties.defaultColWidth;
    }

    xmlBuf.addText(xform.sheetFormatProperties.toXml(sheetFormatPropertiesModel));
  }

  _writeOpenWorksheet() {
    xmlBuffer.reset();

    xmlBuffer.addText('<?xml version="1.0" encoding="UTF-8" standalone="yes"?>');
    xmlBuffer.addText(
      '<worksheet xmlns="http://schemas.openxmlformats.org/spreadsheetml/2006/main"' +
        ' xmlns:r="http://schemas.openxmlformats.org/officeDocument/2006/relationships"' +
        ' xmlns:mc="http://schemas.openxmlformats.org/markup-compatibility/2006"' +
        ' mc:Ignorable="x14ac"' +
        ' xmlns:x14ac="http://schemas.microsoft.com/office/spreadsheetml/2009/9/ac">'
    );

    this._writeSheetProperties(xmlBuffer, this.properties, this.pageSetup);

    xmlBuffer.addText(xform.sheetViews.toXml(this.views));

    this._writeSheetFormatProperties(xmlBuffer, this.properties);

    this.stream.write(xmlBuffer);
  }

  _writeColumns() {
    const cols = Column.toModel(this.columns);
    if (cols) {
      xform.columns.prepare(cols, {styles: this._workbook.styles});
      this.stream.write(xform.columns.toXml(cols));
    }
  }

  _writeOpenSheetData() {
    this._write('<sheetData>');
  }

  _writeRow(row) {
    if (!this.startedData) {
      this._writeColumns();
      this._writeOpenSheetData();
      this.startedData = true;
    }

    if (row.hasValues || row.height) {
      const {model} = row;
      const options = {
        styles: this._workbook.styles,
        sharedStrings: this.useSharedStrings ? this._workbook.sharedStrings : undefined,
        hyperlinks: this._sheetRelsWriter.hyperlinksProxy,
        merges: this._merges,
        formulae: this._formulae,
        siFormulae: this._siFormulae,
        comments: [],
      };
      xform.row.prepare(model, options);
      this.stream.write(xform.row.toXml(model));

      if (options.comments.length) {
        this.hasComments = true;
        this._sheetCommentsWriter.addComments(options.comments);
      }
    }
  }

  _writeCloseSheetData() {
    this._write('</sheetData>');
  }

  _writeMergeCells() {
    if (this._merges.length) {
      xmlBuffer.reset();
      xmlBuffer.addText(`<mergeCells count="${this._merges.length}">`);
      this._merges.forEach(merge => {
        xmlBuffer.addText(`<mergeCell ref="${merge}"/>`);
      });
      xmlBuffer.addText('</mergeCells>');

      this.stream.write(xmlBuffer);
    }
  }

  _writeHyperlinks() {
    // eslint-disable-next-line no-underscore-dangle
    this.stream.write(xform.hyperlinks.toXml(this._sheetRelsWriter._hyperlinks));
  }

  _writeConditionalFormatting() {
    const options = {
      styles: this._workbook.styles,
    };
    xform.conditionalFormattings.prepare(this.conditionalFormatting, options);
    this.stream.write(xform.conditionalFormattings.toXml(this.conditionalFormatting));
  }

  _writeRowBreaks() {
    this.stream.write(xform.rowBreaks.toXml(this.rowBreaks));
  }

  _writeDataValidations() {
    this.stream.write(xform.dataValidations.toXml(this.dataValidations.model));
  }

  _writeSheetProtection() {
    this.stream.write(xform.sheetProtection.toXml(this.sheetProtection));
  }

  _writePageMargins() {
    this.stream.write(xform.pageMargins.toXml(this.pageSetup.margins));
  }

  _writePageSetup() {
    this.stream.write(xform.pageSeteup.toXml(this.pageSetup));
  }

  _writeHeaderFooter() {
    this.stream.write(xform.headerFooter.toXml(this.headerFooter));
  }

  _writeAutoFilter() {
    this.stream.write(xform.autoFilter.toXml(this.autoFilter));
  }

  _writeBackground() {
    if (this._background) {
      if (this._background.imageId !== undefined) {
        const image = this._workbook.getImage(this._background.imageId);
        const pictureId = this._sheetRelsWriter.addMedia({
          Target: `../media/${image.name}`,
          Type: RelType.Image,
        });

        this._background = {
          ...this._background,
          rId: pictureId,
        };
      }
      this.stream.write(xform.picture.toXml({rId: this._background.rId}));
    }
  }

  _writeLegacyData() {
    if (this.hasComments) {
      xmlBuffer.reset();
      xmlBuffer.addText(`<legacyDrawing r:id="${this._sheetCommentsWriter.vmlRelId}"/>`);
      this.stream.write(xmlBuffer);
    }
  }

  _writeDimensions() {
    // for some reason, Excel can't handle dimensions at the bottom of the file
    // and we don't know the dimensions until the commit, so don't write them.
    // this._write('<dimension ref="' + this._dimensions + '"/>');
  }

  _writeCloseWorksheet() {
    this._write('</worksheet>');
  }
}

module.exports = WorksheetWriter;

}, function(modId) { var map = {"../../utils/under-dash":1676879951315,"../../xlsx/rel-type":1676879951378,"../../utils/col-cache":1676879951316,"../../utils/encryptor":1676879951328,"../../doc/range":1676879951317,"../../utils/string-buf":1676879951335,"../../doc/row":1676879951318,"../../doc/column":1676879951323,"./sheet-rels-writer":1676879951458,"./sheet-comments-writer":1676879951459,"../../doc/data-validations":1676879951327,"../../xlsx/xform/list-xform":1676879951343,"../../xlsx/xform/sheet/data-validations-xform":1676879951386,"../../xlsx/xform/sheet/sheet-properties-xform":1676879951387,"../../xlsx/xform/sheet/sheet-format-properties-xform":1676879951390,"../../xlsx/xform/sheet/col-xform":1676879951382,"../../xlsx/xform/sheet/row-xform":1676879951380,"../../xlsx/xform/sheet/hyperlink-xform":1676879951384,"../../xlsx/xform/sheet/sheet-view-xform":1676879951391,"../../xlsx/xform/sheet/sheet-protection-xform":1676879951392,"../../xlsx/xform/sheet/page-margins-xform":1676879951393,"../../xlsx/xform/sheet/page-setup-xform":1676879951394,"../../xlsx/xform/sheet/auto-filter-xform":1676879951396,"../../xlsx/xform/sheet/picture-xform":1676879951397,"../../xlsx/xform/sheet/cf/conditional-formattings-xform":1676879951403,"../../xlsx/xform/sheet/header-footer-xform":1676879951402,"../../xlsx/xform/sheet/row-breaks-xform":1676879951400}; return __REQUIRE__(map[modId], modId); })
__DEFINE__(1676879951458, function(require, module, exports) {
/* eslint-disable max-classes-per-file */
const utils = require('../../utils/utils');
const RelType = require('../../xlsx/rel-type');

class HyperlinksProxy {
  constructor(sheetRelsWriter) {
    this.writer = sheetRelsWriter;
  }

  push(hyperlink) {
    this.writer.addHyperlink(hyperlink);
  }
}

class SheetRelsWriter {
  constructor(options) {
    // in a workbook, each sheet will have a number
    this.id = options.id;

    // count of all relationships
    this.count = 0;

    // keep record of all hyperlinks
    this._hyperlinks = [];

    this._workbook = options.workbook;
  }

  get stream() {
    if (!this._stream) {
      // eslint-disable-next-line no-underscore-dangle
      this._stream = this._workbook._openStream(`/xl/worksheets/_rels/sheet${this.id}.xml.rels`);
    }
    return this._stream;
  }

  get length() {
    return this._hyperlinks.length;
  }

  each(fn) {
    return this._hyperlinks.forEach(fn);
  }

  get hyperlinksProxy() {
    return this._hyperlinksProxy || (this._hyperlinksProxy = new HyperlinksProxy(this));
  }

  addHyperlink(hyperlink) {
    // Write to stream
    const relationship = {
      Target: hyperlink.target,
      Type: RelType.Hyperlink,
      TargetMode: 'External',
    };
    const rId = this._writeRelationship(relationship);

    // store sheet stuff for later
    this._hyperlinks.push({
      rId,
      address: hyperlink.address,
    });
  }

  addMedia(media) {
    return this._writeRelationship(media);
  }

  addRelationship(rel) {
    return this._writeRelationship(rel);
  }

  commit() {
    if (this.count) {
      // write xml utro
      this._writeClose();
      // and close stream
      this.stream.end();
    }
  }

  // ================================================================================
  _writeOpen() {
    this.stream.write(
      `<?xml version="1.0" encoding="UTF-8" standalone="yes"?>
       <Relationships xmlns="http://schemas.openxmlformats.org/package/2006/relationships">`
    );
  }

  _writeRelationship(relationship) {
    if (!this.count) {
      this._writeOpen();
    }

    const rId = `rId${++this.count}`;

    if (relationship.TargetMode) {
      this.stream.write(
        `<Relationship Id="${rId}"` +
          ` Type="${relationship.Type}"` +
          ` Target="${utils.xmlEncode(relationship.Target)}"` +
          ` TargetMode="${relationship.TargetMode}"` +
          '/>'
      );
    } else {
      this.stream.write(
        `<Relationship Id="${rId}" Type="${relationship.Type}" Target="${relationship.Target}"/>`
      );
    }

    return rId;
  }

  _writeClose() {
    this.stream.write('</Relationships>');
  }
}

module.exports = SheetRelsWriter;

}, function(modId) { var map = {"../../utils/utils":1676879951334,"../../xlsx/rel-type":1676879951378}; return __REQUIRE__(map[modId], modId); })
__DEFINE__(1676879951459, function(require, module, exports) {
const XmlStream = require('../../utils/xml-stream');
const RelType = require('../../xlsx/rel-type');
const colCache = require('../../utils/col-cache');
const CommentXform = require('../../xlsx/xform/comment/comment-xform');
const VmlShapeXform = require('../../xlsx/xform/comment/vml-shape-xform');

class SheetCommentsWriter {
  constructor(worksheet, sheetRelsWriter, options) {
    // in a workbook, each sheet will have a number
    this.id = options.id;
    this.count = 0;
    this._worksheet = worksheet;
    this._workbook = options.workbook;
    this._sheetRelsWriter = sheetRelsWriter;
  }

  get commentsStream() {
    if (!this._commentsStream) {
      // eslint-disable-next-line no-underscore-dangle
      this._commentsStream = this._workbook._openStream(`/xl/comments${this.id}.xml`);
    }
    return this._commentsStream;
  }

  get vmlStream() {
    if (!this._vmlStream) {
      // eslint-disable-next-line no-underscore-dangle
      this._vmlStream = this._workbook._openStream(`xl/drawings/vmlDrawing${this.id}.vml`);
    }
    return this._vmlStream;
  }

  _addRelationships() {
    const commentRel = {
      Type: RelType.Comments,
      Target: `../comments${this.id}.xml`,
    };
    this._sheetRelsWriter.addRelationship(commentRel);

    const vmlDrawingRel = {
      Type: RelType.VmlDrawing,
      Target: `../drawings/vmlDrawing${this.id}.vml`,
    };
    this.vmlRelId = this._sheetRelsWriter.addRelationship(vmlDrawingRel);
  }

  _addCommentRefs() {
    this._workbook.commentRefs.push({
      commentName: `comments${this.id}`,
      vmlDrawing: `vmlDrawing${this.id}`,
    });
  }

  _writeOpen() {
    this.commentsStream.write(
      '<?xml version="1.0" encoding="UTF-8" standalone="yes"?>' +
        '<comments xmlns="http://schemas.openxmlformats.org/spreadsheetml/2006/main">' +
        '<authors><author>Author</author></authors>' +
        '<commentList>'
    );
    this.vmlStream.write(
      '<?xml version="1.0" encoding="UTF-8"?>' +
        '<xml xmlns:o="urn:schemas-microsoft-com:office:office" xmlns:v="urn:schemas-microsoft-com:vml" xmlns:x="urn:schemas-microsoft-com:office:excel">' +
        '<o:shapelayout v:ext="edit">' +
        '<o:idmap v:ext="edit" data="1" />' +
        '</o:shapelayout>' +
        '<v:shapetype id="_x0000_t202" coordsize="21600,21600" o:spt="202" path="m,l,21600r21600,l21600,xe">' +
        '<v:stroke joinstyle="miter" />' +
        '<v:path gradientshapeok="t" o:connecttype="rect" />' +
        '</v:shapetype>'
    );
  }

  _writeComment(comment, index) {
    const commentXform = new CommentXform();
    const commentsXmlStream = new XmlStream();
    commentXform.render(commentsXmlStream, comment);
    this.commentsStream.write(commentsXmlStream.xml);

    const vmlShapeXform = new VmlShapeXform();
    const vmlXmlStream = new XmlStream();
    vmlShapeXform.render(vmlXmlStream, comment, index);
    this.vmlStream.write(vmlXmlStream.xml);
  }

  _writeClose() {
    this.commentsStream.write('</commentList></comments>');
    this.vmlStream.write('</xml>');
  }

  addComments(comments) {
    if (comments && comments.length) {
      if (!this.startedData) {
        this._worksheet.comments = [];
        this._writeOpen();
        this._addRelationships();
        this._addCommentRefs();
        this.startedData = true;
      }

      comments.forEach(item => {
        item.refAddress = colCache.decodeAddress(item.ref);
      });

      comments.forEach(comment => {
        this._writeComment(comment, this.count);
        this.count += 1;
      });
    }
  }

  commit() {
    if (this.count) {
      this._writeClose();
      this.commentsStream.end();
      this.vmlStream.end();
    }
  }
}

module.exports = SheetCommentsWriter;

}, function(modId) { var map = {"../../utils/xml-stream":1676879951337,"../../xlsx/rel-type":1676879951378,"../../utils/col-cache":1676879951316,"../../xlsx/xform/comment/comment-xform":1676879951444,"../../xlsx/xform/comment/vml-shape-xform":1676879951446}; return __REQUIRE__(map[modId], modId); })
__DEFINE__(1676879951460, function(require, module, exports) {
const fs = require('fs');
const {EventEmitter} = require('events');
const {PassThrough, Readable} = require('readable-stream');
const nodeStream = require('stream');
const unzip = require('unzipper');
const tmp = require('tmp');
const iterateStream = require('../../utils/iterate-stream');
const parseSax = require('../../utils/parse-sax');

const StyleManager = require('../../xlsx/xform/style/styles-xform');
const WorkbookXform = require('../../xlsx/xform/book/workbook-xform');
const RelationshipsXform = require('../../xlsx/xform/core/relationships-xform');

const WorksheetReader = require('./worksheet-reader');
const HyperlinkReader = require('./hyperlink-reader');

tmp.setGracefulCleanup();

class WorkbookReader extends EventEmitter {
  constructor(input, options = {}) {
    super();

    this.input = input;

    this.options = {
      worksheets: 'emit',
      sharedStrings: 'cache',
      hyperlinks: 'ignore',
      styles: 'ignore',
      entries: 'ignore',
      ...options,
    };

    this.styles = new StyleManager();
    this.styles.init();
  }

  _getStream(input) {
    if (input instanceof nodeStream.Readable || input instanceof Readable) {
      return input;
    }
    if (typeof input === 'string') {
      return fs.createReadStream(input);
    }
    throw new Error(`Could not recognise input: ${input}`);
  }

  async read(input, options) {
    try {
      for await (const {eventType, value} of this.parse(input, options)) {
        switch (eventType) {
          case 'shared-strings':
            this.emit(eventType, value);
            break;
          case 'worksheet':
            this.emit(eventType, value);
            await value.read();
            break;
          case 'hyperlinks':
            this.emit(eventType, value);
            break;
        }
      }
      this.emit('end');
      this.emit('finished');
    } catch (error) {
      this.emit('error', error);
    }
  }

  async *[Symbol.asyncIterator]() {
    for await (const {eventType, value} of this.parse()) {
      if (eventType === 'worksheet') {
        yield value;
      }
    }
  }

  async *parse(input, options) {
    if (options) this.options = options;
    const stream = (this.stream = this._getStream(input || this.input));
    const zip = unzip.Parse({forceStream: true});
    stream.pipe(zip);

    // worksheets, deferred for parsing after shared strings reading
    const waitingWorkSheets = [];

    for await (const entry of iterateStream(zip)) {
      let match;
      let sheetNo;
      switch (entry.path) {
        case '_rels/.rels':
          break;
        case 'xl/_rels/workbook.xml.rels':
          await this._parseRels(entry);
          break;
        case 'xl/workbook.xml':
          await this._parseWorkbook(entry);
          break;
        case 'xl/sharedStrings.xml':
          yield* this._parseSharedStrings(entry);
          break;
        case 'xl/styles.xml':
          await this._parseStyles(entry);
          break;
        default:
          if (entry.path.match(/xl\/worksheets\/sheet\d+[.]xml/)) {
            match = entry.path.match(/xl\/worksheets\/sheet(\d+)[.]xml/);
            sheetNo = match[1];
            if (this.sharedStrings && this.workbookRels) {
              yield* this._parseWorksheet(iterateStream(entry), sheetNo);
            } else {
              // create temp file for each worksheet
              await new Promise((resolve, reject) => {
                tmp.file((err, path, fd, tempFileCleanupCallback) => {
                  if (err) {
                    return reject(err);
                  }
                  waitingWorkSheets.push({sheetNo, path, tempFileCleanupCallback});

                  const tempStream = fs.createWriteStream(path);
                  entry.pipe(tempStream);
                  return tempStream.on('finish', () => {
                    return resolve();
                  });
                });
              });
            }
          } else if (entry.path.match(/xl\/worksheets\/_rels\/sheet\d+[.]xml.rels/)) {
            match = entry.path.match(/xl\/worksheets\/_rels\/sheet(\d+)[.]xml.rels/);
            sheetNo = match[1];
            yield* this._parseHyperlinks(iterateStream(entry), sheetNo);
          }
          break;
      }
      entry.autodrain();
    }

    for (const {sheetNo, path, tempFileCleanupCallback} of waitingWorkSheets) {
      let fileStream = fs.createReadStream(path);
      // TODO: Remove once node v8 is deprecated
      // Detect and upgrade old fileStreams
      if (!fileStream[Symbol.asyncIterator]) {
        fileStream = fileStream.pipe(new PassThrough());
      }
      yield* this._parseWorksheet(fileStream, sheetNo);
      tempFileCleanupCallback();
    }
  }

  _emitEntry(payload) {
    if (this.options.entries === 'emit') {
      this.emit('entry', payload);
    }
  }

  async _parseRels(entry) {
    const xform = new RelationshipsXform();
    this.workbookRels = await xform.parseStream(iterateStream(entry));
  }

  async _parseWorkbook(entry) {
    this._emitEntry({type: 'workbook'});

    const workbook = new WorkbookXform();
    await workbook.parseStream(iterateStream(entry));

    this.properties = workbook.map.workbookPr;
    this.model = workbook.model;
  }

  async *_parseSharedStrings(entry) {
    this._emitEntry({type: 'shared-strings'});
    switch (this.options.sharedStrings) {
      case 'cache':
        this.sharedStrings = [];
        break;
      case 'emit':
        break;
      default:
        return;
    }

    let text = null;
    let richText = [];
    let index = 0;
    let font = null;
    for await (const events of parseSax(iterateStream(entry))) {
      for (const {eventType, value} of events) {
        if (eventType === 'opentag') {
          const node = value;
          switch (node.name) {
            case 'b':
              font = font || {};
              font.bold = true;
              break;
            case 'charset':
              font = font || {};
              font.charset = parseInt(node.attributes.charset, 10);
              break;
            case 'color':
              font = font || {};
              font.color = {};
              if (node.attributes.rgb) {
                font.color.argb = node.attributes.argb;
              }
              if (node.attributes.val) {
                font.color.argb = node.attributes.val;
              }
              if (node.attributes.theme) {
                font.color.theme = node.attributes.theme;
              }
              break;
            case 'family':
              font = font || {};
              font.family = parseInt(node.attributes.val, 10);
              break;
            case 'i':
              font = font || {};
              font.italic = true;
              break;
            case 'outline':
              font = font || {};
              font.outline = true;
              break;
            case 'rFont':
              font = font || {};
              font.name = node.value;
              break;
            case 'si':
              font = null;
              richText = [];
              text = null;
              break;
            case 'sz':
              font = font || {};
              font.size = parseInt(node.attributes.val, 10);
              break;
            case 'strike':
              break;
            case 't':
              text = null;
              break;
            case 'u':
              font = font || {};
              font.underline = true;
              break;
            case 'vertAlign':
              font = font || {};
              font.vertAlign = node.attributes.val;
              break;
          }
        } else if (eventType === 'text') {
          text = text ? text + value : value;
        } else if (eventType === 'closetag') {
          const node = value;
          switch (node.name) {
            case 'r':
              richText.push({
                font,
                text,
              });

              font = null;
              text = null;
              break;
            case 'si':
              if (this.options.sharedStrings === 'cache') {
                this.sharedStrings.push(richText.length ? {richText} : text);
              } else if (this.options.sharedStrings === 'emit') {
                yield {index: index++, text: richText.length ? {richText} : text};
              }

              richText = [];
              font = null;
              text = null;
              break;
          }
        }
      }
    }
  }

  async _parseStyles(entry) {
    this._emitEntry({type: 'styles'});
    if (this.options.styles === 'cache') {
      this.styles = new StyleManager();
      await this.styles.parseStream(iterateStream(entry));
    }
  }

  *_parseWorksheet(iterator, sheetNo) {
    this._emitEntry({type: 'worksheet', id: sheetNo});
    const worksheetReader = new WorksheetReader({
      workbook: this,
      id: sheetNo,
      iterator,
      options: this.options,
    });

    const matchingRel = (this.workbookRels || []).find(
      rel => rel.Target === `worksheets/sheet${sheetNo}.xml`
    );
    const matchingSheet =
      matchingRel && (this.model.sheets || []).find(sheet => sheet.rId === matchingRel.Id);
    if (matchingSheet) {
      worksheetReader.id = matchingSheet.id;
      worksheetReader.name = matchingSheet.name;
      worksheetReader.state = matchingSheet.state;
    }
    if (this.options.worksheets === 'emit') {
      yield {eventType: 'worksheet', value: worksheetReader};
    }
  }

  *_parseHyperlinks(iterator, sheetNo) {
    this._emitEntry({type: 'hyperlinks', id: sheetNo});
    const hyperlinksReader = new HyperlinkReader({
      workbook: this,
      id: sheetNo,
      iterator,
      options: this.options,
    });
    if (this.options.hyperlinks === 'emit') {
      yield {eventType: 'hyperlinks', value: hyperlinksReader};
    }
  }
}

// for reference - these are the valid values for options
WorkbookReader.Options = {
  worksheets: ['emit', 'ignore'],
  sharedStrings: ['cache', 'emit', 'ignore'],
  hyperlinks: ['cache', 'emit', 'ignore'],
  styles: ['cache', 'ignore'],
  entries: ['emit', 'ignore'],
};

module.exports = WorkbookReader;

}, function(modId) { var map = {"../../utils/iterate-stream":1676879951461,"../../utils/parse-sax":1676879951341,"../../xlsx/xform/style/styles-xform":1676879951339,"../../xlsx/xform/book/workbook-xform":1676879951371,"../../xlsx/xform/core/relationships-xform":1676879951365,"./worksheet-reader":1676879951462,"./hyperlink-reader":1676879951463}; return __REQUIRE__(map[modId], modId); })
__DEFINE__(1676879951461, function(require, module, exports) {
module.exports = async function* iterateStream(stream) {
  const contents = [];
  stream.on('data', data => contents.push(data));

  let resolveStreamEndedPromise;
  const streamEndedPromise = new Promise(resolve => (resolveStreamEndedPromise = resolve));

  let ended = false;
  stream.on('end', () => {
    ended = true;
    resolveStreamEndedPromise();
  });

  let error = false;
  stream.on('error', err => {
    error = err;
    resolveStreamEndedPromise();
  });

  while (!ended || contents.length > 0) {
    if (contents.length === 0) {
      stream.resume();
      // eslint-disable-next-line no-await-in-loop
      await Promise.race([once(stream, 'data'), streamEndedPromise]);
    } else {
      stream.pause();
      const data = contents.shift();
      yield data;
    }
    if (error) throw error;
  }
  resolveStreamEndedPromise();
};

function once(eventEmitter, type) {
  // TODO: Use require('events').once when node v10 is dropped
  return new Promise(resolve => {
    let fired = false;
    const handler = () => {
      if (!fired) {
        fired = true;
        eventEmitter.removeListener(type, handler);
        resolve();
      }
    };
    eventEmitter.addListener(type, handler);
  });
}

}, function(modId) { var map = {}; return __REQUIRE__(map[modId], modId); })
__DEFINE__(1676879951462, function(require, module, exports) {
const {EventEmitter} = require('events');
const parseSax = require('../../utils/parse-sax');

const _ = require('../../utils/under-dash');
const utils = require('../../utils/utils');
const colCache = require('../../utils/col-cache');
const Dimensions = require('../../doc/range');

const Row = require('../../doc/row');
const Column = require('../../doc/column');

class WorksheetReader extends EventEmitter {
  constructor({workbook, id, iterator, options}) {
    super();

    this.workbook = workbook;
    this.id = id;
    this.iterator = iterator;
    this.options = options || {};

    // and a name
    this.name = `Sheet${this.id}`;

    // column definitions
    this._columns = null;
    this._keys = {};

    // keep a record of dimensions
    this._dimensions = new Dimensions();
  }

  // destroy - not a valid operation for a streaming writer
  // even though some streamers might be able to, it's a bad idea.
  destroy() {
    throw new Error('Invalid Operation: destroy');
  }

  // return the current dimensions of the writer
  get dimensions() {
    return this._dimensions;
  }

  // =========================================================================
  // Columns

  // get the current columns array.
  get columns() {
    return this._columns;
  }

  // get a single column by col number. If it doesn't exist, it and any gaps before it
  // are created.
  getColumn(c) {
    if (typeof c === 'string') {
      // if it matches a key'd column, return that
      const col = this._keys[c];
      if (col) {
        return col;
      }

      // otherise, assume letter
      c = colCache.l2n(c);
    }
    if (!this._columns) {
      this._columns = [];
    }
    if (c > this._columns.length) {
      let n = this._columns.length + 1;
      while (n <= c) {
        this._columns.push(new Column(this, n++));
      }
    }
    return this._columns[c - 1];
  }

  getColumnKey(key) {
    return this._keys[key];
  }

  setColumnKey(key, value) {
    this._keys[key] = value;
  }

  deleteColumnKey(key) {
    delete this._keys[key];
  }

  eachColumnKey(f) {
    _.each(this._keys, f);
  }

  async read() {
    try {
      for await (const events of this.parse()) {
        for (const {eventType, value} of events) {
          this.emit(eventType, value);
        }
      }
      this.emit('finished');
    } catch (error) {
      this.emit('error', error);
    }
  }

  async *[Symbol.asyncIterator]() {
    for await (const events of this.parse()) {
      for (const {eventType, value} of events) {
        if (eventType === 'row') {
          yield value;
        }
      }
    }
  }

  async *parse() {
    const {iterator, options} = this;
    let emitSheet = false;
    let emitHyperlinks = false;
    let hyperlinks = null;
    switch (options.worksheets) {
      case 'emit':
        emitSheet = true;
        break;
      case 'prep':
        break;
      default:
        break;
    }
    switch (options.hyperlinks) {
      case 'emit':
        emitHyperlinks = true;
        break;
      case 'cache':
        this.hyperlinks = hyperlinks = {};
        break;
      default:
        break;
    }
    if (!emitSheet && !emitHyperlinks && !hyperlinks) {
      return;
    }

    // references
    const {sharedStrings, styles, properties} = this.workbook;

    // xml position
    let inCols = false;
    let inRows = false;
    let inHyperlinks = false;

    // parse state
    let cols = null;
    let row = null;
    let c = null;
    let current = null;
    for await (const events of parseSax(iterator)) {
      const worksheetEvents = [];
      for (const {eventType, value} of events) {
        if (eventType === 'opentag') {
          const node = value;
          if (emitSheet) {
            switch (node.name) {
              case 'cols':
                inCols = true;
                cols = [];
                break;
              case 'sheetData':
                inRows = true;
                break;

              case 'col':
                if (inCols) {
                  cols.push({
                    min: parseInt(node.attributes.min, 10),
                    max: parseInt(node.attributes.max, 10),
                    width: parseFloat(node.attributes.width),
                    styleId: parseInt(node.attributes.style || '0', 10),
                  });
                }
                break;

              case 'row':
                if (inRows) {
                  const r = parseInt(node.attributes.r, 10);
                  row = new Row(this, r);
                  if (node.attributes.ht) {
                    row.height = parseFloat(node.attributes.ht);
                  }
                  if (node.attributes.s) {
                    const styleId = parseInt(node.attributes.s, 10);
                    const style = styles.getStyleModel(styleId);
                    if (style) {
                      row.style = style;
                    }
                  }
                }
                break;
              case 'c':
                if (row) {
                  c = {
                    ref: node.attributes.r,
                    s: parseInt(node.attributes.s, 10),
                    t: node.attributes.t,
                  };
                }
                break;
              case 'f':
                if (c) {
                  current = c.f = {text: ''};
                }
                break;
              case 'v':
                if (c) {
                  current = c.v = {text: ''};
                }
                break;
              case 'mergeCell':
                break;
              default:
                break;
            }
          }

          // =================================================================
          //
          if (emitHyperlinks || hyperlinks) {
            switch (node.name) {
              case 'hyperlinks':
                inHyperlinks = true;
                break;
              case 'hyperlink':
                if (inHyperlinks) {
                  const hyperlink = {
                    ref: node.attributes.ref,
                    rId: node.attributes['r:id'],
                  };
                  if (emitHyperlinks) {
                    worksheetEvents.push({eventType: 'hyperlink', value: hyperlink});
                  } else {
                    hyperlinks[hyperlink.ref] = hyperlink;
                  }
                }
                break;
              default:
                break;
            }
          }
        } else if (eventType === 'text') {
          // only text data is for sheet values
          if (emitSheet) {
            if (current) {
              current.text += value;
            }
          }
        } else if (eventType === 'closetag') {
          const node = value;
          if (emitSheet) {
            switch (node.name) {
              case 'cols':
                inCols = false;
                this._columns = Column.fromModel(cols);
                break;
              case 'sheetData':
                inRows = false;
                break;

              case 'row':
                this._dimensions.expandRow(row);
                worksheetEvents.push({eventType: 'row', value: row});
                row = null;
                break;

              case 'c':
                if (row && c) {
                  const address = colCache.decodeAddress(c.ref);
                  const cell = row.getCell(address.col);
                  if (c.s) {
                    const style = styles.getStyleModel(c.s);
                    if (style) {
                      cell.style = style;
                    }
                  }

                  if (c.f) {
                    const cellValue = {
                      formula: c.f.text,
                    };
                    if (c.v) {
                      if (c.t === 'str') {
                        cellValue.result = utils.xmlDecode(c.v.text);
                      } else {
                        cellValue.result = parseFloat(c.v.text);
                      }
                    }
                    cell.value = cellValue;
                  } else if (c.v) {
                    switch (c.t) {
                      case 's': {
                        const index = parseInt(c.v.text, 10);
                        if (sharedStrings) {
                          cell.value = sharedStrings[index];
                        } else {
                          cell.value = {
                            sharedString: index,
                          };
                        }
                        break;
                      }

                      case 'str':
                        cell.value = utils.xmlDecode(c.v.text);
                        break;

                      case 'e':
                        cell.value = {error: c.v.text};
                        break;

                      case 'b':
                        cell.value = parseInt(c.v.text, 10) !== 0;
                        break;

                      default:
                        if (utils.isDateFmt(cell.numFmt)) {
                          cell.value = utils.excelToDate(
                            parseFloat(c.v.text),
                            properties.model && properties.model.date1904
                          );
                        } else {
                          cell.value = parseFloat(c.v.text);
                        }
                        break;
                    }
                  }
                  if (hyperlinks) {
                    const hyperlink = hyperlinks[c.ref];
                    if (hyperlink) {
                      cell.text = cell.value;
                      cell.value = undefined;
                      cell.hyperlink = hyperlink;
                    }
                  }
                  c = null;
                }
                break;
              default:
                break;
            }
          }
          if (emitHyperlinks || hyperlinks) {
            switch (node.name) {
              case 'hyperlinks':
                inHyperlinks = false;
                break;
              default:
                break;
            }
          }
        }
      }
      if (worksheetEvents.length > 0) {
        yield worksheetEvents;
      }
    }
  }
}

module.exports = WorksheetReader;

}, function(modId) { var map = {"../../utils/parse-sax":1676879951341,"../../utils/under-dash":1676879951315,"../../utils/utils":1676879951334,"../../utils/col-cache":1676879951316,"../../doc/range":1676879951317,"../../doc/row":1676879951318,"../../doc/column":1676879951323}; return __REQUIRE__(map[modId], modId); })
__DEFINE__(1676879951463, function(require, module, exports) {
const {EventEmitter} = require('events');
const parseSax = require('../../utils/parse-sax');

const Enums = require('../../doc/enums');
const RelType = require('../../xlsx/rel-type');

class HyperlinkReader extends EventEmitter {
  constructor({workbook, id, iterator, options}) {
    super();

    this.workbook = workbook;
    this.id = id;
    this.iterator = iterator;
    this.options = options;
  }

  get count() {
    return (this.hyperlinks && this.hyperlinks.length) || 0;
  }

  each(fn) {
    return this.hyperlinks.forEach(fn);
  }

  async read() {
    const {iterator, options} = this;
    let emitHyperlinks = false;
    let hyperlinks = null;
    switch (options.hyperlinks) {
      case 'emit':
        emitHyperlinks = true;
        break;
      case 'cache':
        this.hyperlinks = hyperlinks = {};
        break;
      default:
        break;
    }

    if (!emitHyperlinks && !hyperlinks) {
      this.emit('finished');
      return;
    }

    try {
      for await (const events of parseSax(iterator)) {
        for (const {eventType, value} of events) {
          if (eventType === 'opentag') {
            const node = value;
            if (node.name === 'Relationship') {
              const rId = node.attributes.Id;
              switch (node.attributes.Type) {
                case RelType.Hyperlink:
                  {
                    const relationship = {
                      type: Enums.RelationshipType.Styles,
                      rId,
                      target: node.attributes.Target,
                      targetMode: node.attributes.TargetMode,
                    };
                    if (emitHyperlinks) {
                      this.emit('hyperlink', relationship);
                    } else {
                      hyperlinks[relationship.rId] = relationship;
                    }
                  }
                  break;

                default:
                  break;
              }
            }
          }
        }
      }
      this.emit('finished');
    } catch (error) {
      this.emit('error', error);
    }
  }
}

module.exports = HyperlinkReader;

}, function(modId) { var map = {"../../utils/parse-sax":1676879951341,"../../doc/enums":1676879951319,"../../xlsx/rel-type":1676879951378}; return __REQUIRE__(map[modId], modId); })
return __REQUIRE__(1676879951311);
})()
//miniprogram-npm-outsideDeps=["crypto","fs","jszip","readable-stream","events","buffer","saxes","uuid","fast-csv","dayjs/plugin/customParseFormat","dayjs/plugin/utc","dayjs","archiver","stream","unzipper","tmp"]
//# sourceMappingURL=index.js.map