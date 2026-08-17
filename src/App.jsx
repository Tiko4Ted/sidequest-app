import { useMemo, useState } from "react";
import {
  Bell,
  Clock3,
  Crosshair,
  MapPin,
  Navigation,
  Plus,
  Radio,
  Sparkles,
  Users,
  Zap,
} from "lucide-react";

const COLORS = {
  orange: "#ff6b2b",
  teal: "#00d4aa",
  purple: "#a78bfa",
  red: "#ff3b30",
  gold: "#fbbf24",
};

const QUESTS = [
  {
    id: "pizza-run",
    emoji: "⚡",
    title: "Pizza Run",
    type: "flash",
    distance: 195,
    angle: 185,
    radius: 70,
    color: COLORS.red,
    tag: "FLASH",
    time: "18 min",
    members: 3,
    max: 5,
    place: "Juja City Mall side gate",
    energy: 4,
  },
  {
    id: "coffee",
    emoji: "☕",
    title: "Coffee",
    type: "casual",
    distance: 210,
    angle: 40,
    radius: 70,
    color: COLORS.orange,
    tag: "2/6",
    time: "Starts 17:20",
    members: 2,
    max: 6,
    place: "Gate C cafes",
    energy: 2,
  },
  {
    id: "football",
    emoji: "⚽",
    title: "Football",
    type: "casual",
    distance: 490,
    angle: 150,
    radius: 105,
    color: COLORS.orange,
    tag: "4/10",
    time: "Starts 18:00",
    members: 4,
    max: 10,
    place: "JKUAT grounds",
    energy: 3,
  },
  {
    id: "blood-drive",
    emoji: "🩸",
    title: "Blood Drive",
    type: "community",
    distance: 860,
    angle: 80,
    radius: 128,
    color: COLORS.teal,
    tag: "COMMUNITY",
    time: "Open now",
    members: 18,
    max: 80,
    place: "Student center",
    energy: 4,
  },
  {
    id: "board-games",
    emoji: "🎲",
    title: "Board Games",
    type: "wildcard",
    distance: 1200,
    angle: 230,
    radius: 128,
    color: COLORS.purple,
    tag: "WILD",
    time: "Starts 19:00",
    members: 4,
    max: 8,
    place: "Kahawa Sukari",
    energy: 3,
  },
  {
    id: "evening-run",
    emoji: "🏃",
    title: "Evening Run",
    type: "casual",
    distance: 760,
    angle: 310,
    radius: 105,
    color: COLORS.orange,
    tag: "3/7",
    time: "Starts 17:45",
    members: 3,
    max: 7,
    place: "Juja Farm Road",
    energy: 2,
  },
];

const GHOST_QUEST = {
  emoji: "🚴",
  title: "Bike Ride",
  meta: "ended 22 min ago",
  members: 5,
};

function App() {
  const [selectedId, setSelectedId] = useState("pizza-run");
  const [joined, setJoined] = useState(() => new Set());
  const [freeActive, setFreeActive] = useState(false);

  const sortedQuests = useMemo(
    () => [...QUESTS].sort((a, b) => a.distance - b.distance),
    [],
  );
  const selected = QUESTS.find((quest) => quest.id === selectedId) ?? QUESTS[0];
  const hasJoined = joined.has(selected.id);

  function toggleJoin(questId) {
    setJoined((current) => {
      const next = new Set(current);
      if (next.has(questId)) {
        next.delete(questId);
      } else {
        next.add(questId);
      }
      return next;
    });
  }

  return (
    <main className="app-shell">
      <section className="phone" aria-label="SideQuest normal user radar">
        <header className="topbar">
          <div>
            <p className="kicker">Juja live</p>
            <h1>SideQuest</h1>
          </div>
          <div className="top-actions">
            <button className="icon-button" title="Notifications" type="button">
              <Bell size={17} />
            </button>
            <div className="avatar" aria-label="AT profile">
              AT
            </div>
          </div>
        </header>

        <section className="pulse-strip" aria-label="Area activity">
          <span className="live-dot" />
          <span>
            <strong>{freeActive ? 24 : 23} people</strong> active
          </span>
          <span className="divider-dot" />
          <span className="quest-count">6 quests</span>
          <span className="location-pill">
            <MapPin size={12} />
            Juja
          </span>
        </section>

        <section className="radar-zone" aria-label="Nearby quests radar">
          <Radar quests={QUESTS} selectedId={selected.id} onSelect={setSelectedId} />
        </section>

        <section className="selected-panel" style={{ "--quest-color": selected.color }}>
          <div className="selected-main">
            <span className="selected-emoji">{selected.emoji}</span>
            <div>
              <p className="selected-label">{selected.tag}</p>
              <h2>{selected.title}</h2>
              <p>
                <MapPin size={12} />
                {selected.place}
              </p>
            </div>
          </div>
          <div className="selected-stats">
            <span>
              <Navigation size={13} />
              {selected.distance}m
            </span>
            <span>
              <Users size={13} />
              {selected.members + (hasJoined ? 1 : 0)}/{selected.max}
            </span>
            <span>
              <Clock3 size={13} />
              {selected.time}
            </span>
          </div>
          <div className="panel-footer">
            <Energy level={selected.energy} color={selected.color} />
            <button
              className={hasJoined ? "join-button joined" : "join-button"}
              type="button"
              onClick={() => toggleJoin(selected.id)}
            >
              {hasJoined ? "Joined" : "Join"}
            </button>
          </div>
        </section>

        <section className="quest-list" aria-label="Nearest quests">
          {sortedQuests.slice(0, 3).map((quest) => (
            <QuestRow
              key={quest.id}
              quest={quest}
              selected={quest.id === selected.id}
              joined={joined.has(quest.id)}
              onSelect={setSelectedId}
              onJoin={toggleJoin}
            />
          ))}

          <article className="ghost-row" aria-label="Recently ended quest">
            <span className="ghost-emoji">{GHOST_QUEST.emoji}</span>
            <div>
              <h3>
                {GHOST_QUEST.title} · {GHOST_QUEST.meta}
              </h3>
              <p>{GHOST_QUEST.members} people · 🔥</p>
            </div>
            <span className="ghost-chip">Ghost</span>
          </article>
        </section>

        <nav className="bottom-actions" aria-label="Primary actions">
          <button
            className={freeActive ? "free-button active" : "free-button"}
            type="button"
            onClick={() => setFreeActive((active) => !active)}
          >
            <Zap size={17} />
            {freeActive ? "Free now" : "I'm Free"}
          </button>
          <button className="post-button" type="button">
            <Plus size={17} />
            Post Quest
          </button>
        </nav>
      </section>
    </main>
  );
}

function Radar({ quests, selectedId, onSelect }) {
  return (
    <svg className="radar" viewBox="0 0 280 280" role="img" aria-label="Radar map of nearby quests">
      <defs>
        <radialGradient id="radarGlow" cx="50%" cy="50%" r="50%">
          <stop offset="0%" stopColor="#ff6b2b" stopOpacity="0.26" />
          <stop offset="42%" stopColor="#ff6b2b" stopOpacity="0.08" />
          <stop offset="100%" stopColor="#07070f" stopOpacity="0" />
        </radialGradient>
        <linearGradient id="sweepGradient" x1="140" y1="26" x2="140" y2="140">
          <stop offset="0%" stopColor="#ff6b2b" stopOpacity="0" />
          <stop offset="100%" stopColor="#ff6b2b" stopOpacity="0.34" />
        </linearGradient>
      </defs>

      <circle cx="140" cy="140" r="132" fill="url(#radarGlow)" />
      {[43, 78, 112, 136].map((radius, index) => (
        <circle
          key={radius}
          cx="140"
          cy="140"
          r={radius}
          className={index === 0 ? "radar-ring inner" : "radar-ring"}
        />
      ))}
      <line x1="140" y1="10" x2="140" y2="270" className="axis" />
      <line x1="10" y1="140" x2="270" y2="140" className="axis" />
      <g className="sweep">
        <path d="M140 140 L140 22 A118 118 0 0 1 217 50 Z" fill="url(#sweepGradient)" />
        <line x1="140" y1="140" x2="140" y2="22" className="sweep-line" />
      </g>

      {["100m", "500m", "1km", "2km"].map((label, index) => (
        <text key={label} x="145" y={140 - [43, 78, 112, 136][index] + 12} className="ring-label">
          {label}
        </text>
      ))}

      {quests.map((quest, index) => {
        const radians = (quest.angle * Math.PI) / 180;
        const x = 140 + quest.radius * Math.sin(radians);
        const y = 140 - quest.radius * Math.cos(radians);
        const selected = selectedId === quest.id;

        return (
          <g
            key={quest.id}
            className={selected ? "quest-dot selected" : "quest-dot"}
            style={{
              "--dot-color": quest.color,
              "--delay": `${index * 0.25}s`,
              transformOrigin: `${x}px ${y}px`,
            }}
            onClick={() => onSelect(quest.id)}
            tabIndex="0"
            role="button"
            aria-label={`${quest.title}, ${quest.distance} meters away`}
            onKeyDown={(event) => {
              if (event.key === "Enter" || event.key === " ") {
                event.preventDefault();
                onSelect(quest.id);
              }
            }}
          >
            <circle cx={x} cy={y} r={selected ? 17 : 14} className="dot-halo" />
            <circle cx={x} cy={y} r={selected ? 12 : 10} className="dot-core" />
            <text x={x} y={y + 4} textAnchor="middle" className="dot-emoji">
              {quest.emoji}
            </text>
          </g>
        );
      })}

      <circle cx="140" cy="140" r="6" className="me-core" />
      <circle cx="140" cy="140" r="18" className="me-pulse" />
      <Crosshair x="128" y="128" width="24" height="24" className="crosshair" />
    </svg>
  );
}

function QuestRow({ quest, selected, joined, onSelect, onJoin }) {
  return (
    <article
      className={selected ? "quest-row selected" : "quest-row"}
      style={{ "--quest-color": quest.color }}
    >
      <button className="row-main" type="button" onClick={() => onSelect(quest.id)}>
        <span className="row-emoji">{quest.emoji}</span>
        <span>
          <strong>{quest.title}</strong>
          <small>{quest.tag}</small>
        </span>
      </button>
      <span className="distance">{quest.distance}m</span>
      <button className={joined ? "mini-join joined" : "mini-join"} type="button" onClick={() => onJoin(quest.id)}>
        {joined ? "In" : "Join"}
      </button>
    </article>
  );
}

function Energy({ level, color }) {
  return (
    <div className="energy" aria-label={`Energy level ${level} of 4`}>
      {[1, 2, 3, 4].map((step) => (
        <span
          key={step}
          className={step <= level ? "on" : ""}
          style={{ "--energy-color": color }}
        />
      ))}
      <small>{level >= 4 ? "Hot" : level >= 3 ? "High" : level >= 2 ? "Med" : "Low"}</small>
    </div>
  );
}

export default App;
