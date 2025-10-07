
import React from 'react';
import { WhatsappIcon } from './icons/Icons';

interface NumberItemProps {
  number: string;
  onClick?: (number: string) => void;
  isClickable: boolean;
  status: 'pending' | 'completed';
}

const NumberItem: React.FC<NumberItemProps> = ({ number, onClick, isClickable, status }) => {
  const commonClasses = "flex items-center justify-between w-full p-3 rounded-md transition-colors duration-200 text-left";

  if (status === 'completed') {
    return (
      <li>
        <div className={`${commonClasses} bg-slate-700/50 cursor-default`}>
          <span className="font-mono text-slate-400 line-through">{number}</span>
        </div>
      </li>
    );
  }

  // If status is 'pending'
  return (
    <li>
      <button
        onClick={() => onClick && onClick(number)}
        disabled={!isClickable}
        className={`${commonClasses} bg-slate-700 ${isClickable ? 'hover:bg-sky-800 group' : 'opacity-60 cursor-not-allowed'}`}
      >
        <span className="font-mono text-slate-200 group-hover:text-white">{number}</span>
        <WhatsappIcon className={`h-6 w-6 text-green-400 transition-all ${isClickable ? 'opacity-70 group-hover:opacity-100 group-hover:scale-110' : 'opacity-40'}`} />
      </button>
    </li>
  );
};

export default NumberItem;
