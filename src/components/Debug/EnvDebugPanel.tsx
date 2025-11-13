import React, { useState } from 'react';

export const EnvDebugPanel: React.FC = () => {
  const [isOpen, setIsOpen] = useState(false);

  const envVars = {
    VITE_OPENROUTER_API_KEY: import.meta.env.VITE_OPENROUTER_API_KEY,
    VITE_OPENAI_API_KEY: import.meta.env.VITE_OPENAI_API_KEY,
    VITE_FIREBASE_API_KEY: import.meta.env.VITE_FIREBASE_API_KEY,
    VITE_SUPABASE_URL: import.meta.env.VITE_SUPABASE_URL,
    VITE_FAL_KEY: import.meta.env.VITE_FAL_KEY,
    MODE: import.meta.env.MODE,
    DEV: import.meta.env.DEV,
    PROD: import.meta.env.PROD,
  };

  const maskApiKey = (key: string | undefined) => {
    if (!key) return 'NOT SET';
    if (key.length < 10) return key;
    return `${key.substring(0, 20)}...${key.substring(key.length - 4)}`;
  };

  if (!isOpen) {
    return (
      <button
        onClick={() => setIsOpen(true)}
        className="fixed bottom-4 right-4 z-50 bg-red-500 text-white px-4 py-2 rounded-lg shadow-lg hover:bg-red-600 transition-colors text-sm font-medium"
      >
        Debug Env Vars
      </button>
    );
  }

  return (
    <div className="fixed bottom-4 right-4 z-50 bg-gray-900 text-white p-6 rounded-lg shadow-2xl max-w-2xl max-h-[80vh] overflow-auto border border-red-500">
      <div className="flex justify-between items-center mb-4">
        <h3 className="text-lg font-bold text-red-400">Environment Variables Debug</h3>
        <button
          onClick={() => setIsOpen(false)}
          className="text-gray-400 hover:text-white transition-colors"
        >
          ✕
        </button>
      </div>

      <div className="space-y-3">
        <div className="bg-gray-800 p-3 rounded border border-gray-700">
          <div className="text-xs text-gray-400 mb-1">Environment Mode</div>
          <div className="text-sm">
            <span className="font-mono">{envVars.MODE}</span>
            {envVars.DEV && <span className="ml-2 text-yellow-400">(Development)</span>}
            {envVars.PROD && <span className="ml-2 text-green-400">(Production)</span>}
          </div>
        </div>

        {Object.entries(envVars).map(([key, value]) => {
          if (key === 'MODE' || key === 'DEV' || key === 'PROD') return null;

          const isSet = value && value !== 'undefined' && value.length > 0;

          return (
            <div key={key} className="bg-gray-800 p-3 rounded border border-gray-700">
              <div className="flex items-center justify-between mb-1">
                <div className="text-xs text-gray-400">{key}</div>
                <div className={`text-xs px-2 py-0.5 rounded ${isSet ? 'bg-green-900 text-green-300' : 'bg-red-900 text-red-300'}`}>
                  {isSet ? 'SET' : 'MISSING'}
                </div>
              </div>
              <div className="text-sm font-mono break-all">
                {isSet ? maskApiKey(value as string) : <span className="text-red-400">NOT SET</span>}
              </div>
              {isSet && (
                <div className="text-xs text-gray-500 mt-1">
                  Length: {(value as string).length} chars
                </div>
              )}
            </div>
          );
        })}
      </div>

      <div className="mt-4 p-3 bg-yellow-900/30 border border-yellow-600 rounded text-xs">
        <div className="font-bold text-yellow-400 mb-1">Note:</div>
        <div className="text-yellow-200">
          If variables show as "NOT SET", you need to configure them in your hosting platform's environment settings.
          For bolt.new, check the project settings or deployment configuration.
        </div>
      </div>

      <div className="mt-4 text-xs text-gray-400">
        This panel will be removed after debugging is complete.
      </div>
    </div>
  );
};
