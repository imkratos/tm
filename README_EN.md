# TM-CLI

<div align="center">

[![NPM Version](https://img.shields.io/badge/version-1.0.0-blue.svg)](https://github.com/imkratos/tm-cli)
[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)](https://opensource.org/licenses/MIT)
[![TypeScript](https://img.shields.io/badge/TypeScript-5.3.3-blue.svg)](https://www.typescriptlang.org/)

*A command-line task management tool based on the Eisenhower Matrix with Vim-style interaction*

[Features](#features) •
[Installation](#installation) •
[Usage](#usage) •
[Commands](#commands) •
[Development](#development) •
[Contributing](#contributing) •
[License](#license)

[中文文档](README.md) | **English**

</div>

---

## Features

- ✅ **Task Management** - Create, view, complete, and delete tasks
- ⏰ **Four Quadrants** - Organize tasks based on the Eisenhower Matrix
  - Q1: Important & Urgent
  - Q2: Important & Not Urgent
  - Q3: Not Important & Urgent
  - Q4: Not Important & Not Urgent
- 🎨 **Colored Output** - Clear CLI visualization
- ⌨️  **Vim Mode** - Vim-style keyboard navigation
- 💾 **Local Storage** - SQLite database for local data persistence
- 🚀 **Fast & Efficient** - Pure command-line operations
- 📝 **TypeScript** - Type-safe development with TypeScript

## Installation

### Method 1: Install via npm (Recommended)

```bash
# Global installation
npm install -g @imkratos/tm-cli

# Verify installation
tm --version
```

### Method 2: Install via Homebrew (macOS/Linux)

```bash
# Add tap
brew tap imkratos/tap

# Install
brew install tm-cli

# Verify installation
tm --version
```

### Method 3: Install from Source

```bash
# Clone repository
git clone https://github.com/imkratos/tm-cli.git
cd tm-cli

# Install dependencies and build
npm install
npm run build

# Create global link
npm link

# Verify installation
tm --version
```

## Usage

### Add Tasks

```bash
# Add an important and urgent task
tm task add "Complete project report" -q 1

# Add an important but not urgent task
tm task add "Learn new technology" -q 2
```

### View Tasks

```bash
# View all tasks
tm task list

# View tasks in a specific quadrant
tm quadrant show 1
```

### Complete Tasks

```bash
# Complete task by ID
tm task complete 1
```

### Interactive Mode

```bash
# Launch interactive interface
tm interactive
# Or shorthand
tm i
```

## Commands

### Basic Syntax

```bash
tm [command] [options]
```

### Task Commands

#### Add Task

```bash
tm task add <description> -q <quadrant>
```

**Options:**
- `-q, --quadrant <number>` - Quadrant number (1-4)

**Example:**
```bash
tm task add "Urgent meeting" -q 1
```

#### List Tasks

```bash
tm task list [options]
```

**Options:**
- `-q, --quadrant <number>` - Filter by quadrant
- `-s, --status <status>` - Filter by status (pending/completed)

**Example:**
```bash
tm task list -q 1 -s pending
```

#### Complete Task

```bash
tm task complete <id>
```

#### Delete Task

```bash
tm task delete <id>
```

### Quadrant Commands

#### Show Quadrant Tasks

```bash
tm quadrant show <number>
```

**Example:**
```bash
tm quadrant show 1  # Show Q1 quadrant tasks
```

#### List All Quadrants

```bash
tm quadrant list
```

### Cleanup Commands

#### Clean Completed Tasks

```bash
tm cleanup [options]
```

**Options:**
- `-d, --days <number>` - Clean tasks completed N days ago
- `-a, --all` - Clean all completed tasks

**Example:**
```bash
tm cleanup -d 30  # Clean tasks completed 30 days ago
tm cleanup -a     # Clean all completed tasks
```

### Interactive Mode

Interactive mode provides Vim-like keyboard operations:

- `j/k` - Move up/down
- `h/l` - Switch quadrants
- `a` - Add task
- `d` - Delete task
- `x` - Mark/unmark as completed
- `q` - Quit

## Project Structure

```
tm-cli/
├── src/
│   ├── app.ts              # Main entry point
│   ├── config.ts           # Configuration
│   ├── commands/           # Command implementations
│   │   ├── task.ts         # Task commands
│   │   ├── quadrant.ts     # Quadrant commands
│   │   └── cleanup.ts      # Cleanup commands
│   ├── db/                 # Database layer
│   │   └── database.ts     # Database operations
│   ├── ui/                 # User interface
│   │   ├── cli.ts          # CLI interface
│   │   └── interactive.ts  # Interactive mode
│   └── utils/              # Utility functions
│       └── colors.ts       # Color utilities
├── dist/                   # Build output
├── test/                   # Test files
├── package.json
├── tsconfig.json
└── README.md
```

## Development

### Requirements

- Node.js >= 14.0.0
- npm >= 6.0.0

### Development Workflow

```bash
# Clone repository
git clone https://github.com/imkratos/tm-cli.git
cd tm-cli

# Install dependencies
npm install

# Development mode
npm run dev

# Build
npm run build

# Run tests
npm test
```

### Tech Stack

- **TypeScript** - Type-safe JavaScript superset
- **Commander.js** - Command-line interface framework
- **Inquirer.js** - Interactive command-line user interface
- **Better-SQLite3** - Fast SQLite3 database
- **Chalk** - Terminal string styling
- **Jest** - JavaScript testing framework

### Testing

```bash
# Run all tests
npm test

# Run tests with coverage report
npm test -- --coverage
```

## Contributing

Contributions are welcome! Feel free to submit issues and pull requests.

### Contribution Workflow

1. Fork this repository
2. Create your feature branch (`git checkout -b feature/AmazingFeature`)
3. Commit your changes (`git commit -m 'Add some AmazingFeature'`)
4. Push to the branch (`git push origin feature/AmazingFeature`)
5. Open a Pull Request

### Code Standards

- Use TypeScript
- Follow existing code style
- Add tests for new features
- Update relevant documentation

## Changelog

### [1.0.0] - 2025-11-18

#### Added
- Basic task management features
- Four-quadrant classification
- Interactive CLI interface
- SQLite local data storage
- Task cleanup functionality

## Issue Reporting

If you find bugs or have feature suggestions, please [submit an issue](https://github.com/imkratos/tm-cli/issues)

## License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details

## Acknowledgments

- [Commander.js](https://github.com/tj/commander.js/) - Excellent CLI framework
- [Inquirer.js](https://github.com/SBoudrias/Inquirer.js/) - Powerful interactive interface
- [Eisenhower Matrix](https://en.wikipedia.org/wiki/Time_management#The_Eisenhower_Method) - Time management theory

## Contact

- Author: [imkratos](https://github.com/imkratos)
- Project Link: [https://github.com/imkratos/tm-cli](https://github.com/imkratos/tm-cli)

---

<div align="center">

**If this project helps you, please give it a star ⭐**

Made with ❤️ by [imkratos](https://github.com/imkratos)

</div>
