// Enhanced User Management Service - Advanced user roles and permissions for Phase 2
// Handles user roles, permissions, performance tracking, and work schedules

import { EnhancedDatabaseManager } from '../database/EnhancedDatabaseManager';
import { 
  EnhancedUser, 
  UserRole,
  UserPerformance,
  ApiResponse,
  PaginationParams,
  PERMISSIONS
} from '../../shared/types/enhanced';
import { 
  EnhancedUserSchema,
  UserRoleSchema,
  EnhancedValidationHelper
} from '../../shared/validation/enhancedSchemas';
import * as crypto from 'crypto';

export class EnhancedUserService {
  private db: EnhancedDatabaseManager;

  constructor(db: EnhancedDatabaseManager) {
    this.db = db;
  }

  // ==================== USER MANAGEMENT ====================

  /**
   * Create a new user
   */
  async createUser(user: Omit<EnhancedUser, 'id' | 'passwordHash'> & { password: string }): Promise<ApiResponse<EnhancedUser>> {
    try {
      // Validate input
      const { password, ...userData } = user;
      const validatedUser = EnhancedUserSchema.omit({ passwordHash: true }).parse(userData);
      
      // Validate password strength
      if (password.length < 8) {
        return {
          success: false,
          message: 'كلمة المرور يجب أن تكون 8 أحرف على الأقل',
          messageEn: 'Password must be at least 8 characters'
        };
      }

      // Check if username already exists
      const existingUser = this.db.raw.prepare('SELECT id FROM users_enhanced WHERE username = ?').get(validatedUser.username);
      if (existingUser) {
        return {
          success: false,
          message: 'اسم المستخدم موجود بالفعل',
          messageEn: 'Username already exists'
        };
      }

      // Check if email already exists (if provided)
      if (validatedUser.email) {
        const existingEmail = this.db.raw.prepare('SELECT id FROM users_enhanced WHERE email = ?').get(validatedUser.email);
        if (existingEmail) {
          return {
            success: false,
            message: 'البريد الإلكتروني موجود بالفعل',
            messageEn: 'Email already exists'
          };
        }
      }

      // Validate work schedule if provided
      if (validatedUser.workSchedule && !EnhancedValidationHelper.validateWorkSchedule(validatedUser.workSchedule)) {
        return {
          success: false,
          message: 'جدول العمل غير صحيح',
          messageEn: 'Invalid work schedule'
        };
      }

      // Hash password
      const passwordHash = crypto.createHash('sha256').update(password).digest('hex');

      // Insert user
      const stmt = this.db.raw.prepare(`
        INSERT INTO users_enhanced (
          username, password_hash, full_name, full_name_en, email, phone,
          role_id, location_id, employee_id, hire_date, salary, commission_rate,
          profile_image, preferences, work_schedule, is_active
        ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
      `);

      const result = stmt.run(
        validatedUser.username,
        passwordHash,
        validatedUser.fullName,
        validatedUser.fullNameEn,
        validatedUser.email,
        validatedUser.phone,
        validatedUser.roleId,
        validatedUser.locationId,
        validatedUser.employeeId,
        validatedUser.hireDate,
        validatedUser.salary,
        validatedUser.commissionRate,
        validatedUser.profileImage,
        JSON.stringify(validatedUser.preferences),
        validatedUser.workSchedule ? JSON.stringify(validatedUser.workSchedule) : null,
        validatedUser.isActive ? 1 : 0
      );

      const createdUser = { ...validatedUser, id: result.lastInsertRowid as number, passwordHash };

      return {
        success: true,
        data: createdUser,
        message: 'تم إنشاء المستخدم بنجاح',
        messageEn: 'User created successfully'
      };

    } catch (error) {
      return {
        success: false,
        message: 'فشل في إنشاء المستخدم',
        messageEn: 'Failed to create user',
        errors: [error instanceof Error ? error.message : String(error)]
      };
    }
  }

  /**
   * Update user information
   */
  async updateUser(id: number, updates: Partial<EnhancedUser> & { password?: string }): Promise<ApiResponse<EnhancedUser>> {
    try {
      const { password, ...userData } = updates;
      const validatedUpdates = EnhancedUserSchema.partial().parse(userData);

      // Check if user exists
      const existingUser = await this.getUserById(id);
      if (!existingUser.success || !existingUser.data) {
        return {
          success: false,
          message: 'المستخدم غير موجود',
          messageEn: 'User not found'
        };
      }

      // Build update query
      const fields = Object.keys(validatedUpdates).filter(key => key !== 'id');
      const values: any[] = [];

      // Handle password update separately
      if (password) {
        if (password.length < 8) {
          return {
            success: false,
            message: 'كلمة المرور يجب أن تكون 8 أحرف على الأقل',
            messageEn: 'Password must be at least 8 characters'
          };
        }
        fields.push('password_hash');
        values.push(crypto.createHash('sha256').update(password).digest('hex'));
      }

      if (fields.length === 0) {
        return {
          success: false,
          message: 'لا توجد بيانات للتحديث',
          messageEn: 'No data to update'
        };
      }

      // Add other field values
      fields.filter(f => f !== 'password_hash').forEach(field => {
        const value = (validatedUpdates as any)[field];
        if (field === 'preferences' || field === 'workSchedule') {
          values.push(typeof value === 'object' ? JSON.stringify(value) : value);
        } else {
          values.push(value);
        }
      });

      const setClause = fields.map(field => `${this.camelToSnake(field)} = ?`).join(', ');

      const stmt = this.db.raw.prepare(`
        UPDATE users_enhanced 
        SET ${setClause}, updated_at = CURRENT_TIMESTAMP 
        WHERE id = ?
      `);

      const result = stmt.run(...values, id);

      if (result.changes === 0) {
        return {
          success: false,
          message: 'فشل في تحديث المستخدم',
          messageEn: 'Failed to update user'
        };
      }

      // Return updated user
      const updatedUser = await this.getUserById(id);
      return updatedUser;

    } catch (error) {
      return {
        success: false,
        message: 'فشل في تحديث المستخدم',
        messageEn: 'Failed to update user',
        errors: [error instanceof Error ? error.message : String(error)]
      };
    }
  }

  /**
   * Get user by ID with full details
   */
  async getUserById(id: number): Promise<ApiResponse<EnhancedUser>> {
    try {
      const stmt = this.db.raw.prepare(`
        SELECT 
          u.*,
          r.name as role_name,
          r.permissions as role_permissions,
          l.name as location_name
        FROM users_enhanced u
        LEFT JOIN user_roles r ON u.role_id = r.id
        LEFT JOIN locations l ON u.location_id = l.id
        WHERE u.id = ?
      `);

      const row = stmt.get(id) as any;
      
      if (!row) {
        return {
          success: false,
          message: 'المستخدم غير موجود',
          messageEn: 'User not found'
        };
      }

      const user = this.mapUserRow(row);

      // Get user performance
      const performance = await this.getUserPerformance(id);
      if (performance.success) {
        user.performance = performance.data;
      }

      return {
        success: true,
        data: user
      };

    } catch (error) {
      return {
        success: false,
        message: 'فشل في جلب بيانات المستخدم',
        messageEn: 'Failed to fetch user',
        errors: [error instanceof Error ? error.message : String(error)]
      };
    }
  }

  /**
   * Search users with filters
   */
  async searchUsers(params: PaginationParams & {
    roleId?: number;
    locationId?: number;
    isActive?: boolean;
  } = {}): Promise<ApiResponse<EnhancedUser[]>> {
    try {
      const { 
        page = 1, 
        limit = 20, 
        search, 
        roleId, 
        locationId, 
        isActive,
        sortBy = 'full_name',
        sortOrder = 'asc'
      } = params;
      
      const offset = (page - 1) * limit;
      const whereConditions: string[] = ['1=1'];
      const queryParams: any[] = [];

      if (search) {
        whereConditions.push('(u.full_name LIKE ? OR u.username LIKE ? OR u.email LIKE ? OR u.employee_id LIKE ?)');
        const searchTerm = `%${search}%`;
        queryParams.push(searchTerm, searchTerm, searchTerm, searchTerm);
      }

      if (roleId) {
        whereConditions.push('u.role_id = ?');
        queryParams.push(roleId);
      }

      if (locationId) {
        whereConditions.push('u.location_id = ?');
        queryParams.push(locationId);
      }

      if (isActive !== undefined) {
        whereConditions.push('u.is_active = ?');
        queryParams.push(isActive ? 1 : 0);
      }

      const whereClause = `WHERE ${whereConditions.join(' AND ')}`;
      const orderClause = `ORDER BY u.${this.camelToSnake(sortBy)} ${sortOrder.toUpperCase()}`;

      const stmt = this.db.raw.prepare(`
        SELECT 
          u.*,
          r.name as role_name,
          r.permissions as role_permissions,
          l.name as location_name
        FROM users_enhanced u
        LEFT JOIN user_roles r ON u.role_id = r.id
        LEFT JOIN locations l ON u.location_id = l.id
        ${whereClause}
        ${orderClause}
        LIMIT ? OFFSET ?
      `);

      const countStmt = this.db.raw.prepare(`
        SELECT COUNT(*) as total FROM users_enhanced u ${whereClause}
      `);

      const rows = stmt.all(...queryParams, limit, offset) as any[];
      const totalResult = countStmt.get(...queryParams) as { total: number };

      const users = rows.map(row => this.mapUserRow(row));

      return {
        success: true,
        data: users,
        pagination: {
          page,
          limit,
          total: totalResult.total,
          totalPages: Math.ceil(totalResult.total / limit)
        }
      };

    } catch (error) {
      return {
        success: false,
        message: 'فشل في البحث عن المستخدمين',
        messageEn: 'Failed to search users',
        errors: [error instanceof Error ? error.message : String(error)]
      };
    }
  }

  // ==================== USER ROLES ====================

  /**
   * Create user role
   */
  async createUserRole(role: Omit<UserRole, 'id'>): Promise<ApiResponse<UserRole>> {
    try {
      const validatedRole = UserRoleSchema.parse(role);

      // Check if role name already exists
      const existingRole = this.db.raw.prepare('SELECT id FROM user_roles WHERE name = ?').get(validatedRole.name);
      if (existingRole) {
        return {
          success: false,
          message: 'اسم الدور موجود بالفعل',
          messageEn: 'Role name already exists'
        };
      }

      const stmt = this.db.raw.prepare(`
        INSERT INTO user_roles (name, name_en, permissions, is_active)
        VALUES (?, ?, ?, ?)
      `);

      const result = stmt.run(
        validatedRole.name,
        validatedRole.nameEn,
        JSON.stringify(validatedRole.permissions),
        validatedRole.isActive ? 1 : 0
      );

      const createdRole = { ...validatedRole, id: result.lastInsertRowid as number };

      return {
        success: true,
        data: createdRole,
        message: 'تم إنشاء الدور بنجاح',
        messageEn: 'Role created successfully'
      };

    } catch (error) {
      return {
        success: false,
        message: 'فشل في إنشاء الدور',
        messageEn: 'Failed to create role',
        errors: [error instanceof Error ? error.message : String(error)]
      };
    }
  }

  /**
   * Get all user roles
   */
  async getUserRoles(includeInactive: boolean = false): Promise<ApiResponse<UserRole[]>> {
    try {
      const whereClause = includeInactive ? '' : 'WHERE is_active = 1';
      
      const stmt = this.db.raw.prepare(`
        SELECT * FROM user_roles ${whereClause} ORDER BY name
      `);

      const rows = stmt.all() as any[];
      const roles = rows.map(row => ({
        id: row.id,
        name: row.name,
        nameEn: row.name_en,
        permissions: JSON.parse(row.permissions || '[]'),
        isActive: Boolean(row.is_active),
        createdAt: row.created_at
      }));

      return {
        success: true,
        data: roles
      };

    } catch (error) {
      return {
        success: false,
        message: 'فشل في جلب الأدوار',
        messageEn: 'Failed to fetch roles',
        errors: [error instanceof Error ? error.message : String(error)]
      };
    }
  }

  /**
   * Check if user has permission
   */
  async checkUserPermission(userId: number, permission: string): Promise<ApiResponse<boolean>> {
    try {
      const stmt = this.db.raw.prepare(`
        SELECT r.permissions 
        FROM users_enhanced u
        JOIN user_roles r ON u.role_id = r.id
        WHERE u.id = ? AND u.is_active = 1 AND r.is_active = 1
      `);

      const result = stmt.get(userId) as any;
      
      if (!result) {
        return {
          success: true,
          data: false
        };
      }

      const permissions = JSON.parse(result.permissions || '[]');
      const hasPermission = permissions.includes(PERMISSIONS.ALL) || permissions.includes(permission);

      return {
        success: true,
        data: hasPermission
      };

    } catch (error) {
      return {
        success: false,
        message: 'فشل في فحص الصلاحية',
        messageEn: 'Failed to check permission',
        errors: [error instanceof Error ? error.message : String(error)]
      };
    }
  }

  // ==================== USER PERFORMANCE ====================

  /**
   * Get user performance metrics
   */
  async getUserPerformance(userId: number, period?: string): Promise<ApiResponse<UserPerformance>> {
    try {
      const currentPeriod = period || new Date().toISOString().slice(0, 7); // YYYY-MM format

      // Get sales performance
      const salesStats = this.db.raw.prepare(`
        SELECT 
          COUNT(*) as sales_count,
          COALESCE(SUM(total), 0) as sales_amount,
          COALESCE(AVG(total), 0) as average_transaction_value,
          COUNT(DISTINCT customer_id) as customers_served
        FROM transactions 
        WHERE cashier_id = ? AND strftime('%Y-%m', created_at) = ?
      `).get(userId, currentPeriod) as any;

      // Calculate commission earned
      const user = await this.getUserById(userId);
      const commissionRate = user.data?.commissionRate || 0;
      const commissionEarned = (salesStats.sales_amount * commissionRate) / 100;

      // Get work hours (simplified - you might want to implement time tracking)
      const workingDays = 22; // Average working days per month
      const hoursPerDay = 8; // Standard work day
      const hoursWorked = workingDays * hoursPerDay;

      const performance: UserPerformance = {
        userId,
        period: currentPeriod,
        salesCount: salesStats.sales_count || 0,
        salesAmount: salesStats.sales_amount || 0,
        averageTransactionValue: salesStats.average_transaction_value || 0,
        customersServed: salesStats.customers_served || 0,
        hoursWorked,
        commissionEarned,
        targets: {
          salesAmount: 100000, // Default target - should be configurable
          salesCount: 200,
          customerCount: 100
        },
        achievements: this.calculateAchievements(salesStats, commissionEarned)
      };

      return {
        success: true,
        data: performance
      };

    } catch (error) {
      return {
        success: false,
        message: 'فشل في جلب أداء المستخدم',
        messageEn: 'Failed to fetch user performance',
        errors: [error instanceof Error ? error.message : String(error)]
      };
    }
  }

  /**
   * Get team performance comparison
   */
  async getTeamPerformance(locationId?: number, period?: string): Promise<ApiResponse<UserPerformance[]>> {
    try {
      const currentPeriod = period || new Date().toISOString().slice(0, 7);
      
      let whereClause = 'WHERE u.is_active = 1';
      const params: any[] = [currentPeriod];

      if (locationId) {
        whereClause += ' AND u.location_id = ?';
        params.push(locationId);
      }

      const stmt = this.db.raw.prepare(`
        SELECT 
          u.id,
          u.full_name,
          u.commission_rate,
          COUNT(t.id) as sales_count,
          COALESCE(SUM(t.total), 0) as sales_amount,
          COALESCE(AVG(t.total), 0) as average_transaction_value,
          COUNT(DISTINCT t.customer_id) as customers_served
        FROM users_enhanced u
        LEFT JOIN transactions t ON u.id = t.cashier_id AND strftime('%Y-%m', t.created_at) = ?
        ${whereClause}
        GROUP BY u.id
        ORDER BY sales_amount DESC
      `);

      const rows = stmt.all(...params) as any[];

      const teamPerformance = rows.map(row => ({
        userId: row.id,
        period: currentPeriod,
        salesCount: row.sales_count || 0,
        salesAmount: row.sales_amount || 0,
        averageTransactionValue: row.average_transaction_value || 0,
        customersServed: row.customers_served || 0,
        hoursWorked: 176, // Standard month hours
        commissionEarned: ((row.sales_amount || 0) * (row.commission_rate || 0)) / 100,
        userName: row.full_name
      }));

      return {
        success: true,
        data: teamPerformance
      };

    } catch (error) {
      return {
        success: false,
        message: 'فشل في جلب أداء الفريق',
        messageEn: 'Failed to fetch team performance',
        errors: [error instanceof Error ? error.message : String(error)]
      };
    }
  }

  // ==================== AUTHENTICATION ====================

  /**
   * Authenticate user
   */
  async authenticateUser(username: string, password: string): Promise<ApiResponse<EnhancedUser>> {
    try {
      const passwordHash = crypto.createHash('sha256').update(password).digest('hex');
      
      const stmt = this.db.raw.prepare(`
        SELECT 
          u.*,
          r.name as role_name,
          r.permissions as role_permissions,
          l.name as location_name
        FROM users_enhanced u
        LEFT JOIN user_roles r ON u.role_id = r.id
        LEFT JOIN locations l ON u.location_id = l.id
        WHERE u.username = ? AND u.password_hash = ? AND u.is_active = 1
      `);

      const row = stmt.get(username, passwordHash) as any;
      
      if (!row) {
        return {
          success: false,
          message: 'اسم المستخدم أو كلمة المرور غير صحيحة',
          messageEn: 'Invalid username or password'
        };
      }

      // Update last login
      this.db.raw.prepare('UPDATE users_enhanced SET last_login = CURRENT_TIMESTAMP WHERE id = ?').run(row.id);

      const user = this.mapUserRow(row);

      return {
        success: true,
        data: user,
        message: 'تم تسجيل الدخول بنجاح',
        messageEn: 'Login successful'
      };

    } catch (error) {
      return {
        success: false,
        message: 'فشل في تسجيل الدخول',
        messageEn: 'Login failed',
        errors: [error instanceof Error ? error.message : String(error)]
      };
    }
  }

  // ==================== HELPER METHODS ====================

  /**
   * Calculate user achievements based on performance
   */
  private calculateAchievements(salesStats: any, commissionEarned: number): string[] {
    const achievements: string[] = [];

    if (salesStats.sales_amount >= 100000) {
      achievements.push('top_performer');
    }

    if (salesStats.sales_count >= 200) {
      achievements.push('high_volume');
    }

    if (salesStats.customers_served >= 100) {
      achievements.push('customer_champion');
    }

    if (commissionEarned >= 5000) {
      achievements.push('commission_star');
    }

    if (salesStats.average_transaction_value >= 500) {
      achievements.push('upselling_expert');
    }

    return achievements;
  }

  /**
   * Convert camelCase to snake_case
   */
  private camelToSnake(str: string): string {
    return str.replace(/[A-Z]/g, letter => `_${letter.toLowerCase()}`);
  }

  /**
   * Map database row to EnhancedUser object
   */
  private mapUserRow(row: any): EnhancedUser {
    return {
      id: row.id,
      username: row.username,
      passwordHash: row.password_hash,
      fullName: row.full_name,
      fullNameEn: row.full_name_en,
      email: row.email,
      phone: row.phone,
      roleId: row.role_id,
      locationId: row.location_id,
      employeeId: row.employee_id,
      hireDate: row.hire_date,
      salary: row.salary,
      commissionRate: row.commission_rate,
      profileImage: row.profile_image,
      preferences: JSON.parse(row.preferences || '{"language":"ar","theme":"light","notifications":true}'),
      workSchedule: row.work_schedule ? JSON.parse(row.work_schedule) : undefined,
      lastLogin: row.last_login,
      isActive: Boolean(row.is_active),
      createdAt: row.created_at,
      updatedAt: row.updated_at,
      role: row.role_name ? {
        id: row.role_id,
        name: row.role_name,
        permissions: JSON.parse(row.role_permissions || '[]')
      } : undefined,
      location: row.location_name ? {
        id: row.location_id,
        name: row.location_name
      } : undefined
    } as EnhancedUser;
  }
}

export default EnhancedUserService;
