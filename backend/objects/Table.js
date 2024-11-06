import shortUUID from "short-uuid";

export default class Table {
  constructor({ dataSourceId, tableName, description, otherTableAttributes }) {
    this.dataSourceId = dataSourceId;
    this.tableName = tableName;
    this.description = description;
    this.otherTableAttributes = otherTableAttributes || {};
    this.PK = `DATASOURCE#${this.dataSourceId}`;
    this.SK = `TABLE#${this.tableName}`;
    this.Type = 'Table';
  }

  toItem() {
    return {
      PK: this.PK,
      SK: this.SK,
      Type: this.Type,
      dataSourceId: this.dataSourceId,
      tableName: this.tableName,
      description: this.description,
      otherTableAttributes: this.otherTableAttributes,
    };
  }

  static fromItem(item) {
    return new Table({
      dataSourceId: item.dataSourceId,
      tableName: item.tableName,
      description: item.description,
      otherTableAttributes: item.otherTableAttributes,
    });
  }
}
