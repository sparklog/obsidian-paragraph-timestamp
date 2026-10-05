import assert from "node:assert/strict";
import test from "node:test";
import { applyTimestampStyle } from "../src/format.ts";

test("plain style keeps the timestamp and trailing space as-is", () => {
	assert.equal(
		applyTimestampStyle("15:40", { style: "plain", addTrailingSpace: true }),
		"15:40 "
	);
});

test("plain style without a trailing space", () => {
	assert.equal(
		applyTimestampStyle("15:40", { style: "plain", addTrailingSpace: false }),
		"15:40"
	);
});

test("code style wraps the timestamp and trailing space in backticks", () => {
	assert.equal(
		applyTimestampStyle("15:40", { style: "code", addTrailingSpace: true }),
		"`15:40 `"
	);
});

test("code style without a trailing space", () => {
	assert.equal(
		applyTimestampStyle("15:40", { style: "code", addTrailingSpace: false }),
		"`15:40`"
	);
});
