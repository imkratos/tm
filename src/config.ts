import path from 'path';
import os from 'os';

/**
 * 应用配置
 */
export const config = {
  // 数据库文件路径，默认存储在用户主目录的.tm文件夹中
  dbPath: path.join(os.homedir(), '.tm', 'tasks.db'),

  // 应用名称
  appName: 'tm',

  // 版本号
  version: '1.0.0',

  // 任务状态
  taskStatus: {
    PENDING: 'pending',
    COMPLETED: 'completed'
  },

  // 四象限定义
  quadrants: {
    1: { name: '重要且紧急', desc: 'Important & Urgent' },
    2: { name: '重要不紧急', desc: 'Important & Not Urgent' },
    3: { name: '不重要但紧急', desc: 'Not Important & Urgent' },
    4: { name: '不重要不紧急', desc: 'Not Important & Not Urgent' }
  }
};

/**
 * 确保配置目录存在
 */
export function ensureConfigDir(): void {
  const fs = require('fs');
  const configDir = path.dirname(config.dbPath);

  if (!fs.existsSync(configDir)) {
    fs.mkdirSync(configDir, { recursive: true });
  }
}
