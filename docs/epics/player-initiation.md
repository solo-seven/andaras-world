# Epic: Player Initiation

**Epic ID**: PI-001  
**Priority**: P0 (Blocking)  
**Estimated Effort**: 3-4 weeks  
**Goal**: Enable a player to progress from landing page through character creation to having a playable protagonist in a new game instance.

## Epic Description

Implement the complete player onboarding flow from first visit to game-ready state. This includes:
- Initial landing/start experience
- New game initialization
- Five-step character creation workflow
- Party and instance creation
- Persistence layer for player progress
- Handoff to game world (placeholder)

**Success Criteria**: A player can create a character through the full workflow, persist that character to the database, and see a "game ready" state with their character sheet visible.

---

## User Stories

### Story PI-1: Landing Page & New Game Entry Point

**As a** new player  
**I want to** see a landing page with a clear "New Game" option  
**So that** I can begin creating my character

**Acceptance Criteria**:
- [x] Landing page renders with game title "Andara's World"
- [x] "New Game" button is prominent and follows style guide (primary button)
- [x] "Load Game" button is visible but disabled (placeholder for future)
- [x] Clicking "New Game" initiates character creation flow
- [x] Page uses Functional Brutalism aesthetic from style guide
- [x] Rift energy glow on interactive elements

**Technical Notes**:
- React component: `LandingPage.tsx`
- Route: `/` 
- No backend calls required yet
- Uses Rajdhani for title, IBM Plex Mono for buttons
- Background: Deep Void (#0a0e14) with subtle scanlines

**Estimated Effort**: 0.5 days

---

### Story PI-2: Character Creation Shell & Navigation

**As a** player  
**I want to** see a multi-step character creation interface  
**So that** I can understand the creation process and navigate through it

**Acceptance Criteria**:
- [x] Character creation container renders with 5-step stepper
- [x] Stepper shows: Origin → Attributes → Skills → Appearance → Name
- [x] Current step highlighted with Stable Rift glow (#4da6ff)
- [x] Completed steps show Healing Rift (#4dffb8) with checkmark
- [x] Upcoming steps show inactive state (Ash #555d6d)
- [x] "Next" button enabled when current step valid
- [x] "Back" button navigates to previous step (disabled on step 1)
- [x] "Cancel" returns to landing page with confirmation modal
- [x] Progress persists in Redux state during session

**Technical Notes**:
- React component: `CharacterCreation.tsx` (shell)
- Sub-component: `CreationStepper.tsx`
- Redux slice: `characterCreationSlice.ts`
- State shape:
  ```typescript
  {
    currentStep: number;
    formData: {
      origin: OriginId | null;
      attributes: Record<string, number>;
      skills: SkillId[];
      appearance: AppearanceData;
      name: string;
    };
    isComplete: boolean;
  }
  ```
- Routes: `/character-creation/:step`

**Estimated Effort**: 1 day

---

### Story PI-3: Origin Selection Step

**As a** player  
**I want to** select my character's origin/background  
**So that** I can define their starting conditions and narrative context

**Acceptance Criteria**:
- [x] Six origin cards displayed in grid (2x3 or 3x2)
- [x] Each card shows: title, description, starting bonuses/penalties, faction effects
- [x] Card states: default, hover (rift glow + translateY), selected (border + corner brackets)
- [x] Exactly one origin can be selected
- [x] Selected origin persists in Redux state
- [x] "Next" button enabled when origin selected
- [x] Card size: 280px × 360px per style guide

**Origin Data** (from GDD Section 2.1.2):
- Vault Dweller
- Wastelander  
- Rift-Touched
- Caravan Guard
- Settlement Militia
- Outcast

**Technical Notes**:
- Component: `OriginSelection.tsx`
- Card component: `OriginCard.tsx`
- Origin data: Static JSON or hardcoded constants (no backend needed yet)
- Use CSS Grid for layout
- Implement hover/selected states with rift glow effects

**Estimated Effort**: 1.5 days

---

### Story PI-4: Attribute Allocation Step

**As a** player  
**I want to** allocate points across six attributes  
**So that** I can customize my character's strengths and weaknesses

**Acceptance Criteria**:
- [x] Six attributes displayed: STR, AGI, END, INT, PER, CHA
- [x] Each attribute shows: name, current value, description, effects
- [x] Point-buy system: 27 points total
- [x] Each attribute range: 6-16 (base 8)
- [x] Slider UI with diamond thumb, notches at integers
- [x] Remaining points displayed prominently
- [x] "Reset" button to restore all to 8
- [x] Cannot proceed if points remain unspent
- [x] Tooltip on hover explains attribute effects

**Technical Notes**:
- Component: `AttributeAllocation.tsx`
- Slider component: `AttributeSlider.tsx` (reusable)
- Validation: Sum must equal 27, each 6-16
- Visual feedback when points exhausted
- Attributes from GDD Section 2.1.3:
  ```typescript
  type Attributes = {
    strength: number;
    agility: number;
    endurance: number;
    intellect: number;
    perception: number;
    charisma: number;
  };
  ```

**Estimated Effort**: 2 days

---

### Story PI-5: Skill Focus Selection Step

**As a** player  
**I want to** select two starting skill focuses  
**So that** I can define my character's initial competencies

**Acceptance Criteria**:
- [x] Display all available skills grouped by category
- [x] Categories: Combat, Survival, Technical, Arcane, Social
- [x] Each skill shows: name, description, starting proficiency bonus
- [x] Player selects exactly 2 skills as focuses
- [x] Selected skills start at Proficiency 20
- [x] Origin bonus skill (from step 1) auto-selected at Proficiency 15
- [x] Origin bonus skill cannot be deselected but can be chosen as focus
- [x] Visual distinction between focus skills and origin skill
- [x] Category colors from style guide

**Technical Notes**:
- Component: `SkillSelection.tsx`
- Skill data: Reference GDD Appendix A for skill tree
- Need to cross-reference selected origin for bonus skill
- Simplified for prototype: ~10-15 core skills, not full 20
- Card-based selection similar to Origin step

**Estimated Effort**: 1.5 days

---

### Story PI-6: Appearance Customization Step

**As a** player  
**I want to** customize my character's visual appearance  
**So that** I can personalize their look

**Acceptance Criteria**:
- [x] **Minimum viable**: Text inputs for physical description
- [x] Fields: Gender, Build, Hair, Eyes, Skin, Distinguishing Features (implemented with presets + structured enums)
- [x] Each field: text input, 100 char limit (implemented as structured options)
- [x] Optional fields (can skip)
- [x] Character preview placeholder (static image or icon)
- [x] **Future expansion point**: Visual customizer with presets (implemented ahead of schedule)

**Technical Notes**:
- Component: `AppearanceCustomization.tsx`
- For prototype: simple form inputs only
- Store as structured text data:
  ```typescript
  type AppearanceData = {
    gender?: string;
    build?: string;
    hair?: string;
    eyes?: string;
    skin?: string;
    distinguishingFeatures?: string;
  };
  ```
- No validation required (all optional)

**Estimated Effort**: 0.75 days

---

### Story PI-7: Name Input & Creation Finalization

**As a** player  
**I want to** name my character and confirm creation  
**So that** I can finalize my protagonist

**Acceptance Criteria**:
- [x] Text input for character name
- [x] Name required, 2-30 characters
- [x] Basic validation: alphanumeric + spaces/apostrophes/hyphens
- [x] Summary panel shows all previous selections
- [x] Summary includes: Origin, Attributes (with totals), Skills, Appearance, Name
- [x] "Create Character" button (primary, prominent)
- [x] Clicking "Create Character" submits to backend
- [x] Loading state during character creation
- [x] Error handling if creation fails

**Technical Notes**:
- Component: `NameAndSummary.tsx`
- Summary component: `CharacterSummary.tsx` (reusable for character sheet)
- Name validation regex: `/^[a-zA-Z0-9\s'-]{2,30}$/`
- Triggers backend API call (see Story PI-8)

**Estimated Effort**: 1 day

---

### Story PI-8: Backend - Character Creation Command Handler

**As the** system  
**I want to** process character creation commands  
**So that** a new character and party are persisted

**Acceptance Criteria**:
- [x] API endpoint: `POST /api/v1/game/start`
- [x] Request body includes: origin, attributes, skills, appearance, name
- [x] Command handler validates input
- [x] Creates new `Instance` aggregate
- [x] Creates new `Party` aggregate with single protagonist
- [x] Creates `Character` aggregate with provided data
- [x] Publishes domain events: `InstanceCreated`, `PartyCreated`, `CharacterCreated`
- [x] Events written to event store (PostgreSQL)
- [x] Events published to Kafka topic: `andara.events.party`
- [x] Returns: `instanceId`, `partyId`, `characterId` to client
- [x] Error responses for validation failures

**Technical Notes**:
- Command: `StartNewGameCommand`
- Handler: `StartNewGameCommandHandler`
- Aggregates: `Instance`, `Party`, `Character` (from domain model)
- Repository: `EventSourcedPartyRepository`
- Event publisher: `KafkaEventPublisher`
- Database tables: `domain_events`, `instances`, `saves` (schema in architecture doc)
- No authentication yet (single local player)

**Event Sequence**:
```
1. InstanceCreated(instanceId, ownerId=system, timestamp)
2. PartyCreated(partyId, instanceId, protagonistId)
3. CharacterCreated(characterId, partyId, name, origin, attributes, skills, appearance)
```

**Estimated Effort**: 2 days

---

### Story PI-9: Backend - Character Read Model Projection

**As the** system  
**I want to** build read models from character creation events  
**So that** the client can efficiently query character state

**Acceptance Criteria**:
- [x] Kafka consumer listens to `andara.events.party`
- [x] Projects `CharacterCreated` event to `character_view` table
- [x] Projects `PartyCreated` event to `party_view` table
- [x] Projects `InstanceCreated` event to `instances` table
- [x] Read models updated synchronously (blocking until projection completes)
- [x] API endpoint: `GET /api/v1/party/{partyId}` returns party view
- [x] API endpoint: `GET /api/v1/characters/{characterId}` returns character view
- [x] Response includes all character data needed for UI display

**Technical Notes**:
- Handler: `PartyProjectionHandler`
- Tables: `party_view`, `character_view` (schema in architecture doc Section 6.2)
- Query service: `PartyQueryService`
- Controller: `PartyController`
- DTOs: `PartyView`, `CharacterView`

**Estimated Effort**: 1.5 days

---

### Story PI-10: Frontend - Character Creation Submission & Transition

**As a** player  
**I want to** see confirmation that my character was created  
**So that** I know I can proceed to the game

**Acceptance Criteria**:
- [x] "Create Character" triggers API call to `POST /api/v1/game/start`
- [x] Loading spinner shown during API call
- [x] On success: Store `instanceId`, `partyId`, `characterId` in Redux
- [x] Success transition: Navigate to character sheet view
- [x] On error: Display error message, allow retry
- [x] Error states styled per style guide (Volatile Rift color)
- [x] Network retry logic (3 attempts with exponential backoff)

**Technical Notes**:
- API client: `gameApi.ts`
- Redux actions: `startNewGame` (async thunk)
- Navigation: `navigate('/character-sheet')`
- Error component: `ErrorBanner.tsx`
- Store returned IDs in `gameSlice`:
  ```typescript
  {
    instanceId: string | null;
    partyId: string | null;
    sessionId: string | null;
  }
  ```

**Estimated Effort**: 1 day

---

### Story PI-11: Character Sheet Display (Placeholder)

**As a** player  
**I want to** see my created character's details  
**So that** I can verify creation succeeded and review my character

**Acceptance Criteria**:
- [x] Character sheet panel displays protagonist data
- [x] Shows: Name, Origin, Attributes (all six with values), Skills (focus skills highlighted), Appearance
- [x] Panel styled per style guide (Primary Panel)
- [x] Data fetched from `GET /api/v1/characters/{characterId}`
- [x] Loading state while fetching
- [x] "Begin Adventure" button visible (placeholder, non-functional)
- [x] "Return to Main Menu" button returns to landing page

**Technical Notes**:
- Component: `CharacterSheet.tsx`
- Reuses `CharacterSummary.tsx` from step 7
- API call on mount to fetch character data
- Uses Redux-stored `characterId` from creation
- This is endpoint for pre-MVP; "Begin Adventure" leads to future work

**Estimated Effort**: 1 day

---

### Story PI-12: Persistence - Save Game Record

**As the** system  
**I want to** create a save game record when character creation completes  
**So that** the player can load their character in the future

**Acceptance Criteria**:
- [x] After character creation, automatically create save game entry
- [x] Save game table: `saves` (schema in architecture doc)
- [x] Record includes: `save_id`, `instance_id`, `name`, `last_event_id`, `created_at`, `metadata`
- [x] Save name: Auto-generated from character name + timestamp
- [x] `last_event_id`: Latest event from instance event stream
- [x] Metadata includes: character name, origin, play time (0 initially)
- [x] Save creation logged to console/logs

**Technical Notes**:
- Service: `GamePersistenceService.saveGame()`
- Called after character creation events committed
- Table: `saves` (from architecture doc Section 11.2)
- For now: Auto-save only, no manual save triggers

**Estimated Effort**: 0.75 days

---

## Story Dependencies

```
PI-1 (Landing) → PI-2 (Shell)
PI-2 → PI-3 (Origin)
PI-3 → PI-4 (Attributes)
PI-4 → PI-5 (Skills)
PI-5 → PI-6 (Appearance)
PI-6 → PI-7 (Name)
PI-7 → PI-10 (Submission)

PI-8 (Backend Command) ← PI-10 (Frontend submits to it)
PI-8 → PI-9 (Read Model)
PI-9 → PI-11 (Character Sheet fetches from it)
PI-10 → PI-11 (Navigation)
PI-8 → PI-12 (Save Record)
```

## Epic Definition of Done

- [ ] All 12 stories completed and accepted
- [ ] Player can navigate full flow: landing → creation → character sheet
- [ ] Character data persists in PostgreSQL event store
- [ ] Character read model accurately reflects creation
- [ ] Save game record created automatically
- [ ] UI follows style guide consistently
- [ ] All API endpoints documented
- [ ] Error states tested and handled gracefully
- [ ] Code reviewed and merged to main branch
- [ ] Manual smoke test of full flow passes

## Out of Scope (Future Epics)

- Load game functionality
- Multiple party members (companions)
- Character deletion
- Character editing after creation
- Visual character customizer with avatars
- Tutorial/onboarding tooltips
- World transition after character creation

## Technical Debt / Notes

- **Authentication**: Not implemented; single local player assumed
- **Validation**: Client-side only for now; server-side validation minimal
- **Asset Loading**: Using placeholders; real assets added later
- **Animation Polish**: Functional animations only; refinement in polish phase
