import { readdirSync, readFileSync } from "node:fs";
import path from "node:path";
import { describe, expect, it } from "vitest";

const venueViewDir = path.join(__dirname, "..", "..", "..", "lib", "venue-view");

describe("lib/venue-view boundary", () => {
  it("never imports @supabase, fetch, filesystem, or React APIs", () => {
    const files = readdirSync(venueViewDir).filter((f) => f.endsWith(".ts"));
    expect(files.length).toBeGreaterThan(0);

    for (const file of files) {
      const contents = readFileSync(path.join(venueViewDir, file), "utf-8");
      expect(contents).not.toMatch(/@supabase/);
      expect(contents).not.toMatch(/\bfetch\(/);
      expect(contents).not.toMatch(/from "node:fs"/);
      expect(contents).not.toMatch(/from "fs"/);
      expect(contents).not.toMatch(/from "react"/);
    }
  });
});
