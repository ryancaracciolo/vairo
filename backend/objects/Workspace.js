import shortUUID from "short-uuid";

export default class Workspace {
    constructor({id, name, adminId, subscriptionType, domain, memberIds, creationDate}) {
      this.id = id || shortUUID().new(); // Generate a unique ID
      this.PK = `WORKSPACE#${this.id}`; // Partition Key
      this.SK = 'METADATA';        // Sort Key
      this.Type = 'Workspace';      // Item Type
      this.name = name;
      this.adminId = adminId;
      this.subscriptionType = subscriptionType || 'free';
      this.domain = domain;
      this.memberIds = memberIds || [];
      this.creationDate = creationDate || new Date().toISOString();
    }
  
    toItem() {
      return {
        id: this.id,
        PK: this.PK,
        SK: this.SK,
        Type: this.Type,
        name: this.name,
        adminId: this.adminId,
        subscriptionType: this.subscriptionType,
        domain: this.domain,
        memberIds: this.memberIds,
        creationDate: this.creationDate
      };
    }

    static fromItem(item) {
        const workspace = new Workspace({
          id: item.id,
          name: item.name,
          adminId: item.adminId,
          subscriptionType: item.subscriptionType,
          domain: item.domain,
          memberIds: item.memberIds,
          creationDate: item.creationDate
        });
        return workspace;
      }
}