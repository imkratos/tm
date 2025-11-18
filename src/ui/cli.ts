import inquirer from 'inquirer';
import { Task } from '../db/database';
import chalk from 'chalk';

/**
 * CLI交互接口
 */

/**
 * 选择任务
 */
export async function selectTask(tasks: Task[], message: string = '请选择一个任务'): Promise<Task | null> {
  if (tasks.length === 0) {
    return null;
  }

  const choices = tasks.map((task) => ({
    name: formatTaskChoice(task),
    value: task.id
  }));

  const answer = await inquirer.prompt([
    {
      type: 'list',
      name: 'taskId',
      message,
      choices,
      pageSize: 15
    }
  ]);

  return tasks.find(t => t.id === answer.taskId) || null;
}

/**
 * 格式化任务选项
 */
function formatTaskChoice(task: Task): string {
  const checkbox = task.status === 'completed' ? chalk.green('✓') : chalk.yellow('○');
  const title = task.status === 'completed' ? chalk.green(task.title) : task.title;
  const priority = chalk.gray(`[P${task.priority}]`);
  const id = chalk.gray(`#${task.id}`);

  let quadrantInfo = '';
  if (task.quadrant) {
    quadrantInfo = chalk.blue(` [Q${task.quadrant}]`);
  }

  return `${checkbox} ${id} ${title} ${priority}${quadrantInfo}`;
}

/**
 * 确认操作
 */
export async function confirm(message: string, defaultValue: boolean = false): Promise<boolean> {
  const answer = await inquirer.prompt([
    {
      type: 'confirm',
      name: 'confirm',
      message,
      default: defaultValue
    }
  ]);

  return answer.confirm;
}

/**
 * 输入文本
 */
export async function inputText(message: string, defaultValue?: string): Promise<string> {
  const answer = await inquirer.prompt([
    {
      type: 'input',
      name: 'text',
      message,
      default: defaultValue
    }
  ]);

  return answer.text;
}

/**
 * 输入数字
 */
export async function inputNumber(
  message: string,
  defaultValue?: number,
  min?: number,
  max?: number
): Promise<number> {
  const answer = await inquirer.prompt([
    {
      type: 'number',
      name: 'number',
      message,
      default: defaultValue,
      validate: (value: number) => {
        if (min !== undefined && value < min) {
          return `值必须大于等于 ${min}`;
        }
        if (max !== undefined && value > max) {
          return `值必须小于等于 ${max}`;
        }
        return true;
      }
    }
  ]);

  return answer.number;
}

/**
 * 选择操作
 */
export async function selectAction(message: string, choices: Array<{ name: string; value: string }>): Promise<string> {
  const answer = await inquirer.prompt([
    {
      type: 'list',
      name: 'action',
      message,
      choices
    }
  ]);

  return answer.action;
}

/**
 * 选择象限
 */
export async function selectQuadrant(): Promise<number | null> {
  const choices = [
    { name: '象限1: 重要且紧急', value: 1 },
    { name: '象限2: 重要不紧急', value: 2 },
    { name: '象限3: 不重要但紧急', value: 3 },
    { name: '象限4: 不重要不紧急', value: 4 },
    { name: '取消', value: null }
  ];

  const answer = await inquirer.prompt([
    {
      type: 'list',
      name: 'quadrant',
      message: '请选择象限',
      choices
    }
  ]);

  return answer.quadrant;
}
