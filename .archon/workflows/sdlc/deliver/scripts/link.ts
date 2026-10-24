/**
 * How the pull request links its issue once the rounds have ended, and why; the
 * update-pr-body agent writes the keyword and, on `Refs`, says why in "Left open".
 *
 * Bound inputs (canonical text):
 * - INPUTS_CONTRACT_LEFT: the latest review's `contract_left`, "null" when no review
 *   judged coverage.
 * - INPUTS_REQUIREMENTS: the rulings' requirements the caller passed, empty for none.
 */

import { emit, nullableJson, refuse, text } from '../../.shared/io.ts';
import { issueLink, parseRequirements } from '../../.shared/requirements.ts';

try {
  const left = nullableJson(process.env.INPUTS_CONTRACT_LEFT) as string[] | null;
  const requirements = parseRequirements(text(process.env.INPUTS_REQUIREMENTS));
  const keyword = issueLink(left, requirements);
  const why =
    left === null
      ? 'no review judged contract coverage'
      : left.length > 0
        ? 'the latest review left contract items open'
        : keyword === 'Refs'
          ? "a maintainer ruling keeps the issue open: the issue body's dated scope sections say why"
          : 'the latest review left nothing open';
  emit({ keyword, why });
} catch (error) {
  refuse(`link: ${error instanceof Error ? error.message : String(error)}`);
}
