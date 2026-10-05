import type { ParagraphTimestampSettings } from "./settings";

/**
 * Renders the final text that is inserted for a paragraph timestamp.
 *
 * - `plain`  → `15:40 ` (timestamp plus optional trailing space)
 * - `code`   → `` `15:40` `` plus an optional trailing space (only the
 *              timestamp is wrapped, so Obsidian renders just it as inline
 *              code).
 */
export function applyTimestampStyle(
	time: string,
	settings: Pick<ParagraphTimestampSettings, "style" | "addTrailingSpace">
): string {
	const space = settings.addTrailingSpace ? " " : "";
	if (settings.style === "code") {
		return `\`${time}\`${space}`;
	}
	return `${time}${space}`;
}
