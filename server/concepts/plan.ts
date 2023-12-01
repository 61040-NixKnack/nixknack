import { ObjectId } from "mongodb";
import DocCollection, { BaseDoc } from "../framework/doc";

const TASKS_PER_DAY = 3;

export interface PlanDoc extends BaseDoc {
  user: ObjectId;
  deadline: Date;
  tasks: ObjectId[];
}

export default class PlanConcept {
  public readonly plans = new DocCollection<PlanDoc>("plans");

  private choose(choices: ObjectId[], count: number) {
    const res = [];
    for (let i = 0; i < count; i++) {
      res.push(choices[Math.floor(Math.random() * choices.length)]);
    }
    return res;
  }

  async create(user: ObjectId, deadline: Date, tasks: ObjectId[]) {
    const selected: ObjectId[] = this.choose(tasks, TASKS_PER_DAY);
    const _id = await this.plans.createOne({ user, deadline, tasks: selected });
    return { msg: "User created successfully!", plan: await this.plans.readOne({ _id }) };
  }
}
