import { ObjectId } from "mongodb";
import DocCollection, { BaseDoc } from "../framework/doc";
import { NotAllowedError, NotFoundError } from "./errors";

export interface PointDoc extends BaseDoc {
  user: ObjectId;
  points: number;
}

export default class PointConcept {
  public readonly points = new DocCollection<PointDoc>("points");

  async getPoints(user: ObjectId): Promise<number> {
    const maybePts = await this.points.readOne({ user });
    if (!maybePts) {
      throw new NotFoundError(`Points for user ${user} not found!`);
    }
    return maybePts.points;
  }

  async initPoints(user: ObjectId) {
    await this.alreadyInitialized(user);
    const _id = await this.points.createOne({ user, points: 0 });
    return { msg: "Points initialized successfully!", points: await this.points.readOne({ _id }) };
  }

  async addPoints(user: ObjectId, quantity: number) {
    const maybePts = await this.points.readOne({ user });

    if (!maybePts) {
      throw new NotFoundError(`Points for user ${user} not found!`);
    }

    const newPoints = maybePts.points + quantity;

    await this.points.updateOne({ user }, { points: newPoints });
    return { msg: `Points updated from ${maybePts.points} to ${newPoints}!` };
  }

  private async alreadyInitialized(user: ObjectId) {
    const maybePts = await this.points.readOne({ user });
    if (maybePts) {
      throw new NotAllowedError(`Points for user ${user} already initialized`);
    }
  }
}
