import ItemConcept from "./concepts/item";
import RecommendationConcept from "./concepts/recommendation";
import TagConcept from "./concepts/tag";
import TaskConcept from "./concepts/task";
import UserConcept from "./concepts/user";
import WebSessionConcept from "./concepts/websession";

// App Definition using concepts
export const WebSession = new WebSessionConcept();
export const User = new UserConcept();
export const Item = new ItemConcept();
export const Recommendation = new RecommendationConcept();
export const Tag = new TagConcept();
export const Task = new TaskConcept();
