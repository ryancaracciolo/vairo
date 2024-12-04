import shortUUID from "short-uuid";

export default class WorkspaceAccess {
  /**
   * @param {Object} params
   * @param {string} params.userId - The ID of the user.
   * @param {string} params.workspaceId - The ID of the workspace.
   * @param {string} params.role - The role of the user in the workspace (e.g., 'admin', 'member', 'pending').
   * @param {string} params.partitionType - 'USER' or 'WORKSPACE' to determine PK and SK.
   */
  constructor({ userId, workspaceId, role, partitionType }) {
    this.userId = userId;
    this.workspaceId = workspaceId;
    this.role = role || 'member';
    this.Type = 'WorkspaceAccess';

    if (partitionType === 'USER') {
      this.PK = `USER#${this.userId}`;
      this.SK = `WORKSPACE#${this.workspaceId}`;
    } else if (partitionType === 'WORKSPACE') {
      this.PK = `WORKSPACE#${this.workspaceId}`;
      this.SK = `USER#${this.userId}`;
    } else {
      throw new Error("Invalid partitionType. Must be 'USER' or 'WORKSPACE'");
    }
  }

  toItem() {
    return {
      PK: this.PK,
      SK: this.SK,
      Type: this.Type,
      userId: this.userId,
      workspaceId: this.workspaceId,
      role: this.role,
    };
  }

  static fromItem(item) {
    const partitionType = item.PK.startsWith('USER#') ? 'USER' : 'WORKSPACE';
    return new WorkspaceAccess({
      userId: item.userId,
      workspaceId: item.workspaceId,
      role: item.role,
      partitionType,
    });
  }
}
