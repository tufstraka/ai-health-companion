import { Err, ic, Ok, text } from "azle/experimental";
import { v4 as uuidv4 } from 'uuid';
import { AIPrediction, HealthData } from "../types/dataType"
import { validateUser } from "../utils/validateUser";
import { aiPredictions, healthRecords, users } from "../storage/storage";


class HealthController {
  static saveHealthData=(data:HealthData)=>{
    try {
        const userId = ic.caller().toString();
        
        if (!validateUser(userId)) {
            return Err({ 
                code: "AUTH_ERROR",
                message: "User not authenticated",
            });
        }

        const id = uuidv4();
        const timestamp = Date.now().toString();
        
        const healthData = {
            ...data,
            id,
            userId,
            timestamp
        };

        healthRecords.insert(id, healthData);
        return Ok(healthData);


        } catch (error) {
        return Err({ 
            code: "INTERNAL_ERROR",
            message: `Failed to process health data: ${(error as Error).message}`,
        });
    }
  }

  static saveAIAnalysis=(prediction:AIPrediction)=>{
    try {
        const userId = ic.caller().toString();
        
        if (!validateUser(userId)) {
            return Err({ 
                code: "AUTH_ERROR",
                message: "User not authenticated",
            });
        }

        aiPredictions.insert(prediction.id, prediction);
        return Ok(prediction);
    } catch (error) {
        return Err({ 
            code: "INTERNAL_ERROR",
            message: `Failed to store AI prediction: ${(error as Error).message}`,
        });
    }
  }

  static getHealthDataById=(id: text)=>{
    try {
        const userId = ic.caller().toString();
        const record = healthRecords.get(id);

        if (!record) {
            return Err({ 
                code: "NOT_FOUND",
                message: "Health record not found",
            });
        }

        if (record.userId !== userId) {
            return Err({ 
                code: "AUTH_ERROR",
                message: "Unauthorized to access this record",
            });
        }

        return Ok(record);
    } catch (error) {
        return Err({ 
            code: "INTERNAL_ERROR",
            message: `Failed to retrieve health record: ${(error as Error).message}`,
        });
    } 
  }

  static getAllHealthData=()=>{
    try {
        const userId = ic.caller().toString();
        const records = healthRecords.values()
            .filter(record => record.userId === userId);

        return Ok(records);
    } catch (error) {
        return Err({ 
            code: "INTERNAL_ERROR",
            message: `Failed to retrieve health records: ${(error as Error).message}`,
        });
    }
  }

  static getSystemStats=()=>{
    try {
        return Ok({
            totalRecords: healthRecords.len(),
            totalPredictions: aiPredictions.len(),
            totalUsers: users.len(),
        });
    } catch (error) {
        return Err({ 
            code: "INTERNAL_ERROR",
            message: `Failed to retrieve system stats: ${(error as Error).message}`,
        });
    }
  }
}

export default HealthController