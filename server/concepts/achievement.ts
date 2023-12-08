import { ObjectId } from "mongodb";
import DocCollection, { BaseDoc } from "../framework/doc";
import { NotFoundError } from "./errors";

export interface AchievementTypeDoc extends BaseDoc {
  name: string;
  thresholds: number[];
}

export interface AchievementUserDoc extends BaseDoc {
  user: ObjectId;
  name: string;
  progress: number;
  level: number;
}

export enum AchievementName {
  CompletedTasks = "tasks",
  Experience = "exp",
  ItemsAdded = "added",
  ItemsDiscarded = "discarded",
}

export default class AchievementConcept {
  public readonly achieve_types = new DocCollection<AchievementTypeDoc>("achievement_types");
  public readonly user_achieves = new DocCollection<AchievementUserDoc>("user_achievements");

  private findMaxAchievementLevel(progress: number, thresholds: number[]) {
    let l = 0;
    let r = thresholds.length - 1;

    while (l < r) {
      const mid = l + Math.floor((r - l) / 2);
      if (progress < thresholds[mid]) {
        r = mid;
      } else {
        l = mid + 1;
      }
    }
    return l - 1;
  }

  private async getAllAchievements() {
    return await this.achieve_types.readMany({});
  }

  async create(name: string, thresholds: Array<number>) {
    await this.achieve_types.createOne({ name, thresholds });
  }

  async getAchievementData(user: ObjectId) {
    const achievementTypes = await this.achieve_types.readMany({});

    const levelMap: Map<string, number> = new Map();
    const progressMap: Map<string, number> = new Map();
    const thresholdsMap: Map<string, [number, number]> = new Map();

    for (const a of achievementTypes) {
      const userAchievement = await this.user_achieves.readOne({ user, name: a.name });

      let level = 0;
      if (userAchievement) {
        level = userAchievement.level;
      }

      levelMap.set(a.name, level);
      progressMap.set(a.name, userAchievement?.progress ?? 0);
      thresholdsMap.set(a.name, [a.thresholds[level], a.thresholds[level + 1]]);
    }

    return [Object.fromEntries(levelMap), Object.fromEntries(progressMap), Object.fromEntries(thresholdsMap)];
  }

  async updateProgress(user: ObjectId, name: AchievementName, progress: number) {
    const achievementObj = await this.achieve_types.readOne({ name });

    if (!achievementObj) {
      throw new NotFoundError(`Achievement with name ${name} does not exist`);
    }

    const level = this.findMaxAchievementLevel(progress, achievementObj.thresholds);
    await this.user_achieves.updateOne({ user, name }, { progress, level }, { upsert: true });

    return { msg: `Updated progress of achievement ${name} to level ${level} with progress ${progress}` };
  }

  async deleteUserProgress(user: ObjectId) {
    await this.user_achieves.deleteMany({ user });
    return { msg: "User progress deleted!" };
  }
}
