# Design Rules for This Project

## Project Design Pattern: ---

## Visual Style

### Color Palette:
- Primary background: #F9FAFB (subtle light gray, used for overall background)
- Surface/Container: #FFFFFF (pure white for cards, sidebars, and content areas)
- Accent: #2563EB (vivid blue, used for active tab underline and interactive highlights)
- Success: #22C55E (green, used in "PUBLISHED" status badge)
- Neutral/Disabled: #E5E7EB (light gray for inactive icons, dividers, and muted elements)
- Text Primary: #111827 (almost black, for main headings and important text)
- Text Secondary: #6B7280 (medium gray for descriptions, secondary text)
- Status/Archived: #9CA3AF (light gray, used in "ARCHIVED" badge)
- Minimal gradients; focus on flat color fields with strong contrast between foreground and background

### Typography & Layout:
- Font Family: Sans-serif, geometric and modern (e.g., Inter or similar)
- Weights: Bold (700) for headings, Medium (500) for subheadings, Regular (400) for body and descriptions
- Hierarchy: Large, bold headings; clear subheadings; small, muted secondary text
- Layout: 2-column structure with vertical sidebar and main content area
- Spacing: Generous padding (24–32px) in containers; consistent vertical rhythm; clear separation between sidebar and main content
- Alignment: Left-aligned for text; centered elements for empty states or icons

### Key Design Elements

#### Card Design:
- Cards: White background (#FFFFFF), subtle rounded corners (8px radius)
- Shadow: Very soft, low-elevation shadow for depth (e.g., rgba(17,24,39,0.03))
- Borders: Minimal or none; separation achieved via spacing
- Hover State: Slight elevation and shadow intensification; pointer cursor
- Visual Hierarchy: Badge/status top left, title bold, description below in muted text

#### Navigation:
- Sidebar: Vertical, left-aligned, light background (#F9FAFB)
- Active State: Filled pill/rounded rectangle behind active item (#E5E7EB), bold text, subtle icon highlight
- Icons: Minimal, line-style, monochrome
- Collapsible/Expandable: Profile dropdown available; no visible collapsible sections in navigation

#### Data Visualization:
- Not present in reference; anticipate minimalist, flat charts with clear axes and accent color highlights if needed

#### Interactive Elements:
- Buttons: Rounded corners, flat fill, primary color for main actions, subtle hover states
- Tabs: Underline active tab with accent blue (#2563EB), non-active tabs in muted text color
- Forms: Borderless or very subtle borders, ample spacing, clear labels
- Micro-interactions: Soft hover transitions, focus rings for accessibility

### Design Philosophy
This interface embodies:
- A clean, modern, and minimalist aesthetic with a focus on clarity and usability
- Flat design with gentle use of elevation for separation, prioritizing content legibility
- Professional, approachable, and neutral tone—suited for productivity and learning scenarios
- User experience goals center on efficiency, intuitive navigation, and reducing cognitive load through ample whitespace and clear visual hierarchy
- Visual strategy emphasizes accessibility, rapid scanning, and reducing distractions for task-oriented users

---

This project follows the "---

## Visual Style

### Color Palette:
- Primary background: #F9FAFB (subtle light gray, used for overall background)
- Surface/Container: #FFFFFF (pure white for cards, sidebars, and content areas)
- Accent: #2563EB (vivid blue, used for active tab underline and interactive highlights)
- Success: #22C55E (green, used in "PUBLISHED" status badge)
- Neutral/Disabled: #E5E7EB (light gray for inactive icons, dividers, and muted elements)
- Text Primary: #111827 (almost black, for main headings and important text)
- Text Secondary: #6B7280 (medium gray for descriptions, secondary text)
- Status/Archived: #9CA3AF (light gray, used in "ARCHIVED" badge)
- Minimal gradients; focus on flat color fields with strong contrast between foreground and background

### Typography & Layout:
- Font Family: Sans-serif, geometric and modern (e.g., Inter or similar)
- Weights: Bold (700) for headings, Medium (500) for subheadings, Regular (400) for body and descriptions
- Hierarchy: Large, bold headings; clear subheadings; small, muted secondary text
- Layout: 2-column structure with vertical sidebar and main content area
- Spacing: Generous padding (24–32px) in containers; consistent vertical rhythm; clear separation between sidebar and main content
- Alignment: Left-aligned for text; centered elements for empty states or icons

### Key Design Elements

#### Card Design:
- Cards: White background (#FFFFFF), subtle rounded corners (8px radius)
- Shadow: Very soft, low-elevation shadow for depth (e.g., rgba(17,24,39,0.03))
- Borders: Minimal or none; separation achieved via spacing
- Hover State: Slight elevation and shadow intensification; pointer cursor
- Visual Hierarchy: Badge/status top left, title bold, description below in muted text

#### Navigation:
- Sidebar: Vertical, left-aligned, light background (#F9FAFB)
- Active State: Filled pill/rounded rectangle behind active item (#E5E7EB), bold text, subtle icon highlight
- Icons: Minimal, line-style, monochrome
- Collapsible/Expandable: Profile dropdown available; no visible collapsible sections in navigation

#### Data Visualization:
- Not present in reference; anticipate minimalist, flat charts with clear axes and accent color highlights if needed

#### Interactive Elements:
- Buttons: Rounded corners, flat fill, primary color for main actions, subtle hover states
- Tabs: Underline active tab with accent blue (#2563EB), non-active tabs in muted text color
- Forms: Borderless or very subtle borders, ample spacing, clear labels
- Micro-interactions: Soft hover transitions, focus rings for accessibility

### Design Philosophy
This interface embodies:
- A clean, modern, and minimalist aesthetic with a focus on clarity and usability
- Flat design with gentle use of elevation for separation, prioritizing content legibility
- Professional, approachable, and neutral tone—suited for productivity and learning scenarios
- User experience goals center on efficiency, intuitive navigation, and reducing cognitive load through ample whitespace and clear visual hierarchy
- Visual strategy emphasizes accessibility, rapid scanning, and reducing distractions for task-oriented users

---" design pattern.
All design decisions should align with this pattern's best practices.

## General Design Principles

## Color & Visual Design

### Color Palettes
**Create depth with gradients:**
- Primary gradient (not just solid primary color)
- Subtle background gradients
- Gradient text for headings
- Gradient borders on cards
- Dark mode with elevated surfaces

**Color usage:**
- 60-30-10 rule (dominant, secondary, accent)
- Consistent semantic colors (success, warning, error)
- Accessible contrast ratios (WCAG AA minimum)
- Test colors in both light and dark modes

### Typography
**Create hierarchy through contrast:**
- Large, bold headings (48-72px for heroes)
- Clear size differences between levels
- Variable font weights (300, 400, 600, 700)
- Letter spacing for small caps
- Line height 1.5-1.7 for body text
- Inter, Poppins, or DM Sans for modern feel

### Shadows & Depth
**Layer UI elements:**
- Multi-layer shadows for realistic depth
- Colored shadows matching element color
- Elevated states on hover
- Neumorphism for special elements (sparingly)
- Adjust shadow intensity based on theme (lighter in dark mode)

---

---

## Interactions & Micro-animations

### Button Interactions
**Every button should react:**
- Scale slightly on hover (1.02-1.05)
- Lift with shadow on hover
- Ripple effect on click
- Loading state with spinner or progress
- Disabled state clearly visible
- Success state with checkmark animation

### Card Interactions
**Make cards feel alive:**
- Lift on hover with increased shadow
- Subtle border glow on hover
- Tilt effect following mouse (3D transform)
- Smooth transitions (200-300ms)
- Click feedback for interactive cards

### Form Interactions
**Guide users through forms:**
- Input focus states with border color change
- Floating labels that animate up
- Real-time validation with inline messages
- Success checkmarks for valid inputs
- Error states with shake animation
- Password strength indicators
- Character count for text areas

### Page Transitions
**Smooth between views:**
- Fade + slide for page changes
- Skeleton loaders during data fetch
- Optimistic UI updates
- Stagger animations for lists
- Route transition animations

---

---

## Mobile Responsiveness

### Mobile-First Approach
**Design for mobile, enhance for desktop:**
- Touch targets minimum 44x44px
- Generous padding and spacing
- Sticky bottom navigation on mobile
- Collapsible sections for long content
- Swipeable cards and galleries
- Pull-to-refresh where appropriate

### Responsive Patterns
**Adapt layouts intelligently:**
- Hamburger menu → full nav bar
- Card grid → stack on mobile
- Sidebar → drawer
- Multi-column → single column
- Data tables → card list
- Hide/show elements based on viewport

---

---

## Loading & Empty States

### Loading States
**Never leave users wondering:**
- Skeleton screens matching content layout
- Progress bars for known durations
- Animated placeholders
- Spinners only for short waits (<3s)
- Stagger loading for multiple elements
- Shimmer effects on skeletons

### Empty States
**Make empty states helpful:**
- Illustrations or icons
- Helpful copy explaining why it's empty
- Clear CTA to add first item
- Examples or suggestions
- No "no data" text alone

---

---

## Consistency Rules

### Maintain Consistency
**What should stay consistent:**
- Spacing scale (4px, 8px, 16px, 24px, 32px, 48px, 64px)
- Border radius values
- Animation timing (200ms, 300ms, 500ms)
- Color system (primary, secondary, accent, neutrals)
- Typography scale
- Icon style (outline vs filled)
- Button styles across the app
- Form element styles

### What Can Vary
**Project-specific customization:**
- Color palette (different colors, same system)
- Layout creativity (grids, asymmetry)
- Illustration style
- Animation personality
- Feature-specific interactions
- Hero section design
- Card styling variations
- Background patterns or textures

---

---

## Technical Excellence

### Performance
- Optimize images (WebP, lazy loading)
- Code splitting for faster loads
- Debounce search inputs
- Virtualize long lists
- Minimize re-renders
- Use proper memoization

### Accessibility
- Keyboard navigation throughout
- ARIA labels where needed
- Focus indicators visible
- Screen reader friendly
- Sufficient color contrast (both themes)
- Respect reduced motion preferences

---

---

## Key Principles

1. **Be Bold** - Don't be afraid to try unique layouts and interactions
2. **Be Consistent** - Use the same patterns for similar functions
3. **Be Responsive** - Design works beautifully on all devices
4. **Be Fast** - Animations are smooth, loading is quick
5. **Be Accessible** - Everyone can use what you build
6. **Be Modern** - Use current design trends and technologies
7. **Be Unique** - Each project should have its own personality
8. **Be Intuitive** - Users shouldn't need instructions
9. **Be Themeable** - Support both dark and light modes seamlessly

---

