// Enhanced Validation Schemas for Tareeqa POS Phase 2
// Comprehensive Zod schemas for advanced features validation

import { z } from 'zod';

// Base validation helpers
const egyptianPhoneRegex = /^(\+20|0)?1[0-2,5]\d{8}$/;
const egyptianTaxIdRegex = /^\d{9}$/;
const egyptianCommercialRegisterRegex = /^\d{1,10}$/;

// Product Variant Schema
export const ProductVariantSchema = z.object({
  id: z.number().optional(),
  productId: z.number().positive('معرف المنتج مطلوب'),
  sku: z.string().min(1, 'كود المنتج مطلوب').max(50, 'كود المنتج طويل جداً'),
  name: z.string().min(1, 'اسم المنتج مطلوب').max(200, 'اسم المنتج طويل جداً'),
  nameEn: z.string().max(200, 'الاسم الإنجليزي طويل جداً').optional(),
  attributes: z.record(z.string()).default({}),
  costPrice: z.number().min(0, 'سعر التكلفة لا يمكن أن يكون سالباً'),
  sellingPrice: z.number().min(0, 'سعر البيع لا يمكن أن يكون سالباً'),
  stock: z.number().int().min(0, 'الكمية لا يمكن أن تكون سالبة'),
  minStock: z.number().int().min(0, 'الحد الأدنى للمخزون لا يمكن أن يكون سالباً'),
  isActive: z.boolean().default(true),
  createdAt: z.string().optional(),
  updatedAt: z.string().optional()
});

// Pricing Tier Schema
export const PricingTierSchema = z.object({
  id: z.number().optional(),
  name: z.string().min(1, 'اسم الفئة مطلوب').max(100, 'اسم الفئة طويل جداً'),
  nameEn: z.string().max(100, 'الاسم الإنجليزي طويل جداً').optional(),
  type: z.enum(['retail', 'wholesale', 'vip', 'employee'], {
    errorMap: () => ({ message: 'نوع الفئة غير صحيح' })
  }),
  discountPercentage: z.number().min(0, 'نسبة الخصم لا يمكن أن تكون سالبة').max(100, 'نسبة الخصم لا يمكن أن تزيد عن 100%'),
  minimumQuantity: z.number().int().min(1, 'الحد الأدنى للكمية يجب أن يكون موجباً').optional(),
  isActive: z.boolean().default(true),
  createdAt: z.string().optional()
});

// Supplier Schema
export const SupplierSchema = z.object({
  id: z.number().optional(),
  name: z.string().min(1, 'اسم المورد مطلوب').max(200, 'اسم المورد طويل جداً'),
  nameEn: z.string().max(200, 'الاسم الإنجليزي طويل جداً').optional(),
  contactPerson: z.string().max(100, 'اسم جهة الاتصال طويل جداً').optional(),
  email: z.string().email('البريد الإلكتروني غير صحيح').optional().or(z.literal('')),
  phone: z.string().regex(egyptianPhoneRegex, 'رقم الهاتف غير صحيح').optional().or(z.literal('')),
  address: z.string().max(500, 'العنوان طويل جداً').optional(),
  taxId: z.string().regex(egyptianTaxIdRegex, 'الرقم الضريبي غير صحيح').optional().or(z.literal('')),
  paymentTerms: z.string().max(200, 'شروط الدفع طويلة جداً').optional(),
  creditLimit: z.number().min(0, 'حد الائتمان لا يمكن أن يكون سالباً').default(0),
  isActive: z.boolean().default(true),
  createdAt: z.string().optional(),
  updatedAt: z.string().optional()
});

// Purchase Order Schema
export const PurchaseOrderSchema = z.object({
  id: z.number().optional(),
  supplierId: z.number().positive('معرف المورد مطلوب'),
  orderNumber: z.string().min(1, 'رقم الطلب مطلوب').max(50, 'رقم الطلب طويل جداً'),
  status: z.enum(['draft', 'sent', 'received', 'partial', 'cancelled'], {
    errorMap: () => ({ message: 'حالة الطلب غير صحيحة' })
  }).default('draft'),
  orderDate: z.string().min(1, 'تاريخ الطلب مطلوب'),
  expectedDate: z.string().optional(),
  receivedDate: z.string().optional(),
  subtotal: z.number().min(0, 'المجموع الفرعي لا يمكن أن يكون سالباً'),
  vatAmount: z.number().min(0, 'قيمة الضريبة لا يمكن أن تكون سالبة'),
  total: z.number().min(0, 'الإجمالي لا يمكن أن يكون سالباً'),
  notes: z.string().max(1000, 'الملاحظات طويلة جداً').optional(),
  createdBy: z.number().positive('معرف المستخدم مطلوب'),
  createdAt: z.string().optional(),
  updatedAt: z.string().optional()
});

// Purchase Order Item Schema
export const PurchaseOrderItemSchema = z.object({
  id: z.number().optional(),
  purchaseOrderId: z.number().positive('معرف طلب الشراء مطلوب'),
  productId: z.number().positive('معرف المنتج مطلوب'),
  variantId: z.number().positive().optional(),
  quantity: z.number().int().positive('الكمية يجب أن تكون موجبة'),
  receivedQuantity: z.number().int().min(0, 'الكمية المستلمة لا يمكن أن تكون سالبة').default(0),
  unitCost: z.number().min(0, 'سعر الوحدة لا يمكن أن يكون سالباً'),
  totalCost: z.number().min(0, 'التكلفة الإجمالية لا يمكن أن تكون سالبة')
});

// Enhanced Customer Schema
export const EnhancedCustomerSchema = z.object({
  id: z.number().optional(),
  customerType: z.enum(['individual', 'corporate', 'vip', 'wholesale'], {
    errorMap: () => ({ message: 'نوع العميل غير صحيح' })
  }).default('individual'),
  name: z.string().min(1, 'اسم العميل مطلوب').max(200, 'اسم العميل طويل جداً'),
  nameEn: z.string().max(200, 'الاسم الإنجليزي طويل جداً').optional(),
  email: z.string().email('البريد الإلكتروني غير صحيح').optional().or(z.literal('')),
  phone: z.string().regex(egyptianPhoneRegex, 'رقم الهاتف غير صحيح').optional().or(z.literal('')),
  alternatePhone: z.string().regex(egyptianPhoneRegex, 'رقم الهاتف البديل غير صحيح').optional().or(z.literal('')),
  address: z.string().max(500, 'العنوان طويل جداً').optional(),
  city: z.string().max(100, 'اسم المدينة طويل جداً').optional(),
  governorate: z.string().max(100, 'اسم المحافظة طويل جداً').optional(),
  postalCode: z.string().max(20, 'الرمز البريدي طويل جداً').optional(),
  taxId: z.string().regex(egyptianTaxIdRegex, 'الرقم الضريبي غير صحيح').optional().or(z.literal('')),
  commercialRegister: z.string().regex(egyptianCommercialRegisterRegex, 'رقم السجل التجاري غير صحيح').optional().or(z.literal('')),
  creditLimit: z.number().min(0, 'حد الائتمان لا يمكن أن يكون سالباً').default(0),
  paymentTerms: z.number().int().min(0, 'شروط الدفع لا يمكن أن تكون سالبة').default(0),
  loyaltyPoints: z.number().int().min(0, 'نقاط الولاء لا يمكن أن تكون سالبة').default(0),
  totalSpent: z.number().min(0, 'إجمالي المشتريات لا يمكن أن يكون سالباً').default(0),
  lastPurchaseDate: z.string().optional(),
  preferredLanguage: z.enum(['ar', 'en'], {
    errorMap: () => ({ message: 'اللغة المفضلة غير صحيحة' })
  }).default('ar'),
  communicationPreferences: z.object({
    sms: z.boolean().default(true),
    email: z.boolean().default(false),
    whatsapp: z.boolean().default(false)
  }).default({ sms: true, email: false, whatsapp: false }),
  referredBy: z.number().positive().optional(),
  profileImage: z.string().max(500, 'مسار الصورة طويل جداً').optional(),
  notes: z.string().max(1000, 'الملاحظات طويلة جداً').optional(),
  isActive: z.boolean().default(true),
  createdAt: z.string().optional(),
  updatedAt: z.string().optional()
});

// Location Schema
export const LocationSchema = z.object({
  id: z.number().optional(),
  name: z.string().min(1, 'اسم الموقع مطلوب').max(200, 'اسم الموقع طويل جداً'),
  nameEn: z.string().max(200, 'الاسم الإنجليزي طويل جداً').optional(),
  type: z.enum(['main', 'branch', 'warehouse'], {
    errorMap: () => ({ message: 'نوع الموقع غير صحيح' })
  }).default('branch'),
  address: z.string().max(500, 'العنوان طويل جداً').optional(),
  city: z.string().max(100, 'اسم المدينة طويل جداً').optional(),
  governorate: z.string().max(100, 'اسم المحافظة طويل جداً').optional(),
  phone: z.string().regex(egyptianPhoneRegex, 'رقم الهاتف غير صحيح').optional().or(z.literal('')),
  managerId: z.number().positive().optional(),
  isActive: z.boolean().default(true),
  settings: z.object({
    allowNegativeStock: z.boolean().default(false),
    autoReorder: z.boolean().default(true),
    printReceipts: z.boolean().default(true)
  }).default({
    allowNegativeStock: false,
    autoReorder: true,
    printReceipts: true
  }),
  createdAt: z.string().optional(),
  updatedAt: z.string().optional()
});

// Stock Transfer Schema
export const StockTransferSchema = z.object({
  id: z.number().optional(),
  fromLocationId: z.number().positive('موقع المصدر مطلوب'),
  toLocationId: z.number().positive('موقع الوجهة مطلوب'),
  transferNumber: z.string().min(1, 'رقم التحويل مطلوب').max(50, 'رقم التحويل طويل جداً'),
  status: z.enum(['pending', 'in_transit', 'received', 'cancelled'], {
    errorMap: () => ({ message: 'حالة التحويل غير صحيحة' })
  }).default('pending'),
  requestedBy: z.number().positive('معرف طالب التحويل مطلوب'),
  approvedBy: z.number().positive().optional(),
  receivedBy: z.number().positive().optional(),
  requestDate: z.string().min(1, 'تاريخ الطلب مطلوب'),
  approvalDate: z.string().optional(),
  receiveDate: z.string().optional(),
  notes: z.string().max(1000, 'الملاحظات طويلة جداً').optional(),
  createdAt: z.string().optional()
}).refine(data => data.fromLocationId !== data.toLocationId, {
  message: 'موقع المصدر والوجهة لا يمكن أن يكونا نفس الموقع',
  path: ['toLocationId']
});

// Stock Transfer Item Schema
export const StockTransferItemSchema = z.object({
  id: z.number().optional(),
  transferId: z.number().positive('معرف التحويل مطلوب'),
  productId: z.number().positive('معرف المنتج مطلوب'),
  variantId: z.number().positive().optional(),
  requestedQuantity: z.number().int().positive('الكمية المطلوبة يجب أن تكون موجبة'),
  approvedQuantity: z.number().int().min(0, 'الكمية المعتمدة لا يمكن أن تكون سالبة').optional(),
  receivedQuantity: z.number().int().min(0, 'الكمية المستلمة لا يمكن أن تكون سالبة').optional()
});

// User Role Schema
export const UserRoleSchema = z.object({
  id: z.number().optional(),
  name: z.string().min(1, 'اسم الدور مطلوب').max(100, 'اسم الدور طويل جداً'),
  nameEn: z.string().max(100, 'الاسم الإنجليزي طويل جداً').optional(),
  permissions: z.array(z.string()).min(1, 'يجب تحديد صلاحية واحدة على الأقل'),
  isActive: z.boolean().default(true),
  createdAt: z.string().optional()
});

// Enhanced User Schema
export const EnhancedUserSchema = z.object({
  id: z.number().optional(),
  username: z.string().min(3, 'اسم المستخدم يجب أن يكون 3 أحرف على الأقل').max(50, 'اسم المستخدم طويل جداً'),
  passwordHash: z.string().min(1, 'كلمة المرور مطلوبة'),
  fullName: z.string().min(1, 'الاسم الكامل مطلوب').max(200, 'الاسم الكامل طويل جداً'),
  fullNameEn: z.string().max(200, 'الاسم الإنجليزي طويل جداً').optional(),
  email: z.string().email('البريد الإلكتروني غير صحيح').optional().or(z.literal('')),
  phone: z.string().regex(egyptianPhoneRegex, 'رقم الهاتف غير صحيح').optional().or(z.literal('')),
  roleId: z.number().positive('معرف الدور مطلوب'),
  locationId: z.number().positive().optional(),
  employeeId: z.string().max(50, 'رقم الموظف طويل جداً').optional(),
  hireDate: z.string().optional(),
  salary: z.number().min(0, 'الراتب لا يمكن أن يكون سالباً').optional(),
  commissionRate: z.number().min(0, 'نسبة العمولة لا يمكن أن تكون سالبة').max(100, 'نسبة العمولة لا يمكن أن تزيد عن 100%').default(0),
  profileImage: z.string().max(500, 'مسار الصورة طويل جداً').optional(),
  preferences: z.object({
    language: z.enum(['ar', 'en']).default('ar'),
    theme: z.enum(['light', 'dark']).default('light'),
    notifications: z.boolean().default(true)
  }).default({
    language: 'ar',
    theme: 'light',
    notifications: true
  }),
  workSchedule: z.object({
    startTime: z.string(),
    endTime: z.string(),
    workDays: z.array(z.number().min(0).max(6)).min(1, 'يجب تحديد يوم عمل واحد على الأقل')
  }).optional(),
  lastLogin: z.string().optional(),
  isActive: z.boolean().default(true),
  createdAt: z.string().optional(),
  updatedAt: z.string().optional()
});

// Stock Movement Schema
export const StockMovementSchema = z.object({
  id: z.number().optional(),
  productId: z.number().positive('معرف المنتج مطلوب'),
  variantId: z.number().positive().optional(),
  locationId: z.number().positive().optional(),
  movementType: z.enum(['in', 'out', 'transfer', 'adjustment', 'return'], {
    errorMap: () => ({ message: 'نوع الحركة غير صحيح' })
  }),
  quantity: z.number().int().refine(val => val !== 0, {
    message: 'الكمية لا يمكن أن تكون صفراً'
  }),
  referenceType: z.enum(['sale', 'purchase', 'transfer', 'adjustment']).optional(),
  referenceId: z.number().positive().optional(),
  notes: z.string().max(500, 'الملاحظات طويلة جداً').optional(),
  userId: z.number().positive('معرف المستخدم مطلوب'),
  createdAt: z.string().optional()
});

// Product Expiry Schema
export const ProductExpirySchema = z.object({
  id: z.number().optional(),
  productId: z.number().positive('معرف المنتج مطلوب'),
  variantId: z.number().positive().optional(),
  batchNumber: z.string().max(100, 'رقم الدفعة طويل جداً').optional(),
  expiryDate: z.string().min(1, 'تاريخ الانتهاء مطلوب'),
  quantity: z.number().int().positive('الكمية يجب أن تكون موجبة'),
  locationId: z.number().positive().optional(),
  createdAt: z.string().optional()
});

// Product Serial Schema
export const ProductSerialSchema = z.object({
  id: z.number().optional(),
  productId: z.number().positive('معرف المنتج مطلوب'),
  variantId: z.number().positive().optional(),
  serialNumber: z.string().min(1, 'الرقم التسلسلي مطلوب').max(100, 'الرقم التسلسلي طويل جداً'),
  status: z.enum(['in_stock', 'sold', 'returned', 'damaged'], {
    errorMap: () => ({ message: 'حالة المنتج غير صحيحة' })
  }).default('in_stock'),
  locationId: z.number().positive().optional(),
  purchaseOrderId: z.number().positive().optional(),
  transactionId: z.number().positive().optional(),
  createdAt: z.string().optional()
});

// Report Parameter Schema
export const ReportParameterSchema = z.object({
  name: z.string().min(1, 'اسم المعامل مطلوب'),
  type: z.enum(['date', 'daterange', 'select', 'multiselect', 'number', 'text', 'boolean']),
  label: z.string().min(1, 'تسمية المعامل مطلوبة'),
  labelEn: z.string().optional(),
  required: z.boolean().default(false),
  defaultValue: z.any().optional(),
  options: z.array(z.object({
    value: z.any(),
    label: z.string(),
    labelEn: z.string().optional()
  })).optional()
});

// System Notification Schema
export const SystemNotificationSchema = z.object({
  id: z.number().optional(),
  type: z.enum(['info', 'warning', 'error', 'success']),
  category: z.enum(['system', 'inventory', 'sales', 'customer', 'user']),
  title: z.string().min(1, 'عنوان الإشعار مطلوب').max(200, 'عنوان الإشعار طويل جداً'),
  titleEn: z.string().max(200, 'العنوان الإنجليزي طويل جداً').optional(),
  message: z.string().min(1, 'رسالة الإشعار مطلوبة').max(1000, 'رسالة الإشعار طويلة جداً'),
  messageEn: z.string().max(1000, 'الرسالة الإنجليزية طويلة جداً').optional(),
  data: z.any().optional(),
  userId: z.number().positive().optional(),
  isRead: z.boolean().default(false),
  createdAt: z.string().optional(),
  expiresAt: z.string().optional()
});

// Pagination Schema
export const PaginationSchema = z.object({
  page: z.number().int().min(1, 'رقم الصفحة يجب أن يكون موجباً').default(1),
  limit: z.number().int().min(1, 'حد العناصر يجب أن يكون موجباً').max(100, 'حد العناصر لا يمكن أن يزيد عن 100').default(20),
  sortBy: z.string().optional(),
  sortOrder: z.enum(['asc', 'desc']).default('desc'),
  search: z.string().max(200, 'نص البحث طويل جداً').optional(),
  filters: z.record(z.any()).optional()
});

// Enhanced Validation Helper Class
export class EnhancedValidationHelper {
  /**
   * Validate Egyptian commercial register number
   */
  static validateCommercialRegister(value: string): boolean {
    return egyptianCommercialRegisterRegex.test(value);
  }

  /**
   * Validate Egyptian governorate
   */
  static validateGovernorate(value: string): boolean {
    const egyptianGovernorates = [
      'القاهرة', 'الجيزة', 'الإسكندرية', 'الدقهلية', 'البحيرة', 'الفيوم', 'الغربية', 'الإسماعيلية',
      'المنوفية', 'المنيا', 'القليوبية', 'الوادي الجديد', 'السويس', 'أسوان', 'أسيوط', 'بني سويف',
      'بورسعيد', 'دمياط', 'الشرقية', 'جنوب سيناء', 'كفر الشيخ', 'مطروح', 'الأقصر', 'قنا',
      'شمال سيناء', 'سوهاج', 'البحر الأحمر'
    ];
    return egyptianGovernorates.includes(value);
  }

  /**
   * Validate product attributes based on category
   */
  static validateProductAttributes(category: string, attributes: Record<string, string>): boolean {
    const requiredAttributes: Record<string, string[]> = {
      'ملابس': ['المقاس', 'اللون'],
      'إلكترونيات': ['الموديل', 'الضمان'],
      'أغذية': ['تاريخ الانتهاء', 'المنشأ'],
      'مشروبات': ['الحجم', 'النوع']
    };

    const required = requiredAttributes[category] || [];
    return required.every(attr => attributes[attr] && attributes[attr].trim().length > 0);
  }

  /**
   * Validate work schedule
   */
  static validateWorkSchedule(schedule: { startTime: string; endTime: string; workDays: number[] }): boolean {
    const { startTime, endTime, workDays } = schedule;
    
    // Validate time format (HH:MM)
    const timeRegex = /^([01]?[0-9]|2[0-3]):[0-5][0-9]$/;
    if (!timeRegex.test(startTime) || !timeRegex.test(endTime)) {
      return false;
    }

    // Validate start time is before end time
    const start = new Date(`1970-01-01T${startTime}:00`);
    const end = new Date(`1970-01-01T${endTime}:00`);
    if (start >= end) {
      return false;
    }

    // Validate work days (0-6, Sunday-Saturday)
    return workDays.every(day => day >= 0 && day <= 6) && workDays.length > 0;
  }

  /**
   * Validate credit limit based on customer type
   */
  static validateCreditLimit(customerType: string, creditLimit: number): boolean {
    const maxLimits: Record<string, number> = {
      'individual': 5000,
      'corporate': 100000,
      'vip': 50000,
      'wholesale': 200000
    };

    const maxLimit = maxLimits[customerType] || 0;
    return creditLimit <= maxLimit;
  }

  /**
   * Validate stock transfer between locations
   */
  static validateStockTransfer(fromLocationId: number, toLocationId: number, items: any[]): string[] {
    const errors: string[] = [];

    if (fromLocationId === toLocationId) {
      errors.push('موقع المصدر والوجهة لا يمكن أن يكونا نفس الموقع');
    }

    if (items.length === 0) {
      errors.push('يجب إضافة عنصر واحد على الأقل للتحويل');
    }

    // Check for duplicate products in items
    const productIds = items.map(item => `${item.productId}-${item.variantId || 0}`);
    const uniqueProductIds = new Set(productIds);
    if (productIds.length !== uniqueProductIds.size) {
      errors.push('لا يمكن تكرار نفس المنتج في التحويل');
    }

    return errors;
  }

  /**
   * Validate purchase order totals
   */
  static validatePurchaseOrderTotals(subtotal: number, vatAmount: number, total: number, vatRate: number = 14): boolean {
    const expectedVat = subtotal * (vatRate / 100);
    const expectedTotal = subtotal + expectedVat;
    
    return Math.abs(vatAmount - expectedVat) < 0.01 && Math.abs(total - expectedTotal) < 0.01;
  }
}

export default {
  ProductVariantSchema,
  PricingTierSchema,
  SupplierSchema,
  PurchaseOrderSchema,
  PurchaseOrderItemSchema,
  EnhancedCustomerSchema,
  LocationSchema,
  StockTransferSchema,
  StockTransferItemSchema,
  UserRoleSchema,
  EnhancedUserSchema,
  StockMovementSchema,
  ProductExpirySchema,
  ProductSerialSchema,
  ReportParameterSchema,
  SystemNotificationSchema,
  PaginationSchema,
  EnhancedValidationHelper
};
