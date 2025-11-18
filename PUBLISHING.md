# 发布指南

本文档说明如何将 tm-cli 发布到 npm 和 Homebrew。

**中文** | [English](PUBLISHING_EN.md)

---

## 前置准备

### 1. NPM 发布准备

1. 在 [npmjs.com](https://www.npmjs.com/) 注册账号
2. 在本地登录 npm：
   ```bash
   npm login
   ```
3. 在 npm 网站创建访问令牌（Access Token）：
   - 访问 https://www.npmjs.com/settings/YOUR_USERNAME/tokens
   - 点击 "Generate New Token"
   - 选择 "Automation" 类型
   - 复制生成的 token

4. 在 GitHub 仓库添加 NPM_TOKEN secret：
   - 访问你的 GitHub 仓库 Settings > Secrets and variables > Actions
   - 点击 "New repository secret"
   - Name: `NPM_TOKEN`
   - Value: 粘贴你的 npm token

### 2. GitHub 仓库设置

修改 `package.json` 中的以下字段：
```json
{
  "name": "@imkratos/tm-cli",  // 使用你的 npm 用户名
  "author": "imkratos <imkratos@users.noreply.github.com>",
  "repository": {
    "url": "https://github.com/imkratos/tm-cli.git"
  }
}
```

修改 `homebrew/tm-cli.rb` 中的 GitHub URL：
```ruby
homepage "https://github.com/imkratos/tm-cli"
url "https://github.com/imkratos/tm-cli/archive/refs/tags/v1.0.0.tar.gz"
```

## 发布流程

### 方式一：通过 GitHub Release 自动发布

1. **创建并推送 git tag**：
   ```bash
   git tag v1.0.0
   git push origin v1.0.0
   ```

2. **在 GitHub 创建 Release**：
   - 访问你的仓库页面
   - 点击 "Releases" > "Create a new release"
   - 选择刚才创建的 tag (v1.0.0)
   - 填写 Release 标题和说明
   - 点击 "Publish release"

3. **自动触发流程**：
   - GitHub Actions 会自动运行
   - npm-publish.yml 将项目发布到 npm
   - homebrew-update.yml 更新 Homebrew formula

### 方式二：手动触发 GitHub Actions

1. **访问 Actions 页面**：
   - 进入你的 GitHub 仓库
   - 点击 "Actions" 标签

2. **手动触发 NPM 发布**：
   - 选择 "Publish to NPM" workflow
   - 点击 "Run workflow"
   - 输入版本号（可选，如 1.0.1）
   - 点击 "Run workflow" 按钮

3. **手动触发 Homebrew 更新**：
   - 选择 "Update Homebrew Formula" workflow
   - 点击 "Run workflow"
   - 点击 "Run workflow" 按钮

## NPM 安装使用

发布成功后，用户可以通过以下方式安装：

```bash
# 全局安装
npm install -g @imkratos/tm-cli

# 或者如果没有使用 scope
npm install -g tm-cli

# 使用
tm --help
```

## Homebrew 安装使用

### 选项 1: 创建自己的 Homebrew Tap（推荐）

1. **创建 tap 仓库**：
   - 在 GitHub 创建新仓库，命名为 `homebrew-tap`
   - 完整路径应该是：`https://github.com/imkratos/homebrew-tap`

2. **复制 formula 到 tap 仓库**：
   ```bash
   git clone https://github.com/imkratos/homebrew-tap.git
   cd homebrew-tap
   mkdir -p Formula
   cp /path/to/tm-cli/homebrew/tm-cli.rb Formula/
   git add Formula/tm-cli.rb
   git commit -m "Add tm-cli formula"
   git push
   ```

3. **用户安装方式**：
   ```bash
   # 添加 tap
   brew tap imkratos/tap

   # 安装
   brew install tm-cli
   ```

### 选项 2: 提交到 Homebrew 官方仓库

1. Fork [homebrew-core](https://github.com/Homebrew/homebrew-core)
2. 将你的 formula 添加到 `Formula/` 目录
3. 创建 Pull Request
4. 等待 Homebrew 团队审核

审核通过后，用户可以直接安装：
```bash
brew install tm-cli
```

## 版本管理

### 更新版本号

使用 npm 的版本管理命令：

```bash
# 补丁版本（1.0.0 -> 1.0.1）
npm version patch

# 小版本（1.0.0 -> 1.1.0）
npm version minor

# 大版本（1.0.0 -> 2.0.0）
npm version major
```

这会自动：
- 更新 `package.json` 中的版本号
- 创建 git commit
- 创建 git tag

然后推送：
```bash
git push && git push --tags
```

## 故障排查

### NPM 发布失败

1. **权限错误**：
   - 确认 NPM_TOKEN 已正确设置
   - 确认包名未被占用
   - 如果使用 scope (@username/package)，确保有权限

2. **构建失败**：
   - 检查 TypeScript 编译错误
   - 确保所有测试通过

### Homebrew 安装失败

1. **SHA256 不匹配**：
   - 等待 GitHub Actions 更新 formula
   - 或手动计算正确的 SHA256

2. **依赖问题**：
   - 确保用户已安装 Node.js
   - 检查 formula 中的依赖声明

## 持续集成说明

项目包含两个 GitHub Actions workflow：

1. **npm-publish.yml**：
   - 触发条件：创建 Release 或手动触发
   - 功能：运行测试、构建项目、发布到 npm

2. **homebrew-update.yml**：
   - 触发条件：创建 Release 或手动触发
   - 功能：更新 Homebrew formula 的 URL 和 SHA256

## 最佳实践

1. **语义化版本**：遵循 [SemVer](https://semver.org/) 规范
2. **变更日志**：维护 CHANGELOG.md 记录每个版本的变更
3. **测试覆盖**：确保发布前所有测试通过
4. **文档同步**：更新版本时同步更新 README.md
