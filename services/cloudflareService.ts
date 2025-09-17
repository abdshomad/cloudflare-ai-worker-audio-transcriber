import { CloudflareAiResponse } from '../types';

// Use a chunk size slightly smaller than the 25MB limit to be safe.
const CHUNK_SIZE = 24 * 1024 * 1024; // 24MB

const transcribeChunk = async (
    accountId: string,
    apiToken: string,
    model: string,
    chunk: ArrayBuffer
): Promise<string> => {
    const url = `https://api.cloudflare.com/client/v4/accounts/${accountId}/ai/run/${model}`;
    
    const response = await fetch(url, {
        method: 'POST',
        headers: {
            'Authorization': `Bearer ${apiToken}`,
            'Content-Type': 'application/octet-stream',
        },
        body: chunk,
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
        throw new Error('Failed to transcribe chunk. The API response was not successful or did not contain text.');
    }

    return result.result.text;
};


export const transcribeAudio = async (
    accountId: string,
    apiToken: string,
    audioFile: File,
    onProgress: (message: string) => void
): Promise<string> => {
    const model = '@cf/openai/whisper-large-v3-turbo';
    
    onProgress('Preparing audio data...');
    const audioData = await audioFile.arrayBuffer();

    if (audioData.byteLength <= CHUNK_SIZE) {
        onProgress('Audio is small, transcribing in a single request...');
        return await transcribeChunk(accountId, apiToken, model, audioData);
    }

    onProgress('Audio is large, preparing chunks...');
    const chunks: ArrayBuffer[] = [];
    for (let i = 0; i < audioData.byteLength; i += CHUNK_SIZE) {
        const chunk = audioData.slice(i, i + CHUNK_SIZE);
        chunks.push(chunk);
    }

    let fullTranscript = '';
    for (let i = 0; i < chunks.length; i++) {
        onProgress(`Transcribing chunk ${i + 1} of ${chunks.length}...`);
        try {
            const transcript = await transcribeChunk(accountId, apiToken, model, chunks[i]);
            fullTranscript += transcript + ' ';
        } catch (error: any) {
            console.error(`Error transcribing chunk ${i + 1}:`, error);
            throw new Error(`Failed to transcribe chunk ${i + 1}. ${error.message}`);
        }
    }

    onProgress('Transcription complete!');
    return fullTranscript.trim();
};