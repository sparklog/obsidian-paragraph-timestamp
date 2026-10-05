import { moment, Plugin } from "obsidian";
import { paragraphTimestamp } from "./timestamp";
import {
	DEFAULT_SETTINGS,
	ParagraphTimestampSettingTab,
} from "./settings";
import type { ParagraphTimestampSettings } from "./settings";

export default class ParagraphTimestampPlugin extends Plugin {
	settings: ParagraphTimestampSettings = { ...DEFAULT_SETTINGS };

	async onload(): Promise<void> {
		await this.loadSettings();

		// The provider is evaluated on every insertion, so changing the
		// settings takes effect immediately without reconfiguring the editor.
		this.registerEditorExtension(
			paragraphTimestamp({
				getStamp: () => this.buildTimestamp(),
			})
		);

		this.addCommand({
			id: "insert-paragraph-timestamp",
			name: "在当前段落开头插入时间戳",
			editorCallback: (editor) => {
				const stamp = this.buildTimestamp();
				const cursor = editor.getCursor();
				editor.replaceRange(stamp, { line: cursor.line, ch: 0 });
				editor.setCursor({
					line: cursor.line,
					ch: cursor.ch + stamp.length,
				});
			},
		});

		this.addSettingTab(new ParagraphTimestampSettingTab(this.app, this));
	}

	/** Builds the text to insert, honouring the current settings. */
	buildTimestamp(): string {
		const time = moment().format(this.settings.timeFormat);
		return this.settings.addTrailingSpace ? `${time} ` : time;
	}

	async loadSettings(): Promise<void> {
		this.settings = Object.assign({}, DEFAULT_SETTINGS, await this.loadData());
	}

	async saveSettings(): Promise<void> {
		await this.saveData(this.settings);
	}
}
