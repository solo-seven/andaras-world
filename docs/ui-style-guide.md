# Andara's World - UI Style Guide
**Version**: 0.1  
**Date**: January 2026  
**Purpose**: Define visual language for game interface

---

## 1. Design Philosophy

### 1.1 Core Principles

| Principle | Implementation |
|-----------|----------------|
| **Functional Brutalism** | UI elements reveal their purpose through form; no unnecessary decoration |
| **Weathered Technology** | Interface feels like salvaged pre-Convergence tech, patched and maintained |
| **Energy Contrast** | Muted base palette punctuated by rift energy accents for interaction and danger |
| **Information Density** | Tactical RPG requires data; organize it clearly without overwhelming |
| **Environmental Integration** | UI elements echo the world's aesthetic (ruins, scavenged materials) |

### 1.2 Visual Metaphors

- **Containers**: Salvaged metal panels, weathered screens, duct-taped repairs
- **Interactive Elements**: Rift energy glow states (dim→bright on hover/active)
- **Data Displays**: Flickering CRT aesthetic mixed with holographic rift projections
- **Warnings/Danger**: Rift energy color shifts (stable blue → unstable red)
- **Progress/Resources**: Physical gauges, analog meters, depleting energy cells

---

## 2. Color Palette

### 2.1 Base Palette (Muted World)

```
PRIMARY NEUTRALS
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
Deep Void      #0a0e14  Background, darkest UI elements
Concrete Gray  #1a1f28  Panel backgrounds
Steel          #2d3542  Secondary panels, disabled states
Rust           #3d4451  Borders, dividers
Ash            #555d6d  Tertiary elements
Dust           #7a8291  Inactive text, subtle details
Smoke          #9ba3b4  Secondary text
Worn Paper     #c5cdd8  Primary text
Bleached       #e3e8ef  Highlights, active text

ACCENT NEUTRALS (Weathered Materials)
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
Oxidized Copper  #4a5a4e  (muted teal-green)
Tarnished Brass  #5a5445  (muted yellow-brown)
Weathered Bronze #4a4345  (muted red-brown)
```

### 2.2 Rift Energy Palette (Vibrant Accents)

```
RIFT STATES
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
Stable Rift      #4da6ff  Primary interactive, stable energy
Resonant Rift    #66b3ff  Hover state, activated
Active Rift      #80c0ff  Focus, selected
Volatile Rift    #ff6b6b  Danger, warnings, critical
Corrupted Rift   #d946ff  Arcane, magical elements
Healing Rift     #4dffb8  Positive effects, healing
Temporal Rift    #ffdb4d  Special actions, temporal

GLOW LAYERS (Multiplicative/Additive Blending)
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
Soft Glow       rgba(77, 166, 255, 0.15)
Medium Glow     rgba(77, 166, 255, 0.30)
Intense Glow    rgba(77, 166, 255, 0.50)
```

### 2.3 Semantic Colors

```
FUNCTIONAL COLORS
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
Success      #4dffb8  (Healing Rift)
Warning      #ffdb4d  (Temporal Rift)
Error        #ff6b6b  (Volatile Rift)
Info         #4da6ff  (Stable Rift)

RESOURCE INDICATORS
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
Health       #ff6b6b → #4dffb8  (gradient from low to high)
Stamina      #ffdb4d
Action Points #4da6ff
Rift Energy   #d946ff
Ammunition    #9ba3b4  (neutral, consumable)
```

### 2.4 Skill Category Colors

```
Combat       #ff6b6b  (Volatile Rift - aggressive)
Survival     #4dffb8  (Healing Rift - sustaining)
Technical    #4da6ff  (Stable Rift - precise)
Arcane       #d946ff  (Corrupted Rift - mysterious)
Social       #ffdb4d  (Temporal Rift - influence)
```

---

## 3. Typography

### 3.1 Font Stack

```
PRIMARY FONT (UI, Readability)
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
Family: 'IBM Plex Mono'
Weights: 400 (Regular), 500 (Medium), 600 (SemiBold)
Rationale: Monospace conveys technical/tactical interface
          Clear at small sizes, excellent readability
          Modern but not sterile
Fallback: 'Consolas', 'Monaco', monospace

DISPLAY FONT (Headings, Emphasis)
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
Family: 'Rajdhani'
Weights: 500 (Medium), 600 (SemiBold), 700 (Bold)
Rationale: Geometric, mechanical feel
          Strong character for headings
          Contrasts well with Plex Mono
Fallback: 'Impact', sans-serif

SPECIAL USE (Environmental Text, Lore)
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
Family: 'VT323' (or similar bitmap font)
Weight: 400
Rationale: CRT terminal aesthetic for salvaged tech
          Use sparingly for flavor
Fallback: 'Courier New', monospace
```

### 3.2 Type Scale

```
FUNCTIONAL SIZES
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
Display XL     48px / 52px  Rajdhani Bold        (Major section titles)
Display L      36px / 40px  Rajdhani SemiBold    (Screen titles)
Display M      24px / 28px  Rajdhani SemiBold    (Panel headers)

Heading L      20px / 24px  IBM Plex Mono SemiBold
Heading M      16px / 20px  IBM Plex Mono SemiBold
Heading S      14px / 18px  IBM Plex Mono Medium

Body L         16px / 24px  IBM Plex Mono Regular  (Main content)
Body M         14px / 20px  IBM Plex Mono Regular  (Standard UI)
Body S         12px / 16px  IBM Plex Mono Regular  (Secondary info)
Caption        10px / 14px  IBM Plex Mono Regular  (Labels, hints)

Monospace Data 14px / 20px  IBM Plex Mono Medium   (Stats, numbers)
```

### 3.3 Text Treatments

```css
/* Rift Glow Text (Interactive Elements) */
.rift-text {
  color: #4da6ff;
  text-shadow: 0 0 8px rgba(77, 166, 255, 0.5),
               0 0 16px rgba(77, 166, 255, 0.25);
}

/* Worn Text (Environmental) */
.worn-text {
  color: #c5cdd8;
  opacity: 0.9;
  letter-spacing: 0.02em;
}

/* Critical Warning */
.critical-text {
  color: #ff6b6b;
  font-weight: 600;
  animation: pulse-glow 2s ease-in-out infinite;
}

/* Data Readout */
.data-readout {
  font-family: 'IBM Plex Mono', monospace;
  font-variant-numeric: tabular-nums;
  letter-spacing: 0.05em;
}
```

---

## 4. UI Components

### 4.1 Buttons

**PRIMARY BUTTON** (Main Actions)
```
Base State:
  Background: linear-gradient(135deg, #2d3542 0%, #1a1f28 100%)
  Border: 1px solid #555d6d
  Text: #e3e8ef (Bleached)
  Padding: 12px 24px
  Border-radius: 2px (minimal, industrial)
  Box-shadow: inset 0 1px 0 rgba(255,255,255,0.05)

Hover State:
  Border: 1px solid #4da6ff (Stable Rift)
  Box-shadow: 0 0 12px rgba(77, 166, 255, 0.3),
              inset 0 1px 0 rgba(255,255,255,0.05)
  
Active/Pressed:
  Background: linear-gradient(135deg, #1a1f28 0%, #0a0e14 100%)
  Border: 1px solid #80c0ff (Active Rift)
  
Disabled:
  Background: #1a1f28
  Border: 1px solid #3d4451
  Text: #555d6d (Ash)
  Opacity: 0.5
```

**DANGER BUTTON** (Destructive Actions)
```
Base: Same as primary but border #ff6b6b
Hover: Glow with volatile rift color
```

**GHOST BUTTON** (Secondary Actions)
```
Background: transparent
Border: 1px solid #3d4451
Text: #9ba3b4
Hover: Border #4da6ff, Text #e3e8ef
```

### 4.2 Input Fields

```
TEXT INPUT
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
Base:
  Background: #0a0e14 (Deep Void)
  Border: 1px solid #3d4451 (Rust)
  Text: #e3e8ef (Bleached)
  Padding: 10px 12px
  Font: 14px IBM Plex Mono Regular

Focus:
  Border: 1px solid #4da6ff
  Box-shadow: 0 0 0 3px rgba(77, 166, 255, 0.15)
  Glow: 0 0 8px rgba(77, 166, 255, 0.3)

Error:
  Border: 1px solid #ff6b6b
  Box-shadow: 0 0 0 3px rgba(255, 107, 107, 0.15)
```

### 4.3 Panels and Containers

```
PANEL STYLES
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
Primary Panel:
  Background: rgba(26, 31, 40, 0.95) (Concrete Gray + transparency)
  Border: 1px solid #3d4451
  Backdrop-filter: blur(8px)
  Box-shadow: 0 4px 12px rgba(0, 0, 0, 0.5)

Panel Header:
  Background: #1a1f28
  Border-bottom: 1px solid #4da6ff
  Padding: 12px 16px
  Font: 16px Rajdhani SemiBold
  
Panel Divider:
  Border: 1px solid #2d3542
  Height: 1px
  Margin: 16px 0
```

### 4.4 Progress Bars and Gauges

```
RESOURCE BAR (Health, Stamina, etc.)
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
Container:
  Background: #0a0e14
  Border: 1px solid #3d4451
  Height: 8px
  
Fill (Dynamic):
  Background: gradient based on resource type
  Box-shadow: inset 0 0 4px rgba(255,255,255,0.2)
  Glow: 0 0 6px [resource-color]
  
Animation: Smooth depletion/fill with ease-out
Segments: Notches every 25% for quick reading
```

### 4.5 Tooltips

```
Background: rgba(10, 14, 20, 0.98)
Border: 1px solid #4da6ff
Padding: 8px 12px
Max-width: 280px
Font: 12px IBM Plex Mono Regular
Shadow: 0 4px 16px rgba(0, 0, 0, 0.8)
Glow: 0 0 8px rgba(77, 166, 255, 0.2)

Arrow: 6px triangle with matching border
Delay: 300ms before appearance
```

---

## 5. Layout and Spacing

### 5.1 Grid System

```
BASE UNIT: 8px

Spacing Scale:
  xs:  4px   (0.5 unit)
  s:   8px   (1 unit)
  m:   16px  (2 units)
  l:   24px  (3 units)
  xl:  32px  (4 units)
  xxl: 48px  (6 units)

Column Grid: 12 columns
Gutter: 24px
Max Content Width: 1440px
```

### 5.2 Component Spacing

```
VERTICAL RHYTHM
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
Between Sections:     48px (xxl)
Between Subsections:  32px (xl)
Between Elements:     16px (m)
Between Related:      8px (s)

PADDING STANDARDS
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
Panel:        24px
Card:         16px
Button:       12px vertical, 24px horizontal
Input:        10px vertical, 12px horizontal
```

---

## 6. Visual Effects

### 6.1 Rift Energy Glow

```css
/* Soft Interactive Glow */
.rift-glow {
  box-shadow: 0 0 12px rgba(77, 166, 255, 0.3),
              0 0 24px rgba(77, 166, 255, 0.15);
  transition: box-shadow 0.3s ease;
}

.rift-glow:hover {
  box-shadow: 0 0 16px rgba(77, 166, 255, 0.5),
              0 0 32px rgba(77, 166, 255, 0.25),
              0 0 48px rgba(77, 166, 255, 0.1);
}

/* Pulsing Danger Glow */
@keyframes danger-pulse {
  0%, 100% { box-shadow: 0 0 8px rgba(255, 107, 107, 0.3); }
  50%      { box-shadow: 0 0 16px rgba(255, 107, 107, 0.6),
                         0 0 32px rgba(255, 107, 107, 0.3); }
}
```

### 6.2 Scan Lines (Subtle CRT Effect)

```css
/* Apply to panels for weathered tech feel */
.scanlines::before {
  content: '';
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: linear-gradient(
    to bottom,
    transparent 50%,
    rgba(0, 0, 0, 0.02) 50%
  );
  background-size: 100% 4px;
  pointer-events: none;
  opacity: 0.3;
}
```

### 6.3 Corner Brackets (Tactical UI Accent)

```
Use corner brackets on focused/selected elements:

┌─────────────┐
│   Element   │
└─────────────┘

Implementation: SVG or border-image
Color: #4da6ff on hover/focus
Width: 2px
Length: 12px per corner
```

### 6.4 Noise Texture

```css
/* Subtle grain for weathered feel */
.texture-overlay::after {
  content: '';
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background-image: url('noise-texture.png');
  opacity: 0.03;
  mix-blend-mode: overlay;
  pointer-events: none;
}
```

---

## 7. Iconography

### 7.1 Icon Style

- **Stroke-based** (not filled) for most UI icons
- **2px stroke weight** at base size
- **24px × 24px** base icon size
- **Rounded corners** (2px radius on strokes)
- **Geometric** construction (favor straight lines and simple curves)
- **Rift glow** on interactive icons

### 7.2 Icon Categories

```
NAVIGATION
  ├─ Menu (hamburger with corner brackets)
  ├─ Back (chevron left)
  ├─ Forward (chevron right)
  └─ Close (X with subtle rift energy)

RESOURCES
  ├─ Health (heart with pulse line)
  ├─ Stamina (lightning bolt)
  ├─ Credits (coin with dimensional rift)
  └─ Materials (stacked boxes)

SKILLS
  ├─ Combat (crossed swords)
  ├─ Survival (campfire)
  ├─ Technical (gear/wrench)
  ├─ Arcane (rift symbol)
  └─ Social (speech bubble)

STATUS
  ├─ Injury (bandage)
  ├─ Buff (up arrow in circle)
  ├─ Debuff (down arrow in circle)
  └─ Warning (triangle exclamation)
```

---

## 8. Animation Principles

### 8.1 Timing

```
INTERACTION SPEEDS
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
Instant:       0ms      (color changes)
Fast:          100ms    (hover states)
Standard:      200ms    (panel transitions)
Moderate:      300ms    (page transitions)
Slow:          500ms    (complex animations)

EASING
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
Default:       cubic-bezier(0.4, 0.0, 0.2, 1)  (ease-in-out)
Enter:         cubic-bezier(0.0, 0.0, 0.2, 1)  (deceleration)
Exit:          cubic-bezier(0.4, 0.0, 1, 1)    (acceleration)
```

### 8.2 State Transitions

```
HOVER
  Duration: 100ms
  Properties: border-color, box-shadow, transform
  Transform: translateY(-2px) for cards/buttons
  
ACTIVE/PRESSED
  Duration: 50ms
  Transform: scale(0.98)
  
FOCUS
  Duration: 200ms
  Properties: box-shadow (glow), border-color
  
DISABLED
  Duration: 150ms
  Properties: opacity, filter (desaturate)
```

### 8.3 Loading States

```
SKELETON LOADER
  Background: linear-gradient shimmer effect
  Colors: #1a1f28 → #2d3542 → #1a1f28
  Duration: 1.5s infinite
  
SPINNER
  Type: Rift energy orbital (particles orbiting center)
  Color: #4da6ff with glow
  Size: 32px standard
  Speed: 2s per rotation
```

---

## 9. Accessibility

### 9.1 Color Contrast

```
WCAG AA Compliance (Minimum)
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
Primary Text (Bleached #e3e8ef on Deep Void #0a0e14):
  Contrast Ratio: 12.5:1 ✓ AAA
  
Secondary Text (Smoke #9ba3b4 on Concrete Gray #1a1f28):
  Contrast Ratio: 6.8:1 ✓ AA
  
Interactive Elements (Stable Rift #4da6ff on Concrete Gray #1a1f28):
  Contrast Ratio: 5.2:1 ✓ AA
```

### 9.2 Focus Indicators

- **Visible focus ring** on all interactive elements
- **Rift glow** indicates focus state
- **Keyboard navigation** supports tab order
- **Skip links** for main navigation

### 9.3 Font Sizing

- **Base 14px** minimum for body text
- **Relative units** (rem) for scalability
- **Line height 1.5** minimum for readability

---

## 10. Character Creation Specific Guidelines

### 10.1 Screen Flow Visual Language

```
PROGRESSION INDICATOR
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
Style: Horizontal stepper with rift energy trail
States:
  Completed:  #4dffb8 (Healing Rift) with checkmark
  Current:    #4da6ff (Stable Rift) with glow
  Upcoming:   #555d6d (Ash) inactive
  
Steps:
  1. Origin
  2. Attributes
  3. Skills
  4. Appearance
  5. Name
```

### 10.2 Selection Cards

```
ORIGIN/BACKGROUND CARDS
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
Size: 280px × 360px
Layout: Image top (180px), content below (180px)

States:
  Default:
    Background: #1a1f28
    Border: 1px solid #3d4451
    
  Hover:
    Border: 1px solid #4da6ff
    Glow: rift energy
    Transform: translateY(-4px)
    
  Selected:
    Border: 2px solid #4da6ff
    Background: rgba(77, 166, 255, 0.05)
    Corner brackets active
```

### 10.3 Stat Allocation

```
ATTRIBUTE SLIDER
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
Track:
  Background: #0a0e14
  Border: 1px solid #3d4451
  Notches: Every integer value
  
Thumb:
  Size: 20px × 20px
  Shape: Diamond (rotated square)
  Border: 2px solid #4da6ff
  Glow on drag
  
Fill:
  Color: gradient #4da6ff to #80c0ff
  Glow: subtle rift energy
```

---

## 11. Implementation Notes

### 11.1 CSS Custom Properties

```css
:root {
  /* Colors */
  --color-void: #0a0e14;
  --color-concrete: #1a1f28;
  --color-steel: #2d3542;
  --color-rust: #3d4451;
  --color-ash: #555d6d;
  --color-dust: #7a8291;
  --color-smoke: #9ba3b4;
  --color-paper: #c5cdd8;
  --color-bleached: #e3e8ef;
  
  --color-rift-stable: #4da6ff;
  --color-rift-active: #80c0ff;
  --color-rift-volatile: #ff6b6b;
  --color-rift-arcane: #d946ff;
  --color-rift-healing: #4dffb8;
  --color-rift-temporal: #ffdb4d;
  
  /* Spacing */
  --space-xs: 4px;
  --space-s: 8px;
  --space-m: 16px;
  --space-l: 24px;
  --space-xl: 32px;
  --space-xxl: 48px;
  
  /* Typography */
  --font-primary: 'IBM Plex Mono', monospace;
  --font-display: 'Rajdhani', sans-serif;
  
  /* Effects */
  --glow-rift: 0 0 12px rgba(77, 166, 255, 0.3);
  --shadow-panel: 0 4px 12px rgba(0, 0, 0, 0.5);
}
```

### 11.2 Component Library Priority

```
Phase 1 (Character Creation):
  ✓ Button
  ✓ Input
  ✓ Card
  ✓ Stepper
  ✓ Slider
  ✓ Panel
  ✓ Tooltip
  
Phase 2 (Gameplay):
  - Resource Bar
  - Combat HUD components
  - Inventory grid
  - Character sheet
```

---

## 12. Reference Images and Inspiration

### 12.1 Visual References

**For Weathered Tech Aesthetic:**
- *Alien* (1979) - Retro-futuristic terminals
- *Blade Runner 2049* - UI design language
- *The Expanse* - Functional spacecraft interfaces

**For Post-Apocalyptic Feel:**
- *Fallout* series - Pip-Boy interface (but less cartoonish)
- *Metro* series - Sparse, functional UI
- *S.T.A.L.K.E.R.* - Environmental integration

**For Rift Energy Effects:**
- *Control* - Dimensional breach visuals
- *Destiny* - Energy weapon effects
- *Warframe* - Void energy aesthetic

### 12.2 Motion Reference

- Subtle glitch effects (1-2 frame displacement on state change)
- Rift energy should "breathe" (slow pulse 3-4 second cycle)
- Scan lines should be barely perceptible (2-3% opacity max)

---

## Appendix: Quick Reference

### Color Variables Quick Copy

```css
/* Paste-ready for prototyping */
--bg-primary: #0a0e14;
--bg-secondary: #1a1f28;
--border-default: #3d4451;
--text-primary: #e3e8ef;
--text-secondary: #9ba3b4;
--interactive: #4da6ff;
--danger: #ff6b6b;
--success: #4dffb8;
```

### Component Checklist

```
[ ] Uses defined color palette
[ ] Typography from type scale
[ ] Spacing from 8px grid
[ ] Accessible focus states
[ ] Rift glow on interactive elements
[ ] Smooth state transitions
[ ] Works on 1920×1080 minimum
```

---

*End of Style Guide v0.1*