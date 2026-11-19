export type AppView = 'landing' | 'workspace' | 'settings' | 'plans' | 'auth';

export interface ExtractedJobDetails {
  isValidCleaningRequest: boolean;
  validationMessage: string;
  customerName: string;
  customerEmail: string;
  serviceAddress: string;
  serviceType: string;
  bedrooms: string;
  bathrooms: string;
  propertySize: string;
  additionalServices: string[];
  requestedDate: string;
  specialInstructions: string;
  missingInformation: string[];
}

export interface LineItem {
  id: string;
  description: string;
  quantity: number;
  unitPrice: number;
}

export type DiscountType = 'fixed' | 'percent';

export interface PricingState {
  lineItems: LineItem[];
  discountType: DiscountType;
  discountValue: number;
  taxRatePercent: number;
}

export interface BusinessSettings {
  businessName: string;
  businessEmail: string;
  phoneNumber: string;
  businessAddress: string;
  currency: string;
  logoDataUrl: string;
  paymentTerms: string;
  validityDays: number;
}

export interface PlanDefinition {
  id: 'free' | 'starter' | 'business' | 'pro';
  name: string;
  audience: string;
  priceLabel: string;
  priceUsd: number;
  credits: number;
  description: string;
  features: string[];
  highlighted?: boolean;
}

export interface CreditState {
  planName: string;
  remainingCredits: number;
  totalUsed: number;
  isDemoMode: boolean;
}
