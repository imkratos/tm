# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## 项目概述

TM-CLI 是一个基于命令行的任务管理工具，采用艾森豪威尔四象限时间管理法，支持 Vim 风格的交互界面。

## 核心架构

### 架构模式
项目采用经典的 MVC 分层架构：
- **Commands** (`src/commands/`): 命令层，处理用户输入和命令逻辑
- **Database** (`src/db/`): 数据访问层，使用 Better-SQLite3 实现本地存储
- **UI** (`src/ui/`): 界面层，包含 CLI 输出和交互模式
- **Utils** (`src/utils/`): 工具函数，如颜色格式化

### 数据模型
任务 (Task) 包含以下字段：
- `id`: 自增主键
- `title`: 任务标题
- `description`: 任务描述
- `priority`: 优先级 (1-10)
- `status`: 状态 ('pending' | 'completed')
- `quadrant`: 四象限编号 (1-4，可为 null)
- `created_at`, `updated_at`: 时间戳

### 四象限定义
1. Q1: 重要且紧急 (Important & Urgent)
2. Q2: 重要不紧急 (Important & Not Urgent)
3. Q3: 不重要但紧急 (Not Important & Urgent)
4. Q4: 不重要不紧急 (Not Important & Not Urgent)

### 数据存储
- 使用 Better-SQLite3 单例模式 (`taskDb`)
- 数据库文件路径: `~/.tm/tasks.db`
- WAL 模式提高并发性能
- 为 status、priority、quadrant 字段创建了索引

## 常用开发命令

### 构建和运行
```bash
# 编译 TypeScript 到 dist/
npm run build

# 开发模式 (使用 ts-node)
npm run dev

# 启动编译后的应用
npm start
```

### 测试
```bash
# 运行所有测试
npm test

# 运行测试并生成覆盖率报告
npm test -- --coverage
```

### 本地开发链接
```bash
# 构建并创建全局链接
npm run build
npm link

# 之后可以直接使用 tm 命令
tm --help
```

## 开发注意事项

### 命令结构
所有命令都通过 `commander` 实现，遵循以下模式：
1. 在 `src/commands/` 创建命令文件
2. 导出工厂函数返回 `Command` 对象
3. 在 `src/app.ts` 注册命令

### 数据库操作
- 所有数据库操作通过 `taskDb` 单例进行
- 使用预编译语句 (`prepare`) 提高性能和安全性
- 更新操作自动处理 `updated_at` 字段

### UI 输出
使用 `src/utils/colors.ts` 中的辅助函数保持输出一致性：
- `printSuccess()`: 成功消息（绿色）
- `printError()`: 错误消息（红色）
- `printInfo()`: 信息消息（蓝色）
- `formatTaskTitle()`: 格式化任务标题
- `getQuadrantColor()`: 根据象限返回对应颜色

### 交互模式
交互模式 (`src/ui/interactive.ts`) 使用 Inquirer.js 实现类 Vim 的键盘操作。修改交互逻辑时需注意保持键位一致性。

## TypeScript 配置
- Target: ES2020
- Module: CommonJS
- 输出目录: `./dist`
- 启用严格模式和 esModuleInterop
