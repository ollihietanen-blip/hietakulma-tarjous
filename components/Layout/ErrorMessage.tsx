import React from 'react';
import { AlertCircle, X } from 'lucide-react';

interface ErrorMessageProps {
  message: string;
  onDismiss?: () => void;
  className?: string;
  variant?: 'error' | 'warning' | 'info';
}

const ErrorMessage: React.FC<ErrorMessageProps> = ({ 
  message, 
  onDismiss,
  className = '',
  variant = 'error'
}) => {
  const variantClasses = {
    error: 'bg-red-50 border-red-200 text-red-800',
    warning: 'bg-amber-50 border-amber-200 text-amber-800',
    info: 'bg-blue-50 border-blue-200 text-blue-800'
  };

  const iconColors = {
    error: 'text-red-600',
    warning: 'text-amber-600',
    info: 'text-blue-600'
  };

  return (
    <div className={`flex items-start gap-3 p-4 rounded-lg border ${variantClasses[variant]} ${className}`}>
      <AlertCircle className={`${iconColors[variant]} flex-shrink-0 mt-0.5`} size={20} />
      <div className="flex-1 text-sm font-medium">{message}</div>
      {onDismiss && (
        <button
          onClick={onDismiss}
          className={`flex-shrink-0 ${iconColors[variant]} hover:opacity-70 transition-opacity`}
        >
          <X size={18} />
        </button>
      )}
    </div>
  );
};

export default ErrorMessage;
