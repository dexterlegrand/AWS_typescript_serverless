var __create = Object.create;
var __defProp = Object.defineProperty;
var __getOwnPropDesc = Object.getOwnPropertyDescriptor;
var __getOwnPropNames = Object.getOwnPropertyNames;
var __getProtoOf = Object.getPrototypeOf;
var __hasOwnProp = Object.prototype.hasOwnProperty;
var __require = /* @__PURE__ */ ((x) => typeof require !== "undefined" ? require : typeof Proxy !== "undefined" ? new Proxy(x, {
  get: (a, b) => (typeof require !== "undefined" ? require : a)[b]
}) : x)(function(x) {
  if (typeof require !== "undefined")
    return require.apply(this, arguments);
  throw new Error('Dynamic require of "' + x + '" is not supported');
});
var __commonJS = (cb, mod) => function __require2() {
  return mod || (0, cb[__getOwnPropNames(cb)[0]])((mod = { exports: {} }).exports, mod), mod.exports;
};
var __export = (target, all3) => {
  for (var name in all3)
    __defProp(target, name, { get: all3[name], enumerable: true });
};
var __copyProps = (to, from, except, desc) => {
  if (from && typeof from === "object" || typeof from === "function") {
    for (let key of __getOwnPropNames(from))
      if (!__hasOwnProp.call(to, key) && key !== except)
        __defProp(to, key, { get: () => from[key], enumerable: !(desc = __getOwnPropDesc(from, key)) || desc.enumerable });
  }
  return to;
};
var __toESM = (mod, isNodeMode, target) => (target = mod != null ? __create(__getProtoOf(mod)) : {}, __copyProps(
  // If the importer is in node compatibility mode or this is not an ESM
  // file that has been converted to a CommonJS file using a Babel-
  // compatible transform (i.e. "__esModule" has not been set), then set
  // "default" to the CommonJS "module.exports" for node compatibility.
  isNodeMode || !mod || !mod.__esModule ? __defProp(target, "default", { value: mod, enumerable: true }) : target,
  mod
));

// apps/backend/src/layers/dependencyLayer/nodejs/node_modules/delayed-stream/lib/delayed_stream.js
var require_delayed_stream = __commonJS({
  "apps/backend/src/layers/dependencyLayer/nodejs/node_modules/delayed-stream/lib/delayed_stream.js"(exports, module) {
    var Stream = __require("stream").Stream;
    var util3 = __require("util");
    module.exports = DelayedStream;
    function DelayedStream() {
      this.source = null;
      this.dataSize = 0;
      this.maxDataSize = 1024 * 1024;
      this.pauseStream = true;
      this._maxDataSizeExceeded = false;
      this._released = false;
      this._bufferedEvents = [];
    }
    util3.inherits(DelayedStream, Stream);
    DelayedStream.create = function(source, options) {
      var delayedStream = new this();
      options = options || {};
      for (var option in options) {
        delayedStream[option] = options[option];
      }
      delayedStream.source = source;
      var realEmit = source.emit;
      source.emit = function() {
        delayedStream._handleEmit(arguments);
        return realEmit.apply(source, arguments);
      };
      source.on("error", function() {
      });
      if (delayedStream.pauseStream) {
        source.pause();
      }
      return delayedStream;
    };
    Object.defineProperty(DelayedStream.prototype, "readable", {
      configurable: true,
      enumerable: true,
      get: function() {
        return this.source.readable;
      }
    });
    DelayedStream.prototype.setEncoding = function() {
      return this.source.setEncoding.apply(this.source, arguments);
    };
    DelayedStream.prototype.resume = function() {
      if (!this._released) {
        this.release();
      }
      this.source.resume();
    };
    DelayedStream.prototype.pause = function() {
      this.source.pause();
    };
    DelayedStream.prototype.release = function() {
      this._released = true;
      this._bufferedEvents.forEach(function(args) {
        this.emit.apply(this, args);
      }.bind(this));
      this._bufferedEvents = [];
    };
    DelayedStream.prototype.pipe = function() {
      var r = Stream.prototype.pipe.apply(this, arguments);
      this.resume();
      return r;
    };
    DelayedStream.prototype._handleEmit = function(args) {
      if (this._released) {
        this.emit.apply(this, args);
        return;
      }
      if (args[0] === "data") {
        this.dataSize += args[1].length;
        this._checkIfMaxDataSizeExceeded();
      }
      this._bufferedEvents.push(args);
    };
    DelayedStream.prototype._checkIfMaxDataSizeExceeded = function() {
      if (this._maxDataSizeExceeded) {
        return;
      }
      if (this.dataSize <= this.maxDataSize) {
        return;
      }
      this._maxDataSizeExceeded = true;
      var message = "DelayedStream#maxDataSize of " + this.maxDataSize + " bytes exceeded.";
      this.emit("error", new Error(message));
    };
  }
});

// apps/backend/src/layers/dependencyLayer/nodejs/node_modules/combined-stream/lib/combined_stream.js
var require_combined_stream = __commonJS({
  "apps/backend/src/layers/dependencyLayer/nodejs/node_modules/combined-stream/lib/combined_stream.js"(exports, module) {
    var util3 = __require("util");
    var Stream = __require("stream").Stream;
    var DelayedStream = require_delayed_stream();
    module.exports = CombinedStream;
    function CombinedStream() {
      this.writable = false;
      this.readable = true;
      this.dataSize = 0;
      this.maxDataSize = 2 * 1024 * 1024;
      this.pauseStreams = true;
      this._released = false;
      this._streams = [];
      this._currentStream = null;
      this._insideLoop = false;
      this._pendingNext = false;
    }
    util3.inherits(CombinedStream, Stream);
    CombinedStream.create = function(options) {
      var combinedStream = new this();
      options = options || {};
      for (var option in options) {
        combinedStream[option] = options[option];
      }
      return combinedStream;
    };
    CombinedStream.isStreamLike = function(stream4) {
      return typeof stream4 !== "function" && typeof stream4 !== "string" && typeof stream4 !== "boolean" && typeof stream4 !== "number" && !Buffer.isBuffer(stream4);
    };
    CombinedStream.prototype.append = function(stream4) {
      var isStreamLike = CombinedStream.isStreamLike(stream4);
      if (isStreamLike) {
        if (!(stream4 instanceof DelayedStream)) {
          var newStream = DelayedStream.create(stream4, {
            maxDataSize: Infinity,
            pauseStream: this.pauseStreams
          });
          stream4.on("data", this._checkDataSize.bind(this));
          stream4 = newStream;
        }
        this._handleErrors(stream4);
        if (this.pauseStreams) {
          stream4.pause();
        }
      }
      this._streams.push(stream4);
      return this;
    };
    CombinedStream.prototype.pipe = function(dest, options) {
      Stream.prototype.pipe.call(this, dest, options);
      this.resume();
      return dest;
    };
    CombinedStream.prototype._getNext = function() {
      this._currentStream = null;
      if (this._insideLoop) {
        this._pendingNext = true;
        return;
      }
      this._insideLoop = true;
      try {
        do {
          this._pendingNext = false;
          this._realGetNext();
        } while (this._pendingNext);
      } finally {
        this._insideLoop = false;
      }
    };
    CombinedStream.prototype._realGetNext = function() {
      var stream4 = this._streams.shift();
      if (typeof stream4 == "undefined") {
        this.end();
        return;
      }
      if (typeof stream4 !== "function") {
        this._pipeNext(stream4);
        return;
      }
      var getStream = stream4;
      getStream(function(stream5) {
        var isStreamLike = CombinedStream.isStreamLike(stream5);
        if (isStreamLike) {
          stream5.on("data", this._checkDataSize.bind(this));
          this._handleErrors(stream5);
        }
        this._pipeNext(stream5);
      }.bind(this));
    };
    CombinedStream.prototype._pipeNext = function(stream4) {
      this._currentStream = stream4;
      var isStreamLike = CombinedStream.isStreamLike(stream4);
      if (isStreamLike) {
        stream4.on("end", this._getNext.bind(this));
        stream4.pipe(this, { end: false });
        return;
      }
      var value = stream4;
      this.write(value);
      this._getNext();
    };
    CombinedStream.prototype._handleErrors = function(stream4) {
      var self2 = this;
      stream4.on("error", function(err) {
        self2._emitError(err);
      });
    };
    CombinedStream.prototype.write = function(data) {
      this.emit("data", data);
    };
    CombinedStream.prototype.pause = function() {
      if (!this.pauseStreams) {
        return;
      }
      if (this.pauseStreams && this._currentStream && typeof this._currentStream.pause == "function")
        this._currentStream.pause();
      this.emit("pause");
    };
    CombinedStream.prototype.resume = function() {
      if (!this._released) {
        this._released = true;
        this.writable = true;
        this._getNext();
      }
      if (this.pauseStreams && this._currentStream && typeof this._currentStream.resume == "function")
        this._currentStream.resume();
      this.emit("resume");
    };
    CombinedStream.prototype.end = function() {
      this._reset();
      this.emit("end");
    };
    CombinedStream.prototype.destroy = function() {
      this._reset();
      this.emit("close");
    };
    CombinedStream.prototype._reset = function() {
      this.writable = false;
      this._streams = [];
      this._currentStream = null;
    };
    CombinedStream.prototype._checkDataSize = function() {
      this._updateDataSize();
      if (this.dataSize <= this.maxDataSize) {
        return;
      }
      var message = "DelayedStream#maxDataSize of " + this.maxDataSize + " bytes exceeded.";
      this._emitError(new Error(message));
    };
    CombinedStream.prototype._updateDataSize = function() {
      this.dataSize = 0;
      var self2 = this;
      this._streams.forEach(function(stream4) {
        if (!stream4.dataSize) {
          return;
        }
        self2.dataSize += stream4.dataSize;
      });
      if (this._currentStream && this._currentStream.dataSize) {
        this.dataSize += this._currentStream.dataSize;
      }
    };
    CombinedStream.prototype._emitError = function(err) {
      this._reset();
      this.emit("error", err);
    };
  }
});

// apps/backend/src/layers/dependencyLayer/nodejs/node_modules/mime-db/db.json
var require_db = __commonJS({
  "apps/backend/src/layers/dependencyLayer/nodejs/node_modules/mime-db/db.json"(exports, module) {
    module.exports = {
      "application/1d-interleaved-parityfec": {
        source: "iana"
      },
      "application/3gpdash-qoe-report+xml": {
        source: "iana",
        charset: "UTF-8",
        compressible: true
      },
      "application/3gpp-ims+xml": {
        source: "iana",
        compressible: true
      },
      "application/3gpphal+json": {
        source: "iana",
        compressible: true
      },
      "application/3gpphalforms+json": {
        source: "iana",
        compressible: true
      },
      "application/a2l": {
        source: "iana"
      },
      "application/ace+cbor": {
        source: "iana"
      },
      "application/activemessage": {
        source: "iana"
      },
      "application/activity+json": {
        source: "iana",
        compressible: true
      },
      "application/alto-costmap+json": {
        source: "iana",
        compressible: true
      },
      "application/alto-costmapfilter+json": {
        source: "iana",
        compressible: true
      },
      "application/alto-directory+json": {
        source: "iana",
        compressible: true
      },
      "application/alto-endpointcost+json": {
        source: "iana",
        compressible: true
      },
      "application/alto-endpointcostparams+json": {
        source: "iana",
        compressible: true
      },
      "application/alto-endpointprop+json": {
        source: "iana",
        compressible: true
      },
      "application/alto-endpointpropparams+json": {
        source: "iana",
        compressible: true
      },
      "application/alto-error+json": {
        source: "iana",
        compressible: true
      },
      "application/alto-networkmap+json": {
        source: "iana",
        compressible: true
      },
      "application/alto-networkmapfilter+json": {
        source: "iana",
        compressible: true
      },
      "application/alto-updatestreamcontrol+json": {
        source: "iana",
        compressible: true
      },
      "application/alto-updatestreamparams+json": {
        source: "iana",
        compressible: true
      },
      "application/aml": {
        source: "iana"
      },
      "application/andrew-inset": {
        source: "iana",
        extensions: ["ez"]
      },
      "application/applefile": {
        source: "iana"
      },
      "application/applixware": {
        source: "apache",
        extensions: ["aw"]
      },
      "application/at+jwt": {
        source: "iana"
      },
      "application/atf": {
        source: "iana"
      },
      "application/atfx": {
        source: "iana"
      },
      "application/atom+xml": {
        source: "iana",
        compressible: true,
        extensions: ["atom"]
      },
      "application/atomcat+xml": {
        source: "iana",
        compressible: true,
        extensions: ["atomcat"]
      },
      "application/atomdeleted+xml": {
        source: "iana",
        compressible: true,
        extensions: ["atomdeleted"]
      },
      "application/atomicmail": {
        source: "iana"
      },
      "application/atomsvc+xml": {
        source: "iana",
        compressible: true,
        extensions: ["atomsvc"]
      },
      "application/atsc-dwd+xml": {
        source: "iana",
        compressible: true,
        extensions: ["dwd"]
      },
      "application/atsc-dynamic-event-message": {
        source: "iana"
      },
      "application/atsc-held+xml": {
        source: "iana",
        compressible: true,
        extensions: ["held"]
      },
      "application/atsc-rdt+json": {
        source: "iana",
        compressible: true
      },
      "application/atsc-rsat+xml": {
        source: "iana",
        compressible: true,
        extensions: ["rsat"]
      },
      "application/atxml": {
        source: "iana"
      },
      "application/auth-policy+xml": {
        source: "iana",
        compressible: true
      },
      "application/bacnet-xdd+zip": {
        source: "iana",
        compressible: false
      },
      "application/batch-smtp": {
        source: "iana"
      },
      "application/bdoc": {
        compressible: false,
        extensions: ["bdoc"]
      },
      "application/beep+xml": {
        source: "iana",
        charset: "UTF-8",
        compressible: true
      },
      "application/calendar+json": {
        source: "iana",
        compressible: true
      },
      "application/calendar+xml": {
        source: "iana",
        compressible: true,
        extensions: ["xcs"]
      },
      "application/call-completion": {
        source: "iana"
      },
      "application/cals-1840": {
        source: "iana"
      },
      "application/captive+json": {
        source: "iana",
        compressible: true
      },
      "application/cbor": {
        source: "iana"
      },
      "application/cbor-seq": {
        source: "iana"
      },
      "application/cccex": {
        source: "iana"
      },
      "application/ccmp+xml": {
        source: "iana",
        compressible: true
      },
      "application/ccxml+xml": {
        source: "iana",
        compressible: true,
        extensions: ["ccxml"]
      },
      "application/cdfx+xml": {
        source: "iana",
        compressible: true,
        extensions: ["cdfx"]
      },
      "application/cdmi-capability": {
        source: "iana",
        extensions: ["cdmia"]
      },
      "application/cdmi-container": {
        source: "iana",
        extensions: ["cdmic"]
      },
      "application/cdmi-domain": {
        source: "iana",
        extensions: ["cdmid"]
      },
      "application/cdmi-object": {
        source: "iana",
        extensions: ["cdmio"]
      },
      "application/cdmi-queue": {
        source: "iana",
        extensions: ["cdmiq"]
      },
      "application/cdni": {
        source: "iana"
      },
      "application/cea": {
        source: "iana"
      },
      "application/cea-2018+xml": {
        source: "iana",
        compressible: true
      },
      "application/cellml+xml": {
        source: "iana",
        compressible: true
      },
      "application/cfw": {
        source: "iana"
      },
      "application/city+json": {
        source: "iana",
        compressible: true
      },
      "application/clr": {
        source: "iana"
      },
      "application/clue+xml": {
        source: "iana",
        compressible: true
      },
      "application/clue_info+xml": {
        source: "iana",
        compressible: true
      },
      "application/cms": {
        source: "iana"
      },
      "application/cnrp+xml": {
        source: "iana",
        compressible: true
      },
      "application/coap-group+json": {
        source: "iana",
        compressible: true
      },
      "application/coap-payload": {
        source: "iana"
      },
      "application/commonground": {
        source: "iana"
      },
      "application/conference-info+xml": {
        source: "iana",
        compressible: true
      },
      "application/cose": {
        source: "iana"
      },
      "application/cose-key": {
        source: "iana"
      },
      "application/cose-key-set": {
        source: "iana"
      },
      "application/cpl+xml": {
        source: "iana",
        compressible: true,
        extensions: ["cpl"]
      },
      "application/csrattrs": {
        source: "iana"
      },
      "application/csta+xml": {
        source: "iana",
        compressible: true
      },
      "application/cstadata+xml": {
        source: "iana",
        compressible: true
      },
      "application/csvm+json": {
        source: "iana",
        compressible: true
      },
      "application/cu-seeme": {
        source: "apache",
        extensions: ["cu"]
      },
      "application/cwt": {
        source: "iana"
      },
      "application/cybercash": {
        source: "iana"
      },
      "application/dart": {
        compressible: true
      },
      "application/dash+xml": {
        source: "iana",
        compressible: true,
        extensions: ["mpd"]
      },
      "application/dash-patch+xml": {
        source: "iana",
        compressible: true,
        extensions: ["mpp"]
      },
      "application/dashdelta": {
        source: "iana"
      },
      "application/davmount+xml": {
        source: "iana",
        compressible: true,
        extensions: ["davmount"]
      },
      "application/dca-rft": {
        source: "iana"
      },
      "application/dcd": {
        source: "iana"
      },
      "application/dec-dx": {
        source: "iana"
      },
      "application/dialog-info+xml": {
        source: "iana",
        compressible: true
      },
      "application/dicom": {
        source: "iana"
      },
      "application/dicom+json": {
        source: "iana",
        compressible: true
      },
      "application/dicom+xml": {
        source: "iana",
        compressible: true
      },
      "application/dii": {
        source: "iana"
      },
      "application/dit": {
        source: "iana"
      },
      "application/dns": {
        source: "iana"
      },
      "application/dns+json": {
        source: "iana",
        compressible: true
      },
      "application/dns-message": {
        source: "iana"
      },
      "application/docbook+xml": {
        source: "apache",
        compressible: true,
        extensions: ["dbk"]
      },
      "application/dots+cbor": {
        source: "iana"
      },
      "application/dskpp+xml": {
        source: "iana",
        compressible: true
      },
      "application/dssc+der": {
        source: "iana",
        extensions: ["dssc"]
      },
      "application/dssc+xml": {
        source: "iana",
        compressible: true,
        extensions: ["xdssc"]
      },
      "application/dvcs": {
        source: "iana"
      },
      "application/ecmascript": {
        source: "iana",
        compressible: true,
        extensions: ["es", "ecma"]
      },
      "application/edi-consent": {
        source: "iana"
      },
      "application/edi-x12": {
        source: "iana",
        compressible: false
      },
      "application/edifact": {
        source: "iana",
        compressible: false
      },
      "application/efi": {
        source: "iana"
      },
      "application/elm+json": {
        source: "iana",
        charset: "UTF-8",
        compressible: true
      },
      "application/elm+xml": {
        source: "iana",
        compressible: true
      },
      "application/emergencycalldata.cap+xml": {
        source: "iana",
        charset: "UTF-8",
        compressible: true
      },
      "application/emergencycalldata.comment+xml": {
        source: "iana",
        compressible: true
      },
      "application/emergencycalldata.control+xml": {
        source: "iana",
        compressible: true
      },
      "application/emergencycalldata.deviceinfo+xml": {
        source: "iana",
        compressible: true
      },
      "application/emergencycalldata.ecall.msd": {
        source: "iana"
      },
      "application/emergencycalldata.providerinfo+xml": {
        source: "iana",
        compressible: true
      },
      "application/emergencycalldata.serviceinfo+xml": {
        source: "iana",
        compressible: true
      },
      "application/emergencycalldata.subscriberinfo+xml": {
        source: "iana",
        compressible: true
      },
      "application/emergencycalldata.veds+xml": {
        source: "iana",
        compressible: true
      },
      "application/emma+xml": {
        source: "iana",
        compressible: true,
        extensions: ["emma"]
      },
      "application/emotionml+xml": {
        source: "iana",
        compressible: true,
        extensions: ["emotionml"]
      },
      "application/encaprtp": {
        source: "iana"
      },
      "application/epp+xml": {
        source: "iana",
        compressible: true
      },
      "application/epub+zip": {
        source: "iana",
        compressible: false,
        extensions: ["epub"]
      },
      "application/eshop": {
        source: "iana"
      },
      "application/exi": {
        source: "iana",
        extensions: ["exi"]
      },
      "application/expect-ct-report+json": {
        source: "iana",
        compressible: true
      },
      "application/express": {
        source: "iana",
        extensions: ["exp"]
      },
      "application/fastinfoset": {
        source: "iana"
      },
      "application/fastsoap": {
        source: "iana"
      },
      "application/fdt+xml": {
        source: "iana",
        compressible: true,
        extensions: ["fdt"]
      },
      "application/fhir+json": {
        source: "iana",
        charset: "UTF-8",
        compressible: true
      },
      "application/fhir+xml": {
        source: "iana",
        charset: "UTF-8",
        compressible: true
      },
      "application/fido.trusted-apps+json": {
        compressible: true
      },
      "application/fits": {
        source: "iana"
      },
      "application/flexfec": {
        source: "iana"
      },
      "application/font-sfnt": {
        source: "iana"
      },
      "application/font-tdpfr": {
        source: "iana",
        extensions: ["pfr"]
      },
      "application/font-woff": {
        source: "iana",
        compressible: false
      },
      "application/framework-attributes+xml": {
        source: "iana",
        compressible: true
      },
      "application/geo+json": {
        source: "iana",
        compressible: true,
        extensions: ["geojson"]
      },
      "application/geo+json-seq": {
        source: "iana"
      },
      "application/geopackage+sqlite3": {
        source: "iana"
      },
      "application/geoxacml+xml": {
        source: "iana",
        compressible: true
      },
      "application/gltf-buffer": {
        source: "iana"
      },
      "application/gml+xml": {
        source: "iana",
        compressible: true,
        extensions: ["gml"]
      },
      "application/gpx+xml": {
        source: "apache",
        compressible: true,
        extensions: ["gpx"]
      },
      "application/gxf": {
        source: "apache",
        extensions: ["gxf"]
      },
      "application/gzip": {
        source: "iana",
        compressible: false,
        extensions: ["gz"]
      },
      "application/h224": {
        source: "iana"
      },
      "application/held+xml": {
        source: "iana",
        compressible: true
      },
      "application/hjson": {
        extensions: ["hjson"]
      },
      "application/http": {
        source: "iana"
      },
      "application/hyperstudio": {
        source: "iana",
        extensions: ["stk"]
      },
      "application/ibe-key-request+xml": {
        source: "iana",
        compressible: true
      },
      "application/ibe-pkg-reply+xml": {
        source: "iana",
        compressible: true
      },
      "application/ibe-pp-data": {
        source: "iana"
      },
      "application/iges": {
        source: "iana"
      },
      "application/im-iscomposing+xml": {
        source: "iana",
        charset: "UTF-8",
        compressible: true
      },
      "application/index": {
        source: "iana"
      },
      "application/index.cmd": {
        source: "iana"
      },
      "application/index.obj": {
        source: "iana"
      },
      "application/index.response": {
        source: "iana"
      },
      "application/index.vnd": {
        source: "iana"
      },
      "application/inkml+xml": {
        source: "iana",
        compressible: true,
        extensions: ["ink", "inkml"]
      },
      "application/iotp": {
        source: "iana"
      },
      "application/ipfix": {
        source: "iana",
        extensions: ["ipfix"]
      },
      "application/ipp": {
        source: "iana"
      },
      "application/isup": {
        source: "iana"
      },
      "application/its+xml": {
        source: "iana",
        compressible: true,
        extensions: ["its"]
      },
      "application/java-archive": {
        source: "apache",
        compressible: false,
        extensions: ["jar", "war", "ear"]
      },
      "application/java-serialized-object": {
        source: "apache",
        compressible: false,
        extensions: ["ser"]
      },
      "application/java-vm": {
        source: "apache",
        compressible: false,
        extensions: ["class"]
      },
      "application/javascript": {
        source: "iana",
        charset: "UTF-8",
        compressible: true,
        extensions: ["js", "mjs"]
      },
      "application/jf2feed+json": {
        source: "iana",
        compressible: true
      },
      "application/jose": {
        source: "iana"
      },
      "application/jose+json": {
        source: "iana",
        compressible: true
      },
      "application/jrd+json": {
        source: "iana",
        compressible: true
      },
      "application/jscalendar+json": {
        source: "iana",
        compressible: true
      },
      "application/json": {
        source: "iana",
        charset: "UTF-8",
        compressible: true,
        extensions: ["json", "map"]
      },
      "application/json-patch+json": {
        source: "iana",
        compressible: true
      },
      "application/json-seq": {
        source: "iana"
      },
      "application/json5": {
        extensions: ["json5"]
      },
      "application/jsonml+json": {
        source: "apache",
        compressible: true,
        extensions: ["jsonml"]
      },
      "application/jwk+json": {
        source: "iana",
        compressible: true
      },
      "application/jwk-set+json": {
        source: "iana",
        compressible: true
      },
      "application/jwt": {
        source: "iana"
      },
      "application/kpml-request+xml": {
        source: "iana",
        compressible: true
      },
      "application/kpml-response+xml": {
        source: "iana",
        compressible: true
      },
      "application/ld+json": {
        source: "iana",
        compressible: true,
        extensions: ["jsonld"]
      },
      "application/lgr+xml": {
        source: "iana",
        compressible: true,
        extensions: ["lgr"]
      },
      "application/link-format": {
        source: "iana"
      },
      "application/load-control+xml": {
        source: "iana",
        compressible: true
      },
      "application/lost+xml": {
        source: "iana",
        compressible: true,
        extensions: ["lostxml"]
      },
      "application/lostsync+xml": {
        source: "iana",
        compressible: true
      },
      "application/lpf+zip": {
        source: "iana",
        compressible: false
      },
      "application/lxf": {
        source: "iana"
      },
      "application/mac-binhex40": {
        source: "iana",
        extensions: ["hqx"]
      },
      "application/mac-compactpro": {
        source: "apache",
        extensions: ["cpt"]
      },
      "application/macwriteii": {
        source: "iana"
      },
      "application/mads+xml": {
        source: "iana",
        compressible: true,
        extensions: ["mads"]
      },
      "application/manifest+json": {
        source: "iana",
        charset: "UTF-8",
        compressible: true,
        extensions: ["webmanifest"]
      },
      "application/marc": {
        source: "iana",
        extensions: ["mrc"]
      },
      "application/marcxml+xml": {
        source: "iana",
        compressible: true,
        extensions: ["mrcx"]
      },
      "application/mathematica": {
        source: "iana",
        extensions: ["ma", "nb", "mb"]
      },
      "application/mathml+xml": {
        source: "iana",
        compressible: true,
        extensions: ["mathml"]
      },
      "application/mathml-content+xml": {
        source: "iana",
        compressible: true
      },
      "application/mathml-presentation+xml": {
        source: "iana",
        compressible: true
      },
      "application/mbms-associated-procedure-description+xml": {
        source: "iana",
        compressible: true
      },
      "application/mbms-deregister+xml": {
        source: "iana",
        compressible: true
      },
      "application/mbms-envelope+xml": {
        source: "iana",
        compressible: true
      },
      "application/mbms-msk+xml": {
        source: "iana",
        compressible: true
      },
      "application/mbms-msk-response+xml": {
        source: "iana",
        compressible: true
      },
      "application/mbms-protection-description+xml": {
        source: "iana",
        compressible: true
      },
      "application/mbms-reception-report+xml": {
        source: "iana",
        compressible: true
      },
      "application/mbms-register+xml": {
        source: "iana",
        compressible: true
      },
      "application/mbms-register-response+xml": {
        source: "iana",
        compressible: true
      },
      "application/mbms-schedule+xml": {
        source: "iana",
        compressible: true
      },
      "application/mbms-user-service-description+xml": {
        source: "iana",
        compressible: true
      },
      "application/mbox": {
        source: "iana",
        extensions: ["mbox"]
      },
      "application/media-policy-dataset+xml": {
        source: "iana",
        compressible: true,
        extensions: ["mpf"]
      },
      "application/media_control+xml": {
        source: "iana",
        compressible: true
      },
      "application/mediaservercontrol+xml": {
        source: "iana",
        compressible: true,
        extensions: ["mscml"]
      },
      "application/merge-patch+json": {
        source: "iana",
        compressible: true
      },
      "application/metalink+xml": {
        source: "apache",
        compressible: true,
        extensions: ["metalink"]
      },
      "application/metalink4+xml": {
        source: "iana",
        compressible: true,
        extensions: ["meta4"]
      },
      "application/mets+xml": {
        source: "iana",
        compressible: true,
        extensions: ["mets"]
      },
      "application/mf4": {
        source: "iana"
      },
      "application/mikey": {
        source: "iana"
      },
      "application/mipc": {
        source: "iana"
      },
      "application/missing-blocks+cbor-seq": {
        source: "iana"
      },
      "application/mmt-aei+xml": {
        source: "iana",
        compressible: true,
        extensions: ["maei"]
      },
      "application/mmt-usd+xml": {
        source: "iana",
        compressible: true,
        extensions: ["musd"]
      },
      "application/mods+xml": {
        source: "iana",
        compressible: true,
        extensions: ["mods"]
      },
      "application/moss-keys": {
        source: "iana"
      },
      "application/moss-signature": {
        source: "iana"
      },
      "application/mosskey-data": {
        source: "iana"
      },
      "application/mosskey-request": {
        source: "iana"
      },
      "application/mp21": {
        source: "iana",
        extensions: ["m21", "mp21"]
      },
      "application/mp4": {
        source: "iana",
        extensions: ["mp4s", "m4p"]
      },
      "application/mpeg4-generic": {
        source: "iana"
      },
      "application/mpeg4-iod": {
        source: "iana"
      },
      "application/mpeg4-iod-xmt": {
        source: "iana"
      },
      "application/mrb-consumer+xml": {
        source: "iana",
        compressible: true
      },
      "application/mrb-publish+xml": {
        source: "iana",
        compressible: true
      },
      "application/msc-ivr+xml": {
        source: "iana",
        charset: "UTF-8",
        compressible: true
      },
      "application/msc-mixer+xml": {
        source: "iana",
        charset: "UTF-8",
        compressible: true
      },
      "application/msword": {
        source: "iana",
        compressible: false,
        extensions: ["doc", "dot"]
      },
      "application/mud+json": {
        source: "iana",
        compressible: true
      },
      "application/multipart-core": {
        source: "iana"
      },
      "application/mxf": {
        source: "iana",
        extensions: ["mxf"]
      },
      "application/n-quads": {
        source: "iana",
        extensions: ["nq"]
      },
      "application/n-triples": {
        source: "iana",
        extensions: ["nt"]
      },
      "application/nasdata": {
        source: "iana"
      },
      "application/news-checkgroups": {
        source: "iana",
        charset: "US-ASCII"
      },
      "application/news-groupinfo": {
        source: "iana",
        charset: "US-ASCII"
      },
      "application/news-transmission": {
        source: "iana"
      },
      "application/nlsml+xml": {
        source: "iana",
        compressible: true
      },
      "application/node": {
        source: "iana",
        extensions: ["cjs"]
      },
      "application/nss": {
        source: "iana"
      },
      "application/oauth-authz-req+jwt": {
        source: "iana"
      },
      "application/oblivious-dns-message": {
        source: "iana"
      },
      "application/ocsp-request": {
        source: "iana"
      },
      "application/ocsp-response": {
        source: "iana"
      },
      "application/octet-stream": {
        source: "iana",
        compressible: false,
        extensions: ["bin", "dms", "lrf", "mar", "so", "dist", "distz", "pkg", "bpk", "dump", "elc", "deploy", "exe", "dll", "deb", "dmg", "iso", "img", "msi", "msp", "msm", "buffer"]
      },
      "application/oda": {
        source: "iana",
        extensions: ["oda"]
      },
      "application/odm+xml": {
        source: "iana",
        compressible: true
      },
      "application/odx": {
        source: "iana"
      },
      "application/oebps-package+xml": {
        source: "iana",
        compressible: true,
        extensions: ["opf"]
      },
      "application/ogg": {
        source: "iana",
        compressible: false,
        extensions: ["ogx"]
      },
      "application/omdoc+xml": {
        source: "apache",
        compressible: true,
        extensions: ["omdoc"]
      },
      "application/onenote": {
        source: "apache",
        extensions: ["onetoc", "onetoc2", "onetmp", "onepkg"]
      },
      "application/opc-nodeset+xml": {
        source: "iana",
        compressible: true
      },
      "application/oscore": {
        source: "iana"
      },
      "application/oxps": {
        source: "iana",
        extensions: ["oxps"]
      },
      "application/p21": {
        source: "iana"
      },
      "application/p21+zip": {
        source: "iana",
        compressible: false
      },
      "application/p2p-overlay+xml": {
        source: "iana",
        compressible: true,
        extensions: ["relo"]
      },
      "application/parityfec": {
        source: "iana"
      },
      "application/passport": {
        source: "iana"
      },
      "application/patch-ops-error+xml": {
        source: "iana",
        compressible: true,
        extensions: ["xer"]
      },
      "application/pdf": {
        source: "iana",
        compressible: false,
        extensions: ["pdf"]
      },
      "application/pdx": {
        source: "iana"
      },
      "application/pem-certificate-chain": {
        source: "iana"
      },
      "application/pgp-encrypted": {
        source: "iana",
        compressible: false,
        extensions: ["pgp"]
      },
      "application/pgp-keys": {
        source: "iana",
        extensions: ["asc"]
      },
      "application/pgp-signature": {
        source: "iana",
        extensions: ["asc", "sig"]
      },
      "application/pics-rules": {
        source: "apache",
        extensions: ["prf"]
      },
      "application/pidf+xml": {
        source: "iana",
        charset: "UTF-8",
        compressible: true
      },
      "application/pidf-diff+xml": {
        source: "iana",
        charset: "UTF-8",
        compressible: true
      },
      "application/pkcs10": {
        source: "iana",
        extensions: ["p10"]
      },
      "application/pkcs12": {
        source: "iana"
      },
      "application/pkcs7-mime": {
        source: "iana",
        extensions: ["p7m", "p7c"]
      },
      "application/pkcs7-signature": {
        source: "iana",
        extensions: ["p7s"]
      },
      "application/pkcs8": {
        source: "iana",
        extensions: ["p8"]
      },
      "application/pkcs8-encrypted": {
        source: "iana"
      },
      "application/pkix-attr-cert": {
        source: "iana",
        extensions: ["ac"]
      },
      "application/pkix-cert": {
        source: "iana",
        extensions: ["cer"]
      },
      "application/pkix-crl": {
        source: "iana",
        extensions: ["crl"]
      },
      "application/pkix-pkipath": {
        source: "iana",
        extensions: ["pkipath"]
      },
      "application/pkixcmp": {
        source: "iana",
        extensions: ["pki"]
      },
      "application/pls+xml": {
        source: "iana",
        compressible: true,
        extensions: ["pls"]
      },
      "application/poc-settings+xml": {
        source: "iana",
        charset: "UTF-8",
        compressible: true
      },
      "application/postscript": {
        source: "iana",
        compressible: true,
        extensions: ["ai", "eps", "ps"]
      },
      "application/ppsp-tracker+json": {
        source: "iana",
        compressible: true
      },
      "application/problem+json": {
        source: "iana",
        compressible: true
      },
      "application/problem+xml": {
        source: "iana",
        compressible: true
      },
      "application/provenance+xml": {
        source: "iana",
        compressible: true,
        extensions: ["provx"]
      },
      "application/prs.alvestrand.titrax-sheet": {
        source: "iana"
      },
      "application/prs.cww": {
        source: "iana",
        extensions: ["cww"]
      },
      "application/prs.cyn": {
        source: "iana",
        charset: "7-BIT"
      },
      "application/prs.hpub+zip": {
        source: "iana",
        compressible: false
      },
      "application/prs.nprend": {
        source: "iana"
      },
      "application/prs.plucker": {
        source: "iana"
      },
      "application/prs.rdf-xml-crypt": {
        source: "iana"
      },
      "application/prs.xsf+xml": {
        source: "iana",
        compressible: true
      },
      "application/pskc+xml": {
        source: "iana",
        compressible: true,
        extensions: ["pskcxml"]
      },
      "application/pvd+json": {
        source: "iana",
        compressible: true
      },
      "application/qsig": {
        source: "iana"
      },
      "application/raml+yaml": {
        compressible: true,
        extensions: ["raml"]
      },
      "application/raptorfec": {
        source: "iana"
      },
      "application/rdap+json": {
        source: "iana",
        compressible: true
      },
      "application/rdf+xml": {
        source: "iana",
        compressible: true,
        extensions: ["rdf", "owl"]
      },
      "application/reginfo+xml": {
        source: "iana",
        compressible: true,
        extensions: ["rif"]
      },
      "application/relax-ng-compact-syntax": {
        source: "iana",
        extensions: ["rnc"]
      },
      "application/remote-printing": {
        source: "iana"
      },
      "application/reputon+json": {
        source: "iana",
        compressible: true
      },
      "application/resource-lists+xml": {
        source: "iana",
        compressible: true,
        extensions: ["rl"]
      },
      "application/resource-lists-diff+xml": {
        source: "iana",
        compressible: true,
        extensions: ["rld"]
      },
      "application/rfc+xml": {
        source: "iana",
        compressible: true
      },
      "application/riscos": {
        source: "iana"
      },
      "application/rlmi+xml": {
        source: "iana",
        compressible: true
      },
      "application/rls-services+xml": {
        source: "iana",
        compressible: true,
        extensions: ["rs"]
      },
      "application/route-apd+xml": {
        source: "iana",
        compressible: true,
        extensions: ["rapd"]
      },
      "application/route-s-tsid+xml": {
        source: "iana",
        compressible: true,
        extensions: ["sls"]
      },
      "application/route-usd+xml": {
        source: "iana",
        compressible: true,
        extensions: ["rusd"]
      },
      "application/rpki-ghostbusters": {
        source: "iana",
        extensions: ["gbr"]
      },
      "application/rpki-manifest": {
        source: "iana",
        extensions: ["mft"]
      },
      "application/rpki-publication": {
        source: "iana"
      },
      "application/rpki-roa": {
        source: "iana",
        extensions: ["roa"]
      },
      "application/rpki-updown": {
        source: "iana"
      },
      "application/rsd+xml": {
        source: "apache",
        compressible: true,
        extensions: ["rsd"]
      },
      "application/rss+xml": {
        source: "apache",
        compressible: true,
        extensions: ["rss"]
      },
      "application/rtf": {
        source: "iana",
        compressible: true,
        extensions: ["rtf"]
      },
      "application/rtploopback": {
        source: "iana"
      },
      "application/rtx": {
        source: "iana"
      },
      "application/samlassertion+xml": {
        source: "iana",
        compressible: true
      },
      "application/samlmetadata+xml": {
        source: "iana",
        compressible: true
      },
      "application/sarif+json": {
        source: "iana",
        compressible: true
      },
      "application/sarif-external-properties+json": {
        source: "iana",
        compressible: true
      },
      "application/sbe": {
        source: "iana"
      },
      "application/sbml+xml": {
        source: "iana",
        compressible: true,
        extensions: ["sbml"]
      },
      "application/scaip+xml": {
        source: "iana",
        compressible: true
      },
      "application/scim+json": {
        source: "iana",
        compressible: true
      },
      "application/scvp-cv-request": {
        source: "iana",
        extensions: ["scq"]
      },
      "application/scvp-cv-response": {
        source: "iana",
        extensions: ["scs"]
      },
      "application/scvp-vp-request": {
        source: "iana",
        extensions: ["spq"]
      },
      "application/scvp-vp-response": {
        source: "iana",
        extensions: ["spp"]
      },
      "application/sdp": {
        source: "iana",
        extensions: ["sdp"]
      },
      "application/secevent+jwt": {
        source: "iana"
      },
      "application/senml+cbor": {
        source: "iana"
      },
      "application/senml+json": {
        source: "iana",
        compressible: true
      },
      "application/senml+xml": {
        source: "iana",
        compressible: true,
        extensions: ["senmlx"]
      },
      "application/senml-etch+cbor": {
        source: "iana"
      },
      "application/senml-etch+json": {
        source: "iana",
        compressible: true
      },
      "application/senml-exi": {
        source: "iana"
      },
      "application/sensml+cbor": {
        source: "iana"
      },
      "application/sensml+json": {
        source: "iana",
        compressible: true
      },
      "application/sensml+xml": {
        source: "iana",
        compressible: true,
        extensions: ["sensmlx"]
      },
      "application/sensml-exi": {
        source: "iana"
      },
      "application/sep+xml": {
        source: "iana",
        compressible: true
      },
      "application/sep-exi": {
        source: "iana"
      },
      "application/session-info": {
        source: "iana"
      },
      "application/set-payment": {
        source: "iana"
      },
      "application/set-payment-initiation": {
        source: "iana",
        extensions: ["setpay"]
      },
      "application/set-registration": {
        source: "iana"
      },
      "application/set-registration-initiation": {
        source: "iana",
        extensions: ["setreg"]
      },
      "application/sgml": {
        source: "iana"
      },
      "application/sgml-open-catalog": {
        source: "iana"
      },
      "application/shf+xml": {
        source: "iana",
        compressible: true,
        extensions: ["shf"]
      },
      "application/sieve": {
        source: "iana",
        extensions: ["siv", "sieve"]
      },
      "application/simple-filter+xml": {
        source: "iana",
        compressible: true
      },
      "application/simple-message-summary": {
        source: "iana"
      },
      "application/simplesymbolcontainer": {
        source: "iana"
      },
      "application/sipc": {
        source: "iana"
      },
      "application/slate": {
        source: "iana"
      },
      "application/smil": {
        source: "iana"
      },
      "application/smil+xml": {
        source: "iana",
        compressible: true,
        extensions: ["smi", "smil"]
      },
      "application/smpte336m": {
        source: "iana"
      },
      "application/soap+fastinfoset": {
        source: "iana"
      },
      "application/soap+xml": {
        source: "iana",
        compressible: true
      },
      "application/sparql-query": {
        source: "iana",
        extensions: ["rq"]
      },
      "application/sparql-results+xml": {
        source: "iana",
        compressible: true,
        extensions: ["srx"]
      },
      "application/spdx+json": {
        source: "iana",
        compressible: true
      },
      "application/spirits-event+xml": {
        source: "iana",
        compressible: true
      },
      "application/sql": {
        source: "iana"
      },
      "application/srgs": {
        source: "iana",
        extensions: ["gram"]
      },
      "application/srgs+xml": {
        source: "iana",
        compressible: true,
        extensions: ["grxml"]
      },
      "application/sru+xml": {
        source: "iana",
        compressible: true,
        extensions: ["sru"]
      },
      "application/ssdl+xml": {
        source: "apache",
        compressible: true,
        extensions: ["ssdl"]
      },
      "application/ssml+xml": {
        source: "iana",
        compressible: true,
        extensions: ["ssml"]
      },
      "application/stix+json": {
        source: "iana",
        compressible: true
      },
      "application/swid+xml": {
        source: "iana",
        compressible: true,
        extensions: ["swidtag"]
      },
      "application/tamp-apex-update": {
        source: "iana"
      },
      "application/tamp-apex-update-confirm": {
        source: "iana"
      },
      "application/tamp-community-update": {
        source: "iana"
      },
      "application/tamp-community-update-confirm": {
        source: "iana"
      },
      "application/tamp-error": {
        source: "iana"
      },
      "application/tamp-sequence-adjust": {
        source: "iana"
      },
      "application/tamp-sequence-adjust-confirm": {
        source: "iana"
      },
      "application/tamp-status-query": {
        source: "iana"
      },
      "application/tamp-status-response": {
        source: "iana"
      },
      "application/tamp-update": {
        source: "iana"
      },
      "application/tamp-update-confirm": {
        source: "iana"
      },
      "application/tar": {
        compressible: true
      },
      "application/taxii+json": {
        source: "iana",
        compressible: true
      },
      "application/td+json": {
        source: "iana",
        compressible: true
      },
      "application/tei+xml": {
        source: "iana",
        compressible: true,
        extensions: ["tei", "teicorpus"]
      },
      "application/tetra_isi": {
        source: "iana"
      },
      "application/thraud+xml": {
        source: "iana",
        compressible: true,
        extensions: ["tfi"]
      },
      "application/timestamp-query": {
        source: "iana"
      },
      "application/timestamp-reply": {
        source: "iana"
      },
      "application/timestamped-data": {
        source: "iana",
        extensions: ["tsd"]
      },
      "application/tlsrpt+gzip": {
        source: "iana"
      },
      "application/tlsrpt+json": {
        source: "iana",
        compressible: true
      },
      "application/tnauthlist": {
        source: "iana"
      },
      "application/token-introspection+jwt": {
        source: "iana"
      },
      "application/toml": {
        compressible: true,
        extensions: ["toml"]
      },
      "application/trickle-ice-sdpfrag": {
        source: "iana"
      },
      "application/trig": {
        source: "iana",
        extensions: ["trig"]
      },
      "application/ttml+xml": {
        source: "iana",
        compressible: true,
        extensions: ["ttml"]
      },
      "application/tve-trigger": {
        source: "iana"
      },
      "application/tzif": {
        source: "iana"
      },
      "application/tzif-leap": {
        source: "iana"
      },
      "application/ubjson": {
        compressible: false,
        extensions: ["ubj"]
      },
      "application/ulpfec": {
        source: "iana"
      },
      "application/urc-grpsheet+xml": {
        source: "iana",
        compressible: true
      },
      "application/urc-ressheet+xml": {
        source: "iana",
        compressible: true,
        extensions: ["rsheet"]
      },
      "application/urc-targetdesc+xml": {
        source: "iana",
        compressible: true,
        extensions: ["td"]
      },
      "application/urc-uisocketdesc+xml": {
        source: "iana",
        compressible: true
      },
      "application/vcard+json": {
        source: "iana",
        compressible: true
      },
      "application/vcard+xml": {
        source: "iana",
        compressible: true
      },
      "application/vemmi": {
        source: "iana"
      },
      "application/vividence.scriptfile": {
        source: "apache"
      },
      "application/vnd.1000minds.decision-model+xml": {
        source: "iana",
        compressible: true,
        extensions: ["1km"]
      },
      "application/vnd.3gpp-prose+xml": {
        source: "iana",
        compressible: true
      },
      "application/vnd.3gpp-prose-pc3ch+xml": {
        source: "iana",
        compressible: true
      },
      "application/vnd.3gpp-v2x-local-service-information": {
        source: "iana"
      },
      "application/vnd.3gpp.5gnas": {
        source: "iana"
      },
      "application/vnd.3gpp.access-transfer-events+xml": {
        source: "iana",
        compressible: true
      },
      "application/vnd.3gpp.bsf+xml": {
        source: "iana",
        compressible: true
      },
      "application/vnd.3gpp.gmop+xml": {
        source: "iana",
        compressible: true
      },
      "application/vnd.3gpp.gtpc": {
        source: "iana"
      },
      "application/vnd.3gpp.interworking-data": {
        source: "iana"
      },
      "application/vnd.3gpp.lpp": {
        source: "iana"
      },
      "application/vnd.3gpp.mc-signalling-ear": {
        source: "iana"
      },
      "application/vnd.3gpp.mcdata-affiliation-command+xml": {
        source: "iana",
        compressible: true
      },
      "application/vnd.3gpp.mcdata-info+xml": {
        source: "iana",
        compressible: true
      },
      "application/vnd.3gpp.mcdata-payload": {
        source: "iana"
      },
      "application/vnd.3gpp.mcdata-service-config+xml": {
        source: "iana",
        compressible: true
      },
      "application/vnd.3gpp.mcdata-signalling": {
        source: "iana"
      },
      "application/vnd.3gpp.mcdata-ue-config+xml": {
        source: "iana",
        compressible: true
      },
      "application/vnd.3gpp.mcdata-user-profile+xml": {
        source: "iana",
        compressible: true
      },
      "application/vnd.3gpp.mcptt-affiliation-command+xml": {
        source: "iana",
        compressible: true
      },
      "application/vnd.3gpp.mcptt-floor-request+xml": {
        source: "iana",
        compressible: true
      },
      "application/vnd.3gpp.mcptt-info+xml": {
        source: "iana",
        compressible: true
      },
      "application/vnd.3gpp.mcptt-location-info+xml": {
        source: "iana",
        compressible: true
      },
      "application/vnd.3gpp.mcptt-mbms-usage-info+xml": {
        source: "iana",
        compressible: true
      },
      "application/vnd.3gpp.mcptt-service-config+xml": {
        source: "iana",
        compressible: true
      },
      "application/vnd.3gpp.mcptt-signed+xml": {
        source: "iana",
        compressible: true
      },
      "application/vnd.3gpp.mcptt-ue-config+xml": {
        source: "iana",
        compressible: true
      },
      "application/vnd.3gpp.mcptt-ue-init-config+xml": {
        source: "iana",
        compressible: true
      },
      "application/vnd.3gpp.mcptt-user-profile+xml": {
        source: "iana",
        compressible: true
      },
      "application/vnd.3gpp.mcvideo-affiliation-command+xml": {
        source: "iana",
        compressible: true
      },
      "application/vnd.3gpp.mcvideo-affiliation-info+xml": {
        source: "iana",
        compressible: true
      },
      "application/vnd.3gpp.mcvideo-info+xml": {
        source: "iana",
        compressible: true
      },
      "application/vnd.3gpp.mcvideo-location-info+xml": {
        source: "iana",
        compressible: true
      },
      "application/vnd.3gpp.mcvideo-mbms-usage-info+xml": {
        source: "iana",
        compressible: true
      },
      "application/vnd.3gpp.mcvideo-service-config+xml": {
        source: "iana",
        compressible: true
      },
      "application/vnd.3gpp.mcvideo-transmission-request+xml": {
        source: "iana",
        compressible: true
      },
      "application/vnd.3gpp.mcvideo-ue-config+xml": {
        source: "iana",
        compressible: true
      },
      "application/vnd.3gpp.mcvideo-user-profile+xml": {
        source: "iana",
        compressible: true
      },
      "application/vnd.3gpp.mid-call+xml": {
        source: "iana",
        compressible: true
      },
      "application/vnd.3gpp.ngap": {
        source: "iana"
      },
      "application/vnd.3gpp.pfcp": {
        source: "iana"
      },
      "application/vnd.3gpp.pic-bw-large": {
        source: "iana",
        extensions: ["plb"]
      },
      "application/vnd.3gpp.pic-bw-small": {
        source: "iana",
        extensions: ["psb"]
      },
      "application/vnd.3gpp.pic-bw-var": {
        source: "iana",
        extensions: ["pvb"]
      },
      "application/vnd.3gpp.s1ap": {
        source: "iana"
      },
      "application/vnd.3gpp.sms": {
        source: "iana"
      },
      "application/vnd.3gpp.sms+xml": {
        source: "iana",
        compressible: true
      },
      "application/vnd.3gpp.srvcc-ext+xml": {
        source: "iana",
        compressible: true
      },
      "application/vnd.3gpp.srvcc-info+xml": {
        source: "iana",
        compressible: true
      },
      "application/vnd.3gpp.state-and-event-info+xml": {
        source: "iana",
        compressible: true
      },
      "application/vnd.3gpp.ussd+xml": {
        source: "iana",
        compressible: true
      },
      "application/vnd.3gpp2.bcmcsinfo+xml": {
        source: "iana",
        compressible: true
      },
      "application/vnd.3gpp2.sms": {
        source: "iana"
      },
      "application/vnd.3gpp2.tcap": {
        source: "iana",
        extensions: ["tcap"]
      },
      "application/vnd.3lightssoftware.imagescal": {
        source: "iana"
      },
      "application/vnd.3m.post-it-notes": {
        source: "iana",
        extensions: ["pwn"]
      },
      "application/vnd.accpac.simply.aso": {
        source: "iana",
        extensions: ["aso"]
      },
      "application/vnd.accpac.simply.imp": {
        source: "iana",
        extensions: ["imp"]
      },
      "application/vnd.acucobol": {
        source: "iana",
        extensions: ["acu"]
      },
      "application/vnd.acucorp": {
        source: "iana",
        extensions: ["atc", "acutc"]
      },
      "application/vnd.adobe.air-application-installer-package+zip": {
        source: "apache",
        compressible: false,
        extensions: ["air"]
      },
      "application/vnd.adobe.flash.movie": {
        source: "iana"
      },
      "application/vnd.adobe.formscentral.fcdt": {
        source: "iana",
        extensions: ["fcdt"]
      },
      "application/vnd.adobe.fxp": {
        source: "iana",
        extensions: ["fxp", "fxpl"]
      },
      "application/vnd.adobe.partial-upload": {
        source: "iana"
      },
      "application/vnd.adobe.xdp+xml": {
        source: "iana",
        compressible: true,
        extensions: ["xdp"]
      },
      "application/vnd.adobe.xfdf": {
        source: "iana",
        extensions: ["xfdf"]
      },
      "application/vnd.aether.imp": {
        source: "iana"
      },
      "application/vnd.afpc.afplinedata": {
        source: "iana"
      },
      "application/vnd.afpc.afplinedata-pagedef": {
        source: "iana"
      },
      "application/vnd.afpc.cmoca-cmresource": {
        source: "iana"
      },
      "application/vnd.afpc.foca-charset": {
        source: "iana"
      },
      "application/vnd.afpc.foca-codedfont": {
        source: "iana"
      },
      "application/vnd.afpc.foca-codepage": {
        source: "iana"
      },
      "application/vnd.afpc.modca": {
        source: "iana"
      },
      "application/vnd.afpc.modca-cmtable": {
        source: "iana"
      },
      "application/vnd.afpc.modca-formdef": {
        source: "iana"
      },
      "application/vnd.afpc.modca-mediummap": {
        source: "iana"
      },
      "application/vnd.afpc.modca-objectcontainer": {
        source: "iana"
      },
      "application/vnd.afpc.modca-overlay": {
        source: "iana"
      },
      "application/vnd.afpc.modca-pagesegment": {
        source: "iana"
      },
      "application/vnd.age": {
        source: "iana",
        extensions: ["age"]
      },
      "application/vnd.ah-barcode": {
        source: "iana"
      },
      "application/vnd.ahead.space": {
        source: "iana",
        extensions: ["ahead"]
      },
      "application/vnd.airzip.filesecure.azf": {
        source: "iana",
        extensions: ["azf"]
      },
      "application/vnd.airzip.filesecure.azs": {
        source: "iana",
        extensions: ["azs"]
      },
      "application/vnd.amadeus+json": {
        source: "iana",
        compressible: true
      },
      "application/vnd.amazon.ebook": {
        source: "apache",
        extensions: ["azw"]
      },
      "application/vnd.amazon.mobi8-ebook": {
        source: "iana"
      },
      "application/vnd.americandynamics.acc": {
        source: "iana",
        extensions: ["acc"]
      },
      "application/vnd.amiga.ami": {
        source: "iana",
        extensions: ["ami"]
      },
      "application/vnd.amundsen.maze+xml": {
        source: "iana",
        compressible: true
      },
      "application/vnd.android.ota": {
        source: "iana"
      },
      "application/vnd.android.package-archive": {
        source: "apache",
        compressible: false,
        extensions: ["apk"]
      },
      "application/vnd.anki": {
        source: "iana"
      },
      "application/vnd.anser-web-certificate-issue-initiation": {
        source: "iana",
        extensions: ["cii"]
      },
      "application/vnd.anser-web-funds-transfer-initiation": {
        source: "apache",
        extensions: ["fti"]
      },
      "application/vnd.antix.game-component": {
        source: "iana",
        extensions: ["atx"]
      },
      "application/vnd.apache.arrow.file": {
        source: "iana"
      },
      "application/vnd.apache.arrow.stream": {
        source: "iana"
      },
      "application/vnd.apache.thrift.binary": {
        source: "iana"
      },
      "application/vnd.apache.thrift.compact": {
        source: "iana"
      },
      "application/vnd.apache.thrift.json": {
        source: "iana"
      },
      "application/vnd.api+json": {
        source: "iana",
        compressible: true
      },
      "application/vnd.aplextor.warrp+json": {
        source: "iana",
        compressible: true
      },
      "application/vnd.apothekende.reservation+json": {
        source: "iana",
        compressible: true
      },
      "application/vnd.apple.installer+xml": {
        source: "iana",
        compressible: true,
        extensions: ["mpkg"]
      },
      "application/vnd.apple.keynote": {
        source: "iana",
        extensions: ["key"]
      },
      "application/vnd.apple.mpegurl": {
        source: "iana",
        extensions: ["m3u8"]
      },
      "application/vnd.apple.numbers": {
        source: "iana",
        extensions: ["numbers"]
      },
      "application/vnd.apple.pages": {
        source: "iana",
        extensions: ["pages"]
      },
      "application/vnd.apple.pkpass": {
        compressible: false,
        extensions: ["pkpass"]
      },
      "application/vnd.arastra.swi": {
        source: "iana"
      },
      "application/vnd.aristanetworks.swi": {
        source: "iana",
        extensions: ["swi"]
      },
      "application/vnd.artisan+json": {
        source: "iana",
        compressible: true
      },
      "application/vnd.artsquare": {
        source: "iana"
      },
      "application/vnd.astraea-software.iota": {
        source: "iana",
        extensions: ["iota"]
      },
      "application/vnd.audiograph": {
        source: "iana",
        extensions: ["aep"]
      },
      "application/vnd.autopackage": {
        source: "iana"
      },
      "application/vnd.avalon+json": {
        source: "iana",
        compressible: true
      },
      "application/vnd.avistar+xml": {
        source: "iana",
        compressible: true
      },
      "application/vnd.balsamiq.bmml+xml": {
        source: "iana",
        compressible: true,
        extensions: ["bmml"]
      },
      "application/vnd.balsamiq.bmpr": {
        source: "iana"
      },
      "application/vnd.banana-accounting": {
        source: "iana"
      },
      "application/vnd.bbf.usp.error": {
        source: "iana"
      },
      "application/vnd.bbf.usp.msg": {
        source: "iana"
      },
      "application/vnd.bbf.usp.msg+json": {
        source: "iana",
        compressible: true
      },
      "application/vnd.bekitzur-stech+json": {
        source: "iana",
        compressible: true
      },
      "application/vnd.bint.med-content": {
        source: "iana"
      },
      "application/vnd.biopax.rdf+xml": {
        source: "iana",
        compressible: true
      },
      "application/vnd.blink-idb-value-wrapper": {
        source: "iana"
      },
      "application/vnd.blueice.multipass": {
        source: "iana",
        extensions: ["mpm"]
      },
      "application/vnd.bluetooth.ep.oob": {
        source: "iana"
      },
      "application/vnd.bluetooth.le.oob": {
        source: "iana"
      },
      "application/vnd.bmi": {
        source: "iana",
        extensions: ["bmi"]
      },
      "application/vnd.bpf": {
        source: "iana"
      },
      "application/vnd.bpf3": {
        source: "iana"
      },
      "application/vnd.businessobjects": {
        source: "iana",
        extensions: ["rep"]
      },
      "application/vnd.byu.uapi+json": {
        source: "iana",
        compressible: true
      },
      "application/vnd.cab-jscript": {
        source: "iana"
      },
      "application/vnd.canon-cpdl": {
        source: "iana"
      },
      "application/vnd.canon-lips": {
        source: "iana"
      },
      "application/vnd.capasystems-pg+json": {
        source: "iana",
        compressible: true
      },
      "application/vnd.cendio.thinlinc.clientconf": {
        source: "iana"
      },
      "application/vnd.century-systems.tcp_stream": {
        source: "iana"
      },
      "application/vnd.chemdraw+xml": {
        source: "iana",
        compressible: true,
        extensions: ["cdxml"]
      },
      "application/vnd.chess-pgn": {
        source: "iana"
      },
      "application/vnd.chipnuts.karaoke-mmd": {
        source: "iana",
        extensions: ["mmd"]
      },
      "application/vnd.ciedi": {
        source: "iana"
      },
      "application/vnd.cinderella": {
        source: "iana",
        extensions: ["cdy"]
      },
      "application/vnd.cirpack.isdn-ext": {
        source: "iana"
      },
      "application/vnd.citationstyles.style+xml": {
        source: "iana",
        compressible: true,
        extensions: ["csl"]
      },
      "application/vnd.claymore": {
        source: "iana",
        extensions: ["cla"]
      },
      "application/vnd.cloanto.rp9": {
        source: "iana",
        extensions: ["rp9"]
      },
      "application/vnd.clonk.c4group": {
        source: "iana",
        extensions: ["c4g", "c4d", "c4f", "c4p", "c4u"]
      },
      "application/vnd.cluetrust.cartomobile-config": {
        source: "iana",
        extensions: ["c11amc"]
      },
      "application/vnd.cluetrust.cartomobile-config-pkg": {
        source: "iana",
        extensions: ["c11amz"]
      },
      "application/vnd.coffeescript": {
        source: "iana"
      },
      "application/vnd.collabio.xodocuments.document": {
        source: "iana"
      },
      "application/vnd.collabio.xodocuments.document-template": {
        source: "iana"
      },
      "application/vnd.collabio.xodocuments.presentation": {
        source: "iana"
      },
      "application/vnd.collabio.xodocuments.presentation-template": {
        source: "iana"
      },
      "application/vnd.collabio.xodocuments.spreadsheet": {
        source: "iana"
      },
      "application/vnd.collabio.xodocuments.spreadsheet-template": {
        source: "iana"
      },
      "application/vnd.collection+json": {
        source: "iana",
        compressible: true
      },
      "application/vnd.collection.doc+json": {
        source: "iana",
        compressible: true
      },
      "application/vnd.collection.next+json": {
        source: "iana",
        compressible: true
      },
      "application/vnd.comicbook+zip": {
        source: "iana",
        compressible: false
      },
      "application/vnd.comicbook-rar": {
        source: "iana"
      },
      "application/vnd.commerce-battelle": {
        source: "iana"
      },
      "application/vnd.commonspace": {
        source: "iana",
        extensions: ["csp"]
      },
      "application/vnd.contact.cmsg": {
        source: "iana",
        extensions: ["cdbcmsg"]
      },
      "application/vnd.coreos.ignition+json": {
        source: "iana",
        compressible: true
      },
      "application/vnd.cosmocaller": {
        source: "iana",
        extensions: ["cmc"]
      },
      "application/vnd.crick.clicker": {
        source: "iana",
        extensions: ["clkx"]
      },
      "application/vnd.crick.clicker.keyboard": {
        source: "iana",
        extensions: ["clkk"]
      },
      "application/vnd.crick.clicker.palette": {
        source: "iana",
        extensions: ["clkp"]
      },
      "application/vnd.crick.clicker.template": {
        source: "iana",
        extensions: ["clkt"]
      },
      "application/vnd.crick.clicker.wordbank": {
        source: "iana",
        extensions: ["clkw"]
      },
      "application/vnd.criticaltools.wbs+xml": {
        source: "iana",
        compressible: true,
        extensions: ["wbs"]
      },
      "application/vnd.cryptii.pipe+json": {
        source: "iana",
        compressible: true
      },
      "application/vnd.crypto-shade-file": {
        source: "iana"
      },
      "application/vnd.cryptomator.encrypted": {
        source: "iana"
      },
      "application/vnd.cryptomator.vault": {
        source: "iana"
      },
      "application/vnd.ctc-posml": {
        source: "iana",
        extensions: ["pml"]
      },
      "application/vnd.ctct.ws+xml": {
        source: "iana",
        compressible: true
      },
      "application/vnd.cups-pdf": {
        source: "iana"
      },
      "application/vnd.cups-postscript": {
        source: "iana"
      },
      "application/vnd.cups-ppd": {
        source: "iana",
        extensions: ["ppd"]
      },
      "application/vnd.cups-raster": {
        source: "iana"
      },
      "application/vnd.cups-raw": {
        source: "iana"
      },
      "application/vnd.curl": {
        source: "iana"
      },
      "application/vnd.curl.car": {
        source: "apache",
        extensions: ["car"]
      },
      "application/vnd.curl.pcurl": {
        source: "apache",
        extensions: ["pcurl"]
      },
      "application/vnd.cyan.dean.root+xml": {
        source: "iana",
        compressible: true
      },
      "application/vnd.cybank": {
        source: "iana"
      },
      "application/vnd.cyclonedx+json": {
        source: "iana",
        compressible: true
      },
      "application/vnd.cyclonedx+xml": {
        source: "iana",
        compressible: true
      },
      "application/vnd.d2l.coursepackage1p0+zip": {
        source: "iana",
        compressible: false
      },
      "application/vnd.d3m-dataset": {
        source: "iana"
      },
      "application/vnd.d3m-problem": {
        source: "iana"
      },
      "application/vnd.dart": {
        source: "iana",
        compressible: true,
        extensions: ["dart"]
      },
      "application/vnd.data-vision.rdz": {
        source: "iana",
        extensions: ["rdz"]
      },
      "application/vnd.datapackage+json": {
        source: "iana",
        compressible: true
      },
      "application/vnd.dataresource+json": {
        source: "iana",
        compressible: true
      },
      "application/vnd.dbf": {
        source: "iana",
        extensions: ["dbf"]
      },
      "application/vnd.debian.binary-package": {
        source: "iana"
      },
      "application/vnd.dece.data": {
        source: "iana",
        extensions: ["uvf", "uvvf", "uvd", "uvvd"]
      },
      "application/vnd.dece.ttml+xml": {
        source: "iana",
        compressible: true,
        extensions: ["uvt", "uvvt"]
      },
      "application/vnd.dece.unspecified": {
        source: "iana",
        extensions: ["uvx", "uvvx"]
      },
      "application/vnd.dece.zip": {
        source: "iana",
        extensions: ["uvz", "uvvz"]
      },
      "application/vnd.denovo.fcselayout-link": {
        source: "iana",
        extensions: ["fe_launch"]
      },
      "application/vnd.desmume.movie": {
        source: "iana"
      },
      "application/vnd.dir-bi.plate-dl-nosuffix": {
        source: "iana"
      },
      "application/vnd.dm.delegation+xml": {
        source: "iana",
        compressible: true
      },
      "application/vnd.dna": {
        source: "iana",
        extensions: ["dna"]
      },
      "application/vnd.document+json": {
        source: "iana",
        compressible: true
      },
      "application/vnd.dolby.mlp": {
        source: "apache",
        extensions: ["mlp"]
      },
      "application/vnd.dolby.mobile.1": {
        source: "iana"
      },
      "application/vnd.dolby.mobile.2": {
        source: "iana"
      },
      "application/vnd.doremir.scorecloud-binary-document": {
        source: "iana"
      },
      "application/vnd.dpgraph": {
        source: "iana",
        extensions: ["dpg"]
      },
      "application/vnd.dreamfactory": {
        source: "iana",
        extensions: ["dfac"]
      },
      "application/vnd.drive+json": {
        source: "iana",
        compressible: true
      },
      "application/vnd.ds-keypoint": {
        source: "apache",
        extensions: ["kpxx"]
      },
      "application/vnd.dtg.local": {
        source: "iana"
      },
      "application/vnd.dtg.local.flash": {
        source: "iana"
      },
      "application/vnd.dtg.local.html": {
        source: "iana"
      },
      "application/vnd.dvb.ait": {
        source: "iana",
        extensions: ["ait"]
      },
      "application/vnd.dvb.dvbisl+xml": {
        source: "iana",
        compressible: true
      },
      "application/vnd.dvb.dvbj": {
        source: "iana"
      },
      "application/vnd.dvb.esgcontainer": {
        source: "iana"
      },
      "application/vnd.dvb.ipdcdftnotifaccess": {
        source: "iana"
      },
      "application/vnd.dvb.ipdcesgaccess": {
        source: "iana"
      },
      "application/vnd.dvb.ipdcesgaccess2": {
        source: "iana"
      },
      "application/vnd.dvb.ipdcesgpdd": {
        source: "iana"
      },
      "application/vnd.dvb.ipdcroaming": {
        source: "iana"
      },
      "application/vnd.dvb.iptv.alfec-base": {
        source: "iana"
      },
      "application/vnd.dvb.iptv.alfec-enhancement": {
        source: "iana"
      },
      "application/vnd.dvb.notif-aggregate-root+xml": {
        source: "iana",
        compressible: true
      },
      "application/vnd.dvb.notif-container+xml": {
        source: "iana",
        compressible: true
      },
      "application/vnd.dvb.notif-generic+xml": {
        source: "iana",
        compressible: true
      },
      "application/vnd.dvb.notif-ia-msglist+xml": {
        source: "iana",
        compressible: true
      },
      "application/vnd.dvb.notif-ia-registration-request+xml": {
        source: "iana",
        compressible: true
      },
      "application/vnd.dvb.notif-ia-registration-response+xml": {
        source: "iana",
        compressible: true
      },
      "application/vnd.dvb.notif-init+xml": {
        source: "iana",
        compressible: true
      },
      "application/vnd.dvb.pfr": {
        source: "iana"
      },
      "application/vnd.dvb.service": {
        source: "iana",
        extensions: ["svc"]
      },
      "application/vnd.dxr": {
        source: "iana"
      },
      "application/vnd.dynageo": {
        source: "iana",
        extensions: ["geo"]
      },
      "application/vnd.dzr": {
        source: "iana"
      },
      "application/vnd.easykaraoke.cdgdownload": {
        source: "iana"
      },
      "application/vnd.ecdis-update": {
        source: "iana"
      },
      "application/vnd.ecip.rlp": {
        source: "iana"
      },
      "application/vnd.eclipse.ditto+json": {
        source: "iana",
        compressible: true
      },
      "application/vnd.ecowin.chart": {
        source: "iana",
        extensions: ["mag"]
      },
      "application/vnd.ecowin.filerequest": {
        source: "iana"
      },
      "application/vnd.ecowin.fileupdate": {
        source: "iana"
      },
      "application/vnd.ecowin.series": {
        source: "iana"
      },
      "application/vnd.ecowin.seriesrequest": {
        source: "iana"
      },
      "application/vnd.ecowin.seriesupdate": {
        source: "iana"
      },
      "application/vnd.efi.img": {
        source: "iana"
      },
      "application/vnd.efi.iso": {
        source: "iana"
      },
      "application/vnd.emclient.accessrequest+xml": {
        source: "iana",
        compressible: true
      },
      "application/vnd.enliven": {
        source: "iana",
        extensions: ["nml"]
      },
      "application/vnd.enphase.envoy": {
        source: "iana"
      },
      "application/vnd.eprints.data+xml": {
        source: "iana",
        compressible: true
      },
      "application/vnd.epson.esf": {
        source: "iana",
        extensions: ["esf"]
      },
      "application/vnd.epson.msf": {
        source: "iana",
        extensions: ["msf"]
      },
      "application/vnd.epson.quickanime": {
        source: "iana",
        extensions: ["qam"]
      },
      "application/vnd.epson.salt": {
        source: "iana",
        extensions: ["slt"]
      },
      "application/vnd.epson.ssf": {
        source: "iana",
        extensions: ["ssf"]
      },
      "application/vnd.ericsson.quickcall": {
        source: "iana"
      },
      "application/vnd.espass-espass+zip": {
        source: "iana",
        compressible: false
      },
      "application/vnd.eszigno3+xml": {
        source: "iana",
        compressible: true,
        extensions: ["es3", "et3"]
      },
      "application/vnd.etsi.aoc+xml": {
        source: "iana",
        compressible: true
      },
      "application/vnd.etsi.asic-e+zip": {
        source: "iana",
        compressible: false
      },
      "application/vnd.etsi.asic-s+zip": {
        source: "iana",
        compressible: false
      },
      "application/vnd.etsi.cug+xml": {
        source: "iana",
        compressible: true
      },
      "application/vnd.etsi.iptvcommand+xml": {
        source: "iana",
        compressible: true
      },
      "application/vnd.etsi.iptvdiscovery+xml": {
        source: "iana",
        compressible: true
      },
      "application/vnd.etsi.iptvprofile+xml": {
        source: "iana",
        compressible: true
      },
      "application/vnd.etsi.iptvsad-bc+xml": {
        source: "iana",
        compressible: true
      },
      "application/vnd.etsi.iptvsad-cod+xml": {
        source: "iana",
        compressible: true
      },
      "application/vnd.etsi.iptvsad-npvr+xml": {
        source: "iana",
        compressible: true
      },
      "application/vnd.etsi.iptvservice+xml": {
        source: "iana",
        compressible: true
      },
      "application/vnd.etsi.iptvsync+xml": {
        source: "iana",
        compressible: true
      },
      "application/vnd.etsi.iptvueprofile+xml": {
        source: "iana",
        compressible: true
      },
      "application/vnd.etsi.mcid+xml": {
        source: "iana",
        compressible: true
      },
      "application/vnd.etsi.mheg5": {
        source: "iana"
      },
      "application/vnd.etsi.overload-control-policy-dataset+xml": {
        source: "iana",
        compressible: true
      },
      "application/vnd.etsi.pstn+xml": {
        source: "iana",
        compressible: true
      },
      "application/vnd.etsi.sci+xml": {
        source: "iana",
        compressible: true
      },
      "application/vnd.etsi.simservs+xml": {
        source: "iana",
        compressible: true
      },
      "application/vnd.etsi.timestamp-token": {
        source: "iana"
      },
      "application/vnd.etsi.tsl+xml": {
        source: "iana",
        compressible: true
      },
      "application/vnd.etsi.tsl.der": {
        source: "iana"
      },
      "application/vnd.eu.kasparian.car+json": {
        source: "iana",
        compressible: true
      },
      "application/vnd.eudora.data": {
        source: "iana"
      },
      "application/vnd.evolv.ecig.profile": {
        source: "iana"
      },
      "application/vnd.evolv.ecig.settings": {
        source: "iana"
      },
      "application/vnd.evolv.ecig.theme": {
        source: "iana"
      },
      "application/vnd.exstream-empower+zip": {
        source: "iana",
        compressible: false
      },
      "application/vnd.exstream-package": {
        source: "iana"
      },
      "application/vnd.ezpix-album": {
        source: "iana",
        extensions: ["ez2"]
      },
      "application/vnd.ezpix-package": {
        source: "iana",
        extensions: ["ez3"]
      },
      "application/vnd.f-secure.mobile": {
        source: "iana"
      },
      "application/vnd.familysearch.gedcom+zip": {
        source: "iana",
        compressible: false
      },
      "application/vnd.fastcopy-disk-image": {
        source: "iana"
      },
      "application/vnd.fdf": {
        source: "iana",
        extensions: ["fdf"]
      },
      "application/vnd.fdsn.mseed": {
        source: "iana",
        extensions: ["mseed"]
      },
      "application/vnd.fdsn.seed": {
        source: "iana",
        extensions: ["seed", "dataless"]
      },
      "application/vnd.ffsns": {
        source: "iana"
      },
      "application/vnd.ficlab.flb+zip": {
        source: "iana",
        compressible: false
      },
      "application/vnd.filmit.zfc": {
        source: "iana"
      },
      "application/vnd.fints": {
        source: "iana"
      },
      "application/vnd.firemonkeys.cloudcell": {
        source: "iana"
      },
      "application/vnd.flographit": {
        source: "iana",
        extensions: ["gph"]
      },
      "application/vnd.fluxtime.clip": {
        source: "iana",
        extensions: ["ftc"]
      },
      "application/vnd.font-fontforge-sfd": {
        source: "iana"
      },
      "application/vnd.framemaker": {
        source: "iana",
        extensions: ["fm", "frame", "maker", "book"]
      },
      "application/vnd.frogans.fnc": {
        source: "iana",
        extensions: ["fnc"]
      },
      "application/vnd.frogans.ltf": {
        source: "iana",
        extensions: ["ltf"]
      },
      "application/vnd.fsc.weblaunch": {
        source: "iana",
        extensions: ["fsc"]
      },
      "application/vnd.fujifilm.fb.docuworks": {
        source: "iana"
      },
      "application/vnd.fujifilm.fb.docuworks.binder": {
        source: "iana"
      },
      "application/vnd.fujifilm.fb.docuworks.container": {
        source: "iana"
      },
      "application/vnd.fujifilm.fb.jfi+xml": {
        source: "iana",
        compressible: true
      },
      "application/vnd.fujitsu.oasys": {
        source: "iana",
        extensions: ["oas"]
      },
      "application/vnd.fujitsu.oasys2": {
        source: "iana",
        extensions: ["oa2"]
      },
      "application/vnd.fujitsu.oasys3": {
        source: "iana",
        extensions: ["oa3"]
      },
      "application/vnd.fujitsu.oasysgp": {
        source: "iana",
        extensions: ["fg5"]
      },
      "application/vnd.fujitsu.oasysprs": {
        source: "iana",
        extensions: ["bh2"]
      },
      "application/vnd.fujixerox.art-ex": {
        source: "iana"
      },
      "application/vnd.fujixerox.art4": {
        source: "iana"
      },
      "application/vnd.fujixerox.ddd": {
        source: "iana",
        extensions: ["ddd"]
      },
      "application/vnd.fujixerox.docuworks": {
        source: "iana",
        extensions: ["xdw"]
      },
      "application/vnd.fujixerox.docuworks.binder": {
        source: "iana",
        extensions: ["xbd"]
      },
      "application/vnd.fujixerox.docuworks.container": {
        source: "iana"
      },
      "application/vnd.fujixerox.hbpl": {
        source: "iana"
      },
      "application/vnd.fut-misnet": {
        source: "iana"
      },
      "application/vnd.futoin+cbor": {
        source: "iana"
      },
      "application/vnd.futoin+json": {
        source: "iana",
        compressible: true
      },
      "application/vnd.fuzzysheet": {
        source: "iana",
        extensions: ["fzs"]
      },
      "application/vnd.genomatix.tuxedo": {
        source: "iana",
        extensions: ["txd"]
      },
      "application/vnd.gentics.grd+json": {
        source: "iana",
        compressible: true
      },
      "application/vnd.geo+json": {
        source: "iana",
        compressible: true
      },
      "application/vnd.geocube+xml": {
        source: "iana",
        compressible: true
      },
      "application/vnd.geogebra.file": {
        source: "iana",
        extensions: ["ggb"]
      },
      "application/vnd.geogebra.slides": {
        source: "iana"
      },
      "application/vnd.geogebra.tool": {
        source: "iana",
        extensions: ["ggt"]
      },
      "application/vnd.geometry-explorer": {
        source: "iana",
        extensions: ["gex", "gre"]
      },
      "application/vnd.geonext": {
        source: "iana",
        extensions: ["gxt"]
      },
      "application/vnd.geoplan": {
        source: "iana",
        extensions: ["g2w"]
      },
      "application/vnd.geospace": {
        source: "iana",
        extensions: ["g3w"]
      },
      "application/vnd.gerber": {
        source: "iana"
      },
      "application/vnd.globalplatform.card-content-mgt": {
        source: "iana"
      },
      "application/vnd.globalplatform.card-content-mgt-response": {
        source: "iana"
      },
      "application/vnd.gmx": {
        source: "iana",
        extensions: ["gmx"]
      },
      "application/vnd.google-apps.document": {
        compressible: false,
        extensions: ["gdoc"]
      },
      "application/vnd.google-apps.presentation": {
        compressible: false,
        extensions: ["gslides"]
      },
      "application/vnd.google-apps.spreadsheet": {
        compressible: false,
        extensions: ["gsheet"]
      },
      "application/vnd.google-earth.kml+xml": {
        source: "iana",
        compressible: true,
        extensions: ["kml"]
      },
      "application/vnd.google-earth.kmz": {
        source: "iana",
        compressible: false,
        extensions: ["kmz"]
      },
      "application/vnd.gov.sk.e-form+xml": {
        source: "iana",
        compressible: true
      },
      "application/vnd.gov.sk.e-form+zip": {
        source: "iana",
        compressible: false
      },
      "application/vnd.gov.sk.xmldatacontainer+xml": {
        source: "iana",
        compressible: true
      },
      "application/vnd.grafeq": {
        source: "iana",
        extensions: ["gqf", "gqs"]
      },
      "application/vnd.gridmp": {
        source: "iana"
      },
      "application/vnd.groove-account": {
        source: "iana",
        extensions: ["gac"]
      },
      "application/vnd.groove-help": {
        source: "iana",
        extensions: ["ghf"]
      },
      "application/vnd.groove-identity-message": {
        source: "iana",
        extensions: ["gim"]
      },
      "application/vnd.groove-injector": {
        source: "iana",
        extensions: ["grv"]
      },
      "application/vnd.groove-tool-message": {
        source: "iana",
        extensions: ["gtm"]
      },
      "application/vnd.groove-tool-template": {
        source: "iana",
        extensions: ["tpl"]
      },
      "application/vnd.groove-vcard": {
        source: "iana",
        extensions: ["vcg"]
      },
      "application/vnd.hal+json": {
        source: "iana",
        compressible: true
      },
      "application/vnd.hal+xml": {
        source: "iana",
        compressible: true,
        extensions: ["hal"]
      },
      "application/vnd.handheld-entertainment+xml": {
        source: "iana",
        compressible: true,
        extensions: ["zmm"]
      },
      "application/vnd.hbci": {
        source: "iana",
        extensions: ["hbci"]
      },
      "application/vnd.hc+json": {
        source: "iana",
        compressible: true
      },
      "application/vnd.hcl-bireports": {
        source: "iana"
      },
      "application/vnd.hdt": {
        source: "iana"
      },
      "application/vnd.heroku+json": {
        source: "iana",
        compressible: true
      },
      "application/vnd.hhe.lesson-player": {
        source: "iana",
        extensions: ["les"]
      },
      "application/vnd.hl7cda+xml": {
        source: "iana",
        charset: "UTF-8",
        compressible: true
      },
      "application/vnd.hl7v2+xml": {
        source: "iana",
        charset: "UTF-8",
        compressible: true
      },
      "application/vnd.hp-hpgl": {
        source: "iana",
        extensions: ["hpgl"]
      },
      "application/vnd.hp-hpid": {
        source: "iana",
        extensions: ["hpid"]
      },
      "application/vnd.hp-hps": {
        source: "iana",
        extensions: ["hps"]
      },
      "application/vnd.hp-jlyt": {
        source: "iana",
        extensions: ["jlt"]
      },
      "application/vnd.hp-pcl": {
        source: "iana",
        extensions: ["pcl"]
      },
      "application/vnd.hp-pclxl": {
        source: "iana",
        extensions: ["pclxl"]
      },
      "application/vnd.httphone": {
        source: "iana"
      },
      "application/vnd.hydrostatix.sof-data": {
        source: "iana",
        extensions: ["sfd-hdstx"]
      },
      "application/vnd.hyper+json": {
        source: "iana",
        compressible: true
      },
      "application/vnd.hyper-item+json": {
        source: "iana",
        compressible: true
      },
      "application/vnd.hyperdrive+json": {
        source: "iana",
        compressible: true
      },
      "application/vnd.hzn-3d-crossword": {
        source: "iana"
      },
      "application/vnd.ibm.afplinedata": {
        source: "iana"
      },
      "application/vnd.ibm.electronic-media": {
        source: "iana"
      },
      "application/vnd.ibm.minipay": {
        source: "iana",
        extensions: ["mpy"]
      },
      "application/vnd.ibm.modcap": {
        source: "iana",
        extensions: ["afp", "listafp", "list3820"]
      },
      "application/vnd.ibm.rights-management": {
        source: "iana",
        extensions: ["irm"]
      },
      "application/vnd.ibm.secure-container": {
        source: "iana",
        extensions: ["sc"]
      },
      "application/vnd.iccprofile": {
        source: "iana",
        extensions: ["icc", "icm"]
      },
      "application/vnd.ieee.1905": {
        source: "iana"
      },
      "application/vnd.igloader": {
        source: "iana",
        extensions: ["igl"]
      },
      "application/vnd.imagemeter.folder+zip": {
        source: "iana",
        compressible: false
      },
      "application/vnd.imagemeter.image+zip": {
        source: "iana",
        compressible: false
      },
      "application/vnd.immervision-ivp": {
        source: "iana",
        extensions: ["ivp"]
      },
      "application/vnd.immervision-ivu": {
        source: "iana",
        extensions: ["ivu"]
      },
      "application/vnd.ims.imsccv1p1": {
        source: "iana"
      },
      "application/vnd.ims.imsccv1p2": {
        source: "iana"
      },
      "application/vnd.ims.imsccv1p3": {
        source: "iana"
      },
      "application/vnd.ims.lis.v2.result+json": {
        source: "iana",
        compressible: true
      },
      "application/vnd.ims.lti.v2.toolconsumerprofile+json": {
        source: "iana",
        compressible: true
      },
      "application/vnd.ims.lti.v2.toolproxy+json": {
        source: "iana",
        compressible: true
      },
      "application/vnd.ims.lti.v2.toolproxy.id+json": {
        source: "iana",
        compressible: true
      },
      "application/vnd.ims.lti.v2.toolsettings+json": {
        source: "iana",
        compressible: true
      },
      "application/vnd.ims.lti.v2.toolsettings.simple+json": {
        source: "iana",
        compressible: true
      },
      "application/vnd.informedcontrol.rms+xml": {
        source: "iana",
        compressible: true
      },
      "application/vnd.informix-visionary": {
        source: "iana"
      },
      "application/vnd.infotech.project": {
        source: "iana"
      },
      "application/vnd.infotech.project+xml": {
        source: "iana",
        compressible: true
      },
      "application/vnd.innopath.wamp.notification": {
        source: "iana"
      },
      "application/vnd.insors.igm": {
        source: "iana",
        extensions: ["igm"]
      },
      "application/vnd.intercon.formnet": {
        source: "iana",
        extensions: ["xpw", "xpx"]
      },
      "application/vnd.intergeo": {
        source: "iana",
        extensions: ["i2g"]
      },
      "application/vnd.intertrust.digibox": {
        source: "iana"
      },
      "application/vnd.intertrust.nncp": {
        source: "iana"
      },
      "application/vnd.intu.qbo": {
        source: "iana",
        extensions: ["qbo"]
      },
      "application/vnd.intu.qfx": {
        source: "iana",
        extensions: ["qfx"]
      },
      "application/vnd.iptc.g2.catalogitem+xml": {
        source: "iana",
        compressible: true
      },
      "application/vnd.iptc.g2.conceptitem+xml": {
        source: "iana",
        compressible: true
      },
      "application/vnd.iptc.g2.knowledgeitem+xml": {
        source: "iana",
        compressible: true
      },
      "application/vnd.iptc.g2.newsitem+xml": {
        source: "iana",
        compressible: true
      },
      "application/vnd.iptc.g2.newsmessage+xml": {
        source: "iana",
        compressible: true
      },
      "application/vnd.iptc.g2.packageitem+xml": {
        source: "iana",
        compressible: true
      },
      "application/vnd.iptc.g2.planningitem+xml": {
        source: "iana",
        compressible: true
      },
      "application/vnd.ipunplugged.rcprofile": {
        source: "iana",
        extensions: ["rcprofile"]
      },
      "application/vnd.irepository.package+xml": {
        source: "iana",
        compressible: true,
        extensions: ["irp"]
      },
      "application/vnd.is-xpr": {
        source: "iana",
        extensions: ["xpr"]
      },
      "application/vnd.isac.fcs": {
        source: "iana",
        extensions: ["fcs"]
      },
      "application/vnd.iso11783-10+zip": {
        source: "iana",
        compressible: false
      },
      "application/vnd.jam": {
        source: "iana",
        extensions: ["jam"]
      },
      "application/vnd.japannet-directory-service": {
        source: "iana"
      },
      "application/vnd.japannet-jpnstore-wakeup": {
        source: "iana"
      },
      "application/vnd.japannet-payment-wakeup": {
        source: "iana"
      },
      "application/vnd.japannet-registration": {
        source: "iana"
      },
      "application/vnd.japannet-registration-wakeup": {
        source: "iana"
      },
      "application/vnd.japannet-setstore-wakeup": {
        source: "iana"
      },
      "application/vnd.japannet-verification": {
        source: "iana"
      },
      "application/vnd.japannet-verification-wakeup": {
        source: "iana"
      },
      "application/vnd.jcp.javame.midlet-rms": {
        source: "iana",
        extensions: ["rms"]
      },
      "application/vnd.jisp": {
        source: "iana",
        extensions: ["jisp"]
      },
      "application/vnd.joost.joda-archive": {
        source: "iana",
        extensions: ["joda"]
      },
      "application/vnd.jsk.isdn-ngn": {
        source: "iana"
      },
      "application/vnd.kahootz": {
        source: "iana",
        extensions: ["ktz", "ktr"]
      },
      "application/vnd.kde.karbon": {
        source: "iana",
        extensions: ["karbon"]
      },
      "application/vnd.kde.kchart": {
        source: "iana",
        extensions: ["chrt"]
      },
      "application/vnd.kde.kformula": {
        source: "iana",
        extensions: ["kfo"]
      },
      "application/vnd.kde.kivio": {
        source: "iana",
        extensions: ["flw"]
      },
      "application/vnd.kde.kontour": {
        source: "iana",
        extensions: ["kon"]
      },
      "application/vnd.kde.kpresenter": {
        source: "iana",
        extensions: ["kpr", "kpt"]
      },
      "application/vnd.kde.kspread": {
        source: "iana",
        extensions: ["ksp"]
      },
      "application/vnd.kde.kword": {
        source: "iana",
        extensions: ["kwd", "kwt"]
      },
      "application/vnd.kenameaapp": {
        source: "iana",
        extensions: ["htke"]
      },
      "application/vnd.kidspiration": {
        source: "iana",
        extensions: ["kia"]
      },
      "application/vnd.kinar": {
        source: "iana",
        extensions: ["kne", "knp"]
      },
      "application/vnd.koan": {
        source: "iana",
        extensions: ["skp", "skd", "skt", "skm"]
      },
      "application/vnd.kodak-descriptor": {
        source: "iana",
        extensions: ["sse"]
      },
      "application/vnd.las": {
        source: "iana"
      },
      "application/vnd.las.las+json": {
        source: "iana",
        compressible: true
      },
      "application/vnd.las.las+xml": {
        source: "iana",
        compressible: true,
        extensions: ["lasxml"]
      },
      "application/vnd.laszip": {
        source: "iana"
      },
      "application/vnd.leap+json": {
        source: "iana",
        compressible: true
      },
      "application/vnd.liberty-request+xml": {
        source: "iana",
        compressible: true
      },
      "application/vnd.llamagraphics.life-balance.desktop": {
        source: "iana",
        extensions: ["lbd"]
      },
      "application/vnd.llamagraphics.life-balance.exchange+xml": {
        source: "iana",
        compressible: true,
        extensions: ["lbe"]
      },
      "application/vnd.logipipe.circuit+zip": {
        source: "iana",
        compressible: false
      },
      "application/vnd.loom": {
        source: "iana"
      },
      "application/vnd.lotus-1-2-3": {
        source: "iana",
        extensions: ["123"]
      },
      "application/vnd.lotus-approach": {
        source: "iana",
        extensions: ["apr"]
      },
      "application/vnd.lotus-freelance": {
        source: "iana",
        extensions: ["pre"]
      },
      "application/vnd.lotus-notes": {
        source: "iana",
        extensions: ["nsf"]
      },
      "application/vnd.lotus-organizer": {
        source: "iana",
        extensions: ["org"]
      },
      "application/vnd.lotus-screencam": {
        source: "iana",
        extensions: ["scm"]
      },
      "application/vnd.lotus-wordpro": {
        source: "iana",
        extensions: ["lwp"]
      },
      "application/vnd.macports.portpkg": {
        source: "iana",
        extensions: ["portpkg"]
      },
      "application/vnd.mapbox-vector-tile": {
        source: "iana",
        extensions: ["mvt"]
      },
      "application/vnd.marlin.drm.actiontoken+xml": {
        source: "iana",
        compressible: true
      },
      "application/vnd.marlin.drm.conftoken+xml": {
        source: "iana",
        compressible: true
      },
      "application/vnd.marlin.drm.license+xml": {
        source: "iana",
        compressible: true
      },
      "application/vnd.marlin.drm.mdcf": {
        source: "iana"
      },
      "application/vnd.mason+json": {
        source: "iana",
        compressible: true
      },
      "application/vnd.maxar.archive.3tz+zip": {
        source: "iana",
        compressible: false
      },
      "application/vnd.maxmind.maxmind-db": {
        source: "iana"
      },
      "application/vnd.mcd": {
        source: "iana",
        extensions: ["mcd"]
      },
      "application/vnd.medcalcdata": {
        source: "iana",
        extensions: ["mc1"]
      },
      "application/vnd.mediastation.cdkey": {
        source: "iana",
        extensions: ["cdkey"]
      },
      "application/vnd.meridian-slingshot": {
        source: "iana"
      },
      "application/vnd.mfer": {
        source: "iana",
        extensions: ["mwf"]
      },
      "application/vnd.mfmp": {
        source: "iana",
        extensions: ["mfm"]
      },
      "application/vnd.micro+json": {
        source: "iana",
        compressible: true
      },
      "application/vnd.micrografx.flo": {
        source: "iana",
        extensions: ["flo"]
      },
      "application/vnd.micrografx.igx": {
        source: "iana",
        extensions: ["igx"]
      },
      "application/vnd.microsoft.portable-executable": {
        source: "iana"
      },
      "application/vnd.microsoft.windows.thumbnail-cache": {
        source: "iana"
      },
      "application/vnd.miele+json": {
        source: "iana",
        compressible: true
      },
      "application/vnd.mif": {
        source: "iana",
        extensions: ["mif"]
      },
      "application/vnd.minisoft-hp3000-save": {
        source: "iana"
      },
      "application/vnd.mitsubishi.misty-guard.trustweb": {
        source: "iana"
      },
      "application/vnd.mobius.daf": {
        source: "iana",
        extensions: ["daf"]
      },
      "application/vnd.mobius.dis": {
        source: "iana",
        extensions: ["dis"]
      },
      "application/vnd.mobius.mbk": {
        source: "iana",
        extensions: ["mbk"]
      },
      "application/vnd.mobius.mqy": {
        source: "iana",
        extensions: ["mqy"]
      },
      "application/vnd.mobius.msl": {
        source: "iana",
        extensions: ["msl"]
      },
      "application/vnd.mobius.plc": {
        source: "iana",
        extensions: ["plc"]
      },
      "application/vnd.mobius.txf": {
        source: "iana",
        extensions: ["txf"]
      },
      "application/vnd.mophun.application": {
        source: "iana",
        extensions: ["mpn"]
      },
      "application/vnd.mophun.certificate": {
        source: "iana",
        extensions: ["mpc"]
      },
      "application/vnd.motorola.flexsuite": {
        source: "iana"
      },
      "application/vnd.motorola.flexsuite.adsi": {
        source: "iana"
      },
      "application/vnd.motorola.flexsuite.fis": {
        source: "iana"
      },
      "application/vnd.motorola.flexsuite.gotap": {
        source: "iana"
      },
      "application/vnd.motorola.flexsuite.kmr": {
        source: "iana"
      },
      "application/vnd.motorola.flexsuite.ttc": {
        source: "iana"
      },
      "application/vnd.motorola.flexsuite.wem": {
        source: "iana"
      },
      "application/vnd.motorola.iprm": {
        source: "iana"
      },
      "application/vnd.mozilla.xul+xml": {
        source: "iana",
        compressible: true,
        extensions: ["xul"]
      },
      "application/vnd.ms-3mfdocument": {
        source: "iana"
      },
      "application/vnd.ms-artgalry": {
        source: "iana",
        extensions: ["cil"]
      },
      "application/vnd.ms-asf": {
        source: "iana"
      },
      "application/vnd.ms-cab-compressed": {
        source: "iana",
        extensions: ["cab"]
      },
      "application/vnd.ms-color.iccprofile": {
        source: "apache"
      },
      "application/vnd.ms-excel": {
        source: "iana",
        compressible: false,
        extensions: ["xls", "xlm", "xla", "xlc", "xlt", "xlw"]
      },
      "application/vnd.ms-excel.addin.macroenabled.12": {
        source: "iana",
        extensions: ["xlam"]
      },
      "application/vnd.ms-excel.sheet.binary.macroenabled.12": {
        source: "iana",
        extensions: ["xlsb"]
      },
      "application/vnd.ms-excel.sheet.macroenabled.12": {
        source: "iana",
        extensions: ["xlsm"]
      },
      "application/vnd.ms-excel.template.macroenabled.12": {
        source: "iana",
        extensions: ["xltm"]
      },
      "application/vnd.ms-fontobject": {
        source: "iana",
        compressible: true,
        extensions: ["eot"]
      },
      "application/vnd.ms-htmlhelp": {
        source: "iana",
        extensions: ["chm"]
      },
      "application/vnd.ms-ims": {
        source: "iana",
        extensions: ["ims"]
      },
      "application/vnd.ms-lrm": {
        source: "iana",
        extensions: ["lrm"]
      },
      "application/vnd.ms-office.activex+xml": {
        source: "iana",
        compressible: true
      },
      "application/vnd.ms-officetheme": {
        source: "iana",
        extensions: ["thmx"]
      },
      "application/vnd.ms-opentype": {
        source: "apache",
        compressible: true
      },
      "application/vnd.ms-outlook": {
        compressible: false,
        extensions: ["msg"]
      },
      "application/vnd.ms-package.obfuscated-opentype": {
        source: "apache"
      },
      "application/vnd.ms-pki.seccat": {
        source: "apache",
        extensions: ["cat"]
      },
      "application/vnd.ms-pki.stl": {
        source: "apache",
        extensions: ["stl"]
      },
      "application/vnd.ms-playready.initiator+xml": {
        source: "iana",
        compressible: true
      },
      "application/vnd.ms-powerpoint": {
        source: "iana",
        compressible: false,
        extensions: ["ppt", "pps", "pot"]
      },
      "application/vnd.ms-powerpoint.addin.macroenabled.12": {
        source: "iana",
        extensions: ["ppam"]
      },
      "application/vnd.ms-powerpoint.presentation.macroenabled.12": {
        source: "iana",
        extensions: ["pptm"]
      },
      "application/vnd.ms-powerpoint.slide.macroenabled.12": {
        source: "iana",
        extensions: ["sldm"]
      },
      "application/vnd.ms-powerpoint.slideshow.macroenabled.12": {
        source: "iana",
        extensions: ["ppsm"]
      },
      "application/vnd.ms-powerpoint.template.macroenabled.12": {
        source: "iana",
        extensions: ["potm"]
      },
      "application/vnd.ms-printdevicecapabilities+xml": {
        source: "iana",
        compressible: true
      },
      "application/vnd.ms-printing.printticket+xml": {
        source: "apache",
        compressible: true
      },
      "application/vnd.ms-printschematicket+xml": {
        source: "iana",
        compressible: true
      },
      "application/vnd.ms-project": {
        source: "iana",
        extensions: ["mpp", "mpt"]
      },
      "application/vnd.ms-tnef": {
        source: "iana"
      },
      "application/vnd.ms-windows.devicepairing": {
        source: "iana"
      },
      "application/vnd.ms-windows.nwprinting.oob": {
        source: "iana"
      },
      "application/vnd.ms-windows.printerpairing": {
        source: "iana"
      },
      "application/vnd.ms-windows.wsd.oob": {
        source: "iana"
      },
      "application/vnd.ms-wmdrm.lic-chlg-req": {
        source: "iana"
      },
      "application/vnd.ms-wmdrm.lic-resp": {
        source: "iana"
      },
      "application/vnd.ms-wmdrm.meter-chlg-req": {
        source: "iana"
      },
      "application/vnd.ms-wmdrm.meter-resp": {
        source: "iana"
      },
      "application/vnd.ms-word.document.macroenabled.12": {
        source: "iana",
        extensions: ["docm"]
      },
      "application/vnd.ms-word.template.macroenabled.12": {
        source: "iana",
        extensions: ["dotm"]
      },
      "application/vnd.ms-works": {
        source: "iana",
        extensions: ["wps", "wks", "wcm", "wdb"]
      },
      "application/vnd.ms-wpl": {
        source: "iana",
        extensions: ["wpl"]
      },
      "application/vnd.ms-xpsdocument": {
        source: "iana",
        compressible: false,
        extensions: ["xps"]
      },
      "application/vnd.msa-disk-image": {
        source: "iana"
      },
      "application/vnd.mseq": {
        source: "iana",
        extensions: ["mseq"]
      },
      "application/vnd.msign": {
        source: "iana"
      },
      "application/vnd.multiad.creator": {
        source: "iana"
      },
      "application/vnd.multiad.creator.cif": {
        source: "iana"
      },
      "application/vnd.music-niff": {
        source: "iana"
      },
      "application/vnd.musician": {
        source: "iana",
        extensions: ["mus"]
      },
      "application/vnd.muvee.style": {
        source: "iana",
        extensions: ["msty"]
      },
      "application/vnd.mynfc": {
        source: "iana",
        extensions: ["taglet"]
      },
      "application/vnd.nacamar.ybrid+json": {
        source: "iana",
        compressible: true
      },
      "application/vnd.ncd.control": {
        source: "iana"
      },
      "application/vnd.ncd.reference": {
        source: "iana"
      },
      "application/vnd.nearst.inv+json": {
        source: "iana",
        compressible: true
      },
      "application/vnd.nebumind.line": {
        source: "iana"
      },
      "application/vnd.nervana": {
        source: "iana"
      },
      "application/vnd.netfpx": {
        source: "iana"
      },
      "application/vnd.neurolanguage.nlu": {
        source: "iana",
        extensions: ["nlu"]
      },
      "application/vnd.nimn": {
        source: "iana"
      },
      "application/vnd.nintendo.nitro.rom": {
        source: "iana"
      },
      "application/vnd.nintendo.snes.rom": {
        source: "iana"
      },
      "application/vnd.nitf": {
        source: "iana",
        extensions: ["ntf", "nitf"]
      },
      "application/vnd.noblenet-directory": {
        source: "iana",
        extensions: ["nnd"]
      },
      "application/vnd.noblenet-sealer": {
        source: "iana",
        extensions: ["nns"]
      },
      "application/vnd.noblenet-web": {
        source: "iana",
        extensions: ["nnw"]
      },
      "application/vnd.nokia.catalogs": {
        source: "iana"
      },
      "application/vnd.nokia.conml+wbxml": {
        source: "iana"
      },
      "application/vnd.nokia.conml+xml": {
        source: "iana",
        compressible: true
      },
      "application/vnd.nokia.iptv.config+xml": {
        source: "iana",
        compressible: true
      },
      "application/vnd.nokia.isds-radio-presets": {
        source: "iana"
      },
      "application/vnd.nokia.landmark+wbxml": {
        source: "iana"
      },
      "application/vnd.nokia.landmark+xml": {
        source: "iana",
        compressible: true
      },
      "application/vnd.nokia.landmarkcollection+xml": {
        source: "iana",
        compressible: true
      },
      "application/vnd.nokia.n-gage.ac+xml": {
        source: "iana",
        compressible: true,
        extensions: ["ac"]
      },
      "application/vnd.nokia.n-gage.data": {
        source: "iana",
        extensions: ["ngdat"]
      },
      "application/vnd.nokia.n-gage.symbian.install": {
        source: "iana",
        extensions: ["n-gage"]
      },
      "application/vnd.nokia.ncd": {
        source: "iana"
      },
      "application/vnd.nokia.pcd+wbxml": {
        source: "iana"
      },
      "application/vnd.nokia.pcd+xml": {
        source: "iana",
        compressible: true
      },
      "application/vnd.nokia.radio-preset": {
        source: "iana",
        extensions: ["rpst"]
      },
      "application/vnd.nokia.radio-presets": {
        source: "iana",
        extensions: ["rpss"]
      },
      "application/vnd.novadigm.edm": {
        source: "iana",
        extensions: ["edm"]
      },
      "application/vnd.novadigm.edx": {
        source: "iana",
        extensions: ["edx"]
      },
      "application/vnd.novadigm.ext": {
        source: "iana",
        extensions: ["ext"]
      },
      "application/vnd.ntt-local.content-share": {
        source: "iana"
      },
      "application/vnd.ntt-local.file-transfer": {
        source: "iana"
      },
      "application/vnd.ntt-local.ogw_remote-access": {
        source: "iana"
      },
      "application/vnd.ntt-local.sip-ta_remote": {
        source: "iana"
      },
      "application/vnd.ntt-local.sip-ta_tcp_stream": {
        source: "iana"
      },
      "application/vnd.oasis.opendocument.chart": {
        source: "iana",
        extensions: ["odc"]
      },
      "application/vnd.oasis.opendocument.chart-template": {
        source: "iana",
        extensions: ["otc"]
      },
      "application/vnd.oasis.opendocument.database": {
        source: "iana",
        extensions: ["odb"]
      },
      "application/vnd.oasis.opendocument.formula": {
        source: "iana",
        extensions: ["odf"]
      },
      "application/vnd.oasis.opendocument.formula-template": {
        source: "iana",
        extensions: ["odft"]
      },
      "application/vnd.oasis.opendocument.graphics": {
        source: "iana",
        compressible: false,
        extensions: ["odg"]
      },
      "application/vnd.oasis.opendocument.graphics-template": {
        source: "iana",
        extensions: ["otg"]
      },
      "application/vnd.oasis.opendocument.image": {
        source: "iana",
        extensions: ["odi"]
      },
      "application/vnd.oasis.opendocument.image-template": {
        source: "iana",
        extensions: ["oti"]
      },
      "application/vnd.oasis.opendocument.presentation": {
        source: "iana",
        compressible: false,
        extensions: ["odp"]
      },
      "application/vnd.oasis.opendocument.presentation-template": {
        source: "iana",
        extensions: ["otp"]
      },
      "application/vnd.oasis.opendocument.spreadsheet": {
        source: "iana",
        compressible: false,
        extensions: ["ods"]
      },
      "application/vnd.oasis.opendocument.spreadsheet-template": {
        source: "iana",
        extensions: ["ots"]
      },
      "application/vnd.oasis.opendocument.text": {
        source: "iana",
        compressible: false,
        extensions: ["odt"]
      },
      "application/vnd.oasis.opendocument.text-master": {
        source: "iana",
        extensions: ["odm"]
      },
      "application/vnd.oasis.opendocument.text-template": {
        source: "iana",
        extensions: ["ott"]
      },
      "application/vnd.oasis.opendocument.text-web": {
        source: "iana",
        extensions: ["oth"]
      },
      "application/vnd.obn": {
        source: "iana"
      },
      "application/vnd.ocf+cbor": {
        source: "iana"
      },
      "application/vnd.oci.image.manifest.v1+json": {
        source: "iana",
        compressible: true
      },
      "application/vnd.oftn.l10n+json": {
        source: "iana",
        compressible: true
      },
      "application/vnd.oipf.contentaccessdownload+xml": {
        source: "iana",
        compressible: true
      },
      "application/vnd.oipf.contentaccessstreaming+xml": {
        source: "iana",
        compressible: true
      },
      "application/vnd.oipf.cspg-hexbinary": {
        source: "iana"
      },
      "application/vnd.oipf.dae.svg+xml": {
        source: "iana",
        compressible: true
      },
      "application/vnd.oipf.dae.xhtml+xml": {
        source: "iana",
        compressible: true
      },
      "application/vnd.oipf.mippvcontrolmessage+xml": {
        source: "iana",
        compressible: true
      },
      "application/vnd.oipf.pae.gem": {
        source: "iana"
      },
      "application/vnd.oipf.spdiscovery+xml": {
        source: "iana",
        compressible: true
      },
      "application/vnd.oipf.spdlist+xml": {
        source: "iana",
        compressible: true
      },
      "application/vnd.oipf.ueprofile+xml": {
        source: "iana",
        compressible: true
      },
      "application/vnd.oipf.userprofile+xml": {
        source: "iana",
        compressible: true
      },
      "application/vnd.olpc-sugar": {
        source: "iana",
        extensions: ["xo"]
      },
      "application/vnd.oma-scws-config": {
        source: "iana"
      },
      "application/vnd.oma-scws-http-request": {
        source: "iana"
      },
      "application/vnd.oma-scws-http-response": {
        source: "iana"
      },
      "application/vnd.oma.bcast.associated-procedure-parameter+xml": {
        source: "iana",
        compressible: true
      },
      "application/vnd.oma.bcast.drm-trigger+xml": {
        source: "iana",
        compressible: true
      },
      "application/vnd.oma.bcast.imd+xml": {
        source: "iana",
        compressible: true
      },
      "application/vnd.oma.bcast.ltkm": {
        source: "iana"
      },
      "application/vnd.oma.bcast.notification+xml": {
        source: "iana",
        compressible: true
      },
      "application/vnd.oma.bcast.provisioningtrigger": {
        source: "iana"
      },
      "application/vnd.oma.bcast.sgboot": {
        source: "iana"
      },
      "application/vnd.oma.bcast.sgdd+xml": {
        source: "iana",
        compressible: true
      },
      "application/vnd.oma.bcast.sgdu": {
        source: "iana"
      },
      "application/vnd.oma.bcast.simple-symbol-container": {
        source: "iana"
      },
      "application/vnd.oma.bcast.smartcard-trigger+xml": {
        source: "iana",
        compressible: true
      },
      "application/vnd.oma.bcast.sprov+xml": {
        source: "iana",
        compressible: true
      },
      "application/vnd.oma.bcast.stkm": {
        source: "iana"
      },
      "application/vnd.oma.cab-address-book+xml": {
        source: "iana",
        compressible: true
      },
      "application/vnd.oma.cab-feature-handler+xml": {
        source: "iana",
        compressible: true
      },
      "application/vnd.oma.cab-pcc+xml": {
        source: "iana",
        compressible: true
      },
      "application/vnd.oma.cab-subs-invite+xml": {
        source: "iana",
        compressible: true
      },
      "application/vnd.oma.cab-user-prefs+xml": {
        source: "iana",
        compressible: true
      },
      "application/vnd.oma.dcd": {
        source: "iana"
      },
      "application/vnd.oma.dcdc": {
        source: "iana"
      },
      "application/vnd.oma.dd2+xml": {
        source: "iana",
        compressible: true,
        extensions: ["dd2"]
      },
      "application/vnd.oma.drm.risd+xml": {
        source: "iana",
        compressible: true
      },
      "application/vnd.oma.group-usage-list+xml": {
        source: "iana",
        compressible: true
      },
      "application/vnd.oma.lwm2m+cbor": {
        source: "iana"
      },
      "application/vnd.oma.lwm2m+json": {
        source: "iana",
        compressible: true
      },
      "application/vnd.oma.lwm2m+tlv": {
        source: "iana"
      },
      "application/vnd.oma.pal+xml": {
        source: "iana",
        compressible: true
      },
      "application/vnd.oma.poc.detailed-progress-report+xml": {
        source: "iana",
        compressible: true
      },
      "application/vnd.oma.poc.final-report+xml": {
        source: "iana",
        compressible: true
      },
      "application/vnd.oma.poc.groups+xml": {
        source: "iana",
        compressible: true
      },
      "application/vnd.oma.poc.invocation-descriptor+xml": {
        source: "iana",
        compressible: true
      },
      "application/vnd.oma.poc.optimized-progress-report+xml": {
        source: "iana",
        compressible: true
      },
      "application/vnd.oma.push": {
        source: "iana"
      },
      "application/vnd.oma.scidm.messages+xml": {
        source: "iana",
        compressible: true
      },
      "application/vnd.oma.xcap-directory+xml": {
        source: "iana",
        compressible: true
      },
      "application/vnd.omads-email+xml": {
        source: "iana",
        charset: "UTF-8",
        compressible: true
      },
      "application/vnd.omads-file+xml": {
        source: "iana",
        charset: "UTF-8",
        compressible: true
      },
      "application/vnd.omads-folder+xml": {
        source: "iana",
        charset: "UTF-8",
        compressible: true
      },
      "application/vnd.omaloc-supl-init": {
        source: "iana"
      },
      "application/vnd.onepager": {
        source: "iana"
      },
      "application/vnd.onepagertamp": {
        source: "iana"
      },
      "application/vnd.onepagertamx": {
        source: "iana"
      },
      "application/vnd.onepagertat": {
        source: "iana"
      },
      "application/vnd.onepagertatp": {
        source: "iana"
      },
      "application/vnd.onepagertatx": {
        source: "iana"
      },
      "application/vnd.openblox.game+xml": {
        source: "iana",
        compressible: true,
        extensions: ["obgx"]
      },
      "application/vnd.openblox.game-binary": {
        source: "iana"
      },
      "application/vnd.openeye.oeb": {
        source: "iana"
      },
      "application/vnd.openofficeorg.extension": {
        source: "apache",
        extensions: ["oxt"]
      },
      "application/vnd.openstreetmap.data+xml": {
        source: "iana",
        compressible: true,
        extensions: ["osm"]
      },
      "application/vnd.opentimestamps.ots": {
        source: "iana"
      },
      "application/vnd.openxmlformats-officedocument.custom-properties+xml": {
        source: "iana",
        compressible: true
      },
      "application/vnd.openxmlformats-officedocument.customxmlproperties+xml": {
        source: "iana",
        compressible: true
      },
      "application/vnd.openxmlformats-officedocument.drawing+xml": {
        source: "iana",
        compressible: true
      },
      "application/vnd.openxmlformats-officedocument.drawingml.chart+xml": {
        source: "iana",
        compressible: true
      },
      "application/vnd.openxmlformats-officedocument.drawingml.chartshapes+xml": {
        source: "iana",
        compressible: true
      },
      "application/vnd.openxmlformats-officedocument.drawingml.diagramcolors+xml": {
        source: "iana",
        compressible: true
      },
      "application/vnd.openxmlformats-officedocument.drawingml.diagramdata+xml": {
        source: "iana",
        compressible: true
      },
      "application/vnd.openxmlformats-officedocument.drawingml.diagramlayout+xml": {
        source: "iana",
        compressible: true
      },
      "application/vnd.openxmlformats-officedocument.drawingml.diagramstyle+xml": {
        source: "iana",
        compressible: true
      },
      "application/vnd.openxmlformats-officedocument.extended-properties+xml": {
        source: "iana",
        compressible: true
      },
      "application/vnd.openxmlformats-officedocument.presentationml.commentauthors+xml": {
        source: "iana",
        compressible: true
      },
      "application/vnd.openxmlformats-officedocument.presentationml.comments+xml": {
        source: "iana",
        compressible: true
      },
      "application/vnd.openxmlformats-officedocument.presentationml.handoutmaster+xml": {
        source: "iana",
        compressible: true
      },
      "application/vnd.openxmlformats-officedocument.presentationml.notesmaster+xml": {
        source: "iana",
        compressible: true
      },
      "application/vnd.openxmlformats-officedocument.presentationml.notesslide+xml": {
        source: "iana",
        compressible: true
      },
      "application/vnd.openxmlformats-officedocument.presentationml.presentation": {
        source: "iana",
        compressible: false,
        extensions: ["pptx"]
      },
      "application/vnd.openxmlformats-officedocument.presentationml.presentation.main+xml": {
        source: "iana",
        compressible: true
      },
      "application/vnd.openxmlformats-officedocument.presentationml.presprops+xml": {
        source: "iana",
        compressible: true
      },
      "application/vnd.openxmlformats-officedocument.presentationml.slide": {
        source: "iana",
        extensions: ["sldx"]
      },
      "application/vnd.openxmlformats-officedocument.presentationml.slide+xml": {
        source: "iana",
        compressible: true
      },
      "application/vnd.openxmlformats-officedocument.presentationml.slidelayout+xml": {
        source: "iana",
        compressible: true
      },
      "application/vnd.openxmlformats-officedocument.presentationml.slidemaster+xml": {
        source: "iana",
        compressible: true
      },
      "application/vnd.openxmlformats-officedocument.presentationml.slideshow": {
        source: "iana",
        extensions: ["ppsx"]
      },
      "application/vnd.openxmlformats-officedocument.presentationml.slideshow.main+xml": {
        source: "iana",
        compressible: true
      },
      "application/vnd.openxmlformats-officedocument.presentationml.slideupdateinfo+xml": {
        source: "iana",
        compressible: true
      },
      "application/vnd.openxmlformats-officedocument.presentationml.tablestyles+xml": {
        source: "iana",
        compressible: true
      },
      "application/vnd.openxmlformats-officedocument.presentationml.tags+xml": {
        source: "iana",
        compressible: true
      },
      "application/vnd.openxmlformats-officedocument.presentationml.template": {
        source: "iana",
        extensions: ["potx"]
      },
      "application/vnd.openxmlformats-officedocument.presentationml.template.main+xml": {
        source: "iana",
        compressible: true
      },
      "application/vnd.openxmlformats-officedocument.presentationml.viewprops+xml": {
        source: "iana",
        compressible: true
      },
      "application/vnd.openxmlformats-officedocument.spreadsheetml.calcchain+xml": {
        source: "iana",
        compressible: true
      },
      "application/vnd.openxmlformats-officedocument.spreadsheetml.chartsheet+xml": {
        source: "iana",
        compressible: true
      },
      "application/vnd.openxmlformats-officedocument.spreadsheetml.comments+xml": {
        source: "iana",
        compressible: true
      },
      "application/vnd.openxmlformats-officedocument.spreadsheetml.connections+xml": {
        source: "iana",
        compressible: true
      },
      "application/vnd.openxmlformats-officedocument.spreadsheetml.dialogsheet+xml": {
        source: "iana",
        compressible: true
      },
      "application/vnd.openxmlformats-officedocument.spreadsheetml.externallink+xml": {
        source: "iana",
        compressible: true
      },
      "application/vnd.openxmlformats-officedocument.spreadsheetml.pivotcachedefinition+xml": {
        source: "iana",
        compressible: true
      },
      "application/vnd.openxmlformats-officedocument.spreadsheetml.pivotcacherecords+xml": {
        source: "iana",
        compressible: true
      },
      "application/vnd.openxmlformats-officedocument.spreadsheetml.pivottable+xml": {
        source: "iana",
        compressible: true
      },
      "application/vnd.openxmlformats-officedocument.spreadsheetml.querytable+xml": {
        source: "iana",
        compressible: true
      },
      "application/vnd.openxmlformats-officedocument.spreadsheetml.revisionheaders+xml": {
        source: "iana",
        compressible: true
      },
      "application/vnd.openxmlformats-officedocument.spreadsheetml.revisionlog+xml": {
        source: "iana",
        compressible: true
      },
      "application/vnd.openxmlformats-officedocument.spreadsheetml.sharedstrings+xml": {
        source: "iana",
        compressible: true
      },
      "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet": {
        source: "iana",
        compressible: false,
        extensions: ["xlsx"]
      },
      "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet.main+xml": {
        source: "iana",
        compressible: true
      },
      "application/vnd.openxmlformats-officedocument.spreadsheetml.sheetmetadata+xml": {
        source: "iana",
        compressible: true
      },
      "application/vnd.openxmlformats-officedocument.spreadsheetml.styles+xml": {
        source: "iana",
        compressible: true
      },
      "application/vnd.openxmlformats-officedocument.spreadsheetml.table+xml": {
        source: "iana",
        compressible: true
      },
      "application/vnd.openxmlformats-officedocument.spreadsheetml.tablesinglecells+xml": {
        source: "iana",
        compressible: true
      },
      "application/vnd.openxmlformats-officedocument.spreadsheetml.template": {
        source: "iana",
        extensions: ["xltx"]
      },
      "application/vnd.openxmlformats-officedocument.spreadsheetml.template.main+xml": {
        source: "iana",
        compressible: true
      },
      "application/vnd.openxmlformats-officedocument.spreadsheetml.usernames+xml": {
        source: "iana",
        compressible: true
      },
      "application/vnd.openxmlformats-officedocument.spreadsheetml.volatiledependencies+xml": {
        source: "iana",
        compressible: true
      },
      "application/vnd.openxmlformats-officedocument.spreadsheetml.worksheet+xml": {
        source: "iana",
        compressible: true
      },
      "application/vnd.openxmlformats-officedocument.theme+xml": {
        source: "iana",
        compressible: true
      },
      "application/vnd.openxmlformats-officedocument.themeoverride+xml": {
        source: "iana",
        compressible: true
      },
      "application/vnd.openxmlformats-officedocument.vmldrawing": {
        source: "iana"
      },
      "application/vnd.openxmlformats-officedocument.wordprocessingml.comments+xml": {
        source: "iana",
        compressible: true
      },
      "application/vnd.openxmlformats-officedocument.wordprocessingml.document": {
        source: "iana",
        compressible: false,
        extensions: ["docx"]
      },
      "application/vnd.openxmlformats-officedocument.wordprocessingml.document.glossary+xml": {
        source: "iana",
        compressible: true
      },
      "application/vnd.openxmlformats-officedocument.wordprocessingml.document.main+xml": {
        source: "iana",
        compressible: true
      },
      "application/vnd.openxmlformats-officedocument.wordprocessingml.endnotes+xml": {
        source: "iana",
        compressible: true
      },
      "application/vnd.openxmlformats-officedocument.wordprocessingml.fonttable+xml": {
        source: "iana",
        compressible: true
      },
      "application/vnd.openxmlformats-officedocument.wordprocessingml.footer+xml": {
        source: "iana",
        compressible: true
      },
      "application/vnd.openxmlformats-officedocument.wordprocessingml.footnotes+xml": {
        source: "iana",
        compressible: true
      },
      "application/vnd.openxmlformats-officedocument.wordprocessingml.numbering+xml": {
        source: "iana",
        compressible: true
      },
      "application/vnd.openxmlformats-officedocument.wordprocessingml.settings+xml": {
        source: "iana",
        compressible: true
      },
      "application/vnd.openxmlformats-officedocument.wordprocessingml.styles+xml": {
        source: "iana",
        compressible: true
      },
      "application/vnd.openxmlformats-officedocument.wordprocessingml.template": {
        source: "iana",
        extensions: ["dotx"]
      },
      "application/vnd.openxmlformats-officedocument.wordprocessingml.template.main+xml": {
        source: "iana",
        compressible: true
      },
      "application/vnd.openxmlformats-officedocument.wordprocessingml.websettings+xml": {
        source: "iana",
        compressible: true
      },
      "application/vnd.openxmlformats-package.core-properties+xml": {
        source: "iana",
        compressible: true
      },
      "application/vnd.openxmlformats-package.digital-signature-xmlsignature+xml": {
        source: "iana",
        compressible: true
      },
      "application/vnd.openxmlformats-package.relationships+xml": {
        source: "iana",
        compressible: true
      },
      "application/vnd.oracle.resource+json": {
        source: "iana",
        compressible: true
      },
      "application/vnd.orange.indata": {
        source: "iana"
      },
      "application/vnd.osa.netdeploy": {
        source: "iana"
      },
      "application/vnd.osgeo.mapguide.package": {
        source: "iana",
        extensions: ["mgp"]
      },
      "application/vnd.osgi.bundle": {
        source: "iana"
      },
      "application/vnd.osgi.dp": {
        source: "iana",
        extensions: ["dp"]
      },
      "application/vnd.osgi.subsystem": {
        source: "iana",
        extensions: ["esa"]
      },
      "application/vnd.otps.ct-kip+xml": {
        source: "iana",
        compressible: true
      },
      "application/vnd.oxli.countgraph": {
        source: "iana"
      },
      "application/vnd.pagerduty+json": {
        source: "iana",
        compressible: true
      },
      "application/vnd.palm": {
        source: "iana",
        extensions: ["pdb", "pqa", "oprc"]
      },
      "application/vnd.panoply": {
        source: "iana"
      },
      "application/vnd.paos.xml": {
        source: "iana"
      },
      "application/vnd.patentdive": {
        source: "iana"
      },
      "application/vnd.patientecommsdoc": {
        source: "iana"
      },
      "application/vnd.pawaafile": {
        source: "iana",
        extensions: ["paw"]
      },
      "application/vnd.pcos": {
        source: "iana"
      },
      "application/vnd.pg.format": {
        source: "iana",
        extensions: ["str"]
      },
      "application/vnd.pg.osasli": {
        source: "iana",
        extensions: ["ei6"]
      },
      "application/vnd.piaccess.application-licence": {
        source: "iana"
      },
      "application/vnd.picsel": {
        source: "iana",
        extensions: ["efif"]
      },
      "application/vnd.pmi.widget": {
        source: "iana",
        extensions: ["wg"]
      },
      "application/vnd.poc.group-advertisement+xml": {
        source: "iana",
        compressible: true
      },
      "application/vnd.pocketlearn": {
        source: "iana",
        extensions: ["plf"]
      },
      "application/vnd.powerbuilder6": {
        source: "iana",
        extensions: ["pbd"]
      },
      "application/vnd.powerbuilder6-s": {
        source: "iana"
      },
      "application/vnd.powerbuilder7": {
        source: "iana"
      },
      "application/vnd.powerbuilder7-s": {
        source: "iana"
      },
      "application/vnd.powerbuilder75": {
        source: "iana"
      },
      "application/vnd.powerbuilder75-s": {
        source: "iana"
      },
      "application/vnd.preminet": {
        source: "iana"
      },
      "application/vnd.previewsystems.box": {
        source: "iana",
        extensions: ["box"]
      },
      "application/vnd.proteus.magazine": {
        source: "iana",
        extensions: ["mgz"]
      },
      "application/vnd.psfs": {
        source: "iana"
      },
      "application/vnd.publishare-delta-tree": {
        source: "iana",
        extensions: ["qps"]
      },
      "application/vnd.pvi.ptid1": {
        source: "iana",
        extensions: ["ptid"]
      },
      "application/vnd.pwg-multiplexed": {
        source: "iana"
      },
      "application/vnd.pwg-xhtml-print+xml": {
        source: "iana",
        compressible: true
      },
      "application/vnd.qualcomm.brew-app-res": {
        source: "iana"
      },
      "application/vnd.quarantainenet": {
        source: "iana"
      },
      "application/vnd.quark.quarkxpress": {
        source: "iana",
        extensions: ["qxd", "qxt", "qwd", "qwt", "qxl", "qxb"]
      },
      "application/vnd.quobject-quoxdocument": {
        source: "iana"
      },
      "application/vnd.radisys.moml+xml": {
        source: "iana",
        compressible: true
      },
      "application/vnd.radisys.msml+xml": {
        source: "iana",
        compressible: true
      },
      "application/vnd.radisys.msml-audit+xml": {
        source: "iana",
        compressible: true
      },
      "application/vnd.radisys.msml-audit-conf+xml": {
        source: "iana",
        compressible: true
      },
      "application/vnd.radisys.msml-audit-conn+xml": {
        source: "iana",
        compressible: true
      },
      "application/vnd.radisys.msml-audit-dialog+xml": {
        source: "iana",
        compressible: true
      },
      "application/vnd.radisys.msml-audit-stream+xml": {
        source: "iana",
        compressible: true
      },
      "application/vnd.radisys.msml-conf+xml": {
        source: "iana",
        compressible: true
      },
      "application/vnd.radisys.msml-dialog+xml": {
        source: "iana",
        compressible: true
      },
      "application/vnd.radisys.msml-dialog-base+xml": {
        source: "iana",
        compressible: true
      },
      "application/vnd.radisys.msml-dialog-fax-detect+xml": {
        source: "iana",
        compressible: true
      },
      "application/vnd.radisys.msml-dialog-fax-sendrecv+xml": {
        source: "iana",
        compressible: true
      },
      "application/vnd.radisys.msml-dialog-group+xml": {
        source: "iana",
        compressible: true
      },
      "application/vnd.radisys.msml-dialog-speech+xml": {
        source: "iana",
        compressible: true
      },
      "application/vnd.radisys.msml-dialog-transform+xml": {
        source: "iana",
        compressible: true
      },
      "application/vnd.rainstor.data": {
        source: "iana"
      },
      "application/vnd.rapid": {
        source: "iana"
      },
      "application/vnd.rar": {
        source: "iana",
        extensions: ["rar"]
      },
      "application/vnd.realvnc.bed": {
        source: "iana",
        extensions: ["bed"]
      },
      "application/vnd.recordare.musicxml": {
        source: "iana",
        extensions: ["mxl"]
      },
      "application/vnd.recordare.musicxml+xml": {
        source: "iana",
        compressible: true,
        extensions: ["musicxml"]
      },
      "application/vnd.renlearn.rlprint": {
        source: "iana"
      },
      "application/vnd.resilient.logic": {
        source: "iana"
      },
      "application/vnd.restful+json": {
        source: "iana",
        compressible: true
      },
      "application/vnd.rig.cryptonote": {
        source: "iana",
        extensions: ["cryptonote"]
      },
      "application/vnd.rim.cod": {
        source: "apache",
        extensions: ["cod"]
      },
      "application/vnd.rn-realmedia": {
        source: "apache",
        extensions: ["rm"]
      },
      "application/vnd.rn-realmedia-vbr": {
        source: "apache",
        extensions: ["rmvb"]
      },
      "application/vnd.route66.link66+xml": {
        source: "iana",
        compressible: true,
        extensions: ["link66"]
      },
      "application/vnd.rs-274x": {
        source: "iana"
      },
      "application/vnd.ruckus.download": {
        source: "iana"
      },
      "application/vnd.s3sms": {
        source: "iana"
      },
      "application/vnd.sailingtracker.track": {
        source: "iana",
        extensions: ["st"]
      },
      "application/vnd.sar": {
        source: "iana"
      },
      "application/vnd.sbm.cid": {
        source: "iana"
      },
      "application/vnd.sbm.mid2": {
        source: "iana"
      },
      "application/vnd.scribus": {
        source: "iana"
      },
      "application/vnd.sealed.3df": {
        source: "iana"
      },
      "application/vnd.sealed.csf": {
        source: "iana"
      },
      "application/vnd.sealed.doc": {
        source: "iana"
      },
      "application/vnd.sealed.eml": {
        source: "iana"
      },
      "application/vnd.sealed.mht": {
        source: "iana"
      },
      "application/vnd.sealed.net": {
        source: "iana"
      },
      "application/vnd.sealed.ppt": {
        source: "iana"
      },
      "application/vnd.sealed.tiff": {
        source: "iana"
      },
      "application/vnd.sealed.xls": {
        source: "iana"
      },
      "application/vnd.sealedmedia.softseal.html": {
        source: "iana"
      },
      "application/vnd.sealedmedia.softseal.pdf": {
        source: "iana"
      },
      "application/vnd.seemail": {
        source: "iana",
        extensions: ["see"]
      },
      "application/vnd.seis+json": {
        source: "iana",
        compressible: true
      },
      "application/vnd.sema": {
        source: "iana",
        extensions: ["sema"]
      },
      "application/vnd.semd": {
        source: "iana",
        extensions: ["semd"]
      },
      "application/vnd.semf": {
        source: "iana",
        extensions: ["semf"]
      },
      "application/vnd.shade-save-file": {
        source: "iana"
      },
      "application/vnd.shana.informed.formdata": {
        source: "iana",
        extensions: ["ifm"]
      },
      "application/vnd.shana.informed.formtemplate": {
        source: "iana",
        extensions: ["itp"]
      },
      "application/vnd.shana.informed.interchange": {
        source: "iana",
        extensions: ["iif"]
      },
      "application/vnd.shana.informed.package": {
        source: "iana",
        extensions: ["ipk"]
      },
      "application/vnd.shootproof+json": {
        source: "iana",
        compressible: true
      },
      "application/vnd.shopkick+json": {
        source: "iana",
        compressible: true
      },
      "application/vnd.shp": {
        source: "iana"
      },
      "application/vnd.shx": {
        source: "iana"
      },
      "application/vnd.sigrok.session": {
        source: "iana"
      },
      "application/vnd.simtech-mindmapper": {
        source: "iana",
        extensions: ["twd", "twds"]
      },
      "application/vnd.siren+json": {
        source: "iana",
        compressible: true
      },
      "application/vnd.smaf": {
        source: "iana",
        extensions: ["mmf"]
      },
      "application/vnd.smart.notebook": {
        source: "iana"
      },
      "application/vnd.smart.teacher": {
        source: "iana",
        extensions: ["teacher"]
      },
      "application/vnd.snesdev-page-table": {
        source: "iana"
      },
      "application/vnd.software602.filler.form+xml": {
        source: "iana",
        compressible: true,
        extensions: ["fo"]
      },
      "application/vnd.software602.filler.form-xml-zip": {
        source: "iana"
      },
      "application/vnd.solent.sdkm+xml": {
        source: "iana",
        compressible: true,
        extensions: ["sdkm", "sdkd"]
      },
      "application/vnd.spotfire.dxp": {
        source: "iana",
        extensions: ["dxp"]
      },
      "application/vnd.spotfire.sfs": {
        source: "iana",
        extensions: ["sfs"]
      },
      "application/vnd.sqlite3": {
        source: "iana"
      },
      "application/vnd.sss-cod": {
        source: "iana"
      },
      "application/vnd.sss-dtf": {
        source: "iana"
      },
      "application/vnd.sss-ntf": {
        source: "iana"
      },
      "application/vnd.stardivision.calc": {
        source: "apache",
        extensions: ["sdc"]
      },
      "application/vnd.stardivision.draw": {
        source: "apache",
        extensions: ["sda"]
      },
      "application/vnd.stardivision.impress": {
        source: "apache",
        extensions: ["sdd"]
      },
      "application/vnd.stardivision.math": {
        source: "apache",
        extensions: ["smf"]
      },
      "application/vnd.stardivision.writer": {
        source: "apache",
        extensions: ["sdw", "vor"]
      },
      "application/vnd.stardivision.writer-global": {
        source: "apache",
        extensions: ["sgl"]
      },
      "application/vnd.stepmania.package": {
        source: "iana",
        extensions: ["smzip"]
      },
      "application/vnd.stepmania.stepchart": {
        source: "iana",
        extensions: ["sm"]
      },
      "application/vnd.street-stream": {
        source: "iana"
      },
      "application/vnd.sun.wadl+xml": {
        source: "iana",
        compressible: true,
        extensions: ["wadl"]
      },
      "application/vnd.sun.xml.calc": {
        source: "apache",
        extensions: ["sxc"]
      },
      "application/vnd.sun.xml.calc.template": {
        source: "apache",
        extensions: ["stc"]
      },
      "application/vnd.sun.xml.draw": {
        source: "apache",
        extensions: ["sxd"]
      },
      "application/vnd.sun.xml.draw.template": {
        source: "apache",
        extensions: ["std"]
      },
      "application/vnd.sun.xml.impress": {
        source: "apache",
        extensions: ["sxi"]
      },
      "application/vnd.sun.xml.impress.template": {
        source: "apache",
        extensions: ["sti"]
      },
      "application/vnd.sun.xml.math": {
        source: "apache",
        extensions: ["sxm"]
      },
      "application/vnd.sun.xml.writer": {
        source: "apache",
        extensions: ["sxw"]
      },
      "application/vnd.sun.xml.writer.global": {
        source: "apache",
        extensions: ["sxg"]
      },
      "application/vnd.sun.xml.writer.template": {
        source: "apache",
        extensions: ["stw"]
      },
      "application/vnd.sus-calendar": {
        source: "iana",
        extensions: ["sus", "susp"]
      },
      "application/vnd.svd": {
        source: "iana",
        extensions: ["svd"]
      },
      "application/vnd.swiftview-ics": {
        source: "iana"
      },
      "application/vnd.sycle+xml": {
        source: "iana",
        compressible: true
      },
      "application/vnd.syft+json": {
        source: "iana",
        compressible: true
      },
      "application/vnd.symbian.install": {
        source: "apache",
        extensions: ["sis", "sisx"]
      },
      "application/vnd.syncml+xml": {
        source: "iana",
        charset: "UTF-8",
        compressible: true,
        extensions: ["xsm"]
      },
      "application/vnd.syncml.dm+wbxml": {
        source: "iana",
        charset: "UTF-8",
        extensions: ["bdm"]
      },
      "application/vnd.syncml.dm+xml": {
        source: "iana",
        charset: "UTF-8",
        compressible: true,
        extensions: ["xdm"]
      },
      "application/vnd.syncml.dm.notification": {
        source: "iana"
      },
      "application/vnd.syncml.dmddf+wbxml": {
        source: "iana"
      },
      "application/vnd.syncml.dmddf+xml": {
        source: "iana",
        charset: "UTF-8",
        compressible: true,
        extensions: ["ddf"]
      },
      "application/vnd.syncml.dmtnds+wbxml": {
        source: "iana"
      },
      "application/vnd.syncml.dmtnds+xml": {
        source: "iana",
        charset: "UTF-8",
        compressible: true
      },
      "application/vnd.syncml.ds.notification": {
        source: "iana"
      },
      "application/vnd.tableschema+json": {
        source: "iana",
        compressible: true
      },
      "application/vnd.tao.intent-module-archive": {
        source: "iana",
        extensions: ["tao"]
      },
      "application/vnd.tcpdump.pcap": {
        source: "iana",
        extensions: ["pcap", "cap", "dmp"]
      },
      "application/vnd.think-cell.ppttc+json": {
        source: "iana",
        compressible: true
      },
      "application/vnd.tmd.mediaflex.api+xml": {
        source: "iana",
        compressible: true
      },
      "application/vnd.tml": {
        source: "iana"
      },
      "application/vnd.tmobile-livetv": {
        source: "iana",
        extensions: ["tmo"]
      },
      "application/vnd.tri.onesource": {
        source: "iana"
      },
      "application/vnd.trid.tpt": {
        source: "iana",
        extensions: ["tpt"]
      },
      "application/vnd.triscape.mxs": {
        source: "iana",
        extensions: ["mxs"]
      },
      "application/vnd.trueapp": {
        source: "iana",
        extensions: ["tra"]
      },
      "application/vnd.truedoc": {
        source: "iana"
      },
      "application/vnd.ubisoft.webplayer": {
        source: "iana"
      },
      "application/vnd.ufdl": {
        source: "iana",
        extensions: ["ufd", "ufdl"]
      },
      "application/vnd.uiq.theme": {
        source: "iana",
        extensions: ["utz"]
      },
      "application/vnd.umajin": {
        source: "iana",
        extensions: ["umj"]
      },
      "application/vnd.unity": {
        source: "iana",
        extensions: ["unityweb"]
      },
      "application/vnd.uoml+xml": {
        source: "iana",
        compressible: true,
        extensions: ["uoml"]
      },
      "application/vnd.uplanet.alert": {
        source: "iana"
      },
      "application/vnd.uplanet.alert-wbxml": {
        source: "iana"
      },
      "application/vnd.uplanet.bearer-choice": {
        source: "iana"
      },
      "application/vnd.uplanet.bearer-choice-wbxml": {
        source: "iana"
      },
      "application/vnd.uplanet.cacheop": {
        source: "iana"
      },
      "application/vnd.uplanet.cacheop-wbxml": {
        source: "iana"
      },
      "application/vnd.uplanet.channel": {
        source: "iana"
      },
      "application/vnd.uplanet.channel-wbxml": {
        source: "iana"
      },
      "application/vnd.uplanet.list": {
        source: "iana"
      },
      "application/vnd.uplanet.list-wbxml": {
        source: "iana"
      },
      "application/vnd.uplanet.listcmd": {
        source: "iana"
      },
      "application/vnd.uplanet.listcmd-wbxml": {
        source: "iana"
      },
      "application/vnd.uplanet.signal": {
        source: "iana"
      },
      "application/vnd.uri-map": {
        source: "iana"
      },
      "application/vnd.valve.source.material": {
        source: "iana"
      },
      "application/vnd.vcx": {
        source: "iana",
        extensions: ["vcx"]
      },
      "application/vnd.vd-study": {
        source: "iana"
      },
      "application/vnd.vectorworks": {
        source: "iana"
      },
      "application/vnd.vel+json": {
        source: "iana",
        compressible: true
      },
      "application/vnd.verimatrix.vcas": {
        source: "iana"
      },
      "application/vnd.veritone.aion+json": {
        source: "iana",
        compressible: true
      },
      "application/vnd.veryant.thin": {
        source: "iana"
      },
      "application/vnd.ves.encrypted": {
        source: "iana"
      },
      "application/vnd.vidsoft.vidconference": {
        source: "iana"
      },
      "application/vnd.visio": {
        source: "iana",
        extensions: ["vsd", "vst", "vss", "vsw"]
      },
      "application/vnd.visionary": {
        source: "iana",
        extensions: ["vis"]
      },
      "application/vnd.vividence.scriptfile": {
        source: "iana"
      },
      "application/vnd.vsf": {
        source: "iana",
        extensions: ["vsf"]
      },
      "application/vnd.wap.sic": {
        source: "iana"
      },
      "application/vnd.wap.slc": {
        source: "iana"
      },
      "application/vnd.wap.wbxml": {
        source: "iana",
        charset: "UTF-8",
        extensions: ["wbxml"]
      },
      "application/vnd.wap.wmlc": {
        source: "iana",
        extensions: ["wmlc"]
      },
      "application/vnd.wap.wmlscriptc": {
        source: "iana",
        extensions: ["wmlsc"]
      },
      "application/vnd.webturbo": {
        source: "iana",
        extensions: ["wtb"]
      },
      "application/vnd.wfa.dpp": {
        source: "iana"
      },
      "application/vnd.wfa.p2p": {
        source: "iana"
      },
      "application/vnd.wfa.wsc": {
        source: "iana"
      },
      "application/vnd.windows.devicepairing": {
        source: "iana"
      },
      "application/vnd.wmc": {
        source: "iana"
      },
      "application/vnd.wmf.bootstrap": {
        source: "iana"
      },
      "application/vnd.wolfram.mathematica": {
        source: "iana"
      },
      "application/vnd.wolfram.mathematica.package": {
        source: "iana"
      },
      "application/vnd.wolfram.player": {
        source: "iana",
        extensions: ["nbp"]
      },
      "application/vnd.wordperfect": {
        source: "iana",
        extensions: ["wpd"]
      },
      "application/vnd.wqd": {
        source: "iana",
        extensions: ["wqd"]
      },
      "application/vnd.wrq-hp3000-labelled": {
        source: "iana"
      },
      "application/vnd.wt.stf": {
        source: "iana",
        extensions: ["stf"]
      },
      "application/vnd.wv.csp+wbxml": {
        source: "iana"
      },
      "application/vnd.wv.csp+xml": {
        source: "iana",
        compressible: true
      },
      "application/vnd.wv.ssp+xml": {
        source: "iana",
        compressible: true
      },
      "application/vnd.xacml+json": {
        source: "iana",
        compressible: true
      },
      "application/vnd.xara": {
        source: "iana",
        extensions: ["xar"]
      },
      "application/vnd.xfdl": {
        source: "iana",
        extensions: ["xfdl"]
      },
      "application/vnd.xfdl.webform": {
        source: "iana"
      },
      "application/vnd.xmi+xml": {
        source: "iana",
        compressible: true
      },
      "application/vnd.xmpie.cpkg": {
        source: "iana"
      },
      "application/vnd.xmpie.dpkg": {
        source: "iana"
      },
      "application/vnd.xmpie.plan": {
        source: "iana"
      },
      "application/vnd.xmpie.ppkg": {
        source: "iana"
      },
      "application/vnd.xmpie.xlim": {
        source: "iana"
      },
      "application/vnd.yamaha.hv-dic": {
        source: "iana",
        extensions: ["hvd"]
      },
      "application/vnd.yamaha.hv-script": {
        source: "iana",
        extensions: ["hvs"]
      },
      "application/vnd.yamaha.hv-voice": {
        source: "iana",
        extensions: ["hvp"]
      },
      "application/vnd.yamaha.openscoreformat": {
        source: "iana",
        extensions: ["osf"]
      },
      "application/vnd.yamaha.openscoreformat.osfpvg+xml": {
        source: "iana",
        compressible: true,
        extensions: ["osfpvg"]
      },
      "application/vnd.yamaha.remote-setup": {
        source: "iana"
      },
      "application/vnd.yamaha.smaf-audio": {
        source: "iana",
        extensions: ["saf"]
      },
      "application/vnd.yamaha.smaf-phrase": {
        source: "iana",
        extensions: ["spf"]
      },
      "application/vnd.yamaha.through-ngn": {
        source: "iana"
      },
      "application/vnd.yamaha.tunnel-udpencap": {
        source: "iana"
      },
      "application/vnd.yaoweme": {
        source: "iana"
      },
      "application/vnd.yellowriver-custom-menu": {
        source: "iana",
        extensions: ["cmp"]
      },
      "application/vnd.youtube.yt": {
        source: "iana"
      },
      "application/vnd.zul": {
        source: "iana",
        extensions: ["zir", "zirz"]
      },
      "application/vnd.zzazz.deck+xml": {
        source: "iana",
        compressible: true,
        extensions: ["zaz"]
      },
      "application/voicexml+xml": {
        source: "iana",
        compressible: true,
        extensions: ["vxml"]
      },
      "application/voucher-cms+json": {
        source: "iana",
        compressible: true
      },
      "application/vq-rtcpxr": {
        source: "iana"
      },
      "application/wasm": {
        source: "iana",
        compressible: true,
        extensions: ["wasm"]
      },
      "application/watcherinfo+xml": {
        source: "iana",
        compressible: true,
        extensions: ["wif"]
      },
      "application/webpush-options+json": {
        source: "iana",
        compressible: true
      },
      "application/whoispp-query": {
        source: "iana"
      },
      "application/whoispp-response": {
        source: "iana"
      },
      "application/widget": {
        source: "iana",
        extensions: ["wgt"]
      },
      "application/winhlp": {
        source: "apache",
        extensions: ["hlp"]
      },
      "application/wita": {
        source: "iana"
      },
      "application/wordperfect5.1": {
        source: "iana"
      },
      "application/wsdl+xml": {
        source: "iana",
        compressible: true,
        extensions: ["wsdl"]
      },
      "application/wspolicy+xml": {
        source: "iana",
        compressible: true,
        extensions: ["wspolicy"]
      },
      "application/x-7z-compressed": {
        source: "apache",
        compressible: false,
        extensions: ["7z"]
      },
      "application/x-abiword": {
        source: "apache",
        extensions: ["abw"]
      },
      "application/x-ace-compressed": {
        source: "apache",
        extensions: ["ace"]
      },
      "application/x-amf": {
        source: "apache"
      },
      "application/x-apple-diskimage": {
        source: "apache",
        extensions: ["dmg"]
      },
      "application/x-arj": {
        compressible: false,
        extensions: ["arj"]
      },
      "application/x-authorware-bin": {
        source: "apache",
        extensions: ["aab", "x32", "u32", "vox"]
      },
      "application/x-authorware-map": {
        source: "apache",
        extensions: ["aam"]
      },
      "application/x-authorware-seg": {
        source: "apache",
        extensions: ["aas"]
      },
      "application/x-bcpio": {
        source: "apache",
        extensions: ["bcpio"]
      },
      "application/x-bdoc": {
        compressible: false,
        extensions: ["bdoc"]
      },
      "application/x-bittorrent": {
        source: "apache",
        extensions: ["torrent"]
      },
      "application/x-blorb": {
        source: "apache",
        extensions: ["blb", "blorb"]
      },
      "application/x-bzip": {
        source: "apache",
        compressible: false,
        extensions: ["bz"]
      },
      "application/x-bzip2": {
        source: "apache",
        compressible: false,
        extensions: ["bz2", "boz"]
      },
      "application/x-cbr": {
        source: "apache",
        extensions: ["cbr", "cba", "cbt", "cbz", "cb7"]
      },
      "application/x-cdlink": {
        source: "apache",
        extensions: ["vcd"]
      },
      "application/x-cfs-compressed": {
        source: "apache",
        extensions: ["cfs"]
      },
      "application/x-chat": {
        source: "apache",
        extensions: ["chat"]
      },
      "application/x-chess-pgn": {
        source: "apache",
        extensions: ["pgn"]
      },
      "application/x-chrome-extension": {
        extensions: ["crx"]
      },
      "application/x-cocoa": {
        source: "nginx",
        extensions: ["cco"]
      },
      "application/x-compress": {
        source: "apache"
      },
      "application/x-conference": {
        source: "apache",
        extensions: ["nsc"]
      },
      "application/x-cpio": {
        source: "apache",
        extensions: ["cpio"]
      },
      "application/x-csh": {
        source: "apache",
        extensions: ["csh"]
      },
      "application/x-deb": {
        compressible: false
      },
      "application/x-debian-package": {
        source: "apache",
        extensions: ["deb", "udeb"]
      },
      "application/x-dgc-compressed": {
        source: "apache",
        extensions: ["dgc"]
      },
      "application/x-director": {
        source: "apache",
        extensions: ["dir", "dcr", "dxr", "cst", "cct", "cxt", "w3d", "fgd", "swa"]
      },
      "application/x-doom": {
        source: "apache",
        extensions: ["wad"]
      },
      "application/x-dtbncx+xml": {
        source: "apache",
        compressible: true,
        extensions: ["ncx"]
      },
      "application/x-dtbook+xml": {
        source: "apache",
        compressible: true,
        extensions: ["dtb"]
      },
      "application/x-dtbresource+xml": {
        source: "apache",
        compressible: true,
        extensions: ["res"]
      },
      "application/x-dvi": {
        source: "apache",
        compressible: false,
        extensions: ["dvi"]
      },
      "application/x-envoy": {
        source: "apache",
        extensions: ["evy"]
      },
      "application/x-eva": {
        source: "apache",
        extensions: ["eva"]
      },
      "application/x-font-bdf": {
        source: "apache",
        extensions: ["bdf"]
      },
      "application/x-font-dos": {
        source: "apache"
      },
      "application/x-font-framemaker": {
        source: "apache"
      },
      "application/x-font-ghostscript": {
        source: "apache",
        extensions: ["gsf"]
      },
      "application/x-font-libgrx": {
        source: "apache"
      },
      "application/x-font-linux-psf": {
        source: "apache",
        extensions: ["psf"]
      },
      "application/x-font-pcf": {
        source: "apache",
        extensions: ["pcf"]
      },
      "application/x-font-snf": {
        source: "apache",
        extensions: ["snf"]
      },
      "application/x-font-speedo": {
        source: "apache"
      },
      "application/x-font-sunos-news": {
        source: "apache"
      },
      "application/x-font-type1": {
        source: "apache",
        extensions: ["pfa", "pfb", "pfm", "afm"]
      },
      "application/x-font-vfont": {
        source: "apache"
      },
      "application/x-freearc": {
        source: "apache",
        extensions: ["arc"]
      },
      "application/x-futuresplash": {
        source: "apache",
        extensions: ["spl"]
      },
      "application/x-gca-compressed": {
        source: "apache",
        extensions: ["gca"]
      },
      "application/x-glulx": {
        source: "apache",
        extensions: ["ulx"]
      },
      "application/x-gnumeric": {
        source: "apache",
        extensions: ["gnumeric"]
      },
      "application/x-gramps-xml": {
        source: "apache",
        extensions: ["gramps"]
      },
      "application/x-gtar": {
        source: "apache",
        extensions: ["gtar"]
      },
      "application/x-gzip": {
        source: "apache"
      },
      "application/x-hdf": {
        source: "apache",
        extensions: ["hdf"]
      },
      "application/x-httpd-php": {
        compressible: true,
        extensions: ["php"]
      },
      "application/x-install-instructions": {
        source: "apache",
        extensions: ["install"]
      },
      "application/x-iso9660-image": {
        source: "apache",
        extensions: ["iso"]
      },
      "application/x-iwork-keynote-sffkey": {
        extensions: ["key"]
      },
      "application/x-iwork-numbers-sffnumbers": {
        extensions: ["numbers"]
      },
      "application/x-iwork-pages-sffpages": {
        extensions: ["pages"]
      },
      "application/x-java-archive-diff": {
        source: "nginx",
        extensions: ["jardiff"]
      },
      "application/x-java-jnlp-file": {
        source: "apache",
        compressible: false,
        extensions: ["jnlp"]
      },
      "application/x-javascript": {
        compressible: true
      },
      "application/x-keepass2": {
        extensions: ["kdbx"]
      },
      "application/x-latex": {
        source: "apache",
        compressible: false,
        extensions: ["latex"]
      },
      "application/x-lua-bytecode": {
        extensions: ["luac"]
      },
      "application/x-lzh-compressed": {
        source: "apache",
        extensions: ["lzh", "lha"]
      },
      "application/x-makeself": {
        source: "nginx",
        extensions: ["run"]
      },
      "application/x-mie": {
        source: "apache",
        extensions: ["mie"]
      },
      "application/x-mobipocket-ebook": {
        source: "apache",
        extensions: ["prc", "mobi"]
      },
      "application/x-mpegurl": {
        compressible: false
      },
      "application/x-ms-application": {
        source: "apache",
        extensions: ["application"]
      },
      "application/x-ms-shortcut": {
        source: "apache",
        extensions: ["lnk"]
      },
      "application/x-ms-wmd": {
        source: "apache",
        extensions: ["wmd"]
      },
      "application/x-ms-wmz": {
        source: "apache",
        extensions: ["wmz"]
      },
      "application/x-ms-xbap": {
        source: "apache",
        extensions: ["xbap"]
      },
      "application/x-msaccess": {
        source: "apache",
        extensions: ["mdb"]
      },
      "application/x-msbinder": {
        source: "apache",
        extensions: ["obd"]
      },
      "application/x-mscardfile": {
        source: "apache",
        extensions: ["crd"]
      },
      "application/x-msclip": {
        source: "apache",
        extensions: ["clp"]
      },
      "application/x-msdos-program": {
        extensions: ["exe"]
      },
      "application/x-msdownload": {
        source: "apache",
        extensions: ["exe", "dll", "com", "bat", "msi"]
      },
      "application/x-msmediaview": {
        source: "apache",
        extensions: ["mvb", "m13", "m14"]
      },
      "application/x-msmetafile": {
        source: "apache",
        extensions: ["wmf", "wmz", "emf", "emz"]
      },
      "application/x-msmoney": {
        source: "apache",
        extensions: ["mny"]
      },
      "application/x-mspublisher": {
        source: "apache",
        extensions: ["pub"]
      },
      "application/x-msschedule": {
        source: "apache",
        extensions: ["scd"]
      },
      "application/x-msterminal": {
        source: "apache",
        extensions: ["trm"]
      },
      "application/x-mswrite": {
        source: "apache",
        extensions: ["wri"]
      },
      "application/x-netcdf": {
        source: "apache",
        extensions: ["nc", "cdf"]
      },
      "application/x-ns-proxy-autoconfig": {
        compressible: true,
        extensions: ["pac"]
      },
      "application/x-nzb": {
        source: "apache",
        extensions: ["nzb"]
      },
      "application/x-perl": {
        source: "nginx",
        extensions: ["pl", "pm"]
      },
      "application/x-pilot": {
        source: "nginx",
        extensions: ["prc", "pdb"]
      },
      "application/x-pkcs12": {
        source: "apache",
        compressible: false,
        extensions: ["p12", "pfx"]
      },
      "application/x-pkcs7-certificates": {
        source: "apache",
        extensions: ["p7b", "spc"]
      },
      "application/x-pkcs7-certreqresp": {
        source: "apache",
        extensions: ["p7r"]
      },
      "application/x-pki-message": {
        source: "iana"
      },
      "application/x-rar-compressed": {
        source: "apache",
        compressible: false,
        extensions: ["rar"]
      },
      "application/x-redhat-package-manager": {
        source: "nginx",
        extensions: ["rpm"]
      },
      "application/x-research-info-systems": {
        source: "apache",
        extensions: ["ris"]
      },
      "application/x-sea": {
        source: "nginx",
        extensions: ["sea"]
      },
      "application/x-sh": {
        source: "apache",
        compressible: true,
        extensions: ["sh"]
      },
      "application/x-shar": {
        source: "apache",
        extensions: ["shar"]
      },
      "application/x-shockwave-flash": {
        source: "apache",
        compressible: false,
        extensions: ["swf"]
      },
      "application/x-silverlight-app": {
        source: "apache",
        extensions: ["xap"]
      },
      "application/x-sql": {
        source: "apache",
        extensions: ["sql"]
      },
      "application/x-stuffit": {
        source: "apache",
        compressible: false,
        extensions: ["sit"]
      },
      "application/x-stuffitx": {
        source: "apache",
        extensions: ["sitx"]
      },
      "application/x-subrip": {
        source: "apache",
        extensions: ["srt"]
      },
      "application/x-sv4cpio": {
        source: "apache",
        extensions: ["sv4cpio"]
      },
      "application/x-sv4crc": {
        source: "apache",
        extensions: ["sv4crc"]
      },
      "application/x-t3vm-image": {
        source: "apache",
        extensions: ["t3"]
      },
      "application/x-tads": {
        source: "apache",
        extensions: ["gam"]
      },
      "application/x-tar": {
        source: "apache",
        compressible: true,
        extensions: ["tar"]
      },
      "application/x-tcl": {
        source: "apache",
        extensions: ["tcl", "tk"]
      },
      "application/x-tex": {
        source: "apache",
        extensions: ["tex"]
      },
      "application/x-tex-tfm": {
        source: "apache",
        extensions: ["tfm"]
      },
      "application/x-texinfo": {
        source: "apache",
        extensions: ["texinfo", "texi"]
      },
      "application/x-tgif": {
        source: "apache",
        extensions: ["obj"]
      },
      "application/x-ustar": {
        source: "apache",
        extensions: ["ustar"]
      },
      "application/x-virtualbox-hdd": {
        compressible: true,
        extensions: ["hdd"]
      },
      "application/x-virtualbox-ova": {
        compressible: true,
        extensions: ["ova"]
      },
      "application/x-virtualbox-ovf": {
        compressible: true,
        extensions: ["ovf"]
      },
      "application/x-virtualbox-vbox": {
        compressible: true,
        extensions: ["vbox"]
      },
      "application/x-virtualbox-vbox-extpack": {
        compressible: false,
        extensions: ["vbox-extpack"]
      },
      "application/x-virtualbox-vdi": {
        compressible: true,
        extensions: ["vdi"]
      },
      "application/x-virtualbox-vhd": {
        compressible: true,
        extensions: ["vhd"]
      },
      "application/x-virtualbox-vmdk": {
        compressible: true,
        extensions: ["vmdk"]
      },
      "application/x-wais-source": {
        source: "apache",
        extensions: ["src"]
      },
      "application/x-web-app-manifest+json": {
        compressible: true,
        extensions: ["webapp"]
      },
      "application/x-www-form-urlencoded": {
        source: "iana",
        compressible: true
      },
      "application/x-x509-ca-cert": {
        source: "iana",
        extensions: ["der", "crt", "pem"]
      },
      "application/x-x509-ca-ra-cert": {
        source: "iana"
      },
      "application/x-x509-next-ca-cert": {
        source: "iana"
      },
      "application/x-xfig": {
        source: "apache",
        extensions: ["fig"]
      },
      "application/x-xliff+xml": {
        source: "apache",
        compressible: true,
        extensions: ["xlf"]
      },
      "application/x-xpinstall": {
        source: "apache",
        compressible: false,
        extensions: ["xpi"]
      },
      "application/x-xz": {
        source: "apache",
        extensions: ["xz"]
      },
      "application/x-zmachine": {
        source: "apache",
        extensions: ["z1", "z2", "z3", "z4", "z5", "z6", "z7", "z8"]
      },
      "application/x400-bp": {
        source: "iana"
      },
      "application/xacml+xml": {
        source: "iana",
        compressible: true
      },
      "application/xaml+xml": {
        source: "apache",
        compressible: true,
        extensions: ["xaml"]
      },
      "application/xcap-att+xml": {
        source: "iana",
        compressible: true,
        extensions: ["xav"]
      },
      "application/xcap-caps+xml": {
        source: "iana",
        compressible: true,
        extensions: ["xca"]
      },
      "application/xcap-diff+xml": {
        source: "iana",
        compressible: true,
        extensions: ["xdf"]
      },
      "application/xcap-el+xml": {
        source: "iana",
        compressible: true,
        extensions: ["xel"]
      },
      "application/xcap-error+xml": {
        source: "iana",
        compressible: true
      },
      "application/xcap-ns+xml": {
        source: "iana",
        compressible: true,
        extensions: ["xns"]
      },
      "application/xcon-conference-info+xml": {
        source: "iana",
        compressible: true
      },
      "application/xcon-conference-info-diff+xml": {
        source: "iana",
        compressible: true
      },
      "application/xenc+xml": {
        source: "iana",
        compressible: true,
        extensions: ["xenc"]
      },
      "application/xhtml+xml": {
        source: "iana",
        compressible: true,
        extensions: ["xhtml", "xht"]
      },
      "application/xhtml-voice+xml": {
        source: "apache",
        compressible: true
      },
      "application/xliff+xml": {
        source: "iana",
        compressible: true,
        extensions: ["xlf"]
      },
      "application/xml": {
        source: "iana",
        compressible: true,
        extensions: ["xml", "xsl", "xsd", "rng"]
      },
      "application/xml-dtd": {
        source: "iana",
        compressible: true,
        extensions: ["dtd"]
      },
      "application/xml-external-parsed-entity": {
        source: "iana"
      },
      "application/xml-patch+xml": {
        source: "iana",
        compressible: true
      },
      "application/xmpp+xml": {
        source: "iana",
        compressible: true
      },
      "application/xop+xml": {
        source: "iana",
        compressible: true,
        extensions: ["xop"]
      },
      "application/xproc+xml": {
        source: "apache",
        compressible: true,
        extensions: ["xpl"]
      },
      "application/xslt+xml": {
        source: "iana",
        compressible: true,
        extensions: ["xsl", "xslt"]
      },
      "application/xspf+xml": {
        source: "apache",
        compressible: true,
        extensions: ["xspf"]
      },
      "application/xv+xml": {
        source: "iana",
        compressible: true,
        extensions: ["mxml", "xhvml", "xvml", "xvm"]
      },
      "application/yang": {
        source: "iana",
        extensions: ["yang"]
      },
      "application/yang-data+json": {
        source: "iana",
        compressible: true
      },
      "application/yang-data+xml": {
        source: "iana",
        compressible: true
      },
      "application/yang-patch+json": {
        source: "iana",
        compressible: true
      },
      "application/yang-patch+xml": {
        source: "iana",
        compressible: true
      },
      "application/yin+xml": {
        source: "iana",
        compressible: true,
        extensions: ["yin"]
      },
      "application/zip": {
        source: "iana",
        compressible: false,
        extensions: ["zip"]
      },
      "application/zlib": {
        source: "iana"
      },
      "application/zstd": {
        source: "iana"
      },
      "audio/1d-interleaved-parityfec": {
        source: "iana"
      },
      "audio/32kadpcm": {
        source: "iana"
      },
      "audio/3gpp": {
        source: "iana",
        compressible: false,
        extensions: ["3gpp"]
      },
      "audio/3gpp2": {
        source: "iana"
      },
      "audio/aac": {
        source: "iana"
      },
      "audio/ac3": {
        source: "iana"
      },
      "audio/adpcm": {
        source: "apache",
        extensions: ["adp"]
      },
      "audio/amr": {
        source: "iana",
        extensions: ["amr"]
      },
      "audio/amr-wb": {
        source: "iana"
      },
      "audio/amr-wb+": {
        source: "iana"
      },
      "audio/aptx": {
        source: "iana"
      },
      "audio/asc": {
        source: "iana"
      },
      "audio/atrac-advanced-lossless": {
        source: "iana"
      },
      "audio/atrac-x": {
        source: "iana"
      },
      "audio/atrac3": {
        source: "iana"
      },
      "audio/basic": {
        source: "iana",
        compressible: false,
        extensions: ["au", "snd"]
      },
      "audio/bv16": {
        source: "iana"
      },
      "audio/bv32": {
        source: "iana"
      },
      "audio/clearmode": {
        source: "iana"
      },
      "audio/cn": {
        source: "iana"
      },
      "audio/dat12": {
        source: "iana"
      },
      "audio/dls": {
        source: "iana"
      },
      "audio/dsr-es201108": {
        source: "iana"
      },
      "audio/dsr-es202050": {
        source: "iana"
      },
      "audio/dsr-es202211": {
        source: "iana"
      },
      "audio/dsr-es202212": {
        source: "iana"
      },
      "audio/dv": {
        source: "iana"
      },
      "audio/dvi4": {
        source: "iana"
      },
      "audio/eac3": {
        source: "iana"
      },
      "audio/encaprtp": {
        source: "iana"
      },
      "audio/evrc": {
        source: "iana"
      },
      "audio/evrc-qcp": {
        source: "iana"
      },
      "audio/evrc0": {
        source: "iana"
      },
      "audio/evrc1": {
        source: "iana"
      },
      "audio/evrcb": {
        source: "iana"
      },
      "audio/evrcb0": {
        source: "iana"
      },
      "audio/evrcb1": {
        source: "iana"
      },
      "audio/evrcnw": {
        source: "iana"
      },
      "audio/evrcnw0": {
        source: "iana"
      },
      "audio/evrcnw1": {
        source: "iana"
      },
      "audio/evrcwb": {
        source: "iana"
      },
      "audio/evrcwb0": {
        source: "iana"
      },
      "audio/evrcwb1": {
        source: "iana"
      },
      "audio/evs": {
        source: "iana"
      },
      "audio/flexfec": {
        source: "iana"
      },
      "audio/fwdred": {
        source: "iana"
      },
      "audio/g711-0": {
        source: "iana"
      },
      "audio/g719": {
        source: "iana"
      },
      "audio/g722": {
        source: "iana"
      },
      "audio/g7221": {
        source: "iana"
      },
      "audio/g723": {
        source: "iana"
      },
      "audio/g726-16": {
        source: "iana"
      },
      "audio/g726-24": {
        source: "iana"
      },
      "audio/g726-32": {
        source: "iana"
      },
      "audio/g726-40": {
        source: "iana"
      },
      "audio/g728": {
        source: "iana"
      },
      "audio/g729": {
        source: "iana"
      },
      "audio/g7291": {
        source: "iana"
      },
      "audio/g729d": {
        source: "iana"
      },
      "audio/g729e": {
        source: "iana"
      },
      "audio/gsm": {
        source: "iana"
      },
      "audio/gsm-efr": {
        source: "iana"
      },
      "audio/gsm-hr-08": {
        source: "iana"
      },
      "audio/ilbc": {
        source: "iana"
      },
      "audio/ip-mr_v2.5": {
        source: "iana"
      },
      "audio/isac": {
        source: "apache"
      },
      "audio/l16": {
        source: "iana"
      },
      "audio/l20": {
        source: "iana"
      },
      "audio/l24": {
        source: "iana",
        compressible: false
      },
      "audio/l8": {
        source: "iana"
      },
      "audio/lpc": {
        source: "iana"
      },
      "audio/melp": {
        source: "iana"
      },
      "audio/melp1200": {
        source: "iana"
      },
      "audio/melp2400": {
        source: "iana"
      },
      "audio/melp600": {
        source: "iana"
      },
      "audio/mhas": {
        source: "iana"
      },
      "audio/midi": {
        source: "apache",
        extensions: ["mid", "midi", "kar", "rmi"]
      },
      "audio/mobile-xmf": {
        source: "iana",
        extensions: ["mxmf"]
      },
      "audio/mp3": {
        compressible: false,
        extensions: ["mp3"]
      },
      "audio/mp4": {
        source: "iana",
        compressible: false,
        extensions: ["m4a", "mp4a"]
      },
      "audio/mp4a-latm": {
        source: "iana"
      },
      "audio/mpa": {
        source: "iana"
      },
      "audio/mpa-robust": {
        source: "iana"
      },
      "audio/mpeg": {
        source: "iana",
        compressible: false,
        extensions: ["mpga", "mp2", "mp2a", "mp3", "m2a", "m3a"]
      },
      "audio/mpeg4-generic": {
        source: "iana"
      },
      "audio/musepack": {
        source: "apache"
      },
      "audio/ogg": {
        source: "iana",
        compressible: false,
        extensions: ["oga", "ogg", "spx", "opus"]
      },
      "audio/opus": {
        source: "iana"
      },
      "audio/parityfec": {
        source: "iana"
      },
      "audio/pcma": {
        source: "iana"
      },
      "audio/pcma-wb": {
        source: "iana"
      },
      "audio/pcmu": {
        source: "iana"
      },
      "audio/pcmu-wb": {
        source: "iana"
      },
      "audio/prs.sid": {
        source: "iana"
      },
      "audio/qcelp": {
        source: "iana"
      },
      "audio/raptorfec": {
        source: "iana"
      },
      "audio/red": {
        source: "iana"
      },
      "audio/rtp-enc-aescm128": {
        source: "iana"
      },
      "audio/rtp-midi": {
        source: "iana"
      },
      "audio/rtploopback": {
        source: "iana"
      },
      "audio/rtx": {
        source: "iana"
      },
      "audio/s3m": {
        source: "apache",
        extensions: ["s3m"]
      },
      "audio/scip": {
        source: "iana"
      },
      "audio/silk": {
        source: "apache",
        extensions: ["sil"]
      },
      "audio/smv": {
        source: "iana"
      },
      "audio/smv-qcp": {
        source: "iana"
      },
      "audio/smv0": {
        source: "iana"
      },
      "audio/sofa": {
        source: "iana"
      },
      "audio/sp-midi": {
        source: "iana"
      },
      "audio/speex": {
        source: "iana"
      },
      "audio/t140c": {
        source: "iana"
      },
      "audio/t38": {
        source: "iana"
      },
      "audio/telephone-event": {
        source: "iana"
      },
      "audio/tetra_acelp": {
        source: "iana"
      },
      "audio/tetra_acelp_bb": {
        source: "iana"
      },
      "audio/tone": {
        source: "iana"
      },
      "audio/tsvcis": {
        source: "iana"
      },
      "audio/uemclip": {
        source: "iana"
      },
      "audio/ulpfec": {
        source: "iana"
      },
      "audio/usac": {
        source: "iana"
      },
      "audio/vdvi": {
        source: "iana"
      },
      "audio/vmr-wb": {
        source: "iana"
      },
      "audio/vnd.3gpp.iufp": {
        source: "iana"
      },
      "audio/vnd.4sb": {
        source: "iana"
      },
      "audio/vnd.audiokoz": {
        source: "iana"
      },
      "audio/vnd.celp": {
        source: "iana"
      },
      "audio/vnd.cisco.nse": {
        source: "iana"
      },
      "audio/vnd.cmles.radio-events": {
        source: "iana"
      },
      "audio/vnd.cns.anp1": {
        source: "iana"
      },
      "audio/vnd.cns.inf1": {
        source: "iana"
      },
      "audio/vnd.dece.audio": {
        source: "iana",
        extensions: ["uva", "uvva"]
      },
      "audio/vnd.digital-winds": {
        source: "iana",
        extensions: ["eol"]
      },
      "audio/vnd.dlna.adts": {
        source: "iana"
      },
      "audio/vnd.dolby.heaac.1": {
        source: "iana"
      },
      "audio/vnd.dolby.heaac.2": {
        source: "iana"
      },
      "audio/vnd.dolby.mlp": {
        source: "iana"
      },
      "audio/vnd.dolby.mps": {
        source: "iana"
      },
      "audio/vnd.dolby.pl2": {
        source: "iana"
      },
      "audio/vnd.dolby.pl2x": {
        source: "iana"
      },
      "audio/vnd.dolby.pl2z": {
        source: "iana"
      },
      "audio/vnd.dolby.pulse.1": {
        source: "iana"
      },
      "audio/vnd.dra": {
        source: "iana",
        extensions: ["dra"]
      },
      "audio/vnd.dts": {
        source: "iana",
        extensions: ["dts"]
      },
      "audio/vnd.dts.hd": {
        source: "iana",
        extensions: ["dtshd"]
      },
      "audio/vnd.dts.uhd": {
        source: "iana"
      },
      "audio/vnd.dvb.file": {
        source: "iana"
      },
      "audio/vnd.everad.plj": {
        source: "iana"
      },
      "audio/vnd.hns.audio": {
        source: "iana"
      },
      "audio/vnd.lucent.voice": {
        source: "iana",
        extensions: ["lvp"]
      },
      "audio/vnd.ms-playready.media.pya": {
        source: "iana",
        extensions: ["pya"]
      },
      "audio/vnd.nokia.mobile-xmf": {
        source: "iana"
      },
      "audio/vnd.nortel.vbk": {
        source: "iana"
      },
      "audio/vnd.nuera.ecelp4800": {
        source: "iana",
        extensions: ["ecelp4800"]
      },
      "audio/vnd.nuera.ecelp7470": {
        source: "iana",
        extensions: ["ecelp7470"]
      },
      "audio/vnd.nuera.ecelp9600": {
        source: "iana",
        extensions: ["ecelp9600"]
      },
      "audio/vnd.octel.sbc": {
        source: "iana"
      },
      "audio/vnd.presonus.multitrack": {
        source: "iana"
      },
      "audio/vnd.qcelp": {
        source: "iana"
      },
      "audio/vnd.rhetorex.32kadpcm": {
        source: "iana"
      },
      "audio/vnd.rip": {
        source: "iana",
        extensions: ["rip"]
      },
      "audio/vnd.rn-realaudio": {
        compressible: false
      },
      "audio/vnd.sealedmedia.softseal.mpeg": {
        source: "iana"
      },
      "audio/vnd.vmx.cvsd": {
        source: "iana"
      },
      "audio/vnd.wave": {
        compressible: false
      },
      "audio/vorbis": {
        source: "iana",
        compressible: false
      },
      "audio/vorbis-config": {
        source: "iana"
      },
      "audio/wav": {
        compressible: false,
        extensions: ["wav"]
      },
      "audio/wave": {
        compressible: false,
        extensions: ["wav"]
      },
      "audio/webm": {
        source: "apache",
        compressible: false,
        extensions: ["weba"]
      },
      "audio/x-aac": {
        source: "apache",
        compressible: false,
        extensions: ["aac"]
      },
      "audio/x-aiff": {
        source: "apache",
        extensions: ["aif", "aiff", "aifc"]
      },
      "audio/x-caf": {
        source: "apache",
        compressible: false,
        extensions: ["caf"]
      },
      "audio/x-flac": {
        source: "apache",
        extensions: ["flac"]
      },
      "audio/x-m4a": {
        source: "nginx",
        extensions: ["m4a"]
      },
      "audio/x-matroska": {
        source: "apache",
        extensions: ["mka"]
      },
      "audio/x-mpegurl": {
        source: "apache",
        extensions: ["m3u"]
      },
      "audio/x-ms-wax": {
        source: "apache",
        extensions: ["wax"]
      },
      "audio/x-ms-wma": {
        source: "apache",
        extensions: ["wma"]
      },
      "audio/x-pn-realaudio": {
        source: "apache",
        extensions: ["ram", "ra"]
      },
      "audio/x-pn-realaudio-plugin": {
        source: "apache",
        extensions: ["rmp"]
      },
      "audio/x-realaudio": {
        source: "nginx",
        extensions: ["ra"]
      },
      "audio/x-tta": {
        source: "apache"
      },
      "audio/x-wav": {
        source: "apache",
        extensions: ["wav"]
      },
      "audio/xm": {
        source: "apache",
        extensions: ["xm"]
      },
      "chemical/x-cdx": {
        source: "apache",
        extensions: ["cdx"]
      },
      "chemical/x-cif": {
        source: "apache",
        extensions: ["cif"]
      },
      "chemical/x-cmdf": {
        source: "apache",
        extensions: ["cmdf"]
      },
      "chemical/x-cml": {
        source: "apache",
        extensions: ["cml"]
      },
      "chemical/x-csml": {
        source: "apache",
        extensions: ["csml"]
      },
      "chemical/x-pdb": {
        source: "apache"
      },
      "chemical/x-xyz": {
        source: "apache",
        extensions: ["xyz"]
      },
      "font/collection": {
        source: "iana",
        extensions: ["ttc"]
      },
      "font/otf": {
        source: "iana",
        compressible: true,
        extensions: ["otf"]
      },
      "font/sfnt": {
        source: "iana"
      },
      "font/ttf": {
        source: "iana",
        compressible: true,
        extensions: ["ttf"]
      },
      "font/woff": {
        source: "iana",
        extensions: ["woff"]
      },
      "font/woff2": {
        source: "iana",
        extensions: ["woff2"]
      },
      "image/aces": {
        source: "iana",
        extensions: ["exr"]
      },
      "image/apng": {
        compressible: false,
        extensions: ["apng"]
      },
      "image/avci": {
        source: "iana",
        extensions: ["avci"]
      },
      "image/avcs": {
        source: "iana",
        extensions: ["avcs"]
      },
      "image/avif": {
        source: "iana",
        compressible: false,
        extensions: ["avif"]
      },
      "image/bmp": {
        source: "iana",
        compressible: true,
        extensions: ["bmp"]
      },
      "image/cgm": {
        source: "iana",
        extensions: ["cgm"]
      },
      "image/dicom-rle": {
        source: "iana",
        extensions: ["drle"]
      },
      "image/emf": {
        source: "iana",
        extensions: ["emf"]
      },
      "image/fits": {
        source: "iana",
        extensions: ["fits"]
      },
      "image/g3fax": {
        source: "iana",
        extensions: ["g3"]
      },
      "image/gif": {
        source: "iana",
        compressible: false,
        extensions: ["gif"]
      },
      "image/heic": {
        source: "iana",
        extensions: ["heic"]
      },
      "image/heic-sequence": {
        source: "iana",
        extensions: ["heics"]
      },
      "image/heif": {
        source: "iana",
        extensions: ["heif"]
      },
      "image/heif-sequence": {
        source: "iana",
        extensions: ["heifs"]
      },
      "image/hej2k": {
        source: "iana",
        extensions: ["hej2"]
      },
      "image/hsj2": {
        source: "iana",
        extensions: ["hsj2"]
      },
      "image/ief": {
        source: "iana",
        extensions: ["ief"]
      },
      "image/jls": {
        source: "iana",
        extensions: ["jls"]
      },
      "image/jp2": {
        source: "iana",
        compressible: false,
        extensions: ["jp2", "jpg2"]
      },
      "image/jpeg": {
        source: "iana",
        compressible: false,
        extensions: ["jpeg", "jpg", "jpe"]
      },
      "image/jph": {
        source: "iana",
        extensions: ["jph"]
      },
      "image/jphc": {
        source: "iana",
        extensions: ["jhc"]
      },
      "image/jpm": {
        source: "iana",
        compressible: false,
        extensions: ["jpm"]
      },
      "image/jpx": {
        source: "iana",
        compressible: false,
        extensions: ["jpx", "jpf"]
      },
      "image/jxr": {
        source: "iana",
        extensions: ["jxr"]
      },
      "image/jxra": {
        source: "iana",
        extensions: ["jxra"]
      },
      "image/jxrs": {
        source: "iana",
        extensions: ["jxrs"]
      },
      "image/jxs": {
        source: "iana",
        extensions: ["jxs"]
      },
      "image/jxsc": {
        source: "iana",
        extensions: ["jxsc"]
      },
      "image/jxsi": {
        source: "iana",
        extensions: ["jxsi"]
      },
      "image/jxss": {
        source: "iana",
        extensions: ["jxss"]
      },
      "image/ktx": {
        source: "iana",
        extensions: ["ktx"]
      },
      "image/ktx2": {
        source: "iana",
        extensions: ["ktx2"]
      },
      "image/naplps": {
        source: "iana"
      },
      "image/pjpeg": {
        compressible: false
      },
      "image/png": {
        source: "iana",
        compressible: false,
        extensions: ["png"]
      },
      "image/prs.btif": {
        source: "iana",
        extensions: ["btif"]
      },
      "image/prs.pti": {
        source: "iana",
        extensions: ["pti"]
      },
      "image/pwg-raster": {
        source: "iana"
      },
      "image/sgi": {
        source: "apache",
        extensions: ["sgi"]
      },
      "image/svg+xml": {
        source: "iana",
        compressible: true,
        extensions: ["svg", "svgz"]
      },
      "image/t38": {
        source: "iana",
        extensions: ["t38"]
      },
      "image/tiff": {
        source: "iana",
        compressible: false,
        extensions: ["tif", "tiff"]
      },
      "image/tiff-fx": {
        source: "iana",
        extensions: ["tfx"]
      },
      "image/vnd.adobe.photoshop": {
        source: "iana",
        compressible: true,
        extensions: ["psd"]
      },
      "image/vnd.airzip.accelerator.azv": {
        source: "iana",
        extensions: ["azv"]
      },
      "image/vnd.cns.inf2": {
        source: "iana"
      },
      "image/vnd.dece.graphic": {
        source: "iana",
        extensions: ["uvi", "uvvi", "uvg", "uvvg"]
      },
      "image/vnd.djvu": {
        source: "iana",
        extensions: ["djvu", "djv"]
      },
      "image/vnd.dvb.subtitle": {
        source: "iana",
        extensions: ["sub"]
      },
      "image/vnd.dwg": {
        source: "iana",
        extensions: ["dwg"]
      },
      "image/vnd.dxf": {
        source: "iana",
        extensions: ["dxf"]
      },
      "image/vnd.fastbidsheet": {
        source: "iana",
        extensions: ["fbs"]
      },
      "image/vnd.fpx": {
        source: "iana",
        extensions: ["fpx"]
      },
      "image/vnd.fst": {
        source: "iana",
        extensions: ["fst"]
      },
      "image/vnd.fujixerox.edmics-mmr": {
        source: "iana",
        extensions: ["mmr"]
      },
      "image/vnd.fujixerox.edmics-rlc": {
        source: "iana",
        extensions: ["rlc"]
      },
      "image/vnd.globalgraphics.pgb": {
        source: "iana"
      },
      "image/vnd.microsoft.icon": {
        source: "iana",
        compressible: true,
        extensions: ["ico"]
      },
      "image/vnd.mix": {
        source: "iana"
      },
      "image/vnd.mozilla.apng": {
        source: "iana"
      },
      "image/vnd.ms-dds": {
        compressible: true,
        extensions: ["dds"]
      },
      "image/vnd.ms-modi": {
        source: "iana",
        extensions: ["mdi"]
      },
      "image/vnd.ms-photo": {
        source: "apache",
        extensions: ["wdp"]
      },
      "image/vnd.net-fpx": {
        source: "iana",
        extensions: ["npx"]
      },
      "image/vnd.pco.b16": {
        source: "iana",
        extensions: ["b16"]
      },
      "image/vnd.radiance": {
        source: "iana"
      },
      "image/vnd.sealed.png": {
        source: "iana"
      },
      "image/vnd.sealedmedia.softseal.gif": {
        source: "iana"
      },
      "image/vnd.sealedmedia.softseal.jpg": {
        source: "iana"
      },
      "image/vnd.svf": {
        source: "iana"
      },
      "image/vnd.tencent.tap": {
        source: "iana",
        extensions: ["tap"]
      },
      "image/vnd.valve.source.texture": {
        source: "iana",
        extensions: ["vtf"]
      },
      "image/vnd.wap.wbmp": {
        source: "iana",
        extensions: ["wbmp"]
      },
      "image/vnd.xiff": {
        source: "iana",
        extensions: ["xif"]
      },
      "image/vnd.zbrush.pcx": {
        source: "iana",
        extensions: ["pcx"]
      },
      "image/webp": {
        source: "apache",
        extensions: ["webp"]
      },
      "image/wmf": {
        source: "iana",
        extensions: ["wmf"]
      },
      "image/x-3ds": {
        source: "apache",
        extensions: ["3ds"]
      },
      "image/x-cmu-raster": {
        source: "apache",
        extensions: ["ras"]
      },
      "image/x-cmx": {
        source: "apache",
        extensions: ["cmx"]
      },
      "image/x-freehand": {
        source: "apache",
        extensions: ["fh", "fhc", "fh4", "fh5", "fh7"]
      },
      "image/x-icon": {
        source: "apache",
        compressible: true,
        extensions: ["ico"]
      },
      "image/x-jng": {
        source: "nginx",
        extensions: ["jng"]
      },
      "image/x-mrsid-image": {
        source: "apache",
        extensions: ["sid"]
      },
      "image/x-ms-bmp": {
        source: "nginx",
        compressible: true,
        extensions: ["bmp"]
      },
      "image/x-pcx": {
        source: "apache",
        extensions: ["pcx"]
      },
      "image/x-pict": {
        source: "apache",
        extensions: ["pic", "pct"]
      },
      "image/x-portable-anymap": {
        source: "apache",
        extensions: ["pnm"]
      },
      "image/x-portable-bitmap": {
        source: "apache",
        extensions: ["pbm"]
      },
      "image/x-portable-graymap": {
        source: "apache",
        extensions: ["pgm"]
      },
      "image/x-portable-pixmap": {
        source: "apache",
        extensions: ["ppm"]
      },
      "image/x-rgb": {
        source: "apache",
        extensions: ["rgb"]
      },
      "image/x-tga": {
        source: "apache",
        extensions: ["tga"]
      },
      "image/x-xbitmap": {
        source: "apache",
        extensions: ["xbm"]
      },
      "image/x-xcf": {
        compressible: false
      },
      "image/x-xpixmap": {
        source: "apache",
        extensions: ["xpm"]
      },
      "image/x-xwindowdump": {
        source: "apache",
        extensions: ["xwd"]
      },
      "message/cpim": {
        source: "iana"
      },
      "message/delivery-status": {
        source: "iana"
      },
      "message/disposition-notification": {
        source: "iana",
        extensions: [
          "disposition-notification"
        ]
      },
      "message/external-body": {
        source: "iana"
      },
      "message/feedback-report": {
        source: "iana"
      },
      "message/global": {
        source: "iana",
        extensions: ["u8msg"]
      },
      "message/global-delivery-status": {
        source: "iana",
        extensions: ["u8dsn"]
      },
      "message/global-disposition-notification": {
        source: "iana",
        extensions: ["u8mdn"]
      },
      "message/global-headers": {
        source: "iana",
        extensions: ["u8hdr"]
      },
      "message/http": {
        source: "iana",
        compressible: false
      },
      "message/imdn+xml": {
        source: "iana",
        compressible: true
      },
      "message/news": {
        source: "iana"
      },
      "message/partial": {
        source: "iana",
        compressible: false
      },
      "message/rfc822": {
        source: "iana",
        compressible: true,
        extensions: ["eml", "mime"]
      },
      "message/s-http": {
        source: "iana"
      },
      "message/sip": {
        source: "iana"
      },
      "message/sipfrag": {
        source: "iana"
      },
      "message/tracking-status": {
        source: "iana"
      },
      "message/vnd.si.simp": {
        source: "iana"
      },
      "message/vnd.wfa.wsc": {
        source: "iana",
        extensions: ["wsc"]
      },
      "model/3mf": {
        source: "iana",
        extensions: ["3mf"]
      },
      "model/e57": {
        source: "iana"
      },
      "model/gltf+json": {
        source: "iana",
        compressible: true,
        extensions: ["gltf"]
      },
      "model/gltf-binary": {
        source: "iana",
        compressible: true,
        extensions: ["glb"]
      },
      "model/iges": {
        source: "iana",
        compressible: false,
        extensions: ["igs", "iges"]
      },
      "model/mesh": {
        source: "iana",
        compressible: false,
        extensions: ["msh", "mesh", "silo"]
      },
      "model/mtl": {
        source: "iana",
        extensions: ["mtl"]
      },
      "model/obj": {
        source: "iana",
        extensions: ["obj"]
      },
      "model/step": {
        source: "iana"
      },
      "model/step+xml": {
        source: "iana",
        compressible: true,
        extensions: ["stpx"]
      },
      "model/step+zip": {
        source: "iana",
        compressible: false,
        extensions: ["stpz"]
      },
      "model/step-xml+zip": {
        source: "iana",
        compressible: false,
        extensions: ["stpxz"]
      },
      "model/stl": {
        source: "iana",
        extensions: ["stl"]
      },
      "model/vnd.collada+xml": {
        source: "iana",
        compressible: true,
        extensions: ["dae"]
      },
      "model/vnd.dwf": {
        source: "iana",
        extensions: ["dwf"]
      },
      "model/vnd.flatland.3dml": {
        source: "iana"
      },
      "model/vnd.gdl": {
        source: "iana",
        extensions: ["gdl"]
      },
      "model/vnd.gs-gdl": {
        source: "apache"
      },
      "model/vnd.gs.gdl": {
        source: "iana"
      },
      "model/vnd.gtw": {
        source: "iana",
        extensions: ["gtw"]
      },
      "model/vnd.moml+xml": {
        source: "iana",
        compressible: true
      },
      "model/vnd.mts": {
        source: "iana",
        extensions: ["mts"]
      },
      "model/vnd.opengex": {
        source: "iana",
        extensions: ["ogex"]
      },
      "model/vnd.parasolid.transmit.binary": {
        source: "iana",
        extensions: ["x_b"]
      },
      "model/vnd.parasolid.transmit.text": {
        source: "iana",
        extensions: ["x_t"]
      },
      "model/vnd.pytha.pyox": {
        source: "iana"
      },
      "model/vnd.rosette.annotated-data-model": {
        source: "iana"
      },
      "model/vnd.sap.vds": {
        source: "iana",
        extensions: ["vds"]
      },
      "model/vnd.usdz+zip": {
        source: "iana",
        compressible: false,
        extensions: ["usdz"]
      },
      "model/vnd.valve.source.compiled-map": {
        source: "iana",
        extensions: ["bsp"]
      },
      "model/vnd.vtu": {
        source: "iana",
        extensions: ["vtu"]
      },
      "model/vrml": {
        source: "iana",
        compressible: false,
        extensions: ["wrl", "vrml"]
      },
      "model/x3d+binary": {
        source: "apache",
        compressible: false,
        extensions: ["x3db", "x3dbz"]
      },
      "model/x3d+fastinfoset": {
        source: "iana",
        extensions: ["x3db"]
      },
      "model/x3d+vrml": {
        source: "apache",
        compressible: false,
        extensions: ["x3dv", "x3dvz"]
      },
      "model/x3d+xml": {
        source: "iana",
        compressible: true,
        extensions: ["x3d", "x3dz"]
      },
      "model/x3d-vrml": {
        source: "iana",
        extensions: ["x3dv"]
      },
      "multipart/alternative": {
        source: "iana",
        compressible: false
      },
      "multipart/appledouble": {
        source: "iana"
      },
      "multipart/byteranges": {
        source: "iana"
      },
      "multipart/digest": {
        source: "iana"
      },
      "multipart/encrypted": {
        source: "iana",
        compressible: false
      },
      "multipart/form-data": {
        source: "iana",
        compressible: false
      },
      "multipart/header-set": {
        source: "iana"
      },
      "multipart/mixed": {
        source: "iana"
      },
      "multipart/multilingual": {
        source: "iana"
      },
      "multipart/parallel": {
        source: "iana"
      },
      "multipart/related": {
        source: "iana",
        compressible: false
      },
      "multipart/report": {
        source: "iana"
      },
      "multipart/signed": {
        source: "iana",
        compressible: false
      },
      "multipart/vnd.bint.med-plus": {
        source: "iana"
      },
      "multipart/voice-message": {
        source: "iana"
      },
      "multipart/x-mixed-replace": {
        source: "iana"
      },
      "text/1d-interleaved-parityfec": {
        source: "iana"
      },
      "text/cache-manifest": {
        source: "iana",
        compressible: true,
        extensions: ["appcache", "manifest"]
      },
      "text/calendar": {
        source: "iana",
        extensions: ["ics", "ifb"]
      },
      "text/calender": {
        compressible: true
      },
      "text/cmd": {
        compressible: true
      },
      "text/coffeescript": {
        extensions: ["coffee", "litcoffee"]
      },
      "text/cql": {
        source: "iana"
      },
      "text/cql-expression": {
        source: "iana"
      },
      "text/cql-identifier": {
        source: "iana"
      },
      "text/css": {
        source: "iana",
        charset: "UTF-8",
        compressible: true,
        extensions: ["css"]
      },
      "text/csv": {
        source: "iana",
        compressible: true,
        extensions: ["csv"]
      },
      "text/csv-schema": {
        source: "iana"
      },
      "text/directory": {
        source: "iana"
      },
      "text/dns": {
        source: "iana"
      },
      "text/ecmascript": {
        source: "iana"
      },
      "text/encaprtp": {
        source: "iana"
      },
      "text/enriched": {
        source: "iana"
      },
      "text/fhirpath": {
        source: "iana"
      },
      "text/flexfec": {
        source: "iana"
      },
      "text/fwdred": {
        source: "iana"
      },
      "text/gff3": {
        source: "iana"
      },
      "text/grammar-ref-list": {
        source: "iana"
      },
      "text/html": {
        source: "iana",
        compressible: true,
        extensions: ["html", "htm", "shtml"]
      },
      "text/jade": {
        extensions: ["jade"]
      },
      "text/javascript": {
        source: "iana",
        compressible: true
      },
      "text/jcr-cnd": {
        source: "iana"
      },
      "text/jsx": {
        compressible: true,
        extensions: ["jsx"]
      },
      "text/less": {
        compressible: true,
        extensions: ["less"]
      },
      "text/markdown": {
        source: "iana",
        compressible: true,
        extensions: ["markdown", "md"]
      },
      "text/mathml": {
        source: "nginx",
        extensions: ["mml"]
      },
      "text/mdx": {
        compressible: true,
        extensions: ["mdx"]
      },
      "text/mizar": {
        source: "iana"
      },
      "text/n3": {
        source: "iana",
        charset: "UTF-8",
        compressible: true,
        extensions: ["n3"]
      },
      "text/parameters": {
        source: "iana",
        charset: "UTF-8"
      },
      "text/parityfec": {
        source: "iana"
      },
      "text/plain": {
        source: "iana",
        compressible: true,
        extensions: ["txt", "text", "conf", "def", "list", "log", "in", "ini"]
      },
      "text/provenance-notation": {
        source: "iana",
        charset: "UTF-8"
      },
      "text/prs.fallenstein.rst": {
        source: "iana"
      },
      "text/prs.lines.tag": {
        source: "iana",
        extensions: ["dsc"]
      },
      "text/prs.prop.logic": {
        source: "iana"
      },
      "text/raptorfec": {
        source: "iana"
      },
      "text/red": {
        source: "iana"
      },
      "text/rfc822-headers": {
        source: "iana"
      },
      "text/richtext": {
        source: "iana",
        compressible: true,
        extensions: ["rtx"]
      },
      "text/rtf": {
        source: "iana",
        compressible: true,
        extensions: ["rtf"]
      },
      "text/rtp-enc-aescm128": {
        source: "iana"
      },
      "text/rtploopback": {
        source: "iana"
      },
      "text/rtx": {
        source: "iana"
      },
      "text/sgml": {
        source: "iana",
        extensions: ["sgml", "sgm"]
      },
      "text/shaclc": {
        source: "iana"
      },
      "text/shex": {
        source: "iana",
        extensions: ["shex"]
      },
      "text/slim": {
        extensions: ["slim", "slm"]
      },
      "text/spdx": {
        source: "iana",
        extensions: ["spdx"]
      },
      "text/strings": {
        source: "iana"
      },
      "text/stylus": {
        extensions: ["stylus", "styl"]
      },
      "text/t140": {
        source: "iana"
      },
      "text/tab-separated-values": {
        source: "iana",
        compressible: true,
        extensions: ["tsv"]
      },
      "text/troff": {
        source: "iana",
        extensions: ["t", "tr", "roff", "man", "me", "ms"]
      },
      "text/turtle": {
        source: "iana",
        charset: "UTF-8",
        extensions: ["ttl"]
      },
      "text/ulpfec": {
        source: "iana"
      },
      "text/uri-list": {
        source: "iana",
        compressible: true,
        extensions: ["uri", "uris", "urls"]
      },
      "text/vcard": {
        source: "iana",
        compressible: true,
        extensions: ["vcard"]
      },
      "text/vnd.a": {
        source: "iana"
      },
      "text/vnd.abc": {
        source: "iana"
      },
      "text/vnd.ascii-art": {
        source: "iana"
      },
      "text/vnd.curl": {
        source: "iana",
        extensions: ["curl"]
      },
      "text/vnd.curl.dcurl": {
        source: "apache",
        extensions: ["dcurl"]
      },
      "text/vnd.curl.mcurl": {
        source: "apache",
        extensions: ["mcurl"]
      },
      "text/vnd.curl.scurl": {
        source: "apache",
        extensions: ["scurl"]
      },
      "text/vnd.debian.copyright": {
        source: "iana",
        charset: "UTF-8"
      },
      "text/vnd.dmclientscript": {
        source: "iana"
      },
      "text/vnd.dvb.subtitle": {
        source: "iana",
        extensions: ["sub"]
      },
      "text/vnd.esmertec.theme-descriptor": {
        source: "iana",
        charset: "UTF-8"
      },
      "text/vnd.familysearch.gedcom": {
        source: "iana",
        extensions: ["ged"]
      },
      "text/vnd.ficlab.flt": {
        source: "iana"
      },
      "text/vnd.fly": {
        source: "iana",
        extensions: ["fly"]
      },
      "text/vnd.fmi.flexstor": {
        source: "iana",
        extensions: ["flx"]
      },
      "text/vnd.gml": {
        source: "iana"
      },
      "text/vnd.graphviz": {
        source: "iana",
        extensions: ["gv"]
      },
      "text/vnd.hans": {
        source: "iana"
      },
      "text/vnd.hgl": {
        source: "iana"
      },
      "text/vnd.in3d.3dml": {
        source: "iana",
        extensions: ["3dml"]
      },
      "text/vnd.in3d.spot": {
        source: "iana",
        extensions: ["spot"]
      },
      "text/vnd.iptc.newsml": {
        source: "iana"
      },
      "text/vnd.iptc.nitf": {
        source: "iana"
      },
      "text/vnd.latex-z": {
        source: "iana"
      },
      "text/vnd.motorola.reflex": {
        source: "iana"
      },
      "text/vnd.ms-mediapackage": {
        source: "iana"
      },
      "text/vnd.net2phone.commcenter.command": {
        source: "iana"
      },
      "text/vnd.radisys.msml-basic-layout": {
        source: "iana"
      },
      "text/vnd.senx.warpscript": {
        source: "iana"
      },
      "text/vnd.si.uricatalogue": {
        source: "iana"
      },
      "text/vnd.sosi": {
        source: "iana"
      },
      "text/vnd.sun.j2me.app-descriptor": {
        source: "iana",
        charset: "UTF-8",
        extensions: ["jad"]
      },
      "text/vnd.trolltech.linguist": {
        source: "iana",
        charset: "UTF-8"
      },
      "text/vnd.wap.si": {
        source: "iana"
      },
      "text/vnd.wap.sl": {
        source: "iana"
      },
      "text/vnd.wap.wml": {
        source: "iana",
        extensions: ["wml"]
      },
      "text/vnd.wap.wmlscript": {
        source: "iana",
        extensions: ["wmls"]
      },
      "text/vtt": {
        source: "iana",
        charset: "UTF-8",
        compressible: true,
        extensions: ["vtt"]
      },
      "text/x-asm": {
        source: "apache",
        extensions: ["s", "asm"]
      },
      "text/x-c": {
        source: "apache",
        extensions: ["c", "cc", "cxx", "cpp", "h", "hh", "dic"]
      },
      "text/x-component": {
        source: "nginx",
        extensions: ["htc"]
      },
      "text/x-fortran": {
        source: "apache",
        extensions: ["f", "for", "f77", "f90"]
      },
      "text/x-gwt-rpc": {
        compressible: true
      },
      "text/x-handlebars-template": {
        extensions: ["hbs"]
      },
      "text/x-java-source": {
        source: "apache",
        extensions: ["java"]
      },
      "text/x-jquery-tmpl": {
        compressible: true
      },
      "text/x-lua": {
        extensions: ["lua"]
      },
      "text/x-markdown": {
        compressible: true,
        extensions: ["mkd"]
      },
      "text/x-nfo": {
        source: "apache",
        extensions: ["nfo"]
      },
      "text/x-opml": {
        source: "apache",
        extensions: ["opml"]
      },
      "text/x-org": {
        compressible: true,
        extensions: ["org"]
      },
      "text/x-pascal": {
        source: "apache",
        extensions: ["p", "pas"]
      },
      "text/x-processing": {
        compressible: true,
        extensions: ["pde"]
      },
      "text/x-sass": {
        extensions: ["sass"]
      },
      "text/x-scss": {
        extensions: ["scss"]
      },
      "text/x-setext": {
        source: "apache",
        extensions: ["etx"]
      },
      "text/x-sfv": {
        source: "apache",
        extensions: ["sfv"]
      },
      "text/x-suse-ymp": {
        compressible: true,
        extensions: ["ymp"]
      },
      "text/x-uuencode": {
        source: "apache",
        extensions: ["uu"]
      },
      "text/x-vcalendar": {
        source: "apache",
        extensions: ["vcs"]
      },
      "text/x-vcard": {
        source: "apache",
        extensions: ["vcf"]
      },
      "text/xml": {
        source: "iana",
        compressible: true,
        extensions: ["xml"]
      },
      "text/xml-external-parsed-entity": {
        source: "iana"
      },
      "text/yaml": {
        compressible: true,
        extensions: ["yaml", "yml"]
      },
      "video/1d-interleaved-parityfec": {
        source: "iana"
      },
      "video/3gpp": {
        source: "iana",
        extensions: ["3gp", "3gpp"]
      },
      "video/3gpp-tt": {
        source: "iana"
      },
      "video/3gpp2": {
        source: "iana",
        extensions: ["3g2"]
      },
      "video/av1": {
        source: "iana"
      },
      "video/bmpeg": {
        source: "iana"
      },
      "video/bt656": {
        source: "iana"
      },
      "video/celb": {
        source: "iana"
      },
      "video/dv": {
        source: "iana"
      },
      "video/encaprtp": {
        source: "iana"
      },
      "video/ffv1": {
        source: "iana"
      },
      "video/flexfec": {
        source: "iana"
      },
      "video/h261": {
        source: "iana",
        extensions: ["h261"]
      },
      "video/h263": {
        source: "iana",
        extensions: ["h263"]
      },
      "video/h263-1998": {
        source: "iana"
      },
      "video/h263-2000": {
        source: "iana"
      },
      "video/h264": {
        source: "iana",
        extensions: ["h264"]
      },
      "video/h264-rcdo": {
        source: "iana"
      },
      "video/h264-svc": {
        source: "iana"
      },
      "video/h265": {
        source: "iana"
      },
      "video/iso.segment": {
        source: "iana",
        extensions: ["m4s"]
      },
      "video/jpeg": {
        source: "iana",
        extensions: ["jpgv"]
      },
      "video/jpeg2000": {
        source: "iana"
      },
      "video/jpm": {
        source: "apache",
        extensions: ["jpm", "jpgm"]
      },
      "video/jxsv": {
        source: "iana"
      },
      "video/mj2": {
        source: "iana",
        extensions: ["mj2", "mjp2"]
      },
      "video/mp1s": {
        source: "iana"
      },
      "video/mp2p": {
        source: "iana"
      },
      "video/mp2t": {
        source: "iana",
        extensions: ["ts"]
      },
      "video/mp4": {
        source: "iana",
        compressible: false,
        extensions: ["mp4", "mp4v", "mpg4"]
      },
      "video/mp4v-es": {
        source: "iana"
      },
      "video/mpeg": {
        source: "iana",
        compressible: false,
        extensions: ["mpeg", "mpg", "mpe", "m1v", "m2v"]
      },
      "video/mpeg4-generic": {
        source: "iana"
      },
      "video/mpv": {
        source: "iana"
      },
      "video/nv": {
        source: "iana"
      },
      "video/ogg": {
        source: "iana",
        compressible: false,
        extensions: ["ogv"]
      },
      "video/parityfec": {
        source: "iana"
      },
      "video/pointer": {
        source: "iana"
      },
      "video/quicktime": {
        source: "iana",
        compressible: false,
        extensions: ["qt", "mov"]
      },
      "video/raptorfec": {
        source: "iana"
      },
      "video/raw": {
        source: "iana"
      },
      "video/rtp-enc-aescm128": {
        source: "iana"
      },
      "video/rtploopback": {
        source: "iana"
      },
      "video/rtx": {
        source: "iana"
      },
      "video/scip": {
        source: "iana"
      },
      "video/smpte291": {
        source: "iana"
      },
      "video/smpte292m": {
        source: "iana"
      },
      "video/ulpfec": {
        source: "iana"
      },
      "video/vc1": {
        source: "iana"
      },
      "video/vc2": {
        source: "iana"
      },
      "video/vnd.cctv": {
        source: "iana"
      },
      "video/vnd.dece.hd": {
        source: "iana",
        extensions: ["uvh", "uvvh"]
      },
      "video/vnd.dece.mobile": {
        source: "iana",
        extensions: ["uvm", "uvvm"]
      },
      "video/vnd.dece.mp4": {
        source: "iana"
      },
      "video/vnd.dece.pd": {
        source: "iana",
        extensions: ["uvp", "uvvp"]
      },
      "video/vnd.dece.sd": {
        source: "iana",
        extensions: ["uvs", "uvvs"]
      },
      "video/vnd.dece.video": {
        source: "iana",
        extensions: ["uvv", "uvvv"]
      },
      "video/vnd.directv.mpeg": {
        source: "iana"
      },
      "video/vnd.directv.mpeg-tts": {
        source: "iana"
      },
      "video/vnd.dlna.mpeg-tts": {
        source: "iana"
      },
      "video/vnd.dvb.file": {
        source: "iana",
        extensions: ["dvb"]
      },
      "video/vnd.fvt": {
        source: "iana",
        extensions: ["fvt"]
      },
      "video/vnd.hns.video": {
        source: "iana"
      },
      "video/vnd.iptvforum.1dparityfec-1010": {
        source: "iana"
      },
      "video/vnd.iptvforum.1dparityfec-2005": {
        source: "iana"
      },
      "video/vnd.iptvforum.2dparityfec-1010": {
        source: "iana"
      },
      "video/vnd.iptvforum.2dparityfec-2005": {
        source: "iana"
      },
      "video/vnd.iptvforum.ttsavc": {
        source: "iana"
      },
      "video/vnd.iptvforum.ttsmpeg2": {
        source: "iana"
      },
      "video/vnd.motorola.video": {
        source: "iana"
      },
      "video/vnd.motorola.videop": {
        source: "iana"
      },
      "video/vnd.mpegurl": {
        source: "iana",
        extensions: ["mxu", "m4u"]
      },
      "video/vnd.ms-playready.media.pyv": {
        source: "iana",
        extensions: ["pyv"]
      },
      "video/vnd.nokia.interleaved-multimedia": {
        source: "iana"
      },
      "video/vnd.nokia.mp4vr": {
        source: "iana"
      },
      "video/vnd.nokia.videovoip": {
        source: "iana"
      },
      "video/vnd.objectvideo": {
        source: "iana"
      },
      "video/vnd.radgamettools.bink": {
        source: "iana"
      },
      "video/vnd.radgamettools.smacker": {
        source: "iana"
      },
      "video/vnd.sealed.mpeg1": {
        source: "iana"
      },
      "video/vnd.sealed.mpeg4": {
        source: "iana"
      },
      "video/vnd.sealed.swf": {
        source: "iana"
      },
      "video/vnd.sealedmedia.softseal.mov": {
        source: "iana"
      },
      "video/vnd.uvvu.mp4": {
        source: "iana",
        extensions: ["uvu", "uvvu"]
      },
      "video/vnd.vivo": {
        source: "iana",
        extensions: ["viv"]
      },
      "video/vnd.youtube.yt": {
        source: "iana"
      },
      "video/vp8": {
        source: "iana"
      },
      "video/vp9": {
        source: "iana"
      },
      "video/webm": {
        source: "apache",
        compressible: false,
        extensions: ["webm"]
      },
      "video/x-f4v": {
        source: "apache",
        extensions: ["f4v"]
      },
      "video/x-fli": {
        source: "apache",
        extensions: ["fli"]
      },
      "video/x-flv": {
        source: "apache",
        compressible: false,
        extensions: ["flv"]
      },
      "video/x-m4v": {
        source: "apache",
        extensions: ["m4v"]
      },
      "video/x-matroska": {
        source: "apache",
        compressible: false,
        extensions: ["mkv", "mk3d", "mks"]
      },
      "video/x-mng": {
        source: "apache",
        extensions: ["mng"]
      },
      "video/x-ms-asf": {
        source: "apache",
        extensions: ["asf", "asx"]
      },
      "video/x-ms-vob": {
        source: "apache",
        extensions: ["vob"]
      },
      "video/x-ms-wm": {
        source: "apache",
        extensions: ["wm"]
      },
      "video/x-ms-wmv": {
        source: "apache",
        compressible: false,
        extensions: ["wmv"]
      },
      "video/x-ms-wmx": {
        source: "apache",
        extensions: ["wmx"]
      },
      "video/x-ms-wvx": {
        source: "apache",
        extensions: ["wvx"]
      },
      "video/x-msvideo": {
        source: "apache",
        extensions: ["avi"]
      },
      "video/x-sgi-movie": {
        source: "apache",
        extensions: ["movie"]
      },
      "video/x-smv": {
        source: "apache",
        extensions: ["smv"]
      },
      "x-conference/x-cooltalk": {
        source: "apache",
        extensions: ["ice"]
      },
      "x-shader/x-fragment": {
        compressible: true
      },
      "x-shader/x-vertex": {
        compressible: true
      }
    };
  }
});

// apps/backend/src/layers/dependencyLayer/nodejs/node_modules/mime-db/index.js
var require_mime_db = __commonJS({
  "apps/backend/src/layers/dependencyLayer/nodejs/node_modules/mime-db/index.js"(exports, module) {
    module.exports = require_db();
  }
});

// apps/backend/src/layers/dependencyLayer/nodejs/node_modules/mime-types/index.js
var require_mime_types = __commonJS({
  "apps/backend/src/layers/dependencyLayer/nodejs/node_modules/mime-types/index.js"(exports) {
    "use strict";
    var db = require_mime_db();
    var extname = __require("path").extname;
    var EXTRACT_TYPE_REGEXP = /^\s*([^;\s]*)(?:;|\s|$)/;
    var TEXT_TYPE_REGEXP = /^text\//i;
    exports.charset = charset;
    exports.charsets = { lookup: charset };
    exports.contentType = contentType;
    exports.extension = extension;
    exports.extensions = /* @__PURE__ */ Object.create(null);
    exports.lookup = lookup;
    exports.types = /* @__PURE__ */ Object.create(null);
    populateMaps(exports.extensions, exports.types);
    function charset(type) {
      if (!type || typeof type !== "string") {
        return false;
      }
      var match = EXTRACT_TYPE_REGEXP.exec(type);
      var mime = match && db[match[1].toLowerCase()];
      if (mime && mime.charset) {
        return mime.charset;
      }
      if (match && TEXT_TYPE_REGEXP.test(match[1])) {
        return "UTF-8";
      }
      return false;
    }
    function contentType(str) {
      if (!str || typeof str !== "string") {
        return false;
      }
      var mime = str.indexOf("/") === -1 ? exports.lookup(str) : str;
      if (!mime) {
        return false;
      }
      if (mime.indexOf("charset") === -1) {
        var charset2 = exports.charset(mime);
        if (charset2)
          mime += "; charset=" + charset2.toLowerCase();
      }
      return mime;
    }
    function extension(type) {
      if (!type || typeof type !== "string") {
        return false;
      }
      var match = EXTRACT_TYPE_REGEXP.exec(type);
      var exts = match && exports.extensions[match[1].toLowerCase()];
      if (!exts || !exts.length) {
        return false;
      }
      return exts[0];
    }
    function lookup(path) {
      if (!path || typeof path !== "string") {
        return false;
      }
      var extension2 = extname("x." + path).toLowerCase().substr(1);
      if (!extension2) {
        return false;
      }
      return exports.types[extension2] || false;
    }
    function populateMaps(extensions, types) {
      var preference = ["nginx", "apache", void 0, "iana"];
      Object.keys(db).forEach(function forEachMimeType(type) {
        var mime = db[type];
        var exts = mime.extensions;
        if (!exts || !exts.length) {
          return;
        }
        extensions[type] = exts;
        for (var i = 0; i < exts.length; i++) {
          var extension2 = exts[i];
          if (types[extension2]) {
            var from = preference.indexOf(db[types[extension2]].source);
            var to = preference.indexOf(mime.source);
            if (types[extension2] !== "application/octet-stream" && (from > to || from === to && types[extension2].substr(0, 12) === "application/")) {
              continue;
            }
          }
          types[extension2] = type;
        }
      });
    }
  }
});

// apps/backend/src/layers/dependencyLayer/nodejs/node_modules/asynckit/lib/defer.js
var require_defer = __commonJS({
  "apps/backend/src/layers/dependencyLayer/nodejs/node_modules/asynckit/lib/defer.js"(exports, module) {
    module.exports = defer;
    function defer(fn) {
      var nextTick = typeof setImmediate == "function" ? setImmediate : typeof process == "object" && typeof process.nextTick == "function" ? process.nextTick : null;
      if (nextTick) {
        nextTick(fn);
      } else {
        setTimeout(fn, 0);
      }
    }
  }
});

// apps/backend/src/layers/dependencyLayer/nodejs/node_modules/asynckit/lib/async.js
var require_async = __commonJS({
  "apps/backend/src/layers/dependencyLayer/nodejs/node_modules/asynckit/lib/async.js"(exports, module) {
    var defer = require_defer();
    module.exports = async;
    function async(callback) {
      var isAsync = false;
      defer(function() {
        isAsync = true;
      });
      return function async_callback(err, result) {
        if (isAsync) {
          callback(err, result);
        } else {
          defer(function nextTick_callback() {
            callback(err, result);
          });
        }
      };
    }
  }
});

// apps/backend/src/layers/dependencyLayer/nodejs/node_modules/asynckit/lib/abort.js
var require_abort = __commonJS({
  "apps/backend/src/layers/dependencyLayer/nodejs/node_modules/asynckit/lib/abort.js"(exports, module) {
    module.exports = abort;
    function abort(state) {
      Object.keys(state.jobs).forEach(clean.bind(state));
      state.jobs = {};
    }
    function clean(key) {
      if (typeof this.jobs[key] == "function") {
        this.jobs[key]();
      }
    }
  }
});

// apps/backend/src/layers/dependencyLayer/nodejs/node_modules/asynckit/lib/iterate.js
var require_iterate = __commonJS({
  "apps/backend/src/layers/dependencyLayer/nodejs/node_modules/asynckit/lib/iterate.js"(exports, module) {
    var async = require_async();
    var abort = require_abort();
    module.exports = iterate;
    function iterate(list, iterator, state, callback) {
      var key = state["keyedList"] ? state["keyedList"][state.index] : state.index;
      state.jobs[key] = runJob(iterator, key, list[key], function(error, output) {
        if (!(key in state.jobs)) {
          return;
        }
        delete state.jobs[key];
        if (error) {
          abort(state);
        } else {
          state.results[key] = output;
        }
        callback(error, state.results);
      });
    }
    function runJob(iterator, key, item, callback) {
      var aborter;
      if (iterator.length == 2) {
        aborter = iterator(item, async(callback));
      } else {
        aborter = iterator(item, key, async(callback));
      }
      return aborter;
    }
  }
});

// apps/backend/src/layers/dependencyLayer/nodejs/node_modules/asynckit/lib/state.js
var require_state = __commonJS({
  "apps/backend/src/layers/dependencyLayer/nodejs/node_modules/asynckit/lib/state.js"(exports, module) {
    module.exports = state;
    function state(list, sortMethod) {
      var isNamedList = !Array.isArray(list), initState = {
        index: 0,
        keyedList: isNamedList || sortMethod ? Object.keys(list) : null,
        jobs: {},
        results: isNamedList ? {} : [],
        size: isNamedList ? Object.keys(list).length : list.length
      };
      if (sortMethod) {
        initState.keyedList.sort(isNamedList ? sortMethod : function(a, b) {
          return sortMethod(list[a], list[b]);
        });
      }
      return initState;
    }
  }
});

// apps/backend/src/layers/dependencyLayer/nodejs/node_modules/asynckit/lib/terminator.js
var require_terminator = __commonJS({
  "apps/backend/src/layers/dependencyLayer/nodejs/node_modules/asynckit/lib/terminator.js"(exports, module) {
    var abort = require_abort();
    var async = require_async();
    module.exports = terminator;
    function terminator(callback) {
      if (!Object.keys(this.jobs).length) {
        return;
      }
      this.index = this.size;
      abort(this);
      async(callback)(null, this.results);
    }
  }
});

// apps/backend/src/layers/dependencyLayer/nodejs/node_modules/asynckit/parallel.js
var require_parallel = __commonJS({
  "apps/backend/src/layers/dependencyLayer/nodejs/node_modules/asynckit/parallel.js"(exports, module) {
    var iterate = require_iterate();
    var initState = require_state();
    var terminator = require_terminator();
    module.exports = parallel;
    function parallel(list, iterator, callback) {
      var state = initState(list);
      while (state.index < (state["keyedList"] || list).length) {
        iterate(list, iterator, state, function(error, result) {
          if (error) {
            callback(error, result);
            return;
          }
          if (Object.keys(state.jobs).length === 0) {
            callback(null, state.results);
            return;
          }
        });
        state.index++;
      }
      return terminator.bind(state, callback);
    }
  }
});

// apps/backend/src/layers/dependencyLayer/nodejs/node_modules/asynckit/serialOrdered.js
var require_serialOrdered = __commonJS({
  "apps/backend/src/layers/dependencyLayer/nodejs/node_modules/asynckit/serialOrdered.js"(exports, module) {
    var iterate = require_iterate();
    var initState = require_state();
    var terminator = require_terminator();
    module.exports = serialOrdered;
    module.exports.ascending = ascending;
    module.exports.descending = descending;
    function serialOrdered(list, iterator, sortMethod, callback) {
      var state = initState(list, sortMethod);
      iterate(list, iterator, state, function iteratorHandler(error, result) {
        if (error) {
          callback(error, result);
          return;
        }
        state.index++;
        if (state.index < (state["keyedList"] || list).length) {
          iterate(list, iterator, state, iteratorHandler);
          return;
        }
        callback(null, state.results);
      });
      return terminator.bind(state, callback);
    }
    function ascending(a, b) {
      return a < b ? -1 : a > b ? 1 : 0;
    }
    function descending(a, b) {
      return -1 * ascending(a, b);
    }
  }
});

// apps/backend/src/layers/dependencyLayer/nodejs/node_modules/asynckit/serial.js
var require_serial = __commonJS({
  "apps/backend/src/layers/dependencyLayer/nodejs/node_modules/asynckit/serial.js"(exports, module) {
    var serialOrdered = require_serialOrdered();
    module.exports = serial;
    function serial(list, iterator, callback) {
      return serialOrdered(list, iterator, null, callback);
    }
  }
});

// apps/backend/src/layers/dependencyLayer/nodejs/node_modules/asynckit/index.js
var require_asynckit = __commonJS({
  "apps/backend/src/layers/dependencyLayer/nodejs/node_modules/asynckit/index.js"(exports, module) {
    module.exports = {
      parallel: require_parallel(),
      serial: require_serial(),
      serialOrdered: require_serialOrdered()
    };
  }
});

// apps/backend/src/layers/dependencyLayer/nodejs/node_modules/form-data/lib/populate.js
var require_populate = __commonJS({
  "apps/backend/src/layers/dependencyLayer/nodejs/node_modules/form-data/lib/populate.js"(exports, module) {
    module.exports = function(dst, src) {
      Object.keys(src).forEach(function(prop) {
        dst[prop] = dst[prop] || src[prop];
      });
      return dst;
    };
  }
});

// apps/backend/src/layers/dependencyLayer/nodejs/node_modules/form-data/lib/form_data.js
var require_form_data = __commonJS({
  "apps/backend/src/layers/dependencyLayer/nodejs/node_modules/form-data/lib/form_data.js"(exports, module) {
    var CombinedStream = require_combined_stream();
    var util3 = __require("util");
    var path = __require("path");
    var http2 = __require("http");
    var https2 = __require("https");
    var parseUrl = __require("url").parse;
    var fs = __require("fs");
    var Stream = __require("stream").Stream;
    var mime = require_mime_types();
    var asynckit = require_asynckit();
    var populate = require_populate();
    module.exports = FormData3;
    util3.inherits(FormData3, CombinedStream);
    function FormData3(options) {
      if (!(this instanceof FormData3)) {
        return new FormData3(options);
      }
      this._overheadLength = 0;
      this._valueLength = 0;
      this._valuesToMeasure = [];
      CombinedStream.call(this);
      options = options || {};
      for (var option in options) {
        this[option] = options[option];
      }
    }
    FormData3.LINE_BREAK = "\r\n";
    FormData3.DEFAULT_CONTENT_TYPE = "application/octet-stream";
    FormData3.prototype.append = function(field, value, options) {
      options = options || {};
      if (typeof options == "string") {
        options = { filename: options };
      }
      var append2 = CombinedStream.prototype.append.bind(this);
      if (typeof value == "number") {
        value = "" + value;
      }
      if (util3.isArray(value)) {
        this._error(new Error("Arrays are not supported."));
        return;
      }
      var header = this._multiPartHeader(field, value, options);
      var footer = this._multiPartFooter();
      append2(header);
      append2(value);
      append2(footer);
      this._trackLength(header, value, options);
    };
    FormData3.prototype._trackLength = function(header, value, options) {
      var valueLength = 0;
      if (options.knownLength != null) {
        valueLength += +options.knownLength;
      } else if (Buffer.isBuffer(value)) {
        valueLength = value.length;
      } else if (typeof value === "string") {
        valueLength = Buffer.byteLength(value);
      }
      this._valueLength += valueLength;
      this._overheadLength += Buffer.byteLength(header) + FormData3.LINE_BREAK.length;
      if (!value || !value.path && !(value.readable && value.hasOwnProperty("httpVersion")) && !(value instanceof Stream)) {
        return;
      }
      if (!options.knownLength) {
        this._valuesToMeasure.push(value);
      }
    };
    FormData3.prototype._lengthRetriever = function(value, callback) {
      if (value.hasOwnProperty("fd")) {
        if (value.end != void 0 && value.end != Infinity && value.start != void 0) {
          callback(null, value.end + 1 - (value.start ? value.start : 0));
        } else {
          fs.stat(value.path, function(err, stat) {
            var fileSize;
            if (err) {
              callback(err);
              return;
            }
            fileSize = stat.size - (value.start ? value.start : 0);
            callback(null, fileSize);
          });
        }
      } else if (value.hasOwnProperty("httpVersion")) {
        callback(null, +value.headers["content-length"]);
      } else if (value.hasOwnProperty("httpModule")) {
        value.on("response", function(response2) {
          value.pause();
          callback(null, +response2.headers["content-length"]);
        });
        value.resume();
      } else {
        callback("Unknown stream");
      }
    };
    FormData3.prototype._multiPartHeader = function(field, value, options) {
      if (typeof options.header == "string") {
        return options.header;
      }
      var contentDisposition = this._getContentDisposition(value, options);
      var contentType = this._getContentType(value, options);
      var contents = "";
      var headers = {
        // add custom disposition as third element or keep it two elements if not
        "Content-Disposition": ["form-data", 'name="' + field + '"'].concat(contentDisposition || []),
        // if no content type. allow it to be empty array
        "Content-Type": [].concat(contentType || [])
      };
      if (typeof options.header == "object") {
        populate(headers, options.header);
      }
      var header;
      for (var prop in headers) {
        if (!headers.hasOwnProperty(prop))
          continue;
        header = headers[prop];
        if (header == null) {
          continue;
        }
        if (!Array.isArray(header)) {
          header = [header];
        }
        if (header.length) {
          contents += prop + ": " + header.join("; ") + FormData3.LINE_BREAK;
        }
      }
      return "--" + this.getBoundary() + FormData3.LINE_BREAK + contents + FormData3.LINE_BREAK;
    };
    FormData3.prototype._getContentDisposition = function(value, options) {
      var filename, contentDisposition;
      if (typeof options.filepath === "string") {
        filename = path.normalize(options.filepath).replace(/\\/g, "/");
      } else if (options.filename || value.name || value.path) {
        filename = path.basename(options.filename || value.name || value.path);
      } else if (value.readable && value.hasOwnProperty("httpVersion")) {
        filename = path.basename(value.client._httpMessage.path || "");
      }
      if (filename) {
        contentDisposition = 'filename="' + filename + '"';
      }
      return contentDisposition;
    };
    FormData3.prototype._getContentType = function(value, options) {
      var contentType = options.contentType;
      if (!contentType && value.name) {
        contentType = mime.lookup(value.name);
      }
      if (!contentType && value.path) {
        contentType = mime.lookup(value.path);
      }
      if (!contentType && value.readable && value.hasOwnProperty("httpVersion")) {
        contentType = value.headers["content-type"];
      }
      if (!contentType && (options.filepath || options.filename)) {
        contentType = mime.lookup(options.filepath || options.filename);
      }
      if (!contentType && typeof value == "object") {
        contentType = FormData3.DEFAULT_CONTENT_TYPE;
      }
      return contentType;
    };
    FormData3.prototype._multiPartFooter = function() {
      return function(next) {
        var footer = FormData3.LINE_BREAK;
        var lastPart = this._streams.length === 0;
        if (lastPart) {
          footer += this._lastBoundary();
        }
        next(footer);
      }.bind(this);
    };
    FormData3.prototype._lastBoundary = function() {
      return "--" + this.getBoundary() + "--" + FormData3.LINE_BREAK;
    };
    FormData3.prototype.getHeaders = function(userHeaders) {
      var header;
      var formHeaders = {
        "content-type": "multipart/form-data; boundary=" + this.getBoundary()
      };
      for (header in userHeaders) {
        if (userHeaders.hasOwnProperty(header)) {
          formHeaders[header.toLowerCase()] = userHeaders[header];
        }
      }
      return formHeaders;
    };
    FormData3.prototype.setBoundary = function(boundary) {
      this._boundary = boundary;
    };
    FormData3.prototype.getBoundary = function() {
      if (!this._boundary) {
        this._generateBoundary();
      }
      return this._boundary;
    };
    FormData3.prototype.getBuffer = function() {
      var dataBuffer = new Buffer.alloc(0);
      var boundary = this.getBoundary();
      for (var i = 0, len = this._streams.length; i < len; i++) {
        if (typeof this._streams[i] !== "function") {
          if (Buffer.isBuffer(this._streams[i])) {
            dataBuffer = Buffer.concat([dataBuffer, this._streams[i]]);
          } else {
            dataBuffer = Buffer.concat([dataBuffer, Buffer.from(this._streams[i])]);
          }
          if (typeof this._streams[i] !== "string" || this._streams[i].substring(2, boundary.length + 2) !== boundary) {
            dataBuffer = Buffer.concat([dataBuffer, Buffer.from(FormData3.LINE_BREAK)]);
          }
        }
      }
      return Buffer.concat([dataBuffer, Buffer.from(this._lastBoundary())]);
    };
    FormData3.prototype._generateBoundary = function() {
      var boundary = "--------------------------";
      for (var i = 0; i < 24; i++) {
        boundary += Math.floor(Math.random() * 10).toString(16);
      }
      this._boundary = boundary;
    };
    FormData3.prototype.getLengthSync = function() {
      var knownLength = this._overheadLength + this._valueLength;
      if (this._streams.length) {
        knownLength += this._lastBoundary().length;
      }
      if (!this.hasKnownLength()) {
        this._error(new Error("Cannot calculate proper length in synchronous way."));
      }
      return knownLength;
    };
    FormData3.prototype.hasKnownLength = function() {
      var hasKnownLength = true;
      if (this._valuesToMeasure.length) {
        hasKnownLength = false;
      }
      return hasKnownLength;
    };
    FormData3.prototype.getLength = function(cb) {
      var knownLength = this._overheadLength + this._valueLength;
      if (this._streams.length) {
        knownLength += this._lastBoundary().length;
      }
      if (!this._valuesToMeasure.length) {
        process.nextTick(cb.bind(this, null, knownLength));
        return;
      }
      asynckit.parallel(this._valuesToMeasure, this._lengthRetriever, function(err, values) {
        if (err) {
          cb(err);
          return;
        }
        values.forEach(function(length) {
          knownLength += length;
        });
        cb(null, knownLength);
      });
    };
    FormData3.prototype.submit = function(params, cb) {
      var request2, options, defaults2 = { method: "post" };
      if (typeof params == "string") {
        params = parseUrl(params);
        options = populate({
          port: params.port,
          path: params.pathname,
          host: params.hostname,
          protocol: params.protocol
        }, defaults2);
      } else {
        options = populate(params, defaults2);
        if (!options.port) {
          options.port = options.protocol == "https:" ? 443 : 80;
        }
      }
      options.headers = this.getHeaders(params.headers);
      if (options.protocol == "https:") {
        request2 = https2.request(options);
      } else {
        request2 = http2.request(options);
      }
      this.getLength(function(err, length) {
        if (err && err !== "Unknown stream") {
          this._error(err);
          return;
        }
        if (length) {
          request2.setHeader("Content-Length", length);
        }
        this.pipe(request2);
        if (cb) {
          var onResponse;
          var callback = function(error, responce) {
            request2.removeListener("error", callback);
            request2.removeListener("response", onResponse);
            return cb.call(this, error, responce);
          };
          onResponse = callback.bind(this, null);
          request2.on("error", callback);
          request2.on("response", onResponse);
        }
      }.bind(this));
      return request2;
    };
    FormData3.prototype._error = function(err) {
      if (!this.error) {
        this.error = err;
        this.pause();
        this.emit("error", err);
      }
    };
    FormData3.prototype.toString = function() {
      return "[object FormData]";
    };
  }
});

// apps/backend/src/layers/dependencyLayer/nodejs/node_modules/proxy-from-env/index.js
var require_proxy_from_env = __commonJS({
  "apps/backend/src/layers/dependencyLayer/nodejs/node_modules/proxy-from-env/index.js"(exports) {
    "use strict";
    var parseUrl = __require("url").parse;
    var DEFAULT_PORTS = {
      ftp: 21,
      gopher: 70,
      http: 80,
      https: 443,
      ws: 80,
      wss: 443
    };
    var stringEndsWith = String.prototype.endsWith || function(s) {
      return s.length <= this.length && this.indexOf(s, this.length - s.length) !== -1;
    };
    function getProxyForUrl2(url2) {
      var parsedUrl = typeof url2 === "string" ? parseUrl(url2) : url2 || {};
      var proto = parsedUrl.protocol;
      var hostname = parsedUrl.host;
      var port = parsedUrl.port;
      if (typeof hostname !== "string" || !hostname || typeof proto !== "string") {
        return "";
      }
      proto = proto.split(":", 1)[0];
      hostname = hostname.replace(/:\d*$/, "");
      port = parseInt(port) || DEFAULT_PORTS[proto] || 0;
      if (!shouldProxy(hostname, port)) {
        return "";
      }
      var proxy = getEnv("npm_config_" + proto + "_proxy") || getEnv(proto + "_proxy") || getEnv("npm_config_proxy") || getEnv("all_proxy");
      if (proxy && proxy.indexOf("://") === -1) {
        proxy = proto + "://" + proxy;
      }
      return proxy;
    }
    function shouldProxy(hostname, port) {
      var NO_PROXY = (getEnv("npm_config_no_proxy") || getEnv("no_proxy")).toLowerCase();
      if (!NO_PROXY) {
        return true;
      }
      if (NO_PROXY === "*") {
        return false;
      }
      return NO_PROXY.split(/[,\s]/).every(function(proxy) {
        if (!proxy) {
          return true;
        }
        var parsedProxy = proxy.match(/^(.+):(\d+)$/);
        var parsedProxyHostname = parsedProxy ? parsedProxy[1] : proxy;
        var parsedProxyPort = parsedProxy ? parseInt(parsedProxy[2]) : 0;
        if (parsedProxyPort && parsedProxyPort !== port) {
          return true;
        }
        if (!/^[.*]/.test(parsedProxyHostname)) {
          return hostname !== parsedProxyHostname;
        }
        if (parsedProxyHostname.charAt(0) === "*") {
          parsedProxyHostname = parsedProxyHostname.slice(1);
        }
        return !stringEndsWith.call(hostname, parsedProxyHostname);
      });
    }
    function getEnv(key) {
      return process.env[key.toLowerCase()] || process.env[key.toUpperCase()] || "";
    }
    exports.getProxyForUrl = getProxyForUrl2;
  }
});

// apps/backend/src/layers/dependencyLayer/nodejs/node_modules/ms/index.js
var require_ms = __commonJS({
  "apps/backend/src/layers/dependencyLayer/nodejs/node_modules/ms/index.js"(exports, module) {
    var s = 1e3;
    var m = s * 60;
    var h = m * 60;
    var d = h * 24;
    var w = d * 7;
    var y = d * 365.25;
    module.exports = function(val, options) {
      options = options || {};
      var type = typeof val;
      if (type === "string" && val.length > 0) {
        return parse(val);
      } else if (type === "number" && isFinite(val)) {
        return options.long ? fmtLong(val) : fmtShort(val);
      }
      throw new Error(
        "val is not a non-empty string or a valid number. val=" + JSON.stringify(val)
      );
    };
    function parse(str) {
      str = String(str);
      if (str.length > 100) {
        return;
      }
      var match = /^(-?(?:\d+)?\.?\d+) *(milliseconds?|msecs?|ms|seconds?|secs?|s|minutes?|mins?|m|hours?|hrs?|h|days?|d|weeks?|w|years?|yrs?|y)?$/i.exec(
        str
      );
      if (!match) {
        return;
      }
      var n = parseFloat(match[1]);
      var type = (match[2] || "ms").toLowerCase();
      switch (type) {
        case "years":
        case "year":
        case "yrs":
        case "yr":
        case "y":
          return n * y;
        case "weeks":
        case "week":
        case "w":
          return n * w;
        case "days":
        case "day":
        case "d":
          return n * d;
        case "hours":
        case "hour":
        case "hrs":
        case "hr":
        case "h":
          return n * h;
        case "minutes":
        case "minute":
        case "mins":
        case "min":
        case "m":
          return n * m;
        case "seconds":
        case "second":
        case "secs":
        case "sec":
        case "s":
          return n * s;
        case "milliseconds":
        case "millisecond":
        case "msecs":
        case "msec":
        case "ms":
          return n;
        default:
          return void 0;
      }
    }
    function fmtShort(ms) {
      var msAbs = Math.abs(ms);
      if (msAbs >= d) {
        return Math.round(ms / d) + "d";
      }
      if (msAbs >= h) {
        return Math.round(ms / h) + "h";
      }
      if (msAbs >= m) {
        return Math.round(ms / m) + "m";
      }
      if (msAbs >= s) {
        return Math.round(ms / s) + "s";
      }
      return ms + "ms";
    }
    function fmtLong(ms) {
      var msAbs = Math.abs(ms);
      if (msAbs >= d) {
        return plural(ms, msAbs, d, "day");
      }
      if (msAbs >= h) {
        return plural(ms, msAbs, h, "hour");
      }
      if (msAbs >= m) {
        return plural(ms, msAbs, m, "minute");
      }
      if (msAbs >= s) {
        return plural(ms, msAbs, s, "second");
      }
      return ms + " ms";
    }
    function plural(ms, msAbs, n, name) {
      var isPlural = msAbs >= n * 1.5;
      return Math.round(ms / n) + " " + name + (isPlural ? "s" : "");
    }
  }
});

// apps/backend/src/layers/dependencyLayer/nodejs/node_modules/debug/src/debug.js
var require_debug = __commonJS({
  "apps/backend/src/layers/dependencyLayer/nodejs/node_modules/debug/src/debug.js"(exports, module) {
    exports = module.exports = createDebug.debug = createDebug["default"] = createDebug;
    exports.coerce = coerce;
    exports.disable = disable;
    exports.enable = enable;
    exports.enabled = enabled;
    exports.humanize = require_ms();
    exports.names = [];
    exports.skips = [];
    exports.formatters = {};
    var prevTime;
    function selectColor(namespace) {
      var hash = 0, i;
      for (i in namespace) {
        hash = (hash << 5) - hash + namespace.charCodeAt(i);
        hash |= 0;
      }
      return exports.colors[Math.abs(hash) % exports.colors.length];
    }
    function createDebug(namespace) {
      function debug() {
        if (!debug.enabled)
          return;
        var self2 = debug;
        var curr = +/* @__PURE__ */ new Date();
        var ms = curr - (prevTime || curr);
        self2.diff = ms;
        self2.prev = prevTime;
        self2.curr = curr;
        prevTime = curr;
        var args = new Array(arguments.length);
        for (var i = 0; i < args.length; i++) {
          args[i] = arguments[i];
        }
        args[0] = exports.coerce(args[0]);
        if ("string" !== typeof args[0]) {
          args.unshift("%O");
        }
        var index = 0;
        args[0] = args[0].replace(/%([a-zA-Z%])/g, function(match, format) {
          if (match === "%%")
            return match;
          index++;
          var formatter = exports.formatters[format];
          if ("function" === typeof formatter) {
            var val = args[index];
            match = formatter.call(self2, val);
            args.splice(index, 1);
            index--;
          }
          return match;
        });
        exports.formatArgs.call(self2, args);
        var logFn = debug.log || exports.log || console.log.bind(console);
        logFn.apply(self2, args);
      }
      debug.namespace = namespace;
      debug.enabled = exports.enabled(namespace);
      debug.useColors = exports.useColors();
      debug.color = selectColor(namespace);
      if ("function" === typeof exports.init) {
        exports.init(debug);
      }
      return debug;
    }
    function enable(namespaces) {
      exports.save(namespaces);
      exports.names = [];
      exports.skips = [];
      var split = (typeof namespaces === "string" ? namespaces : "").split(/[\s,]+/);
      var len = split.length;
      for (var i = 0; i < len; i++) {
        if (!split[i])
          continue;
        namespaces = split[i].replace(/\*/g, ".*?");
        if (namespaces[0] === "-") {
          exports.skips.push(new RegExp("^" + namespaces.substr(1) + "$"));
        } else {
          exports.names.push(new RegExp("^" + namespaces + "$"));
        }
      }
    }
    function disable() {
      exports.enable("");
    }
    function enabled(name) {
      var i, len;
      for (i = 0, len = exports.skips.length; i < len; i++) {
        if (exports.skips[i].test(name)) {
          return false;
        }
      }
      for (i = 0, len = exports.names.length; i < len; i++) {
        if (exports.names[i].test(name)) {
          return true;
        }
      }
      return false;
    }
    function coerce(val) {
      if (val instanceof Error)
        return val.stack || val.message;
      return val;
    }
  }
});

// apps/backend/src/layers/dependencyLayer/nodejs/node_modules/debug/src/browser.js
var require_browser = __commonJS({
  "apps/backend/src/layers/dependencyLayer/nodejs/node_modules/debug/src/browser.js"(exports, module) {
    exports = module.exports = require_debug();
    exports.log = log;
    exports.formatArgs = formatArgs;
    exports.save = save;
    exports.load = load;
    exports.useColors = useColors;
    exports.storage = "undefined" != typeof chrome && "undefined" != typeof chrome.storage ? chrome.storage.local : localstorage();
    exports.colors = [
      "lightseagreen",
      "forestgreen",
      "goldenrod",
      "dodgerblue",
      "darkorchid",
      "crimson"
    ];
    function useColors() {
      if (typeof window !== "undefined" && window.process && window.process.type === "renderer") {
        return true;
      }
      return typeof document !== "undefined" && document.documentElement && document.documentElement.style && document.documentElement.style.WebkitAppearance || // is firebug? http://stackoverflow.com/a/398120/376773
      typeof window !== "undefined" && window.console && (window.console.firebug || window.console.exception && window.console.table) || // is firefox >= v31?
      // https://developer.mozilla.org/en-US/docs/Tools/Web_Console#Styling_messages
      typeof navigator !== "undefined" && navigator.userAgent && navigator.userAgent.toLowerCase().match(/firefox\/(\d+)/) && parseInt(RegExp.$1, 10) >= 31 || // double check webkit in userAgent just in case we are in a worker
      typeof navigator !== "undefined" && navigator.userAgent && navigator.userAgent.toLowerCase().match(/applewebkit\/(\d+)/);
    }
    exports.formatters.j = function(v) {
      try {
        return JSON.stringify(v);
      } catch (err) {
        return "[UnexpectedJSONParseError]: " + err.message;
      }
    };
    function formatArgs(args) {
      var useColors2 = this.useColors;
      args[0] = (useColors2 ? "%c" : "") + this.namespace + (useColors2 ? " %c" : " ") + args[0] + (useColors2 ? "%c " : " ") + "+" + exports.humanize(this.diff);
      if (!useColors2)
        return;
      var c = "color: " + this.color;
      args.splice(1, 0, c, "color: inherit");
      var index = 0;
      var lastC = 0;
      args[0].replace(/%[a-zA-Z%]/g, function(match) {
        if ("%%" === match)
          return;
        index++;
        if ("%c" === match) {
          lastC = index;
        }
      });
      args.splice(lastC, 0, c);
    }
    function log() {
      return "object" === typeof console && console.log && Function.prototype.apply.call(console.log, console, arguments);
    }
    function save(namespaces) {
      try {
        if (null == namespaces) {
          exports.storage.removeItem("debug");
        } else {
          exports.storage.debug = namespaces;
        }
      } catch (e) {
      }
    }
    function load() {
      var r;
      try {
        r = exports.storage.debug;
      } catch (e) {
      }
      if (!r && typeof process !== "undefined" && "env" in process) {
        r = process.env.DEBUG;
      }
      return r;
    }
    exports.enable(load());
    function localstorage() {
      try {
        return window.localStorage;
      } catch (e) {
      }
    }
  }
});

// apps/backend/src/layers/dependencyLayer/nodejs/node_modules/debug/src/node.js
var require_node = __commonJS({
  "apps/backend/src/layers/dependencyLayer/nodejs/node_modules/debug/src/node.js"(exports, module) {
    var tty = __require("tty");
    var util3 = __require("util");
    exports = module.exports = require_debug();
    exports.init = init;
    exports.log = log;
    exports.formatArgs = formatArgs;
    exports.save = save;
    exports.load = load;
    exports.useColors = useColors;
    exports.colors = [6, 2, 3, 4, 5, 1];
    exports.inspectOpts = Object.keys(process.env).filter(function(key) {
      return /^debug_/i.test(key);
    }).reduce(function(obj, key) {
      var prop = key.substring(6).toLowerCase().replace(/_([a-z])/g, function(_, k) {
        return k.toUpperCase();
      });
      var val = process.env[key];
      if (/^(yes|on|true|enabled)$/i.test(val))
        val = true;
      else if (/^(no|off|false|disabled)$/i.test(val))
        val = false;
      else if (val === "null")
        val = null;
      else
        val = Number(val);
      obj[prop] = val;
      return obj;
    }, {});
    var fd = parseInt(process.env.DEBUG_FD, 10) || 2;
    if (1 !== fd && 2 !== fd) {
      util3.deprecate(function() {
      }, "except for stderr(2) and stdout(1), any other usage of DEBUG_FD is deprecated. Override debug.log if you want to use a different log function (https://git.io/debug_fd)")();
    }
    var stream4 = 1 === fd ? process.stdout : 2 === fd ? process.stderr : createWritableStdioStream(fd);
    function useColors() {
      return "colors" in exports.inspectOpts ? Boolean(exports.inspectOpts.colors) : tty.isatty(fd);
    }
    exports.formatters.o = function(v) {
      this.inspectOpts.colors = this.useColors;
      return util3.inspect(v, this.inspectOpts).split("\n").map(function(str) {
        return str.trim();
      }).join(" ");
    };
    exports.formatters.O = function(v) {
      this.inspectOpts.colors = this.useColors;
      return util3.inspect(v, this.inspectOpts);
    };
    function formatArgs(args) {
      var name = this.namespace;
      var useColors2 = this.useColors;
      if (useColors2) {
        var c = this.color;
        var prefix = "  \x1B[3" + c + ";1m" + name + " \x1B[0m";
        args[0] = prefix + args[0].split("\n").join("\n" + prefix);
        args.push("\x1B[3" + c + "m+" + exports.humanize(this.diff) + "\x1B[0m");
      } else {
        args[0] = (/* @__PURE__ */ new Date()).toUTCString() + " " + name + " " + args[0];
      }
    }
    function log() {
      return stream4.write(util3.format.apply(util3, arguments) + "\n");
    }
    function save(namespaces) {
      if (null == namespaces) {
        delete process.env.DEBUG;
      } else {
        process.env.DEBUG = namespaces;
      }
    }
    function load() {
      return process.env.DEBUG;
    }
    function createWritableStdioStream(fd2) {
      var stream5;
      var tty_wrap = process.binding("tty_wrap");
      switch (tty_wrap.guessHandleType(fd2)) {
        case "TTY":
          stream5 = new tty.WriteStream(fd2);
          stream5._type = "tty";
          if (stream5._handle && stream5._handle.unref) {
            stream5._handle.unref();
          }
          break;
        case "FILE":
          var fs = __require("fs");
          stream5 = new fs.SyncWriteStream(fd2, { autoClose: false });
          stream5._type = "fs";
          break;
        case "PIPE":
        case "TCP":
          var net = __require("net");
          stream5 = new net.Socket({
            fd: fd2,
            readable: false,
            writable: true
          });
          stream5.readable = false;
          stream5.read = null;
          stream5._type = "pipe";
          if (stream5._handle && stream5._handle.unref) {
            stream5._handle.unref();
          }
          break;
        default:
          throw new Error("Implement me. Unknown stream file type!");
      }
      stream5.fd = fd2;
      stream5._isStdio = true;
      return stream5;
    }
    function init(debug) {
      debug.inspectOpts = {};
      var keys = Object.keys(exports.inspectOpts);
      for (var i = 0; i < keys.length; i++) {
        debug.inspectOpts[keys[i]] = exports.inspectOpts[keys[i]];
      }
    }
    exports.enable(load());
  }
});

// apps/backend/src/layers/dependencyLayer/nodejs/node_modules/debug/src/index.js
var require_src = __commonJS({
  "apps/backend/src/layers/dependencyLayer/nodejs/node_modules/debug/src/index.js"(exports, module) {
    if (typeof process !== "undefined" && process.type === "renderer") {
      module.exports = require_browser();
    } else {
      module.exports = require_node();
    }
  }
});

// apps/backend/src/layers/dependencyLayer/nodejs/node_modules/follow-redirects/debug.js
var require_debug2 = __commonJS({
  "apps/backend/src/layers/dependencyLayer/nodejs/node_modules/follow-redirects/debug.js"(exports, module) {
    var debug;
    module.exports = function() {
      if (!debug) {
        try {
          debug = require_src()("follow-redirects");
        } catch (error) {
        }
        if (typeof debug !== "function") {
          debug = function() {
          };
        }
      }
      debug.apply(null, arguments);
    };
  }
});

// apps/backend/src/layers/dependencyLayer/nodejs/node_modules/follow-redirects/index.js
var require_follow_redirects = __commonJS({
  "apps/backend/src/layers/dependencyLayer/nodejs/node_modules/follow-redirects/index.js"(exports, module) {
    var url2 = __require("url");
    var URL2 = url2.URL;
    var http2 = __require("http");
    var https2 = __require("https");
    var Writable = __require("stream").Writable;
    var assert = __require("assert");
    var debug = require_debug2();
    var useNativeURL = false;
    try {
      assert(new URL2());
    } catch (error) {
      useNativeURL = error.code === "ERR_INVALID_URL";
    }
    var preservedUrlFields = [
      "auth",
      "host",
      "hostname",
      "href",
      "path",
      "pathname",
      "port",
      "protocol",
      "query",
      "search",
      "hash"
    ];
    var events = ["abort", "aborted", "connect", "error", "socket", "timeout"];
    var eventHandlers = /* @__PURE__ */ Object.create(null);
    events.forEach(function(event) {
      eventHandlers[event] = function(arg1, arg2, arg3) {
        this._redirectable.emit(event, arg1, arg2, arg3);
      };
    });
    var InvalidUrlError = createErrorType(
      "ERR_INVALID_URL",
      "Invalid URL",
      TypeError
    );
    var RedirectionError = createErrorType(
      "ERR_FR_REDIRECTION_FAILURE",
      "Redirected request failed"
    );
    var TooManyRedirectsError = createErrorType(
      "ERR_FR_TOO_MANY_REDIRECTS",
      "Maximum number of redirects exceeded",
      RedirectionError
    );
    var MaxBodyLengthExceededError = createErrorType(
      "ERR_FR_MAX_BODY_LENGTH_EXCEEDED",
      "Request body larger than maxBodyLength limit"
    );
    var WriteAfterEndError = createErrorType(
      "ERR_STREAM_WRITE_AFTER_END",
      "write after end"
    );
    var destroy = Writable.prototype.destroy || noop2;
    function RedirectableRequest(options, responseCallback) {
      Writable.call(this);
      this._sanitizeOptions(options);
      this._options = options;
      this._ended = false;
      this._ending = false;
      this._redirectCount = 0;
      this._redirects = [];
      this._requestBodyLength = 0;
      this._requestBodyBuffers = [];
      if (responseCallback) {
        this.on("response", responseCallback);
      }
      var self2 = this;
      this._onNativeResponse = function(response2) {
        try {
          self2._processResponse(response2);
        } catch (cause) {
          self2.emit("error", cause instanceof RedirectionError ? cause : new RedirectionError({ cause }));
        }
      };
      this._performRequest();
    }
    RedirectableRequest.prototype = Object.create(Writable.prototype);
    RedirectableRequest.prototype.abort = function() {
      destroyRequest(this._currentRequest);
      this._currentRequest.abort();
      this.emit("abort");
    };
    RedirectableRequest.prototype.destroy = function(error) {
      destroyRequest(this._currentRequest, error);
      destroy.call(this, error);
      return this;
    };
    RedirectableRequest.prototype.write = function(data, encoding, callback) {
      if (this._ending) {
        throw new WriteAfterEndError();
      }
      if (!isString2(data) && !isBuffer2(data)) {
        throw new TypeError("data should be a string, Buffer or Uint8Array");
      }
      if (isFunction2(encoding)) {
        callback = encoding;
        encoding = null;
      }
      if (data.length === 0) {
        if (callback) {
          callback();
        }
        return;
      }
      if (this._requestBodyLength + data.length <= this._options.maxBodyLength) {
        this._requestBodyLength += data.length;
        this._requestBodyBuffers.push({ data, encoding });
        this._currentRequest.write(data, encoding, callback);
      } else {
        this.emit("error", new MaxBodyLengthExceededError());
        this.abort();
      }
    };
    RedirectableRequest.prototype.end = function(data, encoding, callback) {
      if (isFunction2(data)) {
        callback = data;
        data = encoding = null;
      } else if (isFunction2(encoding)) {
        callback = encoding;
        encoding = null;
      }
      if (!data) {
        this._ended = this._ending = true;
        this._currentRequest.end(null, null, callback);
      } else {
        var self2 = this;
        var currentRequest = this._currentRequest;
        this.write(data, encoding, function() {
          self2._ended = true;
          currentRequest.end(null, null, callback);
        });
        this._ending = true;
      }
    };
    RedirectableRequest.prototype.setHeader = function(name, value) {
      this._options.headers[name] = value;
      this._currentRequest.setHeader(name, value);
    };
    RedirectableRequest.prototype.removeHeader = function(name) {
      delete this._options.headers[name];
      this._currentRequest.removeHeader(name);
    };
    RedirectableRequest.prototype.setTimeout = function(msecs, callback) {
      var self2 = this;
      function destroyOnTimeout(socket) {
        socket.setTimeout(msecs);
        socket.removeListener("timeout", socket.destroy);
        socket.addListener("timeout", socket.destroy);
      }
      function startTimer(socket) {
        if (self2._timeout) {
          clearTimeout(self2._timeout);
        }
        self2._timeout = setTimeout(function() {
          self2.emit("timeout");
          clearTimer();
        }, msecs);
        destroyOnTimeout(socket);
      }
      function clearTimer() {
        if (self2._timeout) {
          clearTimeout(self2._timeout);
          self2._timeout = null;
        }
        self2.removeListener("abort", clearTimer);
        self2.removeListener("error", clearTimer);
        self2.removeListener("response", clearTimer);
        self2.removeListener("close", clearTimer);
        if (callback) {
          self2.removeListener("timeout", callback);
        }
        if (!self2.socket) {
          self2._currentRequest.removeListener("socket", startTimer);
        }
      }
      if (callback) {
        this.on("timeout", callback);
      }
      if (this.socket) {
        startTimer(this.socket);
      } else {
        this._currentRequest.once("socket", startTimer);
      }
      this.on("socket", destroyOnTimeout);
      this.on("abort", clearTimer);
      this.on("error", clearTimer);
      this.on("response", clearTimer);
      this.on("close", clearTimer);
      return this;
    };
    [
      "flushHeaders",
      "getHeader",
      "setNoDelay",
      "setSocketKeepAlive"
    ].forEach(function(method) {
      RedirectableRequest.prototype[method] = function(a, b) {
        return this._currentRequest[method](a, b);
      };
    });
    ["aborted", "connection", "socket"].forEach(function(property) {
      Object.defineProperty(RedirectableRequest.prototype, property, {
        get: function() {
          return this._currentRequest[property];
        }
      });
    });
    RedirectableRequest.prototype._sanitizeOptions = function(options) {
      if (!options.headers) {
        options.headers = {};
      }
      if (options.host) {
        if (!options.hostname) {
          options.hostname = options.host;
        }
        delete options.host;
      }
      if (!options.pathname && options.path) {
        var searchPos = options.path.indexOf("?");
        if (searchPos < 0) {
          options.pathname = options.path;
        } else {
          options.pathname = options.path.substring(0, searchPos);
          options.search = options.path.substring(searchPos);
        }
      }
    };
    RedirectableRequest.prototype._performRequest = function() {
      var protocol = this._options.protocol;
      var nativeProtocol = this._options.nativeProtocols[protocol];
      if (!nativeProtocol) {
        throw new TypeError("Unsupported protocol " + protocol);
      }
      if (this._options.agents) {
        var scheme = protocol.slice(0, -1);
        this._options.agent = this._options.agents[scheme];
      }
      var request2 = this._currentRequest = nativeProtocol.request(this._options, this._onNativeResponse);
      request2._redirectable = this;
      for (var event of events) {
        request2.on(event, eventHandlers[event]);
      }
      this._currentUrl = /^\//.test(this._options.path) ? url2.format(this._options) : (
        // When making a request to a proxy, […]
        // a client MUST send the target URI in absolute-form […].
        this._options.path
      );
      if (this._isRedirect) {
        var i = 0;
        var self2 = this;
        var buffers = this._requestBodyBuffers;
        (function writeNext(error) {
          if (request2 === self2._currentRequest) {
            if (error) {
              self2.emit("error", error);
            } else if (i < buffers.length) {
              var buffer = buffers[i++];
              if (!request2.finished) {
                request2.write(buffer.data, buffer.encoding, writeNext);
              }
            } else if (self2._ended) {
              request2.end();
            }
          }
        })();
      }
    };
    RedirectableRequest.prototype._processResponse = function(response2) {
      var statusCode = response2.statusCode;
      if (this._options.trackRedirects) {
        this._redirects.push({
          url: this._currentUrl,
          headers: response2.headers,
          statusCode
        });
      }
      var location = response2.headers.location;
      if (!location || this._options.followRedirects === false || statusCode < 300 || statusCode >= 400) {
        response2.responseUrl = this._currentUrl;
        response2.redirects = this._redirects;
        this.emit("response", response2);
        this._requestBodyBuffers = [];
        return;
      }
      destroyRequest(this._currentRequest);
      response2.destroy();
      if (++this._redirectCount > this._options.maxRedirects) {
        throw new TooManyRedirectsError();
      }
      var requestHeaders;
      var beforeRedirect = this._options.beforeRedirect;
      if (beforeRedirect) {
        requestHeaders = Object.assign({
          // The Host header was set by nativeProtocol.request
          Host: response2.req.getHeader("host")
        }, this._options.headers);
      }
      var method = this._options.method;
      if ((statusCode === 301 || statusCode === 302) && this._options.method === "POST" || // RFC7231§6.4.4: The 303 (See Other) status code indicates that
      // the server is redirecting the user agent to a different resource […]
      // A user agent can perform a retrieval request targeting that URI
      // (a GET or HEAD request if using HTTP) […]
      statusCode === 303 && !/^(?:GET|HEAD)$/.test(this._options.method)) {
        this._options.method = "GET";
        this._requestBodyBuffers = [];
        removeMatchingHeaders(/^content-/i, this._options.headers);
      }
      var currentHostHeader = removeMatchingHeaders(/^host$/i, this._options.headers);
      var currentUrlParts = parseUrl(this._currentUrl);
      var currentHost = currentHostHeader || currentUrlParts.host;
      var currentUrl = /^\w+:/.test(location) ? this._currentUrl : url2.format(Object.assign(currentUrlParts, { host: currentHost }));
      var redirectUrl = resolveUrl(location, currentUrl);
      debug("redirecting to", redirectUrl.href);
      this._isRedirect = true;
      spreadUrlObject(redirectUrl, this._options);
      if (redirectUrl.protocol !== currentUrlParts.protocol && redirectUrl.protocol !== "https:" || redirectUrl.host !== currentHost && !isSubdomain(redirectUrl.host, currentHost)) {
        removeMatchingHeaders(/^(?:authorization|cookie)$/i, this._options.headers);
      }
      if (isFunction2(beforeRedirect)) {
        var responseDetails = {
          headers: response2.headers,
          statusCode
        };
        var requestDetails = {
          url: currentUrl,
          method,
          headers: requestHeaders
        };
        beforeRedirect(this._options, responseDetails, requestDetails);
        this._sanitizeOptions(this._options);
      }
      this._performRequest();
    };
    function wrap(protocols) {
      var exports2 = {
        maxRedirects: 21,
        maxBodyLength: 10 * 1024 * 1024
      };
      var nativeProtocols = {};
      Object.keys(protocols).forEach(function(scheme) {
        var protocol = scheme + ":";
        var nativeProtocol = nativeProtocols[protocol] = protocols[scheme];
        var wrappedProtocol = exports2[scheme] = Object.create(nativeProtocol);
        function request2(input, options, callback) {
          if (isURL(input)) {
            input = spreadUrlObject(input);
          } else if (isString2(input)) {
            input = spreadUrlObject(parseUrl(input));
          } else {
            callback = options;
            options = validateUrl(input);
            input = { protocol };
          }
          if (isFunction2(options)) {
            callback = options;
            options = null;
          }
          options = Object.assign({
            maxRedirects: exports2.maxRedirects,
            maxBodyLength: exports2.maxBodyLength
          }, input, options);
          options.nativeProtocols = nativeProtocols;
          if (!isString2(options.host) && !isString2(options.hostname)) {
            options.hostname = "::1";
          }
          assert.equal(options.protocol, protocol, "protocol mismatch");
          debug("options", options);
          return new RedirectableRequest(options, callback);
        }
        function get(input, options, callback) {
          var wrappedRequest = wrappedProtocol.request(input, options, callback);
          wrappedRequest.end();
          return wrappedRequest;
        }
        Object.defineProperties(wrappedProtocol, {
          request: { value: request2, configurable: true, enumerable: true, writable: true },
          get: { value: get, configurable: true, enumerable: true, writable: true }
        });
      });
      return exports2;
    }
    function noop2() {
    }
    function parseUrl(input) {
      var parsed;
      if (useNativeURL) {
        parsed = new URL2(input);
      } else {
        parsed = validateUrl(url2.parse(input));
        if (!isString2(parsed.protocol)) {
          throw new InvalidUrlError({ input });
        }
      }
      return parsed;
    }
    function resolveUrl(relative, base) {
      return useNativeURL ? new URL2(relative, base) : parseUrl(url2.resolve(base, relative));
    }
    function validateUrl(input) {
      if (/^\[/.test(input.hostname) && !/^\[[:0-9a-f]+\]$/i.test(input.hostname)) {
        throw new InvalidUrlError({ input: input.href || input });
      }
      if (/^\[/.test(input.host) && !/^\[[:0-9a-f]+\](:\d+)?$/i.test(input.host)) {
        throw new InvalidUrlError({ input: input.href || input });
      }
      return input;
    }
    function spreadUrlObject(urlObject, target) {
      var spread3 = target || {};
      for (var key of preservedUrlFields) {
        spread3[key] = urlObject[key];
      }
      if (spread3.hostname.startsWith("[")) {
        spread3.hostname = spread3.hostname.slice(1, -1);
      }
      if (spread3.port !== "") {
        spread3.port = Number(spread3.port);
      }
      spread3.path = spread3.search ? spread3.pathname + spread3.search : spread3.pathname;
      return spread3;
    }
    function removeMatchingHeaders(regex, headers) {
      var lastValue;
      for (var header in headers) {
        if (regex.test(header)) {
          lastValue = headers[header];
          delete headers[header];
        }
      }
      return lastValue === null || typeof lastValue === "undefined" ? void 0 : String(lastValue).trim();
    }
    function createErrorType(code, message, baseClass) {
      function CustomError(properties) {
        Error.captureStackTrace(this, this.constructor);
        Object.assign(this, properties || {});
        this.code = code;
        this.message = this.cause ? message + ": " + this.cause.message : message;
      }
      CustomError.prototype = new (baseClass || Error)();
      Object.defineProperties(CustomError.prototype, {
        constructor: {
          value: CustomError,
          enumerable: false
        },
        name: {
          value: "Error [" + code + "]",
          enumerable: false
        }
      });
      return CustomError;
    }
    function destroyRequest(request2, error) {
      for (var event of events) {
        request2.removeListener(event, eventHandlers[event]);
      }
      request2.on("error", noop2);
      request2.destroy(error);
    }
    function isSubdomain(subdomain, domain) {
      assert(isString2(subdomain) && isString2(domain));
      var dot = subdomain.length - domain.length - 1;
      return dot > 0 && subdomain[dot] === "." && subdomain.endsWith(domain);
    }
    function isString2(value) {
      return typeof value === "string" || value instanceof String;
    }
    function isFunction2(value) {
      return typeof value === "function";
    }
    function isBuffer2(value) {
      return typeof value === "object" && "length" in value;
    }
    function isURL(value) {
      return URL2 && value instanceof URL2;
    }
    module.exports = wrap({ http: http2, https: https2 });
    module.exports.wrap = wrap;
  }
});

// apps/backend/src/appsync/resolvers/Query.abrLookup.ts
import { util as util2 } from "@aws-appsync/utils";

// apps/backend/src/layers/dependencyLayer/nodejs/node_modules/axios/lib/helpers/bind.js
function bind(fn, thisArg) {
  return function wrap() {
    return fn.apply(thisArg, arguments);
  };
}

// apps/backend/src/layers/dependencyLayer/nodejs/node_modules/axios/lib/utils.js
var { toString } = Object.prototype;
var { getPrototypeOf } = Object;
var kindOf = ((cache) => (thing) => {
  const str = toString.call(thing);
  return cache[str] || (cache[str] = str.slice(8, -1).toLowerCase());
})(/* @__PURE__ */ Object.create(null));
var kindOfTest = (type) => {
  type = type.toLowerCase();
  return (thing) => kindOf(thing) === type;
};
var typeOfTest = (type) => (thing) => typeof thing === type;
var { isArray } = Array;
var isUndefined = typeOfTest("undefined");
function isBuffer(val) {
  return val !== null && !isUndefined(val) && val.constructor !== null && !isUndefined(val.constructor) && isFunction(val.constructor.isBuffer) && val.constructor.isBuffer(val);
}
var isArrayBuffer = kindOfTest("ArrayBuffer");
function isArrayBufferView(val) {
  let result;
  if (typeof ArrayBuffer !== "undefined" && ArrayBuffer.isView) {
    result = ArrayBuffer.isView(val);
  } else {
    result = val && val.buffer && isArrayBuffer(val.buffer);
  }
  return result;
}
var isString = typeOfTest("string");
var isFunction = typeOfTest("function");
var isNumber = typeOfTest("number");
var isObject = (thing) => thing !== null && typeof thing === "object";
var isBoolean = (thing) => thing === true || thing === false;
var isPlainObject = (val) => {
  if (kindOf(val) !== "object") {
    return false;
  }
  const prototype3 = getPrototypeOf(val);
  return (prototype3 === null || prototype3 === Object.prototype || Object.getPrototypeOf(prototype3) === null) && !(Symbol.toStringTag in val) && !(Symbol.iterator in val);
};
var isDate = kindOfTest("Date");
var isFile = kindOfTest("File");
var isBlob = kindOfTest("Blob");
var isFileList = kindOfTest("FileList");
var isStream = (val) => isObject(val) && isFunction(val.pipe);
var isFormData = (thing) => {
  let kind;
  return thing && (typeof FormData === "function" && thing instanceof FormData || isFunction(thing.append) && ((kind = kindOf(thing)) === "formdata" || // detect form-data instance
  kind === "object" && isFunction(thing.toString) && thing.toString() === "[object FormData]"));
};
var isURLSearchParams = kindOfTest("URLSearchParams");
var trim = (str) => str.trim ? str.trim() : str.replace(/^[\s\uFEFF\xA0]+|[\s\uFEFF\xA0]+$/g, "");
function forEach(obj, fn, { allOwnKeys = false } = {}) {
  if (obj === null || typeof obj === "undefined") {
    return;
  }
  let i;
  let l;
  if (typeof obj !== "object") {
    obj = [obj];
  }
  if (isArray(obj)) {
    for (i = 0, l = obj.length; i < l; i++) {
      fn.call(null, obj[i], i, obj);
    }
  } else {
    const keys = allOwnKeys ? Object.getOwnPropertyNames(obj) : Object.keys(obj);
    const len = keys.length;
    let key;
    for (i = 0; i < len; i++) {
      key = keys[i];
      fn.call(null, obj[key], key, obj);
    }
  }
}
function findKey(obj, key) {
  key = key.toLowerCase();
  const keys = Object.keys(obj);
  let i = keys.length;
  let _key;
  while (i-- > 0) {
    _key = keys[i];
    if (key === _key.toLowerCase()) {
      return _key;
    }
  }
  return null;
}
var _global = (() => {
  if (typeof globalThis !== "undefined")
    return globalThis;
  return typeof self !== "undefined" ? self : typeof window !== "undefined" ? window : global;
})();
var isContextDefined = (context) => !isUndefined(context) && context !== _global;
function merge() {
  const { caseless } = isContextDefined(this) && this || {};
  const result = {};
  const assignValue = (val, key) => {
    const targetKey = caseless && findKey(result, key) || key;
    if (isPlainObject(result[targetKey]) && isPlainObject(val)) {
      result[targetKey] = merge(result[targetKey], val);
    } else if (isPlainObject(val)) {
      result[targetKey] = merge({}, val);
    } else if (isArray(val)) {
      result[targetKey] = val.slice();
    } else {
      result[targetKey] = val;
    }
  };
  for (let i = 0, l = arguments.length; i < l; i++) {
    arguments[i] && forEach(arguments[i], assignValue);
  }
  return result;
}
var extend = (a, b, thisArg, { allOwnKeys } = {}) => {
  forEach(b, (val, key) => {
    if (thisArg && isFunction(val)) {
      a[key] = bind(val, thisArg);
    } else {
      a[key] = val;
    }
  }, { allOwnKeys });
  return a;
};
var stripBOM = (content) => {
  if (content.charCodeAt(0) === 65279) {
    content = content.slice(1);
  }
  return content;
};
var inherits = (constructor, superConstructor, props, descriptors2) => {
  constructor.prototype = Object.create(superConstructor.prototype, descriptors2);
  constructor.prototype.constructor = constructor;
  Object.defineProperty(constructor, "super", {
    value: superConstructor.prototype
  });
  props && Object.assign(constructor.prototype, props);
};
var toFlatObject = (sourceObj, destObj, filter2, propFilter) => {
  let props;
  let i;
  let prop;
  const merged = {};
  destObj = destObj || {};
  if (sourceObj == null)
    return destObj;
  do {
    props = Object.getOwnPropertyNames(sourceObj);
    i = props.length;
    while (i-- > 0) {
      prop = props[i];
      if ((!propFilter || propFilter(prop, sourceObj, destObj)) && !merged[prop]) {
        destObj[prop] = sourceObj[prop];
        merged[prop] = true;
      }
    }
    sourceObj = filter2 !== false && getPrototypeOf(sourceObj);
  } while (sourceObj && (!filter2 || filter2(sourceObj, destObj)) && sourceObj !== Object.prototype);
  return destObj;
};
var endsWith = (str, searchString, position) => {
  str = String(str);
  if (position === void 0 || position > str.length) {
    position = str.length;
  }
  position -= searchString.length;
  const lastIndex = str.indexOf(searchString, position);
  return lastIndex !== -1 && lastIndex === position;
};
var toArray = (thing) => {
  if (!thing)
    return null;
  if (isArray(thing))
    return thing;
  let i = thing.length;
  if (!isNumber(i))
    return null;
  const arr = new Array(i);
  while (i-- > 0) {
    arr[i] = thing[i];
  }
  return arr;
};
var isTypedArray = ((TypedArray) => {
  return (thing) => {
    return TypedArray && thing instanceof TypedArray;
  };
})(typeof Uint8Array !== "undefined" && getPrototypeOf(Uint8Array));
var forEachEntry = (obj, fn) => {
  const generator = obj && obj[Symbol.iterator];
  const iterator = generator.call(obj);
  let result;
  while ((result = iterator.next()) && !result.done) {
    const pair = result.value;
    fn.call(obj, pair[0], pair[1]);
  }
};
var matchAll = (regExp, str) => {
  let matches;
  const arr = [];
  while ((matches = regExp.exec(str)) !== null) {
    arr.push(matches);
  }
  return arr;
};
var isHTMLForm = kindOfTest("HTMLFormElement");
var toCamelCase = (str) => {
  return str.toLowerCase().replace(
    /[-_\s]([a-z\d])(\w*)/g,
    function replacer(m, p1, p2) {
      return p1.toUpperCase() + p2;
    }
  );
};
var hasOwnProperty = (({ hasOwnProperty: hasOwnProperty2 }) => (obj, prop) => hasOwnProperty2.call(obj, prop))(Object.prototype);
var isRegExp = kindOfTest("RegExp");
var reduceDescriptors = (obj, reducer) => {
  const descriptors2 = Object.getOwnPropertyDescriptors(obj);
  const reducedDescriptors = {};
  forEach(descriptors2, (descriptor, name) => {
    let ret;
    if ((ret = reducer(descriptor, name, obj)) !== false) {
      reducedDescriptors[name] = ret || descriptor;
    }
  });
  Object.defineProperties(obj, reducedDescriptors);
};
var freezeMethods = (obj) => {
  reduceDescriptors(obj, (descriptor, name) => {
    if (isFunction(obj) && ["arguments", "caller", "callee"].indexOf(name) !== -1) {
      return false;
    }
    const value = obj[name];
    if (!isFunction(value))
      return;
    descriptor.enumerable = false;
    if ("writable" in descriptor) {
      descriptor.writable = false;
      return;
    }
    if (!descriptor.set) {
      descriptor.set = () => {
        throw Error("Can not rewrite read-only method '" + name + "'");
      };
    }
  });
};
var toObjectSet = (arrayOrString, delimiter) => {
  const obj = {};
  const define = (arr) => {
    arr.forEach((value) => {
      obj[value] = true;
    });
  };
  isArray(arrayOrString) ? define(arrayOrString) : define(String(arrayOrString).split(delimiter));
  return obj;
};
var noop = () => {
};
var toFiniteNumber = (value, defaultValue) => {
  value = +value;
  return Number.isFinite(value) ? value : defaultValue;
};
var ALPHA = "abcdefghijklmnopqrstuvwxyz";
var DIGIT = "0123456789";
var ALPHABET = {
  DIGIT,
  ALPHA,
  ALPHA_DIGIT: ALPHA + ALPHA.toUpperCase() + DIGIT
};
var generateString = (size = 16, alphabet = ALPHABET.ALPHA_DIGIT) => {
  let str = "";
  const { length } = alphabet;
  while (size--) {
    str += alphabet[Math.random() * length | 0];
  }
  return str;
};
function isSpecCompliantForm(thing) {
  return !!(thing && isFunction(thing.append) && thing[Symbol.toStringTag] === "FormData" && thing[Symbol.iterator]);
}
var toJSONObject = (obj) => {
  const stack = new Array(10);
  const visit = (source, i) => {
    if (isObject(source)) {
      if (stack.indexOf(source) >= 0) {
        return;
      }
      if (!("toJSON" in source)) {
        stack[i] = source;
        const target = isArray(source) ? [] : {};
        forEach(source, (value, key) => {
          const reducedValue = visit(value, i + 1);
          !isUndefined(reducedValue) && (target[key] = reducedValue);
        });
        stack[i] = void 0;
        return target;
      }
    }
    return source;
  };
  return visit(obj, 0);
};
var isAsyncFn = kindOfTest("AsyncFunction");
var isThenable = (thing) => thing && (isObject(thing) || isFunction(thing)) && isFunction(thing.then) && isFunction(thing.catch);
var utils_default = {
  isArray,
  isArrayBuffer,
  isBuffer,
  isFormData,
  isArrayBufferView,
  isString,
  isNumber,
  isBoolean,
  isObject,
  isPlainObject,
  isUndefined,
  isDate,
  isFile,
  isBlob,
  isRegExp,
  isFunction,
  isStream,
  isURLSearchParams,
  isTypedArray,
  isFileList,
  forEach,
  merge,
  extend,
  trim,
  stripBOM,
  inherits,
  toFlatObject,
  kindOf,
  kindOfTest,
  endsWith,
  toArray,
  forEachEntry,
  matchAll,
  isHTMLForm,
  hasOwnProperty,
  hasOwnProp: hasOwnProperty,
  // an alias to avoid ESLint no-prototype-builtins detection
  reduceDescriptors,
  freezeMethods,
  toObjectSet,
  toCamelCase,
  noop,
  toFiniteNumber,
  findKey,
  global: _global,
  isContextDefined,
  ALPHABET,
  generateString,
  isSpecCompliantForm,
  toJSONObject,
  isAsyncFn,
  isThenable
};

// apps/backend/src/layers/dependencyLayer/nodejs/node_modules/axios/lib/core/AxiosError.js
function AxiosError(message, code, config, request2, response2) {
  Error.call(this);
  if (Error.captureStackTrace) {
    Error.captureStackTrace(this, this.constructor);
  } else {
    this.stack = new Error().stack;
  }
  this.message = message;
  this.name = "AxiosError";
  code && (this.code = code);
  config && (this.config = config);
  request2 && (this.request = request2);
  response2 && (this.response = response2);
}
utils_default.inherits(AxiosError, Error, {
  toJSON: function toJSON() {
    return {
      // Standard
      message: this.message,
      name: this.name,
      // Microsoft
      description: this.description,
      number: this.number,
      // Mozilla
      fileName: this.fileName,
      lineNumber: this.lineNumber,
      columnNumber: this.columnNumber,
      stack: this.stack,
      // Axios
      config: utils_default.toJSONObject(this.config),
      code: this.code,
      status: this.response && this.response.status ? this.response.status : null
    };
  }
});
var prototype = AxiosError.prototype;
var descriptors = {};
[
  "ERR_BAD_OPTION_VALUE",
  "ERR_BAD_OPTION",
  "ECONNABORTED",
  "ETIMEDOUT",
  "ERR_NETWORK",
  "ERR_FR_TOO_MANY_REDIRECTS",
  "ERR_DEPRECATED",
  "ERR_BAD_RESPONSE",
  "ERR_BAD_REQUEST",
  "ERR_CANCELED",
  "ERR_NOT_SUPPORT",
  "ERR_INVALID_URL"
  // eslint-disable-next-line func-names
].forEach((code) => {
  descriptors[code] = { value: code };
});
Object.defineProperties(AxiosError, descriptors);
Object.defineProperty(prototype, "isAxiosError", { value: true });
AxiosError.from = (error, code, config, request2, response2, customProps) => {
  const axiosError = Object.create(prototype);
  utils_default.toFlatObject(error, axiosError, function filter2(obj) {
    return obj !== Error.prototype;
  }, (prop) => {
    return prop !== "isAxiosError";
  });
  AxiosError.call(axiosError, error.message, code, config, request2, response2);
  axiosError.cause = error;
  axiosError.name = error.name;
  customProps && Object.assign(axiosError, customProps);
  return axiosError;
};
var AxiosError_default = AxiosError;

// apps/backend/src/layers/dependencyLayer/nodejs/node_modules/axios/lib/platform/node/classes/FormData.js
var import_form_data = __toESM(require_form_data(), 1);
var FormData_default = import_form_data.default;

// apps/backend/src/layers/dependencyLayer/nodejs/node_modules/axios/lib/helpers/toFormData.js
function isVisitable(thing) {
  return utils_default.isPlainObject(thing) || utils_default.isArray(thing);
}
function removeBrackets(key) {
  return utils_default.endsWith(key, "[]") ? key.slice(0, -2) : key;
}
function renderKey(path, key, dots) {
  if (!path)
    return key;
  return path.concat(key).map(function each(token, i) {
    token = removeBrackets(token);
    return !dots && i ? "[" + token + "]" : token;
  }).join(dots ? "." : "");
}
function isFlatArray(arr) {
  return utils_default.isArray(arr) && !arr.some(isVisitable);
}
var predicates = utils_default.toFlatObject(utils_default, {}, null, function filter(prop) {
  return /^is[A-Z]/.test(prop);
});
function toFormData(obj, formData, options) {
  if (!utils_default.isObject(obj)) {
    throw new TypeError("target must be an object");
  }
  formData = formData || new (FormData_default || FormData)();
  options = utils_default.toFlatObject(options, {
    metaTokens: true,
    dots: false,
    indexes: false
  }, false, function defined(option, source) {
    return !utils_default.isUndefined(source[option]);
  });
  const metaTokens = options.metaTokens;
  const visitor = options.visitor || defaultVisitor;
  const dots = options.dots;
  const indexes = options.indexes;
  const _Blob = options.Blob || typeof Blob !== "undefined" && Blob;
  const useBlob = _Blob && utils_default.isSpecCompliantForm(formData);
  if (!utils_default.isFunction(visitor)) {
    throw new TypeError("visitor must be a function");
  }
  function convertValue(value) {
    if (value === null)
      return "";
    if (utils_default.isDate(value)) {
      return value.toISOString();
    }
    if (!useBlob && utils_default.isBlob(value)) {
      throw new AxiosError_default("Blob is not supported. Use a Buffer instead.");
    }
    if (utils_default.isArrayBuffer(value) || utils_default.isTypedArray(value)) {
      return useBlob && typeof Blob === "function" ? new Blob([value]) : Buffer.from(value);
    }
    return value;
  }
  function defaultVisitor(value, key, path) {
    let arr = value;
    if (value && !path && typeof value === "object") {
      if (utils_default.endsWith(key, "{}")) {
        key = metaTokens ? key : key.slice(0, -2);
        value = JSON.stringify(value);
      } else if (utils_default.isArray(value) && isFlatArray(value) || (utils_default.isFileList(value) || utils_default.endsWith(key, "[]")) && (arr = utils_default.toArray(value))) {
        key = removeBrackets(key);
        arr.forEach(function each(el, index) {
          !(utils_default.isUndefined(el) || el === null) && formData.append(
            // eslint-disable-next-line no-nested-ternary
            indexes === true ? renderKey([key], index, dots) : indexes === null ? key : key + "[]",
            convertValue(el)
          );
        });
        return false;
      }
    }
    if (isVisitable(value)) {
      return true;
    }
    formData.append(renderKey(path, key, dots), convertValue(value));
    return false;
  }
  const stack = [];
  const exposedHelpers = Object.assign(predicates, {
    defaultVisitor,
    convertValue,
    isVisitable
  });
  function build(value, path) {
    if (utils_default.isUndefined(value))
      return;
    if (stack.indexOf(value) !== -1) {
      throw Error("Circular reference detected in " + path.join("."));
    }
    stack.push(value);
    utils_default.forEach(value, function each(el, key) {
      const result = !(utils_default.isUndefined(el) || el === null) && visitor.call(
        formData,
        el,
        utils_default.isString(key) ? key.trim() : key,
        path,
        exposedHelpers
      );
      if (result === true) {
        build(el, path ? path.concat(key) : [key]);
      }
    });
    stack.pop();
  }
  if (!utils_default.isObject(obj)) {
    throw new TypeError("data must be an object");
  }
  build(obj);
  return formData;
}
var toFormData_default = toFormData;

// apps/backend/src/layers/dependencyLayer/nodejs/node_modules/axios/lib/helpers/AxiosURLSearchParams.js
function encode(str) {
  const charMap = {
    "!": "%21",
    "'": "%27",
    "(": "%28",
    ")": "%29",
    "~": "%7E",
    "%20": "+",
    "%00": "\0"
  };
  return encodeURIComponent(str).replace(/[!'()~]|%20|%00/g, function replacer(match) {
    return charMap[match];
  });
}
function AxiosURLSearchParams(params, options) {
  this._pairs = [];
  params && toFormData_default(params, this, options);
}
var prototype2 = AxiosURLSearchParams.prototype;
prototype2.append = function append(name, value) {
  this._pairs.push([name, value]);
};
prototype2.toString = function toString2(encoder) {
  const _encode = encoder ? function(value) {
    return encoder.call(this, value, encode);
  } : encode;
  return this._pairs.map(function each(pair) {
    return _encode(pair[0]) + "=" + _encode(pair[1]);
  }, "").join("&");
};
var AxiosURLSearchParams_default = AxiosURLSearchParams;

// apps/backend/src/layers/dependencyLayer/nodejs/node_modules/axios/lib/helpers/buildURL.js
function encode2(val) {
  return encodeURIComponent(val).replace(/%3A/gi, ":").replace(/%24/g, "$").replace(/%2C/gi, ",").replace(/%20/g, "+").replace(/%5B/gi, "[").replace(/%5D/gi, "]");
}
function buildURL(url2, params, options) {
  if (!params) {
    return url2;
  }
  const _encode = options && options.encode || encode2;
  const serializeFn = options && options.serialize;
  let serializedParams;
  if (serializeFn) {
    serializedParams = serializeFn(params, options);
  } else {
    serializedParams = utils_default.isURLSearchParams(params) ? params.toString() : new AxiosURLSearchParams_default(params, options).toString(_encode);
  }
  if (serializedParams) {
    const hashmarkIndex = url2.indexOf("#");
    if (hashmarkIndex !== -1) {
      url2 = url2.slice(0, hashmarkIndex);
    }
    url2 += (url2.indexOf("?") === -1 ? "?" : "&") + serializedParams;
  }
  return url2;
}

// apps/backend/src/layers/dependencyLayer/nodejs/node_modules/axios/lib/core/InterceptorManager.js
var InterceptorManager = class {
  constructor() {
    this.handlers = [];
  }
  /**
   * Add a new interceptor to the stack
   *
   * @param {Function} fulfilled The function to handle `then` for a `Promise`
   * @param {Function} rejected The function to handle `reject` for a `Promise`
   *
   * @return {Number} An ID used to remove interceptor later
   */
  use(fulfilled, rejected, options) {
    this.handlers.push({
      fulfilled,
      rejected,
      synchronous: options ? options.synchronous : false,
      runWhen: options ? options.runWhen : null
    });
    return this.handlers.length - 1;
  }
  /**
   * Remove an interceptor from the stack
   *
   * @param {Number} id The ID that was returned by `use`
   *
   * @returns {Boolean} `true` if the interceptor was removed, `false` otherwise
   */
  eject(id) {
    if (this.handlers[id]) {
      this.handlers[id] = null;
    }
  }
  /**
   * Clear all interceptors from the stack
   *
   * @returns {void}
   */
  clear() {
    if (this.handlers) {
      this.handlers = [];
    }
  }
  /**
   * Iterate over all the registered interceptors
   *
   * This method is particularly useful for skipping over any
   * interceptors that may have become `null` calling `eject`.
   *
   * @param {Function} fn The function to call for each interceptor
   *
   * @returns {void}
   */
  forEach(fn) {
    utils_default.forEach(this.handlers, function forEachHandler(h) {
      if (h !== null) {
        fn(h);
      }
    });
  }
};
var InterceptorManager_default = InterceptorManager;

// apps/backend/src/layers/dependencyLayer/nodejs/node_modules/axios/lib/defaults/transitional.js
var transitional_default = {
  silentJSONParsing: true,
  forcedJSONParsing: true,
  clarifyTimeoutError: false
};

// apps/backend/src/layers/dependencyLayer/nodejs/node_modules/axios/lib/platform/node/classes/URLSearchParams.js
import url from "url";
var URLSearchParams_default = url.URLSearchParams;

// apps/backend/src/layers/dependencyLayer/nodejs/node_modules/axios/lib/platform/node/index.js
var node_default = {
  isNode: true,
  classes: {
    URLSearchParams: URLSearchParams_default,
    FormData: FormData_default,
    Blob: typeof Blob !== "undefined" && Blob || null
  },
  protocols: ["http", "https", "file", "data"]
};

// apps/backend/src/layers/dependencyLayer/nodejs/node_modules/axios/lib/platform/common/utils.js
var utils_exports = {};
__export(utils_exports, {
  hasBrowserEnv: () => hasBrowserEnv,
  hasStandardBrowserEnv: () => hasStandardBrowserEnv,
  hasStandardBrowserWebWorkerEnv: () => hasStandardBrowserWebWorkerEnv
});
var hasBrowserEnv = typeof window !== "undefined" && typeof document !== "undefined";
var hasStandardBrowserEnv = ((product) => {
  return hasBrowserEnv && ["ReactNative", "NativeScript", "NS"].indexOf(product) < 0;
})(typeof navigator !== "undefined" && navigator.product);
var hasStandardBrowserWebWorkerEnv = (() => {
  return typeof WorkerGlobalScope !== "undefined" && // eslint-disable-next-line no-undef
  self instanceof WorkerGlobalScope && typeof self.importScripts === "function";
})();

// apps/backend/src/layers/dependencyLayer/nodejs/node_modules/axios/lib/platform/index.js
var platform_default = {
  ...utils_exports,
  ...node_default
};

// apps/backend/src/layers/dependencyLayer/nodejs/node_modules/axios/lib/helpers/toURLEncodedForm.js
function toURLEncodedForm(data, options) {
  return toFormData_default(data, new platform_default.classes.URLSearchParams(), Object.assign({
    visitor: function(value, key, path, helpers) {
      if (platform_default.isNode && utils_default.isBuffer(value)) {
        this.append(key, value.toString("base64"));
        return false;
      }
      return helpers.defaultVisitor.apply(this, arguments);
    }
  }, options));
}

// apps/backend/src/layers/dependencyLayer/nodejs/node_modules/axios/lib/helpers/formDataToJSON.js
function parsePropPath(name) {
  return utils_default.matchAll(/\w+|\[(\w*)]/g, name).map((match) => {
    return match[0] === "[]" ? "" : match[1] || match[0];
  });
}
function arrayToObject(arr) {
  const obj = {};
  const keys = Object.keys(arr);
  let i;
  const len = keys.length;
  let key;
  for (i = 0; i < len; i++) {
    key = keys[i];
    obj[key] = arr[key];
  }
  return obj;
}
function formDataToJSON(formData) {
  function buildPath(path, value, target, index) {
    let name = path[index++];
    if (name === "__proto__")
      return true;
    const isNumericKey = Number.isFinite(+name);
    const isLast = index >= path.length;
    name = !name && utils_default.isArray(target) ? target.length : name;
    if (isLast) {
      if (utils_default.hasOwnProp(target, name)) {
        target[name] = [target[name], value];
      } else {
        target[name] = value;
      }
      return !isNumericKey;
    }
    if (!target[name] || !utils_default.isObject(target[name])) {
      target[name] = [];
    }
    const result = buildPath(path, value, target[name], index);
    if (result && utils_default.isArray(target[name])) {
      target[name] = arrayToObject(target[name]);
    }
    return !isNumericKey;
  }
  if (utils_default.isFormData(formData) && utils_default.isFunction(formData.entries)) {
    const obj = {};
    utils_default.forEachEntry(formData, (name, value) => {
      buildPath(parsePropPath(name), value, obj, 0);
    });
    return obj;
  }
  return null;
}
var formDataToJSON_default = formDataToJSON;

// apps/backend/src/layers/dependencyLayer/nodejs/node_modules/axios/lib/defaults/index.js
function stringifySafely(rawValue, parser, encoder) {
  if (utils_default.isString(rawValue)) {
    try {
      (parser || JSON.parse)(rawValue);
      return utils_default.trim(rawValue);
    } catch (e) {
      if (e.name !== "SyntaxError") {
        throw e;
      }
    }
  }
  return (encoder || JSON.stringify)(rawValue);
}
var defaults = {
  transitional: transitional_default,
  adapter: ["xhr", "http"],
  transformRequest: [function transformRequest(data, headers) {
    const contentType = headers.getContentType() || "";
    const hasJSONContentType = contentType.indexOf("application/json") > -1;
    const isObjectPayload = utils_default.isObject(data);
    if (isObjectPayload && utils_default.isHTMLForm(data)) {
      data = new FormData(data);
    }
    const isFormData2 = utils_default.isFormData(data);
    if (isFormData2) {
      return hasJSONContentType ? JSON.stringify(formDataToJSON_default(data)) : data;
    }
    if (utils_default.isArrayBuffer(data) || utils_default.isBuffer(data) || utils_default.isStream(data) || utils_default.isFile(data) || utils_default.isBlob(data)) {
      return data;
    }
    if (utils_default.isArrayBufferView(data)) {
      return data.buffer;
    }
    if (utils_default.isURLSearchParams(data)) {
      headers.setContentType("application/x-www-form-urlencoded;charset=utf-8", false);
      return data.toString();
    }
    let isFileList2;
    if (isObjectPayload) {
      if (contentType.indexOf("application/x-www-form-urlencoded") > -1) {
        return toURLEncodedForm(data, this.formSerializer).toString();
      }
      if ((isFileList2 = utils_default.isFileList(data)) || contentType.indexOf("multipart/form-data") > -1) {
        const _FormData = this.env && this.env.FormData;
        return toFormData_default(
          isFileList2 ? { "files[]": data } : data,
          _FormData && new _FormData(),
          this.formSerializer
        );
      }
    }
    if (isObjectPayload || hasJSONContentType) {
      headers.setContentType("application/json", false);
      return stringifySafely(data);
    }
    return data;
  }],
  transformResponse: [function transformResponse(data) {
    const transitional2 = this.transitional || defaults.transitional;
    const forcedJSONParsing = transitional2 && transitional2.forcedJSONParsing;
    const JSONRequested = this.responseType === "json";
    if (data && utils_default.isString(data) && (forcedJSONParsing && !this.responseType || JSONRequested)) {
      const silentJSONParsing = transitional2 && transitional2.silentJSONParsing;
      const strictJSONParsing = !silentJSONParsing && JSONRequested;
      try {
        return JSON.parse(data);
      } catch (e) {
        if (strictJSONParsing) {
          if (e.name === "SyntaxError") {
            throw AxiosError_default.from(e, AxiosError_default.ERR_BAD_RESPONSE, this, null, this.response);
          }
          throw e;
        }
      }
    }
    return data;
  }],
  /**
   * A timeout in milliseconds to abort a request. If set to 0 (default) a
   * timeout is not created.
   */
  timeout: 0,
  xsrfCookieName: "XSRF-TOKEN",
  xsrfHeaderName: "X-XSRF-TOKEN",
  maxContentLength: -1,
  maxBodyLength: -1,
  env: {
    FormData: platform_default.classes.FormData,
    Blob: platform_default.classes.Blob
  },
  validateStatus: function validateStatus(status) {
    return status >= 200 && status < 300;
  },
  headers: {
    common: {
      "Accept": "application/json, text/plain, */*",
      "Content-Type": void 0
    }
  }
};
utils_default.forEach(["delete", "get", "head", "post", "put", "patch"], (method) => {
  defaults.headers[method] = {};
});
var defaults_default = defaults;

// apps/backend/src/layers/dependencyLayer/nodejs/node_modules/axios/lib/helpers/parseHeaders.js
var ignoreDuplicateOf = utils_default.toObjectSet([
  "age",
  "authorization",
  "content-length",
  "content-type",
  "etag",
  "expires",
  "from",
  "host",
  "if-modified-since",
  "if-unmodified-since",
  "last-modified",
  "location",
  "max-forwards",
  "proxy-authorization",
  "referer",
  "retry-after",
  "user-agent"
]);
var parseHeaders_default = (rawHeaders) => {
  const parsed = {};
  let key;
  let val;
  let i;
  rawHeaders && rawHeaders.split("\n").forEach(function parser(line) {
    i = line.indexOf(":");
    key = line.substring(0, i).trim().toLowerCase();
    val = line.substring(i + 1).trim();
    if (!key || parsed[key] && ignoreDuplicateOf[key]) {
      return;
    }
    if (key === "set-cookie") {
      if (parsed[key]) {
        parsed[key].push(val);
      } else {
        parsed[key] = [val];
      }
    } else {
      parsed[key] = parsed[key] ? parsed[key] + ", " + val : val;
    }
  });
  return parsed;
};

// apps/backend/src/layers/dependencyLayer/nodejs/node_modules/axios/lib/core/AxiosHeaders.js
var $internals = Symbol("internals");
function normalizeHeader(header) {
  return header && String(header).trim().toLowerCase();
}
function normalizeValue(value) {
  if (value === false || value == null) {
    return value;
  }
  return utils_default.isArray(value) ? value.map(normalizeValue) : String(value);
}
function parseTokens(str) {
  const tokens = /* @__PURE__ */ Object.create(null);
  const tokensRE = /([^\s,;=]+)\s*(?:=\s*([^,;]+))?/g;
  let match;
  while (match = tokensRE.exec(str)) {
    tokens[match[1]] = match[2];
  }
  return tokens;
}
var isValidHeaderName = (str) => /^[-_a-zA-Z0-9^`|~,!#$%&'*+.]+$/.test(str.trim());
function matchHeaderValue(context, value, header, filter2, isHeaderNameFilter) {
  if (utils_default.isFunction(filter2)) {
    return filter2.call(this, value, header);
  }
  if (isHeaderNameFilter) {
    value = header;
  }
  if (!utils_default.isString(value))
    return;
  if (utils_default.isString(filter2)) {
    return value.indexOf(filter2) !== -1;
  }
  if (utils_default.isRegExp(filter2)) {
    return filter2.test(value);
  }
}
function formatHeader(header) {
  return header.trim().toLowerCase().replace(/([a-z\d])(\w*)/g, (w, char, str) => {
    return char.toUpperCase() + str;
  });
}
function buildAccessors(obj, header) {
  const accessorName = utils_default.toCamelCase(" " + header);
  ["get", "set", "has"].forEach((methodName) => {
    Object.defineProperty(obj, methodName + accessorName, {
      value: function(arg1, arg2, arg3) {
        return this[methodName].call(this, header, arg1, arg2, arg3);
      },
      configurable: true
    });
  });
}
var AxiosHeaders = class {
  constructor(headers) {
    headers && this.set(headers);
  }
  set(header, valueOrRewrite, rewrite) {
    const self2 = this;
    function setHeader(_value, _header, _rewrite) {
      const lHeader = normalizeHeader(_header);
      if (!lHeader) {
        throw new Error("header name must be a non-empty string");
      }
      const key = utils_default.findKey(self2, lHeader);
      if (!key || self2[key] === void 0 || _rewrite === true || _rewrite === void 0 && self2[key] !== false) {
        self2[key || _header] = normalizeValue(_value);
      }
    }
    const setHeaders = (headers, _rewrite) => utils_default.forEach(headers, (_value, _header) => setHeader(_value, _header, _rewrite));
    if (utils_default.isPlainObject(header) || header instanceof this.constructor) {
      setHeaders(header, valueOrRewrite);
    } else if (utils_default.isString(header) && (header = header.trim()) && !isValidHeaderName(header)) {
      setHeaders(parseHeaders_default(header), valueOrRewrite);
    } else {
      header != null && setHeader(valueOrRewrite, header, rewrite);
    }
    return this;
  }
  get(header, parser) {
    header = normalizeHeader(header);
    if (header) {
      const key = utils_default.findKey(this, header);
      if (key) {
        const value = this[key];
        if (!parser) {
          return value;
        }
        if (parser === true) {
          return parseTokens(value);
        }
        if (utils_default.isFunction(parser)) {
          return parser.call(this, value, key);
        }
        if (utils_default.isRegExp(parser)) {
          return parser.exec(value);
        }
        throw new TypeError("parser must be boolean|regexp|function");
      }
    }
  }
  has(header, matcher) {
    header = normalizeHeader(header);
    if (header) {
      const key = utils_default.findKey(this, header);
      return !!(key && this[key] !== void 0 && (!matcher || matchHeaderValue(this, this[key], key, matcher)));
    }
    return false;
  }
  delete(header, matcher) {
    const self2 = this;
    let deleted = false;
    function deleteHeader(_header) {
      _header = normalizeHeader(_header);
      if (_header) {
        const key = utils_default.findKey(self2, _header);
        if (key && (!matcher || matchHeaderValue(self2, self2[key], key, matcher))) {
          delete self2[key];
          deleted = true;
        }
      }
    }
    if (utils_default.isArray(header)) {
      header.forEach(deleteHeader);
    } else {
      deleteHeader(header);
    }
    return deleted;
  }
  clear(matcher) {
    const keys = Object.keys(this);
    let i = keys.length;
    let deleted = false;
    while (i--) {
      const key = keys[i];
      if (!matcher || matchHeaderValue(this, this[key], key, matcher, true)) {
        delete this[key];
        deleted = true;
      }
    }
    return deleted;
  }
  normalize(format) {
    const self2 = this;
    const headers = {};
    utils_default.forEach(this, (value, header) => {
      const key = utils_default.findKey(headers, header);
      if (key) {
        self2[key] = normalizeValue(value);
        delete self2[header];
        return;
      }
      const normalized = format ? formatHeader(header) : String(header).trim();
      if (normalized !== header) {
        delete self2[header];
      }
      self2[normalized] = normalizeValue(value);
      headers[normalized] = true;
    });
    return this;
  }
  concat(...targets) {
    return this.constructor.concat(this, ...targets);
  }
  toJSON(asStrings) {
    const obj = /* @__PURE__ */ Object.create(null);
    utils_default.forEach(this, (value, header) => {
      value != null && value !== false && (obj[header] = asStrings && utils_default.isArray(value) ? value.join(", ") : value);
    });
    return obj;
  }
  [Symbol.iterator]() {
    return Object.entries(this.toJSON())[Symbol.iterator]();
  }
  toString() {
    return Object.entries(this.toJSON()).map(([header, value]) => header + ": " + value).join("\n");
  }
  get [Symbol.toStringTag]() {
    return "AxiosHeaders";
  }
  static from(thing) {
    return thing instanceof this ? thing : new this(thing);
  }
  static concat(first, ...targets) {
    const computed = new this(first);
    targets.forEach((target) => computed.set(target));
    return computed;
  }
  static accessor(header) {
    const internals = this[$internals] = this[$internals] = {
      accessors: {}
    };
    const accessors = internals.accessors;
    const prototype3 = this.prototype;
    function defineAccessor(_header) {
      const lHeader = normalizeHeader(_header);
      if (!accessors[lHeader]) {
        buildAccessors(prototype3, _header);
        accessors[lHeader] = true;
      }
    }
    utils_default.isArray(header) ? header.forEach(defineAccessor) : defineAccessor(header);
    return this;
  }
};
AxiosHeaders.accessor(["Content-Type", "Content-Length", "Accept", "Accept-Encoding", "User-Agent", "Authorization"]);
utils_default.reduceDescriptors(AxiosHeaders.prototype, ({ value }, key) => {
  let mapped = key[0].toUpperCase() + key.slice(1);
  return {
    get: () => value,
    set(headerValue) {
      this[mapped] = headerValue;
    }
  };
});
utils_default.freezeMethods(AxiosHeaders);
var AxiosHeaders_default = AxiosHeaders;

// apps/backend/src/layers/dependencyLayer/nodejs/node_modules/axios/lib/core/transformData.js
function transformData(fns, response2) {
  const config = this || defaults_default;
  const context = response2 || config;
  const headers = AxiosHeaders_default.from(context.headers);
  let data = context.data;
  utils_default.forEach(fns, function transform(fn) {
    data = fn.call(config, data, headers.normalize(), response2 ? response2.status : void 0);
  });
  headers.normalize();
  return data;
}

// apps/backend/src/layers/dependencyLayer/nodejs/node_modules/axios/lib/cancel/isCancel.js
function isCancel(value) {
  return !!(value && value.__CANCEL__);
}

// apps/backend/src/layers/dependencyLayer/nodejs/node_modules/axios/lib/cancel/CanceledError.js
function CanceledError(message, config, request2) {
  AxiosError_default.call(this, message == null ? "canceled" : message, AxiosError_default.ERR_CANCELED, config, request2);
  this.name = "CanceledError";
}
utils_default.inherits(CanceledError, AxiosError_default, {
  __CANCEL__: true
});
var CanceledError_default = CanceledError;

// apps/backend/src/layers/dependencyLayer/nodejs/node_modules/axios/lib/core/settle.js
function settle(resolve, reject, response2) {
  const validateStatus2 = response2.config.validateStatus;
  if (!response2.status || !validateStatus2 || validateStatus2(response2.status)) {
    resolve(response2);
  } else {
    reject(new AxiosError_default(
      "Request failed with status code " + response2.status,
      [AxiosError_default.ERR_BAD_REQUEST, AxiosError_default.ERR_BAD_RESPONSE][Math.floor(response2.status / 100) - 4],
      response2.config,
      response2.request,
      response2
    ));
  }
}

// apps/backend/src/layers/dependencyLayer/nodejs/node_modules/axios/lib/helpers/isAbsoluteURL.js
function isAbsoluteURL(url2) {
  return /^([a-z][a-z\d+\-.]*:)?\/\//i.test(url2);
}

// apps/backend/src/layers/dependencyLayer/nodejs/node_modules/axios/lib/helpers/combineURLs.js
function combineURLs(baseURL, relativeURL) {
  return relativeURL ? baseURL.replace(/\/?\/$/, "") + "/" + relativeURL.replace(/^\/+/, "") : baseURL;
}

// apps/backend/src/layers/dependencyLayer/nodejs/node_modules/axios/lib/core/buildFullPath.js
function buildFullPath(baseURL, requestedURL) {
  if (baseURL && !isAbsoluteURL(requestedURL)) {
    return combineURLs(baseURL, requestedURL);
  }
  return requestedURL;
}

// apps/backend/src/layers/dependencyLayer/nodejs/node_modules/axios/lib/adapters/http.js
var import_proxy_from_env = __toESM(require_proxy_from_env(), 1);
var import_follow_redirects = __toESM(require_follow_redirects(), 1);
import http from "http";
import https from "https";
import util from "util";
import zlib from "zlib";

// apps/backend/src/layers/dependencyLayer/nodejs/node_modules/axios/lib/env/data.js
var VERSION = "1.6.7";

// apps/backend/src/layers/dependencyLayer/nodejs/node_modules/axios/lib/helpers/parseProtocol.js
function parseProtocol(url2) {
  const match = /^([-+\w]{1,25})(:?\/\/|:)/.exec(url2);
  return match && match[1] || "";
}

// apps/backend/src/layers/dependencyLayer/nodejs/node_modules/axios/lib/helpers/fromDataURI.js
var DATA_URL_PATTERN = /^(?:([^;]+);)?(?:[^;]+;)?(base64|),([\s\S]*)$/;
function fromDataURI(uri, asBlob, options) {
  const _Blob = options && options.Blob || platform_default.classes.Blob;
  const protocol = parseProtocol(uri);
  if (asBlob === void 0 && _Blob) {
    asBlob = true;
  }
  if (protocol === "data") {
    uri = protocol.length ? uri.slice(protocol.length + 1) : uri;
    const match = DATA_URL_PATTERN.exec(uri);
    if (!match) {
      throw new AxiosError_default("Invalid URL", AxiosError_default.ERR_INVALID_URL);
    }
    const mime = match[1];
    const isBase64 = match[2];
    const body = match[3];
    const buffer = Buffer.from(decodeURIComponent(body), isBase64 ? "base64" : "utf8");
    if (asBlob) {
      if (!_Blob) {
        throw new AxiosError_default("Blob is not supported", AxiosError_default.ERR_NOT_SUPPORT);
      }
      return new _Blob([buffer], { type: mime });
    }
    return buffer;
  }
  throw new AxiosError_default("Unsupported protocol " + protocol, AxiosError_default.ERR_NOT_SUPPORT);
}

// apps/backend/src/layers/dependencyLayer/nodejs/node_modules/axios/lib/adapters/http.js
import stream3 from "stream";

// apps/backend/src/layers/dependencyLayer/nodejs/node_modules/axios/lib/helpers/AxiosTransformStream.js
import stream from "stream";

// apps/backend/src/layers/dependencyLayer/nodejs/node_modules/axios/lib/helpers/throttle.js
function throttle(fn, freq) {
  let timestamp = 0;
  const threshold = 1e3 / freq;
  let timer = null;
  return function throttled(force, args) {
    const now = Date.now();
    if (force || now - timestamp > threshold) {
      if (timer) {
        clearTimeout(timer);
        timer = null;
      }
      timestamp = now;
      return fn.apply(null, args);
    }
    if (!timer) {
      timer = setTimeout(() => {
        timer = null;
        timestamp = Date.now();
        return fn.apply(null, args);
      }, threshold - (now - timestamp));
    }
  };
}
var throttle_default = throttle;

// apps/backend/src/layers/dependencyLayer/nodejs/node_modules/axios/lib/helpers/speedometer.js
function speedometer(samplesCount, min) {
  samplesCount = samplesCount || 10;
  const bytes = new Array(samplesCount);
  const timestamps = new Array(samplesCount);
  let head = 0;
  let tail = 0;
  let firstSampleTS;
  min = min !== void 0 ? min : 1e3;
  return function push(chunkLength) {
    const now = Date.now();
    const startedAt = timestamps[tail];
    if (!firstSampleTS) {
      firstSampleTS = now;
    }
    bytes[head] = chunkLength;
    timestamps[head] = now;
    let i = tail;
    let bytesCount = 0;
    while (i !== head) {
      bytesCount += bytes[i++];
      i = i % samplesCount;
    }
    head = (head + 1) % samplesCount;
    if (head === tail) {
      tail = (tail + 1) % samplesCount;
    }
    if (now - firstSampleTS < min) {
      return;
    }
    const passed = startedAt && now - startedAt;
    return passed ? Math.round(bytesCount * 1e3 / passed) : void 0;
  };
}
var speedometer_default = speedometer;

// apps/backend/src/layers/dependencyLayer/nodejs/node_modules/axios/lib/helpers/AxiosTransformStream.js
var kInternals = Symbol("internals");
var AxiosTransformStream = class extends stream.Transform {
  constructor(options) {
    options = utils_default.toFlatObject(options, {
      maxRate: 0,
      chunkSize: 64 * 1024,
      minChunkSize: 100,
      timeWindow: 500,
      ticksRate: 2,
      samplesCount: 15
    }, null, (prop, source) => {
      return !utils_default.isUndefined(source[prop]);
    });
    super({
      readableHighWaterMark: options.chunkSize
    });
    const self2 = this;
    const internals = this[kInternals] = {
      length: options.length,
      timeWindow: options.timeWindow,
      ticksRate: options.ticksRate,
      chunkSize: options.chunkSize,
      maxRate: options.maxRate,
      minChunkSize: options.minChunkSize,
      bytesSeen: 0,
      isCaptured: false,
      notifiedBytesLoaded: 0,
      ts: Date.now(),
      bytes: 0,
      onReadCallback: null
    };
    const _speedometer = speedometer_default(internals.ticksRate * options.samplesCount, internals.timeWindow);
    this.on("newListener", (event) => {
      if (event === "progress") {
        if (!internals.isCaptured) {
          internals.isCaptured = true;
        }
      }
    });
    let bytesNotified = 0;
    internals.updateProgress = throttle_default(function throttledHandler() {
      const totalBytes = internals.length;
      const bytesTransferred = internals.bytesSeen;
      const progressBytes = bytesTransferred - bytesNotified;
      if (!progressBytes || self2.destroyed)
        return;
      const rate = _speedometer(progressBytes);
      bytesNotified = bytesTransferred;
      process.nextTick(() => {
        self2.emit("progress", {
          "loaded": bytesTransferred,
          "total": totalBytes,
          "progress": totalBytes ? bytesTransferred / totalBytes : void 0,
          "bytes": progressBytes,
          "rate": rate ? rate : void 0,
          "estimated": rate && totalBytes && bytesTransferred <= totalBytes ? (totalBytes - bytesTransferred) / rate : void 0
        });
      });
    }, internals.ticksRate);
    const onFinish = () => {
      internals.updateProgress(true);
    };
    this.once("end", onFinish);
    this.once("error", onFinish);
  }
  _read(size) {
    const internals = this[kInternals];
    if (internals.onReadCallback) {
      internals.onReadCallback();
    }
    return super._read(size);
  }
  _transform(chunk, encoding, callback) {
    const self2 = this;
    const internals = this[kInternals];
    const maxRate = internals.maxRate;
    const readableHighWaterMark = this.readableHighWaterMark;
    const timeWindow = internals.timeWindow;
    const divider = 1e3 / timeWindow;
    const bytesThreshold = maxRate / divider;
    const minChunkSize = internals.minChunkSize !== false ? Math.max(internals.minChunkSize, bytesThreshold * 0.01) : 0;
    function pushChunk(_chunk, _callback) {
      const bytes = Buffer.byteLength(_chunk);
      internals.bytesSeen += bytes;
      internals.bytes += bytes;
      if (internals.isCaptured) {
        internals.updateProgress();
      }
      if (self2.push(_chunk)) {
        process.nextTick(_callback);
      } else {
        internals.onReadCallback = () => {
          internals.onReadCallback = null;
          process.nextTick(_callback);
        };
      }
    }
    const transformChunk = (_chunk, _callback) => {
      const chunkSize = Buffer.byteLength(_chunk);
      let chunkRemainder = null;
      let maxChunkSize = readableHighWaterMark;
      let bytesLeft;
      let passed = 0;
      if (maxRate) {
        const now = Date.now();
        if (!internals.ts || (passed = now - internals.ts) >= timeWindow) {
          internals.ts = now;
          bytesLeft = bytesThreshold - internals.bytes;
          internals.bytes = bytesLeft < 0 ? -bytesLeft : 0;
          passed = 0;
        }
        bytesLeft = bytesThreshold - internals.bytes;
      }
      if (maxRate) {
        if (bytesLeft <= 0) {
          return setTimeout(() => {
            _callback(null, _chunk);
          }, timeWindow - passed);
        }
        if (bytesLeft < maxChunkSize) {
          maxChunkSize = bytesLeft;
        }
      }
      if (maxChunkSize && chunkSize > maxChunkSize && chunkSize - maxChunkSize > minChunkSize) {
        chunkRemainder = _chunk.subarray(maxChunkSize);
        _chunk = _chunk.subarray(0, maxChunkSize);
      }
      pushChunk(_chunk, chunkRemainder ? () => {
        process.nextTick(_callback, null, chunkRemainder);
      } : _callback);
    };
    transformChunk(chunk, function transformNextChunk(err, _chunk) {
      if (err) {
        return callback(err);
      }
      if (_chunk) {
        transformChunk(_chunk, transformNextChunk);
      } else {
        callback(null);
      }
    });
  }
  setLength(length) {
    this[kInternals].length = +length;
    return this;
  }
};
var AxiosTransformStream_default = AxiosTransformStream;

// apps/backend/src/layers/dependencyLayer/nodejs/node_modules/axios/lib/adapters/http.js
import EventEmitter from "events";

// apps/backend/src/layers/dependencyLayer/nodejs/node_modules/axios/lib/helpers/formDataToStream.js
import { TextEncoder } from "util";
import { Readable } from "stream";

// apps/backend/src/layers/dependencyLayer/nodejs/node_modules/axios/lib/helpers/readBlob.js
var { asyncIterator } = Symbol;
var readBlob = async function* (blob) {
  if (blob.stream) {
    yield* blob.stream();
  } else if (blob.arrayBuffer) {
    yield await blob.arrayBuffer();
  } else if (blob[asyncIterator]) {
    yield* blob[asyncIterator]();
  } else {
    yield blob;
  }
};
var readBlob_default = readBlob;

// apps/backend/src/layers/dependencyLayer/nodejs/node_modules/axios/lib/helpers/formDataToStream.js
var BOUNDARY_ALPHABET = utils_default.ALPHABET.ALPHA_DIGIT + "-_";
var textEncoder = new TextEncoder();
var CRLF = "\r\n";
var CRLF_BYTES = textEncoder.encode(CRLF);
var CRLF_BYTES_COUNT = 2;
var FormDataPart = class {
  constructor(name, value) {
    const { escapeName } = this.constructor;
    const isStringValue = utils_default.isString(value);
    let headers = `Content-Disposition: form-data; name="${escapeName(name)}"${!isStringValue && value.name ? `; filename="${escapeName(value.name)}"` : ""}${CRLF}`;
    if (isStringValue) {
      value = textEncoder.encode(String(value).replace(/\r?\n|\r\n?/g, CRLF));
    } else {
      headers += `Content-Type: ${value.type || "application/octet-stream"}${CRLF}`;
    }
    this.headers = textEncoder.encode(headers + CRLF);
    this.contentLength = isStringValue ? value.byteLength : value.size;
    this.size = this.headers.byteLength + this.contentLength + CRLF_BYTES_COUNT;
    this.name = name;
    this.value = value;
  }
  async *encode() {
    yield this.headers;
    const { value } = this;
    if (utils_default.isTypedArray(value)) {
      yield value;
    } else {
      yield* readBlob_default(value);
    }
    yield CRLF_BYTES;
  }
  static escapeName(name) {
    return String(name).replace(/[\r\n"]/g, (match) => ({
      "\r": "%0D",
      "\n": "%0A",
      '"': "%22"
    })[match]);
  }
};
var formDataToStream = (form, headersHandler, options) => {
  const {
    tag = "form-data-boundary",
    size = 25,
    boundary = tag + "-" + utils_default.generateString(size, BOUNDARY_ALPHABET)
  } = options || {};
  if (!utils_default.isFormData(form)) {
    throw TypeError("FormData instance required");
  }
  if (boundary.length < 1 || boundary.length > 70) {
    throw Error("boundary must be 10-70 characters long");
  }
  const boundaryBytes = textEncoder.encode("--" + boundary + CRLF);
  const footerBytes = textEncoder.encode("--" + boundary + "--" + CRLF + CRLF);
  let contentLength = footerBytes.byteLength;
  const parts = Array.from(form.entries()).map(([name, value]) => {
    const part = new FormDataPart(name, value);
    contentLength += part.size;
    return part;
  });
  contentLength += boundaryBytes.byteLength * parts.length;
  contentLength = utils_default.toFiniteNumber(contentLength);
  const computedHeaders = {
    "Content-Type": `multipart/form-data; boundary=${boundary}`
  };
  if (Number.isFinite(contentLength)) {
    computedHeaders["Content-Length"] = contentLength;
  }
  headersHandler && headersHandler(computedHeaders);
  return Readable.from(async function* () {
    for (const part of parts) {
      yield boundaryBytes;
      yield* part.encode();
    }
    yield footerBytes;
  }());
};
var formDataToStream_default = formDataToStream;

// apps/backend/src/layers/dependencyLayer/nodejs/node_modules/axios/lib/helpers/ZlibHeaderTransformStream.js
import stream2 from "stream";
var ZlibHeaderTransformStream = class extends stream2.Transform {
  __transform(chunk, encoding, callback) {
    this.push(chunk);
    callback();
  }
  _transform(chunk, encoding, callback) {
    if (chunk.length !== 0) {
      this._transform = this.__transform;
      if (chunk[0] !== 120) {
        const header = Buffer.alloc(2);
        header[0] = 120;
        header[1] = 156;
        this.push(header, encoding);
      }
    }
    this.__transform(chunk, encoding, callback);
  }
};
var ZlibHeaderTransformStream_default = ZlibHeaderTransformStream;

// apps/backend/src/layers/dependencyLayer/nodejs/node_modules/axios/lib/helpers/callbackify.js
var callbackify = (fn, reducer) => {
  return utils_default.isAsyncFn(fn) ? function(...args) {
    const cb = args.pop();
    fn.apply(this, args).then((value) => {
      try {
        reducer ? cb(null, ...reducer(value)) : cb(null, value);
      } catch (err) {
        cb(err);
      }
    }, cb);
  } : fn;
};
var callbackify_default = callbackify;

// apps/backend/src/layers/dependencyLayer/nodejs/node_modules/axios/lib/adapters/http.js
var zlibOptions = {
  flush: zlib.constants.Z_SYNC_FLUSH,
  finishFlush: zlib.constants.Z_SYNC_FLUSH
};
var brotliOptions = {
  flush: zlib.constants.BROTLI_OPERATION_FLUSH,
  finishFlush: zlib.constants.BROTLI_OPERATION_FLUSH
};
var isBrotliSupported = utils_default.isFunction(zlib.createBrotliDecompress);
var { http: httpFollow, https: httpsFollow } = import_follow_redirects.default;
var isHttps = /https:?/;
var supportedProtocols = platform_default.protocols.map((protocol) => {
  return protocol + ":";
});
function dispatchBeforeRedirect(options, responseDetails) {
  if (options.beforeRedirects.proxy) {
    options.beforeRedirects.proxy(options);
  }
  if (options.beforeRedirects.config) {
    options.beforeRedirects.config(options, responseDetails);
  }
}
function setProxy(options, configProxy, location) {
  let proxy = configProxy;
  if (!proxy && proxy !== false) {
    const proxyUrl = (0, import_proxy_from_env.getProxyForUrl)(location);
    if (proxyUrl) {
      proxy = new URL(proxyUrl);
    }
  }
  if (proxy) {
    if (proxy.username) {
      proxy.auth = (proxy.username || "") + ":" + (proxy.password || "");
    }
    if (proxy.auth) {
      if (proxy.auth.username || proxy.auth.password) {
        proxy.auth = (proxy.auth.username || "") + ":" + (proxy.auth.password || "");
      }
      const base64 = Buffer.from(proxy.auth, "utf8").toString("base64");
      options.headers["Proxy-Authorization"] = "Basic " + base64;
    }
    options.headers.host = options.hostname + (options.port ? ":" + options.port : "");
    const proxyHost = proxy.hostname || proxy.host;
    options.hostname = proxyHost;
    options.host = proxyHost;
    options.port = proxy.port;
    options.path = location;
    if (proxy.protocol) {
      options.protocol = proxy.protocol.includes(":") ? proxy.protocol : `${proxy.protocol}:`;
    }
  }
  options.beforeRedirects.proxy = function beforeRedirect(redirectOptions) {
    setProxy(redirectOptions, configProxy, redirectOptions.href);
  };
}
var isHttpAdapterSupported = typeof process !== "undefined" && utils_default.kindOf(process) === "process";
var wrapAsync = (asyncExecutor) => {
  return new Promise((resolve, reject) => {
    let onDone;
    let isDone;
    const done = (value, isRejected) => {
      if (isDone)
        return;
      isDone = true;
      onDone && onDone(value, isRejected);
    };
    const _resolve = (value) => {
      done(value);
      resolve(value);
    };
    const _reject = (reason) => {
      done(reason, true);
      reject(reason);
    };
    asyncExecutor(_resolve, _reject, (onDoneHandler) => onDone = onDoneHandler).catch(_reject);
  });
};
var resolveFamily = ({ address, family }) => {
  if (!utils_default.isString(address)) {
    throw TypeError("address must be a string");
  }
  return {
    address,
    family: family || (address.indexOf(".") < 0 ? 6 : 4)
  };
};
var buildAddressEntry = (address, family) => resolveFamily(utils_default.isObject(address) ? address : { address, family });
var http_default = isHttpAdapterSupported && function httpAdapter(config) {
  return wrapAsync(async function dispatchHttpRequest(resolve, reject, onDone) {
    let { data, lookup, family } = config;
    const { responseType, responseEncoding } = config;
    const method = config.method.toUpperCase();
    let isDone;
    let rejected = false;
    let req;
    if (lookup) {
      const _lookup = callbackify_default(lookup, (value) => utils_default.isArray(value) ? value : [value]);
      lookup = (hostname, opt, cb) => {
        _lookup(hostname, opt, (err, arg0, arg1) => {
          if (err) {
            return cb(err);
          }
          const addresses = utils_default.isArray(arg0) ? arg0.map((addr) => buildAddressEntry(addr)) : [buildAddressEntry(arg0, arg1)];
          opt.all ? cb(err, addresses) : cb(err, addresses[0].address, addresses[0].family);
        });
      };
    }
    const emitter = new EventEmitter();
    const onFinished = () => {
      if (config.cancelToken) {
        config.cancelToken.unsubscribe(abort);
      }
      if (config.signal) {
        config.signal.removeEventListener("abort", abort);
      }
      emitter.removeAllListeners();
    };
    onDone((value, isRejected) => {
      isDone = true;
      if (isRejected) {
        rejected = true;
        onFinished();
      }
    });
    function abort(reason) {
      emitter.emit("abort", !reason || reason.type ? new CanceledError_default(null, config, req) : reason);
    }
    emitter.once("abort", reject);
    if (config.cancelToken || config.signal) {
      config.cancelToken && config.cancelToken.subscribe(abort);
      if (config.signal) {
        config.signal.aborted ? abort() : config.signal.addEventListener("abort", abort);
      }
    }
    const fullPath = buildFullPath(config.baseURL, config.url);
    const parsed = new URL(fullPath, "http://localhost");
    const protocol = parsed.protocol || supportedProtocols[0];
    if (protocol === "data:") {
      let convertedData;
      if (method !== "GET") {
        return settle(resolve, reject, {
          status: 405,
          statusText: "method not allowed",
          headers: {},
          config
        });
      }
      try {
        convertedData = fromDataURI(config.url, responseType === "blob", {
          Blob: config.env && config.env.Blob
        });
      } catch (err) {
        throw AxiosError_default.from(err, AxiosError_default.ERR_BAD_REQUEST, config);
      }
      if (responseType === "text") {
        convertedData = convertedData.toString(responseEncoding);
        if (!responseEncoding || responseEncoding === "utf8") {
          convertedData = utils_default.stripBOM(convertedData);
        }
      } else if (responseType === "stream") {
        convertedData = stream3.Readable.from(convertedData);
      }
      return settle(resolve, reject, {
        data: convertedData,
        status: 200,
        statusText: "OK",
        headers: new AxiosHeaders_default(),
        config
      });
    }
    if (supportedProtocols.indexOf(protocol) === -1) {
      return reject(new AxiosError_default(
        "Unsupported protocol " + protocol,
        AxiosError_default.ERR_BAD_REQUEST,
        config
      ));
    }
    const headers = AxiosHeaders_default.from(config.headers).normalize();
    headers.set("User-Agent", "axios/" + VERSION, false);
    const onDownloadProgress = config.onDownloadProgress;
    const onUploadProgress = config.onUploadProgress;
    const maxRate = config.maxRate;
    let maxUploadRate = void 0;
    let maxDownloadRate = void 0;
    if (utils_default.isSpecCompliantForm(data)) {
      const userBoundary = headers.getContentType(/boundary=([-_\w\d]{10,70})/i);
      data = formDataToStream_default(data, (formHeaders) => {
        headers.set(formHeaders);
      }, {
        tag: `axios-${VERSION}-boundary`,
        boundary: userBoundary && userBoundary[1] || void 0
      });
    } else if (utils_default.isFormData(data) && utils_default.isFunction(data.getHeaders)) {
      headers.set(data.getHeaders());
      if (!headers.hasContentLength()) {
        try {
          const knownLength = await util.promisify(data.getLength).call(data);
          Number.isFinite(knownLength) && knownLength >= 0 && headers.setContentLength(knownLength);
        } catch (e) {
        }
      }
    } else if (utils_default.isBlob(data)) {
      data.size && headers.setContentType(data.type || "application/octet-stream");
      headers.setContentLength(data.size || 0);
      data = stream3.Readable.from(readBlob_default(data));
    } else if (data && !utils_default.isStream(data)) {
      if (Buffer.isBuffer(data)) {
      } else if (utils_default.isArrayBuffer(data)) {
        data = Buffer.from(new Uint8Array(data));
      } else if (utils_default.isString(data)) {
        data = Buffer.from(data, "utf-8");
      } else {
        return reject(new AxiosError_default(
          "Data after transformation must be a string, an ArrayBuffer, a Buffer, or a Stream",
          AxiosError_default.ERR_BAD_REQUEST,
          config
        ));
      }
      headers.setContentLength(data.length, false);
      if (config.maxBodyLength > -1 && data.length > config.maxBodyLength) {
        return reject(new AxiosError_default(
          "Request body larger than maxBodyLength limit",
          AxiosError_default.ERR_BAD_REQUEST,
          config
        ));
      }
    }
    const contentLength = utils_default.toFiniteNumber(headers.getContentLength());
    if (utils_default.isArray(maxRate)) {
      maxUploadRate = maxRate[0];
      maxDownloadRate = maxRate[1];
    } else {
      maxUploadRate = maxDownloadRate = maxRate;
    }
    if (data && (onUploadProgress || maxUploadRate)) {
      if (!utils_default.isStream(data)) {
        data = stream3.Readable.from(data, { objectMode: false });
      }
      data = stream3.pipeline([data, new AxiosTransformStream_default({
        length: contentLength,
        maxRate: utils_default.toFiniteNumber(maxUploadRate)
      })], utils_default.noop);
      onUploadProgress && data.on("progress", (progress) => {
        onUploadProgress(Object.assign(progress, {
          upload: true
        }));
      });
    }
    let auth = void 0;
    if (config.auth) {
      const username = config.auth.username || "";
      const password = config.auth.password || "";
      auth = username + ":" + password;
    }
    if (!auth && parsed.username) {
      const urlUsername = parsed.username;
      const urlPassword = parsed.password;
      auth = urlUsername + ":" + urlPassword;
    }
    auth && headers.delete("authorization");
    let path;
    try {
      path = buildURL(
        parsed.pathname + parsed.search,
        config.params,
        config.paramsSerializer
      ).replace(/^\?/, "");
    } catch (err) {
      const customErr = new Error(err.message);
      customErr.config = config;
      customErr.url = config.url;
      customErr.exists = true;
      return reject(customErr);
    }
    headers.set(
      "Accept-Encoding",
      "gzip, compress, deflate" + (isBrotliSupported ? ", br" : ""),
      false
    );
    const options = {
      path,
      method,
      headers: headers.toJSON(),
      agents: { http: config.httpAgent, https: config.httpsAgent },
      auth,
      protocol,
      family,
      beforeRedirect: dispatchBeforeRedirect,
      beforeRedirects: {}
    };
    !utils_default.isUndefined(lookup) && (options.lookup = lookup);
    if (config.socketPath) {
      options.socketPath = config.socketPath;
    } else {
      options.hostname = parsed.hostname;
      options.port = parsed.port;
      setProxy(options, config.proxy, protocol + "//" + parsed.hostname + (parsed.port ? ":" + parsed.port : "") + options.path);
    }
    let transport;
    const isHttpsRequest = isHttps.test(options.protocol);
    options.agent = isHttpsRequest ? config.httpsAgent : config.httpAgent;
    if (config.transport) {
      transport = config.transport;
    } else if (config.maxRedirects === 0) {
      transport = isHttpsRequest ? https : http;
    } else {
      if (config.maxRedirects) {
        options.maxRedirects = config.maxRedirects;
      }
      if (config.beforeRedirect) {
        options.beforeRedirects.config = config.beforeRedirect;
      }
      transport = isHttpsRequest ? httpsFollow : httpFollow;
    }
    if (config.maxBodyLength > -1) {
      options.maxBodyLength = config.maxBodyLength;
    } else {
      options.maxBodyLength = Infinity;
    }
    if (config.insecureHTTPParser) {
      options.insecureHTTPParser = config.insecureHTTPParser;
    }
    req = transport.request(options, function handleResponse(res) {
      if (req.destroyed)
        return;
      const streams = [res];
      const responseLength = +res.headers["content-length"];
      if (onDownloadProgress) {
        const transformStream = new AxiosTransformStream_default({
          length: utils_default.toFiniteNumber(responseLength),
          maxRate: utils_default.toFiniteNumber(maxDownloadRate)
        });
        onDownloadProgress && transformStream.on("progress", (progress) => {
          onDownloadProgress(Object.assign(progress, {
            download: true
          }));
        });
        streams.push(transformStream);
      }
      let responseStream = res;
      const lastRequest = res.req || req;
      if (config.decompress !== false && res.headers["content-encoding"]) {
        if (method === "HEAD" || res.statusCode === 204) {
          delete res.headers["content-encoding"];
        }
        switch ((res.headers["content-encoding"] || "").toLowerCase()) {
          case "gzip":
          case "x-gzip":
          case "compress":
          case "x-compress":
            streams.push(zlib.createUnzip(zlibOptions));
            delete res.headers["content-encoding"];
            break;
          case "deflate":
            streams.push(new ZlibHeaderTransformStream_default());
            streams.push(zlib.createUnzip(zlibOptions));
            delete res.headers["content-encoding"];
            break;
          case "br":
            if (isBrotliSupported) {
              streams.push(zlib.createBrotliDecompress(brotliOptions));
              delete res.headers["content-encoding"];
            }
        }
      }
      responseStream = streams.length > 1 ? stream3.pipeline(streams, utils_default.noop) : streams[0];
      const offListeners = stream3.finished(responseStream, () => {
        offListeners();
        onFinished();
      });
      const response2 = {
        status: res.statusCode,
        statusText: res.statusMessage,
        headers: new AxiosHeaders_default(res.headers),
        config,
        request: lastRequest
      };
      if (responseType === "stream") {
        response2.data = responseStream;
        settle(resolve, reject, response2);
      } else {
        const responseBuffer = [];
        let totalResponseBytes = 0;
        responseStream.on("data", function handleStreamData(chunk) {
          responseBuffer.push(chunk);
          totalResponseBytes += chunk.length;
          if (config.maxContentLength > -1 && totalResponseBytes > config.maxContentLength) {
            rejected = true;
            responseStream.destroy();
            reject(new AxiosError_default(
              "maxContentLength size of " + config.maxContentLength + " exceeded",
              AxiosError_default.ERR_BAD_RESPONSE,
              config,
              lastRequest
            ));
          }
        });
        responseStream.on("aborted", function handlerStreamAborted() {
          if (rejected) {
            return;
          }
          const err = new AxiosError_default(
            "maxContentLength size of " + config.maxContentLength + " exceeded",
            AxiosError_default.ERR_BAD_RESPONSE,
            config,
            lastRequest
          );
          responseStream.destroy(err);
          reject(err);
        });
        responseStream.on("error", function handleStreamError(err) {
          if (req.destroyed)
            return;
          reject(AxiosError_default.from(err, null, config, lastRequest));
        });
        responseStream.on("end", function handleStreamEnd() {
          try {
            let responseData = responseBuffer.length === 1 ? responseBuffer[0] : Buffer.concat(responseBuffer);
            if (responseType !== "arraybuffer") {
              responseData = responseData.toString(responseEncoding);
              if (!responseEncoding || responseEncoding === "utf8") {
                responseData = utils_default.stripBOM(responseData);
              }
            }
            response2.data = responseData;
          } catch (err) {
            return reject(AxiosError_default.from(err, null, config, response2.request, response2));
          }
          settle(resolve, reject, response2);
        });
      }
      emitter.once("abort", (err) => {
        if (!responseStream.destroyed) {
          responseStream.emit("error", err);
          responseStream.destroy();
        }
      });
    });
    emitter.once("abort", (err) => {
      reject(err);
      req.destroy(err);
    });
    req.on("error", function handleRequestError(err) {
      reject(AxiosError_default.from(err, null, config, req));
    });
    req.on("socket", function handleRequestSocket(socket) {
      socket.setKeepAlive(true, 1e3 * 60);
    });
    if (config.timeout) {
      const timeout = parseInt(config.timeout, 10);
      if (Number.isNaN(timeout)) {
        reject(new AxiosError_default(
          "error trying to parse `config.timeout` to int",
          AxiosError_default.ERR_BAD_OPTION_VALUE,
          config,
          req
        ));
        return;
      }
      req.setTimeout(timeout, function handleRequestTimeout() {
        if (isDone)
          return;
        let timeoutErrorMessage = config.timeout ? "timeout of " + config.timeout + "ms exceeded" : "timeout exceeded";
        const transitional2 = config.transitional || transitional_default;
        if (config.timeoutErrorMessage) {
          timeoutErrorMessage = config.timeoutErrorMessage;
        }
        reject(new AxiosError_default(
          timeoutErrorMessage,
          transitional2.clarifyTimeoutError ? AxiosError_default.ETIMEDOUT : AxiosError_default.ECONNABORTED,
          config,
          req
        ));
        abort();
      });
    }
    if (utils_default.isStream(data)) {
      let ended = false;
      let errored = false;
      data.on("end", () => {
        ended = true;
      });
      data.once("error", (err) => {
        errored = true;
        req.destroy(err);
      });
      data.on("close", () => {
        if (!ended && !errored) {
          abort(new CanceledError_default("Request stream has been aborted", config, req));
        }
      });
      data.pipe(req);
    } else {
      req.end(data);
    }
  });
};

// apps/backend/src/layers/dependencyLayer/nodejs/node_modules/axios/lib/helpers/cookies.js
var cookies_default = platform_default.hasStandardBrowserEnv ? (
  // Standard browser envs support document.cookie
  {
    write(name, value, expires, path, domain, secure) {
      const cookie = [name + "=" + encodeURIComponent(value)];
      utils_default.isNumber(expires) && cookie.push("expires=" + new Date(expires).toGMTString());
      utils_default.isString(path) && cookie.push("path=" + path);
      utils_default.isString(domain) && cookie.push("domain=" + domain);
      secure === true && cookie.push("secure");
      document.cookie = cookie.join("; ");
    },
    read(name) {
      const match = document.cookie.match(new RegExp("(^|;\\s*)(" + name + ")=([^;]*)"));
      return match ? decodeURIComponent(match[3]) : null;
    },
    remove(name) {
      this.write(name, "", Date.now() - 864e5);
    }
  }
) : (
  // Non-standard browser env (web workers, react-native) lack needed support.
  {
    write() {
    },
    read() {
      return null;
    },
    remove() {
    }
  }
);

// apps/backend/src/layers/dependencyLayer/nodejs/node_modules/axios/lib/helpers/isURLSameOrigin.js
var isURLSameOrigin_default = platform_default.hasStandardBrowserEnv ? (
  // Standard browser envs have full support of the APIs needed to test
  // whether the request URL is of the same origin as current location.
  function standardBrowserEnv() {
    const msie = /(msie|trident)/i.test(navigator.userAgent);
    const urlParsingNode = document.createElement("a");
    let originURL;
    function resolveURL(url2) {
      let href = url2;
      if (msie) {
        urlParsingNode.setAttribute("href", href);
        href = urlParsingNode.href;
      }
      urlParsingNode.setAttribute("href", href);
      return {
        href: urlParsingNode.href,
        protocol: urlParsingNode.protocol ? urlParsingNode.protocol.replace(/:$/, "") : "",
        host: urlParsingNode.host,
        search: urlParsingNode.search ? urlParsingNode.search.replace(/^\?/, "") : "",
        hash: urlParsingNode.hash ? urlParsingNode.hash.replace(/^#/, "") : "",
        hostname: urlParsingNode.hostname,
        port: urlParsingNode.port,
        pathname: urlParsingNode.pathname.charAt(0) === "/" ? urlParsingNode.pathname : "/" + urlParsingNode.pathname
      };
    }
    originURL = resolveURL(window.location.href);
    return function isURLSameOrigin(requestURL) {
      const parsed = utils_default.isString(requestURL) ? resolveURL(requestURL) : requestURL;
      return parsed.protocol === originURL.protocol && parsed.host === originURL.host;
    };
  }()
) : (
  // Non standard browser envs (web workers, react-native) lack needed support.
  function nonStandardBrowserEnv() {
    return function isURLSameOrigin() {
      return true;
    };
  }()
);

// apps/backend/src/layers/dependencyLayer/nodejs/node_modules/axios/lib/adapters/xhr.js
function progressEventReducer(listener, isDownloadStream) {
  let bytesNotified = 0;
  const _speedometer = speedometer_default(50, 250);
  return (e) => {
    const loaded = e.loaded;
    const total = e.lengthComputable ? e.total : void 0;
    const progressBytes = loaded - bytesNotified;
    const rate = _speedometer(progressBytes);
    const inRange = loaded <= total;
    bytesNotified = loaded;
    const data = {
      loaded,
      total,
      progress: total ? loaded / total : void 0,
      bytes: progressBytes,
      rate: rate ? rate : void 0,
      estimated: rate && total && inRange ? (total - loaded) / rate : void 0,
      event: e
    };
    data[isDownloadStream ? "download" : "upload"] = true;
    listener(data);
  };
}
var isXHRAdapterSupported = typeof XMLHttpRequest !== "undefined";
var xhr_default = isXHRAdapterSupported && function(config) {
  return new Promise(function dispatchXhrRequest(resolve, reject) {
    let requestData = config.data;
    const requestHeaders = AxiosHeaders_default.from(config.headers).normalize();
    let { responseType, withXSRFToken } = config;
    let onCanceled;
    function done() {
      if (config.cancelToken) {
        config.cancelToken.unsubscribe(onCanceled);
      }
      if (config.signal) {
        config.signal.removeEventListener("abort", onCanceled);
      }
    }
    let contentType;
    if (utils_default.isFormData(requestData)) {
      if (platform_default.hasStandardBrowserEnv || platform_default.hasStandardBrowserWebWorkerEnv) {
        requestHeaders.setContentType(false);
      } else if ((contentType = requestHeaders.getContentType()) !== false) {
        const [type, ...tokens] = contentType ? contentType.split(";").map((token) => token.trim()).filter(Boolean) : [];
        requestHeaders.setContentType([type || "multipart/form-data", ...tokens].join("; "));
      }
    }
    let request2 = new XMLHttpRequest();
    if (config.auth) {
      const username = config.auth.username || "";
      const password = config.auth.password ? unescape(encodeURIComponent(config.auth.password)) : "";
      requestHeaders.set("Authorization", "Basic " + btoa(username + ":" + password));
    }
    const fullPath = buildFullPath(config.baseURL, config.url);
    request2.open(config.method.toUpperCase(), buildURL(fullPath, config.params, config.paramsSerializer), true);
    request2.timeout = config.timeout;
    function onloadend() {
      if (!request2) {
        return;
      }
      const responseHeaders = AxiosHeaders_default.from(
        "getAllResponseHeaders" in request2 && request2.getAllResponseHeaders()
      );
      const responseData = !responseType || responseType === "text" || responseType === "json" ? request2.responseText : request2.response;
      const response2 = {
        data: responseData,
        status: request2.status,
        statusText: request2.statusText,
        headers: responseHeaders,
        config,
        request: request2
      };
      settle(function _resolve(value) {
        resolve(value);
        done();
      }, function _reject(err) {
        reject(err);
        done();
      }, response2);
      request2 = null;
    }
    if ("onloadend" in request2) {
      request2.onloadend = onloadend;
    } else {
      request2.onreadystatechange = function handleLoad() {
        if (!request2 || request2.readyState !== 4) {
          return;
        }
        if (request2.status === 0 && !(request2.responseURL && request2.responseURL.indexOf("file:") === 0)) {
          return;
        }
        setTimeout(onloadend);
      };
    }
    request2.onabort = function handleAbort() {
      if (!request2) {
        return;
      }
      reject(new AxiosError_default("Request aborted", AxiosError_default.ECONNABORTED, config, request2));
      request2 = null;
    };
    request2.onerror = function handleError() {
      reject(new AxiosError_default("Network Error", AxiosError_default.ERR_NETWORK, config, request2));
      request2 = null;
    };
    request2.ontimeout = function handleTimeout() {
      let timeoutErrorMessage = config.timeout ? "timeout of " + config.timeout + "ms exceeded" : "timeout exceeded";
      const transitional2 = config.transitional || transitional_default;
      if (config.timeoutErrorMessage) {
        timeoutErrorMessage = config.timeoutErrorMessage;
      }
      reject(new AxiosError_default(
        timeoutErrorMessage,
        transitional2.clarifyTimeoutError ? AxiosError_default.ETIMEDOUT : AxiosError_default.ECONNABORTED,
        config,
        request2
      ));
      request2 = null;
    };
    if (platform_default.hasStandardBrowserEnv) {
      withXSRFToken && utils_default.isFunction(withXSRFToken) && (withXSRFToken = withXSRFToken(config));
      if (withXSRFToken || withXSRFToken !== false && isURLSameOrigin_default(fullPath)) {
        const xsrfValue = config.xsrfHeaderName && config.xsrfCookieName && cookies_default.read(config.xsrfCookieName);
        if (xsrfValue) {
          requestHeaders.set(config.xsrfHeaderName, xsrfValue);
        }
      }
    }
    requestData === void 0 && requestHeaders.setContentType(null);
    if ("setRequestHeader" in request2) {
      utils_default.forEach(requestHeaders.toJSON(), function setRequestHeader(val, key) {
        request2.setRequestHeader(key, val);
      });
    }
    if (!utils_default.isUndefined(config.withCredentials)) {
      request2.withCredentials = !!config.withCredentials;
    }
    if (responseType && responseType !== "json") {
      request2.responseType = config.responseType;
    }
    if (typeof config.onDownloadProgress === "function") {
      request2.addEventListener("progress", progressEventReducer(config.onDownloadProgress, true));
    }
    if (typeof config.onUploadProgress === "function" && request2.upload) {
      request2.upload.addEventListener("progress", progressEventReducer(config.onUploadProgress));
    }
    if (config.cancelToken || config.signal) {
      onCanceled = (cancel) => {
        if (!request2) {
          return;
        }
        reject(!cancel || cancel.type ? new CanceledError_default(null, config, request2) : cancel);
        request2.abort();
        request2 = null;
      };
      config.cancelToken && config.cancelToken.subscribe(onCanceled);
      if (config.signal) {
        config.signal.aborted ? onCanceled() : config.signal.addEventListener("abort", onCanceled);
      }
    }
    const protocol = parseProtocol(fullPath);
    if (protocol && platform_default.protocols.indexOf(protocol) === -1) {
      reject(new AxiosError_default("Unsupported protocol " + protocol + ":", AxiosError_default.ERR_BAD_REQUEST, config));
      return;
    }
    request2.send(requestData || null);
  });
};

// apps/backend/src/layers/dependencyLayer/nodejs/node_modules/axios/lib/adapters/adapters.js
var knownAdapters = {
  http: http_default,
  xhr: xhr_default
};
utils_default.forEach(knownAdapters, (fn, value) => {
  if (fn) {
    try {
      Object.defineProperty(fn, "name", { value });
    } catch (e) {
    }
    Object.defineProperty(fn, "adapterName", { value });
  }
});
var renderReason = (reason) => `- ${reason}`;
var isResolvedHandle = (adapter) => utils_default.isFunction(adapter) || adapter === null || adapter === false;
var adapters_default = {
  getAdapter: (adapters) => {
    adapters = utils_default.isArray(adapters) ? adapters : [adapters];
    const { length } = adapters;
    let nameOrAdapter;
    let adapter;
    const rejectedReasons = {};
    for (let i = 0; i < length; i++) {
      nameOrAdapter = adapters[i];
      let id;
      adapter = nameOrAdapter;
      if (!isResolvedHandle(nameOrAdapter)) {
        adapter = knownAdapters[(id = String(nameOrAdapter)).toLowerCase()];
        if (adapter === void 0) {
          throw new AxiosError_default(`Unknown adapter '${id}'`);
        }
      }
      if (adapter) {
        break;
      }
      rejectedReasons[id || "#" + i] = adapter;
    }
    if (!adapter) {
      const reasons = Object.entries(rejectedReasons).map(
        ([id, state]) => `adapter ${id} ` + (state === false ? "is not supported by the environment" : "is not available in the build")
      );
      let s = length ? reasons.length > 1 ? "since :\n" + reasons.map(renderReason).join("\n") : " " + renderReason(reasons[0]) : "as no adapter specified";
      throw new AxiosError_default(
        `There is no suitable adapter to dispatch the request ` + s,
        "ERR_NOT_SUPPORT"
      );
    }
    return adapter;
  },
  adapters: knownAdapters
};

// apps/backend/src/layers/dependencyLayer/nodejs/node_modules/axios/lib/core/dispatchRequest.js
function throwIfCancellationRequested(config) {
  if (config.cancelToken) {
    config.cancelToken.throwIfRequested();
  }
  if (config.signal && config.signal.aborted) {
    throw new CanceledError_default(null, config);
  }
}
function dispatchRequest(config) {
  throwIfCancellationRequested(config);
  config.headers = AxiosHeaders_default.from(config.headers);
  config.data = transformData.call(
    config,
    config.transformRequest
  );
  if (["post", "put", "patch"].indexOf(config.method) !== -1) {
    config.headers.setContentType("application/x-www-form-urlencoded", false);
  }
  const adapter = adapters_default.getAdapter(config.adapter || defaults_default.adapter);
  return adapter(config).then(function onAdapterResolution(response2) {
    throwIfCancellationRequested(config);
    response2.data = transformData.call(
      config,
      config.transformResponse,
      response2
    );
    response2.headers = AxiosHeaders_default.from(response2.headers);
    return response2;
  }, function onAdapterRejection(reason) {
    if (!isCancel(reason)) {
      throwIfCancellationRequested(config);
      if (reason && reason.response) {
        reason.response.data = transformData.call(
          config,
          config.transformResponse,
          reason.response
        );
        reason.response.headers = AxiosHeaders_default.from(reason.response.headers);
      }
    }
    return Promise.reject(reason);
  });
}

// apps/backend/src/layers/dependencyLayer/nodejs/node_modules/axios/lib/core/mergeConfig.js
var headersToObject = (thing) => thing instanceof AxiosHeaders_default ? thing.toJSON() : thing;
function mergeConfig(config1, config2) {
  config2 = config2 || {};
  const config = {};
  function getMergedValue(target, source, caseless) {
    if (utils_default.isPlainObject(target) && utils_default.isPlainObject(source)) {
      return utils_default.merge.call({ caseless }, target, source);
    } else if (utils_default.isPlainObject(source)) {
      return utils_default.merge({}, source);
    } else if (utils_default.isArray(source)) {
      return source.slice();
    }
    return source;
  }
  function mergeDeepProperties(a, b, caseless) {
    if (!utils_default.isUndefined(b)) {
      return getMergedValue(a, b, caseless);
    } else if (!utils_default.isUndefined(a)) {
      return getMergedValue(void 0, a, caseless);
    }
  }
  function valueFromConfig2(a, b) {
    if (!utils_default.isUndefined(b)) {
      return getMergedValue(void 0, b);
    }
  }
  function defaultToConfig2(a, b) {
    if (!utils_default.isUndefined(b)) {
      return getMergedValue(void 0, b);
    } else if (!utils_default.isUndefined(a)) {
      return getMergedValue(void 0, a);
    }
  }
  function mergeDirectKeys(a, b, prop) {
    if (prop in config2) {
      return getMergedValue(a, b);
    } else if (prop in config1) {
      return getMergedValue(void 0, a);
    }
  }
  const mergeMap = {
    url: valueFromConfig2,
    method: valueFromConfig2,
    data: valueFromConfig2,
    baseURL: defaultToConfig2,
    transformRequest: defaultToConfig2,
    transformResponse: defaultToConfig2,
    paramsSerializer: defaultToConfig2,
    timeout: defaultToConfig2,
    timeoutMessage: defaultToConfig2,
    withCredentials: defaultToConfig2,
    withXSRFToken: defaultToConfig2,
    adapter: defaultToConfig2,
    responseType: defaultToConfig2,
    xsrfCookieName: defaultToConfig2,
    xsrfHeaderName: defaultToConfig2,
    onUploadProgress: defaultToConfig2,
    onDownloadProgress: defaultToConfig2,
    decompress: defaultToConfig2,
    maxContentLength: defaultToConfig2,
    maxBodyLength: defaultToConfig2,
    beforeRedirect: defaultToConfig2,
    transport: defaultToConfig2,
    httpAgent: defaultToConfig2,
    httpsAgent: defaultToConfig2,
    cancelToken: defaultToConfig2,
    socketPath: defaultToConfig2,
    responseEncoding: defaultToConfig2,
    validateStatus: mergeDirectKeys,
    headers: (a, b) => mergeDeepProperties(headersToObject(a), headersToObject(b), true)
  };
  utils_default.forEach(Object.keys(Object.assign({}, config1, config2)), function computeConfigValue(prop) {
    const merge2 = mergeMap[prop] || mergeDeepProperties;
    const configValue = merge2(config1[prop], config2[prop], prop);
    utils_default.isUndefined(configValue) && merge2 !== mergeDirectKeys || (config[prop] = configValue);
  });
  return config;
}

// apps/backend/src/layers/dependencyLayer/nodejs/node_modules/axios/lib/helpers/validator.js
var validators = {};
["object", "boolean", "number", "function", "string", "symbol"].forEach((type, i) => {
  validators[type] = function validator(thing) {
    return typeof thing === type || "a" + (i < 1 ? "n " : " ") + type;
  };
});
var deprecatedWarnings = {};
validators.transitional = function transitional(validator, version, message) {
  function formatMessage(opt, desc) {
    return "[Axios v" + VERSION + "] Transitional option '" + opt + "'" + desc + (message ? ". " + message : "");
  }
  return (value, opt, opts) => {
    if (validator === false) {
      throw new AxiosError_default(
        formatMessage(opt, " has been removed" + (version ? " in " + version : "")),
        AxiosError_default.ERR_DEPRECATED
      );
    }
    if (version && !deprecatedWarnings[opt]) {
      deprecatedWarnings[opt] = true;
      console.warn(
        formatMessage(
          opt,
          " has been deprecated since v" + version + " and will be removed in the near future"
        )
      );
    }
    return validator ? validator(value, opt, opts) : true;
  };
};
function assertOptions(options, schema, allowUnknown) {
  if (typeof options !== "object") {
    throw new AxiosError_default("options must be an object", AxiosError_default.ERR_BAD_OPTION_VALUE);
  }
  const keys = Object.keys(options);
  let i = keys.length;
  while (i-- > 0) {
    const opt = keys[i];
    const validator = schema[opt];
    if (validator) {
      const value = options[opt];
      const result = value === void 0 || validator(value, opt, options);
      if (result !== true) {
        throw new AxiosError_default("option " + opt + " must be " + result, AxiosError_default.ERR_BAD_OPTION_VALUE);
      }
      continue;
    }
    if (allowUnknown !== true) {
      throw new AxiosError_default("Unknown option " + opt, AxiosError_default.ERR_BAD_OPTION);
    }
  }
}
var validator_default = {
  assertOptions,
  validators
};

// apps/backend/src/layers/dependencyLayer/nodejs/node_modules/axios/lib/core/Axios.js
var validators2 = validator_default.validators;
var Axios = class {
  constructor(instanceConfig) {
    this.defaults = instanceConfig;
    this.interceptors = {
      request: new InterceptorManager_default(),
      response: new InterceptorManager_default()
    };
  }
  /**
   * Dispatch a request
   *
   * @param {String|Object} configOrUrl The config specific for this request (merged with this.defaults)
   * @param {?Object} config
   *
   * @returns {Promise} The Promise to be fulfilled
   */
  async request(configOrUrl, config) {
    try {
      return await this._request(configOrUrl, config);
    } catch (err) {
      if (err instanceof Error) {
        let dummy;
        Error.captureStackTrace ? Error.captureStackTrace(dummy = {}) : dummy = new Error();
        const stack = dummy.stack ? dummy.stack.replace(/^.+\n/, "") : "";
        if (!err.stack) {
          err.stack = stack;
        } else if (stack && !String(err.stack).endsWith(stack.replace(/^.+\n.+\n/, ""))) {
          err.stack += "\n" + stack;
        }
      }
      throw err;
    }
  }
  _request(configOrUrl, config) {
    if (typeof configOrUrl === "string") {
      config = config || {};
      config.url = configOrUrl;
    } else {
      config = configOrUrl || {};
    }
    config = mergeConfig(this.defaults, config);
    const { transitional: transitional2, paramsSerializer, headers } = config;
    if (transitional2 !== void 0) {
      validator_default.assertOptions(transitional2, {
        silentJSONParsing: validators2.transitional(validators2.boolean),
        forcedJSONParsing: validators2.transitional(validators2.boolean),
        clarifyTimeoutError: validators2.transitional(validators2.boolean)
      }, false);
    }
    if (paramsSerializer != null) {
      if (utils_default.isFunction(paramsSerializer)) {
        config.paramsSerializer = {
          serialize: paramsSerializer
        };
      } else {
        validator_default.assertOptions(paramsSerializer, {
          encode: validators2.function,
          serialize: validators2.function
        }, true);
      }
    }
    config.method = (config.method || this.defaults.method || "get").toLowerCase();
    let contextHeaders = headers && utils_default.merge(
      headers.common,
      headers[config.method]
    );
    headers && utils_default.forEach(
      ["delete", "get", "head", "post", "put", "patch", "common"],
      (method) => {
        delete headers[method];
      }
    );
    config.headers = AxiosHeaders_default.concat(contextHeaders, headers);
    const requestInterceptorChain = [];
    let synchronousRequestInterceptors = true;
    this.interceptors.request.forEach(function unshiftRequestInterceptors(interceptor) {
      if (typeof interceptor.runWhen === "function" && interceptor.runWhen(config) === false) {
        return;
      }
      synchronousRequestInterceptors = synchronousRequestInterceptors && interceptor.synchronous;
      requestInterceptorChain.unshift(interceptor.fulfilled, interceptor.rejected);
    });
    const responseInterceptorChain = [];
    this.interceptors.response.forEach(function pushResponseInterceptors(interceptor) {
      responseInterceptorChain.push(interceptor.fulfilled, interceptor.rejected);
    });
    let promise;
    let i = 0;
    let len;
    if (!synchronousRequestInterceptors) {
      const chain = [dispatchRequest.bind(this), void 0];
      chain.unshift.apply(chain, requestInterceptorChain);
      chain.push.apply(chain, responseInterceptorChain);
      len = chain.length;
      promise = Promise.resolve(config);
      while (i < len) {
        promise = promise.then(chain[i++], chain[i++]);
      }
      return promise;
    }
    len = requestInterceptorChain.length;
    let newConfig = config;
    i = 0;
    while (i < len) {
      const onFulfilled = requestInterceptorChain[i++];
      const onRejected = requestInterceptorChain[i++];
      try {
        newConfig = onFulfilled(newConfig);
      } catch (error) {
        onRejected.call(this, error);
        break;
      }
    }
    try {
      promise = dispatchRequest.call(this, newConfig);
    } catch (error) {
      return Promise.reject(error);
    }
    i = 0;
    len = responseInterceptorChain.length;
    while (i < len) {
      promise = promise.then(responseInterceptorChain[i++], responseInterceptorChain[i++]);
    }
    return promise;
  }
  getUri(config) {
    config = mergeConfig(this.defaults, config);
    const fullPath = buildFullPath(config.baseURL, config.url);
    return buildURL(fullPath, config.params, config.paramsSerializer);
  }
};
utils_default.forEach(["delete", "get", "head", "options"], function forEachMethodNoData(method) {
  Axios.prototype[method] = function(url2, config) {
    return this.request(mergeConfig(config || {}, {
      method,
      url: url2,
      data: (config || {}).data
    }));
  };
});
utils_default.forEach(["post", "put", "patch"], function forEachMethodWithData(method) {
  function generateHTTPMethod(isForm) {
    return function httpMethod(url2, data, config) {
      return this.request(mergeConfig(config || {}, {
        method,
        headers: isForm ? {
          "Content-Type": "multipart/form-data"
        } : {},
        url: url2,
        data
      }));
    };
  }
  Axios.prototype[method] = generateHTTPMethod();
  Axios.prototype[method + "Form"] = generateHTTPMethod(true);
});
var Axios_default = Axios;

// apps/backend/src/layers/dependencyLayer/nodejs/node_modules/axios/lib/cancel/CancelToken.js
var CancelToken = class {
  constructor(executor) {
    if (typeof executor !== "function") {
      throw new TypeError("executor must be a function.");
    }
    let resolvePromise;
    this.promise = new Promise(function promiseExecutor(resolve) {
      resolvePromise = resolve;
    });
    const token = this;
    this.promise.then((cancel) => {
      if (!token._listeners)
        return;
      let i = token._listeners.length;
      while (i-- > 0) {
        token._listeners[i](cancel);
      }
      token._listeners = null;
    });
    this.promise.then = (onfulfilled) => {
      let _resolve;
      const promise = new Promise((resolve) => {
        token.subscribe(resolve);
        _resolve = resolve;
      }).then(onfulfilled);
      promise.cancel = function reject() {
        token.unsubscribe(_resolve);
      };
      return promise;
    };
    executor(function cancel(message, config, request2) {
      if (token.reason) {
        return;
      }
      token.reason = new CanceledError_default(message, config, request2);
      resolvePromise(token.reason);
    });
  }
  /**
   * Throws a `CanceledError` if cancellation has been requested.
   */
  throwIfRequested() {
    if (this.reason) {
      throw this.reason;
    }
  }
  /**
   * Subscribe to the cancel signal
   */
  subscribe(listener) {
    if (this.reason) {
      listener(this.reason);
      return;
    }
    if (this._listeners) {
      this._listeners.push(listener);
    } else {
      this._listeners = [listener];
    }
  }
  /**
   * Unsubscribe from the cancel signal
   */
  unsubscribe(listener) {
    if (!this._listeners) {
      return;
    }
    const index = this._listeners.indexOf(listener);
    if (index !== -1) {
      this._listeners.splice(index, 1);
    }
  }
  /**
   * Returns an object that contains a new `CancelToken` and a function that, when called,
   * cancels the `CancelToken`.
   */
  static source() {
    let cancel;
    const token = new CancelToken(function executor(c) {
      cancel = c;
    });
    return {
      token,
      cancel
    };
  }
};
var CancelToken_default = CancelToken;

// apps/backend/src/layers/dependencyLayer/nodejs/node_modules/axios/lib/helpers/spread.js
function spread(callback) {
  return function wrap(arr) {
    return callback.apply(null, arr);
  };
}

// apps/backend/src/layers/dependencyLayer/nodejs/node_modules/axios/lib/helpers/isAxiosError.js
function isAxiosError(payload) {
  return utils_default.isObject(payload) && payload.isAxiosError === true;
}

// apps/backend/src/layers/dependencyLayer/nodejs/node_modules/axios/lib/helpers/HttpStatusCode.js
var HttpStatusCode = {
  Continue: 100,
  SwitchingProtocols: 101,
  Processing: 102,
  EarlyHints: 103,
  Ok: 200,
  Created: 201,
  Accepted: 202,
  NonAuthoritativeInformation: 203,
  NoContent: 204,
  ResetContent: 205,
  PartialContent: 206,
  MultiStatus: 207,
  AlreadyReported: 208,
  ImUsed: 226,
  MultipleChoices: 300,
  MovedPermanently: 301,
  Found: 302,
  SeeOther: 303,
  NotModified: 304,
  UseProxy: 305,
  Unused: 306,
  TemporaryRedirect: 307,
  PermanentRedirect: 308,
  BadRequest: 400,
  Unauthorized: 401,
  PaymentRequired: 402,
  Forbidden: 403,
  NotFound: 404,
  MethodNotAllowed: 405,
  NotAcceptable: 406,
  ProxyAuthenticationRequired: 407,
  RequestTimeout: 408,
  Conflict: 409,
  Gone: 410,
  LengthRequired: 411,
  PreconditionFailed: 412,
  PayloadTooLarge: 413,
  UriTooLong: 414,
  UnsupportedMediaType: 415,
  RangeNotSatisfiable: 416,
  ExpectationFailed: 417,
  ImATeapot: 418,
  MisdirectedRequest: 421,
  UnprocessableEntity: 422,
  Locked: 423,
  FailedDependency: 424,
  TooEarly: 425,
  UpgradeRequired: 426,
  PreconditionRequired: 428,
  TooManyRequests: 429,
  RequestHeaderFieldsTooLarge: 431,
  UnavailableForLegalReasons: 451,
  InternalServerError: 500,
  NotImplemented: 501,
  BadGateway: 502,
  ServiceUnavailable: 503,
  GatewayTimeout: 504,
  HttpVersionNotSupported: 505,
  VariantAlsoNegotiates: 506,
  InsufficientStorage: 507,
  LoopDetected: 508,
  NotExtended: 510,
  NetworkAuthenticationRequired: 511
};
Object.entries(HttpStatusCode).forEach(([key, value]) => {
  HttpStatusCode[value] = key;
});
var HttpStatusCode_default = HttpStatusCode;

// apps/backend/src/layers/dependencyLayer/nodejs/node_modules/axios/lib/axios.js
function createInstance(defaultConfig) {
  const context = new Axios_default(defaultConfig);
  const instance = bind(Axios_default.prototype.request, context);
  utils_default.extend(instance, Axios_default.prototype, context, { allOwnKeys: true });
  utils_default.extend(instance, context, null, { allOwnKeys: true });
  instance.create = function create(instanceConfig) {
    return createInstance(mergeConfig(defaultConfig, instanceConfig));
  };
  return instance;
}
var axios = createInstance(defaults_default);
axios.Axios = Axios_default;
axios.CanceledError = CanceledError_default;
axios.CancelToken = CancelToken_default;
axios.isCancel = isCancel;
axios.VERSION = VERSION;
axios.toFormData = toFormData_default;
axios.AxiosError = AxiosError_default;
axios.Cancel = axios.CanceledError;
axios.all = function all(promises) {
  return Promise.all(promises);
};
axios.spread = spread;
axios.isAxiosError = isAxiosError;
axios.mergeConfig = mergeConfig;
axios.AxiosHeaders = AxiosHeaders_default;
axios.formToJSON = (thing) => formDataToJSON_default(utils_default.isHTMLForm(thing) ? new FormData(thing) : thing);
axios.getAdapter = adapters_default.getAdapter;
axios.HttpStatusCode = HttpStatusCode_default;
axios.default = axios;
var axios_default = axios;

// apps/backend/src/layers/dependencyLayer/nodejs/node_modules/axios/index.js
var {
  Axios: Axios2,
  AxiosError: AxiosError2,
  CanceledError: CanceledError2,
  isCancel: isCancel2,
  CancelToken: CancelToken2,
  VERSION: VERSION2,
  all: all2,
  Cancel,
  isAxiosError: isAxiosError2,
  spread: spread2,
  toFormData: toFormData2,
  AxiosHeaders: AxiosHeaders2,
  HttpStatusCode: HttpStatusCode2,
  formToJSON,
  getAdapter,
  mergeConfig: mergeConfig2
} = axios_default;

// apps/backend/src/layers/dependencyLayer/opt/abr.ts
var { ABR_GUID } = process.env;
var abrLookup = async (businessNumber) => {
  console.log(`GUID: ${ABR_GUID}`);
  const companyDetails = await axios_default.get(
    `https://abr.business.gov.au/json/AbnDetails.aspx?guid=${ABR_GUID}&abn=${businessNumber}`
  );
  let data = companyDetails.data.replace("callback(", "");
  data = data.slice(0, data.lastIndexOf(")"));
  console.log(`${businessNumber} data:`, data);
  const parsedData = JSON.parse(data);
  console.log("parsedData: ", parsedData);
  const transformedData = {
    abn: parsedData.Abn,
    abnStatus: parsedData.AbnStatus,
    abnStatusEffectiveFrom: parsedData.AbnStatusEffectiveFrom,
    acn: parsedData.Acn,
    addressDate: parsedData.AddressDate || null,
    addressPostcode: parsedData.AddressPostcode || null,
    addressState: parsedData.AddressState || null,
    businessName: parsedData.BusinessName || null,
    entityName: parsedData.EntityName || null,
    entityTypeCode: parsedData.EntityTypeCode || null,
    entityTypeName: parsedData.EntityTypeName || null,
    gst: parsedData.Gst || null,
    message: parsedData.Message || null
  };
  console.log(`${businessNumber} data:`, transformedData);
  return transformedData;
};

// apps/backend/src/appsync/resolvers/Query.abrLookup.ts
function request(ctx) {
  const {
    args: { abn }
  } = ctx;
  return abrLookup(abn);
}
function response(ctx) {
  const { error, result } = ctx;
  if (error) {
    return util2.appendError(error.message, error.type, result);
  }
  return ctx.result;
}
export {
  request,
  response
};
/*! Bundled license information:

mime-db/index.js:
  (*!
   * mime-db
   * Copyright(c) 2014 Jonathan Ong
   * Copyright(c) 2015-2022 Douglas Christopher Wilson
   * MIT Licensed
   *)

mime-types/index.js:
  (*!
   * mime-types
   * Copyright(c) 2014 Jonathan Ong
   * Copyright(c) 2015 Douglas Christopher Wilson
   * MIT Licensed
   *)
*/
//# sourceMappingURL=data:application/json;base64,ewogICJ2ZXJzaW9uIjogMywKICAic291cmNlcyI6IFsiLi4vLi4vLi4vLi4vbGF5ZXJzL2RlcGVuZGVuY3lMYXllci9ub2RlanMvbm9kZV9tb2R1bGVzL2RlbGF5ZWQtc3RyZWFtL2xpYi9kZWxheWVkX3N0cmVhbS5qcyIsICIuLi8uLi8uLi8uLi9sYXllcnMvZGVwZW5kZW5jeUxheWVyL25vZGVqcy9ub2RlX21vZHVsZXMvY29tYmluZWQtc3RyZWFtL2xpYi9jb21iaW5lZF9zdHJlYW0uanMiLCAiLi4vLi4vLi4vLi4vbGF5ZXJzL2RlcGVuZGVuY3lMYXllci9ub2RlanMvbm9kZV9tb2R1bGVzL21pbWUtZGIvZGIuanNvbiIsICIuLi8uLi8uLi8uLi9sYXllcnMvZGVwZW5kZW5jeUxheWVyL25vZGVqcy9ub2RlX21vZHVsZXMvbWltZS1kYi9pbmRleC5qcyIsICIuLi8uLi8uLi8uLi9sYXllcnMvZGVwZW5kZW5jeUxheWVyL25vZGVqcy9ub2RlX21vZHVsZXMvbWltZS10eXBlcy9pbmRleC5qcyIsICIuLi8uLi8uLi8uLi9sYXllcnMvZGVwZW5kZW5jeUxheWVyL25vZGVqcy9ub2RlX21vZHVsZXMvYXN5bmNraXQvbGliL2RlZmVyLmpzIiwgIi4uLy4uLy4uLy4uL2xheWVycy9kZXBlbmRlbmN5TGF5ZXIvbm9kZWpzL25vZGVfbW9kdWxlcy9hc3luY2tpdC9saWIvYXN5bmMuanMiLCAiLi4vLi4vLi4vLi4vbGF5ZXJzL2RlcGVuZGVuY3lMYXllci9ub2RlanMvbm9kZV9tb2R1bGVzL2FzeW5ja2l0L2xpYi9hYm9ydC5qcyIsICIuLi8uLi8uLi8uLi9sYXllcnMvZGVwZW5kZW5jeUxheWVyL25vZGVqcy9ub2RlX21vZHVsZXMvYXN5bmNraXQvbGliL2l0ZXJhdGUuanMiLCAiLi4vLi4vLi4vLi4vbGF5ZXJzL2RlcGVuZGVuY3lMYXllci9ub2RlanMvbm9kZV9tb2R1bGVzL2FzeW5ja2l0L2xpYi9zdGF0ZS5qcyIsICIuLi8uLi8uLi8uLi9sYXllcnMvZGVwZW5kZW5jeUxheWVyL25vZGVqcy9ub2RlX21vZHVsZXMvYXN5bmNraXQvbGliL3Rlcm1pbmF0b3IuanMiLCAiLi4vLi4vLi4vLi4vbGF5ZXJzL2RlcGVuZGVuY3lMYXllci9ub2RlanMvbm9kZV9tb2R1bGVzL2FzeW5ja2l0L3BhcmFsbGVsLmpzIiwgIi4uLy4uLy4uLy4uL2xheWVycy9kZXBlbmRlbmN5TGF5ZXIvbm9kZWpzL25vZGVfbW9kdWxlcy9hc3luY2tpdC9zZXJpYWxPcmRlcmVkLmpzIiwgIi4uLy4uLy4uLy4uL2xheWVycy9kZXBlbmRlbmN5TGF5ZXIvbm9kZWpzL25vZGVfbW9kdWxlcy9hc3luY2tpdC9zZXJpYWwuanMiLCAiLi4vLi4vLi4vLi4vbGF5ZXJzL2RlcGVuZGVuY3lMYXllci9ub2RlanMvbm9kZV9tb2R1bGVzL2FzeW5ja2l0L2luZGV4LmpzIiwgIi4uLy4uLy4uLy4uL2xheWVycy9kZXBlbmRlbmN5TGF5ZXIvbm9kZWpzL25vZGVfbW9kdWxlcy9mb3JtLWRhdGEvbGliL3BvcHVsYXRlLmpzIiwgIi4uLy4uLy4uLy4uL2xheWVycy9kZXBlbmRlbmN5TGF5ZXIvbm9kZWpzL25vZGVfbW9kdWxlcy9mb3JtLWRhdGEvbGliL2Zvcm1fZGF0YS5qcyIsICIuLi8uLi8uLi8uLi9sYXllcnMvZGVwZW5kZW5jeUxheWVyL25vZGVqcy9ub2RlX21vZHVsZXMvcHJveHktZnJvbS1lbnYvaW5kZXguanMiLCAiLi4vLi4vLi4vLi4vbGF5ZXJzL2RlcGVuZGVuY3lMYXllci9ub2RlanMvbm9kZV9tb2R1bGVzL21zL2luZGV4LmpzIiwgIi4uLy4uLy4uLy4uL2xheWVycy9kZXBlbmRlbmN5TGF5ZXIvbm9kZWpzL25vZGVfbW9kdWxlcy9kZWJ1Zy9zcmMvZGVidWcuanMiLCAiLi4vLi4vLi4vLi4vbGF5ZXJzL2RlcGVuZGVuY3lMYXllci9ub2RlanMvbm9kZV9tb2R1bGVzL2RlYnVnL3NyYy9icm93c2VyLmpzIiwgIi4uLy4uLy4uLy4uL2xheWVycy9kZXBlbmRlbmN5TGF5ZXIvbm9kZWpzL25vZGVfbW9kdWxlcy9kZWJ1Zy9zcmMvbm9kZS5qcyIsICIuLi8uLi8uLi8uLi9sYXllcnMvZGVwZW5kZW5jeUxheWVyL25vZGVqcy9ub2RlX21vZHVsZXMvZGVidWcvc3JjL2luZGV4LmpzIiwgIi4uLy4uLy4uLy4uL2xheWVycy9kZXBlbmRlbmN5TGF5ZXIvbm9kZWpzL25vZGVfbW9kdWxlcy9mb2xsb3ctcmVkaXJlY3RzL2RlYnVnLmpzIiwgIi4uLy4uLy4uLy4uL2xheWVycy9kZXBlbmRlbmN5TGF5ZXIvbm9kZWpzL25vZGVfbW9kdWxlcy9mb2xsb3ctcmVkaXJlY3RzL2luZGV4LmpzIiwgIi4uLy4uLy4uLy4uL2FwcHN5bmMvcmVzb2x2ZXJzL1F1ZXJ5LmFickxvb2t1cC50cyIsICIuLi8uLi8uLi8uLi9sYXllcnMvZGVwZW5kZW5jeUxheWVyL25vZGVqcy9ub2RlX21vZHVsZXMvYXhpb3MvbGliL2hlbHBlcnMvYmluZC5qcyIsICIuLi8uLi8uLi8uLi9sYXllcnMvZGVwZW5kZW5jeUxheWVyL25vZGVqcy9ub2RlX21vZHVsZXMvYXhpb3MvbGliL3V0aWxzLmpzIiwgIi4uLy4uLy4uLy4uL2xheWVycy9kZXBlbmRlbmN5TGF5ZXIvbm9kZWpzL25vZGVfbW9kdWxlcy9heGlvcy9saWIvY29yZS9BeGlvc0Vycm9yLmpzIiwgIi4uLy4uLy4uLy4uL2xheWVycy9kZXBlbmRlbmN5TGF5ZXIvbm9kZWpzL25vZGVfbW9kdWxlcy9heGlvcy9saWIvcGxhdGZvcm0vbm9kZS9jbGFzc2VzL0Zvcm1EYXRhLmpzIiwgIi4uLy4uLy4uLy4uL2xheWVycy9kZXBlbmRlbmN5TGF5ZXIvbm9kZWpzL25vZGVfbW9kdWxlcy9heGlvcy9saWIvaGVscGVycy90b0Zvcm1EYXRhLmpzIiwgIi4uLy4uLy4uLy4uL2xheWVycy9kZXBlbmRlbmN5TGF5ZXIvbm9kZWpzL25vZGVfbW9kdWxlcy9heGlvcy9saWIvaGVscGVycy9BeGlvc1VSTFNlYXJjaFBhcmFtcy5qcyIsICIuLi8uLi8uLi8uLi9sYXllcnMvZGVwZW5kZW5jeUxheWVyL25vZGVqcy9ub2RlX21vZHVsZXMvYXhpb3MvbGliL2hlbHBlcnMvYnVpbGRVUkwuanMiLCAiLi4vLi4vLi4vLi4vbGF5ZXJzL2RlcGVuZGVuY3lMYXllci9ub2RlanMvbm9kZV9tb2R1bGVzL2F4aW9zL2xpYi9jb3JlL0ludGVyY2VwdG9yTWFuYWdlci5qcyIsICIuLi8uLi8uLi8uLi9sYXllcnMvZGVwZW5kZW5jeUxheWVyL25vZGVqcy9ub2RlX21vZHVsZXMvYXhpb3MvbGliL2RlZmF1bHRzL3RyYW5zaXRpb25hbC5qcyIsICIuLi8uLi8uLi8uLi9sYXllcnMvZGVwZW5kZW5jeUxheWVyL25vZGVqcy9ub2RlX21vZHVsZXMvYXhpb3MvbGliL3BsYXRmb3JtL25vZGUvY2xhc3Nlcy9VUkxTZWFyY2hQYXJhbXMuanMiLCAiLi4vLi4vLi4vLi4vbGF5ZXJzL2RlcGVuZGVuY3lMYXllci9ub2RlanMvbm9kZV9tb2R1bGVzL2F4aW9zL2xpYi9wbGF0Zm9ybS9ub2RlL2luZGV4LmpzIiwgIi4uLy4uLy4uLy4uL2xheWVycy9kZXBlbmRlbmN5TGF5ZXIvbm9kZWpzL25vZGVfbW9kdWxlcy9heGlvcy9saWIvcGxhdGZvcm0vY29tbW9uL3V0aWxzLmpzIiwgIi4uLy4uLy4uLy4uL2xheWVycy9kZXBlbmRlbmN5TGF5ZXIvbm9kZWpzL25vZGVfbW9kdWxlcy9heGlvcy9saWIvcGxhdGZvcm0vaW5kZXguanMiLCAiLi4vLi4vLi4vLi4vbGF5ZXJzL2RlcGVuZGVuY3lMYXllci9ub2RlanMvbm9kZV9tb2R1bGVzL2F4aW9zL2xpYi9oZWxwZXJzL3RvVVJMRW5jb2RlZEZvcm0uanMiLCAiLi4vLi4vLi4vLi4vbGF5ZXJzL2RlcGVuZGVuY3lMYXllci9ub2RlanMvbm9kZV9tb2R1bGVzL2F4aW9zL2xpYi9oZWxwZXJzL2Zvcm1EYXRhVG9KU09OLmpzIiwgIi4uLy4uLy4uLy4uL2xheWVycy9kZXBlbmRlbmN5TGF5ZXIvbm9kZWpzL25vZGVfbW9kdWxlcy9heGlvcy9saWIvZGVmYXVsdHMvaW5kZXguanMiLCAiLi4vLi4vLi4vLi4vbGF5ZXJzL2RlcGVuZGVuY3lMYXllci9ub2RlanMvbm9kZV9tb2R1bGVzL2F4aW9zL2xpYi9oZWxwZXJzL3BhcnNlSGVhZGVycy5qcyIsICIuLi8uLi8uLi8uLi9sYXllcnMvZGVwZW5kZW5jeUxheWVyL25vZGVqcy9ub2RlX21vZHVsZXMvYXhpb3MvbGliL2NvcmUvQXhpb3NIZWFkZXJzLmpzIiwgIi4uLy4uLy4uLy4uL2xheWVycy9kZXBlbmRlbmN5TGF5ZXIvbm9kZWpzL25vZGVfbW9kdWxlcy9heGlvcy9saWIvY29yZS90cmFuc2Zvcm1EYXRhLmpzIiwgIi4uLy4uLy4uLy4uL2xheWVycy9kZXBlbmRlbmN5TGF5ZXIvbm9kZWpzL25vZGVfbW9kdWxlcy9heGlvcy9saWIvY2FuY2VsL2lzQ2FuY2VsLmpzIiwgIi4uLy4uLy4uLy4uL2xheWVycy9kZXBlbmRlbmN5TGF5ZXIvbm9kZWpzL25vZGVfbW9kdWxlcy9heGlvcy9saWIvY2FuY2VsL0NhbmNlbGVkRXJyb3IuanMiLCAiLi4vLi4vLi4vLi4vbGF5ZXJzL2RlcGVuZGVuY3lMYXllci9ub2RlanMvbm9kZV9tb2R1bGVzL2F4aW9zL2xpYi9jb3JlL3NldHRsZS5qcyIsICIuLi8uLi8uLi8uLi9sYXllcnMvZGVwZW5kZW5jeUxheWVyL25vZGVqcy9ub2RlX21vZHVsZXMvYXhpb3MvbGliL2hlbHBlcnMvaXNBYnNvbHV0ZVVSTC5qcyIsICIuLi8uLi8uLi8uLi9sYXllcnMvZGVwZW5kZW5jeUxheWVyL25vZGVqcy9ub2RlX21vZHVsZXMvYXhpb3MvbGliL2hlbHBlcnMvY29tYmluZVVSTHMuanMiLCAiLi4vLi4vLi4vLi4vbGF5ZXJzL2RlcGVuZGVuY3lMYXllci9ub2RlanMvbm9kZV9tb2R1bGVzL2F4aW9zL2xpYi9jb3JlL2J1aWxkRnVsbFBhdGguanMiLCAiLi4vLi4vLi4vLi4vbGF5ZXJzL2RlcGVuZGVuY3lMYXllci9ub2RlanMvbm9kZV9tb2R1bGVzL2F4aW9zL2xpYi9hZGFwdGVycy9odHRwLmpzIiwgIi4uLy4uLy4uLy4uL2xheWVycy9kZXBlbmRlbmN5TGF5ZXIvbm9kZWpzL25vZGVfbW9kdWxlcy9heGlvcy9saWIvZW52L2RhdGEuanMiLCAiLi4vLi4vLi4vLi4vbGF5ZXJzL2RlcGVuZGVuY3lMYXllci9ub2RlanMvbm9kZV9tb2R1bGVzL2F4aW9zL2xpYi9oZWxwZXJzL3BhcnNlUHJvdG9jb2wuanMiLCAiLi4vLi4vLi4vLi4vbGF5ZXJzL2RlcGVuZGVuY3lMYXllci9ub2RlanMvbm9kZV9tb2R1bGVzL2F4aW9zL2xpYi9oZWxwZXJzL2Zyb21EYXRhVVJJLmpzIiwgIi4uLy4uLy4uLy4uL2xheWVycy9kZXBlbmRlbmN5TGF5ZXIvbm9kZWpzL25vZGVfbW9kdWxlcy9heGlvcy9saWIvaGVscGVycy9BeGlvc1RyYW5zZm9ybVN0cmVhbS5qcyIsICIuLi8uLi8uLi8uLi9sYXllcnMvZGVwZW5kZW5jeUxheWVyL25vZGVqcy9ub2RlX21vZHVsZXMvYXhpb3MvbGliL2hlbHBlcnMvdGhyb3R0bGUuanMiLCAiLi4vLi4vLi4vLi4vbGF5ZXJzL2RlcGVuZGVuY3lMYXllci9ub2RlanMvbm9kZV9tb2R1bGVzL2F4aW9zL2xpYi9oZWxwZXJzL3NwZWVkb21ldGVyLmpzIiwgIi4uLy4uLy4uLy4uL2xheWVycy9kZXBlbmRlbmN5TGF5ZXIvbm9kZWpzL25vZGVfbW9kdWxlcy9heGlvcy9saWIvaGVscGVycy9mb3JtRGF0YVRvU3RyZWFtLmpzIiwgIi4uLy4uLy4uLy4uL2xheWVycy9kZXBlbmRlbmN5TGF5ZXIvbm9kZWpzL25vZGVfbW9kdWxlcy9heGlvcy9saWIvaGVscGVycy9yZWFkQmxvYi5qcyIsICIuLi8uLi8uLi8uLi9sYXllcnMvZGVwZW5kZW5jeUxheWVyL25vZGVqcy9ub2RlX21vZHVsZXMvYXhpb3MvbGliL2hlbHBlcnMvWmxpYkhlYWRlclRyYW5zZm9ybVN0cmVhbS5qcyIsICIuLi8uLi8uLi8uLi9sYXllcnMvZGVwZW5kZW5jeUxheWVyL25vZGVqcy9ub2RlX21vZHVsZXMvYXhpb3MvbGliL2hlbHBlcnMvY2FsbGJhY2tpZnkuanMiLCAiLi4vLi4vLi4vLi4vbGF5ZXJzL2RlcGVuZGVuY3lMYXllci9ub2RlanMvbm9kZV9tb2R1bGVzL2F4aW9zL2xpYi9oZWxwZXJzL2Nvb2tpZXMuanMiLCAiLi4vLi4vLi4vLi4vbGF5ZXJzL2RlcGVuZGVuY3lMYXllci9ub2RlanMvbm9kZV9tb2R1bGVzL2F4aW9zL2xpYi9oZWxwZXJzL2lzVVJMU2FtZU9yaWdpbi5qcyIsICIuLi8uLi8uLi8uLi9sYXllcnMvZGVwZW5kZW5jeUxheWVyL25vZGVqcy9ub2RlX21vZHVsZXMvYXhpb3MvbGliL2FkYXB0ZXJzL3hoci5qcyIsICIuLi8uLi8uLi8uLi9sYXllcnMvZGVwZW5kZW5jeUxheWVyL25vZGVqcy9ub2RlX21vZHVsZXMvYXhpb3MvbGliL2FkYXB0ZXJzL2FkYXB0ZXJzLmpzIiwgIi4uLy4uLy4uLy4uL2xheWVycy9kZXBlbmRlbmN5TGF5ZXIvbm9kZWpzL25vZGVfbW9kdWxlcy9heGlvcy9saWIvY29yZS9kaXNwYXRjaFJlcXVlc3QuanMiLCAiLi4vLi4vLi4vLi4vbGF5ZXJzL2RlcGVuZGVuY3lMYXllci9ub2RlanMvbm9kZV9tb2R1bGVzL2F4aW9zL2xpYi9jb3JlL21lcmdlQ29uZmlnLmpzIiwgIi4uLy4uLy4uLy4uL2xheWVycy9kZXBlbmRlbmN5TGF5ZXIvbm9kZWpzL25vZGVfbW9kdWxlcy9heGlvcy9saWIvaGVscGVycy92YWxpZGF0b3IuanMiLCAiLi4vLi4vLi4vLi4vbGF5ZXJzL2RlcGVuZGVuY3lMYXllci9ub2RlanMvbm9kZV9tb2R1bGVzL2F4aW9zL2xpYi9jb3JlL0F4aW9zLmpzIiwgIi4uLy4uLy4uLy4uL2xheWVycy9kZXBlbmRlbmN5TGF5ZXIvbm9kZWpzL25vZGVfbW9kdWxlcy9heGlvcy9saWIvY2FuY2VsL0NhbmNlbFRva2VuLmpzIiwgIi4uLy4uLy4uLy4uL2xheWVycy9kZXBlbmRlbmN5TGF5ZXIvbm9kZWpzL25vZGVfbW9kdWxlcy9heGlvcy9saWIvaGVscGVycy9zcHJlYWQuanMiLCAiLi4vLi4vLi4vLi4vbGF5ZXJzL2RlcGVuZGVuY3lMYXllci9ub2RlanMvbm9kZV9tb2R1bGVzL2F4aW9zL2xpYi9oZWxwZXJzL2lzQXhpb3NFcnJvci5qcyIsICIuLi8uLi8uLi8uLi9sYXllcnMvZGVwZW5kZW5jeUxheWVyL25vZGVqcy9ub2RlX21vZHVsZXMvYXhpb3MvbGliL2hlbHBlcnMvSHR0cFN0YXR1c0NvZGUuanMiLCAiLi4vLi4vLi4vLi4vbGF5ZXJzL2RlcGVuZGVuY3lMYXllci9ub2RlanMvbm9kZV9tb2R1bGVzL2F4aW9zL2xpYi9heGlvcy5qcyIsICIuLi8uLi8uLi8uLi9sYXllcnMvZGVwZW5kZW5jeUxheWVyL25vZGVqcy9ub2RlX21vZHVsZXMvYXhpb3MvaW5kZXguanMiLCAiLi4vLi4vLi4vLi4vbGF5ZXJzL2RlcGVuZGVuY3lMYXllci9vcHQvYWJyLnRzIl0sCiAgIm1hcHBpbmdzIjogIjs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7QUFBQTtBQUFBO0FBQUEsUUFBSSxTQUFTLFVBQVEsUUFBUSxFQUFFO0FBQy9CLFFBQUlBLFFBQU8sVUFBUSxNQUFNO0FBRXpCLFdBQU8sVUFBVTtBQUNqQixhQUFTLGdCQUFnQjtBQUN2QixXQUFLLFNBQVM7QUFDZCxXQUFLLFdBQVc7QUFDaEIsV0FBSyxjQUFjLE9BQU87QUFDMUIsV0FBSyxjQUFjO0FBRW5CLFdBQUssdUJBQXVCO0FBQzVCLFdBQUssWUFBWTtBQUNqQixXQUFLLGtCQUFrQixDQUFDO0FBQUEsSUFDMUI7QUFDQSxJQUFBQSxNQUFLLFNBQVMsZUFBZSxNQUFNO0FBRW5DLGtCQUFjLFNBQVMsU0FBUyxRQUFRLFNBQVM7QUFDL0MsVUFBSSxnQkFBZ0IsSUFBSSxLQUFLO0FBRTdCLGdCQUFVLFdBQVcsQ0FBQztBQUN0QixlQUFTLFVBQVUsU0FBUztBQUMxQixzQkFBYyxNQUFNLElBQUksUUFBUSxNQUFNO0FBQUEsTUFDeEM7QUFFQSxvQkFBYyxTQUFTO0FBRXZCLFVBQUksV0FBVyxPQUFPO0FBQ3RCLGFBQU8sT0FBTyxXQUFXO0FBQ3ZCLHNCQUFjLFlBQVksU0FBUztBQUNuQyxlQUFPLFNBQVMsTUFBTSxRQUFRLFNBQVM7QUFBQSxNQUN6QztBQUVBLGFBQU8sR0FBRyxTQUFTLFdBQVc7QUFBQSxNQUFDLENBQUM7QUFDaEMsVUFBSSxjQUFjLGFBQWE7QUFDN0IsZUFBTyxNQUFNO0FBQUEsTUFDZjtBQUVBLGFBQU87QUFBQSxJQUNUO0FBRUEsV0FBTyxlQUFlLGNBQWMsV0FBVyxZQUFZO0FBQUEsTUFDekQsY0FBYztBQUFBLE1BQ2QsWUFBWTtBQUFBLE1BQ1osS0FBSyxXQUFXO0FBQ2QsZUFBTyxLQUFLLE9BQU87QUFBQSxNQUNyQjtBQUFBLElBQ0YsQ0FBQztBQUVELGtCQUFjLFVBQVUsY0FBYyxXQUFXO0FBQy9DLGFBQU8sS0FBSyxPQUFPLFlBQVksTUFBTSxLQUFLLFFBQVEsU0FBUztBQUFBLElBQzdEO0FBRUEsa0JBQWMsVUFBVSxTQUFTLFdBQVc7QUFDMUMsVUFBSSxDQUFDLEtBQUssV0FBVztBQUNuQixhQUFLLFFBQVE7QUFBQSxNQUNmO0FBRUEsV0FBSyxPQUFPLE9BQU87QUFBQSxJQUNyQjtBQUVBLGtCQUFjLFVBQVUsUUFBUSxXQUFXO0FBQ3pDLFdBQUssT0FBTyxNQUFNO0FBQUEsSUFDcEI7QUFFQSxrQkFBYyxVQUFVLFVBQVUsV0FBVztBQUMzQyxXQUFLLFlBQVk7QUFFakIsV0FBSyxnQkFBZ0IsUUFBUSxTQUFTLE1BQU07QUFDMUMsYUFBSyxLQUFLLE1BQU0sTUFBTSxJQUFJO0FBQUEsTUFDNUIsRUFBRSxLQUFLLElBQUksQ0FBQztBQUNaLFdBQUssa0JBQWtCLENBQUM7QUFBQSxJQUMxQjtBQUVBLGtCQUFjLFVBQVUsT0FBTyxXQUFXO0FBQ3hDLFVBQUksSUFBSSxPQUFPLFVBQVUsS0FBSyxNQUFNLE1BQU0sU0FBUztBQUNuRCxXQUFLLE9BQU87QUFDWixhQUFPO0FBQUEsSUFDVDtBQUVBLGtCQUFjLFVBQVUsY0FBYyxTQUFTLE1BQU07QUFDbkQsVUFBSSxLQUFLLFdBQVc7QUFDbEIsYUFBSyxLQUFLLE1BQU0sTUFBTSxJQUFJO0FBQzFCO0FBQUEsTUFDRjtBQUVBLFVBQUksS0FBSyxDQUFDLE1BQU0sUUFBUTtBQUN0QixhQUFLLFlBQVksS0FBSyxDQUFDLEVBQUU7QUFDekIsYUFBSyw0QkFBNEI7QUFBQSxNQUNuQztBQUVBLFdBQUssZ0JBQWdCLEtBQUssSUFBSTtBQUFBLElBQ2hDO0FBRUEsa0JBQWMsVUFBVSw4QkFBOEIsV0FBVztBQUMvRCxVQUFJLEtBQUssc0JBQXNCO0FBQzdCO0FBQUEsTUFDRjtBQUVBLFVBQUksS0FBSyxZQUFZLEtBQUssYUFBYTtBQUNyQztBQUFBLE1BQ0Y7QUFFQSxXQUFLLHVCQUF1QjtBQUM1QixVQUFJLFVBQ0Ysa0NBQWtDLEtBQUssY0FBYztBQUN2RCxXQUFLLEtBQUssU0FBUyxJQUFJLE1BQU0sT0FBTyxDQUFDO0FBQUEsSUFDdkM7QUFBQTtBQUFBOzs7QUMxR0E7QUFBQTtBQUFBLFFBQUlDLFFBQU8sVUFBUSxNQUFNO0FBQ3pCLFFBQUksU0FBUyxVQUFRLFFBQVEsRUFBRTtBQUMvQixRQUFJLGdCQUFnQjtBQUVwQixXQUFPLFVBQVU7QUFDakIsYUFBUyxpQkFBaUI7QUFDeEIsV0FBSyxXQUFXO0FBQ2hCLFdBQUssV0FBVztBQUNoQixXQUFLLFdBQVc7QUFDaEIsV0FBSyxjQUFjLElBQUksT0FBTztBQUM5QixXQUFLLGVBQWU7QUFFcEIsV0FBSyxZQUFZO0FBQ2pCLFdBQUssV0FBVyxDQUFDO0FBQ2pCLFdBQUssaUJBQWlCO0FBQ3RCLFdBQUssY0FBYztBQUNuQixXQUFLLGVBQWU7QUFBQSxJQUN0QjtBQUNBLElBQUFBLE1BQUssU0FBUyxnQkFBZ0IsTUFBTTtBQUVwQyxtQkFBZSxTQUFTLFNBQVMsU0FBUztBQUN4QyxVQUFJLGlCQUFpQixJQUFJLEtBQUs7QUFFOUIsZ0JBQVUsV0FBVyxDQUFDO0FBQ3RCLGVBQVMsVUFBVSxTQUFTO0FBQzFCLHVCQUFlLE1BQU0sSUFBSSxRQUFRLE1BQU07QUFBQSxNQUN6QztBQUVBLGFBQU87QUFBQSxJQUNUO0FBRUEsbUJBQWUsZUFBZSxTQUFTQyxTQUFRO0FBQzdDLGFBQVEsT0FBT0EsWUFBVyxjQUNwQixPQUFPQSxZQUFXLFlBQ2xCLE9BQU9BLFlBQVcsYUFDbEIsT0FBT0EsWUFBVyxZQUNsQixDQUFDLE9BQU8sU0FBU0EsT0FBTTtBQUFBLElBQy9CO0FBRUEsbUJBQWUsVUFBVSxTQUFTLFNBQVNBLFNBQVE7QUFDakQsVUFBSSxlQUFlLGVBQWUsYUFBYUEsT0FBTTtBQUVyRCxVQUFJLGNBQWM7QUFDaEIsWUFBSSxFQUFFQSxtQkFBa0IsZ0JBQWdCO0FBQ3RDLGNBQUksWUFBWSxjQUFjLE9BQU9BLFNBQVE7QUFBQSxZQUMzQyxhQUFhO0FBQUEsWUFDYixhQUFhLEtBQUs7QUFBQSxVQUNwQixDQUFDO0FBQ0QsVUFBQUEsUUFBTyxHQUFHLFFBQVEsS0FBSyxlQUFlLEtBQUssSUFBSSxDQUFDO0FBQ2hELFVBQUFBLFVBQVM7QUFBQSxRQUNYO0FBRUEsYUFBSyxjQUFjQSxPQUFNO0FBRXpCLFlBQUksS0FBSyxjQUFjO0FBQ3JCLFVBQUFBLFFBQU8sTUFBTTtBQUFBLFFBQ2Y7QUFBQSxNQUNGO0FBRUEsV0FBSyxTQUFTLEtBQUtBLE9BQU07QUFDekIsYUFBTztBQUFBLElBQ1Q7QUFFQSxtQkFBZSxVQUFVLE9BQU8sU0FBUyxNQUFNLFNBQVM7QUFDdEQsYUFBTyxVQUFVLEtBQUssS0FBSyxNQUFNLE1BQU0sT0FBTztBQUM5QyxXQUFLLE9BQU87QUFDWixhQUFPO0FBQUEsSUFDVDtBQUVBLG1CQUFlLFVBQVUsV0FBVyxXQUFXO0FBQzdDLFdBQUssaUJBQWlCO0FBRXRCLFVBQUksS0FBSyxhQUFhO0FBQ3BCLGFBQUssZUFBZTtBQUNwQjtBQUFBLE1BQ0Y7QUFFQSxXQUFLLGNBQWM7QUFDbkIsVUFBSTtBQUNGLFdBQUc7QUFDRCxlQUFLLGVBQWU7QUFDcEIsZUFBSyxhQUFhO0FBQUEsUUFDcEIsU0FBUyxLQUFLO0FBQUEsTUFDaEIsVUFBRTtBQUNBLGFBQUssY0FBYztBQUFBLE1BQ3JCO0FBQUEsSUFDRjtBQUVBLG1CQUFlLFVBQVUsZUFBZSxXQUFXO0FBQ2pELFVBQUlBLFVBQVMsS0FBSyxTQUFTLE1BQU07QUFHakMsVUFBSSxPQUFPQSxXQUFVLGFBQWE7QUFDaEMsYUFBSyxJQUFJO0FBQ1Q7QUFBQSxNQUNGO0FBRUEsVUFBSSxPQUFPQSxZQUFXLFlBQVk7QUFDaEMsYUFBSyxVQUFVQSxPQUFNO0FBQ3JCO0FBQUEsTUFDRjtBQUVBLFVBQUksWUFBWUE7QUFDaEIsZ0JBQVUsU0FBU0EsU0FBUTtBQUN6QixZQUFJLGVBQWUsZUFBZSxhQUFhQSxPQUFNO0FBQ3JELFlBQUksY0FBYztBQUNoQixVQUFBQSxRQUFPLEdBQUcsUUFBUSxLQUFLLGVBQWUsS0FBSyxJQUFJLENBQUM7QUFDaEQsZUFBSyxjQUFjQSxPQUFNO0FBQUEsUUFDM0I7QUFFQSxhQUFLLFVBQVVBLE9BQU07QUFBQSxNQUN2QixFQUFFLEtBQUssSUFBSSxDQUFDO0FBQUEsSUFDZDtBQUVBLG1CQUFlLFVBQVUsWUFBWSxTQUFTQSxTQUFRO0FBQ3BELFdBQUssaUJBQWlCQTtBQUV0QixVQUFJLGVBQWUsZUFBZSxhQUFhQSxPQUFNO0FBQ3JELFVBQUksY0FBYztBQUNoQixRQUFBQSxRQUFPLEdBQUcsT0FBTyxLQUFLLFNBQVMsS0FBSyxJQUFJLENBQUM7QUFDekMsUUFBQUEsUUFBTyxLQUFLLE1BQU0sRUFBQyxLQUFLLE1BQUssQ0FBQztBQUM5QjtBQUFBLE1BQ0Y7QUFFQSxVQUFJLFFBQVFBO0FBQ1osV0FBSyxNQUFNLEtBQUs7QUFDaEIsV0FBSyxTQUFTO0FBQUEsSUFDaEI7QUFFQSxtQkFBZSxVQUFVLGdCQUFnQixTQUFTQSxTQUFRO0FBQ3hELFVBQUlDLFFBQU87QUFDWCxNQUFBRCxRQUFPLEdBQUcsU0FBUyxTQUFTLEtBQUs7QUFDL0IsUUFBQUMsTUFBSyxXQUFXLEdBQUc7QUFBQSxNQUNyQixDQUFDO0FBQUEsSUFDSDtBQUVBLG1CQUFlLFVBQVUsUUFBUSxTQUFTLE1BQU07QUFDOUMsV0FBSyxLQUFLLFFBQVEsSUFBSTtBQUFBLElBQ3hCO0FBRUEsbUJBQWUsVUFBVSxRQUFRLFdBQVc7QUFDMUMsVUFBSSxDQUFDLEtBQUssY0FBYztBQUN0QjtBQUFBLE1BQ0Y7QUFFQSxVQUFHLEtBQUssZ0JBQWdCLEtBQUssa0JBQWtCLE9BQU8sS0FBSyxlQUFlLFNBQVU7QUFBWSxhQUFLLGVBQWUsTUFBTTtBQUMxSCxXQUFLLEtBQUssT0FBTztBQUFBLElBQ25CO0FBRUEsbUJBQWUsVUFBVSxTQUFTLFdBQVc7QUFDM0MsVUFBSSxDQUFDLEtBQUssV0FBVztBQUNuQixhQUFLLFlBQVk7QUFDakIsYUFBSyxXQUFXO0FBQ2hCLGFBQUssU0FBUztBQUFBLE1BQ2hCO0FBRUEsVUFBRyxLQUFLLGdCQUFnQixLQUFLLGtCQUFrQixPQUFPLEtBQUssZUFBZSxVQUFXO0FBQVksYUFBSyxlQUFlLE9BQU87QUFDNUgsV0FBSyxLQUFLLFFBQVE7QUFBQSxJQUNwQjtBQUVBLG1CQUFlLFVBQVUsTUFBTSxXQUFXO0FBQ3hDLFdBQUssT0FBTztBQUNaLFdBQUssS0FBSyxLQUFLO0FBQUEsSUFDakI7QUFFQSxtQkFBZSxVQUFVLFVBQVUsV0FBVztBQUM1QyxXQUFLLE9BQU87QUFDWixXQUFLLEtBQUssT0FBTztBQUFBLElBQ25CO0FBRUEsbUJBQWUsVUFBVSxTQUFTLFdBQVc7QUFDM0MsV0FBSyxXQUFXO0FBQ2hCLFdBQUssV0FBVyxDQUFDO0FBQ2pCLFdBQUssaUJBQWlCO0FBQUEsSUFDeEI7QUFFQSxtQkFBZSxVQUFVLGlCQUFpQixXQUFXO0FBQ25ELFdBQUssZ0JBQWdCO0FBQ3JCLFVBQUksS0FBSyxZQUFZLEtBQUssYUFBYTtBQUNyQztBQUFBLE1BQ0Y7QUFFQSxVQUFJLFVBQ0Ysa0NBQWtDLEtBQUssY0FBYztBQUN2RCxXQUFLLFdBQVcsSUFBSSxNQUFNLE9BQU8sQ0FBQztBQUFBLElBQ3BDO0FBRUEsbUJBQWUsVUFBVSxrQkFBa0IsV0FBVztBQUNwRCxXQUFLLFdBQVc7QUFFaEIsVUFBSUEsUUFBTztBQUNYLFdBQUssU0FBUyxRQUFRLFNBQVNELFNBQVE7QUFDckMsWUFBSSxDQUFDQSxRQUFPLFVBQVU7QUFDcEI7QUFBQSxRQUNGO0FBRUEsUUFBQUMsTUFBSyxZQUFZRCxRQUFPO0FBQUEsTUFDMUIsQ0FBQztBQUVELFVBQUksS0FBSyxrQkFBa0IsS0FBSyxlQUFlLFVBQVU7QUFDdkQsYUFBSyxZQUFZLEtBQUssZUFBZTtBQUFBLE1BQ3ZDO0FBQUEsSUFDRjtBQUVBLG1CQUFlLFVBQVUsYUFBYSxTQUFTLEtBQUs7QUFDbEQsV0FBSyxPQUFPO0FBQ1osV0FBSyxLQUFLLFNBQVMsR0FBRztBQUFBLElBQ3hCO0FBQUE7QUFBQTs7O0FDL01BO0FBQUE7QUFBQTtBQUFBLE1BQ0Usd0NBQXdDO0FBQUEsUUFDdEMsUUFBVTtBQUFBLE1BQ1o7QUFBQSxNQUNBLHNDQUFzQztBQUFBLFFBQ3BDLFFBQVU7QUFBQSxRQUNWLFNBQVc7QUFBQSxRQUNYLGNBQWdCO0FBQUEsTUFDbEI7QUFBQSxNQUNBLDRCQUE0QjtBQUFBLFFBQzFCLFFBQVU7QUFBQSxRQUNWLGNBQWdCO0FBQUEsTUFDbEI7QUFBQSxNQUNBLDRCQUE0QjtBQUFBLFFBQzFCLFFBQVU7QUFBQSxRQUNWLGNBQWdCO0FBQUEsTUFDbEI7QUFBQSxNQUNBLGlDQUFpQztBQUFBLFFBQy9CLFFBQVU7QUFBQSxRQUNWLGNBQWdCO0FBQUEsTUFDbEI7QUFBQSxNQUNBLG1CQUFtQjtBQUFBLFFBQ2pCLFFBQVU7QUFBQSxNQUNaO0FBQUEsTUFDQSx3QkFBd0I7QUFBQSxRQUN0QixRQUFVO0FBQUEsTUFDWjtBQUFBLE1BQ0EsNkJBQTZCO0FBQUEsUUFDM0IsUUFBVTtBQUFBLE1BQ1o7QUFBQSxNQUNBLDZCQUE2QjtBQUFBLFFBQzNCLFFBQVU7QUFBQSxRQUNWLGNBQWdCO0FBQUEsTUFDbEI7QUFBQSxNQUNBLGlDQUFpQztBQUFBLFFBQy9CLFFBQVU7QUFBQSxRQUNWLGNBQWdCO0FBQUEsTUFDbEI7QUFBQSxNQUNBLHVDQUF1QztBQUFBLFFBQ3JDLFFBQVU7QUFBQSxRQUNWLGNBQWdCO0FBQUEsTUFDbEI7QUFBQSxNQUNBLG1DQUFtQztBQUFBLFFBQ2pDLFFBQVU7QUFBQSxRQUNWLGNBQWdCO0FBQUEsTUFDbEI7QUFBQSxNQUNBLHNDQUFzQztBQUFBLFFBQ3BDLFFBQVU7QUFBQSxRQUNWLGNBQWdCO0FBQUEsTUFDbEI7QUFBQSxNQUNBLDRDQUE0QztBQUFBLFFBQzFDLFFBQVU7QUFBQSxRQUNWLGNBQWdCO0FBQUEsTUFDbEI7QUFBQSxNQUNBLHNDQUFzQztBQUFBLFFBQ3BDLFFBQVU7QUFBQSxRQUNWLGNBQWdCO0FBQUEsTUFDbEI7QUFBQSxNQUNBLDRDQUE0QztBQUFBLFFBQzFDLFFBQVU7QUFBQSxRQUNWLGNBQWdCO0FBQUEsTUFDbEI7QUFBQSxNQUNBLCtCQUErQjtBQUFBLFFBQzdCLFFBQVU7QUFBQSxRQUNWLGNBQWdCO0FBQUEsTUFDbEI7QUFBQSxNQUNBLG9DQUFvQztBQUFBLFFBQ2xDLFFBQVU7QUFBQSxRQUNWLGNBQWdCO0FBQUEsTUFDbEI7QUFBQSxNQUNBLDBDQUEwQztBQUFBLFFBQ3hDLFFBQVU7QUFBQSxRQUNWLGNBQWdCO0FBQUEsTUFDbEI7QUFBQSxNQUNBLDZDQUE2QztBQUFBLFFBQzNDLFFBQVU7QUFBQSxRQUNWLGNBQWdCO0FBQUEsTUFDbEI7QUFBQSxNQUNBLDRDQUE0QztBQUFBLFFBQzFDLFFBQVU7QUFBQSxRQUNWLGNBQWdCO0FBQUEsTUFDbEI7QUFBQSxNQUNBLG1CQUFtQjtBQUFBLFFBQ2pCLFFBQVU7QUFBQSxNQUNaO0FBQUEsTUFDQSw0QkFBNEI7QUFBQSxRQUMxQixRQUFVO0FBQUEsUUFDVixZQUFjLENBQUMsSUFBSTtBQUFBLE1BQ3JCO0FBQUEsTUFDQSx5QkFBeUI7QUFBQSxRQUN2QixRQUFVO0FBQUEsTUFDWjtBQUFBLE1BQ0EsMEJBQTBCO0FBQUEsUUFDeEIsUUFBVTtBQUFBLFFBQ1YsWUFBYyxDQUFDLElBQUk7QUFBQSxNQUNyQjtBQUFBLE1BQ0Esc0JBQXNCO0FBQUEsUUFDcEIsUUFBVTtBQUFBLE1BQ1o7QUFBQSxNQUNBLG1CQUFtQjtBQUFBLFFBQ2pCLFFBQVU7QUFBQSxNQUNaO0FBQUEsTUFDQSxvQkFBb0I7QUFBQSxRQUNsQixRQUFVO0FBQUEsTUFDWjtBQUFBLE1BQ0Esd0JBQXdCO0FBQUEsUUFDdEIsUUFBVTtBQUFBLFFBQ1YsY0FBZ0I7QUFBQSxRQUNoQixZQUFjLENBQUMsTUFBTTtBQUFBLE1BQ3ZCO0FBQUEsTUFDQSwyQkFBMkI7QUFBQSxRQUN6QixRQUFVO0FBQUEsUUFDVixjQUFnQjtBQUFBLFFBQ2hCLFlBQWMsQ0FBQyxTQUFTO0FBQUEsTUFDMUI7QUFBQSxNQUNBLCtCQUErQjtBQUFBLFFBQzdCLFFBQVU7QUFBQSxRQUNWLGNBQWdCO0FBQUEsUUFDaEIsWUFBYyxDQUFDLGFBQWE7QUFBQSxNQUM5QjtBQUFBLE1BQ0EsMEJBQTBCO0FBQUEsUUFDeEIsUUFBVTtBQUFBLE1BQ1o7QUFBQSxNQUNBLDJCQUEyQjtBQUFBLFFBQ3pCLFFBQVU7QUFBQSxRQUNWLGNBQWdCO0FBQUEsUUFDaEIsWUFBYyxDQUFDLFNBQVM7QUFBQSxNQUMxQjtBQUFBLE1BQ0EsNEJBQTRCO0FBQUEsUUFDMUIsUUFBVTtBQUFBLFFBQ1YsY0FBZ0I7QUFBQSxRQUNoQixZQUFjLENBQUMsS0FBSztBQUFBLE1BQ3RCO0FBQUEsTUFDQSwwQ0FBMEM7QUFBQSxRQUN4QyxRQUFVO0FBQUEsTUFDWjtBQUFBLE1BQ0EsNkJBQTZCO0FBQUEsUUFDM0IsUUFBVTtBQUFBLFFBQ1YsY0FBZ0I7QUFBQSxRQUNoQixZQUFjLENBQUMsTUFBTTtBQUFBLE1BQ3ZCO0FBQUEsTUFDQSw2QkFBNkI7QUFBQSxRQUMzQixRQUFVO0FBQUEsUUFDVixjQUFnQjtBQUFBLE1BQ2xCO0FBQUEsTUFDQSw2QkFBNkI7QUFBQSxRQUMzQixRQUFVO0FBQUEsUUFDVixjQUFnQjtBQUFBLFFBQ2hCLFlBQWMsQ0FBQyxNQUFNO0FBQUEsTUFDdkI7QUFBQSxNQUNBLHFCQUFxQjtBQUFBLFFBQ25CLFFBQVU7QUFBQSxNQUNaO0FBQUEsTUFDQSwrQkFBK0I7QUFBQSxRQUM3QixRQUFVO0FBQUEsUUFDVixjQUFnQjtBQUFBLE1BQ2xCO0FBQUEsTUFDQSw4QkFBOEI7QUFBQSxRQUM1QixRQUFVO0FBQUEsUUFDVixjQUFnQjtBQUFBLE1BQ2xCO0FBQUEsTUFDQSwwQkFBMEI7QUFBQSxRQUN4QixRQUFVO0FBQUEsTUFDWjtBQUFBLE1BQ0Esb0JBQW9CO0FBQUEsUUFDbEIsY0FBZ0I7QUFBQSxRQUNoQixZQUFjLENBQUMsTUFBTTtBQUFBLE1BQ3ZCO0FBQUEsTUFDQSx3QkFBd0I7QUFBQSxRQUN0QixRQUFVO0FBQUEsUUFDVixTQUFXO0FBQUEsUUFDWCxjQUFnQjtBQUFBLE1BQ2xCO0FBQUEsTUFDQSw2QkFBNkI7QUFBQSxRQUMzQixRQUFVO0FBQUEsUUFDVixjQUFnQjtBQUFBLE1BQ2xCO0FBQUEsTUFDQSw0QkFBNEI7QUFBQSxRQUMxQixRQUFVO0FBQUEsUUFDVixjQUFnQjtBQUFBLFFBQ2hCLFlBQWMsQ0FBQyxLQUFLO0FBQUEsTUFDdEI7QUFBQSxNQUNBLCtCQUErQjtBQUFBLFFBQzdCLFFBQVU7QUFBQSxNQUNaO0FBQUEsTUFDQSx5QkFBeUI7QUFBQSxRQUN2QixRQUFVO0FBQUEsTUFDWjtBQUFBLE1BQ0EsNEJBQTRCO0FBQUEsUUFDMUIsUUFBVTtBQUFBLFFBQ1YsY0FBZ0I7QUFBQSxNQUNsQjtBQUFBLE1BQ0Esb0JBQW9CO0FBQUEsUUFDbEIsUUFBVTtBQUFBLE1BQ1o7QUFBQSxNQUNBLHdCQUF3QjtBQUFBLFFBQ3RCLFFBQVU7QUFBQSxNQUNaO0FBQUEsTUFDQSxxQkFBcUI7QUFBQSxRQUNuQixRQUFVO0FBQUEsTUFDWjtBQUFBLE1BQ0Esd0JBQXdCO0FBQUEsUUFDdEIsUUFBVTtBQUFBLFFBQ1YsY0FBZ0I7QUFBQSxNQUNsQjtBQUFBLE1BQ0EseUJBQXlCO0FBQUEsUUFDdkIsUUFBVTtBQUFBLFFBQ1YsY0FBZ0I7QUFBQSxRQUNoQixZQUFjLENBQUMsT0FBTztBQUFBLE1BQ3hCO0FBQUEsTUFDQSx3QkFBd0I7QUFBQSxRQUN0QixRQUFVO0FBQUEsUUFDVixjQUFnQjtBQUFBLFFBQ2hCLFlBQWMsQ0FBQyxNQUFNO0FBQUEsTUFDdkI7QUFBQSxNQUNBLCtCQUErQjtBQUFBLFFBQzdCLFFBQVU7QUFBQSxRQUNWLFlBQWMsQ0FBQyxPQUFPO0FBQUEsTUFDeEI7QUFBQSxNQUNBLDhCQUE4QjtBQUFBLFFBQzVCLFFBQVU7QUFBQSxRQUNWLFlBQWMsQ0FBQyxPQUFPO0FBQUEsTUFDeEI7QUFBQSxNQUNBLDJCQUEyQjtBQUFBLFFBQ3pCLFFBQVU7QUFBQSxRQUNWLFlBQWMsQ0FBQyxPQUFPO0FBQUEsTUFDeEI7QUFBQSxNQUNBLDJCQUEyQjtBQUFBLFFBQ3pCLFFBQVU7QUFBQSxRQUNWLFlBQWMsQ0FBQyxPQUFPO0FBQUEsTUFDeEI7QUFBQSxNQUNBLDBCQUEwQjtBQUFBLFFBQ3hCLFFBQVU7QUFBQSxRQUNWLFlBQWMsQ0FBQyxPQUFPO0FBQUEsTUFDeEI7QUFBQSxNQUNBLG9CQUFvQjtBQUFBLFFBQ2xCLFFBQVU7QUFBQSxNQUNaO0FBQUEsTUFDQSxtQkFBbUI7QUFBQSxRQUNqQixRQUFVO0FBQUEsTUFDWjtBQUFBLE1BQ0EsNEJBQTRCO0FBQUEsUUFDMUIsUUFBVTtBQUFBLFFBQ1YsY0FBZ0I7QUFBQSxNQUNsQjtBQUFBLE1BQ0EsMEJBQTBCO0FBQUEsUUFDeEIsUUFBVTtBQUFBLFFBQ1YsY0FBZ0I7QUFBQSxNQUNsQjtBQUFBLE1BQ0EsbUJBQW1CO0FBQUEsUUFDakIsUUFBVTtBQUFBLE1BQ1o7QUFBQSxNQUNBLHlCQUF5QjtBQUFBLFFBQ3ZCLFFBQVU7QUFBQSxRQUNWLGNBQWdCO0FBQUEsTUFDbEI7QUFBQSxNQUNBLG1CQUFtQjtBQUFBLFFBQ2pCLFFBQVU7QUFBQSxNQUNaO0FBQUEsTUFDQSx3QkFBd0I7QUFBQSxRQUN0QixRQUFVO0FBQUEsUUFDVixjQUFnQjtBQUFBLE1BQ2xCO0FBQUEsTUFDQSw2QkFBNkI7QUFBQSxRQUMzQixRQUFVO0FBQUEsUUFDVixjQUFnQjtBQUFBLE1BQ2xCO0FBQUEsTUFDQSxtQkFBbUI7QUFBQSxRQUNqQixRQUFVO0FBQUEsTUFDWjtBQUFBLE1BQ0Esd0JBQXdCO0FBQUEsUUFDdEIsUUFBVTtBQUFBLFFBQ1YsY0FBZ0I7QUFBQSxNQUNsQjtBQUFBLE1BQ0EsK0JBQStCO0FBQUEsUUFDN0IsUUFBVTtBQUFBLFFBQ1YsY0FBZ0I7QUFBQSxNQUNsQjtBQUFBLE1BQ0EsNEJBQTRCO0FBQUEsUUFDMUIsUUFBVTtBQUFBLE1BQ1o7QUFBQSxNQUNBLDRCQUE0QjtBQUFBLFFBQzFCLFFBQVU7QUFBQSxNQUNaO0FBQUEsTUFDQSxtQ0FBbUM7QUFBQSxRQUNqQyxRQUFVO0FBQUEsUUFDVixjQUFnQjtBQUFBLE1BQ2xCO0FBQUEsTUFDQSxvQkFBb0I7QUFBQSxRQUNsQixRQUFVO0FBQUEsTUFDWjtBQUFBLE1BQ0Esd0JBQXdCO0FBQUEsUUFDdEIsUUFBVTtBQUFBLE1BQ1o7QUFBQSxNQUNBLDRCQUE0QjtBQUFBLFFBQzFCLFFBQVU7QUFBQSxNQUNaO0FBQUEsTUFDQSx1QkFBdUI7QUFBQSxRQUNyQixRQUFVO0FBQUEsUUFDVixjQUFnQjtBQUFBLFFBQ2hCLFlBQWMsQ0FBQyxLQUFLO0FBQUEsTUFDdEI7QUFBQSxNQUNBLHdCQUF3QjtBQUFBLFFBQ3RCLFFBQVU7QUFBQSxNQUNaO0FBQUEsTUFDQSx3QkFBd0I7QUFBQSxRQUN0QixRQUFVO0FBQUEsUUFDVixjQUFnQjtBQUFBLE1BQ2xCO0FBQUEsTUFDQSw0QkFBNEI7QUFBQSxRQUMxQixRQUFVO0FBQUEsUUFDVixjQUFnQjtBQUFBLE1BQ2xCO0FBQUEsTUFDQSx5QkFBeUI7QUFBQSxRQUN2QixRQUFVO0FBQUEsUUFDVixjQUFnQjtBQUFBLE1BQ2xCO0FBQUEsTUFDQSx3QkFBd0I7QUFBQSxRQUN0QixRQUFVO0FBQUEsUUFDVixZQUFjLENBQUMsSUFBSTtBQUFBLE1BQ3JCO0FBQUEsTUFDQSxtQkFBbUI7QUFBQSxRQUNqQixRQUFVO0FBQUEsTUFDWjtBQUFBLE1BQ0EseUJBQXlCO0FBQUEsUUFDdkIsUUFBVTtBQUFBLE1BQ1o7QUFBQSxNQUNBLG9CQUFvQjtBQUFBLFFBQ2xCLGNBQWdCO0FBQUEsTUFDbEI7QUFBQSxNQUNBLHdCQUF3QjtBQUFBLFFBQ3RCLFFBQVU7QUFBQSxRQUNWLGNBQWdCO0FBQUEsUUFDaEIsWUFBYyxDQUFDLEtBQUs7QUFBQSxNQUN0QjtBQUFBLE1BQ0EsOEJBQThCO0FBQUEsUUFDNUIsUUFBVTtBQUFBLFFBQ1YsY0FBZ0I7QUFBQSxRQUNoQixZQUFjLENBQUMsS0FBSztBQUFBLE1BQ3RCO0FBQUEsTUFDQSx5QkFBeUI7QUFBQSxRQUN2QixRQUFVO0FBQUEsTUFDWjtBQUFBLE1BQ0EsNEJBQTRCO0FBQUEsUUFDMUIsUUFBVTtBQUFBLFFBQ1YsY0FBZ0I7QUFBQSxRQUNoQixZQUFjLENBQUMsVUFBVTtBQUFBLE1BQzNCO0FBQUEsTUFDQSx1QkFBdUI7QUFBQSxRQUNyQixRQUFVO0FBQUEsTUFDWjtBQUFBLE1BQ0EsbUJBQW1CO0FBQUEsUUFDakIsUUFBVTtBQUFBLE1BQ1o7QUFBQSxNQUNBLHNCQUFzQjtBQUFBLFFBQ3BCLFFBQVU7QUFBQSxNQUNaO0FBQUEsTUFDQSwrQkFBK0I7QUFBQSxRQUM3QixRQUFVO0FBQUEsUUFDVixjQUFnQjtBQUFBLE1BQ2xCO0FBQUEsTUFDQSxxQkFBcUI7QUFBQSxRQUNuQixRQUFVO0FBQUEsTUFDWjtBQUFBLE1BQ0EsMEJBQTBCO0FBQUEsUUFDeEIsUUFBVTtBQUFBLFFBQ1YsY0FBZ0I7QUFBQSxNQUNsQjtBQUFBLE1BQ0EseUJBQXlCO0FBQUEsUUFDdkIsUUFBVTtBQUFBLFFBQ1YsY0FBZ0I7QUFBQSxNQUNsQjtBQUFBLE1BQ0EsbUJBQW1CO0FBQUEsUUFDakIsUUFBVTtBQUFBLE1BQ1o7QUFBQSxNQUNBLG1CQUFtQjtBQUFBLFFBQ2pCLFFBQVU7QUFBQSxNQUNaO0FBQUEsTUFDQSxtQkFBbUI7QUFBQSxRQUNqQixRQUFVO0FBQUEsTUFDWjtBQUFBLE1BQ0Esd0JBQXdCO0FBQUEsUUFDdEIsUUFBVTtBQUFBLFFBQ1YsY0FBZ0I7QUFBQSxNQUNsQjtBQUFBLE1BQ0EsMkJBQTJCO0FBQUEsUUFDekIsUUFBVTtBQUFBLE1BQ1o7QUFBQSxNQUNBLDJCQUEyQjtBQUFBLFFBQ3pCLFFBQVU7QUFBQSxRQUNWLGNBQWdCO0FBQUEsUUFDaEIsWUFBYyxDQUFDLEtBQUs7QUFBQSxNQUN0QjtBQUFBLE1BQ0EseUJBQXlCO0FBQUEsUUFDdkIsUUFBVTtBQUFBLE1BQ1o7QUFBQSxNQUNBLHlCQUF5QjtBQUFBLFFBQ3ZCLFFBQVU7QUFBQSxRQUNWLGNBQWdCO0FBQUEsTUFDbEI7QUFBQSxNQUNBLHdCQUF3QjtBQUFBLFFBQ3RCLFFBQVU7QUFBQSxRQUNWLFlBQWMsQ0FBQyxNQUFNO0FBQUEsTUFDdkI7QUFBQSxNQUNBLHdCQUF3QjtBQUFBLFFBQ3RCLFFBQVU7QUFBQSxRQUNWLGNBQWdCO0FBQUEsUUFDaEIsWUFBYyxDQUFDLE9BQU87QUFBQSxNQUN4QjtBQUFBLE1BQ0Esb0JBQW9CO0FBQUEsUUFDbEIsUUFBVTtBQUFBLE1BQ1o7QUFBQSxNQUNBLDBCQUEwQjtBQUFBLFFBQ3hCLFFBQVU7QUFBQSxRQUNWLGNBQWdCO0FBQUEsUUFDaEIsWUFBYyxDQUFDLE1BQUssTUFBTTtBQUFBLE1BQzVCO0FBQUEsTUFDQSwyQkFBMkI7QUFBQSxRQUN6QixRQUFVO0FBQUEsTUFDWjtBQUFBLE1BQ0EsdUJBQXVCO0FBQUEsUUFDckIsUUFBVTtBQUFBLFFBQ1YsY0FBZ0I7QUFBQSxNQUNsQjtBQUFBLE1BQ0EsdUJBQXVCO0FBQUEsUUFDckIsUUFBVTtBQUFBLFFBQ1YsY0FBZ0I7QUFBQSxNQUNsQjtBQUFBLE1BQ0EsbUJBQW1CO0FBQUEsUUFDakIsUUFBVTtBQUFBLE1BQ1o7QUFBQSxNQUNBLHdCQUF3QjtBQUFBLFFBQ3RCLFFBQVU7QUFBQSxRQUNWLFNBQVc7QUFBQSxRQUNYLGNBQWdCO0FBQUEsTUFDbEI7QUFBQSxNQUNBLHVCQUF1QjtBQUFBLFFBQ3JCLFFBQVU7QUFBQSxRQUNWLGNBQWdCO0FBQUEsTUFDbEI7QUFBQSxNQUNBLHlDQUF5QztBQUFBLFFBQ3ZDLFFBQVU7QUFBQSxRQUNWLFNBQVc7QUFBQSxRQUNYLGNBQWdCO0FBQUEsTUFDbEI7QUFBQSxNQUNBLDZDQUE2QztBQUFBLFFBQzNDLFFBQVU7QUFBQSxRQUNWLGNBQWdCO0FBQUEsTUFDbEI7QUFBQSxNQUNBLDZDQUE2QztBQUFBLFFBQzNDLFFBQVU7QUFBQSxRQUNWLGNBQWdCO0FBQUEsTUFDbEI7QUFBQSxNQUNBLGdEQUFnRDtBQUFBLFFBQzlDLFFBQVU7QUFBQSxRQUNWLGNBQWdCO0FBQUEsTUFDbEI7QUFBQSxNQUNBLDJDQUEyQztBQUFBLFFBQ3pDLFFBQVU7QUFBQSxNQUNaO0FBQUEsTUFDQSxrREFBa0Q7QUFBQSxRQUNoRCxRQUFVO0FBQUEsUUFDVixjQUFnQjtBQUFBLE1BQ2xCO0FBQUEsTUFDQSxpREFBaUQ7QUFBQSxRQUMvQyxRQUFVO0FBQUEsUUFDVixjQUFnQjtBQUFBLE1BQ2xCO0FBQUEsTUFDQSxvREFBb0Q7QUFBQSxRQUNsRCxRQUFVO0FBQUEsUUFDVixjQUFnQjtBQUFBLE1BQ2xCO0FBQUEsTUFDQSwwQ0FBMEM7QUFBQSxRQUN4QyxRQUFVO0FBQUEsUUFDVixjQUFnQjtBQUFBLE1BQ2xCO0FBQUEsTUFDQSx3QkFBd0I7QUFBQSxRQUN0QixRQUFVO0FBQUEsUUFDVixjQUFnQjtBQUFBLFFBQ2hCLFlBQWMsQ0FBQyxNQUFNO0FBQUEsTUFDdkI7QUFBQSxNQUNBLDZCQUE2QjtBQUFBLFFBQzNCLFFBQVU7QUFBQSxRQUNWLGNBQWdCO0FBQUEsUUFDaEIsWUFBYyxDQUFDLFdBQVc7QUFBQSxNQUM1QjtBQUFBLE1BQ0Esd0JBQXdCO0FBQUEsUUFDdEIsUUFBVTtBQUFBLE1BQ1o7QUFBQSxNQUNBLHVCQUF1QjtBQUFBLFFBQ3JCLFFBQVU7QUFBQSxRQUNWLGNBQWdCO0FBQUEsTUFDbEI7QUFBQSxNQUNBLHdCQUF3QjtBQUFBLFFBQ3RCLFFBQVU7QUFBQSxRQUNWLGNBQWdCO0FBQUEsUUFDaEIsWUFBYyxDQUFDLE1BQU07QUFBQSxNQUN2QjtBQUFBLE1BQ0EscUJBQXFCO0FBQUEsUUFDbkIsUUFBVTtBQUFBLE1BQ1o7QUFBQSxNQUNBLG1CQUFtQjtBQUFBLFFBQ2pCLFFBQVU7QUFBQSxRQUNWLFlBQWMsQ0FBQyxLQUFLO0FBQUEsTUFDdEI7QUFBQSxNQUNBLHFDQUFxQztBQUFBLFFBQ25DLFFBQVU7QUFBQSxRQUNWLGNBQWdCO0FBQUEsTUFDbEI7QUFBQSxNQUNBLHVCQUF1QjtBQUFBLFFBQ3JCLFFBQVU7QUFBQSxRQUNWLFlBQWMsQ0FBQyxLQUFLO0FBQUEsTUFDdEI7QUFBQSxNQUNBLDJCQUEyQjtBQUFBLFFBQ3pCLFFBQVU7QUFBQSxNQUNaO0FBQUEsTUFDQSx3QkFBd0I7QUFBQSxRQUN0QixRQUFVO0FBQUEsTUFDWjtBQUFBLE1BQ0EsdUJBQXVCO0FBQUEsUUFDckIsUUFBVTtBQUFBLFFBQ1YsY0FBZ0I7QUFBQSxRQUNoQixZQUFjLENBQUMsS0FBSztBQUFBLE1BQ3RCO0FBQUEsTUFDQSx5QkFBeUI7QUFBQSxRQUN2QixRQUFVO0FBQUEsUUFDVixTQUFXO0FBQUEsUUFDWCxjQUFnQjtBQUFBLE1BQ2xCO0FBQUEsTUFDQSx3QkFBd0I7QUFBQSxRQUN0QixRQUFVO0FBQUEsUUFDVixTQUFXO0FBQUEsUUFDWCxjQUFnQjtBQUFBLE1BQ2xCO0FBQUEsTUFDQSxzQ0FBc0M7QUFBQSxRQUNwQyxjQUFnQjtBQUFBLE1BQ2xCO0FBQUEsTUFDQSxvQkFBb0I7QUFBQSxRQUNsQixRQUFVO0FBQUEsTUFDWjtBQUFBLE1BQ0EsdUJBQXVCO0FBQUEsUUFDckIsUUFBVTtBQUFBLE1BQ1o7QUFBQSxNQUNBLHlCQUF5QjtBQUFBLFFBQ3ZCLFFBQVU7QUFBQSxNQUNaO0FBQUEsTUFDQSwwQkFBMEI7QUFBQSxRQUN4QixRQUFVO0FBQUEsUUFDVixZQUFjLENBQUMsS0FBSztBQUFBLE1BQ3RCO0FBQUEsTUFDQSx5QkFBeUI7QUFBQSxRQUN2QixRQUFVO0FBQUEsUUFDVixjQUFnQjtBQUFBLE1BQ2xCO0FBQUEsTUFDQSx3Q0FBd0M7QUFBQSxRQUN0QyxRQUFVO0FBQUEsUUFDVixjQUFnQjtBQUFBLE1BQ2xCO0FBQUEsTUFDQSx3QkFBd0I7QUFBQSxRQUN0QixRQUFVO0FBQUEsUUFDVixjQUFnQjtBQUFBLFFBQ2hCLFlBQWMsQ0FBQyxTQUFTO0FBQUEsTUFDMUI7QUFBQSxNQUNBLDRCQUE0QjtBQUFBLFFBQzFCLFFBQVU7QUFBQSxNQUNaO0FBQUEsTUFDQSxrQ0FBa0M7QUFBQSxRQUNoQyxRQUFVO0FBQUEsTUFDWjtBQUFBLE1BQ0EsNEJBQTRCO0FBQUEsUUFDMUIsUUFBVTtBQUFBLFFBQ1YsY0FBZ0I7QUFBQSxNQUNsQjtBQUFBLE1BQ0EsMkJBQTJCO0FBQUEsUUFDekIsUUFBVTtBQUFBLE1BQ1o7QUFBQSxNQUNBLHVCQUF1QjtBQUFBLFFBQ3JCLFFBQVU7QUFBQSxRQUNWLGNBQWdCO0FBQUEsUUFDaEIsWUFBYyxDQUFDLEtBQUs7QUFBQSxNQUN0QjtBQUFBLE1BQ0EsdUJBQXVCO0FBQUEsUUFDckIsUUFBVTtBQUFBLFFBQ1YsY0FBZ0I7QUFBQSxRQUNoQixZQUFjLENBQUMsS0FBSztBQUFBLE1BQ3RCO0FBQUEsTUFDQSxtQkFBbUI7QUFBQSxRQUNqQixRQUFVO0FBQUEsUUFDVixZQUFjLENBQUMsS0FBSztBQUFBLE1BQ3RCO0FBQUEsTUFDQSxvQkFBb0I7QUFBQSxRQUNsQixRQUFVO0FBQUEsUUFDVixjQUFnQjtBQUFBLFFBQ2hCLFlBQWMsQ0FBQyxJQUFJO0FBQUEsTUFDckI7QUFBQSxNQUNBLG9CQUFvQjtBQUFBLFFBQ2xCLFFBQVU7QUFBQSxNQUNaO0FBQUEsTUFDQSx3QkFBd0I7QUFBQSxRQUN0QixRQUFVO0FBQUEsUUFDVixjQUFnQjtBQUFBLE1BQ2xCO0FBQUEsTUFDQSxxQkFBcUI7QUFBQSxRQUNuQixZQUFjLENBQUMsT0FBTztBQUFBLE1BQ3hCO0FBQUEsTUFDQSxvQkFBb0I7QUFBQSxRQUNsQixRQUFVO0FBQUEsTUFDWjtBQUFBLE1BQ0EsMkJBQTJCO0FBQUEsUUFDekIsUUFBVTtBQUFBLFFBQ1YsWUFBYyxDQUFDLEtBQUs7QUFBQSxNQUN0QjtBQUFBLE1BQ0EsbUNBQW1DO0FBQUEsUUFDakMsUUFBVTtBQUFBLFFBQ1YsY0FBZ0I7QUFBQSxNQUNsQjtBQUFBLE1BQ0EsaUNBQWlDO0FBQUEsUUFDL0IsUUFBVTtBQUFBLFFBQ1YsY0FBZ0I7QUFBQSxNQUNsQjtBQUFBLE1BQ0EsMkJBQTJCO0FBQUEsUUFDekIsUUFBVTtBQUFBLE1BQ1o7QUFBQSxNQUNBLG9CQUFvQjtBQUFBLFFBQ2xCLFFBQVU7QUFBQSxNQUNaO0FBQUEsTUFDQSxrQ0FBa0M7QUFBQSxRQUNoQyxRQUFVO0FBQUEsUUFDVixTQUFXO0FBQUEsUUFDWCxjQUFnQjtBQUFBLE1BQ2xCO0FBQUEsTUFDQSxxQkFBcUI7QUFBQSxRQUNuQixRQUFVO0FBQUEsTUFDWjtBQUFBLE1BQ0EseUJBQXlCO0FBQUEsUUFDdkIsUUFBVTtBQUFBLE1BQ1o7QUFBQSxNQUNBLHlCQUF5QjtBQUFBLFFBQ3ZCLFFBQVU7QUFBQSxNQUNaO0FBQUEsTUFDQSw4QkFBOEI7QUFBQSxRQUM1QixRQUFVO0FBQUEsTUFDWjtBQUFBLE1BQ0EseUJBQXlCO0FBQUEsUUFDdkIsUUFBVTtBQUFBLE1BQ1o7QUFBQSxNQUNBLHlCQUF5QjtBQUFBLFFBQ3ZCLFFBQVU7QUFBQSxRQUNWLGNBQWdCO0FBQUEsUUFDaEIsWUFBYyxDQUFDLE9BQU0sT0FBTztBQUFBLE1BQzlCO0FBQUEsTUFDQSxvQkFBb0I7QUFBQSxRQUNsQixRQUFVO0FBQUEsTUFDWjtBQUFBLE1BQ0EscUJBQXFCO0FBQUEsUUFDbkIsUUFBVTtBQUFBLFFBQ1YsWUFBYyxDQUFDLE9BQU87QUFBQSxNQUN4QjtBQUFBLE1BQ0EsbUJBQW1CO0FBQUEsUUFDakIsUUFBVTtBQUFBLE1BQ1o7QUFBQSxNQUNBLG9CQUFvQjtBQUFBLFFBQ2xCLFFBQVU7QUFBQSxNQUNaO0FBQUEsTUFDQSx1QkFBdUI7QUFBQSxRQUNyQixRQUFVO0FBQUEsUUFDVixjQUFnQjtBQUFBLFFBQ2hCLFlBQWMsQ0FBQyxLQUFLO0FBQUEsTUFDdEI7QUFBQSxNQUNBLDRCQUE0QjtBQUFBLFFBQzFCLFFBQVU7QUFBQSxRQUNWLGNBQWdCO0FBQUEsUUFDaEIsWUFBYyxDQUFDLE9BQU0sT0FBTSxLQUFLO0FBQUEsTUFDbEM7QUFBQSxNQUNBLHNDQUFzQztBQUFBLFFBQ3BDLFFBQVU7QUFBQSxRQUNWLGNBQWdCO0FBQUEsUUFDaEIsWUFBYyxDQUFDLEtBQUs7QUFBQSxNQUN0QjtBQUFBLE1BQ0EsdUJBQXVCO0FBQUEsUUFDckIsUUFBVTtBQUFBLFFBQ1YsY0FBZ0I7QUFBQSxRQUNoQixZQUFjLENBQUMsT0FBTztBQUFBLE1BQ3hCO0FBQUEsTUFDQSwwQkFBMEI7QUFBQSxRQUN4QixRQUFVO0FBQUEsUUFDVixTQUFXO0FBQUEsUUFDWCxjQUFnQjtBQUFBLFFBQ2hCLFlBQWMsQ0FBQyxNQUFLLEtBQUs7QUFBQSxNQUMzQjtBQUFBLE1BQ0EsNEJBQTRCO0FBQUEsUUFDMUIsUUFBVTtBQUFBLFFBQ1YsY0FBZ0I7QUFBQSxNQUNsQjtBQUFBLE1BQ0Esb0JBQW9CO0FBQUEsUUFDbEIsUUFBVTtBQUFBLE1BQ1o7QUFBQSxNQUNBLHlCQUF5QjtBQUFBLFFBQ3ZCLFFBQVU7QUFBQSxRQUNWLGNBQWdCO0FBQUEsTUFDbEI7QUFBQSxNQUNBLHdCQUF3QjtBQUFBLFFBQ3RCLFFBQVU7QUFBQSxRQUNWLGNBQWdCO0FBQUEsTUFDbEI7QUFBQSxNQUNBLCtCQUErQjtBQUFBLFFBQzdCLFFBQVU7QUFBQSxRQUNWLGNBQWdCO0FBQUEsTUFDbEI7QUFBQSxNQUNBLG9CQUFvQjtBQUFBLFFBQ2xCLFFBQVU7QUFBQSxRQUNWLFNBQVc7QUFBQSxRQUNYLGNBQWdCO0FBQUEsUUFDaEIsWUFBYyxDQUFDLFFBQU8sS0FBSztBQUFBLE1BQzdCO0FBQUEsTUFDQSwrQkFBK0I7QUFBQSxRQUM3QixRQUFVO0FBQUEsUUFDVixjQUFnQjtBQUFBLE1BQ2xCO0FBQUEsTUFDQSx3QkFBd0I7QUFBQSxRQUN0QixRQUFVO0FBQUEsTUFDWjtBQUFBLE1BQ0EscUJBQXFCO0FBQUEsUUFDbkIsWUFBYyxDQUFDLE9BQU87QUFBQSxNQUN4QjtBQUFBLE1BQ0EsMkJBQTJCO0FBQUEsUUFDekIsUUFBVTtBQUFBLFFBQ1YsY0FBZ0I7QUFBQSxRQUNoQixZQUFjLENBQUMsUUFBUTtBQUFBLE1BQ3pCO0FBQUEsTUFDQSx3QkFBd0I7QUFBQSxRQUN0QixRQUFVO0FBQUEsUUFDVixjQUFnQjtBQUFBLE1BQ2xCO0FBQUEsTUFDQSw0QkFBNEI7QUFBQSxRQUMxQixRQUFVO0FBQUEsUUFDVixjQUFnQjtBQUFBLE1BQ2xCO0FBQUEsTUFDQSxtQkFBbUI7QUFBQSxRQUNqQixRQUFVO0FBQUEsTUFDWjtBQUFBLE1BQ0EsZ0NBQWdDO0FBQUEsUUFDOUIsUUFBVTtBQUFBLFFBQ1YsY0FBZ0I7QUFBQSxNQUNsQjtBQUFBLE1BQ0EsaUNBQWlDO0FBQUEsUUFDL0IsUUFBVTtBQUFBLFFBQ1YsY0FBZ0I7QUFBQSxNQUNsQjtBQUFBLE1BQ0EsdUJBQXVCO0FBQUEsUUFDckIsUUFBVTtBQUFBLFFBQ1YsY0FBZ0I7QUFBQSxRQUNoQixZQUFjLENBQUMsUUFBUTtBQUFBLE1BQ3pCO0FBQUEsTUFDQSx1QkFBdUI7QUFBQSxRQUNyQixRQUFVO0FBQUEsUUFDVixjQUFnQjtBQUFBLFFBQ2hCLFlBQWMsQ0FBQyxLQUFLO0FBQUEsTUFDdEI7QUFBQSxNQUNBLDJCQUEyQjtBQUFBLFFBQ3pCLFFBQVU7QUFBQSxNQUNaO0FBQUEsTUFDQSxnQ0FBZ0M7QUFBQSxRQUM5QixRQUFVO0FBQUEsUUFDVixjQUFnQjtBQUFBLE1BQ2xCO0FBQUEsTUFDQSx3QkFBd0I7QUFBQSxRQUN0QixRQUFVO0FBQUEsUUFDVixjQUFnQjtBQUFBLFFBQ2hCLFlBQWMsQ0FBQyxTQUFTO0FBQUEsTUFDMUI7QUFBQSxNQUNBLDRCQUE0QjtBQUFBLFFBQzFCLFFBQVU7QUFBQSxRQUNWLGNBQWdCO0FBQUEsTUFDbEI7QUFBQSxNQUNBLHVCQUF1QjtBQUFBLFFBQ3JCLFFBQVU7QUFBQSxRQUNWLGNBQWdCO0FBQUEsTUFDbEI7QUFBQSxNQUNBLG1CQUFtQjtBQUFBLFFBQ2pCLFFBQVU7QUFBQSxNQUNaO0FBQUEsTUFDQSw0QkFBNEI7QUFBQSxRQUMxQixRQUFVO0FBQUEsUUFDVixZQUFjLENBQUMsS0FBSztBQUFBLE1BQ3RCO0FBQUEsTUFDQSw4QkFBOEI7QUFBQSxRQUM1QixRQUFVO0FBQUEsUUFDVixZQUFjLENBQUMsS0FBSztBQUFBLE1BQ3RCO0FBQUEsTUFDQSwwQkFBMEI7QUFBQSxRQUN4QixRQUFVO0FBQUEsTUFDWjtBQUFBLE1BQ0Esd0JBQXdCO0FBQUEsUUFDdEIsUUFBVTtBQUFBLFFBQ1YsY0FBZ0I7QUFBQSxRQUNoQixZQUFjLENBQUMsTUFBTTtBQUFBLE1BQ3ZCO0FBQUEsTUFDQSw2QkFBNkI7QUFBQSxRQUMzQixRQUFVO0FBQUEsUUFDVixTQUFXO0FBQUEsUUFDWCxjQUFnQjtBQUFBLFFBQ2hCLFlBQWMsQ0FBQyxhQUFhO0FBQUEsTUFDOUI7QUFBQSxNQUNBLG9CQUFvQjtBQUFBLFFBQ2xCLFFBQVU7QUFBQSxRQUNWLFlBQWMsQ0FBQyxLQUFLO0FBQUEsTUFDdEI7QUFBQSxNQUNBLDJCQUEyQjtBQUFBLFFBQ3pCLFFBQVU7QUFBQSxRQUNWLGNBQWdCO0FBQUEsUUFDaEIsWUFBYyxDQUFDLE1BQU07QUFBQSxNQUN2QjtBQUFBLE1BQ0EsMkJBQTJCO0FBQUEsUUFDekIsUUFBVTtBQUFBLFFBQ1YsWUFBYyxDQUFDLE1BQUssTUFBSyxJQUFJO0FBQUEsTUFDL0I7QUFBQSxNQUNBLDBCQUEwQjtBQUFBLFFBQ3hCLFFBQVU7QUFBQSxRQUNWLGNBQWdCO0FBQUEsUUFDaEIsWUFBYyxDQUFDLFFBQVE7QUFBQSxNQUN6QjtBQUFBLE1BQ0Esa0NBQWtDO0FBQUEsUUFDaEMsUUFBVTtBQUFBLFFBQ1YsY0FBZ0I7QUFBQSxNQUNsQjtBQUFBLE1BQ0EsdUNBQXVDO0FBQUEsUUFDckMsUUFBVTtBQUFBLFFBQ1YsY0FBZ0I7QUFBQSxNQUNsQjtBQUFBLE1BQ0EseURBQXlEO0FBQUEsUUFDdkQsUUFBVTtBQUFBLFFBQ1YsY0FBZ0I7QUFBQSxNQUNsQjtBQUFBLE1BQ0EsbUNBQW1DO0FBQUEsUUFDakMsUUFBVTtBQUFBLFFBQ1YsY0FBZ0I7QUFBQSxNQUNsQjtBQUFBLE1BQ0EsaUNBQWlDO0FBQUEsUUFDL0IsUUFBVTtBQUFBLFFBQ1YsY0FBZ0I7QUFBQSxNQUNsQjtBQUFBLE1BQ0EsNEJBQTRCO0FBQUEsUUFDMUIsUUFBVTtBQUFBLFFBQ1YsY0FBZ0I7QUFBQSxNQUNsQjtBQUFBLE1BQ0EscUNBQXFDO0FBQUEsUUFDbkMsUUFBVTtBQUFBLFFBQ1YsY0FBZ0I7QUFBQSxNQUNsQjtBQUFBLE1BQ0EsK0NBQStDO0FBQUEsUUFDN0MsUUFBVTtBQUFBLFFBQ1YsY0FBZ0I7QUFBQSxNQUNsQjtBQUFBLE1BQ0EseUNBQXlDO0FBQUEsUUFDdkMsUUFBVTtBQUFBLFFBQ1YsY0FBZ0I7QUFBQSxNQUNsQjtBQUFBLE1BQ0EsaUNBQWlDO0FBQUEsUUFDL0IsUUFBVTtBQUFBLFFBQ1YsY0FBZ0I7QUFBQSxNQUNsQjtBQUFBLE1BQ0EsMENBQTBDO0FBQUEsUUFDeEMsUUFBVTtBQUFBLFFBQ1YsY0FBZ0I7QUFBQSxNQUNsQjtBQUFBLE1BQ0EsaUNBQWlDO0FBQUEsUUFDL0IsUUFBVTtBQUFBLFFBQ1YsY0FBZ0I7QUFBQSxNQUNsQjtBQUFBLE1BQ0EsaURBQWlEO0FBQUEsUUFDL0MsUUFBVTtBQUFBLFFBQ1YsY0FBZ0I7QUFBQSxNQUNsQjtBQUFBLE1BQ0Esb0JBQW9CO0FBQUEsUUFDbEIsUUFBVTtBQUFBLFFBQ1YsWUFBYyxDQUFDLE1BQU07QUFBQSxNQUN2QjtBQUFBLE1BQ0Esd0NBQXdDO0FBQUEsUUFDdEMsUUFBVTtBQUFBLFFBQ1YsY0FBZ0I7QUFBQSxRQUNoQixZQUFjLENBQUMsS0FBSztBQUFBLE1BQ3RCO0FBQUEsTUFDQSxpQ0FBaUM7QUFBQSxRQUMvQixRQUFVO0FBQUEsUUFDVixjQUFnQjtBQUFBLE1BQ2xCO0FBQUEsTUFDQSxzQ0FBc0M7QUFBQSxRQUNwQyxRQUFVO0FBQUEsUUFDVixjQUFnQjtBQUFBLFFBQ2hCLFlBQWMsQ0FBQyxPQUFPO0FBQUEsTUFDeEI7QUFBQSxNQUNBLGdDQUFnQztBQUFBLFFBQzlCLFFBQVU7QUFBQSxRQUNWLGNBQWdCO0FBQUEsTUFDbEI7QUFBQSxNQUNBLDRCQUE0QjtBQUFBLFFBQzFCLFFBQVU7QUFBQSxRQUNWLGNBQWdCO0FBQUEsUUFDaEIsWUFBYyxDQUFDLFVBQVU7QUFBQSxNQUMzQjtBQUFBLE1BQ0EsNkJBQTZCO0FBQUEsUUFDM0IsUUFBVTtBQUFBLFFBQ1YsY0FBZ0I7QUFBQSxRQUNoQixZQUFjLENBQUMsT0FBTztBQUFBLE1BQ3hCO0FBQUEsTUFDQSx3QkFBd0I7QUFBQSxRQUN0QixRQUFVO0FBQUEsUUFDVixjQUFnQjtBQUFBLFFBQ2hCLFlBQWMsQ0FBQyxNQUFNO0FBQUEsTUFDdkI7QUFBQSxNQUNBLG1CQUFtQjtBQUFBLFFBQ2pCLFFBQVU7QUFBQSxNQUNaO0FBQUEsTUFDQSxxQkFBcUI7QUFBQSxRQUNuQixRQUFVO0FBQUEsTUFDWjtBQUFBLE1BQ0Esb0JBQW9CO0FBQUEsUUFDbEIsUUFBVTtBQUFBLE1BQ1o7QUFBQSxNQUNBLHVDQUF1QztBQUFBLFFBQ3JDLFFBQVU7QUFBQSxNQUNaO0FBQUEsTUFDQSwyQkFBMkI7QUFBQSxRQUN6QixRQUFVO0FBQUEsUUFDVixjQUFnQjtBQUFBLFFBQ2hCLFlBQWMsQ0FBQyxNQUFNO0FBQUEsTUFDdkI7QUFBQSxNQUNBLDJCQUEyQjtBQUFBLFFBQ3pCLFFBQVU7QUFBQSxRQUNWLGNBQWdCO0FBQUEsUUFDaEIsWUFBYyxDQUFDLE1BQU07QUFBQSxNQUN2QjtBQUFBLE1BQ0Esd0JBQXdCO0FBQUEsUUFDdEIsUUFBVTtBQUFBLFFBQ1YsY0FBZ0I7QUFBQSxRQUNoQixZQUFjLENBQUMsTUFBTTtBQUFBLE1BQ3ZCO0FBQUEsTUFDQSx5QkFBeUI7QUFBQSxRQUN2QixRQUFVO0FBQUEsTUFDWjtBQUFBLE1BQ0EsOEJBQThCO0FBQUEsUUFDNUIsUUFBVTtBQUFBLE1BQ1o7QUFBQSxNQUNBLDRCQUE0QjtBQUFBLFFBQzFCLFFBQVU7QUFBQSxNQUNaO0FBQUEsTUFDQSwrQkFBK0I7QUFBQSxRQUM3QixRQUFVO0FBQUEsTUFDWjtBQUFBLE1BQ0Esb0JBQW9CO0FBQUEsUUFDbEIsUUFBVTtBQUFBLFFBQ1YsWUFBYyxDQUFDLE9BQU0sTUFBTTtBQUFBLE1BQzdCO0FBQUEsTUFDQSxtQkFBbUI7QUFBQSxRQUNqQixRQUFVO0FBQUEsUUFDVixZQUFjLENBQUMsUUFBTyxLQUFLO0FBQUEsTUFDN0I7QUFBQSxNQUNBLDZCQUE2QjtBQUFBLFFBQzNCLFFBQVU7QUFBQSxNQUNaO0FBQUEsTUFDQSx5QkFBeUI7QUFBQSxRQUN2QixRQUFVO0FBQUEsTUFDWjtBQUFBLE1BQ0EsNkJBQTZCO0FBQUEsUUFDM0IsUUFBVTtBQUFBLE1BQ1o7QUFBQSxNQUNBLGdDQUFnQztBQUFBLFFBQzlCLFFBQVU7QUFBQSxRQUNWLGNBQWdCO0FBQUEsTUFDbEI7QUFBQSxNQUNBLCtCQUErQjtBQUFBLFFBQzdCLFFBQVU7QUFBQSxRQUNWLGNBQWdCO0FBQUEsTUFDbEI7QUFBQSxNQUNBLDJCQUEyQjtBQUFBLFFBQ3pCLFFBQVU7QUFBQSxRQUNWLFNBQVc7QUFBQSxRQUNYLGNBQWdCO0FBQUEsTUFDbEI7QUFBQSxNQUNBLDZCQUE2QjtBQUFBLFFBQzNCLFFBQVU7QUFBQSxRQUNWLFNBQVc7QUFBQSxRQUNYLGNBQWdCO0FBQUEsTUFDbEI7QUFBQSxNQUNBLHNCQUFzQjtBQUFBLFFBQ3BCLFFBQVU7QUFBQSxRQUNWLGNBQWdCO0FBQUEsUUFDaEIsWUFBYyxDQUFDLE9BQU0sS0FBSztBQUFBLE1BQzVCO0FBQUEsTUFDQSx3QkFBd0I7QUFBQSxRQUN0QixRQUFVO0FBQUEsUUFDVixjQUFnQjtBQUFBLE1BQ2xCO0FBQUEsTUFDQSw4QkFBOEI7QUFBQSxRQUM1QixRQUFVO0FBQUEsTUFDWjtBQUFBLE1BQ0EsbUJBQW1CO0FBQUEsUUFDakIsUUFBVTtBQUFBLFFBQ1YsWUFBYyxDQUFDLEtBQUs7QUFBQSxNQUN0QjtBQUFBLE1BQ0EsdUJBQXVCO0FBQUEsUUFDckIsUUFBVTtBQUFBLFFBQ1YsWUFBYyxDQUFDLElBQUk7QUFBQSxNQUNyQjtBQUFBLE1BQ0EseUJBQXlCO0FBQUEsUUFDdkIsUUFBVTtBQUFBLFFBQ1YsWUFBYyxDQUFDLElBQUk7QUFBQSxNQUNyQjtBQUFBLE1BQ0EsdUJBQXVCO0FBQUEsUUFDckIsUUFBVTtBQUFBLE1BQ1o7QUFBQSxNQUNBLGdDQUFnQztBQUFBLFFBQzlCLFFBQVU7QUFBQSxRQUNWLFNBQVc7QUFBQSxNQUNiO0FBQUEsTUFDQSw4QkFBOEI7QUFBQSxRQUM1QixRQUFVO0FBQUEsUUFDVixTQUFXO0FBQUEsTUFDYjtBQUFBLE1BQ0EsaUNBQWlDO0FBQUEsUUFDL0IsUUFBVTtBQUFBLE1BQ1o7QUFBQSxNQUNBLHlCQUF5QjtBQUFBLFFBQ3ZCLFFBQVU7QUFBQSxRQUNWLGNBQWdCO0FBQUEsTUFDbEI7QUFBQSxNQUNBLG9CQUFvQjtBQUFBLFFBQ2xCLFFBQVU7QUFBQSxRQUNWLFlBQWMsQ0FBQyxLQUFLO0FBQUEsTUFDdEI7QUFBQSxNQUNBLG1CQUFtQjtBQUFBLFFBQ2pCLFFBQVU7QUFBQSxNQUNaO0FBQUEsTUFDQSxtQ0FBbUM7QUFBQSxRQUNqQyxRQUFVO0FBQUEsTUFDWjtBQUFBLE1BQ0EscUNBQXFDO0FBQUEsUUFDbkMsUUFBVTtBQUFBLE1BQ1o7QUFBQSxNQUNBLDRCQUE0QjtBQUFBLFFBQzFCLFFBQVU7QUFBQSxNQUNaO0FBQUEsTUFDQSw2QkFBNkI7QUFBQSxRQUMzQixRQUFVO0FBQUEsTUFDWjtBQUFBLE1BQ0EsNEJBQTRCO0FBQUEsUUFDMUIsUUFBVTtBQUFBLFFBQ1YsY0FBZ0I7QUFBQSxRQUNoQixZQUFjLENBQUMsT0FBTSxPQUFNLE9BQU0sT0FBTSxNQUFLLFFBQU8sU0FBUSxPQUFNLE9BQU0sUUFBTyxPQUFNLFVBQVMsT0FBTSxPQUFNLE9BQU0sT0FBTSxPQUFNLE9BQU0sT0FBTSxPQUFNLE9BQU0sUUFBUTtBQUFBLE1BQzdKO0FBQUEsTUFDQSxtQkFBbUI7QUFBQSxRQUNqQixRQUFVO0FBQUEsUUFDVixZQUFjLENBQUMsS0FBSztBQUFBLE1BQ3RCO0FBQUEsTUFDQSx1QkFBdUI7QUFBQSxRQUNyQixRQUFVO0FBQUEsUUFDVixjQUFnQjtBQUFBLE1BQ2xCO0FBQUEsTUFDQSxtQkFBbUI7QUFBQSxRQUNqQixRQUFVO0FBQUEsTUFDWjtBQUFBLE1BQ0EsaUNBQWlDO0FBQUEsUUFDL0IsUUFBVTtBQUFBLFFBQ1YsY0FBZ0I7QUFBQSxRQUNoQixZQUFjLENBQUMsS0FBSztBQUFBLE1BQ3RCO0FBQUEsTUFDQSxtQkFBbUI7QUFBQSxRQUNqQixRQUFVO0FBQUEsUUFDVixjQUFnQjtBQUFBLFFBQ2hCLFlBQWMsQ0FBQyxLQUFLO0FBQUEsTUFDdEI7QUFBQSxNQUNBLHlCQUF5QjtBQUFBLFFBQ3ZCLFFBQVU7QUFBQSxRQUNWLGNBQWdCO0FBQUEsUUFDaEIsWUFBYyxDQUFDLE9BQU87QUFBQSxNQUN4QjtBQUFBLE1BQ0EsdUJBQXVCO0FBQUEsUUFDckIsUUFBVTtBQUFBLFFBQ1YsWUFBYyxDQUFDLFVBQVMsV0FBVSxVQUFTLFFBQVE7QUFBQSxNQUNyRDtBQUFBLE1BQ0EsK0JBQStCO0FBQUEsUUFDN0IsUUFBVTtBQUFBLFFBQ1YsY0FBZ0I7QUFBQSxNQUNsQjtBQUFBLE1BQ0Esc0JBQXNCO0FBQUEsUUFDcEIsUUFBVTtBQUFBLE1BQ1o7QUFBQSxNQUNBLG9CQUFvQjtBQUFBLFFBQ2xCLFFBQVU7QUFBQSxRQUNWLFlBQWMsQ0FBQyxNQUFNO0FBQUEsTUFDdkI7QUFBQSxNQUNBLG1CQUFtQjtBQUFBLFFBQ2pCLFFBQVU7QUFBQSxNQUNaO0FBQUEsTUFDQSx1QkFBdUI7QUFBQSxRQUNyQixRQUFVO0FBQUEsUUFDVixjQUFnQjtBQUFBLE1BQ2xCO0FBQUEsTUFDQSwrQkFBK0I7QUFBQSxRQUM3QixRQUFVO0FBQUEsUUFDVixjQUFnQjtBQUFBLFFBQ2hCLFlBQWMsQ0FBQyxNQUFNO0FBQUEsTUFDdkI7QUFBQSxNQUNBLHlCQUF5QjtBQUFBLFFBQ3ZCLFFBQVU7QUFBQSxNQUNaO0FBQUEsTUFDQSx3QkFBd0I7QUFBQSxRQUN0QixRQUFVO0FBQUEsTUFDWjtBQUFBLE1BQ0EsbUNBQW1DO0FBQUEsUUFDakMsUUFBVTtBQUFBLFFBQ1YsY0FBZ0I7QUFBQSxRQUNoQixZQUFjLENBQUMsS0FBSztBQUFBLE1BQ3RCO0FBQUEsTUFDQSxtQkFBbUI7QUFBQSxRQUNqQixRQUFVO0FBQUEsUUFDVixjQUFnQjtBQUFBLFFBQ2hCLFlBQWMsQ0FBQyxLQUFLO0FBQUEsTUFDdEI7QUFBQSxNQUNBLG1CQUFtQjtBQUFBLFFBQ2pCLFFBQVU7QUFBQSxNQUNaO0FBQUEsTUFDQSxxQ0FBcUM7QUFBQSxRQUNuQyxRQUFVO0FBQUEsTUFDWjtBQUFBLE1BQ0EsNkJBQTZCO0FBQUEsUUFDM0IsUUFBVTtBQUFBLFFBQ1YsY0FBZ0I7QUFBQSxRQUNoQixZQUFjLENBQUMsS0FBSztBQUFBLE1BQ3RCO0FBQUEsTUFDQSx3QkFBd0I7QUFBQSxRQUN0QixRQUFVO0FBQUEsUUFDVixZQUFjLENBQUMsS0FBSztBQUFBLE1BQ3RCO0FBQUEsTUFDQSw2QkFBNkI7QUFBQSxRQUMzQixRQUFVO0FBQUEsUUFDVixZQUFjLENBQUMsT0FBTSxLQUFLO0FBQUEsTUFDNUI7QUFBQSxNQUNBLDBCQUEwQjtBQUFBLFFBQ3hCLFFBQVU7QUFBQSxRQUNWLFlBQWMsQ0FBQyxLQUFLO0FBQUEsTUFDdEI7QUFBQSxNQUNBLHdCQUF3QjtBQUFBLFFBQ3RCLFFBQVU7QUFBQSxRQUNWLFNBQVc7QUFBQSxRQUNYLGNBQWdCO0FBQUEsTUFDbEI7QUFBQSxNQUNBLDZCQUE2QjtBQUFBLFFBQzNCLFFBQVU7QUFBQSxRQUNWLFNBQVc7QUFBQSxRQUNYLGNBQWdCO0FBQUEsTUFDbEI7QUFBQSxNQUNBLHNCQUFzQjtBQUFBLFFBQ3BCLFFBQVU7QUFBQSxRQUNWLFlBQWMsQ0FBQyxLQUFLO0FBQUEsTUFDdEI7QUFBQSxNQUNBLHNCQUFzQjtBQUFBLFFBQ3BCLFFBQVU7QUFBQSxNQUNaO0FBQUEsTUFDQSwwQkFBMEI7QUFBQSxRQUN4QixRQUFVO0FBQUEsUUFDVixZQUFjLENBQUMsT0FBTSxLQUFLO0FBQUEsTUFDNUI7QUFBQSxNQUNBLCtCQUErQjtBQUFBLFFBQzdCLFFBQVU7QUFBQSxRQUNWLFlBQWMsQ0FBQyxLQUFLO0FBQUEsTUFDdEI7QUFBQSxNQUNBLHFCQUFxQjtBQUFBLFFBQ25CLFFBQVU7QUFBQSxRQUNWLFlBQWMsQ0FBQyxJQUFJO0FBQUEsTUFDckI7QUFBQSxNQUNBLCtCQUErQjtBQUFBLFFBQzdCLFFBQVU7QUFBQSxNQUNaO0FBQUEsTUFDQSw4QkFBOEI7QUFBQSxRQUM1QixRQUFVO0FBQUEsUUFDVixZQUFjLENBQUMsSUFBSTtBQUFBLE1BQ3JCO0FBQUEsTUFDQSx5QkFBeUI7QUFBQSxRQUN2QixRQUFVO0FBQUEsUUFDVixZQUFjLENBQUMsS0FBSztBQUFBLE1BQ3RCO0FBQUEsTUFDQSx3QkFBd0I7QUFBQSxRQUN0QixRQUFVO0FBQUEsUUFDVixZQUFjLENBQUMsS0FBSztBQUFBLE1BQ3RCO0FBQUEsTUFDQSw0QkFBNEI7QUFBQSxRQUMxQixRQUFVO0FBQUEsUUFDVixZQUFjLENBQUMsU0FBUztBQUFBLE1BQzFCO0FBQUEsTUFDQSx1QkFBdUI7QUFBQSxRQUNyQixRQUFVO0FBQUEsUUFDVixZQUFjLENBQUMsS0FBSztBQUFBLE1BQ3RCO0FBQUEsTUFDQSx1QkFBdUI7QUFBQSxRQUNyQixRQUFVO0FBQUEsUUFDVixjQUFnQjtBQUFBLFFBQ2hCLFlBQWMsQ0FBQyxLQUFLO0FBQUEsTUFDdEI7QUFBQSxNQUNBLGdDQUFnQztBQUFBLFFBQzlCLFFBQVU7QUFBQSxRQUNWLFNBQVc7QUFBQSxRQUNYLGNBQWdCO0FBQUEsTUFDbEI7QUFBQSxNQUNBLDBCQUEwQjtBQUFBLFFBQ3hCLFFBQVU7QUFBQSxRQUNWLGNBQWdCO0FBQUEsUUFDaEIsWUFBYyxDQUFDLE1BQUssT0FBTSxJQUFJO0FBQUEsTUFDaEM7QUFBQSxNQUNBLGlDQUFpQztBQUFBLFFBQy9CLFFBQVU7QUFBQSxRQUNWLGNBQWdCO0FBQUEsTUFDbEI7QUFBQSxNQUNBLDRCQUE0QjtBQUFBLFFBQzFCLFFBQVU7QUFBQSxRQUNWLGNBQWdCO0FBQUEsTUFDbEI7QUFBQSxNQUNBLDJCQUEyQjtBQUFBLFFBQ3pCLFFBQVU7QUFBQSxRQUNWLGNBQWdCO0FBQUEsTUFDbEI7QUFBQSxNQUNBLDhCQUE4QjtBQUFBLFFBQzVCLFFBQVU7QUFBQSxRQUNWLGNBQWdCO0FBQUEsUUFDaEIsWUFBYyxDQUFDLE9BQU87QUFBQSxNQUN4QjtBQUFBLE1BQ0EsMkNBQTJDO0FBQUEsUUFDekMsUUFBVTtBQUFBLE1BQ1o7QUFBQSxNQUNBLHVCQUF1QjtBQUFBLFFBQ3JCLFFBQVU7QUFBQSxRQUNWLFlBQWMsQ0FBQyxLQUFLO0FBQUEsTUFDdEI7QUFBQSxNQUNBLHVCQUF1QjtBQUFBLFFBQ3JCLFFBQVU7QUFBQSxRQUNWLFNBQVc7QUFBQSxNQUNiO0FBQUEsTUFDQSw0QkFBNEI7QUFBQSxRQUMxQixRQUFVO0FBQUEsUUFDVixjQUFnQjtBQUFBLE1BQ2xCO0FBQUEsTUFDQSwwQkFBMEI7QUFBQSxRQUN4QixRQUFVO0FBQUEsTUFDWjtBQUFBLE1BQ0EsMkJBQTJCO0FBQUEsUUFDekIsUUFBVTtBQUFBLE1BQ1o7QUFBQSxNQUNBLGlDQUFpQztBQUFBLFFBQy9CLFFBQVU7QUFBQSxNQUNaO0FBQUEsTUFDQSwyQkFBMkI7QUFBQSxRQUN6QixRQUFVO0FBQUEsUUFDVixjQUFnQjtBQUFBLE1BQ2xCO0FBQUEsTUFDQSx3QkFBd0I7QUFBQSxRQUN0QixRQUFVO0FBQUEsUUFDVixjQUFnQjtBQUFBLFFBQ2hCLFlBQWMsQ0FBQyxTQUFTO0FBQUEsTUFDMUI7QUFBQSxNQUNBLHdCQUF3QjtBQUFBLFFBQ3RCLFFBQVU7QUFBQSxRQUNWLGNBQWdCO0FBQUEsTUFDbEI7QUFBQSxNQUNBLG9CQUFvQjtBQUFBLFFBQ2xCLFFBQVU7QUFBQSxNQUNaO0FBQUEsTUFDQSx5QkFBeUI7QUFBQSxRQUN2QixjQUFnQjtBQUFBLFFBQ2hCLFlBQWMsQ0FBQyxNQUFNO0FBQUEsTUFDdkI7QUFBQSxNQUNBLHlCQUF5QjtBQUFBLFFBQ3ZCLFFBQVU7QUFBQSxNQUNaO0FBQUEsTUFDQSx5QkFBeUI7QUFBQSxRQUN2QixRQUFVO0FBQUEsUUFDVixjQUFnQjtBQUFBLE1BQ2xCO0FBQUEsTUFDQSx1QkFBdUI7QUFBQSxRQUNyQixRQUFVO0FBQUEsUUFDVixjQUFnQjtBQUFBLFFBQ2hCLFlBQWMsQ0FBQyxPQUFNLEtBQUs7QUFBQSxNQUM1QjtBQUFBLE1BQ0EsMkJBQTJCO0FBQUEsUUFDekIsUUFBVTtBQUFBLFFBQ1YsY0FBZ0I7QUFBQSxRQUNoQixZQUFjLENBQUMsS0FBSztBQUFBLE1BQ3RCO0FBQUEsTUFDQSx1Q0FBdUM7QUFBQSxRQUNyQyxRQUFVO0FBQUEsUUFDVixZQUFjLENBQUMsS0FBSztBQUFBLE1BQ3RCO0FBQUEsTUFDQSwrQkFBK0I7QUFBQSxRQUM3QixRQUFVO0FBQUEsTUFDWjtBQUFBLE1BQ0EsNEJBQTRCO0FBQUEsUUFDMUIsUUFBVTtBQUFBLFFBQ1YsY0FBZ0I7QUFBQSxNQUNsQjtBQUFBLE1BQ0Esa0NBQWtDO0FBQUEsUUFDaEMsUUFBVTtBQUFBLFFBQ1YsY0FBZ0I7QUFBQSxRQUNoQixZQUFjLENBQUMsSUFBSTtBQUFBLE1BQ3JCO0FBQUEsTUFDQSx1Q0FBdUM7QUFBQSxRQUNyQyxRQUFVO0FBQUEsUUFDVixjQUFnQjtBQUFBLFFBQ2hCLFlBQWMsQ0FBQyxLQUFLO0FBQUEsTUFDdEI7QUFBQSxNQUNBLHVCQUF1QjtBQUFBLFFBQ3JCLFFBQVU7QUFBQSxRQUNWLGNBQWdCO0FBQUEsTUFDbEI7QUFBQSxNQUNBLHNCQUFzQjtBQUFBLFFBQ3BCLFFBQVU7QUFBQSxNQUNaO0FBQUEsTUFDQSx3QkFBd0I7QUFBQSxRQUN0QixRQUFVO0FBQUEsUUFDVixjQUFnQjtBQUFBLE1BQ2xCO0FBQUEsTUFDQSxnQ0FBZ0M7QUFBQSxRQUM5QixRQUFVO0FBQUEsUUFDVixjQUFnQjtBQUFBLFFBQ2hCLFlBQWMsQ0FBQyxJQUFJO0FBQUEsTUFDckI7QUFBQSxNQUNBLDZCQUE2QjtBQUFBLFFBQzNCLFFBQVU7QUFBQSxRQUNWLGNBQWdCO0FBQUEsUUFDaEIsWUFBYyxDQUFDLE1BQU07QUFBQSxNQUN2QjtBQUFBLE1BQ0EsZ0NBQWdDO0FBQUEsUUFDOUIsUUFBVTtBQUFBLFFBQ1YsY0FBZ0I7QUFBQSxRQUNoQixZQUFjLENBQUMsS0FBSztBQUFBLE1BQ3RCO0FBQUEsTUFDQSw2QkFBNkI7QUFBQSxRQUMzQixRQUFVO0FBQUEsUUFDVixjQUFnQjtBQUFBLFFBQ2hCLFlBQWMsQ0FBQyxNQUFNO0FBQUEsTUFDdkI7QUFBQSxNQUNBLGlDQUFpQztBQUFBLFFBQy9CLFFBQVU7QUFBQSxRQUNWLFlBQWMsQ0FBQyxLQUFLO0FBQUEsTUFDdEI7QUFBQSxNQUNBLDZCQUE2QjtBQUFBLFFBQzNCLFFBQVU7QUFBQSxRQUNWLFlBQWMsQ0FBQyxLQUFLO0FBQUEsTUFDdEI7QUFBQSxNQUNBLGdDQUFnQztBQUFBLFFBQzlCLFFBQVU7QUFBQSxNQUNaO0FBQUEsTUFDQSx3QkFBd0I7QUFBQSxRQUN0QixRQUFVO0FBQUEsUUFDVixZQUFjLENBQUMsS0FBSztBQUFBLE1BQ3RCO0FBQUEsTUFDQSwyQkFBMkI7QUFBQSxRQUN6QixRQUFVO0FBQUEsTUFDWjtBQUFBLE1BQ0EsdUJBQXVCO0FBQUEsUUFDckIsUUFBVTtBQUFBLFFBQ1YsY0FBZ0I7QUFBQSxRQUNoQixZQUFjLENBQUMsS0FBSztBQUFBLE1BQ3RCO0FBQUEsTUFDQSx1QkFBdUI7QUFBQSxRQUNyQixRQUFVO0FBQUEsUUFDVixjQUFnQjtBQUFBLFFBQ2hCLFlBQWMsQ0FBQyxLQUFLO0FBQUEsTUFDdEI7QUFBQSxNQUNBLG1CQUFtQjtBQUFBLFFBQ2pCLFFBQVU7QUFBQSxRQUNWLGNBQWdCO0FBQUEsUUFDaEIsWUFBYyxDQUFDLEtBQUs7QUFBQSxNQUN0QjtBQUFBLE1BQ0EsMkJBQTJCO0FBQUEsUUFDekIsUUFBVTtBQUFBLE1BQ1o7QUFBQSxNQUNBLG1CQUFtQjtBQUFBLFFBQ2pCLFFBQVU7QUFBQSxNQUNaO0FBQUEsTUFDQSxpQ0FBaUM7QUFBQSxRQUMvQixRQUFVO0FBQUEsUUFDVixjQUFnQjtBQUFBLE1BQ2xCO0FBQUEsTUFDQSxnQ0FBZ0M7QUFBQSxRQUM5QixRQUFVO0FBQUEsUUFDVixjQUFnQjtBQUFBLE1BQ2xCO0FBQUEsTUFDQSwwQkFBMEI7QUFBQSxRQUN4QixRQUFVO0FBQUEsUUFDVixjQUFnQjtBQUFBLE1BQ2xCO0FBQUEsTUFDQSw4Q0FBOEM7QUFBQSxRQUM1QyxRQUFVO0FBQUEsUUFDVixjQUFnQjtBQUFBLE1BQ2xCO0FBQUEsTUFDQSxtQkFBbUI7QUFBQSxRQUNqQixRQUFVO0FBQUEsTUFDWjtBQUFBLE1BQ0Esd0JBQXdCO0FBQUEsUUFDdEIsUUFBVTtBQUFBLFFBQ1YsY0FBZ0I7QUFBQSxRQUNoQixZQUFjLENBQUMsTUFBTTtBQUFBLE1BQ3ZCO0FBQUEsTUFDQSx5QkFBeUI7QUFBQSxRQUN2QixRQUFVO0FBQUEsUUFDVixjQUFnQjtBQUFBLE1BQ2xCO0FBQUEsTUFDQSx5QkFBeUI7QUFBQSxRQUN2QixRQUFVO0FBQUEsUUFDVixjQUFnQjtBQUFBLE1BQ2xCO0FBQUEsTUFDQSwrQkFBK0I7QUFBQSxRQUM3QixRQUFVO0FBQUEsUUFDVixZQUFjLENBQUMsS0FBSztBQUFBLE1BQ3RCO0FBQUEsTUFDQSxnQ0FBZ0M7QUFBQSxRQUM5QixRQUFVO0FBQUEsUUFDVixZQUFjLENBQUMsS0FBSztBQUFBLE1BQ3RCO0FBQUEsTUFDQSwrQkFBK0I7QUFBQSxRQUM3QixRQUFVO0FBQUEsUUFDVixZQUFjLENBQUMsS0FBSztBQUFBLE1BQ3RCO0FBQUEsTUFDQSxnQ0FBZ0M7QUFBQSxRQUM5QixRQUFVO0FBQUEsUUFDVixZQUFjLENBQUMsS0FBSztBQUFBLE1BQ3RCO0FBQUEsTUFDQSxtQkFBbUI7QUFBQSxRQUNqQixRQUFVO0FBQUEsUUFDVixZQUFjLENBQUMsS0FBSztBQUFBLE1BQ3RCO0FBQUEsTUFDQSw0QkFBNEI7QUFBQSxRQUMxQixRQUFVO0FBQUEsTUFDWjtBQUFBLE1BQ0EsMEJBQTBCO0FBQUEsUUFDeEIsUUFBVTtBQUFBLE1BQ1o7QUFBQSxNQUNBLDBCQUEwQjtBQUFBLFFBQ3hCLFFBQVU7QUFBQSxRQUNWLGNBQWdCO0FBQUEsTUFDbEI7QUFBQSxNQUNBLHlCQUF5QjtBQUFBLFFBQ3ZCLFFBQVU7QUFBQSxRQUNWLGNBQWdCO0FBQUEsUUFDaEIsWUFBYyxDQUFDLFFBQVE7QUFBQSxNQUN6QjtBQUFBLE1BQ0EsK0JBQStCO0FBQUEsUUFDN0IsUUFBVTtBQUFBLE1BQ1o7QUFBQSxNQUNBLCtCQUErQjtBQUFBLFFBQzdCLFFBQVU7QUFBQSxRQUNWLGNBQWdCO0FBQUEsTUFDbEI7QUFBQSxNQUNBLHlCQUF5QjtBQUFBLFFBQ3ZCLFFBQVU7QUFBQSxNQUNaO0FBQUEsTUFDQSwyQkFBMkI7QUFBQSxRQUN6QixRQUFVO0FBQUEsTUFDWjtBQUFBLE1BQ0EsMkJBQTJCO0FBQUEsUUFDekIsUUFBVTtBQUFBLFFBQ1YsY0FBZ0I7QUFBQSxNQUNsQjtBQUFBLE1BQ0EsMEJBQTBCO0FBQUEsUUFDeEIsUUFBVTtBQUFBLFFBQ1YsY0FBZ0I7QUFBQSxRQUNoQixZQUFjLENBQUMsU0FBUztBQUFBLE1BQzFCO0FBQUEsTUFDQSwwQkFBMEI7QUFBQSxRQUN4QixRQUFVO0FBQUEsTUFDWjtBQUFBLE1BQ0EsdUJBQXVCO0FBQUEsUUFDckIsUUFBVTtBQUFBLFFBQ1YsY0FBZ0I7QUFBQSxNQUNsQjtBQUFBLE1BQ0EsdUJBQXVCO0FBQUEsUUFDckIsUUFBVTtBQUFBLE1BQ1o7QUFBQSxNQUNBLDRCQUE0QjtBQUFBLFFBQzFCLFFBQVU7QUFBQSxNQUNaO0FBQUEsTUFDQSwyQkFBMkI7QUFBQSxRQUN6QixRQUFVO0FBQUEsTUFDWjtBQUFBLE1BQ0Esc0NBQXNDO0FBQUEsUUFDcEMsUUFBVTtBQUFBLFFBQ1YsWUFBYyxDQUFDLFFBQVE7QUFBQSxNQUN6QjtBQUFBLE1BQ0EsZ0NBQWdDO0FBQUEsUUFDOUIsUUFBVTtBQUFBLE1BQ1o7QUFBQSxNQUNBLDJDQUEyQztBQUFBLFFBQ3pDLFFBQVU7QUFBQSxRQUNWLFlBQWMsQ0FBQyxRQUFRO0FBQUEsTUFDekI7QUFBQSxNQUNBLG9CQUFvQjtBQUFBLFFBQ2xCLFFBQVU7QUFBQSxNQUNaO0FBQUEsTUFDQSxpQ0FBaUM7QUFBQSxRQUMvQixRQUFVO0FBQUEsTUFDWjtBQUFBLE1BQ0EsdUJBQXVCO0FBQUEsUUFDckIsUUFBVTtBQUFBLFFBQ1YsY0FBZ0I7QUFBQSxRQUNoQixZQUFjLENBQUMsS0FBSztBQUFBLE1BQ3RCO0FBQUEsTUFDQSxxQkFBcUI7QUFBQSxRQUNuQixRQUFVO0FBQUEsUUFDVixZQUFjLENBQUMsT0FBTSxPQUFPO0FBQUEsTUFDOUI7QUFBQSxNQUNBLGlDQUFpQztBQUFBLFFBQy9CLFFBQVU7QUFBQSxRQUNWLGNBQWdCO0FBQUEsTUFDbEI7QUFBQSxNQUNBLHNDQUFzQztBQUFBLFFBQ3BDLFFBQVU7QUFBQSxNQUNaO0FBQUEsTUFDQSxxQ0FBcUM7QUFBQSxRQUNuQyxRQUFVO0FBQUEsTUFDWjtBQUFBLE1BQ0Esb0JBQW9CO0FBQUEsUUFDbEIsUUFBVTtBQUFBLE1BQ1o7QUFBQSxNQUNBLHFCQUFxQjtBQUFBLFFBQ25CLFFBQVU7QUFBQSxNQUNaO0FBQUEsTUFDQSxvQkFBb0I7QUFBQSxRQUNsQixRQUFVO0FBQUEsTUFDWjtBQUFBLE1BQ0Esd0JBQXdCO0FBQUEsUUFDdEIsUUFBVTtBQUFBLFFBQ1YsY0FBZ0I7QUFBQSxRQUNoQixZQUFjLENBQUMsT0FBTSxNQUFNO0FBQUEsTUFDN0I7QUFBQSxNQUNBLHlCQUF5QjtBQUFBLFFBQ3ZCLFFBQVU7QUFBQSxNQUNaO0FBQUEsTUFDQSxnQ0FBZ0M7QUFBQSxRQUM5QixRQUFVO0FBQUEsTUFDWjtBQUFBLE1BQ0Esd0JBQXdCO0FBQUEsUUFDdEIsUUFBVTtBQUFBLFFBQ1YsY0FBZ0I7QUFBQSxNQUNsQjtBQUFBLE1BQ0EsNEJBQTRCO0FBQUEsUUFDMUIsUUFBVTtBQUFBLFFBQ1YsWUFBYyxDQUFDLElBQUk7QUFBQSxNQUNyQjtBQUFBLE1BQ0Esa0NBQWtDO0FBQUEsUUFDaEMsUUFBVTtBQUFBLFFBQ1YsY0FBZ0I7QUFBQSxRQUNoQixZQUFjLENBQUMsS0FBSztBQUFBLE1BQ3RCO0FBQUEsTUFDQSx5QkFBeUI7QUFBQSxRQUN2QixRQUFVO0FBQUEsUUFDVixjQUFnQjtBQUFBLE1BQ2xCO0FBQUEsTUFDQSxpQ0FBaUM7QUFBQSxRQUMvQixRQUFVO0FBQUEsUUFDVixjQUFnQjtBQUFBLE1BQ2xCO0FBQUEsTUFDQSxtQkFBbUI7QUFBQSxRQUNqQixRQUFVO0FBQUEsTUFDWjtBQUFBLE1BQ0Esb0JBQW9CO0FBQUEsUUFDbEIsUUFBVTtBQUFBLFFBQ1YsWUFBYyxDQUFDLE1BQU07QUFBQSxNQUN2QjtBQUFBLE1BQ0Esd0JBQXdCO0FBQUEsUUFDdEIsUUFBVTtBQUFBLFFBQ1YsY0FBZ0I7QUFBQSxRQUNoQixZQUFjLENBQUMsT0FBTztBQUFBLE1BQ3hCO0FBQUEsTUFDQSx1QkFBdUI7QUFBQSxRQUNyQixRQUFVO0FBQUEsUUFDVixjQUFnQjtBQUFBLFFBQ2hCLFlBQWMsQ0FBQyxLQUFLO0FBQUEsTUFDdEI7QUFBQSxNQUNBLHdCQUF3QjtBQUFBLFFBQ3RCLFFBQVU7QUFBQSxRQUNWLGNBQWdCO0FBQUEsUUFDaEIsWUFBYyxDQUFDLE1BQU07QUFBQSxNQUN2QjtBQUFBLE1BQ0Esd0JBQXdCO0FBQUEsUUFDdEIsUUFBVTtBQUFBLFFBQ1YsY0FBZ0I7QUFBQSxRQUNoQixZQUFjLENBQUMsTUFBTTtBQUFBLE1BQ3ZCO0FBQUEsTUFDQSx5QkFBeUI7QUFBQSxRQUN2QixRQUFVO0FBQUEsUUFDVixjQUFnQjtBQUFBLE1BQ2xCO0FBQUEsTUFDQSx3QkFBd0I7QUFBQSxRQUN0QixRQUFVO0FBQUEsUUFDVixjQUFnQjtBQUFBLFFBQ2hCLFlBQWMsQ0FBQyxTQUFTO0FBQUEsTUFDMUI7QUFBQSxNQUNBLGdDQUFnQztBQUFBLFFBQzlCLFFBQVU7QUFBQSxNQUNaO0FBQUEsTUFDQSx3Q0FBd0M7QUFBQSxRQUN0QyxRQUFVO0FBQUEsTUFDWjtBQUFBLE1BQ0EscUNBQXFDO0FBQUEsUUFDbkMsUUFBVTtBQUFBLE1BQ1o7QUFBQSxNQUNBLDZDQUE2QztBQUFBLFFBQzNDLFFBQVU7QUFBQSxNQUNaO0FBQUEsTUFDQSwwQkFBMEI7QUFBQSxRQUN4QixRQUFVO0FBQUEsTUFDWjtBQUFBLE1BQ0Esb0NBQW9DO0FBQUEsUUFDbEMsUUFBVTtBQUFBLE1BQ1o7QUFBQSxNQUNBLDRDQUE0QztBQUFBLFFBQzFDLFFBQVU7QUFBQSxNQUNaO0FBQUEsTUFDQSxpQ0FBaUM7QUFBQSxRQUMvQixRQUFVO0FBQUEsTUFDWjtBQUFBLE1BQ0Esb0NBQW9DO0FBQUEsUUFDbEMsUUFBVTtBQUFBLE1BQ1o7QUFBQSxNQUNBLDJCQUEyQjtBQUFBLFFBQ3pCLFFBQVU7QUFBQSxNQUNaO0FBQUEsTUFDQSxtQ0FBbUM7QUFBQSxRQUNqQyxRQUFVO0FBQUEsTUFDWjtBQUFBLE1BQ0EsbUJBQW1CO0FBQUEsUUFDakIsY0FBZ0I7QUFBQSxNQUNsQjtBQUFBLE1BQ0EsMEJBQTBCO0FBQUEsUUFDeEIsUUFBVTtBQUFBLFFBQ1YsY0FBZ0I7QUFBQSxNQUNsQjtBQUFBLE1BQ0EsdUJBQXVCO0FBQUEsUUFDckIsUUFBVTtBQUFBLFFBQ1YsY0FBZ0I7QUFBQSxNQUNsQjtBQUFBLE1BQ0EsdUJBQXVCO0FBQUEsUUFDckIsUUFBVTtBQUFBLFFBQ1YsY0FBZ0I7QUFBQSxRQUNoQixZQUFjLENBQUMsT0FBTSxXQUFXO0FBQUEsTUFDbEM7QUFBQSxNQUNBLHlCQUF5QjtBQUFBLFFBQ3ZCLFFBQVU7QUFBQSxNQUNaO0FBQUEsTUFDQSwwQkFBMEI7QUFBQSxRQUN4QixRQUFVO0FBQUEsUUFDVixjQUFnQjtBQUFBLFFBQ2hCLFlBQWMsQ0FBQyxLQUFLO0FBQUEsTUFDdEI7QUFBQSxNQUNBLCtCQUErQjtBQUFBLFFBQzdCLFFBQVU7QUFBQSxNQUNaO0FBQUEsTUFDQSwrQkFBK0I7QUFBQSxRQUM3QixRQUFVO0FBQUEsTUFDWjtBQUFBLE1BQ0EsZ0NBQWdDO0FBQUEsUUFDOUIsUUFBVTtBQUFBLFFBQ1YsWUFBYyxDQUFDLEtBQUs7QUFBQSxNQUN0QjtBQUFBLE1BQ0EsMkJBQTJCO0FBQUEsUUFDekIsUUFBVTtBQUFBLE1BQ1o7QUFBQSxNQUNBLDJCQUEyQjtBQUFBLFFBQ3pCLFFBQVU7QUFBQSxRQUNWLGNBQWdCO0FBQUEsTUFDbEI7QUFBQSxNQUNBLDBCQUEwQjtBQUFBLFFBQ3hCLFFBQVU7QUFBQSxNQUNaO0FBQUEsTUFDQSx1Q0FBdUM7QUFBQSxRQUNyQyxRQUFVO0FBQUEsTUFDWjtBQUFBLE1BQ0Esb0JBQW9CO0FBQUEsUUFDbEIsY0FBZ0I7QUFBQSxRQUNoQixZQUFjLENBQUMsTUFBTTtBQUFBLE1BQ3ZCO0FBQUEsTUFDQSxtQ0FBbUM7QUFBQSxRQUNqQyxRQUFVO0FBQUEsTUFDWjtBQUFBLE1BQ0Esb0JBQW9CO0FBQUEsUUFDbEIsUUFBVTtBQUFBLFFBQ1YsWUFBYyxDQUFDLE1BQU07QUFBQSxNQUN2QjtBQUFBLE1BQ0Esd0JBQXdCO0FBQUEsUUFDdEIsUUFBVTtBQUFBLFFBQ1YsY0FBZ0I7QUFBQSxRQUNoQixZQUFjLENBQUMsTUFBTTtBQUFBLE1BQ3ZCO0FBQUEsTUFDQSwyQkFBMkI7QUFBQSxRQUN6QixRQUFVO0FBQUEsTUFDWjtBQUFBLE1BQ0Esb0JBQW9CO0FBQUEsUUFDbEIsUUFBVTtBQUFBLE1BQ1o7QUFBQSxNQUNBLHlCQUF5QjtBQUFBLFFBQ3ZCLFFBQVU7QUFBQSxNQUNaO0FBQUEsTUFDQSxzQkFBc0I7QUFBQSxRQUNwQixjQUFnQjtBQUFBLFFBQ2hCLFlBQWMsQ0FBQyxLQUFLO0FBQUEsTUFDdEI7QUFBQSxNQUNBLHNCQUFzQjtBQUFBLFFBQ3BCLFFBQVU7QUFBQSxNQUNaO0FBQUEsTUFDQSxnQ0FBZ0M7QUFBQSxRQUM5QixRQUFVO0FBQUEsUUFDVixjQUFnQjtBQUFBLE1BQ2xCO0FBQUEsTUFDQSxnQ0FBZ0M7QUFBQSxRQUM5QixRQUFVO0FBQUEsUUFDVixjQUFnQjtBQUFBLFFBQ2hCLFlBQWMsQ0FBQyxRQUFRO0FBQUEsTUFDekI7QUFBQSxNQUNBLGtDQUFrQztBQUFBLFFBQ2hDLFFBQVU7QUFBQSxRQUNWLGNBQWdCO0FBQUEsUUFDaEIsWUFBYyxDQUFDLElBQUk7QUFBQSxNQUNyQjtBQUFBLE1BQ0Esb0NBQW9DO0FBQUEsUUFDbEMsUUFBVTtBQUFBLFFBQ1YsY0FBZ0I7QUFBQSxNQUNsQjtBQUFBLE1BQ0EsMEJBQTBCO0FBQUEsUUFDeEIsUUFBVTtBQUFBLFFBQ1YsY0FBZ0I7QUFBQSxNQUNsQjtBQUFBLE1BQ0EseUJBQXlCO0FBQUEsUUFDdkIsUUFBVTtBQUFBLFFBQ1YsY0FBZ0I7QUFBQSxNQUNsQjtBQUFBLE1BQ0EscUJBQXFCO0FBQUEsUUFDbkIsUUFBVTtBQUFBLE1BQ1o7QUFBQSxNQUNBLG9DQUFvQztBQUFBLFFBQ2xDLFFBQVU7QUFBQSxNQUNaO0FBQUEsTUFDQSxnREFBZ0Q7QUFBQSxRQUM5QyxRQUFVO0FBQUEsUUFDVixjQUFnQjtBQUFBLFFBQ2hCLFlBQWMsQ0FBQyxLQUFLO0FBQUEsTUFDdEI7QUFBQSxNQUNBLGtDQUFrQztBQUFBLFFBQ2hDLFFBQVU7QUFBQSxRQUNWLGNBQWdCO0FBQUEsTUFDbEI7QUFBQSxNQUNBLHdDQUF3QztBQUFBLFFBQ3RDLFFBQVU7QUFBQSxRQUNWLGNBQWdCO0FBQUEsTUFDbEI7QUFBQSxNQUNBLHNEQUFzRDtBQUFBLFFBQ3BELFFBQVU7QUFBQSxNQUNaO0FBQUEsTUFDQSw4QkFBOEI7QUFBQSxRQUM1QixRQUFVO0FBQUEsTUFDWjtBQUFBLE1BQ0EsbURBQW1EO0FBQUEsUUFDakQsUUFBVTtBQUFBLFFBQ1YsY0FBZ0I7QUFBQSxNQUNsQjtBQUFBLE1BQ0EsZ0NBQWdDO0FBQUEsUUFDOUIsUUFBVTtBQUFBLFFBQ1YsY0FBZ0I7QUFBQSxNQUNsQjtBQUFBLE1BQ0EsaUNBQWlDO0FBQUEsUUFDL0IsUUFBVTtBQUFBLFFBQ1YsY0FBZ0I7QUFBQSxNQUNsQjtBQUFBLE1BQ0EsNkJBQTZCO0FBQUEsUUFDM0IsUUFBVTtBQUFBLE1BQ1o7QUFBQSxNQUNBLDBDQUEwQztBQUFBLFFBQ3hDLFFBQVU7QUFBQSxNQUNaO0FBQUEsTUFDQSw0QkFBNEI7QUFBQSxRQUMxQixRQUFVO0FBQUEsTUFDWjtBQUFBLE1BQ0EsMENBQTBDO0FBQUEsUUFDeEMsUUFBVTtBQUFBLE1BQ1o7QUFBQSxNQUNBLHVEQUF1RDtBQUFBLFFBQ3JELFFBQVU7QUFBQSxRQUNWLGNBQWdCO0FBQUEsTUFDbEI7QUFBQSxNQUNBLHdDQUF3QztBQUFBLFFBQ3RDLFFBQVU7QUFBQSxRQUNWLGNBQWdCO0FBQUEsTUFDbEI7QUFBQSxNQUNBLHVDQUF1QztBQUFBLFFBQ3JDLFFBQVU7QUFBQSxNQUNaO0FBQUEsTUFDQSxrREFBa0Q7QUFBQSxRQUNoRCxRQUFVO0FBQUEsUUFDVixjQUFnQjtBQUFBLE1BQ2xCO0FBQUEsTUFDQSwwQ0FBMEM7QUFBQSxRQUN4QyxRQUFVO0FBQUEsTUFDWjtBQUFBLE1BQ0EsNkNBQTZDO0FBQUEsUUFDM0MsUUFBVTtBQUFBLFFBQ1YsY0FBZ0I7QUFBQSxNQUNsQjtBQUFBLE1BQ0EsZ0RBQWdEO0FBQUEsUUFDOUMsUUFBVTtBQUFBLFFBQ1YsY0FBZ0I7QUFBQSxNQUNsQjtBQUFBLE1BQ0Esc0RBQXNEO0FBQUEsUUFDcEQsUUFBVTtBQUFBLFFBQ1YsY0FBZ0I7QUFBQSxNQUNsQjtBQUFBLE1BQ0EsZ0RBQWdEO0FBQUEsUUFDOUMsUUFBVTtBQUFBLFFBQ1YsY0FBZ0I7QUFBQSxNQUNsQjtBQUFBLE1BQ0EsdUNBQXVDO0FBQUEsUUFDckMsUUFBVTtBQUFBLFFBQ1YsY0FBZ0I7QUFBQSxNQUNsQjtBQUFBLE1BQ0EsZ0RBQWdEO0FBQUEsUUFDOUMsUUFBVTtBQUFBLFFBQ1YsY0FBZ0I7QUFBQSxNQUNsQjtBQUFBLE1BQ0Esa0RBQWtEO0FBQUEsUUFDaEQsUUFBVTtBQUFBLFFBQ1YsY0FBZ0I7QUFBQSxNQUNsQjtBQUFBLE1BQ0EsaURBQWlEO0FBQUEsUUFDL0MsUUFBVTtBQUFBLFFBQ1YsY0FBZ0I7QUFBQSxNQUNsQjtBQUFBLE1BQ0EseUNBQXlDO0FBQUEsUUFDdkMsUUFBVTtBQUFBLFFBQ1YsY0FBZ0I7QUFBQSxNQUNsQjtBQUFBLE1BQ0EsNENBQTRDO0FBQUEsUUFDMUMsUUFBVTtBQUFBLFFBQ1YsY0FBZ0I7QUFBQSxNQUNsQjtBQUFBLE1BQ0EsaURBQWlEO0FBQUEsUUFDL0MsUUFBVTtBQUFBLFFBQ1YsY0FBZ0I7QUFBQSxNQUNsQjtBQUFBLE1BQ0EsK0NBQStDO0FBQUEsUUFDN0MsUUFBVTtBQUFBLFFBQ1YsY0FBZ0I7QUFBQSxNQUNsQjtBQUFBLE1BQ0Esd0RBQXdEO0FBQUEsUUFDdEQsUUFBVTtBQUFBLFFBQ1YsY0FBZ0I7QUFBQSxNQUNsQjtBQUFBLE1BQ0EscURBQXFEO0FBQUEsUUFDbkQsUUFBVTtBQUFBLFFBQ1YsY0FBZ0I7QUFBQSxNQUNsQjtBQUFBLE1BQ0EseUNBQXlDO0FBQUEsUUFDdkMsUUFBVTtBQUFBLFFBQ1YsY0FBZ0I7QUFBQSxNQUNsQjtBQUFBLE1BQ0Esa0RBQWtEO0FBQUEsUUFDaEQsUUFBVTtBQUFBLFFBQ1YsY0FBZ0I7QUFBQSxNQUNsQjtBQUFBLE1BQ0Esb0RBQW9EO0FBQUEsUUFDbEQsUUFBVTtBQUFBLFFBQ1YsY0FBZ0I7QUFBQSxN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Y0FBZ0I7QUFBQSxNQUNsQjtBQUFBLE1BQ0EseUVBQXlFO0FBQUEsUUFDdkUsUUFBVTtBQUFBLFFBQ1YsY0FBZ0I7QUFBQSxNQUNsQjtBQUFBLE1BQ0EseUVBQXlFO0FBQUEsUUFDdkUsUUFBVTtBQUFBLFFBQ1YsWUFBYyxDQUFDLE1BQU07QUFBQSxNQUN2QjtBQUFBLE1BQ0Esa0ZBQWtGO0FBQUEsUUFDaEYsUUFBVTtBQUFBLFFBQ1YsY0FBZ0I7QUFBQSxNQUNsQjtBQUFBLE1BQ0EsOEVBQThFO0FBQUEsUUFDNUUsUUFBVTtBQUFBLFFBQ1YsY0FBZ0I7QUFBQSxNQUNsQjtBQUFBLE1BQ0EsNkVBQTZFO0FBQUEsUUFDM0UsUUFBVTtBQUFBLFFBQ1YsY0FBZ0I7QUFBQSxNQUNsQjtBQUFBLE1BQ0EsOEVBQThFO0FBQUEsUUFDNUUsUUFBVTtBQUFBLFFBQ1YsY0FBZ0I7QUFBQSxNQUNsQjtBQUFBLE1BQ0EsNEVBQTRFO0FBQUEsUUFDMUUsUUFBVTtBQUFBLFFBQ1YsY0FBZ0I7QUFBQSxNQUNsQjtBQUFBLE1BQ0EsK0VBQStFO0FBQUEsUUFDN0UsUUFBVTtBQUFBLFFBQ1YsY0FBZ0I7QUFBQSxNQUNsQjtBQUFBLE1BQ0EsK0VBQStFO0FBQUEsUUFDN0UsUUFBVTtBQUFBLFFBQ1YsY0FBZ0I7QUFBQSxNQUNsQjtBQUFBLE1BQ0EsZ0ZBQWdGO0FBQUEsUUFDOUUsUUFBVTtBQUFBLFFBQ1YsY0FBZ0I7QUFBQSxNQUNsQjtBQUFBLE1BQ0Esd0ZBQXdGO0FBQUEsUUFDdEYsUUFBVTtBQUFBLFFBQ1YsY0FBZ0I7QUFBQSxNQUNsQjtBQUFBLE1BQ0EscUZBQXFGO0FBQUEsUUFDbkYsUUFBVTtBQUFBLFFBQ1YsY0FBZ0I7QUFBQSxNQUNsQjtBQUFBLE1BQ0EsOEVBQThFO0FBQUEsUUFDNUUsUUFBVTtBQUFBLFFBQ1YsY0FBZ0I7QUFBQSxNQUNsQjtBQUFBLE1BQ0EsOEVBQThFO0FBQUEsUUFDNUUsUUFBVTtBQUFBLFFBQ1YsY0FBZ0I7QUFBQSxNQUNsQjtBQUFBLE1BQ0EsbUZBQW1GO0FBQUEsUUFDakYsUUFBVTtB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QUMsSUFBSTtBQUFBLE1BQ3JCO0FBQUEsTUFDQSxrQkFBa0I7QUFBQSxRQUNoQixRQUFVO0FBQUEsUUFDVixZQUFjLENBQUMsS0FBSztBQUFBLE1BQ3RCO0FBQUEsTUFDQSxrQkFBa0I7QUFBQSxRQUNoQixRQUFVO0FBQUEsUUFDVixZQUFjLENBQUMsS0FBSztBQUFBLE1BQ3RCO0FBQUEsTUFDQSxtQkFBbUI7QUFBQSxRQUNqQixRQUFVO0FBQUEsUUFDVixZQUFjLENBQUMsTUFBTTtBQUFBLE1BQ3ZCO0FBQUEsTUFDQSxrQkFBa0I7QUFBQSxRQUNoQixRQUFVO0FBQUEsUUFDVixZQUFjLENBQUMsS0FBSztBQUFBLE1BQ3RCO0FBQUEsTUFDQSxtQkFBbUI7QUFBQSxRQUNqQixRQUFVO0FBQUEsUUFDVixZQUFjLENBQUMsTUFBTTtBQUFBLE1BQ3ZCO0FBQUEsTUFDQSxrQkFBa0I7QUFBQSxRQUNoQixRQUFVO0FBQUEsTUFDWjtBQUFBLE1BQ0Esa0JBQWtCO0FBQUEsUUFDaEIsUUFBVTtBQUFBLFFBQ1YsWUFBYyxDQUFDLEtBQUs7QUFBQSxNQUN0QjtBQUFBLE1BQ0EsbUJBQW1CO0FBQUEsUUFDakIsUUFBVTtBQUFBLFFBQ1YsWUFBYyxDQUFDLEtBQUs7QUFBQSxNQUN0QjtBQUFBLE1BQ0EsWUFBWTtBQUFBLFFBQ1YsUUFBVTtBQUFBLFFBQ1YsY0FBZ0I7QUFBQSxRQUNoQixZQUFjLENBQUMsS0FBSztBQUFBLE1BQ3RCO0FBQUEsTUFDQSxhQUFhO0FBQUEsUUFDWCxRQUFVO0FBQUEsTUFDWjtBQUFBLE1BQ0EsWUFBWTtBQUFBLFFBQ1YsUUFBVTtBQUFBLFFBQ1YsY0FBZ0I7QUFBQSxRQUNoQixZQUFjLENBQUMsS0FBSztBQUFBLE1BQ3RCO0FBQUEsTUFDQSxhQUFhO0FBQUEsUUFDWCxRQUFVO0FBQUEsUUFDVixZQUFjLENBQUMsTUFBTTtBQUFBLE1BQ3ZCO0FBQUEsTUFDQSxjQUFjO0FBQUEsUUFDWixRQUFVO0FBQUEsUUFDVixZQUFjLENBQUMsT0FBTztBQUFBLE1BQ3hCO0FBQUEsTUFDQSxjQUFjO0FB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O0FBQUEsRUFDZCxJQUFJO0FBQ0osU0FBTyxVQUFVLEdBQUc7QUFDdEI7QUFFTyxTQUFTLFNBQVMsS0FBYztBQUNyQyxRQUFNLEVBQUUsT0FBTyxPQUFPLElBQUk7QUFDMUIsTUFBSSxPQUFPO0FBQ1QsV0FBT0MsTUFBSyxZQUFZLE1BQU0sU0FBUyxNQUFNLE1BQU0sTUFBTTtBQUFBLEVBQzNEO0FBQ0EsU0FBTyxJQUFJO0FBQ2I7IiwKICAibmFtZXMiOiBbInV0aWwiLCAidXRpbCIsICJzdHJlYW0iLCAic2VsZiIsICJjaGFyc2V0IiwgImV4dGVuc2lvbiIsICJ1dGlsIiwgImh0dHAiLCAiaHR0cHMiLCAiRm9ybURhdGEiLCAiYXBwZW5kIiwgInJlc3BvbnNlIiwgInJlcXVlc3QiLCAiZGVmYXVsdHMiLCAiZ2V0UHJveHlGb3JVcmwiLCAidXJsIiwgInNlbGYiLCAidXNlQ29sb3JzIiwgInV0aWwiLCAic3RyZWFtIiwgInVzZUNvbG9ycyIsICJmZCIsICJyZXF1aXJlX2RlYnVnIiwgInVybCIsICJVUkwiLCAiaHR0cCIsICJodHRwcyIsICJub29wIiwgInNlbGYiLCAicmVzcG9uc2UiLCAiaXNTdHJpbmciLCAiaXNCdWZmZXIiLCAiaXNGdW5jdGlvbiIsICJyZXF1ZXN0IiwgImV4cG9ydHMiLCAic3ByZWFkIiwgInV0aWwiLCAicHJvdG90eXBlIiwgImRlc2NyaXB0b3JzIiwgImZpbHRlciIsICJoYXNPd25Qcm9wZXJ0eSIsICJyZXF1ZXN0IiwgInJlc3BvbnNlIiwgImZpbHRlciIsICJGb3JtRGF0YSIsICJwcm90b3R5cGUiLCAidG9TdHJpbmciLCAiZW5jb2RlIiwgInVybCIsICJpc0Zvcm1EYXRhIiwgImlzRmlsZUxpc3QiLCAidHJhbnNpdGlvbmFsIiwgImZpbHRlciIsICJzZWxmIiwgInByb3RvdHlwZSIsICJyZXNwb25zZSIsICJyZXF1ZXN0IiwgInJlc3BvbnNlIiwgInZhbGlkYXRlU3RhdHVzIiwgInVybCIsICJ1cmwiLCAic3RyZWFtIiwgInNlbGYiLCAic3RyZWFtIiwgImZvbGxvd1JlZGlyZWN0cyIsICJzdHJlYW0iLCAicmVzcG9uc2UiLCAidHJhbnNpdGlvbmFsIiwgInVybCIsICJyZXF1ZXN0IiwgInJlc3BvbnNlIiwgInRyYW5zaXRpb25hbCIsICJyZXNwb25zZSIsICJtZXJnZSIsICJ2YWxpZGF0b3JzIiwgInRyYW5zaXRpb25hbCIsICJ1cmwiLCAicmVxdWVzdCIsICJBeGlvcyIsICJBeGlvc0Vycm9yIiwgIkNhbmNlbGVkRXJyb3IiLCAiaXNDYW5jZWwiLCAiQ2FuY2VsVG9rZW4iLCAiVkVSU0lPTiIsICJhbGwiLCAiaXNBeGlvc0Vycm9yIiwgInNwcmVhZCIsICJ0b0Zvcm1EYXRhIiwgIkF4aW9zSGVhZGVycyIsICJIdHRwU3RhdHVzQ29kZSIsICJtZXJnZUNvbmZpZyIsICJ1dGlsIl0KfQo=
