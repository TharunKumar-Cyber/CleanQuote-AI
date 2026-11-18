import { jsPDF } from 'jspdf';
import autoTable from 'jspdf-autotable';
import type { BusinessSettings, ExtractedJobDetails, PricingState } from '../types/quote';
import { calculateLineTotal, calculateQuoteTotals, formatMoney } from './calculations';

export interface PdfQuoteInput {
  quotationNumber: string;
  issueDate: string;
  business: BusinessSettings;
  extracted: ExtractedJobDetails;
  pricing: PricingState;
}

function getValidUntilDate(issueDateStr: string, validityDays: number): string {
  const base = new Date(issueDateStr);
  if (Number.isNaN(base.getTime())) {
    const now = new Date();
    now.setDate(now.getDate() + validityDays);
    return now.toISOString().slice(0, 10);
  }
  base.setDate(base.getDate() + Math.max(1, validityDays));
  return base.toISOString().slice(0, 10);
}

function detectImageFormat(dataUrl: string): 'PNG' | 'JPEG' | 'WEBP' {
  if (dataUrl.startsWith('data:image/jpeg') || dataUrl.startsWith('data:image/jpg')) return 'JPEG';
  if (dataUrl.startsWith('data:image/webp')) return 'WEBP';
  return 'PNG';
}

export function generateQuotationPdf(input: PdfQuoteInput): void {
  const { quotationNumber, issueDate, business, extracted, pricing } = input;
  const doc = new jsPDF({ orientation: 'portrait', unit: 'mm', format: 'a4' });
  const pageWidth = doc.internal.pageSize.getWidth();
  const margin = 16;
  let y = 18;

  // Header accent strip
  doc.setFillColor(5, 150, 105);
  doc.rect(0, 0, pageWidth, 4, 'F');

  // Business Logo (optional)
  let textStartX = margin;
  if (business.logoDataUrl) {
    try {
      const format = detectImageFormat(business.logoDataUrl);
      doc.addImage(business.logoDataUrl, format, margin, y, 22, 22, undefined, 'FAST');
      textStartX = margin + 27;
    } catch {
      textStartX = margin;
    }
  }

  // Business Details (Left)
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(15);
  doc.setTextColor(17, 24, 39);
  doc.text(business.businessName || 'Cleaning Services', textStartX, y + 5);

  doc.setFont('helvetica', 'normal');
  doc.setFontSize(9.5);
  doc.setTextColor(75, 85, 99);
  let bizY = y + 11;
  if (business.businessAddress) {
    const addrLines = doc.splitTextToSize(business.businessAddress, 85) as string[];
    doc.text(addrLines, textStartX, bizY);
    bizY += addrLines.length * 4.5;
  }
  if (business.businessEmail) {
    doc.text(business.businessEmail, textStartX, bizY);
    bizY += 4.5;
  }
  if (business.phoneNumber) {
    doc.text(business.phoneNumber, textStartX, bizY);
    bizY += 4.5;
  }

  // Quotation Metadata (Right)
  const rightX = pageWidth - margin;
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(20);
  doc.setTextColor(5, 150, 105);
  doc.text('QUOTATION', rightX, y + 6, { align: 'right' });

  doc.setFont('helvetica', 'normal');
  doc.setFontSize(9.5);
  doc.setTextColor(55, 65, 81);
  const validUntil = getValidUntilDate(issueDate, business.validityDays);
  doc.text(`Quote #: ${quotationNumber}`, rightX, y + 14, { align: 'right' });
  doc.text(`Issue Date: ${issueDate}`, rightX, y + 19, { align: 'right' });
  doc.text(`Valid Until: ${validUntil}`, rightX, y + 24, { align: 'right' });

  y = Math.max(bizY + 6, y + 32);

  // Divider
  doc.setDrawColor(226, 232, 240);
  doc.line(margin, y, pageWidth - margin, y);
  y += 8;

  // Two-column Client & Property Details
  const colMid = pageWidth / 2 + 4;
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(10);
  doc.setTextColor(17, 24, 39);
  doc.text('PREPARED FOR', margin, y);
  doc.text('SERVICE SCOPE SUMMARY', colMid, y);
  y += 5.5;

  doc.setFont('helvetica', 'normal');
  doc.setFontSize(9.5);
  doc.setTextColor(55, 65, 81);

  const clientLines = [
    extracted.customerName || 'Valued Customer',
    extracted.customerEmail || 'Email not provided',
    extracted.requestedDate
      ? `Requested Date: ${extracted.requestedDate}`
      : 'Requested Date: To be confirmed',
  ];
  doc.text(clientLines, margin, y);

  const scopeParts: string[] = [];
  if (extracted.serviceType) scopeParts.push(`Service: ${extracted.serviceType}`);
  const bedBath = [
    extracted.bedrooms ? `${extracted.bedrooms} Bed` : '',
    extracted.bathrooms ? `${extracted.bathrooms} Bath` : '',
  ]
    .filter(Boolean)
    .join(' / ');
  if (bedBath) scopeParts.push(`Rooms: ${bedBath}`);
  if (extracted.propertySize) scopeParts.push(`Property Size: ${extracted.propertySize}`);
  if (extracted.additionalServices.length > 0) {
    scopeParts.push(`Add-ons: ${extracted.additionalServices.join(', ')}`);
  }
  if (scopeParts.length === 0) {
    scopeParts.push('Custom residential cleaning scope');
  }

  const wrappedScope = doc.splitTextToSize(
    scopeParts.join('\n'),
    pageWidth - margin - colMid
  ) as string[];
  doc.text(wrappedScope, colMid, y);

  y += Math.max(clientLines.length, wrappedScope.length) * 4.8 + 8;

  // Service Line Items Table
  const tableRows = pricing.lineItems.map((item) => [
    item.description || 'Cleaning Service',
    String(item.quantity),
    formatMoney(item.unitPrice, business.currency),
    formatMoney(calculateLineTotal(item.quantity, item.unitPrice), business.currency),
  ]);

  let tableEndY = y + 20;

  autoTable(doc, {
    startY: y,
    head: [['Service Description', 'Qty', 'Unit Price', 'Total']],
    body: tableRows,
    margin: { left: margin, right: margin },
    theme: 'grid',
    headStyles: {
      fillColor: [15, 23, 42],
      textColor: [255, 255, 255],
      fontStyle: 'bold',
      fontSize: 9.5,
      cellPadding: 3.5,
    },
    bodyStyles: {
      textColor: [30, 41, 59],
      fontSize: 9.5,
      cellPadding: 3.5,
    },
    columnStyles: {
      0: { cellWidth: 'auto' },
      1: { halign: 'center', cellWidth: 20 },
      2: { halign: 'right', cellWidth: 34 },
      3: { halign: 'right', cellWidth: 34 },
    },
    didDrawPage: (data) => {
      if (data.cursor?.y) {
        tableEndY = data.cursor.y;
      }
    },
  });

  const lastTable = (doc as unknown as { lastAutoTable?: { finalY?: number } }).lastAutoTable;
  y = (lastTable?.finalY ?? tableEndY) + 8;

  // Totals Block (Right-aligned)
  const totals = calculateQuoteTotals(pricing);
  const labelX = pageWidth - margin - 68;
  const valueX = pageWidth - margin;

  doc.setFont('helvetica', 'normal');
  doc.setFontSize(9.5);
  doc.setTextColor(71, 85, 105);

  doc.text('Subtotal:', labelX, y);
  doc.text(formatMoney(totals.subtotal, business.currency), valueX, y, { align: 'right' });
  y += 6;

  if (totals.discountAmount > 0) {
    const discountLabel =
      pricing.discountType === 'percent' ? `Discount (${pricing.discountValue}%):` : 'Discount:';
    doc.text(discountLabel, labelX, y);
    doc.text(`-${formatMoney(totals.discountAmount, business.currency)}`, valueX, y, {
      align: 'right',
    });
    y += 6;
  }

  if (pricing.taxRatePercent > 0) {
    doc.text(`Tax (${pricing.taxRatePercent}%):`, labelX, y);
    doc.text(formatMoney(totals.taxAmount, business.currency), valueX, y, { align: 'right' });
    y += 6;
  }

  doc.setDrawColor(203, 213, 225);
  doc.line(labelX, y, valueX, y);
  y += 6.5;

  doc.setFont('helvetica', 'bold');
  doc.setFontSize(12);
  doc.setTextColor(5, 150, 105);
  doc.text('Total Amount:', labelX, y);
  doc.text(formatMoney(totals.finalTotal, business.currency), valueX, y, { align: 'right' });
  y += 12;

  // Special Instructions (if any)
  if (extracted.specialInstructions.trim()) {
    if (y > 245) {
      doc.addPage();
      y = 20;
    }
    doc.setFont('helvetica', 'bold');
    doc.setFontSize(10);
    doc.setTextColor(17, 24, 39);
    doc.text('Special Instructions & Notes', margin, y);
    y += 5;

    doc.setFont('helvetica', 'normal');
    doc.setFontSize(9);
    doc.setTextColor(71, 85, 105);
    const noteLines = doc.splitTextToSize(
      extracted.specialInstructions,
      pageWidth - margin * 2
    ) as string[];
    doc.text(noteLines, margin, y);
    y += noteLines.length * 4.5 + 8;
  }

  // Terms and Conditions
  if (y > 250) {
    doc.addPage();
    y = 20;
  }
  doc.setDrawColor(226, 232, 240);
  doc.line(margin, y, pageWidth - margin, y);
  y += 7;

  doc.setFont('helvetica', 'bold');
  doc.setFontSize(10);
  doc.setTextColor(17, 24, 39);
  doc.text('Terms & Conditions', margin, y);
  y += 5;

  doc.setFont('helvetica', 'normal');
  doc.setFontSize(8.8);
  doc.setTextColor(71, 85, 105);

  const termsText = [
    business.paymentTerms || 'Payment is due upon completion of service.',
    `This quotation is valid for ${business.validityDays} days from the issue date (${validUntil}).`,
    'Final scope may be adjusted with customer approval if on-site property conditions differ substantially from the initial description.',
  ].join('\n');

  const wrappedTerms = doc.splitTextToSize(termsText, pageWidth - margin * 2) as string[];
  doc.text(wrappedTerms, margin, y);

  const safeFilename = `${quotationNumber.replace(/[^a-zA-Z0-9-_]/g, '_')}.pdf`;
  doc.save(safeFilename);
}
