import inquirer from 'inquirer';
import { taskDb, Task } from '../db/database';
import {
  selectTask,
  selectAction,
  confirm,
  inputText,
  inputNumber,
  selectQuadrant
} from './cli';
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
 * 交互模式主函数
 */
export async function startInteractiveMode(): Promise<void> {
  console.clear();
  printInfo('进入交互模式（输入 q 退出）');

  let running = true;

  while (running) {
    try {
      // 显示主菜单
      const action = await showMainMenu();

      switch (action) {
        case 'list':
          await listTasks();
          break;
        case 'add':
          await addTask();
          break;
        case 'edit':
          await editTask();
          break;
        case 'complete':
          await completeTask();
          break;
        case 'delete':
          await deleteTask();
          break;
        case 'quadrant':
          await manageQuadrant();
          break;
        case 'stats':
          await showStats();
          break;
        case 'help':
          showHelp();
          break;
        case 'quit':
          running = false;
          printInfo('退出交互模式');
          break;
      }
    } catch (error) {
      if ((error as any).isTtyError) {
        printError('交互模式在当前环境中不可用');
        break;
      } else {
        printError(`发生错误: ${(error as Error).message}`);
      }
    }
  }
}

/**
 * 显示主菜单
 */
async function showMainMenu(): Promise<string> {
  const choices = [
    { name: '📋 查看任务列表', value: 'list' },
    { name: '➕ 添加新任务', value: 'add' },
    { name: '✏️  编辑任务', value: 'edit' },
    { name: '✓ 完成任务', value: 'complete' },
    { name: '🗑️  删除任务', value: 'delete' },
    { name: '📊 管理四象限', value: 'quadrant' },
    { name: '📈 查看统计', value: 'stats' },
    { name: '❓ 帮助', value: 'help' },
    { name: '🚪 退出 (q)', value: 'quit' }
  ];

  return selectAction('请选择操作', choices);
}

/**
 * 列出任务
 */
async function listTasks(): Promise<void> {
  const filterChoice = await selectAction('选择显示方式', [
    { name: '所有待办任务', value: 'pending' },
    { name: '所有已完成任务', value: 'completed' },
    { name: '全部任务', value: 'all' }
  ]);

  let status: string | undefined;
  if (filterChoice === 'pending') {
    status = config.taskStatus.PENDING;
  } else if (filterChoice === 'completed') {
    status = config.taskStatus.COMPLETED;
  }

  const tasks = taskDb.getAllTasks(status);

  if (tasks.length === 0) {
    printInfo('暂无任务');
    await confirm('按回车继续...', true);
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

  const stats = taskDb.getStats();
  console.log(chalk.gray('─'.repeat(50)));
  console.log(chalk.bold(`总计: ${stats.total} | 待办: ${stats.pending} | 已完成: ${stats.completed}\n`));

  await confirm('按回车继续...', true);
}

/**
 * 添加任务
 */
async function addTask(): Promise<void> {
  console.log(chalk.bold('\n添加新任务\n'));

  const title = await inputText('任务标题');

  if (!title.trim()) {
    printError('任务标题不能为空');
    await confirm('按回车继续...', true);
    return;
  }

  const description = await inputText('任务描述（可选）');
  const priority = await inputNumber('优先级 (1-10)', 5, 1, 10);

  const task = taskDb.addTask(title, description, priority);

  printSuccess(`任务已添加: ${formatTaskTitle(task.id!, task.title, task.status, task.priority)}`);

  const assignQuadrant = await confirm('是否分配到四象限？', false);

  if (assignQuadrant) {
    const quadrant = await selectQuadrant();
    if (quadrant) {
      taskDb.assignQuadrant(task.id!, quadrant);
      printSuccess(`已分配到象限${quadrant}`);
    }
  }

  await confirm('按回车继续...', true);
}

/**
 * 编辑任务
 */
async function editTask(): Promise<void> {
  const tasks = taskDb.getAllTasks();

  if (tasks.length === 0) {
    printInfo('暂无任务');
    await confirm('按回车继续...', true);
    return;
  }

  const task = await selectTask(tasks, '选择要编辑的任务');

  if (!task) {
    return;
  }

  console.log(chalk.bold('\n编辑任务\n'));

  const editChoice = await selectAction('选择要编辑的内容', [
    { name: '标题', value: 'title' },
    { name: '描述', value: 'description' },
    { name: '优先级', value: 'priority' },
    { name: '取消', value: 'cancel' }
  ]);

  if (editChoice === 'cancel') {
    return;
  }

  const updates: any = {};

  switch (editChoice) {
    case 'title':
      updates.title = await inputText('新标题', task.title);
      break;
    case 'description':
      updates.description = await inputText('新描述', task.description);
      break;
    case 'priority':
      updates.priority = await inputNumber('新优先级 (1-10)', task.priority, 1, 10);
      break;
  }

  const success = taskDb.updateTask(task.id!, updates);

  if (success) {
    printSuccess('任务已更新');
  } else {
    printError('更新任务失败');
  }

  await confirm('按回车继续...', true);
}

/**
 * 完成任务
 */
async function completeTask(): Promise<void> {
  const tasks = taskDb.getAllTasks(config.taskStatus.PENDING);

  if (tasks.length === 0) {
    printInfo('暂无待办任务');
    await confirm('按回车继续...', true);
    return;
  }

  const task = await selectTask(tasks, '选择要完成的任务');

  if (!task) {
    return;
  }

  const success = taskDb.completeTask(task.id!);

  if (success) {
    printSuccess(`任务 #${task.id} 已标记为完成`);
  } else {
    printError('标记任务失败');
  }

  await confirm('按回车继续...', true);
}

/**
 * 删除任务
 */
async function deleteTask(): Promise<void> {
  const tasks = taskDb.getAllTasks();

  if (tasks.length === 0) {
    printInfo('暂无任务');
    await confirm('按回车继续...', true);
    return;
  }

  const task = await selectTask(tasks, '选择要删除的任务');

  if (!task) {
    return;
  }

  const confirmed = await confirm(`确定要删除任务 #${task.id} 吗？`, false);

  if (!confirmed) {
    printInfo('操作已取消');
    await confirm('按回车继续...', true);
    return;
  }

  const success = taskDb.deleteTask(task.id!);

  if (success) {
    printSuccess(`任务 #${task.id} 已删除`);
  } else {
    printError('删除任务失败');
  }

  await confirm('按回车继续...', true);
}

/**
 * 管理四象限
 */
async function manageQuadrant(): Promise<void> {
  const action = await selectAction('四象限管理', [
    { name: '查看四象限视图', value: 'view' },
    { name: '分配任务到象限', value: 'assign' },
    { name: '移除任务的象限', value: 'remove' },
    { name: '返回', value: 'back' }
  ]);

  switch (action) {
    case 'view':
      await viewQuadrants();
      break;
    case 'assign':
      await assignTaskToQuadrant();
      break;
    case 'remove':
      await removeTaskFromQuadrant();
      break;
  }
}

/**
 * 查看四象限视图
 */
async function viewQuadrants(): Promise<void> {
  const stats = taskDb.getStats();

  console.log(chalk.bold('\n四象限任务视图:\n'));

  for (let i = 1; i <= 4; i++) {
    const quadrantInfo = config.quadrants[i as keyof typeof config.quadrants];
    const quadrantColor = getQuadrantColor(i);
    const count = stats.byQuadrant[i] || 0;

    console.log(quadrantColor.bold(`\n象限${i}: ${quadrantInfo.name} - ${count}个任务`));
    console.log(quadrantColor('─'.repeat(60)));

    const tasks = taskDb.getTasksByQuadrant(i);

    if (tasks.length === 0) {
      console.log(chalk.gray('  暂无任务'));
    } else {
      tasks.forEach((task) => {
        const formattedTask = formatTaskTitle(task.id!, task.title, task.status, task.priority);
        console.log(`  ${formattedTask}`);
      });
    }
  }

  console.log('');
  await confirm('按回车继续...', true);
}

/**
 * 分配任务到象限
 */
async function assignTaskToQuadrant(): Promise<void> {
  const tasks = taskDb.getAllTasks();

  if (tasks.length === 0) {
    printInfo('暂无任务');
    await confirm('按回车继续...', true);
    return;
  }

  const task = await selectTask(tasks, '选择要分配的任务');

  if (!task) {
    return;
  }

  const quadrant = await selectQuadrant();

  if (!quadrant) {
    printInfo('操作已取消');
    await confirm('按回车继续...', true);
    return;
  }

  const success = taskDb.assignQuadrant(task.id!, quadrant);

  if (success) {
    const quadrantInfo = config.quadrants[quadrant as keyof typeof config.quadrants];
    printSuccess(`任务 #${task.id} 已分配到象限${quadrant}: ${quadrantInfo.name}`);
  } else {
    printError('分配任务失败');
  }

  await confirm('按回车继续...', true);
}

/**
 * 移除任务的象限
 */
async function removeTaskFromQuadrant(): Promise<void> {
  const tasks = taskDb.getAllTasks().filter(t => t.quadrant !== null);

  if (tasks.length === 0) {
    printInfo('暂无已分配象限的任务');
    await confirm('按回车继续...', true);
    return;
  }

  const task = await selectTask(tasks, '选择要移除象限的任务');

  if (!task) {
    return;
  }

  const success = taskDb.updateTask(task.id!, { quadrant: null });

  if (success) {
    printSuccess(`任务 #${task.id} 的象限分配已移除`);
  } else {
    printError('移除象限分配失败');
  }

  await confirm('按回车继续...', true);
}

/**
 * 显示统计信息
 */
async function showStats(): Promise<void> {
  const stats = taskDb.getStats();

  console.log(chalk.bold('\n任务统计信息:\n'));

  console.log(chalk.blue(`总任务数: ${stats.total}`));
  console.log(chalk.yellow(`待办任务: ${stats.pending}`));
  console.log(chalk.green(`已完成任务: ${stats.completed}`));

  console.log(chalk.bold('\n四象限分布:\n'));

  for (let i = 1; i <= 4; i++) {
    const quadrantInfo = config.quadrants[i as keyof typeof config.quadrants];
    const count = stats.byQuadrant[i] || 0;
    const quadrantColor = getQuadrantColor(i);

    console.log(quadrantColor(`象限${i} (${quadrantInfo.name}): ${count}个任务`));
  }

  const unassigned = stats.total - Object.values(stats.byQuadrant).reduce((a, b) => a + b, 0);
  console.log(chalk.gray(`未分配象限: ${unassigned}个任务`));

  console.log('');
  await confirm('按回车继续...', true);
}

/**
 * 显示帮助信息
 */
function showHelp(): void {
  console.log(chalk.bold('\n交互模式帮助:\n'));

  console.log(chalk.yellow('主要功能:'));
  console.log('  📋 查看任务列表 - 查看所有任务或按状态过滤');
  console.log('  ➕ 添加新任务   - 创建新的待办任务');
  console.log('  ✏️  编辑任务     - 修改任务的标题、描述或优先级');
  console.log('  ✓ 完成任务     - 标记任务为已完成');
  console.log('  🗑️  删除任务     - 永久删除任务');
  console.log('  📊 管理四象限   - 查看和管理四象限任务');
  console.log('  📈 查看统计     - 查看任务统计信息');

  console.log(chalk.yellow('\n四象限模型:'));
  console.log('  象限1: 重要且紧急 - 立即处理的任务');
  console.log('  象限2: 重要不紧急 - 需要规划的任务');
  console.log('  象限3: 不重要但紧急 - 可以委托的任务');
  console.log('  象限4: 不重要不紧急 - 可以减少或消除的任务');

  console.log(chalk.yellow('\n提示:'));
  console.log('  - 使用上下箭头在菜单中导航');
  console.log('  - 按 Enter 键确认选择');
  console.log('  - 优先级范围: 1-10 (数值越小优先级越高)');
  console.log('  - 选择 "退出" 或输入 q 退出交互模式');

  console.log('');
}
