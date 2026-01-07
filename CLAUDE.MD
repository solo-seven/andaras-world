# Andara's World - Project Overview for Claude

**Last Updated**: January 2026
**Branch**: keen-brown
**Project Type**: Browser-based tactical RPG
**Tech Stack**: React + TypeScript (Frontend) | Spring Boot + Java (Backend) | PostgreSQL + Kafka (Infrastructure)

---

## Table of Contents

1. [Project Vision](#project-vision)
2. [Architecture Overview](#architecture-overview)
3. [Current Development Status](#current-development-status)
4. [Completed Epics](#completed-epics)
5. [Active Development](#active-development)
6. [Key Technical Patterns](#key-technical-patterns)
7. [Development Workflow](#development-workflow)
8. [Important File Locations](#important-file-locations)
9. [Design Philosophy](#design-philosophy)
10. [Common Tasks](#common-tasks)

---

## Project Vision

Andara's World is a **post-apocalyptic tactical RPG** set in a world fractured by "The Convergence" - a catastrophic dimensional event. Players create a protagonist, gather companions, and navigate a resource-scarce world where **survival, crafting, and tactical combat** drive the experience.

### Core Design Pillars

| Pillar | Meaning |
|--------|---------|
| **Scarcity Creates Story** | Resources are limited; how you spend them defines your playthrough |
| **Specialization Over Optimization** | No perfect builds; trade-offs everywhere |
| **Emergence Over Script** | Systems interact to produce narrative, not authored plot |
| **Consequence Without Punishment** | Failure changes the game, doesn't end it (except protagonist death) |
| **Crafted Identity** | Players leave marks on the world through unique creations |

### Key Game Systems

- **Character Creation**: Origin-based backgrounds, point-buy attributes (6 core), skill focuses
- **Survival**: Food/water management, environmental hazards, rest & recovery
- **Travel**: Overworld zone-to-zone movement, vehicle systems (future), encounter events
- **Combat**: Turn-based tactical on grid, AP-based actions, positioning matters
- **Crafting**: Transform scavenged materials into items, quality scales with skill
- **Magic (Arcane)**: Rift Energy from dimensional rifts, dangerous but powerful
- **Progression**: Use-based skill improvement, ability unlocks at proficiency thresholds
- **Economy**: Credit-based trading, faction standing, future Dimensional Market (cross-instance)
- **Artifact Forge**: Create unique one-of-a-kind items for personal use or trade

---

## Architecture Overview

### High-Level Architecture Pattern

```
┌─────────────────────────────────────────────────────────────────┐
│                          CLIENT (React)                         │
│  ┌──────────┐  ┌──────────┐  ┌──────────┐  ┌──────────┐       │
│  │  React   │  │  Redux   │  │  WebGL   │  │  Audio   │       │
│  │  UI      │  │  State   │  │ Renderer │  │ Manager  │       │
│  └────┬─────┘  └────┬─────┘  └────┬─────┘  └──────────┘       │
│       └─────────────┼─────────────┘                            │
│              ┌──────┴──────┐                                   │
│              │  API Client │                                   │
│              └──────┬──────┘                                   │
└─────────────────────┼──────────────────────────────────────────┘
                      │ HTTP/WebSocket
┌─────────────────────┼──────────────────────────────────────────┐
│              ┌──────┴──────┐       SERVER (Spring Boot)        │
│              │ Controllers │                                   │
│              └──────┬──────┘                                   │
│    ┌────────────────┼────────────────┐                         │
│    │                │                │                         │
│    ▼                ▼                ▼                         │
│ ┌──────┐        ┌──────┐        ┌──────┐                      │
│ │World │        │Party │        │Combat│                      │
│ │Svc   │        │Svc   │        │Svc   │                      │
│ └──┬───┘        └──┬───┘        └──┬───┘                      │
│    └───────────────┴───────┬────────┘                         │
│                    ┌───────┴───────┐                           │
│                    │  Command Bus  │                           │
│                    └───────┬───────┘                           │
│    ┌───────────────────────┼───────────────────────┐           │
│    ▼                       ▼                       ▼           │
│ ┌──────────┐        ┌──────────┐        ┌──────────┐          │
│ │  Event   │◄──────►│   Read   │        │  Kafka   │          │
│ │  Store   │        │  Models  │        │ Producer │          │
│ │(Postgres)│        │(Postgres)│        └────┬─────┘          │
│ └──────────┘        └──────────┘             │                │
└──────────────────────────────────────────────┼────────────────┘
                                        ┌──────┴──────┐
                                        │    Kafka    │
                                        │   Cluster   │
                                        └─────────────┘
```

### Key Architectural Decisions

| Decision | Choice | Rationale |
|----------|--------|-----------|
| **Backend Framework** | Spring Boot 3.x | Mature ecosystem, team familiarity, production-ready |
| **Database** | PostgreSQL 15+ | JSONB support, event store capability, reliability |
| **Event Streaming** | Apache Kafka | Event sourcing, future sync support, scalability |
| **Frontend Framework** | React 18+ | Component model, ecosystem, team familiarity |
| **State Management** | Redux Toolkit | Predictable state, devtools, middleware |
| **Rendering** | WebGL (PixiJS) | 2D orthographic, sprite batching, performance |
| **Architecture Pattern** | Event Sourcing + CQRS | Append-only events, replay capability, separate read/write models |
| **Deployment** | Docker Compose (local) | Containerization, reproducible builds |

### Event Sourcing & CQRS

All state changes flow through **domain events** stored in an append-only event store:

1. **Commands** → Validated and handled by domain aggregates
2. **Domain Events** → Persisted to PostgreSQL event store
3. **Events Published** → Sent to Kafka topics by context
4. **Read Models** → Built from events via projections (eventual consistency)
5. **Queries** → Served from optimized read models

**Example Flow** (Party Movement):
```
MovePartyCommand → PartyAggregate.moveTo() → PartyMoved event
  → EventStore.append() → Kafka publish → PartyProjectionHandler
  → Update party_view table → Client queries party state
```

---

## Current Development Status

### MVP Scope (3-Month Prototype)

**Goal**: Playable vertical slice demonstrating core loops

**In Scope**:
- Character creation (full workflow)
- Party management (protagonist + 2 companions)
- Zone exploration (on foot)
- Turn-based tactical combat (basic abilities)
- Inventory & equipment
- Basic crafting (20 recipes, 2 stations)
- Skill progression (10 core skills)
- Local save/load

**Out of Scope for MVP**:
- Dimensional Market (cross-instance trading)
- Vehicle travel
- Artifact Forge (unique item creation)
- Full magic system (only 5 basic abilities)
- Companion recruitment system (pre-defined companions)
- Advanced tech tiers (Salvage tier only)

---

## Completed Epics

### ✅ Epic 1: Event Store Infrastructure

**Status**: COMPLETED
**Effort**: 23 points (P0 stories only)

Established the foundational event sourcing architecture:

- ✅ Event store schema and persistence (`domain_events`, `aggregate_snapshots` tables)
- ✅ Kafka event publishing (topics: `andara.events.{world,party,encounter,agent}`)
- ✅ Aggregate root framework (`AggregateRoot` base class, event application)
- ✅ Event-sourced repository pattern (load by replay, save with events)
- ✅ Command handler framework (`CommandBus`, `CommandHandler<T>`)
- ✅ Aggregate snapshot management (optimization for long event histories)

**Key Files**:
- `andara-infrastructure/` - Event store implementation
- `andara-domain/` - Aggregate base classes
- `andara-application/` - Command handlers

### ✅ Epic 2: Rendering & UI Foundation

**Status**: COMPLETED
**Effort**: 52 points

Built the client-side presentation layer:

- ✅ React app with Redux Toolkit state management
- ✅ API client and WebSocket manager
- ✅ PixiJS WebGL canvas initialization
- ✅ Camera and viewport system (pan, zoom, follow)
- ✅ Sprite asset loading and management
- ✅ Tile-based world rendering (with culling optimization)
- ✅ UI component library (styled per Functional Brutalism aesthetic)
- ✅ Main game layout and HUD (party panel, notifications, action bar)
- ✅ Redux-to-renderer state sync (`useGameRenderer` hook)

**Key Files**:
- `andara-client/src/store/` - Redux slices
- `andara-client/src/game/renderer/` - WebGL rendering
- `andara-client/src/components/` - React UI components
- `docs/ui-style-guide.md` - Visual design system

### ✅ Epic 3: Player Initiation

**Status**: COMPLETED (11/12 stories)
**Effort**: ~20 points

Implemented the character creation flow:

- ✅ Landing page with "New Game" entry point
- ✅ 5-step character creation workflow (Origin → Attributes → Skills → Appearance → Name)
- ✅ Origin selection (6 backgrounds with bonuses/penalties)
- ✅ Point-buy attribute allocation (27 points across 6 attributes)
- ✅ Skill focus selection (2 focus skills + 1 origin bonus)
- ✅ Appearance customization (structured presets for gender, build, hair, eyes, skin)
- ✅ Name input and character summary
- ✅ Backend character creation command handler (`POST /api/v1/game/start`)
- ✅ Character read model projection (`character_view`, `party_view` tables)
- ✅ Frontend submission with loading states and error handling
- ✅ Character sheet display (shows created character)
- ✅ Save game record creation (auto-save on character creation)

**Remaining Work**:
- Story PI-11: Polish character sheet UI and add "Begin Adventure" transition

**Key Files**:
- `andara-client/src/components/characterCreation/` - Creation workflow
- `andara-application/commands/StartNewGameCommandHandler.java`
- `andara-query/projections/CharacterProjectionHandler.java`

---

## Active Development

### 🚧 Epic 4: Content Authoring System

**Status**: NOT STARTED
**Priority**: HIGH (foundational for iteration)
**Effort**: ~50 points

Build a content management system for game data (items, skills, recipes, regions).

**Planned Stories**:
1. Content schema definition (JSON Schema for all content types)
2. Content authoring CLI tool (`andara-content-cli`)
3. Content validation engine (schema, references, balance rules)
4. Content import service (`POST /api/admin/content/import`)
5. Content export service (database → files)
6. Content hot-reload in development (file watcher)
7. Content diff and merge tool (conflict resolution)
8. Content web UI admin panel (React-based editor)
9. Content seeding for development (baseline dataset)
10. Content documentation generator (Markdown output)

**Why This Is Next**:
- Unblocks content designers to work independently
- Enables rapid iteration on game balance
- Prevents hardcoding data in domain model
- Required before implementing combat, crafting, and world systems

---

## Key Technical Patterns

### 1. Event Sourcing

**Pattern**: All state changes are captured as immutable events

```java
// Domain Aggregate
public class Party extends AggregateRoot {
    public void moveTo(ZoneId target, AgentId issuedBy) {
        // Validate move
        if (!currentZone.isAdjacentTo(target)) {
            throw new IllegalMoveException();
        }

        // Apply event
        applyEvent(new PartyMoved(partyId, currentZone, target, issuedBy));
    }

    @Override
    protected void when(DomainEvent event) {
        switch (event) {
            case PartyMoved e -> {
                this.position = new WorldPosition(
                    position.instanceId(),
                    position.regionId(),
                    e.newZoneId(),
                    position.gridX(),
                    position.gridY()
                );
            }
            // ... other events
        }
    }
}
```

**Loading Aggregates**:
```java
@Repository
public class EventSourcedPartyRepository {
    public Party load(PartyId id) {
        // Check for snapshot (optimization)
        Optional<Snapshot> snapshot = snapshots.findLatest(id, "Party");
        long fromSequence = snapshot.map(Snapshot::sequenceNumber).orElse(0L);

        // Load events since snapshot
        List<DomainEvent> events = eventStore.getEvents(id.value(), "Party", fromSequence);

        // Reconstitute aggregate
        Party party = snapshot
            .map(s -> Party.fromSnapshot(s.data()))
            .orElse(Party.empty(id));

        // Replay events
        for (DomainEvent event : events) {
            party.applyHistoricalEvent(event);
        }

        return party;
    }
}
```

### 2. CQRS (Read Models)

**Pattern**: Separate read and write models for performance and clarity

**Write Side** (Commands):
```java
@Component
public class MovePartyCommandHandler implements CommandHandler<MovePartyCommand> {
    @Override
    @Transactional
    public Result<List<DomainEvent>> handle(MovePartyCommand command) {
        // Load aggregate
        Party party = partyRepository.load(command.partyId());

        // Execute domain logic
        party.moveTo(command.targetZoneId(), command.issuedBy());

        // Persist events
        List<DomainEvent> events = party.getUncommittedEvents();
        partyRepository.save(party, events);

        return Result.success(events);
    }
}
```

**Read Side** (Projections):
```java
@Component
public class PartyProjectionHandler {
    @KafkaListener(topics = "andara.events.party")
    public void handle(DomainEvent event) {
        switch (event) {
            case PartyMoved e -> updatePosition(e);
            case CharacterRecruited e -> addCharacter(e);
            // ...
        }
    }

    private void updatePosition(PartyMoved event) {
        jdbc.update(
            "UPDATE party_view SET position_zone = ?, updated_at = ? WHERE party_id = ?",
            event.newZoneId(), event.timestamp(), event.partyId()
        );
    }
}
```

**Query Service**:
```java
@Service
public class PartyQueryService {
    public PartyView getParty(PartyId id) {
        return jdbc.queryForObject(
            "SELECT * FROM party_view WHERE party_id = ?",
            partyViewRowMapper,
            id.value()
        );
    }
}
```

### 3. Redux State Management (Frontend)

**Pattern**: Centralized state with predictable updates

```typescript
// Redux Slice
export const partySlice = createSlice({
  name: 'party',
  initialState: {
    partyId: null,
    members: [],
    position: null,
    inventory: { items: [], credits: 0 },
  },
  reducers: {
    partyUpdated: (state, action: PayloadAction<PartyView>) => {
      state.partyId = action.payload.partyId;
      state.members = action.payload.members;
      state.position = action.payload.position;
    },
    characterSelected: (state, action: PayloadAction<string>) => {
      state.selectedCharacterId = action.payload;
    },
  },
});

// React Component
export const PartyPanel: React.FC = () => {
  const party = useAppSelector((state) => state.party);
  const dispatch = useAppDispatch();

  return (
    <Panel>
      {party.members.map((character) => (
        <CharacterCard
          key={character.id}
          character={character}
          onClick={() => dispatch(selectCharacter(character.id))}
        />
      ))}
    </Panel>
  );
};
```

### 4. WebGL Rendering with PixiJS

**Pattern**: Layered rendering with camera transforms

```typescript
export class WorldRenderer {
  private layers = {
    terrain: new PIXI.Container(),
    objects: new PIXI.Container(),
    entities: new PIXI.Container(),
    effects: new PIXI.Container(),
    uiOverlay: new PIXI.Container(),
  };

  constructor(app: PIXI.Application) {
    this.app = app;

    // Add layers in z-order
    this.app.stage.addChild(this.layers.terrain);
    this.app.stage.addChild(this.layers.objects);
    this.app.stage.addChild(this.layers.entities);
    this.app.stage.addChild(this.layers.effects);
    this.app.stage.addChild(this.layers.uiOverlay);

    // Start game loop
    this.app.ticker.add(this.update, this);
  }

  private update(deltaTime: number) {
    // Update camera
    this.camera.update(deltaTime);
    this.camera.applyToContainer(this.app.stage);

    // Render only visible tiles (culling)
    const visibleBounds = this.camera.getWorldBounds();
    this.tileRenderer.render(visibleBounds);

    // Animate sprites
    this.processAnimationQueue(deltaTime);
  }
}
```

---

## Development Workflow

### Setting Up Local Environment

```bash
# Clone repository (already done in worktree)
cd /Users/bashburn/.claude-worktrees/andaras-world/keen-brown

# Start infrastructure (PostgreSQL, Kafka, Zookeeper)
docker-compose up -d

# Build backend
cd andara-server
./gradlew build

# Run backend
./gradlew bootRun

# In another terminal, run frontend
cd andara-client
npm install
npm run dev

# Access application
# Frontend: http://localhost:3000
# Backend API: http://localhost:8080
# Actuator: http://localhost:8080/actuator
```

### Git Workflow

**Current Branch**: `keen-brown` (feature branch)
**Main Branch**: `main`

```bash
# Make changes in worktree
git add .
git commit -m "feat: add character sheet display"

# Push to remote
git push origin keen-brown

# When ready, create PR
gh pr create --title "Epic: Player Initiation" --body "..."
```

### Testing

```bash
# Backend tests
cd andara-server
./gradlew test

# Frontend tests
cd andara-client
npm test

# Integration tests
./gradlew integrationTest
```

---

## Important File Locations

### Documentation

| File | Description |
|------|-------------|
| `docs/andaras_world_gdd.md` | Game Design Document - mechanics, systems, balance |
| `docs/andaras_world_architecture.md` | Technical architecture definition |
| `docs/andaras_world_domain_model.md` | Domain model, aggregates, events |
| `docs/andaras_world_inception.md` | Original project vision and goals |
| `docs/ui-style-guide.md` | Visual design system (Functional Brutalism) |
| `docs/epics/` | Epic definitions with user stories |

### Backend Code

| Path | Contents |
|------|----------|
| `andara-server/andara-api/` | REST controllers, WebSocket handlers |
| `andara-server/andara-application/` | Command handlers, application services |
| `andara-server/andara-domain/` | Aggregates, domain events, value objects |
| `andara-server/andara-infrastructure/` | Event store, Kafka, database persistence |
| `andara-server/andara-query/` | Read models, projections, query services |
| `andara-server/andara-common/` | Shared utilities, value objects |

### Frontend Code

| Path | Contents |
|------|----------|
| `andara-client/src/store/` | Redux slices, middleware |
| `andara-client/src/api/` | API client, WebSocket manager |
| `andara-client/src/game/renderer/` | PixiJS rendering engine |
| `andara-client/src/components/` | React UI components |
| `andara-client/src/hooks/` | Custom React hooks |

### Configuration

| File | Purpose |
|------|---------|
| `docker-compose.yml` | Local infrastructure services |
| `andara-server/src/main/resources/application.yml` | Spring Boot configuration |
| `andara-client/vite.config.ts` | Frontend build configuration |

---

## Design Philosophy

### Functional Brutalism Aesthetic

**Visual Style**: Gritty, utilitarian, post-apocalyptic with rift energy accents

**Color Palette**:
- **Neutral Grays**: Void (#0a0e14), Concrete (#1a1f28), Steel (#2d3542), Rust (#3d4451)
- **Rift Energy**: Stable (#4da6ff), Volatile (#ff6b6b), Arcane (#d946ff), Healing (#4dffb8)

**Typography**:
- **Headings**: Rajdhani (bold, uppercase, geometric sans-serif)
- **Body/UI**: IBM Plex Mono (monospaced, technical feel)

**UI Principles**:
- **Function Over Form**: Every element serves a purpose
- **No Skeuomorphism**: Flat, geometric, no fake textures
- **Clear Hierarchy**: Size, weight, and color indicate importance
- **Corner Brackets**: Unique decorative element for primary panels
- **Rift Glow**: Interactive elements glow with rift energy on hover/focus

### Game Design Principles

1. **Scarcity Creates Tension**: Resources are limited, choices matter
2. **Emergent Narrative**: Systems create stories, not scripted events
3. **Meaningful Failure**: Setbacks change the game, don't end it
4. **Player Expression**: Crafting and character builds allow unique playstyles
5. **Tactical Depth**: Positioning, terrain, and abilities create combat variety

---

## Common Tasks

### Adding a New Domain Event

1. **Create Event Class**:
```java
// andara-domain/src/main/java/com/andara/domain/events/
@JsonTypeName("ItemCrafted")
public class ItemCrafted extends DomainEvent {
    private final ItemId itemId;
    private final CharacterId craftedBy;
    private final ItemQuality quality;

    // Constructor, getters
}
```

2. **Handle Event in Aggregate**:
```java
@Override
protected void when(DomainEvent event) {
    switch (event) {
        case ItemCrafted e -> {
            this.inventory.addItem(e.itemId(), e.quality());
        }
        // ...
    }
}
```

3. **Project Event to Read Model**:
```java
@Component
public class InventoryProjectionHandler {
    @KafkaListener(topics = "andara.events.party")
    public void handle(DomainEvent event) {
        if (event instanceof ItemCrafted e) {
            jdbc.update(
                "INSERT INTO inventory_items (party_id, item_id, quality) VALUES (?, ?, ?)",
                e.partyId(), e.itemId(), e.quality()
            );
        }
    }
}
```

### Adding a New UI Component

1. **Create Component** (`andara-client/src/components/`):
```typescript
import React from 'react';
import styled from 'styled-components';

interface HealthBarProps {
  current: number;
  max: number;
}

export const HealthBar: React.FC<HealthBarProps> = ({ current, max }) => {
  const percentage = (current / max) * 100;

  return (
    <Container>
      <Fill style={{ width: `${percentage}%` }} />
      <Label>{current} / {max}</Label>
    </Container>
  );
};

const Container = styled.div`
  width: 100%;
  height: 20px;
  background: var(--color-concrete);
  border: 1px solid var(--color-rust);
  position: relative;
`;

const Fill = styled.div`
  height: 100%;
  background: linear-gradient(90deg, var(--color-rift-healing), var(--color-rift-stable));
  transition: width 0.3s ease;
`;

const Label = styled.span`
  position: absolute;
  top: 50%;
  left: 50%;
  transform: translate(-50%, -50%);
  color: var(--color-bleached);
  font-family: var(--font-primary);
  font-size: 12px;
`;
```

2. **Add to Style Guide** (if reusable):
```markdown
## Health Bar

Usage: Display character health with visual bar and numeric values.

Props:
- `current: number` - Current health
- `max: number` - Maximum health

Example:
\`\`\`tsx
<HealthBar current={75} max={100} />
\`\`\`
```

### Running Database Migrations

```bash
# Backend uses Flyway for migrations
cd andara-server

# Create new migration
# File: src/main/resources/db/migration/V{version}__description.sql
# Example: V003__add_inventory_items_table.sql

# Run migrations
./gradlew flywayMigrate

# Rollback (if needed)
./gradlew flywayClean  # WARNING: Drops all tables
```

### Testing Event Sourcing

```java
@Test
void partyMovement_shouldGeneratePartyMovedEvent() {
    // Given
    Party party = PartyFixtures.createParty();
    ZoneId target = ZoneId.of("zone_wasteland_02");

    // When
    party.moveTo(target, AgentId.player());

    // Then
    List<DomainEvent> events = party.getUncommittedEvents();
    assertThat(events).hasSize(1);
    assertThat(events.get(0)).isInstanceOf(PartyMoved.class);

    PartyMoved event = (PartyMoved) events.get(0);
    assertThat(event.newZoneId()).isEqualTo(target);
}
```

---

## Next Steps

### Immediate Priorities

1. **Complete Player Initiation Epic** (1 story remaining)
   - Polish character sheet UI
   - Add "Begin Adventure" transition to world view

2. **Begin Content Authoring Epic** (unblocks all content work)
   - Define JSON schemas for all content types
   - Build CLI tool for content validation
   - Implement content import service

3. **World Exploration System** (core gameplay loop)
   - Zone navigation
   - POI discovery and interaction
   - Fog of war

### Medium-Term Goals (Next 2 Months)

- **Combat Encounter System**: Turn-based tactical combat
- **Inventory & Equipment**: Item management, equipping
- **Skills & Progression**: Skill improvement, ability unlocks
- **Crafting System**: Recipe-based crafting at stations

### Long-Term Vision (Post-MVP)

- **Dimensional Market**: Cross-instance asynchronous trading
- **Artifact Forge**: Unique item creation system
- **Companion Recruitment**: Dynamic party building
- **Advanced Magic**: Full arcane skill tree
- **Vehicle Travel**: Overworld movement optimization
- **LLM Integration**: Dynamic NPC dialogue and emergent storytelling

---

## Questions? Need Help?

**Key Documentation**:
- Game Design: `docs/andaras_world_gdd.md`
- Architecture: `docs/andaras_world_architecture.md`
- Visual Style: `docs/ui-style-guide.md`
- Domain Model: `docs/andaras_world_domain_model.md`

**Common Issues**:
- **Event store errors**: Check PostgreSQL is running (`docker-compose ps`)
- **Kafka connection failed**: Verify Kafka and Zookeeper containers are up
- **Frontend build errors**: Delete `node_modules` and `npm install` again
- **Backend compilation errors**: Run `./gradlew clean build`

**Git Help**:
- Current branch: `keen-brown`
- Main branch: `main`
- Create PR when ready: `gh pr create`

---

**Last Updated**: January 7, 2026
**Maintainer**: Andara's World Development Team
**License**: Proprietary
