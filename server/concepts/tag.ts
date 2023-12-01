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

  async create(tag: string, tn: number) {
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
      await this.create(tag, 20); // Threshold for other items defaulted to 20
    }
    await this.itemNotAdded(tag, itemId);
    await this.tags.pushArrayOne({ value: tag }, { taggedItems: itemId });
    return { msg: `Item ${itemId} added for tag ${tag}!` };
  }

  async deleteItem(tag: string, itemId: ObjectId) {
    await this.itemAdded(tag, itemId);
    await this.tags.removeArrayOne({ value: tag }, { taggedItems: itemId });
    return { msg: `Item ${itemId} deleted for tag ${tag}!` };
  }

  async addItemToTags(tags: string[], itemId: ObjectId) {
    await this.tags.pushArrayMany({ value: { $in: tags } }, { taggedItems: itemId });
    return { msg: `Item ${itemId} successfully added to tags` };
  }

  async deleteItemFromAll(itemId: ObjectId) {
    await this.tags.removeArrayMany({}, { taggedItems: itemId });
    return { msg: `Item ${itemId} successfully removed from all tags` };
  }

  async getTags(itemId: ObjectId) {
    const tagsFound = await this.tags.readMany({ taggedItems: itemId });
    return tagsFound.map((tag) => tag.value);
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