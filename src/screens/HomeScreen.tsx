import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import {
  faCrown,
  faDice,
  faFire,
  faFlag,
  faHeart,
  faLayerGroup,
  faTrophy,
} from '@fortawesome/free-solid-svg-icons';
import type { Game, GameType } from '../types';
import { GAME_TYPE_INFO, summary, winnerIds, playerName } from '../games';

const ORDER: GameType[] = [
  'phase10',
  'fivecrowns',
  'rummy500',
  'golf',
  'custom',
];

const GAME_ICONS = {
  phase10: faLayerGroup,
  fivecrowns: faCrown,
  rummy500: faDice,
  golf: faFlag,
  custom: faTrophy,
};

const JANTY_URL = 'https://dorej.github.io/janty/';

interface Props {
  games: Game[];
  onNew: (type: GameType) => void;
  onOpen: (id: string) => void;
  onDelete: (id: string) => void;
  onOpenFmc: () => void;
}

export default function HomeScreen({
  games,
  onNew,
  onOpen,
  onDelete,
  onOpenFmc,
}: Props) {
  const sorted = [...games].sort((a, b) => b.updatedAt - a.updatedAt);

  return (
    <div className="page home-page">
      <header className="hero-card">
        <div className="hero-copy">
          <span className="eyebrow">Game night, simplified</span>
          <h1>Master of Games</h1>
          <p>
            Track scores for the classics or open Janty for a full firepit party
            game. Everything you need in one place.
          </p>
        </div>
      </header>

      <section className="home-section" aria-labelledby="score-cards-heading">
        <div className="section-heading">
          <div>
            <span className="section-kicker">Score cards</span>
            <h2 id="score-cards-heading">Keep score effortlessly</h2>
            <p>
              Pick a game, add players, and let the app handle rounds and
              winners.
            </p>
          </div>
          <span className="section-count">{ORDER.length} games</span>
        </div>

        <div className="game-type-grid">
          {ORDER.map((type) => {
            const info = GAME_TYPE_INFO[type];
            return (
              <button
                key={type}
                className="game-type-card"
                onClick={() => onNew(type)}
              >
                <span className="game-icon" aria-hidden="true">
                  <FontAwesomeIcon icon={GAME_ICONS[type]} />
                </span>
                <h3>{info.name}</h3>
                <p>{info.blurb}</p>
                <span className="cta">Start scoring →</span>
              </button>
            );
          })}
        </div>

        <div className="saved-panel">
          <div className="saved-panel-heading">
            <h3>Saved games</h3>
            <span className="muted">
              {sorted.length === 0
                ? 'Nothing in progress yet'
                : `${sorted.length} ready to resume`}
            </span>
          </div>
          {sorted.length === 0 ? (
            <p className="muted empty">Start a score card above and it will show up here.</p>
          ) : (
            <ul className="game-list">
              {sorted.map((game) => {
                const winners = winnerIds(game);
                return (
                  <li key={game.id} className="game-list-item">
                    <div className="game-list-main">
                      <span className="pill">
                        {GAME_TYPE_INFO[game.type].name}
                      </span>
                      <strong>
                        {game.players.map((p) => p.name).join(', ')}
                      </strong>
                      <span className="muted">
                        {winners
                          ? `Winner: ${winners
                              .map((id) => playerName(game, id))
                              .join(' & ')}`
                          : summary(game)}
                      </span>
                    </div>
                    <div className="game-list-actions">
                      <button className="btn primary" onClick={() => onOpen(game.id)}>
                        Resume
                      </button>
                      <button
                        className="btn danger"
                        onClick={() => {
                          if (confirm('Delete this game?')) onDelete(game.id);
                        }}
                      >
                        Delete
                      </button>
                    </div>
                  </li>
                );
              })}
            </ul>
          )}
        </div>
      </section>

      <section className="home-section" aria-labelledby="games-heading">
        <div className="section-heading">
          <div>
            <span className="section-kicker">Games</span>
            <h2 id="games-heading">Play something bigger</h2>
            <p>
              Full games with their own rules and flow, ready to open in a new
              tab.
            </p>
          </div>
        </div>

        <div className="game-launch-grid">
          <a
            className="game-card"
            href={JANTY_URL}
            target="_blank"
            rel="noreferrer"
          >
            <div className="game-card-top">
              <span className="game-badge">Party game</span>
              <span className="game-arrow" aria-hidden="true">
                ↗
              </span>
            </div>
            <span className="game-icon" aria-hidden="true">
              <FontAwesomeIcon icon={faFire} />
            </span>
            <h3>Janty</h3>
            <span className="game-alias">Chardee McDennis</span>
            <p>
              Trivia, dares, black cards, and one device per player. Built for
              firepit nights.
            </p>
            <span className="cta">Open Janty →</span>
          </a>

          <button
            type="button"
            className="game-card"
            onClick={onOpenFmc}
          >
            <div className="game-card-top">
              <span className="game-badge">Party game</span>
              <span className="game-arrow" aria-hidden="true">
                ↗
              </span>
            </div>
            <span className="game-icon" aria-hidden="true">
              <FontAwesomeIcon icon={faHeart} />
            </span>
            <h3>Fuck, Marry, Cancel</h3>
            <span className="game-alias">Pass-and-play</span>
            <p>
              Draw three names, hand out the three fates, and let the table
              argue about it.
            </p>
            <span className="cta">Open game →</span>
          </button>
        </div>
      </section>
    </div>
  );
}
