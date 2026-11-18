/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState } from 'react';
import type { AppView, BusinessSettings, CreditState } from './types/quote';
import {
  loadBusinessSettings,
  loadCreditState,
  resetFreeDemoCredits,
  saveBusinessSettings,
  saveCreditState,
} from './utils/storage';
import { Navbar } from './components/Navbar';
import { LandingPage } from './components/LandingPage';
import { QuoteWorkspace } from './components/QuoteWorkspace';
import { BusinessSettingsView } from './components/BusinessSettingsView';
import { PlansCreditsView } from './components/PlansCreditsView';

export function App() {
  const [currentView, setCurrentView] = useState<AppView>('landing');
  const [businessSettings, setBusinessSettings] = useState<BusinessSettings>(() =>
    loadBusinessSettings()
  );
  const [credits, setCredits] = useState<CreditState>(() => loadCreditState());

  const handleSaveSettings = (next: BusinessSettings) => {
    setBusinessSettings(next);
    saveBusinessSettings(next);
  };

  const handleConsumeCredit = () => {
    setCredits((prev) => {
      const next: CreditState = {
        ...prev,
        remainingCredits: Math.max(0, prev.remainingCredits - 1),
        totalUsed: prev.totalUsed + 1,
      };
      saveCreditState(next);
      return next;
    });
  };

  const handleResetDemoCredits = () => {
    const next = resetFreeDemoCredits();
    setCredits(next);
  };

  return (
    <div className="min-h-screen flex flex-col bg-[#F8FAFC] text-slate-900">
      <Navbar currentView={currentView} onNavigate={setCurrentView} />

      <main className="flex-1">
        {currentView === 'landing' && (
          <LandingPage
            onStartQuote={() => setCurrentView('workspace')}
            onViewPlans={() => setCurrentView('plans')}
          />
        )}

        {currentView === 'workspace' && (
          <QuoteWorkspace
            businessSettings={businessSettings}
            credits={credits}
            onConsumeCredit={handleConsumeCredit}
            onGoToPlans={() => setCurrentView('plans')}
            onGoToSettings={() => setCurrentView('settings')}
          />
        )}

        {currentView === 'settings' && (
          <BusinessSettingsView settings={businessSettings} onSave={handleSaveSettings} />
        )}

        {currentView === 'plans' && (
          <PlansCreditsView credits={credits} onResetFreeDemo={handleResetDemoCredits} />
        )}
      </main>
    </div>
  );
}

export default App;
