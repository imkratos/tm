import Database from 'better-sqlite3';
import { config, ensureConfigDir } from '../config';

/**
 * 任务接口定义
 */
export interface Task {
  id?: number;
  title: string;
  description: string;
  priority: number;
  status: string;
  quadrant: number | null;
  created_at?: string;
  updated_at?: string;
}

/**
 * 数据库操作类
 */
export class TaskDatabase {
  private db: Database.Database;

  constructor(dbPath: string = config.dbPath) {
    // 确保配置目录存在
    ensureConfigDir();

    // 初始化数据库
    this.db = new Database(dbPath);
    this.db.pragma('journal_mode = WAL'); // 使用WAL模式提高性能
    this.db.pragma('encoding = "UTF-8"'); // 设置UTF-8编码

    // 初始化表结构
    this.initTables();
  }

  /**
   * 初始化数据表
   */
  private initTables(): void {
    const createTableSQL = `
      CREATE TABLE IF NOT EXISTS tasks (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        title TEXT NOT NULL,
        description TEXT,
        priority INTEGER DEFAULT 5,
        status TEXT DEFAULT 'pending',
        quadrant INTEGER,
        created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
        updated_at DATETIME DEFAULT CURRENT_TIMESTAMP
      )
    `;

    // 创建索引以提高查询性能
    const createIndexSQL = `
      CREATE INDEX IF NOT EXISTS idx_status ON tasks(status);
      CREATE INDEX IF NOT EXISTS idx_priority ON tasks(priority);
      CREATE INDEX IF NOT EXISTS idx_quadrant ON tasks(quadrant);
    `;

    this.db.exec(createTableSQL);
    this.db.exec(createIndexSQL);
  }

  /**
   * 添加新任务
   */
  addTask(title: string, description: string = '', priority: number = 5): Task {
    const stmt = this.db.prepare(`
      INSERT INTO tasks (title, description, priority)
      VALUES (?, ?, ?)
    `);

    const result = stmt.run(title, description, priority);
    return this.getTaskById(result.lastInsertRowid as number)!;
  }

  /**
   * 根据ID获取任务
   */
  getTaskById(id: number): Task | null {
    const stmt = this.db.prepare('SELECT * FROM tasks WHERE id = ?');
    return stmt.get(id) as Task | null;
  }

  /**
   * 获取所有任务
   */
  getAllTasks(status?: string): Task[] {
    let query = 'SELECT * FROM tasks';
    let params: any[] = [];

    if (status) {
      query += ' WHERE status = ?';
      params.push(status);
    }

    query += ' ORDER BY priority ASC, created_at DESC';

    const stmt = this.db.prepare(query);
    return stmt.all(...params) as Task[];
  }

  /**
   * 根据四象限获取任务
   */
  getTasksByQuadrant(quadrant: number): Task[] {
    const stmt = this.db.prepare(`
      SELECT * FROM tasks
      WHERE quadrant = ?
      ORDER BY priority ASC, created_at DESC
    `);

    return stmt.all(quadrant) as Task[];
  }

  /**
   * 更新任务
   */
  updateTask(id: number, updates: Partial<Task>): boolean {
    const allowedFields = ['title', 'description', 'priority', 'status', 'quadrant'];
    const updateFields: string[] = [];
    const values: any[] = [];

    // 构建更新语句
    for (const [key, value] of Object.entries(updates)) {
      if (allowedFields.includes(key)) {
        updateFields.push(`${key} = ?`);
        values.push(value);
      }
    }

    if (updateFields.length === 0) {
      return false;
    }

    // 添加updated_at字段
    updateFields.push('updated_at = CURRENT_TIMESTAMP');
    values.push(id);

    const sql = `UPDATE tasks SET ${updateFields.join(', ')} WHERE id = ?`;
    const stmt = this.db.prepare(sql);
    const result = stmt.run(...values);

    return result.changes > 0;
  }

  /**
   * 标记任务为完成
   */
  completeTask(id: number): boolean {
    return this.updateTask(id, { status: config.taskStatus.COMPLETED });
  }

  /**
   * 删除任务
   */
  deleteTask(id: number): boolean {
    const stmt = this.db.prepare('DELETE FROM tasks WHERE id = ?');
    const result = stmt.run(id);
    return result.changes > 0;
  }

  /**
   * 分配任务到四象限
   */
  assignQuadrant(id: number, quadrant: number): boolean {
    if (quadrant < 1 || quadrant > 4) {
      throw new Error('象限编号必须在1-4之间');
    }
    return this.updateTask(id, { quadrant });
  }

  /**
   * 删除所有已完成的任务
   */
  deleteCompletedTasks(): number {
    const stmt = this.db.prepare(`DELETE FROM tasks WHERE status = ?`);
    const result = stmt.run(config.taskStatus.COMPLETED);
    return result.changes;
  }

  /**
   * 删除所有任务
   */
  deleteAllTasks(): number {
    const stmt = this.db.prepare('DELETE FROM tasks');
    const result = stmt.run();
    return result.changes;
  }

  /**
   * 获取任务统计信息
   */
  getStats(): {
    total: number;
    pending: number;
    completed: number;
    byQuadrant: { [key: number]: number };
  } {
    const totalStmt = this.db.prepare('SELECT COUNT(*) as count FROM tasks');
    const pendingStmt = this.db.prepare('SELECT COUNT(*) as count FROM tasks WHERE status = ?');
    const completedStmt = this.db.prepare('SELECT COUNT(*) as count FROM tasks WHERE status = ?');
    const quadrantStmt = this.db.prepare('SELECT quadrant, COUNT(*) as count FROM tasks WHERE quadrant IS NOT NULL GROUP BY quadrant');

    const total = (totalStmt.get() as any).count;
    const pending = (pendingStmt.get(config.taskStatus.PENDING) as any).count;
    const completed = (completedStmt.get(config.taskStatus.COMPLETED) as any).count;

    const quadrantResults = quadrantStmt.all() as any[];
    const byQuadrant: { [key: number]: number } = {};

    for (const result of quadrantResults) {
      byQuadrant[result.quadrant] = result.count;
    }

    return { total, pending, completed, byQuadrant };
  }

  /**
   * 关闭数据库连接
   */
  close(): void {
    this.db.close();
  }
}

// 导出单例实例
export const taskDb = new TaskDatabase();
