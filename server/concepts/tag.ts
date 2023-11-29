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

  async deleteItemFromAll(itemId: ObjectId) {
    await this.tags.updateArrayMany({}, { $pull: { taggedItems: itemId } });
  }

  async getTags(itemId: ObjectId) {
    const tagsFound = await this.tags.readMany({ taggedItems: itemId });
    return tagsFound.map((tag) => tag.value);
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
