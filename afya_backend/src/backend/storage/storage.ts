import { text, StableBTreeMap } from "azle/experimental";
import { AIPrediction, HealthData, User } from "../dataType/dataType";



const healthRecords = StableBTreeMap(0, text, HealthData);
const users = StableBTreeMap(2, text, User);
const aiPredictions = StableBTreeMap(4, text, AIPrediction);

export {
    healthRecords,
    users,
    aiPredictions
}