import React from 'react';

const Loader = ({ message, progress }: { message: string; progress?: number }) => (
    <div className="flex flex-col items-center justify-center space-y-4 py-8">
        <div className="animate-spin rounded-full h-16 w-16 border-t-2 border-b-2 border-blue-500"></div>
        <p className="text-lg text-gray-300 font-semibold">{message}</p>
        {progress !== undefined && progress > 0 && (
            <div className="w-full max-w-sm bg-gray-700 rounded-full h-2.5 mt-2">
                <div 
                    className="bg-blue-500 h-2.5 rounded-full transition-all duration-300 ease-linear" 
                    style={{ width: `${progress}%` }}
                ></div>
            </div>
        )}
    </div>
);

export default Loader;