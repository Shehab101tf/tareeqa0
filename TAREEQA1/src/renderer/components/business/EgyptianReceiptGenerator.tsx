// Egyptian Receipt Generator - Tax Compliant
import React from 'react';
import { useTranslation } from 'react-i18next';
import { useRTL } from '../common/RTLProvider-fixed';
import { Printer, Download, Eye } from 'lucide-react';
import GlassCard from '../ui/GlassCard';
import GlassButton from '../ui/GlassButton';

export interface EgyptianReceiptData {
  receiptNumber: string;
  date: Date;
  time: Date;
  
  // Store Information (Required by Egyptian tax law)
  storeName: string;
  storeNameEn?: string;
  taxRegistrationNumber: string; // رقم التسجيل الضريبي
  commercialRegistrationNumber: string; // رقم السجل التجاري
  storeAddress: string;
  storePhone: string;
  
  // Transaction Details
  items: Array<{
    name: string;
    nameEn?: string;
    quantity: number;
    unitPrice: number;
    totalPrice: number;
    vatRate: number;
    vatAmount: number;
    isVATExempt?: boolean;
  }>;
  
  subtotal: number;
  totalVAT: number;
  discountAmount?: number;
  total: number;
  
  // Payment Information
  paymentMethod: 'cash' | 'card' | 'meeza' | 'bank-transfer';
  amountPaid?: number;
  change?: number;
  
  // Customer Information (Optional)
  customerName?: string;
  customerTaxNumber?: string;
  
  // Cashier Information
  cashierName: string;
  cashierId: string;
}

interface EgyptianReceiptGeneratorProps {
  receiptData: EgyptianReceiptData;
  onPrint?: () => void;
  onDownload?: () => void;
  onPreview?: () => void;
  className?: string;
}

export const EgyptianReceiptGenerator: React.FC<EgyptianReceiptGeneratorProps> = ({
  receiptData,
  onPrint,
  onDownload,
  onPreview,
  className = ''
}: EgyptianReceiptGeneratorProps) => {
  const { t } = useTranslation();
  const { isRTL, formatCurrency, formatNumber } = useRTL();

  const generateReceiptHTML = (): string => {
    const formatDate = (date: Date) => {
      return new Intl.DateTimeFormat('ar-EG', {
        year: 'numeric',
        month: '2-digit',
        day: '2-digit'
      }).format(date);
    };

    const formatTime = (time: Date) => {
      return new Intl.DateTimeFormat('ar-EG', {
        hour: '2-digit',
        minute: '2-digit',
        second: '2-digit',
        hour12: false
      }).format(time);
    };

    return `
      <!DOCTYPE html>
      <html dir="rtl" lang="ar">
      <head>
        <meta charset="UTF-8">
        <meta name="viewport" content="width=device-width, initial-scale=1.0">
        <title>فاتورة ضريبية - ${receiptData.receiptNumber}</title>
        <style>
          body {
            font-family: 'Cairo', 'Arial', sans-serif;
            font-size: 12px;
            line-height: 1.4;
            margin: 0;
            padding: 20px;
            direction: rtl;
            text-align: right;
          }
          .receipt {
            max-width: 300px;
            margin: 0 auto;
            border: 1px solid #ddd;
            padding: 15px;
          }
          .header {
            text-align: center;
            border-bottom: 2px solid #333;
            padding-bottom: 10px;
            margin-bottom: 15px;
          }
          .store-name {
            font-size: 18px;
            font-weight: bold;
            margin-bottom: 5px;
          }
          .store-info {
            font-size: 10px;
            color: #666;
            margin-bottom: 2px;
          }
          .receipt-info {
            margin-bottom: 15px;
            font-size: 11px;
          }
          .items-table {
            width: 100%;
            border-collapse: collapse;
            margin-bottom: 15px;
          }
          .items-table th,
          .items-table td {
            padding: 4px 2px;
            text-align: right;
            border-bottom: 1px dotted #ccc;
          }
          .items-table th {
            font-weight: bold;
            border-bottom: 1px solid #333;
          }
          .totals {
            border-top: 2px solid #333;
            padding-top: 10px;
          }
          .total-line {
            display: flex;
            justify-content: space-between;
            margin-bottom: 3px;
          }
          .grand-total {
            font-size: 14px;
            font-weight: bold;
            border-top: 1px solid #333;
            padding-top: 5px;
            margin-top: 5px;
          }
          .footer {
            text-align: center;
            margin-top: 15px;
            padding-top: 10px;
            border-top: 1px dotted #ccc;
            font-size: 10px;
          }
          .tax-info {
            background-color: #f5f5f5;
            padding: 8px;
            margin: 10px 0;
            border: 1px solid #ddd;
            font-size: 10px;
          }
          @media print {
            body { margin: 0; padding: 0; }
            .receipt { border: none; max-width: none; }
          }
        </style>
      </head>
      <body>
        <div class="receipt">
          <!-- Header -->
          <div class="header">
            <div class="store-name">${receiptData.storeName}</div>
            ${receiptData.storeNameEn ? `<div class="store-info">${receiptData.storeNameEn}</div>` : ''}
            <div class="store-info">${receiptData.storeAddress}</div>
            <div class="store-info">تليفون: ${receiptData.storePhone}</div>
          </div>

          <!-- Tax Registration Info -->
          <div class="tax-info">
            <div>الرقم الضريبي: ${receiptData.taxRegistrationNumber}</div>
            <div>السجل التجاري: ${receiptData.commercialRegistrationNumber}</div>
          </div>

          <!-- Receipt Info -->
          <div class="receipt-info">
            <div><strong>فاتورة ضريبية</strong></div>
            <div>رقم الفاتورة: ${receiptData.receiptNumber}</div>
            <div>التاريخ: ${formatDate(receiptData.date)}</div>
            <div>الوقت: ${formatTime(receiptData.time)}</div>
            <div>الكاشير: ${receiptData.cashierName}</div>
            ${receiptData.customerName ? `<div>العميل: ${receiptData.customerName}</div>` : ''}
          </div>

          <!-- Items -->
          <table class="items-table">
            <thead>
              <tr>
                <th>الصنف</th>
                <th>الكمية</th>
                <th>السعر</th>
                <th>الإجمالي</th>
              </tr>
            </thead>
            <tbody>
              ${receiptData.items.map((item: EgyptianReceiptData['items'][0]) => `
                <tr>
                  <td>${item.name}</td>
                  <td>${formatNumber(item.quantity)}</td>
                  <td>${formatCurrency(item.unitPrice)}</td>
                  <td>${formatCurrency(item.totalPrice)}</td>
                </tr>
                ${item.vatAmount > 0 ? `
                  <tr>
                    <td colspan="3" style="font-size: 10px; color: #666;">
                      ض.ق.م (${item.vatRate}%)
                    </td>
                    <td style="font-size: 10px; color: #666;">
                      ${formatCurrency(item.vatAmount)}
                    </td>
                  </tr>
                ` : ''}
              `).join('')}
            </tbody>
          </table>

          <!-- Totals -->
          <div class="totals">
            <div class="total-line">
              <span>المجموع الفرعي:</span>
              <span>${formatCurrency(receiptData.subtotal)}</span>
            </div>
            
            ${receiptData.discountAmount ? `
              <div class="total-line" style="color: #d32f2f;">
                <span>الخصم:</span>
                <span>-${formatCurrency(receiptData.discountAmount)}</span>
              </div>
            ` : ''}
            
            <div class="total-line">
              <span>ضريبة القيمة المضافة:</span>
              <span>${formatCurrency(receiptData.totalVAT)}</span>
            </div>
            
            <div class="total-line grand-total">
              <span>الإجمالي النهائي:</span>
              <span>${formatCurrency(receiptData.total)}</span>
            </div>
            
            <div class="total-line">
              <span>طريقة الدفع:</span>
              <span>${getPaymentMethodText(receiptData.paymentMethod)}</span>
            </div>
            
            ${receiptData.amountPaid ? `
              <div class="total-line">
                <span>المبلغ المدفوع:</span>
                <span>${formatCurrency(receiptData.amountPaid)}</span>
              </div>
            ` : ''}
            
            ${receiptData.change ? `
              <div class="total-line">
                <span>الباقي:</span>
                <span>${formatCurrency(receiptData.change)}</span>
              </div>
            ` : ''}
          </div>

          <!-- Footer -->
          <div class="footer">
            <div><strong>شكراً لزيارتكم</strong></div>
            <div>نتطلع لخدمتكم مرة أخرى</div>
            <div style="margin-top: 10px;">
              تم الإنشاء بواسطة نظام تريقة لنقاط البيع
            </div>
          </div>
        </div>
      </body>
      </html>
    `;
  };

  const getPaymentMethodText = (method: string): string => {
    const methods = {
      cash: 'نقدي',
      card: 'بطاقة ائتمان',
      meeza: 'ميزة',
      'bank-transfer': 'تحويل بنكي'
    };
    return methods[method as keyof typeof methods] || method;
  };

  const handlePrint = () => {
    const printWindow = window.open('', '_blank');
    if (printWindow) {
      printWindow.document.write(generateReceiptHTML());
      printWindow.document.close();
      printWindow.print();
    }
    onPrint?.();
  };

  const handleDownload = () => {
    const htmlContent = generateReceiptHTML();
    const blob = new Blob([htmlContent], { type: 'text/html' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `receipt-${receiptData.receiptNumber}.html`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
    onDownload?.();
  };

  const handlePreview = () => {
    const previewWindow = window.open('', '_blank');
    if (previewWindow) {
      previewWindow.document.write(generateReceiptHTML());
      previewWindow.document.close();
    }
    onPreview?.();
  };

  return (
    <GlassCard className={`p-4 ${className}`}>
      <div className="space-y-4">
        <h3 className="text-lg font-semibold text-gray-900 mb-4">
          إنشاء الفاتورة الضريبية
        </h3>

        {/* Receipt Preview Summary */}
        <div className="bg-gray-50 p-3 rounded-lg text-sm">
          <div className="grid grid-cols-2 gap-2">
            <div>رقم الفاتورة: {receiptData.receiptNumber}</div>
            <div>الإجمالي: {formatCurrency(receiptData.total)}</div>
            <div>عدد الأصناف: {receiptData.items.length}</div>
            <div>ضريبة ق.م: {formatCurrency(receiptData.totalVAT)}</div>
          </div>
        </div>

        {/* Action Buttons */}
        <div className="flex gap-2 flex-wrap">
          <GlassButton
            variant="primary"
            size="md"
            onClick={handlePrint}
            leftIcon={<Printer className="w-4 h-4" />}
            data-testid="print-receipt"
          >
            طباعة
          </GlassButton>

          <GlassButton
            variant="secondary"
            size="md"
            onClick={handlePreview}
            leftIcon={<Eye className="w-4 h-4" />}
          >
            معاينة
          </GlassButton>

          <GlassButton
            variant="ghost"
            size="md"
            onClick={handleDownload}
            leftIcon={<Download className="w-4 h-4" />}
          >
            تحميل
          </GlassButton>
        </div>

        {/* Tax Compliance Notice */}
        <div className="bg-blue-50 border border-blue-200 rounded-lg p-3 text-xs text-blue-800">
          <div className="font-medium mb-1">ملاحظة ضريبية:</div>
          <p>
            هذه الفاتورة متوافقة مع قانون الضرائب المصري وتحتوي على جميع البيانات المطلوبة
            بما في ذلك الرقم الضريبي والسجل التجاري وتفاصيل ضريبة القيمة المضافة.
          </p>
        </div>
      </div>
    </GlassCard>
  );
};

export default EgyptianReceiptGenerator;
