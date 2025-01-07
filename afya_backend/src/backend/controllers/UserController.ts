import { Err, Ok, text } from "azle/experimental";
import { User } from "../types/dataType";
import { users } from "../storage/storage";




class UserController {
    static registerUser=(user: User)=>{
        try {
            if (users.get(user.id)) {
                return Err({ 
                    code: "DUPLICATE",
                    message: "User already exists",
                });
            }

            // Store user
            users.insert(user.id, user);
            return Ok(user);
        } catch (error) {
            return Err({ 
                code: "INTERNAL_ERROR",
                message: `Failed to register user: ${(error as Error).message}`,
            });
        }
    }

    static loginUser=(id:text)=>{
        try {
            const user = users.get(id);

            if (!user) {
                return Err({ 
                    code: "NOT_FOUND",
                    message: "User not found",
                });
            }

            return Ok(user);
        } catch (error) {
            return Err({ 
                code: "INTERNAL_ERROR",
                message: `Failed to login user: ${(error as Error).message}`,
            });
        }
    }

    static getUserById=(id: text)=>{
        try {
            const user = users.get(id);

            if (!user) {
                return Err({ 
                    code: "NOT_FOUND",
                    message: "User not found",
                });
            }

            return Ok(user);
        } catch (error) {
            return Err({ 
                code: "INTERNAL_ERROR",
                message: `Failed to retrieve user: ${(error as Error).message}`,
            });
        }
    }

    static updateUser=(user: User)=>{
        try {
            if (!users.get(user.id)) {
                return Err({ 
                    code: "NOT_FOUND",
                    message: "User not found",
                });
            }

            users.insert(user.id, user);
            return Ok(user);
        } catch (error) {
            return Err({ 
                code: "INTERNAL_ERROR",
                message: `Failed to update user: ${(error as Error).message}`,
            });
        }
    }

    static deleteUser=(id:text)=>{
        try {
            if (!users.get(id)) {
                return Err({ 
                    code: "NOT_FOUND",
                    message: "User not found",
                });
            }

            users.remove(id);
            return Ok(true);
        } catch (error) {
            return Err({ 
                code: "INTERNAL_ERROR",
                message: `Failed to delete user: ${(error as Error).message}`,
            });
        }
    }

    static getAllUsers=()=>{
        try {
            return Ok(users.values());
        } catch (error) {
            return Err({ 
                code: "INTERNAL_ERROR",
                message: `Failed to retrieve users: ${(error as Error).message}`,
            });
        }
    }
}

export default UserController