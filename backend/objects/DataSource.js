import shortUUID from "short-uuid";

export default class DataSource {
  constructor({ id, creatorUserId, name, dataSourceType, createdAt, host, port, database, user, password, status }) {
    this.id = id || shortUUID().new();
    this.creatorUserId = creatorUserId;
    this.name = name;
    this.dataSourceType = dataSourceType;
    this.createdAt = createdAt || new Date().toISOString();
    this.host = host;
    this.port = port;
    this.database = database;
    this.user = user;
    this.password = password;
    this.status = status;
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
      database: this.database,
      user: this.user,
      password: this.password,
      status: this.status
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
      database: item.database,
      user: item.user,
      password: item.password,
      status: item.status
    });
  }
}