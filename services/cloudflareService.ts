
import { CloudflareAiResponse } from '../types';

export const transcribeAudio = async (
    accountId: string,
    apiToken: string,
    audioFile: File
): Promise<string> => {
    const model = '@cf/openai/whisper-large-v3-turbo';
    const url = `https://api.cloudflare.com/client/v4/accounts/${accountId}/ai/run/${model}`;

    const audioData = await audioFile.arrayBuffer();

    const response = await fetch(url, {
        method: 'POST',
        headers: {
            'Authorization': `Bearer ${apiToken}`,
            'Content-Type': 'application/octet-stream', 
        },
        body: audioData,
    });

    if (!response.ok) {
        let errorMessage = `API Error: ${response.status} ${response.statusText}`;
        try {
            const errorBody = await response.json();
            errorMessage += `\nDetails: ${JSON.stringify(errorBody.errors, null, 2)}`;
        } catch (e) {
            // Could not parse error body as JSON
        }
        throw new Error(errorMessage);
    }

    const result: CloudflareAiResponse = await response.json();

    if (!result.success || !result.result || !result.result.text) {
        throw new Error('Failed to transcribe audio. The API response was not successful or did not contain text.');
    }

    return result.result.text;
};
