import chalk from 'chalk';
import { formatTaskTitle, getPriorityColor, getStatusColor } from '../src/utils/colors';

describe('颜色工具函数', () => {
  it('优先级颜色映射正确', () => {
    expect(getPriorityColor(1)).toBe(chalk.red);
    expect(getPriorityColor(4)).toBe(chalk.yellow);
    expect(getPriorityColor(8)).toBe(chalk.gray);
  });

  it('任务状态颜色支持默认值', () => {
    expect(getStatusColor('completed')).toBe(chalk.green);
    expect(getStatusColor('unknown')).toBe(chalk.white);
  });

  it('格式化任务标题包含必要信息', () => {
    const output = formatTaskTitle(1, '测试任务', 'pending', 5);
    expect(output).toContain('#1');
    expect(output).toContain('测试任务');
    expect(output).toContain('[P5]');
  });
});
