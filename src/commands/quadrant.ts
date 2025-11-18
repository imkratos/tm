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
import stripAnsi from 'strip-ansi';
import stringWidth from 'string-width';

/**
 * 创建quadrant命令
 */
export function createQuadrantCommand(): Command {
  const quadrantCmd = new Command('quadrant');
  quadrantCmd.description('四象限模型管理');

  // tm quadrant assign <task_id> <quadrant_number>
  quadrantCmd
    .command('assign <task_id> <quadrant>')
    .description('将任务分配到四象限')
    .action((taskId: string, quadrant: string) => {
      try {
        const id = parseInt(taskId, 10);
        const quadrantNum = parseInt(quadrant, 10);

        if (quadrantNum < 1 || quadrantNum > 4) {
          printError('象限编号必须在1-4之间');
          return;
        }

        const task = taskDb.getTaskById(id);

        if (!task) {
          printError(`任务 #${id} 不存在`);
          return;
        }

        const success = taskDb.assignQuadrant(id, quadrantNum);

        if (success) {
          const quadrantInfo = config.quadrants[quadrantNum as keyof typeof config.quadrants];
          const quadrantColor = getQuadrantColor(quadrantNum);
          printSuccess(`任务 #${id} 已分配到 ${quadrantColor(`象限${quadrantNum}: ${quadrantInfo.name}`)}`);
        } else {
          printError('分配任务失败');
        }
      } catch (error) {
        printError(`分配任务失败: ${(error as Error).message}`);
      }
    });

  // tm quadrant list
  quadrantCmd
    .command('list')
    .description('以2×2表格形式展示四象限')
    .action(() => {
      try {
        const stats = taskDb.getStats();

        // 获取终端宽度
        const terminalWidth = process.stdout.columns || 100;
        const cellWidth = Math.floor((terminalWidth - 5) / 2);

        // 定义表格边框字符
        const TOP_LEFT = '┌';
        const TOP_RIGHT = '┐';
        const BOTTOM_LEFT = '└';
        const BOTTOM_RIGHT = '┘';
        const HORIZONTAL = '─';
        const VERTICAL = '│';
        const T_DOWN = '┬';
        const T_UP = '┴';
        const T_RIGHT = '├';
        const T_LEFT = '┤';
        const CROSS = '┼';

        // 辅助函数：填充字符串到指定宽度（处理中文字符和 ANSI 颜色代码）
        const padString = (str: string, width: number): string => {
          // 使用 stringWidth 计算字符串的实际显示宽度（会自动处理 ANSI 代码和中文字符）
          const displayWidth = stringWidth(str);
          const padding = width - displayWidth;
          return str + ' '.repeat(Math.max(0, padding));
        };

        // 辅助函数：包装文本到指定宽度
        const wrapText = (text: string, width: number): string[] => {
          // 先移除 ANSI 代码以正确计算宽度
          const plainText = stripAnsi(text);
          const lines: string[] = [];
          let currentLine = '';
          let currentWidth = 0;

          for (const char of plainText) {
            const charWidth = char.charCodeAt(0) > 255 ? 2 : 1;

            if (currentWidth + charWidth > width) {
              lines.push(currentLine);
              currentLine = char;
              currentWidth = charWidth;
            } else {
              currentLine += char;
              currentWidth += charWidth;
            }
          }

          if (currentLine) {
            lines.push(currentLine);
          }

          return lines.length > 0 ? lines : [''];
        };

        // 获取每个象限的任务数量
        const getQuadrantData = (quadrantNum: number) => {
          const quadrantInfo = config.quadrants[quadrantNum as keyof typeof config.quadrants];
          const count = stats.byQuadrant[quadrantNum] || 0;
          const tasks = taskDb.getTasksByQuadrant(quadrantNum);
          return { info: quadrantInfo, count, tasks };
        };

        const q1 = getQuadrantData(1);
        const q2 = getQuadrantData(2);
        const q3 = getQuadrantData(3);
        const q4 = getQuadrantData(4);

        console.log('\n' + chalk.bold.cyan('时间管理四象限模型') + '\n');

        // 绘制表格顶部
        console.log(TOP_LEFT + HORIZONTAL.repeat(cellWidth) + T_DOWN + HORIZONTAL.repeat(cellWidth) + TOP_RIGHT);

        // 第一行：象限1和象限2的标题
        const q1Title = `[象限1] ${q1.info.name} (${q1.count})`;
        const q2Title = `[象限2] ${q2.info.name} (${q2.count})`;
        console.log(VERTICAL + ' ' + getQuadrantColor(1).bold(padString(q1Title, cellWidth - 1)) + VERTICAL + ' ' + getQuadrantColor(2).bold(padString(q2Title, cellWidth - 1)) + VERTICAL);

        // 象限1和象限2的描述
        const q1Desc = q1.info.desc;
        const q2Desc = q2.info.desc;
        console.log(VERTICAL + ' ' + chalk.gray(padString(q1Desc, cellWidth - 1)) + VERTICAL + ' ' + chalk.gray(padString(q2Desc, cellWidth - 1)) + VERTICAL);

        // 显示部分任务
        const maxTasksToShow = 3;
        const maxTaskLines = 5;
        let currentLine = 0;

        while (currentLine < maxTaskLines) {
          let q1Text = '';
          let q2Text = '';

          if (currentLine < q1.tasks.length && currentLine < maxTasksToShow) {
            const task = q1.tasks[currentLine];
            q1Text = `• ${task.title}`;
          }

          if (currentLine < q2.tasks.length && currentLine < maxTasksToShow) {
            const task = q2.tasks[currentLine];
            q2Text = `• ${task.title}`;
          }

          if (!q1Text && !q2Text) break;

          const q1Lines = wrapText(q1Text, cellWidth - 3);
          const q2Lines = wrapText(q2Text, cellWidth - 3);

          const maxLines = Math.max(q1Lines.length, q2Lines.length);

          for (let i = 0; i < maxLines; i++) {
            const left = q1Lines[i] || '';
            const right = q2Lines[i] || '';
            console.log(VERTICAL + ' ' + padString(left, cellWidth - 1) + VERTICAL + ' ' + padString(right, cellWidth - 1) + VERTICAL);
          }

          currentLine++;
        }

        // 填充空行使两个象限高度一致
        const q1Height = maxTaskLines;
        const q2Height = maxTaskLines;
        const topHeight = Math.max(q1Height, q2Height);

        for (let i = currentLine; i < topHeight; i++) {
          console.log(VERTICAL + ' ' + padString('', cellWidth - 1) + VERTICAL + ' ' + padString('', cellWidth - 1) + VERTICAL);
        }

        // 绘制中间分隔线
        console.log(T_RIGHT + HORIZONTAL.repeat(cellWidth) + CROSS + HORIZONTAL.repeat(cellWidth) + T_LEFT);

        // 第二行：象限3和象限4的标题
        const q3Title = `[象限3] ${q3.info.name} (${q3.count})`;
        const q4Title = `[象限4] ${q4.info.name} (${q4.count})`;
        console.log(VERTICAL + ' ' + getQuadrantColor(3).bold(padString(q3Title, cellWidth - 1)) + VERTICAL + ' ' + getQuadrantColor(4).bold(padString(q4Title, cellWidth - 1)) + VERTICAL);

        // 象限3和象限4的描述
        const q3Desc = q3.info.desc;
        const q4Desc = q4.info.desc;
        console.log(VERTICAL + ' ' + chalk.gray(padString(q3Desc, cellWidth - 1)) + VERTICAL + ' ' + chalk.gray(padString(q4Desc, cellWidth - 1)) + VERTICAL);

        // 显示部分任务
        currentLine = 0;

        while (currentLine < maxTaskLines) {
          let q3Text = '';
          let q4Text = '';

          if (currentLine < q3.tasks.length && currentLine < maxTasksToShow) {
            const task = q3.tasks[currentLine];
            q3Text = `• ${task.title}`;
          }

          if (currentLine < q4.tasks.length && currentLine < maxTasksToShow) {
            const task = q4.tasks[currentLine];
            q4Text = `• ${task.title}`;
          }

          if (!q3Text && !q4Text) break;

          const q3Lines = wrapText(q3Text, cellWidth - 3);
          const q4Lines = wrapText(q4Text, cellWidth - 3);

          const maxLines = Math.max(q3Lines.length, q4Lines.length);

          for (let i = 0; i < maxLines; i++) {
            const left = q3Lines[i] || '';
            const right = q4Lines[i] || '';
            console.log(VERTICAL + ' ' + padString(left, cellWidth - 1) + VERTICAL + ' ' + padString(right, cellWidth - 1) + VERTICAL);
          }

          currentLine++;
        }

        // 填充空行
        for (let i = currentLine; i < topHeight; i++) {
          console.log(VERTICAL + ' ' + padString('', cellWidth - 1) + VERTICAL + ' ' + padString('', cellWidth - 1) + VERTICAL);
        }

        // 绘制表格底部
        console.log(BOTTOM_LEFT + HORIZONTAL.repeat(cellWidth) + T_UP + HORIZONTAL.repeat(cellWidth) + BOTTOM_RIGHT);

        console.log('');
      } catch (error) {
        printError(`显示四象限表格失败: ${(error as Error).message}`);
      }
    });

  // tm quadrant remove <task_id>
  quadrantCmd
    .command('remove <task_id>')
    .description('移除任务的象限分配')
    .action((taskId: string) => {
      try {
        const id = parseInt(taskId, 10);
        const task = taskDb.getTaskById(id);

        if (!task) {
          printError(`任务 #${id} 不存在`);
          return;
        }

        if (!task.quadrant) {
          printInfo(`任务 #${id} 未分配象限`);
          return;
        }

        const success = taskDb.updateTask(id, { quadrant: null });

        if (success) {
          printSuccess(`任务 #${id} 的象限分配已移除`);
        } else {
          printError('移除象限分配失败');
        }
      } catch (error) {
        printError(`移除象限分配失败: ${(error as Error).message}`);
      }
    });

  // tm quadrant info
  quadrantCmd
    .command('info')
    .description('显示四象限模型说明')
    .action(() => {
      console.log(chalk.bold('\n时间管理四象限模型:\n'));

      for (let i = 1; i <= 4; i++) {
        const quadrantInfo = config.quadrants[i as keyof typeof config.quadrants];
        const quadrantColor = getQuadrantColor(i);

        console.log(quadrantColor.bold(`象限${i}: ${quadrantInfo.name} (${quadrantInfo.desc})`));

        // 添加每个象限的详细说明
        let description = '';
        switch (i) {
          case 1:
            description = '  - 重要且紧急的任务，需要立即处理\n  - 例如：危机、紧急问题、截止日期临近的项目';
            break;
          case 2:
            description = '  - 重要但不紧急的任务，应该优先安排\n  - 例如：长期规划、能力提升、预防性工作';
            break;
          case 3:
            description = '  - 不重要但紧急的任务，可以委托他人\n  - 例如：一些打断、部分会议、琐碎事务';
            break;
          case 4:
            description = '  - 不重要且不紧急的任务，应该减少或消除\n  - 例如：浪费时间的活动、无意义的娱乐';
            break;
        }

        console.log(chalk.gray(description));
        console.log('');
      }
    });

  return quadrantCmd;
}
