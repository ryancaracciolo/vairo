import shortUUID from "short-uuid";

export default class Thread {
  constructor({id, userId, title, createdAt}) {
    this.id = id || shortUUID().new(); // Generate or accept a unique Lead ID
    this.title = title;
    this.userId = userId; 
    this.createdAt = createdAt || new Date().toISOString();
    this.PK = `USER#${this.userId}`;
    this.SK = `THREAD#${this.id}`;
    this.Type = 'Thread';
  }

  toItem() {
    return {
      id: this.id,
      PK: this.PK,
      SK: this.SK,
      Type: this.Type,
      userId: this.userId,
      title: this.title,
      createdAt: this.createdAt,
    };
  }

  static fromItem(item) {
    const thread = new Thread({
      id: item.id,
      userId: item.userId,
      title: item.title,
      createdAt: item.createdAt,
    });
    return thread;
  }  
}