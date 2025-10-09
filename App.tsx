import React, { useState, useCallback } from 'react';
import NumberImporter from './components/NumberImporter';
import NumberList from './components/NumberList';
import SessionManager from './components/SessionManager';
import { ZohoIntegration } from './utils/zohoIntegration';
import { exportForZohoImport } from './utils/csvExport';

const App: React.FC = () => {
  const [pendingNumbers, setPendingNumbers] = useState<string[]>([]);
  const [completedNumbers, setCompletedNumbers] = useState<string[]>([]);
  const [message, setMessage] = useState('');
  const [batchSize, setBatchSize] = useState(10);
  const [currentBatch, setCurrentBatch] = useState(0);
  
  // Zoho CRM Integration
  const [zohoToken, setZohoToken] = useState('');
  const [zohoOrgId, setZohoOrgId] = useState('');
  const [zohoEnabled, setZohoEnabled] = useState(false);
  const [delugeWebhookUrl, setDelugeWebhookUrl] = useState('');
  const [delugeEnabled, setDelugeEnabled] = useState(false);

  // Simplified Session State
  const [sessionState, setSessionState] = useState<'idle' | 'running'>('idle');

  const handleImportNumbers = useCallback((numbers: string[]) => {
    const newNumbers = numbers.filter(
      num => !pendingNumbers.includes(num) && !completedNumbers.includes(num)
    );
    setPendingNumbers(prev => [...prev, ...newNumbers]);
  }, [pendingNumbers, completedNumbers]);

  const processNumber = useCallback(async (numberToProcess: string) => {
    const sanitizedNumber = numberToProcess.replace(/[^0-9+]/g, '');
    const encodedMessage = encodeURIComponent(message);
    const url = message.trim()
      ? `https://wa.me/${sanitizedNumber}?text=${encodedMessage}`
      : `https://wa.me/${sanitizedNumber}`;
    
    window.open(url, '_blank');
    
    setPendingNumbers(prev => prev.filter(num => num !== numberToProcess));
    setCompletedNumbers(prev => [...prev, numberToProcess]);
    
    // Update Zoho CRM if enabled
    if (zohoEnabled && zohoToken) {
      try {
        console.log('🚀 Starting Zoho API update for:', numberToProcess);
        const zoho = new ZohoIntegration({
          accessToken: zohoToken,
          organizationId: zohoOrgId
        });
        const success = await zoho.updateContactPC(numberToProcess);
        if (success) {
          console.log('✅ Zoho API updated successfully for:', numberToProcess);
        } else {
          console.log('⚠️ Zoho API update failed for:', numberToProcess);
          console.log('💡 Check: 1) Token validity 2) Phone number format 3) Contact exists in CRM');
        }
      } catch (error) {
        console.error('❌ Failed to update Zoho API:', error);
        if (error.message.includes('token expired')) {
          console.error('🔑 Please generate a new access token from Zoho API Console');
        }
      }
    }

    // Update via Deluge webhook if enabled
    if (delugeEnabled && delugeWebhookUrl) {
      try {
        console.log('🚀 Starting Deluge webhook for:', numberToProcess);
        const cleanNumber = numberToProcess.replace(/[^0-9+]/g, '');
        
        console.log('📞 Sending to webhook:', cleanNumber);
        console.log('🔗 Webhook URL:', delugeWebhookUrl);
        
        const response = await fetch(delugeWebhookUrl, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json'
          },
          body: JSON.stringify({
            Mobile: cleanNumber
          })
        });
        
        console.log('📊 Webhook response status:', response.status);
        
        if (response.ok) {
          const result = await response.text();
          console.log('✅ Deluge webhook successful:', result);
        } else {
          const errorText = await response.text();
          console.log('⚠️ Deluge webhook failed:', response.status, errorText);
          console.log('💡 Check: 1) Webhook URL is correct 2) API key is valid 3) Function is published');
        }
      } catch (error) {
        console.error('❌ Failed to call Deluge webhook:', error);
        console.log('💡 Check: 1) Internet connection 2) CORS settings 3) Webhook URL format');
      }
    }
  }, [message, zohoEnabled, zohoToken, zohoOrgId, delugeEnabled, delugeWebhookUrl]);

  const resendToCompleted = useCallback(() => {
    setPendingNumbers(prev => [...prev, ...completedNumbers]);
    setCompletedNumbers([]);
  }, [completedNumbers]);

  const handleExportCSV = useCallback(() => {
    exportForZohoImport(completedNumbers);
  }, [completedNumbers]);
  
  // Manual click handler
  const handleNumberSelect = useCallback((selectedNumber: string) => {
    if (sessionState === 'idle') {
      processNumber(selectedNumber);
    }
  }, [sessionState, processNumber]);

  // Session control handlers
  const handleStartSession = () => {
      if (pendingNumbers.length > 0) {
          setSessionState('running');
          setCurrentBatch(1);
          processNumber(pendingNumbers[0]);
      }
  };

  const handleProcessNextNumber = () => {
    if (pendingNumbers.length > 0) {
      processNumber(pendingNumbers[0]);
      
      // Check if batch is complete
      if (currentBatch >= batchSize) {
        handleStopSession();
        return;
      }
      
      setCurrentBatch(prev => prev + 1);
    }
    
    // If no more numbers, stop session
    if (pendingNumbers.length <= 1) { 
        handleStopSession();
    }
  }

  const handleStopSession = () => {
    setSessionState('idle');
    setCurrentBatch(0);
  };

  return (
    <div className="min-h-screen bg-slate-900 text-gray-100 font-sans p-4 sm:p-6 lg:p-8">
      <div className="max-w-7xl mx-auto">
        <header className="text-center mb-8">
          <h1 className="text-4xl sm:text-5xl font-bold text-white tracking-tight">
            WhatsApp Direct Sender
          </h1>
          <p className="mt-2 text-lg text-slate-400">
            Import numbers, click to chat, and track your progress.
          </p>
        </header>

        <main>
          <NumberImporter onImport={handleImportNumbers} />

          <div className="mt-8">
            <SessionManager
                sessionState={sessionState}
                message={message}
                setMessage={setMessage}
                onStart={handleStartSession}
                onNext={handleProcessNextNumber}
                onStop={handleStopSession}
                onResend={resendToCompleted}
                onExportCSV={handleExportCSV}
                batchSize={batchSize}
                setBatchSize={setBatchSize}
                currentBatch={currentBatch}
                zohoToken={zohoToken}
                setZohoToken={setZohoToken}
                zohoOrgId={zohoOrgId}
                setZohoOrgId={setZohoOrgId}
                zohoEnabled={zohoEnabled}
                setZohoEnabled={setZohoEnabled}
                delugeWebhookUrl={delugeWebhookUrl}
                setDelugeWebhookUrl={setDelugeWebhookUrl}
                delugeEnabled={delugeEnabled}
                setDelugeEnabled={setDelugeEnabled}
                pendingCount={pendingNumbers.length}
                completedCount={completedNumbers.length}
                totalCount={pendingNumbers.length + completedNumbers.length}
            />
          </div>

          <div className="mt-8 grid grid-cols-1 md:grid-cols-2 gap-8">
            <NumberList
              title="Pending"
              numbers={pendingNumbers}
              onNumberClick={handleNumberSelect}
              isClickable={sessionState === 'idle'}
              emptyMessage="No pending numbers. Import a list to get started."
              status="pending"
            />
            <NumberList
              title="Completed"
              numbers={completedNumbers}
              isClickable={false}
              emptyMessage="No numbers completed yet."
              status="completed"
            />
          </div>
        </main>
        
        <footer className="text-center mt-12 text-slate-500 text-sm">
            <p>Made with ❤️ for efficient communication.</p>
        </footer>
      </div>
    </div>
  );
};

export default App;
