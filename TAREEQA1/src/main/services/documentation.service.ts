// Documentation Service - Comprehensive documentation system for Tareeqa POS
// Handles user manuals, video tutorials, interactive help, and contextual guidance

import * as fs from 'fs';
import * as path from 'path';
import { EnhancedDatabaseManager } from '../database/EnhancedDatabaseManager';
import { ApiResponse } from '../../shared/types/enhanced';

export interface DocumentationItem {
  id: string;
  title: string;
  titleEn: string;
  category: 'user-guide' | 'admin-guide' | 'api-reference' | 'tutorial' | 'faq' | 'troubleshooting';
  type: 'text' | 'video' | 'interactive' | 'pdf';
  content: string;
  contentEn: string;
  tags: string[];
  difficulty: 'beginner' | 'intermediate' | 'advanced';
  estimatedReadTime: number; // in minutes
  lastUpdated: string;
  version: string;
  isActive: boolean;
}

export interface VideoTutorial {
  id: string;
  title: string;
  titleEn: string;
  description: string;
  descriptionEn: string;
  videoUrl: string;
  thumbnailUrl: string;
  duration: number; // in seconds
  category: string;
  tags: string[];
  transcript: string;
  transcriptEn: string;
  difficulty: 'beginner' | 'intermediate' | 'advanced';
  viewCount: number;
  rating: number;
  createdAt: string;
  updatedAt: string;
}

export interface InteractiveGuide {
  id: string;
  title: string;
  titleEn: string;
  steps: InteractiveStep[];
  category: string;
  estimatedTime: number;
  prerequisites: string[];
  isActive: boolean;
}

export interface InteractiveStep {
  id: string;
  title: string;
  titleEn: string;
  description: string;
  descriptionEn: string;
  action: 'click' | 'input' | 'navigate' | 'wait' | 'verify';
  selector?: string;
  expectedValue?: string;
  screenshot?: string;
  tips: string[];
  tipsEn: string[];
}

export interface HelpContext {
  page: string;
  section: string;
  userRole: string;
  language: 'ar' | 'en';
}

export class DocumentationService {
  private db: EnhancedDatabaseManager;
  private docsPath: string;
  private videosPath: string;

  constructor(db: EnhancedDatabaseManager) {
    this.db = db;
    this.docsPath = path.join(process.cwd(), 'docs');
    this.videosPath = path.join(process.cwd(), 'assets', 'videos');
    this.initializeDocumentationTables();
  }

  /**
   * Initialize documentation tables
   */
  private initializeDocumentationTables(): void {
    // Documentation items table
    this.db.raw.exec(`
      CREATE TABLE IF NOT EXISTS documentation_items (
        id TEXT PRIMARY KEY,
        title TEXT NOT NULL,
        title_en TEXT NOT NULL,
        category TEXT NOT NULL,
        type TEXT NOT NULL,
        content TEXT NOT NULL,
        content_en TEXT NOT NULL,
        tags TEXT NOT NULL,
        difficulty TEXT NOT NULL,
        estimated_read_time INTEGER NOT NULL,
        last_updated DATETIME DEFAULT CURRENT_TIMESTAMP,
        version TEXT NOT NULL,
        is_active BOOLEAN DEFAULT 1
      )
    `);

    // Video tutorials table
    this.db.raw.exec(`
      CREATE TABLE IF NOT EXISTS video_tutorials (
        id TEXT PRIMARY KEY,
        title TEXT NOT NULL,
        title_en TEXT NOT NULL,
        description TEXT NOT NULL,
        description_en TEXT NOT NULL,
        video_url TEXT NOT NULL,
        thumbnail_url TEXT,
        duration INTEGER NOT NULL,
        category TEXT NOT NULL,
        tags TEXT NOT NULL,
        transcript TEXT,
        transcript_en TEXT,
        difficulty TEXT NOT NULL,
        view_count INTEGER DEFAULT 0,
        rating REAL DEFAULT 0,
        created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
        updated_at DATETIME DEFAULT CURRENT_TIMESTAMP
      )
    `);

    // Interactive guides table
    this.db.raw.exec(`
      CREATE TABLE IF NOT EXISTS interactive_guides (
        id TEXT PRIMARY KEY,
        title TEXT NOT NULL,
        title_en TEXT NOT NULL,
        steps TEXT NOT NULL,
        category TEXT NOT NULL,
        estimated_time INTEGER NOT NULL,
        prerequisites TEXT NOT NULL,
        is_active BOOLEAN DEFAULT 1,
        created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
        updated_at DATETIME DEFAULT CURRENT_TIMESTAMP
      )
    `);

    // Help analytics table
    this.db.raw.exec(`
      CREATE TABLE IF NOT EXISTS help_analytics (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        user_id INTEGER,
        page TEXT NOT NULL,
        section TEXT,
        help_item_id TEXT,
        action TEXT NOT NULL,
        timestamp DATETIME DEFAULT CURRENT_TIMESTAMP,
        session_id TEXT
      )
    `);

    console.log('✅ Documentation tables initialized');
  }

  // ==================== DOCUMENTATION MANAGEMENT ====================

  /**
   * Create or update documentation item
   */
  async createDocumentationItem(item: Omit<DocumentationItem, 'lastUpdated'>): Promise<ApiResponse<DocumentationItem>> {
    try {
      const stmt = this.db.raw.prepare(`
        INSERT OR REPLACE INTO documentation_items (
          id, title, title_en, category, type, content, content_en,
          tags, difficulty, estimated_read_time, version, is_active
        ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
      `);

      stmt.run(
        item.id,
        item.title,
        item.titleEn,
        item.category,
        item.type,
        item.content,
        item.contentEn,
        JSON.stringify(item.tags),
        item.difficulty,
        item.estimatedReadTime,
        item.version,
        item.isActive ? 1 : 0
      );

      const createdItem = { ...item, lastUpdated: new Date().toISOString() };

      return {
        success: true,
        data: createdItem,
        message: 'تم إنشاء عنصر التوثيق بنجاح',
        messageEn: 'Documentation item created successfully'
      };

    } catch (error) {
      return {
        success: false,
        message: 'فشل في إنشاء عنصر التوثيق',
        messageEn: 'Failed to create documentation item',
        errors: [error instanceof Error ? error.message : String(error)]
      };
    }
  }

  /**
   * Search documentation items
   */
  async searchDocumentation(query: string, category?: string, language: 'ar' | 'en' = 'ar'): Promise<ApiResponse<DocumentationItem[]>> {
    try {
      let whereClause = 'WHERE is_active = 1';
      const params: any[] = [];

      if (query) {
        if (language === 'ar') {
          whereClause += ' AND (title LIKE ? OR content LIKE ? OR tags LIKE ?)';
        } else {
          whereClause += ' AND (title_en LIKE ? OR content_en LIKE ? OR tags LIKE ?)';
        }
        const searchTerm = `%${query}%`;
        params.push(searchTerm, searchTerm, searchTerm);
      }

      if (category) {
        whereClause += ' AND category = ?';
        params.push(category);
      }

      const stmt = this.db.raw.prepare(`
        SELECT * FROM documentation_items 
        ${whereClause} 
        ORDER BY last_updated DESC
      `);

      const rows = stmt.all(...params) as any[];
      const items = rows.map(row => this.mapDocumentationRow(row));

      return {
        success: true,
        data: items
      };

    } catch (error) {
      return {
        success: false,
        message: 'فشل في البحث في التوثيق',
        messageEn: 'Failed to search documentation',
        errors: [error instanceof Error ? error.message : String(error)]
      };
    }
  }

  /**
   * Get contextual help for specific page/section
   */
  async getContextualHelp(context: HelpContext): Promise<ApiResponse<DocumentationItem[]>> {
    try {
      // Log help request for analytics
      this.logHelpAnalytics(context.page, context.section, 'contextual_help_request');

      const stmt = this.db.raw.prepare(`
        SELECT * FROM documentation_items 
        WHERE is_active = 1 
        AND (tags LIKE ? OR tags LIKE ? OR category = 'user-guide')
        ORDER BY 
          CASE 
            WHEN tags LIKE ? THEN 1
            WHEN tags LIKE ? THEN 2
            ELSE 3
          END,
          estimated_read_time ASC
        LIMIT 5
      `);

      const pageTag = `%${context.page}%`;
      const sectionTag = `%${context.section}%`;

      const rows = stmt.all(pageTag, sectionTag, pageTag, sectionTag) as any[];
      const items = rows.map(row => this.mapDocumentationRow(row));

      return {
        success: true,
        data: items
      };

    } catch (error) {
      return {
        success: false,
        message: 'فشل في جلب المساعدة السياقية',
        messageEn: 'Failed to get contextual help',
        errors: [error instanceof Error ? error.message : String(error)]
      };
    }
  }

  // ==================== VIDEO TUTORIALS ====================

  /**
   * Create video tutorial
   */
  async createVideoTutorial(tutorial: Omit<VideoTutorial, 'viewCount' | 'rating' | 'createdAt' | 'updatedAt'>): Promise<ApiResponse<VideoTutorial>> {
    try {
      const stmt = this.db.raw.prepare(`
        INSERT INTO video_tutorials (
          id, title, title_en, description, description_en, video_url,
          thumbnail_url, duration, category, tags, transcript, transcript_en, difficulty
        ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
      `);

      stmt.run(
        tutorial.id,
        tutorial.title,
        tutorial.titleEn,
        tutorial.description,
        tutorial.descriptionEn,
        tutorial.videoUrl,
        tutorial.thumbnailUrl,
        tutorial.duration,
        tutorial.category,
        JSON.stringify(tutorial.tags),
        tutorial.transcript,
        tutorial.transcriptEn,
        tutorial.difficulty
      );

      const createdTutorial = {
        ...tutorial,
        viewCount: 0,
        rating: 0,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString()
      };

      return {
        success: true,
        data: createdTutorial,
        message: 'تم إنشاء الدرس التعليمي بنجاح',
        messageEn: 'Video tutorial created successfully'
      };

    } catch (error) {
      return {
        success: false,
        message: 'فشل في إنشاء الدرس التعليمي',
        messageEn: 'Failed to create video tutorial',
        errors: [error instanceof Error ? error.message : String(error)]
      };
    }
  }

  /**
   * Get video tutorials by category
   */
  async getVideoTutorials(category?: string, difficulty?: string): Promise<ApiResponse<VideoTutorial[]>> {
    try {
      let whereClause = '1=1';
      const params: any[] = [];

      if (category) {
        whereClause += ' AND category = ?';
        params.push(category);
      }

      if (difficulty) {
        whereClause += ' AND difficulty = ?';
        params.push(difficulty);
      }

      const stmt = this.db.raw.prepare(`
        SELECT * FROM video_tutorials 
        WHERE ${whereClause} 
        ORDER BY rating DESC, view_count DESC
      `);

      const rows = stmt.all(...params) as any[];
      const tutorials = rows.map(row => this.mapVideoTutorialRow(row));

      return {
        success: true,
        data: tutorials
      };

    } catch (error) {
      return {
        success: false,
        message: 'فشل في جلب الدروس التعليمية',
        messageEn: 'Failed to get video tutorials',
        errors: [error instanceof Error ? error.message : String(error)]
      };
    }
  }

  /**
   * Track video view
   */
  async trackVideoView(videoId: string, userId?: number): Promise<ApiResponse<void>> {
    try {
      // Increment view count
      this.db.raw.prepare('UPDATE video_tutorials SET view_count = view_count + 1 WHERE id = ?').run(videoId);

      // Log analytics
      this.logHelpAnalytics('video', videoId, 'video_view', userId);

      return {
        success: true,
        message: 'تم تسجيل المشاهدة بنجاح',
        messageEn: 'Video view tracked successfully'
      };

    } catch (error) {
      return {
        success: false,
        message: 'فشل في تسجيل المشاهدة',
        messageEn: 'Failed to track video view',
        errors: [error instanceof Error ? error.message : String(error)]
      };
    }
  }

  // ==================== INTERACTIVE GUIDES ====================

  /**
   * Create interactive guide
   */
  async createInteractiveGuide(guide: Omit<InteractiveGuide, 'createdAt' | 'updatedAt'>): Promise<ApiResponse<InteractiveGuide>> {
    try {
      const stmt = this.db.raw.prepare(`
        INSERT INTO interactive_guides (
          id, title, title_en, steps, category, estimated_time, prerequisites, is_active
        ) VALUES (?, ?, ?, ?, ?, ?, ?, ?)
      `);

      stmt.run(
        guide.id,
        guide.title,
        guide.titleEn,
        JSON.stringify(guide.steps),
        guide.category,
        guide.estimatedTime,
        JSON.stringify(guide.prerequisites),
        guide.isActive ? 1 : 0
      );

      return {
        success: true,
        data: guide,
        message: 'تم إنشاء الدليل التفاعلي بنجاح',
        messageEn: 'Interactive guide created successfully'
      };

    } catch (error) {
      return {
        success: false,
        message: 'فشل في إنشاء الدليل التفاعلي',
        messageEn: 'Failed to create interactive guide',
        errors: [error instanceof Error ? error.message : String(error)]
      };
    }
  }

  /**
   * Get interactive guides
   */
  async getInteractiveGuides(category?: string): Promise<ApiResponse<InteractiveGuide[]>> {
    try {
      let whereClause = 'WHERE is_active = 1';
      const params: any[] = [];

      if (category) {
        whereClause += ' AND category = ?';
        params.push(category);
      }

      const stmt = this.db.raw.prepare(`
        SELECT * FROM interactive_guides ${whereClause} ORDER BY estimated_time ASC
      `);

      const rows = stmt.all(...params) as any[];
      const guides = rows.map(row => ({
        id: row.id,
        title: row.title,
        titleEn: row.title_en,
        steps: JSON.parse(row.steps),
        category: row.category,
        estimatedTime: row.estimated_time,
        prerequisites: JSON.parse(row.prerequisites),
        isActive: Boolean(row.is_active)
      }));

      return {
        success: true,
        data: guides
      };

    } catch (error) {
      return {
        success: false,
        message: 'فشل في جلب الأدلة التفاعلية',
        messageEn: 'Failed to get interactive guides',
        errors: [error instanceof Error ? error.message : String(error)]
      };
    }
  }

  // ==================== ANALYTICS ====================

  /**
   * Log help analytics
   */
  private logHelpAnalytics(page: string, section: string, action: string, userId?: number): void {
    try {
      const stmt = this.db.raw.prepare(`
        INSERT INTO help_analytics (user_id, page, section, action, session_id)
        VALUES (?, ?, ?, ?, ?)
      `);

      const sessionId = this.generateSessionId();
      stmt.run(userId, page, section, action, sessionId);
    } catch (error) {
      console.error('Failed to log help analytics:', error);
    }
  }

  /**
   * Get help analytics
   */
  async getHelpAnalytics(dateFrom?: string, dateTo?: string): Promise<ApiResponse<any>> {
    try {
      let whereClause = '1=1';
      const params: any[] = [];

      if (dateFrom) {
        whereClause += ' AND DATE(timestamp) >= DATE(?)';
        params.push(dateFrom);
      }

      if (dateTo) {
        whereClause += ' AND DATE(timestamp) <= DATE(?)';
        params.push(dateTo);
      }

      const analytics = {
        topPages: this.db.raw.prepare(`
          SELECT page, COUNT(*) as views 
          FROM help_analytics 
          WHERE ${whereClause} 
          GROUP BY page 
          ORDER BY views DESC 
          LIMIT 10
        `).all(...params),

        topActions: this.db.raw.prepare(`
          SELECT action, COUNT(*) as count 
          FROM help_analytics 
          WHERE ${whereClause} 
          GROUP BY action 
          ORDER BY count DESC
        `).all(...params),

        dailyUsage: this.db.raw.prepare(`
          SELECT DATE(timestamp) as date, COUNT(*) as usage 
          FROM help_analytics 
          WHERE ${whereClause} 
          GROUP BY DATE(timestamp) 
          ORDER BY date DESC 
          LIMIT 30
        `).all(...params)
      };

      return {
        success: true,
        data: analytics
      };

    } catch (error) {
      return {
        success: false,
        message: 'فشل في جلب تحليلات المساعدة',
        messageEn: 'Failed to get help analytics',
        errors: [error instanceof Error ? error.message : String(error)]
      };
    }
  }

  // ==================== HELPER METHODS ====================

  /**
   * Generate session ID
   */
  private generateSessionId(): string {
    return `session_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
  }

  /**
   * Map documentation database row
   */
  private mapDocumentationRow(row: any): DocumentationItem {
    return {
      id: row.id,
      title: row.title,
      titleEn: row.title_en,
      category: row.category,
      type: row.type,
      content: row.content,
      contentEn: row.content_en,
      tags: JSON.parse(row.tags || '[]'),
      difficulty: row.difficulty,
      estimatedReadTime: row.estimated_read_time,
      lastUpdated: row.last_updated,
      version: row.version,
      isActive: Boolean(row.is_active)
    };
  }

  /**
   * Map video tutorial database row
   */
  private mapVideoTutorialRow(row: any): VideoTutorial {
    return {
      id: row.id,
      title: row.title,
      titleEn: row.title_en,
      description: row.description,
      descriptionEn: row.description_en,
      videoUrl: row.video_url,
      thumbnailUrl: row.thumbnail_url,
      duration: row.duration,
      category: row.category,
      tags: JSON.parse(row.tags || '[]'),
      transcript: row.transcript,
      transcriptEn: row.transcript_en,
      difficulty: row.difficulty,
      viewCount: row.view_count,
      rating: row.rating,
      createdAt: row.created_at,
      updatedAt: row.updated_at
    };
  }

  /**
   * Initialize default documentation content
   */
  async initializeDefaultContent(): Promise<void> {
    const defaultDocs = [
      {
        id: 'getting-started',
        title: 'البدء مع نظام طريقة',
        titleEn: 'Getting Started with Tareeqa POS',
        category: 'user-guide' as const,
        type: 'text' as const,
        content: 'دليل البدء السريع لاستخدام نظام نقاط البيع طريقة...',
        contentEn: 'Quick start guide for using Tareeqa POS system...',
        tags: ['getting-started', 'basics', 'introduction'],
        difficulty: 'beginner' as const,
        estimatedReadTime: 5,
        version: '2.0.0',
        isActive: true
      },
      {
        id: 'sales-process',
        title: 'عملية البيع',
        titleEn: 'Sales Process',
        category: 'user-guide' as const,
        type: 'text' as const,
        content: 'شرح مفصل لعملية البيع في نظام طريقة...',
        contentEn: 'Detailed explanation of the sales process in Tareeqa...',
        tags: ['sales', 'pos', 'transaction'],
        difficulty: 'beginner' as const,
        estimatedReadTime: 8,
        version: '2.0.0',
        isActive: true
      }
    ];

    for (const doc of defaultDocs) {
      await this.createDocumentationItem(doc);
    }

    console.log('✅ Default documentation content initialized');
  }
}

export default DocumentationService;
