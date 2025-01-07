import { nat64, Record, text, Vec } from "azle/experimental";

export const VitalSigns = Record({
    heartRate: text,
    bloodPressure: text,
    temperature: text,
    oxygenLevel: text,
    respiratoryRate: text,
    glucose: text
});

export type VitalSigns = typeof VitalSigns.tsType

export const ActivityMetrics = Record({
    steps: text,
    sleepHours: text,
    activeMinutes: text,
});
export type ActivityMetrics = typeof ActivityMetrics.tsType

export const Professional  = Record({
    ecgReadings: text,
    bloodWork: text,
    urinalysis: text,
    imaging: text,
}) 
export type Professional = typeof Professional.tsType
export const HealthData = Record({
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
export type HealthData = typeof HealthData.tsType
export const AIPrediction = Record({
    id: text,
    healthDataId: text,
    prediction: text,
    confidence: text,
    modelId: text,
    timestamp: text
});
export type AIPrediction = typeof AIPrediction.tsType

export const Error = Record({
    code: text,
    message: text,
});
export type Error = typeof Error.tsType

export const User = Record({
    id: text,
    username: text,
    email: text,
});
export type User = typeof User.tsType

export const Statistics =Record({
    totalRecords: nat64,
    totalPredictions: nat64,
    totalUsers: nat64,
})
export type Statistics = typeof Statistics.tsType