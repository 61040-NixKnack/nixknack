import { Filter, ObjectId } from "mongodb";
import DocCollection, { BaseDoc } from "../framework/doc";
import { NotAllowedError } from "./errors";

export interface TaskDoc extends BaseDoc {
  objective: string;
  assignee: ObjectId;
  item: ObjectId;
}

export default class TaskConcept {
  public readonly tasks = new DocCollection<TaskDoc>("tasks");

  async assign(user: ObjectId, rec: string, item: ObjectId) {
    await this.uniqueTask(user, rec, item);
    const _id = await this.tasks.createOne({ objective: rec, assignee: user, item: item });
    return { msg: `Task for user ${user} and item ${item} with rec ${rec} successfully created`, _id: _id };
  }

  async complete(_id: ObjectId) {
    await this.itemExists(_id);
    await this.tasks.deleteOne({ item: _id });
  }

  async isAssigned(user: ObjectId, _id: ObjectId) {
    const maybeTask = await this.tasks.readOne({ item: _id, assignee: user });
    if (maybeTask === null) {
      throw new NotAllowedError(`Task ${_id} is not assigned for user ${user}`);
    }
  }

  async isTask(user: ObjectId, _id: ObjectId) {
    const maybeTask = await this.tasks.readOne({ item: _id, assignee: user });
    if (maybeTask === null) {
      return false;
    }
    return true;
  }

  async getArrayTasks(ids: ObjectId[][]) {
    const tasks = new Array<Promise<TaskDoc[]>>();
    for (const id of ids) {
      tasks.push(this.getTasks({ _id: { $in: id } }, false) as Promise<TaskDoc[]>);
    }
    return await Promise.all(tasks);
  }

  /**
   * @param query MongoDB query
   * @param id if true only return task ids
   * @returns array of tasks that satisfy query
   */
  async getTasks(query: Filter<TaskDoc>, id: boolean) {
    const tasks = await this.tasks.readMany(query);
    if (id) {
      return tasks.map((task) => task._id);
    }
    return tasks;
  }

  async deleteAll(query: Filter<TaskDoc>) {
    await this.tasks.deleteMany(query);
    return { msg: `All tasks with query ${query} deleted!` };
  }

  private async uniqueTask(user: ObjectId, rec: string, item: ObjectId) {
    const maybeTask = await this.tasks.readOne({ objective: rec, assignee: user, item: item });
    if (maybeTask !== null) {
      throw new NotAllowedError(`Task for user ${user}, rec ${rec}, and item ${item} already exists!`);
    }
  }

  private async itemExists(_id: ObjectId) {
    const maybeTask = await this.tasks.readOne({ item: _id });
    if (maybeTask === null) {
      throw new NotAllowedError(`Task ${_id} does not exist!`);
    }
  }
}
