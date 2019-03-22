import AWS = require("aws-sdk");
import reader = require("./QueueReader");
import errors = require("./CustomErrors");
import stream = require("./MessageStream");
import interfaces = require("./Interfaces");

export class Queue implements interfaces.IQueue {

    public queueName: string;
    private sqs: AWS.SQS;

    constructor(queueName: string, sqs: AWS.SQS) {

        if (queueName == null) throw new errors.NullOrEmptyArgumentError("queueName");
        if (queueName.length == 0) throw new errors.InvalidArgumentError("queueName not provided");
        if (sqs == null) throw new errors.NullOrEmptyArgumentError("sqs");

        this.queueName = queueName;
        this.sqs = sqs;

    }

    //public createBatchDeleter(batchSize?: number) {
    //  return new md.MessageDeleter(this.sqs, this.queueName, batchSize, null);
    //}

    public createQueueReader(batchSize?: number): interfaces.IQueueReader {
        return new reader.QueueReader(this.sqs, this.queueName, batchSize);
    }

    public createMessageStream(highWaterMark?: number, batchSize?: number): interfaces.IMessageStream {
        let rdr = new reader.QueueReader(this.sqs, this.queueName, batchSize);

        let opts: interfaces.IMessageStreamOptions = null;

        if (highWaterMark != null) {
            opts = {
                highWaterMark: highWaterMark
            };
        }

        return new stream.MessageStream(rdr, opts);
    }

    public drain(callback?: (err: Error) => void) {

        let queue = this;

        let queueReader: any = queue.createQueueReader();

        queueReader
            .on("message", (msg, context) => {

                context.deleteMessage(msg);

            });

        queueReader
            .on("empty", (err) => {
                //all done, stop monitoring the queue
                queueReader.stop();

                if (callback != null) {
                    callback(err);
                }

            });

        queueReader.start();
    }

    getMessage(callback: (err: Error, data: AWS.SQS.Message) => void) {

        let client = this.sqs;
        let params: any | AWS.SQS.ReceiveMessageRequest = {};

        params.QueueUrl = this.queueName,
            params.MaxNumberOfMessages = 1;

        client.receiveMessage(params, function (err: Error, data: AWS.SQS.ReceiveMessageResult) {

            if (data.Messages != null && data.Messages.length > 0) {

                var msg = data.Messages[0];
                callback(err, msg);

            }
        });

    }

    deleteMessage(msg: AWS.SQS.Message, callback: (err: Error) => void) {
        let client = this.sqs;
        let params: any | AWS.SQS.DeleteMessageRequest = {}; //AWS.SQS.DeleteMessageRequest

        if (msg == null) {
            callback(new errors.NullOrEmptyArgumentError("msg"));
            return;
        }

        if (msg.ReceiptHandle == null || msg.ReceiptHandle.length == 0) {
            callback(new errors.InvalidArgumentError("msg.ReceiptHandle cannot be null or empty"));
            return;
        }

        params.QueueUrl = this.queueName,
            params.ReceiptHandle = msg.ReceiptHandle;

        client.deleteMessage(params, function (err: Error, data: any) {
            callback(err);
        });
    }

    sendMessage(params: AWS.SQS.SendMessageRequest, callback: (err: Error) => void) {
        var client = this.sqs;

        if (params.MessageBody == null) {
            callback(new errors.NullOrEmptyArgumentError("Data cannot be null"));
            return;
        }
        if (params.MessageBody.length > 262144) {
            callback(new errors.InvalidArgumentError("data too large for SQS"));
            return;
        }

        // var params: AWS.SQS.SendMessageRequest = {};

        params.QueueUrl = this.queueName;

        client.sendMessage(params, function (err, data) {

            callback(err);
        });

    }
}
