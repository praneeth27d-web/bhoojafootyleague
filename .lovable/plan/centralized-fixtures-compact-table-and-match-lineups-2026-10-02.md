# Centralized fixtures, compact table, and match lineups

## What will change

### Fixtures and tables
- Center every fixture consistently, whether upcoming or completed, with the home team, `vs`/score, and away team balanced around the middle.
- Add a **Full / Compact** table control. Compact mode keeps position, club, goal difference, and points; full mode preserves the current columns.
- Apply the compact option to both current-season and archived Season 1 tables.

### Match page
- Add a named **Lineup** view beside the existing match-event view.
- Show each team in its selected futsal formation using numbered shirt markers instead of player photos.
- Show goal and assist totals on each lineup marker, including substitutes, without adding the penalty `P` label there.
- Keep goals and assists aligned to the correct team. Group repeated events and show penalty goals as `Name (P)` in the Goals view only.
- Show own goals with the supplied red-ball symbol, plus penalty-earned and penalty-missed events with the supplied symbols.
- Show yellow cards, straight red cards, and second-yellow reds with distinct labels.

### League admin
- Add editable jersey numbers to the squad editor.
- Add a lineup editor to each match with a broad set of common futsal formations, starters, substitutes, whether each substitute played, and a **Replacement** marker.
- Allow lineup, scorer, assister, penalty, and card selection from every player in the league, not only the two participating squads.
- Add controls for normal/penalty/own goals, assists, penalties earned, penalties missed, yellow cards, straight reds, and second-yellow reds.
- Keep each save action locked while saving and refresh public match, table, and statistics data after success.

### Statistics rules
- Count an appearance only when a starter played or a substitute is marked as having played.
- Exclude every appearance, goal, assist, card, and penalty statistic earned while the lineup entry is marked **Replacement**.
- Continue displaying those replacement events on the match page even though they do not affect that player's career totals.

## Data and safety
- Add jersey-number support to players and dedicated records for match lineups, cards, and penalty events.
- Store home and away formations on each match; retain the existing goal records and their penalty/own-goal fields.
- Give the new records public read access and admin-only write access, matching the existing league data protections.
- Preserve all current fixtures, results, squads, and historic data during the change.

## Verification
- Confirm admin changes persist and immediately appear on the public match page and statistics.
- Confirm replacement events display but do not change individual totals.
- Check the fixture rows, table switcher, lineup pitch, symbols, and controls on desktop and mobile in both themes.
