export default class Table {
  constructor({
    dataSourceId,
    content: {
      tableName,
      description,
      columns,
      foreignKeys,
    },
  }) {
    this.dataSourceId = dataSourceId;
    this.content = {
      tableName,
      description,
      columns: columns || [],
      foreignKeys: foreignKeys || [],
    };
    this.PK = `DATASOURCE#${this.dataSourceId}`;
    this.SK = `TABLE#${this.content.tableName}`;
    this.Type = 'Table';
  }

  toItem() {
    return {
      PK: this.PK,
      SK: this.SK,
      Type: this.Type,
      dataSourceId: this.dataSourceId,
      content: this.content,
    };
  }

  static fromItem(item) {
    return new Table({
      dataSourceId: item.dataSourceId,
      content: item.content,
    });
  }
}
