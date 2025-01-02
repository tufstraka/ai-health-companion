export interface VitalSigns {
    heartRate: string;
    bloodPressure: string;
    temperature: string;
    oxygenLevel: string;
    respiratoryRate: string;
    glucose: string;
}

export interface ActivityMetrics {
    steps: string;
    sleepHours: string;
    activeMinutes: string;
}

export interface HealthData {
    id?: string;
    userId?: string;
    timestamp?: string;
    vitals: VitalSigns;
    activity: ActivityMetrics;
    symptoms: string[];
    medications: string[];
    notes: string;
}

export interface AzureConfig {
    endpoint: string;
    apiKey: string;
    deploymentId: string;
    modelVersion: string;
}


export interface ApiResponse<T> {
    data?: T;
    error?: {
        code: string;
        message: string;
        details?: any;
    };
}