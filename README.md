# SideQuest

SideQuest is a hyper-local spontaneity app for finding things to do nearby, right now. Users post time-limited activities called quests, join small squads, coordinate in temporary quest chats, and then the activity dissolves after it ends.

The product is designed around one opening question:

> What can I do right now, near me, with other people?

This repository currently contains a frontend-only SideQuest normal-user radar screen, plus the SideQuest v4.1 development guide and visual showcase. The guide remains the source of truth for the full future monorepo implementation.

## Current Repository Contents

```text
sidequest/
+-- README.md
+-- index.html
+-- package.json
+-- src/                         # frontend-only React app
+-- sidequest_guide_v41.md       # complete development guide and implementation spec
+-- sidequest_showcase_v41.jsx   # visual blueprint for user, org, and admin screens
```

## Product Principles

- No followers or persistent social graph.
- Quests, chats, and most personal story content are temporary.
- The feed is always local.
- Quest chats unlock only when a squad forms.
- Full quests remain visible as social proof, but cannot be joined.
- Profile access is restricted to users who share or have shared a quest.
- Verified organizations can post wider community quests and maintain a public mission log.
- The app experience should feel immediate, local, and night-city oriented.

## Planned Monorepo Structure

The implementation guide specifies this target structure:

```text
sidequest/
+-- CLAUDE.md
+-- .claudeignore
+-- apps/
|   +-- api/                     # Fastify backend
|   +-- mobile/                  # React Native Expo app
+-- packages/
|   +-- db/                      # Drizzle ORM schema and migrations
|   +-- shared-types/            # shared TypeScript interfaces
+-- infra/
|   +-- docker-compose.yml       # local Postgres and Redis
+-- .env.example
```

## Planned Tech Stack

- Runtime: Node.js 20 and strict TypeScript
- API: Fastify v4
- Mobile: React Native with Expo SDK 51
- Database: PostgreSQL 15 with PostGIS 3.4
- ORM: Drizzle ORM
- Real time: Socket.io v4
- Queue: BullMQ v5 with Redis 7
- Auth and storage: Supabase
- Payments: Safaricom Daraja M-Pesa STK Push
- Push notifications: Expo Notifications, FCM, and APNs
- Maps: Mapbox GL
- Styling: NativeWind v4
- Monorepo tooling: pnpm workspaces and Turborepo

## Core Features

- Local quest feed with casual, community, flash, wildcard, and default quests.
- Radar view with distance rings, bearings, live area pulse, and ghost dots for recently dissolved quests.
- Quest detail pages that hide exact coordinates until the viewer joins.
- Temporary squad chat that unlocks at exactly three members.
- I'm Free broadcasts with a six-hour cooldown.
- Hype, energy, and reaction signals for active quests.
- Contact swap shortly before quest dissolution.
- Two-tier quest stories for official org records and member attendance photos.
- Verified org dashboard, analytics, Org Pro subscriptions, and mission log.
- Admin tools for city activation, user verification, and revenue review.

## Development Roadmap

The complete stage-by-stage build plan is in [sidequest_guide_v41.md](./sidequest_guide_v41.md).

| Stage | Focus | Estimated Active Days |
| --- | --- | ---: |
| 1 | Monorepo foundation and shared types | 0.5 |
| 2 | Database schema and migrations | 1 |
| 3 | Fastify API foundation | 1 |
| 4 | Socket.io implementation | 1 |
| 5 | Core quest routes | 1.5 |
| 6 | BullMQ jobs | 1.5 |
| 7 | Remaining API routes | 2 |
| 8 | React Native foundation | 1.5 |
| 9 | Core mobile screens | 3 |
| 10 | Push notifications and deployment | 1 |

Estimated total: about 14 active development days, or 5 to 7 calendar weeks.

## Frontend App

The current runnable app is the first normal-user page from the showcase: the Radar screen. It includes the Juja live pulse, animated radar rings, nearby quest dots, selectable nearest quests, a ghost quest, join state, and the normal-user action bar.

Run it locally:

```bash
npm install
npm run dev
```

Build it:

```bash
npm run build
```

## Full Product Implementation

Follow the guide in order. The first implementation stage creates the actual pnpm monorepo:

```bash
mkdir -p sidequest/{apps/api,apps/mobile,packages/shared-types,packages/db,infra}
cd sidequest
git init
pnpm init
```

After Stage 1 is complete, the expected local workflow is:

```bash
pnpm install
docker-compose up -d
pnpm dev
```

## Required Environment Variables

The implementation will require:

```text
DATABASE_URL
REDIS_URL
SUPABASE_URL
SUPABASE_SERVICE_KEY
SUPABASE_JWT_SECRET
DARAJA_CONSUMER_KEY
DARAJA_CONSUMER_SECRET
DARAJA_SHORTCODE
DARAJA_PASSKEY
DARAJA_CALLBACK_URL
EXPO_ACCESS_TOKEN
MAPBOX_TOKEN
PORT
NODE_ENV
```

## Verification Targets

The guide defines verification checks for every stage. At minimum, completed implementation stages should pass:

```bash
pnpm tsc --noEmit
pnpm lint
pnpm --filter api test
```

The backend health endpoint should return the standard API envelope:

```json
{
  "data": {
    "status": "ok"
  },
  "error": null
}
```

## Source Documents

- [Complete development guide v4.1](./sidequest_guide_v41.md)
- [Visual showcase v4.1](./sidequest_showcase_v41.jsx)

Update the implementation guide whenever a product or architecture decision changes.
