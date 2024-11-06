// Message.js

import shortUUID from "short-uuid";

export default class Message {
  constructor({ id, threadId, direction, content, timestamp }) {
    this.id = id || shortUUID().new(); // Generate or accept a unique message ID
    this.threadId = threadId;
    this.direction = direction;
    this.content = content;
    this.timestamp = timestamp || new Date().toISOString();
    this.PK = `THREAD#${this.threadId}`;
    this.SK = `MESSAGE#${this.timestamp}#${this.id}`;
    this.Type = 'Message';
  }

  toItem() {
    return {
      id: this.id,
      PK: this.PK,
      SK: this.SK,
      Type: this.Type,
      threadId: this.threadId,
      direction: this.direction,
      content: this.content,
      timestamp: this.timestamp,
    };
  }

  static fromItem(item) {
    return new Message({
      id: item.id,
      threadId: item.threadId,
      direction: item.direction,
      content: item.content,
      timestamp: item.timestamp,
    });
  }
}