import { PluginSettingTab, Setting } from "obsidian";
import type { App } from "obsidian";
import type ParagraphTimestampPlugin from "./main";

export interface ParagraphTimestampSettings {
	/** moment.js format string used to render the timestamp. */
	timeFormat: string;
	/** Whether to append a space after the timestamp. */
	addTrailingSpace: boolean;
}

export const DEFAULT_SETTINGS: ParagraphTimestampSettings = {
	timeFormat: "HH:mm",
	addTrailingSpace: true,
};

export class ParagraphTimestampSettingTab extends PluginSettingTab {
	private readonly plugin: ParagraphTimestampPlugin;

	constructor(app: App, plugin: ParagraphTimestampPlugin) {
		super(app, plugin);
		this.plugin = plugin;
	}

	display(): void {
		const { containerEl } = this;
		containerEl.empty();

		new Setting(containerEl)
			.setName("时间格式")
			.setDesc("moment.js 格式字符串，例如 HH:mm 会生成 15:40。")
			.addText((text) =>
				text
					.setPlaceholder("HH:mm")
					.setValue(this.plugin.settings.timeFormat)
					.onChange(async (value) => {
						this.plugin.settings.timeFormat = value.trim() || "HH:mm";
						await this.plugin.saveSettings();
					})
			);

		new Setting(containerEl)
			.setName("时间戳后添加空格")
			.setDesc("在时间戳后插入一个空格，光标停在该空格之后。")
			.addToggle((toggle) =>
				toggle
					.setValue(this.plugin.settings.addTrailingSpace)
					.onChange(async (value) => {
						this.plugin.settings.addTrailingSpace = value;
						await this.plugin.saveSettings();
					})
			);
	}
}
