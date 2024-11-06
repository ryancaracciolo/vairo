import shortUUID from "short-uuid";

export default class Join {
  constructor({
    dataSourceId,
    joinId,
    sourceTable,
    sourceColumn,
    targetTable,
    targetColumn,
    joinType,
    description,
  }) {
    this.dataSourceId = dataSourceId;
    this.joinId = joinId || shortUUID().new();
    this.sourceTable = sourceTable;
    this.sourceColumn = sourceColumn;
    this.targetTable = targetTable;
    this.targetColumn = targetColumn;
    this.joinType = joinType;
    this.description = description;
    this.PK = `DATASOURCE#${this.dataSourceId}`;
    this.SK = `JOIN#${this.joinId}`;
    this.Type = 'Join';
  }

  toItem() {
    return {
      PK: this.PK,
      SK: this.SK,
      Type: this.Type,
      dataSourceId: this.dataSourceId,
      joinId: this.joinId,
      sourceTable: this.sourceTable,
      sourceColumn: this.sourceColumn,
      targetTable: this.targetTable,
      targetColumn: this.targetColumn,
      joinType: this.joinType,
      description: this.description,
    };
  }

  static fromItem(item) {
    return new Join({
      dataSourceId: item.dataSourceId,
      joinId: item.joinId,
      sourceTable: item.sourceTable,
      sourceColumn: item.sourceColumn,
      targetTable: item.targetTable,
      targetColumn: item.targetColumn,
      joinType: item.joinType,
      description: item.description,
    });
  }
}
