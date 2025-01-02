import { AzureHealthService } from "@/utils/healthAnalysis";
import { HealthData } from "@/types/health";
import { useState } from "react";

export const useAzureHealth = () => {
    const [isLoading, setIsLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);

    const azureService = AzureHealthService.getInstance({
        endpoint: process.env.NEXT_PUBLIC_AZURE_ENDPOINT!,
        apiKey: process.env.NEXT_PUBLIC_AZURE_API_KEY!,
        deploymentId: process.env.NEXT_PUBLIC_AZURE_DEPLOYMENT_ID!,
        modelVersion: process.env.NEXT_PUBLIC_AZURE_MODEL_VERSION!
    });

    const analyzeHealth = async (healthData: HealthData) => {
        setIsLoading(true);
        setError(null);

        try {
            const result = await azureService.analyzeHealthData(healthData);
            if (result.error) {
                throw new Error(result.error.message);
            }
            return result.data;
        } catch (err) {
            setError(err instanceof Error ? err.message : 'An error occurred');
            return null;
        } finally {
            setIsLoading(false);
        }
    };

    return {
        analyzeHealth,
        isLoading,
        error,
        setIsLoading
    };
};