import { text } from "azle/experimental";
import { users } from "../storage/storage";

export function validateUser(userId: text): boolean {
    return users.get(userId) !== undefined;
}