// Egyptian VAT Calculator Component - 14% Standard Rate
import React, { useMemo } from 'react';
import { useTranslation } from 'react-i18next';
import { useRTL } from '../common/RTLProvider-fixed';
import { Calculator, Info } from 'lucide-react';
import GlassCard from '../ui/GlassCard';

export interface VATCalculation {
  subtotal: number;
  vatRate: number;
  vatAmount: number;
  total: number;
  exemptAmount?: number;
  taxableAmount: number;
}

interface VATItem {
  id: number;
  name: string;
  price: number;
  quantity: number;
  vatExempt?: boolean;
  vatRate?: number;
}

interface EgyptianVATCalculatorProps {
  items: VATItem[];
  discountAmount?: number;
  className?: string;
}

export const EgyptianVATCalculator: React.FC<EgyptianVATCalculatorProps> = ({
  items,
  discountAmount = 0,
  className = ''
}) => {
  const { t } = useTranslation();
  const { isRTL, formatCurrency } = useRTL();

  const vatCalculation = useMemo((): VATCalculation => {
    const EGYPTIAN_VAT_RATE = 14; // Standard Egyptian VAT rate

    let taxableAmount = 0;
    let exemptAmount = 0;

    // Calculate taxable and exempt amounts
    items.forEach((item: VATItem) => {
      const itemTotal = item.price * item.quantity;
      
      if (item.vatExempt) {
        exemptAmount += itemTotal;
      } else {
        taxableAmount += itemTotal;
      }
    });

    // Apply discount proportionally
    if (discountAmount > 0) {
      const totalBeforeDiscount = taxableAmount + exemptAmount;
      const discountRatio = discountAmount / totalBeforeDiscount;
      
      taxableAmount -= taxableAmount * discountRatio;
      exemptAmount -= exemptAmount * discountRatio;
    }

    const subtotal = taxableAmount + exemptAmount;
    const vatAmount = Math.round(taxableAmount * (EGYPTIAN_VAT_RATE / 100) * 100) / 100;
    const total = subtotal + vatAmount;

    return {
      subtotal,
      vatRate: EGYPTIAN_VAT_RATE,
      vatAmount,
      total,
      exemptAmount: exemptAmount > 0 ? exemptAmount : undefined,
      taxableAmount
    };
  }, [items, discountAmount]);

  return (
    <GlassCard className={`p-4 ${className}`} variant="elevated">
      <div className="space-y-3">
        {/* Header */}
        <div className="flex items-center gap-2 mb-4">
          <Calculator className="w-5 h-5 text-primary-600" />
          <h3 className="font-semibold text-gray-900">
            حساب ضريبة القيمة المضافة
          </h3>
        </div>

        {/* Calculation Breakdown */}
        <div className="space-y-2 text-sm">
          {/* Subtotal */}
          <div className="flex justify-between items-center">
            <span className="text-gray-600">المجموع الفرعي:</span>
            <span className="font-medium">
              {formatCurrency(vatCalculation.subtotal)}
            </span>
          </div>

          {/* Discount (if applicable) */}
          {discountAmount > 0 && (
            <div className="flex justify-between items-center text-red-600">
              <span>الخصم:</span>
              <span>-{formatCurrency(discountAmount)}</span>
            </div>
          )}

          {/* Taxable Amount */}
          <div className="flex justify-between items-center">
            <span className="text-gray-600">المبلغ الخاضع للضريبة:</span>
            <span className="font-medium">
              {formatCurrency(vatCalculation.taxableAmount)}
            </span>
          </div>

          {/* Exempt Amount (if applicable) */}
          {vatCalculation.exemptAmount && (
            <div className="flex justify-between items-center">
              <span className="text-gray-600">المبلغ المعفى من الضريبة:</span>
              <span className="font-medium">
                {formatCurrency(vatCalculation.exemptAmount)}
              </span>
            </div>
          )}

          {/* VAT Amount */}
          <div className="flex justify-between items-center border-t pt-2">
            <span className="text-gray-700 font-medium">
              ضريبة القيمة المضافة ({vatCalculation.vatRate}%):
            </span>
            <span className="font-semibold text-primary-600">
              {formatCurrency(vatCalculation.vatAmount)}
            </span>
          </div>

          {/* Total */}
          <div className="flex justify-between items-center border-t pt-2 text-lg">
            <span className="font-bold text-gray-900">الإجمالي:</span>
            <span className="font-bold text-primary-700">
              {formatCurrency(vatCalculation.total)}
            </span>
          </div>
        </div>

        {/* VAT Information */}
        <div className="mt-4 p-3 bg-blue-50 rounded-lg border border-blue-200">
          <div className="flex items-start gap-2">
            <Info className="w-4 h-4 text-blue-600 mt-0.5 flex-shrink-0" />
            <div className="text-xs text-blue-800">
              <p className="font-medium mb-1">معلومات ضريبة القيمة المضافة:</p>
              <ul className="space-y-1">
                <li>• المعدل القياسي: 14% (قانون الضرائب المصري)</li>
                <li>• يتم تقريب الضريبة لأقرب قرش</li>
                <li>• بعض السلع معفاة من الضريبة حسب القانون</li>
              </ul>
            </div>
          </div>
        </div>
      </div>
    </GlassCard>
  );
};

// Utility function for standalone VAT calculation
export const calculateEgyptianVAT = (
  amount: number, 
  vatRate: number = 14,
  isExempt: boolean = false
): VATCalculation => {
  if (isExempt) {
    return {
      subtotal: amount,
      vatRate: 0,
      vatAmount: 0,
      total: amount,
      taxableAmount: 0
    };
  }

  const vatAmount = Math.round(amount * (vatRate / 100) * 100) / 100;
  
  return {
    subtotal: amount,
    vatRate,
    vatAmount,
    total: amount + vatAmount,
    taxableAmount: amount
  };
};

// Egyptian VAT exempt categories (as per Egyptian tax law)
export const EGYPTIAN_VAT_EXEMPT_CATEGORIES = [
  'أدوية',           // Medicines
  'كتب ومجلات',      // Books and magazines
  'خدمات طبية',      // Medical services
  'خدمات تعليمية',   // Educational services
  'منتجات زراعية',   // Agricultural products (some)
  'خبز مدعوم',       // Subsidized bread
];

// Check if a product category is VAT exempt
export const isVATExempt = (category: string): boolean => {
  return EGYPTIAN_VAT_EXEMPT_CATEGORIES.includes(category);
};

export default EgyptianVATCalculator;
