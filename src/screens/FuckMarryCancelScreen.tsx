import { useEffect, useState } from 'react';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import {
  faBan,
  faDice,
  faFire,
  faHeart,
  faPen,
  faRotateLeft,
  faShuffle,
  faTrash,
} from '@fortawesome/free-solid-svg-icons';
import type { FmcChoice, FmcMode, FmcState } from '../types';
import { EMPTY_FMC_STATE, loadFmcState, saveFmcState } from '../storage';

const CHOICES = [
  {
    key: 'fuck' as const,
    label: 'Fuck',
    hint: 'The chaotic pick',
    icon: faFire,
  },
  {
    key: 'marry' as const,
    label: 'Marry',
    hint: 'The keeper',
    icon: faHeart,
  },
  {
    key: 'cancel' as const,
    label: 'Cancel',
    hint: 'The hard pass',
    icon: faBan,
  },
];

const MODES = [
  {
    key: 'custom' as const,
    label: 'Custom',
    hint: 'Bring your own names, inside jokes, and enemies.',
    icon: faPen,
  },
  {
    key: 'random' as const,
    label: 'Random',
    hint: 'Generate a chaotic mix of unhinged people and characters.',
    icon: faDice,
  },
];

const NOMINEE_POOL = [
  'Keanu Reeves',
  'Pedro Pascal',
  'Aubrey Plaza',
  'Steve Martin',
  'Martin Short',
  'Mu Deng the Hippo',
  "Your Mom's Ex",
  "Your Dad's One Friend Who Calls You 'Buddy'",
  'The Guy Who Stole Your Lunch in Third Grade',
  'Your High School Nemesis',
  "Your Mom's Hairdresser",
  'John Mulaney',
  'Ali Wong',
  'Kate McKinnon',
  'Phoebe Waller-Bridge',
  'Steve Carell',
  'Tina Fey',
  'Amy Poehler',
  'Hasan Minhaj',
  'Jim Gaffigan',
  'Miguel Rodriguez',
  'Bo Burnham',
  'MrBeast',
  'Emma Chamberlain',
  'Charli D’Amelio',
  'Kai Cenat',
  'IShowSpeed',
  'Addison Rae',
  'Ryan Trahan',
  'Khaby Lame',
  'Billie Eilish',
  'Beyoncé',
  'Rihanna',
  'Olivia Rodrigo',
  'SZA',
  'Lady Gaga',
  'Kendrick Lamar',
  'Serena Williams',
  'Simone Biles',
  'Shohei Ohtani',
  'Naomi Osaka',
  'Caitlin Clark',
  'Batman',
  'Spider-Man',
  'Hermione Granger',
  'Darth Vader',
  'Wonder Woman',
  'Tony Stark',
  'Wednesday Addams',
  'SpongeBob SquarePants',
  'Michael Scott',
  'Sherlock Holmes',
  'Katniss Everdeen',
  'The Girl Who Dumped You in Seventh Grade',
  "Your Friend's Mom Who Says 'Hi Sweetie'",
  'The Barista Who Always Gets Your Name Wrong',
  "Your Ex's Best Friend",
  'Your Old Boss Who Micro-Managed',
  'The Teacher Who Obviously Hated You',
  'The Guy Who Sold You a Used Mattress',
  'The Neighbor Who Mows at 7 A.M.',
  'Cleopatra',
  'Napoleon Bonaparte',
  'Nikola Tesla',
  'Albert Einstein',
  'Leonardo da Vinci',
  'Vincent van Gogh',
  'Pablo Picasso',
  'Marie Curie',
  'Isaac Newton',
  'Galileo Galilei',
  'Socrates',
  'Julius Caesar',
  'Genghis Khan',
  'Elizabeth I',
  'Leonidas',
  'Mindy Kaling',
  'Kumail Nanjiani',
  'Randall Park',
  'Steven Yeun',
  'Tiffany Haddish',
  'Kevin Hart',
  'Will Ferrell',
  'Ben Stiller',
  'Owen Wilson',
  'Patton Oswalt',
  'Nick Kroll',
  'Jenny Slate',
  'Maya Rudolph',
  'Andy Samberg',
  'Logan Paul',
  'Jake Paul',
  'Dixie D’Amelio',
  'Noah Beck',
  'Bella Poarch',
  'Alex Warren',
  'Duke Dennis',
  'Zach Choi',
  'Ryan Bergara',
  'Shane Madej',
  'Cody Ko',
  'Megan Thee Stallion',
  'Dolly Parton',
  'Prince',
  'Freddie Mercury',
  'David Bowie',
  'Venus Williams',
  'Shaun White',
  'Chloe Kim',
  "The Guy Who Thinks He's a Podcast Bro",
  "Your Cousin Who Still Lives in His Parents' Basement",
  'The Person Who Left You on Read for Three Years',
  'The Guy Who Cried at a Goose',
  "Your Ex's Mom Who Still Likes Your Posts",
  'The Guy Who Named His Cat After His Ex',
  'The Person Who Corrects Your Pronunciation',
  'The Friend Who Always Cancels Last Minute',
  "The Guy Who Says 'Let's Circle Back'",
  'The Neighbor Who Leaves Notes on Your Car',
  'The Guy Who Got Away With It in High School',
  'The Girl From the DMs Who Ghosted You',
  'The Guy Who Put His Ex on the Guest List',
  'Your Friend From the Group Project Who Did Nothing',
  'The Guy Who Took a Selfie With Your Mom',
  "Your Cousin's Weird Instagram Phase",
  'The Guy Who Brought a Slide to the Party',
  'The Dude Who Always Has a Story About His Car',
  'Harry Potter',
  'Ron Weasley',
  'Dumbledore',
  'Voldemort',
  'Frodo Baggins',
  'Samwise Gamgee',
  'Gandalf',
  'Legolas',
  'Aragorn',
  'Luke Skywalker',
  'Leia Organa',
  'Han Solo',
  'Chewbacca',
  'Yoda',
  'Captain America',
  'Black Widow',
  'Black Panther',
  'Doctor Strange',
  'Scarlet Witch',
  'Hulk',
  'Thor',
  'Loki',
  'Deadpool',
  'Wolverine',
  'Elsa',
  'Anna',
  'Olaf',
  'Moana',
  'Mulan',
  'Ariel',
  'Simba',
  'Timon',
  'Pumbaa',
  'Dory',
  'Nemo',
  'Wall-E',
  'Walter White',
  'Jesse Pinkman',
  'Gus Fring',
  'Tony Soprano',
  'Don Corleone',
  'Jim Halpert',
  'Dwight Schrute',
  'Pam Beesly',
  'Ryan Howard',
  'Angela Martin',
  'Kevin Malone',
  'Stanley Hudson',
  'Creed Bratton',
  'Erin Hannon',
  'Toby Flenderson',
  'Rachel Green',
  'Monica Geller',
  'Chandler Bing',
  'Joey Tribbiani',
  'Phoebe Buffay',
  'Ross Geller',
  'Jerry Seinfeld',
  'George Costanza',
  'Elaine Benes',
  'Cosmo Kramer',
  'The Neighbor Who Knows Too Much',
  "The Guy Who Gave You That Bad Haircut",
  'The Person Who Texts You at Midnight',
  "Your Mom's Group Chat",
  'The Emo Kid From Your Seventh Grade Class',
  'The Substitute Teacher Who Cried',
  "That One Cousin Who Won't Stop Talking About Crypto",
  "Your Ex's New Person",
  'The DJ at a Wedding Nobody Asked For',
  'The Guy Who Explains Inception at Parties',
  "Someone Who Says 'Actually' a Lot",
  'The Intern Who Broke Production',
  'A Middle Management Demon',
  'A Parking Enforcement Officer With Feelings',
  'A Self-Help Guru Who Lives in a Van',
  "The Guy Who Always Says 'We Should Get Coffee'",
  'The Last Person to Use the Office Microwave',
  'A Clown at a Hospital Opening',
  "Florida Man, But It's Your Uncle",
  'A Guy Named Chad Who Peaked in 2014',
  'A Tax Lawyer From the Future',
  'The Person Who Returned a Shopping Cart',
  "Your Mom's Ex's New Girlfriend",
  "Your Dad's Golf Buddy",
  "Your Sister's Boyfriend's Brother",
  'The Guy Who Left a One-Star Yelp Review',
  "Your Neighbor's Son Who Mowed Your Lawn Once",
  'The Person Who Stole Your Seat on the Plane',
  "Your Mom's Friend Who Calls You Sweetie",
  'The Guy Who Owns Too Many Hats',
  'The Person Who Brought a Casserole to a Breakup',
  'The Guy Who Went Viral Yelling at a Goose',
  'The Guy Who Talked Through the Entire Movie',
  'The Person Who Claps When the Plane Lands',
  'The Guy Who Wears a Suit to a BBQ',
  'The Person Who Never Returns Tupperware',
  'The Guy Who Calls Everyone Bro',
  'The Cousin Who Still Uses a Flip Phone',
  'The Guy Who Cut the Line and Then Apologized',
  'The Person Who Brought a Folding Chair to a Fight',
  'The Guy Who Brought a Boombox to a Funeral',
  "The Guy Who Says 'Trust Me, Bro'",
  "Your Mom's Neighbor Who Always Has Advice",
  'The Guy Who Brought a Laser Pointer to the Meeting',
  'The Person Who Always Has a Borderline Illegal Coupon',
  'The Girl Who Sat Next to You in Third Grade',
  'The Guy Who Still Talks About His Glory Days',
  "Your Dad's Friend With the Boat Nobody Wants to Ride",
  'The Cousin Who Married Their High School Sweetheart',
  'The Guy Who Knows the Owner of Every Restaurant',
  "The Person Who Says 'I'm Not Like Other People'",
  'The Guy Who Brought His Own Tupperware to a Buffet',
  'The Neighbor Whose Dog Barks at 3 A.M.',
  'The Guy Who Thinks He Is a Detective',
  'The Person Who Always Wins at Charades',
  "Your Friend's Sister Who Has a Podcast",
  'The Guy Who Went to Prom Alone and Loved It',
  'The Person Who Corrects Every Single Fact',
  "The Guy Who Calls His Car 'She'",
  'The Cousin Who Shows Up Every Holiday With a New Personality',
  'The Guy Who Fell Asleep at His Own Bachelor Party',
  "Your Mom's Friend From the Book Club",
  'The Guy Who Still Uses a Fax Machine',
  'The Person Who Always Has Gum',
  'The Guy Who Wears Sunglasses Indoors',
  'The Neighbor Who Borrows Your Tools and Never Returns Them',
  'The Guy Who Has a Story About Every Celebrity Sighting',
  'The Person Who Brought a Birthday Cake to a Work Meeting',
  'The Guy Who Cries at Car Commercials',
  'The Girl Who Always Has a Better Story',
  'Your Old Roommate Who Stole Your Chair',
];

const RANDOM_LIST_SIZE = 24;

function emptyPicks(): Record<FmcChoice, string> {
  return { fuck: '', marry: '', cancel: '' };
}

function toLines(value: string): string[] {
  return value
    .split('\n')
    .map((line) => line.trim())
    .filter(Boolean);
}

function uniqueLines(lines: string[]): string[] {
  return Array.from(new Set(lines));
}

function shuffled<T>(items: readonly T[]): T[] {
  const result = [...items];
  for (let i = result.length - 1; i > 0; i -= 1) {
    const j = Math.floor(Math.random() * (i + 1));
    [result[i], result[j]] = [result[j], result[i]];
  }
  return result;
}

function generateNominees(): string[] {
  return uniqueLines(shuffled(NOMINEE_POOL).slice(0, RANDOM_LIST_SIZE));
}

function drawKey(names: string[]): string {
  return [...names].sort((a, b) => a.localeCompare(b)).join('||');
}

function drawTrio(nominees: string[], history: FmcState['history']): string[] {
  const used = new Set(history.map((round) => drawKey(round.nominees)));
  let lastTrio: string[] = [];

  for (let attempt = 0; attempt < 80; attempt += 1) {
    const pool = [...nominees];
    const trio: string[] = [];
    while (trio.length < 3 && pool.length > 0) {
      const index = Math.floor(Math.random() * pool.length);
      trio.push(pool.splice(index, 1)[0]);
    }
    if (trio.length < 3) break;
    lastTrio = trio;
    if (!used.has(drawKey(trio))) return trio;
  }

  return lastTrio;
}

interface Props {
  onBack: () => void;
}

export default function FuckMarryCancelScreen({ onBack }: Props) {
  const [state, setState] = useState<FmcState>(() => {
    const loaded = loadFmcState();
    return loaded.players.length > 0
      ? loaded
      : { ...loaded, players: ['', ''] };
  });
  const [selectedMode, setSelectedMode] = useState<FmcMode | null>(null);
  const [picks, setPicks] = useState<Record<FmcChoice, string>>(emptyPicks);
  const [showReveal, setShowReveal] = useState(false);

  useEffect(() => {
    saveFmcState(state);
  }, [state]);

  const activePlayers = state.players
    .map((player) => player.trim())
    .filter(Boolean);
  const currentPlayer =
    activePlayers.length > 0
      ? activePlayers[state.turn % activePlayers.length]
      : 'Player 1';
  const ready = activePlayers.length >= 2 && state.nominees.length >= 3;
  const pickedNames = CHOICES.map((choice) => picks[choice.key].trim()).filter(
    Boolean,
  );
  const picksComplete =
    state.draw.length === 3 &&
    pickedNames.length === 3 &&
    new Set(pickedNames).size === 3;

  function chooseMode(mode: FmcMode) {
    if (mode === 'random') {
      setPicks(emptyPicks());
      setShowReveal(false);
    }
    setState((prev) => ({
      ...prev,
      mode,
      nominees: mode === 'random' ? generateNominees() : prev.nominees,
      draw: mode === 'random' ? [] : prev.draw,
    }));
    setSelectedMode(mode);
  }

  function updatePlayer(index: number, value: string) {
    setState((prev) => ({
      ...prev,
      players: prev.players.map((name, i) => (i === index ? value : name)),
    }));
  }

  function addPlayer() {
    if (state.players.length >= 10) return;
    setState((prev) => ({ ...prev, players: [...prev.players, ''] }));
  }

  function removePlayer(index: number) {
    setState((prev) => {
      const players = prev.players.filter((_, i) => i !== index);
      return {
        ...prev,
        players,
        turn: Math.min(prev.turn, Math.max(players.length - 1, 0)),
      };
    });
  }

  function updateNominees(value: string) {
    const nominees = uniqueLines(toLines(value));
    const nextDraw = state.draw.filter((name) => nominees.includes(name));
    if (nextDraw.length !== state.draw.length) setPicks(emptyPicks());
    setState((prev) => ({ ...prev, nominees, draw: nextDraw }));
  }

  function drawNames() {
    if (!ready) return;
    setState((prev) => ({
      ...prev,
      draw: drawTrio(prev.nominees, prev.history),
    }));
    setPicks(emptyPicks());
    setShowReveal(false);
  }

  function lockPicks() {
    if (!picksComplete) return;
    const round = {
      playerName: currentPlayer,
      nominees: [...state.draw],
      picks: {
        fuck: picks.fuck.trim(),
        marry: picks.marry.trim(),
        cancel: picks.cancel.trim(),
      },
      at: Date.now(),
    };
    setState((prev) => ({
      ...prev,
      history: [round, ...prev.history],
      turn: prev.turn + 1,
      draw: [],
    }));
    setPicks(emptyPicks());
    setShowReveal(true);
  }

  function resetHistory() {
    if (!confirm('Clear all Fuck, Marry, Cancel rounds?')) return;
    setState((prev) => ({ ...prev, history: [], turn: 0, draw: [] }));
    setPicks(emptyPicks());
    setShowReveal(false);
  }

  function clearEverything() {
    if (!confirm('Clear players, nominees, and all rounds?')) return;
    setState({ ...EMPTY_FMC_STATE, players: ['', ''] });
    setSelectedMode(null);
    setPicks(emptyPicks());
    setShowReveal(false);
  }

  const lastRound = state.history[0];

  return (
    <div className="page wide game-theme" data-game="fmc">
      <header className="page-header">
        <button className="btn ghost back" onClick={onBack}>
          ← All games
        </button>
        <h1>Fuck, Marry, Cancel</h1>
        <p className="muted">
          One device, the whole table. Draw three names, assign all three
          fates, then pass it on.
        </p>
      </header>

      <details className="rules">
        <summary>How to play</summary>
        <ul>
          <li>
            Pick Custom or Random, then add at least two players and three
            nominees.
          </li>
          <li>
            The active player draws three nominees and assigns one to each
            bucket: Fuck, Marry, or Cancel.
          </li>
          <li>Lock in the picks to reveal them and pass the device.</li>
          <li>
            Random mode keeps its nominee pool hidden and reveals names only
            when you draw.
          </li>
        </ul>
      </details>

      {selectedMode === null ? (
        <section className="fmc-mode-intro">
          <h2>Choose your nominee source</h2>
          <p className="muted">
            Use your own list, or let the app throw a weird mix at the table.
          </p>
          <div className="fmc-mode-grid">
            {MODES.map((mode) => (
              <button
                type="button"
                key={mode.key}
                className="fmc-mode-card"
                onClick={() => chooseMode(mode.key)}
              >
                <span className="fmc-mode-icon" aria-hidden="true">
                  <FontAwesomeIcon icon={mode.icon} />
                </span>
                <h3>{mode.label}</h3>
                <p>{mode.hint}</p>
                <span className="cta">Choose {mode.label} →</span>
              </button>
            ))}
          </div>
        </section>
      ) : (
        <>
          <div className="fmc-mode-bar">
            {MODES.map((mode) => (
              <button
                type="button"
                key={mode.key}
                className={`fmc-mode-chip ${
                  selectedMode === mode.key ? 'active' : ''
                }`}
                onClick={() => chooseMode(mode.key)}
              >
                <FontAwesomeIcon icon={mode.icon} /> {mode.label}
              </button>
            ))}
            <button
              type="button"
              className="btn ghost small"
              onClick={() => setSelectedMode(null)}
            >
              ← Change mode
            </button>
          </div>

          <div className="fmc-setup-grid">
            <section className="setup-section">
              <h2 className="section-title">Players</h2>
              <p className="muted">At least two players, up to ten.</p>
              <div className="fmc-player-inputs">
                {state.players.map((name, index) => (
                  <div key={index} className="fmc-player-row">
                    <input
                      aria-label={`Player ${index + 1}`}
                      placeholder={`Player ${index + 1}`}
                      value={name}
                      onChange={(event) => updatePlayer(index, event.target.value)}
                    />
                    {state.players.length > 2 && (
                      <button
                        type="button"
                        className="btn danger small"
                        aria-label={`Remove player ${index + 1}`}
                        onClick={() => removePlayer(index)}
                      >
                        <FontAwesomeIcon icon={faTrash} />
                      </button>
                    )}
                  </div>
                ))}
              </div>
              {state.players.length < 10 && (
                <button type="button" className="btn ghost" onClick={addPlayer}>
                  + Add player
                </button>
              )}
            </section>

            {state.mode === 'custom' ? (
              <section className="setup-section">
                <h2 className="section-title">Custom nominees</h2>
                <p className="muted">One name per line. At least three.</p>
                <textarea
                  aria-label="Custom nominees"
                  rows={5}
                  value={state.nominees.join('\n')}
                  onChange={(event) => updateNominees(event.target.value)}
                  placeholder={'Celebrity A\nCelebrity B\nCharacter C'}
                />
              </section>
            ) : (
              <section className="setup-section fmc-random-panel">
                <h2 className="section-title">Random nominees</h2>
                <p className="muted">
                  A hidden nominee pool is assigned automatically. Names appear
                  only when you draw.
                </p>
                <span className="pill">
                  {state.nominees.length} hidden nominees
                </span>
              </section>
            )}
          </div>

          <section className="setup-section fmc-turn-panel">
            <div className="fmc-status">
              <span className="pill">Turn {state.turn + 1}</span>
              <strong>{currentPlayer}'s pick</strong>
              <span className="muted">
                {state.nominees.length} nominee
                {state.nominees.length === 1 ? '' : 's'} in the deck
              </span>
            </div>

            {!ready && (
              <p className="muted small-note">
                Add at least two players and three nominees to start drawing.
              </p>
            )}

            <div className="fmc-actions">
              <button
                type="button"
                className="btn primary"
                disabled={!ready}
                onClick={drawNames}
              >
                <FontAwesomeIcon icon={faShuffle} />
                {state.draw.length > 0 ? ' Redraw names' : ' Draw three names'}
              </button>
              <button
                type="button"
                className="btn fmc-lock"
                disabled={!picksComplete}
                onClick={lockPicks}
              >
                Lock in picks
              </button>
            </div>

            {state.draw.length > 0 && (
              <div className="fmc-draw" aria-label="Drawn nominees">
                {state.draw.map((name) => (
                  <span key={name} className="fmc-nominee">
                    {name}
                  </span>
                ))}
              </div>
            )}
          </section>

          {state.draw.length > 0 && (
            <section className="fmc-buckets" aria-label="Assign fates">
              {CHOICES.map((choice) => (
                <div key={choice.key} className={`fmc-bucket ${choice.key}`}>
                  <span className="fmc-bucket-icon" aria-hidden="true">
                    <FontAwesomeIcon icon={choice.icon} />
                  </span>
                  <h2>{choice.label}</h2>
                  <p>{choice.hint}</p>
                  <select
                    aria-label={`${choice.label} pick`}
                    value={picks[choice.key]}
                    onChange={(event) =>
                      setPicks((prev) => ({
                        ...prev,
                        [choice.key]: event.target.value,
                      }))
                    }
                  >
                    <option value="">Choose a name</option>
                    {state.draw.map((name) => (
                      <option
                        key={name}
                        value={name}
                        disabled={CHOICES.some(
                          (other) =>
                            other.key !== choice.key && picks[other.key] === name,
                        )}
                      >
                        {name}
                      </option>
                    ))}
                  </select>
                </div>
              ))}
            </section>
          )}

          {showReveal && lastRound && (
            <section className="fmc-reveal">
              <div className="fmc-reveal-head">
                <span className="pill">Last round</span>
                <h2>{lastRound.playerName} picked</h2>
              </div>
              <div className="fmc-reveal-grid">
                {CHOICES.map((choice) => (
                  <div
                    key={choice.key}
                    className={`fmc-reveal-cell ${choice.key}`}
                  >
                    <span>{choice.label}</span>
                    <strong>{lastRound.picks[choice.key]}</strong>
                  </div>
                ))}
              </div>
            </section>
          )}

          <section className="setup-section fmc-history">
            <div className="fmc-history-head">
              <h2 className="section-title">Round history</h2>
              <div className="fmc-history-actions">
                <button
                  type="button"
                  className="btn small"
                  disabled={state.history.length === 0}
                  onClick={resetHistory}
                >
                  <FontAwesomeIcon icon={faRotateLeft} /> Reset rounds
                </button>
                <button
                  type="button"
                  className="btn small danger"
                  onClick={clearEverything}
                >
                  <FontAwesomeIcon icon={faTrash} /> Clear all
                </button>
              </div>
            </div>

            {state.history.length === 0 ? (
              <p className="muted empty">
                No rounds yet. Draw three names to begin.
              </p>
            ) : (
              <ol className="fmc-history-list">
                {state.history.map((round, index) => (
                  <li key={`${round.at}-${index}`}>
                    <span className="fmc-history-round">
                      #{state.history.length - index}
                    </span>
                    <strong>{round.playerName}</strong>
                    <span className="muted">
                      {CHOICES.map(
                        (choice) =>
                          `${choice.label}: ${round.picks[choice.key]}`,
                      ).join(' · ')}
                    </span>
                  </li>
                ))}
              </ol>
            )}
          </section>
        </>
      )}
    </div>
  );
}
