import React, { useState, useEffect } from 'react';

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

      {/* Auto Mode Delay */}
      <div className="mb-4">
        <label htmlFor="delay-input" className="block text-sm font-medium text-slate-300 mb-1">
          Auto Delay Between Messages (seconds)
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
