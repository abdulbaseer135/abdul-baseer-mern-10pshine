/**
 * ═══════════════════════════════════════════════════════════════════════════
 * SHARED VISUAL SYSTEM — COMPLETE DOCUMENTATION INDEX
 * Premium SaaS Notes App Component Library
 * ═══════════════════════════════════════════════════════════════════════════
 *
 * This system provides a complete, production-ready UI kit for your
 * React + Tailwind application with:
 * ✓ Consistent design language across light and dark modes
 * ✓ Reusable React components with built-in validation
 * ✓ Comprehensive CSS utility classes as fallback
 * ✓ Premium SaaS aesthetic with professional styling
 * ✓ Accessibility built-in (keyboard, screen readers, contrast)
 * ✓ No flashy glows or weak dark-mode contrast
 * ✓ Compact, intentional spacing and hierarchy
 */

// ════════════════════════════════════════════════════════════════════════════
// FILES IN THIS SYSTEM
// ════════════════════════════════════════════════════════════════════════════

/**
 * 1. UIComponents.jsx (src/components/common/UIComponents.jsx)
 *    ├─ Reusable React component wrappers
 *    ├─ 20+ components with props documentation
 *    ├─ Built-in validation, states, and accessibility
 *    └─ Ready to import and use immediately
 *
 * 2. index.css (src/index.css)
 *    ├─ CSS custom properties (design tokens)
 *    ├─ @layer components with utility classes
 *    ├─ Global styles and transitions
 *    ├─ Dark mode support throughout
 *    └─ Light mode: HTML, Dark mode: .dark class
 *
 * 3. UI_USAGE_GUIDE.md (This directory)
 *    ├─ Comprehensive usage examples
 *    ├─ Real-world form patterns
 *    ├─ Best practices and accessibility tips
 *    ├─ Copy-paste code snippets
 *    └─ Common use case implementations
 *
 * 4. UI_QUICK_REFERENCE.md (This directory)
 *    ├─ Quick lookup for all components
 *    ├─ Copy-paste patterns for common tasks
 *    ├─ CSS-only alternatives (no React)
 *    ├─ Design principles summary
 *    └─ State and styling reference
 *
 * 5. DESIGN_TOKENS_REFERENCE.md (This directory)
 *    ├─ Complete color palette
 *    ├─ Spacing scale and typography system
 *    ├─ Shadow and border radius definitions
 *    ├─ State styles and transitions
 *    ├─ Component specifications
 *    └─ Dark mode strategy and values
 */

// ════════════════════════════════════════════════════════════════════════════
// QUICK START
// ════════════════════════════════════════════════════════════════════════════

/**
 * STEP 1: Import components where needed
 */
import {
  Button,
  TextInput,
  SegmentedControl,
  Card,
  Modal,
  Pill,
  EmptyState,
} from '@/components/common/UIComponents';

/**
 * STEP 2: Use in your component
 */
const MyComponent = () => {
  const [title, setTitle] = useState('');
  const [category, setCategory] = useState('work');

  return (
    <Card>
      <TextInput
        label="Note Title"
        placeholder="Enter title..."
        value={title}
        onChange={(e) => setTitle(e.target.value)}
      />
      
      <SegmentedControl
        options={[
          { label: 'Work', value: 'work' },
          { label: 'Personal', value: 'personal' },
        ]}
        value={category}
        onChange={setCategory}
      />

      <Button onClick={handleSave}>Save</Button>
    </Card>
  );
};

/**
 * STEP 3: That's it! Dark mode works automatically
 * (when .dark class is on the root element)
 */

// ════════════════════════════════════════════════════════════════════════════
// COMPLETE COMPONENT LIST
// ════════════════════════════════════════════════════════════════════════════

/**
 * BUTTONS
 * ├─ Button (primary | secondary | ghost | danger | success)
 * └─ Sizes: sm | md (default) | lg
 *    Props: variant, size, icon, disabled, onClick, etc.
 */

/**
 * FORM INPUTS
 * ├─ TextInput (with label, error, helper, success states)
 * ├─ SearchInput (optimized search field with icon)
 * ├─ FormField (wrapper for complex field layouts)
 * ├─ Label (accessible form label)
 * ├─ HelperText (support text: default, error, success)
 * └─ Direct input use: className="input-base"
 */

/**
 * SELECTION & FILTERING
 * ├─ Pill (removable tags, clickable categories)
 * │  └─ Colors: indigo | red | green | amber | slate
 * ├─ SegmentedControl (tab-like switcher)
 * └─ Badge (status indicators: accent | danger | success | neutral)
 */

/**
 * CONTAINERS & LAYOUT
 * ├─ Card (default | elevated | interactive | featured | compact)
 * ├─ Panel (standard | nested)
 * ├─ Modal (dialog with header, body, footer)
 * ├─ DangerZone (destructive action container)
 * └─ EmptyState (no data placeholder with action)
 */

/**
 * NOTIFICATIONS
 * ├─ Alert (info | success | warning | error with icon)
 * └─ Direct helper: className="helper-text-error"
 */

// ════════════════════════════════════════════════════════════════════════════
// WHEN TO USE COMPONENTS VS CSS CLASSES
// ════════════════════════════════════════════════════════════════════════════

/**
 * USE REACT COMPONENT WHEN:
 * ✓ You need interactive features (validation, states)
 * ✓ You're building a form with error handling
 * ✓ You need built-in accessibility features
 * ✓ Component manages its own state (like modals)
 * ✓ You want TypeScript/props validation
 *
 * USE CSS CLASSES WHEN:
 * ✓ Styling static content
 * ✓ Building very simple UI (no interactivity)
 * ✓ Performance-critical (avoid wrapper overhead)
 * ✓ Working with non-React code
 * ✓ You prefer full control over markup
 */

/**
 * EXAMPLE: React Component (Forms)
 */
<FormField label="Email" required>
  <TextInput
    placeholder="you@example.com"
    value={email}
    onChange={(e) => setEmail(e.target.value)}
  />
</FormField>

/**
 * EXAMPLE: CSS Only (Static Content)
 */
<label className="label-base label-required">Email</label>
<input className="input-base" type="email" placeholder="..." />

// ════════════════════════════════════════════════════════════════════════════
// DESIGN PRINCIPLES
// ════════════════════════════════════════════════════════════════════════════

/**
 * 1. PREMIUM SaaS AESTHETIC
 *    - Clean, minimal design without clutter
 *    - Subtle shadows and depth (no glows)
 *    - Professional color palette (slate + indigo)
 *    - Intentional whitespace and breathing room
 */

/**
 * 2. STRONG DARK MODE SUPPORT
 *    - Not just inverted colors
 *    - Carefully layered backgrounds (slate-800 > 700 > 600)
 *    - Enhanced shadows for visibility
 *    - Lighter text for readability
 *    - No weak contrast or hard-to-read elements
 */

/**
 * 3. COMPACT DENSITY
 *    - Form fields use: px-3 py-2.5 (12px × 10px)
 *    - Gap between fields: gap-1.5 (6px)
 *    - Buttons use: px-3 py-2 (12px × 8px)
 *    - No unnecessary padding or spacing
 *    - More content visible without scrolling
 */

/**
 * 4. CLEAR STATE FEEDBACK
 *    - Hover: Color changes + shadow lift
 *    - Focus: Clear outline or ring
 *    - Active: Darker color maintained
 *    - Disabled: 50% opacity + not-allowed cursor
 *    - Error: Red border + red helper text + icon
 *    - Success: Green border + green helper text + checkmark
 */

/**
 * 5. ACCESSIBILITY FIRST
 *    - Semantic HTML (<button>, <label>, <input>)
 *    - Keyboard navigation support
 *    - Focus visible states
 *    - ARIA labels where needed
 *    - Color + icon for states (not color alone)
 *    - Minimum 4.5:1 contrast ratio
 *    - Touch targets minimum 48px
 */

/**
 * 6. CONSISTENCY ACROSS PAGES
 *    - Same button styles everywhere
 *    - Same input styling throughout
 *    - Unified card and panel appearance
 *    - Consistent spacing patterns
 *    - Same color meanings (red = danger, green = success)
 */

// ════════════════════════════════════════════════════════════════════════════
// COMMON PATTERNS
// ════════════════════════════════════════════════════════════════════════════

/**
 * PATTERN 1: Simple Form
 */
const SimpleForm = () => {
  const [data, setData] = useState({ name: '', email: '' });
  const [errors, setErrors] = useState({});

  const handleSubmit = (e) => {
    e.preventDefault();
    // Validate and submit
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4 max-w-md">
      <TextInput
        label="Full Name"
        required
        value={data.name}
        onChange={(e) => setData({ ...data, name: e.target.value })}
        error={errors.name}
      />
      <TextInput
        label="Email"
        required
        value={data.email}
        onChange={(e) => setData({ ...data, email: e.target.value })}
        error={errors.email}
      />
      <div className="flex gap-2 justify-end pt-4 border-t border-slate-200 dark:border-slate-700">
        <Button variant="secondary">Cancel</Button>
        <Button type="submit">Save</Button>
      </div>
    </form>
  );
};

/**
 * PATTERN 2: Card List with Empty State
 */
const CardList = ({ items, isLoading }) => {
  if (isLoading) return <div>Loading...</div>;

  if (items.length === 0) {
    return (
      <EmptyState
        icon={InboxIcon}
        title="No items"
        description="Create your first item to get started"
        action={<Button icon={PlusIcon}>Create Item</Button>}
      />
    );
  }

  return (
    <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
      {items.map((item) => (
        <Card key={item.id} variant="interactive">
          <div className="p-4">
            <h3 className="font-semibold mb-2">{item.title}</h3>
            <p className="text-sm text-slate-600 dark:text-slate-400">
              {item.description}
            </p>
          </div>
        </Card>
      ))}
    </div>
  );
};

/**
 * PATTERN 3: Modal with Actions
 */
const DeleteConfirmation = ({ isOpen, onConfirm, onCancel }) => {
  return (
    <Modal
      isOpen={isOpen}
      title="Confirm Delete"
      onClose={onCancel}
      footer={
        <div className="flex gap-2">
          <Button variant="secondary" onClick={onCancel}>
            Cancel
          </Button>
          <Button variant="danger" onClick={onConfirm}>
            Delete Permanently
          </Button>
        </div>
      }
    >
      <Alert
        type="error"
        title="This cannot be undone"
        message="Once deleted, you cannot recover this item."
      />
    </Modal>
  );
};

/**
 * PATTERN 4: Tabbed Interface with Segments
 */
const TabbedContent = () => {
  const [tab, setTab] = useState('overview');

  return (
    <div>
      <SegmentedControl
        options={[
          { label: 'Overview', value: 'overview' },
          { label: 'Details', value: 'details' },
          { label: 'Settings', value: 'settings' },
        ]}
        value={tab}
        onChange={setTab}
      />
      <div className="mt-4">
        {tab === 'overview' && <OverviewTab />}
        {tab === 'details' && <DetailsTab />}
        {tab === 'settings' && <SettingsTab />}
      </div>
    </div>
  );
};

// ════════════════════════════════════════════════════════════════════════════
// CUSTOMIZATION GUIDE
// ════════════════════════════════════════════════════════════════════════════

/**
 * TO CUSTOMIZE COLORS:
 * 1. Edit CSS custom properties in src/index.css
 * 2. Update both :root and .dark selectors
 * 3. Components using --accent-primary will update automatically
 * 4. Test in both light and dark modes
 */

/**
 * TO ADD A NEW BUTTON VARIANT:
 * 1. Add to index.css in @layer components:
 *    .btn-custom {
 *      @apply inline-flex items-center justify-center gap-2 px-3 py-2 rounded-md text-sm font-medium;
 *      @apply bg-purple-600 hover:bg-purple-700 active:bg-purple-800;
 *      box-shadow: var(--shadow-sm);
 *    }
 * 2. Add to Button component prop options
 * 3. Update UI_QUICK_REFERENCE.md
 */

/**
 * TO ADJUST SPACING:
 * 1. Edit CSS custom properties (--space-*)
 * 2. Update component utility padding/gap values
 * 3. Test all layouts (especially mobile)
 * 4. Update documentation
 */

/**
 * TO CHANGE TYPOGRAPHY:
 * 1. Update font family in :root
 * 2. Adjust font sizes in component utilities
 * 3. Update label-base, button styles, etc.
 * 4. Test readability at all sizes
 */

// ════════════════════════════════════════════════════════════════════════════
// TROUBLESHOOTING
// ════════════════════════════════════════════════════════════════════════════

/**
 * ISSUE: Dark mode not applying
 * FIX: Ensure .dark class is added to root element when dark mode is enabled
 *      Example: <html className={isDarkMode ? 'dark' : ''}>
 *      Verify that Tailwind dark mode config is set to 'class' in tailwind.config.js
 */

/**
 * ISSUE: Component styles don't match screenshots
 * FIX: Check that your tailwind.config.js extends the custom utilities
 *      Run: npm run build (to rebuild CSS)
 *      Clear browser cache and refresh
 */

/**
 * ISSUE: Input validation not showing
 * FIX: Ensure error prop is passed to TextInput component
 *      Check that error state is being set correctly
 *      Verify error message is a string (not boolean)
 */

/**
 * ISSUE: Modal doesn't close
 * FIX: Ensure onClose prop is passed and state is updated
 *      Check that overlay onClick calls onClose
 *      Verify isOpen state is being toggled correctly
 */

/**
 * ISSUE: Dark mode text hard to read
 * FIX: Check background colors (should be slate-800 or darker)
 *      Verify text colors (should be slate-100 or lighter)
 *      Increase shadow opacity for better contrast
 *      Run contrast checker: webaim.org/contrast/check
 */

// ════════════════════════════════════════════════════════════════════════════
// NEXT STEPS
// ════════════════════════════════════════════════════════════════════════════

/**
 * 1. READ THE DOCUMENTATION
 *    ├─ UI_QUICK_REFERENCE.md (fast lookup)
 *    ├─ UI_USAGE_GUIDE.md (examples and patterns)
 *    └─ DESIGN_TOKENS_REFERENCE.md (deep dive)
 *
 * 2. START USING COMPONENTS
 *    ├─ Replace old button styles with <Button>
 *    ├─ Replace old inputs with <TextInput>
 *    ├─ Replace old cards with <Card>
 *    └─ Update modals to use <Modal>
 *
 * 3. ENSURE CONSISTENCY
 *    ├─ Audit all pages for consistent styling
 *    ├─ Replace one-off styles with components
 *    ├─ Test dark mode thoroughly
 *    └─ Verify responsive design on all breakpoints
 *
 * 4. EXTEND AS NEEDED
 *    ├─ Add new button variants as needed
 *    ├─ Create custom component wrappers
 *    ├─ Add new color variants
 *    └─ Update documentation as you extend
 */

// ════════════════════════════════════════════════════════════════════════════
// SUPPORT & MAINTENANCE
// ════════════════════════════════════════════════════════════════════════════

/**
 * For new components or updates:
 * 1. Add to UIComponents.jsx
 * 2. Add CSS utilities to index.css @layer components
 * 3. Document in UI_USAGE_GUIDE.md
 * 4. Add quick reference pattern to UI_QUICK_REFERENCE.md
 * 5. Update design tokens if needed
 * 6. Test in light and dark modes
 * 7. Verify accessibility
 *
 * Keep the system DRY by:
 * ├─ Always using design tokens (no hardcoded colors)
 * ├─ Reusing component utilities (don't create duplicates)
 * ├─ Extending existing components (add props vs new components)
 * └─ Documenting patterns (update guides, not just code)
 */

/**
 * ═══════════════════════════════════════════════════════════════════════════
 * You now have a complete, professional, production-ready UI system!
 * Use it consistently across your entire app for a cohesive, premium feel.
 * ═══════════════════════════════════════════════════════════════════════════
 */
