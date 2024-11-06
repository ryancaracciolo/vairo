import shortUUID from "short-uuid";

export default class Column {
  constructor({
    dataSourceId,
    tableName,
    columnName,
    dataType,
    description,
    otherColumnAttributes,
  }) {
    this.dataSourceId = dataSourceId;
    this.tableName = tableName;
    this.columnName = columnName;
    this.dataType = dataType;
    this.description = description;
    this.otherColumnAttributes = otherColumnAttributes || {};
    this.PK = `DATASOURCE#${this.dataSourceId}`;
    this.SK = `COLUMN#${this.tableName}#${this.columnName}`;
    this.Type = 'Column';
  }

  toItem() {
    return {
      PK: this.PK,
      SK: this.SK,
      Type: this.Type,
      dataSourceId: this.dataSourceId,
      tableName: this.tableName,
      columnName: this.columnName,
      dataType: this.dataType,
      description: this.description,
      otherColumnAttributes: this.otherColumnAttributes,
    };
  }

  static fromItem(item) {
    return new Column({
      dataSourceId: item.dataSourceId,
      tableName: item.tableName,
      columnName: item.columnName,
      dataType: item.dataType,
      description: item.description,
      otherColumnAttributes: item.otherColumnAttributes,
    });
  }
}
