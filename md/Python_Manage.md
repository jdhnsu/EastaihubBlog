---
title: Python 项目管理入门
tags: ["计算机基础"]
---
# Python 项目管理入门
> 这是一篇面向新加入实验室的同学撰写的 Python 项目管理入门教程。

做项目就像养一棵树：种下源码（seed），逐步施肥（依赖、测试、CI），最终收获果实（可交付的软件）。缺少项目管理，你的代码会像杂草丛生——依赖冲突、环境不可复现、部署反复失败。良好的项目管理能让你在学术或工程项目中更快地复现结果、共享环境、定位问题，也能让团队协作更顺畅。

本指南采用实用为主的风格，按常见工具流派拆解：社区标准（pip + venv）、科学与二进制包友好（Conda），以及现代化的依赖与发布工具（Poetry）。每一节都包含命令示例、优劣对比与常见陷阱。


## 小契约（Contract）
- 输入：开发者希望在任意机器上复现 Python 环境并运行项目。
- 输出：可复现的依赖清单、可切换的隔离环境、常用命令速查表。
- 错误模式：依赖冲突、平台差异（Windows/Linux/macOS）、二进制包缺失、网络/镜像问题。

## 常见的边界情况（Edge cases）
- 需要二进制扩展（例如 numpy、pandas、scipy）且目标机器无编译环境。
- 同时需要多个 Python 版本（如 3.8 与 3.11）。
- CI 与生产环境使用不同的包源或私有包。

---

> **实验室一般使用`conda`作为学习和开发的主要工具**

## 工具一：pip + venv（Python 社区的基础方案）
> 最轻量、与标准库最贴近的方案。推荐用于小型项目、脚本、教学以及对二进制依赖要求不高的场景。

为什么选它：pip 和 venv 是 Python 标准工具（无需额外安装 Python3 自带 venv），它易于理解、与大多数托管平台（比如 PyPI）兼容。

如何工作（简短流程）：
1. 创建虚拟环境（隔离 site-packages）。
2. 激活环境并安装依赖（pip install）。
3. 导出依赖（requirements.txt）以便复现。

快速上手（Windows pwsh 示例）：
```powershell
# 创建虚拟环境（只需一次）
python -m venv .venv

# 激活（PowerShell）
.\.venv\Scripts\Activate.ps1

# 安装依赖
pip install requests flask

# 将当前环境依赖导出为 requirements.txt
pip freeze > requirements.txt

# 在另一台机器上复现
python -m venv .venv
.\.venv\Scripts\Activate.ps1
pip install -r requirements.txt
```

实用技巧与陷阱：
- windows 下不要把虚拟环境放在 PATH 很深的目录，避免路径长度问题。
- 使用 `python -m pip` 而不是直接 `pip` 可以减少版本错配（确保使用当前 Python 的 pip）。
- `pip freeze` 会将所有已安装包固定到具体版本，适合生产或 CI；开发时可只维护 `requirements.in` 并通过 `pip-compile` 生成锁文件（见下）。
- 对于需要编译的二进制扩展，Windows/macOS 可能缺少编译器，这时考虑使用 wheels 或切换到 Conda。

验收标准：能在干净机器上通过 `requirements.txt` 完整安装并运行项目的最小示例。

---

## 工具二：Conda（适合科学计算与二进制包）
> Conda 是一个跨语言的包和环境管理器，擅长分发预编译的二进制包（尤其是科学栈），常用于数据科学和科研环境。

为什么选它：当你的项目依赖如 numpy、scipy、pandas、opencv 等大型二进制包时，Conda 能避免本地编译，直接安装兼容的二进制文件。

### conda 安装
一般直接从官网([anaconda.com](https://www.anaconda.com/download))直接下载安装包安装即可，安装后可通过 `conda --version` 验证是否安装成功。但是有时受限于网络环境问题下载速度缓慢，可以考虑从清华源下载安装包。
- 1.打开[清华源conda-help](https://mirrors.tuna.tsinghua.edu.cn/help/anaconda/)



- 2.打开[https://mirrors.tuna.tsinghua.edu.cn/anaconda/archive/](https://mirrors.tuna.tsinghua.edu.cn/anaconda/archive/) 下载合适版本的安装包(建议使用 `Anaconda3-2025.06-1-Windows/Linux/MacOS-x86_64.sh/exe/pkg` 版本，避免一些列的版本问题)
  > 对于windows系统，下载后直接双击运行安装包即可，安装路径默认即可。然后：
  > - 打开 `控制面板` -> `系统和安全` -> `系统` -> `高级系统设置` -> `高级` -> `环境变量` -> `系统变量` -> `Path`
  >  - 编辑 `Path` 变量，在末尾添加 `C:\Users\用户名\Anaconda3;C:\Users\用户名\Anaconda3\Scripts;C:\Users\用户名\Anaconda3\Library\bin;`
  > 如果你没有安装到默认路径，请自行修改上述路径。




- 将conda的软件的下载源也换到清华源：
  - Windows：打开`C:\Users\<YourUserName>\.condarc`, 添加与linux/macos相同的内容。
    
  - Linux/MacOS：打开 `~/.condarc` 文件，添加以下内容：
    ```bash
    channels:
        - defaults
    show_channel_urls: true
    default_channels:
        - https://mirrors.tuna.tsinghua.edu.cn/anaconda/pkgs/main
        - https://mirrors.tuna.tsinghua.edu.cn/anaconda/pkgs/r
        - https://mirrors.tuna.tsinghua.edu.cn/anaconda/pkgs/msys2
    custom_channels:
        conda-forge: https://mirrors.tuna.tsinghua.edu.cn/anaconda/cloud
        pytorch: https://mirrors.tuna.tsinghua.edu.cn/anaconda/cloud
    ```

    


基础使用示例（Miniconda/Anaconda）：
```bash
# 创建并指定 Python 版本
conda create -n myenv python=3.10

# 激活环境
conda activate myenv

# 安装包（来自默认 channel 或 conda-forge）
conda install numpy pandas

# 导出环境到 yml（包含依赖与 Python 版本）
conda env export --no-builds > environment.yml

# 在另一台机器上复现
conda env create -f environment.yml
conda activate myenv
```

优点：
- 预编译二进制包，避免编译工具链问题。
- 可以管理非 Python 依赖（如 libpng、openblas）。
- 适配跨平台科学栈，conda-forge 社区活跃。

缺点：
- Conda 环境通常较大，占用磁盘多。
- 有时包版本落后于 PyPI，或出现依赖冲突解析较慢。
- 与 pip 的互操作需要小心：不要在 base 环境中混用，优先在独立环境内使用 `pip` 或 `conda`。

常见陷阱与建议：
- 优先在新建的 conda 环境内用 `conda install` 安装能从 conda 获得的包；仅当 conda 无包时使用 `pip`。
- 使用 `conda env export --no-builds` 可以得到更可移植的 yml 文件。
- 在 CI 中使用 miniconda 镜像或 mambaforge（mamba 的 conda 替代实现）以加快解析速度：`mamba create -n myenv python=3.10 numpy`。

验收标准：在 CI 或目标机器上通过 `environment.yml` 重建环境并运行关键测试。

---

## 工具三：Poetry（现代化项目与依赖管理）

为什么选它：Poetry 把依赖管理（pyproject.toml）和版本解析、发布流程结合到一起，支持 lock 文件（poetry.lock），便于在团队与 CI 间复制精确依赖树。

快速上手：
```bash
# 安装（建议使用官方脚本或包管理器）
curl -sSL https://install.python-poetry.org | python -

# 在项目根目录初始化
poetry init

# 添加依赖并自动创建虚拟环境
poetry add requests

# 运行命令（在 Poetry 管理的虚拟环境中）
poetry run python -m mymodule

# 导出 requirements（必要时用于 Docker/CI）
poetry export -f requirements.txt --output requirements.txt --without-hashes
```

优点：
- 将项目配置集中到 `pyproject.toml`（PEP 621），现代、标准化。
- 自动生成并维护锁文件，便于复现。
- 集成发布（poetry publish）到 PyPI。

缺点：
- 对于依赖需要 conda 二进制包的科学栈，并不是最佳选择（仍可与 conda 混用，但需谨慎）。
- 学习曲线比 pip+venv 略陡，需要理解 pyproject 与虚拟环境的隐式管理。

建议用法：
- 使用 Poetry 管理库或应用的依赖与打包发布流程。
- 在 Dockerfile 中可将 poetry 导出的 requirements.txt 与官方 Python 镜像结合，以减少运行时依赖差异。

验收标准：通过 `poetry install` 在干净环境中重现开发环境，并能通过 `poetry run pytest` 运行测试套件。

---

## 工具四：uv（一体化的极速项目管理工具）
> 如果你在寻找一个把 `pip`、`pip-tools`、`pipx`、`poetry`、`pyenv`、`virtualenv` 等功能集合到一个命令行工具里的现代方案，`uv` 值得了解。它由 Astral 团队开发（同样的团队开发了 Ruff），以速度和一体化特性为亮点。

核心亮点（简述）：
- 一体化：项目管理、脚本运行、工具安装、Python 版本管理与 pip 兼容接口都被覆盖。
- 极速：官方基准显示在很多场景下比传统 pip 快 10-100 倍（受益于 Rust 实现与全局缓存）。
- 工作区与锁文件：支持类似 Cargo 的工作区、多项目管理与通用锁文件，方便大型工程或 monorepo。

快速上手与安装：
```bash
# 官方安装脚本（macOS / Linux）
curl -LsSf https://astral.sh/uv/install.sh | sh

# Windows 或通过 pip/homebrew 安装参考官方文档
```

项目管理示例：
```bash
# 初始化项目
uv init example
cd example

# 添加依赖（会自动创建 .venv）
uv add ruff

# 运行已安装的工具或脚本
uv run ruff check

# 锁定与同步依赖
uv lock
uv sync
```

脚本管理（单文件依赖声明）：
```bash
# 在脚本中使用内联元数据并安装运行
echo 'import requests; print(requests.get("https://astral.sh"))' > example.py
uv add --script example.py requests
uv run example.py
```

工具安装与临时运行（类似 pipx）：
```bash
# 临时运行
uvx pycowsay 'hello world!'

# 安装工具到 uv 管理的全局工具位置
uv tool install ruff
ruff --version
```

Python 版本管理：
```bash
# 安装并切换 Python 版本
uv python install 3.10 3.11 3.12
uv venv --python 3.12.0
uv python pin 3.11
```

pip 兼容接口：
```bash
# 使用 uv 的 pip 接口进行更快的解析与安装
uv pip sync docs/requirements.txt
uv pip compile docs/requirements.in --universal --output-file docs/requirements.txt
```

优点与适用场景：
- 如果你想要一个单一工具覆盖依赖解析、虚拟环境管理、Python 版本管理与工具执行，`uv` 是很好的选择。
- 对于需要频繁安装/切换依赖、在 CI 中追求速度或管理大型 monorepo，uv 的全局缓存与并行化解析非常有吸引力。

局限与注意事项：
- 新兴工具：虽然功能强大且在快速发展，但生态与社区规模尚不及 pip/conda/poetry 那般成熟，遇到极端兼容问题时可能需要更多排查。
- 与 Conda 的二进制包管理（尤其科学栈）并不总是直接互换；对大量依赖本地编译或特定二进制的项目仍建议使用 Conda。

迁移建议：
- 从 pip/venv 或 Poetry 迁移到 uv：先在沙盒分支中试验 `uv init` + `uv add`，使用 `uv lock` 生成锁并在 CI 中尝试 `uv sync`。
- 在需要 conda 二进制包的项目中，可只在运行与构建阶段继续使用 Conda，而用 uv 管理 Python 级别的依赖与工具执行。

参考与延伸阅读：
- uv 中文文档: https://uv.doczh.com/
- uv 官方仓库: https://github.com/astral-sh/uv

## 作者注
对于新手来说我建议先入门使用 `pip+venv`，熟悉其基本用法，然后再尝试使用`uv`，因为 `pip+venv`  代表了传统的 Python 包管理方式，并且和`python`的设计哲学更贴近，有利于学习和理解`python`,而`uv`则是一款新型的工具,它代表者一种全新的思维方式,它将包管理、虚拟环境、Python版本管理、工具管理等功能集合到一个命令行工具中,并且它还提供了极速的依赖解析、全局缓存、并行化解析等特性，至于`poetry`，它和`uv`一样都是新的思维采用了`pyproject.toml`作为配置文件，所以没必要了解过多重复内容，当你因为一个项目接触到时，只需要简单了解即可快速上手。

当你开始学习本实验室相关的AI项目时，那么你就可以开始学习`conda`的项目管理了，因为`conda`可以管理非 Python 依赖，并且它是跨平台的，适合科学计算与二进制包，对于一些需要`c/c++`加速的库来说，`conda`是最好的选择，并且`conda`不仅仅支持于`python`的开发项目，对于一些主流语言都具备完成的项目管理流程。

通过这样一步一步的了解和学习，你才能不受限于工具本身的限制，在学习中不被工具本身困扰，在实践中游刃有余。

> 本文和git于shell篇不同，本文主要由AI撰写，文章比较死板，所以建议多看看文章中链接的官方文档。
>> 作为一名计算机学习者，学会根据不同场景选择合适的工具至关重要，它能够显著提升工作效率。同时，强大的搜索能力和文档阅读技巧也极为重要。


## 实用最佳实践（适用于所有工具）
- 将依赖区分为运行时依赖和开发依赖（例如：test、lint、type-check 工具）。Poetry/conda 都支持分组，pip 可用 requirements-dev.txt。
- 在 CI 中优先使用明确的 Python 版本与镜像（例如 `python:3.10-slim`）。
- 把虚拟环境放在 .venv（项目内）并加入 .gitignore；这样更易于管理与激活。
- 使用私有镜像或内部索引来加速企业内部包安装。国内用户可配置 PyPI 镜像（如清华、阿里云镜像）。
- 定期更新依赖并在 CI 中运行安全扫描（如 pip-audit、safety、Bandit）。

示例 .gitignore（最小）:
```
.venv/
__pycache__/
*.pyc
dist/
build/
*.egg-info
```

CI 示例（GitHub Actions 简要片段，用 poetry）:
```yaml
jobs:
	test:
		runs-on: ubuntu-latest
		steps:
			- uses: actions/checkout@v4
			- name: Set up Python
				uses: actions/setup-python@v4
				with:
					python-version: '3.10'
			- name: Install Poetry
				run: curl -sSL https://install.python-poetry.org | python -
			- name: Install dependencies
				run: poetry install
			- name: Run tests
				run: poetry run pytest -q
```

---

## 进阶话题与迁移建议
- 从 requirements.txt 迁移到 Poetry：逐步迁移，先在新分支中用 `poetry init`，手动把依赖填入 `pyproject.toml`，使用 `poetry lock` 生成锁文件，CI 中采用 `poetry install --no-dev` 进行生产部署。
- 在需要大量二进制包的项目中，优先使用 Conda（或 mamba）创建运行环境，将 Python 源代码与依赖的二进制组件分开管理。
- 对于包的发布与版本策略，推荐语义化版本（SemVer），并在 CI 中加入自动发布的保护（tag、签名、审核）。

---

## 常用命令速查表
- 创建 venv: `python -m venv .venv`
- 激活（Windows PowerShell）: `.\.venv\Scripts\Activate.ps1`
- 导出 requirements: `pip freeze > requirements.txt`
- Conda 导出: `conda env export --no-builds > environment.yml`

---

## 参考与延伸阅读
- pip 官方文档: https://pip.pypa.io/
- Python Packaging User Guide: https://packaging.python.org/
- Poetry: https://python-poetry.org/
- Conda: https://docs.conda.io/
- uv: https://github.com/astral-sh/uv
- conda 还有很多衍生，如 [conda-forge](https://conda-forge.org/) 镜像，[mamba](https://github.com/mamba-org/mamba) 与 [micromamba](https://github.com/mamba-org/micromamba) 更快速的包管理器。
