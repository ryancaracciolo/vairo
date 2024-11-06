import shortUUID from "short-uuid";

export default class DataSourceAccess {
  /**
   * @param {Object} params
   * @param {string} params.userId - The ID of the user.
   * @param {string} params.dataSourceId - The ID of the data source.
   * @param {string} params.accessLevel - The access level (e.g., 'owner', 'read', 'write').
   * @param {string} params.partitionType - 'USER' or 'DATASOURCE' to determine PK and SK.
   */
  constructor({ userId, dataSourceId, accessLevel, partitionType }) {
    this.userId = userId;
    this.dataSourceId = dataSourceId;
    this.accessLevel = accessLevel || 'read';
    this.Type = 'DataSourceAccess';

    if (partitionType === 'USER') {
      this.PK = `USER#${this.userId}`;
      this.SK = `DATASOURCE#${this.dataSourceId}`;
    } else if (partitionType === 'DATASOURCE') {
      this.PK = `DATASOURCE#${this.dataSourceId}`;
      this.SK = `USER#${this.userId}`;
    } else {
      throw new Error("Invalid partitionType. Must be 'USER' or 'DATASOURCE'");
    }
  }

  toItem() {
    return {
      PK: this.PK,
      SK: this.SK,
      Type: this.Type,
      userId: this.userId,
      dataSourceId: this.dataSourceId,
      accessLevel: this.accessLevel,
    };
  }

  static fromItem(item) {
    const partitionType = item.PK.startsWith('USER#') ? 'USER' : 'DATASOURCE';
    return new DataSourceAccess({
      userId: item.userId,
      dataSourceId: item.dataSourceId,
      accessLevel: item.accessLevel,
      partitionType,
    });
  }
}
