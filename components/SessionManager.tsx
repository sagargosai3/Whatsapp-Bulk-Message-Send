import React from 'react';

interface SessionManagerProps {
  sessionState: 'idle' | 'running';
  message: string;
  setMessage: (message: string) => void;
  onStart: () => void;
  onNext: () => void;
  onStop: () => void;
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
  pendingCount,
  completedCount,
  totalCount,
}) => {
  const isSessionActive = sessionState === 'running';
  const progressPercentage = totalCount > 0 ? (completedCount / totalCount) * 100 : 0;

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
      
      {/* Action Buttons */}
      <div className="flex items-center justify-center gap-4">
        {sessionState === 'idle' && (
          <button 
            onClick={onStart} 
            disabled={pendingCount === 0}
            className="w-full sm:w-auto bg-green-600 text-white font-bold py-3 px-6 rounded-md hover:bg-green-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-offset-slate-800 focus:ring-green-500 transition-colors duration-300 disabled:bg-slate-600 disabled:cursor-not-allowed text-lg"
          >
            Start Session
          </button>
        )}

        {isSessionActive && (
          <>
            <button 
              onClick={onNext} 
              disabled={pendingCount === 0}
              className="w-full sm:w-auto bg-sky-600 text-white font-bold py-3 px-6 rounded-md hover:bg-sky-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-offset-slate-800 focus:ring-sky-500 transition-colors duration-300 disabled:bg-slate-600 disabled:cursor-not-allowed text-lg"
            >
              Process Next Contact
            </button>
            <button onClick={onStop} className="bg-red-600 text-white font-bold py-3 px-6 rounded-md hover:bg-red-700 transition-colors text-lg">
              Stop Session
            </button>
          </>
        )}
      </div>
      
      {isSessionActive && (
        <p className="text-sm text-slate-400 mt-4 text-center">
            After sending your message, close the WhatsApp tab and click "Process Next Contact".
        </p>
      )}

      {totalCount > 0 && sessionState !== 'idle' && (
          <div className="mt-4">
              <div className="flex justify-between mb-1">
                  <span className="text-base font-medium text-slate-300">Progress</span>
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
