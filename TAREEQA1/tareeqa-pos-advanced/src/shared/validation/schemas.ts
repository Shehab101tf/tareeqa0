import { z } from 'zod';

/**
 * Zod Validation Schemas for Tareeqa POS
 * Defensive coding with strict input validation
 */

// User validation schemas
export const UserSchema = z.object({
  id: z.string().uuid().optional(),
  username: z.string()
    .min(3, 'اسم المستخدم يجب أن يكون 3 أحرف على الأقل')
    .max(50, 'اسم المستخدم لا يمكن أن يزيد عن 50 حرف')
    .regex(/^[a-zA-Z0-9_]+$/, 'اسم المستخدم يجب أن يحتوي على أحرف وأرقام فقط'),
  password: z.string()
    .min(8, 'كلمة المرور يجب أن تكون 8 أحرف على الأقل')
    .max(128, 'كلمة المرور لا يمكن أن تزيد عن 128 حرف')
    .regex(/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)/, 'كلمة المرور يجب أن تحتوي على حرف كبير وصغير ورقم'),
  firstName: z.string()
    .min(2, 'الاسم الأول يجب أن يكون حرفين على الأقل')
    .max(50, 'الاسم الأول لا يمكن أن يزيد عن 50 حرف')
    .regex(/^[\u0600-\u06FFa-zA-Z\s]+$/, 'الاسم يجب أن يحتوي على أحرف عربية أو إنجليزية فقط'),
  lastName: z.string()
    .min(2, 'اسم العائلة يجب أن يكون حرفين على الأقل')
    .max(50, 'اسم العائلة لا يمكن أن يزيد عن 50 حرف')
    .regex(/^[\u0600-\u06FFa-zA-Z\s]+$/, 'الاسم يجب أن يحتوي على أحرف عربية أو إنجليزية فقط'),
  email: z.string()
    .email('البريد الإلكتروني غير صحيح')
    .max(255, 'البريد الإلكتروني لا يمكن أن يزيد عن 255 حرف')
    .optional(),
  phone: z.string()
    .regex(/^(\+2|002)?01[0125][0-9]{8}$/, 'رقم الهاتف المصري غير صحيح')
    .optional(),
  role: z.enum(['admin', 'manager', 'cashier', 'stock_clerk', 'accountant'], {
    errorMap: () => ({ message: 'الدور المحدد غير صحيح' })
  }),
  permissions: z.array(z.string()).default([]),
  isActive: z.boolean().default(true)
});

export const LoginSchema = z.object({
  username: z.string()
    .min(1, 'اسم المستخدم مطلوب')
    .max(50, 'اسم المستخدم طويل جداً'),
  password: z.string()
    .min(1, 'كلمة المرور مطلوبة')
    .max(128, 'كلمة المرور طويلة جداً')
});

// Product validation schemas
export const ProductSchema = z.object({
  id: z.string().uuid().optional(),
  sku: z.string()
    .min(1, 'رمز المنتج مطلوب')
    .max(50, 'رمز المنتج لا يمكن أن يزيد عن 50 حرف')
    .regex(/^[A-Z0-9-_]+$/, 'رمز المنتج يجب أن يحتوي على أحرف كبيرة وأرقام فقط'),
  barcode: z.string()
    .regex(/^[0-9]{8,13}$/, 'الباركود يجب أن يكون من 8 إلى 13 رقم')
    .optional(),
  name: z.string()
    .min(2, 'اسم المنتج يجب أن يكون حرفين على الأقل')
    .max(255, 'اسم المنتج لا يمكن أن يزيد عن 255 حرف'),
  nameArabic: z.string()
    .min(2, 'الاسم العربي يجب أن يكون حرفين على الأقل')
    .max(255, 'الاسم العربي لا يمكن أن يزيد عن 255 حرف')
    .regex(/[\u0600-\u06FF]/, 'يجب أن يحتوي الاسم العربي على أحرف عربية'),
  price: z.number()
    .min(0, 'السعر لا يمكن أن يكون سالباً')
    .max(999999.99, 'السعر مرتفع جداً')
    .multipleOf(0.01, 'السعر يجب أن يكون بدقة قرشين'),
  cost: z.number()
    .min(0, 'التكلفة لا يمكن أن تكون سالبة')
    .max(999999.99, 'التكلفة مرتفعة جداً')
    .multipleOf(0.01, 'التكلفة يجب أن تكون بدقة قرشين')
    .default(0),
  stockQuantity: z.number()
    .int('الكمية يجب أن تكون رقم صحيح')
    .min(0, 'الكمية لا يمكن أن تكون سالبة')
    .max(999999, 'الكمية مرتفعة جداً')
    .default(0),
  categoryId: z.string().uuid().optional(),
  taxRate: z.number()
    .min(0, 'معدل الضريبة لا يمكن أن يكون سالباً')
    .max(100, 'معدل الضريبة لا يمكن أن يزيد عن 100%')
    .default(14), // Egyptian VAT
  isActive: z.boolean().default(true),
  isService: z.boolean().default(false)
});

// Transaction validation schemas
export const TransactionSchema = z.object({
  id: z.string().uuid().optional(),
  transactionNumber: z.string()
    .min(1, 'رقم المعاملة مطلوب')
    .max(50, 'رقم المعاملة طويل جداً'),
  customerId: z.string().uuid().optional(),
  cashierId: z.string().uuid(),
  transactionType: z.enum(['sale', 'return', 'exchange']).default('sale'),
  subtotal: z.number()
    .min(0, 'المجموع الفرعي لا يمكن أن يكون سالباً')
    .max(999999.99, 'المجموع الفرعي مرتفع جداً'),
  taxAmount: z.number()
    .min(0, 'مبلغ الضريبة لا يمكن أن يكون سالباً')
    .default(0),
  discountAmount: z.number()
    .min(0, 'مبلغ الخصم لا يمكن أن يكون سالباً')
    .default(0),
  totalAmount: z.number()
    .min(0, 'المبلغ الإجمالي لا يمكن أن يكون سالباً')
    .max(999999.99, 'المبلغ الإجمالي مرتفع جداً'),
  amountPaid: z.number()
    .min(0, 'المبلغ المدفوع لا يمكن أن يكون سالباً'),
  changeAmount: z.number()
    .min(0, 'مبلغ الباقي لا يمكن أن يكون سالباً')
    .default(0),
  paymentMethod: z.enum(['cash', 'card', 'digital', 'bank_transfer']),
  status: z.enum(['pending', 'completed', 'cancelled', 'refunded']).default('completed')
});

export const TransactionItemSchema = z.object({
  id: z.string().uuid().optional(),
  transactionId: z.string().uuid(),
  productId: z.string().uuid(),
  quantity: z.number()
    .min(0.001, 'الكمية يجب أن تكون أكبر من صفر')
    .max(999999, 'الكمية مرتفعة جداً'),
  unitPrice: z.number()
    .min(0, 'سعر الوحدة لا يمكن أن يكون سالباً')
    .max(999999.99, 'سعر الوحدة مرتفع جداً'),
  discountAmount: z.number()
    .min(0, 'مبلغ الخصم لا يمكن أن يكون سالباً')
    .default(0),
  taxRate: z.number()
    .min(0, 'معدل الضريبة لا يمكن أن يكون سالباً')
    .max(100, 'معدل الضريبة لا يمكن أن يزيد عن 100%')
    .default(14),
  lineTotal: z.number()
    .min(0, 'إجمالي السطر لا يمكن أن يكون سالباً')
});

// Customer validation schemas
export const CustomerSchema = z.object({
  id: z.string().uuid().optional(),
  firstName: z.string()
    .min(2, 'الاسم الأول يجب أن يكون حرفين على الأقل')
    .max(50, 'الاسم الأول لا يمكن أن يزيد عن 50 حرف'),
  lastName: z.string()
    .min(2, 'اسم العائلة يجب أن يكون حرفين على الأقل')
    .max(50, 'اسم العائلة لا يمكن أن يزيد عن 50 حرف'),
  email: z.string()
    .email('البريد الإلكتروني غير صحيح')
    .optional(),
  phone: z.string()
    .regex(/^(\+2|002)?01[0125][0-9]{8}$/, 'رقم الهاتف المصري غير صحيح')
    .optional(),
  customerType: z.enum(['individual', 'business']).default('individual'),
  taxId: z.string()
    .regex(/^[0-9]{9,14}$/, 'الرقم الضريبي غير صحيح')
    .optional(),
  creditLimit: z.number()
    .min(0, 'حد الائتمان لا يمكن أن يكون سالباً')
    .default(0),
  isActive: z.boolean().default(true)
});

// Settings validation schemas
export const SettingsSchema = z.object({
  storeName: z.string()
    .min(2, 'اسم المتجر يجب أن يكون حرفين على الأقل')
    .max(100, 'اسم المتجر لا يمكن أن يزيد عن 100 حرف'),
  storeNameEnglish: z.string()
    .min(2, 'الاسم الإنجليزي يجب أن يكون حرفين على الأقل')
    .max(100, 'الاسم الإنجليزي لا يمكن أن يزيد عن 100 حرف')
    .regex(/^[a-zA-Z0-9\s&.-]+$/, 'الاسم الإنجليزي يحتوي على أحرف غير مسموحة'),
  currency: z.enum(['EGP']).default('EGP'),
  currencySymbol: z.string().max(10).default('ج.م'),
  taxRate: z.number()
    .min(0, 'معدل الضريبة لا يمكن أن يكون سالباً')
    .max(100, 'معدل الضريبة لا يمكن أن يزيد عن 100%')
    .default(14),
  language: z.enum(['ar', 'en']).default('ar'),
  theme: z.enum(['light', 'dark', 'auto']).default('light'),
  autoLockTimeout: z.number()
    .int('مهلة القفل التلقائي يجب أن تكون رقم صحيح')
    .min(1, 'مهلة القفل التلقائي يجب أن تكون دقيقة واحدة على الأقل')
    .max(1440, 'مهلة القفل التلقائي لا يمكن أن تزيد عن يوم واحد')
    .default(15)
});

// Hardware validation schemas
export const BarcodeSchema = z.string()
  .regex(/^[0-9A-Z\-\.\/\+\$\%\*\s]+$/, 'الباركود يحتوي على أحرف غير مسموحة')
  .min(4, 'الباركود قصير جداً')
  .max(50, 'الباركود طويل جداً');

// License validation schemas
export const LicenseSchema = z.object({
  licenseKey: z.string()
    .min(20, 'مفتاح الترخيص قصير جداً')
    .max(100, 'مفتاح الترخيص طويل جداً')
    .regex(/^[A-Z0-9\-]+$/, 'مفتاح الترخيص يحتوي على أحرف غير مسموحة'),
  userInfo: z.object({
    name: z.string()
      .min(2, 'الاسم يجب أن يكون حرفين على الأقل')
      .max(100, 'الاسم لا يمكن أن يزيد عن 100 حرف'),
    company: z.string()
      .min(2, 'اسم الشركة يجب أن يكون حرفين على الأقل')
      .max(100, 'اسم الشركة لا يمكن أن يزيد عن 100 حرف'),
    email: z.string()
      .email('البريد الإلكتروني غير صحيح')
  })
});

// SQL injection prevention
export const SqlSafeStringSchema = z.string()
  .max(1000, 'النص طويل جداً')
  .refine(
    (value) => !/(;|--|\/\*|\*\/|xp_|sp_|exec|execute|select|insert|update|delete|drop|create|alter|union|script)/i.test(value),
    'النص يحتوي على أحرف غير مسموحة'
  );

// File path validation
export const FilePathSchema = z.string()
  .max(260, 'مسار الملف طويل جداً') // Windows MAX_PATH
  .refine(
    (value) => !/[<>:"|?*\x00-\x1f]/.test(value),
    'مسار الملف يحتوي على أحرف غير مسموحة'
  )
  .refine(
    (value) => !/(CON|PRN|AUX|NUL|COM[1-9]|LPT[1-9])$/i.test(value.split(/[\\\/]/).pop() || ''),
    'اسم الملف محجوز في النظام'
  );

// API Response validation
export const ApiResponseSchema = <T extends z.ZodType>(dataSchema: T) =>
  z.object({
    success: z.boolean(),
    data: dataSchema.optional(),
    error: z.object({
      code: z.string(),
      message: z.string(),
      messageArabic: z.string().optional(),
      details: z.any().optional()
    }).optional(),
    message: z.string().optional()
  });

// Validation helper functions
export class ValidationHelper {
  /**
   * Validate and sanitize user input
   */
  static validateInput<T>(schema: z.ZodSchema<T>, data: unknown): { success: true; data: T } | { success: false; errors: string[] } {
    try {
      const result = schema.parse(data);
      return { success: true, data: result };
    } catch (error) {
      if (error instanceof z.ZodError) {
        const errors = error.errors.map(err => err.message);
        return { success: false, errors };
      }
      return { success: false, errors: ['خطأ في التحقق من صحة البيانات'] };
    }
  }

  /**
   * Sanitize SQL input to prevent injection
   */
  static sanitizeSqlInput(input: string): string {
    return input
      .replace(/'/g, "''") // Escape single quotes
      .replace(/;/g, '') // Remove semicolons
      .replace(/--/g, '') // Remove SQL comments
      .replace(/\/\*/g, '') // Remove block comment start
      .replace(/\*\//g, '') // Remove block comment end
      .trim();
  }

  /**
   * Validate Egyptian phone number
   */
  static validateEgyptianPhone(phone: string): boolean {
    const phoneRegex = /^(\+2|002)?01[0125][0-9]{8}$/;
    return phoneRegex.test(phone);
  }

  /**
   * Validate Egyptian tax ID
   */
  static validateEgyptianTaxId(taxId: string): boolean {
    const taxIdRegex = /^[0-9]{9,14}$/;
    return taxIdRegex.test(taxId);
  }

  /**
   * Validate barcode format
   */
  static validateBarcode(barcode: string): { isValid: boolean; format?: string } {
    // EAN-13 (Egyptian products start with 622)
    if (/^622[0-9]{10}$/.test(barcode)) {
      return { isValid: true, format: 'EAN-13 Egyptian' };
    }
    
    // Standard EAN-13
    if (/^[0-9]{13}$/.test(barcode)) {
      return { isValid: true, format: 'EAN-13' };
    }
    
    // UPC-A
    if (/^[0-9]{12}$/.test(barcode)) {
      return { isValid: true, format: 'UPC-A' };
    }
    
    // Code 128
    if (/^[0-9A-Z\-\.\/\+\$\%\*\s]{4,50}$/.test(barcode)) {
      return { isValid: true, format: 'Code 128' };
    }
    
    return { isValid: false };
  }

  /**
   * Generate secure random string
   */
  static generateSecureId(length: number = 32): string {
    const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';
    let result = '';
    const crypto = require('crypto');
    
    for (let i = 0; i < length; i++) {
      const randomIndex = crypto.randomInt(0, chars.length);
      result += chars[randomIndex];
    }
    
    return result;
  }

  /**
   * Validate and format Egyptian currency
   */
  static formatEgyptianCurrency(amount: number): string {
    if (isNaN(amount) || amount < 0) {
      throw new Error('مبلغ غير صحيح');
    }
    
    return new Intl.NumberFormat('ar-EG', {
      style: 'currency',
      currency: 'EGP',
      minimumFractionDigits: 2,
      maximumFractionDigits: 2
    }).format(amount).replace('EGP', 'ج.م');
  }
}

// Export all schemas
export type UserInput = z.infer<typeof UserSchema>;
export type LoginInput = z.infer<typeof LoginSchema>;
export type ProductInput = z.infer<typeof ProductSchema>;
export type TransactionInput = z.infer<typeof TransactionSchema>;
export type TransactionItemInput = z.infer<typeof TransactionItemSchema>;
export type CustomerInput = z.infer<typeof CustomerSchema>;
export type SettingsInput = z.infer<typeof SettingsSchema>;
export type LicenseInput = z.infer<typeof LicenseSchema>;
