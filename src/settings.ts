import { PluginSettingTab, Setting } from "obsidian";
import type { App } from "obsidian";
import type ParagraphTimestampPlugin from "./main";

export type TimestampStyle = "plain" | "code";

export interface ParagraphTimestampSettings {
	/** moment.js format string used to render the timestamp. */
	timeFormat: string;
	/** Whether to append a space after the timestamp. */
	addTrailingSpace: boolean;
	/** How the timestamp is rendered in the note. */
	style: TimestampStyle;
}

export const DEFAULT_SETTINGS: ParagraphTimestampSettings = {
	timeFormat: "HH:mm",
	addTrailingSpace: true,
	style: "code",
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
			.setName("时间戳样式")
			.setDesc("普通文本，或用反引号包裹为行内代码。")
			.addDropdown((dropdown) =>
				dropdown
					.addOption("code", "行内代码 `15:40 `")
					.addOption("plain", "普通文本 15:40")
					.setValue(this.plugin.settings.style)
					.onChange(async (value) => {
						this.plugin.settings.style = value as TimestampStyle;
						await this.plugin.saveSettings();
					})
			);

		new Setting(containerEl)
			.setName("时间戳后添加空格")
			.setDesc("在时间戳后插入一个空格（行内代码样式时位于反引号内）。")
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
