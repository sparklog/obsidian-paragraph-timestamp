# Paragraph Timestamp

An Obsidian plugin that **automatically inserts a timestamp** (by default the inline code `` `15:40` `` followed by a space) **at the start of every new paragraph** in a Markdown note, then places the cursor after the trailing space.

It follows Markdown paragraph semantics strictly: **a soft line break is *not* a new paragraph** — only a blank line starts one.

> 🌐 [中文](./README.md) | **English**

---

## Features

- ⏱️ Automatically inserts a timestamp such as `` `15:40` `` followed by a space when you start a new paragraph.
- 🖱️ Leaves the cursor after the space following the timestamp, so you can keep typing: `` `15:40` your content``.
- 📄 Only inserts at the start of a **logical Markdown paragraph**; a single line break (soft break) never triggers it.
- ⚙️ Configurable time format (powered by moment.js, e.g. `HH:mm`, `HH:mm:ss`, `YYYY-MM-DD HH:mm`).
- 🏷️ Switchable timestamp style: inline code wrapped in backticks by default (`` `15:40` ``), or plain text (`15:40 `).
- 🧩 Includes a manual command to add a timestamp to any paragraph.
- 🧪 Core logic is covered by unit tests; type-checking and bundling are included.

---

## How it behaves (important)

In Markdown:

- A newline inside a paragraph (a soft break, i.e. pressing `Enter` once) is **not** a new paragraph.
- Only a **blank line** (pressing `Enter` twice, i.e. `Enter` + `Enter`) starts a new paragraph.

So the plugin behaves like this:

| Action | Result |
| --- | --- |
| Type text, then press `Enter` once | Soft line break — **no** timestamp |
| Press `Enter` again (creates a blank line) | New paragraph — **timestamp inserted** (`` `15:40` `` plus a space) |
| Press `Enter` in a brand-new empty note | **Timestamp inserted** as well (`` `15:40` `` plus a space) |
| Start typing at the beginning of a blank paragraph line | Same new paragraph; use the manual command to add a timestamp |

> Note: In Obsidian's Reading view a single line break may *look* like a new paragraph (depending on the "Strict line breaks" setting), but the plugin judges by real Markdown semantics and only inserts a timestamp after a blank-line paragraph break.

To keep the timestamp from sticking to existing text, the plugin only inserts automatically in "safe" positions:

- the new paragraph is at the **end of the note**; or
- the new paragraph is **followed by another blank line**.

For any other position (for example, forcing a blank line in front of existing text), use the manual command.

---

## Installation

### Option 1: Manual install (recommended for local use)

1. Download or build `main.js` and `manifest.json` (see "Development" below).
2. Create this folder inside your Obsidian vault:
   ```
   <your vault>/.obsidian/plugins/paragraph-timestamp/
   ```
3. Put `main.js` and `manifest.json` into that folder.
4. Open Obsidian → Settings → Community plugins → turn off "Restricted mode" (skip if already off).
5. Find **Paragraph Timestamp** in the "Installed plugins" list and enable it.

### Option 2: Install with BRAT (after publishing on GitHub)

1. Install and enable the [BRAT](https://github.com/TfTHacker/obsidian42-brat) plugin.
2. In BRAT click **Add Beta plugin** and enter this repository URL:
   ```
   https://github.com/sparklog/obsidian-paragraph-timestamp
   ```
3. Enable **Paragraph Timestamp**.

### Option 3: Build from source

```bash
git clone https://github.com/sparklog/obsidian-paragraph-timestamp.git
cd obsidian-paragraph-timestamp
npm install
npm run build        # produces main.js
```

Then copy the whole repository folder (or just `main.js` + `manifest.json`) into your vault's plugin folder, or during development symlink the repository to:

```
<your vault>/.obsidian/plugins/paragraph-timestamp
```

While developing, run `npm run dev` to watch for file changes and rebuild automatically.

---

## Usage

1. Create or open a Markdown note.
2. Write the first paragraph normally.
3. To give the next paragraph a timestamp, press `Enter` twice. You will get:
   ```
   `15:40` 
   ```
   The cursor sits after the trailing space; just keep typing:
   ```
   `15:40` This is the new paragraph.
   ```
4. Repeat to timestamp every following paragraph automatically.

### Command

Open the command palette (`Ctrl/Cmd + P`) and search for **"Insert paragraph timestamp at line start"** to add a timestamp manually at the start of the current line (the cursor keeps its relative position). Useful for mid-note insertions or when editing content pasted from elsewhere.

---

## Settings

Open Obsidian → Settings → **Paragraph Timestamp**:

| Setting | Default | Description |
| --- | --- | --- |
| Time format | `HH:mm` | A moment.js format string. For example `HH:mm` → `15:40`, `HH:mm:ss` → `15:40:05`, `YYYY-MM-DD HH:mm` → `2025-01-01 15:40`. |
| Timestamp style | Inline code | `Inline code` wraps only the timestamp in backticks and renders as `` `15:40` `` (the space goes after the backticks); `Plain text` inserts `15:40 ` directly. |
| Add space after timestamp | On | Whether to insert a space after the timestamp (after the closing backtick in inline-code style). When off, only the timestamp itself is inserted. |

---

## Development

```bash
npm install      # install dependencies
npm run dev      # watch and bundle (development mode, with sourcemaps)
npm test         # run unit tests (Node's built-in test runner)
npm run build    # type-check + production bundle, outputs main.js
```

### Project structure

```
.
├── src/
│   ├── main.ts        # Plugin entry: editor extension, command, settings tab
│   ├── timestamp.ts   # Core: new-paragraph detection + auto-insert CodeMirror extension
│   ├── format.ts      # Builds the inserted text according to settings (plain / inline code)
│   └── settings.ts    # Settings shape and settings UI
├── test/
│   └── timestamp.test.ts
├── manifest.json      # Obsidian plugin manifest
├── versions.json
├── esbuild.config.mjs
├── tsconfig.json
└── main.js            # Build artifact (not tracked by git)
```

### Implementation notes

- Auto-insertion is implemented with a CodeMirror 6 `EditorState.transactionFilter`: the timestamp and the newline that created the paragraph break are part of the **same transaction**, so undo (`Ctrl/Cmd + Z`) reverts everything at once and no nested transaction is dispatched.
- Paragraph detection rules (see `isNewParagraphStart` in `src/timestamp.ts`):
  1. the cursor is at the start of a line;
  2. the current line is empty;
  3. the previous line is blank (a real Markdown paragraph break);
  4. it is a safe position (end of note, or the following line is blank as well).
- The timestamp text is fetched from a provider at insertion time, so changing the settings takes effect **without reloading**.

---

## Known limitations

- Only triggers on paragraphs that follow Markdown paragraph semantics (separated by a blank line); a single line break never inserts.
- For safety, automatic insertion only happens at the end of the note or when another blank line follows. Use the manual command elsewhere.
- Inside code blocks, blockquotes, and similar structures, the blank-line rule still applies; there is no extra syntax-specific exclusion yet.

---

## License

[MIT](./LICENSE)
