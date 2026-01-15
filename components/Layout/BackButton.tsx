import React from 'react';
import { ArrowLeft } from 'lucide-react';

interface BackButtonProps {
  onClick: () => void;
  label?: string;
  className?: string;
}

const BackButton: React.FC<BackButtonProps> = ({ onClick, label = 'Takaisin', className = '' }) => {
  return (
    <button
      onClick={onClick}
      className={`flex items-center gap-2 text-slate-600 hover:text-slate-900 font-medium transition-colors group ${className}`}
    >
      <ArrowLeft size={16} className="group-hover:-translate-x-0.5 transition-transform" />
      <span>{label}</span>
    </button>
  );
};

export default BackButton;
