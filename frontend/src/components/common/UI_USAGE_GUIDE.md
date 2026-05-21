/**
 * ═══════════════════════════════════════════════════════════════════════════
 * SHARED VISUAL SYSTEM — USAGE GUIDE & EXAMPLES
 * Premium SaaS Notes App — Component Patterns & Best Practices
 * ═══════════════════════════════════════════════════════════════════════════
 */

// ────────────────────────────────────────────────────────────────────────────
// IMPORT ALL COMPONENTS
// ────────────────────────────────────────────────────────────────────────────

import {
  Button,
  TextInput,
  SearchInput,
  Pill,
  SegmentedControl,
  Card,
  Modal,
  EmptyState,
  HelperText,
  Label,
  FormField,
  Badge,
  Alert,
  Panel,
  DangerZone,
} from '@/components/common/UIComponents';

import { SearchIcon, PlusIcon, TrashIcon, LockIcon, CheckCircleIcon } from 'lucide-react';

// ═══════════════════════════════════════════════════════════════════════════
// BUTTONS — All Variants and Sizes
// ═══════════════════════════════════════════════════════════════════════════

/**
 * PRIMARY BUTTON — For main actions (create, save, submit)
 * Use in: CTAs, form submissions, primary confirmations
 */
const ButtonExamples = () => {
  return (
    <>
      {/* Standard primary button */}
      <Button onClick={handleCreate}>Create Note</Button>

      {/* Primary with icon */}
      <Button icon={PlusIcon}>Add Note</Button>

      {/* Loading state */}
      <Button disabled icon={LoadingIcon}>Creating...</Button>

      {/* Small primary button */}
      <Button size="sm">Quick Action</Button>

      {/* Large primary button */}
      <Button size="lg" icon={CheckCircleIcon}>Complete Action</Button>

      {/* SECONDARY BUTTON — For secondary actions */}
      <Button variant="secondary">Cancel</Button>
      <Button variant="secondary" size="sm" icon={EditIcon}>Edit</Button>

      {/* GHOST BUTTON — For tertiary actions, minimal emphasis */}
      <Button variant="ghost">Skip</Button>
      <Button variant="ghost" icon={ChevronDownIcon}>More Options</Button>

      {/* DANGER BUTTON — For destructive actions */}
      <Button variant="danger" icon={TrashIcon}>Delete Note</Button>

      {/* SUCCESS BUTTON — For confirmations */}
      <Button variant="success" icon={CheckIcon}>Confirm Changes</Button>
    </>
  );
};

// ═══════════════════════════════════════════════════════════════════════════
// FORM INPUTS — Text, Search, with Validation States
// ═══════════════════════════════════════════════════════════════════════════

/**
 * TEXT INPUT — Standard form field with validation
 * Features: Labels, helper text, error states, success states, icons
 */
const FormExample = () => {
  const [email, setEmail] = React.useState('');
  const [emailError, setEmailError] = React.useState('');

  const handleEmailChange = (e) => {
    const value = e.target.value;
    setEmail(value);
    // Validate email
    if (value && !value.includes('@')) {
      setEmailError('Please enter a valid email');
    } else {
      setEmailError('');
    }
  };

  return (
    <div className="space-y-4">
      {/* Basic text input */}
      <TextInput
        label="Full Name"
        placeholder="John Doe"
        value={name}
        onChange={(e) => setName(e.target.value)}
      />

      {/* With helper text */}
      <TextInput
        label="Email"
        placeholder="you@example.com"
        value={email}
        onChange={handleEmailChange}
        error={emailError}
        helperText="We'll never share your email"
      />

      {/* With success state */}
      <TextInput
        label="Username"
        placeholder="johndoe"
        value={username}
        success={usernameValid}
        helperText="Username is available!"
        onChange={(e) => setUsername(e.target.value)}
      />

      {/* With icon */}
      <TextInput
        label="Password"
        type="password"
        icon={LockIcon}
        placeholder="••••••••"
        value={password}
        onChange={(e) => setPassword(e.target.value)}
      />

      {/* Disabled state */}
      <TextInput
        label="ID (Read-only)"
        disabled
        value="usr_123456"
      />

      {/* Using FormField wrapper for cleaner code */}
      <FormField
        label="Description"
        helperText="This is visible to you only"
      >
        <textarea className="input-base" rows="4" />
      </FormField>
    </div>
  );
};

/**
 * SEARCH INPUT — Optimized for search use cases
 */
const SearchExample = () => {
  const [query, setQuery] = React.useState('');

  return (
    <SearchInput
      placeholder="Search notes, tags, or people..."
      icon={SearchIcon}
      value={query}
      onChange={(e) => setQuery(e.target.value)}
    />
  );
};

// ═══════════════════════════════════════════════════════════════════════════
// CATEGORY PILLS — For Tags, Categories, Selected Filters
// ═══════════════════════════════════════════════════════════════════════════

/**
 * PILLS — Removable tags, selectable categories, status indicators
 * Colors: indigo, red, green, amber, slate
 */
const PillsExample = () => {
  const [tags, setTags] = React.useState(['important', 'work', 'urgent']);

  const removeTag = (tagToRemove) => {
    setTags(tags.filter((tag) => tag !== tagToRemove));
  };

  return (
    <div className="space-y-4">
      {/* Removable tags */}
      <div className="flex flex-wrap gap-2">
        {tags.map((tag) => (
          <Pill
            key={tag}
            color="indigo"
            onRemove={() => removeTag(tag)}
          >
            {tag}
          </Pill>
        ))}
      </div>

      {/* Non-removable category pills */}
      <div className="flex gap-2">
        <Pill color="green" isActive>Active</Pill>
        <Pill color="amber" isActive>In Progress</Pill>
        <Pill color="slate" isActive={false}>Archived</Pill>
      </div>

      {/* Clickable category selector */}
      <div className="flex gap-2">
        <Pill
          color="indigo"
          onClick={() => selectCategory('work')}
        >
          Work
        </Pill>
        <Pill
          color="red"
          onClick={() => selectCategory('personal')}
        >
          Personal
        </Pill>
      </div>
    </div>
  );
};

// ═══════════════════════════════════════════════════════════════════════════
// SEGMENTED CONTROL — For Switching Between Views/Tabs
// ═══════════════════════════════════════════════════════════════════════════

/**
 * SEGMENTED CONTROL — Compact tab-like selector
 * Use: View modes, time ranges, sort options
 */
const SegmentedExample = () => {
  const [viewMode, setViewMode] = React.useState('grid');

  return (
    <SegmentedControl
      options={[
        { label: 'Grid', value: 'grid', icon: GridIcon },
        { label: 'List', value: 'list', icon: ListIcon },
        { label: 'Timeline', value: 'timeline', icon: CalendarIcon },
      ]}
      value={viewMode}
      onChange={setViewMode}
    />
  );
};

// ═══════════════════════════════════════════════════════════════════════════
// CARDS — Containers for Content
// ═══════════════════════════════════════════════════════════════════════════

/**
 * CARD VARIANTS
 * default  — Standard card, light shadow
 * elevated — Higher elevation shadow
 * interactive — Hover lift effect
 * featured — Premium appearance with more shadow
 * compact  — Smaller padding for dense layouts
 */
const CardExample = () => {
  return (
    <>
      {/* Default card */}
      <Card>
        <div className="p-4">
          <h3 className="font-semibold mb-2">Note Title</h3>
          <p className="text-sm text-slate-600 dark:text-slate-400">
            Note preview text here...
          </p>
        </div>
      </Card>

      {/* Interactive card with hover lift */}
      <Card variant="interactive">
        <h3 className="font-semibold mb-2">Click me to edit</h3>
      </Card>

      {/* Featured card with strong emphasis */}
      <Card variant="featured">
        <h2 className="text-lg font-semibold mb-4">Important Notice</h2>
        <p>This is a featured card with more visual weight.</p>
      </Card>

      {/* Compact card for dense layouts */}
      <Card variant="compact">
        <p className="text-sm">Compact card content</p>
      </Card>
    </>
  );
};

// ═══════════════════════════════════════════════════════════════════════════
// MODAL — Dialog Container
// ═══════════════════════════════════════════════════════════════════════════

/**
 * MODAL — For dialogs, confirmations, forms
 * Sizes: sm (320px) | md (384px) | lg (512px)
 */
const ModalExample = () => {
  const [isOpen, setIsOpen] = React.useState(false);

  return (
    <>
      <Button onClick={() => setIsOpen(true)}>Open Modal</Button>

      <Modal
        isOpen={isOpen}
        title="Create New Note"
        onClose={() => setIsOpen(false)}
        size="md"
        footer={
          <div className="flex gap-2">
            <Button variant="secondary" onClick={() => setIsOpen(false)}>
              Cancel
            </Button>
            <Button onClick={handleCreateNote}>Create</Button>
          </div>
        }
      >
        <TextInput label="Note Title" placeholder="Enter title..." />
        <TextInput label="Category" placeholder="Select category..." />
      </Modal>
    </>
  );
};

// ═══════════════════════════════════════════════════════════════════════════
// EMPTY STATE — No Data Placeholder
// ═══════════════════════════════════════════════════════════════════════════

/**
 * EMPTY STATE — User-friendly placeholder when no content exists
 */
const EmptyStateExample = () => {
  return (
    <EmptyState
      icon={InboxIcon}
      title="No notes yet"
      description="Create your first note to get started"
      action={<Button icon={PlusIcon}>Create Note</Button>}
    />
  );
};

// ═══════════════════════════════════════════════════════════════════════════
// HELPER TEXT & LABELS — Form Utilities
// ═══════════════════════════════════════════════════════════════════════════

/**
 * HELPER TEXT — Supportive text below form fields
 */
const HelperExample = () => {
  return (
    <>
      {/* Standard helper */}
      <div>
        <Label required>Email Address</Label>
        <TextInput placeholder="you@example.com" />
        <HelperText>We'll use this to contact you</HelperText>
      </div>

      {/* Error helper */}
      <HelperText error>Invalid email format</HelperText>

      {/* Success helper */}
      <HelperText success>Email verified successfully</HelperText>
    </>
  );
};

// ═══════════════════════════════════════════════════════════════════════════
// BADGES — Status Indicators
// ═══════════════════════════════════════════════════════════════════════════

/**
 * BADGE — Status, tags, indicators
 * Variants: accent | danger | success | neutral
 */
const BadgeExample = () => {
  return (
    <>
      <Badge variant="accent">In Review</Badge>
      <Badge variant="success">Published</Badge>
      <Badge variant="danger">Urgent</Badge>
      <Badge variant="neutral">Draft</Badge>
    </>
  );
};

// ═══════════════════════════════════════════════════════════════════════════
// ALERTS — Notifications & Messages
// ═══════════════════════════════════════════════════════════════════════════

/**
 * ALERT — System notifications, status messages
 * Types: info | success | warning | error
 */
const AlertExample = () => {
  const [showAlert, setShowAlert] = React.useState(true);

  return (
    <>
      {showAlert && (
        <Alert
          type="success"
          title="Note saved"
          message="Your note has been saved successfully."
          icon={CheckCircleIcon}
          onClose={() => setShowAlert(false)}
        />
      )}

      <Alert
        type="error"
        title="Error"
        message="Failed to save note. Please try again."
        icon={AlertCircleIcon}
      />

      <Alert
        type="warning"
        title="Unsaved changes"
        message="You have unsaved changes. Be careful when leaving."
        icon={AlertTriangleIcon}
      />
    </>
  );
};

// ═══════════════════════════════════════════════════════════════════════════
// PANELS & CONTAINERS
// ═══════════════════════════════════════════════════════════════════════════

/**
 * PANEL — Container with panel styling
 * Can be nested or standard
 */
const PanelExample = () => {
  return (
    <>
      <Panel>
        <div className="p-4">Standard panel content</div>
      </Panel>

      <Panel nested>
        <div className="p-4">Nested panel (lighter background)</div>
      </Panel>
    </>
  );
};

/**
 * DANGER ZONE — Destructive action container
 */
const DangerZoneExample = () => {
  return (
    <DangerZone>
      <h3 className="text-sm font-semibold text-red-700 dark:text-red-300 mb-2">
        Delete Account
      </h3>
      <p className="text-xs text-red-600 dark:text-red-400 mb-4">
        This action cannot be undone.
      </p>
      <Button variant="danger" icon={TrashIcon}>
        Delete Permanently
      </Button>
    </DangerZone>
  );
};

// ═══════════════════════════════════════════════════════════════════════════
// REAL-WORLD FORM EXAMPLE — Using Multiple Components Together
// ═══════════════════════════════════════════════════════════════════════════

export const NoteForm = ({ note, onSave, onCancel }) => {
  const [title, setTitle] = React.useState(note?.title || '');
  const [category, setCategory] = React.useState(note?.category || 'work');
  const [tags, setTags] = React.useState(note?.tags || []);
  const [newTag, setNewTag] = React.useState('');
  const [errors, setErrors] = React.useState({});
  const [isLoading, setIsLoading] = React.useState(false);

  const handleAddTag = () => {
    if (newTag.trim() && tags.length < 5) {
      setTags([...tags, newTag.trim()]);
      setNewTag('');
    }
  };

  const handleRemoveTag = (tagToRemove) => {
    setTags(tags.filter((tag) => tag !== tagToRemove));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    const newErrors = {};

    if (!title.trim()) newErrors.title = 'Title is required';
    if (title.length > 100) newErrors.title = 'Title must be under 100 characters';

    if (Object.keys(newErrors).length > 0) {
      setErrors(newErrors);
      return;
    }

    setIsLoading(true);
    try {
      await onSave({ title, category, tags });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      {/* Title field */}
      <TextInput
        label="Note Title"
        required
        placeholder="Enter note title..."
        value={title}
        onChange={(e) => setTitle(e.target.value)}
        error={errors.title}
        helperText="Give your note a descriptive title"
      />

      {/* Category selector using segmented control */}
      <FormField label="Category">
        <SegmentedControl
          options={[
            { label: 'Work', value: 'work' },
            { label: 'Personal', value: 'personal' },
            { label: 'Ideas', value: 'ideas' },
          ]}
          value={category}
          onChange={setCategory}
        />
      </FormField>

      {/* Tags input */}
      <FormField
        label="Tags"
        helperText="Add up to 5 tags (press enter to add)"
      >
        <div className="space-y-2">
          <div className="flex gap-2">
            <TextInput
              placeholder="Add a tag..."
              value={newTag}
              onChange={(e) => setNewTag(e.target.value)}
              onKeyPress={(e) => e.key === 'Enter' && handleAddTag()}
            />
            <Button
              size="sm"
              variant="secondary"
              onClick={handleAddTag}
            >
              Add
            </Button>
          </div>
          {tags.length > 0 && (
            <div className="flex flex-wrap gap-2">
              {tags.map((tag) => (
                <Pill
                  key={tag}
                  color="indigo"
                  onRemove={() => handleRemoveTag(tag)}
                >
                  {tag}
                </Pill>
              ))}
            </div>
          )}
        </div>
      </FormField>

      {/* Form actions */}
      <div className="flex gap-2 justify-end pt-4 border-t border-slate-200 dark:border-slate-700">
        <Button variant="secondary" onClick={onCancel} disabled={isLoading}>
          Cancel
        </Button>
        <Button type="submit" disabled={isLoading}>
          {isLoading ? 'Saving...' : 'Save Note'}
        </Button>
      </div>
    </form>
  );
};

// ═══════════════════════════════════════════════════════════════════════════
// CSS UTILITY CLASSES — Direct Tailwind Usage (No Component Wrapper)
// ═══════════════════════════════════════════════════════════════════════════

/**
 * When you don't need a React component, use these CSS classes directly:
 */

// Buttons
// <button className="btn-primary">Primary Action</button>
// <button className="btn-secondary">Secondary Action</button>
// <button className="btn-ghost">Ghost Action</button>
// <button className="btn-danger">Dangerous Action</button>
// <button className="btn-success">Success Action</button>

// Inputs
// <input className="input-base" placeholder="Type here..." />
// <input className="input-search" placeholder="Search..." />
// <input className="input-base input-error" />
// <input className="input-base input-success" />

// Text
// <label className="label-base">Field Label</label>
// <label className="label-base label-required">Required Field</label>
// <p className="helper-text">Helper text under field</p>
// <p className="helper-text-error">•&nbsp;Error message</p>
// <p className="helper-text-success">✓&nbsp;Success message</p>

// Pills
// <span className="pill-base pill-indigo">Indigo Pill</span>
// <span className="pill-base pill-red">Red Pill</span>
// <span className="pill-base pill-inactive">Inactive Pill</span>

// Cards
// <div className="card">Default card</div>
// <div className="card-elevated">Elevated card</div>
// <div className="card-interactive">Interactive card</div>
// <div className="card-featured">Featured card</div>
// <div className="card-compact">Compact card</div>

// Segmented Control
// <div className="segmented-control">
//   <button className="segmented-control-item">Option 1</button>
//   <button className="segmented-control-item segmented-control-item-active">Option 2</button>
// </div>

// Empty State
// <div className="empty-state">
//   <svg className="empty-state-icon" .../>
//   <h3 className="empty-state-title">No items</h3>
//   <p className="empty-state-description">Create one to get started</p>
// </div>

// Badges
// <span className="badge-accent">Accent Badge</span>
// <span className="badge-danger">Danger Badge</span>
// <span className="badge-success">Success Badge</span>
// <span className="badge-neutral">Neutral Badge</span>

// ═══════════════════════════════════════════════════════════════════════════
// DESIGN TOKENS & BEST PRACTICES
// ═══════════════════════════════════════════════════════════════════════════

/**
 * COLOR PALETTE
 * Primary: Indigo (#6366f1) — Main actions, focus states
 * Success: Green (#16a34a) — Positive feedback, confirmations
 * Danger: Red (#dc2626) — Destructive actions, errors
 * Warning: Amber (#d97706) — Warnings, cautions
 * Info: Blue (#2563eb) — Information, secondary actions
 * Neutral: Slate — Backgrounds, disabled states
 */

/**
 * SPACING
 * Use 4px increments: 1, 2, 3, 4, 6, 8, 12, 16, 24, 32, 48
 * Buttons: px-3 py-2 (12px × 8px)
 * Inputs: px-3 py-2.5 (12px × 10px)
 * Cards: p-4 (16px padding)
 * Sections: gap-4, gap-6 (spacing between elements)
 */

/**
 * TYPOGRAPHY
 * label-base → xs/semibold (10px/600 weight)
 * Button text → sm/medium (14px/500 weight)
 * Body text → sm (14px)
 * Headings → lg/semibold (18px/600 weight)
 */

/**
 * STATES
 * Hover: Slightly darker/lighter color, raised shadow (shadow-sm → shadow-md)
 * Focus: Ring-2 outline, keyboard navigation support
 * Active: Darker color, active shadow
 * Disabled: opacity-50, cursor-not-allowed
 * Error: Red borders, red helper text
 * Success: Green borders, green helper text
 */

/**
 * DARK MODE
 * Use dark: prefixes for all color properties
 * Backgrounds darken, text lightens
 * Borders become more subtle (use /60 opacity)
 * Shadows increase in opacity for visibility
 */

/**
 * ACCESSIBILITY
 * ✓ All interactive elements have focus visible states
 * ✓ All icons have aria-labels when standalone
 * ✓ Error messages are associated with inputs (aria-describedby)
 * ✓ Labels are properly associated with inputs (htmlFor)
 * ✓ Buttons have semantic role=button or use <button>
 * ✓ Color is not the only indicator of state (use icons, text)
 * ✓ Touch targets are minimum 48px × 48px
 */
