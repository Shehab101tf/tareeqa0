// Arabic RTL Interface Testing - Egyptian Market
import { render, screen, fireEvent } from '@testing-library/react';
import { I18nextProvider } from 'react-i18next';
import i18n from '@/renderer/i18n/config';
import { RTLProvider } from '@/renderer/components/common/RTLProvider-fixed';
import { ProductsScreen } from '@/renderer/screens/ProductsScreen';
import '@testing-library/jest-dom';

// Mock Electron API
Object.defineProperty(window, 'electronAPI', {
  value: {
    platform: 'win32',
    version: '21.4.4',
    database: {
      searchProducts: jest.fn().mockResolvedValue([]),
      findByBarcode: jest.fn().mockResolvedValue(null)
    }
  }
});

describe('Arabic RTL Interface Testing', () => {
  beforeEach(() => {
    i18n.changeLanguage('ar-EG');
  });

  const renderWithProviders = (component: React.ReactElement) => {
    return render(
      <I18nextProvider i18n={i18n}>
        <RTLProvider>
          {component}
        </RTLProvider>
      </I18nextProvider>
    );
  };

  test('displays Egyptian Arabic text correctly', async () => {
    renderWithProviders(<ProductsScreen />);

    // Test Egyptian-specific terms
    expect(screen.getByText('المنتجات')).toBeInTheDocument(); // Products
    expect(document.documentElement.dir).toBe('rtl');
    expect(document.documentElement.lang).toBe('ar-EG');
  });

  test('handles mixed Arabic/English content', () => {
    const MixedContent = () => (
      <div>
        <span>المنتج: </span>
        <span>Coca Cola</span>
        <span> - السعر: </span>
        <span>5.50 ج.م</span>
      </div>
    );

    renderWithProviders(<MixedContent />);

    const container = screen.getByText('المنتج:').parentElement;
    expect(container).toHaveStyle('direction: rtl');
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
    expect(formatted).toContain('ج.م'); // Egyptian Pound symbol
  });

  test('handles Arabic keyboard input', async () => {
    renderWithProviders(
      <input data-testid="search-input" placeholder="ابحث عن المنتج..." />
    );

    const input = screen.getByTestId('search-input');
    
    // Simulate Arabic typing
    fireEvent.change(input, { target: { value: 'كوكا كولا' } });
    expect(input).toHaveValue('كوكا كولا');
  });

  test('displays Arabic numbers correctly', () => {
    const ArabicNumbers = () => {
      const price = 15.50;
      const arabicPrice = price.toLocaleString('ar-EG');
      return <span data-testid="arabic-price">{arabicPrice}</span>;
    };

    renderWithProviders(<ArabicNumbers />);
    
    const priceElement = screen.getByTestId('arabic-price');
    // Should display using Arabic-Indic numerals in Egyptian locale
    expect(priceElement.textContent).toMatch(/[٠-٩]/); // Arabic-Indic digits
  });

  test('handles text direction changes dynamically', async () => {
    const { rerender } = renderWithProviders(<ProductsScreen />);
    
    // Should be RTL initially
    expect(document.documentElement.dir).toBe('rtl');
    
    // Switch to English
    i18n.changeLanguage('en');
    rerender(
      <I18nextProvider i18n={i18n}>
        <RTLProvider>
          <ProductsScreen />
        </RTLProvider>
      </I18nextProvider>
    );
    
    // Should switch to LTR
    expect(document.documentElement.dir).toBe('ltr');
  });

  test('validates Arabic text rendering with diacritics', () => {
    const ArabicWithDiacritics = () => (
      <div data-testid="diacritics-text">
        مَنْتَجٌ عَرَبِيٌّ بِالتَّشْكِيلِ
      </div>
    );

    renderWithProviders(<ArabicWithDiacritics />);
    
    const textElement = screen.getByTestId('diacritics-text');
    expect(textElement.textContent).toContain('مَنْتَجٌ');
    expect(textElement).toHaveStyle('font-family: Cairo, Amiri, sans-serif');
  });

  test('handles long Arabic text wrapping', () => {
    const longArabicText = 'هذا نص طويل جداً باللغة العربية يجب أن يتم التفافه بشكل صحيح في واجهة المستخدم العربية';
    
    const LongTextComponent = () => (
      <div data-testid="long-text" style={{ width: '200px' }}>
        {longArabicText}
      </div>
    );

    renderWithProviders(<LongTextComponent />);
    
    const textElement = screen.getByTestId('long-text');
    expect(textElement.textContent).toBe(longArabicText);
    expect(textElement).toHaveStyle('text-align: right');
  });

  test('validates Egyptian business terminology', () => {
    const egyptianTerms = [
      'ضريبة القيمة المضافة', // VAT
      'جنيه مصري', // Egyptian Pound
      'فاتورة ضريبية', // Tax Invoice
      'نقطة البيع', // Point of Sale
    ];

    egyptianTerms.forEach(term => {
      const TermComponent = () => <span data-testid={`term-${term}`}>{term}</span>;
      renderWithProviders(<TermComponent />);
      expect(screen.getByTestId(`term-${term}`)).toBeInTheDocument();
    });
  });

  test('handles Arabic sorting correctly', () => {
    const arabicNames = ['أحمد', 'بسام', 'تامر', 'ثابت', 'جمال'];
    const sortedNames = [...arabicNames].sort((a, b) => 
      a.localeCompare(b, 'ar-EG')
    );

    expect(sortedNames).toEqual(['أحمد', 'بسام', 'تامر', 'ثابت', 'جمال']);
  });

  test('validates Islamic calendar integration', () => {
    const islamicDate = new Intl.DateTimeFormat('ar-EG-u-ca-islamic', {
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    }).format(new Date());

    expect(islamicDate).toMatch(/\d+/); // Should contain Arabic numerals
    expect(islamicDate).toMatch(/[أ-ي]/); // Should contain Arabic text
  });
});
