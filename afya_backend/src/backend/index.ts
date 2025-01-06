import {
    Canister,
    query,
    text,
    update,
    Vec,
    Result,
    bool
} from 'azle/experimental';
import { AIPrediction, Error, HealthData, Statistics, User } from './dataType/dataType';
import UserController from './controllers/UserController';
import HealthController from './controllers/HealthController';
import AiController from './controllers/AiController';






export default Canister({

    // User Routes
    registerUser: update([User], Result(User, Error), (user) => {
      return UserController.registerUser(user)
    }),

    loginUser: query([text], Result(User, Error), (id) => {
     return UserController.loginUser(id)
    }
    ),

    getUserById: query([text], Result(User, Error), (id) => {
      return UserController.getUserById(id)
    }),


    updateUser: update([User], Result(User, Error), (user) => {
      return UserController.updateUser(user)
    }
    ),

    deleteUser: update([text], Result(bool, Error), (id) => {
       return UserController.deleteUser(id)
    }
    ),

    
    // Health Data Management Routes

    /**
     * Save health data record
     * @param {HealthData} data - Health data record
     * @returns {Result<HealthData, Error>}
     */ 
    saveHealthData: update([HealthData], Result(HealthData, Error), async (data) => {
      return HealthController.saveHealthData(data)
    }),

    /**
     * Save AI analysis prediction
     * @param {AIPrediction} prediction - AI prediction data
     * @returns {Result<AIPrediction, Error>}
     */
    saveAIAnalysis: update([AIPrediction], Result(AIPrediction, Error), (prediction) => {
       return HealthController.saveAIAnalysis(prediction)
    }),

    // Health Data Query Routes

    /**
     * Get health data record by ID
     * @param {text} id - Health data record ID
     * @returns {Result<HealthData, Error>}
     */
    getHealthDataById: query([text], Result(HealthData, Error), (id) => {
      return HealthController.getHealthDataById(id)
    }),

    /**
     * Get all health data records for the current user
     * @returns {Result<Vec<HealthData>, Error>}
     * 
     */ 
    getAllHealthData: query([], Result(Vec(HealthData), Error), () => {
        return HealthController.getAllHealthData()
    }
    ),

    // Utility Routes
    getSystemStats: query([], Result((Statistics), Error), () => {
      return HealthController.getSystemStats()
    }),
    getAllUsers: query([], Result(Vec(User), Error), () => {
      return UserController.getAllUsers()
    }),

    getAllPredictions: query([], Result(Vec(AIPrediction), Error), () => {
       return AiController.getAllPredictions()
    }),

});

