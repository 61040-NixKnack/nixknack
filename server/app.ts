import ItemConcept from "./concepts/item";
import RecommendationConcept from "./concepts/recommendation";
import UserConcept from "./concepts/user";
import WebSessionConcept from "./concepts/websession";

// App Definition using concepts
export const WebSession = new WebSessionConcept();
export const User = new UserConcept();
export const Item = new ItemConcept();
export const Recommendation = new RecommendationConcept();
