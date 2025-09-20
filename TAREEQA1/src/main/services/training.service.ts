// Training Service - Interactive training platform for Tareeqa POS
// Handles role-based training modules, assessments, certifications, and progress tracking

import { EnhancedDatabaseManager } from '../database/EnhancedDatabaseManager';
import { ApiResponse } from '../../shared/types/enhanced';

export interface TrainingModule {
  id: string;
  title: string;
  titleEn: string;
  description: string;
  descriptionEn: string;
  category: 'basic' | 'advanced' | 'admin' | 'specialized';
  targetRoles: string[];
  difficulty: 'beginner' | 'intermediate' | 'advanced';
  estimatedDuration: number; // minutes
  prerequisites: string[];
  lessons: TrainingLesson[];
  assessment: Assessment;
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface TrainingLesson {
  id: string;
  title: string;
  titleEn: string;
  content: string;
  contentEn: string;
  type: 'text' | 'video' | 'interactive' | 'quiz';
  duration: number;
  resources: LessonResource[];
  objectives: string[];
}

export interface LessonResource {
  type: 'document' | 'video' | 'image' | 'link';
  url: string;
  title: string;
  description?: string;
}

export interface Assessment {
  id: string;
  title: string;
  titleEn: string;
  questions: AssessmentQuestion[];
  passingScore: number;
  timeLimit?: number; // minutes
  maxAttempts: number;
  certificateTemplate?: string;
}

export interface AssessmentQuestion {
  id: string;
  question: string;
  questionEn: string;
  type: 'multiple-choice' | 'true-false' | 'fill-blank' | 'practical';
  options?: string[];
  optionsEn?: string[];
  correctAnswer: string | string[];
  explanation: string;
  explanationEn: string;
  points: number;
}

export interface UserProgress {
  userId: number;
  moduleId: string;
  status: 'not-started' | 'in-progress' | 'completed' | 'certified';
  currentLesson: number;
  completedLessons: string[];
  assessmentAttempts: AssessmentAttempt[];
  totalTimeSpent: number; // minutes
  startedAt?: string;
  completedAt?: string;
  certificateId?: string;
}

export interface AssessmentAttempt {
  id: string;
  assessmentId: string;
  userId: number;
  answers: Record<string, any>;
  score: number;
  passed: boolean;
  timeSpent: number;
  attemptedAt: string;
  completedAt: string;
}

export interface Certificate {
  id: string;
  userId: number;
  moduleId: string;
  score: number;
  issuedAt: string;
  expiresAt?: string;
  verificationCode: string;
  isValid: boolean;
}

export class TrainingService {
  private db: EnhancedDatabaseManager;

  constructor(db: EnhancedDatabaseManager) {
    this.db = db;
    this.initializeTrainingTables();
  }

  /**
   * Initialize training tables
   */
  private initializeTrainingTables(): void {
    // Training modules table
    this.db.raw.exec(`
      CREATE TABLE IF NOT EXISTS training_modules (
        id TEXT PRIMARY KEY,
        title TEXT NOT NULL,
        title_en TEXT NOT NULL,
        description TEXT NOT NULL,
        description_en TEXT NOT NULL,
        category TEXT NOT NULL,
        target_roles TEXT NOT NULL,
        difficulty TEXT NOT NULL,
        estimated_duration INTEGER NOT NULL,
        prerequisites TEXT NOT NULL,
        lessons TEXT NOT NULL,
        assessment TEXT NOT NULL,
        is_active BOOLEAN DEFAULT 1,
        created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
        updated_at DATETIME DEFAULT CURRENT_TIMESTAMP
      )
    `);

    // User progress table
    this.db.raw.exec(`
      CREATE TABLE IF NOT EXISTS user_progress (
        user_id INTEGER NOT NULL,
        module_id TEXT NOT NULL,
        status TEXT NOT NULL DEFAULT 'not-started',
        current_lesson INTEGER DEFAULT 0,
        completed_lessons TEXT NOT NULL DEFAULT '[]',
        assessment_attempts TEXT NOT NULL DEFAULT '[]',
        total_time_spent INTEGER DEFAULT 0,
        started_at DATETIME,
        completed_at DATETIME,
        certificate_id TEXT,
        PRIMARY KEY (user_id, module_id)
      )
    `);

    // Assessment attempts table
    this.db.raw.exec(`
      CREATE TABLE IF NOT EXISTS assessment_attempts (
        id TEXT PRIMARY KEY,
        assessment_id TEXT NOT NULL,
        user_id INTEGER NOT NULL,
        answers TEXT NOT NULL,
        score REAL NOT NULL,
        passed BOOLEAN NOT NULL,
        time_spent INTEGER NOT NULL,
        attempted_at DATETIME DEFAULT CURRENT_TIMESTAMP,
        completed_at DATETIME
      )
    `);

    // Certificates table
    this.db.raw.exec(`
      CREATE TABLE IF NOT EXISTS certificates (
        id TEXT PRIMARY KEY,
        user_id INTEGER NOT NULL,
        module_id TEXT NOT NULL,
        score REAL NOT NULL,
        issued_at DATETIME DEFAULT CURRENT_TIMESTAMP,
        expires_at DATETIME,
        verification_code TEXT UNIQUE NOT NULL,
        is_valid BOOLEAN DEFAULT 1
      )
    `);

    console.log('✅ Training tables initialized');
  }

  // ==================== MODULE MANAGEMENT ====================

  /**
   * Create training module
   */
  async createTrainingModule(module: Omit<TrainingModule, 'createdAt' | 'updatedAt'>): Promise<ApiResponse<TrainingModule>> {
    try {
      const stmt = this.db.raw.prepare(`
        INSERT INTO training_modules (
          id, title, title_en, description, description_en, category,
          target_roles, difficulty, estimated_duration, prerequisites,
          lessons, assessment, is_active
        ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
      `);

      stmt.run(
        module.id,
        module.title,
        module.titleEn,
        module.description,
        module.descriptionEn,
        module.category,
        JSON.stringify(module.targetRoles),
        module.difficulty,
        module.estimatedDuration,
        JSON.stringify(module.prerequisites),
        JSON.stringify(module.lessons),
        JSON.stringify(module.assessment),
        module.isActive ? 1 : 0
      );

      const createdModule = {
        ...module,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString()
      };

      return {
        success: true,
        data: createdModule,
        message: 'تم إنشاء وحدة التدريب بنجاح',
        messageEn: 'Training module created successfully'
      };

    } catch (error) {
      return {
        success: false,
        message: 'فشل في إنشاء وحدة التدريب',
        messageEn: 'Failed to create training module',
        errors: [error instanceof Error ? error.message : String(error)]
      };
    }
  }

  /**
   * Get training modules for user role
   */
  async getTrainingModulesForRole(userRole: string): Promise<ApiResponse<TrainingModule[]>> {
    try {
      const stmt = this.db.raw.prepare(`
        SELECT * FROM training_modules 
        WHERE is_active = 1 AND (target_roles LIKE ? OR target_roles LIKE ?)
        ORDER BY difficulty, estimated_duration
      `);

      const rows = stmt.all(`%"${userRole}"%`, '%"all"%') as any[];
      const modules = rows.map(row => this.mapTrainingModuleRow(row));

      return {
        success: true,
        data: modules
      };

    } catch (error) {
      return {
        success: false,
        message: 'فشل في جلب وحدات التدريب',
        messageEn: 'Failed to get training modules',
        errors: [error instanceof Error ? error.message : String(error)]
      };
    }
  }

  // ==================== PROGRESS TRACKING ====================

  /**
   * Start training module
   */
  async startTrainingModule(userId: number, moduleId: string): Promise<ApiResponse<UserProgress>> {
    try {
      const progress: UserProgress = {
        userId,
        moduleId,
        status: 'in-progress',
        currentLesson: 0,
        completedLessons: [],
        assessmentAttempts: [],
        totalTimeSpent: 0,
        startedAt: new Date().toISOString()
      };

      const stmt = this.db.raw.prepare(`
        INSERT OR REPLACE INTO user_progress (
          user_id, module_id, status, current_lesson, completed_lessons,
          assessment_attempts, total_time_spent, started_at
        ) VALUES (?, ?, ?, ?, ?, ?, ?, ?)
      `);

      stmt.run(
        progress.userId,
        progress.moduleId,
        progress.status,
        progress.currentLesson,
        JSON.stringify(progress.completedLessons),
        JSON.stringify(progress.assessmentAttempts),
        progress.totalTimeSpent,
        progress.startedAt
      );

      return {
        success: true,
        data: progress,
        message: 'تم بدء وحدة التدريب بنجاح',
        messageEn: 'Training module started successfully'
      };

    } catch (error) {
      return {
        success: false,
        message: 'فشل في بدء وحدة التدريب',
        messageEn: 'Failed to start training module',
        errors: [error instanceof Error ? error.message : String(error)]
      };
    }
  }

  /**
   * Complete lesson
   */
  async completeLesson(userId: number, moduleId: string, lessonId: string, timeSpent: number): Promise<ApiResponse<void>> {
    try {
      // Get current progress
      const currentProgress = this.db.raw.prepare(`
        SELECT * FROM user_progress WHERE user_id = ? AND module_id = ?
      `).get(userId, moduleId) as any;

      if (!currentProgress) {
        return {
          success: false,
          message: 'لم يتم العثور على تقدم التدريب',
          messageEn: 'Training progress not found'
        };
      }

      const completedLessons = JSON.parse(currentProgress.completed_lessons || '[]');
      if (!completedLessons.includes(lessonId)) {
        completedLessons.push(lessonId);
      }

      const stmt = this.db.raw.prepare(`
        UPDATE user_progress 
        SET completed_lessons = ?, total_time_spent = total_time_spent + ?, current_lesson = current_lesson + 1
        WHERE user_id = ? AND module_id = ?
      `);

      stmt.run(
        JSON.stringify(completedLessons),
        timeSpent,
        userId,
        moduleId
      );

      return {
        success: true,
        message: 'تم إكمال الدرس بنجاح',
        messageEn: 'Lesson completed successfully'
      };

    } catch (error) {
      return {
        success: false,
        message: 'فشل في إكمال الدرس',
        messageEn: 'Failed to complete lesson',
        errors: [error instanceof Error ? error.message : String(error)]
      };
    }
  }

  // ==================== ASSESSMENTS ====================

  /**
   * Submit assessment
   */
  async submitAssessment(userId: number, assessmentId: string, answers: Record<string, any>, timeSpent: number): Promise<ApiResponse<AssessmentAttempt>> {
    try {
      const attemptId = this.generateAttemptId();
      
      // Get assessment details to calculate score
      const assessment = await this.getAssessmentById(assessmentId);
      if (!assessment) {
        return {
          success: false,
          message: 'التقييم غير موجود',
          messageEn: 'Assessment not found'
        };
      }

      const { score, passed } = this.calculateScore(assessment, answers);

      const attempt: AssessmentAttempt = {
        id: attemptId,
        assessmentId,
        userId,
        answers,
        score,
        passed,
        timeSpent,
        attemptedAt: new Date().toISOString(),
        completedAt: new Date().toISOString()
      };

      // Store attempt
      const stmt = this.db.raw.prepare(`
        INSERT INTO assessment_attempts (
          id, assessment_id, user_id, answers, score, passed, time_spent, completed_at
        ) VALUES (?, ?, ?, ?, ?, ?, ?, ?)
      `);

      stmt.run(
        attempt.id,
        attempt.assessmentId,
        attempt.userId,
        JSON.stringify(attempt.answers),
        attempt.score,
        attempt.passed ? 1 : 0,
        attempt.timeSpent,
        attempt.completedAt
      );

      // Update user progress
      await this.updateProgressWithAttempt(userId, assessmentId, attempt);

      // Generate certificate if passed
      if (passed) {
        await this.generateCertificate(userId, assessmentId, score);
      }

      return {
        success: true,
        data: attempt,
        message: passed ? 'تهانينا! لقد نجحت في التقييم' : 'لم تحقق النتيجة المطلوبة، يمكنك المحاولة مرة أخرى',
        messageEn: passed ? 'Congratulations! You passed the assessment' : 'You did not achieve the required score, you can try again'
      };

    } catch (error) {
      return {
        success: false,
        message: 'فشل في تقديم التقييم',
        messageEn: 'Failed to submit assessment',
        errors: [error instanceof Error ? error.message : String(error)]
      };
    }
  }

  /**
   * Calculate assessment score
   */
  private calculateScore(assessment: Assessment, answers: Record<string, any>): { score: number; passed: boolean } {
    let totalPoints = 0;
    let earnedPoints = 0;

    for (const question of assessment.questions) {
      totalPoints += question.points;
      
      const userAnswer = answers[question.id];
      if (this.isAnswerCorrect(question, userAnswer)) {
        earnedPoints += question.points;
      }
    }

    const score = totalPoints > 0 ? (earnedPoints / totalPoints) * 100 : 0;
    const passed = score >= assessment.passingScore;

    return { score, passed };
  }

  /**
   * Check if answer is correct
   */
  private isAnswerCorrect(question: AssessmentQuestion, userAnswer: any): boolean {
    if (!userAnswer) return false;

    switch (question.type) {
      case 'multiple-choice':
      case 'true-false':
        return userAnswer === question.correctAnswer;
      
      case 'fill-blank':
        if (Array.isArray(question.correctAnswer)) {
          return question.correctAnswer.some(correct => 
            userAnswer.toLowerCase().trim() === correct.toLowerCase().trim()
          );
        }
        return userAnswer.toLowerCase().trim() === (question.correctAnswer as string).toLowerCase().trim();
      
      default:
        return false;
    }
  }

  // ==================== CERTIFICATES ====================

  /**
   * Generate certificate
   */
  async generateCertificate(userId: number, moduleId: string, score: number): Promise<ApiResponse<Certificate>> {
    try {
      const certificateId = this.generateCertificateId();
      const verificationCode = this.generateVerificationCode();

      const certificate: Certificate = {
        id: certificateId,
        userId,
        moduleId,
        score,
        issuedAt: new Date().toISOString(),
        expiresAt: new Date(Date.now() + 365 * 24 * 60 * 60 * 1000).toISOString(), // 1 year
        verificationCode,
        isValid: true
      };

      const stmt = this.db.raw.prepare(`
        INSERT INTO certificates (
          id, user_id, module_id, score, expires_at, verification_code, is_valid
        ) VALUES (?, ?, ?, ?, ?, ?, ?)
      `);

      stmt.run(
        certificate.id,
        certificate.userId,
        certificate.moduleId,
        certificate.score,
        certificate.expiresAt,
        certificate.verificationCode,
        certificate.isValid ? 1 : 0
      );

      // Update user progress
      this.db.raw.prepare(`
        UPDATE user_progress 
        SET status = 'certified', certificate_id = ?, completed_at = CURRENT_TIMESTAMP
        WHERE user_id = ? AND module_id = ?
      `).run(certificate.id, userId, moduleId);

      return {
        success: true,
        data: certificate,
        message: 'تم إصدار الشهادة بنجاح',
        messageEn: 'Certificate generated successfully'
      };

    } catch (error) {
      return {
        success: false,
        message: 'فشل في إصدار الشهادة',
        messageEn: 'Failed to generate certificate',
        errors: [error instanceof Error ? error.message : String(error)]
      };
    }
  }

  // ==================== HELPER METHODS ====================

  private generateAttemptId(): string {
    return `ATT-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
  }

  private generateCertificateId(): string {
    return `CERT-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
  }

  private generateVerificationCode(): string {
    return Math.random().toString(36).substr(2, 12).toUpperCase();
  }

  private mapTrainingModuleRow(row: any): TrainingModule {
    return {
      id: row.id,
      title: row.title,
      titleEn: row.title_en,
      description: row.description,
      descriptionEn: row.description_en,
      category: row.category,
      targetRoles: JSON.parse(row.target_roles || '[]'),
      difficulty: row.difficulty,
      estimatedDuration: row.estimated_duration,
      prerequisites: JSON.parse(row.prerequisites || '[]'),
      lessons: JSON.parse(row.lessons || '[]'),
      assessment: JSON.parse(row.assessment || '{}'),
      isActive: Boolean(row.is_active),
      createdAt: row.created_at,
      updatedAt: row.updated_at
    };
  }

  private async getAssessmentById(assessmentId: string): Promise<Assessment | null> {
    try {
      const stmt = this.db.raw.prepare(`
        SELECT assessment FROM training_modules WHERE JSON_EXTRACT(assessment, '$.id') = ?
      `);
      
      const result = stmt.get(assessmentId) as any;
      return result ? JSON.parse(result.assessment) : null;
    } catch (error) {
      return null;
    }
  }

  private async updateProgressWithAttempt(userId: number, moduleId: string, attempt: AssessmentAttempt): Promise<void> {
    try {
      const currentProgress = this.db.raw.prepare(`
        SELECT assessment_attempts FROM user_progress WHERE user_id = ? AND module_id = ?
      `).get(userId, moduleId) as any;

      if (currentProgress) {
        const attempts = JSON.parse(currentProgress.assessment_attempts || '[]');
        attempts.push(attempt);

        this.db.raw.prepare(`
          UPDATE user_progress 
          SET assessment_attempts = ?
          WHERE user_id = ? AND module_id = ?
        `).run(JSON.stringify(attempts), userId, moduleId);
      }
    } catch (error) {
      console.error('Failed to update progress with attempt:', error);
    }
  }
}

export default TrainingService;
