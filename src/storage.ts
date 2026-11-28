import type {
  FmcChoice,
  FmcRound,
  FmcState,
  Game,
  Scores,
} from './types';

const KEY = 'score-card.games.v1';
const FMC_KEY = 'score-card.fmc.v1';

export const EMPTY_FMC_STATE: FmcState = {
  mode: 'custom',
  players: [],
  nominees: [],
  turn: 0,
  draw: [],
  history: [],
};

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

function stringList(value: unknown): string[] {
  if (!Array.isArray(value)) return [];
  return value
    .filter((item): item is string => typeof item === 'string')
    .map((item) => item.trim())
    .filter(Boolean);
}

export function loadFmcState(): FmcState {
  try {
    const raw = localStorage.getItem(FMC_KEY);
    if (!raw) return EMPTY_FMC_STATE;
    const parsed: unknown = JSON.parse(raw);
    if (!parsed || typeof parsed !== 'object') return EMPTY_FMC_STATE;
    const data = parsed as Partial<FmcState>;
    const history: FmcRound[] = Array.isArray(data.history)
      ? data.history.flatMap((rawRound): FmcRound[] => {
          if (!rawRound || typeof rawRound !== 'object') return [];
          const round = rawRound as Partial<FmcRound>;
          const picksRaw =
            round.picks && typeof round.picks === 'object'
              ? (round.picks as Record<string, unknown>)
              : {};
          const picks = {} as Record<FmcChoice, string>;
          for (const choice of ['fuck', 'marry', 'cancel'] as const) {
            const value = picksRaw[choice];
            picks[choice] = typeof value === 'string' ? value : '';
          }
          return [
            {
              playerName:
                typeof round.playerName === 'string'
                  ? round.playerName
                  : 'Player',
              nominees: stringList(round.nominees),
              picks,
              at: typeof round.at === 'number' ? round.at : 0,
            },
          ];
        })
      : [];
    return {
      mode: data.mode === 'random' ? 'random' : 'custom',
      players: stringList(data.players),
      nominees: stringList(data.nominees),
      turn:
        typeof data.turn === 'number' && Number.isFinite(data.turn)
          ? Math.max(0, Math.floor(data.turn))
          : 0,
      draw: stringList(data.draw),
      history,
    };
  } catch {
    return EMPTY_FMC_STATE;
  }
}

export function saveFmcState(state: FmcState): void {
  try {
    localStorage.setItem(FMC_KEY, JSON.stringify(state));
  } catch {
    // storage unavailable; app still works in-session
  }
}
