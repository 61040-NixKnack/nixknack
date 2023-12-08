import { ObjectId } from "mongodb";
import DocCollection, { BaseDoc } from "../framework/doc";
import { NotFoundError } from "./errors";

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

  async addPoints(user: ObjectId, quantity: number) {
    const maybePts = await this.points.readOne({ user });

    let pts = 0;
    if (maybePts) {
      pts = maybePts.points;
    }

    const newPoints = pts + quantity;

    await this.points.updateOne({ user }, { points: newPoints }, { upsert: true });
    return { msg: `Points updated from ${pts} to ${newPoints}!` };
  }

  async create(user: ObjectId) {
    await this.unique(user);
    await this.points.createOne({ user: user, points: 0 });
    return { msg: `Points for ${user} successfully created!` };
  }

  private async unique(user: ObjectId) {
    const maybePoint = await this.points.readOne({ user: user });
    if (maybePoint !== null) {
      throw new NotFoundError(`User Point already exists!`);
    }
  }
  async deleteByUser(user: ObjectId) {
    await this.points.deleteOne({ user });
    return { msg: "Points deleted!" };
  }
}
