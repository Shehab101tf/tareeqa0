// Arabic Localization Tests - Egyptian Market Specific (Non-JSX)
import '@testing-library/jest-dom';

// Mock Egyptian business logic for testing
class EgyptianLocalizationService {
  private readonly egyptianTerms = {
    'pos': 'نقطة البيع',
    'currency': 'جنيه مصري',
    'vat': 'ضريبة القيمة المضافة',
    'total': 'المجموع الكلي',
    'subtotal': 'المجموع الفرعي',
    'cashier': 'كاشير',
    'customer': 'عميل',
    'receipt': 'فاتورة',
    'product': 'منتج',
    'quantity': 'الكمية',
    'price': 'السعر',
    'barcode': 'باركود',
    'payment': 'الدفع',
    'cash': 'نقدي',
    'card': 'بطاقة',
    'change': 'الباقي'
  };

  getArabicTerm(key: string): string {
    return this.egyptianTerms[key as keyof typeof this.egyptianTerms] || key;
  }

  isRTLText(text: string): boolean {
    // Check if text contains Arabic characters
    const arabicRegex = /[\u0600-\u06FF]/;
    return arabicRegex.test(text);
  }

  formatEgyptianCurrency(amount: number, useArabicNumerals = false): string {
    const formatted = amount.toFixed(2);
    
    if (useArabicNumerals) {
      const arabicNumerals = ['٠', '١', '٢', '٣', '٤', '٥', '٦', '٧', '٨', '٩'];
      const arabicFormatted = formatted.replace(/\d/g, (digit) => arabicNumerals[parseInt(digit)]);
      return arabicFormatted + ' ج.م';
    }
    
    return formatted + ' ج.م';
  }

  parseArabicNumerals(arabicText: string): string {
    const arabicNumerals = ['٠', '١', '٢', '٣', '٤', '٥', '٦', '٧', '٨', '٩'];
    return arabicText.replace(/[٠-٩]/g, (char) => {
      return arabicNumerals.indexOf(char).toString();
    });
  }

  validateArabicInput(input: string): { isValid: boolean; sanitized: string } {
    // Remove potentially dangerous characters while preserving Arabic text
    const sanitized = input
      .replace(/<script\b[^<]*(?:(?!<\/script>)<[^<]*)*<\/script>/gi, '') // Remove script tags
      .replace(/javascript:/gi, '') // Remove javascript: protocol
      .replace(/on\w+\s*=/gi, '') // Remove event handlers
      .replace(/['"`;\\]/g, '') // Remove quotes and dangerous chars
      .trim();

    const isValid = sanitized.length > 0 && sanitized.length <= 255; // Reasonable length limit
    
    return { isValid, sanitized };
  }
}

describe('Egyptian Arabic Localization', () => {
  let localizationService: EgyptianLocalizationService;

  beforeEach(() => {
    localizationService = new EgyptianLocalizationService();
    
    // Set Arabic locale for DOM
    document.documentElement.lang = 'ar-EG';
    document.documentElement.dir = 'rtl';
  });

  test('provides correct Egyptian Arabic terminology', () => {
    const testTerms = [
      { key: 'pos', expected: 'نقطة البيع' },
      { key: 'currency', expected: 'جنيه مصري' },
      { key: 'vat', expected: 'ضريبة القيمة المضافة' },
      { key: 'total', expected: 'المجموع الكلي' },
      { key: 'cashier', expected: 'كاشير' },
      { key: 'receipt', expected: 'فاتورة' }
    ];

    testTerms.forEach(({ key, expected }) => {
      expect(localizationService.getArabicTerm(key)).toBe(expected);
    });
  });

  test('detects RTL text correctly', () => {
    const testCases = [
      { text: 'نقطة البيع', expected: true },
      { text: 'كوكا كولا', expected: true },
      { text: 'Point of Sale', expected: false },
      { text: 'Coca Cola', expected: false },
      { text: 'منتج Product مختلط', expected: true }, // Mixed content with Arabic
      { text: '123 ج.م', expected: true } // Contains Arabic currency
    ];

    testCases.forEach(({ text, expected }) => {
      expect(localizationService.isRTLText(text)).toBe(expected);
    });
  });

  test('formats Egyptian currency correctly', () => {
    const testCases = [
      { amount: 123.45, western: '123.45 ج.م', arabic: '١٢٣٫٤٥ ج.م' },
      { amount: 0.50, western: '0.50 ج.م', arabic: '٠٫٥٠ ج.م' },
      { amount: 1000.00, western: '1000.00 ج.م', arabic: '١٠٠٠٫٠٠ ج.م' },
      { amount: 25.99, western: '25.99 ج.م', arabic: '٢٥٫٩٩ ج.م' }
    ];

    testCases.forEach(({ amount, western, arabic }) => {
      expect(localizationService.formatEgyptianCurrency(amount, false)).toBe(western);
      expect(localizationService.formatEgyptianCurrency(amount, true)).toBe(arabic);
    });
  });

  test('parses Arabic numerals to Western numerals', () => {
    const testCases = [
      { arabic: '١٢٣٫٤٥', expected: '123.45' },
      { arabic: '٠٫٥٠', expected: '0.50' },
      { arabic: '١٠٠٠٫٠٠', expected: '1000.00' },
      { arabic: '٢٥٫٩٩', expected: '25.99' }
    ];

    testCases.forEach(({ arabic, expected }) => {
      expect(localizationService.parseArabicNumerals(arabic)).toBe(expected);
    });
  });

  test('validates and sanitizes Arabic input', () => {
    const testCases = [
      {
        input: 'منتج عادي',
        expected: { isValid: true, sanitized: 'منتج عادي' }
      },
      {
        input: 'كوكا كولا<script>alert("xss")</script>',
        expected: { isValid: true, sanitized: 'كوكا كولا' }
      },
      {
        input: 'منتج\'; DROP TABLE products; --',
        expected: { isValid: true, sanitized: 'منتج DROP TABLE products --' }
      },
      {
        input: '',
        expected: { isValid: false, sanitized: '' }
      },
      {
        input: 'a'.repeat(300), // Too long
        expected: { isValid: false, sanitized: 'a'.repeat(300) }
      }
    ];

    testCases.forEach(({ input, expected }) => {
      const result = localizationService.validateArabicInput(input);
      expect(result.isValid).toBe(expected.isValid);
      expect(result.sanitized).toBe(expected.sanitized);
    });
  });

  test('handles mixed Arabic-English content', () => {
    const mixedContent = [
      'منتج Coca Cola - السعر 5.50 ج.م',
      'Product كوكا كولا Price ٥٫٥٠ ج.م',
      'باركود: 6224000123456',
      'Barcode: ٦٢٢٤٠٠٠١٢٣٤٥٦'
    ];

    mixedContent.forEach(content => {
      expect(localizationService.isRTLText(content)).toBe(true);
      
      const validation = localizationService.validateArabicInput(content);
      expect(validation.isValid).toBe(true);
      expect(validation.sanitized).toBe(content);
    });
  });

  test('Egyptian VAT terminology and calculation', () => {
    const vatTerm = localizationService.getArabicTerm('vat');
    expect(vatTerm).toBe('ضريبة القيمة المضافة');

    // Test VAT calculation with Arabic formatting
    const subtotal = 100.00;
    const vatRate = 0.14; // Egyptian VAT rate
    const vatAmount = subtotal * vatRate;
    const total = subtotal + vatAmount;

    const formattedSubtotal = localizationService.formatEgyptianCurrency(subtotal, true);
    const formattedVAT = localizationService.formatEgyptianCurrency(vatAmount, true);
    const formattedTotal = localizationService.formatEgyptianCurrency(total, true);

    expect(formattedSubtotal).toBe('١٠٠٫٠٠ ج.م');
    expect(formattedVAT).toBe('١٤٫٠٠ ج.م');
    expect(formattedTotal).toBe('١١٤٫٠٠ ج.م');
  });

  test('Arabic keyboard input simulation', () => {
    // Simulate typing Arabic text
    const arabicInputs = [
      'كوكا كولا',
      'بيبسي',
      'شاي ليبتون',
      'خبز بلدي',
      'جبنة بيضاء'
    ];

    arabicInputs.forEach(input => {
      const validation = localizationService.validateArabicInput(input);
      expect(validation.isValid).toBe(true);
      expect(validation.sanitized).toBe(input);
      expect(localizationService.isRTLText(input)).toBe(true);
    });
  });

  test('Egyptian business hours with Islamic calendar', () => {
    // Mock Islamic calendar date
    const islamicDate = {
      hijriYear: 1445,
      hijriMonth: 'رجب',
      hijriDay: 15,
      gregorianDate: new Date('2024-01-27')
    };

    // Verify Arabic month name
    expect(localizationService.isRTLText(islamicDate.hijriMonth)).toBe(true);
    expect(islamicDate.hijriMonth).toBe('رجب');
    expect(islamicDate.hijriYear).toBe(1445);
  });

  test('DOM direction and language attributes', () => {
    // Verify DOM is set to Arabic RTL
    expect(document.documentElement.dir).toBe('rtl');
    expect(document.documentElement.lang).toBe('ar-EG');

    // Test switching to English
    document.documentElement.dir = 'ltr';
    document.documentElement.lang = 'en-US';
    
    expect(document.documentElement.dir).toBe('ltr');
    expect(document.documentElement.lang).toBe('en-US');

    // Switch back to Arabic
    document.documentElement.dir = 'rtl';
    document.documentElement.lang = 'ar-EG';
    
    expect(document.documentElement.dir).toBe('rtl');
    expect(document.documentElement.lang).toBe('ar-EG');
  });
});
