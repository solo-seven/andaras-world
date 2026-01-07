# Epic: Game Session Management

**Epic ID**: GSM-001
**Priority**: P0 (MVP Blocking)
**Estimated Effort**: 4-5 weeks
**Dependencies**: Event Store Infrastructure, Player Initiation (Character Creation)

---

## Epic Overview

Enable players to manage their game progress through save/load functionality, supporting multiple save slots, auto-save at critical moments, and seamless session continuation. This epic implements the persistence layer that allows players to preserve their progress and return to the game at any time.

### Business Value

- **Player Investment Protection**: Players can safely invest time knowing progress is saved
- **Session Flexibility**: Start and stop play sessions at will
- **Experimentation**: Multiple save slots enable trying different strategies
- **Recovery**: Auto-save protects against crashes or mistakes
- **Onboarding**: Quick "Continue" option reduces friction for returning players

### Technical Approach

Game Session Management builds on the Event Sourcing architecture:

```
┌─────────────────────────────────────────────────────────────┐
│                   SAVE/LOAD ARCHITECTURE                    │
│                                                             │
│  ┌────────────┐         ┌────────────┐                     │
│  │   Player   │────────▶│   Save     │                     │
│  │   Action   │         │  Command   │                     │
│  └────────────┘         └──────┬─────┘                     │
│                                │                            │
│                                ▼                            │
│                     ┌──────────────────┐                    │
│                     │  SaveGameService │                    │
│                     └────────┬─────────┘                    │
│                              │                              │
│         ┌────────────────────┼────────────────────┐         │
│         │                    │                    │         │
│         ▼                    ▼                    ▼         │
│  ┌─────────────┐      ┌──────────┐      ┌─────────────┐   │
│  │  Snapshot   │      │  Event   │      │    Save     │   │
│  │ Aggregates  │      │  Store   │      │  Metadata   │   │
│  └─────────────┘      └──────────┘      └─────────────┘   │
│         │                    │                    │         │
│         └────────────────────┴────────────────────┘         │
│                              │                              │
│                              ▼                              │
│                     ┌──────────────────┐                    │
│                     │   Database       │                    │
│                     │   (saves table)  │                    │
│                     └──────────────────┘                    │
│                                                             │
└─────────────────────────────────────────────────────────────┘

LOAD FLOW:
┌──────────┐    ┌──────────────┐    ┌──────────────┐
│  Select  │───▶│ Load Snapshot│───▶│   Replay     │
│   Save   │    │  + Metadata  │    │   Events     │
└──────────┘    └──────────────┘    └──────┬───────┘
                                           │
                                           ▼
                                  ┌──────────────┐
                                  │  Reconstruct │
                                  │  Game State  │
                                  └──────────────┘
```

**Key Insight**: With Event Sourcing, "saving" is primarily capturing a **snapshot point** in the event stream. The events already exist; we just need to mark where the player was and provide quick access to that state.

---

## User Stories

### Story GSM-1: New Game Initialization

**As a** player
**I want to** start a new game from character creation
**So that** I can begin my adventure with a fresh character

**Acceptance Criteria**:
- [x] "New Game" button on landing page initiates character creation flow (already implemented in Player Initiation epic)
- [ ] After character creation completes, a new save slot is automatically created
- [ ] Save slot is named with character name + timestamp (e.g., "Andara - Jan 7, 2026 14:30")
- [ ] Save slot is marked as the "active" or "current" save
- [ ] Save metadata includes:
  - Save ID (UUID)
  - Instance ID
  - Character name
  - Creation timestamp
  - Last played timestamp (initially same as creation)
  - Play time (initially 0)
  - Current location (starting zone)
  - Party level/size (1 character)
  - Last event ID (from event stream)
- [ ] Player is transitioned to game world with active save loaded
- [ ] Save slot appears in "Continue Game" and "Load Game" screens

**Technical Notes**:

```java
// Domain Event
@JsonTypeName("GameSaveCreated")
public class GameSaveCreated extends DomainEvent {
    private final UUID saveId;
    private final UUID instanceId;
    private final String saveName;
    private final UUID lastEventId;
    private final SaveMetadata metadata;

    // Constructor, getters
}

// Save Metadata
public record SaveMetadata(
    String characterName,
    String originName,
    WorldPosition currentPosition,
    int partySize,
    long playTimeSeconds,
    Instant createdAt,
    Instant lastPlayedAt,
    Map<String, Object> snapshot  // Quick-access snapshot for UI
) {}

// Command
public record CreateSaveCommand(
    UUID instanceId,
    String saveName,
    AgentId issuedBy,
    boolean isAutoSave
) implements Command {}

// Handler
@Component
public class CreateSaveCommandHandler implements CommandHandler<CreateSaveCommand> {

    private final InstanceRepository instanceRepository;
    private final EventStore eventStore;
    private final SaveRepository saveRepository;

    @Override
    @Transactional
    public Result<List<DomainEvent>> handle(CreateSaveCommand command) {
        // Get instance
        Instance instance = instanceRepository.load(command.instanceId());

        // Get latest event ID
        UUID lastEventId = eventStore.getLatestEventId(command.instanceId())
            .orElseThrow(() -> new IllegalStateException("No events for instance"));

        // Build metadata
        SaveMetadata metadata = buildMetadata(instance);

        // Create save
        UUID saveId = UUID.randomUUID();
        GameSaveCreated event = new GameSaveCreated(
            saveId,
            command.instanceId(),
            command.saveName(),
            lastEventId,
            metadata
        );

        // Persist
        saveRepository.save(event);

        // Return event
        return Result.success(List.of(event));
    }

    private SaveMetadata buildMetadata(Instance instance) {
        Party party = partyRepository.load(instance.getPartyId());

        return new SaveMetadata(
            party.getProtagonist().getName(),
            party.getProtagonist().getOrigin().name(),
            party.getPosition(),
            party.getMemberCount(),
            instance.getPlayTime().toSeconds(),
            instance.getCreatedAt(),
            Instant.now(),
            buildQuickSnapshot(instance, party)
        );
    }
}
```

**Database Schema**:

```sql
CREATE TABLE saves (
    save_id             UUID PRIMARY KEY,
    instance_id         UUID NOT NULL REFERENCES instances(instance_id),
    save_name           VARCHAR(255) NOT NULL,
    last_event_id       UUID NOT NULL,
    created_at          TIMESTAMP WITH TIME ZONE NOT NULL,
    last_played_at      TIMESTAMP WITH TIME ZONE NOT NULL,
    play_time_seconds   BIGINT NOT NULL DEFAULT 0,
    is_auto_save        BOOLEAN NOT NULL DEFAULT false,
    metadata            JSONB NOT NULL,

    -- Quick access snapshot for UI (denormalized)
    character_name      VARCHAR(255) NOT NULL,
    current_zone_name   VARCHAR(255),
    party_size          INT NOT NULL,

    CONSTRAINT unique_save_name_per_instance UNIQUE (instance_id, save_name)
);

CREATE INDEX idx_saves_instance ON saves(instance_id);
CREATE INDEX idx_saves_last_played ON saves(last_played_at DESC);
CREATE INDEX idx_saves_is_auto_save ON saves(is_auto_save);
```

**Estimated Effort**: 5 story points

---

### Story GSM-2: Manual Save Game

**As a** player
**I want to** manually save my game at any time
**So that** I can preserve my progress before taking risks or ending my session

**Acceptance Criteria**:
- [ ] "Save Game" button available in pause menu or main HUD
- [ ] Clicking "Save Game" opens save dialog
- [ ] Dialog shows:
  - Default save name (character name + timestamp)
  - Editable text field for custom name
  - Current save count for this instance
  - Warning if save name already exists (offer to overwrite)
- [ ] Save operation executes in background with loading indicator
- [ ] Success notification shows save name and timestamp
- [ ] Save operation snapshots all aggregates (Party, Instance, World state)
- [ ] Save operation records last event ID for quick loading
- [ ] Save metadata updated with current play time and location
- [ ] Failed saves show error message and allow retry
- [ ] Cannot save during combat (show error: "Cannot save during combat")
- [ ] Cannot save during dialogue/cutscenes (disabled state)

**Technical Notes**:

```typescript
// Frontend - Save Dialog Component
export const SaveGameDialog: React.FC<{ onClose: () => void }> = ({ onClose }) => {
  const instanceId = useAppSelector(state => state.game.instanceId);
  const characterName = useAppSelector(state =>
    state.party.members.find(m => m.isProtagonist)?.name
  );
  const [saveName, setSaveName] = useState(
    `${characterName} - ${format(new Date(), 'MMM d, yyyy HH:mm')}`
  );
  const [isSaving, setIsSaving] = useState(false);
  const dispatch = useAppDispatch();

  const handleSave = async () => {
    setIsSaving(true);
    try {
      await dispatch(saveGame({ instanceId, saveName })).unwrap();
      dispatch(addNotification({
        type: 'success',
        message: `Game saved: ${saveName}`
      }));
      onClose();
    } catch (error) {
      dispatch(addNotification({
        type: 'error',
        message: `Save failed: ${error.message}`
      }));
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <Modal onClose={onClose}>
      <ModalHeader>Save Game</ModalHeader>
      <ModalBody>
        <Input
          label="Save Name"
          value={saveName}
          onChange={setSaveName}
          maxLength={100}
        />
        <SaveInfo>
          <Label>Character:</Label> {characterName}
        </SaveInfo>
        <SaveInfo>
          <Label>Location:</Label> {getCurrentLocationName()}
        </SaveInfo>
      </ModalBody>
      <ModalFooter>
        <Button variant="ghost" onClick={onClose} disabled={isSaving}>
          Cancel
        </Button>
        <Button onClick={handleSave} disabled={isSaving}>
          {isSaving ? 'Saving...' : 'Save Game'}
        </Button>
      </ModalFooter>
    </Modal>
  );
};

// Redux Async Thunk
export const saveGame = createAsyncThunk(
  'game/saveGame',
  async ({ instanceId, saveName }: { instanceId: string; saveName: string }) => {
    const response = await apiClient.post('/api/v1/game/save', {
      instanceId,
      saveName,
      isAutoSave: false
    });
    return response.data;
  }
);
```

```java
// Backend - Save Game Controller
@RestController
@RequestMapping("/api/v1/game")
public class GameController {

    @PostMapping("/save")
    public ResponseEntity<ApiResponse<SaveGameResponse>> saveGame(
        @RequestBody SaveGameRequest request,
        @AuthenticationPrincipal AgentId agentId
    ) {
        // Validate not in combat
        Instance instance = instanceRepository.load(request.instanceId());
        if (instance.isInCombat()) {
            return ResponseEntity.badRequest().body(
                ApiResponse.failure("Cannot save during combat")
            );
        }

        // Create save command
        CreateSaveCommand command = new CreateSaveCommand(
            request.instanceId(),
            request.saveName(),
            agentId,
            false  // not auto-save
        );

        Result<List<DomainEvent>> result = commandBus.send(command);

        if (result.isSuccess()) {
            GameSaveCreated event = (GameSaveCreated) result.getValue().get(0);
            return ResponseEntity.ok(ApiResponse.success(
                new SaveGameResponse(
                    event.getSaveId(),
                    event.getSaveName(),
                    event.getMetadata()
                )
            ));
        } else {
            return ResponseEntity.badRequest().body(
                ApiResponse.failure(result.getError())
            );
        }
    }
}
```

**Save Validation Rules**:
```java
public class SaveValidationService {

    public ValidationResult validateSave(Instance instance) {
        List<String> errors = new ArrayList<>();

        // Cannot save in combat
        if (instance.isInCombat()) {
            errors.add("Cannot save during combat");
        }

        // Cannot save during dialogue
        if (instance.isInDialogue()) {
            errors.add("Cannot save during dialogue");
        }

        // Cannot save if protagonist is dead
        Party party = partyRepository.load(instance.getPartyId());
        if (party.getProtagonist().isDead()) {
            errors.add("Cannot save with dead protagonist");
        }

        return errors.isEmpty()
            ? ValidationResult.success()
            : ValidationResult.failure(errors);
    }
}
```

**Estimated Effort**: 5 story points

---

### Story GSM-3: Load Game from Save Slot

**As a** player
**I want to** load a previously saved game
**So that** I can continue my adventure from where I left off

**Acceptance Criteria**:
- [ ] "Load Game" button on landing page and pause menu
- [ ] Clicking "Load Game" shows save slot browser
- [ ] Save slot browser displays:
  - All saves sorted by last played (most recent first)
  - For each save:
    - Character name
    - Save name
    - Last played timestamp (relative: "2 hours ago", "Yesterday")
    - Current location
    - Play time (formatted: "2h 34m")
    - Character level/party size
    - Thumbnail/screenshot (if available)
    - Quick stats (health, credits)
- [ ] Hovering over save shows detailed tooltip with full metadata
- [ ] Clicking save slot shows confirmation dialog
- [ ] Confirmation shows save details and "Load" / "Cancel" buttons
- [ ] Load operation:
  - Shows loading screen with progress
  - Loads instance state from snapshot + event replay
  - Reconstructs party aggregate
  - Reconstructs world state (current zone visibility)
  - Updates "last played" timestamp on save record
  - Transitions to game world at saved location
- [ ] Loading screen shows:
  - "Loading [Save Name]..."
  - Progress indicator
  - Flavor text / tips
- [ ] Load errors (corrupted save, missing events) show friendly message
- [ ] Can delete saves from browser (with confirmation)
- [ ] Can rename saves from browser

**Technical Notes**:

```typescript
// Frontend - Save Slot Browser
export const SaveSlotBrowser: React.FC = () => {
  const [saves, setSaves] = useState<SaveSlot[]>([]);
  const [selectedSave, setSelectedSave] = useState<SaveSlot | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const dispatch = useAppDispatch();

  useEffect(() => {
    loadSaves();
  }, []);

  const loadSaves = async () => {
    const response = await apiClient.get('/api/v1/game/saves');
    setSaves(response.data.saves);
  };

  const handleLoadSave = async (save: SaveSlot) => {
    setIsLoading(true);
    try {
      await dispatch(loadGame({ saveId: save.saveId })).unwrap();
      // Navigation to game world handled by loadGame thunk
    } catch (error) {
      dispatch(addNotification({
        type: 'error',
        message: `Failed to load save: ${error.message}`
      }));
      setIsLoading(false);
    }
  };

  return (
    <Container>
      <Header>Load Game</Header>
      <SaveList>
        {saves.map(save => (
          <SaveSlotCard
            key={save.saveId}
            save={save}
            onClick={() => setSelectedSave(save)}
            selected={selectedSave?.saveId === save.saveId}
          />
        ))}
      </SaveList>

      {selectedSave && (
        <ConfirmationModal
          title="Load Save"
          message={`Load "${selectedSave.saveName}"?`}
          onConfirm={() => handleLoadSave(selectedSave)}
          onCancel={() => setSelectedSave(null)}
        />
      )}

      {isLoading && (
        <LoadingScreen saveName={selectedSave?.saveName} />
      )}
    </Container>
  );
};

// Save Slot Card Component
const SaveSlotCard = styled.div<{ selected: boolean }>`
  display: grid;
  grid-template-columns: 80px 1fr auto;
  gap: var(--space-m);
  padding: var(--space-m);
  border: 1px solid var(--color-rust);
  background: var(--color-concrete);
  cursor: pointer;
  transition: all 0.2s ease;

  ${props => props.selected && `
    border-color: var(--color-rift-stable);
    background: rgba(77, 166, 255, 0.1);
    box-shadow: var(--glow-rift);
  `}

  &:hover {
    border-color: var(--color-rift-stable);
  }
`;

// Redux Async Thunk
export const loadGame = createAsyncThunk(
  'game/loadGame',
  async ({ saveId }: { saveId: string }, { dispatch }) => {
    // Call load API
    const response = await apiClient.post('/api/v1/game/load', { saveId });

    // Update Redux state with loaded game state
    dispatch(setInstanceId(response.data.instanceId));
    dispatch(setParty(response.data.party));
    dispatch(setWorld(response.data.world));
    dispatch(setGameStatus('playing'));

    // Navigate to game
    navigate('/game');

    return response.data;
  }
);
```

```java
// Backend - Load Game Service
@Service
public class LoadGameService {

    private final SaveRepository saveRepository;
    private final EventStore eventStore;
    private final InstanceRepository instanceRepository;
    private final PartyRepository partyRepository;
    private final WorldRepository worldRepository;

    @Transactional
    public LoadGameResult loadGame(UUID saveId) {
        // Load save metadata
        Save save = saveRepository.load(saveId);

        // Load snapshots (if available)
        Optional<Snapshot> instanceSnapshot = snapshotRepository.findLatest(
            save.getInstanceId(), "Instance"
        );

        // Replay events since snapshot
        List<DomainEvent> events = eventStore.getEvents(
            save.getInstanceId().toString(),
            "Instance",
            instanceSnapshot.map(Snapshot::sequenceNumber).orElse(0L)
        );

        // Reconstruct instance
        Instance instance = instanceSnapshot
            .map(s -> Instance.fromSnapshot(s.data()))
            .orElse(Instance.empty(save.getInstanceId()));

        for (DomainEvent event : events) {
            instance.applyHistoricalEvent(event);
        }

        // Load party
        Party party = partyRepository.load(instance.getPartyId());

        // Load world state for current zone
        Zone currentZone = worldRepository.loadZone(party.getPosition().zoneId());

        // Update last played timestamp
        save.updateLastPlayed(Instant.now());
        saveRepository.save(save);

        // Build response
        return new LoadGameResult(
            instance.getId(),
            toDTO(party),
            toDTO(currentZone),
            save.getMetadata()
        );
    }
}

// API Endpoint
@PostMapping("/load")
public ResponseEntity<ApiResponse<LoadGameResult>> loadGame(
    @RequestBody LoadGameRequest request,
    @AuthenticationPrincipal AgentId agentId
) {
    try {
        LoadGameResult result = loadGameService.loadGame(request.saveId());
        return ResponseEntity.ok(ApiResponse.success(result));
    } catch (SaveNotFoundException e) {
        return ResponseEntity.notFound().build();
    } catch (CorruptedSaveException e) {
        return ResponseEntity.badRequest().body(
            ApiResponse.failure("Save file is corrupted: " + e.getMessage())
        );
    }
}
```

**Estimated Effort**: 8 story points

---

### Story GSM-4: Save Slot Management UI

**As a** player
**I want to** manage my save slots (view, rename, delete)
**So that** I can organize my different playthroughs

**Acceptance Criteria**:
- [ ] Save browser includes management actions for each save
- [ ] Right-click on save (or "..." menu) shows context menu:
  - Rename
  - Delete
  - Duplicate (copy save to new slot)
  - Export (future: save to file)
- [ ] Rename action:
  - Opens inline edit or modal
  - Validates name (non-empty, max 100 chars)
  - Updates save name in database
  - Shows success notification
- [ ] Delete action:
  - Shows confirmation modal: "Delete '[Save Name]'? This cannot be undone."
  - Checkbox: "I understand this save will be permanently deleted"
  - Deletes save record from database
  - Does NOT delete events (events are shared across saves)
  - Removes save from UI list
  - Shows notification: "Save deleted"
- [ ] Duplicate action:
  - Creates new save record with same instance and event ID
  - Appends " (Copy)" to save name
  - Allows immediate rename
  - Shows in save list
- [ ] Save list shows:
  - Total saves count
  - Total play time across all saves (per instance)
  - Disk space used (calculated from event store size)
- [ ] Keyboard shortcuts:
  - F5: Quick save
  - F9: Quick load (most recent save)
  - Delete key: Delete selected save (with confirmation)

**Technical Notes**:

```typescript
// Context Menu Component
interface SaveContextMenuProps {
  save: SaveSlot;
  onRename: (save: SaveSlot) => void;
  onDelete: (save: SaveSlot) => void;
  onDuplicate: (save: SaveSlot) => void;
  onClose: () => void;
}

export const SaveContextMenu: React.FC<SaveContextMenuProps> = ({
  save,
  onRename,
  onDelete,
  onDuplicate,
  onClose
}) => {
  return (
    <ContextMenu>
      <MenuItem onClick={() => { onRename(save); onClose(); }}>
        <Icon name="edit" /> Rename
      </MenuItem>
      <MenuItem onClick={() => { onDuplicate(save); onClose(); }}>
        <Icon name="copy" /> Duplicate
      </MenuItem>
      <MenuDivider />
      <MenuItem danger onClick={() => { onDelete(save); onClose(); }}>
        <Icon name="trash" /> Delete
      </MenuItem>
    </ContextMenu>
  );
};

// Delete Confirmation Modal
export const DeleteSaveModal: React.FC<{
  save: SaveSlot;
  onConfirm: () => void;
  onCancel: () => void;
}> = ({ save, onConfirm, onCancel }) => {
  const [confirmed, setConfirmed] = useState(false);

  return (
    <Modal onClose={onCancel}>
      <ModalHeader>Delete Save</ModalHeader>
      <ModalBody>
        <WarningText>
          Are you sure you want to delete "{save.saveName}"?
        </WarningText>
        <WarningSubtext>
          This action cannot be undone.
        </WarningSubtext>
        <Checkbox
          checked={confirmed}
          onChange={setConfirmed}
          label="I understand this save will be permanently deleted"
        />
      </ModalBody>
      <ModalFooter>
        <Button variant="ghost" onClick={onCancel}>
          Cancel
        </Button>
        <Button variant="danger" onClick={onConfirm} disabled={!confirmed}>
          Delete Save
        </Button>
      </ModalFooter>
    </Modal>
  );
};
```

```java
// Backend - Save Management Service
@Service
public class SaveManagementService {

    @Transactional
    public void renameSave(UUID saveId, String newName, AgentId agent) {
        Save save = saveRepository.load(saveId);

        // Authorize
        if (!authService.canModifySave(agent, save)) {
            throw new UnauthorizedException("Cannot modify this save");
        }

        // Validate
        if (newName == null || newName.isBlank()) {
            throw new ValidationException("Save name cannot be empty");
        }

        if (newName.length() > 100) {
            throw new ValidationException("Save name too long");
        }

        // Update
        save.rename(newName);
        saveRepository.save(save);
    }

    @Transactional
    public void deleteSave(UUID saveId, AgentId agent) {
        Save save = saveRepository.load(saveId);

        // Authorize
        if (!authService.canModifySave(agent, save)) {
            throw new UnauthorizedException("Cannot delete this save");
        }

        // Delete save record (events remain)
        saveRepository.delete(saveId);

        // Publish event for audit
        eventPublisher.publish(new SaveDeleted(saveId, save.getInstanceId(), agent));
    }

    @Transactional
    public UUID duplicateSave(UUID sourceId, String newName, AgentId agent) {
        Save source = saveRepository.load(sourceId);

        // Authorize
        if (!authService.canModifySave(agent, source)) {
            throw new UnauthorizedException("Cannot duplicate this save");
        }

        // Create duplicate
        UUID newSaveId = UUID.randomUUID();
        Save duplicate = new Save(
            newSaveId,
            source.getInstanceId(),
            newName != null ? newName : source.getSaveName() + " (Copy)",
            source.getLastEventId(),
            source.getMetadata().withUpdatedTimestamp(Instant.now())
        );

        saveRepository.save(duplicate);

        return newSaveId;
    }
}
```

**Estimated Effort**: 5 story points

---

### Story GSM-5: Auto-Save System

**As a system**
**I want to** automatically save the game at critical moments
**So that** player progress is protected without manual intervention

**Acceptance Criteria**:
- [ ] Auto-save triggers implemented for:
  - After character creation completes
  - After completing a quest
  - After winning a combat encounter
  - After discovering a new zone
  - After leveling up a skill
  - Every 10 minutes of play time (configurable)
  - When entering a settlement/safe zone
  - Before major story choices (future)
- [ ] Auto-save naming convention: "[Character Name] - Auto-Save [N]"
- [ ] Auto-saves are marked with `is_auto_save = true` flag
- [ ] Auto-saves have separate retention policy:
  - Keep last 3 auto-saves per instance
  - Automatically delete older auto-saves
  - Manual saves never auto-deleted
- [ ] Auto-save operation:
  - Runs asynchronously (non-blocking)
  - Shows subtle notification: "Auto-saved" (top-right corner, 2 seconds)
  - No loading screen or interruption
  - Fails silently if in invalid state (e.g., during combat loading)
- [ ] Auto-save respects user preferences:
  - Can disable auto-save in settings
  - Can configure auto-save frequency (5, 10, 15, 30 minutes)
  - Can configure auto-save retention (1-10 saves)
- [ ] Auto-save icon appears in save list (different visual style)
- [ ] Can manually promote auto-save to permanent save (rename and unmark auto-save flag)

**Technical Notes**:

```java
// Auto-Save Manager Service
@Service
public class AutoSaveManager {

    private final SaveGameService saveGameService;
    private final SaveRepository saveRepository;
    private final ApplicationEventPublisher eventPublisher;

    // Configuration
    @Value("${game.autosave.enabled:true}")
    private boolean autoSaveEnabled;

    @Value("${game.autosave.intervalMinutes:10}")
    private int autoSaveIntervalMinutes;

    @Value("${game.autosave.retention:3}")
    private int autoSaveRetention;

    // Listen for trigger events
    @EventListener
    @Async
    public void onCombatEnded(CombatEndedEvent event) {
        if (!autoSaveEnabled) return;

        triggerAutoSave(
            event.getInstanceId(),
            "After combat victory"
        );
    }

    @EventListener
    @Async
    public void onZoneDiscovered(ZoneDiscoveredEvent event) {
        if (!autoSaveEnabled) return;

        triggerAutoSave(
            event.getInstanceId(),
            "Zone discovered: " + event.getZoneName()
        );
    }

    @EventListener
    @Async
    public void onQuestCompleted(QuestCompletedEvent event) {
        if (!autoSaveEnabled) return;

        triggerAutoSave(
            event.getInstanceId(),
            "Quest completed: " + event.getQuestName()
        );
    }

    // Time-based auto-save (scheduled)
    @Scheduled(fixedDelayString = "${game.autosave.intervalMinutes:10}000",
               initialDelay = 600000) // 10 minutes
    public void scheduledAutoSave() {
        if (!autoSaveEnabled) return;

        // Find all active instances
        List<UUID> activeInstances = instanceRepository.findActive();

        for (UUID instanceId : activeInstances) {
            triggerAutoSave(instanceId, "Periodic auto-save");
        }
    }

    private void triggerAutoSave(UUID instanceId, String reason) {
        try {
            // Get next auto-save number
            int nextNumber = getNextAutoSaveNumber(instanceId);

            // Create save
            String saveName = buildAutoSaveName(instanceId, nextNumber);

            CreateSaveCommand command = new CreateSaveCommand(
                instanceId,
                saveName,
                AgentId.system(),
                true  // is auto-save
            );

            Result<List<DomainEvent>> result = commandBus.send(command);

            if (result.isSuccess()) {
                log.info("Auto-save created: {} (reason: {})", saveName, reason);

                // Clean up old auto-saves
                cleanupOldAutoSaves(instanceId);

                // Publish notification event (for UI)
                eventPublisher.publishEvent(new AutoSaveCreatedEvent(
                    instanceId,
                    saveName
                ));
            }

        } catch (Exception e) {
            log.error("Auto-save failed for instance {}", instanceId, e);
            // Fail silently - don't disrupt gameplay
        }
    }

    private void cleanupOldAutoSaves(UUID instanceId) {
        List<Save> autoSaves = saveRepository.findAutoSaves(instanceId);

        // Sort by last played (newest first)
        autoSaves.sort(Comparator.comparing(Save::getLastPlayedAt).reversed());

        // Delete beyond retention limit
        if (autoSaves.size() > autoSaveRetention) {
            List<Save> toDelete = autoSaves.subList(autoSaveRetention, autoSaves.size());
            for (Save save : toDelete) {
                saveRepository.delete(save.getId());
                log.debug("Deleted old auto-save: {}", save.getSaveName());
            }
        }
    }

    private String buildAutoSaveName(UUID instanceId, int number) {
        Instance instance = instanceRepository.load(instanceId);
        Party party = partyRepository.load(instance.getPartyId());
        String characterName = party.getProtagonist().getName();

        return String.format("%s - Auto-Save %d", characterName, number);
    }

    private int getNextAutoSaveNumber(UUID instanceId) {
        List<Save> autoSaves = saveRepository.findAutoSaves(instanceId);
        return autoSaves.size() + 1;
    }
}

// Frontend - Auto-Save Notification
export const AutoSaveNotification: React.FC<{ saveName: string }> = ({ saveName }) => {
  const [visible, setVisible] = useState(true);

  useEffect(() => {
    const timer = setTimeout(() => setVisible(false), 2000);
    return () => clearTimeout(timer);
  }, []);

  if (!visible) return null;

  return (
    <NotificationBadge>
      <Icon name="save" />
      <span>Auto-saved</span>
    </NotificationBadge>
  );
};

const NotificationBadge = styled.div`
  position: fixed;
  top: var(--space-l);
  right: var(--space-l);
  background: var(--color-concrete);
  border: 1px solid var(--color-rift-stable);
  padding: var(--space-s) var(--space-m);
  display: flex;
  align-items: center;
  gap: var(--space-s);
  box-shadow: var(--glow-rift);
  animation: slideIn 0.3s ease;

  @keyframes slideIn {
    from {
      transform: translateX(100%);
      opacity: 0;
    }
    to {
      transform: translateX(0);
      opacity: 1;
    }
  }
`;
```

**Configuration File**:

```yaml
# application.yml
game:
  autosave:
    enabled: true
    intervalMinutes: 10
    retention: 3
    triggers:
      - COMBAT_ENDED
      - ZONE_DISCOVERED
      - QUEST_COMPLETED
      - SKILL_LEVELED
      - SAFE_ZONE_ENTERED
```

**Estimated Effort**: 8 story points

---

### Story GSM-6: Continue Game Quick Start

**As a** player
**I want to** quickly continue from my most recent save
**So that** I can resume playing with minimal friction

**Acceptance Criteria**:
- [ ] Landing page shows "Continue" button prominently (above "New Game")
- [ ] "Continue" button is enabled only if saves exist
- [ ] "Continue" button shows preview of most recent save:
  - Character name
  - Last played timestamp
  - Current location
  - Small character portrait/icon
- [ ] Clicking "Continue" immediately loads most recent save (no intermediate screens)
- [ ] Loading screen same as manual load (Story GSM-3)
- [ ] Most recent save determined by `last_played_at` timestamp
- [ ] If most recent save fails to load, shows error and offers "Load Game" option
- [ ] Keyboard shortcut: Press spacebar on landing page to continue
- [ ] "Continue" button has Rift glow effect and breathing animation

**Technical Notes**:

```typescript
// Landing Page Component (Enhanced)
export const LandingPage: React.FC = () => {
  const [mostRecentSave, setMostRecentSave] = useState<SaveSlot | null>(null);
  const dispatch = useAppDispatch();

  useEffect(() => {
    loadMostRecentSave();
  }, []);

  const loadMostRecentSave = async () => {
    try {
      const response = await apiClient.get('/api/v1/game/saves/recent');
      if (response.data.save) {
        setMostRecentSave(response.data.save);
      }
    } catch (error) {
      console.error('Failed to load recent save:', error);
    }
  };

  const handleContinue = async () => {
    if (!mostRecentSave) return;

    try {
      await dispatch(loadGame({ saveId: mostRecentSave.saveId })).unwrap();
    } catch (error) {
      dispatch(addNotification({
        type: 'error',
        message: `Failed to continue: ${error.message}`
      }));
    }
  };

  useKeyboardShortcut('Space', handleContinue, mostRecentSave !== null);

  return (
    <Container>
      <Title>Andara's World</Title>

      <ButtonGroup>
        {mostRecentSave && (
          <ContinueButton onClick={handleContinue}>
            <ButtonContent>
              <Icon name="play" size={24} />
              <div>
                <ButtonLabel>Continue</ButtonLabel>
                <SavePreview>
                  <CharacterName>{mostRecentSave.characterName}</CharacterName>
                  <LastPlayed>
                    {formatDistanceToNow(new Date(mostRecentSave.lastPlayedAt))} ago
                  </LastPlayed>
                  <Location>{mostRecentSave.currentZoneName}</Location>
                </SavePreview>
              </div>
            </ButtonContent>
          </ContinueButton>
        )}

        <Button onClick={() => navigate('/character-creation')}>
          New Game
        </Button>

        <Button onClick={() => navigate('/load-game')}>
          Load Game
        </Button>

        <Button variant="ghost" onClick={() => navigate('/settings')}>
          Settings
        </Button>
      </ButtonGroup>
    </Container>
  );
};

const ContinueButton = styled(Button)`
  background: linear-gradient(135deg,
    var(--color-rift-stable) 0%,
    var(--color-rift-resonant) 100%
  );
  border: 2px solid var(--color-rift-active);
  padding: var(--space-l) var(--space-xl);
  box-shadow: 0 0 20px rgba(77, 166, 255, 0.5);
  animation: pulse 2s ease-in-out infinite;

  @keyframes pulse {
    0%, 100% {
      box-shadow: 0 0 20px rgba(77, 166, 255, 0.5);
    }
    50% {
      box-shadow: 0 0 30px rgba(77, 166, 255, 0.8);
    }
  }

  &:hover {
    transform: translateY(-2px);
    box-shadow: 0 0 40px rgba(77, 166, 255, 0.8);
  }
`;

const SavePreview = styled.div`
  text-align: left;
  margin-top: var(--space-xs);
`;

const CharacterName = styled.div`
  font-size: 14px;
  font-weight: 600;
  color: var(--color-bleached);
`;

const LastPlayed = styled.div`
  font-size: 12px;
  color: var(--color-smoke);
`;

const Location = styled.div`
  font-size: 12px;
  color: var(--color-ash);
`;
```

```java
// Backend - Recent Save Endpoint
@GetMapping("/saves/recent")
public ResponseEntity<ApiResponse<SaveSlotResponse>> getMostRecentSave(
    @AuthenticationPrincipal AgentId agentId
) {
    Optional<Save> recentSave = saveRepository.findMostRecent(agentId);

    if (recentSave.isEmpty()) {
        return ResponseEntity.ok(ApiResponse.success(null));
    }

    Save save = recentSave.get();
    SaveSlotResponse response = new SaveSlotResponse(
        save.getId(),
        save.getSaveName(),
        save.getCharacterName(),
        save.getCurrentZoneName(),
        save.getLastPlayedAt(),
        save.getPlayTimeSeconds(),
        save.getMetadata()
    );

    return ResponseEntity.ok(ApiResponse.success(response));
}

// Repository method
public Optional<Save> findMostRecent(AgentId agentId) {
    return jdbc.query(
        """
        SELECT s.* FROM saves s
        JOIN instances i ON s.instance_id = i.instance_id
        WHERE i.owner_agent_id = ?
        ORDER BY s.last_played_at DESC
        LIMIT 1
        """,
        saveRowMapper,
        agentId.value()
    ).stream().findFirst();
}
```

**Estimated Effort**: 3 story points

---

### Story GSM-7: Save Metadata Display

**As a** player
**I want to** see detailed metadata about my saves
**So that** I can choose the right save to load

**Acceptance Criteria**:
- [ ] Save slot cards in browser show key metadata:
  - Character name and origin
  - Save name (editable)
  - Last played (relative time: "2 hours ago")
  - Total play time (formatted: "12h 34m")
  - Current location (zone name)
  - Party size and member names
  - Character level (if implemented)
  - Credits
  - Current quest (if any)
- [ ] Tooltip on hover shows extended metadata:
  - Full save timestamp (absolute)
  - Instance ID (for debug)
  - Last event ID (for debug)
  - Save file size (estimated)
  - Auto-save vs manual save indicator
  - Number of completed quests
  - Zones discovered count
  - Total enemies defeated
- [ ] Save list can be sorted by:
  - Last played (default)
  - Play time
  - Character name (alphabetical)
  - Creation date
- [ ] Save list can be filtered by:
  - Character name (search)
  - Origin type
  - Play time range
  - Auto-save vs manual
- [ ] Metadata updated every time save is loaded or overwritten
- [ ] Metadata includes thumbnail/screenshot (future enhancement)

**Technical Notes**:

```typescript
// Save Slot Card with Full Metadata
interface SaveSlotCardProps {
  save: SaveSlot;
  onClick: () => void;
  selected: boolean;
}

export const SaveSlotCard: React.FC<SaveSlotCardProps> = ({
  save,
  onClick,
  selected
}) => {
  return (
    <Tooltip content={<SaveTooltipContent save={save} />}>
      <Card selected={selected} onClick={onClick}>
        <Thumbnail src={save.thumbnail || '/assets/placeholder.png'} />

        <Content>
          <Header>
            <CharacterName>{save.characterName}</CharacterName>
            {save.isAutoSave && <AutoSaveBadge>Auto</AutoSaveBadge>}
          </Header>

          <SaveName>{save.saveName}</SaveName>

          <MetadataGrid>
            <MetadataItem>
              <Icon name="clock" />
              <span>{formatDistanceToNow(new Date(save.lastPlayedAt))} ago</span>
            </MetadataItem>

            <MetadataItem>
              <Icon name="timer" />
              <span>{formatPlayTime(save.playTimeSeconds)}</span>
            </MetadataItem>

            <MetadataItem>
              <Icon name="location" />
              <span>{save.currentZoneName}</span>
            </MetadataItem>

            <MetadataItem>
              <Icon name="users" />
              <span>{save.partySize} party members</span>
            </MetadataItem>
          </MetadataGrid>

          <QuickStats>
            <Stat>
              <Label>Credits:</Label>
              <Value>{save.metadata.credits.toLocaleString()}</Value>
            </Stat>
            <Stat>
              <Label>Level:</Label>
              <Value>{save.metadata.characterLevel}</Value>
            </Stat>
          </QuickStats>
        </Content>
      </Card>
    </Tooltip>
  );
};

// Tooltip Content (Extended Metadata)
const SaveTooltipContent: React.FC<{ save: SaveSlot }> = ({ save }) => (
  <TooltipContainer>
    <TooltipSection>
      <TooltipLabel>Full Timestamp:</TooltipLabel>
      <TooltipValue>{format(new Date(save.lastPlayedAt), 'PPpp')}</TooltipValue>
    </TooltipSection>

    <TooltipSection>
      <TooltipLabel>Instance ID:</TooltipLabel>
      <TooltipValue>{save.instanceId}</TooltipValue>
    </TooltipSection>

    <TooltipSection>
      <TooltipLabel>Progress:</TooltipLabel>
      <TooltipValue>
        {save.metadata.questsCompleted} quests • {save.metadata.zonesDiscovered} zones
      </TooltipValue>
    </TooltipSection>

    {save.metadata.currentQuest && (
      <TooltipSection>
        <TooltipLabel>Current Quest:</TooltipLabel>
        <TooltipValue>{save.metadata.currentQuest}</TooltipValue>
      </TooltipSection>
    )}

    <TooltipDivider />

    <TooltipDebug>
      <DebugItem>Last Event: {save.lastEventId.substring(0, 8)}</DebugItem>
      <DebugItem>Save Type: {save.isAutoSave ? 'Auto' : 'Manual'}</DebugItem>
    </TooltipDebug>
  </TooltipContainer>
);

// Utility Functions
function formatPlayTime(seconds: number): string {
  const hours = Math.floor(seconds / 3600);
  const minutes = Math.floor((seconds % 3600) / 60);

  if (hours > 0) {
    return `${hours}h ${minutes}m`;
  }
  return `${minutes}m`;
}
```

```java
// Enhanced Save Metadata
public record SaveMetadata(
    // Basic info
    String characterName,
    String originName,
    WorldPosition currentPosition,
    int partySize,
    List<String> partyMemberNames,
    long playTimeSeconds,
    Instant createdAt,
    Instant lastPlayedAt,

    // Progress metrics
    int characterLevel,
    long credits,
    int questsCompleted,
    int zonesDiscovered,
    int enemiesDefeated,
    String currentQuest,

    // Quick snapshot for UI
    Map<String, Object> snapshot
) {
    public static SaveMetadata fromInstance(Instance instance, Party party) {
        return new SaveMetadata(
            party.getProtagonist().getName(),
            party.getProtagonist().getOrigin().name(),
            party.getPosition(),
            party.getMemberCount(),
            party.getMembers().stream()
                .map(Character::getName)
                .toList(),
            instance.getPlayTime().toSeconds(),
            instance.getCreatedAt(),
            Instant.now(),
            party.getProtagonist().getLevel(),
            party.getInventory().getCredits(),
            instance.getQuestsCompleted(),
            instance.getZonesDiscovered(),
            instance.getEnemiesDefeated(),
            instance.getCurrentQuest().map(Quest::getName).orElse(null),
            buildQuickSnapshot(instance, party)
        );
    }
}
```

**Estimated Effort**: 5 story points

---

## Technical Implementation Details

### Save Game Data Flow

```
SAVE OPERATION:
┌──────────────┐
│ Player Click │
│  "Save Game" │
└──────┬───────┘
       │
       ▼
┌──────────────┐
│  Validation  │ (not in combat, valid state)
└──────┬───────┘
       │
       ▼
┌──────────────────────────────────────────┐
│       Create SaveGameCommand             │
│  - instance ID                           │
│  - save name                             │
│  - is auto-save flag                     │
└──────┬───────────────────────────────────┘
       │
       ▼
┌──────────────────────────────────────────┐
│    SaveGameCommandHandler                │
│  1. Get latest event ID from store       │
│  2. Build metadata (play time, location) │
│  3. Create snapshot of aggregates        │
│  4. Insert save record to DB             │
│  5. Publish SaveCreated event            │
└──────┬───────────────────────────────────┘
       │
       ▼
┌──────────────┐
│   Database   │
│ saves table  │
└──────────────┘

LOAD OPERATION:
┌──────────────┐
│  Select Save │
└──────┬───────┘
       │
       ▼
┌──────────────────────────────────────────┐
│       Load Save Record                   │
│  - Get save metadata                     │
│  - Get last_event_id                     │
└──────┬───────────────────────────────────┘
       │
       ▼
┌──────────────────────────────────────────┐
│    Reconstruct Aggregates                │
│  1. Load snapshots (if available)        │
│  2. Replay events from event store       │
│  3. Rebuild Instance aggregate           │
│  4. Rebuild Party aggregate              │
│  5. Load current Zone state              │
└──────┬───────────────────────────────────┘
       │
       ▼
┌──────────────────────────────────────────┐
│    Update Client State                   │
│  1. Update Redux (party, world, game)    │
│  2. Initialize renderer with world state │
│  3. Update last_played_at timestamp      │
│  4. Navigate to game view                │
└──────────────────────────────────────────┘
```

### Database Schema (Complete)

```sql
-- Save records
CREATE TABLE saves (
    save_id             UUID PRIMARY KEY,
    instance_id         UUID NOT NULL REFERENCES instances(instance_id),
    save_name           VARCHAR(255) NOT NULL,
    last_event_id       UUID NOT NULL,
    created_at          TIMESTAMP WITH TIME ZONE NOT NULL,
    last_played_at      TIMESTAMP WITH TIME ZONE NOT NULL,
    play_time_seconds   BIGINT NOT NULL DEFAULT 0,
    is_auto_save        BOOLEAN NOT NULL DEFAULT false,
    metadata            JSONB NOT NULL,

    -- Denormalized for quick queries
    character_name      VARCHAR(255) NOT NULL,
    origin_name         VARCHAR(100),
    current_zone_id     UUID,
    current_zone_name   VARCHAR(255),
    party_size          INT NOT NULL,
    character_level     INT DEFAULT 1,
    credits             BIGINT DEFAULT 0,

    CONSTRAINT unique_save_name_per_instance UNIQUE (instance_id, save_name)
);

CREATE INDEX idx_saves_instance ON saves(instance_id);
CREATE INDEX idx_saves_last_played ON saves(last_played_at DESC);
CREATE INDEX idx_saves_is_auto_save ON saves(is_auto_save);
CREATE INDEX idx_saves_character_name ON saves(character_name);

-- Auto-save cleanup tracking
CREATE TABLE save_cleanup_log (
    cleanup_id      UUID PRIMARY KEY,
    instance_id     UUID NOT NULL,
    deleted_saves   INT NOT NULL,
    cleanup_at      TIMESTAMP WITH TIME ZONE NOT NULL,
    reason          VARCHAR(255)
);
```

### Performance Considerations

**Save Performance**:
- Target: Save operation < 2 seconds
- Optimization: Async snapshot creation
- Optimization: Denormalize frequently-queried metadata

**Load Performance**:
- Target: Load operation < 5 seconds
- Optimization: Snapshots reduce event replay
- Optimization: Lazy-load world state (only current zone initially)
- Optimization: Preload recent save on landing page

**Storage Efficiency**:
- Events shared across all saves (no duplication)
- Snapshots optional (for performance, not required)
- Metadata denormalized for query speed

---

## Epic Acceptance Criteria

- [ ] All 7 user stories completed and tested
- [ ] Player can start new game and auto-save is created
- [ ] Player can manually save with custom name
- [ ] Player can load from any save slot
- [ ] Player can manage saves (rename, delete, duplicate)
- [ ] Auto-save triggers at appropriate moments
- [ ] "Continue" quick-start works from landing page
- [ ] Save metadata displays correctly in UI
- [ ] Performance targets met (save < 2s, load < 5s)
- [ ] Manual testing of full save/load cycle passes
- [ ] Integration tests for save/load operations pass

---

## Dependencies and Risks

**Dependencies**:
- Event Store Infrastructure (complete)
- Player Initiation (character creation) (complete)
- Instance and Party aggregates implemented
- Basic game world state (zones, locations)

**Risks**:

| Risk | Impact | Probability | Mitigation |
|------|--------|-------------|------------|
| Event store grows too large over time | Medium | Medium | Implement event archival/compaction strategy |
| Save/load operations slow with many events | High | Low | Snapshots address this; monitor performance |
| Corrupted saves due to schema evolution | Medium | Low | Event versioning/upcasting (future story) |
| Auto-save disrupts gameplay | Medium | Low | Async saves, fail silently, strict triggers |
| Multiple saves consume too much disk | Low | Low | Events shared; minimal overhead per save |

---

## Testing Strategy

### Unit Tests

```java
@Test
void saveGame_shouldCreateSaveRecord() {
    // Given
    UUID instanceId = UUID.randomUUID();
    String saveName = "Test Save";
    CreateSaveCommand command = new CreateSaveCommand(
        instanceId, saveName, AgentId.player(), false
    );

    // When
    Result<List<DomainEvent>> result = handler.handle(command);

    // Then
    assertThat(result.isSuccess()).isTrue();
    assertThat(result.getValue()).hasSize(1);

    GameSaveCreated event = (GameSaveCreated) result.getValue().get(0);
    assertThat(event.getSaveName()).isEqualTo(saveName);
    assertThat(event.getInstanceId()).isEqualTo(instanceId);
}

@Test
void autoSave_shouldDeleteOldSavesWhenRetentionExceeded() {
    // Given
    UUID instanceId = UUID.randomUUID();
    createAutoSaves(instanceId, 5); // Create 5 auto-saves

    // When
    autoSaveManager.triggerAutoSave(instanceId, "Test");

    // Then
    List<Save> remaining = saveRepository.findAutoSaves(instanceId);
    assertThat(remaining).hasSize(3); // Retention limit
}
```

### Integration Tests

```java
@Test
@Transactional
void loadGame_shouldReconstructInstanceFromEvents() {
    // Given
    UUID saveId = createTestSave();

    // When
    LoadGameResult result = loadGameService.loadGame(saveId);

    // Then
    assertThat(result.instanceId()).isNotNull();
    assertThat(result.party()).isNotNull();
    assertThat(result.party().members()).hasSize(1);
}
```

### End-to-End Tests

1. **Save/Load Cycle**:
   - Start new game
   - Complete character creation
   - Verify auto-save created
   - Manually save with custom name
   - Load save
   - Verify game state matches saved state

2. **Auto-Save Flow**:
   - Play for 10 minutes
   - Verify auto-save triggered
   - Win combat
   - Verify auto-save triggered
   - Check only 3 auto-saves retained

3. **Continue Flow**:
   - Load game
   - Play briefly
   - Exit to main menu
   - Click "Continue"
   - Verify returned to same state

---

## Success Metrics

- Save operation completes in < 2 seconds (95th percentile)
- Load operation completes in < 5 seconds (95th percentile)
- Auto-save triggers don't cause frame drops or stuttering
- Zero data loss from crashes (auto-save protects progress)
- Player can manage 50+ save slots without performance degradation
- 100% success rate for save/load operations (no corruption)

---

## Out of Scope (Future Enhancements)

- Cloud save synchronization
- Save file export/import (for sharing)
- Save file compression
- Screenshot thumbnails for saves
- Save file encryption
- Cross-platform save compatibility
- Save file version migration tools
- Undo/redo system (time travel)
- Save branching (create alternate timelines)

---

## Implementation Roadmap

### Week 1: Foundation
- Story GSM-1: New game initialization (5 pts)
- Database schema setup
- Basic save/load API endpoints

### Week 2: Manual Save/Load
- Story GSM-2: Manual save game (5 pts)
- Story GSM-3: Load game from save slot (8 pts)

### Week 3: Management & Auto-Save
- Story GSM-4: Save slot management UI (5 pts)
- Story GSM-5: Auto-save system (8 pts)

### Week 4: Polish & Testing
- Story GSM-6: Continue game quick start (3 pts)
- Story GSM-7: Save metadata display (5 pts)
- Integration testing
- Performance optimization

**Total Effort**: 39 story points (~4-5 weeks with 1 developer)

---

**Epic Owner**: Backend Lead + Frontend Lead
**Status**: Ready for Development
**Next Review**: After Week 2 (mid-epic checkpoint)

---

*End of Epic Document*
