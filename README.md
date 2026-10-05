# OpenVim（中文翻译版）

Vim 的交互式教程。原项目：[egaga/openvim](https://github.com/egaga/openvim)，原版网站在 [openvim.com](https://openvim.com/)，MIT 许可。

这个 fork 把教程、界面和上下文帮助翻译成了中文，纯前端，没有引入任何构建步骤或依赖：

- 教程正文、章节名、操作提示、状态栏、命令速查表都是中文
- 练习用的文本（演示行、沙盒里的段落）保持英文：w、e、b 这类按单词移动的命令，只在有空格分隔的文本上才有意义
- HTML 语言标记改为 `zh-CN`，编辑器里 `document.js` 会给全角字符加 `cjk` 类，CSS 按实际字形宽度排布，避免中文字符重叠

本地预览：任意静态服务器指向仓库根目录即可，例如 `python -m http.server 8000`，然后打开 http://localhost:8000/ 。

和上游同步：翻译只改了 HTML 页面、教程文本、界面字符串和 `document.js` 的字符渲染，引擎逻辑没动，`git merge upstream/master` 的冲突范围有限。

---

## 原 README

Interactive tutorial for Vim. Initial version created and published in 2011.

## What is OpenVim?

OpenVim is a web-based project to let people quickly have a taste what kind of an editor Vim is.
Vim is considered to be very useful but can feel devastatingly opaque at first. Hopefully this tutorial makes people feel more comfortable to give it a chance.

OpenVim is based on a custom engine that interprets vim commands. 
Fun fact: the engine operates directly on the dom but could be easily refactored to a model that is not view-dependent.

## How to help?

If you want to help with actual code, look at the existing GitHub issues. Especially keybindings are hard for me to get right in different environments.

## License

MIT License.

## Contact

henrik.huttunen@gmail.com
