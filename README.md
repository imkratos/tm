# TM-CLI

<div align="center">

[![NPM Version](https://img.shields.io/badge/version-1.0.0-blue.svg)](https://github.com/imkratos/tm-cli)
[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)](https://opensource.org/licenses/MIT)
[![TypeScript](https://img.shields.io/badge/TypeScript-5.3.3-blue.svg)](https://www.typescriptlang.org/)

*一个基于四象限时间管理法的命令行任务管理工具，带有 Vim 风格的交互界面*

[特性](#特性) •
[安装](#安装) •
[使用](#使用) •
[命令](#命令) •
[开发](#开发) •
[贡献](#贡献) •
[许可证](#许可证)

**中文** | [English](README_EN.md)

</div>

---

## 特性

- ✅ **任务管理** - 创建、查看、完成、删除任务
- ⏰ **四象限分类** - 基于艾森豪威尔矩阵组织任务
  - Q1: 重要且紧急
  - Q2: 重要不紧急
  - Q3: 紧急不重要
  - Q4: 不重要不紧急
- 🎨 **彩色输出** - 清晰的 CLI 可视化
- ⌨️  **Vim 模式** - 支持 Vim 风格的键盘导航
- 💾 **本地存储** - 使用 SQLite 数据库本地存储数据
- 🚀 **快速高效** - 使用纯命令行操作
- 📝 **TypeScript** - 使用 TypeScript 开发，类型安全

## 安装

### 方式 1: 通过 npm 安装（推荐）

```bash
# 全局安装
npm install -g @imkratos/tm-cli

# 验证安装
tm --version
```

### 方式 2: 通过 Homebrew 安装（macOS/Linux）

```bash
# 添加 tap
brew tap imkratos/tap

# 安装
brew install tm-cli

# 验证安装
tm --version
```

### 方式 3: 从源码安装

```bash
# 克隆仓库
git clone https://github.com/imkratos/tm-cli.git
cd tm-cli

# 安装依赖并构建
npm install
npm run build

# 创建全局链接
npm link

# 验证安装
tm --version
```

## 使用

### 添加任务

```bash
# 添加一个重要且紧急的任务
tm task add "完成项目报告" -q 1

# 添加一个重要不紧急的任务
tm task add "学习新技术" -q 2
```

### 查看任务

```bash
# 查看所有任务
tm task list

# 查看指定象限的任务
tm quadrant show 1
```

### 完成任务

```bash
# 根据 ID 完成任务
tm task complete 1
```

### 交互模式

```bash
# 启动交互界面
tm interactive
# 或简写
tm i
```

## 命令

### 基本语法

```bash
tm [command] [options]
```

### Task 命令

#### 添加任务

```bash
tm task add <description> -q <quadrant>
```

**选项:**
- `-q, --quadrant <number>` - 象限编号 (1-4)

**示例:**
```bash
tm task add "紧急会议" -q 1
```

#### 列出任务

```bash
tm task list [options]
```

**选项:**
- `-q, --quadrant <number>` - 按象限过滤
- `-s, --status <status>` - 按状态过滤 (pending/completed)

**示例:**
```bash
tm task list -q 1 -s pending
```

#### 完成任务

```bash
tm task complete <id>
```

#### 删除任务

```bash
tm task delete <id>
```

### Quadrant 命令

#### 显示象限任务

```bash
tm quadrant show <number>
```

**示例:**
```bash
tm quadrant show 1  # 显示 Q1 象限任务
```

#### 查看所有象限

```bash
tm quadrant list
```

### Cleanup 命令

#### 清理已完成任务

```bash
tm cleanup [options]
```

**选项:**
- `-d, --days <number>` - 清理指定天数前的任务
- `-a, --all` - 清理所有已完成任务

**示例:**
```bash
tm cleanup -d 30  # 清理 30 天前的已完成任务
tm cleanup -a     # 清理所有已完成任务
```

### 交互模式

交互模式提供类似 Vim 的键盘操作：

- `j/k` - 上下移动
- `h/l` - 切换象限
- `a` - 添加任务
- `d` - 删除任务
- `x` - 标记/取消完成
- `q` - 退出

## 项目结构

```
tm-cli/
├── src/
│   ├── app.ts              # 主入口
│   ├── config.ts           # 配置文件
│   ├── commands/           # 命令实现
│   │   ├── task.ts         # 任务命令
│   │   ├── quadrant.ts     # 象限命令
│   │   └── cleanup.ts      # 清理命令
│   ├── db/                 # 数据库层
│   │   └── database.ts     # 数据库操作
│   ├── ui/                 # 用户界面
│   │   ├── cli.ts          # CLI 界面
│   │   └── interactive.ts  # 交互模式
│   └── utils/              # 工具函数
│       └── colors.ts       # 颜色工具
├── dist/                   # 编译输出
├── test/                   # 测试文件
├── package.json
├── tsconfig.json
└── README.md
```

## 开发

### 环境要求

- Node.js >= 14.0.0
- npm >= 6.0.0

### 开发流程

```bash
# 克隆仓库
git clone https://github.com/imkratos/tm-cli.git
cd tm-cli

# 安装依赖
npm install

# 开发模式
npm run dev

# 构建
npm run build

# 运行测试
npm test
```

### 技术栈

- **TypeScript** - 类型安全的 JavaScript 超集
- **Commander.js** - 命令行界面框架
- **Inquirer.js** - 交互式命令行用户界面
- **Better-SQLite3** - 快速 SQLite3 数据库
- **Chalk** - 终端字符串样式
- **Jest** - JavaScript 测试框架

### 测试

```bash
# 运行所有测试
npm test

# 运行测试并生成覆盖率报告
npm test -- --coverage
```

## 贡献

欢迎贡献！请随时提交问题和拉取请求。

### 贡献流程

1. Fork 本仓库
2. 创建您的特性分支 (`git checkout -b feature/AmazingFeature`)
3. 提交您的更改 (`git commit -m 'Add some AmazingFeature'`)
4. 推送到分支 (`git push origin feature/AmazingFeature`)
5. 开启一个 Pull Request

### 代码规范

- 使用 TypeScript
- 遵循现有代码风格
- 为新功能添加测试
- 更新相关文档

## 更新日志

### [1.0.0] - 2025-11-18

#### 新增
- 基础任务管理功能
- 四象限分类管理
- 交互式 CLI 界面
- SQLite 本地数据存储
- 任务清理功能

## 问题反馈

如果您发现 bug 或有功能建议，请[提交 Issue](https://github.com/imkratos/tm-cli/issues)

## 许可证

本项目采用 MIT 许可证 - 查看 [LICENSE](LICENSE) 文件了解详情

## 致谢

- [Commander.js](https://github.com/tj/commander.js/) - 优秀的 CLI 框架
- [Inquirer.js](https://github.com/SBoudrias/Inquirer.js/) - 强大的交互界面
- [艾森豪威尔矩阵](https://en.wikipedia.org/wiki/Time_management#The_Eisenhower_Method) - 时间管理理论

## 联系方式

- 作者: [imkratos](https://github.com/imkratos)
- 项目链接: [https://github.com/imkratos/tm-cli](https://github.com/imkratos/tm-cli)

---

<div align="center">

**如果这个项目对您有帮助，请给它一个星标 ⭐**

Made with ❤️ by [imkratos](https://github.com/imkratos)

</div>
