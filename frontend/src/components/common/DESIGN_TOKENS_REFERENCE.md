/**
 * ═══════════════════════════════════════════════════════════════════════════
 * DESIGN TOKENS & SYSTEM REFERENCE
 * Complete color, spacing, and typography scale
 * ═══════════════════════════════════════════════════════════════════════════
 */

// ════════════════════════════════════════════════════════════════════════════
// COLOR PALETTE
// ════════════════════════════════════════════════════════════════════════════

/**
 * PRIMARY ACCENT — Indigo
 * Used for: Buttons, links, focus states, active selections
 */
Primary: {
  50: #f0f4ff,    // Lightest background
  100: #e0e7ff,   // Light background
  500: #6366f1,   // Primary action
  600: #4f46e5,   // Hover state
  700: #4338ca,   // Active state
}

/**
 * SEMANTIC COLORS
 */
Success: {
  50: #f0fdf4,    // Light background
  500: #16a34a,   // Primary
  600: #15803d,   // Hover
  700: #166534,   // Active
}

Danger: {
  50: #fef2f2,    // Light background
  500: #dc2626,   // Primary (destructive)
  600: #b91c1c,   // Hover
  700: #991b1b,   // Active
}

Warning: {
  50: #fffbeb,    // Light background
  500: #d97706,   // Primary
  600: #b45309,   // Hover
}

Info: {
  50: #eff6ff,    // Light background
  500: #2563eb,   // Primary
  600: #1d4ed8,   // Hover
}

/**
 * NEUTRAL PALETTE — Slate (used for text, backgrounds, borders)
 * Light mode: Darker slate for text
 * Dark mode: Lighter slate for text
 */
Slate_Light: {
  50: #f8fafc,    // Page background
  100: #f1f5f9,   // Panel background
  200: #e2e8f0,   // Border subtle
  300: #cbd5e1,   // Border default
  400: #94a3b8,   // Text secondary
  500: #64748b,   // Text tertiary
  600: #475569,   // Text secondary
  700: #334155,   // Text primary (button labels)
  900: #0f172a,   // Deep text
}

Slate_Dark: {
  50: #f8fafc,    // Not used in dark mode
  600: #475569,   // Muted text
  700: #334155,   // Secondary text
  800: #1e293b,   // Elevated surface
  900: #0f172a,   // Page background
}

// ════════════════════════════════════════════════════════════════════════════
// SPACING SCALE
// ════════════════════════════════════════════════════════════════════════════

/**
 * BASE UNIT: 4px
 * All spacing is a multiple of 4px
 */
Spacing: {
  0: 0,       // 0px
  1: 4px,     // xs - Used for: gaps between icon + text
  2: 8px,     // sm - Used for: between adjacent elements
  3: 12px,    // md - Used for: button padding, form fields
  4: 16px,    // base - Used for: card padding, field spacing
  6: 24px,    // lg - Used for: section spacing
  8: 32px,    // xl - Used for: major layout spacing
  12: 48px,   // 2xl - Used for: page sections
}

/**
 * BUTTON PADDING EXAMPLES
 * Small:  px-2.5 py-1.5 → 10px × 6px
 * Medium: px-3 py-2     → 12px × 8px (default)
 * Large:  px-4 py-2.5   → 16px × 10px
 */

/**
 * INPUT PADDING
 * Standard: px-3 py-2.5 → 12px × 10px
 * Search:   px-3 py-2 pl-9 → with icon space
 */

/**
 * CARD/PANEL PADDING
 * Compact: p-3 → 12px
 * Standard: p-4 → 16px
 * Elevated: p-6 → 24px
 */

/**
 * GAP BETWEEN ELEMENTS
 * Form fields: gap-1.5 → 6px (tight form)
 * Sections: gap-4 → 16px (comfortable spacing)
 * Groups: gap-2 → 8px (compact lists)
 */

// ════════════════════════════════════════════════════════════════════════════
// TYPOGRAPHY SCALE
// ════════════════════════════════════════════════════════════════════════════

/**
 * TEXT SIZES
 */
Typography: {
  xs: '10px',    // Used for: Labels, helper text, badges, pills
  sm: '14px',    // Used for: Button text, input text, body copy
  base: '16px',  // Used for: Body text, default
  lg: '18px',    // Used for: Subheadings
  xl: '20px',    // Used for: Section headings
  '2xl': '24px', // Used for: Page titles
}

/**
 * FONT WEIGHTS
 */
FontWeights: {
  normal: 400,      // Regular body text
  medium: 500,      // Button text, slightly emphasized
  semibold: 600,    // Labels, headings, emphasis
  bold: 700,        // Not commonly used
}

/**
 * TYPOGRAPHY COMBINATIONS
 */
Styles: {
  label: 'text-xs font-semibold',          // 10px semibold
  button: 'text-sm font-semibold',         // 14px semibold
  body: 'text-sm font-normal',             // 14px regular
  subheading: 'text-base font-semibold',   // 16px semibold
  heading: 'text-lg font-semibold',        // 18px semibold
  title: 'text-xl font-semibold',          // 20px semibold
  pageTitle: 'text-2xl font-semibold',     // 24px semibold
  helper: 'text-xs text-slate-600',        // 10px gray
}

// ════════════════════════════════════════════════════════════════════════════
// SHADOWS
// ════════════════════════════════════════════════════════════════════════════

/**
 * SHADOW SCALE — Used for depth and layering
 */
Shadows: {
  xs: '0 1px 2px 0 rgba(0, 0, 0, 0.05)',
  sm: '0 1px 2px 0 rgba(0, 0, 0, 0.05), 0 1px 3px 0 rgba(0, 0, 0, 0.1)',
  md: '0 4px 6px -1px rgba(0, 0, 0, 0.1), 0 2px 4px -1px rgba(0, 0, 0, 0.06)',
  lg: '0 10px 15px -3px rgba(0, 0, 0, 0.1), 0 4px 6px -2px rgba(0, 0, 0, 0.05)',
  xl: '0 20px 25px -5px rgba(0, 0, 0, 0.1), 0 10px 10px -5px rgba(0, 0, 0, 0.04)',
}

/**
 * DARK MODE SHADOWS — More visible in dark mode
 * Use in dark mode: increase opacity by ~0.2-0.3x
 */

/**
 * SHADOW USAGE
 * No shadow       → Flat elements (text, icons)
 * shadow-xs      → Minimal elevation (input focus states)
 * shadow-sm      → Buttons, cards, pills (default)
 * shadow-md      → Hover states, elevated cards
 * shadow-lg      → Modals, dropdowns, floating panels
 * shadow-xl      → Topmost overlays, important modals
 */

// ════════════════════════════════════════════════════════════════════════════
// BORDER RADIUS
// ════════════════════════════════════════════════════════════════════════════

/**
 * BORDER RADIUS SCALE
 */
BorderRadius: {
  sm: '6px',      // rounded-md (Tailwind's actual md)
  md: '8px',      // rounded-lg (buttons, inputs)
  lg: '12px',     // rounded-xl (cards, modals)
  full: '9999px', // rounded-full (pills, badges)
}

/**
 * USAGE
 * Buttons: rounded-md (8px)
 * Inputs: rounded-md (8px)
 * Cards: rounded-lg (12px)
 * Pills/Badges: rounded-full (999px)
 * Modal: rounded-xl (12px)
 */

// ════════════════════════════════════════════════════════════════════════════
// TRANSITIONS & ANIMATIONS
// ════════════════════════════════════════════════════════════════════════════

/**
 * TRANSITION TIMING
 */
Transitions: {
  fast: '150ms cubic-bezier(0.4, 0, 0.2, 1)',
  base: '200ms cubic-bezier(0.4, 0, 0.2, 1)',
  slow: '300ms cubic-bezier(0.4, 0, 0.2, 1)',
}

/**
 * WHEN TO USE
 * Fast (150ms) → Color changes, opacity, shadows
 * Base (200ms) → All transitions by default
 * Slow (300ms) → Complex animations, position changes
 */

/**
 * ANIMATED PROPERTIES
 * - background-color
 * - color
 * - border-color
 * - box-shadow
 * - transform (scale, translate)
 * - opacity
 */

// ════════════════════════════════════════════════════════════════════════════
// STATE STYLES — How Elements Change
// ════════════════════════════════════════════════════════════════════════════

/**
 * BUTTON STATES
 */
Button_States: {
  default: {
    bg: 'indigo-600',
    shadow: 'shadow-sm',
  },
  hover: {
    bg: 'indigo-700',
    shadow: 'shadow-md',
  },
  active: {
    bg: 'indigo-800',
    shadow: 'shadow-md',
  },
  focus: {
    outline: '2px solid indigo-600',
    outlineOffset: '0',
  },
  disabled: {
    opacity: '50%',
    cursor: 'not-allowed',
  },
}

/**
 * INPUT STATES
 */
Input_States: {
  default: {
    border: 'border-slate-300 dark:border-slate-600',
    bg: 'white dark:bg-slate-950',
  },
  focus: {
    border: 'border-indigo-500 dark:border-indigo-400',
    ring: 'ring-2 ring-indigo-500/20',
  },
  error: {
    border: 'border-red-500',
    ring: 'ring-2 ring-red-500/20',
  },
  success: {
    border: 'border-green-500',
    ring: 'ring-2 ring-green-500/20',
  },
  disabled: {
    bg: 'slate-100 dark:bg-slate-900',
    color: 'slate-400 dark:slate-600',
    cursor: 'not-allowed',
  },
}

// ════════════════════════════════════════════════════════════════════════════
// COMPONENT SPECIFICATIONS
// ════════════════════════════════════════════════════════════════════════════

/**
 * PRIMARY BUTTON
 * Height: 36px (md size), 32px (sm), 40px (lg)
 * Padding: px-3 py-2 (md)
 * Border radius: 8px
 * Font: 14px semibold
 * Shadow: shadow-sm (default), shadow-md (hover)
 * Colors: indigo-600 → 700 → 800
 */

/**
 * TEXT INPUT
 * Height: 36px
 * Padding: px-3 py-2.5
 * Border radius: 8px
 * Font: 14px
 * Border: 1px solid
 * Shadow: none (focus adds ring)
 * Min width: 240px (recommended)
 */

/**
 * CARD
 * Border radius: 12px
 * Border: 1px solid
 * Shadow: shadow-xs (default), shadow-sm (hover)
 * Padding: p-4 (standard), p-6 (elevated)
 * Background: white light mode, slate-800 dark mode
 */

/**
 * PILL / BADGE
 * Height: 24px (sm), 28px (md)
 * Padding: px-2.5 py-1 (sm)
 * Border radius: 9999px (full)
 * Font: 12px medium
 * Border: 1px solid
 * No shadow (flat appearance)
 */

/**
 * MODAL
 * Max width: 320px (sm), 384px (md), 512px (lg)
 * Border radius: 12px
 * Shadow: shadow-xl
 * Header padding: px-6 py-4
 * Body padding: px-6 py-4
 * Footer: 1px top border, bg-slate-50 dark:bg-slate-900/30
 */

// ════════════════════════════════════════════════════════════════════════════
// DARK MODE STRATEGY
// ════════════════════════════════════════════════════════════════════════════

/**
 * SURFACES
 * Page background:   white → #0f1117 (slate-950)
 * Panel/Card:        #f8fafc → #1c2128 (slate-800)
 * Input:             white → #0f1117 (slate-950)
 * Elevated/Modal:    white → #1c2128 (slate-800)
 * Hover:             #f3f4f6 → #262c36 (slate-700)
 * Active:            #e5e7eb → #30363d (slate-600)
 */

/**
 * TEXT
 * Primary:           #111827 (slate-900) → #e6edf3 (slate-100)
 * Secondary:         #4b5563 (slate-600) → #8b949e (slate-400)
 * Tertiary:          #6b7280 (slate-500) → #6e7681 (slate-500)
 * Muted:             #9ca3af (slate-400) → #565f6d (slate-600)
 * Helper/Disabled:   #9ca3af (slate-400) → #565f6d (slate-600)
 */

/**
 * BORDERS
 * Strong:            #d1d5db (slate-300) → #30363d (slate-600)
 * Default:           #e5e7eb (slate-200) → #21262d (slate-700)
 * Subtle:            #f0f1f3 (slate-100) → #161b22 (slate-800)
 * Focus:             #6366f1 (indigo) → #818cf8 (indigo-400)
 */

/**
 * SHADOWS
 * Dark mode shadows are more opaque (0.3-0.5 vs 0.1-0.15)
 * This ensures elements have adequate elevation and aren't lost in dark backgrounds
 */

/**
 * ACCENT COLORS
 * Indigo: 6366f1 → 818cf8 (lighter for visibility)
 * Success: 16a34a → 3fb950 (brighter green)
 * Danger: dc2626 → f85149 (brighter red)
 * Warning: d97706 → d29922 (adjusted amber)
 * Info: 2563eb → 58a6ff (brighter blue)
 */

// ════════════════════════════════════════════════════════════════════════════
// ACCESSIBILITY CONSIDERATIONS
// ════════════════════════════════════════════════════════════════════════════

/**
 * CONTRAST RATIOS
 * Normal text (14px): Minimum 4.5:1
 * Large text (18px+): Minimum 3:1
 * UI components: Minimum 3:1
 *
 * Our color system maintains 7:1+ contrast in most cases
 */

/**
 * FOCUS STATES
 * All interactive elements must have visible focus
 * Use: outline or ring utilities
 * Example: focus:ring-2 focus:ring-offset-2 focus:ring-indigo-600
 */

/**
 * COLOR NOT ONLY INDICATOR
 * Don't use color alone to convey state
 * Always combine with: icons, text, or pattern
 * Example: Error = Red color + "•" icon + error message text
 */

/**
 * TOUCH TARGETS
 * Minimum size: 48px × 48px
 * Our buttons: 36px height (with spacing, often meets requirement)
 * Buttons on mobile: Ensure adequate spacing (gap-2)
 */

/**
 * SEMANTIC HTML
 * Use <button> for buttons (not <div onClick>)
 * Use <label htmlFor> for form fields
 * Use <nav> for navigation
 * Use <main>, <section>, <article> for structure
 */

// ════════════════════════════════════════════════════════════════════════════
// IMPLEMENTATION EXAMPLES
// ════════════════════════════════════════════════════════════════════════════

/**
 * CSS VARIABLES (from index.css)
 * Access in tailwind: var(--accent-primary)
 * Access in CSS: background: var(--surface-page-bg);
 * Update globally: Modify in :root and .dark selectors
 */

/**
 * USING DESIGN TOKENS IN CODE
 */

// Button with semantic tokens
<button className="
  inline-flex items-center justify-center gap-2
  px-3 py-2 rounded-md text-sm font-semibold
  bg-indigo-600 hover:bg-indigo-700 active:bg-indigo-800
  dark:bg-indigo-500 dark:hover:bg-indigo-600
  shadow-sm hover:shadow-md
  disabled:opacity-50 disabled:cursor-not-allowed
  transition-all duration-150
">
  Click me
</button>

// Card with surface tokens
<div className="
  rounded-lg
  bg-white dark:bg-slate-800
  border border-slate-200 dark:border-slate-700
  p-4
  shadow-xs hover:shadow-sm
  transition-shadow duration-150
">
  Card content
</div>

// Form field with text tokens
<label className="block text-xs font-semibold text-slate-900 dark:text-white mb-1.5">
  Email Address
</label>
<input className="
  w-full px-3 py-2.5 rounded-md text-sm
  bg-white dark:bg-slate-950
  border border-slate-300 dark:border-slate-600
  text-slate-900 dark:text-slate-100
  placeholder-slate-400 dark:placeholder-slate-500
  focus:border-indigo-500 focus:ring-2 focus:ring-indigo-500/20
" />
<p className="text-xs text-slate-600 dark:text-slate-400 mt-1">
  Helper text goes here
</p>

// ════════════════════════════════════════════════════════════════════════════
// MAINTENANCE & UPDATES
// ════════════════════════════════════════════════════════════════════════════

/**
 * TO ADD A NEW COLOR VARIANT
 * 1. Define in CSS custom properties (:root and .dark)
 * 2. Add to component utility in @layer components
 * 3. Update this reference document
 * 4. Update UI_USAGE_GUIDE.md with examples
 * 5. Test in both light and dark modes
 */

/**
 * TO MODIFY SPACING SCALE
 * 1. Update CSS custom properties
 * 2. Update component padding/margin definitions
 * 3. Regenerate component examples
 * 4. Test all layouts (mobile, tablet, desktop)
 */

/**
 * TO CHANGE BORDER RADIUS
 * 1. Update throughout component utilities
 * 2. Ensure all button sizes match
 * 3. Ensure all input styles match
 * 4. Update card rounded values
 * 5. Update modal border radius
 */
