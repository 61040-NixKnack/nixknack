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
    return await User.create(username, password);
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
    await Tag.deleteItemFromAll([id]); // Delete item from all tags.
    await Task.deleteAll({ item: id });
    return Item.delete({ _id: id });
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

  @Router.delete("/task/:_id")
  async completeTask(session: WebSessionDoc, _id: ObjectId) {
    const user = WebSession.getUser(session);
    const id = new ObjectId(_id);
    await Task.isAssigned(user, id);
    const item = await Task.complete(id);
    if (item) {
      await Tag.deleteItemFromAll([item]);
      await Item.delete({ _id: item });
    }
    await Point.addPoints(user, 10);
    await Achievement.updateProgress(user, AchievementName.CompletedTasks, 1);
  }

  @Router.post("/plans")
  async generatePlan(session: WebSessionDoc) {
    const user = WebSession.getUser(session);
    const items = (await Item.getItems({ owner: user })).map((item) => item._id);
    const userTags = await Tag.getTags(items);
    const itemsByTag = await Tag.itemsByTag(userTags, items);

    const taskPool = [];

    for (const [tag, itm] of itemsByTag) {
      // Pass tags into Recommendation in bulk and mapping for tag and recId
      const recId = (await Recommendation.getRecommendation(tag))._id;
      // Add this to Tag
      if (itm.length > ((await Tag.getTagTN(tag)) ?? 0)) {
        // Add this into Task and have it return taskPool
        for (const i of itm) {
          const maybeTask = await Task.getTasks({ user, rec: recId, item: i }, true);
          let taskId = undefined;
          if (maybeTask) {
            taskId = maybeTask[0];
          } else {
            taskId = (await Task.assign(user, recId, i))._id;
          }
          taskPool.push(taskId);
        }
      }
    }

    // Make this a function in Plan

    // Start 7 days ahead
    // let d = new Date();
    // d = Plan.normalizeDate(d);
    // d.setDate(d.getDate() + 6);

    // // Current date
    // let minDate = new Date();
    // minDate = Plan.normalizeDate(minDate);

    // while (d >= minDate && !(await Plan.getTasksAtDate(user, d))) {
    //   await Plan.create(user, d, taskPool as ObjectId[]);
    //   d.setDate(d.getDate() - 1);
    // }
  }

  @Router.get("/plans")
  async getPlan(session: WebSessionDoc) {
    const user = WebSession.getUser(session);
    const taskIds = await Plan.getWeekTasks(user);
    const plan = await Task.getArrayTasks(taskIds);
    return plan;
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

  /**
   * Call once when setting up the app. Sets the threshold values for each tag.
   */
  @Router.get("/init")
  async init() {
    const arr = [
      ["Cookware", 5],
      ["Utensils", 7],
      ["Kitchen Tools", 6],
      ["Dishes", 8],
      ["Glassware", 6],
      ["Small Appliances", 2],
      ["Tupperware", 8],
      ["Tops (Clothing)", 7],
      ["Bottoms (Clothing)", 6],
      ["Sweaters, Sweatshirts & Hoodies", 4],
      ["Coats & Jackets", 2],
      ["Shoes", 4],
      ["Jewelry", 10],
      ["Hats", 3],
      ["Undergarments", 15],
      ["Accessories (Clothing)", 8],
      ["Other (Clothing)", 10],
      ["Bedding", 3],
      ["Furniture", 30],
      ["Electronics", 10],
      ["Books & Magazines", 20],
      ["Decor", 15],
      ["Toiletries", 20],
      ["Makeup & Skincare", 20],
      ["Towels", 16],
      ["Cleaning Supplies", 10],
      ["Office Supplies", 15],
      ["Paper", 20],
      ["Sports Equipment", 5],
      ["Toys & Games", 15],
      ["CDs, DVDs & Tapes", 20],
      ["Hand Tools & Workshop Supplies", 10],
      ["Sentimental", 0],
      ["Weaponry", 3],
    ];

    for (const [tag, tn] of arr) {
      await Tag.create(tag as string, tn as number);
    }

    const achievements = [
      ["exp", [0, 50, 100, 250, 500, 1000, 2000, 3000, 5000, 7500, 10000]],
      ["added", [0, 1, 5, 10, 20, 50, 100, 200, 500, 1000]],
      ["discarded", [0, 1, 5, 10, 20, 50, 100, 200, 500]],
      ["tasks", [0, 5, 20, 50, 100, 250, 500, 1000, 2000, 4000]],
    ];

    for (const [name, thresholds] of achievements) {
      await Achievement.create(name as string, thresholds as Array<number>);
    }

    const recs = [
      ["Cookware", "Donate it to charity (e.g. Goodwill, Salvation Army), resell it at your local scrapyard, or recycle it with TerraCycle"],
      ["Utensils", "PLASTIC: Throw it out.\n\nMETAL: Sell it to your local scrapyard, donate it to charity (e.g. a homeless shelter, Habitat for Humanity)"],
      ["Kitchen Tools", "Donate it to charity (e.g. a local food pantry, Goodwill, the Salvation Army, Habitat for Humanity)"],
      [
        "Dishes",
        "VINTAGE CHINA: Upcycle it with a DIY project, sell it online.\n\nOTHER CERAMICS: Donate it to charity (e.g. a homeless shelter, Habitat for Humanity) or throw it out.\n\nBROKEN CERAMICS/GLASS: Wrap it in newspaper or cloth, stuff it in a sealed box labeled “Broken Glass” and throw it out.",
      ],
      [
        "Glassware",
        "NON-BROKEN ONLY: If it’s reusable, donate it. Otherwise, dispose of it. Jars and bottles are recyclable, non-container glass must be thrown out.\n\nBROKEN GLASS: Wrap it in newspaper or cloth, stuff it in a sealed box labeled “Broken Glass” and throw it out.",
      ],
      ["Small Appliances", "Sell it or donate it to charity (e.g. Habitat ReStore, the Salvation Army)"],
      ["Tupperware", "Donate it to charity (e.g. Goodwill, the Salvation Army, Habitat for Humanity. GreenDrop)"],
      ["Tops (Clothing)", "Donate it to charity (e.g. American Red Cross, the Salvation Army, Goodwill)"],
      ["Bottoms (Clothing)", "Donate it to charity (e.g. American Red Cross, the Salvation Army, Goodwill)"],
      ["Sweaters, Sweatshirts & Hoodies", "Donate it to charity (e.g. American Red Cross, the Salvation Army, Goodwill)"],
      ["Coats & Jackets", "Donate it to charity (e.g. American Red Cross, the Salvation Army, Goodwill)"],
      ["Shoes", "Donate it to charity (e.g. American Red Cross, the Salvation Army, Goodwill)"],
      ["Jewelry", "Sell it at your local jewelry store, pawn shop, or gold buyer"],
      ["Hats", "Donate it to charity (e.g. American Red Cross, the Salvation Army, Goodwill)"],
      ["Undergarments", "Donate it to a fabric recycling program (e.g. Subset, Fabscrap, Second Life)"],
      ["Accessories (Clothing)", "Donate it to charity (e.g. American Red Cross, the Salvation Army, Goodwill)"],
      ["Other (Clothing)", "Donate it to charity (e.g. American Red Cross, the Salvation Army, Goodwill"],
      [
        "Bedding",
        "If clean and stain-free, donate it to charity (e.g. the Salvation Army, Goodwill, an animal shelter). Otherwise, recycle it (e.g. the American Textile Recycling Service, TerraCycle).",
      ],
      ["Furniture", "Sell it, either through a garage sale, at a pawn shop, or online. Or, donate it to charity (e.g. Habitat for Humanity, a furniture bank)"],
      ["Electronics", "Recycle it with an e-waste program (e.g. Best Buy, Staples, Walmart CExchange)"],
      [
        "Books & Magazines",
        "Sell it at a second-hand bookstore, donate it to your local library or school, or a donation program (e.g. Little Free Library, DonationTown, Books for Africa), or recycle it.",
      ],
      ["Decor", "Sell it, or otherwise dispose of it (check Earth911 for potential recycling methods)"],
      ["Toiletries", "Throw it out"],
      ["Makeup & Skincare", "Throw it out"],
      [
        "Towels",
        "If clean and stain-free, donate it to charity (e.g. the Salvation Army, Goodwill, an animal shelter). Otherwise, recycle it (e.g. the American Textile Recycling Service, TerraCycle).",
      ],
      ["Cleaning Supplies", "Throw it out"],
      ["Office Supplies", "Donate it to charity (e.g. Develop Africa, Vietnam Veterans of America, Goodwill)"],
      ["Paper", "Recycle it"],
      ["Sports Equipment", "Sell it or donate it to your local youth league"],
      ["Toys & Games", "Donate it to your local fire department or police station, a children’s home, or a charity (e.g. Toys for Tots, Goodwill, Salvation Army)"],
      ["CDs, DVDs & Tapes", "Donate them to a second-hand store or music reseller, or recycle it with a specialized company (e.g. CD Recycling Center of America, GreenDisk)"],
      ["Hand Tools & Workshop Supplies", "Donate it to charity (e.g. Habitat for Humanity, the Salvation Army, Goodwill). Or, if the manufacturer has a recycling program, recycle it."],
      ["Sentimental", "Store it in your garage or a storage facility"],
      ["Weaponry", "Dispose of it with your local law enforcement or sell it"],
      ["!msc", "Throw it out or recycle if possible (check Earth911 for potential recycling methods)"],
    ];

    for (const [tag, r] of recs) {
      await Recommendation.create(tag as string, r as string);
    }
  }
}

export default getExpressRouter(new Routes());
