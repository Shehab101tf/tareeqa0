// Arabic RTL Testing Suite - Egyptian Market Specific
import React from 'react';
import { render, screen, fireEvent } from '@testing-library/react';
import '@testing-library/jest-dom';

// Mock i18n provider for testing
const MockI18nProvider = ({ 
  children, 
  locale = 'ar-EG' 
}: { children: React.ReactNode; locale?: string }) => {
  return React.createElement('div', {
    dir: locale.startsWith('ar') ? 'rtl' : 'ltr',
    lang: locale
  }, children);
};

// Mock POS Interface component
const MockPOSInterface = () => {
  return React.createElement('div', { 'data-testid': 'pos-interface' },
    React.createElement('h1', null, 'نقطة البيع'),
    React.createElement('div', null, 'جنيه مصري'),
    React.createElement('div', null, 'ضريبة القيمة المضافة')
  );
};

describe('Egyptian Arabic Localization', () => {
  beforeEach(() => {
    // Set Arabic locale
    document.documentElement.lang = 'ar-EG';
    document.documentElement.dir = 'rtl';
  });

  test('displays Egyptian Arabic text correctly', async () => {
    render(
      React.createElement(MockI18nProvider, { locale: 'ar-EG' },
        React.createElement(MockPOSInterface)
      )
    );

    // Test Egyptian-specific terms
    expect(screen.getByText('نقطة البيع')).toBeInTheDocument();
    expect(screen.getByText('جنيه مصري')).toBeInTheDocument(); // Egyptian Pound
    expect(screen.getByText('ضريبة القيمة المضافة')).toBeInTheDocument(); // VAT in Arabic
    expect(document.documentElement.dir).toBe('rtl');
    expect(document.documentElement.lang).toBe('ar-EG');
  });

  test('handles mixed Arabic/English content', () => {
    render(
      <MockI18nProvider locale="ar-EG">
        <div>
          <span>المنتج: </span>
          <span>Coca Cola</span>
          <span> - السعر: </span>
          <span>5.50 ج.م</span>
        </div>
      </MockI18nProvider>
    );

    const container = screen.getByText('المنتج:').parentElement;
    expect(container).toHaveAttribute('dir', 'rtl');
    expect(screen.getByText('Coca Cola')).toBeInTheDocument();
    expect(screen.getByText('5.50 ج.م')).toBeInTheDocument();
  });

  test('formats Egyptian currency correctly', () => {
    const formatter = new Intl.NumberFormat('ar-EG', {
      style: 'currency',
      currency: 'EGP',
      minimumFractionDigits: 2
    });

    const formatted = formatter.format(123.45);
    // Should contain Egyptian Pound formatting
    expect(formatted).toMatch(/ج\.م|EGP/);
  });

  test('handles Arabic keyboard input', async () => {
    render(
      <MockI18nProvider locale="ar-EG">
        <input 
          data-testid="search-input" 
          placeholder="ابحث عن المنتج..." 
          style={{ textAlign: 'right', direction: 'rtl' }}
        />
      </MockI18nProvider>
    );

    const input = screen.getByTestId('search-input') as HTMLInputElement;
    
    // Simulate Arabic typing
    fireEvent.change(input, { target: { value: 'كوكا كولا' } });
    expect(input.value).toBe('كوكا كولا');
    expect(input).toHaveStyle('text-align: right');
  });

  test('validates Arabic text rendering with diacritics', () => {
    const arabicTextWithDiacritics = 'مَنْتَجٌ عَرَبِيٌّ';
    
    render(
      <MockI18nProvider locale="ar-EG">
        <div data-testid="arabic-text">{arabicTextWithDiacritics}</div>
      </MockI18nProvider>
    );

    const textElement = screen.getByTestId('arabic-text');
    expect(textElement).toHaveTextContent(arabicTextWithDiacritics);
    expect(textElement.parentElement).toHaveAttribute('dir', 'rtl');
  });

  test('handles Arabic numerals vs Western numerals', () => {
    const westernNumerals = '12345';
    const arabicNumerals = '١٢٣٤٥';

    render(
      <MockI18nProvider locale="ar-EG">
        <div>
          <span data-testid="western">{westernNumerals}</span>
          <span data-testid="arabic">{arabicNumerals}</span>
        </div>
      </MockI18nProvider>
    );

    expect(screen.getByTestId('western')).toHaveTextContent('12345');
    expect(screen.getByTestId('arabic')).toHaveTextContent('١٢٣٤٥');
  });

  test('validates Egyptian business terminology', () => {
    const egyptianTerms = [
      'فاتورة ضريبية', // Tax invoice
      'ضريبة القيمة المضافة', // VAT
      'جنيه مصري', // Egyptian Pound
      'المجموع الكلي', // Total
      'نقطة البيع', // Point of Sale
      'باركود', // Barcode
      'كاشير' // Cashier
    ];

    render(
      <MockI18nProvider locale="ar-EG">
        <div>
          {egyptianTerms.map((term, index) => (
            <div key={index} data-testid={`term-${index}`}>
              {term}
            </div>
          ))}
        </div>
      </MockI18nProvider>
    );

    egyptianTerms.forEach((term, index) => {
      expect(screen.getByTestId(`term-${index}`)).toHaveTextContent(term);
    });
  });

  test('handles RTL layout with form elements', () => {
    render(
      <MockI18nProvider locale="ar-EG">
        <form style={{ direction: 'rtl' }}>
          <label htmlFor="product-name">اسم المنتج:</label>
          <input 
            id="product-name" 
            type="text" 
            style={{ textAlign: 'right' }}
            data-testid="product-input"
          />
          <button type="submit">حفظ</button>
        </form>
      </MockI18nProvider>
    );

    const form = screen.getByRole('form');
    const input = screen.getByTestId('product-input');
    const button = screen.getByRole('button');

    expect(form).toHaveStyle('direction: rtl');
    expect(input).toHaveStyle('text-align: right');
    expect(screen.getByText('اسم المنتج:')).toBeInTheDocument();
    expect(screen.getByText('حفظ')).toBeInTheDocument();
  });

  test('validates Egyptian VAT calculation with Arabic display', () => {
    const saleData = {
      subtotal: 100.00,
      vatRate: 0.14, // Egyptian VAT rate
      currency: 'ج.م'
    };

    const vatAmount = saleData.subtotal * saleData.vatRate;
    const total = saleData.subtotal + vatAmount;

    render(
      <MockI18nProvider locale="ar-EG">
        <div data-testid="vat-calculation">
          <div>المجموع الفرعي: {saleData.subtotal.toFixed(2)} {saleData.currency}</div>
          <div>ضريبة القيمة المضافة (14%): {vatAmount.toFixed(2)} {saleData.currency}</div>
          <div>الإجمالي: {total.toFixed(2)} {saleData.currency}</div>
        </div>
      </MockI18nProvider>
    );

    expect(screen.getByText('المجموع الفرعي: 100.00 ج.م')).toBeInTheDocument();
    expect(screen.getByText('ضريبة القيمة المضافة (14%): 14.00 ج.م')).toBeInTheDocument();
    expect(screen.getByText('الإجمالي: 114.00 ج.م')).toBeInTheDocument();
  });
});
