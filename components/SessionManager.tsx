import React, { useState, useEffect } from 'react';

interface SessionManagerProps {
  sessionState: 'idle' | 'running';
  message: string;
  setMessage: (message: string) => void;
  onStart: () => void;
  onNext: () => void;
  onStop: () => void;
  onResend: () => void;
  onExportCSV: () => void;
  batchSize: number;
  setBatchSize: (size: number) => void;
  currentBatch: number;
  zohoToken: string;
  setZohoToken: (token: string) => void;
  zohoOrgId: string;
  setZohoOrgId: (orgId: string) => void;
  zohoEnabled: boolean;
  setZohoEnabled: (enabled: boolean) => void;
  pendingCount: number;
  completedCount: number;
  totalCount: number;
}

const SessionManager: React.FC<SessionManagerProps> = ({
  sessionState,
  message,
  setMessage,
  onStart,
  onNext,
  onStop,
  onResend,
  onExportCSV,
  batchSize,
  setBatchSize,
  currentBatch,
  zohoToken,
  setZohoToken,
  zohoOrgId,
  setZohoOrgId,
  zohoEnabled,
  setZohoEnabled,
  pendingCount,
  completedCount,
  totalCount,
}) => {
  const [delay, setDelay] = useState(3);
  const [autoMode, setAutoMode] = useState(false);
  const [countdown, setCountdown] = useState(0);
  
  const isSessionActive = sessionState === 'running';
  const progressPercentage = totalCount > 0 ? (completedCount / totalCount) * 100 : 0;

  // Auto-processing with countdown
  useEffect(() => {
    if (autoMode && isSessionActive && pendingCount > 0 && countdown > 0) {
      const timer = setTimeout(() => {
        setCountdown(countdown - 1);
      }, 1000);
      return () => clearTimeout(timer);
    } else if (autoMode && isSessionActive && pendingCount > 0 && countdown === 0) {
      onNext();
      setCountdown(delay);
    }
  }, [autoMode, isSessionActive, pendingCount, countdown, delay, onNext]);

  const handleAutoStart = () => {
    setAutoMode(true);
    setCountdown(delay);
    onStart();
  };

  const handleStop = () => {
    setAutoMode(false);
    setCountdown(0);
    onStop();
  };

  return (
    <div className="bg-slate-800 p-6 rounded-lg shadow-lg border border-slate-700">
      <h2 className="text-xl font-bold text-white mb-4">Messaging Session</h2>

      {/* Predefined Message */}
      <div className="mb-4">
        <label htmlFor="message-input" className="block text-sm font-medium text-slate-300 mb-1">
          Predefined Message (Optional)
        </label>
        <textarea
          id="message-input"
          rows={4}
          value={message}
          onChange={(e) => setMessage(e.target.value)}
          placeholder="Type your message here... It will be pre-filled in WhatsApp."
          className="w-full bg-slate-900 border border-slate-600 rounded-md p-2 text-slate-200 placeholder-slate-500 focus:ring-2 focus:ring-sky-500 focus:border-sky-500 transition duration-200"
          disabled={isSessionActive}
        />
      </div>

      {/* CRM Integration Methods */}
      <div className="mb-4 p-4 bg-slate-700 rounded-md">
        <h3 className="text-lg font-medium text-slate-200 mb-3">CRM Integration Options</h3>
        
        {/* Method Selection */}
        <div className="mb-4">
          <label className="block text-sm font-medium text-slate-300 mb-2">Choose Integration Method:</label>
          <div className="space-y-2">
            <label className="flex items-center">
              <input 
                type="radio" 
                name="crmMethod" 
                value="api" 
                className="mr-2" 
                onChange={() => {
                  document.getElementById('api-method')?.classList.remove('hidden');
                  document.getElementById('csv-method')?.classList.add('hidden');
                  document.getElementById('webhook-method')?.classList.add('hidden');
                }}
              />
              <span className="text-slate-300">API Integration (Auto-update)</span>
            </label>
            <label className="flex items-center">
              <input 
                type="radio" 
                name="crmMethod" 
                value="csv" 
                className="mr-2" 
                defaultChecked
                onChange={() => {
                  document.getElementById('api-method')?.classList.add('hidden');
                  document.getElementById('csv-method')?.classList.remove('hidden');
                  document.getElementById('webhook-method')?.classList.add('hidden');
                }}
              />
              <span className="text-slate-300">CSV Export (Manual import to Zoho)</span>
            </label>
            <label className="flex items-center">
              <input 
                type="radio" 
                name="crmMethod" 
                value="webhook" 
                className="mr-2"
                onChange={() => {
                  document.getElementById('api-method')?.classList.add('hidden');
                  document.getElementById('csv-method')?.classList.add('hidden');
                  document.getElementById('webhook-method')?.classList.remove('hidden');
                }}
              />
              <span className="text-slate-300">Webhook (Send to your server)</span>
            </label>
          </div>
        </div>

        {/* API Method */}
        <div id="api-method" className="hidden">
          <div className="mb-3">
            <label htmlFor="zoho-token" className="block text-sm font-medium text-slate-300 mb-1">
              Zoho Access Token
            </label>
            <input
              id="zoho-token"
              type="password"
              value={zohoToken}
              onChange={(e) => setZohoToken(e.target.value)}
              placeholder="Enter your Zoho access token"
              className="w-full bg-slate-900 border border-slate-600 rounded-md p-2 text-slate-200 placeholder-slate-500 focus:ring-2 focus:ring-sky-500 focus:border-sky-500 transition duration-200"
            />
          </div>
          <div className="flex items-center">
            <input
              id="enable-zoho-api"
              type="checkbox"
              checked={zohoEnabled}
              onChange={(e) => setZohoEnabled(e.target.checked)}
              className="h-4 w-4 text-sky-600 focus:ring-sky-500 border-slate-600 rounded bg-slate-900"
            />
            <label htmlFor="enable-zoho-api" className="ml-2 text-sm text-slate-300">
              Enable auto-update PC field in Zoho CRM
            </label>
          </div>
          <p className="text-xs text-slate-400 mt-2">
            ✅ Real-time updates • ⚡ Automatic • 🔒 Secure
          </p>
        </div>

        {/* CSV Method */}
        <div id="csv-method">
          <p className="text-sm text-slate-400 mb-2">
            ✅ Completed numbers will be exported as CSV. Import this file to Zoho CRM to update PC field.
          </p>
          <button 
            onClick={onExportCSV}
            disabled={completedCount === 0}
            className="bg-green-600 text-white px-4 py-2 rounded-md hover:bg-green-700 disabled:bg-slate-600 disabled:cursor-not-allowed text-sm"
          >
            Download Completed Numbers CSV ({completedCount})
          </button>
        </div>

        {/* Webhook Method */}
        <div id="webhook-method" className="hidden">
          <div className="mb-3">
            <label htmlFor="webhook-url" className="block text-sm font-medium text-slate-300 mb-1">
              Webhook URL
            </label>
            <input
              id="webhook-url"
              type="url"
              placeholder="https://your-server.com/webhook"
              className="w-full bg-slate-900 border border-slate-600 rounded-md p-2 text-slate-200 placeholder-slate-500 focus:ring-2 focus:ring-sky-500 focus:border-sky-500 transition duration-200"
            />
          </div>
          <p className="text-xs text-slate-400">
            Sends POST request with completed phone numbers to your server.
          </p>
        </div>
      </div>

      {/* Batch Size and Auto Delay */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
        <div>
          <label htmlFor="batch-input" className="block text-sm font-medium text-slate-300 mb-1">
            Batch Size
          </label>
          <select
            id="batch-input"
            value={batchSize}
            onChange={(e) => setBatchSize(Number(e.target.value))}
            className="w-full bg-slate-900 border border-slate-600 rounded-md p-2 text-slate-200 focus:ring-2 focus:ring-sky-500 focus:border-sky-500 transition duration-200"
            disabled={isSessionActive}
          >
            <option value={10}>10 contacts</option>
            <option value={20}>20 contacts</option>
            <option value={50}>50 contacts</option>
            <option value={100}>100 contacts</option>
            <option value={200}>200 contacts</option>
          </select>
        </div>
        <div>
          <label htmlFor="delay-input" className="block text-sm font-medium text-slate-300 mb-1">
            Auto Delay (seconds)
          </label>
          <input
            id="delay-input"
            type="number"
            min="1"
            max="60"
            value={delay}
            onChange={(e) => setDelay(Number(e.target.value))}
            className="w-full bg-slate-900 border border-slate-600 rounded-md p-2 text-slate-200 focus:ring-2 focus:ring-sky-500 focus:border-sky-500 transition duration-200"
            disabled={isSessionActive}
          />
        </div>
      </div>
      
      {/* Action Buttons */}
      <div className="flex items-center justify-center gap-4 flex-wrap">
        {sessionState === 'idle' && (
          <>
            <button 
              onClick={onStart} 
              disabled={pendingCount === 0}
              className="bg-green-600 text-white font-bold py-3 px-6 rounded-md hover:bg-green-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-offset-slate-800 focus:ring-green-500 transition-colors duration-300 disabled:bg-slate-600 disabled:cursor-not-allowed text-lg"
            >
              Manual Mode
            </button>
            <button 
              onClick={handleAutoStart} 
              disabled={pendingCount === 0}
              className="bg-purple-600 text-white font-bold py-3 px-6 rounded-md hover:bg-purple-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-offset-slate-800 focus:ring-purple-500 transition-colors duration-300 disabled:bg-slate-600 disabled:cursor-not-allowed text-lg"
            >
              Auto Mode ({delay}s)
            </button>
            <button 
              onClick={onResend} 
              disabled={completedCount === 0}
              className="bg-orange-600 text-white font-bold py-3 px-6 rounded-md hover:bg-orange-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-offset-slate-800 focus:ring-orange-500 transition-colors duration-300 disabled:bg-slate-600 disabled:cursor-not-allowed text-lg"
            >
              Resend All
            </button>
          </>
        )}

        {isSessionActive && (
          <>
            {!autoMode && (
              <button 
                onClick={onNext} 
                disabled={pendingCount === 0}
                className="bg-sky-600 text-white font-bold py-3 px-6 rounded-md hover:bg-sky-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-offset-slate-800 focus:ring-sky-500 transition-colors duration-300 disabled:bg-slate-600 disabled:cursor-not-allowed text-lg"
              >
                Process Next Contact
              </button>
            )}
            {autoMode && countdown > 0 && (
              <div className="bg-purple-600 text-white font-bold py-3 px-6 rounded-md text-lg">
                Next in {countdown}s...
              </div>
            )}
            <button onClick={handleStop} className="bg-red-600 text-white font-bold py-3 px-6 rounded-md hover:bg-red-700 transition-colors text-lg">
              Stop Session
            </button>
          </>
        )}
      </div>
      
      {isSessionActive && (
        <p className="text-sm text-slate-400 mt-4 text-center">
            {autoMode 
              ? "Auto mode: WhatsApp chats will open automatically with the set delay."
              : "After sending your message, close the WhatsApp tab and click 'Process Next Contact'."
            }
        </p>
      )}

      {totalCount > 0 && sessionState !== 'idle' && (
          <div className="mt-4 space-y-3">
              <div className="flex justify-between mb-1">
                  <span className="text-base font-medium text-slate-300">Batch Progress</span>
                  <span className="text-sm font-medium text-slate-300">{currentBatch} / {batchSize}</span>
              </div>
              <div className="w-full bg-slate-700 rounded-full h-2.5">
                  <div className="bg-purple-500 h-2.5 rounded-full transition-all duration-500" style={{ width: `${(currentBatch / batchSize) * 100}%` }}></div>
              </div>
              <div className="flex justify-between mb-1">
                  <span className="text-base font-medium text-slate-300">Total Progress</span>
                  <span className="text-sm font-medium text-slate-300">{completedCount} / {totalCount}</span>
              </div>
              <div className="w-full bg-slate-700 rounded-full h-2.5">
                  <div className="bg-sky-500 h-2.5 rounded-full transition-all duration-500" style={{ width: `${progressPercentage}%` }}></div>
              </div>
          </div>
      )}
    </div>
  );
};

export default SessionManager;
