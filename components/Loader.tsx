
import React from 'react';

const Loader = ({ message }: { message: string }) => (
    <div className="flex flex-col items-center justify-center space-y-4 py-8">
        <div className="animate-spin rounded-full h-16 w-16 border-t-2 border-b-2 border-blue-500"></div>
        <p className="text-lg text-gray-300 font-semibold">{message}</p>
    </div>
);

export default Loader;
