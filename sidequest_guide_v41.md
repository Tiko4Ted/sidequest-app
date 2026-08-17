# SideQuest — Complete Development Guide v4.1
### Self-contained · Complexity-trimmed · Ready for Claude Code CLI

> **One file. Everything you need. Nothing you don't.**
> Copy Part 2 into `CLAUDE.md`. Follow the stages in order.
> Do not skip stages. Verify each stage before moving to the next.

---

## Part 0 — Install Claude Code

```bash
npm install -g @anthropic-ai/claude-code
claude --version
claude login
# or: export ANTHROPIC_API_KEY=sk-ant-your-key
```

---

## Part 1 — Project Structure

```bash
mkdir -p sidequest/{apps/api,apps/mobile,packages/shared-types,packages/db,infra}
cd sidequest && git init && pnpm init
```

```
sidequest/
├── CLAUDE.md                    ← paste Part 2 here
├── .claudeignore                ← paste Part 3 here
├── apps/api/                    ← Fastify backend
├── apps/mobile/                 ← React Native (Expo)
├── packages/shared-types/       ← shared TypeScript interfaces
├── packages/db/                 ← Drizzle ORM schema + migrations
├── infra/docker-compose.yml
└── .env.example
```

---

## Part 2 — CLAUDE.md

Paste this entire block into `sidequest/CLAUDE.md`.

````markdown
# SideQuest — CLAUDE.md

## What This App Is
SideQuest is a hyper-local spontaneity engine. Users post time-limited activities
("quests"). A squad chat auto-opens when 3 people join. Everything dissolves after
the activity ends. No followers. No persistent social graph. Just the city, right now.

**The one question it answers on open:** "What can I do right now, near me, with other people?"

## Repository Layout
- `apps/api`            Fastify v4 + TypeScript backend
- `apps/mobile`         React Native (Expo SDK 51) mobile app
- `packages/shared-types` TypeScript interfaces shared across apps
- `packages/db`         Drizzle ORM schema + migrations
- `infra/`              Docker Compose for local Postgres + Redis

## Tech Stack — Do Not Deviate
- Runtime:    Node.js 20 + TypeScript strict (no `any`)
- API:        Fastify v4 + @fastify/jwt, @fastify/cors, @fastify/rate-limit, @fastify/compress
- Real-time:  Socket.io v4 — TWO namespaces: /quest (rooms) and /area (city broadcasts)
- Database:   PostgreSQL 15 + PostGIS 3.4 via Drizzle ORM
- Cache:      Redis 7 via ioredis
- Jobs:       BullMQ v5 with Redis
- Auth:       Supabase Auth (Google OAuth) — JWT verified in Fastify
- Storage:    Supabase Storage
- Payments:   Safaricom Daraja API (M-Pesa STK Push)
- Push:       Expo Notifications + FCM + APNs
- Images:     Sharp for story card generation
- Mobile:     React Native + Expo SDK 51 + NativeWind v4 + Zustand + Reanimated 3
- Maps:       Mapbox GL (React Native Mapbox Maps)
- Monorepo:   pnpm workspaces + turborepo

## Environment Variables
DATABASE_URL, REDIS_URL, SUPABASE_URL, SUPABASE_SERVICE_KEY, SUPABASE_JWT_SECRET,
DARAJA_CONSUMER_KEY, DARAJA_CONSUMER_SECRET, DARAJA_SHORTCODE, DARAJA_PASSKEY,
DARAJA_CALLBACK_URL, EXPO_ACCESS_TOKEN, MAPBOX_TOKEN, PORT=3000, NODE_ENV

## API Response Envelope
Success: `{ data: <payload>, error: null }`
Failure: `{ data: null, error: { message: string, code: string } }`
All routes prefixed: `/api/v1/`

## Database Rules
- Geo columns: `geography(POINT, 4326)` — never `geometry`
- Geo queries: `ST_DWithin` with geography type (metres)
- All PKs: `uuid DEFAULT gen_random_uuid()`
- All tables: `created_at timestamptz DEFAULT now()`
- Never `SELECT *` — always name columns

## Socket.io Rules
- /quest namespace: room per quest_id, joined after joining a quest
- /area namespace: room per city name, joined on connect
- Never broadcast globally — always scope to a room
- Emit format: `{ event: string, payload: object, timestamp: string }`

## BullMQ Rules
- All job files in `apps/api/src/jobs/`
- Job names: lowercase dots — `quest.expire`, `daily.seed_defaults`
- All jobs: `{ attempts: 3, backoff: { type: 'exponential', delay: 5000 } }`

## Mobile Rules
- NativeWind v4 for all styling — no StyleSheet.create
- Zustand stores in `apps/mobile/src/stores/` — one per domain
- All API calls through `apps/mobile/src/lib/api.ts`
- Socket.io client in `apps/mobile/src/lib/socket.ts`
- Navigation: Expo Router file-based

## Colour Tokens
orange: '#ff6b2b'  | casual quests
teal:   '#00d4aa'  | community quests
purple: '#a78bfa'  | I'm Free
flash:  '#ff3b30'  | flash quests
gold:   '#fbbf24'  | defaults / badges
bg:     '#07070f'  | background
s1:     '#10101a'  | surface 1
s2:     '#181826'  | surface 2
s3:     '#22223a'  | surface 3

## The 9 Vibe Principles — Never Violate
1. No followers — ever
2. Quests dissolve — always
3. Chat deletes on dissolution — always
4. Feed is local — always
5. No ads in the quest feed — ever
6. Wild Cards stay weird — personality, not marketing
7. Story Cards look handmade — personal, not corporate
8. Streak badge on avatar, visible to everyone in the feed
9. The map must glow at night

## Quest Types
`casual` | `community` | `flash` | `wildcard` | `default`
- flash:   hard 30-min expiry, max_size ≤ 5, 1km radius, fixed
- default: is_default=true, poster_id=null, resets daily
- wildcard: system-generated, purple styling

## Profile Access Rules
A user can view another user's profile ONLY if:
  (a) They are in the same active quest, OR
  (b) They have participated in a quest together (squad_memory row exists)
No global user search. No random profile browsing.
Enforced on GET /api/v1/users/:id — return 403 if no shared quest.

## Story Card Visibility Rules
When viewing a quest card on someone's profile:
  Shared quest (viewer participated): FULL — photos, vibe, context, attendance photo
  Non-shared quest: LIMITED — emoji, title, date, vibe rating only. Photos hidden.

## Quest Detail Visibility (Non-Members)
Non-members CAN see: emoji, title, description, start_time, location_label (approximate), squad count
Non-members CANNOT see: exact coordinates, chat, member list, arrival map
On join: exact location unlocks immediately. Chat unlocks at 3 members.

## Full Quest Behavior
Quests at max_size stay visible on radar and feed — never removed.
Visual state: dimmed, "FULL" badge, no Join button.
Actions available: "View details" | "Create similar quest" (pre-fills post form).

## Key Business Logic

### Squad Chat Unlock
Fires when member count reaches EXACTLY 3.
Emits `chat_unlocked` + `formation_moment` to /quest room.
Sets squad_name (auto-generated) on the quest.

### I'm Free Cooldown
1 broadcast per 6h per user.
Check: (now - users.last_free_broadcast_at) < 6h → 429 with minutes_remaining.

### Hype Decay
recent_hype = reactions WHERE reacted_at > NOW() - 2h.
Updated every 15 min by BullMQ quest.hype_decay.

### Energy Score (2 signals)
```
energy = min(reactions_30min / 10, 1) × 0.55
       + min(new_joins_10min  / 3,  1) × 0.45
Level: ≥0.75=Hot(●●●●) | ≥0.50=High(●●●○) | ≥0.25=Med(●●○○) | <0.25=Low(●○○○)
Recalculated every 2 min by BullMQ.
```

### Contact-Swap
BullMQ fires 30min before expires_at → emits contact_swap_open to quest room.
Users share structured card: platform (instagram|twitter|phone) + value.
Supabase RLS on contact_swaps table restricts reads to quest members only.
Chat still deletes at dissolution. Contact swap is a separate record.

### Quest Stories — Two Tiers
Tier 1 (Org/Poster official record):
  Poster only. Max 5 posts. Up to 3 photos + caption (300 chars). 48h post-dissolution window.
  PERMANENT — never deleted. Feeds into org_mission_log.
  Visible to everyone on the quest detail page.

Tier 2 (Member attendance photo):
  One photo per squad member. No caption.
  Upload window: AFTER dissolution only — quest.expires_at to quest.expires_at + 12h.
  Replaceable within window. Locked after 12h.
  expires_at = quest.expires_at + 72h (deleted after).
  Visible ONLY through the photo owner's profile, AND only to viewers who participated.

### Content Lifecycle
Quests:                temporary — expires_at enforced
Chats:                 deleted on dissolution
Personal story cards:  72h TTL from quest.expires_at
Member attendance:     72h TTL from quest.expires_at
Org story photos:      permanent — feed mission log
Org Mission Log:       permanent — public structured record

### Quest Mention Triggers
Fires when: squad reaches 3 members OR energy first crosses 0.75.
Pushes to poster. Deduped via Redis (24h window per quest per trigger type).

## Revenue Logic
Event Promoter boost: is_boosted=true, boost_radius_km, boost_expires_at after Daraja confirms.
Org Pro: is_org_pro=true, org_pro_expires_at after subscription confirmed.

## What Claude Must NEVER Do
- Use `any` TypeScript type
- Use `console.log` — use Fastify logger: `request.log.info`
- Use `SELECT *`
- Store plaintext secrets or contact values without RLS
- Skip input validation on any route
- Use `geometry` type for geo (always `geography`)
- Create a global Socket.io broadcast
- Add a followers table, follower count, or follower mechanic
- Allow Tier 2 member photos during an active quest (after dissolution only)
- Allow Tier 1 story posts after the 48h window
- Show member attendance photos to non-participants
- Show exact location, chat, or member list to non-members
- Remove full quests from radar — show them in FULL state
- Delete quest_stories rows — they are permanent

---

## FULL DATABASE SCHEMA

```sql
CREATE EXTENSION IF NOT EXISTS postgis;
CREATE EXTENSION IF NOT EXISTS "pgcrypto";

-- ── USERS ────────────────────────────────────────────────────────
CREATE TABLE users (
  id                     uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  name                   text NOT NULL,
  avatar_url             text,
  google_id              text UNIQUE,
  email                  text UNIQUE,
  expo_push_token        text,
  location_point         geography(POINT, 4326),
  neighbourhood          text,
  city                   text DEFAULT 'juja',
  is_verified_org        boolean DEFAULT false,
  org_name               text,
  org_radius_km          integer DEFAULT 10,
  is_org_pro             boolean DEFAULT false,
  org_pro_expires_at     timestamptz,
  last_free_broadcast_at timestamptz,
  streak_days            integer DEFAULT 0,
  streak_last_active     date,
  energy_score           float DEFAULT 0,
  is_admin               boolean DEFAULT false,
  created_at             timestamptz DEFAULT now(),
  updated_at             timestamptz DEFAULT now()
);

-- ── QUESTS ───────────────────────────────────────────────────────
CREATE TABLE quests (
  id             uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  title          text NOT NULL CHECK (length(title) BETWEEN 3 AND 60),
  emoji          text NOT NULL DEFAULT '🎯',
  type           text NOT NULL CHECK (type IN ('casual','community','flash','wildcard','default')),
  location_label text,
  location_point geography(POINT, 4326) NOT NULL,
  radius_km      integer,
  max_size       integer NOT NULL DEFAULT 10 CHECK (max_size BETWEEN 3 AND 500),
  description    text CHECK (length(description) <= 300),
  post_time      timestamptz DEFAULT now(),
  start_time     timestamptz,
  expires_at     timestamptz NOT NULL,
  status         text DEFAULT 'active' CHECK (status IN ('active','completed','expired')),
  poster_id      uuid REFERENCES users(id) ON DELETE SET NULL,
  is_default     boolean DEFAULT false,
  is_boosted     boolean DEFAULT false,
  boost_expires_at timestamptz,
  boost_radius_km  integer,
  energy_score   float DEFAULT 0,
  recent_hype    jsonb DEFAULT '{"fire":0,"eyes":0,"hands":0}',
  total_hype     jsonb DEFAULT '{"fire":0,"eyes":0,"hands":0}',
  share_slug     text UNIQUE,
  squad_name     text,
  city           text DEFAULT 'juja',
  created_at     timestamptz DEFAULT now()
);

-- ── QUEST MEMBERS ────────────────────────────────────────────────
CREATE TABLE quest_members (
  quest_id            uuid REFERENCES quests(id) ON DELETE CASCADE,
  user_id             uuid REFERENCES users(id) ON DELETE CASCADE,
  status              text DEFAULT 'joined'
                      CHECK (status IN ('joined','on_my_way','here','left')),
  location_point      geography(POINT, 4326),
  location_updated_at timestamptz,
  joined_at           timestamptz DEFAULT now(),
  PRIMARY KEY (quest_id, user_id)
);

-- ── MESSAGES (deleted on dissolution) ───────────────────────────
CREATE TABLE messages (
  id        uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  quest_id  uuid REFERENCES quests(id) ON DELETE CASCADE,
  user_id   uuid REFERENCES users(id) ON DELETE SET NULL,
  content   text NOT NULL CHECK (length(content) <= 1000),
  sent_at   timestamptz DEFAULT now()
);

-- ── REACTIONS (source of truth for hype) ────────────────────────
CREATE TABLE reactions (
  id         uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  quest_id   uuid REFERENCES quests(id) ON DELETE CASCADE,
  user_id    uuid REFERENCES users(id) ON DELETE CASCADE,
  reaction   text NOT NULL CHECK (reaction IN ('fire','eyes','hands')),
  reacted_at timestamptz DEFAULT now(),
  UNIQUE (quest_id, user_id, reaction)
);

-- ── VIBE RATINGS ─────────────────────────────────────────────────
CREATE TABLE vibe_ratings (
  quest_id uuid REFERENCES quests(id) ON DELETE CASCADE,
  user_id  uuid REFERENCES users(id) ON DELETE CASCADE,
  rating   text NOT NULL CHECK (rating IN ('fire','meh','dead')),
  rated_at timestamptz DEFAULT now(),
  PRIMARY KEY (quest_id, user_id)
);

-- ── QUEST HISTORY (72h TTL — personal story cards) ───────────────
CREATE TABLE quest_history (
  id              uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id         uuid REFERENCES users(id) ON DELETE CASCADE,
  quest_id        uuid,
  quest_title     text,
  quest_emoji     text,
  quest_type      text,
  location_label  text,
  start_time      timestamptz,
  completed_at    timestamptz DEFAULT now(),
  member_count    integer,
  vibe_rating     text,
  story_card_url  text,
  expires_at      timestamptz NOT NULL   -- completed_at + 72h
);

-- ── SQUAD MEMORY ─────────────────────────────────────────────────
CREATE TABLE squad_memory (
  user_a          uuid REFERENCES users(id) ON DELETE CASCADE,
  user_b          uuid REFERENCES users(id) ON DELETE CASCADE,
  times_quested   integer DEFAULT 1,
  last_quested_at timestamptz DEFAULT now(),
  PRIMARY KEY (user_a, user_b),
  CHECK (user_a < user_b)
);

-- ── I'M FREE BROADCASTS ──────────────────────────────────────────
CREATE TABLE free_broadcasts (
  id           uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id      uuid REFERENCES users(id) ON DELETE CASCADE,
  location     geography(POINT, 4326) NOT NULL,
  broadcast_at timestamptz DEFAULT now(),
  expires_at   timestamptz NOT NULL,
  status       text DEFAULT 'active' CHECK (status IN ('active','expired')),
  city         text DEFAULT 'juja'
);

-- ── WILD CARDS ───────────────────────────────────────────────────
CREATE TABLE wild_cards (
  id          uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  city        text NOT NULL,
  title       text NOT NULL,
  emoji       text NOT NULL,
  description text,
  active_date date NOT NULL,
  quest_id    uuid REFERENCES quests(id),
  created_at  timestamptz DEFAULT now()
);

-- ── CONTACT SWAPS (RLS enforces member-only reads) ────────────────
CREATE TABLE contact_swaps (
  id           uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  quest_id     uuid REFERENCES quests(id) ON DELETE CASCADE,
  from_user_id uuid REFERENCES users(id) ON DELETE CASCADE,
  platform     text NOT NULL CHECK (platform IN ('instagram','twitter','phone')),
  value        text NOT NULL,
  shared_at    timestamptz DEFAULT now()
);

-- ── QUEST STORIES (Tier 1 — PERMANENT, feeds mission log) ────────
CREATE TABLE quest_stories (
  id         uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  quest_id   uuid REFERENCES quests(id) ON DELETE CASCADE,
  poster_id  uuid REFERENCES users(id) ON DELETE CASCADE,
  caption    text CHECK (length(caption) <= 300),
  photo_urls text[] NOT NULL DEFAULT '{}',
  posted_at  timestamptz DEFAULT now()
  -- No expires_at — quest_stories are permanent
);

-- ── MEMBER ATTENDANCE PHOTOS (Tier 2 — 72h TTL) ──────────────────
CREATE TABLE quest_member_photos (
  quest_id    uuid REFERENCES quests(id) ON DELETE CASCADE,
  user_id     uuid REFERENCES users(id) ON DELETE CASCADE,
  photo_url   text NOT NULL,
  uploaded_at timestamptz DEFAULT now(),
  expires_at  timestamptz NOT NULL,   -- quest.expires_at + 72h
  PRIMARY KEY (quest_id, user_id)
);

-- ── ORG MISSION LOG (permanent, public) ──────────────────────────
CREATE TABLE org_mission_log (
  id                  uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  org_id              uuid REFERENCES users(id) ON DELETE CASCADE,
  quest_id            uuid,
  quest_title         text NOT NULL,
  quest_emoji         text,
  quest_type          text,
  location_label      text,
  completed_at        timestamptz NOT NULL,
  member_count        integer DEFAULT 0,
  vibe_rating         text,
  highlight_photo_url text,
  created_at          timestamptz DEFAULT now()
);

-- ── REVENUE: QUEST BOOSTS ────────────────────────────────────────
CREATE TABLE quest_boosts (
  id               uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  quest_id         uuid REFERENCES quests(id) ON DELETE CASCADE,
  user_id          uuid REFERENCES users(id),
  amount_kes       integer NOT NULL,
  mpesa_ref        text UNIQUE,
  status           text DEFAULT 'pending'
                   CHECK (status IN ('pending','confirmed','failed')),
  boost_expires_at timestamptz,
  boost_radius_km  integer,
  created_at       timestamptz DEFAULT now()
);

-- ── REVENUE: ORG PRO SUBSCRIPTIONS ──────────────────────────────
CREATE TABLE org_subscriptions (
  id         uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id    uuid REFERENCES users(id),
  plan       text DEFAULT 'monthly' CHECK (plan IN ('monthly','quarterly')),
  amount_kes integer NOT NULL,
  mpesa_ref  text UNIQUE,
  status     text DEFAULT 'active'
             CHECK (status IN ('active','cancelled','expired')),
  starts_at  timestamptz DEFAULT now(),
  expires_at timestamptz NOT NULL,
  created_at timestamptz DEFAULT now()
);

-- ── SHARE EVENTS ─────────────────────────────────────────────────
CREATE TABLE share_events (
  id         uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  quest_id   uuid REFERENCES quests(id) ON DELETE CASCADE,
  user_id    uuid REFERENCES users(id),
  channel    text NOT NULL CHECK (channel IN ('whatsapp','instagram','twitter','other')),
  clicked_at timestamptz DEFAULT now()
);

-- ── CITY CONFIG ──────────────────────────────────────────────────
CREATE TABLE city_config (
  city                 text PRIMARY KEY,
  display_name         text NOT NULL,
  center_point         geography(POINT, 4326),
  default_run_loc      text,
  default_walk_loc     text,
  default_football_loc text,
  active               boolean DEFAULT true,
  created_at           timestamptz DEFAULT now()
);

-- ── INDEXES ──────────────────────────────────────────────────────
CREATE INDEX idx_quests_location     ON quests USING GIST(location_point);
CREATE INDEX idx_quests_status       ON quests(status, expires_at);
CREATE INDEX idx_quests_city_active  ON quests(city, status) WHERE status='active';
CREATE INDEX idx_quests_start_time   ON quests(start_time) WHERE status='active';
CREATE INDEX idx_quests_energy       ON quests(energy_score DESC) WHERE status='active';
CREATE INDEX idx_quests_type         ON quests(type, status);
CREATE INDEX idx_quests_boosted      ON quests(is_boosted, boost_expires_at) WHERE is_boosted=true;
CREATE INDEX idx_members_quest       ON quest_members(quest_id);
CREATE INDEX idx_members_user        ON quest_members(user_id);
CREATE INDEX idx_members_location    ON quest_members USING GIST(location_point);
CREATE INDEX idx_reactions_time      ON reactions(quest_id, reacted_at);
CREATE INDEX idx_messages_quest      ON messages(quest_id, sent_at);
CREATE INDEX idx_history_user        ON quest_history(user_id, completed_at);
CREATE INDEX idx_history_expires     ON quest_history(expires_at);
CREATE INDEX idx_free_location       ON free_broadcasts USING GIST(location);
CREATE INDEX idx_free_active         ON free_broadcasts(status, expires_at);
CREATE INDEX idx_squad_a             ON squad_memory(user_a);
CREATE INDEX idx_squad_b             ON squad_memory(user_b);
CREATE INDEX idx_stories_quest       ON quest_stories(quest_id, posted_at);
CREATE INDEX idx_member_photos_exp   ON quest_member_photos(expires_at);
CREATE INDEX idx_mission_log_org     ON org_mission_log(org_id, completed_at DESC);
CREATE INDEX idx_boost_quest         ON quest_boosts(quest_id);
```

---

## GEO QUERIES

### Feed
```sql
SELECT q.*,
  ST_Distance(q.location_point, ST_MakePoint($lon,$lat)::geography) AS dist_m
FROM quests q
WHERE ST_DWithin(
    q.location_point, ST_MakePoint($lon,$lat)::geography,
    CASE WHEN q.is_boosted AND q.boost_expires_at > now()
      THEN q.boost_radius_km * 1000
      ELSE COALESCE(q.radius_km, 2) * 1000
    END
  )
  AND q.status = 'active' AND q.city = $city
ORDER BY
  CASE WHEN q.start_time BETWEEN now() AND now() + INTERVAL '2h' THEN 0 ELSE 1 END,
  q.energy_score DESC, dist_m ASC
LIMIT 30;
```

### Radar (with bearing for dot placement)
```sql
SELECT q.id, q.title, q.emoji, q.type, q.status, q.energy_score,
  q.start_time, q.expires_at, q.location_label, q.max_size,
  ST_Distance(q.location_point, ST_MakePoint($lon,$lat)::geography) AS dist_m,
  degrees(ST_Azimuth(ST_MakePoint($lon,$lat)::geography, q.location_point)) AS bearing_deg
FROM quests q
WHERE ST_DWithin(q.location_point, ST_MakePoint($lon,$lat)::geography, 2000)
  AND q.status = 'active'
ORDER BY dist_m ASC LIMIT 20;
```

### Org radius quests (expanded view)
```sql
SELECT q.*, ST_Distance(q.location_point, ST_MakePoint($lon,$lat)::geography) AS dist_m
FROM quests q JOIN users u ON u.id = q.poster_id
WHERE ST_DWithin(q.location_point, ST_MakePoint($lon,$lat)::geography, q.radius_km * 1000)
  AND q.radius_km IS NOT NULL AND q.status = 'active' AND u.is_verified_org = true
ORDER BY dist_m ASC;
```

### Profile access check
```sql
-- Returns true if viewer can access target_user's profile
SELECT EXISTS (
  -- Active shared quest
  SELECT 1 FROM quest_members a JOIN quest_members b
    ON a.quest_id = b.quest_id
    JOIN quests q ON q.id = a.quest_id
  WHERE a.user_id = $viewer_id AND b.user_id = $target_id
    AND q.status = 'active'
  UNION ALL
  -- Past shared quest
  SELECT 1 FROM squad_memory
  WHERE (user_a = LEAST($viewer_id,$target_id) AND user_b = GREATEST($viewer_id,$target_id))
) AS can_access;
```

---

## SOCKET.IO IMPLEMENTATION

```typescript
// apps/api/src/socket/index.ts
import { Server } from 'socket.io';

export let io: Server;

export function initSocket(httpServer: any) {
  io = new Server(httpServer, {
    cors: { origin: '*', methods: ['GET','POST'] },
    transports: ['websocket','polling'],
  });

  const auth = async (socket: any, next: Function) => {
    try {
      socket.data.user = await verifyJWT(socket.handshake.auth.token);
      next();
    } catch { next(new Error('Unauthorized')); }
  };

  // /quest namespace — one room per quest
  const questNS = io.of('/quest');
  questNS.use(auth);
  questNS.on('connection', (socket) => {
    const user = socket.data.user;

    socket.on('join', async ({ quest_id }) => {
      const member = await db.query.questMembers.findFirst({
        where: and(eq(questMembers.quest_id, quest_id), eq(questMembers.user_id, user.id))
      });
      if (!member) return socket.emit('error', { message: 'Not a squad member' });
      socket.join(quest_id);
      socket.data.quest_id = quest_id;
    });

    socket.on('message', async ({ quest_id, content }) => {
      if (!content?.trim() || content.length > 1000) return;
      const [msg] = await db.insert(messages)
        .values({ quest_id, user_id: user.id, content: content.trim() })
        .returning();
      questNS.to(quest_id).emit('message', {
        id: msg.id, user_id: user.id, user_name: user.name,
        content: msg.content, sent_at: msg.sent_at,
      });
    });

    socket.on('status_update', async ({ quest_id, status }) => {
      if (!['joined','on_my_way','here'].includes(status)) return;
      await db.update(questMembers).set({ status })
        .where(and(eq(questMembers.quest_id, quest_id), eq(questMembers.user_id, user.id)));
      questNS.to(quest_id).emit('status_update', { user_id: user.id, status });
    });

    socket.on('location_update', async ({ quest_id, lat, lng }) => {
      if (typeof lat !== 'number' || typeof lng !== 'number') return;
      await db.update(questMembers)
        .set({ location_point: `POINT(${lng} ${lat})`, location_updated_at: new Date() })
        .where(and(eq(questMembers.quest_id, quest_id), eq(questMembers.user_id, user.id)));
      questNS.to(quest_id).emit('location_update', { user_id: user.id, lat, lng });
    });
  });

  // /area namespace — one room per city
  const areaNS = io.of('/area');
  areaNS.use(auth);
  areaNS.on('connection', (socket) => {
    socket.join(socket.data.user.city || 'juja');
  });

  // Area pulse — every 60s
  setInterval(async () => {
    const count = await redis.get('active_users:juja') || 0;
    areaNS.to('juja').emit('pulse', { city: 'juja', active_users: Number(count) });
  }, 60_000);

  return io;
}

// Call when member count reaches exactly 3
export async function triggerSquadFormation(quest_id: string) {
  const adjectives = ['The Bold','The Juja','The Fast','The Wild','The Night'];
  const nouns: Record<string, string> = {
    casual: 'Crew', community: 'Squad', flash: 'Runners', wildcard: 'Wanderers', default: 'Regulars'
  };
  const quest = await db.query.quests.findFirst({ where: eq(quests.id, quest_id) });
  const members = await db.query.questMembers.findMany({
    where: eq(questMembers.quest_id, quest_id),
    with: { user: { columns: { id: true, name: true } } }
  });
  const squadName = `${adjectives[Math.floor(Math.random()*adjectives.length)]} ${nouns[quest?.type||'casual']}`;
  await db.update(quests).set({ squad_name: squadName }).where(eq(quests.id, quest_id));
  io.of('/quest').to(quest_id).emit('formation_moment', {
    squad_name: squadName,
    members: members.map(m => ({ id: m.user.id, name: m.user.name })),
  });
  io.of('/quest').to(quest_id).emit('chat_unlocked', { squad_count: 3 });
}
```

---

## BULLMQ JOBS

```typescript
// apps/api/src/jobs/quests.jobs.ts

// quest.expire — at quest.expires_at
async function expireQuest(quest_id: string) {
  await db.update(quests).set({ status: 'expired' }).where(eq(quests.id, quest_id));
  const members = await db.query.questMembers.findMany({
    where: eq(questMembers.quest_id, quest_id),
    with: { user: { columns: { expo_push_token: true } } }
  });
  await sendExpoPush(members.map(m => m.user.expo_push_token).filter(Boolean), {
    title: 'How was it? 🎉', body: 'Rate the vibe on your quest',
    data: { type: 'vibe_check', quest_id },
  });
}

// quest.dissolve — at quest.expires_at + 2h
async function dissolveQuest(quest_id: string) {
  const quest = await db.query.quests.findFirst({ where: eq(quests.id, quest_id) });
  const members = await db.query.questMembers.findMany({ where: eq(questMembers.quest_id, quest_id) });

  // 1. Delete messages
  await db.delete(messages).where(eq(messages.quest_id, quest_id));

  // 2. Get vibe rating consensus
  const ratings = await db.query.vibeRatings.findMany({ where: eq(vibeRatings.quest_id, quest_id) });
  const topRating = ratings.sort((a,b) =>
    ['fire','meh','dead'].indexOf(a.rating) - ['fire','meh','dead'].indexOf(b.rating)
  )[0]?.rating ?? null;

  // 3. Generate story card image
  const cardUrl = await generateStoryCard(quest_id);

  // 4. Save quest_history for each member — 72h TTL
  const expiresAt = new Date(Date.now() + 72 * 60 * 60 * 1000);
  for (const member of members) {
    await db.insert(questHistory).values({
      user_id: member.user_id, quest_id: quest!.id,
      quest_title: quest!.title, quest_emoji: quest!.emoji,
      quest_type: quest!.type, location_label: quest!.location_label,
      start_time: quest!.start_time, completed_at: new Date(),
      member_count: members.length, vibe_rating: topRating,
      story_card_url: cardUrl, expires_at: expiresAt,
    });
  }

  // 5. Update squad_memory for all member pairs
  for (let i = 0; i < members.length; i++) {
    for (let j = i + 1; j < members.length; j++) {
      const [a, b] = [members[i].user_id, members[j].user_id].sort();
      await db.insert(squadMemory)
        .values({ user_a: a, user_b: b, times_quested: 1, last_quested_at: new Date() })
        .onConflictDoUpdate({
          target: [squadMemory.user_a, squadMemory.user_b],
          set: { times_quested: sql`${squadMemory.times_quested} + 1`, last_quested_at: new Date() }
        });
    }
  }

  // 6. If poster is verified org — write to org_mission_log (permanent)
  if (quest?.poster_id) {
    const poster = await db.query.users.findFirst({
      where: eq(users.id, quest.poster_id), columns: { is_verified_org: true }
    });
    if (poster?.is_verified_org) {
      const firstStory = await db.query.questStories.findFirst({
        where: eq(questStories.quest_id, quest_id), orderBy: asc(questStories.posted_at),
      });
      await db.insert(orgMissionLog).values({
        org_id: quest.poster_id, quest_id: quest.id,
        quest_title: quest.title, quest_emoji: quest.emoji,
        quest_type: quest.type, location_label: quest.location_label,
        completed_at: new Date(), member_count: members.length,
        vibe_rating: topRating, highlight_photo_url: firstStory?.photo_urls?.[0] ?? null,
      });
    }
  }
}

// quest.energy_recalc — every 2 min
async function recalcAllEnergy() {
  const active = await db.query.quests.findMany({ where: eq(quests.status,'active'), columns: { id: true } });
  await Promise.all(active.map(async (q) => {
    const now = new Date();
    const [r30, j10] = await Promise.all([
      db.$count(reactions, and(eq(reactions.quest_id, q.id), gt(reactions.reacted_at, new Date(now.getTime()-30*60*1000)))),
      db.$count(questMembers, and(eq(questMembers.quest_id, q.id), gt(questMembers.joined_at, new Date(now.getTime()-10*60*1000)))),
    ]);
    const energy = Math.min(r30/10, 1)*0.55 + Math.min(j10/3, 1)*0.45;
    await db.update(quests).set({ energy_score: energy }).where(eq(quests.id, q.id));
    io.of('/quest').to(q.id).emit('energy_update', {
      energy_score: energy,
      level: energy >= 0.75 ? 4 : energy >= 0.5 ? 3 : energy >= 0.25 ? 2 : 1,
    });
    if (energy >= 0.75) await triggerQuestMention(q.id, 'energy_hot');
  }));
}

// quest.hype_decay — every 15 min
async function recalcHypeDecay() {
  const cutoff = new Date(Date.now() - 2*60*60*1000);
  const active = await db.query.quests.findMany({ where: eq(quests.status,'active'), columns: { id: true } });
  for (const q of active) {
    const recent = await db.select({ reaction: reactions.reaction, count: count() })
      .from(reactions)
      .where(and(eq(reactions.quest_id, q.id), gt(reactions.reacted_at, cutoff)))
      .groupBy(reactions.reaction);
    const recentHype = { fire: 0, eyes: 0, hands: 0 };
    for (const r of recent) recentHype[r.reaction as keyof typeof recentHype] = Number(r.count);
    await db.update(quests).set({ recent_hype: recentHype }).where(eq(quests.id, q.id));
  }
}

// daily.seed_defaults — cron 00:01
async function seedDailyDefaults() {
  const cities = await db.query.cityConfig.findMany({ where: eq(cityConfig.active, true) });
  for (const city of cities) {
    const today = new Date(); today.setHours(0,0,0,0);
    await db.update(quests).set({ status: 'expired' })
      .where(and(eq(quests.is_default,true), eq(quests.city,city.city), lt(quests.expires_at, new Date())));
    const defaults = [
      { title:'Morning Run', emoji:'🏃', loc: city.default_run_loc||'Town Centre', hour:7, max:10 },
      { title:'Lunch Walk',  emoji:'🚶', loc: city.default_walk_loc||'Main Square', hour:13, max:8 },
      { title:'Evening Football', emoji:'⚽', loc: city.default_football_loc||'Community Grounds', hour:18, max:20 },
    ];
    for (const d of defaults) {
      const startTime = new Date(today); startTime.setHours(d.hour,0,0,0);
      const expiresAt = new Date(today); expiresAt.setHours(23,59,59,999);
      await db.insert(quests).values({
        title: d.title, emoji: d.emoji, type: 'default',
        location_label: d.loc,
        location_point: city.center_point || 'POINT(36.9719 -1.0898)',
        max_size: d.max, start_time: startTime, expires_at: expiresAt,
        is_default: true, city: city.city,
        share_slug: `default-${d.title.toLowerCase().replace(/\s+/g,'-')}-${city.city}-${today.toISOString().slice(0,10)}`,
        description: `Daily ${d.title.toLowerCase()} — all levels welcome.`,
      }).onConflictDoNothing();
    }
  }
}

// daily.seed_wildcards — cron 00:05
// Picks from a hardcoded pool — no voting in Phase 1
const WILD_CARD_POOL = [
  { title: 'Taco Hunt',       emoji: '🌮', description: 'Find the best tacos in the city. 3 stops. Bragging rights to the winner.' },
  { title: 'Sunset Watch',    emoji: '🌅', description: 'Golden hour from the best vantage point. Bring something to sit on.' },
  { title: 'Dog Walk Squad',  emoji: '🐕', description: 'Park dog walkers unite. All breeds, all paces.' },
  { title: 'Ice Cream Walk',  emoji: '🍦', description: 'Walk and eat. No destination. Just vibes.' },
  { title: 'Retro Gaming',    emoji: '🎮', description: 'Old school games night. Bring your console or just show up.' },
  { title: 'Midnight Walk',   emoji: '🌙', description: 'Late night city walk. Low key. High vibes.' },
];
async function seedWildCards() {
  const cities = await db.query.cityConfig.findMany({ where: eq(cityConfig.active, true) });
  for (const city of cities) {
    const today = new Date(); today.setHours(0,0,0,0);
    const pick = WILD_CARD_POOL[Math.floor(Math.random() * WILD_CARD_POOL.length)];
    const expiresAt = new Date(today); expiresAt.setHours(23,59,59,999);
    const [wcQuest] = await db.insert(quests).values({
      title: pick.title, emoji: pick.emoji, type: 'wildcard',
      description: pick.description,
      location_point: city.center_point || 'POINT(36.9719 -1.0898)',
      location_label: city.display_name,
      max_size: 12, expires_at: expiresAt, city: city.city,
      share_slug: `wildcard-${pick.title.toLowerCase().replace(/\s+/g,'-')}-${city.city}-${today.toISOString().slice(0,10)}`,
    }).returning();
    await db.insert(wildCards).values({
      city: city.city, title: pick.title, emoji: pick.emoji,
      description: pick.description, active_date: today, quest_id: wcQuest.id,
    });
    io.of('/area').to(city.city).emit('wild_card_new', {
      quest_id: wcQuest.id, title: pick.title, emoji: pick.emoji,
    });
  }
}
```

---

## M-PESA DARAJA INTEGRATION

```typescript
// apps/api/src/lib/daraja.ts
import crypto from 'crypto';
import axios from 'axios';

const getTimestamp = () => new Date().toISOString().replace(/[-:T.Z]/g,'').slice(0,14);
const generatePassword = () =>
  Buffer.from(`${process.env.DARAJA_SHORTCODE}${process.env.DARAJA_PASSKEY}${getTimestamp()}`).toString('base64');

async function getToken(): Promise<string> {
  const auth = Buffer.from(`${process.env.DARAJA_CONSUMER_KEY}:${process.env.DARAJA_CONSUMER_SECRET}`).toString('base64');
  const res = await axios.get('https://sandbox.safaricom.co.ke/oauth/v1/generate?grant_type=client_credentials',
    { headers: { Authorization: `Basic ${auth}` } });
  return res.data.access_token;
}

export async function stkPush({ phoneNumber, amount, accountRef, description }: {
  phoneNumber: string; amount: number; accountRef: string; description: string;
}) {
  const token = await getToken();
  const res = await axios.post('https://sandbox.safaricom.co.ke/mpesa/stkpush/v1/processrequest', {
    BusinessShortCode: process.env.DARAJA_SHORTCODE,
    Password: generatePassword(), Timestamp: getTimestamp(),
    TransactionType: 'CustomerPayBillOnline',
    Amount: amount, PartyA: phoneNumber, PartyB: process.env.DARAJA_SHORTCODE,
    PhoneNumber: phoneNumber, CallBackURL: process.env.DARAJA_CALLBACK_URL,
    AccountReference: accountRef, TransactionDesc: description,
  }, { headers: { Authorization: `Bearer ${token}` } });
  return res.data; // contains CheckoutRequestID
}

// POST /api/v1/payments/boost/callback (Daraja webhook — no auth)
export async function boostCallback(req: any, reply: any) {
  const { Body: { stkCallback } } = req.body;
  const { CheckoutRequestID, ResultCode } = stkCallback;
  if (ResultCode === 0) {
    const boost = await db.query.questBoosts.findFirst({ where: eq(questBoosts.mpesa_ref, CheckoutRequestID) });
    if (boost) {
      await db.update(questBoosts).set({ status: 'confirmed' }).where(eq(questBoosts.id, boost.id));
      await db.update(quests).set({
        is_boosted: true, boost_radius_km: boost.boost_radius_km, boost_expires_at: boost.boost_expires_at,
      }).where(eq(quests.id, boost.quest_id));
    }
  } else {
    await db.update(questBoosts).set({ status: 'failed' }).where(eq(questBoosts.mpesa_ref, CheckoutRequestID));
  }
  return reply.send({ ResultCode: 0, ResultDesc: 'Accepted' });
}
```

---

## STORY CARD GENERATION

```typescript
// apps/api/src/jobs/media.jobs.ts
import sharp from 'sharp';

export async function generateStoryCard(quest_id: string): Promise<string> {
  const quest = await db.query.quests.findFirst({ where: eq(quests.id, quest_id) });
  const memberCount = await db.$count(questMembers, eq(questMembers.quest_id, quest_id));
  const rating = await db.query.vibeRatings.findFirst({ where: eq(vibeRatings.quest_id, quest_id) });
  const isGold = rating?.rating === 'fire';
  const vibeEmoji = rating?.rating === 'fire' ? '🔥🔥🔥' : rating?.rating === 'meh' ? '😐' : '💀';
  const dateStr = new Date().toLocaleDateString('en-GB',{month:'short',year:'numeric'}).toUpperCase();

  const svg = `<svg width="400" height="500" xmlns="http://www.w3.org/2000/svg">
    <defs>
      <linearGradient id="g" x1="0" y1="0" x2="1" y2="0">
        <stop offset="0%" stop-color="${isGold?'#fbbf24':'#ff6b2b'}"/>
        <stop offset="100%" stop-color="${isGold?'#f59e0b':'#ff9a5c'}"/>
      </linearGradient>
    </defs>
    <rect width="400" height="500" rx="24" fill="#111118"/>
    <rect width="400" height="${isGold?4:3}" rx="2" fill="url(#g)"/>
    <text x="200" y="125" font-size="72" text-anchor="middle">${quest!.emoji}</text>
    <text x="200" y="168" font-size="22" font-weight="bold" fill="#f0f0f8" text-anchor="middle" font-family="sans-serif">${quest!.title}</text>
    <text x="200" y="196" font-size="13" fill="#8888a0" text-anchor="middle" font-family="sans-serif">📍 ${quest!.location_label||'Nearby'}</text>
    <rect x="60" y="220" width="120" height="60" rx="12" fill="#1c1c27"/>
    <text x="120" y="245" font-size="11" fill="#8888a0" text-anchor="middle" font-family="sans-serif">PEOPLE</text>
    <text x="120" y="270" font-size="26" font-weight="bold" fill="${isGold?'#fbbf24':'#ff6b2b'}" text-anchor="middle" font-family="sans-serif">${memberCount}</text>
    <rect x="220" y="220" width="120" height="60" rx="12" fill="#1c1c27"/>
    <text x="280" y="245" font-size="11" fill="#8888a0" text-anchor="middle" font-family="sans-serif">VIBE</text>
    <text x="280" y="270" font-size="22" text-anchor="middle">${vibeEmoji}</text>
    <text x="200" y="370" font-size="11" fill="#40405a" text-anchor="middle" font-family="sans-serif">sidequest.app/q/${quest!.share_slug}</text>
    <text x="340" y="470" font-size="10" fill="#30304a" font-family="sans-serif" transform="rotate(-8,340,470)">${quest!.city?.toUpperCase()} · ${dateStr}</text>
  </svg>`;

  const buffer = await sharp(Buffer.from(svg)).png({ quality: 90 }).toBuffer();
  const path = `${quest_id}.png`;
  await supabase.storage.from('story-cards').upload(path, buffer, { contentType: 'image/png', upsert: true });
  return supabase.storage.from('story-cards').getPublicUrl(path).data.publicUrl;
}
```

---

## QUEST MENTION

```typescript
// apps/api/src/lib/questMention.ts
export async function triggerQuestMention(quest_id: string, trigger: 'squad_formed'|'energy_hot') {
  const cacheKey = `mention:${quest_id}:${trigger}`;
  if (await redis.get(cacheKey)) return;
  await redis.setex(cacheKey, 86400, '1');

  const quest = await db.query.quests.findFirst({
    where: eq(quests.id, quest_id),
    with: { poster: { columns: { expo_push_token: true, name: true } } }
  });
  if (!quest?.poster?.expo_push_token) return;

  const memberCount = await db.$count(questMembers, eq(questMembers.quest_id, quest_id));
  const msg = trigger === 'squad_formed'
    ? `Your ${quest.emoji} ${quest.title} squad just formed 🔥 — share it`
    : `Your ${quest.emoji} ${quest.title} is blowing up 🔥`;

  await sendExpoPush([quest.poster.expo_push_token], {
    title: 'SideQuest', body: msg,
    data: {
      type: 'quest_mention', quest_id,
      share_url: `https://sidequest.app/q/${quest.share_slug}`,
      share_text: `${quest.emoji} ${quest.title} — ${memberCount} people joining near ${quest.location_label}\nhttps://sidequest.app/q/${quest.share_slug}`,
    },
  });
}
```

---

## QUEST STORIES IMPLEMENTATION

```typescript
// apps/api/src/routes/stories/index.ts

// GET /api/v1/quests/:id/stories — public
export async function getStories(req: any, reply: any) {
  const { id: quest_id } = req.params;
  const stories = await db.select({
    id: questStories.id, caption: questStories.caption,
    photo_urls: questStories.photo_urls, posted_at: questStories.posted_at,
    poster_name: users.name, poster_avatar: users.avatar_url,
  }).from(questStories).innerJoin(users, eq(questStories.poster_id, users.id))
    .where(eq(questStories.quest_id, quest_id)).orderBy(asc(questStories.posted_at));
  return reply.send({ data: stories, error: null });
}

// POST /api/v1/quests/:id/stories — poster only, multipart
export async function postStory(req: any, reply: any) {
  const { id: quest_id } = req.params;
  const quest = await db.query.quests.findFirst({ where: eq(quests.id, quest_id) });
  if (!quest) return reply.code(404).send({ data:null, error:{message:'Not found',code:'NOT_FOUND'} });
  if (quest.poster_id !== req.user.id)
    return reply.code(403).send({ data:null, error:{message:'Poster only',code:'FORBIDDEN'} });
  const windowClose = new Date(quest.expires_at.getTime() + 48*60*60*1000);
  if (new Date() > windowClose)
    return reply.code(400).send({ data:null, error:{message:'Window closed',code:'WINDOW_CLOSED'} });
  const count = await db.$count(questStories, eq(questStories.quest_id, quest_id));
  if (count >= 5)
    return reply.code(400).send({ data:null, error:{message:'Max 5 stories',code:'MAX_STORIES'} });

  const parts = req.parts();
  let caption: string|undefined;
  const photoUrls: string[] = [];
  for await (const part of parts) {
    if (part.type==='field' && part.fieldname==='caption') caption = (part.value as string).slice(0,300);
    if (part.type==='file' && part.fieldname==='photos' && photoUrls.length < 3) {
      const chunks: Buffer[] = []; let size = 0;
      for await (const chunk of part.file) {
        size += chunk.length;
        if (size > 5*1024*1024) return reply.code(400).send({ data:null, error:{message:'Max 5MB',code:'FILE_TOO_LARGE'} });
        chunks.push(chunk);
      }
      const filename = `${quest_id}/${Date.now()}-${photoUrls.length}.jpg`;
      await supabase.storage.from('quest-stories').upload(filename, Buffer.concat(chunks), { contentType: part.mimetype });
      photoUrls.push(supabase.storage.from('quest-stories').getPublicUrl(filename).data.publicUrl);
    }
  }
  if (!photoUrls.length && !caption)
    return reply.code(400).send({ data:null, error:{message:'Need photo or caption',code:'EMPTY'} });

  // Permanent — no expires_at
  const [story] = await db.insert(questStories).values({ quest_id, poster_id: req.user.id, caption, photo_urls: photoUrls }).returning();
  io.of('/quest').to(quest_id).emit('story_posted', {
    story_id: story.id, poster_name: req.user.name,
    caption: story.caption, photo_urls: story.photo_urls, posted_at: story.posted_at,
  });
  return reply.code(201).send({ data: story, error: null });
}

// POST /api/v1/quests/:id/my-photo — member, AFTER dissolution only
export async function uploadMemberPhoto(req: any, reply: any) {
  const { id: quest_id } = req.params;
  const quest = await db.query.quests.findFirst({ where: eq(quests.id, quest_id) });
  if (!quest) return reply.code(404).send({ data:null, error:{message:'Not found',code:'NOT_FOUND'} });
  const member = await db.query.questMembers.findFirst({
    where: and(eq(questMembers.quest_id, quest_id), eq(questMembers.user_id, req.user.id))
  });
  if (!member) return reply.code(403).send({ data:null, error:{message:'Not a member',code:'NOT_MEMBER'} });

  const now = new Date();
  if (now < quest.expires_at)
    return reply.code(400).send({ data:null, error:{message:'Quest still active — upload after it ends',code:'QUEST_ACTIVE'} });
  const windowClose = new Date(quest.expires_at.getTime() + 12*60*60*1000);
  if (now > windowClose)
    return reply.code(400).send({ data:null, error:{message:'12h window closed',code:'WINDOW_CLOSED'} });

  const parts = req.parts();
  let photoUrl: string|null = null;
  for await (const part of parts) {
    if (part.type==='file' && part.fieldname==='photo') {
      const chunks: Buffer[] = []; let size = 0;
      for await (const chunk of part.file) {
        size += chunk.length;
        if (size > 5*1024*1024) return reply.code(400).send({ data:null, error:{message:'Max 5MB',code:'FILE_TOO_LARGE'} });
        chunks.push(chunk);
      }
      const filename = `${quest_id}/${req.user.id}.jpg`;
      await supabase.storage.from('member-photos').upload(filename, Buffer.concat(chunks), { contentType: part.mimetype, upsert: true });
      photoUrl = supabase.storage.from('member-photos').getPublicUrl(filename).data.publicUrl;
      break;
    }
  }
  if (!photoUrl) return reply.code(400).send({ data:null, error:{message:'No photo',code:'NO_PHOTO'} });

  const expiresAt = new Date(quest.expires_at.getTime() + 72*60*60*1000);
  await db.insert(questMemberPhotos)
    .values({ quest_id, user_id: req.user.id, photo_url: photoUrl, expires_at: expiresAt })
    .onConflictDoUpdate({
      target: [questMemberPhotos.quest_id, questMemberPhotos.user_id],
      set: { photo_url: photoUrl, uploaded_at: new Date() }
    });

  io.of('/quest').to(quest_id).emit('member_photo_posted', { user_id: req.user.id, user_name: req.user.name });
  return reply.code(201).send({ data: { ok: true, photo_url: photoUrl }, error: null });
}
```

---

## ALL API ENDPOINTS

```
POST /api/v1/auth/google              Exchange Supabase token
POST /api/v1/auth/refresh             Refresh JWT
DELETE /api/v1/auth/logout            Invalidate

GET  /api/v1/quests                   Feed (PostGIS filtered)
GET  /api/v1/quests/radar             Radar with bearing + distance
GET  /api/v1/quests/flash             Flash quests within 1km
GET  /api/v1/quests/:id               Quest detail (access rules enforced)
POST /api/v1/quests                   Create quest
POST /api/v1/quests/:id/join          Join quest
DELETE /api/v1/quests/:id/join        Leave quest
POST /api/v1/quests/:id/react         Toggle hype reaction
POST /api/v1/quests/:id/rate          Vibe rating (expired quests only)
POST /api/v1/quests/:id/boost         Initiate M-Pesa boost
GET  /api/v1/quests/:id/members       Squad members + statuses
GET  /api/v1/q/:slug                  Resolve share link

GET  /api/v1/quests/:id/messages      Last 100 messages (members only)
POST /api/v1/quests/:id/contact-swap  Share contact card before dissolution

GET  /api/v1/quests/:id/stories             Tier 1 org stories (public)
POST /api/v1/quests/:id/stories             Post story (poster + window + max 5)
DELETE /api/v1/quests/:id/stories/:sid      Delete own story
POST /api/v1/quests/:id/my-photo            Upload attendance photo (member, after dissolution, 12h)
PUT  /api/v1/quests/:id/my-photo            Replace attendance photo (within window)
GET  /api/v1/quests/:id/member-photo        Get member photo (?user_id=, profile context only)

GET  /api/v1/users/me                 Current user profile + badges
PATCH /api/v1/users/me                Update profile + location (triggers streak)
GET  /api/v1/users/me/history         Quest history (72h window)
GET  /api/v1/users/me/badges          Computed badges
GET  /api/v1/users/me/squad-memory    Past squadmates
GET  /api/v1/users/:id                Another user's profile (403 if no shared quest)
GET  /api/v1/users/:id/history        Their history (visibility rules enforced)

GET  /api/v1/free                     Active broadcasts within 1km
POST /api/v1/free                     Create broadcast (6h cooldown)
DELETE /api/v1/free/:id               Cancel own broadcast
POST /api/v1/free/:id/reply           Reply with suggested activity

GET  /api/v1/wildcards                Today's Wild Cards
GET  /api/v1/org/quests               Org's quests with analytics
GET  /api/v1/org/analytics            Views, joins, conversion
POST /api/v1/org/subscribe            M-Pesa Org Pro subscription
GET  /api/v1/org/:id/mission-log      Public mission log (permanent, paginated)
GET  /api/v1/org/:id/stats            Aggregate org stats

POST /api/v1/payments/boost/initiate  M-Pesa STK for boost
POST /api/v1/payments/boost/callback  Daraja webhook (no auth)
POST /api/v1/payments/org/initiate    M-Pesa STK for Org Pro
POST /api/v1/payments/org/callback    Daraja webhook (no auth)

GET  /api/v1/admin/users              User list with search (admin only)
PATCH /api/v1/admin/users/:id/verify-org  Grant Verified Org status
GET  /api/v1/admin/revenue            Revenue by stream
GET  /api/v1/health                   No auth
```

---

## ALL BULLMQ JOBS

| Job | Queue | Trigger | Action |
|---|---|---|---|
| `quest.expire` | quests | Delayed: expires_at | status=expired, vibe check push |
| `quest.dissolve` | quests | Delayed: expires_at+2h | delete messages, story card, history, mission log |
| `quest.energy_recalc` | energy | Repeat: every 2min | recalc energy_score (2 signals) |
| `quest.hype_decay` | energy | Repeat: every 15min | UPDATE recent_hype (last 2h) |
| `contact_swap.notify` | quests | Delayed: expires_at-30min | emit contact_swap_open to room |
| `daily.seed_defaults` | daily | Cron: 0 0 0 * * * | 3 default quests per active city |
| `daily.seed_wildcards` | daily | Cron: 0 5 0 * * * | 1 Wild Card from pool per city |
| `free.expire` | free | Delayed: expires_at | set broadcast status=expired |
| `story_card.generate` | media | On dissolution | Sharp SVG→PNG, Supabase Storage |
| `push.flash_alert` | push | On flash quest create | push 10 nearest active users |
| `push.expiry_warn` | push | Delayed: expires_at-2h | push poster if squad <3 |
| `push.start_soon` | push | Delayed: start_time-30min | push all squad members |
| `push.streak_warn` | push | Cron: 0 0 19 * * * | push users with streak not opened today |
| `push.quest_mention` | push | On squad_formed / energy≥0.75 | push poster with share card |
| `history.cleanup` | cleanup | Cron: 0 0 3 * * * | DELETE quest_history WHERE expires_at < NOW() |
| `member_photos.cleanup` | cleanup | Cron: 0 0 3 * * * | DELETE quest_member_photos + Storage files WHERE expires_at < NOW() |
| `boost.expire` | payments | Delayed: boost_expires_at | clear is_boosted, revert radius |
| `org_sub.expire` | payments | Delayed: expires_at | set is_org_pro=false |

---

## ALL SOCKET.IO EVENTS

| Event | Namespace | Room | Payload |
|---|---|---|---|
| `message` | /quest | quest_id | `{id, user_id, user_name, content, sent_at}` |
| `chat_unlocked` | /quest | quest_id | `{squad_count: 3}` |
| `formation_moment` | /quest | quest_id | `{squad_name, members[]}` |
| `member_joined` | /quest | quest_id | `{user_id, name, joined_at}` |
| `status_update` | /quest | quest_id | `{user_id, status}` |
| `location_update` | /quest | quest_id | `{user_id, lat, lng}` |
| `energy_update` | /quest | quest_id | `{energy_score, level}` |
| `contact_swap_open` | /quest | quest_id | `{closes_at}` |
| `contact_shared` | /quest | quest_id | `{from_user_id, platform}` |
| `story_posted` | /quest | quest_id | `{story_id, poster_name, caption, photo_urls, posted_at}` |
| `member_photo_posted` | /quest | quest_id | `{user_id, user_name}` |
| `pulse` | /area | city | `{city, active_users}` |
| `flash_alert` | /area | city | `{quest_id, title, emoji, dist_m, minutes_left}` |
| `squad_memory_ping` | /area | individual | `{user_id, name, quest_id}` |
| `free_broadcast` | /area | city | `{broadcast_id, user_name, dist_m}` |
| `wild_card_new` | /area | city | `{quest_id, title, emoji}` |
````

---

## Part 3 — .claudeignore

```
node_modules/
.git/
dist/
build/
.expo/
.turbo/
coverage/
*.log
*.lock
.env
.env.*
!.env.example
apps/mobile/.expo/
packages/db/src/migrations/
infra/
.DS_Store
```

---

## Part 4 — MCP Tools

```bash
# Supabase — live schema + query testing
claude mcp add supabase \
  --url https://mcp.supabase.com/sse \
  --env SUPABASE_URL=your_url \
  --env SUPABASE_SERVICE_KEY=your_key

# Local PostgreSQL
claude mcp add postgres \
  --command "npx" \
  --args "@modelcontextprotocol/server-postgres" \
  --env DATABASE_URL=postgresql://postgres:postgres@localhost:5432/sidequest

# Redis — verify BullMQ + cache
claude mcp add redis \
  --command "npx" \
  --args "@modelcontextprotocol/server-redis" \
  --env REDIS_URL=redis://localhost:6379
```

Start every session:
```bash
cd sidequest
claude
> Read CLAUDE.md and confirm the tech stack and database rules before we start.
```

---

## Part 5 — Stage Prompts

---

### STAGE 1 — Monorepo Foundation
```
Set up a pnpm monorepo with turborepo for SideQuest.

1. Root package.json with pnpm workspaces: apps/* and packages/*
2. turbo.json with build, dev, lint, test pipelines
3. packages/shared-types/src/index.ts: TypeScript interfaces for User, Quest,
   QuestMember, Message, Reaction, FreeBroadcast, WildCard, ContactSwap,
   QuestBoost, OrgSubscription, CityConfig, QuestStory, QuestMemberPhoto, OrgMissionLog.
   QuestType enum: casual|community|flash|wildcard|default
   MemberStatus enum: joined|on_my_way|here|left
   JSDoc on all fields. Zero `any` types.
4. infra/docker-compose.yml:
   postgis/postgis:15-3.4 image + redis:7-alpine
   Named volumes, health checks.
   POSTGRES_DB=sidequest, USER=postgres, PASSWORD=postgres
5. .env.example with all variables from CLAUDE.md
6. Root README.md: pnpm install → docker-compose up -d → pnpm dev

Verify: pnpm tsc --noEmit passes, docker-compose up -d starts both services.
```

---

### STAGE 2 — Database Schema + Migration
```
Create the complete Drizzle ORM schema in packages/db/src/schema/.
Use the FULL DATABASE SCHEMA from CLAUDE.md exactly.

Split into files: users.ts, quests.ts, quest-members.ts, messages.ts,
reactions.ts, vibe-ratings.ts, quest-history.ts, squad-memory.ts,
free-broadcasts.ts, wild-cards.ts, contact-swaps.ts, quest-stories.ts,
quest-member-photos.ts, org-mission-log.ts, revenue.ts, city-config.ts.

For geography columns use Drizzle customType:
  const geography = customType<{ data: string }>({ dataType() { return 'geography(POINT, 4326)'; } });

Create:
- packages/db/src/index.ts — exports all schema + drizzle db instance
- packages/db/src/migrate.ts — runs migrations
- packages/db/src/seed.ts — seeds:
    city_config: 1 row for Juja with center POINT(36.9719 -1.0898)
    users: 3 test users (1 regular, 1 verified org = Red Cross, 1 admin)
    quests: 3 daily defaults for today
- drizzle.config.ts at db package root
- packages/db/package.json with drizzle-orm, drizzle-kit, postgres deps

Run: pnpm --filter db migrate && pnpm --filter db seed

Verify with psql:
1. \dt — all 18 tables present
2. SELECT postgis_version();
3. SELECT * FROM quests WHERE is_default=true; — 3 rows
4. SELECT ST_Distance('POINT(36.9719 -1.0898)'::geography, location_point) FROM quests LIMIT 1;
Show all outputs.
```

---

### STAGE 3 — Fastify API Foundation
```
Build the Fastify API in apps/api/src/.

Structure:
  index.ts          — entry point, starts server, calls initSocket
  app.ts            — Fastify factory (exported for testing)
  plugins/auth.ts   — @fastify/jwt, verifyJWT helper
  plugins/cors.ts   — @fastify/cors
  plugins/rateLimit.ts — 100/min default, 10/min on /auth routes
  plugins/compress.ts  — @fastify/compress
  hooks/authenticate.ts — preHandler: verify JWT → fetch user → attach to request.user
  errors/index.ts   — NotFoundError, UnauthorizedError, ValidationError, ConflictError
  types/fastify.d.ts — module augmentation: request.user: User

Rules:
- All responses: { data, error } envelope
- request.log.info — never console.log
- Throw on startup if DATABASE_URL, REDIS_URL, SUPABASE_JWT_SECRET missing
- Graceful shutdown: SIGTERM → close server → disconnect DB → quit Redis
- GET /api/v1/health → { data: { status:"ok", uptime, version:"1.0.0" }, error:null }

Verify:
1. pnpm --filter api dev starts without errors
2. curl http://localhost:3000/api/v1/health returns 200
3. curl http://localhost:3000/api/v1/users/me returns 401
Show logs.
```

---

### STAGE 4 — Socket.io
```
Implement Socket.io using the FULL SOCKET.IO IMPLEMENTATION from CLAUDE.md.

Create apps/api/src/socket/index.ts — initSocket, triggerSquadFormation, io export.
Call initSocket in index.ts before server.listen.
Decorate Fastify: fastify.decorate('io', io).

Write socket.test.ts:
1. Start server
2. Connect 2 socket.io-client instances to /quest with test JWTs, both join same quest room
3. Client 1 emits message → verify Client 2 receives it
4. Client 3 joins DIFFERENT quest room → verify it does NOT receive the message
5. Log PASS/FAIL per assertion.

Run: pnpm --filter api test
```

---

### STAGE 5 — Core Quest Routes
```
Implement quest routes using GEO QUERIES from CLAUDE.md.

apps/api/src/routes/quests/:
  feed.ts     GET /api/v1/quests — Feed geo query exactly as written
  radar.ts    GET /api/v1/quests/radar — Radar geo query with bearing_deg
  flash.ts    GET /api/v1/quests/flash — type=flash, 1km, active
  detail.ts   GET /api/v1/quests/:id
              Non-member: return location_label only, omit location_point coordinates
              Non-member: omit member list details (return count only)
              Full quest (members >= max_size): include is_full: true flag
  create.ts   POST /api/v1/quests
              Validation: title 3-60, emoji, type, lat, lng, max_size 3-500,
              description max 300, start_time > now, radius_km only if is_verified_org
              On create: call scheduleQuestJobs(quest)
  join.ts     POST/DELETE /api/v1/quests/:id/join
              On join: check max_size not exceeded
              If count reaches 3: call triggerSquadFormation, triggerQuestMention('squad_formed')
              Schedule contact_swap.notify job at expires_at - 30min
  react.ts    POST /api/v1/quests/:id/react — upsert reactions
  rate.ts     POST /api/v1/quests/:id/rate — only if status=expired
  share.ts    GET /api/v1/q/:slug — resolve share link

scheduleQuestJobs(quest):
  quest.expire delayed at expires_at
  quest.dissolve delayed at expires_at + 2h
  contact_swap.notify delayed at expires_at - 30min
  push.start_soon delayed at start_time - 30min (if start_time set)
  push.expiry_warn delayed at expires_at - 2h

Verify:
1. POST quest → appears in GET /api/v1/quests
2. GET quest detail as non-member → location_point coordinates absent from response
3. Join as 3 users → chat_unlocked Socket.io event fires
4. POST flash quest → appears in GET /api/v1/quests/flash
```

---

### STAGE 6 — BullMQ Jobs
```
Implement ALL jobs from the BULLMQ JOBS section in CLAUDE.md.

apps/api/src/jobs/:
  quests.jobs.ts  — quest.expire, quest.dissolve (full implementation from CLAUDE.md),
                    contact_swap.notify, scheduleQuestJobs helper
  energy.jobs.ts  — quest.energy_recalc (2-signal formula), quest.hype_decay
  daily.jobs.ts   — daily.seed_defaults, daily.seed_wildcards (hardcoded pool, no voting)
  media.jobs.ts   — story_card.generate (full Sharp implementation from CLAUDE.md)
  push.jobs.ts    — push.flash_alert, push.expiry_warn, push.start_soon,
                    push.streak_warn, push.quest_mention
  cleanup.jobs.ts — history.cleanup (72h), member_photos.cleanup (72h + Storage delete)
  payments.jobs.ts — boost.expire, org_sub.expire
  index.ts        — starts all workers, exports all addJob functions

All jobs: attempts:3, backoff: { type:'exponential', delay:5000 }
All jobs: try/catch that logs without crashing the worker.

Verify:
1. Run daily.seed_defaults manually → 3 quests created in Juja
2. Create quest + reactions → run energy_recalc → energy_score updated in DB
3. redis-cli KEYS 'bull:*' shows all queues
```

---

### STAGE 7 — All Remaining API Routes
```
Implement all remaining routes from ALL API ENDPOINTS in CLAUDE.md.

AUTH routes — /api/v1/auth/
  google: verify Supabase token, upsert user, return JWT
  refresh, logout

USER routes — /api/v1/users/
  GET /me — profile + computed badges (8 types: First Quest, Fast Joiner, Squad Starter,
             3-Day Streak, 7-Day Streak, Wild One, Civic Hero, Vibe King)
  PATCH /me — location update + streak logic:
    streak_last_active === yesterday → streak_days++
    older than yesterday → streak_days = 1
    Always set streak_last_active = today
  GET /me/history, /me/badges, /me/squad-memory
  GET /:id — 403 if no shared quest (use profile access SQL query from CLAUDE.md)
  GET /:id/history — full cards for shared quests, limited (emoji+title+date+vibe only) for non-shared

FREE BROADCAST — /api/v1/free/
  POST: enforce 6h cooldown via last_free_broadcast_at
  429 response: { data:null, error:{ message:'Cooldown', code:'COOLDOWN', minutes_remaining:X } }
  On create: emit free_broadcast to /area city room, schedule free.expire job

WILD CARDS — /api/v1/wildcards/
  GET: today's Wild Cards for user's city (type=wildcard, active_date=today)

QUEST STORIES — using FULL QUEST STORIES IMPLEMENTATION from CLAUDE.md:
  getStories, postStory (+ DELETE)
  uploadMemberPhoto (POST + PUT reuse same handler), getMemberPhoto

ORG routes — /api/v1/org/
  GET /quests — all org quests with join counts and reaction totals
  GET /analytics — views (Redis HLL PFCOUNT), joins, vibe breakdown
    Track views: on GET /api/v1/quests/:id → PFADD quest:views:{id} {user_id}
  POST /subscribe — M-Pesa STK push for Org Pro (use stkPush from CLAUDE.md)
  GET /:id/mission-log — public, paginated, from org_mission_log table
  GET /:id/stats — total missions, total participants, vibe breakdown from org_mission_log

PAYMENTS — using M-PESA DARAJA INTEGRATION from CLAUDE.md:
  /payments/boost/initiate, /payments/boost/callback
  /payments/org/initiate, /payments/org/callback

ADMIN — /api/v1/admin/ (require is_admin flag on request.user)
  GET /users — paginated search
  PATCH /users/:id/verify-org — set is_verified_org=true
  GET /revenue — SUM from quest_boosts + org_subscriptions by stream

Verify:
1. POST /free twice → second returns 429 with minutes_remaining
2. GET /users/:id with no shared quest → 403
3. GET /users/:id/history → shared quests return full data, non-shared return limited
4. POST story as poster → 201 + Socket.io story_posted fires
5. POST member photo during active quest → 400 QUEST_ACTIVE
6. GET /org/:id/mission-log — public, returns org's completed quests
```

---

### STAGE 8 — React Native Foundation
```
Set up the Expo app in apps/mobile/.

npx create-expo-app@latest mobile --template blank-typescript
Install:
  nativewind v4, tailwindcss
  expo-router v3
  zustand v4
  axios
  socket.io-client v4
  @mapbox/maps
  react-native-reanimated v3
  react-native-svg
  expo-notifications, expo-location, expo-secure-store, expo-sharing, expo-image
  expo-image-picker
  @supabase/supabase-js, expo-web-browser
  react-native-safe-area-context, react-native-screens

tailwind.config.js: all colour tokens from CLAUDE.md

apps/mobile/src/lib/api.ts:
  Axios instance, Bearer token interceptor, { data, error } unwrapper,
  401 → refresh once → logout

apps/mobile/src/lib/socket.ts:
  io_quest = io(API_URL + '/quest', { autoConnect:false, auth:{ token:getToken } })
  io_area  = io(API_URL + '/area',  { autoConnect:false, auth:{ token:getToken } })
  connectToQuest(quest_id), disconnectFromQuest(), connectToArea(city)

Zustand stores:
  authStore.ts   — user, token, login(), logout(), refreshToken()
  questStore.ts  — feed, radar, fetchFeed(), fetchRadar(), joinQuest(), leaveQuest(), reactToQuest()
  chatStore.ts   — messages per quest_id, sendMessage(), setStatus()
  freeStore.ts   — activeBroadcast, cooldownMinutes, broadcast(), cancelBroadcast()

Expo Router structure:
  app/(auth)/login.tsx
  app/(tabs)/_layout.tsx   — Radar | Feed | Post | Profile
  app/(tabs)/radar.tsx
  app/(tabs)/feed.tsx
  app/(tabs)/post.tsx
  app/(tabs)/profile.tsx
  app/quest/[id].tsx        — detail + chat + stories
  app/free.tsx
  app/user/[id].tsx         — other user's profile
  app/org/[id].tsx          — org mission log
  app/org/dashboard.tsx     — org poster dashboard (is_verified_org only)

Login: Supabase Google OAuth via expo-web-browser. Store token in SecureStore.

Verify: App opens on login, Google OAuth completes, lands on radar tab, /health called successfully.
```

---

### STAGE 9 — Core Screens
```
Build all screens. Use the v4 JSX showcase as visual reference.

RADAR (app/(tabs)/radar.tsx):
  SVG radar (react-native-svg): 4 rings at 38/70/100/124 SVG units = 100m/500m/1km/2km
  Sweep line: Reanimated withRepeat(withTiming(360, {duration:8000}), -1) — spin on Z axis
  Quest dots: x = cx + (dist_m/2000)*maxR * sin(bearing), y = cy - same * cos(bearing)
  Dot colours: orange=casual, teal=community, red=flash, purple=free
  Dot pulse: Reanimated withRepeat(withSequence(withTiming(1.8), withTiming(1)))
  Pulsing glow on user centre dot
  Sorted list below SVG, tap dot → /quest/[id]
  Live pulse bar from Socket.io area:pulse
  Ghost dots (expired quests visible for 2h): greyscale, 40% opacity

FEED (app/(tabs)/feed.tsx):
  Flash ticker: Animated ScrollView auto-scrolling, red accent
  FlatList quest cards with getItemLayout for performance
  Card breathing: Reanimated withRepeat(withSequence(withTiming(1.015), withTiming(1)), -1)
  Full quest cards: dimmed styling, FULL badge, no Join button, "Create similar quest" button
  Energy ●●●● bars (4 segments, orange fill)
  Ghost card at bottom: last dissolved quest, 60% opacity
  Pull to refresh, Casual/Community tabs

QUEST DETAIL (app/quest/[id].tsx):
  Route params: id, profile_user_id (optional — set when navigating from profile)
  Non-member view: show location_label only, hide exact coordinates
  Full quest state: "FULL" badge, "Create similar quest" pre-fills post form
  3 stat cards: Squad | Expires | Starts
  Hype row: 3 reaction buttons, decay bar under each
  Chat: locked (progress dots, X/3) or open (messages FlatList)
  Contact swap modal: slides up 30min before dissolution
  Stories section: Tier 1 org stories always shown; Tier 2 attendance photo only if profile_user_id set AND viewer participated
  Upload attendance photo button: shown only after quest.expires_at AND within 12h window AND user is member

CHAT (embedded in quest/[id].tsx):
  Status strip: horizontal ScrollView of member status chips, tap own to cycle
  FlatList inverted messages
  My messages right/orange, others left/grey
  Socket.io join on mount, disconnect on unmount
  Contact swap: slides up on contact_swap_open event — platform picker (Instagram/Twitter/Phone)

POST (app/(tabs)/post.tsx):
  8 template grid (4x2), tap fills form
  Title, location (reverse geocode via Expo Location), start time DateTimePicker
  Casual/Community toggle; radius picker if is_verified_org + community selected
  Squad size +/− (min 3, max 500)
  Post button disabled until title + location filled

I'M FREE (app/free.tsx):
  Cooldown bar animated with Reanimated
  Active broadcast: shows replies, each with Reply button
  Broadcast button disabled in cooldown with countdown text

PROFILE (app/(tabs)/profile.tsx):
  Streak badge on avatar (bottom-right, gold circle)
  Stats: Quests | Vibe | Energy
  Badge wall: 8 badge types, unearned at 30% opacity
  Story card grid (2-col): full cards for all own history; tap → /quest/[id] with profile_user_id
  Squad memory with Quest again button

OTHER USER PROFILE (app/user/[id].tsx):
  If API returns 403: show "Profile not accessible — join a quest together first"
  Story cards: shared quests = full card; non-shared = limited (emoji + title + date + vibe, no photos)
  Tap full card → /quest/[id] with profile_user_id set

ORG DASHBOARD (app/org/dashboard.tsx — is_verified_org only):
  Active quests with live join counts, Org Pro status, partner badge (2/week progress)

ORG MISSION LOG (app/org/[id].tsx — public):
  Aggregate stats at top: missions, participants
  Timeline list: emoji + title + date + member_count + 📸 if highlight photo
  Tap 📸 → modal with the photo

Verify:
1. Radar shows real API dots, tap navigates to detail
2. Non-member quest detail: no coordinates in response body
3. Full quest: FULL badge shown, no Join button
4. Join as 3rd member → formation_moment + chat_unlocked fires
5. Story upload during active quest → 400 QUEST_ACTIVE
6. Story upload after dissolution within 12h → 201
7. Other user profile without shared quest → 403 screen shown
```

---

### STAGE 10 — Push Notifications + Deploy
```
PUSH NOTIFICATIONS (apps/mobile/src/lib/notifications.ts):
  Request permissions on first launch
  Get Expo push token → PATCH /api/v1/users/me { expo_push_token }
  On notification tap navigate by data.type:
    quest_mention → /quest/[id]
    flash_alert   → /quest/[id]
    vibe_check    → /quest/[id] (opens vibe modal)
    start_soon    → /quest/[id] (opens chat)
    streak_warn   → /(tabs)/feed

Server push helper (apps/api/src/lib/push.ts):
  POST to https://exp.host/--/api/v2/push/send
  Batch in groups of 100
  On DeviceNotRegistrable error: delete token from users table

DEPLOYMENT:
  apps/api/Dockerfile: multi-stage build, node:20-alpine production image
  Railway: add Postgres + Redis services
  Enable PostGIS: CREATE EXTENSION IF NOT EXISTS postgis;
  Set all env vars from .env.example
  railway up → railway run pnpm --filter db migrate → railway run pnpm --filter db seed

  EAS Build: eas build --platform all --profile production
             eas submit

Verify:
  curl https://your-app.railway.app/api/v1/health
  → { "data": { "status": "ok" }, "error": null }
```

---

## Part 6 — Debug Prompts

### Bad SQL
```
Query returning wrong results or timing out:
[paste query]
Schema: [paste relevant tables]
EXPLAIN ANALYZE: [paste output]
Expected vs actual: [describe]
Fix the query. Add index if missing.
```

### Socket.io event not received
```
Event [name] emitted server-side but not received client-side.
Server: [paste]  Client: [paste]  Logs: [paste]
Check: same namespace? correct room? event name identical? same io instance?
Add: console.log count of sockets in room before emit.
```

### BullMQ job not running
```
Job [name] in queue [queue] not processing.
Queue code: [paste]  Worker code: [paste]  Redis URL: [paste]
Run: redis-cli LLEN bull:[queue]:wait
     redis-cli LLEN bull:[queue]:delayed
Is the worker process running? Same Redis URL as producer? Identical queue name strings?
```

### TypeScript errors
```
Fix all TypeScript errors in [file] without using `any` or type assertions.
Canonical types in packages/shared-types/src/index.ts.
Errors: [paste tsc output]
```

### Blank mobile screen
```
Screen [name] is blank. Error if any: [message]
Component: [paste]  Store state: [paste]  API response: [paste]
Debug: log at top of component, log store state, log API response raw,
check null/undefined access, check FlatList keyExtractor.
```

---

## Part 7 — Stage Checklist

```bash
pnpm tsc --noEmit       # zero errors
pnpm lint               # zero errors
pnpm --filter api test  # all pass
git add -A && git commit -m "feat: stage [N] — [name]"
```

---

## Part 8 — Timeline

| Stage | Focus | Active Days |
|---|---|---|
| 1 | Monorepo + types | 0.5 |
| 2 | Database schema + migration | 1 |
| 3 | Fastify foundation | 1 |
| 4 | Socket.io | 1 |
| 5 | Core quest routes | 1.5 |
| 6 | BullMQ jobs | 1.5 |
| 7 | All remaining routes | 2 |
| 8 | React Native foundation | 1.5 |
| 9 | All screens | 3 |
| 10 | Push + deploy | 1 |
| **Total** | | **~14 active days** |

Calendar time: 5–7 weeks.

---

*This document is self-contained. You do not need any other reference during development.*
*Update CLAUDE.md whenever an architectural decision changes.*
