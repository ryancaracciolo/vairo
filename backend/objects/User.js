import shortUUID from "short-uuid";

export default class User {
  constructor({id, name, email, businessId, businessName}) {
    this.id = id || shortUUID().new(); // Generate or accept a unique Lead ID
    this.name = name;
    this.email = email;
    this.businessId = businessId; 
    this.businessName = businessName;
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
      businessId: this.businessId,
      businessName: this.businessName,
    };
  }

  static fromItem(item) {
    const user = new User({
      id: item.id,
      name: item.name,
      email: item.email,
      businessId: item.businessId,
      businessName: item.businessName,
    });
    return user;
  }  
}