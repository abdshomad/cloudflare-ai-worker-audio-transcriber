import { CloudflareAiResponse } from '../types';

const transcribeChunk = async (
    accountId: string,
    apiToken: string,
    model: string,
    chunk: ArrayBuffer,
    signal: AbortSignal
): Promise<string> => {
    const url = `https://api.cloudflare.com/client/v4/accounts/${accountId}/ai/run/${model}`;
    
    const response = await fetch(url, {
        method: 'POST',
        headers: {
            'Authorization': `Bearer ${apiToken}`,
            'Content-Type': 'application/octet-stream',
        },
        body: chunk,
        signal,
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
    onProgress: (progress: { message: string; percentage: number }) => void,
    chunkSizeInBytes: number,
    signal: AbortSignal
): Promise<string> => {
    const model = '@cf/openai/whisper-large-v3-turbo';
    
    onProgress({ message: 'Preparing audio data...', percentage: 0 });
    const audioData = await audioFile.arrayBuffer();

    if (signal.aborted) throw new DOMException('Aborted', 'AbortError');

    if (audioData.byteLength <= chunkSizeInBytes) {
        onProgress({ message: 'Audio is small, transcribing in a single request...', percentage: 10 });
        const result = await transcribeChunk(accountId, apiToken, model, audioData, signal);
        onProgress({ message: 'Transcription complete!', percentage: 100 });
        return result;
    }

    onProgress({ message: 'Audio is large, preparing chunks...', percentage: 5 });
    const chunks: ArrayBuffer[] = [];
    for (let i = 0; i < audioData.byteLength; i += chunkSizeInBytes) {
        const chunk = audioData.slice(i, i + chunkSizeInBytes);
        chunks.push(chunk);
    }

    let fullTranscript = '';
    for (let i = 0; i < chunks.length; i++) {
        if (signal.aborted) throw new DOMException('Aborted', 'AbortError');
        
        // Allocate 90% of the progress bar to the chunk transcriptions
        const percentage = 5 + Math.round(((i + 1) / chunks.length) * 90);
        onProgress({ message: `Transcribing chunk ${i + 1} of ${chunks.length}...`, percentage });
        
        try {
            const transcript = await transcribeChunk(accountId, apiToken, model, chunks[i], signal);
            fullTranscript += transcript + ' ';
        } catch (error: any) {
            if (error.name === 'AbortError') throw error;
            console.error(`Error transcribing chunk ${i + 1}:`, error);
            throw new Error(`Failed to transcribe chunk ${i + 1}. ${error.message}`);
        }
    }

    onProgress({ message: 'Transcription complete!', percentage: 100 });
    return fullTranscript.trim();
};