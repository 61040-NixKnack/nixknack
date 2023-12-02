import { ObjectId } from "mongodb";
import DocCollection, { BaseDoc } from "../framework/doc";

export interface AchievementTypeDoc extends BaseDoc {
  name: string;
  thresholds: number[];
}

export interface AchievementUserDoc extends BaseDoc {
  user: ObjectId;
  name: string;
  progress: number;
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

  async getUserAchievements(user: ObjectId) {
    const allAchievements = await this.getAllAchievements();
    const userAchievements: Map<string, number> = new Map();

    for (const a of allAchievements) {
      const userProgress = (await this.user_achieves.readOne({ user, name: a.name }))?.progress ?? 0;
      const userAchievementLevel = this.findMaxAchievementLevel(userProgress, a.thresholds);
      userAchievements.set(a.name, userAchievementLevel);
    }

    return userAchievements;
  }

  async updateLevelAchievement(user: ObjectId, points: number) {
    await this.user_achieves.updateOne({ user, name: "Experience" }, { progress: points });
  }
}
