import shortUUID from "short-uuid";

export default class DataSource {
  constructor({ id, creatorUserId, name, dataSourceType, createdAt, host, port, username, password }) {
    this.id = id || shortUUID().new(); // Generate or accept a unique DataSource ID
    this.creatorUserId = creatorUserId;
    this.name = name;
    this.dataSourceType = dataSourceType;
    this.createdAt = createdAt || new Date().toISOString();
    this.host = host;
    this.port = port;
    this.username = username;
    this.password = password;
    this.PK = `DATASOURCE#${this.id}`;
    this.SK = `METADATA`;
    this.Type = 'DataSource';
  }

  toItem() {
    return {
      id: this.id,
      PK: this.PK,
      SK: this.SK,
      Type: this.Type,
      name: this.name,
      dataSourceType: this.dataSourceType,
      createdAt: this.createdAt,
      creatorUserId: this.creatorUserId,
      host: this.host,
      port: this.port,
      username: this.username,
      password: this.password,
    };
  }

  static fromItem(item) {
    return new DataSource({
      id: item.id,
      creatorUserId: item.creatorUserId,
      name: item.name,
      dataSourceType: item.dataSourceType,
      createdAt: item.createdAt,
      host: item.host,
      port: item.port,
      username: item.username,
      password: item.password,
    });
  }
}