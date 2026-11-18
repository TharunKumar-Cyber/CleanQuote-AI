import type { BusinessSettings, CreditState } from '../types/quote';

const SETTINGS_KEY = 'cleanquote_business_settings_v1';
const CREDITS_KEY = 'cleanquote_demo_credits_v1';

export const DEFAULT_BUSINESS_SETTINGS: BusinessSettings = {
  businessName: 'Sparkle & Shine Home Cleaning',
  businessEmail: 'quotes@yourcleaningbiz.com',
  phoneNumber: '(555) 234-5678',
  businessAddress: '120 Maple Avenue, Suite 4B, Austin, TX 78701',
  currency: 'USD',
  logoDataUrl: '',
  paymentTerms: 'Payment due upon completion of service via card, bank transfer, or cash.',
  validityDays: 14,
};

export const INITIAL_DEMO_CREDITS: CreditState = {
  planName: 'Free (Local MVP Demo)',
  remainingCredits: 2,
  totalUsed: 0,
  isDemoMode: true,
};

export function loadBusinessSettings(): BusinessSettings {
  try {
    const raw = localStorage.getItem(SETTINGS_KEY);
    if (!raw) return DEFAULT_BUSINESS_SETTINGS;
    const parsed = JSON.parse(raw) as Partial<BusinessSettings>;
    return {
      ...DEFAULT_BUSINESS_SETTINGS,
      ...parsed,
      validityDays:
        typeof parsed.validityDays === 'number' && parsed.validityDays > 0
          ? parsed.validityDays
          : DEFAULT_BUSINESS_SETTINGS.validityDays,
    };
  } catch {
    return DEFAULT_BUSINESS_SETTINGS;
  }
}

export function saveBusinessSettings(settings: BusinessSettings): void {
  localStorage.setItem(SETTINGS_KEY, JSON.stringify(settings));
}

export function loadCreditState(): CreditState {
  try {
    const raw = localStorage.getItem(CREDITS_KEY);
    if (!raw) {
      localStorage.setItem(CREDITS_KEY, JSON.stringify(INITIAL_DEMO_CREDITS));
      return INITIAL_DEMO_CREDITS;
    }
    const parsed = JSON.parse(raw) as Partial<CreditState>;
    return {
      planName:
        typeof parsed.planName === 'string' ? parsed.planName : INITIAL_DEMO_CREDITS.planName,
      remainingCredits:
        typeof parsed.remainingCredits === 'number' && parsed.remainingCredits >= 0
          ? parsed.remainingCredits
          : INITIAL_DEMO_CREDITS.remainingCredits,
      totalUsed:
        typeof parsed.totalUsed === 'number' && parsed.totalUsed >= 0 ? parsed.totalUsed : 0,
      isDemoMode: true,
    };
  } catch {
    return INITIAL_DEMO_CREDITS;
  }
}

export function saveCreditState(state: CreditState): void {
  localStorage.setItem(CREDITS_KEY, JSON.stringify(state));
}

export function resetFreeDemoCredits(): CreditState {
  const next: CreditState = {
    ...INITIAL_DEMO_CREDITS,
  };
  saveCreditState(next);
  return next;
}
