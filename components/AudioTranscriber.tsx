
import React, { useState, useCallback, useRef } from 'react';
import { transcribeAudio } from '../services/cloudflareService';
import Loader from './Loader';
import { UploadIcon, FileAudioIcon, XCircleIcon } from './icons';

interface AudioTranscriberProps {
    accountId: string;
    apiToken: string;
    onResetCredentials: () => void;
}

const AudioTranscriber: React.FC<AudioTranscriberProps> = ({ accountId, apiToken, onResetCredentials }) => {
    const [file, setFile] = useState<File | null>(null);
    const [transcription, setTranscription] = useState<string>('');
    const [isLoading, setIsLoading] = useState<boolean>(false);
    const [error, setError] = useState<string>('');
    const fileInputRef = useRef<HTMLInputElement>(null);
    const [isCopied, setIsCopied] = useState<boolean>(false);

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

    const processFile = (selectedFile: File) => {
        if (selectedFile.size > 25 * 1024 * 1024) {
            setError('File is too large. Please upload a file smaller than 25MB.');
            setFile(null);
        } else {
            setFile(selectedFile);
            setError('');
            setTranscription('');
        }
    };

    const handleDragOver = (e: React.DragEvent<HTMLDivElement>) => {
        e.preventDefault();
        e.stopPropagation();
    };

    const handleTranscribe = async () => {
        if (!file) {
            setError('Please select an audio file first.');
            return;
        }
        setIsLoading(true);
        setError('');
        setTranscription('');
        try {
            const result = await transcribeAudio(accountId, apiToken, file);
            setTranscription(result);
        } catch (err: any) {
            setError(err.message || 'An unknown error occurred.');
        } finally {
            setIsLoading(false);
        }
    };
    
    const removeFile = () => {
        setFile(null);
        setTranscription('');
        setError('');
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
                    {!file ? (
                         <>
                            <UploadIcon />
                            <p className="mt-2 text-gray-300">
                                <span className="font-semibold text-blue-400">Click to upload</span> or drag and drop
                            </p>
                            <p className="text-xs text-gray-500">MP3, WAV, M4A, etc. (Max 25MB)</p>
                        </>
                    ) : (
                        <div className="flex flex-col items-center">
                            <FileAudioIcon />
                            <p className="mt-2 text-white font-medium">{file.name}</p>
                            <p className="text-xs text-gray-400">{(file.size / 1024 / 1024).toFixed(2)} MB</p>
                        </div>
                    )}
                </div>
                
                {file && (
                     <div className="flex justify-center items-center gap-4">
                        <button
                            onClick={handleTranscribe}
                            disabled={isLoading}
                            className="bg-blue-600 hover:bg-blue-700 text-white font-bold py-2 px-6 rounded-lg transition-colors duration-300 disabled:bg-gray-600 disabled:cursor-wait"
                        >
                            {isLoading ? 'Transcribing...' : 'Transcribe Audio'}
                        </button>
                        <button
                            onClick={removeFile}
                            className="bg-gray-700 hover:bg-red-600 p-2 rounded-full text-gray-300 hover:text-white transition-colors"
                            aria-label="Remove file"
                        >
                           <XCircleIcon />
                        </button>
                    </div>
                )}

                {error && <div className="bg-red-900/50 border border-red-700 text-red-300 px-4 py-3 rounded-lg text-sm whitespace-pre-wrap font-mono">{error}</div>}

                {isLoading && <Loader message="Analyzing audio... this may take a moment." />}

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
