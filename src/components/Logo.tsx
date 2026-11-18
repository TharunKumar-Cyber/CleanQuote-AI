import React from 'react';

interface LogoProps {
  size?: 'sm' | 'md';
}

export const Logo: React.FC<LogoProps> = ({ size = 'md' }) => {
  const iconBox = size === 'sm' ? 'h-7 w-7' : 'h-8 w-8';
  const textSize = size === 'sm' ? 'text-base' : 'text-lg';

  return (
    <div className="inline-flex items-center gap-2.5 select-none whitespace-nowrap shrink-0">
      <div
        className={`${iconBox} rounded-lg bg-emerald-600 text-white flex items-center justify-center shrink-0`}
      >
        <svg
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          strokeWidth="2.1"
          strokeLinecap="round"
          strokeLinejoin="round"
          className="w-4 h-4"
          aria-hidden="true"
        >
          <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z" />
          <polyline points="14 2 14 8 20 8" />
          <path d="m9 15 2 2 4-4" />
        </svg>
      </div>
      <span className={`${textSize} font-display font-bold tracking-tight text-slate-900`}>
        CleanQuote <span className="text-emerald-600">AI</span>
      </span>
    </div>
  );
};
