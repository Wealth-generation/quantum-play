import { execFileSync } from "node:child_process";
import { existsSync, readFileSync, readdirSync } from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const repoRoot = path.resolve(__dirname, "..");
const mapPath = path.join(__dirname, "docs-ownership-map.json");

function runGit(args) {
  return execFileSync("git", args, {
    cwd: repoRoot,
    encoding: "utf8",
    stdio: ["ignore", "pipe", "pipe"],
  })
    .split(/\r?\n/)
    .map(normalizePath)
    .filter(Boolean);
}

function normalizePath(filePath) {
  return filePath.trim().replace(/\\/g, "/");
}

function escapeRegExp(value) {
  return value.replace(/[|\\{}()[\]^$+?.]/g, "\\$&");
}

function patternToRegExp(pattern) {
  const normalized = normalizePath(pattern);
  let source = "";

  for (let index = 0; index < normalized.length; index += 1) {
    const char = normalized[index];
    const next = normalized[index + 1];

    if (char === "*" && next === "*") {
      source += ".*";
      index += 1;
    } else if (char === "*") {
      source += "[^/]*";
    } else {
      source += escapeRegExp(char);
    }
  }

  return new RegExp(`^${source}$`);
}

function matchesPattern(filePath, pattern) {
  return patternToRegExp(pattern).test(filePath);
}

function matchesAny(filePath, patterns = []) {
  return patterns.some((pattern) => matchesPattern(filePath, pattern));
}

function unique(values) {
  return [...new Set(values)];
}

function getChangedFiles() {
  const tracked = runGit(["diff", "--name-only", "--diff-filter=ACMRTD", "HEAD"]);
  const untracked = runGit(["ls-files", "--others", "--exclude-standard"]);
  return unique([...tracked, ...untracked]).sort();
}

function loadMap() {
  if (!existsSync(mapPath)) {
    throw new Error(`Missing docs ownership map: ${path.relative(repoRoot, mapPath)}`);
  }

  return JSON.parse(readFileSync(mapPath, "utf8"));
}

function getActiveTaskArtifactText() {
  const activeDir = path.join(repoRoot, ".ai", "tasks", "active");

  if (!existsSync(activeDir)) {
    return "";
  }

  return readdirSync(activeDir, { withFileTypes: true })
    .filter((entry) => entry.isFile() && entry.name.endsWith(".md"))
    .map((entry) => readFileSync(path.join(activeDir, entry.name), "utf8"))
    .join("\n\n");
}

function hasDocsNotNeededRationale(mapConfig) {
  const artifactText = getActiveTaskArtifactText().toLowerCase();

  if (!artifactText) {
    return false;
  }

  return (mapConfig.rationaleMarkers ?? []).some((marker) =>
    artifactText.includes(marker.toLowerCase()),
  );
}

function findMappingMatches(changedFiles, mappings) {
  return mappings.flatMap((mapping) => {
    const matchedFiles = changedFiles.filter((filePath) => {
      const included = matchesAny(filePath, mapping.sourcePatterns);
      const excluded = matchesAny(filePath, mapping.excludePatterns);
      return included && !excluded;
    });

    if (matchedFiles.length === 0) {
      return [];
    }

    return [{ mapping, matchedFiles }];
  });
}

function hasMappedDocsChanged(changedFiles, docs) {
  return docs.some((docPath) => changedFiles.includes(normalizePath(docPath)));
}

function formatList(values) {
  return values.map((value) => `  - ${value}`).join("\n");
}

function main() {
  const changedFiles = getChangedFiles();
  const mapConfig = loadMap();
  const matches = findMappingMatches(changedFiles, mapConfig.mappings ?? []);

  if (matches.length === 0) {
    console.log("Docs freshness check passed: no mapped/significant changed files found.");
    return;
  }

  const rationalePresent = hasDocsNotNeededRationale(mapConfig);
  const failures = matches.filter(({ mapping }) => {
    const docsChanged = hasMappedDocsChanged(changedFiles, mapping.docs ?? []);
    return mapping.impact === "blocking" && !docsChanged && !(mapping.rationaleAllowed && rationalePresent);
  });

  if (failures.length === 0) {
    console.log("Docs freshness check passed.");
    console.log("Mapped changes found:");
    for (const { mapping, matchedFiles } of matches) {
      const docsChanged = hasMappedDocsChanged(changedFiles, mapping.docs ?? []);
      const reason = docsChanged ? "mapped durable docs changed" : "active task artifact rationale found";
      console.log(`- ${mapping.sourcePatterns.join(", ")}: ${reason}`);
      console.log(formatList(matchedFiles));
    }
    return;
  }

  console.error("Docs freshness check failed.");
  console.error("A mapped/significant source area changed without mapped durable docs or an active docs-not-needed rationale.");
  console.error("");

  for (const { mapping, matchedFiles } of failures) {
    console.error(`Source patterns: ${mapping.sourcePatterns.join(", ")}`);
    console.error("Changed files:");
    console.error(formatList(matchedFiles));
    console.error("Expected durable docs:");
    console.error(formatList(mapping.docs ?? []));
    console.error(`Rationale allowed: ${mapping.rationaleAllowed ? "yes" : "no"}`);
    console.error(`Notes: ${mapping.notes ?? "none"}`);
    console.error("");
  }

  console.error("Fix by updating mapped durable docs or recording a source-backed docs-not-needed rationale in .ai/tasks/active/*.md.");
  process.exit(1);
}

try {
  main();
} catch (error) {
  console.error(`Docs freshness check errored: ${error.message}`);
  process.exit(1);
}
