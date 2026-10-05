import assert from "node:assert/strict";
import test from "node:test";
import { EditorState } from "@codemirror/state";
import { paragraphTimestamp } from "../src/timestamp.ts";
import type { TimestampProvider } from "../src/timestamp.ts";

const stampWithSpace: TimestampProvider = { getStamp: () => "15:40 " };
const stampWithoutSpace: TimestampProvider = { getStamp: () => "15:40" };

function createState(doc = "", provider: TimestampProvider = stampWithSpace) {
	return EditorState.create({
		doc,
		selection: { anchor: doc.length },
		extensions: [paragraphTimestamp(provider)],
	});
}

/** Simulates pressing Enter at the current cursor position. */
function pressEnter(state: EditorState): EditorState {
	const pos = state.selection.main.head;
	return state.update({
		changes: { from: pos, insert: "\n" },
		selection: { anchor: pos + 1 },
		userEvent: "input",
	}).state;
}

/** Simulates typing a single character at the current cursor position. */
function typeText(state: EditorState, text: string): EditorState {
	const pos = state.selection.main.head;
	return state.update({
		changes: { from: pos, insert: text },
		selection: { anchor: pos + text.length },
		userEvent: "input",
	}).state;
}

test("inserts a timestamp after a blank line and places the cursor after the space", () => {
	let state = createState("hello");
	state = pressEnter(state); // soft break: "hello\n"
	assert.equal(state.doc.toString(), "hello\n");

	state = pressEnter(state); // paragraph break: "hello\n\n"
	assert.equal(state.doc.toString(), "hello\n\n15:40 ");
	assert.equal(state.selection.main.head, state.doc.length);
	assert.equal(state.doc.line(state.doc.lines).text, "15:40 ");
});

test("does not insert a timestamp on a soft line break", () => {
	let state = createState("hello");
	state = pressEnter(state);
	assert.equal(state.doc.toString(), "hello\n");
	assert.equal(state.selection.main.head, 6);
});

test("does not insert a timestamp in an empty document", () => {
	let state = createState("");
	state = pressEnter(state);
	assert.equal(state.doc.toString(), "\n");
});

test("does not insert a timestamp when the blank line is followed by text", () => {
	let state = createState("hello\n\nworld", stampWithSpace);
	// Put the cursor at the start of "world".
	state = state.update({ selection: { anchor: 7 } }).state;
	state = pressEnter(state);
	// The blank line now sits before "world"; the cursor moves to "world",
	// which is not an empty line, so nothing is inserted.
	assert.equal(state.doc.toString(), "hello\n\n\nworld");
	assert.ok(!state.doc.toString().includes("15:40"));
});

test("inserts a timestamp when the following line is blank as well", () => {
	// "hello\n\n\nworld", cursor at the start of the second blank line.
	let state = createState("hello\n\n\nworld");
	state = state.update({ selection: { anchor: 6 } }).state;
	state = pressEnter(state);
	assert.equal(state.doc.toString(), "hello\n\n15:40 \n\nworld");
	assert.equal(state.selection.main.head, 13);
});

test("does not insert a timestamp when normal text is typed", () => {
	let state = createState("hello");
	state = typeText(state, "!");
	assert.equal(state.doc.toString(), "hello!");
});

test("respects a provider without a trailing space", () => {
	let state = createState("hello", stampWithoutSpace);
	state = pressEnter(state);
	state = pressEnter(state);
	assert.equal(state.doc.toString(), "hello\n\n15:40");
	assert.equal(state.selection.main.head, state.doc.length);
});

test("applies the timestamp in the same transaction as the newline", () => {
	let state = createState("hello");
	state = pressEnter(state);
	const pos = state.selection.main.head;

	const tr = state.update({
		changes: { from: pos, insert: "\n" },
		selection: { anchor: pos + 1 },
		userEvent: "input",
	});

	assert.equal(tr.state.doc.toString(), "hello\n\n15:40 ");

	// A single change set contains both the newline and the timestamp, which
	// means one undo removes everything at once.
	let inserted = "";
	tr.changes.iterChanges((_fromA, _toA, _fromB, _toB, ins) => {
		inserted += ins.toString();
	});
	assert.ok(inserted.includes("15:40"));
});
