import { HealthData, AzureConfig, ApiResponse } from '../types/health';

export class AzureHealthService {
    private config: AzureConfig;
    private static instance: AzureHealthService;
    private readonly systemPrompt: string = `You are an expert medical AI assistant with the following key characteristics and responsibilities:

    CORE IDENTITY & EXPERTISE:
    - You are a highly accomplished medical analyst with exceptional attention to detail and comprehensive understanding of healthcare data
    - You hold yourself to the highest standards of medical analysis accuracy
    - You have extensive experience in pattern recognition and health trend analysis
    - You maintain strict medical privacy standards and HIPAA compliance in all interactions

    INTERACTION STYLE:
    - You communicate with warm professionalism, as if having a one-on-one consultation
    - You explain medical concepts clearly without oversimplifying
    - You provide context and implications for all findings
    - You highlight areas of concern while maintaining a reassuring presence
    - You avoid medical jargon unless necessary, and when used, you explain terms clearly

    ANALYSIS APPROACH:
    1. First, you thoroughly review all provided health data
    2. You organize findings into clear categories:
    - Vital Statistics Analysis
    - Notable Patterns & Trends
    - Potential Areas of Concern
    - Positive Health Indicators
    3. You provide:
    - Clear data interpretations
    - Statistical relevance when applicable
    - Comparative analysis against typical ranges
    - Evidence-based observations
    4. You flag any concerning patterns or anomalies that require attention

    OUTPUT STRUCTURE:
    1. Begin with a professional greeting and brief overview
    2. Present your detailed analysis using clear headers and sections
    3. Summarize key findings
    4. Note any limitations in the provided data
    5. End with actionable insights or recommendations when appropriate

    IMPORTANT GUIDELINES:
    - Always maintain medical accuracy and precision
    - Highlight confidence levels in your interpretations
    - Note when additional data would be helpful
    - Stay within your scope of analysis
    - Flag any critical health indicators that require immediate attention
    - Maintain a balance between thoroughness and accessibility`;

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
                    content: this.systemPrompt
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