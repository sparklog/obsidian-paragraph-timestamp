# Paragraph Timestamp

一个 Obsidian 插件：在 Markdown 文档中，**每当你开始一个新的段落时，自动在段首插入时间戳**（例如 `15:40 `），并把光标停在时间戳后面的空格之后。

它严格遵循 Markdown 的段落语义：**软换行不算新段落**，只有空行分隔出的才是新段落。

> 🌐 **中文** | [English](./README_EN.md)

---

## 功能特性

- ⏱️ 开始新段落时自动插入时间戳，形如 `15:40 `。
- 🖱️ 插入后光标停在时间戳与后面空格之后，直接输入正文即可：`15:40 你的内容`。
- 📄 仅在 **Markdown 逻辑上的新段落** 段首插入；单个换行（软换行）不会插入。
- ⚙️ 时间格式可自定义（基于 moment.js，例如 `HH:mm`、`HH:mm:ss`、`YYYY-MM-DD HH:mm`）。
- 🧩 附带手动命令，可在任意段落开头补插时间戳。
- 🧪 核心逻辑带有单元测试，类型检查 + 打包流程随附。

---

## 行为说明（重点）

在 Markdown 中：

- 段落内换行（软换行，只输入一次回车 `Enter`）**不是**新段落；
- 只有 **空行**（连续两次回车，即 `Enter` + `Enter`）才会分隔出新的段落。

因此插件的行为是：

| 操作 | 结果 |
| --- | --- |
| 输入一段文字后按一次 `Enter` | 软换行，**不插入**时间戳 |
| 再按一次 `Enter`（产生空行） | 进入新段落，**自动插入** `15:40 ` |
| 在空行段首直接开始输入 | 属于同一个新段落，可用手动命令补插 |

> 注意：Obsidian 阅读视图里，单个换行可能看起来也像新段落（取决于「严格换行」设置），但插件按 Markdown 的真实语义判断，只在空行分隔出的新段落插入时间戳。

为避免时间戳与已有文字粘连，插件只在“安全位置”自动插入：

- 新段落位于**文末**；或
- 新段落后面**还有一个空行**。

其它位置（例如在已有文字之前强行插入空行）请使用手动命令。

---

## 安装方法

### 方式一：手动安装（推荐用于本地使用）

1. 下载或构建得到 `main.js` 与 `manifest.json`（见下方「开发」）。
2. 在你的 Obsidian 库（Vault）中创建目录：
   ```
   <你的库>/.obsidian/plugins/paragraph-timestamp/
   ```
3. 将 `main.js` 和 `manifest.json` 放入该目录。
4. 打开 Obsidian → 设置 → 第三方插件（Community plugins）→ 关闭「安全模式」（如已关闭则忽略）。
5. 在「已安装插件」列表中找到 **Paragraph Timestamp**，点击启用。

### 方式二：使用 BRAT 安装（适用于 GitHub 发布后）

1. 安装并启用 [BRAT](https://github.com/TfTHacker/obsidian42-brat) 插件。
2. 在 BRAT 中点击 **Add Beta plugin**，填入本仓库地址：
   ```
   https://github.com/sparklog/obsidian-paragraph-timestamp
   ```
3. 启用 **Paragraph Timestamp**。

### 方式三：从源码开发安装

```bash
git clone https://github.com/sparklog/obsidian-paragraph-timestamp.git
cd obsidian-paragraph-timestamp
npm install
npm run build        # 生成 main.js
```

然后把整个仓库目录（或 `main.js` + `manifest.json`）复制到库的插件目录，或在开发时直接把仓库软链到：

```
<你的库>/.obsidian/plugins/paragraph-timestamp
```

开发时可用 `npm run dev` 监听文件变化自动重新打包。

---

## 使用方法

1. 新建或打开一个 Markdown 笔记。
2. 正常书写第一段内容。
3. 想让下一段带上时间戳时，连续按两次 `Enter`，此时会自动得到：
   ```
   15:40 
   ```
   光标就停在末尾空格之后，接着输入内容即可：
   ```
   15:40 这是新段落的内容
   ```
4. 重复此操作，即可为后续每个段落自动加上时间戳。

### 命令

在命令面板（`Ctrl/Cmd + P`）中搜索 **“在当前段落开头插入时间戳”**，即可在当前光标所在行的开头手动插入时间戳（光标相对位置保持不变）。适合中段插入或用剪贴板等方式编辑后再补时间戳。

---

## 设置

打开 Obsidian → 设置 → **Paragraph Timestamp**：

| 设置项 | 默认值 | 说明 |
| --- | --- | --- |
| 时间格式 | `HH:mm` | moment.js 格式字符串。例如 `HH:mm` → `15:40`，`HH:mm:ss` → `15:40:05`，`YYYY-MM-DD HH:mm` → `2025-01-01 15:40`。 |
| 时间戳后添加空格 | 开启 | 是否在时间戳后插入一个空格。关闭后只插入时间戳本身。 |

---

## 开发

```bash
npm install      # 安装依赖
npm run dev      # 监听并打包（开发模式，含 sourcemap）
npm test         # 运行单元测试（Node 内置 test runner）
npm run build    # 类型检查 + 生产打包，输出 main.js
```

### 目录结构

```
.
├── src/
│   ├── main.ts        # 插件入口：注册编辑器扩展、命令、设置页
│   ├── timestamp.ts   # 核心：判断新段落 + 自动插入时间戳的 CodeMirror 扩展
│   └── settings.ts    # 设置数据结构与设置界面
├── test/
│   └── timestamp.test.ts
├── manifest.json      # Obsidian 插件清单
├── versions.json
├── esbuild.config.mjs
├── tsconfig.json
└── main.js            # 构建产物（不纳入版本管理）
```

### 实现要点

- 使用 **CodeMirror 6** 的 `EditorState.transactionFilter` 实现自动插入：时间戳与产生段落断开的换行属于**同一个事务**，因此撤销（`Ctrl/Cmd + Z`）会一次性还原，也不会触发嵌套事务。
- 段落判断规则（见 `src/timestamp.ts` 的 `isNewParagraphStart`）：
  1. 光标位于行首；
  2. 当前行为空行；
  3. 上一行为空行（即存在 Markdown 段落分隔）；
  4. 处于安全位置（文末或下一行同样为空行）；
  5. 文档此前确实有内容。
- 时间戳文本通过一个 provider 在插入时实时获取，因此修改设置后**无需重载**即可生效。

---

## 已知限制

- 只对符合 Markdown 段落语义（空行分隔）的新段落生效；单换行不会插入。
- 为安全起见，自动插入只在文末或“后面还有空行”的位置进行；其它位置请用命令面板中的手动命令。
- 在代码块、引用块等特殊结构中同样按空行规则判断，暂未针对语法做额外排除。

---

## License

[MIT](./LICENSE)
