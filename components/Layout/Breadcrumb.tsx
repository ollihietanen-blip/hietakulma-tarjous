import React from 'react';
import { ChevronRight, Home } from 'lucide-react';

export interface BreadcrumbItem {
  label: string;
  onClick?: () => void;
}

interface BreadcrumbProps {
  items: BreadcrumbItem[];
  className?: string;
}

const Breadcrumb: React.FC<BreadcrumbProps> = ({ items, className = '' }) => {
  if (items.length === 0) return null;

  return (
    <nav className={`flex items-center gap-2 text-sm ${className}`} aria-label="Breadcrumb">
      <ol className="flex items-center gap-2 flex-wrap">
        {items.map((item, index) => {
          const isLast = index === items.length - 1;
          
          return (
            <li key={index} className="flex items-center gap-2">
              {index === 0 && (
                <Home size={14} className="text-slate-400" />
              )}
              {item.onClick && !isLast ? (
                <button
                  onClick={item.onClick}
                  className="text-slate-500 hover:text-slate-900 font-medium transition-colors"
                >
                  {item.label}
                </button>
              ) : (
                <span className={isLast ? 'text-slate-900 font-bold' : 'text-slate-500 font-medium'}>
                  {item.label}
                </span>
              )}
              {!isLast && (
                <ChevronRight size={14} className="text-slate-400" />
              )}
            </li>
          );
        })}
      </ol>
    </nav>
  );
};

export default Breadcrumb;
