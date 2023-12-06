import { Filter, ObjectId } from "mongodb";
import DocCollection, { BaseDoc } from "../framework/doc";
import { NotAllowedError, NotFoundError } from "./errors";

export interface ItemDoc extends BaseDoc {
  owner: ObjectId;
  name: string;
  lastUsedDate: Date;
  location: string;
  purpose: string;
  image: string;
}

export default class ItemConcept {
  public readonly items = new DocCollection<ItemDoc>("items");

  async create(owner: ObjectId, name: string, lastUsedDate?: Date, location?: string, purpose?: string, image?: string) {
    if (!lastUsedDate) {
      lastUsedDate = new Date();
    }
    const id = await this.items.createOne({ owner, name, lastUsedDate, location, purpose, image });
    return { msg: "Item created successfully!", id: id };
  }

  async getItems(query: Filter<ItemDoc>) {
    const items = await this.items.readMany(query, {
      sort: { lastUsedDate: -1 },
    });
    return items;
  }

  async getItem(_id: ObjectId) {
    await this.itemExists(_id);
    return await this.items.readOne({ _id });
  }

  async update(_id: ObjectId, update: Partial<ItemDoc>) {
    await this.itemExists(_id);
    await this.items.updateOne({ _id }, update);
    return { msg: "Item updated successfully!" };
  }

  async delete(query: Filter<ItemDoc>) {
    await this.items.deleteMany(query);
    return { msg: "Item deleted!" };
  }

  async itemExists(_id: ObjectId) {
    const maybeItem = await this.items.readOne({ _id });
    if (maybeItem === null) {
      throw new NotFoundError(`Item not found!`);
    }
  }

  async isOwner(owner: ObjectId, _id: ObjectId) {
    const maybeItem = await this.items.readOne({ owner, _id });
    if (maybeItem === null) {
      throw new ItemOwnerNotMatchError(owner, _id);
    }
  }

  /**
   * @param owner owner of the item
   * @param items list of items
   * @returns number of items in `items` that is owner by `owner`
   */
  async getItemCount(owner: ObjectId, items: ObjectId[]) {
    return await this.items.count({ owner: owner, _id: { $in: items } });
  }
}

export class ItemOwnerNotMatchError extends NotAllowedError {
  constructor(
    public readonly owner: ObjectId,
    public readonly _id: ObjectId,
  ) {
    super("{0} is not the owner of item {1}!", owner, _id);
  }
}
