import { readdirSync, readFileSync, statSync } from "node:fs";
import path from "node:path";
import { describe, expect, it } from "vitest";

const ROOT = path.join(__dirname, "..", "..", "..");
const DIRS = ["lib/seating", "components/seating", "app/seating"];

function collectFiles(dir: string): string[] {
  const files: string[] = [];
  for (const entry of readdirSync(dir)) {
    const full = path.join(dir, entry);
    if (statSync(full).isDirectory()) {
      files.push(...collectFiles(full));
    } else if (/\.(ts|tsx)$/.test(entry)) {
      files.push(full);
    }
  }
  return files;
}

describe("seating board boundary", () => {
  it("never imports @supabase, fetch, filesystem, or persistence APIs", () => {
    const files = DIRS.flatMap((dir) => collectFiles(path.join(ROOT, dir)));
    expect(files.length).toBeGreaterThan(0);

    for (const file of files) {
      const contents = readFileSync(file, "utf-8");
      expect(contents).not.toMatch(/@supabase/);
      expect(contents).not.toMatch(/\bfetch\(/);
      expect(contents).not.toMatch(/from "node:fs"/);
      expect(contents).not.toMatch(/from "fs"/);
      expect(contents).not.toMatch(/@vercel\/blob/);
      expect(contents).not.toMatch(/drizzle-orm/);
    }
  });
});
