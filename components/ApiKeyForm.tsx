import React, { useState } from 'react';
import { KeyIcon, CloudIcon } from './icons';

interface ApiKeyFormProps {
    onSubmit: (accountId: string, apiToken: string) => void;
}

const ApiKeyForm: React.FC<ApiKeyFormProps> = ({ onSubmit }) => {
    const [accountId, setAccountId] = useState('');
    const [apiToken, setApiToken] = useState('');

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        if (accountId.trim() && apiToken.trim()) {
            onSubmit(accountId.trim(), apiToken.trim());
        }
    };

    return (
        <div className="w-full max-w-md mx-auto bg-gray-800 rounded-xl shadow-2xl p-8 border border-gray-700">
            <div className="flex flex-col items-center mb-6">
                <div className="p-3 bg-blue-500/20 rounded-full text-blue-400">
                    <CloudIcon />
                </div>
                <h2 className="text-2xl font-bold text-white mt-4">Cloudflare AI Access</h2>
                <p className="text-gray-400 text-center mt-2">
                    Enter your credentials to use the audio transcription service.
                </p>
            </div>
            <form onSubmit={handleSubmit} className="space-y-6">
                <div>
                    <label htmlFor="accountId" className="block text-sm font-medium text-gray-300 mb-1">
                        Account ID
                    </label>
                    <div className="relative">
                        <div className="pointer-events-none absolute inset-y-0 left-0 flex items-center pl-3">
                            <KeyIcon />
                        </div>
                        <input
                            id="accountId"
                            type="text"
                            value={accountId}
                            onChange={(e) => setAccountId(e.target.value)}
                            placeholder="Your Cloudflare Account ID"
                            required
                            className="w-full bg-gray-900 border border-gray-600 rounded-lg py-2 pl-10 pr-4 text-white placeholder-gray-500 focus:ring-2 focus:ring-blue-500 focus:outline-none"
                        />
                    </div>
                </div>
                <div>
                    <label htmlFor="apiToken" className="block text-sm font-medium text-gray-300 mb-1">
                        API Token
                    </label>
                    <div className="relative">
                        <div className="pointer-events-none absolute inset-y-0 left-0 flex items-center pl-3">
                            <KeyIcon />
                        </div>
                        <input
                            id="apiToken"
                            type="password"
                            value={apiToken}
                            onChange={(e) => setApiToken(e.target.value)}
                            placeholder="Your Cloudflare API Token"
                            required
                            className="w-full bg-gray-900 border border-gray-600 rounded-lg py-2 pl-10 pr-4 text-white placeholder-gray-500 focus:ring-2 focus:ring-blue-500 focus:outline-none"
                        />
                    </div>
                     <p className="text-xs text-gray-500 mt-2">
                        Ensure your token has "Workers AI" permissions. Your credentials are not stored.
                    </p>
                </div>
                 <div className="text-center text-xs text-gray-400 pt-2">
                    <p>Find your Account ID on your Cloudflare dashboard's right sidebar.</p>
                    <a 
                        href="https://dash.cloudflare.com/profile/api-tokens" 
                        target="_blank" 
                        rel="noopener noreferrer" 
                        className="text-blue-400 hover:underline"
                    >
                        Click here to create an API Token
                    </a>
                </div>
                <button
                    type="submit"
                    className="w-full bg-blue-600 hover:bg-blue-700 text-white font-bold py-3 px-4 rounded-lg transition-colors duration-300 disabled:opacity-50 disabled:cursor-not-allowed"
                    disabled={!accountId.trim() || !apiToken.trim()}
                >
                    Proceed to Transcriber
                </button>
            </form>
        </div>
    );
};

export default ApiKeyForm;