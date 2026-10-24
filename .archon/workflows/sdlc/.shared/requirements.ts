/**
 * What a maintainer's rulings require of an item's pull request beyond its contract, as
 * typed values the pack's fixed steps act on: how the pull request links its issue, and
 * which CI reruns it needs even when CI is green.
 *
 * The agent that writes a ruling's choice also declares these values, reading the issue
 * body's dated sections with that ruling added, so nothing downstream reads a ruling's
 * prose for them. The queue records the chosen values on the work item
 * (`facts.requirements`), each choice replacing the last; the queue's own `other` choice
 * declares none and leaves them as they were. The build queue hands them to delivery, and
 * the merge queue reads them from the work item. `issueLink` is the one closing decision
 * those steps share.
 */

import type { WorkItem } from './workitem.ts';

/**
 * `refs`: the pull request references its issue and never closes it. `closes`: it closes
 * its issue once its latest review leaves nothing open, the rule without a ruling.
 */
export const RULING_LINKS = ['closes', 'refs'] as const;
export type RulingLink = (typeof RULING_LINKS)[number];

export interface RulingRequirements {
  readonly link: RulingLink;
  /** Each CI rerun the rulings require even on green, naming the check and how many times. */
  readonly reruns: readonly string[];
}

/** No ruling: close on a fully met contract, and rerun only what CI's judgment calls for. */
export const NO_RULING: RulingRequirements = { link: 'closes', reruns: [] };

/** The requirements recorded on a work item, or the no-ruling default. */
export function requirementsOf(doc: WorkItem | null): RulingRequirements {
  return doc?.facts.requirements ?? NO_RULING;
}

/** The work item with a chosen ruling's requirements recorded, replacing earlier ones. */
export function withRequirements(doc: WorkItem, requirements: RulingRequirements): WorkItem {
  return { ...doc, facts: { ...doc.facts, requirements } };
}

/**
 * Requirements passed as JSON text: an object with a known `link` and a string list of
 * `reruns`. Empty text or `null` is no ruling; anything else malformed refuses.
 */
export function parseRequirements(value: string): RulingRequirements {
  const trimmed = value.trim();
  if (trimmed === '' || trimmed === 'null') return NO_RULING;
  const parsed = JSON.parse(trimmed) as { link?: unknown; reruns?: unknown } | null;
  const link = RULING_LINKS.find(candidate => candidate === parsed?.link);
  const reruns = parsed?.reruns;
  if (link === undefined || !Array.isArray(reruns) || !reruns.every(entry => typeof entry === 'string')) {
    throw new Error(`requirements must be {"link": "closes" | "refs", "reruns": [string]}, not ${trimmed}`);
  }
  return { link, reruns };
}

/**
 * How the pull request links its issue: `Closes` only when its latest review left
 * nothing open (`leftOpen` is `[]`; null means no review judged coverage) and no ruling
 * keeps the issue open. Everything else is `Refs`.
 */
export function issueLink(leftOpen: readonly string[] | null, requirements: RulingRequirements): 'Closes' | 'Refs' {
  return leftOpen !== null && leftOpen.length === 0 && requirements.link === 'closes' ? 'Closes' : 'Refs';
}
