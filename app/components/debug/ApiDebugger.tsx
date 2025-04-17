import { useState, useEffect } from 'react';

const ApiDebugger = () => {
  const [token, setToken] = useState('');
  const [apiResponse, setApiResponse] = useState<{
    status: number;
    statusText: string;
    data: any;
  } | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [endpoint, setEndpoint] = useState('/api/py/health');

  useEffect(() => {
    const storedToken = localStorage.getItem('token');
    if (storedToken) {
      setToken(storedToken);
    }
  }, []);

  const testApi = async () => {
    setLoading(true);
    setError(null);
    setApiResponse(null);

    try {
      const headers: Record<string, string> = {};
      if (token) {
        headers['Authorization'] = `Bearer ${token}`;
      }

      const response = await fetch(endpoint, {
        headers,
        cache: 'no-store',
      });

      const data = await response.json();
      setApiResponse({
        status: response.status,
        statusText: response.statusText,
        data,
      });
    } catch (err) {
      console.error('API test error:', err);
      setError((err as any).message || 'An error occurred testing the API');
    } finally {
      setLoading(false);
    }
  };

  const commonEndpoints = [
    '/api/py/health',
    '/api/py/credits/balance',
    '/api/py/notifications/',
    '/api/py/reviews/',
  ];

  return (
    <div className="max-w-4xl mx-auto mt-8 p-4">
      <h1 className="text-2xl font-bold mb-4">
        API Connection Debugger
      </h1>

      <div className="bg-white p-6 rounded-lg shadow-md mb-6">
        <h2 className="text-xl font-semibold mb-3">
          API Endpoint
        </h2>
        <input
          className="w-full border border-gray-300 rounded p-2 mb-4"
          value={endpoint}
          onChange={(e) => setEndpoint(e.target.value)}
          placeholder="API Endpoint"
        />

        <div className="mb-4">
          <p className="text-sm mb-2">
            Common endpoints:
          </p>
          <div className="flex flex-wrap gap-2">
            {commonEndpoints.map((ep) => (
              <button
                key={ep}
                className={`px-3 py-1 text-sm rounded ${
                  endpoint === ep 
                    ? 'bg-blue-500 text-white' 
                    : 'bg-gray-200 text-gray-700'
                }`}
                onClick={() => setEndpoint(ep)}
              >
                {ep}
              </button>
            ))}
          </div>
        </div>

        <h2 className="text-xl font-semibold mt-6 mb-3">
          Authentication Token
        </h2>
        <input
          className="w-full border border-gray-300 rounded p-2 mb-4"
          value={token}
          onChange={(e) => setToken(e.target.value)}
          placeholder="Paste your JWT token here"
        />

        <button
          className="w-full bg-blue-500 text-white py-2 px-4 rounded hover:bg-blue-600 disabled:bg-blue-300"
          onClick={testApi}
          disabled={loading}
        >
          {loading ? 'Testing...' : 'Test API Connection'}
        </button>
      </div>

      {error && (
        <div className="bg-red-100 border-l-4 border-red-500 text-red-700 p-4 mb-6">
          <p>{error}</p>
        </div>
      )}

      {apiResponse && (
        <div className="bg-white p-6 rounded-lg shadow-md">
          <h2 className="text-xl font-semibold mb-3">
            API Response
          </h2>
          <div className="mb-4">
            <p className="text-sm">
              <strong>Status:</strong> {apiResponse.status} {apiResponse.statusText}
            </p>
          </div>
          <hr className="my-4" />
          <pre className="whitespace-pre-wrap text-sm bg-gray-100 p-4 rounded">
            {JSON.stringify(apiResponse.data, null, 2)}
          </pre>
        </div>
      )}
    </div>
  );
};

export default ApiDebugger;