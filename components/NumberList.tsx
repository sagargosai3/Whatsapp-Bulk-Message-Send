
import React from 'react';
import NumberItem from './NumberItem';

interface NumberListProps {
  title: string;
  numbers: string[];
  onNumberClick?: (number: string) => void;
  isClickable: boolean;
  emptyMessage: string;
  status: 'pending' | 'completed';
}

const NumberList: React.FC<NumberListProps> = ({ title, numbers, onNumberClick, isClickable, emptyMessage, status }) => {
  return (
    <div className="bg-slate-800 p-6 rounded-lg shadow-lg border border-slate-700 flex flex-col h-full">
      <div className="flex justify-between items-center mb-4">
        <h2 className="text-2xl font-bold text-white">{title}</h2>
        <span className="bg-slate-700 text-sky-300 text-sm font-semibold px-3 py-1 rounded-full">
          {numbers.length}
        </span>
      </div>
      <div className="overflow-y-auto flex-grow pr-2 -mr-2" style={{maxHeight: '400px'}}>
        {numbers.length > 0 ? (
          <ul className="space-y-2">
            {numbers.map((number, index) => (
              <NumberItem
                key={`${number}-${index}`}
                number={number}
                onClick={onNumberClick}
                isClickable={isClickable}
                status={status}
              />
            ))}
          </ul>
        ) : (
          <div className="flex items-center justify-center h-full text-slate-500 italic p-8">
            {emptyMessage}
          </div>
        )}
      </div>
    </div>
  );
};

export default NumberList;
