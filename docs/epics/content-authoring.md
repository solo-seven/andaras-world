# Epic: Content Management System & Pipeline

**Epic ID**: CMS-001  
**Priority**: High (Foundational for content iteration)  
**Estimated Effort**: 3-4 weeks  
**Dependencies**: Event Store, Domain Model, Reference Data Schema

---

## Epic Overview

Enable game designers and developers to create, validate, and deploy game content (items, skills, recipes, regions, NPCs, encounters) without requiring code changes. Establish a content pipeline that supports versioning, validation, and hot-reloading in development environments.

### Business Value

- **Rapid Iteration**: Content changes don't require recompilation/redeployment
- **Designer Autonomy**: Non-engineers can create and modify content
- **Data Integrity**: Validation prevents broken references and invalid state
- **Version Control**: Track content changes, rollback capabilities
- **Testing**: Isolated content validation before deployment

### Technical Approach

```
┌───────────────────────────────────────────────────────────────┐
│                     CONTENT PIPELINE                          │
│                                                               │
│  ┌────────────┐    ┌──────────────┐    ┌──────────────┐       │
│  │  Content   │──▶│  Validation  │──▶│  Transform   │       │
│  │  Authoring │    │  Engine      │    │  & Package   │       │
│  └────────────┘    └──────────────┘    └──────┬───────┘       │
│        │                                       │              │
│        │                                       ▼              │
│        │                            ┌──────────────────┐      │
│        │                            │  Content Store   │      │
│        │                            │  (PostgreSQL)    │      │
│        │                            └──────────────────┘      │
│        │                                       │              │
│        ▼                                       ▼              │
│  ┌────────────┐                    ┌──────────────────┐       │
│  │  Version   │                    │  Game Server     │       │
│  │  Control   │                    │  (Hot Reload)    │       │
│  └────────────┘                    └──────────────────┘       │
│                                                               │
└───────────────────────────────────────────────────────────────┘
```

---

## User Stories

### US-CMS-001: Content Schema Definition

**As a** developer  
**I want** formally defined schemas for all content types  
**So that** authoring tools can validate content and prevent errors

**Acceptance Criteria:**
- [ ] JSON Schema definitions for all content types (items, skills, recipes, regions, NPCs, encounters)
- [ ] Schema includes validation rules (ranges, required fields, foreign key references)
- [ ] Schema supports metadata (description, version, author)
- [ ] Schema documents available in `/docs/content-schemas/`

**Content Types to Define:**
1. Item Templates
2. Skill Definitions
3. Ability Definitions
4. Recipes
5. Region Definitions
6. Zone Templates
7. POI Templates
8. NPC Templates
9. Faction Definitions
10. Encounter Templates
11. Dialogue Trees

**Example Schema (Item Template):**

```json
{
  "$schema": "http://json-schema.org/draft-07/schema#",
  "type": "object",
  "title": "ItemTemplate",
  "required": ["templateId", "name", "category", "baseValue", "weight"],
  "properties": {
    "templateId": {
      "type": "string",
      "format": "uuid",
      "description": "Unique identifier for this item template"
    },
    "name": {
      "type": "string",
      "minLength": 1,
      "maxLength": 255
    },
    "category": {
      "type": "string",
      "enum": ["weapon", "armor", "consumable", "resource", "artifact", "tool"]
    },
    "baseValue": {
      "type": "integer",
      "minimum": 0,
      "description": "Base credit value"
    },
    "weight": {
      "type": "number",
      "minimum": 0,
      "maximum": 1000
    },
    "properties": {
      "type": "object",
      "description": "Category-specific properties"
    },
    "metadata": {
      "type": "object",
      "properties": {
        "version": { "type": "string" },
        "author": { "type": "string" },
        "description": { "type": "string" }
      }
    }
  }
}
```

**Effort**: 3 story points

---

### US-CMS-002: Content Authoring CLI Tool

**As a** content designer  
**I want** a command-line tool for creating and managing content  
**So that** I can work efficiently in my existing development workflow

**Acceptance Criteria:**
- [ ] CLI tool (`andara-content-cli`) implemented in Java (reuses domain model)
- [ ] Commands: `create`, `validate`, `list`, `export`, `import`, `diff`
- [ ] Generates content files from templates
- [ ] Validates against schemas before any database interaction
- [ ] Supports bulk operations (validate all items, export all skills)
- [ ] Clear error messages with line numbers and validation failures

**CLI Command Examples:**

```bash
# Create new item from template
andara-content create item --template weapon --output items/rusty-sword.json

# Validate single content file
andara-content validate items/rusty-sword.json

# Validate entire content directory
andara-content validate --all content/

# List all items of a type
andara-content list skills --category combat

# Export from database to files
andara-content export items --output ./export/items/

# Import from files to database
andara-content import items --source ./content/items/ --env dev

# Show differences between file and database
andara-content diff items/rusty-sword.json --env dev
```

**Implementation Approach:**

```java
// andara-content-cli module structure
andara-content-cli/
├── src/main/java/com/andara/content/cli/
│   ├── ContentCLI.java              // Main entry point
│   ├── commands/
│   │   ├── CreateCommand.java
│   │   ├── ValidateCommand.java
│   │   ├── ImportCommand.java
│   │   └── ExportCommand.java
│   ├── validation/
│   │   ├── SchemaValidator.java
│   │   └── ReferenceValidator.java
│   └── templates/
│       └── ContentTemplates.java
└── build.gradle
```

**Effort**: 5 story points

---

### US-CMS-003: Content Validation Engine

**As a** content designer  
**I want** comprehensive validation of content before deployment  
**So that** I catch errors early and don't break the game

**Acceptance Criteria:**
- [ ] Schema validation (JSON Schema compliance)
- [ ] Reference validation (foreign keys exist: skillIds, itemIds, etc.)
- [ ] Cross-reference validation (recipe inputs reference valid items)
- [ ] Balance validation (configurable rules: damage ranges, cost limits)
- [ ] Consistency validation (skill proficiency thresholds align with ability unlocks)
- [ ] Generates validation report with errors, warnings, and suggestions

**Validation Layers:**

```
┌────────────────────────────────────────┐
│         VALIDATION PIPELINE            │
├────────────────────────────────────────┤
│  1. Schema Validation                  │
│     - Type checking                    │
│     - Required fields                  │
│     - Format validation                │
├────────────────────────────────────────┤
│  2. Reference Validation               │
│     - Foreign key existence            │
│     - Circular dependency detection    │
├────────────────────────────────────────┤
│  3. Business Rule Validation           │
│     - Balance constraints              │
│     - Progression curves               │
│     - Economic limits                  │
├────────────────────────────────────────┤
│  4. Cross-System Validation            │
│     - Recipe references valid items    │
│     - Skills unlock valid abilities    │
│     - Encounters use valid NPCs        │
└────────────────────────────────────────┘
```

**Example Validation Rules:**

```yaml
# content-validation-rules.yml
items:
  weapons:
    - rule: damage_range_valid
      condition: properties.damageMin <= properties.damageMax
      severity: error
      message: "Weapon minimum damage cannot exceed maximum damage"
    
    - rule: value_to_damage_ratio
      condition: baseValue >= (properties.damageMin * 10)
      severity: warning
      message: "Weapon may be overpriced relative to damage output"

skills:
  - rule: ability_unlocks_sequential
    condition: abilityUnlocks are ordered by proficiency ascending
    severity: error
    message: "Ability unlock proficiencies must be in ascending order"

recipes:
  - rule: inputs_exist
    condition: all input itemIds exist in item_templates
    severity: error
    message: "Recipe references non-existent items"
```

**Effort**: 8 story points

---

### US-CMS-004: Content Import Service

**As a** developer  
**I want** a backend service that imports validated content into the database  
**So that** content changes are deployed consistently

**Acceptance Criteria:**
- [ ] REST API endpoint: `POST /api/admin/content/import`
- [ ] Supports batch import (multiple content files/types)
- [ ] Validates before import (reuses validation engine)
- [ ] Transaction-based (all-or-nothing import)
- [ ] Publishes `ContentImported` events to Kafka
- [ ] Returns import report (success, failures, warnings)
- [ ] Supports dry-run mode (validate without importing)

**API Design:**

```java
@RestController
@RequestMapping("/api/admin/content")
public class ContentImportController {
    
    @PostMapping("/import")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<ImportResult> importContent(
        @RequestParam("type") ContentType type,
        @RequestParam(value = "dryRun", defaultValue = "false") boolean dryRun,
        @RequestBody ContentBatch batch
    ) {
        // Validate all content first
        ValidationResult validation = validator.validate(batch);
        if (!validation.isValid()) {
            return ResponseEntity.badRequest()
                .body(ImportResult.failure(validation.getErrors()));
        }
        
        if (dryRun) {
            return ResponseEntity.ok(ImportResult.dryRun(validation));
        }
        
        // Import in transaction
        ImportResult result = importService.importContent(type, batch);
        
        // Publish events
        if (result.isSuccess()) {
            eventPublisher.publish(new ContentImported(type, batch.getIds()));
        }
        
        return ResponseEntity.ok(result);
    }
}
```

**Database Schema Updates:**

```sql
-- Content versioning and audit trail
CREATE TABLE content_versions (
    version_id      UUID PRIMARY KEY,
    content_type    VARCHAR(100) NOT NULL,
    content_id      VARCHAR(255) NOT NULL,
    version_number  INT NOT NULL,
    content_data    JSONB NOT NULL,
    imported_at     TIMESTAMP WITH TIME ZONE NOT NULL,
    imported_by     VARCHAR(255) NOT NULL,
    change_summary  TEXT,
    
    UNIQUE (content_type, content_id, version_number)
);

CREATE INDEX idx_content_versions_type ON content_versions(content_type);
CREATE INDEX idx_content_versions_id ON content_versions(content_id);

-- Current active content (fast lookup)
CREATE TABLE active_content (
    content_type    VARCHAR(100) NOT NULL,
    content_id      VARCHAR(255) NOT NULL,
    version_id      UUID NOT NULL REFERENCES content_versions(version_id),
    activated_at    TIMESTAMP WITH TIME ZONE NOT NULL,
    
    PRIMARY KEY (content_type, content_id)
);
```

**Effort**: 8 story points

---

### US-CMS-005: Content Export Service

**As a** content designer  
**I want** to export current content from the database to files  
**So that** I can version control content and share with team

**Acceptance Criteria:**
- [ ] CLI command exports content to JSON files
- [ ] Preserves directory structure (`content/items/`, `content/skills/`, etc.)
- [ ] Exports metadata (version, last modified, author)
- [ ] Supports filtering (by type, by ID pattern, by date range)
- [ ] Generates manifest file (`content-manifest.json`) with checksums

**Export Structure:**

```
content/
├── manifest.json
├── items/
│   ├── weapons/
│   │   ├── rusty-sword.json
│   │   └── energy-pistol.json
│   ├── armor/
│   │   └── scrap-vest.json
│   └── consumables/
│       └── stimpak.json
├── skills/
│   ├── combat/
│   │   └── melee.json
│   └── survival/
│       └── scavenging.json
├── recipes/
│   └── stimpak-recipe.json
└── regions/
    └── wasteland-alpha.json
```

**Manifest Format:**

```json
{
  "version": "0.1.0",
  "exportedAt": "2026-01-05T10:30:00Z",
  "exportedBy": "brian@andara",
  "environment": "dev",
  "contents": {
    "items": {
      "count": 15,
      "files": [
        {
          "id": "item_rusty_sword",
          "path": "items/weapons/rusty-sword.json",
          "checksum": "sha256:abc123..."
        }
      ]
    },
    "skills": {
      "count": 10,
      "files": [...]
    }
  }
}
```

**Effort**: 5 story points

---

### US-CMS-006: Content Hot-Reload in Development

**As a** developer  
**I want** content changes to reload without restarting the server  
**So that** I can iterate quickly during development

**Acceptance Criteria:**
- [ ] File watcher monitors `content/` directory for changes
- [ ] On change detected: validates → imports → publishes reload event
- [ ] Game server listens to reload events and refreshes caches
- [ ] Only enabled in `dev` and `local` environments
- [ ] UI shows notification when content reloads
- [ ] Graceful handling if validation fails (keeps old content)

**Implementation:**

```java
@Component
@Profile({"dev", "local"})
public class ContentFileWatcher {
    
    private final Path contentDir = Paths.get("./content");
    private final ContentImportService importService;
    private final EventPublisher eventPublisher;
    
    @PostConstruct
    public void startWatching() {
        WatchService watchService = FileSystems.getDefault().newWatchService();
        contentDir.register(watchService, 
            StandardWatchEventKinds.ENTRY_MODIFY,
            StandardWatchEventKinds.ENTRY_CREATE);
        
        // Watch in background thread
        executor.submit(() -> {
            while (true) {
                WatchKey key = watchService.take();
                for (WatchEvent<?> event : key.pollEvents()) {
                    Path changed = (Path) event.context();
                    handleContentChange(changed);
                }
                key.reset();
            }
        });
    }
    
    private void handleContentChange(Path file) {
        try {
            // Debounce (wait for file write to complete)
            Thread.sleep(500);
            
            ContentType type = detectType(file);
            ContentBatch batch = loadContent(file);
            
            // Validate
            ValidationResult validation = validator.validate(batch);
            if (!validation.isValid()) {
                log.warn("Content validation failed: {}", validation.getErrors());
                return;
            }
            
            // Import
            ImportResult result = importService.importContent(type, batch);
            
            // Notify
            if (result.isSuccess()) {
                eventPublisher.publish(new ContentReloaded(type, batch.getIds()));
                log.info("Content reloaded: {} - {}", type, file.getFileName());
            }
            
        } catch (Exception e) {
            log.error("Failed to reload content: {}", file, e);
        }
    }
}
```

**Effort**: 5 story points

---

### US-CMS-007: Content Diff and Merge Tool

**As a** content designer  
**I want** to compare content versions and merge changes  
**So that** I can resolve conflicts when multiple designers work on content

**Acceptance Criteria:**
- [ ] CLI command shows differences between two content versions
- [ ] Supports three-way merge (base, yours, theirs)
- [ ] Highlights conflicts and requires manual resolution
- [ ] Generates merge result file
- [ ] Validates merged result before accepting

**Example Workflow:**

```bash
# Show differences between file and database
andara-content diff items/rusty-sword.json --env dev

# Three-way merge (git-like)
andara-content merge items/rusty-sword.json \
  --base content/items/rusty-sword.json \
  --theirs content-branch/items/rusty-sword.json \
  --output items/rusty-sword-merged.json
```

**Diff Output:**

```
Comparing: items/rusty-sword.json (local) vs database (dev)

MODIFIED: baseValue
  - Database: 50
  + Local:    75

MODIFIED: properties.damageMax
  - Database: 12
  + Local:    15

UNCHANGED: name, category, weight

Summary: 2 modifications, 0 additions, 0 deletions
```

**Effort**: 5 story points

---

### US-CMS-008: Content Web UI (Admin Panel)

**As a** content designer  
**I want** a web interface for browsing and editing content  
**So that** non-technical team members can contribute

**Acceptance Criteria:**
- [ ] React-based admin panel at `/admin/content`
- [ ] Lists all content by type with search/filter
- [ ] View content details (read-only JSON viewer)
- [ ] Edit content with form-based UI (generated from schema)
- [ ] Validate on client-side before submission
- [ ] Audit log shows who changed what when
- [ ] Role-based access (admin only for now)

**UI Structure:**

```
/admin/content
  ├── /items          (List view with filters)
  │   └── /:id        (Detail/Edit view)
  ├── /skills
  ├── /recipes
  ├── /regions
  └── /import         (Batch import UI)
```

**Component Architecture:**

```typescript
// Content Admin Components
/src/admin/
  ├── ContentListView.tsx
  ├── ContentDetailView.tsx
  ├── ContentEditor.tsx          // Schema-driven form generator
  ├── ValidationDisplay.tsx
  ├── AuditLog.tsx
  └── ImportWizard.tsx

// Schema-driven form generation
<ContentEditor
  schema={itemSchema}
  value={currentItem}
  onChange={handleChange}
  onValidate={handleValidate}
/>
```

**Effort**: 13 story points (largest story, consider splitting)

---

### US-CMS-009: Content Seeding for Development

**As a** developer  
**I want** automated seeding of development databases with baseline content  
**So that** new developers can start working immediately

**Acceptance Criteria:**
- [ ] Seed script (`seed-content.sh`) loads content from `/content/seed/`
- [ ] Runs automatically on fresh database initialization
- [ ] Includes minimal viable content set (10 items, 5 skills, 3 recipes, 1 region)
- [ ] Can be run manually to reset to baseline
- [ ] Documents what content is included and why

**Seed Content Manifest:**

```yaml
# content/seed/manifest.yml
description: "Minimal content set for development and testing"
version: "0.1.0"

items:
  - id: item_pipe_pistol
    rationale: "Basic ranged weapon for combat testing"
  - id: item_machete
    rationale: "Basic melee weapon"
  - id: item_leather_jacket
    rationale: "Basic armor"
  - id: item_stimpak
    rationale: "Healing consumable"
  # ... 6 more

skills:
  - id: skill_melee
    rationale: "Primary combat skill"
  - id: skill_ranged
    rationale: "Ranged combat skill"
  - id: skill_scavenging
    rationale: "Resource gathering"
  # ... 2 more

recipes:
  - id: recipe_stimpak
    rationale: "Basic crafting test"
  # ... 2 more

regions:
  - id: region_dev_zone
    rationale: "Small test region with all POI types"
```

**Effort**: 3 story points

---

### US-CMS-010: Content Documentation Generator

**As a** game designer  
**I want** automatically generated documentation from content  
**So that** I can share game balance information with the team

**Acceptance Criteria:**
- [ ] CLI command generates Markdown docs from content
- [ ] Organized by content type
- [ ] Includes tables, stats, relationships
- [ ] Supports custom templates for different report types
- [ ] Outputs to `/docs/content/` directory

**Example Generated Documentation:**

````markdown
# Item Catalog - Weapons

Generated: 2026-01-05

## Melee Weapons

| Name | Damage | Value | Weight | Special |
|------|--------|-------|--------|---------|
| Pipe Pistol | 8-12 | 50 | 2.0kg | Unreliable |
| Machete | 10-15 | 75 | 1.5kg | Bleed chance |

## Ranged Weapons

...

# Crafting Recipes

## Medical

### Stimpak
**Skill Required**: Chemistry 25  
**Workstation**: Chemistry Lab  
**Time**: 30 minutes  

**Inputs:**
- Chemical Compound × 2
- Medical Supplies × 1
- Empty Injector × 1

**Outputs:**
- Stimpak × 2

**Quality Scaling**: Higher Chemistry skill increases output quality
````

**Effort**: 3 story points

---

## Technical Implementation Notes

### Content Storage Pattern

```java
// Domain service for content management
@Service
public class ContentRepositoryService {
    
    private final JdbcTemplate jdbc;
    private final ContentValidator validator;
    private final EventPublisher events;
    
    @Transactional
    public <T> ImportResult importContent(
        ContentType type,
        List<T> contentItems
    ) {
        List<String> errors = new ArrayList<>();
        List<String> imported = new ArrayList<>();
        
        for (T item : contentItems) {
            // Validate
            ValidationResult validation = validator.validate(item);
            if (!validation.isValid()) {
                errors.addAll(validation.getErrors());
                continue;
            }
            
            // Version and store
            ContentVersion version = createVersion(type, item);
            jdbc.update(
                "INSERT INTO content_versions (...) VALUES (...)",
                version.toParams()
            );
            
            // Activate
            jdbc.update(
                """
                INSERT INTO active_content (content_type, content_id, version_id, activated_at)
                VALUES (?, ?, ?, NOW())
                ON CONFLICT (content_type, content_id) 
                DO UPDATE SET version_id = EXCLUDED.version_id, 
                              activated_at = EXCLUDED.activated_at
                """,
                type, version.getId(), version.getVersionId()
            );
            
            imported.add(version.getId());
        }
        
        if (errors.isEmpty()) {
            events.publish(new ContentImported(type, imported));
            return ImportResult.success(imported);
        } else {
            return ImportResult.partial(imported, errors);
        }
    }
}
```

### Content Caching Strategy

```java
@Service
public class ContentCache {
    
    private final LoadingCache<ContentKey, Object> cache;
    private final EventBus eventBus;
    
    public ContentCache() {
        this.cache = Caffeine.newBuilder()
            .maximumSize(10_000)
            .expireAfterWrite(1, TimeUnit.HOURS)
            .build(key -> loadFromDatabase(key));
        
        // Listen for content reload events
        eventBus.subscribe(ContentReloaded.class, this::invalidateCache);
    }
    
    public <T> T get(ContentType type, String id, Class<T> clazz) {
        ContentKey key = new ContentKey(type, id);
        return clazz.cast(cache.get(key));
    }
    
    private void invalidateCache(ContentReloaded event) {
        event.getIds().forEach(id -> 
            cache.invalidate(new ContentKey(event.getType(), id))
        );
    }
}
```

---

## Epic Acceptance Criteria

- [ ] All 10 user stories completed and tested
- [ ] Content can be authored, validated, imported, and exported via CLI
- [ ] Web admin panel allows non-technical team members to edit content
- [ ] Hot-reload works in development environment
- [ ] Seed content loads on fresh database
- [ ] Documentation generator produces useful reference docs
- [ ] No manual SQL required for content changes
- [ ] Content versioning provides audit trail

---

## Dependencies and Risks

**Dependencies:**
- PostgreSQL schema for content storage (reference data tables)
- Kafka for content reload events
- Admin authentication/authorization

**Risks:**

| Risk | Mitigation |
|------|------------|
| Schema drift between code and content definitions | Generate Java classes from JSON Schema |
| Content corruption from bad imports | All-or-nothing transactions, validation before import |
| Large content files (regions with many POIs) | Pagination in UI, streaming imports |
| Merge conflicts in JSON files | Git merge driver for JSON, diff tool |

---

## Testing Strategy

1. **Unit Tests**: Schema validation, reference checking
2. **Integration Tests**: Import/export roundtrip, database persistence
3. **End-to-End Tests**: CLI workflow (create → validate → import)
4. **Manual Testing**: Admin UI usability, hot-reload functionality

---

## Success Metrics

- Content import time < 5 seconds for 100 items
- Validation catches 100% of broken references
- Hot-reload time < 2 seconds from file change to game update
- Non-technical team member can create new item in < 5 minutes
