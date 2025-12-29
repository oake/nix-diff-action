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
