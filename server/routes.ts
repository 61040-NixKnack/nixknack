import { ObjectId } from "mongodb";
import { Router, getExpressRouter } from "./framework/router";

import { Item, Point, Recommendation, Tag, User, WebSession } from "./app";
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
    return await User.create(username, password);
  }

  @Router.patch("/users")
  async updateUser(session: WebSessionDoc, update: Partial<UserDoc>) {
    const user = WebSession.getUser(session);
    return await User.update(user, update);
  }

  @Router.delete("/users")
  async deleteUser(session: WebSessionDoc) {
    const user = WebSession.getUser(session);
    WebSession.end(session);
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
    return items.map((item) => ({ ...item, name: item.name, id: item._id }));
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
    const tags = await Tag.getTags(id);
    await Item.isOwner(user, id);
    return { owner: item?.owner, name: item?.name, lastUsedDate: item?.lastUsedDate, location: item?.location, purpose: item?.purpose, tags: tags };
  }

  @Router.post("/items")
  async createItem(session: WebSessionDoc, name: string, lastUsedDate?: Date, location?: string, purpose?: string) {
    const user = WebSession.getUser(session);
    const created = await Item.create(user, name, lastUsedDate, location, purpose);
    return { msg: created.msg };
  }

  @Router.patch("/items/:_id")
  async updateItem(session: WebSessionDoc, _id: ObjectId, update: Partial<ItemDoc>) {
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
    await Tag.deleteItemFromAll(id); // Delete item from all tags.
    return Item.delete(id);
  }

  @Router.post("/items/:_id/:tags")
  async addItemToTags(session: WebSessionDoc, tags: string[], _id: ObjectId) {
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

  @Router.post("/plans")
  async generatePlan(session: WebSessionDoc) {
    const user = WebSession.getUser(session);
    const items = (await Item.getItems({ owner: user })).map((item) => item._id);
    const userTags = await Tag.getTags(items);
    const itemsByTag = await Tag.itemsByTag(userTags, items);

    const recPool = [];

    for (const [tag, itm] of itemsByTag) {
      const rec = Recommendation.getRecommendation(tag);
      if (itm.length > ((await Tag.getTagTN(tag)) ?? 0)) {
        recPool.push(...itm.map((i) => `${i}: ${rec}`));
        // Do stuff with Task
      }
    }
  }

  @Router.patch("/points")
  async addPointsAchievement(session: WebSessionDoc, quantity: number) {
    const user = WebSession.getUser(session);
    await Point.addPoints(user, quantity);
    // TODO: Add achievement
  }
}

export default getExpressRouter(new Routes());
