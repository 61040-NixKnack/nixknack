import { ObjectId } from "mongodb";
import { Router, getExpressRouter } from "./framework/router";

import { Achievement, Item, Plan, Point, Recommendation, Tag, Task, User, WebSession } from "./app";
import { AchievementName } from "./concepts/achievement";
import { ItemDoc } from "./concepts/item";
import { UserDoc } from "./concepts/user";
import { WebSessionDoc } from "./concepts/websession";

class Routes {
  @Router.get("/session")
  async getSessionUser(session: WebSessionDoc) {
    const user = WebSession.getUser(session);
    return await User.getUserById(user);
  }

  @Router.get("/users")
  async getUsers() {
    return await User.getUsers();
  }

  @Router.get("/users/:username")
  async getUser(username: string) {
    return await User.getUserByUsername(username);
  }

  @Router.post("/users")
  async createUser(session: WebSessionDoc, username: string, password: string) {
    WebSession.isLoggedOut(session);
    const result = await User.create(username, password);
    if (result.user) {
      await Point.create(result.user?._id);
    }
    return result;
  }

  @Router.patch("/users")
  async updateUser(session: WebSessionDoc, update: Partial<UserDoc>) {
    const user = WebSession.getUser(session);
    return await User.update(user, update);
  }

  // TODO Delete everything for user
  @Router.delete("/users")
  async deleteUser(session: WebSessionDoc) {
    const user = WebSession.getUser(session);
    WebSession.end(session);
    await Task.deleteAll({ assignee: user });
    const items = await Item.getItems({ owner: user });
    await Tag.deleteItemFromAll(items.map((item) => item._id));
    await Item.delete({ owner: user });
    await Point.deleteByUser(user);
    await Plan.deleteByUser(user);
    await Achievement.deleteUserProgress(user);
    return await User.delete(user);
  }

  @Router.post("/login")
  async logIn(session: WebSessionDoc, username: string, password: string) {
    const u = await User.authenticate(username, password);
    WebSession.start(session, u._id);
    return { msg: "Logged in!" };
  }

  @Router.post("/logout")
  async logOut(session: WebSessionDoc) {
    WebSession.end(session);
    return { msg: "Logged out!" };
  }

  /**
   * @param session current Web Session
   * @returns A list of items with only the name and id of the item.
   */
  @Router.get("/items")
  async getItems(session: WebSessionDoc) {
    const user = WebSession.getUser(session);
    const items = await Item.getItems({ owner: user });
    return items.map((item) => ({ ...item, name: item.name, id: item._id, image: item.image }));
  }

  /**
   * @param _id Item ID
   * @returns the item ItemDoc and the tags for given item ID
   */
  @Router.get("/items/:_id")
  async getItem(session: WebSessionDoc, _id: ObjectId) {
    const user = WebSession.getUser(session);
    const id = new ObjectId(_id);
    await Item.itemExists(id);
    const item = await Item.getItem(id);
    const tags = await Tag.getTags([id]);
    await Item.isOwner(user, id);
    return { owner: item?.owner, name: item?.name, lastUsedDate: item?.lastUsedDate, location: item?.location, purpose: item?.purpose, image: item?.image, tags: tags };
  }

  @Router.post("/items")
  async createItem(session: WebSessionDoc, name: string, lastUsedDate?: Date, location?: string, purpose?: string, image?: string) {
    const user = WebSession.getUser(session);
    const created = await Item.create(user, name, lastUsedDate, location, purpose, image);
    await Achievement.updateProgress(user, AchievementName.ItemsAdded, 1);
    await Point.addPoints(user, 5);
    await Achievement.updateProgress(user, AchievementName.Experience, 5);
    return { msg: created.msg, id: created.id };
  }

  @Router.patch("/items/:_id")
  async updateItem(session: WebSessionDoc, _id: ObjectId, name: string, lastUsedDate?: Date, location?: string, purpose?: string, image?: string) {
    const update = { name, lastUsedDate, location, purpose, image };
    const id = new ObjectId(_id);
    const user = WebSession.getUser(session);
    await Item.isOwner(user, id);
    return await Item.update(id, update);
  }

  @Router.delete("/items/:_id")
  async deleteItem(session: WebSessionDoc, _id: ObjectId) {
    const id = new ObjectId(_id);
    const user = WebSession.getUser(session);
    await Item.isOwner(user, id);
    await Tag.deleteItemFromAll([id]); // Delete item from all tags.
    await Task.deleteAll({ item: id });
    return Item.delete({ _id: id });
  }

  @Router.delete("/items/:_id/points")
  async discardItem(session: WebSessionDoc, _id: ObjectId) {
    const id = new ObjectId(_id);
    const user = WebSession.getUser(session);
    await Item.isOwner(user, id);
    await Tag.deleteItemFromAll([id]); // Delete item from all tags.
    await Point.addPoints(user, 10);
    await Achievement.updateProgress(user, AchievementName.Experience, 10);
    await Achievement.updateProgress(user, AchievementName.ItemsDiscarded, 1);
    if (await Task.isTask(user, id)) {
      await Point.addPoints(user, 10);
      await Achievement.updateProgress(user, AchievementName.Experience, 10);
      await Achievement.updateProgress(user, AchievementName.CompletedTasks, 1);
    }
    await Task.deleteAll({ item: id });
    return Item.delete({ _id: id });
  }

  @Router.post("/items/:_id")
  async addItemToTags(session: WebSessionDoc, _id: ObjectId, tags: string[]) {
    const id = new ObjectId(_id);
    const user = WebSession.getUser(session);
    await Item.isOwner(user, id);
    return await Tag.addItemToTags(tags, id);
  }

  @Router.delete("/items/:_id/:tag")
  async removeItemFromTag(session: WebSessionDoc, tag: string, _id: ObjectId) {
    const id = new ObjectId(_id);
    const user = WebSession.getUser(session);
    await Item.isOwner(user, id);
    return await Tag.deleteItem(tag, id);
  }

  @Router.get("/items/:_id/tags")
  async getTagsForItem(_id: ObjectId) {
    const id = new ObjectId(_id);
    return await Tag.getTags([id]);
  }

  /**
   * @param session current Web Session
   * @param tag string
   * @returns number of items the user has for a given tag
   */
  @Router.get("/items/:tag")
  async getTagItemCount(session: WebSessionDoc, tag: string) {
    const user = WebSession.getUser(session);
    const items = await Tag.getItems(tag);
    return await Item.getItemCount(user, items);
  }

  /**
   * Get the descriptive recommendation text for a tag
   * @param tag the tag to get the recommendation for
   * @returns a recommendation string
   */
  @Router.get("/recs/:tag")
  async getRecommendation(tag: string) {
    const rec = await Recommendation.getRecommendation(tag);
    return rec; // # To Do: Fix Responses, what type of information does front end want?
  }

  @Router.delete("/task/:_id")
  async completeTask(session: WebSessionDoc, _id: ObjectId) {
    const user = WebSession.getUser(session);
    const id = new ObjectId(_id);
    await Task.isAssigned(user, id);
    await Task.complete(id);
    await Tag.deleteItemFromAll([id]);
    await Item.delete({ _id: id });
    await Point.addPoints(user, 10);
    await Achievement.updateProgress(user, AchievementName.Experience, 10);
    await Achievement.updateProgress(user, AchievementName.CompletedTasks, 1);
    await Achievement.updateProgress(user, AchievementName.ItemsDiscarded, 1);
    return { msg: "Success" };
  }

  @Router.post("/plans")
  async generatePlan(session: WebSessionDoc) {
    const user = WebSession.getUser(session);
    const items = (await Item.getItems({ owner: user })).map((item) => item._id);
    // console.log(items);
    const userTags = await Tag.getTags(items);
    const itemsByTag = await Tag.itemsByTag(userTags, items);
    const taskPool: ObjectId[] = [];
    // console.log(itemsByTag);
    for (const [tag, itm] of itemsByTag) {
      // Pass tags into Recommendation in bulk and mapping for tag and recId
      const rec = (await Recommendation.getRecommendation(tag)).text;
      // Add this to Tag
      if (itm.length > ((await Tag.getTagTN(tag)) ?? 0)) {
        // Add this into Task and have it return taskPool
        for (const i of itm) {
          // console.log(i);
          const maybeTask = await Task.getTasks({ assignee: user, objective: rec, item: i }, true);
          // console.log(maybeTask);
          if (maybeTask.length !== 0) {
            // console.log("Already");
            taskPool.push(maybeTask[0] as ObjectId);
            // console.log(taskPool);
          } else {
            // console.log("assign");
            taskPool.push((await Task.assign(user, rec, i))._id);
          }
        }
      }
    }
    await Plan.populateWeekTasks(user, taskPool);
    return { msg: "Success" };
  }

  @Router.get("/plans")
  async getPlan(session: WebSessionDoc) {
    const user = WebSession.getUser(session);
    const taskIds = await Plan.getWeekTasks(user);
    const plan = await Task.getArrayTasks(taskIds);
    // console.log(plan);
    const readable = [];
    for (const date of plan) {
      const tasks = [];
      for (const task of date) {
        let name = (await Item.getItem(task.item))?.name;
        if (name === undefined) {
          name = "";
        }
        tasks.push([task.objective, task.assignee, name]);
      }
      readable.push(tasks);
    }
    // console.log("get");
    // console.log(readable);
    return readable;
  }

  @Router.get("/tags")
  async getUserTags(session: WebSessionDoc) {
    const user = WebSession.getUser(session);
    const userItems = await Item.getItems({ owner: user });
    const itemIDs = userItems.map((item) => item._id);
    const userTags = new Set(await Tag.getTags(itemIDs));
    const tags = new Set([...userTags, ...Tag.definedTags]);
    return Array.from(tags).sort();
  }

  /**
   * Gets the number of XP points a user has
   * @param session user session ObjectId
   * @returns a number representing the points
   */
  @Router.get("/points")
  async getPoints(session: WebSessionDoc) {
    const user = WebSession.getUser(session);
    return await Point.getPoints(user);
  }

  /**
   * Gets the achievements of a user
   * @param session user session ObjectId
   * @returns three maps, mapping achievement names to numbers representing the last
   * completed level of an achievement, the progress toward an achievement, and the closest [lower, upper]
   * bound thresholds of an achievement, respectively
   */
  @Router.get("/achievements")
  async getAchievementData(session: WebSessionDoc) {
    const user = WebSession.getUser(session);
    return await Achievement.getAchievementData(user);
  }
}

export default getExpressRouter(new Routes());
