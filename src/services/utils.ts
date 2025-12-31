/**
 * Utility functions re-exported from service files
 *
 * This module separates pure utility functions from service interfaces.
 * Import services from "./index.js" and utilities from "./utils.js".
 */

// Nix utilities

// Detect if dix output indicates actual changes by comparing paths
// Nix store paths are content-addressed: same paths = same content
export const hasDixChanges = (diff: string | undefined): boolean => {
  if (!diff || diff.trim() === "") return false;

  // Extract paths from dix output format:
  // <<< /nix/store/xxx-name.drv
  // >>> /nix/store/yyy-name.drv
  const baseMatch = diff.match(/^<<<\s*(.+)$/m);
  const prMatch = diff.match(/^>>>\s*(.+)$/m);

  if (!baseMatch || !prMatch) return true; // Cannot parse, assume changes

  return baseMatch[1].trim() !== prMatch[1].trim();
};

// Detect if dix output includes any package section content
export const hasPackageChanges = (diff: string | undefined): boolean => {
  if (!diff || diff.trim() === "") return false;

  const lines = diff.split(/\r?\n/);

  return lines.length > 5;
};

// WARNING: Shamefully vibecoded
const isNixpkgsMinorUpdateLine = (line: string): boolean => {
  const match = line.match(/^\[([A-Z.]+)\]\s+(\S+)\s+(.+?)\s+->\s+(.+)$/);
  if (!match) return false;

  const status = match[1];
  if (status !== "U.") return false;

  const packageName = match[2];
  if (!packageName.startsWith("nixos-system-") && packageName !== "darwin-system") {
    return false;
  }

  const beforeVersion = match[3].trim();
  const afterVersion = match[4].trim();

  if (beforeVersion.includes(",") || afterVersion.includes(",")) return false;
  if (!beforeVersion.endsWith(".drv") || !afterVersion.endsWith(".drv")) return false;

  const extractMajorMinor = (version: string): string | null => {
    const versionMatch = version.match(/^(\d+\.\d+)\..+\.drv$/);
    return versionMatch ? versionMatch[1] : null;
  };

  const beforeMajorMinor = extractMajorMinor(beforeVersion);
  const afterMajorMinor = extractMajorMinor(afterVersion);

  return (
    beforeMajorMinor !== null && afterMajorMinor !== null && beforeMajorMinor === afterMajorMinor
  );
};

// WARNING: Shamefully vibecoded
export const filterNixpkgsMinorUpdates = (diff: string): string => {
  if (!diff || diff.trim() === "") return diff;

  const lines = diff.split(/\r?\n/);
  const filteredLines = lines.filter((line) => !isNixpkgsMinorUpdateLine(line));
  const output: string[] = [];

  for (let i = 0; i < filteredLines.length; i += 1) {
    const line = filteredLines[i];
    if (line.trim() === "CHANGED" && filteredLines[i + 1]?.trim() === "") {
      continue;
    }

    output.push(line);
  }

  return output.join("\n");
};

// Git utilities
export { sanitizeBranchName } from "./git.js";

// Artifact utilities
export { createArtifactName } from "./artifact.js";

// GitHub utilities
export {
  formatAggregatedComment,
  checkIfAnyDiffTruncated,
  truncateDiff,
  sanitizeDisplayName,
  type TruncateResult,
  type FormatCommentOptions,
} from "./github.js";
