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
var events = require("events");
var MessageDeleter = /** @class */ (function (_super) {
    __extends(MessageDeleter, _super);
    //This signature should be changed to drop errorHandler in favour of on("error")
    function MessageDeleter(sqs, queueName, batchSize, errorHandler) {
        var _this = _super.call(this) || this;
        _this.receiptLog = [];
        if (queueName == null || queueName.length == 0)
            throw new Error("queueName was not provided");
        if (sqs == null)
            throw new Error("sqs was not provided");
        //swallow errors if null
        _this.errorHandler = errorHandler != null ? errorHandler : function (err) { };
        _this.sqs = sqs;
        _this.threshold = batchSize > 0 ? batchSize : 1;
        _this.queueName = queueName;
        return _this;
    }
    MessageDeleter.prototype.deleteMessage = function (message) {
        this.receiptLog.push(message);
        this.flushIfThresholdExceeded();
    };
    MessageDeleter.prototype.deleteMessages = function (messages) {
        var me = this;
        messages.forEach(function (value, index, array) {
            me.receiptLog.push(value);
        });
        me.flushIfThresholdExceeded();
    };
    MessageDeleter.prototype.flushIfThresholdExceeded = function () {
        if (this.receiptLog.length >= this.threshold) {
            this.flushReceiptLog();
        }
    };
    MessageDeleter.prototype.flushReceiptLog = function () {
        if (this.receiptLog.length > 0) {
            this.cleanUp(this.sqs, this);
        }
    };
    MessageDeleter.prototype.cleanUp = function (client, parent) {
        var i = 0;
        var list = [];
        parent.receiptLog.forEach(function (msg, index, array) {
            list.push(msg.ReceiptHandle);
            i++;
            if (i == parent.threshold || index == array.length - 1) {
                parent.deleteMessageBatch(client, parent.queueName, list);
                list = new Array();
                i = 0;
            }
            if (index == array.length - 1) {
                parent.receiptLog = [];
            }
        });
    };
    MessageDeleter.prototype.deleteMessageBatch = function (client, queueName, handles) {
        var entries = [];
        var me = this;
        for (var i = 0; i < handles.length; i++) {
            var entry = {
                Id: i.toString(),
                ReceiptHandle: handles[i]
            };
            entries.push(entry);
        }
        var params = {
            QueueUrl: queueName,
            Entries: entries
        };
        client.deleteMessageBatch(params, function (err, data) {
            if (err) {
                me.emit("error", err);
                me.errorHandler(err);
            }
        });
    };
    return MessageDeleter;
}(events.EventEmitter));
exports.MessageDeleter = MessageDeleter;
//# sourceMappingURL=MessageDeleter.js.map