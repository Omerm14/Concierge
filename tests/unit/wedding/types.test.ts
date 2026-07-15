import { readdirSync, readFileSync } from "node:fs";
import path from "node:path";
import { describe, expect, it } from "vitest";
import { demoWedding } from "../../../lib/fixtures/demo-wedding";
import type { Language } from "../../../lib/guests/types";
import type { WeddingProfile } from "../../../lib/wedding/types";

const ALL_LANGUAGES: Language[] = ["he", "en", "ru", "ar"];

describe("WeddingProfile", () => {
  it("demoWedding fixture typechecks against WeddingProfile and has a valid defaultLanguage", () => {
    const profile: WeddingProfile = demoWedding;
    expect(ALL_LANGUAGES).toContain(profile.defaultLanguage);
  });

  it("demoWedding has a couple display name and a fixed ISO wedding date", () => {
    expect(demoWedding.coupleDisplayName.length).toBeGreaterThan(0);
    expect(demoWedding.weddingDate).toMatch(/^\d{4}-\d{2}-\d{2}$/);
  });

  it("contains no guest PII — no phone/guest-array fields on the profile", () => {
    expect(demoWedding).not.toHaveProperty("phone");
    expect(demoWedding).not.toHaveProperty("guests");
    expect(demoWedding).not.toHaveProperty("phones");
    expect(Array.isArray(demoWedding)).toBe(false);
  });

  it("is deterministic across re-imports (no Math.random()/Date.now() at import time)", async () => {
    const reimported = await import("../../../lib/fixtures/demo-wedding");
    expect(reimported.demoWedding).toEqual(demoWedding);
  });
});

describe("lib/wedding boundary", () => {
  it("never imports @supabase, fetch, filesystem, or Blob APIs", () => {
    const weddingDir = path.join(__dirname, "..", "..", "..", "lib", "wedding");
    const files = readdirSync(weddingDir).filter((f) => f.endsWith(".ts"));
    expect(files.length).toBeGreaterThan(0);

    for (const file of files) {
      const contents = readFileSync(path.join(weddingDir, file), "utf-8");
      expect(contents).not.toMatch(/@supabase/);
      expect(contents).not.toMatch(/\bfetch\(/);
      expect(contents).not.toMatch(/from "node:fs"/);
      expect(contents).not.toMatch(/from "fs"/);
      expect(contents).not.toMatch(/@vercel\/blob/);
      expect(contents).not.toMatch(/\bany\b/);
    }
  });
});
