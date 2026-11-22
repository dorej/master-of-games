import type { Game, Scores } from './types';

const KEY = 'score-card.games.v1';

export function loadGames(): Game[] {
  try {
    const raw = localStorage.getItem(KEY);
    if (!raw) return [];
    const parsed: unknown = JSON.parse(raw);
    if (!Array.isArray(parsed)) return [];
    const games = parsed.filter(
      (g): g is Game =>
        !!g &&
        typeof g === 'object' &&
        'id' in g &&
        'type' in g &&
        Array.isArray((g as Game).players),
    );
    return games.map((g) => {
      if (g.type === 'rummy500') {
        const legacy = g as unknown as {
          target?: unknown;
          rounds?: unknown;
        };
        const rounds = Array.isArray(legacy.rounds)
          ? legacy.rounds.map((raw) => {
              const round = raw as {
                scores?: Scores;
                melds?: Scores;
                hands?: Scores;
              };
              if (round.scores) return { scores: round.scores };
              const melds = round.melds ?? {};
              const hands = round.hands ?? {};
              const scores: Scores = {};
              for (const id of new Set([
                ...Object.keys(melds),
                ...Object.keys(hands),
              ])) {
                const meld = melds[id];
                const hand = hands[id];
                if (meld == null && hand == null) continue;
                scores[id] = (meld ?? 0) - (hand ?? 0);
              }
              return { scores };
            })
          : [];
        return {
          id: g.id,
          type: 'rummy500' as const,
          players: g.players,
          createdAt: g.createdAt,
          updatedAt: g.updatedAt,
          target:
            typeof legacy.target === 'number' ? legacy.target : 500,
          rounds,
        };
      }
      if (g.type === 'custom') {
        if (!Array.isArray(g.conditions)) return { ...g, conditions: [] };
        const fixed = g.conditions.map((c: any) => ({
          playerId: typeof c.playerId === 'string' ? c.playerId : null,
          text: typeof c.text === 'string' ? c.text : String(c),
        }));
        return { ...g, conditions: fixed };
      }
      return g;
    });
  } catch {
    return [];
  }
}

export function saveGames(games: Game[]): void {
  try {
    localStorage.setItem(KEY, JSON.stringify(games));
  } catch {
    // storage unavailable; app still works in-session
  }
}
