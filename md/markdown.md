---
title: Markdown 快速入门
tags: ["计算机基础"]
---
# Markdown 快速入门

Markdown 是一种轻量级标记语言，它允许人们使用易读易写的纯文本格式编写文档，然后转换成有效的 HTML 文档。Markdown 的语法简洁，学习起来也很容易.

> 这是一篇面向新加入实验室的同学撰写的计算机常用工具入门教程之Markdown.

在计算机以及互联网领域的从业者的学习和工作中，无论是前端还是后端工程Markdown都是必备的工具。本文将介绍 Markdown 的基本语法，并通过实例介绍 Markdown 的常用功能.

## 1.Markdown 于 HTML 的区别

MD和HTML都是标记语言，本质我认为没有什么区别，都是特定的标记符号来标记文本的结构和格式，并且我们一般所看到的MD文档都是经过渲染后的HTML文档.

MD的语法更加简单，更加易读易写，并且可以直接转换成HTML，所以在写MD文档的时候，我们可以更加专注于内容的创作，而且MD到HTML的转换过程相对简单，如果有兴趣可以自己尝试使用`Python` ,`CPP` 等语言的标准库实现一个简单的`MD编译器`.


## 2.Markdown 文字语法

#### 1. 标题

```
# 一级标题
## 二级标题
### 三级标题
#### 四级标题
##### 五级标题
###### 六级标题
```

#### 2. 强调

```
*斜体*
_斜体_
**粗体**
__粗体__
```
>  *斜体*、_斜体_、**粗体**、__粗体__

#### 3. 引用

```
> 这是一个引用
```
>  这是一个引用
#### 4. 列表
 - 无序列列表
```
- 列表1
- 列表2
- 列表3
```
- 有序列表
``` 
2. 列表1
3. 列表2
4. 列表3
```
- 嵌套列表
```
- 列表1
  - 列表1.2
- 列表2
  - 列表2.1
      - 列表2.1.1
  - 列表2.2
      - 列表2.2.1
```
>  - 无序列列表
>   - 列表1
>   - 列表2
>   - 列表3
#### 5. `\` 转义字符

- 反斜杠`\`用来转义Markdown语法中的特殊字符，比如`\*`表示星号，`\|`表示竖线等。
- 示例：
```
\*斜体\*
```
**效果**: \*斜体\*

## 3. Markdown 文件与链接语法

#### 1. 链接
- 行内式：
```
[链接名称](链接地址)
[eastaihub.cloud](https://eastaihub.cloud/)
```
>  [eastaihub.cloud](https://eastaihub.cloud/)
- 参考式：
```
[链接名称][1]

 [1]: 链接地址
```
#### 2. 图片
- 行内式：
```
![图片名称](图片地址)
```
- 参考式：
```
![图片名称][2]

[2]: 图片地址 "可选的标题文字"
```
#### 3. 代码块
- 行内式：
```
`代码内容`
```
- 代码块：
```
``` 代码语言
代码内容

```cpp
#include <iostream>

int main() {
    std::cout << "Hello, world!" << std::endl;
    return 0;
}


```python
print("Hello, world!")
```

```
```
```

```python
print("Hello, world!")
```
```cpp
#include <iostream>

int main() {
    std::cout << "Hello, world!" << std::endl;
    return 0;
}
```

## 4.工具推荐
- [Typora](https://typoraio.cn/)
> 商业软件（非开源）,全网目前风评较高的MD编辑器
- [VS Code](https://code.visualstudio.com/)
> 免费开源的编辑器，支持MD语法高亮，插件丰富，功能强大,*推荐使用*,并且推荐一个MD插件[markdown-preview-enhanced](https://marketplace.visualstudio.com/items?itemName=shd101wyy.markdown-preview-enhanced),这个插件支持xaringan、reveal.js、markdown-it等多种渲染方式，可以很方便地将MD文件渲染成HTML、PDF、PPT等格式,并且用起来比一些商业软件更加顺手,并且比其它部分启动更快,但是不支持所见即所得的预览模式.


> 大家可以使用 [commonmark.org](https://commonmark.org/help/)10分钟快速入门Markdown语法