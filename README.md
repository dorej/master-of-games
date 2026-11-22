# Scorecard

A lightweight scorecard for card-game nights. Track players, rounds, and running
totals in the browser — no account, backend, or spreadsheet required.

The home menu also links to Janty (Chardee McDennis), the companion firepit
party game.

**Live app:** https://dorej.github.io/master-of-games/

## Games supported

| Game | Scoring style |
| --- | --- |
| Phase 10 | Round penalties with phase-completion tracking; lowest total wins. |
| Five Crowns | 11 rounds of leftover-card points; lowest total wins. |
| Rummy 500 | Melds minus cards left in hand; highest total wins. |
| Golf | Per-hole card values; lowest total wins. |
| Win Conditions | Free-form win statements with no numeric scoring. |

Each game includes a built-in "How to score" reference on its setup screen.

### Rummy 500 options

- Selectable target score: 250, 300, 500, or 1000 points.
- One net-score box per player per hand: enter melded points minus cards left
  in hand.
- Card reference: A = 15 (1 or 5 when used low), K/Q/J/10 = 10, 2–9 = face
  value, Joker = 15.

## Getting started

Requires Node.js 20+.

```bash
npm install
npm run dev
```

Open the local URL printed by Vite; the production preview includes the
`/score-card/` subpath.

## Scripts

| Command | Description |
| --- | --- |
| `npm run dev` | Start the Vite development server. |
| `npm run build` | Type-check and build for production with the `/master-of-games/` base. |
| `npm run preview` | Preview the production build locally. |
| `npm run deploy` | Type-check, build, publish `dist/`, and verify the live site. |

## How it works

- Games are stored in `localStorage` under `score-card.games.v1`.
- The app is fully client-side and works offline after loading.
- Game rules, scoring, standings, and winner detection live in `src/games.ts`.
- Each game type renders a dedicated scorecard component.

## Project structure

```text
src/
  App.tsx                  App shell and view routing
  games.ts                 Game metadata, scoring, standings, winners
  storage.ts               localStorage persistence
  types.ts                 Game and setup types
  index.css                Global styles
  screens/
    HomeScreen.tsx         Game list and new-game picker
    SetupScreen.tsx        Player names and per-game options
    ScorecardScreen.tsx    Standings, winner banner, scorecard switcher
    scorecards/
      Phase10Card.tsx
      FiveCrownsCard.tsx
      Rummy500Card.tsx
      GolfCard.tsx
      WinConditionsCard.tsx
      shared.tsx           Shared score input and round header
```

## Tech stack

- React 19
- TypeScript
- Vite 7
- Plain CSS

## Deployment

`npm run deploy` builds with Vite base `/master-of-games/` and publishes the
generated `dist/` directory to `origin/gh-pages` by default:

https://dorej.github.io/master-of-games/

The upstream project remains at https://tyduptyler13.github.io/score-card/.
Override the destination with `DEPLOY_REMOTE`, `DEPLOY_BRANCH`, and `SITE_URL`.
