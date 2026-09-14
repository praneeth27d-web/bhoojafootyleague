# Bhooja League Hub (45)

# Bhooja Football League Website Specification

## Visual direction

- Minimalistic, clean sports dashboard.

- Overall background: soft neutral grey, such as `#F1F2F4`.

- Content surfaces: white cards with subtle borders and very light shadows.

- Primary text: charcoal `#1F2328`.

- Secondary text: muted grey `#6B7280`.

- Accent: restrained blue `#1683D8`, with red used only for important status labels.

- Use the supplied BFL logo in the sidebar/header, preserving its red and blue identity.

- Use a modern sans-serif typeface with strong numeric readability.

## Main navigation

### Table

The Table page displays five clickable teams:

1. Chelsea

2. AC Milan

3. Real Madrid

4. Arsenal

5. Juventus

Each team opens a dedicated team page with four tabs:

- Table

- Fixtures

- Results

- Squad

The selected tab should be visually obvious with a blue underline or filled pill.

### Fixtures & Results

Provide a competition-wide view with clickable rows. Each row opens a match-detail panel or page containing:

- Matchday

- Date and time

- Home team

- Away team

- Score or scheduled status

- Venue, if available

- Match events for completed games

Include filters for team, match status, and matchday.

### Stats

Show individual player statistics in a sortable table:

- Player

- Team

- Goals

- Assists

- G/A

- Player of the Match awards

Allow clicking a player to open a compact profile containing the same statistics and recent match contributions.

### News

Keep this item visible but disabled or marked “Coming soon.”

### Transfer Rumours

Keep this item visible but disabled or marked “Coming soon.”

## Team pages

Each team has six randomly named players. The squad table must be clickable, and each player should open a profile drawer or modal with goals, assists, G/A, and Player of the Match awards.

### Chelsea

- Noah Bennett — 3 goals, 1 assist, 4 G/A, 1 Player of the Match

- Lucas Morgan — 2 goals, 2 assists, 4 G/A, 0 Player of the Match

- Ethan Carter — 1 goal, 3 assists, 4 G/A, 1 Player of the Match

- Mason Reed — 2 goals, 0 assists, 2 G/A, 0 Player of the Match

- Oliver Hayes — 0 goals, 1 assist, 1 G/A, 0 Player of the Match

- Daniel Brooks — 1 goal, 1 assist, 2 G/A, 0 Player of the Match

### AC Milan

- Matteo Rossi — 4 goals, 1 assist, 5 G/A, 2 Player of the Match

- Luca Bianchi — 2 goals, 2 assists, 4 G/A, 0 Player of the Match

- Marco Conti — 1 goal, 2 assists, 3 G/A, 1 Player of the Match

- Andrea Romano — 2 goals, 0 assists, 2 G/A, 0 Player of the Match

- Enzo Moretti — 0 goals, 1 assist, 1 G/A, 0 Player of the Match

- Giovanni Ferri — 1 goal, 0 assists, 1 G/A, 0 Player of the Match

### Real Madrid

- Alejandro Cruz — 5 goals, 2 assists, 7 G/A, 2 Player of the Match

- Mateo Silva — 2 goals, 3 assists, 5 G/A, 1 Player of the Match

- Diego Torres — 2 goals, 1 assist, 3 G/A, 0 Player of the Match

- Javier León — 1 goal, 1 assist, 2 G/A, 0 Player of the Match

- Sergio Vega — 0 goals, 1 assist, 1 G/A, 0 Player of the Match

- Nico Santos — 1 goal, 0 assists, 1 G/A, 0 Player of the Match

### Arsenal

- William Grant — 3 goals, 2 assists, 5 G/A, 1 Player of the Match

- Henry Collins — 2 goals, 1 assist, 3 G/A, 0 Player of the Match

- Jack Foster — 1 goal, 2 assists, 3 G/A, 1 Player of the Match

- Charlie Ward — 2 goals, 0 assists, 2 G/A, 0 Player of the Match

- George Ellis — 0 goals, 1 assist, 1 G/A, 0 Player of the Match

- Leo Turner — 1 goal, 1 assist, 2 G/A, 0 Player of the Match

### Juventus

- Alessandro Ricci — 4 goals, 1 assist, 5 G/A, 1 Player of the Match

- Lorenzo Costa — 2 goals, 2 assists, 4 G/A, 1 Player of the Match

- Davide Marchetti — 1 goal, 2 assists, 3 G/A, 0 Player of the Match

- Federico Gallo — 2 goals, 0 assists, 2 G/A, 0 Player of the Match

- Tommaso Riva — 0 goals, 1 assist, 1 G/A, 0 Player of the Match

- Paolo De Luca — 1 goal, 0 assists, 1 G/A, 0 Player of the Match

## Half-completed league data

Use a 5-team single round-robin format. A full league contains 10 matches; mark the first 5 as completed and the remaining 5 as upcoming.

### Completed results

| Matchday | Fixture | Result |

|---|---|---:|

| 1 | Chelsea vs AC Milan | 2–1 |

| 1 | Real Madrid vs Arsenal | 3–2 |

| 2 | Juventus vs Chelsea | 1–1 |

| 2 | AC Milan vs Real Madrid | 2–0 |

| 3 | Arsenal vs Juventus | 2–2 |

### Upcoming fixtures

| Matchday | Fixture | Status |

|---|---|---|

| 3 | Chelsea vs Real Madrid | Upcoming |

| 4 | Arsenal vs AC Milan | Upcoming |

| 4 | Real Madrid vs Juventus | Upcoming |

| 5 | Chelsea vs Arsenal | Upcoming |

| 5 | AC Milan vs Juventus | Upcoming |

## League table seed

Calculate standings from the completed results rather than hard-coding them. Initial standings should therefore be:

| Pos | Team | P | W | D | L | GF | GA | GD | Pts |

|---:|---|---:|---:|---:|---:|---:|---:|---:|---:|

| 1 | AC Milan | 2 | 1 | 0 | 1 | 3 | 2 | +1 | 3 |

| 2 | Real Madrid | 2 | 1 | 0 | 1 | 3 | 4 | -1 | 3 |

| 3 | Arsenal | 2 | 0 | 1 | 1 | 4 | 5 | -1 | 1 |

| 4 | Chelsea | 2 | 0 | 1 | 1 | 3 | 4 | -1 | 1 |

| 5 | Juventus | 2 | 0 | 2 | 0 | 3 | 3 | 0 | 2 |

For production, sort by points, then goal difference, then goals scored. If the table order is displayed, use the exact calculated order and resolve ties consistently.

## Suggested layout

### Desktop

- Fixed left sidebar, approximately 240px wide.

- Main content area centered with a maximum width of approximately 1200px.

- Header includes page title, current competition phase, and a compact “Halfway through league” badge.

- Use a two-column dashboard: standings and next fixtures on the left; top scorers and recent results on the right.

### Mobile

- Convert the sidebar into a top bar or slide-out drawer.

- Keep tables horizontally scrollable.

- Use bottom sheets or full-screen panels for player and match details.

## Interaction requirements

- Team names, fixture rows, result rows, player rows, and stat rows must be clickable.

- Use URL-based routes so pages can be shared directly, for example:

  - `/table`

  - `/teams/chelsea`

  - `/teams/chelsea/squad`

  - `/fixtures-results`

  - `/stats`

  - `/players/noah-bennett`

  - `/matches/chelsea-ac-milan-md1`

- Preserve filters and tab state when navigating back.

- Include keyboard focus states and accessible labels.

- Do not use gradients, excessive decoration, or crowded cards.

## Empty states

- News: “No news published yet.”

- Transfer Rumours: “No transfer rumours published yet.”

- Upcoming match details: “Lineups and events will appear after the match is completed.”

This project was built with [Lovable](https://lovable.dev).

**Live app**: https://bhoojafootyleague.lovable.app

## Build with Lovable

Continue developing this project in the [Lovable editor](https://lovable.dev/projects/3854a8f1-61aa-473e-be2f-45eb419ac7f9).

- **Ship faster**: describe what you want to build and Lovable handles the code.
- **Stay in sync**: every change made in Lovable is committed straight to this repository.
- **Full ownership**: this code is yours. Push to `main` on GitHub and your changes sync back into Lovable, ready for your next prompt.

## Development

Prefer working locally? You need Node.js and npm — [install with nvm](https://github.com/nvm-sh/nvm#installing-and-updating).

```sh
git clone <this-repository-url>
cd <repository-name>
npm i
npm run dev
```
