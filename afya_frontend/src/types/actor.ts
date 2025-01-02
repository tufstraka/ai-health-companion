export interface User {
  id: string;
  username: string;
  email: string;
}

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
  id: string;
  userId: string;
  timestamp: string;
  vitals: VitalSigns;
  activity: ActivityMetrics;
  professional: Professional;
  symptoms: string[];
  medications: string[];
  notes: string;
}

export interface AIPrediction {
  id: string;
  healthDataId: string;
  prediction: string;
  confidence: string;
  modelId: string;
  timestamp: string;
}

export interface HealthRisk {
  id: string;
  userId: string;
  riskLevel: string;
  category: string;
  description: string;
  recommendations: string[];
  timestamp: string;
}

export interface HealthTrend {
  id: string;
  userId: string;
  metric: string;
  trend: string;
  analysis: string;
  period: string;
  timestamp: string;
}

export interface HealthAdvice {
  id: string;
  userId: string;
  timestamp: string;
  analysis: string;
  riskLevel: string;
  recommendedActions: string[];
  aiGeneratedInsights: string;
  alerts: string[];
  modelReference: string;
}

export interface Error {
  code: string;
  message: string;
}

export interface HealthAnalytics {
  predictions: AIPrediction[];
  risks: HealthRisk[];
  trends: HealthTrend[];
  advice: HealthAdvice[];
}

export interface Professional {
    ecgReadings: string;
    bloodWork: string;
    urinalysis: string;
    imaging: string;
}
      

export interface SystemStats {
  totalRecords: bigint;
  totalPredictions: bigint;
  totalUsers: bigint;
  aiModelVersion: string;
}

export interface BackendService {
  deleteUser(id: string): Promise<{ Ok: boolean } | { Err: Error }>;
  getHealthAnalytics(timeRange: string): Promise<{ Ok: HealthAnalytics } | { Err: Error }>;
  getHealthDataById(id: string): Promise<{ Ok: HealthData } | { Err: Error }>;
  getSystemStats(): Promise<{ Ok: SystemStats } | { Err: Error }>;
  getUserById(id: string): Promise<{ Ok: User } | { Err: Error }>;
  registerUser(user: User): Promise<{ Ok: User } | { Err: Error }>;
  loginUser(principal: string): Promise<{ Ok: User } | { Err: Error }>;
  saveAIAnalysis(prediction: AIPrediction): Promise<{ Ok: AIPrediction } | { Err: Error }>;
  saveHealthData(data: HealthData): Promise<{ Ok: HealthData } | { Err: Error }>;
  updateUser(user: User): Promise<{ Ok: User } | { Err: Error }>;
}