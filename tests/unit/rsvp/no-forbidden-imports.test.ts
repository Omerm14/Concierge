import { readdirSync, readFileSync } from "node:fs";
import path from "node:path";
import { describe, expect, it } from "vitest";

const rsvpDir = path.join(__dirname, "..", "..", "..", "lib", "rsvp");

describe("lib/rsvp boundary", () => {
  it("never imports @supabase, fetch, WhatsApp, or Anthropic APIs", () => {
    const files = readdirSync(rsvpDir).filter((f) => f.endsWith(".ts"));
    expect(files.length).toBeGreaterThan(0);

    for (const file of files) {
      const contents = readFileSync(path.join(rsvpDir, file), "utf-8");
      expect(contents).not.toMatch(/@supabase/);
      expect(contents).not.toMatch(/\bfetch\(/);
      expect(contents).not.toMatch(/from "node:fs"/);
      expect(contents).not.toMatch(/from "fs"/);
      expect(contents).not.toMatch(/whatsapp/i);
      expect(contents).not.toMatch(/@anthropic-ai/);
    }
  });
});
