import type { ParagraphTimestampSettings } from "./settings";

/**
 * Renders the final text that is inserted for a paragraph timestamp.
 *
 * - `plain`  → `15:40 ` (timestamp plus optional trailing space)
 * - `code`   → `` `15:40 ` `` (timestamp and trailing space wrapped in
 *              backticks so Obsidian renders it as inline code)
 */
export function applyTimestampStyle(
	time: string,
	settings: Pick<ParagraphTimestampSettings, "style" | "addTrailingSpace">
): string {
	const space = settings.addTrailingSpace ? " " : "";
	if (settings.style === "code") {
		return `\`${time}${space}\``;
	}
	return `${time}${space}`;
}
