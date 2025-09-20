import Database from 'better-sqlite3';
import { app } from 'electron';
import * as path from 'path';
import * as fs from 'fs';
import * as crypto from 'crypto';
import { Kysely, SqliteDialect } from 'kysely';
import { DatabaseSchema } from './schema';
import { runMigrations } from './migrations';

export class DatabaseManager {
  private db: Database.Database | null = null;
  private kysely: Kysely<DatabaseSchema> | null = null;
  private readonly dbPath: string;
  private readonly keyPath: string;
  private encryptionKey: string | null = null;

  constructor() {
    const userDataPath = app.getPath('userData');
    this.dbPath = path.join(userDataPath, 'tareeqa_pos.db');
    this.keyPath = path.join(userDataPath, '.db_key');
  }

  /**
   * Initialize database connection with encryption
   */
  async initialize(): Promise<void> {
    try {
      // Generate or retrieve encryption key
      this.encryptionKey = await this.getOrCreateEncryptionKey();
      
      // Create database connection
      this.db = new Database(this.dbPath);
      
      // Enable SQLCipher encryption
      this.enableEncryption();
      
      // Configure database settings
      this.configurePragmas();
      
      // Create Kysely instance
      this.kysely = new Kysely<DatabaseSchema>({
        dialect: new SqliteDialect({
          database: this.db
        })
      });
      
      // Run migrations
      await runMigrations(this.kysely);
      
      // Verify database integrity
      await this.verifyIntegrity();
      
      console.log('Database initialized successfully');
    } catch (error) {
      console.error('Failed to initialize database:', error);
      throw error;
    }
  }

  /**
   * Get Kysely database instance
   */
  getKysely(): Kysely<DatabaseSchema> {
    if (!this.kysely) {
      throw new Error('Database not initialized');
    }
    return this.kysely;
  }

  /**
   * Get raw SQLite database instance
   */
  getRawDatabase(): Database.Database {
    if (!this.db) {
      throw new Error('Database not initialized');
    }
    return this.db;
  }

  /**
   * Enable SQLCipher encryption
   */
  private enableEncryption(): void {
    if (!this.db || !this.encryptionKey) {
      throw new Error('Database or encryption key not available');
    }

    try {
      // Set encryption key
      this.db.pragma(`key = '${this.encryptionKey}'`);
      
      // Set cipher compatibility (SQLCipher 4.x)
      this.db.pragma('cipher_compatibility = 4');
      
      // Test if encryption is working
      this.db.prepare('SELECT count(*) FROM sqlite_master').get();
      
      console.log('Database encryption enabled');
    } catch (error) {
      console.error('Failed to enable encryption:', error);
      throw new Error('Database encryption failed');
    }
  }

  /**
   * Configure database pragmas for optimal performance and security
   */
  private configurePragmas(): void {
    if (!this.db) return;

    try {
      // Enable WAL mode for better concurrency
      this.db.pragma('journal_mode = WAL');
      
      // Set synchronous mode to FULL for maximum durability
      this.db.pragma('synchronous = FULL');
      
      // Enable foreign key constraints
      this.db.pragma('foreign_keys = ON');
      
      // Set page size to 4KB for optimal performance
      this.db.pragma('page_size = 4096');
      
      // Set cache size to 64MB
      this.db.pragma('cache_size = -16384');
      
      // Enable secure delete to overwrite deleted data
      this.db.pragma('secure_delete = ON');
      
      // Set temp store to memory for better performance
      this.db.pragma('temp_store = MEMORY');
      
      // Set mmap size for memory-mapped I/O (256MB)
      this.db.pragma('mmap_size = 268435456');
      
      console.log('Database pragmas configured');
    } catch (error) {
      console.error('Failed to configure pragmas:', error);
    }
  }

  /**
   * Generate or retrieve encryption key
   */
  private async getOrCreateEncryptionKey(): Promise<string> {
    try {
      // Try to read existing key
      if (fs.existsSync(this.keyPath)) {
        const key = await fs.promises.readFile(this.keyPath, 'utf8');
        if (key.length === 64) { // 32 bytes hex = 64 chars
          return key;
        }
      }
      
      // Generate new key
      const key = crypto.randomBytes(32).toString('hex');
      
      // Save key with restricted permissions
      await fs.promises.writeFile(this.keyPath, key, { 
        mode: 0o600 // Read/write for owner only
      });
      
      console.log('New encryption key generated');
      return key;
    } catch (error) {
      console.error('Failed to handle encryption key:', error);
      throw error;
    }
  }

  /**
   * Verify database integrity
   */
  private async verifyIntegrity(): Promise<void> {
    if (!this.db) return;

    try {
      // Run integrity check
      const result = this.db.prepare('PRAGMA integrity_check').get() as { integrity_check: string };
      
      if (result.integrity_check !== 'ok') {
        throw new Error(`Database integrity check failed: ${result.integrity_check}`);
      }
      
      // Check if we can read from a system table
      this.db.prepare('SELECT count(*) FROM sqlite_master').get();
      
      console.log('Database integrity verified');
    } catch (error) {
      console.error('Database integrity check failed:', error);
      throw error;
    }
  }

  /**
   * Backup database to specified path
   */
  async backup(backupPath: string): Promise<void> {
    if (!this.db) {
      throw new Error('Database not initialized');
    }

    try {
      // Create backup directory if it doesn't exist
      const backupDir = path.dirname(backupPath);
      if (!fs.existsSync(backupDir)) {
        await fs.promises.mkdir(backupDir, { recursive: true });
      }

      // Use SQLite backup API
      await new Promise<void>((resolve, reject) => {
        const backup = this.db!.backup(backupPath);
        
        backup.step(-1); // Backup entire database
        
        const result = backup.finish();
        if (result === 0) {
          resolve();
        } else {
          reject(new Error(`Backup failed with code: ${result}`));
        }
      });
      
      console.log(`Database backed up to: ${backupPath}`);
    } catch (error) {
      console.error('Database backup failed:', error);
      throw error;
    }
  }

  /**
   * Restore database from backup
   */
  async restore(backupPath: string): Promise<void> {
    if (!fs.existsSync(backupPath)) {
      throw new Error('Backup file does not exist');
    }

    try {
      // Close current connection
      await this.close();
      
      // Copy backup file to database path
      await fs.promises.copyFile(backupPath, this.dbPath);
      
      // Reinitialize database
      await this.initialize();
      
      console.log(`Database restored from: ${backupPath}`);
    } catch (error) {
      console.error('Database restore failed:', error);
      throw error;
    }
  }

  /**
   * Optimize database (VACUUM and ANALYZE)
   */
  async optimize(): Promise<void> {
    if (!this.db) {
      throw new Error('Database not initialized');
    }

    try {
      console.log('Starting database optimization...');
      
      // Run VACUUM to rebuild database and reclaim space
      this.db.prepare('VACUUM').run();
      
      // Run ANALYZE to update query planner statistics
      this.db.prepare('ANALYZE').run();
      
      console.log('Database optimization completed');
    } catch (error) {
      console.error('Database optimization failed:', error);
      throw error;
    }
  }

  /**
   * Get database statistics
   */
  async getStatistics(): Promise<{
    fileSize: number;
    pageCount: number;
    pageSize: number;
    freePages: number;
    tableCount: number;
    indexCount: number;
  }> {
    if (!this.db) {
      throw new Error('Database not initialized');
    }

    try {
      const stats = fs.statSync(this.dbPath);
      const pageCount = this.db.prepare('PRAGMA page_count').get() as { page_count: number };
      const pageSize = this.db.prepare('PRAGMA page_size').get() as { page_size: number };
      const freePages = this.db.prepare('PRAGMA freelist_count').get() as { freelist_count: number };
      
      const tableCount = this.db.prepare(
        "SELECT count(*) as count FROM sqlite_master WHERE type='table'"
      ).get() as { count: number };
      
      const indexCount = this.db.prepare(
        "SELECT count(*) as count FROM sqlite_master WHERE type='index'"
      ).get() as { count: number };

      return {
        fileSize: stats.size,
        pageCount: pageCount.page_count,
        pageSize: pageSize.page_size,
        freePages: freePages.freelist_count,
        tableCount: tableCount.count,
        indexCount: indexCount.count
      };
    } catch (error) {
      console.error('Failed to get database statistics:', error);
      throw error;
    }
  }

  /**
   * Execute transaction with automatic rollback on error
   */
  async transaction<T>(callback: (kysely: Kysely<DatabaseSchema>) => Promise<T>): Promise<T> {
    if (!this.kysely) {
      throw new Error('Database not initialized');
    }

    return await this.kysely.transaction().execute(callback);
  }

  /**
   * Close database connection
   */
  async close(): Promise<void> {
    try {
      if (this.kysely) {
        await this.kysely.destroy();
        this.kysely = null;
      }
      
      if (this.db) {
        this.db.close();
        this.db = null;
      }
      
      console.log('Database connection closed');
    } catch (error) {
      console.error('Failed to close database:', error);
      throw error;
    }
  }

  /**
   * Check if database is initialized
   */
  isInitialized(): boolean {
    return this.db !== null && this.kysely !== null;
  }

  /**
   * Get database file path
   */
  getDatabasePath(): string {
    return this.dbPath;
  }

  /**
   * Test database connection
   */
  async testConnection(): Promise<boolean> {
    try {
      if (!this.db) return false;
      
      this.db.prepare('SELECT 1').get();
      return true;
    } catch {
      return false;
    }
  }
}
