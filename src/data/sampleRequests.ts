export interface SampleRequest {
  id: string;
  label: string;
  message: string;
}

export const SAMPLE_REQUESTS: SampleRequest[] = [
  {
    id: 'deep-clean',
    label: '3-Bed Deep Clean',
    message:
      'Hi! My name is Sarah Jenkins (sarah.jenkins@example.com). Looking for a thorough deep clean of our 3 bedroom, 2.5 bathroom home (~2,100 sq ft) next Friday, November 27. Could you also clean inside the oven and refrigerator? We have one friendly golden retriever and prefer eco-friendly products if possible. Thanks!',
  },
  {
    id: 'move-out',
    label: 'Move-Out (Incomplete)',
    message:
      'Hey there, moving out of my apartment at the end of this month and need a move-out clean so I can get my deposit back. It has 2 bedrooms. Please send me a quote when you can.',
  },
  {
    id: 'recurring',
    label: 'Bi-Weekly Standard',
    message:
      'Hello, we are looking for recurring bi-weekly standard cleaning for our 4 bed / 3 bath house (approx 2,800 sq ft). Can we start Tuesday morning? Gate code will be shared once booked. Contact: mark.ross@example.com.',
  },
];
