import shortUUID from "short-uuid";

export default class User {
  constructor({id, name, email, workspaceId, role}) { // role can be 'pending', 'member', 'admin'
    this.id = id || shortUUID().new(); // Generate or accept a unique Lead ID
    this.name = name;
    this.email = email;
    this.workspaceId = workspaceId; 
    this.role = role;
    this.PK = `USER#${this.id}`;
    this.SK = `METADATA`;
    this.Type = 'User';
  }

  toItem() {
    return {
      id: this.id,
      PK: this.PK,
      SK: this.SK,
      Type: this.Type,
      name: this.name,
      email: this.email,
      workspaceId: this.workspaceId,
      role: this.role,
    };
  }

  static fromItem(item) {
    const user = new User({
      id: item.id,
      name: item.name,
      email: item.email,
      workspaceId: item.workspaceId,
      role: item.role,
    });
    return user;
  }  
}