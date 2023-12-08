import { ObjectId } from "mongodb";
import DocCollection, { BaseDoc } from "../framework/doc";
import { BadValuesError, NotAllowedError, NotFoundError } from "./errors";

export interface RecommendationDoc extends BaseDoc {
  tag: string;
  text: string;
}

export default class RecommendationConcept {
  public readonly recs = new DocCollection<RecommendationDoc>("recommendations");

  async getRecommendation(tag: string) {
    const recStr = await this.recs.readOne({ tag });

    if (!recStr) {
      const misc = await this.recs.readOne({ tag: "!msc" });

      if (!misc) {
        throw new NotFoundError("Default tag not found!");
      }

      return misc;
    }

    return recStr;
  }

  async getRecommendationById(_id: ObjectId) {
    return await this.recs.readOne({ _id });
  }

  async create(tag: string, text: string) {
    await this.canCreate(tag, text);
    const _id = await this.recs.createOne({ tag, text });
    return { msg: "Recommendation created successfully!", rec: await this.recs.readOne({ _id }) };
  }

  async delete(tag: string) {
    await this.recs.deleteOne({ tag });
    return { msg: "Recommendation deleted!" };
  }

  private async canCreate(tag: string, text: string) {
    if (!tag || !text) {
      throw new BadValuesError("Tag and text must be non-empty!");
    }

    if (await this.recs.readOne({ tag })) {
      throw new NotAllowedError(`Recommendation for tag ${tag} already exists!`);
    }
  }
}
