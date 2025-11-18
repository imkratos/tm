class TmCli < Formula
  desc "基于CLI的任务管理工具，支持四象限模型和Vim风格交互"
  homepage "https://github.com/imkratos/tm-cli"
  url "https://github.com/imkratos/tm-cli/archive/refs/tags/v1.0.0.tar.gz"
  sha256 "" # 这个将由 GitHub Action 自动更新
  license "MIT"

  depends_on "node"

  def install
    system "npm", "install", "--production", *std_npm_args(libexec)
    bin.install_symlink Dir["#{libexec}/bin/*"]
  end

  test do
    assert_match "tm", shell_output("#{bin}/tm --version")
  end
end
