import assert from "node:assert";
import { describe, it } from "node:test";
import { getKeybindings, KeybindingsManager, setKeybindings, TUI_KEYBINDINGS } from "../src/keybindings.ts";

describe("KeybindingsManager", () => {
	it("does not evict selector confirm when input submit is rebound", () => {
		const keybindings = new KeybindingsManager(TUI_KEYBINDINGS, {
			"tui.input.submit": ["enter", "ctrl+enter"],
		});

		assert.deepStrictEqual(keybindings.getKeys("tui.input.submit"), ["enter", "ctrl+enter"]);
		assert.deepStrictEqual(keybindings.getKeys("tui.select.confirm"), ["enter"]);
	});

	it("does not evict cursor bindings when another action reuses the same key", () => {
		const keybindings = new KeybindingsManager(TUI_KEYBINDINGS, {
			"tui.select.up": ["up", "ctrl+p"],
		});

		assert.deepStrictEqual(keybindings.getKeys("tui.select.up"), ["up", "ctrl+p"]);
		assert.deepStrictEqual(keybindings.getKeys("tui.editor.cursorUp"), ["up"]);
	});

	it("still reports direct user binding conflicts without evicting defaults", () => {
		const keybindings = new KeybindingsManager(TUI_KEYBINDINGS, {
			"tui.input.submit": "ctrl+x",
			"tui.select.confirm": "ctrl+x",
		});

		assert.deepStrictEqual(keybindings.getConflicts(), [
			{
				key: "ctrl+x",
				keybindings: ["tui.input.submit", "tui.select.confirm"],
			},
		]);
		assert.deepStrictEqual(keybindings.getKeys("tui.editor.cursorLeft"), ["left", "ctrl+b"]);
	});
});

describe("global keybindings slot", () => {
	it("shares the manager across module copies via a globalThis Symbol.for() slot", () => {
		// Extensions resolve their own on-disk copy of this module, so the
		// singleton must live on globalThis under a process-wide Symbol.for()
		// key. Reading the slot directly stands in for a separate module copy
		// that only sees globalThis, not this module's lexical scope.
		const merged = new KeybindingsManager({
			...TUI_KEYBINDINGS,
			"app.tools.expand": { defaultKeys: "ctrl+o", description: "Expand" },
		});
		setKeybindings(merged);

		assert.strictEqual(getKeybindings(), merged);

		const slot = (
			globalThis as unknown as Record<symbol, { manager: KeybindingsManager | null }>
		)[Symbol.for("@earendil-works/pi-tui.keybindings.v1")];
		assert.strictEqual(slot?.manager, merged);
		assert.deepStrictEqual(slot?.manager?.getKeys("app.tools.expand" as never), ["ctrl+o"]);
	});
});
