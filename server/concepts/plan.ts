import { ObjectId } from "mongodb";
import DocCollection, { BaseDoc } from "../framework/doc";
import { NotAllowedError } from "./errors";

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
    let index = 0;

    for (let i = 0; i < count; i++) {
      if (choices.length === 0) {
        break;
      }
      index = Math.floor(Math.random() * choices.length);
      res.push(choices[index]);
      delete choices[index];
    }
    return res;
  }

  public normalizeDate(date: Date) {
    const dateCopy = new Date(date.getTime());
    dateCopy.setHours(0);
    dateCopy.setMinutes(0);
    dateCopy.setSeconds(0);
    dateCopy.setMilliseconds(0);
    return dateCopy;
  }

  async getWeekTasks(user: ObjectId) {
    const date = new Date();
    const deadline = this.normalizeDate(date);
    const plan = new Array<PlanDoc | null>();
    for (let i = 0; i < 7; i++) {
      plan.push(await this.plans.readOne({ user: user, deadline: deadline }));
      deadline.setDate(deadline.getDate() + 1);
    }
    return plan.map((item) => (item !== null ? item.tasks : []));
  }

  async getTasksAtDate(user: ObjectId, deadline: Date) {
    const plans = await this.plans.readOne({ user, deadline });

    if (!plans) {
      return [];
    }

    return plans.tasks;
  }

  async populateWeekTasks(user: ObjectId, taskPool: ObjectId[]) {
    // Start 7 days ahead
    let d = new Date();
    d = this.normalizeDate(d);

    for (let i = 0; i < 7; i++) {
      const tasksForDay = await this.getTasksAtDate(user, d);

      for (let j = tasksForDay.length; j < TASKS_PER_DAY; j++) {
        await this.create(user, d, taskPool);
      }
      d.setDate(d.getDate() + 1);
    }
  }

  async create(user: ObjectId, deadline: Date, tasks: ObjectId[]) {
    await this.planIsNotFull(user, deadline);

    const selected: ObjectId = this.choose(tasks, 1)[0];

    const plan = await this.plans.readOne({ user, deadline });

    if (!plan) {
      const _id = await this.plans.createOne({ user, deadline, tasks: [selected] });
      return { msg: "Plan created successfully!", plan: await this.plans.readOne({ _id }) };
    } else {
      plan.tasks.push(selected);
      await this.plans.updateOne({ user, deadline }, { tasks });
      return { msg: "Plan updated successfully!", plan: plan };
    }
  }

  async expireTask(user: ObjectId) {
    const curDate = this.normalizeDate(new Date());

    await this.plans.deleteMany({
      user,
      deadline: { $lt: curDate },
    });
  }

  async deleteByUser(user: ObjectId) {
    await this.plans.deleteMany({ user });
    return { msg: "Plans deleted!" };
  }

  private async planIsNotFull(user: ObjectId, deadline: Date) {
    const plan = await this.plans.readOne({ user, deadline });
    if (plan && plan.tasks.length > 2) {
      throw new AlreadyCreatedPlanError(user, deadline);
    }
  }
}

export class AlreadyCreatedPlanError extends NotAllowedError {
  constructor(
    public readonly user: ObjectId,
    public readonly deadline: Date,
  ) {
    super("{0} already has a full plan for date {1}!", user, deadline);
  }
}
