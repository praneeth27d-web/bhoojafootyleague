<!-- LOVABLE:BEGIN -->

> [!IMPORTANT]
> This project is connected to [Lovable](https://lovable.dev). Avoid rewriting
> published git history — force pushing, or rebasing/amending/squashing commits
> that are already pushed — as it rewrites history on Lovable's side and the
> user will likely lose their project history.
>
> Commits you push to the connected branch sync back to Lovable and show up in
> the editor, so keep the branch in a working state.

<!-- LOVABLE:END -->

- Public match events are presented through the shared lineup view; keep event entry in league admin independent so display changes do not alter editing workflows.
- Derive individual totals from completed matches through a shared statistics helper, excluding replacement events and own goals from scoring; profiles and leaderboards share the same values to prevent discrepancies.
- Store market value as nullable admin-entered display text so currency and units are not invented; unknown profile details display as not set.
- Use the shared PlayerDetails display for both full profiles and player sheets; keep editable profile fields in AdminPlayerDetails so basic and expanded views stay consistent.
