import { Filter, ObjectId } from "mongodb";
import DocCollection, { BaseDoc } from "../framework/doc";
import { NotAllowedError, NotFoundError } from "./errors";

export interface ItemDoc extends BaseDoc {
    name: String,
    location: String, //TO DO
    purpose: String,
    lastUsedDate: Date,
    user: ObjectId
}

export default class ItemConcept {
  public readonly items = new DocCollection<ItemDoc>("items");

  async create(user: ObjectId, name: String, location: String, purpose: String, lastUsedDate: Date){
    await this.isItemUnique(user, name)
    await this.items.createOne({name, location, purpose, lastUsedDate, user});
  }

  async getItems(query: Filter<ItemDoc>) {
    const posts = await this.items.readMany(query, {
        sort: { lastUsedDate: -1 },
      });
      return posts;
  }

  async updateItem(_id: ObjectId, update: Partial<ItemDoc>) {
    await this.itemExists(_id);
    await this.items.updateOne({ _id }, update);
    return { msg: "Item updated successfully!" };
  }

  async delete(_id: ObjectId) {
    await this.items.deleteOne({ _id });
    return { msg: "Item deleted!" };
  }

  async itemExists(_id: ObjectId) {
    const maybeItem = await this.items.readOne({ _id });
    if (maybeItem === null) {
      throw new NotFoundError(`Item not found!`);
    }
  }

  private async isItemUnique(user: ObjectId, name: String) {
    if (await this.items.readOne({ user: user, name: name })) {
      throw new NotAllowedError(`Item with name ${name} already exists for user with ID ${user}!`);
    }
  }
}
