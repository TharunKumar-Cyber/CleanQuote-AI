import React, { useState } from 'react';
import { Menu, X } from 'lucide-react';
import type { AppView } from '../types/quote';
import { Logo } from './Logo';

interface NavbarProps {
  currentView: AppView;
  onNavigate: (view: AppView) => void;
}

export const Navbar: React.FC<NavbarProps> = ({ currentView, onNavigate }) => {
  const [mobileOpen, setMobileOpen] = useState(false);

  const navLinks: { id: AppView; label: string }[] = [
    { id: 'landing', label: 'Overview' },
    { id: 'workspace', label: 'Quote Workspace' },
    { id: 'settings', label: 'Business Settings' },
    { id: 'plans', label: 'Plans & Credits' },
  ];

  const handleSelect = (view: AppView) => {
    onNavigate(view);
    setMobileOpen(false);
  };

  return (
    <header className="sticky top-0 z-40 bg-white/95 backdrop-blur-sm border-b border-slate-200">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between gap-8">
        {/* Zone 1: Brand wordmark */}
        <button
          type="button"
          onClick={() => handleSelect('landing')}
          className="focus:outline-none focus-visible:ring-2 focus-visible:ring-emerald-600 rounded-lg whitespace-nowrap shrink-0"
          aria-label="CleanQuote AI Home"
        >
          <Logo />
        </button>

        {/* Zone 2: Clean typographic nav links */}
        <nav className="hidden md:flex items-center gap-7" aria-label="Primary navigation">
          {navLinks.map((item) => {
            const active = currentView === item.id;
            return (
              <button
                key={item.id}
                type="button"
                onClick={() => handleSelect(item.id)}
                className={`py-1.5 text-sm font-medium transition-colors whitespace-nowrap shrink-0 border-b-2 ${
                  active
                    ? 'text-slate-900 border-emerald-600'
                    : 'text-slate-600 border-transparent hover:text-slate-900 hover:border-slate-300'
                }`}
              >
                {item.label}
              </button>
            );
          })}
        </nav>

        {/* Zone 3: Single primary action */}
        <div className="hidden md:flex items-center shrink-0">
          <button
            type="button"
            onClick={() => handleSelect('workspace')}
            className="px-4 py-2 rounded-lg bg-emerald-600 text-white text-sm font-semibold hover:bg-emerald-700 transition-colors whitespace-nowrap shrink-0 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-emerald-600 focus-visible:ring-offset-2"
          >
            Create Quote
          </button>
        </div>

        {/* Mobile menu button */}
        <button
          type="button"
          onClick={() => setMobileOpen((prev) => !prev)}
          className="md:hidden min-h-[44px] min-w-[44px] flex items-center justify-center rounded-lg text-slate-700 hover:bg-slate-100"
          aria-label="Toggle navigation menu"
          aria-expanded={mobileOpen}
        >
          {mobileOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
        </button>
      </div>

      {/* Mobile Menu */}
      {mobileOpen && (
        <div className="md:hidden border-t border-slate-200 bg-white px-4 py-3 space-y-1.5">
          {navLinks.map((item) => (
            <button
              key={item.id}
              type="button"
              onClick={() => handleSelect(item.id)}
              className={`w-full text-left px-3 py-2.5 min-h-[44px] rounded-lg text-sm font-medium transition-colors ${
                currentView === item.id
                  ? 'bg-emerald-50 text-emerald-800'
                  : 'text-slate-700 hover:bg-slate-100'
              }`}
            >
              {item.label}
            </button>
          ))}
          <div className="pt-2 border-t border-slate-100">
            <button
              type="button"
              onClick={() => handleSelect('workspace')}
              className="w-full py-2.5 px-4 min-h-[44px] rounded-lg bg-emerald-600 text-white text-sm font-semibold hover:bg-emerald-700 transition-colors"
            >
              Create Quote
            </button>
          </div>
        </div>
      )}
    </header>
  );
};
