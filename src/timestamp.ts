import { EditorState } from "@codemirror/state";
import type { Extension, Text, TransactionSpec } from "@codemirror/state";

/**
 * Supplies the text that should be placed at the start of a new paragraph.
 * The returned string is used verbatim, so it should already include any
 * trailing separator (usually a single space).
 */
export interface TimestampProvider {
	getStamp(): string;
}

/**
 * Returns true when `pos` is the beginning of a freshly created Markdown
 * paragraph.
 *
 * In Markdown a paragraph is only terminated by a blank line. A single
 * newline inside a paragraph is just a (soft) line break. Therefore a new
 * paragraph starts on an empty line that is directly preceded by a blank
 * line. To avoid gluing the timestamp to existing text, this only returns
 * true when the paragraph sits at the end of the document or is followed by
 * another blank line, and when there is actual content earlier in the note.
 */
export function isNewParagraphStart(doc: Text, pos: number): boolean {
	const line = doc.lineAt(pos);

	// The cursor has to sit at the very beginning of the line.
	if (pos !== line.from) return false;
	// The line itself must still be empty (only whitespace).
	if (line.text.trim().length > 0) return false;
	// A paragraph break requires a preceding blank line.
	if (line.number < 2) return false;
	if (doc.line(line.number - 1).text.trim().length > 0) return false;

	// Only insert where it is safe: at the end of the note, or when the
	// following line is blank as well. This guarantees the timestamp can
	// never be glued to existing text on the same line.
	const isLastLine = line.number === doc.lines;
	const nextIsBlank =
		!isLastLine && doc.line(line.number + 1).text.trim().length === 0;
	if (!isLastLine && !nextIsBlank) return false;

	// Make sure the note isn't empty or made up of blank lines only.
	let n = line.number - 1;
	while (n >= 1 && doc.line(n).text.trim().length === 0) n--;
	return n >= 1;
}

/** True when the inserted text is a plain line break (possibly with indent). */
function isPlainLineBreak(inserted: string): boolean {
	return inserted.includes("\n") && /^\s*$/.test(inserted);
}

/**
 * CodeMirror extension that automatically inserts a timestamp whenever the
 * user starts a new Markdown paragraph.
 *
 * It is implemented as a transaction filter so the timestamp becomes part of
 * the same transaction that created the paragraph break. This keeps the
 * cursor handling and undo history correct, without dispatching a nested
 * transaction (which CodeMirror forbids while an update is in progress).
 */
export function paragraphTimestamp(provider: TimestampProvider): Extension {
	return EditorState.transactionFilter.of((tr) => {
		if (!tr.docChanged) return tr;

		let lineBreak = false;
		tr.changes.iterChanges((_fromA, _toA, _fromB, _toB, inserted) => {
			if (isPlainLineBreak(inserted.toString())) lineBreak = true;
		});
		if (!lineBreak) return tr;

		const pos = tr.newSelection.main.head;
		if (!isNewParagraphStart(tr.newDoc, pos)) return tr;

		const stamp = provider.getStamp();
		if (!stamp) return tr;

		// `sequential: true` makes `pos` refer to the document produced by the
		// original transaction (the new document), which is what we want.
		const spec: TransactionSpec = {
			changes: { from: pos, insert: stamp },
			selection: { anchor: pos + stamp.length },
			sequential: true,
		};
		return [tr, spec];
	});
}
