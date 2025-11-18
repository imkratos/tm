import chalk from 'chalk';

/**
 * 颜色配置和工具函数
 */

// 状态颜色
export const statusColors = {
  completed: chalk.green,
  pending: chalk.yellow,
  error: chalk.red,
  info: chalk.blue,
  success: chalk.green,
  warning: chalk.yellow
};

// 优先级颜色
export const priorityColors = {
  high: chalk.red,      // 高优先级 (1-3)
  medium: chalk.yellow, // 中优先级 (4-6)
  low: chalk.gray       // 低优先级 (7+)
};

// 四象限颜色
export const quadrantColors = {
  1: chalk.red.bold,      // 重要且紧急
  2: chalk.blue.bold,     // 重要不紧急
  3: chalk.yellow.bold,   // 不重要但紧急
  4: chalk.gray.bold      // 不重要不紧急
};

/**
 * 根据优先级获取颜色函数
 */
export function getPriorityColor(priority: number): chalk.Chalk {
  if (priority <= 3) return priorityColors.high;
  if (priority <= 6) return priorityColors.medium;
  return priorityColors.low;
}

/**
 * 根据任务状态获取颜色函数
 */
export function getStatusColor(status: string): chalk.Chalk {
  return statusColors[status as keyof typeof statusColors] || chalk.white;
}

/**
 * 根据四象限获取颜色函数
 */
export function getQuadrantColor(quadrant: number): chalk.Chalk {
  return quadrantColors[quadrant as keyof typeof quadrantColors] || chalk.white;
}

/**
 * 格式化任务标题
 */
export function formatTaskTitle(id: number, title: string, status: string, priority: number): string {
  const statusColor = getStatusColor(status);
  const priorityColor = getPriorityColor(priority);

  const checkbox = status === 'completed' ? '✓' : '○';
  const formattedId = chalk.gray(`#${id}`);
  const formattedTitle = statusColor(title);
  const formattedPriority = priorityColor(`[P${priority}]`);

  return `${statusColor(checkbox)} ${formattedId} ${formattedTitle} ${formattedPriority}`;
}

/**
 * 打印成功消息
 */
export function printSuccess(message: string): void {
  console.log(statusColors.success(`✓ ${message}`));
}

/**
 * 打印错误消息
 */
export function printError(message: string): void {
  console.log(statusColors.error(`✗ ${message}`));
}

/**
 * 打印信息消息
 */
export function printInfo(message: string): void {
  console.log(statusColors.info(`ℹ ${message}`));
}

/**
 * 打印警告消息
 */
export function printWarning(message: string): void {
  console.log(statusColors.warning(`⚠ ${message}`));
}
