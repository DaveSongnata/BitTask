# AI Asset Generation Prompts for BitTask

Use these prompts with NanoBanana or similar pixel art AI generators to create assets for BitTask.

---

## App Icons

### Main App Icon (192x192, 512x512)

```
Pixel art app icon for a todo/task manager app called "BitTask".
Style: 8-bit retro game aesthetic
Color palette: SLSO8 (#ffecd6, #ffd4a3, #ffaa5e, #d08159, #8d697a, #544e68, #203c56, #0d2b45)
Subject: A cute pixel character holding a checklist or clipboard
Background: Solid color from palette (#0d2b45 dark blue)
Resolution: 192x192 pixels (also need 512x512)
Format: PNG with transparency
Features:
- Clean pixel edges, no anti-aliasing
- High contrast for visibility at small sizes
- Centered composition
- Rounded corners optional (iOS will mask)
```

### Maskable Icon (512x512 with safe zone)

```
Same as main icon but:
- 80% of the icon should be within the center safe zone
- Extra padding around edges (20% border)
- Background fills entire square
- No transparency - use solid background color
```

---

## Welcome Screen Sprite Sheet

### Animated Character (32x32 frames, 4 frames)

```
Pixel art sprite sheet for welcome screen animation.
Style: 8-bit retro game character
Color palette: SLSO8 (#ffecd6, #ffd4a3, #ffaa5e, #d08159, #8d697a, #544e68, #203c56, #0d2b45)
Subject: Cute pixel mascot character (small robot, creature, or humanoid)
Animation: Idle bounce/wave (4 frames)
Resolution: 32x32 pixels per frame
Layout: Horizontal strip (128x32 total)
Format: PNG with transparency
Features:
- Simple, friendly design
- Clear silhouette
- Subtle idle animation (bounce up/down or wave)
- No more than 5-6 colors from palette
```

---

## UI Buttons

### Button States (24x24, 3 states)

```
Pixel art button sprites for UI.
Style: 8-bit retro game UI
Color palette: SLSO8
States needed (each 24x24):
1. Normal: Primary color (#ffaa5e) with border
2. Hover: Slightly brighter, raised shadow
3. Active/Pressed: Darker, inset/pressed look
Format: PNG with transparency
Features:
- 4px pixel border
- Pixel-perfect edges
- Consistent corner treatment
- Visible state differences
```

---

## Task Priority Icons

### Priority Badges (16x16 each)

```
Pixel art priority indicator icons.
Style: 8-bit badge/tag
Resolution: 16x16 pixels each
Icons needed:
1. Low Priority: Green (#5a9a4e) - down arrow or leaf
2. Medium Priority: Orange (#ffaa5e) - equals sign or dash
3. High Priority: Red (#c24a4a) - exclamation mark or up arrow
Format: PNG with transparency
Features:
- Simple, recognizable shapes
- High contrast
- Works on both light and dark backgrounds
```

---

## Attachment Type Icons

### File Type Icons (24x24 each)

```
Pixel art file type icons for attachments.
Style: 8-bit file icons
Color palette: SLSO8
Resolution: 24x24 pixels each
Icons needed:
1. Image: Simple picture/landscape in frame
2. Audio: Musical note or speaker
3. PDF: Document with "PDF" text or page icon
4. Link: Chain link or external arrow
Format: PNG with transparency
Features:
- Clear silhouettes
- Consistent style across all icons
- Works on pixel card backgrounds
```

---

## Logo Wordmark

### BitTask Text Logo (128x32)

```
Pixel art text logo "BitTask"
Style: 8-bit pixel font, retro game title
Color palette: Primary colors from SLSO8 (#ffaa5e, #0d2b45)
Resolution: 128x32 pixels
Format: PNG with transparency
Features:
- Clean pixel font (like "Press Start 2P" style)
- Optional: small pixel decoration (checkbox, star)
- Good contrast for headers
- Works on both light and dark backgrounds
```

---

## Empty State Illustrations

### No Tasks (64x64)

```
Pixel art illustration for empty task list.
Style: 8-bit scene
Color palette: SLSO8
Resolution: 64x64 pixels
Subject: Empty clipboard, question mark, or relaxed character
Mood: Friendly, encouraging
Format: PNG with transparency
```

### Offline Mode (64x64)

```
Pixel art illustration for offline state.
Style: 8-bit scene
Color palette: SLSO8
Resolution: 64x64 pixels
Subject: Cloud with X or disconnected signal
Mood: Informative, not alarming
Format: PNG with transparency
```

---

## Favicon

### Browser Favicon (32x32, 16x16)

```
Pixel art favicon for browser tab.
Style: Simplified version of app icon
Color palette: SLSO8
Resolution: 32x32 and 16x16 pixels
Subject: "B" letter or simplified mascot
Format: PNG and ICO
Features:
- Recognizable at very small sizes
- High contrast
- Simple shapes
```

---

## Export Specifications

### File Formats
- **PNG**: For all icons and sprites (lossless, transparency support)
- **WebP**: For optimized web delivery (generate from PNG)
- **ICO**: For favicon only

### Resolution Guidelines
- 192x192: PWA icon (required)
- 512x512: PWA splash/install (required)
- 32x32: UI elements, favicon
- 24x24: Buttons, small icons
- 16x16: Inline icons, badges

### Color Accuracy
Ensure colors match SLSO8 palette exactly:
| Index | Hex Code | Usage |
|-------|----------|-------|
| 0 | #ffecd6 | Light background |
| 1 | #ffd4a3 | Light accent |
| 2 | #ffaa5e | Primary/CTA |
| 3 | #d08159 | Secondary |
| 4 | #8d697a | Muted text |
| 5 | #544e68 | Borders |
| 6 | #203c56 | Dark elements |
| 7 | #0d2b45 | Dark background |

---

## Asset Replacement Instructions

1. Generate assets using prompts above
2. Export in specified resolutions
3. Place files in `/src/assets/pixel/` directories:
   - `icons/` - App icons, file type icons
   - `sprites/` - Animated sprite sheets
   - `frames/` - Individual animation frames
4. Update `public/icons/` with PWA icons
5. Run build to verify assets are included

## Thumbnail Generation

For attachments, thumbnails are generated automatically by the app.
Maximum dimensions: 150x150 pixels
Format: WebP at 70% quality
