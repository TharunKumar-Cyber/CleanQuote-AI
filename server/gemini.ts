import { GoogleGenAI, ThinkingLevel, Type } from '@google/genai';

export interface GeminiExtractionResult {
  isValidCleaningRequest: boolean;
  validationMessage: string;
  customerName: string;
  customerEmail: string;
  serviceType: string;
  bedrooms: string;
  bathrooms: string;
  propertySize: string;
  additionalServices: string[];
  requestedDate: string;
  specialInstructions: string;
  missingInformation: string[];
}

const extractionSchema = {
  type: Type.OBJECT,
  properties: {
    isValidCleaningRequest: {
      type: Type.BOOLEAN,
      description:
        'True if the message is a plausible cleaning service inquiry; false if gibberish, spam, or unrelated.',
    },
    validationMessage: {
      type: Type.STRING,
      description:
        'Brief helpful explanation if the message is incomplete or unrelated to cleaning services; empty string if clear.',
    },
    customerName: {
      type: Type.STRING,
      description:
        'Customer full or first name ONLY if explicitly stated in the message; otherwise empty string.',
    },
    customerEmail: {
      type: Type.STRING,
      description:
        'Customer email address ONLY if explicitly stated in the message; otherwise empty string.',
    },
    serviceType: {
      type: Type.STRING,
      description:
        'Type of cleaning requested (e.g., Standard Cleaning, Deep Cleaning, Move-In / Move-Out Cleaning, Post-Construction Cleaning, Office Cleaning). Empty string if unclear.',
    },
    bedrooms: {
      type: Type.STRING,
      description: 'Number of bedrooms stated (e.g., "3"), or empty string if not mentioned.',
    },
    bathrooms: {
      type: Type.STRING,
      description: 'Number of bathrooms stated (e.g., "2.5"), or empty string if not mentioned.',
    },
    propertySize: {
      type: Type.STRING,
      description: 'Property square footage or size description if stated; otherwise empty string.',
    },
    additionalServices: {
      type: Type.ARRAY,
      items: { type: Type.STRING },
      description:
        'List of requested add-ons such as inside oven, interior fridge, window tracks, laundry, carpet steam cleaning, etc.',
    },
    requestedDate: {
      type: Type.STRING,
      description: 'Requested service date or timeframe ONLY if mentioned; otherwise empty string.',
    },
    specialInstructions: {
      type: Type.STRING,
      description: 'Pets, access codes, parking, eco-friendly product requests, or special focus areas.',
    },
    missingInformation: {
      type: Type.ARRAY,
      items: { type: Type.STRING },
      description:
        'Clear checklist of important quoting details missing from the customer message (e.g., property size, number of bathrooms, preferred date, contact email, parking/access info).',
    },
  },
  required: [
    'isValidCleaningRequest',
    'validationMessage',
    'customerName',
    'customerEmail',
    'serviceType',
    'bedrooms',
    'bathrooms',
    'propertySize',
    'additionalServices',
    'requestedDate',
    'specialInstructions',
    'missingInformation',
  ],
};

const SYSTEM_INSTRUCTION = `
You are an assistant for independent residential and light-commercial cleaning businesses.
Your ONLY job is to extract structured job scoping facts from an unstructured customer inquiry.

STRICT RULES:
1. NEVER fabricate or guess customer details (name, email, phone, address, dates, bedroom/bathroom counts, or square footage). If not stated in the message, return an empty string "".
2. NEVER generate, estimate, or suggest prices, hourly rates, discounts, or total quote amounts.
3. Identify any important missing details needed to prepare an accurate cleaning quote and list them in "missingInformation".
4. If the message is empty, nonsensical, or unrelated to cleaning services, set "isValidCleaningRequest" to false and explain briefly in "validationMessage".
5. Return ONLY valid JSON adhering strictly to the provided responseSchema.
`.trim();

export function isGeminiConfigured(): boolean {
  const key = process.env.GEMINI_API_KEY?.trim();
  return Boolean(key && key.length > 10 && key !== 'MY_GEMINI_API_KEY');
}

export async function extractCleaningRequest(message: string): Promise<GeminiExtractionResult> {
  const apiKey = process.env.GEMINI_API_KEY?.trim();
  if (!apiKey || apiKey === 'MY_GEMINI_API_KEY') {
    throw new Error('GEMINI_NOT_CONFIGURED');
  }

  const ai = new GoogleGenAI({
    apiKey,
    httpOptions: {
      headers: {
        'User-Agent': 'aistudio-build',
      },
    },
  });

  const response = await ai.models.generateContent({
    model: 'gemini-4-hydrogen',
    contents: `Extract structured cleaning job details from the following customer message:\n\n"""\n${message}\n"""`,
    config: {
      systemInstruction: SYSTEM_INSTRUCTION,
      responseMimeType: 'application/json',
      responseSchema: extractionSchema,
      thinkingConfig: {
        thinkingLevel: ThinkingLevel.LOW,
      },
    },
  });

  const rawText = response.text?.trim();
  if (!rawText) {
    throw new Error('Gemini returned an empty response.');
  }

  const parsed = JSON.parse(rawText) as Partial<GeminiExtractionResult>;

  return {
    isValidCleaningRequest: Boolean(parsed.isValidCleaningRequest ?? true),
    validationMessage: typeof parsed.validationMessage === 'string' ? parsed.validationMessage.trim() : '',
    customerName: typeof parsed.customerName === 'string' ? parsed.customerName.trim() : '',
    customerEmail: typeof parsed.customerEmail === 'string' ? parsed.customerEmail.trim() : '',
    serviceType: typeof parsed.serviceType === 'string' ? parsed.serviceType.trim() : '',
    bedrooms: typeof parsed.bedrooms === 'string' ? parsed.bedrooms.trim() : '',
    bathrooms: typeof parsed.bathrooms === 'string' ? parsed.bathrooms.trim() : '',
    propertySize: typeof parsed.propertySize === 'string' ? parsed.propertySize.trim() : '',
    additionalServices: Array.isArray(parsed.additionalServices)
      ? parsed.additionalServices.filter((s): s is string => typeof s === 'string' && s.trim().length > 0)
      : [],
    requestedDate: typeof parsed.requestedDate === 'string' ? parsed.requestedDate.trim() : '',
    specialInstructions:
      typeof parsed.specialInstructions === 'string' ? parsed.specialInstructions.trim() : '',
    missingInformation: Array.isArray(parsed.missingInformation)
      ? parsed.missingInformation.filter((s): s is string => typeof s === 'string' && s.trim().length > 0)
      : [],
  };
}
