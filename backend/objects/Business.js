import shortUUID from "short-uuid";

export default class Business {
    constructor(id, name) {
      if (!id || !name) {
        console.log(id, name)
        throw new Error('Business ID and name are required.');
      }
      this.id = id || shortUUID().new(); // Generate a unique ID
      this.PK = `BUSINESS#${this.id}`; // Partition Key
      this.SK = 'METADATA';        // Sort Key
      this.Type = 'Business';      // Item Type
      this.name = name;
    }
  
    // Method to convert the class instance to a plain object for DynamoDB
    toItem() {
      return {
        id: this.id,
        PK: this.PK,
        SK: this.SK,
        Type: this.Type,
        name: this.name
      };
    }

    static fromItem(item) {
        const business = new Business(
            item.id,
            item.name,
        );
        return business;
      }
}