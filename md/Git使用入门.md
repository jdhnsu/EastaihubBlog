---
title: Git版本控制核心原理与操作指南
date: 2025-10-11 11:02:53
tags: ["计算机基础"]
cover: https://miro.medium.com/v2/resize:fit:932/0*19RL32QnfLdva1Fa.png
top_img: https://miro.medium.com/v2/resize:fit:932/0*19RL32QnfLdva1Fa.png
updated: 2025-10-11 11:02:53
---

# Git的模型与基础操作

> 这是一篇面向新加入实验室的同学撰写的计算机常用工具入门教程之Git。作为一名计算机学习者，学会根据不同场景选择合适的工具至关重要，它能够显著提升工作效率。同时，强大的搜索能力和文档阅读技巧也极为重要。

Git是一款版本控制工具，这类工具主要用于追踪源代码、文件或文件夹的变化。使用Git可以轻松地对代码进行回溯等操作。特别是在团队协作中，Git尤为便捷：每位贡献者的代码都能被打上标签并保存其个人信息，便于后续的代码管理。此外，由于Git采用分布式架构，每位开发人员均可在本地完整存储源代码副本。不仅如此，Git还集成了分支管理和冲突解决方案等多项功能。

## 快照

如同一台相机，Git能够捕捉到当前项目的整体状态（涵盖所有文件夹及子目录），生成一份详尽的“照片”。一旦需要查看历史记录中的某个特定时刻的状态，只需定位至相应的快照即可获取当时完整的项目视图，其中包括了具体的作者信息与提交详情。为了高效利用空间资源，针对未曾变动过的数据部分，则通过指针机制直接指向先前版本的数据块来实现节约大量存储的目的。

---

**在git的专业术语中**: 文件被称为blob，文件夹被称为tree。

### 例如:

```bash
<root> (tree)
|
+- foo (tree)
|  |
|  + bar.txt (blob, contents = "hello world")
|
+- baz.txt (blob, contents = "git is wonderful")
```

这个树包含了两个元素，一个名为 “foo” 的树（它本身包含了一个 blob 对象 “bar.txt”），以及一个 blob 对象 “baz.txt”。

## 历史记录

Git的历史记录是基于快照构建的，相当于一组按时间排列的照片。每一次提交都是一张照片，包含了项目的完整状态，包括所有文件及其内容。通过查看历史记录，可以了解项目的演变过程，以及每个版本的具体修改内容。

---

**在git的专业术语中**: 提交被称为commit，它包含一个唯一的标识符（commit hash），以及一个指向父提交（parent commit）的指针。历__史记录是由快照组成的有向无环图。

在 Git 中，这些快照被称为“提交”。通过可视化的方式来表示这些历史提交记录时，看起来差不多是这样的：

```bash
o <-- o <-- o <-- o
            ^
             \
              --- o <-- o
```

箭头指向了当前提交的父辈（这是一种“在…之前”，而不是“在…之后”的关系）。在第三次提交之后，历史记录分岔成了两条独立的分支。这可能因为此时需要同时开发两个不同的特性，它们之间是相互独立的。开发完成后，这些分支可能会被合并并创建一个新的提交，这个新的提交会同时包含这些特性。新的提交会创建一个新的历史记录，看上去像这样（最新的合并提交用粗体标记）：

```bash
o <-- o <-- o <-- o <----  o 
            ^            /
             \          v
              --- o <-- o
```

注：Git 中的提交是不可改变的。但这并不代表错误不能被修改，只不过这种“修改”实际上是创建了一个全新的提交记录。

## 数据模型及其伪代码表示

以伪代码的形式来学习 Git 的数据模型，可能更加清晰：

```python
// 文件就是一组数据
type blob = array<byte>

// 一个包含文件和目录的目录
type tree = map<string, tree | blob>

// 每个提交都包含一个父辈，元数据和顶层树
type commit = struct {
    parents: array<commit>
    author: string
    message: string
    snapshot: tree
}
```

这是一种简洁的历史模型。

Git 中的对象可以是 blob、树或提交：

```
type object = blob | tree | commit
```

Git 在储存数据时，所有的对象都会基于它们的 [SHA-1 哈希](https://en.wikipedia.org/wiki/SHA-1) 进行寻址。

```
objects = map<string, object>

def store(object):
    id = sha1(object)
    objects[id] = object

def load(id):
    return objects[id]
```

Blobs、树和提交都一样，它们都是对象。当它们引用其他对象时，它们并没有真正的在硬盘上保存这些对象，而是仅仅保存了它们的哈希值作为引用。

例如，[上面](#snapshots) 例子中的树（可以通过 `git cat-file -p 698281bc680d1995c5f4caaf3359721a5a58d48d` 来进行可视化），看上去是这样的：

```
100644 blob 4448adbf7ecd394f42ae135bbeed9676e894af85    baz.txt
040000 tree c68d233a33c5c06e0340e4c224f0afca87c8ce87    foo
```

树本身会包含一些指向其他内容的指针，例如 `baz.txt` (blob) 和 `foo`
(树)。如果我们用 `git cat-file -p 4448adbf7ecd394f42ae135bbeed9676e894af85`，即通过哈希值查看 baz.txt 的内容，会得到以下信息：

```
git is wonderful
```

## 引用

现在，所有的快照都可以通过它们的 SHA-1 哈希值来标记了。但这也太不方便了，谁也记不住一串 40 位的十六进制字符。

针对这一问题，Git 的解决方法是给这些哈希值赋予人类可读的名字，也就是引用（references）。引用是指向提交的指针。与对象不同的是，它是可变的（引用可以被更新，指向新的提交）。例如，`master` 引用通常会指向主分支的最新一次提交。

```
references = map<string, string>

def update_reference(name, id):
    references[name] = id

def read_reference(name):
    return references[name]

def load_reference(name_or_id):
    if name_or_id in references:
        return load(references[name_or_id])
    else:
        return load(name_or_id)
```

这样，Git 就可以使用诸如 "master" 这样人类可读的名称来表示历史记录中某个特定的提交，而不需要在使用一长串十六进制字符了。

有一个细节需要我们注意， 通常情况下，我们会想要知道“我们当前所在位置”，并将其标记下来。这样当我们创建新的快照的时候，我们就可以知道它的相对位置（如何设置它的“父辈”）。在 Git 中，我们当前的位置有一个特殊的索引，它就是 "HEAD"。

## 仓库

最后，我们可以粗略地给出 Git 仓库的定义了：`对象` 和 `引用`。

在硬盘上，Git 仅存储对象和引用：因为其数据模型仅包含这些东西。所有的 `git` 命令都对应着对提交树的操作，例如增加对象，增加或删除引用。

当您输入某个指令时，请思考一下这条命令是如何对底层的图数据结构进行操作的。另一方面，如果您希望修改提交树，例如“丢弃未提交的修改和将 ‘master’ 引用指向提交 `5d83f9e` 时，有什么命令可以完成该操作（针对这个具体问题，您可以使用 `git checkout master; git reset --hard 5d83f9e`）

## 暂存区

Git 中还包括一个和数据模型完全不相关的概念，但它确是创建提交的接口的一部分。

就上面介绍的快照系统来说，您也许会期望它的实现里包括一个 “创建快照” 的命令，该命令能够基于当前工作目录的当前状态创建一个全新的快照。有些版本控制系统确实是这样工作的，但 Git 不是。我们希望简洁的快照，而且每次从当前状态创建快照可能效果并不理想。例如，考虑如下场景，您开发了两个独立的特性，然后您希望创建两个独立的提交，其中第一个提交仅包含第一个特性，而第二个提交仅包含第二个特性。或者，假设您在调试代码时添加了很多打印语句，然后您仅仅希望提交和修复 bug 相关的代码而丢弃所有的打印语句。

Git 处理这些场景的方法是使用一种叫做 “暂存区（staging area）”的机制，它允许您指定下次快照中要包括那些改动。

## Git 安装与使用

### 安装

#### 命令行版本

- Windows:
  
  - 直接下载安装文件
    [Git for Windows](https://git-scm.com/download/win)
  - Winget 安装 `winget install git.git`
  - Chocolatey 安装 `choco install git`
  - scoop 安装 `scoop install git`
- linux:
  
  - Debian/Ubuntu: `sudo apt-get install git`
  - Fedora/CentOS/RHEL: `sudo yum install git` or `sudo dnf install git`
  - Arch Linux: `sudo pacman -S git`
  - openSUSE: `sudo zypper install git`
- macOS: `brew install git`

安装后检测是否安装成功：`git --version`
![alt text](./img/git/image_1.png)

#### GUI版本

- [GitHub Desktop](https://desktop.github.com/)
- [GitKraken](https://www.gitkraken.com/)

> 当然我依然推荐先使用好命令行版本，再使用 GUI版本。一些代码编辑器和IDE都内置了一些Git插件也可以免去命令行的使用，但是只有首先理解了Git的基本概念和命令，才能更好地使用这些工具。

### Git 初始配置

- `git config --global user.name "your name"`: 设置用户名
- `git config --global user.email "your email"`: 设置用户邮箱
- 添加Github SSH key到SSH agent: `ssh-keygen -t ed25519 -C "your email"` 然后复制生成的公钥到Github的SSH key中。（可选）

```1.
2. 在边栏的“Access”部分中，单击 “SSH and GPG keys”
3. 单击“新建 SSH 密钥”或“添加 SSH 密钥” 。
4. 在 "Title"（标题）字段中，为新密钥添加描述性标签。 例如，如果使用的是个人笔记本电脑，则可以将此密钥称为“个人笔记本电脑”。
5. 在“密钥”字段中，粘贴公钥。
6. 单击“添加 SSH 密钥”。
```

![1760152030554](images/Git使用入门/1760152030554.png)

### Git 命令

- `git help <command>`: 获取 git 命令的帮助信息
- `git init`: 创建一个新的 git 仓库，其数据会存放在一个名为 `.git` 的目录下
- `git status`: 显示当前的仓库状态
- `git add <filename>`: 添加文件到暂存区
- `git commit`: 创建一个新的提交
  - 如何编写 [良好的提交信息](https://tbaggery.com/2008/04/19/a-note-about-git-commit-messages.html)!
  - 为何要 [编写良好的提交信息](https://chris.beams.io/posts/git-commit/)
- `git log`: 显示历史日志
- `git log --all --graph --decorate`: 可视化历史记录（有向无环图）
- `git diff <filename>`: 显示与暂存区文件的差异
- `git diff <revision> <filename>`: 显示某个文件两个版本之间的差异
- `git checkout <revision>`: 更新 HEAD（如果是检出分支则同时更新当前分支）

## 分支和合并

- `git branch`: 显示分支
- `git branch <name>`: 创建分支
- `git checkout -b <name>`: 创建分支并切换到该分支
  - 相当于 `git branch <name>; git checkout <name>`
- `git merge <revision>`: 合并到当前分支
- `git mergetool`: 使用工具来处理合并冲突
- `git rebase`: 将一系列补丁变基（rebase）为新的基线

## 远端操作

- `git remote`: 列出远端
- `git remote add <name> <url>`: 添加一个远端
- `git push <remote> <local branch>:<remote branch>`: 将对象传送至远端并更新远端引用
- `git branch --set-upstream-to=<remote>/<remote branch>`: 创建本地和远端分支的关联关系
- `git fetch`: 从远端获取对象/索引
- `git pull`: 相当于 `git fetch; git merge`
- `git clone`: 从远端下载仓库 (这是下载代码的主要方式也是最常用的命令之一)
  ![1760152289709](images/Git使用入门/1760152289709.png)
  复制这个链接使用`git clone https://github.com/Jdhggg/hello-algo.git` 即可下载仓库文件到当前目录

  当然也可以下载到指定目录下，例如`git clone https://github.com/Jdhggg/hello-algo.git ~/Documents/hello-algo`

## 撤销

- `git commit --amend`: 编辑提交的内容或信息
- `git reset HEAD <file>`: 恢复暂存的文件
- `git checkout -- <file>`: 丢弃修改
- `git restore`: git2.32 版本后取代 git reset 进行许多撤销操作

# Git 高级操作

- `git config`: Git 是一个 [高度可定制的](https://git-scm.com/docs/git-config) 工具
- `git clone --depth=1`: 浅克隆（shallow clone），不包括完整的版本历史信息
- `git add -p`: 交互式暂存
- `git rebase -i`: 交互式变基
- `git blame`: 查看最后修改某行的人
- `git stash`: 暂时移除工作目录下的修改内容
- `git bisect`: 通过二分查找搜索历史记录
- `.gitignore`: [指定](https://git-scm.com/docs/gitignore) 故意不追踪的文件