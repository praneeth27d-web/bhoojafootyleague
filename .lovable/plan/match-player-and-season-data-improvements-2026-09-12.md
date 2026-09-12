# Match, player and season data improvements

## What will change

### Match details
- Replace the tall one-sided event list with paired home/away rows: home events stay left, away events stay right, and both columns begin at the top for Goals and Assists.
- Keep the Goals/Assists switch and replace the boot emoji with the uploaded boot artwork, cleaned to transparent light/dark variants and normalized to a small consistent icon size.
- Add admin options for **Penalty** and **Own goal** when recording a goal.
- Show penalties as `⚽ Player (P)` and own goals with a red-and-white goal icon plus `(OG)`.
- Display an own goal on the side of the team that benefited, while excluding it from the scorer’s normal goal total. Penalties continue to count as normal goals.

### Fixtures & Results
- Upcoming rows will show only the two teams and an upcoming indicator; date, time, and location remain available after opening the match.
- Completed rows will use a centered football scoreline: `Home crest + name  5–4  Away crest + name`, instead of a score badge at the far edge.
- Keep rows compact and readable on both narrow and wide screens.

### Player profiles
- Make player clicks consistently open the existing profile sheet/page.
- Add the requested profile information: Team, Total games, Goals, Assists, Total G/A, POTM, and Preferred foot.
- Count Total games as every completed match involving the player’s season squad.
- Set Rishik, Adrith, and Ruhaan to left-footed; all other current players to right-footed.

### Season-specific squads and transfers
- Add a season roster snapshot so club, captain status, and transfers can differ by season.
- Backfill Seasons 1 and 2 from the current squads so existing pages keep their current data.
- Starting a new season will copy the latest season’s roster once; later captain or transfer changes affect only the selected season.
- Scope transfer records and admin squad controls to the season selected at the top of League Admin.
- Keep player identity and preferred foot shared across seasons, while team and captain membership remain season-specific.

### Finish prior admin reliability work
- Separate the admin season selector from the public season selector.
- Complete single-submit locks and success/error feedback for squad and transfer actions, not only fixture/result actions.
- Keep all fixture times entered and displayed in Indian Standard Time.
- Ensure live refresh includes the new roster data so saves immediately update standings, fixtures, stats, profiles, and club pages.

## Data changes
- Extend match goal records with `is_penalty` and `is_own_goal`.
- Add `preferred_foot` to player identity records.
- Add season rosters containing season, player, team, and captain.
- Add season ownership to transfer records.
- Preserve public read access and admin-only editing rules for all new fields and records.

## Validation
- Test saving fixture details, results, goals, assists, penalties, own goals, POTM, squad changes, captain changes, and transfers.
- Verify immediate updates on the league table, Fixtures & Results, Stats, player profiles, match pages, and team pages.
- Verify Season 1 and Season 2 roster edits no longer affect each other, while a new season begins as a copy.
- Check the compact match/event layouts and boot icon in light and dark mode on desktop and mobile.
