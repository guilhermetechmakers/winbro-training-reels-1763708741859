# Modern Design Best Practices

## Philosophy

Create unique, memorable experiences while maintaining consistency through modern design principles. Every project should feel distinct yet professional, innovative yet intuitive.

---

## Landing Pages & Marketing Sites

### Hero Sections
**Go beyond static backgrounds:**
- Animated gradients with subtle movement
- Particle systems or geometric shapes floating
- Interactive canvas backgrounds (Three.js, WebGL)
- Video backgrounds with proper fallbacks
- Parallax scrolling effects
- Gradient mesh animations
- Morphing blob animations


### Layout Patterns
**Use modern grid systems:**
- Bento grids (asymmetric card layouts)
- Masonry layouts for varied content
- Feature sections with diagonal cuts or curves
- Overlapping elements with proper z-index
- Split-screen designs with scroll-triggered reveals

**Avoid:** Traditional 3-column equal grids

### Scroll Animations
**Engage users as they scroll:**
- Fade-in and slide-up animations for sections
- Scroll-triggered parallax effects
- Progress indicators for long pages
- Sticky elements that transform on scroll
- Horizontal scroll sections for portfolios
- Text reveal animations (word by word, letter by letter)
- Number counters animating into view

**Avoid:** Static pages with no scroll interaction

### Call-to-Action Areas
**Make CTAs impossible to miss:**
- Gradient buttons with hover effects
- Floating action buttons with micro-interactions
- Animated borders or glowing effects
- Scale/lift on hover
- Interactive elements that respond to mouse position
- Pulsing indicators for primary actions

---

## Dashboard Applications

### Layout Structure
**Always use collapsible side navigation:**
- Sidebar that can collapse to icons only
- Smooth transition animations between states
- Persistent navigation state (remember user preference)
- Mobile: drawer that slides in/out
- Desktop: sidebar with expand/collapse toggle
- Icons visible even when collapsed

**Structure:**
```
/dashboard (layout wrapper with sidebar)
  /dashboard/overview
  /dashboard/analytics
  /dashboard/settings
  /dashboard/users
  /dashboard/projects
```

All dashboard pages should be nested inside the dashboard layout, not separate routes.

### Data Tables
**Modern table design:**
- Sticky headers on scroll
- Row hover states with subtle elevation
- Sortable columns with clear indicators
- Pagination with items-per-page control
- Search/filter with instant feedback
- Selection checkboxes with bulk actions
- Responsive: cards on mobile, table on desktop
- Loading skeletons, not spinners
- Empty states with illustrations or helpful text

**Use modern table libraries:**
- TanStack Table (React Table v8)
- AG Grid for complex data
- Data Grid from MUI (if using MUI)

### Charts & Visualizations
**Use the latest charting libraries:**
- Recharts (for React, simple charts)
- Chart.js v4 (versatile, well-maintained)
- Apache ECharts (advanced, interactive)
- D3.js (custom, complex visualizations)
- Tremor (for dashboards, built on Recharts)

**Chart best practices:**
- Animated transitions when data changes
- Interactive tooltips with detailed info
- Responsive sizing
- Color scheme matching design system
- Legend placement that doesn't obstruct data
- Loading states while fetching data

### Dashboard Cards
**Metric cards should stand out:**
- Gradient backgrounds or colored accents
- Trend indicators (↑ ↓ with color coding)
- Sparkline charts for historical data
- Hover effects revealing more detail
- Icon representing the metric
- Comparison to previous period

---

## Color & Visual Design

### Color Palettes
**Create depth with gradients:**
- Primary gradient (not just solid primary color)
- Subtle background gradients
- Gradient text for headings
- Gradient borders on cards
- Elevated surfaces for depth

**Color usage:**
- 60-30-10 rule (dominant, secondary, accent)
- Consistent semantic colors (success, warning, error)
- Accessible contrast ratios (WCAG AA minimum)

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

## Unique Elements to Stand Out

### Distinctive Features
**Add personality:**
- Custom cursor effects on landing pages
- Animated page numbers or section indicators
- Unusual hover effects (magnification, distortion)
- Custom scrollbars
- Glassmorphism for overlays
- Animated SVG icons
- Typewriter effects for hero text
- Confetti or celebration animations for actions

### Interactive Elements
**Engage users:**
- Drag-and-drop interfaces
- Sliders and range controls
- Toggle switches with animations
- Progress steps with animations
- Expandable/collapsible sections
- Tabs with slide indicators
- Image comparison sliders
- Interactive demos or playgrounds

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
- Sufficient color contrast
- Respect reduced motion preferences

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


---

# Project-Specific Customizations

**IMPORTANT: This section contains the specific design requirements for THIS project. The guidelines above are universal best practices - these customizations below take precedence for project-specific decisions.**

## User Design Requirements

# Winbro Training Reels - Development Blueprint

Winbro Training Reels is a web-first micro-learning platform for manufacturing: short 20–30s video “reels” capture machine setup, tooling, maintenance and troubleshooting. The system provides tenant-scoped libraries, searchable time-synced transcripts, a course-builder with quizzes and certificates, subscription billing, admin moderation, offline playback for registered devices, and analytics to measure adoption and ROI.

## 1. Pages (UI Screens)

- Landing Page
  - Purpose: Marketing, lead capture, demo/sample access, plan overview.
  - Key sections/components: Hero (headline, subhead, primary CTA, watch sample reel), Feature highlights, Customer logos/testimonials, Plans & Pricing cards, Sample reel modal (20–30s HLS player), Footer (About, Help, Privacy, Terms, Contact).

- Login / Signup
  - Purpose: Unified auth entry for users and trial signup.
  - Key sections/components: Email/password form, SSO buttons (SAML/OIDC, Google, Microsoft), Signup fields (company, name, role), Terms & privacy checkbox, Forgot password link, Error validations.

- Email Verification
  - Purpose: Confirm email ownership after signup.
  - Key sections/components: Success/failure states, Resend verification button, Continue to dashboard/profile CTA.

- Password Reset
  - Purpose: Secure password recovery.
  - Key sections/components: Request email form, Reset form (new password + confirm, strength meter), Success message & redirect.

- User Dashboard
  - Purpose: Personalized landing showing assigned libraries, recommendations, progress.
  - Key sections/components: Top nav (global search, notifications, profile), Library cards (customer-specific), Recent activity list, Recommended reels carousel, Course progress widgets, Quick upload/request button, Notifications panel.

- Content Library / Browse
  - Purpose: Discover and filter reels.
  - Key sections/components: NLP search bar (transcript-aware), Filter panel (tags, machine model, tooling, skill level, customer, date, duration), Results grid/list (thumbnail, title, tags, machine, duration, actions), Customer scope selector, Pagination/infinite scroll, Sort options.

- Video Player / Reel Detail
  - Purpose: Watch reel, review metadata, use actions (add to course, download if permitted).
  - Key sections/components: Adaptive HLS player (quality selector, offline download), Metadata panel (title, duration, machine, tooling, uploader, date), Time-synced transcript viewer/editor button, Tags & related reels carousel, Action buttons (Add to Course, Favorite, Share, Request retake), Comments/annotations (per-customer opt-in), Permission indicator.

- Manage Content / Edit Reel
  - Purpose: Edit metadata, manage versions, reprocess, and edit transcript.
  - Key sections/components: Editable metadata form with change history, Version history & rollback controls, Reprocess/transcode action (start/cancel/status), Time-aligned transcript editor with seek-on-click and manual adjust, Permission/visibility controls (tenant/public/internal), Save/draft/publish workflows.

- Create / Upload Reel
  - Purpose: Upload and submit reels with required metadata.
  - Key sections/components: Drag-and-drop resumable uploader with max duration check, Client-side compression hints, Metadata template (title, description, machine, tooling, process step, tags, skill level, language, customer scope), Auto-transcription opt-in toggle, Submit for moderation/publish buttons, Upload progress and validation.

- Course Builder
  - Purpose: Assemble reels into courses with quizzes and publishing controls.
  - Key sections/components: Course metadata form (title, description, target roles, prerequisites, est. time), Drag-and-drop module list (reels), Quiz editor per module (MCQ, multi-select, timed), Preview/Run-through mode, Publish settings (visibility, enrollment method, expiration), Save draft / Publish / Archive.

- Quiz & Certification
  - Purpose: Deliver assessments and generate certificates.
  - Key sections/components: Quiz UI (single/multi-select, timer, feedback), Progress & score summary, Certificate generation modal (preview, download PDF), Retry/review options, Audit trail viewer for attempts.

- Checkout / Payment
  - Purpose: Subscription purchase and upgrade for Customer Admins.
  - Key sections/components: Plan selector and summary, Billing details form (company, address, tax ID), Payment form (Stripe card input, saved methods), Promo code field & validation, Invoice preview, Terms checkbox, Complete purchase CTA, Success/receipt screen.

- Order / Transaction History
  - Purpose: View and manage invoices and payment history.
  - Key sections/components: Transactions table (date, plan, amount, status, invoice link), Download PDF, Filter by date/status, Request refund button (internal workflow), Billing contacts & saved methods.

- Admin Dashboard
  - Purpose: Winbro admin overview for customers, moderation, analytics.
  - Key sections/components: KPIs (active customers, videos uploaded, weekly views), Moderation queue (approve/reject/feedback), Customer provisioning UI, Support tickets & activity logs, System health widgets.

- Admin - User Management
  - Purpose: Manage users, roles, invites, bulk import.
  - Key sections/components: Filterable user list, User detail modal (role change, deactivate, reset password, activity), Invite user flow, Bulk CSV import, Role & permission editor.

- Analytics & Reports
  - Purpose: Usage metrics and custom reports for admins and customers.
  - Key sections/components: Prebuilt dashboards (views by machine model, completion rates, avg watch time), Custom report builder, Export (CSV/PDF), Scheduled report setup, Anomaly alerts config.

- Settings & Preferences
  - Purpose: Organization-level and user-level settings.
  - Key sections/components: Organization details (logo, timezone), Subscription & billing section, Integrations (SSO, LMS export, API tokens), Content policies, Notification templates, Device management.

- About / Help
  - Purpose: Support center and learning resources.
  - Key sections/components: Searchable FAQ, Guides, Contact/support form (attachments), Video tutorials, Onboarding checklist, Release notes & system status.

- Privacy Policy, Terms of Service, Cookie Policy
  - Purpose: Legal/compliance pages and consent management.
  - Key sections/components: Policy texts, Data subject request links, Cookie categories with toggles, Save preferences button, Accept checkbox where required.

- 404 Not Found & 500 Server Error
  - Purpose: Error handling and guidance.
  - Key sections/components: Friendly message, search box, link to dashboard/landing, Support contact CTA, Retry button (500), Request ID for troubleshooting.

- Loading / Success / Empty States
  - Purpose: Standard UX states across the app.
  - Key sections/components: Skeleton loaders for lists/thumbnails, Success toasts/modals, Empty state illustrations and CTAs, Retry/error affordances.

## 2. Features

- User Authentication & Session Management
  - Technical details: Email/password with bcrypt/argon2 hashed passwords; SSO via SAML/OIDC; JWT access tokens + refresh tokens (httpOnly secure cookie preferred); session revocation and device listing; rate limiting and account lockout.
  - Implementation notes: Use Passport.js / Auth0 / custom OIDC integration for enterprise SSO, store refresh tokens encrypted, expose session management UI listing devices.

- Two-Factor Authentication (2FA)
  - Technical details: TOTP (RFC6238) QR provisioning; optional SMS OTP via provider; recovery codes.
  - Implementation notes: Enforce 2FA for admin roles; save backup codes hashed; throttle SMS sends.

- Resumable Video Upload & Processing
  - Technical details: Use tus protocol or chunked multipart resumable upload to object storage (S3 multipart with presigned URLs); server-side validation (duration / size); virus scanning (ClamAV or cloud scanning).
  - Implementation notes: Upload service enqueues transcode job; worker uses FFmpeg or cloud MediaConvert to produce HLS renditions, thumbnails, waveform; store originals and derivatives with versioned keys and metadata.

- Automatic Transcription & Transcript UI Components
  - Technical details: Speech-to-text (Google/AWS/Whisper) produce timestamped transcripts with confidence and speaker labels if possible.
  - Implementation notes: Transcript editor UI must support time-aligned editing (word-level timestamps), click-to-seek, live seek while editing, diff/change history per edit, save-as-version, and expose API for re-transcribe with alternate models.

- Structured Metadata & Tagging
  - Technical details: Normalized DB tables for machine models, tooling, process steps, tags; tenant-scoped relationships; required-field enforcement.
  - Implementation notes: Provide NLP-driven suggestions for tags and metadata extracted from transcript and title; metadata version history on edit.

- Search & Filter (NLP + Transcription Indexing)
  - Technical details: Use Elasticsearch/OpenSearch (or Algolia) to index titles, transcripts, tags, and normalized metadata; support fuzzy matching, synonyms, phrase boosts, and transcript timestamped hit mapping.
  - Implementation notes: Expose highlight snippets and timestamped search results; faceted aggregations for filters; realtime index updates on publish.

- Adaptive Video Player & Offline Downloads
  - Technical details: HLS with multiple renditions; CDN-backed segments; player with quality selector, captions (webvtt from transcripts), time-synced transcript pane that seeks; offline download package encryption and token-based playback for registered devices.
  - Implementation notes: Use Shaka/Video.js with HLS plugin; generate signed download packages per device with expiration and DRM-like token; playback analytics hooks.

- Course Builder & Quiz Engine
  - Technical details: Course schema with ordered modules, per-module quizzes; question types (single/multi-select), timed attempts, pass thresholds; certificate generation to PDF with verifiable ID (signed token).
  - Implementation notes: Server-side evaluation with attempt audit trail; certificate PDF generation via server-side templating (HTML-to-PDF) and include QR or verification URL.

- Notifications & Email
  - Technical details: Transactional email service (SendGrid/SES/Mailgun); templated messages for invites, verification, course invites, digest and billing; in-app notification center stored in DB.
  - Implementation notes: Retry queue for failed deliveries; user preferences UI.

- Subscription Billing & Payment
  - Technical details: Stripe integration for subscriptions, promo codes, invoices; webhook handling for lifecycle events; invoice PDF retrieval and storage link.
  - Implementation notes: Map Stripe customers to tenant records; allow plan upgrades/downgrades and proration; admin UI for refund requests that trigger internal workflow.

- Admin Tools & Content Moderation
  - Technical details: RBAC with scoped permissions; moderation queue service with approve/reject actions; audit logs and export.
  - Implementation notes: Moderation decisions trigger indexing/publish pipeline; feedback messages to uploader; role enforcement across UI/API.

- Analytics & Reporting
  - Technical details: Event ingestion for plays, seeks, completions, quiz attempts sent to analytics pipeline (Kafka/SQS); aggregated metrics in OLAP/Redshift/BQ; dashboards served via cached endpoints.
  - Implementation notes: Precompute per-tenant metrics nightly and provide near-real-time aggregates for key KPIs; exportable reports and scheduled emails.

- Security & Compliance
  - Technical details: Tenant isolation via row-level security or separate namespaces; TLS everywhere; encryption at rest for storage; audit logging to SIEM; data export/delete workflows for DSRs.
  - Implementation notes: Regular pen tests; hardened RBAC for admin actions; content access tokens for signed playback.

- Performance, Caching & CDN
  - Technical details: Use CDN (CloudFront/Cloudflare) for HLS and static assets; CDN signed URLs; API-level caching (Redis) for catalogs; background workers for heavy tasks.
  - Implementation notes: Cache invalidation on publish events; instrument SLOs and alerts.

- UI Component Kit (Design System)
  - Technical details: Build reusable components (buttons, forms, modals, toasts, skeletons, card, transcript viewer/editor, uploader, player wrapper) as a component library (React + TypeScript + Storybook).
  - Implementation notes: Enforce color palette, typography, spacing; accessible components with keyboard and screen reader support; tokens for spacing and color.

- Asset Deliverables
  - Transcript UI Components: time-synced viewer, editor, and export (SRT/WebVTT).
  - UI Component Kit: Buttons, inputs, selects, modals, toasts, skeletons, cards, icons, chips, badges.
  - Marketing Sample Reels: 3 demo 20–30s reels.
  - Certificate Template: Branded PDF template with dynamic fields and QR ID.
  - Brand Logo: Primary/secondary variants and usage.
  - Illustration Set & Icon Set: Onboarding and empty-state assets; SVG icon library.

## 3. User Journeys

- Guest / Prospect
  1. Land on Landing Page.
  2. Watch Sample Reel in modal.
  3. Click Request Demo / Start Trial.
  4. Fill demo/trial form or signup (signup leads to email verification).
  5. Receive trial access or engage with Sales.

- Customer Admin (after purchase/provision)
  1. Login (SSO or email/password).
  2. Verify billing/subscription via Checkout flow.
  3. Configure organization (logo, billing info, SSO setup).
  4. Invite users (trainers, operators); assign roles.
  5. Access provisioned customer library; request additional Winbro-managed content if needed.
  6. Monitor usage via Analytics; export invoices/history.

- Trainer / Content Creator
  1. Login and access Create / Upload Reel.
  2. Upload reel (resumable), fill required metadata, enable auto-transcription, submit for moderation.
  3. Receive moderation feedback; edit metadata or re-upload if requested.
  4. Approved reel appears in library; add to Course Builder.
  5. Assemble course, add quizzes, preview, and publish to target audience.
  6. Track course completions and issue certificates.

- Operator / End User
  1. Login or access via device.
  2. Use global search to find micro-reel (transcript search or filters).
  3. Play reel, use transcript click-to-seek, optionally download for offline if permitted.
  4. Enroll in assigned course, take quizzes, pass and download certificate.
  5. Provide feedback or request retake/edit of a reel.

- Winbro Admin
  1. Login to Admin Dashboard.
  2. Review moderation queue and approve/reject uploads.
  3. Provision customer libraries and map content to customer purchases.
  4. Manage subscriptions, support tickets, and platform analytics.
  5. Run scheduled reports and coordinate managed content production.

- Billing / Checkout Flow (Customer Admin)
  1. Choose plan on pricing page or upgrade from settings.
  2. Fill billing/company info and card details, apply promo code.
  3. Review invoice preview, accept terms, and submit payment.
  4. Webhook from Stripe confirms subscription; tenant provisioned and success email sent.

## 4. UI Guide

- Layout
  - Two-column layout: left vertical sidebar (navigation) and main content area.
  - Sidebar width: ~280px; content padding: 24–32px.
  - Use cards (#FFFFFF) with 8px radius and soft shadow (rgba(17,24,39,0.03)).

- Navigation
  - Sidebar items: icon + label; active state uses pill background (#E5E7EB) and bold text.
  - Top nav: global search (center-left), notifications, profile dropdown (right).

- Buttons & Controls
  - Primary button: filled (#2563EB) with white text, rounded corners.
  - Secondary: outline or ghost with muted text.
  - Disabled: use Neutral/Disabled #E5E7EB for backgrounds and #9CA3AF for text.

- Forms
  - Borderless or 1px subtle border in #E5E7EB; labels use Text Secondary #6B7280; input text #111827.
  - Spacing: 16px vertical spacing between fields; 24–32px padding in form cards.

- Cards & Lists
  - Card header: left-aligned status badge (PUBLISHED: #22C55E, ARCHIVED: #9CA3AF).
  - Hover: slight elevation and stronger shadow; pointer cursor.
  - List rows: use subtle dividers in #E5E7EB.

- Transcript Viewer / Editor (Component specifics)
  - Layout: left-side player (or top on mobile), right-side transcript pane (or collapsible below player).
  - Transcript lines: word-level or phrase-level timestamps; clicking a timestamp seeks player to exact time.
  - Highlighting: active playback segment highlighted in Accent #2563EB background with white or Text Primary.
  - Editing mode: inline edit tokens with validation and save/undo controls; show confidence scores and allow timestamp drift correction with +/- controls.
  - Versioning: save creates a new transcript version and records editor, timestamp, and change note.

- Video Player
  - Controls: play/pause, scrub bar, quality selector, captions toggle, download (conditional), share.
  - Captions: WebVTT generated from transcripts, toggled via CC button.
  - Mobile: ensure large touch targets and simplified UI.

- Accessibility
  - Focus rings on interactive elements (high contrast).
  - Proper aria labels for player controls, uploader, and transcript editor.
  - Color contrast meets WCAG AA for text and interactive elements.

- Icons & Illustrations
  - Use minimal line-style monochrome icons; active icon highlights use Accent #2563EB.
  - Empty-state illustrations use brand color accents and light neutral backgrounds.

- Micro-interactions
  - Soft hover transitions (150–200ms), snackbars for success/errors, optimistic UI for quick interactions (e.g., favoriting), and clear progress indicators for uploads and transcode jobs.

Implementation Notes:
- Build component library first (Storybook) to ensure consistent visuals and reusability.
- All pages and components must adhere exactly to the provided color palette, typography, spacing, and visual style.
- After each development step, verify against this blueprint — ensure functionality, accessibility, and design system consistency before moving forward.

Instructions to AI Development Tool:
After every development step, refer back to this blueprint to ensure correct implementation. Verify all features and pages are built according to specifications before completing the project. Pay special attention to the UI Guide section and ensure all visual elements follow the design system exactly.

## Implementation Notes

When implementing this project:

1. **Follow Universal Guidelines**: Use the design best practices documented above as your foundation
2. **Apply Project Customizations**: Implement the specific design requirements stated in the "User Design Requirements" section
3. **Priority Order**: Project-specific requirements override universal guidelines when there's a conflict
4. **Color System**: Extract and implement color values as CSS custom properties in RGB format
5. **Typography**: Define font families, sizes, and weights based on specifications
6. **Spacing**: Establish consistent spacing scale following the design system
7. **Components**: Style all Shadcn components to match the design aesthetic
8. **Animations**: Use Motion library for transitions matching the design personality
9. **Responsive Design**: Ensure mobile-first responsive implementation

## Implementation Checklist

- [ ] Review universal design guidelines above
- [ ] Extract project-specific color palette and define CSS variables
- [ ] Configure Tailwind theme with custom colors
- [ ] Set up typography system (fonts, sizes, weights)
- [ ] Define spacing and sizing scales
- [ ] Create component variants matching design
- [ ] Implement responsive breakpoints
- [ ] Add animations and transitions
- [ ] Ensure accessibility standards
- [ ] Validate against user design requirements

---

**Remember: Always reference this file for design decisions. Do not use generic or placeholder designs.**
