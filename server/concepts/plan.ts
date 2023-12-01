import { ObjectId } from "mongodb";
import DocCollection, { BaseDoc } from "../framework/doc";
import { NotFoundError } from "./errors";

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

  private normalizeDate(date: Date) {
    const dateCopy = new Date(date.getTime());
    dateCopy.setHours(0);
    dateCopy.setMinutes(0);
    dateCopy.setSeconds(0);
    return dateCopy;
  }

  async getTasksAtDate(user: ObjectId, date: Date) {
    const deadline = this.normalizeDate(date);
    const plan = await this.plans.readOne({ user, deadline });

    if (!plan) {
      throw new NotFoundError(`Plan for user ${user} and date ${date} not found!`);
    }

    return plan.tasks;
  }

  async create(user: ObjectId, deadline: Date, tasks: ObjectId[]) {
    const selected: ObjectId[] = this.choose(tasks, TASKS_PER_DAY);
    const _id = await this.plans.createOne({ user, deadline, tasks: selected });
    return { msg: "User created successfully!", plan: await this.plans.readOne({ _id }) };
  }

  async expireTask(user: ObjectId) {
    const curDate = this.normalizeDate(new Date());

    await this.plans.deleteMany({
      user,
      deadline: { $lt: curDate },
    });
  }
}
