import { HealthData, AzureConfig, ApiResponse } from '../types/health';

export class AzureHealthService {
    private config: AzureConfig;
    private static instance: AzureHealthService;

    private constructor(config: AzureConfig) {
        this.config = config;
    }

    public static getInstance(config?: AzureConfig): AzureHealthService {
        if (!AzureHealthService.instance && config) {
            AzureHealthService.instance = new AzureHealthService(config);
        }
        return AzureHealthService.instance;
    }

    private async callApi<T>(endpoint: string, data: any): Promise<ApiResponse<T>> {
        try {
            const response = await fetch(endpoint, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'api-key': this.config.apiKey,
                    'model-version': this.config.modelVersion
                },
                body: JSON.stringify(data)
            });

            if (!response.ok) {
                throw new Error(`API request failed: ${response.statusText}`);
            }

            return { data: await response.json() };
        } catch (error) {
            return {
                error: {
                    code: 'API_ERROR',
                    message: error instanceof Error ? error.message : 'Unknown error occurred',
                    details: error
                }
            };
        }
    }

    public async analyzeHealthData(data: HealthData): Promise<ApiResponse<any>> {
        const prompt = this.formatHealthDataPrompt(data);
        const endpoint = `${this.config.endpoint}`;

        return this.callApi(endpoint, {
            messages: [
                {
                    role: "system",
                    content: "You are a healthcare AI assistant analyzing patient health data. You graduated at the top of your class and is very meticulous. You have a warm and inviting personality. Reply as if you are with me across the table in the office but do not expect me to answer you back. You are given the following health data to analyze:"
                },
                {
                    role: "user",
                    content: prompt
                }
            ],
            temperature: 0.7,
            max_tokens: 1200
        });
    }

    private formatHealthDataPrompt(data: HealthData): string {
        return JSON.stringify({
            vitals: data.vitals,
            activity: data.activity,
            symptoms: data.symptoms,
            medications: data.medications,
            notes: data.notes
        }, null, 2);
    }

    public async getHealthRecommendations(analysis: any): Promise<string[]> {
        return analysis.recommendations || [];
    }

    public async getRiskAssessment(analysis: any): Promise<{
        level: string;
        details: string;
    }[]> {
        return analysis.risks || [];
    }
}