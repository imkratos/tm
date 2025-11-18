#!/usr/bin/env node

import { Command } from 'commander';
import { config } from './config';
import { createTaskCommand } from './commands/task';
import { createQuadrantCommand } from './commands/quadrant';
import { createCleanupCommand } from './commands/cleanup';
import { startInteractiveMode } from './ui/interactive';
import chalk from 'chalk';

/**
 * 主程序入口
 */
const program = new Command();

// 配置程序信息
program
  .name(config.appName)
  .description('一个基于CLI的任务管理工具，支持四象限模型和Vim风格交互')
  .version(config.version);

// 添加各个命令
program.addCommand(createTaskCommand());
program.addCommand(createQuadrantCommand());
program.addCommand(createCleanupCommand());

// 交互模式命令
program
  .command('interactive')
  .alias('i')
  .description('进入交互模式')
  .action(async () => {
    try {
      await startInteractiveMode();
    } catch (error) {
      console.error(chalk.red(`交互模式错误: ${(error as Error).message}`));
      process.exit(1);
    }
  });

// 显示帮助信息（当没有命令时）
if (process.argv.length === 2) {
  program.help();
}

// 解析命令行参数
program.parse(process.argv);
