import {
    Canister,
    nat64,
    Opt,
    query,
    StableBTreeMap,
    text,
    update,
    Vec,
    Result,
    Record,
    ic,
    Ok,
    Err,
    bool
} from 'azle/experimental';
import { v4 as uuidv4 } from 'uuid';


const VitalSigns = Record({
    heartRate: text,
    bloodPressure: text,
    temperature: text,
    oxygenLevel: text,
    respiratoryRate: text,
    glucose: text
});

const ActivityMetrics = Record({
    steps: text,
    sleepHours: text,
    activeMinutes: text,
});

const Professional  = Record({
    ecgReadings: text,
    bloodWork: text,
    urinalysis: text,
    imaging: text,
}) 

const HealthData = Record({
    id: text,
    userId: text,
    timestamp: text,
    vitals: VitalSigns,
    activity: ActivityMetrics,
    professional: Professional,
    symptoms: Vec(text),
    medications: Vec(text),
    notes: text
});

const AIPrediction = Record({
    id: text,
    healthDataId: text,
    prediction: text,
    confidence: text,
    modelId: text,
    timestamp: text
});

const Error = Record({
    code: text,
    message: text,
});

const User = Record({
    id: text,
    username: text,
    email: text,
});

const healthRecords = StableBTreeMap(0, text, HealthData);
const users = StableBTreeMap(2, text, User);
const aiPredictions = StableBTreeMap(4, text, AIPrediction);


export default Canister({

    // User Routes
    registerUser: update([User], Result(User, Error), (user) => {
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
    }),

    loginUser: query([text], Result(User, Error), (id) => {
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
    ),

    getUserById: query([text], Result(User, Error), (id) => {
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
    }),


    updateUser: update([User], Result(User, Error), (user) => {
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
    ),

    deleteUser: update([text], Result(bool, Error), (id) => {
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
    ),

    
    // Health Data Management Routes

    /**
     * Save health data record
     * @param {HealthData} data - Health data record
     * @returns {Result<HealthData, Error>}
     */ 
    saveHealthData: update([HealthData], Result(HealthData, Error), async (data) => {
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
    }),

    /**
     * Save AI analysis prediction
     * @param {AIPrediction} prediction - AI prediction data
     * @returns {Result<AIPrediction, Error>}
     */
    saveAIAnalysis: update([AIPrediction], Result(AIPrediction, Error), (prediction) => {
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
    }),

    // Health Data Query Routes

    /**
     * Get health data record by ID
     * @param {text} id - Health data record ID
     * @returns {Result<HealthData, Error>}
     */
    getHealthDataById: query([text], Result(HealthData, Error), (id) => {
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
    }),

    /**
     * Get all health data records for the current user
     * @returns {Result<Vec<HealthData>, Error>}
     * 
     */ 
    getAllHealthData: query([], Result(Vec(HealthData), Error), () => {
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
    ),

    // Utility Routes
    getSystemStats: query([], Result(Record({
        totalRecords: nat64,
        totalPredictions: nat64,
        totalUsers: nat64,
    }), Error), () => {
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
    }),

    getAllUsers: query([], Result(Vec(User), Error), () => {
        try {
            return Ok(users.values());
        } catch (error) {
            return Err({ 
                code: "INTERNAL_ERROR",
                message: `Failed to retrieve users: ${(error as Error).message}`,
            });
        }
    }),

    getAllPredictions: query([], Result(Vec(AIPrediction), Error), () => {
        try {
            return Ok(aiPredictions.values());
        } catch (error) {
            return Err({ 
                code: "INTERNAL_ERROR",
                message: `Failed to retrieve predictions: ${(error as Error).message}`,
            });
        }
    }),

});

function validateUser(userId: text): boolean {
    return users.get(userId) !== undefined;
}