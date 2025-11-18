import { Command } from 'commander';
import { taskDb } from '../db/database';
import { printSuccess, printError, printWarning } from '../utils/colors';
import inquirer from 'inquirer';

/**
 * 创建cleanup命令
 */
export function createCleanupCommand(): Command {
  const cleanupCmd = new Command('cleanup');
  cleanupCmd.description('清理任务');

  // tm cleanup completed
  cleanupCmd
    .command('completed')
    .description('删除所有已完成的任务')
    .option('-y, --yes', '跳过确认提示')
    .action(async (options: any) => {
      try {
        const completedTasks = taskDb.getAllTasks('completed');

        if (completedTasks.length === 0) {
          printWarning('没有已完成的任务需要清理');
          return;
        }

        let confirmed = options.yes;

        if (!confirmed) {
          const answer = await inquirer.prompt([
            {
              type: 'confirm',
              name: 'confirm',
              message: `确定要删除 ${completedTasks.length} 个已完成的任务吗？`,
              default: false
            }
          ]);

          confirmed = answer.confirm;
        }

        if (confirmed) {
          const count = taskDb.deleteCompletedTasks();
          printSuccess(`已删除 ${count} 个已完成的任务`);
        } else {
          printWarning('操作已取消');
        }
      } catch (error) {
        printError(`清理已完成任务失败: ${(error as Error).message}`);
      }
    });

  // tm cleanup all
  cleanupCmd
    .command('all')
    .description('删除所有任务（危险操作）')
    .option('-y, --yes', '跳过确认提示')
    .action(async (options: any) => {
      try {
        const allTasks = taskDb.getAllTasks();

        if (allTasks.length === 0) {
          printWarning('没有任务需要清理');
          return;
        }

        let confirmed = options.yes;

        if (!confirmed) {
          const answer = await inquirer.prompt([
            {
              type: 'confirm',
              name: 'confirm',
              message: `⚠️  警告：确定要删除所有 ${allTasks.length} 个任务吗？此操作不可恢复！`,
              default: false
            }
          ]);

          confirmed = answer.confirm;
        }

        if (confirmed) {
          // 再次确认
          if (!options.yes) {
            const finalAnswer = await inquirer.prompt([
              {
                type: 'confirm',
                name: 'confirm',
                message: '最后确认：真的要删除所有任务吗？',
                default: false
              }
            ]);

            if (!finalAnswer.confirm) {
              printWarning('操作已取消');
              return;
            }
          }

          const count = taskDb.deleteAllTasks();
          printSuccess(`已删除所有 ${count} 个任务`);
        } else {
          printWarning('操作已取消');
        }
      } catch (error) {
        printError(`清理所有任务失败: ${(error as Error).message}`);
      }
    });

  return cleanupCmd;
}
