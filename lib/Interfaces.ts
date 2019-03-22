import AWS = require("aws-sdk");
import events = require("events");

export interface IQueue {
  queueName: string;
  getMessage(callback: (err: Error, data: AWS.SQS.Message) => void);
  deleteMessage(msg: AWS.SQS.Message, callback: (err: Error) => void);
  sendMessage(params: AWS.SQS.SendMessageRequest, callback: (err: Error) => void);
  createQueueReader(): IQueueReader;
  drain(callback?: (err: Error) => void);
}

export interface IQueueReader extends events.EventEmitter, IMessageDeleter {
  onReceipt(callback: (err, messages: AWS.SQS.Message[], context: IMessageDeleter) => void);
  onEmpty(callback: (err) => void);
  start();
  stop();
  pause();
  receiptCallback: (err: Error, messages: AWS.SQS.Message[], context: IMessageDeleter) => void;
  emptyCallback: (err: Error) => void;
  errorHandler: (err: Error) => void;
}

export interface IMessageDeleter {
  deleteMessage(message: AWS.SQS.Message);
  deleteMessages(messages: AWS.SQS.Message[]);
  flushReceiptLog();
}

export interface IMessageStream {
  _read(size?: number);
  close();
}

export interface IMessageStreamOptions {
  highWaterMark?: number;
  closeOnEmpty?: boolean;
}

