import { readdirSync, readFileSync } from "node:fs";
import path from "node:path";
import { describe, expect, it } from "vitest";

const guestsDir = path.join(__dirname, "..", "..", "..", "lib", "guests");

describe("lib/guests boundary", () => {
  it("never imports @supabase, fetch, or filesystem-write APIs", () => {
    const files = readdirSync(guestsDir).filter((f) => f.endsWith(".ts"));
    expect(files.length).toBeGreaterThan(0);

    for (const file of files) {
      const contents = readFileSync(path.join(guestsDir, file), "utf-8");
      expect(contents).not.toMatch(/@supabase/);
      expect(contents).not.toMatch(/\bfetch\(/);
      expect(contents).not.toMatch(/from "node:fs"/);
      expect(contents).not.toMatch(/from "fs"/);
    }
  });
});
