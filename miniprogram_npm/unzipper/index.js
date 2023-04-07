module.exports = (function() {
var __MODS__ = {};
var __DEFINE__ = function(modId, func, req) { var m = { exports: {}, _tempexports: {} }; __MODS__[modId] = { status: 0, func: func, req: req, m: m }; };
var __REQUIRE__ = function(modId, source) { if(!__MODS__[modId]) return require(source); if(!__MODS__[modId].status) { var m = __MODS__[modId].m; m._exports = m._tempexports; var desp = Object.getOwnPropertyDescriptor(m, "exports"); if (desp && desp.configurable) Object.defineProperty(m, "exports", { set: function (val) { if(typeof val === "object" && val !== m._exports) { m._exports.__proto__ = val.__proto__; Object.keys(val).forEach(function (k) { m._exports[k] = val[k]; }); } m._tempexports = val }, get: function () { return m._tempexports; } }); __MODS__[modId].status = 1; __MODS__[modId].func(__MODS__[modId].req, m, m.exports); } return __MODS__[modId].m.exports; };
var __REQUIRE_WILDCARD__ = function(obj) { if(obj && obj.__esModule) { return obj; } else { var newObj = {}; if(obj != null) { for(var k in obj) { if (Object.prototype.hasOwnProperty.call(obj, k)) newObj[k] = obj[k]; } } newObj.default = obj; return newObj; } };
var __REQUIRE_DEFAULT__ = function(obj) { return obj && obj.__esModule ? obj.default : obj; };
__DEFINE__(1676879951633, function(require, module, exports) {

// Polyfills for node 0.8
require('listenercount');
require('buffer-indexof-polyfill');
require('setimmediate');


exports.Parse = require('./lib/parse');
exports.ParseOne = require('./lib/parseOne');
exports.Extract = require('./lib/extract');
exports.Open = require('./lib/Open');
}, function(modId) {var map = {"./lib/parse":1676879951634,"./lib/parseOne":1676879951642,"./lib/extract":1676879951643,"./lib/Open":1676879951644}; return __REQUIRE__(map[modId], modId); })
__DEFINE__(1676879951634, function(require, module, exports) {
var util = require('util');
var zlib = require('zlib');
var Stream = require('stream');
var binary = require('binary');
var Promise = require('bluebird');
var PullStream = require('./PullStream');
var NoopStream = require('./NoopStream');
var BufferStream = require('./BufferStream');
var parseExtraField = require('./parseExtraField');
var Buffer = require('./Buffer');
var parseDateTime = require('./parseDateTime');

// Backwards compatibility for node versions < 8
if (!Stream.Writable || !Stream.Writable.prototype.destroy)
  Stream = require('readable-stream');

var endDirectorySignature = Buffer.alloc(4);
endDirectorySignature.writeUInt32LE(0x06054b50, 0);

function Parse(opts) {
  if (!(this instanceof Parse)) {
    return new Parse(opts);
  }
  var self = this;
  self._opts = opts || { verbose: false };

  PullStream.call(self, self._opts);
  self.on('finish',function() {
    self.emit('close');
  });
  self._readRecord().catch(function(e) {
    if (!self.__emittedError || self.__emittedError !== e)
      self.emit('error',e);
  });
}

util.inherits(Parse, PullStream);

Parse.prototype._readRecord = function () {
  var self = this;
  return self.pull(4).then(function(data) {
    if (data.length === 0)
      return;

    var signature = data.readUInt32LE(0);

    if (signature === 0x34327243) {
      return self._readCrxHeader();
    }
    if (signature === 0x04034b50) {
      return self._readFile();
    }
    else if (signature === 0x02014b50) {
      self.__ended = true;
      return self._readCentralDirectoryFileHeader();
    }
    else if (signature === 0x06054b50) {
      return self._readEndOfCentralDirectoryRecord();
    }
    else if (self.__ended) {
      return self.pull(endDirectorySignature).then(function() {
          return self._readEndOfCentralDirectoryRecord();
        });
    }
    else
      self.emit('error', new Error('invalid signature: 0x' + signature.toString(16)));
  });
};

Parse.prototype._readCrxHeader = function() {
  var self = this;
  return self.pull(12).then(function(data) {
    self.crxHeader = binary.parse(data)
      .word32lu('version')
      .word32lu('pubKeyLength')
      .word32lu('signatureLength')
      .vars;
    return self.pull(self.crxHeader.pubKeyLength + self.crxHeader.signatureLength);
  }).then(function(data) {
    self.crxHeader.publicKey = data.slice(0,self.crxHeader.pubKeyLength);
    self.crxHeader.signature = data.slice(self.crxHeader.pubKeyLength);
    self.emit('crx-header',self.crxHeader);
    return self._readRecord();
  });
};

Parse.prototype._readFile = function () {
  var self = this;
  return self.pull(26).then(function(data) {
    var vars = binary.parse(data)
      .word16lu('versionsNeededToExtract')
      .word16lu('flags')
      .word16lu('compressionMethod')
      .word16lu('lastModifiedTime')
      .word16lu('lastModifiedDate')
      .word32lu('crc32')
      .word32lu('compressedSize')
      .word32lu('uncompressedSize')
      .word16lu('fileNameLength')
      .word16lu('extraFieldLength')
      .vars;

    vars.lastModifiedDateTime = parseDateTime(vars.lastModifiedDate, vars.lastModifiedTime);

    if (self.crxHeader) vars.crxHeader = self.crxHeader;

    return self.pull(vars.fileNameLength).then(function(fileNameBuffer) {
      var fileName = fileNameBuffer.toString('utf8');
      var entry = Stream.PassThrough();
      var __autodraining = false;

      entry.autodrain = function() {
        __autodraining = true;
        var draining = entry.pipe(NoopStream());
        draining.promise = function() {
          return new Promise(function(resolve, reject) {
            draining.on('finish',resolve);
            draining.on('error',reject);
          });
        };
        return draining;
      };

      entry.buffer = function() {
        return BufferStream(entry);
      };

      entry.path = fileName;
      entry.props = {};
      entry.props.path = fileName;
      entry.props.pathBuffer = fileNameBuffer;
      entry.props.flags = {
        "isUnicode": vars.flags & 0x11
      };
      entry.type = (vars.uncompressedSize === 0 && /[\/\\]$/.test(fileName)) ? 'Directory' : 'File';

      if (self._opts.verbose) {
        if (entry.type === 'Directory') {
          console.log('   creating:', fileName);
        } else if (entry.type === 'File') {
          if (vars.compressionMethod === 0) {
            console.log(' extracting:', fileName);
          } else {
            console.log('  inflating:', fileName);
          }
        }
      }

      return self.pull(vars.extraFieldLength).then(function(extraField) {
        var extra = parseExtraField(extraField, vars);

        entry.vars = vars;
        entry.extra = extra;

        if (self._opts.forceStream) {
          self.push(entry);
        } else {
          self.emit('entry', entry);

          if (self._readableState.pipesCount || (self._readableState.pipes && self._readableState.pipes.length))
            self.push(entry);
        }

        if (self._opts.verbose)
          console.log({
            filename:fileName,
            vars: vars,
            extra: extra
          });

        var fileSizeKnown = !(vars.flags & 0x08) || vars.compressedSize > 0,
            eof;

        entry.__autodraining = __autodraining;  // expose __autodraining for test purposes
        var inflater = (vars.compressionMethod && !__autodraining) ? zlib.createInflateRaw() : Stream.PassThrough();

        if (fileSizeKnown) {
          entry.size = vars.uncompressedSize;
          eof = vars.compressedSize;
        } else {
          eof = Buffer.alloc(4);
          eof.writeUInt32LE(0x08074b50, 0);
        }

        return new Promise(function(resolve, reject) {
          self.stream(eof)
            .pipe(inflater)
            .on('error',function(err) { self.emit('error',err);})
            .pipe(entry)
            .on('finish', function() {
              return fileSizeKnown ?
                self._readRecord().then(resolve).catch(reject) :
                self._processDataDescriptor(entry).then(resolve).catch(reject);
            });
        });
      });
    });
  });
};

Parse.prototype._processDataDescriptor = function (entry) {
  var self = this;
  return self.pull(16).then(function(data) {
    var vars = binary.parse(data)
      .word32lu('dataDescriptorSignature')
      .word32lu('crc32')
      .word32lu('compressedSize')
      .word32lu('uncompressedSize')
      .vars;

    entry.size = vars.uncompressedSize;
    return self._readRecord();
  });
};

Parse.prototype._readCentralDirectoryFileHeader = function () {
  var self = this;
  return self.pull(42).then(function(data) {

    var vars = binary.parse(data)
      .word16lu('versionMadeBy')
      .word16lu('versionsNeededToExtract')
      .word16lu('flags')
      .word16lu('compressionMethod')
      .word16lu('lastModifiedTime')
      .word16lu('lastModifiedDate')
      .word32lu('crc32')
      .word32lu('compressedSize')
      .word32lu('uncompressedSize')
      .word16lu('fileNameLength')
      .word16lu('extraFieldLength')
      .word16lu('fileCommentLength')
      .word16lu('diskNumber')
      .word16lu('internalFileAttributes')
      .word32lu('externalFileAttributes')
      .word32lu('offsetToLocalFileHeader')
      .vars;

    return self.pull(vars.fileNameLength).then(function(fileName) {
      vars.fileName = fileName.toString('utf8');
      return self.pull(vars.extraFieldLength);
    })
    .then(function(extraField) {
      return self.pull(vars.fileCommentLength);
    })
    .then(function(fileComment) {
      return self._readRecord();
    });
  });
};

Parse.prototype._readEndOfCentralDirectoryRecord = function() {
  var self = this;
  return self.pull(18).then(function(data) {

    var vars = binary.parse(data)
      .word16lu('diskNumber')
      .word16lu('diskStart')
      .word16lu('numberOfRecordsOnDisk')
      .word16lu('numberOfRecords')
      .word32lu('sizeOfCentralDirectory')
      .word32lu('offsetToStartOfCentralDirectory')
      .word16lu('commentLength')
      .vars;

    return self.pull(vars.commentLength).then(function(comment) {
      comment = comment.toString('utf8');
      self.end();
      self.push(null);
    });

  });
};

Parse.prototype.promise = function() {
  var self = this;
  return new Promise(function(resolve,reject) {
    self.on('finish',resolve);
    self.on('error',reject);
  });
};

module.exports = Parse;

}, function(modId) { var map = {"./PullStream":1676879951635,"./NoopStream":1676879951638,"./BufferStream":1676879951639,"./parseExtraField":1676879951640,"./Buffer":1676879951636,"./parseDateTime":1676879951641}; return __REQUIRE__(map[modId], modId); })
__DEFINE__(1676879951635, function(require, module, exports) {
var Stream = require('stream');
var Promise = require('bluebird');
var util = require('util');
var Buffer = require('./Buffer');
var strFunction = 'function';

// Backwards compatibility for node versions < 8
if (!Stream.Writable || !Stream.Writable.prototype.destroy)
  Stream = require('readable-stream');

function PullStream() {
  if (!(this instanceof PullStream))
    return new PullStream();

  Stream.Duplex.call(this,{decodeStrings:false, objectMode:true});
  this.buffer = Buffer.from('');
  var self = this;
  self.on('finish',function() {
    self.finished = true;
    self.emit('chunk',false);
  });
}

util.inherits(PullStream,Stream.Duplex);

PullStream.prototype._write = function(chunk,e,cb) {
  this.buffer = Buffer.concat([this.buffer,chunk]);
  this.cb = cb;
  this.emit('chunk');
};


// The `eof` parameter is interpreted as `file_length` if the type is number
// otherwise (i.e. buffer) it is interpreted as a pattern signaling end of stream
PullStream.prototype.stream = function(eof,includeEof) {
  var p = Stream.PassThrough();
  var done,self= this;

  function cb() {
    if (typeof self.cb === strFunction) {
      var callback = self.cb;
      self.cb = undefined;
      return callback();
    }
  }

  function pull() {
    var packet;
    if (self.buffer && self.buffer.length) {
      if (typeof eof === 'number') {
        packet = self.buffer.slice(0,eof);
        self.buffer = self.buffer.slice(eof);
        eof -= packet.length;
        done = !eof;
      } else {
        var match = self.buffer.indexOf(eof);
        if (match !== -1) {
          // store signature match byte offset to allow us to reference
          // this for zip64 offset
          self.match = match
          if (includeEof) match = match + eof.length;
          packet = self.buffer.slice(0,match);
          self.buffer = self.buffer.slice(match);
          done = true;
        } else {
          var len = self.buffer.length - eof.length;
          if (len <= 0) {
            cb();
          } else {
            packet = self.buffer.slice(0,len);
            self.buffer = self.buffer.slice(len);
          }
        }
      }
      if (packet) p.write(packet,function() {
        if (self.buffer.length === 0 || (eof.length && self.buffer.length <= eof.length)) cb();
      });
    }
    
    if (!done) {
      if (self.finished && !this.__ended) {
        self.removeListener('chunk',pull);
        self.emit('error', new Error('FILE_ENDED'));
        this.__ended = true;
        return;
      }
      
    } else {
      self.removeListener('chunk',pull);
      p.end();
    }
  }

  self.on('chunk',pull);
  pull();
  return p;
};

PullStream.prototype.pull = function(eof,includeEof) {
  if (eof === 0) return Promise.resolve('');

  // If we already have the required data in buffer
  // we can resolve the request immediately
  if (!isNaN(eof) && this.buffer.length > eof) {
    var data = this.buffer.slice(0,eof);
    this.buffer = this.buffer.slice(eof);
    return Promise.resolve(data);
  }

  // Otherwise we stream until we have it
  var buffer = Buffer.from(''),
      self = this;

  var concatStream = Stream.Transform();
  concatStream._transform = function(d,e,cb) {
    buffer = Buffer.concat([buffer,d]);
    cb();
  };
  
  var rejectHandler;
  var pullStreamRejectHandler;
  return new Promise(function(resolve,reject) {
    rejectHandler = reject;
    pullStreamRejectHandler = function(e) {
      self.__emittedError = e;
      reject(e);
    }
    if (self.finished)
      return reject(new Error('FILE_ENDED'));
    self.once('error',pullStreamRejectHandler);  // reject any errors from pullstream itself
    self.stream(eof,includeEof)
      .on('error',reject)
      .pipe(concatStream)
      .on('finish',function() {resolve(buffer);})
      .on('error',reject);
  })
  .finally(function() {
    self.removeListener('error',rejectHandler);
    self.removeListener('error',pullStreamRejectHandler);
  });
};

PullStream.prototype._read = function(){};

module.exports = PullStream;

}, function(modId) { var map = {"./Buffer":1676879951636}; return __REQUIRE__(map[modId], modId); })
__DEFINE__(1676879951636, function(require, module, exports) {
var Buffer = require('buffer').Buffer;

// Backwards compatibility for node versions < 8
if (Buffer.from === undefined) {
  Buffer.from = function (a, b, c) {
    return new Buffer(a, b, c)
  };

  Buffer.alloc = Buffer.from;
}

module.exports = Buffer;
}, function(modId) { var map = {"buffer":1676879951637}; return __REQUIRE__(map[modId], modId); })
__DEFINE__(1676879951637, function(require, module, exports) {
var Buffer = require('buffer').Buffer;

// Backwards compatibility for node versions < 8
if (Buffer.from === undefined) {
  Buffer.from = function (a, b, c) {
    return new Buffer(a, b, c)
  };

  Buffer.alloc = Buffer.from;
}

module.exports = Buffer;
}, function(modId) { var map = {"buffer":1676879951637}; return __REQUIRE__(map[modId], modId); })
__DEFINE__(1676879951638, function(require, module, exports) {
var Stream = require('stream');
var util = require('util');

// Backwards compatibility for node versions < 8
if (!Stream.Writable || !Stream.Writable.prototype.destroy)
  Stream = require('readable-stream');

function NoopStream() {
  if (!(this instanceof NoopStream)) {
    return new NoopStream();
  }
  Stream.Transform.call(this);
}

util.inherits(NoopStream,Stream.Transform);

NoopStream.prototype._transform = function(d,e,cb) { cb() ;};
  
module.exports = NoopStream;
}, function(modId) { var map = {}; return __REQUIRE__(map[modId], modId); })
__DEFINE__(1676879951639, function(require, module, exports) {
var Promise = require('bluebird');
var Stream = require('stream');
var Buffer = require('./Buffer');

// Backwards compatibility for node versions < 8
if (!Stream.Writable || !Stream.Writable.prototype.destroy)
  Stream = require('readable-stream');

module.exports = function(entry) {
  return new Promise(function(resolve,reject) {
    var chunks = [];
    var bufferStream = Stream.Transform()
      .on('finish',function() {
        resolve(Buffer.concat(chunks));
      })
      .on('error',reject);
        
    bufferStream._transform = function(d,e,cb) {
      chunks.push(d);
      cb();
    };
    entry.on('error',reject)
      .pipe(bufferStream);
  });
};

}, function(modId) { var map = {"./Buffer":1676879951636}; return __REQUIRE__(map[modId], modId); })
__DEFINE__(1676879951640, function(require, module, exports) {
var binary = require('binary');

module.exports = function(extraField, vars) {
  var extra;
  // Find the ZIP64 header, if present.
  while(!extra && extraField && extraField.length) {
    var candidateExtra = binary.parse(extraField)
      .word16lu('signature')
      .word16lu('partsize')
      .word64lu('uncompressedSize')
      .word64lu('compressedSize')
      .word64lu('offset')
      .word64lu('disknum')
      .vars;

    if(candidateExtra.signature === 0x0001) {
      extra = candidateExtra;
    } else {
      // Advance the buffer to the next part.
      // The total size of this part is the 4 byte header + partsize.
      extraField = extraField.slice(candidateExtra.partsize + 4);
    }
  }

  extra = extra || {};

  if (vars.compressedSize === 0xffffffff)
    vars.compressedSize = extra.compressedSize;

  if (vars.uncompressedSize  === 0xffffffff)
    vars.uncompressedSize= extra.uncompressedSize;

  if (vars.offsetToLocalFileHeader === 0xffffffff)
    vars.offsetToLocalFileHeader= extra.offset;

  return extra;
};

}, function(modId) { var map = {}; return __REQUIRE__(map[modId], modId); })
__DEFINE__(1676879951641, function(require, module, exports) {
// Dates in zip file entries are stored as DosDateTime
// Spec is here: https://docs.microsoft.com/en-us/windows/win32/api/winbase/nf-winbase-dosdatetimetofiletime

module.exports = function parseDateTime(date, time) {
  const day = date & 0x1F;
  const month = date >> 5 & 0x0F;
  const year = (date >> 9 & 0x7F) + 1980;
  const seconds = time ? (time & 0x1F) * 2 : 0;
  const minutes = time ? (time >> 5) & 0x3F : 0;
  const hours = time ? (time >> 11): 0;

  return new Date(Date.UTC(year, month-1, day, hours, minutes, seconds));
};
}, function(modId) { var map = {}; return __REQUIRE__(map[modId], modId); })
__DEFINE__(1676879951642, function(require, module, exports) {
var Stream = require('stream');
var Parse = require('./parse');
var duplexer2 = require('duplexer2');
var BufferStream = require('./BufferStream');

// Backwards compatibility for node versions < 8
if (!Stream.Writable || !Stream.Writable.prototype.destroy)
  Stream = require('readable-stream');

function parseOne(match,opts) {
  var inStream = Stream.PassThrough({objectMode:true});
  var outStream = Stream.PassThrough();
  var transform = Stream.Transform({objectMode:true});
  var re = match instanceof RegExp ? match : (match && new RegExp(match));
  var found;

  transform._transform = function(entry,e,cb) {
    if (found || (re && !re.exec(entry.path))) {
      entry.autodrain();
      return cb();
    } else {
      found = true;
      out.emit('entry',entry);
      entry.on('error',function(e) {
        outStream.emit('error',e);
      });
      entry.pipe(outStream)
        .on('error',function(err) {
          cb(err);
        })
        .on('finish',function(d) {
          cb(null,d);
        });
    }
  };

  inStream.pipe(Parse(opts))
    .on('error',function(err) {
      outStream.emit('error',err);
    })
    .pipe(transform)
    .on('error',Object)  // Silence error as its already addressed in transform
    .on('finish',function() {
      if (!found)
        outStream.emit('error',new Error('PATTERN_NOT_FOUND'));
      else
        outStream.end();
    });

  var out = duplexer2(inStream,outStream);
  out.buffer = function() {
    return BufferStream(outStream);
  };

  return out;
}

module.exports = parseOne;

}, function(modId) { var map = {"./parse":1676879951634,"./BufferStream":1676879951639}; return __REQUIRE__(map[modId], modId); })
__DEFINE__(1676879951643, function(require, module, exports) {
module.exports = Extract;

var Parse = require('./parse');
var Writer = require('fstream').Writer;
var path = require('path');
var stream = require('stream');
var duplexer2 = require('duplexer2');
var Promise = require('bluebird');

function Extract (opts) {
  // make sure path is normalized before using it
  opts.path = path.resolve(path.normalize(opts.path));

  var parser = new Parse(opts);

  var outStream = new stream.Writable({objectMode: true});
  outStream._write = function(entry, encoding, cb) {

    if (entry.type == 'Directory') return cb();

    // to avoid zip slip (writing outside of the destination), we resolve
    // the target path, and make sure it's nested in the intended
    // destination, or not extract it otherwise.
    var extractPath = path.join(opts.path, entry.path);
    if (extractPath.indexOf(opts.path) != 0) {
      return cb();
    }

    const writer = opts.getWriter ? opts.getWriter({path: extractPath}) :  Writer({ path: extractPath });

    entry.pipe(writer)
      .on('error', cb)
      .on('close', cb);
  };

  var extract = duplexer2(parser,outStream);
  parser.once('crx-header', function(crxHeader) {
    extract.crxHeader = crxHeader;
  });

  parser
    .pipe(outStream)
    .on('finish',function() {
      extract.emit('close');
    });
  
  extract.promise = function() {
    return new Promise(function(resolve, reject) {
      extract.on('close', resolve);
      extract.on('error',reject);
    });
  };

  return extract;
}

}, function(modId) { var map = {"./parse":1676879951634}; return __REQUIRE__(map[modId], modId); })
__DEFINE__(1676879951644, function(require, module, exports) {
var fs = require('graceful-fs');
var Promise = require('bluebird');
var directory = require('./directory');
var Stream = require('stream');

// Backwards compatibility for node versions < 8
if (!Stream.Writable || !Stream.Writable.prototype.destroy)
  Stream = require('readable-stream');

module.exports = {
  buffer: function(buffer, options) {
    var source = {
      stream: function(offset, length) {
        var stream = Stream.PassThrough();
        stream.end(buffer.slice(offset, length));
        return stream;
      },
      size: function() {
        return Promise.resolve(buffer.length);
      }
    };
    return directory(source, options);
  },
  file: function(filename, options) {
    var source = {
      stream: function(offset,length) {
        return fs.createReadStream(filename,{start: offset, end: length && offset+length});
      },
      size: function() {
        return new Promise(function(resolve,reject) {
          fs.stat(filename,function(err,d) {
            if (err)
              reject(err);
            else
              resolve(d.size);
          });
        });
      }
    };
    return directory(source, options);
  },

  url: function(request, params, options) {
    if (typeof params === 'string')
      params = {url: params};
    if (!params.url)
      throw 'URL missing';
    params.headers = params.headers || {};

    var source = {
      stream : function(offset,length) {
        var options = Object.create(params);
        options.headers = Object.create(params.headers);
        options.headers.range = 'bytes='+offset+'-' + (length ? length : '');
        return request(options);
      },
      size: function() {
        return new Promise(function(resolve,reject) {
          var req = request(params);
          req.on('response',function(d) {
            req.abort();
            if (!d.headers['content-length'])
              reject(new Error('Missing content length header'));
            else
              resolve(d.headers['content-length']);
          }).on('error',reject);
        });
      }
    };

    return directory(source, options);
  },

  s3 : function(client,params, options) {
    var source = {
      size: function() {
        return new Promise(function(resolve,reject) {
          client.headObject(params, function(err,d) {
            if (err)
              reject(err);
            else
              resolve(d.ContentLength);
          });
        });
      },
      stream: function(offset,length) {
        var d = {};
        for (var key in params)
          d[key] = params[key];
        d.Range = 'bytes='+offset+'-' + (length ? length : '');
        return client.getObject(d).createReadStream();
      }
    };

    return directory(source, options);
  }
};

}, function(modId) { var map = {"./directory":1676879951645}; return __REQUIRE__(map[modId], modId); })
__DEFINE__(1676879951645, function(require, module, exports) {
var binary = require('binary');
var PullStream = require('../PullStream');
var unzip = require('./unzip');
var Promise = require('bluebird');
var BufferStream = require('../BufferStream');
var parseExtraField = require('../parseExtraField');
var Buffer = require('../Buffer');
var path = require('path');
var Writer = require('fstream').Writer;
var parseDateTime = require('../parseDateTime');

var signature = Buffer.alloc(4);
signature.writeUInt32LE(0x06054b50,0);

function getCrxHeader(source) {
  var sourceStream = source.stream(0).pipe(PullStream());

  return sourceStream.pull(4).then(function(data) {
    var signature = data.readUInt32LE(0);
    if (signature === 0x34327243) {
      var crxHeader;
      return sourceStream.pull(12).then(function(data) {
        crxHeader = binary.parse(data)
          .word32lu('version')
          .word32lu('pubKeyLength')
          .word32lu('signatureLength')
          .vars;
      }).then(function() {
        return sourceStream.pull(crxHeader.pubKeyLength +crxHeader.signatureLength);
      }).then(function(data) {
        crxHeader.publicKey = data.slice(0,crxHeader.pubKeyLength);
        crxHeader.signature = data.slice(crxHeader.pubKeyLength);
        crxHeader.size = 16 + crxHeader.pubKeyLength +crxHeader.signatureLength;
        return crxHeader;
      });
    }
  });
}

// Zip64 File Format Notes: https://pkware.cachefly.net/webdocs/casestudies/APPNOTE.TXT
function getZip64CentralDirectory(source, zip64CDL) {
  var d64loc = binary.parse(zip64CDL)
    .word32lu('signature')
    .word32lu('diskNumber')
    .word64lu('offsetToStartOfCentralDirectory')
    .word32lu('numberOfDisks')
    .vars;

  if (d64loc.signature != 0x07064b50) {
    throw new Error('invalid zip64 end of central dir locator signature (0x07064b50): 0x' + d64loc.signature.toString(16));
  }

  var dir64 = PullStream();
  source.stream(d64loc.offsetToStartOfCentralDirectory).pipe(dir64);

  return dir64.pull(56)
}

// Zip64 File Format Notes: https://pkware.cachefly.net/webdocs/casestudies/APPNOTE.TXT
function parseZip64DirRecord (dir64record) {
  var vars = binary.parse(dir64record)
    .word32lu('signature')
    .word64lu('sizeOfCentralDirectory')
    .word16lu('version')
    .word16lu('versionsNeededToExtract')
    .word32lu('diskNumber')
    .word32lu('diskStart')
    .word64lu('numberOfRecordsOnDisk')
    .word64lu('numberOfRecords')
    .word64lu('sizeOfCentralDirectory')
    .word64lu('offsetToStartOfCentralDirectory')
    .vars;

  if (vars.signature != 0x06064b50) {
    throw new Error('invalid zip64 end of central dir locator signature (0x06064b50): 0x0' + vars.signature.toString(16));
  }

  return vars
}

module.exports = function centralDirectory(source, options) {
  var endDir = PullStream(),
      records = PullStream(),
      tailSize = (options && options.tailSize) || 80,
      sourceSize,
      crxHeader,
      startOffset,
      vars;

  if (options && options.crx)
    crxHeader = getCrxHeader(source);

  return source.size()
    .then(function(size) {
      sourceSize = size;

      source.stream(Math.max(0,size-tailSize))
        .on('error', function (error) { endDir.emit('error', error) })
        .pipe(endDir);

      return endDir.pull(signature);
    })
    .then(function() {
      return Promise.props({directory: endDir.pull(22), crxHeader: crxHeader});
    })
    .then(function(d) {
      var data = d.directory;
      startOffset = d.crxHeader && d.crxHeader.size || 0;

      vars = binary.parse(data)
        .word32lu('signature')
        .word16lu('diskNumber')
        .word16lu('diskStart')
        .word16lu('numberOfRecordsOnDisk')
        .word16lu('numberOfRecords')
        .word32lu('sizeOfCentralDirectory')
        .word32lu('offsetToStartOfCentralDirectory')
        .word16lu('commentLength')
        .vars;

      // Is this zip file using zip64 format? Use same check as Go:
      // https://github.com/golang/go/blob/master/src/archive/zip/reader.go#L503
      // For zip64 files, need to find zip64 central directory locator header to extract
      // relative offset for zip64 central directory record.
      if (vars.numberOfRecords == 0xffff|| vars.numberOfRecords == 0xffff ||
        vars.offsetToStartOfCentralDirectory == 0xffffffff) {

        // Offset to zip64 CDL is 20 bytes before normal CDR
        const zip64CDLSize = 20
        const zip64CDLOffset = sourceSize - (tailSize - endDir.match + zip64CDLSize)
        const zip64CDLStream = PullStream();

        source.stream(zip64CDLOffset).pipe(zip64CDLStream);

        return zip64CDLStream.pull(zip64CDLSize)
          .then(function (d) { return getZip64CentralDirectory(source, d) })
          .then(function (dir64record) {
            vars = parseZip64DirRecord(dir64record)
          })
      } else {
        vars.offsetToStartOfCentralDirectory += startOffset;
      }
    })
    .then(function() {
      source.stream(vars.offsetToStartOfCentralDirectory).pipe(records);

      vars.extract = function(opts) {
        if (!opts || !opts.path) throw new Error('PATH_MISSING');
        return vars.files.then(function(files) {
          return Promise.map(files, function(entry) {
            if (entry.type == 'Directory') return;

            // to avoid zip slip (writing outside of the destination), we resolve
            // the target path, and make sure it's nested in the intended
            // destination, or not extract it otherwise.
            var extractPath = path.join(opts.path, entry.path);
            if (extractPath.indexOf(opts.path) != 0) {
              return;
            }
            var writer = opts.getWriter ? opts.getWriter({path: extractPath}) :  Writer({ path: extractPath });

            return new Promise(function(resolve, reject) {
              entry.stream(opts.password)
                .on('error',reject)
                .pipe(writer)
                .on('close',resolve)
                .on('error',reject);
            });
          }, opts.concurrency > 1 ? {concurrency: opts.concurrency || undefined} : undefined);
        });
      };

      vars.files = Promise.mapSeries(Array(vars.numberOfRecords),function() {
        return records.pull(46).then(function(data) {    
          var vars = binary.parse(data)
            .word32lu('signature')
            .word16lu('versionMadeBy')
            .word16lu('versionsNeededToExtract')
            .word16lu('flags')
            .word16lu('compressionMethod')
            .word16lu('lastModifiedTime')
            .word16lu('lastModifiedDate')
            .word32lu('crc32')
            .word32lu('compressedSize')
            .word32lu('uncompressedSize')
            .word16lu('fileNameLength')
            .word16lu('extraFieldLength')
            .word16lu('fileCommentLength')
            .word16lu('diskNumber')
            .word16lu('internalFileAttributes')
            .word32lu('externalFileAttributes')
            .word32lu('offsetToLocalFileHeader')
            .vars;

        vars.offsetToLocalFileHeader += startOffset;
        vars.lastModifiedDateTime = parseDateTime(vars.lastModifiedDate, vars.lastModifiedTime);

        return records.pull(vars.fileNameLength).then(function(fileNameBuffer) {
          vars.pathBuffer = fileNameBuffer;
          vars.path = fileNameBuffer.toString('utf8');
          vars.isUnicode = vars.flags & 0x11;
          return records.pull(vars.extraFieldLength);
        })
        .then(function(extraField) {
          vars.extra = parseExtraField(extraField, vars);
          return records.pull(vars.fileCommentLength);
        })
        .then(function(comment) {
          vars.comment = comment;
          vars.type = (vars.uncompressedSize === 0 && /[\/\\]$/.test(vars.path)) ? 'Directory' : 'File';
          vars.stream = function(_password) {
            return unzip(source, vars.offsetToLocalFileHeader,_password, vars);
          };
          vars.buffer = function(_password) {
            return BufferStream(vars.stream(_password));
          };
          return vars;
        });
      });
    });

    return Promise.props(vars);
  });
};

}, function(modId) { var map = {"../PullStream":1676879951635,"./unzip":1676879951646,"../BufferStream":1676879951639,"../parseExtraField":1676879951640,"../Buffer":1676879951636,"../parseDateTime":1676879951641}; return __REQUIRE__(map[modId], modId); })
__DEFINE__(1676879951646, function(require, module, exports) {
var Promise = require('bluebird');
var Decrypt = require('../Decrypt');
var PullStream = require('../PullStream');
var Stream = require('stream');
var binary = require('binary');
var zlib = require('zlib');
var parseExtraField = require('../parseExtraField');
var Buffer = require('../Buffer');
var parseDateTime = require('../parseDateTime');

// Backwards compatibility for node versions < 8
if (!Stream.Writable || !Stream.Writable.prototype.destroy)
  Stream = require('readable-stream');

module.exports = function unzip(source,offset,_password, directoryVars) {
  var file = PullStream(),
      entry = Stream.PassThrough();

  var req = source.stream(offset);
  req.pipe(file).on('error', function(e) {
    entry.emit('error', e);
  });

  entry.vars = file.pull(30)
    .then(function(data) {
      var vars = binary.parse(data)
        .word32lu('signature')
        .word16lu('versionsNeededToExtract')
        .word16lu('flags')
        .word16lu('compressionMethod')
        .word16lu('lastModifiedTime')
        .word16lu('lastModifiedDate')
        .word32lu('crc32')
        .word32lu('compressedSize')
        .word32lu('uncompressedSize')
        .word16lu('fileNameLength')
        .word16lu('extraFieldLength')
        .vars;

      vars.lastModifiedDateTime = parseDateTime(vars.lastModifiedDate, vars.lastModifiedTime);

      return file.pull(vars.fileNameLength)
        .then(function(fileName) {
          vars.fileName = fileName.toString('utf8');
          return file.pull(vars.extraFieldLength);
        })
        .then(function(extraField) {
          var checkEncryption;
          vars.extra = parseExtraField(extraField, vars);
          // Ignore logal file header vars if the directory vars are available
          if (directoryVars && directoryVars.compressedSize) vars = directoryVars;

          if (vars.flags & 0x01) checkEncryption = file.pull(12)
            .then(function(header) {
              if (!_password)
                throw new Error('MISSING_PASSWORD');

              var decrypt = Decrypt();

              String(_password).split('').forEach(function(d) {
                decrypt.update(d);
              });

              for (var i=0; i < header.length; i++)
                header[i] = decrypt.decryptByte(header[i]);

              vars.decrypt = decrypt;
              vars.compressedSize -= 12;

              var check = (vars.flags & 0x8) ? (vars.lastModifiedTime >> 8) & 0xff : (vars.crc32 >> 24) & 0xff;
              if (header[11] !== check)
                throw new Error('BAD_PASSWORD');

              return vars;
            });

          return Promise.resolve(checkEncryption)
            .then(function() {
              entry.emit('vars',vars);
              return vars;
            });
        });
    });

    entry.vars.then(function(vars) {
      var fileSizeKnown = !(vars.flags & 0x08) || vars.compressedSize > 0,
          eof;

      var inflater = vars.compressionMethod ? zlib.createInflateRaw() : Stream.PassThrough();

      if (fileSizeKnown) {
        entry.size = vars.uncompressedSize;
        eof = vars.compressedSize;
      } else {
        eof = Buffer.alloc(4);
        eof.writeUInt32LE(0x08074b50, 0);
      }

      var stream = file.stream(eof);

      if (vars.decrypt)
        stream = stream.pipe(vars.decrypt.stream());

      stream
        .pipe(inflater)
        .on('error',function(err) { entry.emit('error',err);})
        .pipe(entry)
        .on('finish', function() {
          if (req.abort)
            req.abort();
          else if (req.close)
            req.close();
          else if (req.push)
            req.push();
          else
            console.log('warning - unable to close stream');
        });
    })
    .catch(function(e) {
      entry.emit('error',e);
    });

  return entry;
};

}, function(modId) { var map = {"../Decrypt":1676879951647,"../PullStream":1676879951635,"../parseExtraField":1676879951640,"../Buffer":1676879951636,"../parseDateTime":1676879951641}; return __REQUIRE__(map[modId], modId); })
__DEFINE__(1676879951647, function(require, module, exports) {
var bigInt = require('big-integer');
var Stream = require('stream');

// Backwards compatibility for node versions < 8
if (!Stream.Writable || !Stream.Writable.prototype.destroy)
  Stream = require('readable-stream');

var table;

function generateTable() {
  var poly = 0xEDB88320,c,n,k;
  table = [];
  for (n = 0; n < 256; n++) {
    c = n;
    for (k = 0; k < 8; k++)
      c = (c & 1) ? poly ^ (c >>> 1) :  c = c >>> 1;
    table[n] = c >>> 0;
  }
}

function crc(ch,crc) {
  if (!table)
    generateTable();

  if (ch.charCodeAt)
    ch = ch.charCodeAt(0);        

  return (bigInt(crc).shiftRight(8).and(0xffffff)).xor(table[bigInt(crc).xor(ch).and(0xff)]).value;
}

function Decrypt() {
  if (!(this instanceof Decrypt))
    return new Decrypt();

  this.key0 = 305419896;
  this.key1 = 591751049;
  this.key2 = 878082192;
}

Decrypt.prototype.update = function(h) {            
  this.key0 = crc(h,this.key0);
  this.key1 = bigInt(this.key0).and(255).and(4294967295).add(this.key1)
  this.key1 = bigInt(this.key1).multiply(134775813).add(1).and(4294967295).value;
  this.key2 = crc(bigInt(this.key1).shiftRight(24).and(255), this.key2);
}


Decrypt.prototype.decryptByte = function(c) {
  var k = bigInt(this.key2).or(2);
  c = c ^ bigInt(k).multiply(bigInt(k^1)).shiftRight(8).and(255);
  this.update(c);
  return c;
};

 Decrypt.prototype.stream = function() {
  var stream = Stream.Transform(),
      self = this;

  stream._transform = function(d,e,cb) {
    for (var i = 0; i<d.length;i++) {
      d[i] = self.decryptByte(d[i]);
    }
    this.push(d);
    cb();
  };
  return stream;
};




module.exports = Decrypt;
}, function(modId) { var map = {}; return __REQUIRE__(map[modId], modId); })
return __REQUIRE__(1676879951633);
})()
//miniprogram-npm-outsideDeps=["listenercount","buffer-indexof-polyfill","setimmediate","util","zlib","stream","binary","bluebird","readable-stream","duplexer2","fstream","path","graceful-fs","big-integer"]
//# sourceMappingURL=index.js.map