# Andara's World - Quick Reference Guide

**For**: Developers, Claude Code, and AI Assistants
**Last Updated**: January 7, 2026

---

## Table of Contents

- [Getting Started](#getting-started)
- [Common Commands](#common-commands)
- [Code Patterns](#code-patterns)
- [API Endpoints](#api-endpoints)
- [Database Queries](#database-queries)
- [Testing](#testing)
- [Troubleshooting](#troubleshooting)
- [Key Concepts](#key-concepts)

---

## Getting Started

### First Time Setup

```bash
# Navigate to project
cd /Users/bashburn/.claude-worktrees/andaras-world/keen-brown

# Start infrastructure
docker-compose up -d

# Verify services are running
docker-compose ps

# Expected output:
# - postgres (5432)
# - kafka (9092)
# - zookeeper (2181)

# Build backend
cd andara-server
./gradlew clean build

# Run backend (in one terminal)
./gradlew bootRun

# Install frontend dependencies (in another terminal)
cd ../andara-client
npm install

# Run frontend dev server
npm run dev

# Access application
# Frontend: http://localhost:3000
# Backend: http://localhost:8080
# Health: http://localhost:8080/actuator/health
```

### Daily Workflow

```bash
# Morning routine
docker-compose start      # Start infrastructure
cd andara-server && ./gradlew bootRun &
cd andara-client && npm run dev &

# Evening routine
docker-compose stop       # Stop infrastructure (preserves data)
```

---

## Common Commands

### Backend (Gradle)

```bash
# Build
./gradlew clean build

# Run tests
./gradlew test

# Run specific test class
./gradlew test --tests com.andara.application.party.CreateCharacterCommandHandlerTest

# Run integration tests
./gradlew integrationTest

# Run application
./gradlew bootRun

# Check dependencies
./gradlew dependencies

# Format code
./gradlew spotlessApply
```

### Frontend (npm)

```bash
# Install dependencies
npm install

# Run dev server (with hot reload)
npm run dev

# Build for production
npm run build

# Run tests
npm test

# Run tests in watch mode
npm test -- --watch

# Lint code
npm run lint

# Format code
npm run format

# Type check
npm run type-check
```

### Docker

```bash
# Start all services
docker-compose up -d

# Stop all services (keep data)
docker-compose stop

# Stop and remove containers (lose data)
docker-compose down

# View logs
docker-compose logs -f [service-name]
# Example: docker-compose logs -f postgres

# Restart a service
docker-compose restart postgres

# Rebuild and restart
docker-compose up -d --build

# Check service status
docker-compose ps

# Execute command in running container
docker-compose exec postgres psql -U andara -d andara
```

### Git

```bash
# Check status
git status

# View recent commits
git log --oneline --graph -10

# Create feature branch
git checkout -b feature/my-feature

# Stage changes
git add .

# Commit
git commit -m "feat: add new feature"

# Push to remote
git push origin feature/my-feature

# Create PR (using GitHub CLI)
gh pr create --title "Add new feature" --body "Description"

# Switch branches
git checkout main
git checkout keen-brown

# Pull latest changes
git pull origin keen-brown

# View diff
git diff
git diff --staged
```

---

## Code Patterns

### 1. Adding a New Domain Event

**Step 1: Create Event Class**

```java
// andara-domain/src/main/java/com/andara/domain/events/party/ItemEquipped.java
package com.andara.domain.events.party;

import com.andara.domain.events.DomainEvent;
import com.fasterxml.jackson.annotation.JsonTypeName;
import java.util.UUID;

@JsonTypeName("ItemEquipped")
public class ItemEquipped extends DomainEvent {
    private final UUID characterId;
    private final UUID itemId;
    private final String equipmentSlot;

    public ItemEquipped(
        UUID aggregateId,
        UUID characterId,
        UUID itemId,
        String equipmentSlot
    ) {
        super(aggregateId, "Character");
        this.characterId = characterId;
        this.itemId = itemId;
        this.equipmentSlot = equipmentSlot;
    }

    // Getters
    public UUID getCharacterId() { return characterId; }
    public UUID getItemId() { return itemId; }
    public String getEquipmentSlot() { return equipmentSlot; }
}
```

**Step 2: Handle in Aggregate**

```java
// andara-domain/.../Character.java
@Override
protected void when(DomainEvent event) {
    switch (event) {
        case ItemEquipped e -> {
            this.equipment.put(e.getEquipmentSlot(), e.getItemId());
        }
        // ... other cases
    }
}

public void equipItem(UUID itemId, String slot) {
    // Validate
    if (!this.inventory.hasItem(itemId)) {
        throw new ItemNotInInventoryException(itemId);
    }

    // Apply event
    applyEvent(new ItemEquipped(
        this.id,
        this.characterId,
        itemId,
        slot
    ));
}
```

**Step 3: Project to Read Model**

```java
// andara-query/.../CharacterProjectionHandler.java
@KafkaListener(topics = "andara.events.party")
public void handle(DomainEvent event) {
    if (event instanceof ItemEquipped e) {
        jdbc.update(
            """
            UPDATE character_view
            SET equipment = jsonb_set(equipment, ?, to_jsonb(?::text))
            WHERE character_id = ?
            """,
            "{" + e.getEquipmentSlot() + "}",
            e.getItemId().toString(),
            e.getCharacterId()
        );
    }
}
```

### 2. Adding a New Command

**Step 1: Define Command**

```java
// andara-application/commands/party/EquipItemCommand.java
package com.andara.application.commands.party;

import com.andara.application.commands.Command;
import java.util.UUID;

public record EquipItemCommand(
    UUID characterId,
    UUID itemId,
    String equipmentSlot,
    UUID issuedBy
) implements Command {
    @Override
    public UUID issuedBy() {
        return issuedBy;
    }
}
```

**Step 2: Create Handler**

```java
// andara-application/commands/party/EquipItemCommandHandler.java
@Component
public class EquipItemCommandHandler implements CommandHandler<EquipItemCommand> {

    private final CharacterRepository characterRepository;
    private final AuthorizationService authService;

    @Override
    @Transactional
    public Result<List<DomainEvent>> handle(EquipItemCommand command) {
        // Authorize
        if (!authService.canExecute(command.issuedBy(), command)) {
            return Result.failure("Not authorized");
        }

        // Load aggregate
        Character character = characterRepository.load(command.characterId());

        // Execute domain logic
        character.equipItem(command.itemId(), command.equipmentSlot());

        // Persist events
        List<DomainEvent> events = character.getUncommittedEvents();
        characterRepository.save(character, events);

        return Result.success(events);
    }
}
```

**Step 3: Create API Endpoint**

```java
// andara-api/.../CharacterController.java
@PostMapping("/{characterId}/equip")
public ResponseEntity<ApiResponse<CommandResponse>> equipItem(
    @PathVariable UUID characterId,
    @RequestBody EquipItemRequest request,
    @AuthenticationPrincipal AgentId agentId
) {
    EquipItemCommand command = new EquipItemCommand(
        characterId,
        request.itemId(),
        request.equipmentSlot(),
        agentId
    );

    Result<List<DomainEvent>> result = commandBus.send(command);

    if (result.isSuccess()) {
        return ResponseEntity.ok(ApiResponse.success(
            new CommandResponse(result.getValue())
        ));
    } else {
        return ResponseEntity.badRequest().body(
            ApiResponse.failure(result.getError())
        );
    }
}
```

### 3. Adding a React Component

**Step 1: Create Component**

```typescript
// andara-client/src/components/game/EquipmentPanel.tsx
import React from 'react';
import styled from 'styled-components';
import { useAppSelector, useAppDispatch } from '../../store/hooks';
import { equipItem } from '../../store/slices/partySlice';

interface EquipmentPanelProps {
  characterId: string;
}

export const EquipmentPanel: React.FC<EquipmentPanelProps> = ({ characterId }) => {
  const character = useAppSelector(state =>
    state.party.members.find(m => m.id === characterId)
  );
  const dispatch = useAppDispatch();

  if (!character) return null;

  const handleEquipItem = (itemId: string, slot: string) => {
    dispatch(equipItem({ characterId, itemId, slot }));
  };

  return (
    <Container>
      <Header>Equipment</Header>
      <SlotGrid>
        {Object.entries(character.equipment).map(([slot, item]) => (
          <EquipmentSlot key={slot}>
            <SlotLabel>{slot}</SlotLabel>
            {item ? (
              <ItemDisplay>{item.name}</ItemDisplay>
            ) : (
              <EmptySlot>Empty</EmptySlot>
            )}
          </EquipmentSlot>
        ))}
      </SlotGrid>
    </Container>
  );
};

const Container = styled.div`
  background: var(--color-concrete);
  border: 1px solid var(--color-rust);
  padding: var(--space-l);
`;

const Header = styled.h3`
  font-family: var(--font-display);
  color: var(--color-bleached);
  margin-bottom: var(--space-m);
`;

const SlotGrid = styled.div`
  display: grid;
  grid-template-columns: repeat(2, 1fr);
  gap: var(--space-m);
`;

const EquipmentSlot = styled.div`
  border: 1px solid var(--color-ash);
  padding: var(--space-m);
`;

const SlotLabel = styled.div`
  font-size: 12px;
  color: var(--color-smoke);
  text-transform: uppercase;
  margin-bottom: var(--space-xs);
`;

const ItemDisplay = styled.div`
  color: var(--color-bleached);
`;

const EmptySlot = styled.div`
  color: var(--color-ash);
  font-style: italic;
`;
```

**Step 2: Add Redux Action**

```typescript
// andara-client/src/store/slices/partySlice.ts
import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import { apiClient } from '../../api/client';

export const equipItem = createAsyncThunk(
  'party/equipItem',
  async ({ characterId, itemId, slot }: {
    characterId: string;
    itemId: string;
    slot: string;
  }) => {
    const response = await apiClient.post(
      `/api/v1/characters/${characterId}/equip`,
      { itemId, equipmentSlot: slot }
    );
    return response.data;
  }
);

export const partySlice = createSlice({
  name: 'party',
  initialState: { /* ... */ },
  reducers: { /* ... */ },
  extraReducers: (builder) => {
    builder.addCase(equipItem.fulfilled, (state, action) => {
      // Update character equipment in state
      const character = state.members.find(m => m.id === action.meta.arg.characterId);
      if (character) {
        character.equipment[action.meta.arg.slot] = action.meta.arg.itemId;
      }
    });
  },
});
```

### 4. Writing Tests

**Backend Test (Command Handler)**

```java
@Test
void equipItem_shouldGenerateItemEquippedEvent() {
    // Given
    Character character = CharacterFixtures.createCharacter();
    UUID itemId = UUID.randomUUID();
    String slot = "weapon_main";

    EquipItemCommand command = new EquipItemCommand(
        character.getId(),
        itemId,
        slot,
        AgentId.player()
    );

    // When
    Result<List<DomainEvent>> result = handler.handle(command);

    // Then
    assertThat(result.isSuccess()).isTrue();
    assertThat(result.getValue()).hasSize(1);

    DomainEvent event = result.getValue().get(0);
    assertThat(event).isInstanceOf(ItemEquipped.class);

    ItemEquipped equipped = (ItemEquipped) event;
    assertThat(equipped.getItemId()).isEqualTo(itemId);
    assertThat(equipped.getEquipmentSlot()).isEqualTo(slot);
}
```

**Frontend Test (Component)**

```typescript
import { render, screen } from '@testing-library/react';
import { Provider } from 'react-redux';
import { EquipmentPanel } from './EquipmentPanel';
import { mockStore } from '../../test/utils';

describe('EquipmentPanel', () => {
  it('displays equipped items', () => {
    const store = mockStore({
      party: {
        members: [{
          id: 'char-123',
          equipment: {
            weapon_main: { id: 'item-1', name: 'Rusty Sword' },
            armor_chest: null,
          }
        }]
      }
    });

    render(
      <Provider store={store}>
        <EquipmentPanel characterId="char-123" />
      </Provider>
    );

    expect(screen.getByText('Rusty Sword')).toBeInTheDocument();
    expect(screen.getByText('Empty')).toBeInTheDocument();
  });
});
```

---

## API Endpoints

### Game Management

```
POST   /api/v1/game/start              Start new game (character creation)
POST   /api/v1/game/save               Save current game
POST   /api/v1/game/load/{saveId}      Load saved game
GET    /api/v1/game/state              Get current game state
```

### Party & Characters

```
GET    /api/v1/party/{partyId}         Get party details
GET    /api/v1/party/characters        Get all characters in party
GET    /api/v1/characters/{id}         Get character details
POST   /api/v1/characters/{id}/equip   Equip item to character
POST   /api/v1/party/move              Move party to new zone
```

### Content Management (if implemented)

```
POST   /api/admin/content/import       Import content batch
GET    /api/admin/content/export       Export content
GET    /api/admin/content/items        List all item templates
```

### Health & Monitoring

```
GET    /actuator/health                Service health check
GET    /actuator/metrics               Application metrics
GET    /actuator/info                  Build information
```

---

## Database Queries

### Useful Development Queries

```sql
-- View all events for a party
SELECT
    event_type,
    sequence_number,
    timestamp,
    payload
FROM domain_events
WHERE aggregate_id = 'party-id-here'
ORDER BY sequence_number;

-- View current party state
SELECT * FROM party_view WHERE party_id = 'party-id-here';

-- View all characters
SELECT
    character_id,
    name,
    origin,
    health_current,
    health_max,
    status
FROM character_view;

-- Count events by type
SELECT
    event_type,
    COUNT(*) as count
FROM domain_events
GROUP BY event_type
ORDER BY count DESC;

-- View recent saves
SELECT
    save_id,
    name,
    created_at,
    metadata->>'characterName' as character_name
FROM saves
ORDER BY created_at DESC
LIMIT 10;

-- Check event store size
SELECT
    COUNT(*) as total_events,
    COUNT(DISTINCT aggregate_id) as total_aggregates,
    pg_size_pretty(pg_total_relation_size('domain_events')) as table_size
FROM domain_events;

-- View content versions (if implemented)
SELECT
    content_type,
    content_id,
    version_number,
    imported_at
FROM content_versions
ORDER BY imported_at DESC;
```

### Debugging Queries

```sql
-- Find events that failed to publish (if tracking)
SELECT * FROM domain_events
WHERE metadata->>'published' = 'false';

-- View aggregate with most events (may need snapshot)
SELECT
    aggregate_id,
    aggregate_type,
    COUNT(*) as event_count
FROM domain_events
GROUP BY aggregate_id, aggregate_type
ORDER BY event_count DESC
LIMIT 10;

-- Check for orphaned snapshots
SELECT s.aggregate_id
FROM aggregate_snapshots s
LEFT JOIN domain_events e ON s.aggregate_id = e.aggregate_id
WHERE e.aggregate_id IS NULL;
```

---

## Testing

### Run All Tests

```bash
# Backend
cd andara-server
./gradlew test

# Frontend
cd andara-client
npm test

# Both
./gradlew test && cd andara-client && npm test
```

### Test Specific Components

```bash
# Backend - specific test class
./gradlew test --tests CreateCharacterCommandHandlerTest

# Backend - specific test method
./gradlew test --tests CreateCharacterCommandHandlerTest.shouldCreateCharacter

# Frontend - specific file
npm test -- CharacterSheet.test

# Frontend - with coverage
npm test -- --coverage
```

### Integration Testing

```bash
# Backend integration tests
./gradlew integrationTest

# End-to-end (manual)
# 1. Start all services
# 2. Navigate to http://localhost:3000
# 3. Complete character creation flow
# 4. Verify character in database
```

---

## Troubleshooting

### Common Issues

#### "Cannot connect to PostgreSQL"

```bash
# Check if PostgreSQL container is running
docker-compose ps postgres

# If not running, start it
docker-compose up -d postgres

# Check logs
docker-compose logs postgres

# Verify connection
docker-compose exec postgres psql -U andara -d andara -c "SELECT 1;"
```

#### "Kafka connection failed"

```bash
# Check if Kafka and Zookeeper are running
docker-compose ps kafka zookeeper

# Restart Kafka
docker-compose restart zookeeper kafka

# Wait 30 seconds for startup
sleep 30

# Check Kafka logs
docker-compose logs kafka | tail -50
```

#### "Frontend build errors"

```bash
# Clear node_modules and reinstall
rm -rf node_modules package-lock.json
npm install

# Clear build cache
rm -rf .vite
npm run build
```

#### "Backend compilation errors"

```bash
# Clean and rebuild
./gradlew clean build --refresh-dependencies

# If still failing, check Java version
java -version  # Should be Java 17+

# Update Gradle wrapper
./gradlew wrapper --gradle-version 8.5
```

#### "Events not appearing in read models"

```bash
# Check Kafka consumer is running
docker-compose logs kafka | grep "andara.events"

# Verify events are being published
SELECT COUNT(*) FROM domain_events
WHERE timestamp > NOW() - INTERVAL '1 hour';

# Check projection handler logs
# (look for errors in backend console)

# Manually trigger projection
# (if manual projection rebuild endpoint exists)
```

---

## Key Concepts

### Event Sourcing

**What**: All state changes stored as immutable events
**Why**: Audit trail, replay capability, temporal queries
**How**: Aggregates emit events → Event store → Projections

### CQRS

**What**: Separate models for reading and writing
**Why**: Optimize reads vs writes independently
**How**: Commands → Events → Projections → Queries

### Domain-Driven Design

**Key Terms**:
- **Aggregate**: Cluster of domain objects (e.g., `Party` with `Characters`)
- **Entity**: Object with unique identity (e.g., `Character`)
- **Value Object**: Immutable object defined by values (e.g., `Attributes`)
- **Domain Event**: Something that happened (e.g., `CharacterCreated`)
- **Command**: Intent to change state (e.g., `CreateCharacterCommand`)
- **Repository**: Persistence abstraction (e.g., `CharacterRepository`)

### React + Redux Pattern

**Flow**:
1. User interacts with component
2. Component dispatches Redux action
3. Action may trigger API call (async thunk)
4. Reducer updates state
5. Component re-renders with new state

### WebGL Rendering

**Layers** (bottom to top):
1. Terrain - Static tiles
2. Objects - POIs, decorations
3. Entities - Characters, NPCs
4. Effects - Animations, particles
5. UI Overlay - In-world UI elements

**Camera**: Transforms world coordinates to screen coordinates

---

## Helpful Resources

### Documentation

- Game Design: `docs/andaras_world_gdd.md`
- Architecture: `docs/andaras_world_architecture.md`
- UI Style Guide: `docs/ui-style-guide.md`
- Domain Model: `docs/andaras_world_domain_model.md`
- Project Status: `PROJECT_STATUS.md`
- This File: `CLAUDE.MD`

### External Links

- Spring Boot Docs: https://docs.spring.io/spring-boot/docs/current/reference/html/
- Redux Toolkit: https://redux-toolkit.js.org/
- PixiJS: https://pixijs.com/
- PostgreSQL: https://www.postgresql.org/docs/
- Kafka: https://kafka.apache.org/documentation/

---

**Last Updated**: January 7, 2026
**Maintained By**: Development Team
