import React, { createContext, useContext, useEffect, useState } from 'react';
import { useTranslation } from 'react-i18next';

interface RTLContextType {
  isRTL: boolean;
  direction: 'ltr' | 'rtl';
  language: string;
  formatNumber: (num: number) => string;
  formatCurrency: (amount: number, currency?: string) => string;
  toggleLanguage: () => void;
  setLanguage: (lang: string) => void;
}

const RTLContext = createContext<RTLContextType | undefined>(undefined);

export const useRTL = (): RTLContextType => {
  const context = useContext(RTLContext);
  if (!context) {
    throw new Error('useRTL must be used within RTLProvider');
  }
  return context;
};

interface RTLProviderProps {
  children: React.ReactNode;
}

export const RTLProvider: React.FC<RTLProviderProps> = ({ children }) => {
  const { i18n } = useTranslation();
  const [isRTL, setIsRTL] = useState(false);

  useEffect(() => {
    const currentLanguage = i18n.language || 'ar'; // Default to Arabic for Egyptian market
    const rtlLanguages = ['ar', 'he', 'fa', 'ur'];
    const isCurrentRTL = rtlLanguages.includes(currentLanguage);
    
    setIsRTL(isCurrentRTL);
    
    // Update document direction
    document.documentElement.dir = isCurrentRTL ? 'rtl' : 'ltr';
    document.documentElement.lang = currentLanguage;
    
    // Update CSS custom properties for RTL
    document.documentElement.style.setProperty('--text-align', isCurrentRTL ? 'right' : 'left');
    document.documentElement.style.setProperty('--text-align-opposite', isCurrentRTL ? 'left' : 'right');
    
    // Add RTL class to body for styling
    if (isCurrentRTL) {
      document.body.classList.add('rtl');
      document.body.classList.remove('ltr');
    } else {
      document.body.classList.add('ltr');
      document.body.classList.remove('rtl');
    }
  }, [i18n.language]);

  const formatNumber = (num: number): string => {
    if (isRTL) {
      // Use Eastern Arabic numerals for Arabic (optional)
      return num.toLocaleString('ar-EG');
    }
    return num.toLocaleString('en-US');
  };

  const formatCurrency = (amount: number, currency = 'EGP'): string => {
    if (isRTL) {
      return new Intl.NumberFormat('ar-EG', {
        style: 'currency',
        currency: currency,
        minimumFractionDigits: 2,
      }).format(amount);
    }
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: currency,
      minimumFractionDigits: 2,
    }).format(amount);
  };

  const toggleLanguage = () => {
    const newLanguage = i18n.language === 'ar' ? 'en' : 'ar';
    i18n.changeLanguage(newLanguage);
  };

  const setLanguage = (lang: string) => {
    i18n.changeLanguage(lang);
  };

  const value: RTLContextType = {
    isRTL,
    direction: isRTL ? 'rtl' : 'ltr',
    language: i18n.language || 'ar',
    formatNumber,
    formatCurrency,
    toggleLanguage,
    setLanguage,
  };

  return (
    <RTLContext.Provider value={value}>
      <div className={`${isRTL ? 'font-cairo' : 'font-inter'} ${isRTL ? 'text-right' : 'text-left'}`}>
        {children}
      </div>
    </RTLContext.Provider>
  );
};

// Currency Display Component
export const CurrencyDisplay: React.FC<{
  amount: number;
  currency?: string;
  className?: string;
}> = ({ amount, currency = 'EGP', className }) => {
  const { formatCurrency } = useRTL();
  
  return (
    <span className={className}>
      {formatCurrency(amount, currency)}
    </span>
  );
};

// Number Display Component
export const NumberDisplay: React.FC<{
  value: number;
  className?: string;
}> = ({ value, className }) => {
  const { formatNumber } = useRTL();
  
  return (
    <span className={className}>
      {formatNumber(value)}
    </span>
  );
};
