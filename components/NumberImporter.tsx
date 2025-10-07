
import React, { useState, useCallback } from 'react';

interface NumberImporterProps {
  onImport: (numbers: string[]) => void;
}

const NumberImporter: React.FC<NumberImporterProps> = ({ onImport }) => {
  const [rawText, setRawText] = useState('');

  const handleImport = useCallback(() => {
    if (!rawText.trim()) return;

    // Split by newlines, commas, or semicolons
    const cleanedNumbers = rawText
      .split(/[\n,;]+/)
      .map(n => n.trim())
      // Basic validation: must have some digits, can have +, -, (), spaces
      .filter(n => n.length > 0 && /^\+?[0-9\s-()]+$/.test(n));

    // Remove duplicates using a Set
    const uniqueNumbers = Array.from(new Set(cleanedNumbers));

    if (uniqueNumbers.length > 0) {
      onImport(uniqueNumbers);
    }
    
    setRawText('');
  }, [rawText, onImport]);

  return (
    <div className="bg-slate-800 p-6 rounded-lg shadow-lg border border-slate-700">
      <label htmlFor="number-input" className="block text-lg font-medium text-slate-300 mb-2">
        Import Mobile Numbers
      </label>
      <p className="text-sm text-slate-400 mb-4">
        Paste numbers separated by a new line, comma, or semicolon.
      </p>
      <textarea
        id="number-input"
        value={rawText}
        onChange={(e) => setRawText(e.target.value)}
        placeholder="e.g., +1 (555) 123-4567&#10;+44 20 7946 0958"
        rows={6}
        className="w-full bg-slate-900 border border-slate-600 rounded-md p-3 text-slate-200 placeholder-slate-500 focus:ring-2 focus:ring-sky-500 focus:border-sky-500 transition duration-200"
      />
      <button
        onClick={handleImport}
        className="mt-4 w-full bg-sky-600 text-white font-bold py-3 px-4 rounded-md hover:bg-sky-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-offset-slate-800 focus:ring-sky-500 transition-colors duration-300 disabled:bg-slate-600 disabled:cursor-not-allowed"
        disabled={!rawText.trim()}
      >
        Import Numbers
      </button>
    </div>
  );
};

export default NumberImporter;
