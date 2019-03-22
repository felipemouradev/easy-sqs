"use strict";
var __extends = (this && this.__extends) || (function () {
    var extendStatics = Object.setPrototypeOf ||
        ({ __proto__: [] } instanceof Array && function (d, b) { d.__proto__ = b; }) ||
        function (d, b) { for (var p in b) if (b.hasOwnProperty(p)) d[p] = b[p]; };
    return function (d, b) {
        extendStatics(d, b);
        function __() { this.constructor = d; }
        d.prototype = b === null ? Object.create(b) : (__.prototype = b.prototype, new __());
    };
})();
exports.__esModule = true;
var streams = require("stream");
var errors = require("./CustomErrors");
var MessageStream = /** @class */ (function (_super) {
    __extends(MessageStream, _super);
    function MessageStream(reader, options) {
        var _this = this;
        _this.started = false;
        if (reader == null)
            throw new errors.NullOrEmptyArgumentError("reader");
        var defaultWaterMark = 32;
        _this.highWaterMark = (options == null || options.highWaterMark == null) ? defaultWaterMark : options.highWaterMark;
        _this.closeOnEmpty = (options == null || options.closeOnEmpty == null) ? false : options.closeOnEmpty;
        _this = _super.call(this, { objectMode: true, highWaterMark: _this.highWaterMark }) || this;
        var me = _this;
        me.reader = reader;
        me.reader.on("message", function (msg) {
            if (!me.push(msg)) {
                me.started = false;
                me.flushReceiptLog();
                me.reader.pause();
            }
        });
        me.reader.on("stopped", function () {
            me.push(null);
            me.emit("done");
        });
        me.reader.on("error", function (err) {
            me.emit("error", err);
        });
        me.reader.on("empty", function () {
            me.emit("empty");
        });
        return _this;
    }
    //IMessageDeleter
    MessageStream.prototype.deleteMessage = function (message) {
        this.reader.deleteMessage(message);
    };
    MessageStream.prototype.deleteMessages = function (messages) {
        this.reader.deleteMessages(messages);
    };
    MessageStream.prototype.flushReceiptLog = function () {
        this.reader.flushReceiptLog();
    };
    MessageStream.prototype._read = function (size) {
        if (this.started == false) {
            this.started = true;
            this.reader.start();
        }
    };
    MessageStream.prototype.close = function () {
        this.reader.stop();
        this.push(null);
    };
    return MessageStream;
}(streams.Readable));
exports.MessageStream = MessageStream;
//# sourceMappingURL=MessageStream.js.map