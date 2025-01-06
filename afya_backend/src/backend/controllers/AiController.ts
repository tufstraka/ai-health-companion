import { Err, Ok } from "azle/experimental";
import { aiPredictions } from "../storage/storage";


class AiController {
   static getAllPredictions=()=>{
    try {
        return Ok(aiPredictions.values());
    } catch (error) {
        return Err({ 
            code: "INTERNAL_ERROR",
            message: `Failed to retrieve predictions: ${(error as Error).message}`,
        });
    }
   }
}

export default AiController