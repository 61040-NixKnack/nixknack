import { ObjectId } from "mongodb";
import DocCollection, { BaseDoc } from "../framework/doc";
import { NotAllowedError } from "./errors";

export interface TagDoc extends BaseDoc {
  value: string;
  taggedItems: ObjectId[];
  thresholdNumber: number;
}

export default class TagConcept {
  public readonly tags = new DocCollection<TagDoc>("tags");
  public readonly definedTags = new Set([
    "Cookware",
    "Utensils",
    "Kitchen Tools",
    "Dishes",
    "Glassware",
    "Small Appliances",
    "Tupperware",
    "Tops (Clothing)",
    "Bottoms (Clothing)",
    "Sweaters, Sweatshirts & Hoodies",
    "Coats & Jackets",
    "Shoes",
    "Jewelry",
    "Hats",
    "Undergarments",
    "Accessories (Clothing)",
    "Other (Clothing)",
    "Bedding",
    "Furniture",
    "Electronics",
    "Books & Magazines",
    "Decor",
    "Toiletries",
    "Makeup & Skincare",
    "Towels",
    "Cleaning Supplies",
    "Office Supplies",
    "Paper",
    "Sports Equipment",
    "Toys & Games",
    "CDs, DVDs & Tapes",
    "Hand Tools & Workshop Supplies",
    "Sentimental",
    "Weaponry",
  ]);

  async create(tag: string, tn?: number) {
    await this.uniqueTag(tag);
    await this.tags.createOne({ value: tag, thresholdNumber: tn });
    return { msg: `Tag ${tag} created successfully!` };
  }

  async getTagTN(tag: string) {
    await this.tagExists(tag);
    const tagDoc = await this.tags.readOne({ value: tag });
    return tagDoc?.thresholdNumber;
  }

  async addItem(tag: string, itemId: ObjectId) {
    if (!this.doesTagExist(tag)) {
      await this.create(tag, 15); // Threshold for other items defaulted to 15
    }
    await this.itemNotAdded(tag, itemId);
    await this.tags.updateArrayOne({ value: tag }, { $push: { taggedItems: itemId } });
    return { msg: `Item ${itemId} added for tag ${tag}!` };
  }

  async deleteItem(tag: string, itemId: ObjectId) {
    await this.itemAdded(tag, itemId);
    await this.tags.updateArrayOne({ value: tag }, { $pull: { taggedItems: itemId } });
    return { msg: `Item ${itemId} deleted for tag ${tag}!` };
  }

  async addItemToTags(tags: string[], itemId: ObjectId) {
    await this.tags.updateArrayMany({ value: { $in: tags } }, { $push: { taggedItems: itemId } });
    return { msg: `Item ${itemId} successfully added to tags` };
  }

  async deleteItemFromAll(itemIds: ObjectId[]) {
    await this.tags.updateArrayMany({ taggedItems: { $in: itemIds } }, { $pull: { $taggedItems: { $in: itemIds } } });
    return { msg: `Items ${itemIds} successfully removed from all tags` };
  }

  async getTags(itemIds: ObjectId[]) {
    const tagsFound = await this.tags.readMany({ taggedItems: { $in: itemIds } });
    return tagsFound.map((tag) => tag.value);
  }

  /**
   * @param tags list of tags (strings)
   * @param items list of items (ObjectIds)
   * @returns Map where key is tag and value is list of items in `items` that have tag `tag`
   */
  async itemsByTag(tags: string[], items: ObjectId[]) {
    const result = new Map<string, ObjectId[]>();
    const stringItems = items.map((item) => item.toString());
    for (const tag of tags) {
      // Get all items with tag and then filter such that only items also in `items` remain
      const taggedItems = (await this.tags.readOne({ value: tag }))?.taggedItems;
      const commonItems = taggedItems?.filter((item) => stringItems.indexOf(item.toString()) !== -1);
      result.set(tag, commonItems ? commonItems : []);
    }
    return result;
  }

  async getItems(tag: string) {
    const docs = await this.tags.readOne({ value: tag });
    if (docs) {
      return docs.taggedItems;
    }
    return [];
  }

  private async uniqueTag(tag: string) {
    const maybeItem = await this.tags.readOne({ value: tag });
    if (maybeItem) {
      throw new NotAllowedError(`Tag ${tag} already exists!`);
    }
  }

  private async tagExists(tag: string) {
    const maybeItem = await this.tags.readOne({ value: tag });
    if (maybeItem == null) {
      throw new NotAllowedError(`Tag ${tag} does not exists!`);
    }
  }

  private async doesTagExist(tag: string) {
    const maybeItem = await this.tags.readOne({ value: tag });
    if (maybeItem == null) {
      return false;
    }
    return true;
  }

  private async itemAdded(tag: string, itemId: ObjectId) {
    const maybeItem = await this.tags.readOne({ value: tag, taggedItems: itemId });
    if (maybeItem == null) {
      throw new NotAllowedError(`Item not added for tag ${tag}!`);
    }
  }

  private async itemNotAdded(tag: string, itemId: ObjectId) {
    const maybeItem = await this.tags.readOne({ value: tag, taggedItems: itemId });
    if (maybeItem) {
      throw new NotAllowedError(`Item added for tag ${tag} already!`);
    }
  }
}
