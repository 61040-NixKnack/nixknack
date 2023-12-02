import { ObjectId } from "mongodb";
import DocCollection, { BaseDoc } from "../framework/doc";
import { NotAllowedError } from "./errors";

export interface TaskDoc extends BaseDoc {
  objective: ObjectId;
  assignee: ObjectId;
  item: ObjectId;
}

export default class TaskConcept {
  public readonly tasks = new DocCollection<TaskDoc>("tasks");

  async assign(user: ObjectId, rec: ObjectId, item: ObjectId) {
    await this.uniqueTask(user, rec, item);
    await this.tasks.createOne({ objective: rec, assignee: user, item: item });
  }

  async complete(user: ObjectId, rec: ObjectId) {
    await this.itemExists(user, rec);
    const task = await this.tasks.readOne({ assignee: user, objective: rec });
    return task?.item;
  }

  async isAssigned(user: ObjectId, rec: ObjectId, item: ObjectId) {
    const maybeTask = await this.tasks.readOne({ objective: rec, assignee: user, item: item });
    if (maybeTask !== null) {
      return true;
    }
    return false;
  }

  async deleteItem(item: ObjectId) {
    await this.tasks.deleteMany({ item });
    return { msg: `All tasks for item ${item} deleted!` };
  }

  private async uniqueTask(user: ObjectId, rec: ObjectId, item: ObjectId) {
    const maybeTask = await this.tasks.readOne({ objective: rec, assignee: user, item: item });
    if (maybeTask !== null) {
      throw new NotAllowedError(`Task for user ${user}, rec ${rec}, and item ${item} already exists!`);
    }
  }

  private async itemExists(user: ObjectId, rec: ObjectId) {
    const maybeTask = await this.tasks.readOne({ objective: rec, assignee: user });
    if (maybeTask === null) {
      throw new NotAllowedError(`Task for user ${user} and rec ${rec} does not exist!`);
    }
  }
}
