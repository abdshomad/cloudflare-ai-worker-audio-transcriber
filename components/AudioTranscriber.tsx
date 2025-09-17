import React, { useState, useCallback, useRef, useEffect } from 'react';
import { transcribeAudio } from '../services/cloudflareService';
import Loader from './Loader';
import { UploadIcon, FileAudioIcon, XCircleIcon } from './icons';

interface AudioTranscriberProps {
    accountId: string;
    apiToken: string;
    onResetCredentials: () => void;
}

const MAX_FILE_SIZE = 200 * 1024 * 1024; // 200MB
const MIN_SIZE_FOR_CHUNKING = 5 * 1024 * 1024; // 5MB

const CHUNK_OPTIONS = [
    { value: 5 * 1024 * 1024, label: '5 MB' },
    { value: 10 * 1024 * 1024, label: '10 MB' },
    { value: 15 * 1024 * 1024, label: '15 MB' },
    { value: 20 * 1024 * 1024, label: '20 MB' },
    { value: 24 * 1024 * 1024, label: '24 MB' },
];

const AudioTranscriber: React.FC<AudioTranscriberProps> = ({ accountId, apiToken, onResetCredentials }) => {
    const [file, setFile] = useState<File | null>(null);
    const [transcription, setTranscription] = useState<string>('');
    const [isLoading, setIsLoading] = useState<boolean>(false);
    const [error, setError] = useState<string>('');
    const [isCopied, setIsCopied] = useState<boolean>(false);
    const [progressMessage, setProgressMessage] = useState<string>('');
    const [progress, setProgress] = useState<number>(0);
    const [chunkSize, setChunkSize] = useState(CHUNK_OPTIONS[1].value); // Default 10MB

    const fileInputRef = useRef<HTMLInputElement>(null);
    const abortControllerRef = useRef<AbortController | null>(null);

    const resetState = () => {
        setTranscription('');
        setError('');
        setIsLoading(false);
        setProgress(0);
        setProgressMessage('');
        if (abortControllerRef.current) {
            abortControllerRef.current.abort();
            abortControllerRef.current = null;
        }
    };
    
    useEffect(() => {
        if (!file) {
            return;
        }

        const controller = new AbortController();
        abortControllerRef.current = controller;

        const handleProgressUpdate = ({ message, percentage }: { message: string; percentage: number }) => {
            setProgressMessage(message);
            setProgress(percentage);
        };

        const runTranscription = async () => {
            resetState();
            setIsLoading(true);
            try {
                const result = await transcribeAudio(accountId, apiToken, file, handleProgressUpdate, chunkSize, controller.signal);
                if (!controller.signal.aborted) {
                    setTranscription(result);
                }
            } catch (err: any) {
                if (err.name !== 'AbortError') {
                    setError(err.message || 'An unknown error occurred.');
                }
            } finally {
                if (!controller.signal.aborted) {
                    setIsLoading(false);
                }
            }
        };

        runTranscription();

        return () => {
            controller.abort();
        };

    }, [file, chunkSize, accountId, apiToken]);

    const processFile = (selectedFile: File) => {
        if (selectedFile.size > MAX_FILE_SIZE) {
            setError(`File is too large. Please upload a file smaller than ${MAX_FILE_SIZE / 1024 / 1024}MB.`);
            setFile(null);
        } else {
            setFile(selectedFile);
        }
    };

    const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const selectedFile = e.target.files?.[0];
        if (selectedFile) {
            processFile(selectedFile);
        }
    };
    
    const handleDrop = useCallback((e: React.DragEvent<HTMLDivElement>) => {
        e.preventDefault();
        e.stopPropagation();
        const droppedFile = e.dataTransfer.files?.[0];
        if (droppedFile) {
            processFile(droppedFile);
        }
    }, []);

    const handleDragOver = (e: React.DragEvent<HTMLDivElement>) => {
        e.preventDefault();
        e.stopPropagation();
    };
    
    const removeFile = () => {
        setFile(null);
        resetState();
        if (fileInputRef.current) {
            fileInputRef.current.value = '';
        }
    };
    
    const copyToClipboard = () => {
        navigator.clipboard.writeText(transcription);
        setIsCopied(true);
        setTimeout(() => setIsCopied(false), 2000);
    };

    return (
        <div className="w-full max-w-4xl mx-auto bg-gray-800 rounded-xl shadow-2xl p-8 border border-gray-700">
             <div className="flex justify-between items-center mb-6">
                <h1 className="text-3xl font-bold text-white">Audio Transcriber</h1>
                <button
                    onClick={onResetCredentials}
                    className="text-sm text-blue-400 hover:text-blue-300 hover:underline"
                >
                    Change Credentials
                </button>
             </div>

            <div className="space-y-6">
                {!file && (
                    <div 
                        className="border-2 border-dashed border-gray-600 rounded-lg p-8 text-center cursor-pointer hover:border-blue-500 transition-colors bg-gray-800/50"
                        onDrop={handleDrop}
                        onDragOver={handleDragOver}
                        onClick={() => fileInputRef.current?.click()}
                    >
                        <input
                            type="file"
                            ref={fileInputRef}
                            onChange={handleFileChange}
                            accept="audio/*"
                            className="hidden"
                        />
                        <UploadIcon />
                        <p className="mt-2 text-gray-300">
                            <span className="font-semibold text-blue-400">Click to upload</span> or drag and drop
                        </p>
                        <p className="text-xs text-gray-500">MP3, WAV, M4A, etc. (Max 200MB)</p>
                    </div>
                )}
                
                {file && (
                     <div className="bg-gray-900/50 p-4 rounded-lg flex items-center justify-between">
                        <div className="flex items-center gap-4">
                            <FileAudioIcon />
                            <div>
                                <p className="text-white font-medium break-all">{file.name}</p>
                                <p className="text-xs text-gray-400">{(file.size / 1024 / 1024).toFixed(2)} MB</p>
                            </div>
                        </div>
                        <button
                            onClick={removeFile}
                            className="bg-gray-700 hover:bg-red-600 p-2 rounded-full text-gray-300 hover:text-white transition-colors flex-shrink-0 ml-4"
                            aria-label="Remove file"
                        >
                           <XCircleIcon />
                        </button>
                    </div>
                )}
                
                {file && file.size > MIN_SIZE_FOR_CHUNKING && (
                    <div className="flex items-center justify-center space-x-3">
                        <label htmlFor="chunkSize" className="text-sm font-medium text-gray-300">
                            Chunk Size:
                        </label>
                        <select
                            id="chunkSize"
                            value={chunkSize}
                            onChange={(e) => setChunkSize(Number(e.target.value))}
                            disabled={isLoading}
                            className="bg-gray-700 border border-gray-600 rounded-md py-1 px-2 text-white focus:ring-2 focus:ring-blue-500 focus:outline-none disabled:opacity-50 disabled:cursor-not-allowed"
                        >
                            {CHUNK_OPTIONS.map(opt => (
                                <option key={opt.value} value={opt.value}>{opt.label}</option>
                            ))}
                        </select>
                    </div>
                )}

                {error && <div className="bg-red-900/50 border border-red-700 text-red-300 px-4 py-3 rounded-lg text-sm whitespace-pre-wrap font-mono">{error}</div>}

                {isLoading && <Loader message={progressMessage || "Analyzing audio... this may take a moment."} progress={progress} />}

                {transcription && (
                    <div className="space-y-4">
                        <h2 className="text-xl font-semibold text-white">Transcription Result</h2>
                        <div className="relative bg-gray-900 p-6 rounded-lg border border-gray-600">
                            <button 
                                onClick={copyToClipboard}
                                className="absolute top-2 right-2 bg-gray-700 hover:bg-gray-600 text-gray-300 text-xs font-bold py-1 px-3 rounded"
                            >
                                {isCopied ? 'Copied!' : 'Copy'}
                            </button>
                            <p className="text-gray-200 whitespace-pre-wrap font-mono leading-relaxed">{transcription}</p>
                        </div>
                    </div>
                )}
            </div>
        </div>
    );
};

export default AudioTranscriber;