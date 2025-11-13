import React, { useState } from 'react';

export const ApiKeyValidator: React.FC = () => {
  const [testing, setTesting] = useState(false);
  const [result, setResult] = useState<{ success: boolean; message: string } | null>(null);

  const testApiKey = async () => {
    setTesting(true);
    setResult(null);

    const apiKey = import.meta.env.VITE_OPENROUTER_API_KEY;

    if (!apiKey) {
      setResult({
        success: false,
        message: 'No API key found in environment variables'
      });
      setTesting(false);
      return;
    }

    try {
      const response = await fetch('https://openrouter.ai/api/v1/auth/key', {
        method: 'GET',
        headers: {
          'Authorization': `Bearer ${apiKey}`,
        },
      });

      if (response.ok) {
        const data = await response.json();
        setResult({
          success: true,
          message: `✅ API Key is VALID!\n\nKey Info:\n${JSON.stringify(data, null, 2)}`
        });
      } else {
        const errorText = await response.text();
        setResult({
          success: false,
          message: `❌ API Key is INVALID!\n\nStatus: ${response.status}\nError: ${errorText}\n\nThis key may be expired or incorrect.`
        });
      }
    } catch (error: any) {
      setResult({
        success: false,
        message: `❌ Test failed: ${error.message}`
      });
    }

    setTesting(false);
  };

  return (
    <div className="fixed top-20 right-4 z-50 bg-gray-900 text-white p-6 rounded-lg shadow-2xl max-w-xl border border-blue-500">
      <h3 className="text-lg font-bold text-blue-400 mb-4">OpenRouter API Key Validator</h3>

      <button
        onClick={testApiKey}
        disabled={testing}
        className="w-full bg-blue-600 hover:bg-blue-700 disabled:bg-gray-600 text-white font-medium py-3 px-4 rounded-lg transition-colors mb-4"
      >
        {testing ? 'Testing API Key...' : 'Test OpenRouter API Key'}
      </button>

      {result && (
        <div className={`p-4 rounded-lg ${result.success ? 'bg-green-900/30 border border-green-500' : 'bg-red-900/30 border border-red-500'}`}>
          <pre className="text-xs whitespace-pre-wrap">{result.message}</pre>
        </div>
      )}

      {!result && (
        <div className="text-sm text-gray-400 space-y-2">
          <p>Click the button above to validate your OpenRouter API key.</p>
          <p className="text-yellow-400">Current key: {import.meta.env.VITE_OPENROUTER_API_KEY?.substring(0, 20)}...</p>
        </div>
      )}

      {result && !result.success && (
        <div className="mt-4 p-4 bg-yellow-900/30 border border-yellow-600 rounded text-xs space-y-2">
          <div className="font-bold text-yellow-400">How to fix:</div>
          <ol className="list-decimal list-inside space-y-1 text-yellow-200">
            <li>Go to <a href="https://openrouter.ai/keys" target="_blank" rel="noopener noreferrer" className="underline">openrouter.ai/keys</a></li>
            <li>Create a new API key (or use an existing valid one)</li>
            <li>Update your .env file with: VITE_OPENROUTER_API_KEY=your-new-key</li>
            <li>In bolt.new: You may need to add it to environment settings</li>
            <li>Restart the application</li>
          </ol>
        </div>
      )}
    </div>
  );
};
