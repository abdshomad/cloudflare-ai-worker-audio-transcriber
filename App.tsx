
import React, { useState } from 'react';
import ApiKeyForm from './components/ApiKeyForm';
import AudioTranscriber from './components/AudioTranscriber';
import { CloudIcon } from './components/icons';

const App: React.FC = () => {
    const [credentials, setCredentials] = useState<{ accountId: string; apiToken: string } | null>(null);

    const handleCredentialsSubmit = (accountId: string, apiToken:string) => {
        setCredentials({ accountId, apiToken });
    };

    const handleResetCredentials = () => {
        setCredentials(null);
    };

    return (
        <div className="bg-gray-900 text-white min-h-screen flex flex-col items-center justify-center p-4 font-sans">
            <header className="absolute top-0 left-0 w-full p-4 flex items-center justify-center">
                 <div className="flex items-center space-x-3 text-gray-400">
                    <CloudIcon />
                    <span className="font-semibold text-lg">Cloudflare AI Transcription</span>
                 </div>
            </header>
            
            <main className="w-full">
                {!credentials ? (
                    <ApiKeyForm onSubmit={handleCredentialsSubmit} />
                ) : (
                    <AudioTranscriber 
                        accountId={credentials.accountId} 
                        apiToken={credentials.apiToken}
                        onResetCredentials={handleResetCredentials} 
                    />
                )}
            </main>
            
            <footer className="absolute bottom-0 left-0 w-full p-4 text-center text-gray-600 text-sm">
                Powered by Cloudflare Workers AI. This is a client-side application and your credentials are not stored.
            </footer>
        </div>
    );
};

export default App;
