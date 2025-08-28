/// <reference types="node" />
type CliArgs = {
  teams: number | null;
  seed: number | null;
};

function parseArgs(argv: string[]): CliArgs {
  let teams: number | null = null;
  let seed: number | null = null;

  for (let i = 0; i < argv.length; i++) {
    const arg = argv[i];
    if (arg === "--teams") {
      const value = argv[i + 1];
      if (value == null || value.startsWith("--")) {
        throw new Error("--teams requires a number");
      }
      const parsed = Number(value);
      if (!Number.isFinite(parsed) || parsed < 0) {
        throw new Error("--teams must be a non-negative number");
      }
      teams = parsed;
      i++;
      continue;
    }
    if (arg === "--seed") {
      const value = argv[i + 1];
      if (value == null || value.startsWith("--")) {
        throw new Error("--seed requires a number");
      }
      const parsed = Number(value);
      if (!Number.isFinite(parsed)) {
        throw new Error("--seed must be a number");
      }
      seed = parsed;
      i++;
      continue;
    }
  }

  return { teams, seed };
}

function main(): void {
  try {
    const args = parseArgs(process.argv.slice(2));
    console.log("Parsed arguments:", args);
    console.log("Finished script.");
  } catch (error) {
    const message = error instanceof Error ? error.message : String(error);
    console.error("Error:", message);
    process.exitCode = 1;
  }
}

main();


