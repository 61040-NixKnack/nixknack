import { Filter, ObjectId } from "mongodb";
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
    const _id = await this.tasks.createOne({ objective: rec, assignee: user, item: item });
    return { msg: `Task for user ${user} and item ${item} with rec ${rec} successfully created`, _id: _id };
  }

  async complete(_id: ObjectId) {
    await this.itemExists(_id);
    const task = await this.tasks.readOne({ _id });
    await this.tasks.deleteOne({ _id });
    return task?.item;
  }

  async isAssigned(user: ObjectId, _id: ObjectId) {
    const maybeTask = await this.tasks.readOne({ _id: _id, assignee: user });
    if (maybeTask === null) {
      throw new NotAllowedError(`Task ${_id} is not assigned for user ${user}`);
    }
  }

  async deleteAll(query: Filter<TaskDoc>) {
    await this.tasks.deleteMany(query);
    return { msg: `All tasks with query ${query} deleted!` };
  }

  private async uniqueTask(user: ObjectId, rec: ObjectId, item: ObjectId) {
    const maybeTask = await this.tasks.readOne({ objective: rec, assignee: user, item: item });
    if (maybeTask !== null) {
      throw new NotAllowedError(`Task for user ${user}, rec ${rec}, and item ${item} already exists!`);
    }
  }

  private async itemExists(_id: ObjectId) {
    const maybeTask = await this.tasks.readOne({ _id });
    if (maybeTask === null) {
      throw new NotAllowedError(`Task ${_id} does not exist!`);
    }
  }
}
