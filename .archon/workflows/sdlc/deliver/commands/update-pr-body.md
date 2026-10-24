# Update the pull request description

Bring the pull request's description in line with the final change. It was
written when the draft opened; the base merge and correction rounds since then
may have falsified claims in it, and a validation may have passed red it has to
disclose. Your product is an accurate description, nothing else.

The pull request: $INPUTS.pr. Its URL names the repository (host and
`<owner>/<repo>`) and the number every command below uses. Read and write it
through the source this run selected, `$INPUTS.source`:

- **`forge`:** the Archon CLI, whose argv is the JSON string array in
  `$ARCHON_CLI_COMMAND`, run as `<argv...> forge <op> --json …`, with `<ref>` =
  `{"repo":{"host":…,"path":…},"number":…}`. Read with `pr.view` and
  `--data '{"selector":{"kind":"number","ref":<ref>}}'`; write with `pr.edit-body`
  and `--data-file`, so the description never reaches a command line. A failed
  operation is the answer: report it, and never repeat it through `gh`.
- **`gh`:** the GitHub CLI, every command naming `--repo <host>/<owner>/<repo>`.

1. Read the live description and base (`pr.view`, or
   `gh pr view <number> --repo <host>/<owner>/<repo> --json body,baseRefName`):
   a person may have edited it since, and their edits stay. Then read the full
   final diff: fetch the base from the remote whose URL is the pull request's
   repository (`git remote -v`; it need not be named `origin`) and diff
   `<that remote>/<base>...HEAD`.
2. Check every concrete claim in the description against the diff: named
   functions and guards, described mechanics, file lists, "unchanged" claims.
   Change only what the diff falsifies. Keep the structure, the tone and every
   claim that is still true. Do not rewrite from scratch, add sections other than
   step 4's, or narrate the correction history. Text between
   `<!-- archon-delivery-description -->` and `<!-- /archon-delivery-description -->`
   is content the rounds published: keep both markers, and correct claims inside
   them like any other.
3. When `$ARTIFACTS_DIR/implementation.md` records a failing check the implementer
   judged `inherited` or `environment`, the description must say so near the top:
   the check and why it is not this change's. Keep an existing disclosure that is
   still true.
4. Link the issue the description references with `$INPUTS.link #N`, which
   the run decided: `Closes` only when the latest review left nothing open and no
   maintainer ruling keeps the issue open, otherwise `Refs`. Why: $INPUTS.link_why.
   Never choose the keyword yourself, whatever the description or the issue says.
   On `Closes`, it replaces a `Refs #N`. On `Refs`, it replaces any closing keyword
   (`Closes`, `Fixes`, `Resolves` and their variants), and a short "Left open"
   section says why the issue stays open: each item the latest review left open
   (as a JSON list, empty text when no review judged coverage:
   `$INPUTS.contract_left`), that no review judged coverage, or that a
   maintainer ruling keeps the issue open. An item left open as an operator check
   names the check the operator runs. Keep at most one "Left open" section,
   current, and remove it on `Closes`. Change no other reference, and add none when
   the description links no issue.
5. When something changed, apply the complete description. On `forge`, write
   the request `{"ref":<ref>,"body":<description>}` to
   `$ARTIFACTS_DIR/pr-body-final.json` and pass it with `--data-file`. On `gh`,
   write the description to `$ARTIFACTS_DIR/pr-body-final.md` and apply it with
   `gh pr edit <number> --repo <host>/<owner>/<repo> --body-file "$ARTIFACTS_DIR/pr-body-final.md"`.
   When nothing changed, edit nothing.

Never modify files in the checkout, commit, push, change the pull request's draft
state, or touch the review comment.

## Output

- `changed`: whether you edited the description.
- `summary`: which claims you corrected and how the issue is linked, or that it
  was already accurate.
