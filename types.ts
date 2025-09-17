
export interface CloudflareAiResponse {
    result: {
        text: string;
        word_count?: number;
        words?: {
            word: string;
            start: number;
            end: number;
        }[];
    };
    success: boolean;
    errors: any[];
    messages: any[];
}
