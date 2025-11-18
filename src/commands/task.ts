import { Command } from 'commander';
import { taskDb } from '../db/database';
import {
  printSuccess,
  printError,
  printInfo,
  formatTaskTitle,
  getQuadrantColor
} from '../utils/colors';
import { config } from '../config';
import chalk from 'chalk';

/**
 * 创建task命令
 */
export function createTaskCommand(): Command {
  const taskCmd = new Command('task');
  taskCmd.description('任务管理命令');

  // tm task add <title> [description]
  taskCmd
    .command('add <title> [description]')
    .description('添加新任务')
    .option('-p, --priority <number>', '设置优先级 (1-10)', '5')
    .action((title: string, description: string = '', options: any) => {
      try {
        const priority = parseInt(options.priority, 10);

        if (priority < 1 || priority > 10) {
          printError('优先级必须在1-10之间');
          return;
        }

        const task = taskDb.addTask(title, description, priority);
        printSuccess(`任务已添加: ${formatTaskTitle(task.id!, task.title, task.status, task.priority)}`);
      } catch (error) {
        printError(`添加任务失败: ${(error as Error).message}`);
      }
    });

  // tm task list
  taskCmd
    .command('list')
    .description('列出所有任务')
    .option('-s, --status <status>', '按状态过滤 (pending/completed)')
    .option('-a, --all', '显示所有任务（包括已完成）')
    .action((options: any) => {
      try {
        let status: string | undefined;

        if (options.status) {
          status = options.status;
        } else if (!options.all) {
          status = config.taskStatus.PENDING;
        }

        const tasks = taskDb.getAllTasks(status);

        if (tasks.length === 0) {
          printInfo('暂无任务');
          return;
        }

        console.log(chalk.bold('\n任务列表:\n'));

        tasks.forEach((task) => {
          const formattedTask = formatTaskTitle(task.id!, task.title, task.status, task.priority);
          console.log(formattedTask);

          if (task.description) {
            console.log(chalk.gray(`  ${task.description}`));
          }

          if (task.quadrant) {
            const quadrantInfo = config.quadrants[task.quadrant as keyof typeof config.quadrants];
            const quadrantColor = getQuadrantColor(task.quadrant);
            console.log(quadrantColor(`  象限${task.quadrant}: ${quadrantInfo.name}`));
          }

          console.log('');
        });

        // 显示统计信息
        const stats = taskDb.getStats();
        console.log(chalk.gray('─'.repeat(50)));
        console.log(chalk.bold(`总计: ${stats.total} | 待办: ${stats.pending} | 已完成: ${stats.completed}`));
      } catch (error) {
        printError(`获取任务列表失败: ${(error as Error).message}`);
      }
    });

  // tm task update <id>
  taskCmd
    .command('update <id>')
    .description('更新任务')
    .option('-t, --title <title>', '更新标题')
    .option('-d, --description <description>', '更新描述')
    .option('-p, --priority <number>', '更新优先级')
    .action((id: string, options: any) => {
      try {
        const taskId = parseInt(id, 10);
        const task = taskDb.getTaskById(taskId);

        if (!task) {
          printError(`任务 #${taskId} 不存在`);
          return;
        }

        const updates: any = {};

        if (options.title) {
          updates.title = options.title;
        }

        if (options.description !== undefined) {
          updates.description = options.description;
        }

        if (options.priority) {
          const priority = parseInt(options.priority, 10);
          if (priority < 1 || priority > 10) {
            printError('优先级必须在1-10之间');
            return;
          }
          updates.priority = priority;
        }

        if (Object.keys(updates).length === 0) {
          printError('请至少指定一个要更新的字段');
          return;
        }

        const success = taskDb.updateTask(taskId, updates);

        if (success) {
          const updatedTask = taskDb.getTaskById(taskId)!;
          printSuccess(`任务已更新: ${formatTaskTitle(updatedTask.id!, updatedTask.title, updatedTask.status, updatedTask.priority)}`);
        } else {
          printError('更新任务失败');
        }
      } catch (error) {
        printError(`更新任务失败: ${(error as Error).message}`);
      }
    });

  // tm task complete <id>
  taskCmd
    .command('complete <id>')
    .description('标记任务为完成')
    .action((id: string) => {
      try {
        const taskId = parseInt(id, 10);
        const task = taskDb.getTaskById(taskId);

        if (!task) {
          printError(`任务 #${taskId} 不存在`);
          return;
        }

        if (task.status === config.taskStatus.COMPLETED) {
          printInfo('任务已经是完成状态');
          return;
        }

        const success = taskDb.completeTask(taskId);

        if (success) {
          printSuccess(`任务 #${taskId} 已标记为完成`);
        } else {
          printError('标记任务失败');
        }
      } catch (error) {
        printError(`标记任务失败: ${(error as Error).message}`);
      }
    });

  // tm task delete <id>
  taskCmd
    .command('delete <id>')
    .description('删除任务')
    .action((id: string) => {
      try {
        const taskId = parseInt(id, 10);
        const task = taskDb.getTaskById(taskId);

        if (!task) {
          printError(`任务 #${taskId} 不存在`);
          return;
        }

        const success = taskDb.deleteTask(taskId);

        if (success) {
          printSuccess(`任务 #${taskId} 已删除`);
        } else {
          printError('删除任务失败');
        }
      } catch (error) {
        printError(`删除任务失败: ${(error as Error).message}`);
      }
    });

  return taskCmd;
}
