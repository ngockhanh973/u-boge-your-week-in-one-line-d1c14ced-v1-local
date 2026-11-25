// Week-in-one-line entry runner.
// Reads the one-line entry stored beside this script, validates it
// against the bounty gate, and copies its exact bytes to the output
// directory chosen by the grader (or ./out when unset).
import { readFileSync, writeFileSync, mkdirSync } from "node:fs";
import { dirname, join, resolve } from "node:path";
import { fileURLToPath } from "node:url";

const MAX_CHARS = 100;
const MIN_CHARS = 1;

function fail(message: string): never {
  console.error(`entry check failed: ${message}`);
  process.exit(1);
}

function scriptDir(): string {
  const here = fileURLToPath(import.meta.url);
  return dirname(resolve(here));
}

function loadEntry(): Buffer {
  const entryPath = join(scriptDir(), "entry.txt");
  try {
    return readFileSync(entryPath);
  } catch (error) {
    fail(`could not read entry.txt next to main.ts (${entryPath})`);
  }
}

function validate(raw: Buffer): string {
  const text = raw.toString("utf8");
  const length = [...text].length;
  if (length < MIN_CHARS || length > MAX_CHARS) {
    fail(`entry is ${length} characters, gate requires ${MIN_CHARS}-${MAX_CHARS}`);
  }
  if (text.trim().length === 0) {
    fail("entry is only whitespace");
  }
  if (text.includes("\n") || text.includes("\r")) {
    fail("entry must be a single line with no line breaks");
  }
  if (text !== text.trim()) {
    fail("entry must not start or end with whitespace");
  }
  return text;
}

function destinationDir(): string {
  const fromEnv = process.env.MAKEFUN_OUTPUT_DIR;
  if (fromEnv && fromEnv.trim().length > 0) {
    return resolve(fromEnv);
  }
  return join(scriptDir(), "out");
}

function main(): void {
  const raw = loadEntry();
  const text = validate(raw);
  const outDir = destinationDir();
  mkdirSync(outDir, { recursive: true });
  const outPath = join(outDir, "entry.txt");
  writeFileSync(outPath, raw);
  const chars = [...text].length;
  console.log(`ok: wrote ${chars} characters to ${outPath}`);
}

main();
